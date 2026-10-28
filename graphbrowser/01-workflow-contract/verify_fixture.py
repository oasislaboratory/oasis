"""Offline fixture integrity checks; these do not execute Graph Lang or a browser.

Requires Python 3.10+ and PyYAML. Run from any directory; no network or writes.
"""
import copy
import hashlib
import json
from pathlib import Path, PurePosixPath
import yaml

HERE = Path(__file__).resolve().parent
STATUSES = {'planned', 'in_progress', 'ongoing', 'blocked', 'completed', 'cancelled'}
FIELDS = {'role', 'status', 'progress_percent', 'confidence_percent',
          'assessed_by', 'assessed_on', 'scope'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def metadata(content):
    require(content.startswith('---\n'), 'missing metadata')
    parts = content.split('---\n', 2)
    require(len(parts) == 3, 'unterminated metadata')
    result = yaml.safe_load(parts[1])
    require(isinstance(result, dict) and FIELDS <= result.keys(), 'missing metadata field')
    require(result['status'] in STATUSES, 'unknown status')
    for field in ('progress_percent', 'confidence_percent'):
        value = result[field]
        require(value is None or type(value) in (int, float) and 0 <= value <= 100,
                'invalid percentage')
    return result


def validate(fixture):
    require(fixture['schema_version'] == 1, 'unsupported schema')
    require(fixture['source'] == {'repository': 'oasislaboratory/oasis',
            'commit': 'd385691583ea19ba51cc6b1cffc7607b9400d878'}, 'wrong source pin')
    documents = fixture['documents']
    docs = {d['path']: d for d in documents}
    require(len(docs) == len(documents), 'duplicate document path')
    for path, doc in docs.items():
        require(not path.startswith('/') and '..' not in PurePosixPath(path).parts,
                'unsafe source path')
        raw = doc['content'].encode('utf-8')
        actual = hashlib.sha1(b'blob ' + str(len(raw)).encode() + b'\0' + raw).hexdigest()
        require(actual == doc['git_blob_sha'], 'source blob mismatch')
    nodes = fixture['nodes']
    by_id = {n['id']: n for n in nodes}
    require(len(by_id) == len(nodes), 'duplicate node identity')
    objective_paths = {p for p in docs if p == 'objective.md' or p.endswith('/objective.md')}
    require({n['path'] for n in nodes} == objective_paths, 'objective coverage mismatch')
    require('.' in by_id, 'missing root')
    for node in nodes:
        path = node['path']
        identity = '.' if path == 'objective.md' else path.removesuffix('/objective.md')
        require(node['id'] == identity, 'path identity mismatch')
        meta = metadata(docs[path]['content'])
        require((node['role'], node['status']) == (meta['role'], meta['status']),
                'metadata projection mismatch')
        expected_parent = None if identity == '.' else str(PurePosixPath(identity).parent)
        require(node['parent_id'] == expected_parent, 'hierarchy mismatch')
        require(expected_parent is None or expected_parent in by_id, 'missing parent')
        for evidence in node['evidence_paths']:
            require(evidence in docs, 'missing evidence document')
        require(len(node['depends_on']) == len(set(node['depends_on'])), 'duplicate dependency')
        for target in node['depends_on']:
            require(target in by_id, 'dangling dependency')
            require(target != identity, 'self dependency')
    visiting, visited = set(), set()

    def visit(identity):
        require(identity not in visiting, 'dependency cycle')
        if identity in visited:
            return
        visiting.add(identity)
        for target in by_id[identity]['depends_on']:
            visit(target)
        visiting.remove(identity)
        visited.add(identity)

    for identity in by_id:
        visit(identity)
    return {'documents': len(docs), 'nodes': len(nodes),
            'hierarchy_edges': sum(n['parent_id'] is not None for n in nodes),
            'dependency_edges': sum(len(n['depends_on']) for n in nodes)}


def rejection_cases(fixture):
    # Corruptions cover distinct integrity failures, not product behavior.
    cases = {}
    def check(name, mutate):
        altered = copy.deepcopy(fixture)
        mutate(altered)
        try:
            validate(altered)
        except ValueError as error:
            cases[name] = str(error)
        else:
            raise AssertionError(f'corruption accepted: {name}')
    check('source_text_changed', lambda f: f['documents'][0].update(content='changed'))
    check('duplicate_identity', lambda f: f['nodes'].append(copy.deepcopy(f['nodes'][0])))
    check('missing_objective', lambda f: f['nodes'].pop())
    check('dangling_dependency', lambda f: f['nodes'][0]['depends_on'].append('missing'))
    check('dependency_cycle', lambda f: f['nodes'][0]['depends_on'].append('graphbrowser/02-editor-prototype'))
    check('wrong_parent', lambda f: f['nodes'][0].update(parent_id='graphlang'))
    check('wrong_status_projection', lambda f: f['nodes'][0].update(status='completed'))
    check('missing_evidence', lambda f: f['nodes'][0]['evidence_paths'].append('absent/status.md'))
    for name, text in [('missing_frontmatter', '# title'),
                       ('missing_field', '---\nstatus: planned\n---\n# title')]:
        try:
            metadata(text)
        except ValueError as error:
            cases[name] = str(error)
        else:
            raise AssertionError(f'malformed metadata accepted: {name}')
    return cases


if __name__ == '__main__':
    fixture = json.loads((HERE / 'fixture.json').read_text())
    print(json.dumps({'fixture': 'PASS', **validate(fixture),
                      'negative_checks': rejection_cases(fixture),
                      'python_dependency': {'PyYAML': yaml.__version__},
                      'evidence_class': 'offline fixture integrity only'}, indent=2))
