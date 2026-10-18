import {renderMentorPath,captureCheckpoint,renderMentorNav,selectedPathSection} from '/mentor-path.js';
const $ = (q, root=document) => root.querySelector(q);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let catalog, course, trackInfo, activeTrack='rust', progress, token, status={}, current, files={}, activeFile='', saveTimer, search='', filter='all', running=false, lastOutput='', lastResult=null;
let codeEditor=null, editorModule, activePath=null, activeSectionId=null, pathBusy=false;
const loadEditor=()=>editorModule ||= import('/assets/editor/editor.js');
const readCode=()=>codeEditor?codeEditor.getValue():$('#code')?.value;
function disposeEditor(){codeEditor?.dispose();codeEditor=null;}
async function mountWorkbench(){
  const host=$('#monaco-editor');
  try{
    const ui=await loadEditor();
    if(host?.isConnected&&host===$('#monaco-editor')){
      host.hidden=false;
      codeEditor=ui.createCodeEditor(host,{files,activeFile,
        onChange:(name,value)=>{files[name]=value;saveSoon();},
        onCursor:position=>{const label=$('#cursor-position');if(label)label.textContent=`Ln ${position.lineNumber}, Col ${position.column}`;},
        onCheck:()=>execute('check').catch(error=>toast(error.message)),
      });
      $('#code').hidden=true;$('#line-numbers').hidden=true;
      $('#editor-theme-label').textContent='Default dark';
    }
    await ui.highlightCodeBlocks();
  }catch(error){
    if(host?.isConnected&&host===$('#monaco-editor')){disposeEditor();host.hidden=true;$('#code').hidden=false;$('#line-numbers').hidden=false;$('#editor-theme-label').textContent='Plain-text editor';}
    console.error('Editor appearance could not load:',error);
    toast('The code editor is using its plain-text fallback. Run npm run build:editor and refresh to restore highlighting.');
  }
}
const recoveryKey='stepwise-foundry-recovery-v1';
const saveRoute=data=>data.pathId?(data.checkpoint?'checkpoint':'path/draft'):'save';
const stateFor=id=>progress.lessons[id] || {};
const completed=id=>!!stateFor(id).completedAt;
const moduleFor=id=>course.modules.find(m=>m.id===id);
const moduleLessons=id=>course.lessons.filter(l=>l.module===id);
const nextLesson=()=>course.lessons.find(l=>!completed(l.id)) || course.lessons[0];
function selectTrack(id) {
  const available=catalog.tracks || [{id:'rust',title:'Rust',version:'Edition 2024',description:'Learn Rust by writing Rust.',tagline:'From first principles to real systems',runtime:'rust',sourceKeys:Object.keys(catalog.sources)}];
  trackInfo=available.find(t=>t.id===id) || available[0];activeTrack=trackInfo.id;
  course={...catalog,modules:catalog.modules.filter(m=>(m.track || 'rust')===activeTrack),lessons:catalog.lessons.filter(l=>(l.track || 'rust')===activeTrack),sources:Object.fromEntries(Object.entries(catalog.sources).filter(([key])=>trackInfo.sourceKeys.includes(key)))};
  document.body.dataset.track=activeTrack;
  try{localStorage.setItem('workshop-active-track',activeTrack);}catch{}
}
function runtimeText(){
  if(activeTrack==='rust')return status.rustc?status.rustc.split(' (')[0]:'Rust toolchain';
  const runtime=activeTrack==='python'?status.python:status.ml;
  if(!runtime)return 'Checking runtime…';
  if(!runtime.available)return 'Runtime setup needed';
  if(activeTrack==='python')return 'Python '+runtime.version;
  return (activeTrack==='pytorch'?'PyTorch '+(runtime.packages.torch || 'missing'):'Transformers '+(runtime.packages.transformers || 'missing'))+' · Python '+runtime.version;
}
const resumeLesson=()=>course.lessons.find(l=>l.id===progress.lastLessons?.[activeTrack]) || course.lessons.find(l=>l.id===progress.lastLesson) || nextLesson();
const hasResume=()=>course.lessons.some(l=>progress.lessons[l.id]);
const starterFiles=lesson=>lesson.starterFiles || {[lesson.entryFile || 'main.rs']:lesson.starter};
const link=(url,title)=>`<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(title)} <span aria-hidden="true">↗</span></a>`;
async function api(route,data){
  const response=await fetch(`/api/${route}`,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token},body:JSON.stringify(data)});
  const result=await response.json();if(!response.ok)throw new Error(result.error || 'The local server could not complete that request.');return result;
}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),4500);}
function refreshProgressChrome(){const done=course.lessons.filter(l=>completed(l.id)).length;const label=$('.small-progress strong');if(label)label.textContent=`${done} / ${course.lessons.length}`;const bar=$('.sidebar-footer progress');if(bar)bar.value=done;}
function shell(view){
  const done=course.lessons.filter(l=>completed(l.id)).length;
  return `<aside class="sidebar"><a class="brand" href="#course"><span class="brand-mark ${activeTrack==='rust'?'':'wide'}">${esc(({rust:'R',python:'Py',pytorch:'T',huggingface:'HF'})[activeTrack])}<span>↗</span></span><span>Stepwise<br><strong>Foundry</strong></span></a>
    <label class="track-picker" for="track-select">LEARNING TRACK<select id="track-select" aria-label="Learning track">${(catalog.tracks || [trackInfo]).map(t=>`<option value="${t.id}" ${t.id===activeTrack?'selected':''}>${esc(t.id==='rust'?t.title:t.title+' · '+t.version)}</option>`).join('')}</select></label><div class="workspace-tag"><span class="status-dot"></span> YOUR LOCAL WORKSPACE</div>
    <nav aria-label="Main navigation"><a class="nav-link ${view==='course'?'active':''}" href="#course"><span aria-hidden="true">▦</span> Curriculum</a><a class="nav-link ${view==='progress'?'active':''}" href="#progress"><span aria-hidden="true">◴</span> My progress</a><a class="nav-link ${view==='library'?'active':''}" href="#library"><span aria-hidden="true">▤</span> Reference library</a>${catalog.learningPaths?.length?`<a class="nav-link ${view==='path'?'active':''}" href="#path/beginner"><span aria-hidden="true">◇</span> Rust beginner path</a>`:''}</nav>
    <div class="sidebar-heading">YOUR LEARNING PATH</div><nav class="chapter-nav" aria-label="Chapters">${view==='path'?renderMentorNav(activePath,progress.mentoring?.[activePath.id] || activePath.initialCheckpoint,activeSectionId,esc):course.modules.map((m,i)=>{const ls=moduleLessons(m.id);const n=ls.filter(l=>completed(l.id)).length;return `<a href="#module/${m.id}" class="chapter-link ${current?.module===m.id&&view==='lesson'?'selected':''}"><span class="chapter-number ${n===ls.length?'done':''}">${n===ls.length?'✓':String(i+1).padStart(2,'0')}</span><span>${esc(m.title)}</span></a>`;}).join('')}</nav>
    <div class="sidebar-footer"><div class="small-progress"><span>${view==='path'?'Rust exercise record':'Made it your own'}</span><strong>${done} / ${course.lessons.length}</strong></div><progress value="${done}" max="${course.lessons.length}" aria-label="Course completion"></progress><p>Saved here. Built to keep.</p><span class="open-source">MIT LICENSE · OPEN SOURCE</span></div></aside>
    <div class="page"><header class="topbar"><button class="mobile-menu icon-button" data-action="menu" aria-label="Toggle navigation">☰</button><span class="topbar-title">${view==='lesson'?esc(moduleFor(current.module).title):view==='course'?'The curriculum':view==='progress'?'Your learning record':view==='path'?'Rust beginner path':'The source material'}</span><div class="topbar-right"><span class="local-badge"><span class="status-dot"></span> Local environment</span><span class="toolchain" id="toolchain">${esc(runtimeText())}</span></div></header><main id="main" tabindex="-1">`;
}
function courseView(moduleId){
  const selected=moduleFor(moduleId);
  const projectPath=activeTrack==='rust'&&catalog.learningPaths?.find(p=>p.id==='beginner');
  const resume=resumeLesson();
  const done=course.lessons.filter(l=>completed(l.id)).length;
  const groups=selected?[selected]:course.modules;
  return `${shell('course')}<div class="course-content"><div class="eyebrow">${selected?esc(selected.stage):esc(trackInfo.tagline)}</div><div class="course-hero"><div><h1>${selected?esc(selected.title):'A little theory.<br>A lot of making.'}</h1><p class="hero-description">${selected?esc(selected.subtitle):esc(trackInfo.description)}</p></div><div class="hero-stamp" aria-hidden="true"><span>OWN YOUR</span><strong>CRAFT</strong><span>ONE PROGRAM AT A TIME</span></div></div>
    ${selected?`<div class="module-intro">${selected.intro.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`:`<div class="course-facts"><span><strong>${course.lessons.length}</strong> hands-on lessons</span><span><strong>${course.modules.length}</strong> focused chapters</span><span><strong>Real</strong> ${activeTrack==='rust'?'Rust compiler':'Python execution'}</span><span><strong>Yours.</strong> No account needed.</span></div><a class="resume-card" href="#lesson/${resume.id}"><div class="resume-icon" aria-hidden="true">&lt;/&gt;</div><div><div class="eyebrow">${hasResume()?'BACK TO YOUR WORKBENCH':'START AT THE BEGINNING'}</div><h2>${esc(resume.title)}</h2><p>${esc(moduleFor(resume.module).title)} · ${resume.minutes} min of focused practice</p></div><span class="button primary">${hasResume()?'Continue learning':'Open the first lesson'} <span aria-hidden="true">→</span></span></a>`}
    <div class="section-toolbar"><div><h2>${selected?'In this chapter':'Your path through '+esc(trackInfo.title)}</h2><p>${selected?'Read, try, check, and reflect. Every lesson is open.':`${done} lessons completed. Take the time you need.`}</p></div><label class="search"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Find a topic…" value="${esc(search)}" aria-label="Search lessons"></label></div>
    <div class="filter-bar" aria-label="Filter lessons"><button data-filter="all" class="${filter==='all'?'chosen':''}">All lessons</button><button data-filter="open" class="${filter==='open'?'chosen':''}">To explore</button><button data-filter="done" class="${filter==='done'?'chosen':''}">Completed</button>${selected?'<a href="#course">← All chapters</a>':''}</div>
    ${projectPath&&!selected?`<a class="project-path-link" href="#path/beginner"><span><strong>Rust beginner path</strong><small>Start from zero, keep a mentor checkpoint, and build toward your own project.</small></span><span aria-hidden="true">→</span></a>`:''}<div id="chapter-list">${renderChapters(groups)}</div><footer class="content-footer">A workbench for understanding, with no streaks, points, or rankings.</footer></div></main></div>`;
}
function renderChapters(groups){
  let count=0;
  const output=groups.map(m=>{
    const all=moduleLessons(m.id), index=course.modules.indexOf(m), n=all.filter(l=>completed(l.id)).length;
    const visible=all.filter(l=>(filter==='all'||(filter==='done'?completed(l.id):!completed(l.id)))&&`${m.title} ${l.title} ${l.task}`.toLowerCase().includes(search.toLowerCase()));
    if(!visible.length)return '';count+=visible.length;
    return `<section class="chapter-card"><div class="chapter-card-head"><span class="module-index">${String(index+1).padStart(2,'0')}</span><div><div class="eyebrow">${esc(m.stage)}</div><h3><a href="#module/${m.id}">${esc(m.title)}</a></h3><p>${esc(m.subtitle)}</p></div><div class="chapter-completion"><span>${n} / ${all.length}</span><progress value="${n}" max="${all.length}" aria-label="${esc(m.title)} completion"></progress></div></div><div class="lesson-list">${visible.map(l=>`<a href="#lesson/${l.id}" class="lesson-row"><span class="lesson-state ${completed(l.id)?'complete':''}" aria-label="${completed(l.id)?'Completed':'Not completed'}">${completed(l.id)?'✓':String(all.indexOf(l)+1).padStart(2,'0')}</span><span class="lesson-name">${esc(l.title)}${l.diagnostic?'<span class="tiny-tag">DEBUG</span>':''}</span><span class="lesson-kind">${l.kind==='lab'?'FIELD LAB':(l.kind==='cargo'||l.starterFiles)?'PROJECT':l.toolchain==='nightly'?'NIGHTLY':'PRACTICE'}</span><span class="lesson-time">${l.minutes} min</span><span class="row-arrow" aria-hidden="true">↗</span></a>`).join('')}</div></section>`;
  }).join('');
  return count?output:'<div class="empty-state"><h3>No matching lessons</h3><p>Try a broader topic or choose a different filter.</p></div>';
}
function codeView(){
  const module=moduleFor(current.module), index=moduleLessons(module.id).indexOf(current)+1, state=stateFor(current.id);
  return `${shell('lesson')}<div class="lesson-top"><a href="#module/${module.id}">← ${esc(module.title)}</a><span>LESSON ${index} OF ${moduleLessons(module.id).length} <span class="separator">/</span> ${current.minutes} MIN</span></div><div class="lesson-workspace ${current.kind==='lab'?'lab-workspace':''}"><article class="lesson-copy"><div class="eyebrow">${esc(module.stage)} · ${current.kind==='lab'?'FIELD LAB':current.diagnostic?'COMPILER CLINIC':'HANDS-ON PRACTICE'}</div><h1>${esc(current.title)}</h1><div class="lesson-meta"><span>${completed(current.id)?'✓ Completed':current.kind==='lab'?'Evidence-based checklist':(current.kind==='python'?'Checked with your local Python runtime':'Checked with your Rust toolchain')}</span>${current.toolchain==='nightly'?'<span class="tiny-tag">OPTIONAL NIGHTLY</span>':''}</div>
    <div class="reading">${current.explanation.map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="task-card"><span class="eyebrow">YOUR TASK</span><p>${esc(current.task)}</p></div>
    ${current.kind==='lab'?labContent(state):`<details class="checks-details" open><summary>What the checks verify</summary>${current.compileFail?`<p>The compiler must reject this program with ${esc(current.expectedError || 'the expected diagnostic')}.</p>`:current.expectedOutput!==undefined?`<pre><code>stdout: ${esc(JSON.stringify(current.expectedOutput))}</code></pre>`:`<pre data-code-file="${esc(current.entryFile || 'main.rs')}"><code>${esc(current.tests)}</code></pre>`}</details>`}
    <div class="help-section"><h2>When you need a hand</h2>${current.hints.map((h,i)=>`<details><summary>Hint ${i+1}</summary><p>${esc(h)}</p></details>`).join('')}</div>
    <div class="reference-card"><span class="eyebrow">GO TO THE SOURCE</span>${link(current.reference[1],current.reference[0])}<p>Read alongside the exercise. The documentation is part of your toolkit.</p></div>
    <details class="chapter-context"><summary>The bigger picture</summary>${module.intro.map(p=>`<p>${esc(p)}</p>`).join('')}</details><label class="notes-label" for="lesson-note">Notes for your future self</label><textarea id="lesson-note" class="notes" rows="4" placeholder="What clicked? What would you like to revisit?">${esc(state.note || '')}</textarea><p class="notes-help">Included in your mentor report.</p></article>
    ${current.kind==='lab'?'':editorContent()} </div><div class="lesson-bottom">${lessonNavigation()}</div></main></div>`;
}
function labContent(state){return `<div class="lab-checklist"><h2>In your own terminal</h2><p class="subtle">This is a self-reported lab. Checklist completion is tracked separately from automatically checked exercises.</p>${current.steps.map((step,i)=>`<label class="checklist-item"><input type="checkbox" data-step="${i}" ${state.checklist?.[i]?'checked':''}><span>${esc(step)}</span></label>`).join('')}<label class="notes-label" for="lab-evidence">Your evidence</label><textarea id="lab-evidence" class="notes" rows="7" placeholder="Paste relevant command output, paths, observations, and your explanation. At least 80 characters.">${esc(state.evidence || '')}</textarea><button class="button primary" data-action="finish-lab">Save lab completion <span aria-hidden="true">✓</span></button></div>`;}
function editorContent(){return `<section class="workbench" aria-label="Source code editor"><div class="editor-toolbar"><div><span class="status-dot"></span> ${current.kind==='cargo'?'Cargo project':current.kind==='python'?(activeTrack==='python'?'Python · 3.15':esc(trackInfo.title)+' · CPU'):'Rust'}</div><div class="editor-tools"><button data-action="format" title="Format source code">Format</button><button data-action="reset">Reset</button><span id="save-state" role="status">Saved locally</span></div></div><div class="file-tabs" role="tablist" aria-label="Exercise files">${Object.keys(files).map(name=>`<button role="tab" aria-selected="${name===activeFile}" data-file="${esc(name)}"><span aria-hidden="true">${name.endsWith('.rs')?'◈':'▤'}</span> ${esc(name)}</button>`).join('')}</div><div class="editor-area"><div id="monaco-editor" class="monaco-host" hidden></div><div id="line-numbers" aria-hidden="true"></div><textarea id="code" class="code-input" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="${esc(activeFile)} source code">${esc(files[activeFile])}</textarea></div><div class="editor-status"><span id="cursor-position">Ln 1, Col 1</span><span id="editor-theme-label">Loading editor…</span><span>UTF-8 <span class="separator">|</span> Spaces: 4</span></div><div class="run-bar"><button class="button secondary" data-action="run">${current.kind==='cargo'&&!files['src/main.rs']?'Build':'▷ Run'}</button><button class="button primary" data-action="check">Check code <span aria-hidden="true">→</span></button><span class="keyboard-hint">Ctrl + Enter to check</span></div><section class="terminal" aria-label="Program and test output"><div class="terminal-heading"><span>TERMINAL</span><span id="result-badge" class="result-badge">${lastResult===null?'READY':lastResult?'PASSED':'NEEDS ATTENTION'}</span></div><pre id="terminal-output" tabindex="0" aria-live="polite">${esc(lastOutput || (current.compileFail?'This lesson expects a compiler rejection. Use Check to verify the required diagnostic.':'Your program and check output will appear here.\n\nRun to explore. Check to verify the requirements.'))}</pre><div id="success-next"></div></section><div class="solution-row"><span>Stuck after trying the hints?</span><button data-action="solution">Read a worked solution ↗</button></div><p class="execution-note">Code runs locally with your user permissions. Run code you trust.</p></section>`;}
function lessonNavigation(){const i=course.lessons.indexOf(current),prev=course.lessons[i-1],next=course.lessons[i+1];return `<div>${prev?`<a href="#lesson/${prev.id}">← Previous lesson</a>`:''}</div><a href="#module/${current.module}">Chapter overview</a><div>${next?`<a href="#lesson/${next.id}">Next lesson →</a>`:'<a href="#progress">View your progress →</a>'}</div>`;}
function progressView(){
  const done=course.lessons.filter(l=>completed(l.id)), labs=done.filter(l=>l.kind==='lab').length, attempts=course.lessons.reduce((n,l)=>n+(stateFor(l.id).attempts?.length||0),0);
  return `${shell('progress')}<div class="course-content"><div class="eyebrow">A RECORD OF YOUR UNDERSTANDING</div><h1>Your work, kept.</h1><p class="hero-description">Your drafts, notes, and check results stay on this computer. Export a backup to keep them safe, or a mentor report to continue learning with help.</p><div class="stats-grid"><div><strong>${done.length-labs}</strong><span>code lessons checked</span></div><div><strong>${labs}</strong><span>self-reported labs</span></div><div><strong>${attempts}</strong><span>runs & checks recorded</span></div></div><div class="export-actions"><a class="button primary" href="/api/export" download>Export progress backup ↓</a><a class="button secondary light" href="/api/report" download>Export mentor report ↓</a><label class="button secondary light" for="import-file">Restore backup ↑</label><input type="file" id="import-file" accept=".json,application/json" hidden></div><p class="subtle">Backups contain all four tracks. Restore replaces the complete learning record and keeps the previous file as progress.previous.json. Imported completions retain their saved status.</p><div class="section-toolbar"><div><h2>Chapter by chapter</h2><p>Completion marks remain while you revisit and improve a draft.</p></div></div><div class="progress-list">${course.modules.map(m=>{const ls=moduleLessons(m.id),n=ls.filter(l=>completed(l.id)).length;return `<a href="#module/${m.id}"><div><span>${esc(m.title)}</span><small>${esc(m.stage)}</small></div><progress value="${n}" max="${ls.length}" aria-label="${esc(m.title)} completion"></progress><strong>${n} / ${ls.length}</strong></a>`;}).join('')}</div><div class="storage-note"><h2>Bring the right context to your next conversation</h2><p>The mentor report includes completed topics, your notes, current code, recent unsuccessful checks, and whether you opened a worked solution. Share it when you want help that starts where you are.</p><p>Learning data is stored in <code>.data/progress.json</code> inside this project, independently of browser storage. Back up that file or use the export above.</p></div></div></main></div>`;
}
function libraryView(){return `${shell('library')}<div class="course-content"><div class="eyebrow">LEARN TO READ THE PRIMARY SOURCES</div><h1>A map of the docs.</h1><p class="hero-description">${activeTrack==='rust'?'Start with the Rust Book. Reach for the Reference when you need a precise language rule, and the standard library when you need an API.':'Read the linked sections alongside each exercise. Library APIs and language versions have separate compatibility requirements; the runtime badge shows what executes your code.'}</p><div class="library-grid">${Object.entries(course.sources).map(([key,[title,url]])=>`<article class="library-card"><span class="eyebrow">${['unstable','nomicon','embedded','embedonomicon','fls','godbolt'].includes(key)?'ADVANCED READING':'YOUR EVERYDAY TOOLKIT'}</span><h2>${link(url,title)}</h2><p>${esc(sourceDescriptions[key] || 'Keep this primary source nearby while working through the associated lessons.')}</p><div class="source-modules">${course.modules.filter(m=>m.source===key).map(m=>`<a href="#module/${m.id}">${esc(m.title)} →</a>`).join('') || '<span>Linked throughout the course</span>'}</div></article>`).join('')}</div><div class="storage-note"><h2>What this curriculum covers</h2><p>${esc(trackInfo.description)} Chapters include automatically checked code and clearly labeled field labs. All exercises include comments and a relevant section link.</p><p>This is a broad guided curriculum, with links for deeper study; it does not reproduce every API or replace the primary documentation. Teaching text and exercises are original. Referenced documentation retains its own license.</p><p>Built-in exercises run locally after their runtimes are installed. Python uses 3.15; the PyTorch and Hugging Face tracks use a separate Python 3.14 environment for wheel compatibility. ML exercises use offline mode, tiny local models, and local data. Remote downloads, hardware, publishing, and larger training are field labs.</p></div></div></main></div>`;}
const sourceDescriptions={book:'The main learning spine: syntax, ownership, data modeling, errors, traits, concurrency, async, and larger projects.',cargo:'Project structure, manifests, features, workspaces, profiles, testing, packaging, and reproducible builds.',reference:'Precise descriptions of types, expressions, patterns, visibility, attributes, layout, and language rules.',std:'Types and APIs for collections, text, files, synchronization, time, processes, and more.',cli:'Build useful terminal programs with clear configuration, input handling, output, errors, and packaging.',rustc:'Compiler options, editions, diagnostics, lints, code generation, and target configuration.',rustdoc:'Documentation comments, runnable examples, intra-doc links, and documentation testing.',errors:'Search an error code when you want a focused explanation and a smaller example.',nomicon:'Unsafe contracts, representation, aliasing, variance, drop checking, FFI, and sound abstractions.',embedded:'no_std foundations, peripheral models, concurrency, communication, and hardware setup.',embedonomicon:'Startup, memory layout, runtime boundaries, linker scripts, and cross-compilation.',unstable:'Feature-gated experiments. Nightly behavior can change; check tracking issues before relying on a feature.',fls:'Ferrocene language specification and traceability documentation.',godbolt:'Compare emitted assembly and compiler options. Understand a measurement before optimizing it.'};
function route(){
  disposeEditor();
  const [view,id,requestedId]=location.hash.slice(1).split('/');
  const target=view==='lesson'?catalog.lessons.find(l=>l.id===id):view==='module'?catalog.modules.find(m=>m.id===id):null;
  selectTrack(view==='path'?'rust':target?.track || (view==='track'?id:activeTrack));
  current=undefined;activePath=null;activeSectionId=null;lastOutput='';lastResult=null;
  if(view==='path'){
    activePath=catalog.learningPaths?.find(p=>p.id===id);
    if(!activePath){toast('That learning path was not found.');location.hash='#course';return;}
    const checkpoint=progress.mentoring?.[id] || activePath.initialCheckpoint;
    activeSectionId=selectedPathSection(activePath,checkpoint,requestedId).id;
    $('#app').innerHTML=renderMentorPath({shell,path:activePath,checkpoint,esc,selectedId:activeSectionId,requestedId});
    const pathRoot=$('.mentor-path');
    if(pathRoot.querySelector('pre[data-code-file]'))loadEditor().then(ui=>{if(pathRoot.isConnected)return ui.highlightCodeBlocks(pathRoot);}).catch(error=>console.error('Path code highlighting:',error));
  }else if(view==='lesson'){
    current=course.lessons.find(l=>l.id===id);
    if(!current){toast('That lesson was not found.');location.hash='#course';return;}
    files={...(stateFor(id).files || starterFiles(current))};activeFile=Object.keys(files)[0];
    disposeEditor();$('#app').innerHTML=codeView();syncLines();mountWorkbench();saveSoon(false);
  }else $('#app').innerHTML=view==='progress'?progressView():view==='library'?libraryView():courseView(view==='module'?id:undefined);
  window.scrollTo(0,0);document.title=(activePath?activePath.title:current?current.title:trackInfo.title+' Workshop')+' — Stepwise Foundry';
}
function capture(){if(activePath)return captureCheckpoint();if(!current)return null;const note=$('#lesson-note')?.value || '';const data={id:current.id,note};if(current.kind==='lab'){data.evidence=$('#lab-evidence')?.value || '';data.checklist=[...document.querySelectorAll('[data-step]')].map(i=>i.checked);}else{if(readCode()!==undefined)files[activeFile]=readCode();data.files={...files};}return data;}
let pendingSave=null, saving=Promise.resolve();
function saveSoon(recover=true){const data=capture();if(!data)return;pendingSave=data;if(recover){try{localStorage.setItem(recoveryKey,JSON.stringify(data));}catch{}}if($('#save-state'))$('#save-state').textContent='Saving…';clearTimeout(saveTimer);saveTimer=setTimeout(()=>flushSave().catch(error=>toast(error.message)),500);}
async function flushSave(){clearTimeout(saveTimer);if(!pendingSave)return saving;const data=pendingSave;pendingSave=null;saving=saving.catch(()=>{}).then(async()=>{const result=await api(saveRoute(data),data);progress=result.progress;try{const saved=JSON.parse(localStorage.getItem(recoveryKey)||'null');if(saved?.id===data.id && JSON.stringify(saved)===JSON.stringify(data))localStorage.removeItem(recoveryKey);}catch{}if(((data.id&&current?.id===data.id)||(data.pathId&&activePath?.id===data.pathId))&&$('#save-state')){$('#save-state').textContent='Saved locally';const timestamp=progress.mentoring?.[data.pathId]?.updatedAt;if(timestamp&&$('#checkpoint-saved-at'))$('#checkpoint-saved-at').textContent='Last saved '+new Date(timestamp).toLocaleString();}});return saving;}
function syncLines(){const code=$('#code');if(!code)return;$('#line-numbers').textContent=Array.from({length:code.value.split('\n').length},(_,i)=>i+1).join('\n');cursor();}
async function pathAction(action){
  if(pathBusy||!activePath)return;
  const pathId=activePath.id,sectionId=activeSectionId;
  pathBusy=true;
  if(action==='path-submit')saveSoon();
  // Freeze the captured response while it is being submitted, including during autosave.
  document.querySelectorAll('[data-mentor-field]').forEach(input=>input.readOnly=true);
  document.querySelectorAll('[data-action="path-submit"],[data-action="path-revise"],[data-action="path-refresh"],[data-action="save-checkpoint"]').forEach(button=>button.disabled=true);
  try{
    await flushSave();
    if(action==='path-refresh'){
      const result=await api('bootstrap');progress=result.progress;token=result.token;
    }else{
      const result=await api(action==='path-submit'?'path/submit':'path/revise',{pathId,sectionId});progress=result.progress;
    }
    if(activePath?.id===pathId&&activeSectionId===sectionId){
      history.replaceState(null,'',`#path/${pathId}/${sectionId}`);route();
      $('#mentor-section-title')?.focus();
    }
    if(action==='path-submit')toast('Response submitted. Ask for review in this chat; the next section stays locked.');
  }catch(error){
    if(activePath?.id===pathId&&activeSectionId===sectionId){
      const pending=progress.mentoring?.[pathId]?.flow?.sections[sectionId]?.status==='submitted';
      document.querySelectorAll('[data-mentor-field]').forEach(input=>input.readOnly=pending);
      document.querySelectorAll('[data-action="path-submit"],[data-action="path-revise"],[data-action="path-refresh"],[data-action="save-checkpoint"]').forEach(button=>button.disabled=false);
    }
    throw error;
  }finally{pathBusy=false;}
}
function cursor(){const code=$('#code');if(!code)return;const before=code.value.slice(0,code.selectionStart),line=before.split('\n');$('#cursor-position').textContent=`Ln ${line.length}, Col ${line.at(-1).length+1}`;}
async function execute(mode){
  if(running)return;await flushSave();const lessonId=current.id;const submitted={...files};running=true;
  document.querySelectorAll('[data-action="run"],[data-action="check"],[data-action="format"]').forEach(b=>b.disabled=true);
  $('#terminal-output').textContent=mode==='format'?'Formatting source code…':'Running with your local '+(current.kind==='python'?'Python runtime…':'Rust toolchain…');$('#result-badge').textContent='RUNNING';$('#success-next').innerHTML='';
  try{
    const result=await api('execute',{id:lessonId,files:submitted,mode});if(result.progress)progress=result.progress;
    if(current?.id!==lessonId)return;
    if(mode==='format'&&result.ok){files=result.files;if(codeEditor)codeEditor.setFiles(files);else{$('#code').value=files[activeFile];syncLines();}saveSoon();}
    lastOutput=result.output || result.message || 'Done.';lastResult=result.ok;
    $('#terminal-output').textContent=lastOutput;$('#result-badge').textContent=result.blocked?'TOOLCHAIN REQUIRED':result.ok?(mode==='check'?'CHECKS PASSED':'DONE'):'NEEDS ATTENTION';$('#result-badge').className=`result-badge ${result.ok?'passed':'failed'}`;
    if(result.ok&&mode==='check'){
      const next=course.lessons[course.lessons.indexOf(current)+1];$('#success-next').innerHTML=`<div class="success-message"><strong>✓ Requirements met. Take a moment to explain why.</strong>${next?`<a href="#lesson/${next.id}">Continue to the next lesson →</a>`:'<a href="#progress">View your learning record →</a>'}</div>`;
    $('.lesson-meta span').textContent='✓ Completed';refreshProgressChrome();toast('Lesson completed and saved.');
    }
  }catch(error){if(current?.id===lessonId){$('#terminal-output').textContent=error.message;$('#result-badge').textContent='ERROR';}toast(error.message);}finally{running=false;document.querySelectorAll('[data-action="run"],[data-action="check"],[data-action="format"]').forEach(b=>b.disabled=false);}
}
async function showSolution(){const result=await api('solution',{id:current.id});progress=result.progress;const dialog=$('#solution-dialog');dialog.innerHTML=`<div class="dialog-head"><div><div class="eyebrow">READ, EXPLAIN, THEN TRY AGAIN</div><h2 id="solution-title">A worked solution</h2></div><button class="icon-button" data-action="close-dialog" aria-label="Close solution">×</button></div><p>This is one implementation. Reading it is recorded in your progress, and you still need to run your own checks.</p>${Object.entries(result.files).map(([name,code])=>`<h3>${esc(name)}</h3><pre data-code-file="${esc(name)}"><code>${esc(code)}</code></pre>`).join('')}<div class="task-card"><span class="eyebrow">EXPLAIN IT BACK</span><p>${esc(current.explanation[0])}</p><p>Trace each check through the implementation. Which line handles the boundary case? Close this window and write it again in your own words.</p></div><button class="button primary" data-action="close-dialog">Back to my code</button>`;dialog.showModal();loadEditor().then(ui=>ui.highlightCodeBlocks(dialog)).catch(error=>console.error(error));}
document.addEventListener('input',event=>{
  if(event.target.id==='search'){search=event.target.value;const [,id]=location.hash.slice(1).split('/');$('#chapter-list').innerHTML=renderChapters(location.hash.startsWith('#module/')&&moduleFor(id)?[moduleFor(id)]:course.modules);}
  if(event.target.matches('[data-mentor-field]'))saveSoon();
  if(['code','lesson-note','lab-evidence'].includes(event.target.id)){if(event.target.id==='code'){files[activeFile]=event.target.value;syncLines();}saveSoon();}
});
document.addEventListener('change',async event=>{
  if(event.target.matches('[data-step]'))saveSoon();
  if(event.target.id==='track-select'){try{await flushSave();search='';filter='all';document.body.classList.remove('menu-open');location.hash='#track/'+event.target.value;}catch(error){toast(error.message);}return;}
  if(event.target.id==='import-file'&&event.target.files[0]){
    try{await flushSave();const raw=await event.target.files[0].text();const data=JSON.parse(raw);if(!confirm('Restore this backup and replace your current learning record? The previous progress file will be kept locally.'))return;const result=await api('import',data);progress=result.progress;route();toast('Progress restored.');}catch(error){toast(`Could not restore backup: ${error.message}`);}
  }
});
document.addEventListener('click',async event=>{
  const nav=event.target.closest('a[href^="#"]');if(nav?.getAttribute('href')==='#main'){event.preventDefault();$('#main').focus();$('#main').scrollIntoView();return;}if(nav){event.preventDefault();try{await flushSave();location.hash=nav.getAttribute('href');if(location.hash===nav.getAttribute('href'))document.body.classList.remove('menu-open');}catch(error){toast(`Save failed: ${error.message}`);}return;}
  const file=event.target.closest('[data-file]');if(file){files[activeFile]=readCode();activeFile=file.dataset.file;$('.file-tabs').innerHTML=Object.keys(files).map(name=>`<button role="tab" aria-selected="${name===activeFile}" data-file="${esc(name)}">◈ ${esc(name)}</button>`).join('');$('#code').value=files[activeFile];$('#code').setAttribute('aria-label',`${activeFile} source code`);if(codeEditor)codeEditor.selectFile(activeFile);else syncLines();return;}
  const f=event.target.closest('[data-filter]');if(f){filter=f.dataset.filter;const position=window.scrollY;$('#app').innerHTML=courseView(location.hash.startsWith('#module/')?location.hash.split('/')[1]:undefined);window.scrollTo(0,position);return;}
  const action=event.target.closest('[data-action]')?.dataset.action;
  try{
    if(['run','check','format'].includes(action))await execute(action);
    if(action==='save-checkpoint'){saveSoon();await flushSave();toast('Draft saved. The next section still needs mentor review.');}
    if(['path-submit','path-revise','path-refresh'].includes(action))await pathAction(action);
    if(action==='mentor-handoff'){event.preventDefault();const url=activePath.handoffUrl;await flushSave();window.location.assign(url);}
    if(action==='menu')document.body.classList.toggle('menu-open');
    if(action==='solution')await showSolution();
    if(action==='close-dialog')$('#solution-dialog').close();
    if(action==='reset'&&confirm('Replace the current draft with the original starter? Your completion and notes will stay.')){await flushSave();files={...starterFiles(current)};activeFile=Object.keys(files)[0];disposeEditor();$('#app').innerHTML=codeView();syncLines();mountWorkbench();saveSoon();}
    if(action==='finish-lab'){await flushSave();const data=capture();const result=await api('lab',data);progress=result.progress;$('.lesson-meta span').textContent='✓ Completed (self-reported)';refreshProgressChrome();toast('Lab evidence and completion saved.');}
  }catch(error){toast(error.message);}
});
document.addEventListener('keydown',event=>{
  if(event.target.id==='code'&&event.key==='Tab'){event.preventDefault();const input=event.target;input.setRangeText('    ',input.selectionStart,input.selectionEnd,'end');files[activeFile]=input.value;syncLines();saveSoon();}
  if((event.ctrlKey||event.metaKey)&&event.key==='Enter'&&current?.kind!=='lab'&&current&&!event.target.closest('.monaco-editor')){event.preventDefault();execute('check').catch(error=>toast(error.message));}
});
document.addEventListener('keyup',event=>{if(event.target.id==='code')cursor();});
document.addEventListener('click',event=>{if(event.target.id==='code')cursor();});
document.addEventListener('scroll',event=>{if(event.target.id==='code')$('#line-numbers').scrollTop=event.target.scrollTop;},true);
window.addEventListener('hashchange',async()=>{try{await flushSave();route();}catch(error){toast(error.message);}});
window.addEventListener('beforeunload',()=>{if(pendingSave)fetch('/api/'+saveRoute(pendingSave),{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token},body:JSON.stringify(pendingSave),keepalive:true}).catch(()=>{});});
try{
  const data=await api('bootstrap');({token,curriculum:catalog,progress}=data);try{activeTrack=localStorage.getItem('workshop-active-track') || 'rust';}catch{}selectTrack(activeTrack);
  try{const recovery=JSON.parse(localStorage.getItem(recoveryKey)||'null');if(recovery&&(catalog.lessons.some(l=>l.id===recovery.id)||catalog.learningPaths?.some(p=>p.id===recovery.pathId))){const restored=await api(saveRoute(recovery),recovery);progress=restored.progress;localStorage.removeItem(recoveryKey);toast('Recovered your most recent unsaved draft.');}}catch(error){toast(`Draft recovery: ${error.message}`);}
  route();
  api('status').then(result=>{status=result;const badge=$('#toolchain');if(badge)badge.textContent=runtimeText();}).catch(error=>toast(error.message));
}catch(error){$('#app').innerHTML=`<main class="connection-error"><h1>The workbench could not open.</h1><p>${esc(error.message)}</p><p>Start the local server with npm start, then refresh this page.</p></main>`;}
