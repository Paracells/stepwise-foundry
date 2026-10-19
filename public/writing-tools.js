const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const filenames={rust:'pasted.rs',python:'pasted.py',toml:'pasted.toml',json:'pasted.json',bash:'pasted.sh',sh:'pasted.sh',powershell:'pasted.ps1',javascript:'pasted.js',js:'pasted.js',typescript:'pasted.ts',text:'pasted.txt'};

export function detectCodeLanguage(value){
  const text=value.trim();
  if(!text||/```|~~~/.test(text)||/^(?:PS [^\n]*>|error\[|warning:|\s*(?:Compiling|Finished|Running)\s)/m.test(text))return null;
  const first=text.split('\n').find(line=>line.trim()&&!/^\s*(?:\/\/|#(?!\[))/.test(line))?.trim() || '';
  if(/^(?:(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+\w+\s*\(|(?:pub\s+)?(?:struct|enum|impl|trait)\s+\w+|use\s+[\w:]+.*;|let\s+(?:mut\s+)?\w+\s*(?::[^=]+)?=.*;|(?:println|print|eprintln|assert_eq)!\s*\(|(?:if|while|for|match)\s+.+\{|[a-zA-Z_]\w*(?:::\w+)*\s*\([^;\n]*\)\s*;\s*$)/u.test(first))return 'rust';
  if(/^(?:(?:async\s+)?def\s+\w+\s*\(|class\s+\w+.*:|from\s+[\w.]+\s+import\s+|import\s+[\w.]+|print\s*\([^\n]*\)\s*$)/u.test(first))return 'python';
  if(/^\[(?:package|dependencies|dev-dependencies|build-dependencies|workspace|project|tool\.[\w.-]+)\]/.test(first)&&/^\s*[\w.-]+\s*=/m.test(text))return 'toml';
  if(/^(?:const|let|var)\s+\w+\s*=|^(?:export\s+)?(?:async\s+)?function\s+\w+\s*\(/.test(first)&&/[;{}]/.test(text))return 'javascript';
  if(/^[{[]/.test(text)){try{const parsed=JSON.parse(text);if(parsed&&typeof parsed==='object')return 'json';}catch{}}
  return null;
}

export function codePaste(value){
  const text=value.replace(/\r\n?/g,'\n'),language=detectCodeLanguage(text);
  if(!language)return null;
  return '```'+language+'\n'+text.replace(/\n+$/,'')+'\n```';
}

export function renderNoteText(value){
  const text=String(value || '').replace(/\r\n?/g,'\n');
  const recognized=detectCodeLanguage(text);
  const block=(code,language)=>{language ||= detectCodeLanguage(code);return '<pre data-code-file="'+(Object.hasOwn(filenames,language)?filenames[language]:'pasted.txt')+'"><code>'+escapeHtml(code)+'</code></pre>';};
  if(recognized)return block(text,recognized);
  const fence=/^(`{3,}|~{3,})([\w+-]*)[ \t]*\n([\s\S]*?)^\1[ \t]*(?=\n|$)/gm;
  let html='',offset=0;
  for(const match of text.matchAll(fence)){
    if(match.index>offset)html+='<p class="note-text">'+escapeHtml(text.slice(offset,match.index))+'</p>';
    html+=block(match[3],match[2]);offset=match.index+match[0].length;
  }
  if(offset<text.length)html+='<p class="note-text">'+escapeHtml(text.slice(offset))+'</p>';
  return html;
}

// Keep the selected text intact while indenting/outdenting all selected lines.
export function indentationEdit(value,start,end,outdent=false){
  if(start===end&&!outdent)return {start,end,text:'    ',selectionStart:start+4,selectionEnd:end+4};
  const from=value.lastIndexOf('\n',start-1)+1;
  const selectedEnd=end>start&&value[end-1]==='\n'?end-1:end;
  const lineEnd=value.indexOf('\n',selectedEnd),to=lineEnd<0?value.length:lineEnd;
  const lines=value.slice(from,to).split('\n');let position=from;const changes=[];
  const text=lines.map(line=>{
    const removed=outdent?(line.startsWith('\t')?1:line.match(/^ {0,4}/)[0].length):0;
    changes.push({position,removed,added:outdent?0:4});position+=line.length+1;
    return outdent?line.slice(removed):'    '+line;
  }).join('\n');
  function mapped(index){let delta=0;for(const change of changes){if(index<change.position)break;if(index<change.position+change.removed)return change.position+delta+change.added;delta+=change.added-change.removed;}return index+delta;}
  return {start:from,end:to,text,selectionStart:mapped(start),selectionEnd:mapped(end)};
}

