// Explicit, local opt-in. Never sends a test message or starts an agent.
import {readFile,writeFile,rename,mkdir,access} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=process.env.FOUNDRY_DATA_DIR || path.join(root,'.data');
const file=path.join(directory,'mentor-notification-config.json');
const run=promisify(execFile),args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i++){
  if(args[i]==='--disable'){options.disable=true;continue;}
  if(!['--thread','--codex'].includes(args[i])||!args[i+1])throw new Error('Use --thread CHAT_UUID [--codex ABSOLUTE_CLI_PATH], or --disable.');
  options[args[i].slice(2)]=args[++i];
}
let config;
if(options.disable){
  try{config=JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;config={version:1};}
  config.enabled=false;
}else{
  const threadId=options.thread || process.env.CODEX_THREAD_ID;
  if(!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(threadId || ''))throw new Error('Supply a verified --thread UUID, or run from a Codex tool environment with CODEX_THREAD_ID.');
  let command=options.codex;
  if(!command){
    try{command=(await run(process.platform==='win32'?'where.exe':'which',['codex'],{windowsHide:true,shell:false})).stdout.trim().split(/\r?\n/)[0];}
    catch{throw new Error('Codex was not found on PATH. Supply --codex with its absolute executable or official CLI JavaScript entry point.');}
  }
  if(!path.isAbsolute(command))throw new Error('--codex must be an absolute installed CLI path.');
  let prefixArgs=[];
  if(process.platform==='win32'&&/\.(?:cmd|ps1|bat)$/i.test(command)){
    const entry=path.join(path.dirname(command),'node_modules','@openai','codex','bin','codex.js');
    try{await access(entry);}catch{throw new Error('Use codex.exe or the official @openai/codex/bin/codex.js entry point; arbitrary shell wrappers are unsupported.');}
    prefixArgs=[entry];command=process.execPath;
  }else if(/\.(?:mjs|js)$/i.test(command)){prefixArgs=[command];command=process.execPath;}
  await run(command,[...prefixArgs,'queue','--help'],{windowsHide:true,shell:false,timeout:10000,maxBuffer:65536});
  config={version:1,enabled:true,threadId,command,prefixArgs};
}
await mkdir(directory,{recursive:true});await writeFile(file+'.tmp',JSON.stringify(config,null,2)+'\n','utf8');await rename(file+'.tmp',file);
console.log(config.enabled?'Submit notifications enabled for chat '+config.threadId+'. No test message was sent.':'Submit notifications disabled.');
