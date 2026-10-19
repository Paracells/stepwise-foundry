import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {beginnerPath,defaultCheckpoint,validateCheckpoint,checkpointReport} from '../curriculum/beginner-path.mjs';
import {lessons,lessonMap,modules,publicCurriculum} from '../curriculum/index.mjs';
import {validateProgress} from '../lib/progress.mjs';
import {renderMentorPath} from '../public/mentor-path.js';
import {flowFor,currentSection,sectionAccess,pathSections} from '../public/mentor-flow.js';

test('beginner path reuses lessons and never derives understanding from old completion',()=>{
  assert.equal(lessons.length,420);assert.equal(modules.length,54);
  assert.equal(publicCurriculum().learningPaths[0].id,'beginner');
  for(const [id] of beginnerPath.practice)assert.ok(lessonMap.has(id));
  const old=validateProgress({schemaVersion:1,lastLesson:'hello-rust',lessons:{'hello-rust':{completedAt:'2026-10-17T12:00:00Z',note:'Kept note',attempts:[]}}},new Set(lessonMap.keys()));
  assert.deepEqual(old.mentoring,{});assert.ok(old.lessons['hello-rust'].completedAt);
  const initial=defaultCheckpoint();assert.equal(initial.observedOutput,'');assert.equal(initial.readingsRead,'');
  assert.match(initial.mentorReview,/Not yet reviewed/);assert.match(initial.nextAction,/Get-Location/);
  assert.equal(initial.completedAt,undefined);
  assert.match(checkpointReport(initial),/initial template; no learner evidence saved yet/);
});

test('checkpoint validation keeps one next action and distinguishes proposals from decisions',()=>{
  const value={...defaultCheckpoint(),observedOutput:'Path\n----\nC:\\Projects\\rust-practice',learnerExplanation:'An earlier practice answer retained verbatim.',decisionNotes:'Status: proposed. A proposed design; the learner has not chosen.',completedAt:'2026-10-17T12:00:00Z'};
  const clean=validateCheckpoint(value);assert.equal(clean.completedAt,undefined);assert.equal(clean.observedOutput,value.observedOutput);
  assert.throws(()=>validateCheckpoint({...value,nextAction:'First action\nSecond action'}),/one next action/);
  assert.throws(()=>validateCheckpoint({...value,nextAction:''}),/one next action/);
  assert.throws(()=>validateCheckpoint({...value,observedOutput:'x'.repeat(12001)}),/too long/);
  assert.throws(()=>validateProgress({schemaVersion:1,lessons:{},mentoring:{beginner:'invalid'}},new Set()),/Invalid Rust practice/);
  const report=checkpointReport(clean);assert.match(report,/Readings assigned/);assert.match(report,/Learner's learning notes/);assert.match(report,/An earlier practice answer retained verbatim/);assert.match(report,/A proposed design/);assert.match(report,/learner has not chosen/);
});

test('checkpoint page escapes records and does not render later commands or response fields',()=>{
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const checkpoint={...defaultCheckpoint(),observedOutput:'</textarea><script>alert(1)</script>',nextAction:'Read <one> observation.'};
  const html=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint,esc});
  assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);assert.match(html,/Read &lt;one&gt; observation/);
  assert.doesNotMatch(html,/cargo init --bin --name beginner --vcs none \./);
  assert.doesNotMatch(html,/Intentionally reveal an example/);
  assert.equal((html.match(/data-path-section=/g)||[]).length,1);
  const resumed={...checkpoint,currentExercise:'Reading Cargo.toml: the package manifest.'};
  const flow=flowFor(beginnerPath,resumed);assert.equal(currentSection(beginnerPath,flow).id,'cargo-manifest');
  assert.equal(sectionAccess(beginnerPath,flow,'cargo-role'),'reference');
  assert.equal(sectionAccess(beginnerPath,flow,'initialize'),'locked');
  assert.equal(Object.keys(flow.sections).length,0);
  const locked=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint:resumed,esc,selectedId:'initialize',requestedId:'initialize'});
  assert.match(locked,/That section is locked/);assert.match(locked,/data-path-section="cargo-manifest"/);
  assert.doesNotMatch(locked,/cargo init --bin/);
  assert.equal(pathSections(beginnerPath).length,30);
});

