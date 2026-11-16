import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Controller } from './controller.mjs';
import { manifest,digest } from './harness.mjs';
const auth=()=>({digest:digest(),execution:true,usd:12,reviewed_references:true});
async function fixture(fn){const old={...manifest.runtime};manifest.runtime.model_snapshot='FAKE-NOT-A-PROVIDER';manifest.runtime.adapter_sha256='fake-test-only';try{await fn();}finally{manifest.runtime=old;}}
const adapter=(bound=1,cost=1)=>({boundMicrousd:async()=>bound,request:async()=>({request_id:'fake',cost_microusd:cost,done:true}),cancelAndReconcile:async()=>({confirmed:true,cost_microusd:0})});
test('controller rejects missing approval and unpinned runtime',()=>{
 assert.throws(()=>new Controller({authorization:{}}),/authorization/);
 assert.throws(()=>new Controller({authorization:auth()}),/pinned/);
});
test('controller reserves before request and reports verified outcomes with billing',()=>fixture(async()=>{
 const log=[],c=new Controller({adapter:adapter(),append:async e=>log.push(e),verify:async()=>({passed:false}),authorization:auth()});
 await c.run();assert.equal(c.total,1);assert.equal(log[1].type,'reservation');assert.equal(log.at(-1).type,'complete');assert.equal(log.at(-1).evaluation.passed,false);
}));
test('controller refuses overspend before invocation and globally stops on bad billing',()=>fixture(async()=>{
 let calls=0;const a=adapter(1000001);a.request=async()=>{calls++;};
 const c=new Controller({adapter:a,append:async()=>{},verify:async()=>({}),authorization:auth()});await assert.rejects(c.run(),/Budget/);assert.equal(calls,0);await assert.rejects(c.run(),/stopped/);
 const d=new Controller({adapter:adapter(1,2),append:async()=>{},verify:async()=>({}),authorization:auth()});await assert.rejects(d.run(),/accounting/);assert.equal(d.stopped,true);
}));
test('controller deadline cancels in-flight request and records unresolved cost',()=>fixture(async()=>{
 const log=[],a=adapter();a.request=async()=>new Promise(()=>{});
 const c=new Controller({adapter:a,append:async e=>log.push(e),verify:async()=>({}),authorization:auth(),deadlineMs:5});
 await assert.rejects(c.run(),/Deadline/);assert.equal(c.stopped,true);assert.equal(log.at(-1).cost_complete,false);assert.equal(log.at(-1).cancellation.confirmed,true);
}));
