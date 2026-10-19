const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let token,items=[],selected,editor,code='',saveTimer,saving=Promise.resolve(),busy=false;
const status=message=>$('#revisit-status').textContent=message;
async function api(route,data){const response=await fetch('/api/'+route,data?{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token},body:JSON.stringify(data)}:{});const value=await response.json();if(!response.ok)throw new Error(value.error);return value;}
function saveSoon(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>save().catch(error=>status(error.message)),500);}
function save(){clearTimeout(saveTimer);if(!selected||busy)return saving;const input={id:selected.id,code,prediction:$('#revisit-prediction').value};saving=saving.catch(()=>{}).then(()=>api('revisit/draft',input));return saving;}
async function load(){items=(await api('revisit')).variants;$('#revisit-list').innerHTML=items.map(item=>'<article><h2>'+esc(item.title)+'</h2><p>'+esc(item.track==='rust'?'Rust':'Python')+' · after '+esc(item.days)+' day'+(item.days===1?'':'s')+' · '+esc(item.state.attempts.length)+' attempt(s)</p><p>'+(!item.dueAt?'Complete the original lesson first.':item.available?'Ready when you want to try.':'Available '+esc(new Date(item.dueAt).toLocaleString()))+'</p><a href="/#lesson/'+esc(item.origin)+'">Original lesson</a> <button class="button secondary" data-revisit="'+esc(item.id)+'" '+(item.available?'':'disabled')+'>Open changed task</button></article>').join('');}
async function open(id){
  await save();editor?.dispose();editor=null;selected=items.find(item=>item.id===id);if(!selected?.available)return;
  code=selected.state.draft?.code || selected.starter;
  $('#revisit-work').hidden=false;
  $('#revisit-work').innerHTML='<h2>'+esc(selected.title)+'</h2><p>'+esc(selected.task)+'</p><label for="revisit-prediction">'+esc(selected.predictionPrompt)+'</label><textarea id="revisit-prediction" rows="4" maxlength="5000">'+esc(selected.state.draft?.prediction || '')+'</textarea><label for="revisit-code">Your code</label><div id="revisit-editor" class="revisit-editor" hidden></div><textarea id="revisit-code" class="revisit-code" spellcheck="false" aria-label="Your revisit source code">'+esc(code)+'</textarea><label><input id="revisit-external" type="checkbox">I used help outside this revisit page for this attempt.</label><div class="mentor-actions"><button id="revisit-check" class="button primary">Save prediction and check code</button><button id="revisit-help" class="button secondary" '+(selected.state.attempts.some(attempt=>attempt.ok!==null)?'':'disabled')+'>Open help after trying</button></div><p>The prediction is saved before execution. Code assertions do not grade your explanation. Attempts are kept separately from course completion.</p><div id="revisit-outcome" role="status"></div><div id="revisit-support"></div><div id="revisit-attempts"></div>';
  $('#revisit-prediction').addEventListener('input',saveSoon);$('#revisit-code').addEventListener('input',event=>{code=event.target.value;saveSoon();});
  $('#revisit-check').addEventListener('click',()=>check().catch(error=>status(error.message)));
  $('#revisit-help').addEventListener('click',()=>help().catch(error=>status(error.message)));
  const item=selected;
  try{const ui=await import('/assets/editor/editor.js');if(selected!==item)return;$('#revisit-editor').hidden=false;editor=ui.createCodeEditor($('#revisit-editor'),{files:{[item.entryFile]:code},activeFile:item.entryFile,onChange:(_,value)=>{code=value;saveSoon();},onCheck:()=>check().catch(error=>status(error.message))});$('#revisit-code').hidden=true;}catch{status('Using the plain-text editor. Your code can still be checked.');}
  renderAttempts();$('#revisit-work').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderAttempts(){const attempts=selected.state.attempts;$('#revisit-attempts').innerHTML=attempts.length?'<h3>Saved attempts</h3>'+attempts.map((attempt,index)=>'<details><summary>Attempt '+(index+1)+' · '+esc(attempt.ok===null?'interrupted/pending':attempt.ok?'code passed':'code needs work')+' · '+(attempt.assisted?'with help':'without recorded help')+'</summary><p>'+esc(attempt.at)+'</p><h4>Prediction · not automatically graded</h4><pre>'+esc(attempt.prediction)+'</pre><h4>Submitted code</h4><pre>'+esc(attempt.code)+'</pre><h4>Check output</h4><pre>'+esc(attempt.output)+'</pre></details>').join(''):'';}
async function check(){
  if(busy||!selected)return;await save();busy=true;$('#revisit-work').inert=true;$('#revisit-work').setAttribute('aria-busy','true');$('#revisit-check').disabled=true;$('#revisit-help').disabled=true;
  try{
    status('Prediction and code are being saved before checking…');
    const result=await api('revisit/check',{id:selected.id,code,prediction:$('#revisit-prediction').value,externalHelp:$('#revisit-external').checked});
    selected.state=result.state;renderAttempts();await load();$('#revisit-help').disabled=false;
    $('#revisit-outcome').innerHTML='<h3>'+esc(result.ok?'Code checks passed.':'The code needs another attempt.')+'</h3><p>Compare the result with your saved prediction. A mentor can review the explanation in your exported report.</p><pre>'+esc(result.output)+'</pre>';
    status('Attempt saved. Course completion was not changed.');
  }finally{busy=false;$('#revisit-work').inert=false;$('#revisit-work').removeAttribute('aria-busy');$('#revisit-check').disabled=false;$('#revisit-help').disabled=!selected.state.attempts.some(attempt=>attempt.ok!==null);}
}
async function help(){await save();const result=await api('revisit/help',{id:selected.id});selected.state=result.state;$('#revisit-support').innerHTML='<h3>Help · later attempts will be recorded as assisted</h3><p>'+esc(result.hint)+'</p><p><a href="'+esc(result.reference[1])+'" target="_blank" rel="noreferrer">'+esc(result.reference[0])+'</a></p><h4>Worked example for this changed task</h4><pre>'+esc(result.solution)+'</pre>';}
$('#revisit-list').addEventListener('click',event=>{const button=event.target.closest('[data-revisit]');if(button&&!busy)open(button.dataset.revisit).catch(error=>status(error.message));});
document.addEventListener('click',event=>{if(event.target.closest('a')&&selected)save().catch(error=>status(error.message));});
window.addEventListener('beforeunload',()=>{if(selected&&!busy)fetch('/api/revisit/draft',{method:'POST',headers:{'Content-Type':'application/json','X-Workshop-Token':token},body:JSON.stringify({id:selected.id,code,prediction:$('#revisit-prediction').value}),keepalive:true}).catch(()=>{});});
try{({token}=await api('bootstrap'));await load();}catch(error){status(error.message);}
