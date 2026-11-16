// Trusted orchestration kernel; no provider implementation or paid-launch CLI.
// Adapter implementations are trusted host code, never agent-supplied code.
import { Broker, prompt, manifest, digest } from './harness.mjs';
export class Controller {
 constructor({adapter,append,verify,authorization,clock=()=>performance.now(),deadlineMs=900000}){
  if(authorization?.digest!==digest()||authorization?.execution!==true||authorization?.usd!==12||authorization?.reviewed_references!==true)throw Error('Execution authorization/reference approval missing');
  if(!manifest.runtime.model_snapshot||!manifest.runtime.adapter_sha256)throw Error('Runtime not pinned');
  this.adapter=adapter;this.append=append;this.verify=verify;this.clock=clock;this.deadlineMs=deadlineMs;this.total=0;this.next=0;this.stopped=false;
 }
 async run(){
  if(this.stopped||this.next>=12)throw Error('Experiment stopped or complete');
  const slot=this.next++,assignment=manifest.assignment[slot],task=manifest.tasks.find(t=>t.id===assignment.task);
  const started=this.clock(),broker=new Broker(task,this.clock),abort=new AbortController();
  let timer,spent=0,turns=0,active=false,expired=false;
  const emit=event=>this.append({slot:slot+1,...assignment,elapsed_ms:this.clock()-started,...event});
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;abort.abort();reject(Error('Deadline'));},this.deadlineMs);});
  const work=async()=>{
   await emit({type:'start',baseline:manifest.baseline,digest:digest(),prompt:prompt(task,assignment.condition)});
   let history=[{role:'user',content:prompt(task,assignment.condition)}];
   for(;;){
    if(abort.signal.aborted)throw Error('Deadline');
    if(++turns>80)throw Error('Turn limit');
    // Bound must include input, capped output/reasoning, cache and fixed charges.
    const bound=await this.adapter.boundMicrousd(history,manifest.runtime);
    if(abort.signal.aborted)throw Error('Deadline');
    if(!Number.isSafeInteger(bound)||bound<0)throw Error('Unreliable cost bound');
    if(spent+bound>1000000||this.total+bound>12000000)throw Error('Budget exhausted');
    await emit({type:'reservation',microusd:bound});if(abort.signal.aborted)throw Error('Deadline');active=true;
    const response=await this.adapter.request(history,{signal:abort.signal,runtime:manifest.runtime});
    active=false;
    if(abort.signal.aborted)throw Error('Late response after cancellation');
    const cost=response?.cost_microusd;
    if(!Number.isSafeInteger(cost)||cost<0||cost>bound||typeof response.request_id!=='string')throw Error('Unreliable usage accounting');
    spent+=cost;this.total+=cost;await emit({type:'response',response});
    history.push({role:'assistant',content:response});
    if(response.done===true){
     const result=broker.finish();await emit({type:'broker_final',result});
     const evaluation=await this.verify(task,result,{signal:abort.signal});
     if(evaluation.instrumentation_failure)throw Error('Acceptance instrumentation failure');
     if(abort.signal.aborted)throw Error('Deadline');
     await emit({type:'complete',evaluation,cost_microusd:spent,total_cost_microusd:this.total});return evaluation;
    }
    if(!Array.isArray(response.calls)||response.calls.length===0)throw Error('Malformed provider response');
    for(const call of response.calls){if(abort.signal.aborted)throw Error('Deadline');const output=broker.call(call);await emit({type:'tool',request:call,output});history.push({role:'tool',content:output});}
   }
  };
  try{return await Promise.race([work(),timeout]);}
  catch(error){
   // Conservative global stop even on ordinary timeout; no automatic retries.
   this.stopped=true;abort.abort();
   // Cancellation and any in-flight bill must be confirmed outside agent control.
   let cancellation=null;
   if(active||expired){
    const cancellationTimeout=new Promise(resolve=>{const t=setTimeout(()=>resolve({confirmed:false,reason:'cancellation timeout'}),5000);t.unref();});
    try{cancellation=await Promise.race([this.adapter.cancelAndReconcile(),cancellationTimeout]);}catch(e){cancellation={confirmed:false,error:e.message};}
   }
   await emit({type:'stopped',reason:error.message,known_cost_microusd:spent,total_known_cost_microusd:this.total,cancellation,cost_complete:!active&&!expired});
   throw error;
  }finally{clearTimeout(timer);}
 }
}
