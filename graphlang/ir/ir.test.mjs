import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {at, identityAt, encode, decode, equivalent, parseAddress, formatAddress} from './ir.mjs';

const fixture = JSON.parse(readFileSync(new URL('./three-object.json', import.meta.url), 'utf8'));
const copy = () => structuredClone(fixture);
const restored = () => decode(encode(fixture));

test('three-object graph survives round trip across all nine logical addresses', () => {
  const graph = restored();
  assert.ok(equivalent(fixture, graph));
  assert.equal(graph.cells.length, 6); // Sparse: three of nine addresses omitted.
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
    assert.deepEqual(at(graph, i, j), at(fixture, i, j));
});

test('each identity is distinguished from a nonidentity endomorphism', () => {
  const graph = restored();
  for (let i = 0; i < 3; i++) assert.equal(identityAt(graph, i).id, `id_${i}`);
  assert.equal(at(graph, 0, 0).length, 2);
  assert.equal(at(graph, 0, 0).find(a => a.id === 'loop_0').identity, false);
});

test('parallel arrows and directed cycle survive without conflating reverse addresses', () => {
  const graph = restored();
  assert.deepEqual(at(graph, 0, 1).map(a => a.id), ['f', 'g']);
  assert.equal(at(graph, 1, 2)[0].id, 'h');
  assert.equal(at(graph, 2, 0)[0].id, 'k');
  assert.deepEqual(at(graph, 1, 0), []);
  assert.deepEqual(at(graph, 0, 2), []);
  assert.deepEqual(at(graph, 2, 1), []);
  assert.throws(() => at(graph, 3, 0), RangeError);
});

test('equality ignores storage ordering but preserves labels, direction, and values', () => {
  const graph = copy();
  graph.cells.reverse().forEach(c => c.arrows.reverse());
  assert.ok(equivalent(fixture, graph));
  for (const change of [
    g => {g.cells[3].arrows.pop();},
    g => {g.cells[4].i = 2; g.cells[4].j = 1;},
    g => {g.cells[0].arrows[0].value.data = 'changed';},
    g => {g.cells[3].arrows[0].id = 'renamed';},
  ]) {
    const other = copy(); change(other);
    assert.equal(equivalent(fixture, other), false);
  }
});

test('JSON object key order is irrelevant; array order remains significant', () => {
  const a = copy(), b = copy();
  a.cells[0].arrows[0].value.data = {a: 1, b: [1, 2]};
  b.cells[0].arrows[0].value.data = {b: [1, 2], a: 1};
  assert.ok(equivalent(a, b));
  b.cells[0].arrows[0].value.data.b.reverse();
  assert.equal(equivalent(a, b), false);
});

test('finite graph-valued containment round trips with local ID namespaces', () => {
  const graph = copy();
  graph.cells[3].arrows[0].value = {kind: 'graph', graph: copy()};
  const decoded = decode(encode(graph));
  assert.ok(equivalent(graph, decoded));
  assert.equal(identityAt(at(decoded, 0, 1)[0].value.graph, 0).id, 'id_0');
  const reordered = structuredClone(graph);
  reordered.cells[3].arrows[0].value.graph.cells.reverse();
  assert.ok(equivalent(graph, reordered));
  decoded.cells[0].arrows[0].value.data = 'independent';
  assert.equal(graph.cells[0].arrows[0].value.data, 'A');
});

test('candidate i[j] syntax round trips and rejects ambiguous forms', () => {
  for (const pair of [[0, 0], [0, 1], [2, 0], [42, 100], [Number.MAX_SAFE_INTEGER, 0]])
    assert.deepEqual(parseAddress(formatAddress(...pair)), pair);
  for (const text of ['01[2]', '-1[0]', '0[1][2]', '0[1]/f', ' 0[1]', '0[9007199254740992]', '', null])
    assert.throws(() => parseAddress(text), TypeError);
});

test('noncontiguous indices are labels, not positions in a dense matrix', () => {
  const graph = copy();
  for (const cell of graph.cells) {
    if (cell.i === 2) cell.i = 1000000;
    if (cell.j === 2) cell.j = 1000000;
  }
  assert.equal(decode(encode(graph)).cells.length, 6);
  assert.equal(identityAt(graph, 1000000).id, 'id_2');
  assert.throws(() => at(graph, 2, 0), RangeError);
});

test('reject malformed representations instead of silently losing structure', () => {
  const mutations = [
    g => {g.format = 'unknown';},
    g => {g.cells.push(structuredClone(g.cells[0]));},
    g => {g.cells[0].arrows.push(structuredClone(g.cells[0].arrows[0]));},
    g => {g.cells[0].arrows[1].identity = true;},
    g => {g.cells[3].arrows[0].identity = true;},
    g => {g.cells[1].arrows[0].identity = false;},
    g => {g.cells[3].j = 99;},
    g => {g.cells[3].i = -1;},
    g => {g.cells[3].arrows = [];},
    g => {g.cells[3].arrows[0].extra = 'unsupported';},
    g => {g.cells[0].arrows[0].value.data = undefined;},
    g => {g.cells[0].arrows[0].value.data = NaN;},
    g => {g.cells[0].arrows[0].value.data = -0;},
    g => {g.cells[0].arrows[0].value.data = new Date();},
    g => {g.cells[0].arrows[0].value = {kind: 'graph', graph: {format: g.format, cells: [g.cells[3]]}};},
  ];
  for (const mutate of mutations) {
    const graph = copy(); mutate(graph);
    assert.throws(() => encode(graph), TypeError);
  }
  assert.throws(() => decode('{'), SyntaxError);
});

test('containment cycles fail explicitly; edge cycles remain serializable', () => {
  const graph = copy();
  graph.cells[0].arrows[0].value = {kind: 'graph', graph};
  assert.throws(() => encode(graph), /Cyclic containment/);
  const data = {}; data.self = data;
  graph.cells[0].arrows[0].value = {kind: 'json', data};
  assert.throws(() => encode(graph), /Cyclic containment/);
  assert.doesNotThrow(() => encode(fixture));
});

test('empty graph has no objects; unknown addresses do not fabricate identities', () => {
  const graph = {format: fixture.format, cells: []};
  assert.ok(equivalent(graph, decode(encode(graph))));
  assert.throws(() => identityAt(graph, 0), RangeError);
});
