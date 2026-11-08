import { marked } from 'marked';
import sanitize from 'sanitize-html';
import { readFile, readdir, realpath, lstat, writeFile, rename, unlink } from 'node:fs/promises';
import { resolve, join, relative, sep } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
export const MARKER = '\n<!-- oasis:working-state -->\n';
export const root = resolve(process.env.OASIS_REPO || '../..');
export type Objective = { path: string; title: string; content: string; intent: string; working: string; intentHtml: string; workingHtml: string; revision: string; directives: { path: string; content: string }[]; children: Objective[] };
export class Conflict extends Error {}
function render(markdown: string, path: string) {
  return sanitize(marked.parse(markdown, { async: false }), {
    transformTags: { a: (tagName, attribs) => {
      const href = attribs.href || '';
      if (href && !/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('//') && !href.startsWith('#')) {
        const url = new URL(href, 'http://oasis.local/' + (path ? path + '/' : ''));
        attribs.href = url.pathname.replace(/\/objective\.md$/, '') || '/';
        attribs.href += url.hash;
      }
      return { tagName, attribs };
    } }
  });
}
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export function split(content: string) { const i = content.indexOf(MARKER); return { intent: i < 0 ? content : content.slice(0, i), working: i < 0 ? '' : content.slice(i + MARKER.length) }; }
let queue: Promise<unknown> = Promise.resolve();
export function exclusive<T>(fn: () => Promise<T>): Promise<T> { const result = queue.then(fn); queue = result.catch(() => {}); return result; }
export class Repository {
  constructor(public root: string) { this.root = resolve(root); }
  async directory(path: string) {
    if (path && path.split('/').some(p => !p || p === '.' || p === '..' || p.startsWith('.') || p.includes('\\'))) throw new Error('Invalid objective path');
    const target = resolve(this.root, path);
    if (relative(this.root, target).startsWith('..') || (target !== this.root && !target.startsWith(this.root + sep))) throw new Error('Path outside repository');
    let cursor = this.root;
    for (const part of path.split('/').filter(Boolean)) { cursor = join(cursor, part); if ((await lstat(cursor)).isSymbolicLink()) throw new Error('Symlinks are not supported'); }
    if (await realpath(target) !== target) throw new Error('Repository must use a real filesystem path');
    return target;
  }
  async file(path: string, name: string) { const f = join(await this.directory(path), name); if ((await lstat(f)).isSymbolicLink()) throw new Error('Symlinks are not supported'); return f; }
  async directives(path: string) {
    const parts = path.split('/').filter(Boolean); const result = [];
    for (let i = 0; i <= parts.length; i++) { const p = parts.slice(0, i).join('/'); try { result.push({ path: [p, 'directives.md'].filter(Boolean).join('/'), content: await readFile(await this.file(p, 'directives.md'), 'utf8') }); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; } }
    return result;
  }
  async node(path = '', recurse = true): Promise<Objective> {
    const content = await readFile(await this.file(path, 'objective.md'), 'utf8');
    const directives = await this.directives(path); const sections = split(content);
    const children: Objective[] = [];
    if (recurse) for (const entry of (await readdir(await this.directory(path), { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || ['node_modules', 'build'].includes(entry.name)) continue;
      const child = [path, entry.name].filter(Boolean).join('/');
      try { await this.file(child, 'objective.md'); } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') continue; throw e; }
      children.push(await this.node(child, false));
    }
    return { path, content, title: /^#\s+(.+)$/m.exec(content)?.[1] || path || 'Oasis', ...sections, intentHtml: render(sections.intent, path), workingHtml: render(sections.working, path), directives, revision: hash(content + JSON.stringify(directives)), children };
  }
  async saveFull(path: string, content: string, revision: string) {
    const current = await this.node(path, false);
    if (current.revision !== revision) throw new Conflict('Objective or inherited directives changed. Your draft has been preserved.');
    // On first edit, the boundary is appended after the exact original bytes.
    // A trailing newline in the original intent must not be reclassified as an edit.
    if (!current.content.includes(MARKER)) {
      // HTML textareas normalize Windows CRLF to LF. Compare the original intent
      // with normalized newlines, while retaining its exact bytes on disk.
      const normalized = (value: string) => value.replace(/\r\n/g, '\n');
      const original = normalized(current.content);
      const proposed = normalized(content);
      const marker = '<!-- oasis:working-state -->\n';
      // The editor may add a boundary newline; do not mistake it for intent.
      const prefix = original.endsWith('\n') ? original + '\n' + marker : original + '\n' + marker;
      if (proposed.startsWith(prefix)) {
        return this.save(path, proposed.slice(prefix.length), revision);
      }
      // Also accept a marker directly after an existing final newline.
      const direct = original + marker;
      if (proposed.startsWith(direct)) {
        return this.save(path, proposed.slice(direct.length), revision);
      }
    }
    const proposed = split(content);
    if (proposed.intent !== current.intent) throw new Error('Protected intent cannot be saved until root-user authority is implemented. Your draft has been preserved.');
    if (!content.includes(MARKER)) {
      if (content === current.content) return current;
      throw new Error('Working-state marker required');
    }
    return this.save(path, proposed.working, revision);
  }
  async save(path: string, working: string, revision: string) {
    if (working.length > 100000 || working.includes(MARKER.trim())) throw new Error('Invalid working state');
    const current = await this.node(path, false);
    if (current.revision !== revision) throw new Conflict('Objective or inherited directives changed. Reload before saving. Your draft is still in the editor.');
    const file = await this.file(path, 'objective.md'); const temp = file + '.' + randomUUID() + '.tmp';
    try { await writeFile(temp, current.intent + MARKER + working, { flag: 'wx' }); await rename(temp, file); } finally { await unlink(temp).catch(() => {}); }
    return this.node(path, false);
  }
  async git(args: string[]) { return (await exec('git', ['-C', this.root, ...args], { maxBuffer: 2 * 1024 * 1024 })).stdout.trim(); }
  async status() { return { branch: await this.git(['branch', '--show-current']), changes: await this.git(['status', '--short']), head: await this.git(['rev-parse', '--short', 'HEAD']) }; }
  async commit(message: string) {
    if (!message.trim() || message.length > 200) throw new Error('Enter a commit message (1–200 characters)');
    if (await this.git(['diff', '--cached', '--name-only'])) throw new Error('The Git index already has staged changes. Commit or unstage them in your terminal first.');
    const changed = (await this.git(['diff', '--name-only', '-z'])).split('\0').filter(Boolean);
    const files = changed.filter(p => p === 'objective.md' || p.endsWith('/objective.md'));
    if (!files.length) throw new Error('No saved objective changes to commit');
    for (const p of files) {
      const path = p === 'objective.md' ? '' : p.slice(0, -'/objective.md'.length);
      const current = await readFile(await this.file(path, 'objective.md'), 'utf8');
      const old = (await exec('git', ['-C', this.root, 'show', `HEAD:${p}`])).stdout;
      if (split(old).intent !== split(current).intent) throw new Error(`Protected intent changed in ${p}. Review it outside the app.`);
    }
    await this.git(['add', '--', ...files]);
    try { return await this.git(['commit', '-m', message.trim(), '--', ...files]); }
    catch (e) { await this.git(['reset', '--', ...files]); throw e; }
  }
  async push() { if (await this.git(['status', '--porcelain'])) throw new Error('Commit or clear local changes before pushing'); return this.git(['push']); }
}
export const repository = new Repository(root);
