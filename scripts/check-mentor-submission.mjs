// Manual readiness/acknowledgment helper. No timer, grading, or student writes.
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {beginnerPath,defaultCheckpoint} from '../curriculum/beginner-path.mjs';
import {pendingSubmission,acknowledgeSubmission} from '../lib/mentor-notifications.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=process.env.FOUNDRY_DATA_DIR || path.join(root,'.data');
const receiptPath=path.join(directory,'mentor-notifications.json');
const args=process.argv.slice(2);
if(args.length&&!(args.length===4&&args[0]==='--ack'&&args[2]==='--submission'))throw new Error('Use no arguments to check, or --ack SECTION_ID --submission SUBMISSION_ID after responding to it.');
let receipts={version:1,handled:{}};
try{
  receipts=JSON.parse(await readFile(receiptPath,'utf8'));
  if(receipts.version!==1||!receipts.handled||typeof receipts.handled!=='object'||Array.isArray(receipts.handled))throw new Error('Invalid mentor notification receipts.');
}catch(error){if(error.code!=='ENOENT')throw error;}
const response=await fetch(`http://127.0.0.1:${Number(process.env.PORT || 4173)}/api/bootstrap`,{signal:AbortSignal.timeout(5000)});
if(!response.ok)throw new Error('Cannot read the Workshop learning record.');
// Ignore the bootstrap token; it must not appear in the notification output.
const {progress}=await response.json(),checkpoint=progress.mentoring?.beginner || defaultCheckpoint();
if(args.length){
  receipts=acknowledgeSubmission(beginnerPath,checkpoint,receipts,args[1],args[3]);
  await mkdir(directory,{recursive:true});
  const temporary=`${receiptPath}.${process.pid}.tmp`;
  await writeFile(temporary,JSON.stringify(receipts,null,2)+'\n','utf8');
  await rename(temporary,receiptPath);
  console.log(JSON.stringify({status:'acknowledged',sectionId:args[1],submissionId:args[3]}));
}else console.log(JSON.stringify(pendingSubmission(beginnerPath,checkpoint,receipts),null,2));
