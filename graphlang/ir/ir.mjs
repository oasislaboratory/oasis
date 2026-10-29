// Experimental wire format, not an approved Graph Lang architecture.
const FORMAT = 'oasis-ir-experiment-1';
const fail = message => { throw new TypeError(message); };
const record = x => x !== null && typeof x === 'object' && !Array.isArray(x)
  && Object.getPrototypeOf(x) === Object.prototype;
const index = x => Number.isSafeInteger(x) && x >= 0;
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

function fields(x, keys) {
  if (!record(x) || Object.keys(x).sort().join(',') !== [...keys].sort().join(','))
    fail(`Expected fields: ${keys.join(', ')}`);
}

// Reject lossy JSON inputs and actual containment cycles. Graph edge cycles are fine.
function json(x, ancestors) {
  if (x === null || typeof x === 'string' || typeof x === 'boolean') return x;
  if (typeof x === 'number' && Number.isFinite(x) && !Object.is(x, -0)) return x;
  if (!Array.isArray(x) && !record(x)) fail('Value must be lossless JSON');
  if (ancestors.has(x)) fail('Cyclic containment is unsupported');
  ancestors.add(x);
  let result;
  if (Array.isArray(x)) {
    if (Object.keys(x).length !== x.length) fail('Sparse or decorated JSON array');
    result = Array.from(x, item => json(item, ancestors));
  } else {
    result = Object.fromEntries(Object.keys(x).sort().map(k => [k, json(x[k], ancestors)]));
  }
  ancestors.delete(x);
  return result;
}

function normalize(graph, ancestors = new Set()) {
  fields(graph, ['format', 'cells']);
  if (graph.format !== FORMAT || !Array.isArray(graph.cells)) fail('Unsupported graph format');
  if (ancestors.has(graph)) fail('Cyclic containment is unsupported');
  ancestors.add(graph);
  const addresses = new Set(), ids = new Set(), objects = new Set();
  const cells = graph.cells.map(cell => {
    fields(cell, ['i', 'j', 'arrows']);
    const {i, j} = cell;
    if (!index(i) || !index(j)) fail('Indices must be nonnegative safe integers');
    const key = `${i},${j}`;
    if (addresses.has(key)) fail('Duplicate address');
    addresses.add(key);
    if (!Array.isArray(cell.arrows) || !cell.arrows.length) fail('Omit empty cells');
    const arrows = cell.arrows.map(arrow => {
      fields(arrow, ['id', 'identity', 'value']);
      const {id, identity, value} = arrow;
      if (typeof id !== 'string' || !id.length || ids.has(id)) fail('Arrow IDs must be unique nonempty strings per graph');
      ids.add(id);
      if (typeof identity !== 'boolean' || (identity && i !== j)) fail('Identity must be diagonal');
      if (identity) {
        if (objects.has(i)) fail('Multiple identities at one object');
        objects.add(i);
      }
      if (!record(value)) fail('Expected tagged value');
      let normalized;
      if (value.kind === 'graph') {
        fields(value, ['kind', 'graph']);
        normalized = {kind: 'graph', graph: normalize(value.graph, ancestors)};
      } else {
        fields(value, ['kind', 'data']);
        if (value.kind !== 'json') fail('Unknown value kind');
        normalized = {kind: 'json', data: json(value.data, ancestors)};
      }
      return {id, identity, value: normalized};
    }).sort((a, b) => compare(a.id, b.id));
    return {i, j, arrows};
  }).sort((a, b) => a.i - b.i || a.j - b.j);
  for (const {i, j} of cells)
    if (!objects.has(i) || !objects.has(j)) fail('Endpoint has no distinguished identity');
  ancestors.delete(graph);
  return {format: FORMAT, cells};
}

export const encode = graph => JSON.stringify(normalize(graph), null, 2);
export const decode = text => normalize(JSON.parse(text));
// Label-preserving structural equality, not graph isomorphism or semantic equality.
export const equivalent = (a, b) => encode(a) === encode(b);
export function at(graph, i, j) {
  const checked = normalize(graph);
  if (!index(i) || !index(j)) fail('Invalid address');
  const known = n => checked.cells.some(c => c.i === n && c.j === n);
  if (!known(i) || !known(j)) throw new RangeError('Unknown object');
  return checked.cells.find(c => c.i === i && c.j === j)?.arrows ?? [];
}
export const identityAt = (graph, i) => at(graph, i, i).find(a => a.identity);
// Candidate numeric route spelling only; no browser or filesystem adapter.
export function parseAddress(text) {
  if (typeof text !== 'string' || !/^(0|[1-9]\d*)\[(0|[1-9]\d*)\]$/.test(text)) fail('Expected i[j]');
  const [i, j] = text.slice(0, -1).split('[').map(Number);
  if (!index(i) || !index(j)) fail('Address exceeds safe integer range');
  return [i, j];
}
export function formatAddress(i, j) {
  if (!index(i) || !index(j)) fail('Invalid address');
  return `${i}[${j}]`;
}
