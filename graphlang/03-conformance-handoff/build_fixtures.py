"""Rebuild candidate fixtures; expected outcomes are authored, not evaluated."""
from copy import deepcopy
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).parent
G={'version':'p0','labels':['a','b','c'],'matrix':[[None,'inc',None],[None,None,'neg'],['id',None,None]]}
def request(**kw):
    r=dict(graph=deepcopy(G),path=[0,1,2],input=2,budget=3,environment='p0-int-v1');r.update(kw);return r
def ok(value,steps):return dict(ok=True,value=value,steps=steps)
def err(code,steps=0,at=None):return dict(ok=False,code=code,steps=steps,at=at)
cases=[]
def add(id,rules,r,result,derivation):cases.append(dict(id=id,rules=rules.split(),request=r,expected=result,derivation=derivation))
add('P1','R5 R6',request(),ok(-3,2),'inc(2)=3; neg(3)=-3')
add('P2','R3 R6',request(path=[1],budget=0),ok(2,0),'Zero edges: identity, zero steps')
add('P3','R2 R6 R8',request(path=[0,1,2,0]),ok(-3,3),'2 -> 3 -> -3 -> -3; finite cycle')
g=deepcopy(G);g['matrix'][0][0]='id'
add('P4','R3 R6',request(graph=g,path=[0,0],budget=1),ok(2,1),'Explicit id consumes one step')
g=deepcopy(G);g['matrix'][0].pop()
add('N1','R1',request(graph=g,path=[0]),err('invalid_graph'),'First row length 2 differs from 3')
add('N2','R8',request(path=[0,3]),err('unknown_reference'),'Index 3 outside [0,3)')
add('N3','R6 R8',request(path=[0,2],budget=0),err('missing_edge',at=0),'Null edge checked before budget')
g=deepcopy(G);g['matrix'][0][1]='double'
add('N4','R5',request(graph=g,path=[0,1]),err('unknown_reference',at=0),'double absent from closed environment')
add('N4-budget','R6 R8',request(graph=g,path=[0,1],budget=0),err('budget_exhausted',at=0),'Budget checked before lookup')
add('N5','R6 R7',request(budget=1),err('budget_exhausted',steps=1,at=1),'inc succeeds; neg not started; no partial value')
add('N6','R3 R6',request(path=[0,1],input=9007199254740991),err('evaluation_error',at=0),'inc exceeds carrier')
add('N7','R1 R8',request(graph=dict(version='p0',labels=[],matrix=[]),path=[0]),err('unknown_reference'),'Valid empty graph has no vertex 0')
add('N8-path','R4',request(path=[]),err('invalid_request'),'Empty invocation path forbidden')
add('N8-budget','R4',request(budget=True),err('invalid_request'),'Boolean is not an integer budget')
add('N8-environment','R4 R5',request(environment='other'),err('invalid_request'),'Unknown environment')
add('N9','R1 R4',request(graph=[['a'],[[1]]]),err('invalid_graph'),'Legacy adjacency tuple is data, not P0')
g=deepcopy(G);g['labels']=['a','a','a']
add('duplicate-labels','R2 R5',request(graph=g),ok(-3,2),'Identity and lookup do not use labels')
add('bad-path-type','R4 R8',request(path=[False]),err('invalid_request'),'Boolean index rejected before bounds lookup')
add('negative-index','R8',request(path=[-1]),err('unknown_reference'),'Integer outside valid index range')
g=deepcopy(G);g['extra']=True
add('extra-graph-field','R1',request(graph=g),err('invalid_graph'),'Unknown graph field forbidden')
r=request();r['extra']=True
add('extra-request-field','R4',r,err('invalid_request'),'Unknown request field forbidden')
add('max-budget','R4',request(budget=1025),err('invalid_request'),'Budget exceeds 1024')
add('max-path','R4',request(path=[0]*1026),err('invalid_request'),'Path exceeds 1025 items')
add('bad-input','R3 R4',request(input=9007199254740992),err('invalid_request'),'Input outside carrier before invocation')
add('index-before-execution','R8',request(path=[0,1,3],budget=0),err('unknown_reference'),'All indices checked before first budget check')
g=deepcopy(G);g['matrix'][0].pop()
add('graph-before-request','R1 R8',request(graph=g,budget=True),err('invalid_graph'),'Graph validation precedes request validation')
manifest=dict(schema_version=1,disposition='candidate',contract_commit='4fc03a76c8f4faa7014173deba86c348b08c3ab0',contract_sha256=hashlib.sha256((ROOT/'../02-minimal-semantics/contract.md').read_bytes()).hexdigest(),runtime_evidence='not_run',cases=cases)
(ROOT/'fixtures.json').write_text(json.dumps(manifest,indent=2)+'\n')
