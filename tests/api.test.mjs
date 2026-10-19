import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { once } from 'node:events';
test('local API protects mutations, persists drafts, grades code, and exports backups',async()=>{
  const reservation=net.createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const directory=await mkdtemp(path.join(tmpdir(),'workshop-api-test-'));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),FOUNDRY_DATA_DIR:directory},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;let token;
  const post=(route,body,extra={})=>fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token,...extra},body:JSON.stringify(body)});
  try{
    await Promise.race([once(child.stdout,'data'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Server did not start')),10000))]);
    const bootstrap=await (await fetch(base+'/api/bootstrap')).json();token=bootstrap.token;assert.equal(bootstrap.curriculum.lessons.length,420);assert.equal(bootstrap.curriculum.tracks.length,6);
    const editorAsset=await fetch(base+'/assets/editor/editor.js');assert.equal(editorAsset.status,200);assert.match(editorAsset.headers.get('content-type'),/javascript/);
    assert.equal((await fetch(base+'/assets/editor/editor.worker.js')).status,200);
    assert.equal((await fetch(base+'/assets/editor/missing.js')).status,404);
    assert.equal((await fetch(base+'/assets/editor/%2e%2e%2f%2e%2e%2fserver.mjs')).status,404);
    assert.match(editorAsset.headers.get('content-security-policy'),/script-src 'self';/);
    assert.equal((await fetch(base+'/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
    assert.equal((await post('save',{id:'first-function'}, {Origin:'https://example.com'})).status,403);
    const draft={'main.rs':'pub fn double(n:i32)->i32 { n*2 }'};
    let response=await post('save',{id:'first-function',files:draft,note:'I understand the final expression.'});assert.equal(response.status,200);
    response=await post('execute',{id:'first-function',files:draft,mode:'run'});let result=await response.json();assert.equal(result.ok,true,result.output);assert.equal(result.progress.lessons['first-function'].completedAt,undefined);
    response=await post('execute',{id:'first-function',files:draft,mode:'check'});result=await response.json();assert.equal(result.ok,true,result.output);assert.ok(result.progress.lessons['first-function'].completedAt);
    response=await post('lab',{id:'local-setup',checklist:[true],evidence:'short'});assert.equal(response.status,400);
    response=await post('solution',{id:'first-function'});result=await response.json();assert.match(result.files['main.rs'],/\/\//);assert.ok(result.progress.lessons['first-function'].solutionViewedAt);
    // Core API coverage must run on a Rust-only installation too. Python behavior
    // is exercised separately by test:python when those optional runtimes exist.
    response=await post('save',{id:'py-first-function',files:{'main.py':'def double(value: int) -> int:\n    return value * 2\n'}});result=await response.json();assert.equal(response.status,200);
    assert.equal(result.progress.lastLessons.rust,'first-function');assert.equal(result.progress.lastLessons.python,'py-first-function');
    response=await post('solution',{id:'py-first-function'});result=await response.json();assert.match(result.files['main.py'],/#/);assert.equal(result.files['main.rs'],undefined);
    const toolLesson=bootstrap.curriculum.lessons.find(l=>l.id==='codex-identify-client');
    const toolEvidence='Observed desktop version and working folder match my scratch setup. I compared the current official setup section with the visible client.';
    const toolInput={id:toolLesson.id,note:'Original observation',evidence:toolEvidence,checklist:toolLesson.steps.map(()=>true)};
    response=await post('save',toolInput);result=await response.json();assert.equal(result.progress.lessons[toolLesson.id].toolLabHistory,undefined);
    response=await post('lab',{...toolInput,documentation:{revision:'forged'}});result=await response.json();assert.equal(response.status,200);
    const snapshot=result.progress.lessons[toolLesson.id].toolLabHistory[0];
    assert.equal(snapshot.lesson.documentation.revision,toolLesson.documentation.revision);assert.equal(snapshot.lesson.task,toolLesson.task);
    response=await post('save',{...toolInput,note:'Newer unsubmitted notes',evidence:'Newer draft'});result=await response.json();
    assert.deepEqual(result.progress.lessons[toolLesson.id].toolLabHistory,[snapshot]);
    assert.equal(result.progress.lastLessons.codex,toolLesson.id);assert.equal(result.progress.lastLessons.rust,'first-function');
    const backup=await (await fetch(base+'/api/export')).json();assert.deepEqual(backup.lessons['first-function'].files,draft);
    const report=await (await fetch(base+'/api/report')).text();assert.match(report,/I understand the final expression/);
    assert.deepEqual(backup.lessons[toolLesson.id].toolLabHistory,[snapshot]);
    response=await post('import',backup);assert.equal(response.status,200);
    result=await response.json();assert.deepEqual(result.progress.lessons[toolLesson.id].toolLabHistory,[snapshot]);
    response=await post('import',{schemaVersion:1,lastLesson:'first-function',lessons:{'first-function':backup.lessons['first-function']}});assert.equal(response.status,200);
    response=await post('save',{id:'py-first-function',files:{'main.py':'def double(n): return n * 2'}});result=await response.json();assert.equal(result.progress.lastLessons.rust,'first-function');assert.deepEqual(result.progress.lessons['first-function'].files,draft);
    const slowFiles={'main.rs':'pub fn double(value:i32)->i32 { std::thread::sleep(std::time::Duration::from_millis(200)); value*2 }'};
    const running=post('execute',{id:'first-function',files:slowFiles,mode:'check'});
    let submitted=false;
    for(let attempt=0;attempt<50;attempt++){
      const state=await (await fetch(base+'/api/bootstrap')).json();
      if(state.progress.lessons['first-function']?.files?.['main.rs']===slowFiles['main.rs']){submitted=true;break;}
      await new Promise(resolve=>setTimeout(resolve,20));
    }
    assert.ok(submitted,'execution draft was not submitted');
    const newerFiles={'main.rs':'// A newer draft written while the old checks run.\npub fn double(n:i32)->i32 { n*3 }'};
    await post('save',{id:'first-function',files:newerFiles});
    await post('save',{id:'immutable-bindings',files:{'main.rs':'fn main() { let count=1; println!("{count}"); }'}});
    result=await (await running).json();assert.equal(result.ok,true,result.output);assert.deepEqual(result.progress.lessons['first-function'].files,newerFiles);assert.equal(result.progress.lastLessons.rust,'immutable-bindings');
    response=await fetch(base+'/../package.json');assert.equal(response.status,404);
  }finally{child.kill();await once(child,'exit').catch(()=>{});await rm(directory,{recursive:true,force:true});}
});
