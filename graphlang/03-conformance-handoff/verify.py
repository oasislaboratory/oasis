"""Check fixture structure or compare captured results; never runs a runtime."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).parent
CODES={'invalid_graph','invalid_request','unknown_reference','missing_edge','budget_exhausted','evaluation_error'}
def require(test,message):
    if not test:raise ValueError(message)
def strict_loads(text):
    def pairs(items):
        result={}
        for key,value in items:
            require(key not in result,'duplicate JSON key: '+key)
            result[key]=value
        return result
    def constant(value):raise ValueError('non-JSON constant: '+value)
    return json.loads(text,object_pairs_hook=pairs,parse_constant=constant)
def suite_digest(m):
    return hashlib.sha256(json.dumps(m,sort_keys=True,separators=(',',':'),ensure_ascii=True,allow_nan=False).encode()).hexdigest()
def equal(a,b):
    if type(a) is not type(b):return False
    if isinstance(a,dict):return a.keys()==b.keys() and all(equal(a[k],b[k]) for k in a)
    if isinstance(a,list):return len(a)==len(b) and all(equal(x,y) for x,y in zip(a,b))
    return a==b
def check_package(m,contract):
    require(type(m['schema_version']) is int and m['schema_version']==1 and m['disposition']=='candidate','candidate schema')
    require(m['runtime_evidence']=='not_run','fixture is not runtime evidence')
    require(hashlib.sha256(contract).hexdigest()==m['contract_sha256'],'contract hash mismatch')
    ids=[c['id'] for c in m['cases']]
    require(len(ids)==len(set(ids)) and len(ids)>0,'duplicate/empty cases')
    covered=set()
    for c in m['cases']:
        require(isinstance(c['request'],dict) and bool(c['derivation']),'request/derivation missing')
        require(c['rules'] and set(c['rules']) <= {f'R{i}' for i in range(1,9)},'unknown rule')
        covered.update(c['rules']);e=c['expected']
        require(type(e['ok']) is bool and type(e['steps']) is int and e['steps']>=0,'result types')
        if e['ok']:
            require(set(e)=={'ok','value','steps'} and type(e['value']) is int,'success schema')
        else:
            require(set(e)=={'ok','code','steps','at'} and e['code'] in CODES,'error schema')
            require(e['at'] is None or type(e['at']) is int and e['at']>=0,'error location')
    require(covered=={f'R{i}' for i in range(1,9)},'rule coverage missing')
    return len(ids)
def compare(m,capture):
    require(capture.get('evidence_kind') in ('mock_harness_test','runtime_capture'),'evidence kind missing')
    for key in ('implementation','revision','command','environment'):
        require(isinstance(capture.get(key),str) and capture[key].strip(),f'provenance missing: {key}')
    require(capture.get('contract_sha256')==m['contract_sha256'],'capture contract mismatch')
    require(capture.get('suite_sha256')==suite_digest(m),'capture suite mismatch')
    rows=capture['results'];ids=[r['id'] for r in rows]
    expected={c['id']:c['expected'] for c in m['cases']}
    require(len(ids)==len(set(ids)) and set(ids)==set(expected),'missing/duplicate/extra results')
    for row in rows:require(equal(row['result'],expected[row['id']]),'result mismatch: '+row['id'])
    return capture['evidence_kind']
def main():
    p=argparse.ArgumentParser();p.add_argument('--responses',type=Path);args=p.parse_args()
    m=strict_loads((ROOT/'fixtures.json').read_text())
    count=check_package(m,(ROOT/'../02-minimal-semantics/contract.md').read_bytes())
    result={'package':'pass','cases':count,'rules':8,'runtime':'not_run','suite_sha256':suite_digest(m)}
    if args.responses:
        kind=compare(m,strict_loads(args.responses.read_text()))
        result.update(comparison='pass',evidence_kind=kind)
        result['runtime']='captured_results_match_unattested' if kind=='runtime_capture' else 'not_run'
    print(json.dumps(result,indent=2))
if __name__=='__main__':main()
