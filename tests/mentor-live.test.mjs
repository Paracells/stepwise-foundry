import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {mentorReviewUpdate} from '../public/mentor-live.js';
import {renderMentorPath} from '../public/mentor-path.js';
import {beginnerPath,defaultCheckpoint} from '../curriculum/beginner-path.mjs';

const learningPath={chapters:[{sections:[{id:'first'},{id:'second'},{id:'third'}]}]};
const checkpoint=entry=>({flow:{version:1,startSection:'first',sections:{first:entry}}});
const submitted={status:'submitted',submissionId:'response-1',notes:'Keep my notes.',output:'Keep my output.'};
const reviewed=(outcome='advance')=>({...submitted,status:outcome==='advance'?'reviewed':'revise',review:{outcome,submissionId:'response-1',feedback:'Mentor feedback.'}});

test('a new approval advances exactly the viewed pending response; a revision stays on it',()=>{
  assert.deepEqual(mentorReviewUpdate(learningPath,checkpoint(submitted),checkpoint(reviewed()),'first'),{outcome:'advance',sectionId:'second'});
  assert.deepEqual(mentorReviewUpdate(learningPath,checkpoint(submitted),checkpoint(reviewed('revise')),'first'),{outcome:'revise',sectionId:'first'});
  const last={chapters:[{sections:[{id:'first'}]}]};
  assert.deepEqual(mentorReviewUpdate(last,checkpoint(submitted),checkpoint(reviewed()),'first'),{outcome:'advance',sectionId:'first'});
});

test('live review navigation ignores drafts, replacements, old feedback, and repeat approvals',()=>{
  assert.equal(mentorReviewUpdate(learningPath,checkpoint({...submitted,status:'draft'}),checkpoint(reviewed()),'first'),null);
  assert.equal(mentorReviewUpdate(learningPath,checkpoint(submitted),checkpoint({...reviewed(),submissionId:'response-2'}),'first'),null);
  assert.equal(mentorReviewUpdate(learningPath,checkpoint(submitted),checkpoint({...reviewed(),review:{...reviewed().review,submissionId:'older-response'}}),'first'),null);
  assert.equal(mentorReviewUpdate(learningPath,checkpoint(reviewed()),checkpoint(reviewed()),'first'),null);
  assert.equal(mentorReviewUpdate(learningPath,checkpoint(submitted),checkpoint(reviewed()),'second'),null);
  assert.equal(mentorReviewUpdate(learningPath,checkpoint(submitted),checkpoint({...reviewed(),status:'submitted'}),'first'),null);
});

