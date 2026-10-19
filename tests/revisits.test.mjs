import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {revisits,publicRevisit} from '../curriculum/revisits.mjs';
import {revisitSchedule,startRevisit,finishRevisit,revisitHelp,validateRevisits,revisitReport} from '../lib/revisits.mjs';
import {runLesson} from '../lib/runner.mjs';
const variant=revisits[0];
const progress=()=>({schemaVersion:1,lessons:{[variant.origin]:{completedAt:'2020-01-01T00:00:00.000Z',attempts:[],note:'Original learning note.'}},revisits:{}});
test('revisits are due after the stated delay and public tasks do not include help or solutions',()=>{
  const state=progress(),completed=Date.parse(state.lessons[variant.origin].completedAt);
  assert.equal(revisitSchedule(variant,{lessons:{}}).available,false);
  assert.equal(revisitSchedule(variant,state,completed+86400000-1).available,false);
  assert.equal(revisitSchedule(variant,state,completed+86400000).available,true);
  state.lessons[variant.origin].firstCompletedAt=state.lessons[variant.origin].completedAt;
  state.lessons[variant.origin].completedAt='2030-01-01T00:00:00.000Z';
  assert.equal(revisitSchedule(variant,state,completed+86400000).available,true,'Redoing the original must not postpone its revisit.');
  const exposed=publicRevisit(variant);for(const name of ['solution','hint','reference','tests'])assert.equal(Object.hasOwn(exposed,name),false);
  assert.throws(()=>startRevisit(variant,state,{code:variant.starter,prediction:''}),/prediction/);
});
test('first attempt evidence is immutable, help is withheld until a check finishes, and later help does not relabel it',()=>{
  const state=progress(),before=structuredClone(state.lessons);
  assert.throws(()=>revisitHelp(variant,state),/Try/);
  const input={code:variant.starter,prediction:'12, 0, -6. The final expression returns the result.'};
  const id=startRevisit(variant,state,input);input.prediction='Changed later.';
  assert.throws(()=>revisitHelp(variant,state),/Try/);
  finishRevisit(state,variant.id,id,{ok:false,output:'unfinished'});
  assert.equal(revisitHelp(variant,state).solution,variant.solution);
  const second=startRevisit(variant,state,{code:variant.solution,prediction:'12, 0, -6.'});finishRevisit(state,variant.id,second,{ok:true,output:'passed'});
  const attempts=state.revisits[variant.id].attempts;
  assert.equal(attempts[0].assisted,false);assert.equal(attempts[1].assisted,true);assert.match(attempts[0].prediction,/final expression/);
  assert.deepEqual(state.lessons,before);assert.deepEqual(validateRevisits(state.revisits),state.revisits);assert.match(revisitReport(state),/not grade/);
});
test('the Rust changed task accepts its worked implementation and rejects its unfinished starter',async()=>{
  assert.equal((await runLesson(variant,{[variant.entryFile]:variant.solution},'check')).ok,true);
  assert.equal((await runLesson(variant,{[variant.entryFile]:variant.starter},'check')).ok,false);
});
test('HTTP revisit flow enforces prediction/help order, preserves course progress and exports complete evidence',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'foundry-revisit-tests-'));
  const reservation=net.createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),FOUNDRY_DATA_DIR:directory},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base='http://127.0.0.1:'+port;let token;
  const post=(route,data)=>fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token},body:JSON.stringify(data)});
  try{
    let timer;try{await Promise.race([once(child.stdout,'data'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Server startup timed out')),10000);})]);}finally{clearTimeout(timer);}
    ({token}=await(await fetch(base+'/api/bootstrap')).json());
    assert.equal((await post('revisit/check',{id:variant.id,prediction:'A prediction.',code:variant.solution})).status,400);
    assert.equal((await post('import',progress())).status,200);
    const shown=await(await fetch(base+'/api/revisit')).json();assert.equal(shown.variants[0].available,true);assert.equal(Object.hasOwn(shown.variants[0],'solution'),false);
    assert.equal((await post('revisit/help',{id:variant.id})).status,400);
    assert.equal((await post('revisit/check',{id:variant.id,prediction:'',code:variant.solution})).status,400);
    const first=await(await post('revisit/check',{id:variant.id,prediction:'I expect 12, 0, -6.',code:variant.starter})).json();assert.equal(first.ok,false);assert.equal(first.state.attempts[0].assisted,false);
    assert.equal((await post('revisit/help',{id:variant.id})).status,200);
    const second=await(await post('revisit/check',{id:variant.id,prediction:'The expression returns those values.',code:variant.solution})).json();assert.equal(second.ok,true);assert.equal(second.state.attempts[1].assisted,true);
    const exported=await(await fetch(base+'/api/export')).json();assert.deepEqual(exported.lessons,progress().lessons);assert.equal(exported.revisits[variant.id].attempts.length,2);
    const report=await(await fetch(base+'/api/report')).text();assert.match(report,/I expect 12, 0, -6/);assert.match(report,/assistance|help/i);
    assert.equal((await post('import',exported)).status,200);const stored=JSON.parse(await readFile(path.join(directory,'progress.json'),'utf8'));assert.equal(stored.revisits[variant.id].attempts[0].code,variant.starter);
  }finally{const stopped=once(child,'exit');child.kill();await stopped;assert.equal(path.dirname(directory),path.resolve(tmpdir()));assert.ok(path.basename(directory).startsWith('foundry-revisit-tests-'));await rm(directory,{recursive:true,force:true});}
});
