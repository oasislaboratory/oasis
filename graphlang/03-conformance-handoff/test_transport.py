"""Evidence integrity checks only; expected parser outcomes are not executed."""
from copy import deepcopy
import unittest
from verify import ROOT,strict_loads,suite_digest,compare
from verify_transport import check,materialize
class TransportEvidenceTests(unittest.TestCase):
    def setUp(self):self.m=strict_loads((ROOT/'transport-fixtures.json').read_text())
    def test_package(self):self.assertEqual(check(self.m),30)
    def test_size_boundary_bytes(self):
        by_id={c['id']:c for c in self.m['cases']}
        self.assertEqual(len(materialize(by_id['size-exact'])),1048576)
        self.assertEqual(len(materialize(by_id['size-over'])),1048577)
    def test_payload_mutation(self):
        c=deepcopy(self.m['cases'][0]);c['payload']['hex']+='20'
        with self.assertRaises(ValueError):materialize(c)
    def test_hash_mutation(self):
        c=deepcopy(self.m['cases'][0]);c['sha256']='0'*64
        with self.assertRaises(ValueError):materialize(c)
    def test_unbounded_padding(self):
        c=deepcopy(self.m['cases'][0]);c['payload']['trailing_spaces']=10**12
        with self.assertRaises(ValueError):materialize(c)
    def test_duplicate_cases(self):
        self.m['cases'].append(self.m['cases'][0])
        with self.assertRaises(ValueError):check(self.m)
    def test_contract_drift(self):
        self.m['contract_sha256']='0'*64
        with self.assertRaises(ValueError):check(self.m)
    def test_capture_comparison(self):
        c=dict(evidence_kind='mock_harness_test',implementation='canned outputs',revision='test-only',command='unittest',environment='Python stdlib',contract_sha256=self.m['contract_sha256'],suite_sha256=suite_digest(self.m),results=[dict(id=x['id'],result=deepcopy(x['expected'])) for x in self.m['cases']])
        self.assertEqual(compare(self.m,c),'mock_harness_test')
        c['results'][0]['result']['value']=3
        with self.assertRaises(ValueError):compare(self.m,c)
if __name__=='__main__':unittest.main()
