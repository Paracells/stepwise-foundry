import {renderSubmissionHistory} from './mentor-flow.js';
import {flowFor,pathSections,currentSection,sectionAccess} from './mentor-flow.js';

const statusLabel=entry=>({draft:'In progress',submitted:'Awaiting mentor review',revise:'Revision requested',reviewed:'Reviewed for next section'})[entry?.status] || 'In progress';
export function captureCheckpoint(root=document){
  const form=root.querySelector('[data-path-section]'),notes=form?.querySelector('[data-mentor-field="notes"]');
  if(!notes||notes.readOnly)return null;
  return {pathId:'beginner',sectionId:form.dataset.pathSection,notes:notes.value,output:form.querySelector('[data-mentor-field="output"]')?.value || ''};
}
export function renderMentorNav(path,checkpoint,selectedId,esc){
  const flow=flowFor(path,checkpoint);
  return path.chapters.map((chapter,i)=>`<details class="mentor-chapter" ${chapter.sections.some(section=>section.id===selectedId)?'open':''}>
    <summary><span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span>${esc(chapter.title)}</span></summary>
    ${chapter.sections.map((section,j)=>{
      const access=sectionAccess(path,flow,section.id),label=`${i+1}.${j+1} ${section.title}`;
      return access==='locked'?`<button class="mentor-section-link locked" disabled aria-label="${esc(label)} — locked"><span>${esc(label)}</span><small>Locked · review required</small></button>`:
        `<a class="mentor-section-link ${selectedId===section.id?'selected':''}" href="#path/beginner/${section.id}" ${selectedId===section.id?'aria-current="step"':''}><span>${esc(label)}</span><small>${access==='reference'?'Earlier reference':access==='reviewed'?'Reviewed':esc(statusLabel(flow.sections[section.id]))}</small></a>`;
    }).join('')}</details>`).join('');
}
export function selectedPathSection(path,checkpoint,requestedId){
  const flow=flowFor(path,checkpoint),sections=pathSections(path);
  return sections.find(section=>section.id===requestedId&&sectionAccess(path,flow,section.id)!=='locked') || currentSection(path,flow) || sections.at(-1);
}
export function renderMentorPath({shell,path,checkpoint,esc,selectedId,requestedId}){
  const flow=flowFor(path,checkpoint),sections=pathSections(path),section=selectedPathSection(path,checkpoint,selectedId);
  const access=sectionAccess(path,flow,section.id),entry=flow.sections[section.id] || {status:'draft',notes:'',output:''};
  const chapter=path.chapters.find(item=>item.sections.includes(section)),chapterIndex=path.chapters.indexOf(chapter),sectionIndex=chapter.sections.indexOf(section);
  const frozen=entry.status==='submitted'||access==='reviewed',editable=access==='current'&&!frozen;
  const reference=([label,url])=>`<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(label)} ↗</a>`;
  const example=value=>value?`<figure class="mentor-example"><figcaption>${esc(value.caption)}</figcaption><pre data-code-file="${esc(value.filename)}"><code>${esc(value.code)}</code></pre></figure>`:'';
  const textArea=(key,label,value,max,rows)=>`<label class="mentor-field" for="section-${key}"><span id="section-label-${key}">${label}</span><textarea id="section-${key}" aria-labelledby="section-label-${key}" data-mentor-field="${key}" class="${key==='output'?'mentor-output':''}" rows="${rows}" maxlength="${max}" ${editable?'':'readonly'}>${esc(value)}</textarea></label>`;
  const next=sections[sections.indexOf(section)+1];
  const previous=sections[sections.indexOf(section)-1],previousEntry=previous&&flow.sections[previous.id];
  const previousFeedback=access==='current'&&previousEntry?.status==='reviewed'?previousEntry.review:null;
  const lockedRequest=requestedId&&sectionAccess(path,flow,requestedId)==='locked';
  return `${shell('path')}<div class="course-content mentor-path">
    <div class="eyebrow">BEGINNER · GUIDED PROJECT</div><h1>One section at a time.</h1>
    <p class="hero-description">Read a little. Try one thing. Explain it, then review it together.</p>
    <div class="mentor-flow-bar"><span>${esc(chapter.title)} · ${chapterIndex+1}.${sectionIndex+1}</span><span class="mentor-state ${entry.status}">${access==='reference'?'Earlier reference':esc(statusLabel(entry))}</span></div>
    ${lockedRequest?'<p class="mentor-lock-message" role="status">That section is locked. Finish the current prompt and its mentor review before continuing.</p>':''}
    ${flow.startReason?`<p class="mentor-resume-note">${esc(flow.startReason)}</p>`:''}
    ${previousFeedback?`<details class="mentor-feedback mentor-previous-feedback" open><summary>Mentor feedback for ${esc(previous.title)}</summary><p>${esc(previousFeedback.feedback)}</p><a href="#path/${esc(path.id)}/${esc(previous.id)}">View reviewed response</a></details>`:''}
    <article class="mentor-active-section" aria-labelledby="mentor-section-title" data-path-section="${section.id}">
      <div class="eyebrow">CHAPTER ${chapterIndex+1} · SECTION ${sectionIndex+1}</div><h2 id="mentor-section-title" tabindex="-1">${esc(section.title)}</h2>
      <p>${esc(section.explanation)}</p>
      ${section.readings?.length?`<div class="mentor-readings"><strong>READ THIS SECTION</strong>${section.readings.map(reference).join('')}<p class="mentor-stopping-point"><strong>Stopping point:</strong> ${esc(section.stoppingPoint || '')}</p></div>`:''}
      ${example(section.example)}
      ${(section.commands || []).map(([command,meaning])=>`<div class="mentor-command"><code>${esc(command)}</code><p>${esc(meaning)}</p></div>`).join('')}
      <div class="task-card mentor-prompt"><span class="eyebrow">YOUR PROMPT</span><p>${esc(section.prompt)}</p></div>
      ${(section.hints || []).map((hint,i)=>`<details class="mentor-hint"><summary>Hint ${i+1}</summary><p>${esc(hint)}</p></details>`).join('')}
      ${section.reveal||section.revealExample?`<details class="mentor-hint"><summary>Intentionally reveal an example after trying</summary>${section.reveal?`<p>${esc(section.reveal)}</p>`:''}${example(section.revealExample)}</details>`:''}
      ${access==='reference'?'<p class="subtle">This was before your saved resume point. It is available as reference and has no review awarded.</p>':`
        <section class="mentor-response" aria-labelledby="checkpoint-title"><div class="section-toolbar"><div><h3 id="checkpoint-title">Your response</h3><p id="checkpoint-saved-at">${checkpoint.updatedAt?'Last saved '+esc(new Date(checkpoint.updatedAt).toLocaleString()):'A draft saves locally as you type.'}</p></div><span id="save-state" role="status">${access==='reviewed'?'Reviewed response':frozen?'Response held for review':checkpoint.updatedAt?'Saved locally':'Ready for your response'}</span></div>
          <p class="mentor-field-help">Use one notes field for your answer, reading notes, and questions. You only need to write each idea once.</p>
          ${textArea('notes','Your learning notes',entry.notes,5000,5)}
          ${section.needsOutput||entry.output?textArea('output','Observed output — paste exactly what happened',entry.output,12000,6):''}
          ${editable?`<div class="mentor-actions"><button class="button primary" data-action="path-submit">Submit for mentor review</button><button class="button secondary light" data-action="save-checkpoint">Save draft</button></div><p class="mentor-field-help">Saving keeps your work. Submitting holds this response for review; the next section stays locked.</p>`:''}
        </section>`}
      ${renderSubmissionHistory(entry,esc)}
      ${entry.review?`<section class="mentor-feedback" aria-label="Mentor feedback" tabindex="-1"><div class="eyebrow">MENTOR FEEDBACK · ${entry.review.outcome==='advance'?'READY FOR THE NEXT SECTION':'REVISE THIS RESPONSE'}</div><p>${esc(entry.review.feedback)}</p><small>Reviewed ${esc(new Date(entry.review.reviewedAt).toLocaleString())}${entry.review.submissionId!==entry.submissionId?' · previous submission':''}</small></section>`:''}
      ${entry.status==='submitted'?`<div class="mentor-review-wait" role="status"><h3>Ready for us to review together.</h3><p>Your saved response is ready for review in the mentoring chat. With automatic notifications enabled, submitting queues a review request. If the mentor is busy, it waits until the current response finishes. Otherwise, ask your mentor to check this response. Feedback appears here automatically; approval opens the next section.</p><div class="mentor-actions"><button class="button secondary light" data-action="path-revise">Revise response</button></div></div>`:''}
      ${access==='reviewed'?next?`<a class="button primary" href="#path/beginner/${next.id}">Continue: ${esc(next.title)} →</a>`:'<p class="mentor-feedback">These first sections have been reviewed. Agree on the next small learning task with your mentor.</p>':''}
      ${access==='current'&&entry.status!=='submitted'?'<p class="mentor-gate-note"><span aria-hidden="true">◇</span> Next section locked until mentor review. Feedback can request a revision or unlock one next section.</p>':''}
    </article>
    <div class="mentor-actions mentor-utilities"><button class="button secondary light" data-action="path-refresh">Refresh learning record</button><a class="button secondary light" href="${path.handoffUrl}" data-action="mentor-handoff" download>Short mentor handoff ↓</a><a class="button secondary light" href="${path.briefUrl}" target="_blank" rel="noreferrer">Learning brief ↗</a></div>
    <details class="mentor-detail"><summary>${checkpoint.updatedAt?'Your earlier saved notes and checkpoint':'Starting context'}</summary><p>${checkpoint.updatedAt?'Preserved from before section gates. These notes do not award section reviews. You do not need to copy them into a new response.':'Initial context only. No learner evidence or section review has been recorded.'}</p><dl class="mentor-archive">${[
      ['currentExercise','Previous exercise'],['readingsRead','Your saved learning notes'],['learnerExplanation','Earlier practice response'],['observedOutput','Earlier observed output'],['readingsAssigned','Earlier assigned reading'],['mentorReview','Earlier review record'],['blockers','Earlier blockers'],['decisionNotes','Decision notes'],['nextAction','Earlier next action']
    ].filter(([key])=>checkpoint[key]).map(([key,label])=>`<dt>${label}</dt><dd>${esc(checkpoint[key])}</dd>`).join('')}</dl></details>
    <details class="mentor-detail"><summary>Purpose, vocabulary, and project boundaries</summary><p>${esc(path.learningGoal)}</p><code class="mentor-project-path">${esc(path.projectDirectory)}</code><p>${esc(path.observation)}</p><ol>${path.teachingContract.map(item=>`<li>${esc(item)}</li>`).join('')}</ol><dl class="mentor-vocabulary">${path.vocabulary.map(([term,meaning])=>`<dt>${esc(term)}</dt><dd>${esc(meaning)}</dd>`).join('')}</dl><p>You type commands and source in your own project. The Workshop records your responses; it does not execute these project commands. A reviewed section permits the next teaching step and does not establish mastery.</p></details>
    <details class="mentor-detail"><summary>Later roadmap and decision checkpoints</summary><ol>${path.roadmap.map(item=>`<li>${esc(item)}</li>`).join('')}</ol><p>Record proposals, alternatives, evidence, the mentor recommendation, and your actual choice when a decision becomes relevant. Existing Workshop lessons stay available from Curriculum as separate practice.</p></details>
  </div></main></div>`;
}
