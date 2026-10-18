import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export async function pythonRuntimes(execute) {
  let config={};try{config=JSON.parse(await readFile(path.join(root,'.runtime','runtimes.json'),'utf8'));}catch{}
  const python=process.env.WORKSHOP_PYTHON || config.python || (process.platform==='win32'?'python':'python3');
  const ml=process.env.WORKSHOP_ML_PYTHON || config.ml;
  const inspect=async(command,packages)=>{
    if(!command)return {available:false,version:null,packages:{}};
    const code=`import sys,json,importlib.metadata as m\np={}\nfor name in ${JSON.stringify(packages)}:\n try: p[name]=m.version(name)\n except m.PackageNotFoundError: p[name]=None\nprint(json.dumps({'version':sys.version.split()[0],'packages':p}))`;
    const result=await execute(command,['-I','-c',code],{timeout:10000});
    try{return {available:true,...JSON.parse(result.stdout),command};}catch{return {available:false,version:null,packages:{},command};}
  };
  const [pythonInfo,mlInfo]=await Promise.all([inspect(python,['ruff']),inspect(ml,['torch','transformers','datasets','tokenizers','huggingface-hub','safetensors','peft','accelerate'])]);
  return {python:pythonInfo,ml:mlInfo};
}
export async function runPythonLesson(lesson,files,mode,execute) {
  const runtimes=await pythonRuntimes(execute);
  const runtime=lesson.runtime==='ml'?runtimes.ml:runtimes.python;
  const finish=(ok,output,extra={})=>({ok,mode,output,...extra});
  if(!runtime.available)return finish(false,'The private Python runtime is not installed. From the project directory run:\npython scripts/setup-python.py\nThen restart the app.',{blocked:true});
  if(lesson.runtime!=='ml' && !runtime.version.startsWith('3.15.'))return finish(false,`Python 3.15 is required for this track; found ${runtime.version}. Run python scripts/setup-python.py to create the private 3.15 runtime.`,{blocked:true});
  for(const dependency of lesson.dependencies || [])if(!runtime.packages[dependency])return finish(false,`Missing ${dependency} in the ML environment. Run python scripts/setup-python.py and restart the app.`,{blocked:true});
  const dir=await mkdtemp(path.join(tmpdir(),'workshop-python-'));
  const logs=[];
  const step=async(command,args,timeout=45000)=>{
    const display=path.basename(command);logs.push(`$ ${display} ${args.map(s=>s.startsWith(dir)?path.relative(dir,s):s).join(' ')}`);
    const result=await execute(command,args,{cwd:dir,timeout,env:{OMP_NUM_THREADS:'1',MKL_NUM_THREADS:'1',TOKENIZERS_PARALLELISM:'false',HF_HUB_OFFLINE:'1',HF_DATASETS_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1',HF_HOME:path.join(dir,'hf-cache'),PYTHONUTF8:'1'}});
    logs.push(result.stdout,result.stderr);
    if(result.timedOut)logs.push('Stopped: time limit reached. Check loops, blocking operations, or training size.');
    if(result.overflow)logs.push('Stopped: output limit reached.');
    return result;
  };
  const output=()=>logs.filter(Boolean).join('\n').replaceAll(dir,'<exercise>');
  try{
    for(const [name,content] of Object.entries(files)){const target=path.join(dir,name);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,content);}
    if(mode==='format'){
      const formatter=runtimes.python;
      if(!formatter.packages.ruff)return finish(false,'Ruff is missing. Run python scripts/setup-python.py --python-only.',{blocked:true});
      const result=await step(formatter.command,['-I','-m','ruff','format',...Object.keys(files).filter(name=>name.endsWith('.py'))],15000);
      if(result.code!==0)return finish(false,output());
      const formatted=Object.fromEntries(await Promise.all(Object.keys(files).map(async name=>[name,await readFile(path.join(dir,name),'utf8')])));
      return finish(true,output(),{files:formatted});
    }
    const entry=lesson.entryFile || 'main.py';
    if(typeof files[entry]!=='string')throw new Error(`This exercise requires ${entry}.`);
    const preamble=`import sys, runpy, unittest\nsys.path.insert(0, ${JSON.stringify(dir)})\n`;
    let code=preamble;
    if(mode==='run'||lesson.expectedOutput!==undefined){code+=`runpy.run_path(${JSON.stringify(path.join(dir,entry))}, run_name="__main__")\n`;}
    else{
      code+=`namespace=runpy.run_path(${JSON.stringify(path.join(dir,entry))},run_name="lesson")\nnamespace['check']=unittest.TestCase()\n`;
      const checks='def __workshop_behavior():\n'+lesson.tests.split('\n').map(s=>'    '+s).join('\n')+'\n';
      code+=`exec(compile(${JSON.stringify(checks)}, "<required checks>", "exec"),namespace)\nsuite=unittest.TestSuite([unittest.FunctionTestCase(namespace['__workshop_behavior'])])\nresult=unittest.TextTestRunner(verbosity=2).run(suite)\nsys.exit(0 if result.wasSuccessful() else 1)\n`;
    }
    await writeFile(path.join(dir,'__workshop_runner.py'),code);
    const result=await step(runtime.command,['-I','-u',path.join(dir,'__workshop_runner.py')],lesson.timeout || (lesson.runtime==='ml'?60000:12000));
    let ok=result.code===0 && !result.timedOut && !result.overflow;
    if(mode==='check' && lesson.expectedOutput!==undefined){ok &&= result.stdout.replaceAll('\r\n','\n')===lesson.expectedOutput;if(!ok)logs.push('Expected stdout: '+JSON.stringify(lesson.expectedOutput));}
    if(mode==='run' && !result.stdout && ok)logs.push('Program finished without stdout. Use Check to run the required examples.');
    return finish(ok,output());
  }finally{await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:150});}
}
