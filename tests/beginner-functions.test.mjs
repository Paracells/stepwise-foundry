import test from 'node:test';
import assert from 'node:assert/strict';
import {functionsChapter} from '../curriculum/beginner-functions.mjs';
import {beginnerPath,defaultCheckpoint,checkpointReport} from '../curriculum/beginner-path.mjs';
import {currentSection,sectionAccess,pathSections} from '../public/mentor-flow.js';
import {renderMentorPath,renderMentorNav} from '../public/mentor-path.js';
import {updatePath} from '../lib/mentoring.mjs';
import {validateProgress} from '../lib/progress.mjs';
import {lessonMap} from '../curriculum/index.mjs';
import {runLesson} from '../lib/runner.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function previousMilestone(){
  const sections=pathSections(beginnerPath),start=sections.findIndex(section=>section.id==='cargo-manifest');
  const flow={version:1,startSection:'cargo-manifest',startReason:'Continue from the saved reading.',sections:{}};
  const end=sections.findIndex(section=>section.id==='function-call-prediction');
  for(const section of sections.slice(start,end)){
    const submissionId=`earlier-${section.id}`;
    flow.sections[section.id]={status:'reviewed',notes:`Original notes for ${section.id}.`,output:`Original evidence for ${section.id}.`,submissionId,submittedAt:'2026-10-18T06:00:00.000Z',review:{outcome:'advance',feedback:`Original feedback for ${section.id}.`,submissionId,reviewedAt:'2026-10-18T06:30:00.000Z'}};
  }
  return {...defaultCheckpoint(),decisionNotes:'Architecture choices remain undecided.',flow,updatedAt:'2026-10-18T06:30:00.000Z'};
}

test('a reviewed chapter 6 opens only 7.1 and preserves the previous learning record',()=>{
  const checkpoint=previousMilestone();
  const old={schemaVersion:1,lastLesson:'hello-rust',lessons:{'hello-rust':{note:'Unrelated learning note.',attempts:[]}},mentoring:{beginner:checkpoint}};
  const restored=validateProgress(old,new Set(lessonMap.keys()));
  assert.deepEqual(restored.lessons,old.lessons);
  assert.deepEqual(restored.mentoring.beginner,checkpoint);
  assert.equal(currentSection(beginnerPath,checkpoint.flow).id,'function-call-prediction');
  assert.equal(sectionAccess(beginnerPath,checkpoint.flow,'session-function-plan'),'locked');
  assert.equal(sectionAccess(beginnerPath,checkpoint.flow,'cargo-role'),'reference');
  assert.equal(Object.hasOwn(checkpoint.flow.sections,'function-call-prediction'),false);
  const report=checkpointReport(checkpoint);
  assert.match(report,/Current: Define a function, then call it/);
  assert.match(report,/Architecture choices remain undecided/);
});

test('chapter 7 renders the short first reading without future solutions or response fields',()=>{
  const checkpoint=previousMilestone();
  const html=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint,esc,selectedId:'function-call-prediction'});
  assert.match(html,/CHAPTER 7/);assert.match(html,/show_notice\(\);/);
  assert.match(html,/Stop at Parameters/);
  assert.doesNotMatch(html,/fn show_note\(\)/);
  assert.doesNotMatch(html,/data-mentor-field="output"/);
  assert.doesNotMatch(html,/cargo run/);
  assert.equal((html.match(/data-path-section=/g)||[]).length,1);
  const locked=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint,esc,selectedId:'session-function-build',requestedId:'session-function-build'});
  assert.match(locked,/That section is locked/);
  assert.match(locked,/data-path-section="function-call-prediction"/);
  assert.doesNotMatch(locked,/fn show_note\(\)/);
  const nav=renderMentorNav(beginnerPath,checkpoint,'function-call-prediction',esc);
  assert.match(nav,/7\.2 Plan two lines of session information — locked/);
  const ids=pathSections(beginnerPath).map(section=>section.id);
  assert.equal(new Set(ids).size,ids.length);
  for(const section of functionsChapter.sections){
    assert.ok(section.stoppingPoint.length>30);
    for(const [,url] of section.readings)assert.match(url,/^https:\/\/doc\.rust-lang\.org\/.+#/);
    for(const example of [section.example,section.revealExample].filter(Boolean))assert.match(example.code,/\/\//);
  }
});

test('each new section needs its exact mentor review before the next one opens',()=>{
  const checkpoint=previousMilestone(),before=structuredClone(checkpoint.flow.sections);
  const data={mentoring:{beginner:checkpoint}};
  for(const [index,section] of functionsChapter.sections.entries()){
    const next=functionsChapter.sections[index+1];
    const input={pathId:'beginner',sectionId:section.id,notes:'QA-only response; no learner understanding inferred.',output:section.needsOutput?'QA-only actual-evidence placeholder.':''};
    updatePath(data,input,'draft');
    assert.equal(currentSection(beginnerPath,checkpoint.flow).id,section.id);
    if(next)assert.throws(()=>updatePath(data,{...input,sectionId:next.id},'draft'),/locked/);
    updatePath(data,input,'submit');
    const submissionId=checkpoint.flow.sections[section.id].submissionId;
    assert.equal(currentSection(beginnerPath,checkpoint.flow).id,section.id);
    assert.throws(()=>updatePath(data,{...input,submissionId:'stale',outcome:'advance',feedback:'QA only.'},'review'),/changed/);
    updatePath(data,{...input,submissionId,outcome:'advance',feedback:'QA-only explicit mentor decision.'},'review');
    const following=next || pathSections(beginnerPath)[pathSections(beginnerPath).findIndex(item=>item.id===section.id)+1];
    assert.equal(currentSection(beginnerPath,checkpoint.flow)?.id,following?.id);
  }
  for(const [id,entry] of Object.entries(before))assert.deepEqual(checkpoint.flow.sections[id],entry);
  assert.equal(currentSection(beginnerPath,checkpoint.flow).id,'argument-prediction');
});

test('authored examples demonstrate calls, local bindings, and source edits in isolated exercises',async()=>{
  const byId=Object.fromEntries(functionsChapter.sections.map(section=>[section.id,section]));
  const call=byId['function-call-prediction'].example.code;
  const note=byId['session-function-build'].revealExample.code;
  const repeated=byId['repeated-call-prediction'].example.code;
  const literal=byId['session-literal-prediction'].example.code;
  const cases=[
    ['call',call,'Before.\nA notice.\nAfter.\n'],
    ['note',note,'Title: Notebook\nState: Draft\n'],
    ['repeated',repeated,'4\n4\n'],
    ['literal-before',literal,'Draft\nDraft\n'],
    ['literal-after',literal.replace('"Draft"','"Saved"'),'Saved\nSaved\n'],
  ];
  for(const [id,source,expectedOutput] of cases){
    const result=await runLesson({id:`beginner-functions-${id}`,kind:'rust',expectedOutput},{'main.rs':source});
    assert.equal(result.ok,true,`${id}: ${result.output}`);
  }
  const reassignment=literal.replace('let state = "Draft";','let state = "Draft";\n    state = "Saved";');
  const result=await runLesson({id:'beginner-functions-reassignment',kind:'rust',compileFail:true,expectedError:'E0384'},{'main.rs':reassignment});
  assert.equal(result.ok,true,result.output);
});
