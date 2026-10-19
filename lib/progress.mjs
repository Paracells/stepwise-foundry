import { mkdir, readFile, writeFile, rename, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { defaultCheckpoint, validateCheckpoint, checkpointReport } from '../curriculum/beginner-path.mjs';
import {validateRevisits,revisitReport} from './revisits.mjs';
import {validateToolLabHistory} from './tool-labs.mjs';
export const emptyProgress = () => ({schemaVersion:1, updatedAt:new Date().toISOString(), lastLesson:null, lastLessons:{}, lessons:{}, mentoring:{},revisits:{}});
export function validateProgress(value, lessonIds) {
  if (!value || value.schemaVersion !== 1 || !value.lessons || typeof value.lessons !== 'object' || Array.isArray(value.lessons)) throw new Error('Invalid progress backup: expected schemaVersion 1 and a lessons object.');
  const clean = emptyProgress();
  clean.revisits=validateRevisits(value.revisits);
  clean.lastLesson = lessonIds.has(value.lastLesson) ? value.lastLesson : null;
  for(const [track,id] of Object.entries(value.lastLessons || {}))if(['rust','python','pytorch','huggingface','codex','claude'].includes(track)&&lessonIds.has(id))clean.lastLessons[track]=id;
  if(value.mentoring!==undefined&&(!value.mentoring||typeof value.mentoring!=='object'||Array.isArray(value.mentoring)))throw new Error('Invalid mentoring checkpoint data.');
  if(value.mentoring?.beginner!==undefined){
    const checkpoint=value.mentoring.beginner;
    if(!checkpoint||typeof checkpoint!=='object'||Array.isArray(checkpoint))throw new Error('Invalid Rust practice checkpoint.');
    clean.mentoring.beginner=validateCheckpoint({...defaultCheckpoint(),...checkpoint});
  }
  for (const [id, entry] of Object.entries(value.lessons)) {
    if (!lessonIds.has(id) || !entry || typeof entry !== 'object') continue;
    const record = { note: typeof entry.note === 'string' ? entry.note.slice(0,30000) : '',
      attempts: Array.isArray(entry.attempts) ? entry.attempts.slice(-100).map(a => ({at:String(a.at || ''), ok:a.ok === true, mode:a.mode === 'run' ? 'run':'check', output:String(a.output || '').slice(0,10000)})) : [] };
    if (entry.files && typeof entry.files === 'object' && !Array.isArray(entry.files)) {
      record.files = {};
      for (const [file, content] of Object.entries(entry.files)) if (typeof content === 'string' && content.length <= 200000 && file !== '__proto__') record.files[file] = content;
    }
    for (const key of ['completedAt','firstCompletedAt','solutionViewedAt']) if (typeof entry[key] === 'string' && !Number.isNaN(Date.parse(entry[key]))) record[key] = entry[key];
    if (Array.isArray(entry.checklist)) record.checklist = entry.checklist.map(x => x === true).slice(0,50);
    if (typeof entry.evidence === 'string') record.evidence = entry.evidence.slice(0,30000);
    if (entry.selfReported === true) record.selfReported = true;
    if (entry.toolLabHistory !== undefined) record.toolLabHistory=validateToolLabHistory(entry.toolLabHistory,id);
    clean.lessons[id] = record;
  }
  return clean;
}
export class ProgressStore {
  constructor(directory, lessonIds) { this.directory=directory; this.ids=lessonIds; this.file=path.join(directory,'progress.json'); this.queue=Promise.resolve(); }
  async read() {
    try { return validateProgress(JSON.parse(await readFile(this.file,'utf8')),this.ids); }
    catch (error) {
      if (error.code === 'ENOENT') return emptyProgress();
      throw new Error('Progress could not be read. Your existing file was preserved; repair it or restore a backup before saving.');
    }
  }
  update(change) {
    const operation = this.queue.then(async () => {
      const data = await this.read(); const result = await change(data); const next=result || data;
      next.updatedAt=new Date().toISOString();
      await mkdir(this.directory,{recursive:true});
      try { await copyFile(this.file, path.join(this.directory,'progress.previous.json')); } catch(error) { if(error.code !== 'ENOENT') throw error; }
      const temporary=path.join(this.directory,'progress.tmp.json');
      await writeFile(temporary,JSON.stringify(next,null,2)); await rename(temporary,this.file);
      return next;
    });
    this.queue=operation.catch(()=>{}); return operation;
  }
}
export function mentorReport(progress, lessons, modules) {
  const done=lessons.filter(l=>progress.lessons[l.id]?.completedAt);
  const lines=['# Stepwise Foundry — learning report', '', `Exported: ${new Date().toISOString()}`, `Completed: ${done.length} / ${lessons.length}`, `Current lesson: ${progress.lastLesson || 'not started'}`, ...Object.entries(progress.lastLessons || {}).map(([track,id])=>`Current ${track} lesson: ${id}`), '', 'Completed lab checklists are self-reported; code lessons require passing local checks. Imported backups preserve prior claims.', '', '## Course progress'];
  for (const m of modules) {const list=lessons.filter(l=>l.module===m.id); lines.push(`- ${m.track || 'rust'} / ${m.title}: ${list.filter(l=>progress.lessons[l.id]?.completedAt).length}/${list.length}`);}
  for (const lesson of lessons) {
    const state=progress.lessons[lesson.id]; if (!state) continue;
    if (!state.note && !state.evidence && !state.attempts?.length && !state.completedAt) continue;
    lines.push('',`## ${lesson.title} (${lesson.id})`, `Status: ${state.completedAt ? 'completed' : 'in progress'}${state.selfReported ? ' (self-reported lab)' : ''}`, `Attempts: ${state.attempts?.length || 0}`, `Worked solution viewed: ${state.solutionViewedAt ? 'yes' : 'no'}`, `Relevant section: [${lesson.reference[0]}](${lesson.reference[1]})`);
    if(state.note) lines.push('Notes:',state.note);
    if(state.evidence) lines.push('Lab evidence:',state.evidence);
    for(const submission of state.toolLabHistory || []){
      const original=submission.lesson;
      lines.push('',`### Saved tool-lab submission ${submission.id}`,`Submitted: ${submission.at} (self-reported; not mentor approval)`,`Original lesson revision: ${original.documentation.revision}`,`Original task: ${original.task}`,`Documentation checked: ${original.documentation.verifiedAt}; ${original.documentation.surface}`,`Author testing status: ${original.documentation.validation}`,
        ...original.readings.map(r=>`Original reading: [${r.title}](${r.url}) — ${r.stop}`),'Submitted notes:',submission.note,'Submitted evidence:',submission.evidence);
    }
    const failed=state.attempts?.filter(a=>!a.ok).at(-1); if(failed) lines.push('Most recent unsuccessful attempt:','```text',failed.output.replaceAll('```','~~~'),'```');
    if(state.files) for(const [name, content] of Object.entries(state.files)) lines.push(`### Draft: ${name}`,name.endsWith('.py')?'```python':name.endsWith('.rs')?'```rust':name.endsWith('.toml')?'```toml':'```text',content.replaceAll('```','~~~'),'```');
  }
  if(progress.mentoring?.beginner)lines.push('','---','',checkpointReport(progress.mentoring.beginner));
  if(Object.keys(progress.revisits || {}).length)lines.push('','---','',revisitReport(progress));
  return lines.join('\n');
}
