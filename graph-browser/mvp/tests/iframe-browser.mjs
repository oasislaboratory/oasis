// Optional browser acceptance: supply PLAYWRIGHT_MODULE and, if needed, CHROMIUM_PATH.
// Runs against a disposable repository; no changes to the real objective graph.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = await mkdtemp(join(tmpdir(), 'oasis-iframe-'));
const cwd = fileURLToPath(new URL('..', import.meta.url));
const marker = '\n<!-- oasis:working-state -->\n';
const original = '# Root\nProtected.\n' + marker + 'Initial\n';
const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
let server, browser;
try {
  await writeFile(join(root, 'objective.md'), original);
  await writeFile(join(root, 'directives.md'), 'Preserve intent.');
  for (const path of ['one', 'two', 'three', 'one/grandchild']) {
    await mkdir(join(root, path), { recursive: true });
    await writeFile(join(root, path, 'objective.md'), '# ' + path + '\nProtected.\n' + marker + 'Initial\n');
  }
  git('init'); git('config', 'user.name', 'Test'); git('config', 'user.email', 'test@example.invalid'); git('add', '.'); git('commit', '-m', 'Fixture');
  server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5174', '--strictPort'], { cwd, env: { ...process.env, OASIS_REPO: root }, stdio: 'ignore' });
  const base = 'http://127.0.0.1:5174';
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(base)).ok) break; } catch {}
    if (i === 99) throw new Error('Server did not start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(base);
  await page.waitForLoadState("networkidle");
  const expand = async (frame, name) => frame.locator('summary').filter({ hasText: new RegExp('^' + name + '$') }).click();
  assert.equal(await page.getByRole('link', { name: 'Oasis/', exact: true }).count(), 1);
  assert.equal(await page.locator('iframe[title="one"]').isVisible(), true);
  assert.equal(await page.locator('iframe[title="two"]').isVisible(), true);
  assert.equal(await page.getByText('Options', { exact: true }).count(), 0);
  assert.equal(await page.getByText('Git', { exact: true }).count(), 0);
  const boxes = await Promise.all(['one','two','three'].map(title => page.locator(`iframe[title="${title}"]`).boundingBox()));
  assert.ok(boxes.every(box => box && box.width >= 288 && box.y === boxes[0].y && box.y + box.height <= 800));
  if (process.env.SCREENSHOT_PATH) await page.screenshot({ path: process.env.SCREENSHOT_PATH });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const narrow = await page.locator('iframe[title="two"]').boundingBox();
  const first = await page.locator('iframe[title="one"]').boundingBox();
  assert.ok(narrow.y > first.y);
  await page.setViewportSize({ width: 1280, height: 800 });
  const one = page.frameLocator('iframe[title="one"]');
  const two = page.frameLocator('iframe[title="two"]');
  assert.equal(await one.locator('iframe[title="one/grandchild"]').isVisible(), false);
  assert.equal(await one.getByText('Git', { exact: true }).count(), 0);
  assert.equal(await two.getByText('Git', { exact: true }).count(), 0);
  await expand(one, 'one/grandchild');
  await page.waitForLoadState('networkidle');
  const grand = one.frameLocator('iframe[title="one/grandchild"]');
  await grand.getByRole('textbox', { name: 'objective.md' }).waitFor();
  assert.equal(page.frames().length, 5);
  assert.equal(await page.locator('iframe[title="one"]').isVisible(), true);
  assert.equal(await page.locator('iframe[title="two"]').isVisible(), true);
  assert.equal(await one.locator('iframe[title="one/grandchild"]').isVisible(), true);
  const editor = grand.getByRole('textbox', { name: 'objective.md' });
  const full = await editor.inputValue();
  const draft = full + '\n' + 'draft\n'.repeat(100);
  await editor.fill(draft); await editor.focus();
  assert.equal(await editor.evaluate(el => el === document.activeElement), true);
  await editor.evaluate(el => el.scrollTop = el.scrollHeight);
  assert.ok(await editor.evaluate(el => el.scrollTop > 0));
  await editor.evaluate(el => el.style.height = '700px');
  await grand.locator('body').evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  assert.ok(await grand.locator('body').evaluate(() => window.scrollY > 0));
  const twoDraft = (await two.getByRole('textbox', { name: 'objective.md' }).inputValue()) + 'sibling draft';
  await two.getByRole('textbox', { name: 'objective.md' }).fill(twoDraft);
  await expand(page, 'one'); await expand(page, 'one');
  assert.equal(await editor.inputValue(), draft);
  assert.equal(await two.getByRole('textbox', { name: 'objective.md' }).inputValue(), twoDraft);
  assert.equal(page.frames().length, 5);
  assert.equal(await page.locator('iframe[title="one"]').isVisible(), true);
  assert.equal(await page.locator('iframe[title="two"]').isVisible(), true);
  assert.equal(await one.locator('iframe[title="one/grandchild"]').isVisible(), true);
  // Protected edits and network errors retain full drafts.
  await editor.fill(draft.replace('Protected.', 'Changed intent.'));
  await grand.getByRole('button', { name: 'Save', exact: true }).click();
  await grand.getByRole('alert').filter({ hasText: 'Protected intent' }).waitFor();
  assert.match(await editor.inputValue(), /Changed intent/);
  assert.match(await readFile(join(root, 'one/grandchild/objective.md'), 'utf8'), /Protected\./);
  await editor.fill(draft);
  await page.route('**/api/action', route => route.abort());
  await grand.getByRole('button', { name: 'Save', exact: true }).click();
  await grand.getByRole('alert').waitFor(); assert.equal(await editor.inputValue(), draft);
  await page.unroute('**/api/action');
  // A fresh directive change rejects a previously loaded revision.
  await writeFile(join(root, 'directives.md'), 'Updated directive.');
  await grand.getByRole('button', { name: 'Save', exact: true }).click();
  await grand.getByRole('alert').filter({ hasText: 'directives changed' }).waitFor();
  assert.equal(await editor.inputValue(), draft);
  // Focus navigation goes to the stable top-level URL; reload retains the draft.
  await grand.getByRole('link', { name: 'one/grandchild', exact: true }).click();
  await page.waitForURL(base + '/one/grandchild');
  await page.waitForFunction(text => document.querySelector('textarea')?.value === text, draft);
  assert.equal(await page.getByRole('textbox', { name: 'objective.md' }).inputValue(), draft);
  await page.reload();
  await page.waitForFunction(text => document.querySelector('textarea')?.value === text, draft);
  // Explicit discard/reload is needed to adopt the new revision.
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reload saved version' }).click();
  await page.waitForFunction(text => document.querySelector('textarea')?.value === text, full);
  await page.getByRole('textbox', { name: 'objective.md' }).fill(full + 'Verified');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Saved to disk' }).waitFor();
  await page.goto(base + '/_workspace');
  await page.getByRole('button', { name: 'Commit objectives' }).click();
  await page.getByRole('status').filter({ hasText: 'Committed locally' }).waitFor();
  assert.match(git('show', 'HEAD:one/grandchild/objective.md'), /Verified/);
  await page.goto(base + '/one/grandchild');
  assert.equal(await page.getByRole('textbox', { name: 'objective.md' }).inputValue(), full + 'Verified');
  assert.equal(await readFile(join(root, 'objective.md'), 'utf8'), original);
  console.log('PASS: sibling/grandchild independence, focus, scrolling, navigation, draft recovery, protected/stale/error rejection, save/commit/reload.');
} finally {
  await browser?.close(); server?.kill(); await rm(root, { recursive: true, force: true });
}
