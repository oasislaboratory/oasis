"""Harness self-tests use canned expected outputs, not language execution."""
from copy import deepcopy
import json,unittest
from verify import ROOT,check_package,compare
class HarnessTests(unittest.TestCase):
    def setUp(self):
        self.m=json.loads((ROOT/'fixtures.json').read_text())
        self.c=dict(evidence_kind='mock_harness_test',implementation='canned expected outputs',revision='test-only',command='unittest',environment='Python stdlib',contract_sha256=self.m['contract_sha256'],results=[dict(id=c['id'],result=deepcopy(c['expected'])) for c in self.m['cases']])
    def test_package(self):self.assertEqual(check_package(self.m,(ROOT/'../02-minimal-semantics/contract.md').read_bytes()),26)
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
if __name__=='__main__':unittest.main()
