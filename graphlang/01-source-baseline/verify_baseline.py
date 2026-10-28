"""Offline source-integrity checks; does not run Graph Lang or Svelte."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).parent
data = json.loads((root / 'source-snapshot.json').read_text())
blobs = {e['path']: e for e in data['tree'] if e['type'] == 'blob'}
assert set(blobs) == set(data['files'])
for path, content in data['files'].items():
    raw = content.encode()
    assert len(raw) == blobs[path]['size'], path
    assert hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest() == blobs[path]['sha'], path
files = data['files']
package = json.loads(files['package.json'])
assert set(package['scripts']) == {'dev', 'build', 'preview'}
assert not any(p.endswith('AGENTS.md') for p in files)
assert not any('test' in p.lower() or 'spec' in p.lower() for p in files)
assert not any('lock' in p.lower() for p in files)
for n, name in [(4, 'Recursion'), (5, 'Primitives'), (6, 'Syntax'), (7, 'Semantics')]:
    assert not files[f'docs/{n}-{name}.md'].strip()
vertices, matrix = json.loads(files['src/lib/graph.json'])
assert vertices == ['a', 'b', 'c']
assert len(matrix) == 3 and all(len(row) == 3 for row in matrix)
assert [(i, j) for i, row in enumerate(matrix) for j, value in enumerate(row) if value is not None] == [(0, 1), (1, 2), (2, 0)]
assert matrix != [list(row) for row in zip(*matrix)]
print(json.dumps({'result': 'pass', 'source_commit': data['commit'], 'verified_blobs': len(blobs), 'evidence_kind': 'offline source integrity and fixture inspection', 'application_or_evaluator_executed': False}, indent=2))
