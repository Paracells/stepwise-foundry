import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pendingSubmission,acknowledgeSubmission} from '../lib/mentor-notifications.mjs';

const run=promisify(execFile),root=fileURLToPath(new URL('..',import.meta.url));
const teachingPath={chapters:[{sections:[{id:'first',prompt:'First prompt.'},{id:'second',prompt:'Second prompt.'}]}]};
const checkpoint=()=>({flow:{version:1,startSection:'first',startReason:'',sections:{}}});
const submitted=id=>({status:'submitted',notes:'My explanation.',output:'My actual result.',submissionId:id,submittedAt:'2026-10-18T21:00:00.000Z'});

test('checks ignore drafts, revisions, reviewed answers, and locked future entries',()=>{
  const state=checkpoint();
  state.flow.sections.second=submitted('future');
  for(const status of ['draft','revise']){
    state.flow.sections.first={...submitted('current'),status};
    assert.equal(pendingSubmission(teachingPath,state).status,'idle');
  }
  state.flow.sections.first={...submitted('current'),status:'reviewed'};
  delete state.flow.sections.second;
  assert.equal(pendingSubmission(teachingPath,state).status,'idle');
  state.flow.sections.second={...submitted('future'),status:'reviewed'};
  assert.equal(pendingSubmission(teachingPath,state).reason,'all-authored-sections-reviewed');
});

test('a pending submission stays available until acknowledged, and resubmissions are new work',()=>{
  const state=checkpoint();state.flow.sections.first=submitted('one');
  assert.equal(pendingSubmission(teachingPath,state).submissionId,'one');
  assert.equal(pendingSubmission(teachingPath,state).submissionId,'one');
  const receipts=acknowledgeSubmission(teachingPath,state,{version:1,handled:{}},'first','one');
  assert.equal(pendingSubmission(teachingPath,state,receipts).reason,'already-handled');
  state.flow.sections.first=submitted('two');
  assert.equal(pendingSubmission(teachingPath,state,receipts).submissionId,'two');
  assert.throws(()=>acknowledgeSubmission(teachingPath,state,receipts,'first','one'),/changed/);
  assert.equal(receipts.handled.two,undefined);
  assert.equal(state.flow.sections.first.status,'submitted');
});

test('the CLI persists receipts without exposing the bootstrap token or changing the learning record',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'workshop-mentor-notifications-'));
  const sectionId='location',progress={mentoring:{beginner:{flow:{version:1,startSection:sectionId,startReason:'',sections:{[sectionId]:submitted('first-id')}}}}};
  let requests=0;
  const server=http.createServer((req,res)=>{
    assert.equal(req.method,'GET');assert.equal(req.url,'/api/bootstrap');requests++;
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({token:'must-never-be-printed',progress}));
  });
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const env={...process.env,PORT:String(server.address().port),FOUNDRY_DATA_DIR:directory};
  const invoke=async(...args)=>{
    const result=await run(process.execPath,['scripts/check-mentor-submission.mjs',...args],{cwd:root,env,windowsHide:true});
    assert.doesNotMatch(result.stdout+result.stderr,/must-never-be-printed/);
    return JSON.parse(result.stdout);
  };
  try{
    const before=structuredClone(progress);
    assert.equal((await invoke()).status,'ready');
    assert.equal((await invoke()).status,'ready');
    assert.equal((await invoke('--ack',sectionId,'--submission','first-id')).status,'acknowledged');
    assert.equal((await invoke()).reason,'already-handled');
    assert.deepEqual(progress,before);
    const receiptPath=path.join(directory,'mentor-notifications.json');
    const firstReceipts=await readFile(receiptPath,'utf8');
    assert.doesNotMatch(firstReceipts,/My explanation|My actual result|must-never-be-printed/);
    progress.mentoring.beginner.flow.sections[sectionId]=submitted('second-id');
    assert.equal((await invoke()).submissionId,'second-id');
    await assert.rejects(invoke('--ack',sectionId,'--submission','first-id'),/changed/);
    assert.equal(await readFile(receiptPath,'utf8'),firstReceipts);
    await invoke('--ack',sectionId,'--submission','second-id');
    assert.equal((await invoke()).reason,'already-handled');
    assert.ok(requests>=8);
  }finally{
    await new Promise(resolve=>server.close(resolve));
    assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('workshop-mentor-notifications-'));
    await rm(directory,{recursive:true,force:true});
  }
});