test('the next section keeps the preceding feedback visible and escapes it',()=>{
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const previous={...reviewed(),review:{...reviewed().review,feedback:'Read <this> before continuing.'}};
  const state={...defaultCheckpoint(),flow:{version:1,startSection:'location',sections:{location:previous}}};
  const html=renderMentorPath({shell:()=>'',path:beginnerPath,checkpoint:state,esc,selectedId:'location-transfer'});
  assert.match(html,/mentor-previous-feedback" open/);
  assert.match(html,/Read &lt;this&gt; before continuing\./);
  assert.doesNotMatch(html,/Read <this>/);
  assert.match(html,/href="#path\/beginner\/location"/);
  assert.match(html,/data-path-section="location-transfer"/);
});

test('saved mentor reviews push identifier-only events; reconnects recover persisted approvals',async()=>{
  const reservation=net.createServer();reservation.listen(0,'127.0.0.1');await once(reservation,'listening');
  const port=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));
  const directory=await mkdtemp(path.join(tmpdir(),'workshop-mentor-live-'));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),FOUNDRY_DATA_DIR:directory},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`,streamAbort=new AbortController();
  let reader;
  try{
    let timer;
    try{await Promise.race([once(child.stdout,'data'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Server did not start')),10000);})]);}finally{clearTimeout(timer);}
    const bootstrap=await(await fetch(base+'/api/bootstrap')).json();
    const token=bootstrap.token,key=(await readFile(path.join(directory,'mentor-review.key'),'utf8')).trim();
    const post=(route,data,mentor=false)=>fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json',[mentor?'X-Mentor-Token':'X-Workshop-Token']:mentor?key:token},body:JSON.stringify(data)});
    assert.equal((await fetch(base+'/mentor-live.js')).status,200);
    assert.equal((await fetch(base+'/api/path/events',{headers:{Origin:'https://example.com'}})).status,403);
    const stream=await fetch(base+'/api/path/events',{signal:AbortSignal.any([streamAbort.signal,AbortSignal.timeout(10000)])});
    assert.equal(stream.status,200);assert.match(stream.headers.get('content-type'),/text\/event-stream/);
    reader=stream.body.getReader();let buffer='';const decoder=new TextDecoder();
    const nextEvent=async()=>{
      while(!buffer.includes('\n\n')){const chunk=await reader.read();assert.equal(chunk.done,false);buffer+=decoder.decode(chunk.value,{stream:true});}
      const end=buffer.indexOf('\n\n'),frame=buffer.slice(0,end);buffer=buffer.slice(end+2);
      return {type:frame.split('\n').find(line=>line.startsWith('event: ')).slice(7),data:JSON.parse(frame.split('\n').find(line=>line.startsWith('data: ')).slice(6))};
    };
    assert.deepEqual(await nextEvent(),{type:'ready',data:{}});
    const draft={pathId:'beginner',sectionId:'location',notes:'QA-only learner notes.',output:'QA-only terminal evidence.'};
    assert.equal((await post('path/draft',draft)).status,200);
    const first=await(await post('path/submit',draft)).json();
    const firstId=first.progress.mentoring.beginner.flow.sections.location.submissionId;
    const revision={...draft,submissionId:firstId,outcome:'revise',feedback:'QA-only revision feedback.'};
    assert.equal((await post('path/review',revision)).status,403);
    assert.equal((await post('path/review',{...revision,submissionId:'stale-id'},true)).status,400);
    assert.equal((await post('path/review',revision,true)).status,200);
    const revisionEvent=await nextEvent();
    assert.deepEqual(revisionEvent,{type:'review',data:{pathId:'beginner',sectionId:'location',submissionId:firstId,outcome:'revise'}});
    assert.doesNotMatch(JSON.stringify(revisionEvent),/QA-only|token|feedback|notes|output/);
    let latest=await(await fetch(base+'/api/bootstrap')).json();
    assert.equal(latest.progress.mentoring.beginner.flow.sections.location.status,'revise');
    assert.equal(latest.progress.mentoring.beginner.flow.sections.location.notes,draft.notes);
    assert.equal((await post('path/draft',draft)).status,200);
    const second=await(await post('path/submit',draft)).json();
    const secondId=second.progress.mentoring.beginner.flow.sections.location.submissionId;
    assert.notEqual(secondId,firstId);
    assert.equal((await post('path/review',{...revision,submissionId:firstId},true)).status,400);
    assert.equal((await post('path/review',{...revision,submissionId:secondId,outcome:'advance',feedback:'QA-only approval feedback.'},true)).status,200);
    assert.deepEqual(await nextEvent(),{type:'review',data:{pathId:'beginner',sectionId:'location',submissionId:secondId,outcome:'advance'}});
    await reader.cancel();reader=null;
    const reconnected=await fetch(base+'/api/path/events',{signal:streamAbort.signal});reader=reconnected.body.getReader();buffer='';
    assert.deepEqual(await nextEvent(),{type:'ready',data:{}});
    latest=await(await fetch(base+'/api/bootstrap')).json();
    assert.deepEqual(mentorReviewUpdate(beginnerPath,second.progress.mentoring.beginner,latest.progress.mentoring.beginner,'location'),{outcome:'advance',sectionId:'location-transfer'});
    assert.equal((await post('path/draft',{...draft,sectionId:'cargo-role'})).status,400);
  }finally{
    streamAbort.abort();await reader?.cancel().catch(()=>{});
    const exited=once(child,'exit');child.kill();await exited;
    assert.equal(path.dirname(path.resolve(directory)),path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('workshop-mentor-live-'));
    await rm(directory,{recursive:true,force:true});
  }
});
