import * as foundations from './01-foundations.mjs';
import * as everyday from './02-everyday-rust.mjs';
import * as abstractions from './03-abstractions.mjs';
import * as tools from './04-tools-and-systems.mjs';
import * as advanced from './05-advanced.mjs';
import * as projects from './06-clinic-and-project.mjs';
import * as pythonCore from './07-python-core.mjs';
import * as pythonPractice from './08-python-practice.mjs';
import * as pytorch from './09-pytorch.mjs';
import * as huggingface from './10-huggingface.mjs';
import * as codingAgents from './11-coding-agents.mjs';
import { sources as rustSources } from './helpers.mjs';
import { tracks, additionalSources } from './tracks.mjs';
import { references } from './references.mjs';
import { beginnerPath } from './beginner-path.mjs';
export { tracks };
export const sources={...rustSources,...additionalSources};
const rustModules = [...foundations.modules, ...everyday.modules, projects.modules[0], ...abstractions.modules, ...tools.modules, ...advanced.modules, projects.modules[1]].map(m=>({...m,track:'rust'}));
export const modules=[...rustModules,...pythonCore.modules,...pythonPractice.modules,...pytorch.modules,...huggingface.modules,...codingAgents.modules];
const allLessons = [...foundations.lessons, ...everyday.lessons, ...abstractions.lessons, ...tools.lessons, ...advanced.lessons, ...projects.lessons,...pythonCore.lessons,...pythonPractice.lessons,...pytorch.lessons,...huggingface.lessons,...codingAgents.lessons];
export const lessons = modules.flatMap(m=>allLessons.filter(l=>l.module===m.id));
for (const [index, lesson] of lessons.entries()) {
  lesson.track ||= 'rust';
  lesson.entryFile ||= lesson.kind==='python'?'main.py':'main.rs';
  lesson.language ||= lesson.kind==='python'?'python':'rust';
  lesson.order=lessons.slice(0,index+1).filter(l=>(l.track || 'rust')===lesson.track).length;
  lesson.reference = references[lesson.id] || lesson.reference || sources[modules.find(m=>m.id===lesson.module).source];
  if(lesson.id.startsWith('clinic-')) { const code=lesson.id.slice(7).toUpperCase(); lesson.reference=[`${code}: compiler explanation`,`https://doc.rust-lang.org/error_codes/${code}.html`]; }
  const withReference=(name,content)=>`${name.endsWith('.toml')?'#':'//'} Read the relevant section: ${lesson.reference[1]}\n${content}`;
  if(lesson.kind!=='lab' && lesson.track==='rust'){
    if(lesson.starterFiles){
      lesson.starterFiles=Object.fromEntries(Object.entries(lesson.starterFiles).map(([name,content])=>[name,withReference(name,content)]));
      lesson.solutionFiles=Object.fromEntries(Object.entries(lesson.solutionFiles).map(([name,content])=>[name,withReference(name,content)]));
    }else{
      lesson.starter=withReference('main.rs',lesson.starter);
      lesson.solution=withReference('main.rs',lesson.solution);
    }
  }
  const previous=lessons.slice(0,index).findLast(l=>l.track===lesson.track);
  lesson.prerequisites = previous ? [previous.id] : [];
}
export const lessonMap = new Map(lessons.map(l=>[l.id,l]));
export function publicCurriculum() {
  return {version:2, title:'Stepwise Foundry', tracks, modules, sources, learningPaths:[beginnerPath],
    lessons:lessons.map(({solution, solutionFiles, toolchain, ...rest})=>({...rest, toolchain:toolchain || 'stable'}))};
}
