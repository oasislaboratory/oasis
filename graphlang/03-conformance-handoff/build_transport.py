"""Author byte fixtures; this is not a parser or evaluator."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).parent
base='{"graph":{"version":"p0","labels":["a"],"matrix":[[null]]},"path":[0],"input":2,"budget":0,"environment":"p0-int-v1"}'
cases=[]
def error(code='invalid_request'):return dict(ok=False,code=code,steps=0,at=None)
def success(n=2):return dict(ok=True,value=n,steps=0)
def add(id,rules,payload,expected,why,spaces=0):
    if isinstance(payload,str):payload=payload.encode('utf-8')
    raw=payload+b' '*spaces
    cases.append(dict(id=id,rules=rules.split(),payload=dict(hex=payload.hex(),trailing_spaces=spaces),byte_count=len(raw),sha256=hashlib.sha256(raw).hexdigest(),expected=expected,derivation=why))
add('identity','T4 T6',base,success(),'One-vertex invocation is identity')
for token in ['2.0','2e0','20e-1']:
    add('integer-'+token,'T5 T6',base.replace('"input":2','"input":'+token),success(),'Exact decimal value is integer 2')
add('negative-zero','T5 T6',base.replace('"input":2','"input":-0.0'),success(0),'Negative zero normalizes to 0')
for token in ['2.5','9007199254740992','9007199254740991.1','1e128']:
    add('range-'+token,'T5',base.replace('"input":2','"input":'+token),error(),'Fractional or outside input carrier; no binary rounding')
add('carrier-upper','T5 T6',base.replace('"input":2','"input":9007199254740991.0'),success(9007199254740991),'Inclusive carrier endpoint represented exactly')
add('invalid-utf8','T1',b'\xff',error(),'UTF-8 decoding failure')
add('bom','T1',b'\xef\xbb\xbf'+base.encode(),error(),'BOM forbidden')
add('malformed','T2',base[:-1],error(),'Unclosed top-level object')
add('trailing-value','T2',base+' null',error(),'Second JSON value forbidden')
add('duplicate-root','T2',base[:-1]+',"input":3}',error(),'Duplicate decoded input key')
add('duplicate-graph','T2',base.replace('"version":"p0"','"version":"p0","version":"p0"'),error(),'Graph duplicate rejected during transport')
add('escaped-duplicate','T2',base[:-1]+',"\\u0069nput":3}',error(),'Escaped key decodes to input')
add('unpaired-surrogate','T2',base.replace('"a"','"\\ud800"'),error(),'Lone surrogate is not a Unicode scalar')
add('paired-surrogate','T2 T6',base.replace('"a"','"\\ud83d\\udc31"'),success(),'Surrogate pair decodes to one scalar label')
add('nan','T2',base.replace('"input":2','"input":NaN'),error(),'Non-JSON numeric constant')
add('missing-envelope','T4','[]',error(),'Top-level object required')
add('missing-graph','T4','{}',error(),'Graph key required')
add('invalid-graph','T4',base.replace('"matrix":[[null]]','"matrix":[]'),error('invalid_graph'),'Decoded graph is nonsquare')
add('size-exact','T1 T6',base,success(),'Exactly 1 MiB allowed',1048576-len(base.encode()))
add('size-over','T1',base,error(),'1 MiB plus one byte rejected',1048577-len(base.encode()))
add('depth-over','T3','['*17+'0'+']'*17,error(),'17 container levels exceed 16')
add('token-over','T3',base.replace('"input":2','"input":'+'1'*129),error(),'129-character numeric token exceeds limit')
add('token-exact','T3 T5 T6',base.replace('"input":2','"input":0.'+'0'*126),success(0),'128-character numeric token denotes zero')
add('fractional-path','T5',base.replace('"path":[0]','"path":[0.5]'),error(),'Path index not an integer')
add('decimal-path-budget','T5 T6',base.replace('"path":[0]','"path":[0e0]').replace('"budget":0','"budget":0.0'),success(),'Integral decimal/exponent forms normalize in all integer fields')
m=dict(schema_version=1,disposition='candidate',runtime_evidence='not_run',contract_sha256=hashlib.sha256((ROOT/'transport.md').read_bytes()).hexdigest(),p0_sha256=hashlib.sha256((ROOT/'../02-minimal-semantics/contract.md').read_bytes()).hexdigest(),cases=cases)
(ROOT/'transport-fixtures.json').write_text(json.dumps(m,indent=2)+'\n')
