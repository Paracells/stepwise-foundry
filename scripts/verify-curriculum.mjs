import { lessons, modules } from '../curriculum/index.mjs';
import { runLesson, toolchainStatus } from '../lib/runner.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
const args=process.argv.slice(2);
const includeStarters=args.includes('--starters');
const selected=args.find(a=>a.startsWith('--module='))?.split('=')[1];
const track=args.find(a=>a.startsWith('--track='))?.split('=')[1];
const status=await toolchainStatus();
console.log(`${lessons.length} lessons across ${modules.length} chapters. ${status.rustc || 'Rust missing'}`);
const results=[];
for(const lesson of lessons.filter(l=>(!selected || l.module===selected)&&(!track || l.track===track))){
  if(lesson.kind==='lab'){results.push({id:lesson.id,status:'manual-lab'});continue;}
  if(lesson.toolchain==='nightly'&&!status.nightly){results.push({id:lesson.id,status:'needs-nightly'});console.log(`SKIP ${lesson.id}: optional nightly toolchain not installed`);continue;}
  const result=await runLesson(lesson,lesson.solutionFiles || {[lesson.entryFile || 'main.rs']:lesson.solution},'check');
  let starterOk=true;
  if(includeStarters&&result.ok){
    const starter=await runLesson(lesson,lesson.starterFiles || {[lesson.entryFile || 'main.rs']:lesson.starter},'check');
    starterOk=!starter.ok;
  }
  const ok=result.ok&&starterOk;
  results.push({id:lesson.id,status:ok?'pass':'fail',solutionPass:result.ok,starterRejected:includeStarters?starterOk:undefined,...(!ok?{output:result.output}:{} )});
  console.log(`${ok?'PASS':'FAIL'} ${lesson.id}${!starterOk?' (starter already passes)':''}`);
  if(!result.ok)console.log(result.output);
}
await mkdir('test-results',{recursive:true});
await writeFile(`test-results/curriculum${track?'-'+track:selected?'-'+selected:''}.json`,JSON.stringify({at:new Date().toISOString(),toolchain:status,checkedStarters:includeStarters,results},null,2));
const failed=results.filter(r=>r.status==='fail');
console.log(`\n${results.filter(r=>r.status==='pass').length} passed; ${failed.length} failed; ${results.filter(r=>r.status==='manual-lab').length} manual labs; ${results.filter(r=>r.status==='needs-nightly').length} need nightly.`);
if(failed.length)process.exitCode=1;
