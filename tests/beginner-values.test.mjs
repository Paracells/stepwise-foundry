import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {valuesChapter} from '../curriculum/beginner-values.mjs';
import {beginnerPath,defaultCheckpoint,checkpointReport} from '../curriculum/beginner-path.mjs';
import {currentSection,sectionAccess,pathSections} from '../public/mentor-flow.js';
import {renderMentorPath,renderMentorNav} from '../public/mentor-path.js';
import {validateProgress} from '../lib/progress.mjs';
import {lessonMap} from '../curriculum/index.mjs';
import {runLesson} from '../lib/runner.mjs';

function reviewed(id){
  return {status:'reviewed',notes:`Earlier notes for ${id}.`,output:`Earlier evidence for ${id}.`,submissionId:`saved-${id}`,submittedAt:'2026-10-17T20:00:00.000Z',review:{outcome:'advance',feedback:`Earlier feedback for ${id}.`,submissionId:`saved-${id}`,reviewedAt:'2026-10-17T21:00:00.000Z'}};
}
function previousMilestone(){
  const flow={version:1,startSection:'cargo-manifest',startReason:'Continued from saved reading.',sections:{}};
  const oldSections=beginnerPath.chapters.slice(0,5).flatMap(chapter=>chapter.sections);
  for(const section of oldSections.slice(oldSections.findIndex(section=>section.id===flow.startSection)))flow.sections[section.id]=reviewed(section.id);
  return {...defaultCheckpoint(),readingsRead:'Original reading notes kept exactly.',flow,updatedAt:'2026-10-17T21:00:00.000Z'};
}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('an earlier completed milestone resumes at 6.1 without changing reviews or course records',()=>{
  const checkpoint=previousMilestone();
  const old={schemaVersion:1,lastLesson:'hello-rust',lessons:{'hello-rust':{note:'Keep this note.',attempts:[],completedAt:'2026-10-17T20:00:00.000Z'}},mentoring:{beginner:checkpoint}};
  const restored=validateProgress(old,new Set(lessonMap.keys()));
  assert.deepEqual(restored.lessons,old.lessons);
  assert.deepEqual(restored.mentoring.beginner.flow.sections,checkpoint.flow.sections);
  assert.equal(restored.mentoring.beginner.readingsRead,checkpoint.readingsRead);
  assert.equal(currentSection(beginnerPath,checkpoint.flow).id,'value-prediction');
  assert.equal(sectionAccess(beginnerPath,checkpoint.flow,'greeting-binding'),'locked');
  assert.equal(sectionAccess(beginnerPath,checkpoint.flow,'cargo-role'),'reference');
  assert.equal(valuesChapter.sections.length,6);
  const ids=pathSections(beginnerPath).map(section=>section.id);
  assert.equal(new Set(ids).size,ids.length);
  assert.match(checkpointReport(checkpoint),/Current: A value and a name/);
  for(const section of valuesChapter.sections){
    assert.ok(section.prompt.length>60);assert.ok(section.stoppingPoint.length>30);
    for(const [,url] of section.readings)assert.match(url,/^https:\/\/doc\.rust-lang\.org\//);
    for(const example of [section.example,section.revealExample].filter(Boolean))assert.match(example.code,/\/\//);
  }
});

test('only the available example renders, with escaped notes and intentional worked-example reveals',()=>{
  const checkpoint=previousMilestone();
  checkpoint.flow.sections['value-prediction']={status:'draft',notes:'</textarea><script>bad()</script>',output:''};
  const html=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint,esc,selectedId:'value-prediction'});
  assert.match(html,/data-code-file="example.rs"/);assert.match(html,/let message = &quot;Ready\.&quot;/);
  assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);
  assert.doesNotMatch(html,/let mut status/);assert.doesNotMatch(html,/data-mentor-field="output"/);
  assert.equal((html.match(/data-path-section=/g)||[]).length,1);
  const nav=renderMentorNav(beginnerPath,checkpoint,'value-prediction',esc);
  assert.match(nav,/6\.2 Use a binding in your greeting — locked/);
  const locked=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint,esc,selectedId:'mutable-greeting',requestedId:'mutable-greeting'});
  assert.match(locked,/That section is locked/);assert.match(locked,/data-path-section="value-prediction"/);
  checkpoint.flow.sections['value-prediction']=reviewed('value-prediction');
  const next=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint,esc,selectedId:'greeting-binding'});
  assert.match(next,/<details class="mentor-hint"><summary>Intentionally reveal an example after trying<\/summary>/);
  assert.match(next,/let greeting =/);assert.doesNotMatch(next,/let mut status/);
});

test('commented chapter examples produce their stated behavior or the intended compiler diagnostic',async()=>{
  const byId=Object.fromEntries(valuesChapter.sections.map(section=>[section.id,section]));
  const cases=[
    ['binding',byId['value-prediction'].example,'Ready.\n'],
    ['greeting',byId['greeting-binding'].revealExample,'Welcome to Rust!\n'],
    ['reassignment',byId['reassignment-prediction'].example,null],
    ['mutable',byId['mutable-greeting'].example,'Working.\n'],
    ['numeric',byId['values-transfer'].revealExample,'1\n2\n'],
  ];
  for(const [id,example,expectedOutput] of cases){
    const source=example.code.includes('fn main()')?example.code:`fn main() {\n${example.code}\n}`;
    const lesson={id:`beginner-example-${id}`,kind:'rust',...(expectedOutput===null?{compileFail:true,expectedError:'E0384'}:{expectedOutput})};
    const result=await runLesson(lesson,{'main.rs':source});
    assert.equal(result.ok,true,`${id}: ${result.output}`);
  }
});

