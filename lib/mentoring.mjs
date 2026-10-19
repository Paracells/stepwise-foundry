import {randomUUID} from 'node:crypto';
import {beginnerPath,defaultCheckpoint} from '../curriculum/beginner-path.mjs';
import {flowFor,currentSection} from '../public/mentor-flow.js';

const text=(value,name,limit)=>{
  if(typeof value!=='string'||value.length>limit)throw new Error(`${name} must be text of at most ${limit} characters.`);
  return value;
};
// Snapshot only explicit submissions, before a revision can replace their text.
function rememberSubmission(entry){
  if(!entry.submissionId||!['submitted','revise','reviewed'].includes(entry.status))return;
  const history=entry.history ||= [];
  let saved=history.find(attempt=>attempt.submissionId===entry.submissionId);
  if(!saved){
    if(history.length>=500)throw new Error('This section has reached its 500-submission history limit. Export your record before continuing.');
    saved={submissionId:entry.submissionId,submittedAt:entry.submittedAt,notes:entry.notes,output:entry.output};
    if(entry.review?.submissionId===entry.submissionId)saved.review={...entry.review};
    history.push(saved);
  }
  return saved;
}
export function updatePath(data,input,action){
  if(input.pathId!=='beginner')throw new Error('Unknown learning path.');
  const checkpoint=(data.mentoring ||= {}).beginner ||= defaultCheckpoint();
  const flow=checkpoint.flow ||= flowFor(beginnerPath,checkpoint);
  const section=currentSection(beginnerPath,flow);
  if(!section||section.id!==input.sectionId)throw new Error('This section is locked. Submit the current section for mentor review first.');
  const entry=flow.sections[section.id] ||= {status:'draft',notes:'',output:''};
  if(action==='draft'){
    if(entry.status==='submitted')throw new Error('Choose Revise response before editing a submitted answer.');
    rememberSubmission(entry);
    entry.notes=text(input.notes,'Learning notes',5000);entry.output=text(input.output,'Observed output',12000);
  }else if(action==='submit'){
    if(entry.status==='submitted')throw new Error('This response is already waiting for mentor review.');
    if(!entry.notes.trim()||(section.needsOutput&&!entry.output.trim()))throw new Error(section.needsOutput?'Add your explanation and actual terminal output before submitting.':'Add your response to the section prompt before submitting.');
    rememberSubmission(entry);
    // Freeze this exact response; a later submission gets a new ID.
    entry.status='submitted';entry.submissionId=randomUUID();entry.submittedAt=new Date().toISOString();
    rememberSubmission(entry);
  }else if(action==='revise'){
    if(entry.status!=='submitted')throw new Error('Only a pending submission needs to be reopened.');
    rememberSubmission(entry);
    entry.status='draft';
  }else if(action==='review'){
    if(entry.status!=='submitted'||entry.submissionId!==input.submissionId)throw new Error('This submission changed. Read the current response before reviewing it.');
    if(!['advance','revise'].includes(input.outcome))throw new Error('Choose advance or revise.');
    const feedback=text(input.feedback,'Mentor feedback',5000);
    if(!feedback.trim())throw new Error('Explain the review outcome.');
    const saved=rememberSubmission(entry);
    entry.review={outcome:input.outcome,feedback,submissionId:entry.submissionId,reviewedAt:new Date().toISOString()};
    saved.review={...entry.review};
    entry.status=input.outcome==='advance'?'reviewed':'revise';
  }else throw new Error('Unknown path action.');
  checkpoint.updatedAt=new Date().toISOString();
}
