"""Harness self-tests use canned expected outputs, not language execution."""
from copy import deepcopy
import json,unittest
from verify import ROOT,check_package,compare,strict_loads,suite_digest
class HarnessTests(unittest.TestCase):
    def setUp(self):
        self.m=json.loads((ROOT/'fixtures.json').read_text())
        self.c=dict(evidence_kind='mock_harness_test',implementation='canned expected outputs',revision='test-only',command='unittest',environment='Python stdlib',contract_sha256=self.m['contract_sha256'],suite_sha256=suite_digest(self.m),results=[dict(id=c['id'],result=deepcopy(c['expected'])) for c in self.m['cases']])
    def test_package(self):self.assertEqual(check_package(self.m,(ROOT/'../02-minimal-semantics/contract.md').read_bytes()),42)
    def test_canned_match(self):self.assertEqual(compare(self.m,self.c),'mock_harness_test')
    def test_wrong_value(self):
        self.c['results'][0]['result']['value']=3
        with self.assertRaises(ValueError):compare(self.m,self.c)
    def test_boolean_steps(self):
        self.c['results'][1]['result']['steps']=False
        with self.assertRaises(ValueError):compare(self.m,self.c)
    def test_missing_result(self):
        self.c['results'].pop()
        with self.assertRaises(ValueError):compare(self.m,self.c)
    def test_duplicate_result(self):
        self.c['results'][-1]=self.c['results'][0]
        with self.assertRaises(ValueError):compare(self.m,self.c)
    def test_missing_provenance(self):
        del self.c['revision']
        with self.assertRaises(ValueError):compare(self.m,self.c)
    def test_contract_drift(self):
        with self.assertRaises(ValueError):check_package(self.m,b'changed')
    def test_error_leaks_value(self):
        self.c['results'][4]['result']['value']=2
        with self.assertRaises(ValueError):compare(self.m,self.c)
    def test_duplicate_fixture(self):
        self.m['cases'].append(self.m['cases'][0])
        with self.assertRaises(ValueError):check_package(self.m,(ROOT/'../02-minimal-semantics/contract.md').read_bytes())
    def test_duplicate_json_key(self):
        with self.assertRaises(ValueError):strict_loads('{"ok":false,"ok":true}')
    def test_nested_duplicate_json_key(self):
        with self.assertRaises(ValueError):strict_loads('{"result":{"steps":0,"steps":1}}')
    def test_non_json_constants(self):
        for value in ('NaN','Infinity','-Infinity'):
            with self.subTest(value=value),self.assertRaises(ValueError):strict_loads('{"value":'+value+'}')
    def test_valid_json(self):self.assertEqual(strict_loads('{"ok":true,"value":-3}'),{'ok':True,'value':-3})
    def test_changed_request_same_expected(self):
        self.m['cases'][0]['request']['input']=7
        with self.assertRaises(ValueError):compare(self.m,self.c)
    def test_missing_suite_digest(self):
        del self.c['suite_sha256']
        with self.assertRaises(ValueError):compare(self.m,self.c)
    def test_boolean_schema_version(self):
        self.m['schema_version']=True
        with self.assertRaises(ValueError):check_package(self.m,(ROOT/'../02-minimal-semantics/contract.md').read_bytes())
if __name__=='__main__':unittest.main()
