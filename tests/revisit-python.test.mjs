import test from 'node:test';
import assert from 'node:assert/strict';
import {revisits} from '../curriculum/revisits.mjs';
import {runLesson} from '../lib/runner.mjs';
test('the Python changed task accepts its worked implementation and rejects its unfinished starter',async()=>{
  const variant=revisits[1];
  const solution=await runLesson(variant,{[variant.entryFile]:variant.solution},'check');assert.equal(solution.ok,true,solution.output);
  const starter=await runLesson(variant,{[variant.entryFile]:variant.starter},'check');assert.equal(starter.ok,false);
});
