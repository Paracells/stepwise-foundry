import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,modules,lessonMap,tracks} from '../curriculum/index.mjs';
import {submitToolLab,validateToolLabHistory} from '../lib/tool-labs.mjs';
import {validateProgress,mentorReport} from '../lib/progress.mjs';

const fixture=()=>structuredClone(lessonMap.get('codex-identify-client'));
const evidence='I checked the installed desktop client and the current setup section. The displayed workspace matched the separate scratch project.';
const input=lesson=>({note:'My own observation, with help recorded.',evidence,checklist:lesson.steps.map(()=>true)});

test('tool tracks are complete manual chapters with explicit verification scope and primary readings',()=>{
  for(const track of ['codex','claude']){
    assert.equal(tracks.find(t=>t.id===track).runtime,'manual');
    assert.equal(modules.filter(m=>m.track===track).length,2);
    const list=lessons.filter(l=>l.track===track);assert.equal(list.length,6);
    for(const lesson of list){
      assert.equal(lesson.kind,'lab');assert.equal(lesson.documentation.testedVersion,null);
      assert.match(lesson.documentation.validation,/not executed/);
      assert.match(lesson.documentation.verifiedAt,/^\d{4}-\d{2}-\d{2}$/);
      assert.ok(lesson.readings.every(r=>r.stop.length>20&&new URL(r.url).protocol==='https:'));
      assert.match(lesson.example.code,/#|<!--/);assert.ok(lesson.steps.length>=5);
      assert.equal(lesson.starter,undefined);assert.equal(lesson.solution,undefined);
    }
    assert.deepEqual(list[0].prerequisites,[]);
    assert.deepEqual(list[3].prerequisites,[list[2].id]);
  }
});

test('a new lesson revision or draft cannot replace the lesson and evidence of an earlier submission',()=>{
  const lesson=fixture(),entry={note:'',attempts:[]};
  const first=submitToolLab(entry,lesson,input(lesson));
  const original=structuredClone(first);
  lesson.task='A materially changed task';lesson.documentation.revision='2';lesson.example.code='changed';
  entry.note='A later draft';entry.evidence='An unsubmitted observation';
  assert.deepEqual(entry.toolLabHistory,[original]);
  const second=submitToolLab(entry,lesson,{...input(lesson),evidence:'A second actual submission with different observations.'});
  assert.notEqual(first.id,second.id);assert.equal(first.lesson.documentation.revision,'1');
  assert.equal(second.lesson.documentation.revision,'2');assert.equal(first.evidence,evidence);
  assert.deepEqual(first,original);assert.notEqual(first.lesson.task,second.lesson.task);
});

test('tool submissions and per-track resume points survive backup validation without altering legacy work',()=>{
  const lesson=fixture(),entry={note:'Current draft',attempts:[]};submitToolLab(entry,lesson,input(lesson));
  const legacy={note:'Existing Rust notes',attempts:[],files:{'main.rs':'fn main() {}'}};
  const raw={schemaVersion:1,lastLesson:lesson.id,lastLessons:{codex:lesson.id,claude:'claude-identify-client',rust:'hello-rust'},lessons:{[lesson.id]:entry,'hello-rust':legacy}};
  const backup=validateProgress(JSON.parse(JSON.stringify(raw)),new Set(lessonMap.keys()));
  assert.deepEqual(backup.lessons[lesson.id].toolLabHistory,entry.toolLabHistory);
  assert.deepEqual(backup.lessons['hello-rust'],legacy);assert.deepEqual(backup.lastLessons,raw.lastLessons);
  const report=mentorReport(backup,lessons,modules);assert.match(report,/Original lesson revision: 1/);
  assert.ok(report.includes(lesson.task));assert.ok(report.includes(evidence));assert.match(report,/not mentor approval/);
});

test('malformed or cross-lesson history is rejected rather than losing old evidence on import',()=>{
  const lesson=fixture(),entry={};submitToolLab(entry,lesson,input(lesson));
  const invalid=change=>{const history=structuredClone(entry.toolLabHistory);change(history[0]);return history;};
  assert.throws(()=>validateToolLabHistory(invalid(s=>s.lesson.id='claude-identify-client'),lesson.id),/different lesson/);
  assert.throws(()=>validateToolLabHistory(invalid(s=>s.lesson.readings[0].url='javascript:alert(1)'),lesson.id),/documentation URL/);
  assert.throws(()=>validateToolLabHistory(invalid(s=>s.checklist.pop()),lesson.id),/checklist/);
  assert.throws(()=>validateToolLabHistory(invalid(s=>s.at='not a date'),lesson.id),/identity/);
  assert.equal(validateToolLabHistory(undefined,lesson.id),undefined);
});
