import * as monaco from 'monaco-editor/editor/editor.api.js';
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js';
import 'monaco-editor/editor/contrib/clipboard/browser/clipboard.js';
import 'monaco-editor/editor/contrib/comment/browser/comment.js';
import 'monaco-editor/editor/contrib/find/browser/findController.js';
import 'monaco-editor/editor/contrib/folding/browser/folding.js';
import 'monaco-editor/editor/contrib/linesOperations/browser/linesOperations.js';
import 'monaco-editor/editor/contrib/wordOperations/browser/wordOperations.js';
import {conf as rustConf,language as rustLanguage} from 'monaco-editor/languages/definitions/rust/rust.js';
import {conf as pythonConf,language as pythonLanguage} from 'monaco-editor/languages/definitions/python/python.js';
import {conf as iniConf,language as iniLanguage} from 'monaco-editor/languages/definitions/ini/ini.js';
import {conf as shellConf,language as shellLanguage} from 'monaco-editor/languages/definitions/shell/shell.js';
import {conf as psConf,language as psLanguage} from 'monaco-editor/languages/definitions/powershell/powershell.js';
import {conf as mdConf,language as mdLanguage} from 'monaco-editor/languages/definitions/markdown/markdown.js';
import {theme,fontFamily,languageForFile} from './theme.mjs';

globalThis.MonacoEnvironment={getWorker:()=>new Worker('/assets/editor/editor.worker.js',{type:'module',name:'workshop-editor'})};

