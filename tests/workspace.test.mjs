import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {handleApi} from '../server/api.mjs';
import {openDatabase} from '../scripts/sqlite-adapter.mjs';
import {createDemoRun} from '../lib/demo.mjs';
function fixture(){const dir=mkdtempSync(join(tmpdir(),'strategy-lab-'));let db=openDatabase(join(dir,'test.sqlite'));return {get db(){return db;},reopen(){db.close();db=openDatabase(join(dir,'test.sqlite'));},close(){db.close();rmSync(dir,{recursive:true,force:true});}};}
async function call(f,path='/api/workspace',body,options={}){
 const headers={'oai-authenticated-user-id':'test-owner',...(body?{'Content-Type':'application/json'}:{}),...options.headers};if(options.anonymous)delete headers['oai-authenticated-user-id'];
 const r=await handleApi(new Request('https://test.local'+path,{method:body?'POST':'GET',...options,headers,body:body?JSON.stringify(body):undefined}),{DB:f.db});
 const data=r.headers.get('Content-Type')?.includes('json')?await r.json():await r.text();return {status:r.status,data};
}
const mutation=(revision,more={})=>({revision,requestId:crypto.randomUUID(),...more});
test('workspace persists principles, task evidence, events and exports after database restart',async()=>{
 const f=fixture();try{
  let r=await call(f);assert.equal(r.status,200);assert.equal(r.data.principles[0].content,'嚴格執行交易計劃');assert.equal(r.data.revision,0);
  const input=mutation(0,{content:'只依核准計劃進場 <script>alert(1)</script>',scope:'TMF',strength:'hard'});
  r=await call(f,'/api/principles',input);assert.equal(r.status,200);assert.equal(r.data.principles.length,2);assert.equal(r.data.revision,1);
  r=await call(f,'/api/tasks/T03',mutation(1,{status:'done',evidence:'驗證新增原則、重新載入與匯出均可用。'}),{method:'PATCH'});assert.equal(r.status,200);
  f.reopen();r=await call(f);assert.equal(r.data.principles.length,2);assert.equal(r.data.tasks.find(t=>t.id==='T03').status,'done');assert.equal(r.data.events.length,2);
  const j=await call(f,'/api/export');assert.equal(j.data.events.length,2);assert.ok(j.data.exportedAt);
  const md=await call(f,'/api/handoff');assert.match(md.data,/嚴格執行交易計劃/);assert.match(md.data,/驗證新增原則/);assert.match(md.data,/TMF/);
 }finally{f.close();}
});
test('stale revisions, duplicate retries and conflicting idempotency keys do not corrupt state',async()=>{
 const f=fixture();try{
  await call(f);const b=mutation(0,{content:'原則一',scope:'TMF',strength:'preference'});
  assert.equal((await call(f,'/api/principles',b)).status,200);
  assert.equal((await call(f,'/api/principles',b)).status,200);
  assert.equal((await call(f,'/api/principles',{...b,content:'被更換的內容'})).status,409);
  assert.equal((await call(f,'/api/principles',mutation(0,{content:'過期更新',scope:'TMF',strength:'hard'}))).status,409);
  const s=(await call(f)).data;assert.equal(s.revision,1);assert.equal(s.principles.length,2);assert.equal(s.events.length,1);
 }finally{f.close();}
});
test('concurrent writers commit at most one mutation for a version',async()=>{
 const f=fixture();try{
  await call(f);const bodies=['甲','乙'].map(content=>mutation(0,{content,scope:'TMF',strength:'hypothesis'}));
  const result=await Promise.all(bodies.map(b=>call(f,'/api/principles',b)));
  assert.deepEqual(result.map(r=>r.status).sort(),[200,409]);const s=(await call(f)).data;assert.equal(s.revision,1);assert.equal(s.principles.length,2);assert.equal(s.events.length,1);
 }finally{f.close();}
});
test('task gates require evidence and completed dependencies; reopening protects active descendants',async()=>{
 const f=fixture();try{
  await call(f);
  assert.equal((await call(f,'/api/tasks/T03',mutation(0,{status:'done'}),{method:'PATCH'})).status,400);
  assert.equal((await call(f,'/api/tasks/T09',mutation(0,{status:'in_progress'}),{method:'PATCH'})).status,409);
  assert.equal((await call(f,'/api/tasks/T01',mutation(0,{status:'backlog'}),{method:'PATCH'})).status,409);
  const r=await call(f,'/api/tasks/T05',mutation(0,{status:'ready',note:'先用一日樣本討論'}),{method:'PATCH'});assert.equal(r.status,200);assert.equal(r.data.tasks.find(t=>t.id==='T05').note,'先用一日樣本討論');
 }finally{f.close();}
});
test('auth, owner isolation, cross-origin protection and input validation reject unwanted writes',async()=>{
 const f=fixture();try{
  assert.equal((await call(f,'/api/workspace',undefined,{anonymous:true})).status,401);
  await call(f);
  assert.equal((await call(f,'/api/workspace',undefined,{headers:{'oai-authenticated-user-id':'other'}})).status,403);
  const b=mutation(0,{content:'測試',scope:'TMF',strength:'hard'});
  assert.equal((await call(f,'/api/principles',b,{headers:{origin:'https://other.local'}})).status,403);
  assert.equal((await call(f,'/api/principles',{...b,content:''})).status,400);
  assert.equal((await call(f,'/api/principles',{...b,strength:'guaranteed-profit'})).status,400);
  const raw=await handleApi(new Request('https://test.local/api/principles',{method:'POST',headers:{'oai-authenticated-user-id':'test-owner','Content-Type':'application/json'},body:'broken'}),{DB:f.db});assert.equal(raw.status,400);
  assert.equal((await call(f)).data.revision,0);
 }finally{f.close();}
});
test('custom tasks survive refresh, principle archival preserves original and demos stop at missing gates',async()=>{
 const f=fixture();try{
  await call(f);
  const t=await call(f,'/api/tasks',mutation(0,{title:'查核 TMF 夜盤',description:'讀期交所現行規格。',acceptance:'列出日夜盤時段與交易日。',phase:'p1'}));assert.equal(t.status,200);assert.ok(t.data.tasks.find(t=>t.title==='查核 TMF 夜盤'));
  const archived=await call(f,'/api/principles/P001',mutation(1,{active:false}),{method:'PATCH'});assert.equal(archived.status,200);assert.equal(archived.data.principles[0].active,false);
  const r=await call(f,'/api/demo',mutation(2));assert.equal(r.status,200);const run=r.data.runs[0];assert.equal(run.mode,'deterministic_demo');assert.equal(run.status,'blocked');assert.equal(run.model,null);assert.equal(run.performance,null);assert.deepEqual(run.inputs.principleIds,[]);assert.equal(run.gates.find(g=>g.id==='trace').status,'blocked');
  f.reopen();const s=(await call(f)).data;assert.equal(s.runs.length,1);assert.equal(s.principles[0].content,'嚴格執行交易計劃');assert.equal(s.principles[0].active,false);
 }finally{f.close();}
});
test('deterministic example has no performance data or assumed numerical risk',()=>{
 const opts={id:'test-run',now:'2026-10-01T00:00:00Z'},p=[{id:'P001',content:'嚴格執行交易計劃',active:true}];
 const a=createDemoRun(p,opts),b=createDemoRun(p,opts);assert.deepEqual(a,b);assert.equal(a.hypothesis.parameters.maxRiskTWD,null);assert.equal(a.inputs.instrument,'TAIFEX:TMF');assert.equal(a.gates.at(-1).status,'not_run');
});
test('database batch rolls back both content and audit writes on failure',async()=>{
 const f=fixture();try{
  await call(f);
  await assert.rejects(f.db.batch([f.db.prepare("INSERT INTO custom_tasks VALUES ('T-fail','{}')"),f.db.prepare('INSERT INTO missing_table VALUES (1)')]));
  assert.equal(await f.db.prepare("SELECT * FROM custom_tasks WHERE id='T-fail'").first(),null);
 }finally{f.close();}
});
