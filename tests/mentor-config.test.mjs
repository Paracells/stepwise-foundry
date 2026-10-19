import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
test('explicit configuration verifies CLI help without sending a message; disabling preserves the destination',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'foundry-config-tests-'));
  try{
    const fake=path.join(directory,'fake-codex.mjs');
    await writeFile(fake,"import {appendFile} from 'node:fs/promises';\nconst args=process.argv.slice(2);if(args.join(' ')!=='queue --help')throw new Error('Must only inspect help.');await appendFile(new URL('./help.log',import.meta.url),'help\\n');console.log('Usage: codex queue');\n");
    const env={...process.env,FOUNDRY_DATA_DIR:directory,CODEX_THREAD_ID:'11111111-1111-4111-8111-111111111111'};
    await run(process.execPath,['scripts/configure-mentor.mjs','--codex',fake],{env,windowsHide:true});
    const file=path.join(directory,'mentor-notification-config.json');const config=JSON.parse(await readFile(file,'utf8'));
    assert.equal(config.enabled,true);assert.equal(config.threadId,env.CODEX_THREAD_ID);assert.equal(config.command,process.execPath);assert.deepEqual(config.prefixArgs,[fake]);
    await run(process.execPath,['scripts/configure-mentor.mjs','--disable'],{env,windowsHide:true});
    const disabled=JSON.parse(await readFile(file,'utf8'));assert.deepEqual(disabled,{...config,enabled:false});
    assert.equal(await readFile(path.join(directory,'help.log'),'utf8'),'help\n');
    await assert.rejects(run(process.execPath,['scripts/configure-mentor.mjs','--thread','not-a-uuid','--codex',fake],{env,windowsHide:true}));
    assert.deepEqual(JSON.parse(await readFile(file,'utf8')),disabled);
  }finally{assert.equal(path.dirname(directory),path.resolve(tmpdir()));assert.ok(path.basename(directory).startsWith('foundry-config-tests-'));await rm(directory,{recursive:true,force:true});}
});