test('chapter gates enforce reviewed predictions before commands and preserve earlier evidence through backups',async()=>{
  const reservation=net.createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const directory=await mkdtemp(path.join(tmpdir(),'beginner-values-test-'));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),FOUNDRY_DATA_DIR:directory},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;let token;
  const post=(route,data)=>fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token},body:JSON.stringify(data)});
  try{
    let timer;
    try{await Promise.race([once(child.stdout,'data'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Server did not start')),10000);})]);}finally{clearTimeout(timer);}
    token=(await(await fetch(base+'/api/bootstrap')).json()).token;
    const checkpoint=previousMilestone();
    const old={schemaVersion:1,lastLesson:'hello-rust',lessons:{'hello-rust':{note:'Existing lesson note.',attempts:[],completedAt:'2026-10-17T20:00:00.000Z'}},mentoring:{beginner:checkpoint}};
    assert.equal((await post('import',old)).status,200);
    const draft={pathId:'beginner',sectionId:'value-prediction',notes:'My written prediction and plan, before editing or running.',output:''};
    assert.equal((await post('path/draft',{...draft,sectionId:'greeting-binding'})).status,400);
    const saved=await(await post('path/draft',draft)).json();
    assert.equal(currentSection(beginnerPath,saved.progress.mentoring.beginner.flow).id,'value-prediction');
    let submitted=await(await post('path/submit',draft)).json();
    const firstId=submitted.progress.mentoring.beginner.flow.sections['value-prediction'].submissionId;
    assert.equal((await post('path/draft',{...draft,sectionId:'greeting-binding'})).status,400);
    const review={...draft,submissionId:firstId,outcome:'advance',feedback:'QA-only review of this prediction.'};
    assert.equal((await post('path/review',review)).status,403);
    const key=(await readFile(path.join(directory,'mentor-review.key'),'utf8')).trim();
    const mentorPost=data=>fetch(base+'/api/path/review',{method:'POST',headers:{'Content-Type':'application/json','X-Mentor-Token':key},body:JSON.stringify(data)});
    assert.equal((await mentorPost({...review,outcome:'revise'})).status,200);
    assert.equal((await post('path/draft',{...draft,sectionId:'greeting-binding'})).status,400);
    await post('path/draft',draft);submitted=await(await post('path/submit',draft)).json();
    const newId=submitted.progress.mentoring.beginner.flow.sections['value-prediction'].submissionId;
    assert.notEqual(newId,firstId);assert.equal((await mentorPost(review)).status,400);
    const allowed=await(await mentorPost({...review,submissionId:newId})).json();
    assert.equal(currentSection(beginnerPath,allowed.progress.mentoring.beginner.flow).id,'greeting-binding');
    assert.equal(sectionAccess(beginnerPath,allowed.progress.mentoring.beginner.flow,'reassignment-prediction'),'locked');
    const runDraft={...draft,sectionId:'greeting-binding',notes:'My comparison and source explanation.',output:''};
    await post('path/draft',runDraft);
    assert.equal((await post('path/submit',runDraft)).status,400);
    await post('path/draft',{...runDraft,output:'QA-only source excerpt and terminal output.'});
    submitted=await(await post('path/submit',runDraft)).json();
    const runId=submitted.progress.mentoring.beginner.flow.sections['greeting-binding'].submissionId;
    const nextPrediction=await(await mentorPost({...review,sectionId:'greeting-binding',submissionId:runId})).json();
    assert.equal(currentSection(beginnerPath,nextPrediction.progress.mentoring.beginner.flow).id,'reassignment-prediction');
    assert.equal((await post('path/draft',{...draft,sectionId:'immutable-diagnostic'})).status,400);
    for(const [id,entry] of Object.entries(checkpoint.flow.sections))assert.deepEqual(nextPrediction.progress.mentoring.beginner.flow.sections[id],entry);
    assert.deepEqual(nextPrediction.progress.lessons,old.lessons);
    const backup=await(await fetch(base+'/api/export')).json();
    assert.equal((await post('import',backup)).status,200);
    const restored=await(await fetch(base+'/api/bootstrap')).json();
    assert.deepEqual(restored.progress.mentoring.beginner,backup.mentoring.beginner);
    const handoff=await(await fetch(base+'/api/beginner/handoff')).text();
    assert.match(handoff,/Current: Predict a reassignment/);assert.match(handoff,/My written prediction and plan/);
  }finally{
    child.kill();await once(child,'exit').catch(()=>{});
    assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));assert.ok(path.basename(directory).startsWith('beginner-values-test-'));
    await rm(directory,{recursive:true,force:true});
  }
});
