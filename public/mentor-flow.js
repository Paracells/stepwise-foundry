// A section review is a teaching checkpoint, never a claim of mastery.
export const pathSections=path=>path.chapters.flatMap(chapter=>chapter.sections);
export function initialFlow(path,checkpoint){
  // Resume the reading already assigned before gates existed; do not award reviews.
  const resumed=/Reading Cargo\.toml/i.test(checkpoint.currentExercise || '');
  return {version:1,startSection:resumed?'cargo-manifest':pathSections(path)[0].id,
    startReason:resumed?'Continued from your saved Cargo.toml reading. Earlier work is kept as reference, without awarding section reviews.':'',sections:{}};
}
export const flowFor=(path,checkpoint)=>checkpoint.flow || initialFlow(path,checkpoint);
export function currentSection(path,flow){
  const sections=pathSections(path),start=sections.findIndex(section=>section.id===flow.startSection);
  return sections.slice(start).find(section=>flow.sections[section.id]?.status!=='reviewed') || null;
}
export function sectionAccess(path,flow,id){
  const sections=pathSections(path),index=sections.findIndex(section=>section.id===id);
  const current=currentSection(path,flow),limit=current?sections.indexOf(current):sections.length;
  if(index<0||index>limit)return 'locked';
  if(index<sections.findIndex(section=>section.id===flow.startSection))return 'reference';
  return flow.sections[id]?.status==='reviewed'?'reviewed':'current';
}

const text=(value,name,limit)=>{
  if(typeof value!=='string'||value.length>limit)throw new Error(`${name} must be text of at most ${limit} characters.`);
  return value;
};
const date=(value,name)=>{
  if(typeof value!=='string'||Number.isNaN(Date.parse(value)))throw new Error(`Invalid ${name}.`);
  return value;
};
export function validateFlow(value,path){
  if(!value||value.version!==1||!value.sections||typeof value.sections!=='object'||Array.isArray(value.sections))throw new Error('Invalid section checkpoint.');
  const ids=new Set(pathSections(path).map(section=>section.id));
  if(!ids.has(value.startSection))throw new Error('Unknown starting section.');
  const clean={version:1,startSection:value.startSection,startReason:text(value.startReason || '','Resume context',1000),sections:{}};
  for(const [id,entry] of Object.entries(value.sections)){
    if(!ids.has(id)||!entry||!['draft','submitted','revise','reviewed'].includes(entry.status))throw new Error('Invalid section record.');
    const record={status:entry.status,notes:text(entry.notes,'Learning notes',5000),output:text(entry.output,'Observed output',12000)};
    if(entry.submissionId){record.submissionId=text(entry.submissionId,'Submission ID',100);record.submittedAt=date(entry.submittedAt,'submission time');}
    if(entry.review){
      if(!['advance','revise'].includes(entry.review.outcome))throw new Error('Invalid review outcome.');
      record.review={outcome:entry.review.outcome,feedback:text(entry.review.feedback,'Mentor feedback',5000),submissionId:text(entry.review.submissionId,'Reviewed submission ID',100),reviewedAt:date(entry.review.reviewedAt,'review time')};
    }
    if(entry.status==='submitted'&&!record.submissionId)throw new Error('Submitted sections need a submission ID.');
    if(['reviewed','revise'].includes(entry.status)&&(!record.submissionId||record.review?.submissionId!==record.submissionId||record.review.outcome!==(entry.status==='reviewed'?'advance':'revise')))throw new Error('Section status does not match its mentor review.');
    clean.sections[id]=record;
  }
  for(const id of Object.keys(clean.sections))if(sectionAccess(path,clean,id)==='locked'||sectionAccess(path,clean,id)==='reference')throw new Error('A later section cannot be recorded before the current review.');
  return clean;
}
