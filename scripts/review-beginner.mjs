// Run after reading and discussing the learner's exact submitted response.
// This helper records a human/mentor decision; it does not grade by keywords.
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {flowFor,currentSection} from '../public/mentor-flow.js';
import {defaultCheckpoint,beginnerPath} from '../curriculum/beginner-path.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i+=2){if(!args[i].startsWith('--')||!args[i+1])throw new Error('Use --section ID --submission ID --outcome advance|revise --feedback TEXT (or --feedback-file PATH).');options[args[i].slice(2)]=args[i+1];}
const base=`http://127.0.0.1:${Number(process.env.PORT || 4173)}`;
if(!args.length){
  const response=await fetch(base+'/api/bootstrap');if(!response.ok)throw new Error('Cannot read the current checkpoint.');
  const {progress}=await response.json(),checkpoint=progress.mentoring?.beginner || defaultCheckpoint(),flow=flowFor(beginnerPath,checkpoint),section=currentSection(beginnerPath,flow);
  console.log(JSON.stringify({sectionId:section?.id,prompt:section?.prompt,resumeContext:flow.startReason,entry:section?flow.sections[section.id] || {status:'draft',notes:'',output:''}:null},null,2));
}else{
  const feedback=options['feedback-file']?await readFile(options['feedback-file'],'utf8'):options.feedback;
  if(!options.section||!options.submission||!options.outcome||!feedback)throw new Error('Specify the section, exact submission ID, outcome, and feedback.');
  const key=await readFile(path.join(process.env.FOUNDRY_DATA_DIR || path.join(root,'.data'),'mentor-review.key'),'utf8');
  const response=await fetch(base+'/api/path/review',{method:'POST',headers:{'Content-Type':'application/json','X-Mentor-Token':key.trim()},body:JSON.stringify({pathId:'beginner',sectionId:options.section,submissionId:options.submission,outcome:options.outcome,feedback})});
  const result=await response.json();if(!response.ok)throw new Error(result.error);
  console.log(`Review recorded: ${options.section} — ${options.outcome}. Learner can check for feedback in the path.`);
}
