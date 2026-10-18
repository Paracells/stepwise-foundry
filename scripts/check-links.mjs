import { lessons } from '../curriculum/index.mjs';
const urls=[...new Set(lessons.map(l=>l.reference[1]))];
const failures=[]; let next=0;
async function worker(){while(next<urls.length){const url=urls[next++];try{const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);const hash=new URL(url).hash.slice(1);if(hash){const html=await response.text();if(!html.includes(`id="${hash}"`)&&!html.includes(`id='${hash}'`))throw new Error(`Anchor not found: ${hash}`);}console.log(`OK ${url}`);}catch(error){failures.push({url,error:error.message});console.log(`FAIL ${url} ${error.message}`);}}}
await Promise.all([worker(),worker(),worker(),worker()]);
console.log(`${urls.length-failures.length}/${urls.length} distinct lesson links valid.`);
if(failures.length){console.log(JSON.stringify(failures,null,2));process.exitCode=1;}
