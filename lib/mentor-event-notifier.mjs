import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const run=promisify(execFile);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function readJson(file,fallback){
  try{return JSON.parse(await readFile(file,'utf8'));}
  catch(error){if(error.code==='ENOENT')return fallback;throw error;}
}
async function saveJson(file,value){
  await mkdir(path.dirname(file),{recursive:true});
  const temporary=`${file}.${process.pid}.tmp`;
  await writeFile(temporary,JSON.stringify(value,null,2)+'\n','utf8');
  await rename(temporary,file);
}
export function submissionMessage(sectionId,submissionId){
  return `Stepwise Foundry submission ready for review.
Section: ${sectionId}
Submission ID: ${submissionId}
Follow docs/BEGINNER.md and run node scripts/review-beginner.mjs. Review only this pending ID; ignore handled or replaced submissions.`;
}

// Called only after an explicit submit has been persisted. No timers or model polling.
export function createSubmissionNotifier(directory,{execute=run}={}){
  const configFile=path.join(directory,'mentor-notification-config.json');
  const deliveryFile=path.join(directory,'mentor-notification-deliveries.json');
  let serial=Promise.resolve();
  async function deliver({sectionId,submissionId}){
    try{
      const config=await readJson(configFile,null);
      if(!config?.enabled)return {status:'disabled'};
      if(config.version!==1||!uuid.test(config.threadId)||!path.isAbsolute(config.command)||!Array.isArray(config.prefixArgs)||!config.prefixArgs.every(value=>typeof value==='string'))throw new Error('Invalid local notification configuration.');
      if(!/^[a-z0-9-]+$/.test(sectionId)||!uuid.test(submissionId))throw new Error('Invalid submitted response identity.');
      const receipts=await readJson(deliveryFile,{version:1,deliveries:{}});
      if(receipts.version!==1||!receipts.deliveries||typeof receipts.deliveries!=='object'||Array.isArray(receipts.deliveries))throw new Error('Invalid delivery receipts.');
      const previous=receipts.deliveries[submissionId];
      if(previous)return {status:previous.status==='queued'?'queued':'failed',duplicate:true};
      // Persist the attempt first. Never automatically retry an ambiguous delivery.
      const record={sectionId,status:'attempted',attemptedAt:new Date().toISOString()};
      receipts.deliveries[submissionId]=record;
      await saveJson(deliveryFile,receipts);
      try{
        await execute(config.command,[...config.prefixArgs,'queue','--thread',config.threadId,'--message',submissionMessage(sectionId,submissionId)],{cwd:path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),windowsHide:true,shell:false,timeout:15000,maxBuffer:65536});
        record.status='queued';
      }catch{
        // Do not echo CLI errors: the response is saved and the user can ask manually.
        record.status='failed';
      }
      await saveJson(deliveryFile,receipts);
      return {status:record.status};
    }catch{return {status:'failed'};}
  }
  return input=>{
    const task=serial.then(()=>deliver(input));
    serial=task.catch(()=>{});
    return task;
  };
}
