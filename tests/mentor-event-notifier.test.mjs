import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createSubmissionNotifier} from '../lib/mentor-event-notifier.mjs';

const threadId='11111111-1111-4111-8111-111111111111';
const first={sectionId:'location',submissionId:'22222222-2222-4222-8222-222222222222'};
const second={...first,submissionId:'33333333-3333-4333-8333-333333333333'};
async function temporary(){return mkdtemp(path.join(tmpdir(),'workshop-mentor-events-'));}
async function clean(directory){
  assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));
  assert.ok(path.basename(directory).startsWith('workshop-mentor-events-'));
  await rm(directory,{recursive:true,force:true});
}
async function config(directory,prefixArgs=[]){
  await writeFile(path.join(directory,'mentor-notification-config.json'),JSON.stringify({version:1,enabled:true,threadId,command:process.execPath,prefixArgs}));
}

test('an unconfigured Workshop does not execute a notification command',async()=>{
  const directory=await temporary();
  try{
    const notify=createSubmissionNotifier(directory,{execute:()=>{throw new Error('Must not run.');}});
    assert.deepEqual(await notify(first),{status:'disabled'});
    await assert.rejects(readFile(path.join(directory,'mentor-notification-deliveries.json')),error=>error.code==='ENOENT');
  }finally{await clean(directory);}
});

test('a submission queues one argument-safe message, including across concurrent calls and restarts',async()=>{
  const directory=await temporary(),calls=[];
  const execute=async(...args)=>{calls.push(args);return {stdout:'queued',stderr:''};};
  try{
    await config(directory,['official-codex-wrapper.js']);
    const notify=createSubmissionNotifier(directory,{execute});
    const [sent,duplicate]=await Promise.all([notify(first),notify(first)]);
    assert.equal(sent.status,'queued');assert.equal(duplicate.duplicate,true);assert.equal(calls.length,1);
    const [command,args,options]=calls[0];
    assert.equal(command,process.execPath);
    assert.deepEqual(args.slice(0,5),['official-codex-wrapper.js','queue','--thread',threadId,'--message']);
    assert.match(args[5],new RegExp(first.submissionId));
    assert.match(args[5],new RegExp(`Section: ${first.sectionId}`));
    assert.match(args[5],/docs\/BEGINNER\.md/);
    assert.ok(args[5].length<300,'The notification should remain a short pointer to the existing mentoring workflow.');
    assert.equal(options.shell,false);assert.equal(options.windowsHide,true);
    assert.equal((await createSubmissionNotifier(directory,{execute})(first)).duplicate,true);
    assert.equal(calls.length,1);
    assert.equal((await notify(second)).status,'queued');assert.equal(calls.length,2);
  }finally{await clean(directory);}
});

test('a failed or ambiguous delivery is recorded without leaking CLI output or automatically retrying',async()=>{
  const directory=await temporary();let calls=0;
  try{
    await config(directory);
    const execute=async()=>{calls++;throw new Error('credential-like-value must not be exposed');};
    const notify=createSubmissionNotifier(directory,{execute});
    assert.deepEqual(await notify(first),{status:'failed'});
    assert.deepEqual(await notify(first),{status:'failed',duplicate:true});
    assert.equal(calls,1);
    const receipts=await readFile(path.join(directory,'mentor-notification-deliveries.json'),'utf8');
    assert.doesNotMatch(receipts,/credential-like-value/);
    assert.equal(JSON.parse(receipts).deliveries[first.submissionId].status,'failed');
  }finally{await clean(directory);}
});

test('only explicit submits notify; delivery failures preserve the saved response and all review gates',async()=>{
  const directory=await temporary();
  const reservation=net.createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');
  const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const fake=path.join(directory,'fake-codex.mjs');
  await writeFile(fake,"import {appendFile} from 'node:fs/promises';\nawait appendFile(new URL('./queue.log',import.meta.url),JSON.stringify(process.argv.slice(2))+'\\n');\n");
  await config(directory,[fake]);
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),FOUNDRY_DATA_DIR:directory},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;let token;
  const post=(route,data)=>fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token},body:JSON.stringify(data)});
  try{
    let timer;
    try{await Promise.race([once(child.stdout,'data'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Server did not start')),10000);})]);}finally{clearTimeout(timer);}
    const bootstrap=await(await fetch(base+'/api/bootstrap')).json();token=bootstrap.token;
    assert.doesNotMatch(JSON.stringify(bootstrap),/mentor-notification-config|fake-codex|11111111/);
    const input={pathId:'beginner',sectionId:'location',notes:'QA-only explanation.',output:'QA-only terminal result.'};
    assert.equal((await post('path/draft',input)).status,200);
    await assert.rejects(readFile(path.join(directory,'queue.log')),error=>error.code==='ENOENT');
    const submitted=await(await post('path/submit',input)).json();
    assert.equal(submitted.notification.status,'queued');
    assert.equal(submitted.progress.mentoring.beginner.flow.sections.location.status,'submitted');
    assert.equal((await post('path/draft',{...input,sectionId:'cargo-role'})).status,400);
    assert.equal((await post('path/submit',input)).status,400);
    let messages=(await readFile(path.join(directory,'queue.log'),'utf8')).trim().split('\n').map(line=>JSON.parse(line));
    assert.equal(messages.length,1);
    assert.equal(messages[0][2],threadId);
    assert.match(messages[0][4],new RegExp(submitted.progress.mentoring.beginner.flow.sections.location.submissionId));
    assert.doesNotMatch(messages[0][4],/QA-only explanation|QA-only terminal|credential/);
    await post('path/revise',{pathId:'beginner',sectionId:'location'});
    const resubmitted=await(await post('path/submit',input)).json();
    assert.equal(resubmitted.notification.status,'queued');
    assert.notEqual(resubmitted.progress.mentoring.beginner.flow.sections.location.submissionId,submitted.progress.mentoring.beginner.flow.sections.location.submissionId);
    messages=(await readFile(path.join(directory,'queue.log'),'utf8')).trim().split('\n');assert.equal(messages.length,2);
    await post('path/revise',{pathId:'beginner',sectionId:'location'});
    await config(directory,['-e','process.exit(3)']);
    const failed=await(await post('path/submit',input)).json();
    assert.equal(failed.notification.status,'failed');
    assert.equal(failed.progress.mentoring.beginner.flow.sections.location.status,'submitted');
    assert.equal(failed.progress.mentoring.beginner.flow.sections.location.notes,input.notes);
    assert.equal((await post('path/draft',{...input,sectionId:'cargo-role'})).status,400);
    const key=(await readFile(path.join(directory,'mentor-review.key'),'utf8')).trim();
    const reviewed=await fetch(base+'/api/path/review',{method:'POST',headers:{'Content-Type':'application/json','X-Mentor-Token':key},body:JSON.stringify({...input,submissionId:failed.progress.mentoring.beginner.flow.sections.location.submissionId,outcome:'revise',feedback:'QA-only explicit review.'})});
    assert.equal(reviewed.status,200);
    assert.equal((await readFile(path.join(directory,'queue.log'),'utf8')).trim().split('\n').length,2);
  }finally{
    child.kill();await once(child,'exit').catch(()=>{});
    await clean(directory);
  }
});
