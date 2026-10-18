import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { modules, lessons, lessonMap, publicCurriculum } from '../curriculum/index.mjs';
import { runLesson, validateFiles, execute } from '../lib/runner.mjs';
import { ProgressStore, validateProgress, mentorReport } from '../lib/progress.mjs';
test('curriculum has complete, uniquely identified lessons with comments and section links',()=>{
  assert.equal(lessons.length,408);assert.equal(lessonMap.size,lessons.length);assert.equal(new Set(modules.map(m=>m.id)).size,modules.length);
  for(const [track,count] of Object.entries({rust:200,python:100,pytorch:60,huggingface:48}))assert.equal(lessons.filter(l=>l.track===track).length,count);
  for(const lesson of lessons){
    assert.ok(modules.some(m=>m.id===lesson.module),lesson.id);
    assert.ok(lesson.explanation.join(' ').length>120,lesson.id);
    assert.ok(lesson.task.length>15,lesson.id);
    assert.equal(lesson.hints.length,3,lesson.id);
    assert.match(lesson.reference[1],/^https:\/\//);
    if(lesson.kind==='lab'){assert.ok(lesson.steps.length>=5);continue;}
    const files=lesson.solutionFiles || {[lesson.entryFile || 'main.rs']:lesson.solution};validateFiles(files);
    for(const [name,content] of Object.entries(files)){if(name.endsWith('.rs'))assert.match(content,/\/\//,`${lesson.id}/${name} needs comments`);if(name.endsWith('.py'))assert.match(content,/#/,`${lesson.id}/${name} needs comments`);}
    assert.ok(lesson.compileFail || lesson.expectedOutput || lesson.tests?.includes('assert'),lesson.id);
  }
  for(const lesson of publicCurriculum().lessons){assert.equal(lesson.solution,undefined);assert.equal(lesson.solutionFiles,undefined);}
});
test('file validation rejects escape paths and non-text inputs',()=>{
  for(const name of ['../outside.rs','/outside.rs','C:\\outside.rs','src/../../outside.rs','.cargo/config.toml','build.rs','src//main.rs'])assert.throws(()=>validateFiles({[name]:'x'}));
  assert.throws(()=>validateFiles({'main.rs':42}));assert.throws(()=>validateFiles({'main.rs':'a'.repeat(200001)}));
  assert.doesNotThrow(()=>validateFiles({'helper/src/lib.rs':'pub fn ready() {}','Cargo.toml':'[package]'}));
});
test('real compiler distinguishes compiling code from correct behavior',async()=>{
  const lesson=lessonMap.get('first-function');
  const wrong=await runLesson(lesson,{'main.rs':'pub fn double(value:i32)->i32 { value }'});
  assert.equal(wrong.ok,false);assert.match(wrong.output,/assertion/);
  const correct=await runLesson(lesson,{'main.rs':lesson.solution});assert.equal(correct.ok,true,correct.output);
  const syntax=await runLesson(lesson,{'main.rs':'pub fn double( {'});assert.equal(syntax.ok,false);assert.match(syntax.output,/error/);
});
test('stdout and expected compiler diagnostics are checked rather than inferred',async()=>{
  const hello=lessonMap.get('hello-rust');
  assert.equal((await runLesson(hello,{'main.rs':'fn main(){println!("wrong");}'})).ok,false);
  assert.equal((await runLesson(hello,{'main.rs':hello.solution})).ok,true);
  const gate=lessonMap.get('nightly-gate');assert.equal((await runLesson(gate,{'main.rs':gate.solution})).ok,true);
  assert.equal((await runLesson(gate,{'main.rs':'fn not_valid( {'})).ok,false);
});
test('Cargo manifest instructions in comments cannot satisfy requirements',async()=>{
  const lesson=lessonMap.get('cargo-manifest');
  const starter=await runLesson(lesson,lesson.starterFiles);assert.equal(starter.ok,false);
  assert.equal((await runLesson(lesson,lesson.solutionFiles)).ok,true);
});
test('formatter returns edited files without completing a lesson',async()=>{
  const result=await runLesson(lessonMap.get('first-function'),{'main.rs':'pub fn double(n:i32)->i32{n*2}'},'format');
  assert.equal(result.ok,true,result.output);assert.match(result.files['main.rs'],/n: i32/);assert.equal(result.mode,'format');
});
test('runaway child processes are stopped',async()=>{
  const result=await execute(process.execPath,['-e','setInterval(()=>{},1000)'],{timeout:200});assert.equal(result.timedOut,true);assert.notEqual(result.code,0);
});
test('progress saves are serialized, backed up, and survive a new store instance',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'workshop-progress-test-'));
  try{
    const ids=new Set(['a','b']);const store=new ProgressStore(directory,ids);
    await Promise.all(['a','b'].map(id=>store.update(data=>{data.lessons[id]={note:id,attempts:[]};})));
    const restored=await new ProgressStore(directory,ids).read();assert.equal(restored.lessons.a.note,'a');assert.equal(restored.lessons.b.note,'b');
    assert.ok((await readFile(path.join(directory,'progress.previous.json'),'utf8')).includes('"a"'));
    const bad='this is intentionally malformed';await writeFile(store.file,bad);
    await assert.rejects(store.update(data=>{data.lastLesson='a';}),/preserved/);assert.equal(await readFile(store.file,'utf8'),bad);
  }finally{await rm(directory,{recursive:true,force:true});}
});
test('backup validation and mentor report retain relevant learning context',()=>{
  assert.throws(()=>validateProgress({lessons:{}},new Set()));
  const data=validateProgress({schemaVersion:1,lastLesson:'first-function',lessons:{'first-function':{note:'Please explain return values',attempts:[{ok:false,output:'a useful compiler diagnostic'}],files:{'main.rs':'pub fn double(n:i32)->i32 { n }'},completedAt:'2026-10-17T12:00:00Z'},'unknown':{note:'discard'}}},new Set(lessonMap.keys()));
  assert.equal(data.lessons.unknown,undefined);const report=mentorReport(data,lessons,modules);
  assert.match(report,/Please explain return values/);assert.match(report,/a useful compiler diagnostic/);assert.match(report,/pub fn double/);
});