test('checkpoint API preserves course progress through save, backup, import, and short handoff',async()=>{
  const reservation=net.createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const directory=await mkdtemp(path.join(tmpdir(),'beginner-mentor-test-'));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),FOUNDRY_DATA_DIR:directory},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;let token;
  const post=(route,data)=>fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token},body:JSON.stringify(data)});
  try{
    let startupTimer;
    try{await Promise.race([once(child.stdout,'data'),new Promise((_,reject)=>{startupTimer=setTimeout(()=>reject(new Error('Server did not start')),10000);})]);}finally{clearTimeout(startupTimer);}
    const initial=await(await fetch(base+'/api/bootstrap')).json();token=initial.token;
    assert.equal(initial.curriculum.lessons.length,420);assert.deepEqual(initial.progress.mentoring,{});
    const brief=await(await fetch(base+'/api/beginner/brief')).text();assert.match(brief,/Rust beginner path/);assert.match(brief,/mentor/i);
    const unsaved=await(await fetch(base+'/api/beginner/handoff')).text();assert.match(unsaved,/initial template/);
    await post('save',{id:'hello-rust',files:{'main.rs':'fn main() {}'},note:'Unrelated lesson note kept private from short handoff.'});
    const before=await(await fetch(base+'/api/export')).json();
    const checkpoint={...defaultCheckpoint(),observedOutput:'Path\n----\nC:\\Projects\\rust-practice',readingsRead:'Not read yet.',learnerExplanation:'I predict this reports a folder address.',blockers:'Awaiting mentor review.',decisionNotes:'Status: deferred. UI framework undecided.',nextAction:'Ask my mentor to review this folder address.'};
    assert.equal((await fetch(base+'/api/checkpoint',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pathId:'beginner',checkpoint})})).status,403);
    assert.equal((await post('checkpoint',{pathId:'unknown',checkpoint})).status,400);
    const saved=await(await post('checkpoint',{pathId:'beginner',checkpoint})).json();
    assert.deepEqual(saved.progress.lessons,before.lessons);assert.equal(saved.progress.lastLesson,before.lastLesson);assert.deepEqual(saved.progress.lastLessons,before.lastLessons);
    assert.equal(saved.progress.mentoring.beginner.nextAction,checkpoint.nextAction);assert.ok(saved.progress.mentoring.beginner.updatedAt);
    assert.equal((await post('checkpoint',{pathId:'beginner',checkpoint:{...checkpoint,nextAction:'a\nb'}})).status,400);
    const draft={pathId:'beginner',sectionId:'location',notes:'I expected a folder address. This path names the current folder for this PowerShell session.',output:'PS> Get-Location\nPath\n----\nC:\\Projects\\rust-practice'};
    assert.equal((await post('path/draft',{...draft,sectionId:'initialize'})).status,400);
    assert.equal((await post('path/submit',{pathId:'beginner',sectionId:'location'})).status,400);
    const draftSaved=await(await post('path/draft',draft)).json();
    assert.equal(draftSaved.progress.mentoring.beginner.flow.sections.location.status,'draft');
    assert.equal((await post('checkpoint',{pathId:'beginner',checkpoint:{...checkpoint,flow:{version:1,startSection:'initialize',startReason:'',sections:{}}}})).status,400);
    let submitted=await(await post('path/submit',{pathId:'beginner',sectionId:'location'})).json();
    const firstSubmission=submitted.progress.mentoring.beginner.flow.sections.location.submissionId;
    assert.equal(submitted.progress.mentoring.beginner.flow.sections.location.status,'submitted');
    assert.equal((await post('path/draft',draft)).status,400);
    assert.equal((await post('path/draft',{...draft,sectionId:'location-transfer'})).status,400);
    assert.equal((await post('path/submit',{pathId:'beginner',sectionId:'location'})).status,400);
    const review={pathId:'beginner',sectionId:'location',submissionId:firstSubmission,outcome:'advance',feedback:'You identified the session folder. Next, test that idea in a second session.'};
    assert.equal((await post('path/review',review)).status,403);
    const key=(await readFile(path.join(directory,'mentor-review.key'),'utf8')).trim();
    assert.notEqual(key,token);assert.doesNotMatch(JSON.stringify(initial),new RegExp(key));
    const mentorPost=data=>fetch(base+'/api/path/review',{method:'POST',headers:{'Content-Type':'application/json','X-Mentor-Token':key},body:JSON.stringify(data)});
    assert.equal((await mentorPost({...review,submissionId:'stale'})).status,400);
    const revised=await(await mentorPost({...review,outcome:'revise',feedback:'Please keep the actual prompt in your output and explain the current session.'})).json();
    assert.equal(revised.progress.mentoring.beginner.flow.sections.location.status,'revise');
    assert.equal((await post('path/draft',{...draft,sectionId:'location-transfer'})).status,400);
    await post('path/draft',draft);
    submitted=await(await post('path/submit',{pathId:'beginner',sectionId:'location'})).json();
    const secondSubmission=submitted.progress.mentoring.beginner.flow.sections.location.submissionId;
    assert.notEqual(secondSubmission,firstSubmission);
    assert.equal((await mentorPost(review)).status,400);
    // Reopening also invalidates an in-flight mentor decision for the held response.
    assert.equal((await post('path/revise',{pathId:'beginner',sectionId:'location'})).status,200);
    assert.equal((await mentorPost({...review,submissionId:secondSubmission})).status,400);
    submitted=await(await post('path/submit',{pathId:'beginner',sectionId:'location'})).json();
    const latestId=submitted.progress.mentoring.beginner.flow.sections.location.submissionId;
    const reviewed=await(await mentorPost({...review,submissionId:latestId})).json();
    const reviewedFlow=reviewed.progress.mentoring.beginner.flow;
    assert.equal(reviewedFlow.sections.location.status,'reviewed');
    assert.equal(currentSection(beginnerPath,reviewedFlow).id,'location-transfer');
    assert.equal(sectionAccess(beginnerPath,reviewedFlow,'cargo-role'),'locked');
    assert.equal((await post('path/draft',draft)).status,400);
    assert.equal((await post('path/draft',{...draft,sectionId:'location-transfer'})).status,200);
    assert.deepEqual(reviewed.progress.lessons,before.lessons);
    const backup=await(await fetch(base+'/api/export')).json();const report=await(await fetch(base+'/api/report')).text();assert.match(report,/Rust practice — short mentoring handoff/);
    assert.doesNotMatch(JSON.stringify(backup),new RegExp(key));assert.match(report,/Status: reviewed/);
    const handoff=await(await fetch(base+'/api/beginner/handoff')).text();assert.match(handoff,/I predict this reports/);assert.match(handoff,/UI framework undecided/);assert.doesNotMatch(handoff,/Unrelated lesson note/);
    await post('import',{schemaVersion:1,lastLesson:before.lastLesson,lessons:before.lessons});
    let loaded=await(await fetch(base+'/api/bootstrap')).json();assert.deepEqual(loaded.progress.mentoring,{});assert.deepEqual(loaded.progress.lessons,before.lessons);
    assert.equal((await post('import',backup)).status,200);
    loaded=await(await fetch(base+'/api/bootstrap')).json();assert.deepEqual(loaded.progress.mentoring.beginner,backup.mentoring.beginner);assert.deepEqual(loaded.progress.lessons,before.lessons);
  }finally{
    child.kill();await once(child,'exit').catch(()=>{});
    assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));assert.ok(path.basename(directory).startsWith('beginner-mentor-test-'));
    await rm(directory,{recursive:true,force:true});
  }
});
