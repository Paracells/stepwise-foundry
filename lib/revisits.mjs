import {randomUUID} from 'node:crypto';
import {revisitMap} from '../curriculum/revisits.mjs';

const text=(value,limit)=>{if(typeof value!=='string'||value.length>limit)throw new Error('Invalid revisit text.');return value;};
const date=value=>{if(typeof value!=='string'||!Number.isFinite(Date.parse(value)))throw new Error('Invalid revisit timestamp.');return value;};
export function validateRevisits(value={}){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid revisit record.');
  const clean={};
  for(const [id,entry] of Object.entries(value)){
    if(!revisitMap.has(id))continue;
    if(!entry||!Array.isArray(entry.attempts)||entry.attempts.length>200)throw new Error('Invalid revisit attempts.');
    const record={attempts:entry.attempts.map(attempt=>({id:text(attempt.id,100),at:date(attempt.at),prediction:text(attempt.prediction,5000),code:text(attempt.code,200000),assisted:attempt.assisted===true,priorSolutionViewed:attempt.priorSolutionViewed===true,ok:attempt.ok===null?null:attempt.ok===true,output:text(attempt.output || '',10000)}))};
    if(entry.draft)record.draft={code:text(entry.draft.code,200000),prediction:text(entry.draft.prediction,5000)};
    if(entry.helpViewedAt)record.helpViewedAt=date(entry.helpViewedAt);
    clean[id]=record;
  }
  return clean;
}
export function revisitSchedule(variant,progress,now=Date.now()){
  const original=progress.lessons[variant.origin];
  const completed=Date.parse(original?.firstCompletedAt || original?.completedAt);
  if(!Number.isFinite(completed))return {available:false,dueAt:null};
  const due=completed+variant.days*86400000;
  return {available:now>=due,dueAt:new Date(due).toISOString()};
}
export function requireRevisit(variant,progress,now=Date.now()){
  if(!variant||!revisitSchedule(variant,progress,now).available)throw new Error('This optional revisit is not due yet. Continue your main lessons.');
}
export function revisitEntry(progress,id){return (progress.revisits ||= {})[id] ||= {attempts:[]};}
export function startRevisit(variant,progress,input,now=Date.now()){
  requireRevisit(variant,progress,now);
  const prediction=text(input.prediction,5000),code=text(input.code,200000);
  if(!prediction.trim())throw new Error('Write your prediction before checking. It is saved for comparison, not automatically graded.');
  const entry=revisitEntry(progress,variant.id);
  if(entry.attempts.length>=200)throw new Error('This pilot has reached its 200-attempt storage limit. Export your record before continuing.');
  const attempt={id:randomUUID(),at:new Date(now).toISOString(),prediction,code,assisted:!!entry.helpViewedAt||input.externalHelp===true,priorSolutionViewed:!!progress.lessons[variant.origin]?.solutionViewedAt,ok:null,output:''};
  entry.draft={prediction,code};entry.attempts.push(attempt);return attempt.id;
}
export function finishRevisit(progress,id,attemptId,result){
  const attempt=progress.revisits[id].attempts.find(item=>item.id===attemptId);
  if(!attempt||attempt.ok!==null)throw new Error('Revisit attempt is no longer pending.');
  attempt.ok=result.ok===true;attempt.output=String(result.output || '').slice(-10000);
}
export function revisitHelp(variant,progress){
  requireRevisit(variant,progress);
  const entry=revisitEntry(progress,variant.id);
  if(!entry.attempts.some(attempt=>attempt.ok!==null))throw new Error('Try the changed task once before opening help.');
  entry.helpViewedAt ||= new Date().toISOString();
  return {hint:variant.hint,solution:variant.solution,reference:variant.reference};
}
export function revisitReport(progress){
  const lines=['## Delayed-practice pilot','Code results below do not grade the written prediction or establish mastery. Assistance outside the app is self-reported.'];
  for(const [id,entry] of Object.entries(progress.revisits || {}))for(const [index,attempt] of entry.attempts.entries()){
    lines.push('',id+' — attempt '+(index+1)+' — '+attempt.at,'App or self-reported outside help: '+(attempt.assisted?'yes':'no'),'Original lesson worked example previously viewed: '+(attempt.priorSolutionViewed?'yes':'no'),'Code result: '+(attempt.ok===null?'interrupted/pending':attempt.ok?'passed':'needs work'),'Prediction (not automatically graded):',attempt.prediction,'Submitted code:','```'+(revisitMap.get(id).track==='rust'?'rust':'python'),attempt.code.replaceAll('```','~~~'),'```','Observed check output:','```text',attempt.output.replaceAll('```','~~~'),'```');
  }
  return lines.join('\n');
}
