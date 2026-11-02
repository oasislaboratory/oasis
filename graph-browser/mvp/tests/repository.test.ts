import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Repository, MARKER, Conflict } from '../src/lib/server/repository';
async function fixture(fn: (repo: Repository) => Promise<void>) {
 const root = await mkdtemp(join(tmpdir(), 'oasis-')); const repo = new Repository(root);
 try { await writeFile(join(root,'objective.md'), '# Root\n\n## Desired outcome\nProtected.\n'); await writeFile(join(root,'directives.md'),'Keep intent.');
 for (const name of ['one','two']) { await mkdir(join(root,name)); await writeFile(join(root,name,'objective.md'), '# '+name+'\n'); }
 await repo.git(['init']); await repo.git(['config','user.email','test@example.invalid']); await repo.git(['config','user.name','Test']); await repo.git(['add','.']); await repo.git(['commit','-m','Fixture']); await fn(repo); } finally { await rm(root,{recursive:true,force:true}); }
}
test('expand two branches, save working state, commit, reload; preserve intent', () => fixture(async repo => {
 const root = await repo.node(); assert.equal(root.children.length,2); assert.equal(root.children[0].directives.length,1);
 const saved = await repo.save('one','## Observed state\nVerified.',root.children[0].revision); assert.equal(saved.intent,root.children[0].intent);
 assert.match(await repo.git(['diff']),/Verified/); await repo.commit('Record evidence'); assert.equal((await repo.status()).changes,'');
 const fresh = await new Repository(repo.root).node('one'); assert.equal(fresh.working,'## Observed state\nVerified.'); assert.match(await repo.git(['show','HEAD:one/objective.md']),/Verified/);
}));
test('reject stale objective and directive revisions', () => fixture(async repo => {
 const a = await repo.node('one'); await repo.save('one','first',a.revision); await assert.rejects(repo.save('one','stale',a.revision),Conflict);
 const b = await repo.node('two'); await writeFile(join(repo.root,'directives.md'),'New executive instruction'); await assert.rejects(repo.save('two','stale policy',b.revision),Conflict);
}));
test('reject traversal, symlinks, injected marker, and protected intent commits', () => fixture(async repo => {
 await assert.rejects(repo.node('../')); await symlink(join(repo.root,'one'),join(repo.root,'alias')); await assert.rejects(repo.node('alias'));
 const n = await repo.node('one'); await assert.rejects(repo.save('one',MARKER,n.revision));
 await writeFile(join(repo.root,'one/objective.md'),'# Changed intent\n'); await assert.rejects(repo.commit('bad'),/Protected intent/);
 assert.equal(await repo.git(['diff','--cached','--name-only']),'');
}));
test('refuse unrelated staged changes and leave other unstaged files out of commits', () => fixture(async repo => {
 const n = await repo.node(); await repo.save('', 'Evidence', n.revision); await writeFile(join(repo.root,'note.txt'),'unrelated'); await repo.git(['add','note.txt']); await assert.rejects(repo.commit('test'),/staged/); await repo.git(['reset','--','note.txt']); await repo.commit('objectives only'); assert.match((await repo.status()).changes,/note.txt/);
}));
test('strip script HTML and unsafe URLs from rendered Markdown', () => fixture(async repo => {
 const n = await repo.node(); const saved = await repo.save('', '<script>alert(1)</script>\n[x](javascript:alert(1))\n<img src=x onerror=alert(1)>',n.revision); assert.doesNotMatch(saved.workingHtml,/<script|onerror|javascript:/);
}));
test('relative objective links resolve from each embedded node', () => fixture(async repo => {
 await writeFile(join(repo.root,'one/objective.md'),'# One\n[child](child/objective.md)\n[parent](../objective.md)');
 const n = await repo.node('one'); assert.match(n.intentHtml,/href="\/one\/child"/); assert.match(n.intentHtml,/href="\/"/);
}));
