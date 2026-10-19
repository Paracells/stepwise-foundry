import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyProgress} from '../lib/progress.mjs';
import {defaultCheckpoint,beginnerPath} from '../curriculum/beginner-path.mjs';
import {flowFor,currentSection,pathSections} from '../public/mentor-flow.js';
test('a fresh release has no learner progress, reviews, accepted architecture, or personal paths',()=>{
  const progress=emptyProgress();assert.deepEqual(progress.lessons,{});assert.deepEqual(progress.mentoring,{});assert.deepEqual(progress.revisits,{});
  const checkpoint=defaultCheckpoint(),flow=flowFor(beginnerPath,checkpoint);
  assert.deepEqual(flow.sections,{});assert.equal(currentSection(beginnerPath,flow).id,'location');assert.equal(pathSections(beginnerPath).length,30);
  assert.doesNotMatch(JSON.stringify(beginnerPath),/Dustin|Ferrousmux|Ferromux|GPUI|C:\\\\Users/);
});
