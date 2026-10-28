"""Conformance checks for the proposed persistence boundary using a stdlib SQLite
reference adapter. This is a local reference, not the production database, and
does not execute Graph Lang. Run: python3 verify_boundaries.py (no network)."""
import json
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent


class AdapterError(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def valid_document(doc):
    if not isinstance(doc, dict) or doc.get('schema_version') != 1:
        return False
    labels, matrix = doc.get('labels'), doc.get('matrix')
    if not isinstance(labels, list) or not all(isinstance(x, str) for x in labels):
        return False
    n = len(labels)
    return (isinstance(matrix, list) and len(matrix) == n and
            all(isinstance(r, list) and len(r) == n and all(c is None or c == 1 and type(c) is int for c in r)
                for r in matrix))


class SqliteAdapter:
    def __init__(self, path, fail_write=False):
        self.db = sqlite3.connect(path)
        self.db.execute('create table if not exists docs(key text primary key, revision integer, body text)')
        self.fail_write = fail_write

    def load(self, key):
        row = self.db.execute('select revision, body from docs where key=?', (key,)).fetchone()
        return (0, None) if row is None else (row[0], json.loads(row[1]))

    def save(self, key, expected_revision, doc):
        if not valid_document(doc):
            raise AdapterError('invalid_input')
        try:
            with self.db:
                current = self.load(key)[0]
                if current != expected_revision:
                    raise AdapterError('conflict')
                self.db.execute('insert or replace into docs values(?,?,?)',
                                (key, current + 1, json.dumps(doc)))
                if self.fail_write:
                    raise sqlite3.OperationalError('simulated')
        except sqlite3.Error:
            raise AdapterError('write_failed')
        return current + 1


def expect(code, fn):
    try:
        fn()
    except AdapterError as e:
        assert e.code == code, (code, e.code)
        return
    raise AssertionError('expected ' + code)


def run():
    good = {'schema_version': 1, 'labels': ['a', 'b'], 'matrix': [[None, 1], [None, None]]}
    results = {}
    with tempfile.TemporaryDirectory() as d:
        path = str(Path(d) / 'a.db')
        a = SqliteAdapter(path)
        assert a.load('k') == (0, None)
        assert a.save('k', 0, good) == 1
        a.db.close()
        a = SqliteAdapter(path)  # restart
        assert a.load('k') == (1, good)
        results['save_reload_after_restart'] = 'PASS'
        expect('invalid_input', lambda: a.save('k', 1, {**good, 'matrix': [[None]]}))
        expect('invalid_input', lambda: a.save('k', 1, {**good, 'matrix': [[None, 2], [None, None]]}))
        expect('invalid_input', lambda: a.save('k', 1, 'x'))
        results['invalid_input'] = 'PASS'
        expect('conflict', lambda: a.save('k', 0, good))
        results['conflicting_revision'] = 'PASS'
        a.fail_write = True
        expect('write_failed', lambda: a.save('k', 1, {**good, 'labels': ['a', 'c']}))
        a.fail_write = False
        assert a.load('k') == (1, good)
        results['failed_write_unchanged'] = 'PASS'
        assert a.save('k', 1, {**good, 'labels': ['a', 'c']}) == 2
        results['revision_increments'] = 'PASS'
    spec = json.loads((HERE / 'boundaries.json').read_text())
    cases = spec['evaluation_cases']
    assert all(c['status'] == 'not_run' for c in cases)
    results['evaluation_cases'] = f'{len(cases)} preserved, not_run (no runtime)'
    return results


if __name__ == '__main__':
    out = run()
    print(json.dumps(out, indent=2))
