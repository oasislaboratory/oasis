import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { GraphEntry, GraphSource } from '../src/lib/graph';
import { filesystemGraph, objectiveView } from '../src/lib/server/objective-graph';
import { Repository, MARKER, Conflict } from '../src/lib/server/repository';

test('filesystem graph preserves page models, bounds depth, and retains save revisions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'oasis-graph-'));
  try {
    const repo = new Repository(root);
    for (const path of ['', 'one', 'one/leaf', 'two', '雪 space', '.hidden', 'build', 'node_modules']) {
      await mkdir(join(root, path), { recursive: true });
      await writeFile(join(root, path, 'objective.md'), '# ' + (path || 'Root') + '\n' + MARKER + 'Evidence');
    }
    await mkdir(join(root, 'not-an-objective'));
    await writeFile(join(root, 'directives.md'), 'Inherited instruction');
    await writeFile(join(root, 'one', 'directives.md'), 'Local instruction');
    const source = filesystemGraph(repo);
    for (const path of ['', 'one', 'one/leaf', '雪 space']) {
      const graph = await source.read(path);
      assert.equal(graph.entry.source, path);
      assert.equal(graph.entry.target, path);
      assert.deepEqual(objectiveView(graph), await repo.node(path));
      for (const { relationship, entry } of graph.related) {
        assert.equal(relationship.source, path);
        assert.equal(relationship.target, entry.source);
        assert.equal(relationship.type, 'filesystem:contains');
        assert.equal('children' in entry.value, false);
      }
    }
    assert.deepEqual(objectiveView(await source.read('')).children.map(n => n.path), ['one', 'two', '雪 space']);
    const before = objectiveView(await source.read('one'));
    const saved = await repo.saveFull('one', before.content + '\nNew evidence', before.revision);
    assert.deepEqual(objectiveView(await source.read('one')), await repo.node('one'));
    assert.equal(saved.intent, before.intent);
    await assert.rejects(repo.saveFull('one', before.content, before.revision), Conflict);
    await assert.rejects(repo.saveFull('one', '# Changed', saved.revision), /Protected intent/);
    await writeFile(join(root, 'directives.md'), 'Updated instruction');
    await assert.rejects(repo.saveFull('one', saved.content, saved.revision), Conflict);
    await assert.rejects(source.read('../'));
    await symlink(join(root, 'one'), join(root, 'alias'));
    await assert.rejects(source.read('alias'), /Symlinks/);

    const graph = await source.read('two');
    const other = (await source.read('one')).entry;
    graph.related.push({ relationship: { source: 'two', target: 'one', type: 'permission', value: 'read' }, entry: other });
    assert.equal(objectiveView(graph).children.length, 0);
    graph.related.push({ relationship: { source: 'wrong', target: 'one', type: 'filesystem:contains', value: null }, entry: other });
    assert.throws(() => objectiveView(graph), /containment/);
    assert.throws(() => objectiveView({ entry: { ...graph.entry, target: 'other' }, related: [] }), /identity/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('graph source supports non-objective adjacency, parallel types, cycles, and nested values', async () => {
  const nested: GraphEntry[] = [{ source: 'inner', target: 'inner', type: 'number', value: 42 }];
  const entries: GraphEntry[] = [
    { source: 'α', target: 'α', type: 'dataset', value: nested },
    { source: 'β', target: 'β', type: 'computation', value: { expression: 'sum' } },
    { source: 'α', target: 'β', type: 'input', value: { port: 0 } },
    { source: 'α', target: 'β', type: 'permission', value: 'read' },
    { source: 'β', target: 'α', type: 'describes', value: null }
  ];
  let reads = 0;
  // A test fixture for the interface, not an implementation of Graph Lang semantics.
  const source: GraphSource = {
    async read(id) {
      reads++;
      const entry = entries.find(e => e.source === id && e.target === id);
      if (!entry) throw new Error('Missing identity');
      return { entry, related: entries.filter(e => e.source === id && e.target !== id).map(relationship => ({
        relationship, entry: entries.find(e => e.source === relationship.target && e.target === relationship.target)!
      })) };
    }
  };
  const first = await source.read('α');
  assert.deepEqual(first.entry.value, nested);
  assert.deepEqual(first.related.map(r => r.relationship.type), ['input', 'permission']);
  assert.deepEqual(first.related.map(r => r.entry.source), ['β', 'β']);
  const next = await source.read(first.related[0].entry.source);
  assert.equal(next.related[0].entry.source, 'α');
  assert.equal(reads, 2); // No recursive expansion of the cycle.
  assert.equal('path' in first.entry, false);
  assert.equal('objective' in first.entry, false);
  await assert.rejects(source.read('missing'), /Missing identity/);
});
