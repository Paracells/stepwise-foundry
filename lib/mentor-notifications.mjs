import {flowFor,currentSection} from '../public/mentor-flow.js';

// Detect readiness only. The mentoring agent must still read and review the evidence.
export function pendingSubmission(path,checkpoint,receipts={version:1,handled:{}}){
  const flow=flowFor(path,checkpoint),section=currentSection(path,flow);
  if(!section)return {status:'idle',reason:'all-authored-sections-reviewed'};
  const entry=flow.sections[section.id];
  if(entry?.status!=='submitted')return {status:'idle',reason:'no-pending-submission',sectionId:section.id};
  if(receipts.handled[entry.submissionId]?.sectionId===section.id)return {status:'idle',reason:'already-handled',sectionId:section.id};
  return {status:'ready',sectionId:section.id,submissionId:entry.submissionId,prompt:section.prompt,entry};
}

export function acknowledgeSubmission(path,checkpoint,receipts,sectionId,submissionId){
  const entry=flowFor(path,checkpoint).sections[sectionId];
  if(!entry?.submissionId||entry.submissionId!==submissionId)throw new Error('Submission changed. Read the current response before acknowledging it.');
  if(!['submitted','reviewed','revise'].includes(entry.status))throw new Error('Only an explicitly submitted response can be acknowledged.');
  return {version:1,handled:{...receipts.handled,[submissionId]:{sectionId,handledAt:new Date().toISOString()}}};
}
