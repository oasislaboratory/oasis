// Evaluator is outside agent-visible snapshots. Agent code never executes on the host.
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { correct } from './harness.mjs';
const check=`import assert from 'node:assert/strict';
import {children} from './project.mjs';
const e=(source,target,type='filesystem:contains')=>({source,target,type});
assert.deepEqual(children([], 'a'),[]);
assert.deepEqual(children([e('a','b'),e('x','z'),e('a','x','permission'),e('a','b'),e('a','c'),e('b','a')],'a'),['b','b','c']);
assert.deepEqual(children([e('a','a'),e('a','z')],'a'),['a','z']);
assert.deepEqual(children([e('a','b')],'missing'),[]);
`;
export function isolated(files,entry){
 const dir=mkdtempSync(join(tmpdir(),'oasis-r004-check-'));
 try{
  for(const [p,content] of Object.entries(files)){if(!['project.mjs','project.test.mjs','check.mjs'].includes(p))throw Error('Evaluator path not allowed');writeFileSync(join(dir,p),content);}
  // Linux-only; no fallback to unsandboxed execution. No repository/home/env mounted.
  const args=['--unshare-all','--die-with-parent','--new-session','--clearenv','--ro-bind','/usr','/usr','--ro-bind','/lib','/lib','--ro-bind','/lib64','/lib64','--proc','/proc','--dev','/dev','--tmpfs','/tmp','--ro-bind',dir,'/work','--chdir','/work','--setenv','PATH','/usr/bin','/usr/bin/node','--max-old-space-size=64',entry];
  const r=spawnSync('/usr/bin/bwrap',args,{encoding:'utf8',timeout:10000,maxBuffer:100000,env:{PATH:'/usr/bin:/bin'}});
  return {passed:r.status===0,status:r.status,error:r.error?.message??null,stdout:r.stdout??'',stderr:r.stderr??''};
 }finally{rmSync(dir,{recursive:true,force:true});}
}
export function preflight(){return isolated({'check.mjs':"console.log('isolation-ready')"},'check.mjs');}
export function acceptance(task,result){
 const ready=preflight();if(!ready.passed)return {passed:false,instrumentation_failure:true,preflight:ready};
 if(task.id==='T3')return isolated({'project.mjs':result.files['synthetic/project.mjs'],'check.mjs':check},'check.mjs');
 if(task.id!=='T4')throw Error('Code acceptance only applies to T3/T4');
 const tests=result.files['synthetic/project.test.mjs'];if(typeof tests!=='string')return {passed:false,reason:'No regression test'};
 const variants=[correct,
 "export const children=(edges,source)=>edges.filter(e=>e.source===source).map(e=>e.target);",
 "export const children=(edges,source)=>edges.filter(e=>e.type==='filesystem:contains').map(e=>e.target);",
 "export const children=(edges,source)=>[...new Set(edges.filter(e=>e.source===source&&e.type==='filesystem:contains').map(e=>e.target))];",
 "export const children=(edges,source)=>edges.filter(e=>e.source===source&&e.type==='filesystem:contains').map(e=>e.target).reverse();"];
 const outcomes=variants.map(code=>isolated({'project.mjs':code,'project.test.mjs':tests},'project.test.mjs'));
 return {passed:outcomes[0].passed&&outcomes.slice(1).every(o=>o.status===1&&!o.error),outcomes,manual_review:'Confirm assertion failures concern contract, not source fingerprinting or deliberate exits.'};
}
