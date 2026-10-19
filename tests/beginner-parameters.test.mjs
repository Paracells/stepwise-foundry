import test from 'node:test';
import assert from 'node:assert/strict';
import {parametersChapter} from '../curriculum/beginner-parameters.mjs';
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
  const end=sections.findIndex(section=>section.id==='argument-prediction');
  const flow={version:1,startSection:'cargo-manifest',startReason:'Continue from the saved reading.',sections:{}};
  for(const section of sections.slice(start,end)){
    const submissionId=`earlier-${section.id}`;
    flow.sections[section.id]={status:'reviewed',notes:`Original notes for ${section.id}.`,output:`Original evidence for ${section.id}.`,submissionId,submittedAt:'2026-10-18T20:00:00.000Z',review:{outcome:'advance',feedback:`Original feedback for ${section.id}.`,submissionId,reviewedAt:'2026-10-18T20:30:00.000Z'}};
  }
  return {...defaultCheckpoint(),decisionNotes:'Architecture choices remain undecided. The learner writes all project code.',flow,updatedAt:'2026-10-18T20:30:00.000Z'};
}

test('the chapter 7 milestone opens only 8.1 without rewriting any earlier evidence',()=>{
  const checkpoint=previousMilestone();
  const old={schemaVersion:1,lastLesson:'hello-rust',lessons:{'hello-rust':{note:'Unrelated learning note.',attempts:[]}},mentoring:{beginner:checkpoint}};
  const restored=validateProgress(old,new Set(lessonMap.keys()));
  assert.deepEqual(restored.lessons,old.lessons);
  assert.deepEqual(restored.mentoring.beginner,checkpoint);
  assert.equal(currentSection(beginnerPath,checkpoint.flow).id,'argument-prediction');
  assert.equal(sectionAccess(beginnerPath,checkpoint.flow,'session-input-plan'),'locked');
  assert.equal(sectionAccess(beginnerPath,checkpoint.flow,'cargo-role'),'reference');
  assert.equal(Object.hasOwn(checkpoint.flow.sections,'argument-prediction'),false);
  assert.match(checkpointReport(checkpoint),/Current: A parameter receives an argument/);
});

test('the first parameter lesson is commented, anchored, and hides later edits and worked solutions',()=>{
  const checkpoint=previousMilestone();
  const html=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint,esc,selectedId:'argument-prediction'});
  assert.match(html,/CHAPTER 8/);assert.match(html,/fn print_label\(label: &amp;str\)/);
  assert.match(html,/Stop before the example with two parameters/);
  assert.doesNotMatch(html,/fn print_badge/);
  assert.doesNotMatch(html,/data-mentor-field="output"/);
  assert.doesNotMatch(html,/cargo run/);
  const locked=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint,esc,selectedId:'session-input-build',requestedId:'session-input-build'});
  assert.match(locked,/That section is locked/);
  assert.match(locked,/data-path-section="argument-prediction"/);
  assert.doesNotMatch(locked,/fn print_badge/);
  const nav=renderMentorNav(beginnerPath,checkpoint,'argument-prediction',esc);
  assert.match(nav,/8\.2 Plan a session name supplied by the caller — locked/);
  for(const section of parametersChapter.sections){
    assert.ok(section.stoppingPoint.length>30);
    for(const [,url] of section.readings)assert.match(url,/^https:\/\/doc\.rust-lang\.org\/.+#/);
    for(const example of [section.example,section.revealExample].filter(Boolean))assert.match(example.code,/\/\//);
  }
  const ids=pathSections(beginnerPath).map(section=>section.id);
  assert.equal(new Set(ids).size,ids.length);
});

test('every input step requires review of its exact submission before the following step opens',()=>{
  const checkpoint=previousMilestone(),before=structuredClone(checkpoint.flow.sections);
  const data={mentoring:{beginner:checkpoint}};
  for(const [index,section] of parametersChapter.sections.entries()){
    const next=parametersChapter.sections[index+1];
    const input={pathId:'beginner',sectionId:section.id,notes:'QA-only response, not learner evidence.',output:section.needsOutput?'QA-only terminal placeholder.':''};
    updatePath(data,input,'draft');
    if(next)assert.throws(()=>updatePath(data,{...input,sectionId:next.id},'draft'),/locked/);
    updatePath(data,input,'submit');
    const submissionId=checkpoint.flow.sections[section.id].submissionId;
    assert.equal(currentSection(beginnerPath,checkpoint.flow).id,section.id);
    assert.throws(()=>updatePath(data,{...input,submissionId:'stale',outcome:'advance',feedback:'QA only.'},'review'),/changed/);
    updatePath(data,{...input,submissionId,outcome:'advance',feedback:'QA-only explicit mentor review.'},'review');
    assert.equal(currentSection(beginnerPath,checkpoint.flow)?.id,next?.id);
  }
  for(const [id,entry] of Object.entries(before))assert.deepEqual(checkpoint.flow.sections[id],entry);
  assert.equal(currentSection(beginnerPath,checkpoint.flow),null);
});

test('isolated authored examples verify value flow, one-call changes, and the intended type diagnostic',async()=>{
  const byId=Object.fromEntries(parametersChapter.sections.map(section=>[section.id,section]));
  const first=byId['argument-prediction'].example.code;
  const badge=byId['session-input-build'].revealExample.code;
  const changed=byId['argument-change-prediction'].example.code;
  const mismatch=byId['argument-type-prediction'].example.code;
  const caller='fn main() { let chosen = "Notebook"; print_label(chosen); }\nfn print_label(label: &str) { println!("Label: {label}"); }';
  const cases=[
    ['inputs',first,'Label: Notebook\nLabel: Terminal\n'],
    ['worked-example',badge,'Badge: Draft\nBadge: Review\n'],
    ['before',changed,'Label: Calendar\nLabel: Notes\n'],
    ['after',changed.replace('print_label("Notes")','print_label("Reports")'),'Label: Calendar\nLabel: Reports\n'],
    ['quoted-number',mismatch.replace('print_label(2)','print_label("2")'),'Label: 2\n'],
    ['caller-binding',caller,'Label: Notebook\n'],
  ];
  for(const [id,source,expectedOutput] of cases){
    const result=await runLesson({id:`beginner-parameters-${id}`,kind:'rust',expectedOutput},{'main.rs':source});
    assert.equal(result.ok,true,`${id}: ${result.output}`);
  }
  const result=await runLesson({id:'beginner-parameters-type',kind:'rust',compileFail:true,expectedError:'E0308'},{'main.rs':mismatch});
  assert.equal(result.ok,true,result.output);
});