const areas='textarea[data-mentor-field],textarea[data-checkpoint-field],textarea.notes,#code,#revisit-code,#revisit-prediction';
const noteAreas='textarea[data-mentor-field="notes"],#lesson-note,#revisit-prediction';
export function installWritingTools(root=document){
  const doc=root.ownerDocument || root;let escapeTarget=null,sequence=0,editorModule;
  function insert(area,edit){
    const expected=area.value.slice(0,edit.start)+edit.text+area.value.slice(edit.end);
    if(area.maxLength>=0&&expected.length>area.maxLength)return;
    let inputSent=false;const mark=()=>{inputSent=true;};area.addEventListener('input',mark);
    area.setSelectionRange(edit.start,edit.end);
    // Native insertion preserves the browser's undo stack where supported.
    try{doc.execCommand('insertText',false,edit.text);}catch{}
    if(area.value!==expected)area.setRangeText(edit.text,edit.start,edit.end,'end');
    area.removeEventListener('input',mark);
    area.setSelectionRange(edit.selectionStart,edit.selectionEnd);
    if(!inputSent)area.dispatchEvent(new Event('input',{bubbles:true}));
  }
  function enhance(){for(const area of root.querySelectorAll(areas)){
    if(area.dataset.writingReady)return;area.dataset.writingReady='true';
    // Keep the fallback editor's layout untouched when Monaco takes over.
    if(area.id==='code'||area.id==='revisit-code')continue;
    if(!area.readOnly&&!area.disabled){
      const help=doc.createElement('p');help.className='writing-help';help.id='writing-help-'+(++sequence);
      help.textContent='Tab indents · Shift+Tab outdents · Esc then Tab moves to the next field.';
      (area.closest('label.mentor-field') || area).after(help);area.setAttribute('aria-describedby',[area.getAttribute('aria-describedby'),help.id].filter(Boolean).join(' '));
    }
    if(area.matches(noteAreas)){
      const preview=doc.createElement('div');preview.className='writing-preview';preview.setAttribute('aria-label','Formatted code preview');(area.closest('label.mentor-field') || area).after(preview);let timer;const proseSpellcheck=area.spellcheck;
      function update(){
        const html=renderNoteText(area.value);preview.hidden=!html.includes('<pre ');area.spellcheck=preview.hidden?proseSpellcheck:false;
        preview.innerHTML=preview.hidden?'':'<div class="eyebrow">CODE PREVIEW</div><div class="writing-content">'+html+'</div>';
        if(!preview.hidden)(editorModule ||= import('/assets/editor/editor.js')).then(ui=>{if(preview.isConnected)return ui.highlightCodeBlocks(preview);}).catch(()=>{});
      }
      area.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(update,180);});update();
    }
  }}
  doc.addEventListener('keydown',event=>{
    const area=event.target;if(!area.matches?.(areas)||area.readOnly||area.disabled)return;
    if(event.key==='Escape'){escapeTarget=area;return;}
    if(event.key==='Tab'&&!event.ctrlKey&&!event.altKey&&!event.metaKey){
      if(escapeTarget===area){escapeTarget=null;return;}
      event.preventDefault();insert(area,indentationEdit(area.value,area.selectionStart,area.selectionEnd,event.shiftKey));
    }else if(event.key!=='Shift')escapeTarget=null;
  });
  doc.addEventListener('focusout',()=>{escapeTarget=null;});
  doc.addEventListener('paste',event=>{
    const area=event.target;if(!area.matches?.(noteAreas)||area.readOnly||area.disabled)return;
    // A paste inside an existing code fence must remain literal source text.
    if((area.value.slice(0,area.selectionStart).match(/^\s*(?:`{3,}|~{3,})/gm)?.length || 0)%2)return;
    const formatted=codePaste(event.clipboardData?.getData('text/plain') || '');if(!formatted)return;
    const before=area.selectionStart&&area.value[area.selectionStart-1]!=='\n'?'\n\n':'';
    const after=area.selectionEnd<area.value.length&&area.value[area.selectionEnd]!=='\n'?'\n\n':'';
    const text=before+formatted+after,start=area.selectionStart,end=area.selectionEnd;
    if(area.maxLength>=0&&area.value.length-(end-start)+text.length>area.maxLength)return;
    event.preventDefault();insert(area,{start,end,text,selectionStart:start+text.length,selectionEnd:start+text.length});
  });
  enhance();new MutationObserver(enhance).observe(root,{childList:true,subtree:true});
}
