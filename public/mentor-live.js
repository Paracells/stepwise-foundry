import {flowFor,currentSection} from './mentor-flow.js';

// Only a new review of the response currently being viewed may move the learner.
// Drafts, replaced submissions, and previously reviewed sections stay in place.
export function mentorReviewUpdate(path,before,after,selectedId){
  const previous=flowFor(path,before).sections[selectedId];
  const nextFlow=flowFor(path,after),entry=nextFlow.sections[selectedId];
  if(previous?.status!=='submitted'||!previous.submissionId||entry?.submissionId!==previous.submissionId)return null;
  const review=entry.review;
  if(review?.submissionId!==previous.submissionId)return null;
  if(entry.status==='revise'&&review.outcome==='revise')return {outcome:'revise',sectionId:selectedId};
  if(entry.status==='reviewed'&&review.outcome==='advance')return {outcome:'advance',sectionId:currentSection(path,nextFlow)?.id || selectedId};
  return null;
}
