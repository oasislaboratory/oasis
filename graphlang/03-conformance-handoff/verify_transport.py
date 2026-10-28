"""Materialize/check byte evidence and compare captures; never parse invocations."""
import argparse,hashlib,json
from verify import ROOT,require,strict_loads,suite_digest,compare

def materialize(case):
    p=case['payload']
    require(set(p)=={'hex','trailing_spaces'},'payload recipe fields')
    require(type(p['trailing_spaces']) is int and 0<=p['trailing_spaces']<=1048577,'padding bound')
    require(isinstance(p['hex'],str) and len(p['hex'])<=2097154,'hex bound')
    raw=bytes.fromhex(p['hex'])+b' '*p['trailing_spaces']
    require(len(raw)<=1048577,'fixture materialization bound')
    require(type(case['byte_count']) is int and len(raw)==case['byte_count'],'byte count mismatch')
    require(hashlib.sha256(raw).hexdigest()==case['sha256'],'payload hash mismatch')
    return raw

def check(m):
    require(type(m['schema_version']) is int and m['schema_version']==1,'schema version')
    require(m['disposition']=='candidate' and m['runtime_evidence']=='not_run','evidence disposition')
    for field,path in [('contract_sha256',ROOT/'transport.md'),('p0_sha256',ROOT/'../02-minimal-semantics/contract.md')]:
        require(hashlib.sha256(path.read_bytes()).hexdigest()==m[field],'contract changed')
    ids=[c['id'] for c in m['cases']]
    require(ids and len(ids)==len(set(ids)),'duplicate/empty cases')
    covered=set()
    for c in m['cases']:
        materialize(c);require(c['derivation'] and c['rules'],'missing derivation/rules')
        require(set(c['rules'])<={f'T{i}' for i in range(1,7)},'unknown transport rule')
        covered.update(c['rules']);e=c['expected']
        require(type(e['ok']) is bool and type(e['steps']) is int and e['steps']==0,'identity/pre-execution fixture expected')
        if e['ok']:require(set(e)=={'ok','value','steps'} and type(e['value']) is int and abs(e['value'])<=9007199254740991,'success fields')
        else:require(set(e)=={'ok','code','steps','at'} and e['code'] in ('invalid_graph','invalid_request') and e['at'] is None,'error fields')
    require(covered=={f'T{i}' for i in range(1,7)},'missing rule coverage')
    return len(ids)

def main():
    p=argparse.ArgumentParser();p.add_argument('--responses');args=p.parse_args()
    m=strict_loads((ROOT/'transport-fixtures.json').read_text())
    out=dict(package='pass',byte_cases=check(m),contract_sha256=m['contract_sha256'],suite_sha256=suite_digest(m),runtime='not_run')
    if args.responses:
        from pathlib import Path
        kind=compare(m,strict_loads(Path(args.responses).read_text()))
        out.update(comparison='pass',evidence_kind=kind,runtime='captured_results_match_unattested' if kind=='runtime_capture' else 'not_run')
    print(json.dumps(out,indent=2))
if __name__=='__main__':main()