// Keep the language grammars' string/comment states. Add the distinctions used by
// the theme where a lexical grammar can recognize them without a language server.
const rust={...rustLanguage,tokenizer:{...rustLanguage.tokenizer,root:[
  [/\/\/[!/].*$/,'comment.doc'],
  [/(fn)(\s+)([a-zA-Z_]\w*)/,['keyword','white','function.declaration']],
  [/(struct|enum|type|union)(\s+)([a-zA-Z_]\w*)/,['keyword','white','type.declaration']],
  [/(trait)(\s+)([a-zA-Z_]\w*)/,['keyword','white','type.trait']],
  [/\b(?:self|Self)\b/,'self'],
  [/\b(?:if|else|match|for|while|loop|return|break|continue|await|yield)\b/,'keyword.control'],
  [/\b(?:true|false|None|Some|Ok|Err)\b/,'constant'],
  [/'[a-zA-Z_]\w*\b(?!')/,'lifetime'],
  [/[a-zA-Z_]\w*!/,'macro'],
  [/#\!?(?=\[)/,'attribute'],
  [/\b[A-Z][A-Z_\d]+\b/,'constant'],
  [/[A-Z][a-zA-Z_\d]*\b/,'type'],
  [/[a-zA-Z_]\w*(?=\s*\()/,'function'],
  [/([a-zA-Z_]\w*)(\s*)(:)(?!:)/,['parameter','white','delimiter']],
  [/(\.)([a-zA-Z_]\w*)/,['delimiter','property']],
  ...rustLanguage.tokenizer.root,
]}};
const python={...pythonLanguage,tokenizer:{...pythonLanguage.tokenizer,root:[
  [/#.*$/,'comment'],
  [/(def)(\s+)([a-zA-Z_]\w*)/,['keyword','white','function.declaration']],
  [/(class)(\s+)([a-zA-Z_]\w*)/,['keyword','white','type.declaration']],
  [/\b(?:self|cls)\b/,'self'],
  [/\b(?:True|False|None)\b/,'constant'],
  [/\b(?:if|elif|else|for|while|return|break|continue|try|except|finally|raise|yield|await|match|case)\b/,'keyword.control'],
  [/\b(?:int|float|str|bool|bytes|list|dict|tuple|set|frozenset|object|type)\b/,'keyword.type'],
  [/[a-zA-Z_]\w*(?=\s*\()/,'function'],
  [/[A-Z][a-zA-Z_\d]*\b/,'type'],
  [/([a-zA-Z_]\w*)(\s*)(:)/,['parameter','white','delimiter']],
  [/(\.)([a-zA-Z_]\w*)/,['delimiter','property']],
  ...pythonLanguage.tokenizer.root,
]}};
const json={tokenizer:{root:[
  [/"([^"\\]|\\.)*"(?=\s*:)/,'string.key'],
  [/"/,'string','@string'],[/\b(?:true|false|null)\b/,'constant'],
  [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/,'number'],[/[{}\[\]]/,'@brackets'],[/[,:]/,'delimiter'],
],string:[[/[^\\"]+/,'string'],[/\\./,'string.escape'],[/"/,'string','@pop']]}};
for(const [id,conf,language] of [['rust',rustConf,rust],['python',pythonConf,python],['ini',iniConf,iniLanguage],['shell',shellConf,shellLanguage],['powershell',psConf,psLanguage],['markdown',mdConf,mdLanguage],['json',iniConf,json]]){
  monaco.languages.register({id});
  monaco.languages.setLanguageConfiguration(id,conf);
  monaco.languages.setMonarchTokensProvider(id,language);
}
monaco.editor.defineTheme('foundry',theme);
monaco.editor.setTheme('foundry');

export function createCodeEditor(container,{files,activeFile,onChange,onCursor,onCheck}){
  const models=new Map(),views=new Map();let changing=false;
  function modelFor(name){
    if(!models.has(name))models.set(name,monaco.editor.createModel(files[name],languageForFile(name)));
    return models.get(name);
  }
  const editor=monaco.editor.create(container,{
    model:modelFor(activeFile),theme:'foundry',fontFamily,fontSize:14,lineHeight:21,fontLigatures:false,
    automaticLayout:true,minimap:{enabled:false},scrollBeyondLastLine:false,wordWrap:'off',
    tabSize:4,insertSpaces:true,detectIndentation:false,renderWhitespace:'trailing',
    bracketPairColorization:{enabled:true},guides:{indentation:true,bracketPairs:true},
    cursorBlinking:'smooth',cursorSmoothCaretAnimation:'on',smoothScrolling:true,
    padding:{top:20,bottom:20},lineNumbersMinChars:3,folding:true,
    renderLineHighlight:'all',overviewRulerLanes:0,hideCursorInOverviewRuler:true,
    fixedOverflowWidgets:true,quickSuggestions:false,wordBasedSuggestions:'off',
    // The textarea input path also works consistently in embedded browsers and IMEs.
    editContext:false,stickyScroll:{enabled:false},accessibilitySupport:'auto',ariaLabel:activeFile+' source code',
  });
  const changes=editor.onDidChangeModelContent(()=>{if(!changing)onChange(activeFile,editor.getValue());});
  const cursor=editor.onDidChangeCursorPosition(event=>onCursor(event.position));
  const command=editor.addAction({id:'workshop.check',label:'Check exercise',keybindings:[monaco.KeyMod.CtrlCmd|monaco.KeyCode.Enter],run:onCheck});
  return {
    getValue:()=>editor.getValue(),
    setFiles(nextFiles){
      files=nextFiles;
      // Keep every file's model current and make formatting undoable per file.
      for(const [name,model] of models){
        if(model.getValue()===files[name])continue;
        model.pushStackElement();
        model.pushEditOperations([],[{range:model.getFullModelRange(),text:files[name]}],()=>null);
        model.pushStackElement();
      }
    },
    selectFile(name){
      views.set(activeFile,editor.saveViewState());changing=true;activeFile=name;
      editor.setModel(modelFor(name));changing=false;
      editor.updateOptions({ariaLabel:name+' source code'});
      if(views.has(name))editor.restoreViewState(views.get(name));
      editor.focus();
    },
    dispose(){changes.dispose();cursor.dispose();command.dispose();editor.dispose();for(const model of models.values())model.dispose();},
  };
}

export async function highlightCodeBlocks(root=document){
  await Promise.all([...root.querySelectorAll('pre[data-code-file]')].map(async pre=>{
    const code=pre.querySelector('code');if(!code)return;
    const source=code.textContent;
    const html=await monaco.editor.colorize(source,languageForFile(pre.dataset.codeFile),{tabSize:4});
    if(code.isConnected&&code.textContent===source){code.innerHTML=html;pre.classList.add('syntax-code','vs-dark');}
  }));
}
export {languageForFile};
