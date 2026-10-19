import {randomUUID} from 'node:crypto';

// Preserve the authored lesson as well as learner evidence. Later doc edits must
// not silently substitute a different prompt into an older submission.
const text=(value,max=30000)=>{
  if(typeof value!=='string'||value.length>max)throw new Error('Invalid tool-lab history text.');
  return value;
};
const list=(value,max=50)=>{
  if(!Array.isArray(value)||value.length>max)throw new Error('Invalid tool-lab history list.');
  return value;
};
const officialURL=value=>{
  const url=new URL(text(value,2000));
  if(url.protocol!=='https:'||!['learn.chatgpt.com','developers.openai.com','code.claude.com'].includes(url.hostname)||url.username||url.password)throw new Error('Invalid tool-lab documentation URL.');
  return value;
};
function cleanLesson(value,lessonId){
  if(!value||value.id!==lessonId)throw new Error('Tool-lab history belongs to a different lesson.');
  const doc=value.documentation;
  if(!doc||!/^\d{4}-\d{2}-\d{2}$/.test(doc.verifiedAt))throw new Error('Invalid tool-lab verification record.');
  return {
    id:text(value.id,120),title:text(value.title,300),task:text(value.task),
    explanation:list(value.explanation).map(p=>text(p)),steps:list(value.steps).map(p=>text(p)),hints:list(value.hints).map(p=>text(p)),
    reference:[text(list(value.reference,2)[0],300),officialURL(value.reference[1])],
    readings:list(value.readings).map(r=>({title:text(r.title,300),url:officialURL(r.url),stop:text(r.stop)})),
    example:{filename:text(value.example?.filename,120),code:text(value.example?.code),caption:text(value.example?.caption)},
    documentation:{revision:text(doc.revision,80),product:text(doc.product,120),surface:text(doc.surface,300),os:text(doc.os,300),verifiedAt:doc.verifiedAt,testedVersion:doc.testedVersion===null?null:text(doc.testedVersion,120),validation:text(doc.validation),releaseNotes:officialURL(doc.releaseNotes)},
  };
}
export function validateToolLabHistory(value,lessonId){
  if(value===undefined)return undefined;
  return list(value,1000).map(item=>{
    if(!item||!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(item.id)||typeof item.at!=='string'||Number.isNaN(Date.parse(item.at)))throw new Error('Invalid tool-lab submission identity.');
    const checklist=list(item.checklist);if(!checklist.every(v=>typeof v==='boolean'))throw new Error('Invalid tool-lab submission checklist.');
    const lesson=cleanLesson(item.lesson,lessonId);if(checklist.length!==lesson.steps.length)throw new Error('Tool-lab checklist does not match its original lesson.');
    return {id:item.id,at:item.at,lesson,note:text(item.note),evidence:text(item.evidence),checklist:[...checklist]};
  });
}
export function submitToolLab(entry,lesson,input){
  const submission={id:randomUUID(),at:new Date().toISOString(),lesson:cleanLesson(lesson,lesson.id),note:input.note ?? entry.note ?? '',evidence:input.evidence,checklist:input.checklist};
  // Reject an oversized history instead of silently dropping earlier evidence.
  entry.toolLabHistory=validateToolLabHistory([...(entry.toolLabHistory || []),submission],lesson.id);
  return entry.toolLabHistory.at(-1);
}
