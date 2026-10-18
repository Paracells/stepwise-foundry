import test from 'node:test';
import assert from 'node:assert/strict';
import { runLesson, toolchainStatus } from '../lib/runner.mjs';
import { lessonMap } from '../curriculum/index.mjs';
import { validateProgress, mentorReport } from '../lib/progress.mjs';
import { lessons, modules } from '../curriculum/index.mjs';
test('private language and ML environments report their actual versions',async()=>{
  const status=await toolchainStatus();assert.match(status.python.version,/^3\.15\./);assert.match(status.ml.version,/^3\.14\./);assert.match(status.ml.packages.torch,/^2\.14\./);
});
test('Python checks distinguish valid syntax from required behavior',async()=>{
  const lesson=lessonMap.get('py-first-function');
  assert.equal((await runLesson(lesson,{'main.py':'def double(value):\n    return value\n'})).ok,false);
  const correct=await runLesson(lesson,{'main.py':lesson.solution});assert.equal(correct.ok,true,correct.output);
  const broken=await runLesson(lesson,{'main.py':'def double(value)\n    return 2\n'});assert.equal(broken.ok,false);assert.match(broken.output,/SyntaxError/);
});
test('Python projects import real sibling modules and formatting returns files',async()=>{
  const lesson=lessonMap.get('py-module-project');const result=await runLesson(lesson,lesson.solutionFiles);assert.equal(result.ok,true,result.output);
  const formatted=await runLesson(lessonMap.get('py-first-function'),{'main.py':'def double(value):\n return value*2\n'},'format');assert.equal(formatted.ok,true,formatted.output);assert.match(formatted.files['main.py'],/    return value \* 2/);
});
test('PyTorch grading checks actual tensor values rather than only successful execution',async()=>{
  const lesson=lessonMap.get('pt-create');
  const wrong=await runLesson(lesson,{'main.py':'import torch\ndef make(values):\n    return torch.zeros(len(values))\n'});assert.equal(wrong.ok,false);
  const right=await runLesson(lesson,{'main.py':lesson.solution});assert.equal(right.ok,true,right.output);
});
test('Hugging Face tokenizers execute without a remote model',async()=>{
  const lesson=lessonMap.get('hf-token-ids');const result=await runLesson(lesson,{'main.py':lesson.solution});assert.equal(result.ok,true,result.output);
});
test('backup imports preserve all track records and independent resume points',()=>{
  const ids=new Set(lessonMap.keys());const data=validateProgress({schemaVersion:1,lastLesson:'py-first-function',lastLessons:{rust:'first-function',python:'py-first-function',pytorch:'pt-create',huggingface:'hf-token-ids'},lessons:{'first-function':{note:'Rust note',attempts:[]},'py-first-function':{note:'Python note',attempts:[],files:{'main.py':'def double(n): return n * 2'}}}},ids);
  assert.equal(data.lastLessons.rust,'first-function');assert.equal(data.lastLessons.python,'py-first-function');assert.equal(data.lessons['first-function'].note,'Rust note');
  const report=mentorReport(data,lessons,modules);assert.match(report,/```python/);assert.match(report,/Python note/);assert.match(report,/Rust note/);
  const legacy=validateProgress({schemaVersion:1,lastLesson:'first-function',lessons:{'first-function':{note:'old backup'}}},ids);assert.equal(legacy.lessons['first-function'].note,'old backup');
});
