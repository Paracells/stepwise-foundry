import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { lessons, modules, lessonMap, publicCurriculum } from './curriculum/index.mjs';
import { runLesson, toolchainStatus, validateFiles } from './lib/runner.mjs';
import { ProgressStore, validateProgress, mentorReport } from './lib/progress.mjs';
import { beginnerPath, defaultCheckpoint, validateCheckpoint, checkpointReport } from './curriculum/beginner-path.mjs';
import {flowFor} from './public/mentor-flow.js';
import {updatePath} from './lib/mentoring.mjs';
import {createSubmissionNotifier} from './lib/mentor-event-notifier.mjs';
import {revisits,revisitMap,publicRevisit} from './curriculum/revisits.mjs';
import {revisitSchedule,requireRevisit,revisitEntry,startRevisit,finishRevisit,revisitHelp} from './lib/revisits.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT || 4173);
const store=new ProgressStore(process.env.FOUNDRY_DATA_DIR || path.join(root,'.data'),new Set(lessonMap.keys()));
const notifySubmission=createSubmissionNotifier(store.directory);
const mentorReviewClients=new Set();
const token=randomBytes(32).toString('hex');
// The learner page cannot approve its own submission. The local mentor helper
// reads this private key; it is never sent in bootstrap, reports, or exports.
await mkdir(store.directory,{recursive:true});
const mentorKeyFile=path.join(store.directory,'mentor-review.key');
try{await writeFile(mentorKeyFile,randomBytes(32).toString('hex'),{flag:'wx',mode:0o600});}catch(error){if(error.code!=='EEXIST')throw error;}
const mentorToken=(await readFile(mentorKeyFile,'utf8')).trim();
let busy=0; let cachedStatus;
const staticFiles = {'/revisit':['revisit.html','text/html; charset=utf-8'],'/revisit.js':['revisit.js','text/javascript; charset=utf-8'],'/revisit.css':['revisit.css','text/css; charset=utf-8'],'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/mentor-path.js':['mentor-path.js','text/javascript; charset=utf-8'],'/mentor-flow.js':['mentor-flow.js','text/javascript; charset=utf-8'],'/mentor-live.js':['mentor-live.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/editor-theme.css':['editor-theme.css','text/css; charset=utf-8'],'/favicon.svg':['favicon.svg','image/svg+xml']};
function json(res,status,data) {res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function body(req) {
  const parts=[];let size=0;
  for await(const part of req){size+=part.length;if(size>10_000_000)throw new Error('Request exceeds 10 MB.');parts.push(part);}
  try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw new Error('Request must contain valid JSON.');}
}
function record(data,id) {return data.lessons[id] ||= {note:'',attempts:[]};}
function visit(data,lesson){
  const lastLessons=data.lastLessons ||= {};
  const previous=lessonMap.get(data.lastLesson);
  if(previous&&!lastLessons[previous.track || 'rust'])lastLessons[previous.track || 'rust']=previous.id;
  data.lastLesson=lesson.id;lastLessons[lesson.track || 'rust']=lesson.id;
}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  // Monaco generates its theme styles and positions editor elements dynamically.
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; worker-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  const validHost=[`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host);
  if(!validHost) return json(res,403,{error:'This server accepts local requests only.'});
  const url=new URL(req.url,`http://127.0.0.1:${port}`);
  try {
    const asset=req.method==='GET'&&url.pathname.match(/^\/assets\/editor\/([a-zA-Z0-9_.-]+)$/);
    if(asset){
      const types={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
      const type=types[path.extname(asset[1])];if(!type)return json(res,404,{error:'Asset not found.'});
      let content;try{content=await readFile(path.join(root,'public','assets','editor',asset[1]));}catch(error){if(error.code==='ENOENT')return json(res,404,{error:'Build the editor assets with npm run build:editor.'});throw error;}
      res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'});return res.end(content);
    }
    if(req.method==='GET' && staticFiles[url.pathname]){
      const [file,type]=staticFiles[url.pathname];const content=await readFile(path.join(root,'public',file));res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'});return res.end(content);
    }
    if(req.method==='GET' && url.pathname==='/api/bootstrap')return json(res,200,{token,curriculum:publicCurriculum(),progress:await store.read()});
    if(req.method==='GET' && url.pathname==='/api/revisit'){
      const progress=await store.read();
      return json(res,200,{variants:revisits.map(item=>({...publicRevisit(item),...revisitSchedule(item,progress),state:progress.revisits[item.id] || {attempts:[]}}))});
    }
    if(req.method==='GET' && url.pathname==='/api/path/events'){
      if(req.headers.origin && ![`http://127.0.0.1:${port}`,`http://localhost:${port}`].includes(req.headers.origin))return json(res,403,{error:'Cross-origin requests are not accepted.'});
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive'});
      res.write('retry: 1500\nevent: ready\ndata: {}\n\n');
      mentorReviewClients.add(res);
      res.on('close',()=>mentorReviewClients.delete(res));
      return;
    }
    if(req.method==='GET' && url.pathname==='/api/status')return json(res,200,cachedStatus ||= await toolchainStatus());
    if(req.method==='GET' && url.pathname==='/api/beginner/brief'){
      const brief=await readFile(path.join(root,'docs','BEGINNER.md'),'utf8');
      res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});return res.end(brief);
    }
    if(req.method==='GET' && url.pathname==='/api/beginner/handoff'){
      const data=await store.read();const checkpoint=data.mentoring?.beginner || defaultCheckpoint();
      res.writeHead(200,{'Content-Type':'text/markdown; charset=utf-8','Content-Disposition':'attachment; filename="beginner-mentor-handoff.md"','Cache-Control':'no-store'});return res.end(checkpointReport(checkpoint));
    }
    if(req.method==='GET' && ['/api/export','/api/report'].includes(url.pathname)){
      const data=await store.read();const report=url.pathname.endsWith('report');res.writeHead(200,{'Content-Type':report?'text/markdown; charset=utf-8':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="stepwise-foundry-${report?'mentor-report.md':'progress.json'}"`,'Cache-Control':'no-store'});return res.end(report?mentorReport(data,lessons,modules):JSON.stringify(data,null,2));
    }
    if(req.method!=='POST')return json(res,404,{error:'Route not found.'});
    const mentorReview=url.pathname==='/api/path/review';
    if(mentorReview?req.headers['x-mentor-token']!==mentorToken:req.headers['x-workshop-token']!==token)return json(res,403,{error:mentorReview?'Mentor reviews must use the local review helper.':'Refresh this page to reconnect to the local server.'});
    if(req.headers.origin && ![`http://127.0.0.1:${port}`,`http://localhost:${port}`].includes(req.headers.origin))return json(res,403,{error:'Cross-origin requests are not accepted.'});
    if(req.headers['content-type']?.split(';')[0] !== 'application/json')return json(res,415,{error:'Expected application/json.'});
    const input=await body(req);
    if(url.pathname==='/api/import'){
      const clean=validateProgress(input,new Set(lessonMap.keys()));return json(res,200,{progress:await store.update(()=>clean)});
    }
    if(url.pathname==='/api/checkpoint'){
      if(input.pathId!=='beginner')return json(res,400,{error:'Unknown learning path.'});
      if(input.checkpoint?.flow!==undefined)return json(res,400,{error:'Section reviews cannot be changed by a checkpoint save.'});
      const checkpoint=validateCheckpoint(input.checkpoint);checkpoint.updatedAt=new Date().toISOString();
      const progress=await store.update(data=>{
        const previous=data.mentoring?.beginner || defaultCheckpoint();
        checkpoint.flow=flowFor(beginnerPath,previous);
        (data.mentoring ||= {}).beginner=checkpoint;
      });
      return json(res,200,{progress});
    }
    if(['/api/path/draft','/api/path/submit','/api/path/revise','/api/path/review'].includes(url.pathname)){
      const action=url.pathname.split('/').at(-1);
      const progress=await store.update(data=>updatePath(data,input,action));
      if(action==='review'){
        // Publish only after persistence, with identifiers rather than notes or credentials.
        const event={pathId:input.pathId,sectionId:input.sectionId,submissionId:input.submissionId,outcome:input.outcome};
        for(const client of mentorReviewClients)client.write(`event: review\ndata: ${JSON.stringify(event)}\n\n`);
      }
      if(action==='submit'){
        const entry=progress.mentoring.beginner.flow.sections[input.sectionId];
        const notification=await notifySubmission({sectionId:input.sectionId,submissionId:entry.submissionId});
        return json(res,200,{progress,notification});
      }
      return json(res,200,{progress});
    }
    if(['/api/revisit/draft','/api/revisit/check','/api/revisit/help'].includes(url.pathname)){
      const variant=revisitMap.get(input.id);if(!variant)return json(res,400,{error:'Unknown revisit.'});
      if(url.pathname.endsWith('/draft')){
        if(typeof input.code!=='string'||input.code.length>200000||typeof input.prediction!=='string'||input.prediction.length>5000)throw new Error('Invalid revisit draft.');
        await store.update(data=>{requireRevisit(variant,data);revisitEntry(data,input.id).draft={code:input.code,prediction:input.prediction};});
        return json(res,200,{saved:true});
      }
      if(url.pathname.endsWith('/help')){
        let help;const progress=await store.update(data=>{help=revisitHelp(variant,data);});
        return json(res,200,{...help,state:progress.revisits[input.id]});
      }
      if(busy>=2)return json(res,429,{error:'Two exercises are already running. Wait for one to finish.'});
      busy++;
      try{
        let attemptId;await store.update(data=>{attemptId=startRevisit(variant,data,input);});
        let result;
        try{result=await runLesson(variant,{[variant.entryFile]:input.code},'check');}
        catch(error){result={ok:false,output:error.message};}
        const progress=await store.update(data=>finishRevisit(data,input.id,attemptId,result));
        return json(res,200,{ok:result.ok,output:result.output,state:progress.revisits[input.id]});
      }finally{busy--;}
    }
    const lesson=lessonMap.get(input.id);if(!lesson)return json(res,400,{error:'Unknown lesson.'});
    if(url.pathname==='/api/save'){
      if(input.files)validateFiles(input.files);
      const progress=await store.update(data=>{const entry=record(data,lesson.id);if(input.files)entry.files=input.files;if(typeof input.note==='string')entry.note=input.note.slice(0,30000);if(typeof input.evidence==='string')entry.evidence=input.evidence.slice(0,30000);if(Array.isArray(input.checklist))entry.checklist=input.checklist.map(x=>x===true).slice(0,50);visit(data,lesson);});
      return json(res,200,{progress});
    }
    if(url.pathname==='/api/solution'){
      if(lesson.kind==='lab')return json(res,400,{error:'This lab uses your evidence notes instead of a code solution.'});
      const progress=await store.update(data=>{record(data,lesson.id).solutionViewedAt=new Date().toISOString();});
      return json(res,200,{files:lesson.solutionFiles || {[lesson.entryFile || 'main.rs']:lesson.solution},progress});
    }
    if(url.pathname==='/api/lab'){
      if(lesson.kind!=='lab')return json(res,400,{error:'Use code checks for this lesson.'});
      if(!Array.isArray(input.checklist) || input.checklist.length!==lesson.steps.length || !input.checklist.every(x=>x===true) || typeof input.evidence!=='string' || input.evidence.trim().length<80)return json(res,400,{error:'Complete every checklist item and write at least 80 characters of concrete evidence.'});
      const progress=await store.update(data=>{Object.assign(record(data,lesson.id),{checklist:input.checklist,evidence:input.evidence.slice(0,30000),completedAt:new Date().toISOString(),selfReported:true});visit(data,lesson);});
      return json(res,200,{progress});
    }
    if(url.pathname==='/api/execute'){
      if(busy>=2)return json(res,429,{error:'Two exercises are already running. Wait for one to finish.'});
      if(!['run','check','format'].includes(input.mode))return json(res,400,{error:'Unknown execution mode.'});
      validateFiles(input.files);busy++;
      try{
        // Save at submission time. A later draft or track visit must survive an older run finishing.
        if(input.mode!=='format')await store.update(data=>{record(data,lesson.id).files=input.files;visit(data,lesson);});
        const result=await runLesson(lesson,input.files,input.mode);
        if(input.mode==='format')return json(res,200,result);
        const progress=await store.update(data=>{const entry=record(data,lesson.id);entry.attempts.push({at:new Date().toISOString(),ok:result.ok,mode:input.mode,output:result.output.slice(-10000)});entry.attempts=entry.attempts.slice(-100);if(result.ok && input.mode==='check'){entry.firstCompletedAt ||= entry.completedAt || new Date().toISOString();entry.completedAt=new Date().toISOString();}});
        return json(res,200,{...result,progress});
      }finally{busy--;}
    }
    return json(res,404,{error:'Route not found.'});
  }catch(error){console.error(error.message);return json(res,400,{error:error.message});}
});
server.listen(port,'127.0.0.1',()=>console.log(`Stepwise Foundry is ready: http://127.0.0.1:${port}\nProgress: ${store.file}\nPress Ctrl+C to stop.`));
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is in use. Open the existing app or set PORT to another port.`:error.message);process.exitCode=1;});
