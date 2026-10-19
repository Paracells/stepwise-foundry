import { mkdir, writeFile } from 'node:fs/promises';
import { modules, lessons, tracks } from '../curriculum/index.mjs';
const lines=['# Curriculum and source map','',`${lessons.length} lessons in ${modules.length} chapters across ${tracks.length} independent tracks. Every lesson has commented code or a concrete field-lab checklist, and a relevant source link.`, '',...tracks.map(t=>`- ${t.title}: ${lessons.filter(l=>l.track===t.id).length} lessons. ${t.description}`),'', 'Python exercises use Python 3.15. PyTorch 2.14 and Hugging Face use a separate Python 3.14 CPU environment for binary-wheel compatibility. Built-in ML exercises use local data and tiny randomly initialized models, not downloaded pretrained weights.', '', 'This is a broad original curriculum, not a reproduction or exhaustive implementation of every documentation entry. Field labs are self-reported; host models do not establish hardware behavior.',''];
for(const module of modules){
  lines.push(`## ${tracks.find(t=>t.id===module.track).title} / ${module.title}`, '',module.subtitle,'',...module.intro.map(s=>s+'\n'),'| Lesson | Mode | Relevant section |','| --- | --- | --- |');
  for(const lesson of lessons.filter(l=>l.module===module.id))lines.push(`| ${lesson.order}. ${lesson.title} | ${lesson.kind==='lab'?'Field lab':lesson.kind==='python'?'Python checks':lesson.toolchain==='nightly'?'Nightly checks':lesson.compileFail?'Expected diagnostic':lesson.kind==='cargo'?'Cargo project':'Rust checks'} | [${lesson.reference[0]}](${lesson.reference[1]}) |`);
  lines.push('');
}
await mkdir('docs',{recursive:true});await writeFile('docs/CURRICULUM.md',lines.join('\n'));console.log('Wrote docs/CURRICULUM.md');
