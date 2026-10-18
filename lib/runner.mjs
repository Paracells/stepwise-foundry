import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pythonRuntimes, runPythonLesson } from './python-runner.mjs';
const isWindows = process.platform === 'win32';
const LIMIT = 64000;
export function execute(command, args, { cwd, timeout = 20000, env = {} } = {}) {
  return new Promise(resolve => {
    let stdout = '', stderr = '', timedOut = false, overflow = false, settled = false;
    const child = spawn(command, args, { cwd, windowsHide: true, shell: false,
      env: { ...process.env, CARGO_NET_OFFLINE: 'true', RUST_BACKTRACE: '0', NO_COLOR: '1', ...env } });
    const stop = () => {
      if (isWindows && child.pid) {
        const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
        killer.on('error', () => child.kill());
      } else { child.kill('SIGKILL'); }
    };
    const timer = setTimeout(() => { timedOut = true; stop(); }, timeout);
    const append = (where, data) => {
      const text = data.toString();
      if (where === 'out') stdout = (stdout + text).slice(0, LIMIT);
      else stderr = (stderr + text).slice(0, LIMIT);
      if (stdout.length + stderr.length >= LIMIT && !overflow) { overflow = true; stop(); }
    };
    child.stdout.on('data', data => append('out', data));
    child.stderr.on('data', data => append('err', data));
    const finish = result => { if (settled) return; settled = true; clearTimeout(timer); resolve({stdout, stderr, timedOut, overflow, ...result}); };
    child.on('error', error => finish({code: -1, stderr: `${stderr}\n${error.message}`}));
    child.on('close', code => finish({code: code ?? -1}));
  });
}
export function validateFiles(files) {
  if (!files || typeof files !== 'object' || Array.isArray(files)) throw new Error('Expected an object of exercise files.');
  const entries = Object.entries(files);
  if (!entries.length || entries.length > 20) throw new Error('Provide between 1 and 20 files.');
  let size = 0;
  for (const [name, value] of entries) {
    if (!/^(?:src\/|tests\/|examples\/)?[a-zA-Z0-9_./-]+\.(?:rs|py|toml|md|txt|json|csv|ini)$/.test(name)
      || name.includes('..') || name.includes('\\') || name.startsWith('/') || name.includes('//')
      || name === 'build.rs' || name.startsWith('.')) throw new Error(`Unsupported exercise path: ${name}`);
    if (typeof value !== 'string') throw new Error('File contents must be text.');
    size += Buffer.byteLength(value);
  }
  if (size > 200000) throw new Error('Exercise files exceed 200 KB.');
  return files;
}
export async function toolchainStatus() {
  const results = await Promise.all(['rustc', 'cargo', 'rustup'].map(cmd => execute(cmd, ['--version'], {timeout:5000})));
  const nightly = await execute('rustup', ['toolchain', 'list'], {timeout:5000});
  return { rustc: results[0].code === 0 ? results[0].stdout.trim() : null,
    cargo: results[1].code === 0 ? results[1].stdout.trim() : null,
    rustup: results[2].code === 0 ? results[2].stdout.trim() : null,
    nightly: nightly.code === 0 && nightly.stdout.split('\n').some(line => line.startsWith('nightly')), edition:'2024', ...await pythonRuntimes(execute) };
}
export async function runLesson(lesson, files, mode = 'check') {
  validateFiles(files);
  if (lesson.kind === 'lab') throw new Error('This is an evidence-based lab. Complete its checklist instead.');
  if (!['run','check','format'].includes(mode)) throw new Error('Unknown execution mode.');
  if(lesson.kind==='python')return runPythonLesson(lesson,files,mode,execute);
  const dir = await mkdtemp(path.join(tmpdir(), 'stepwise-foundry-'));
  const logs = [];
  const step = async (command, args, timeout) => {
    logs.push(`$ ${command} ${args.map(s => s.startsWith(dir) ? path.relative(dir, s) : s).join(' ')}`);
    const result = await execute(command, args, {cwd:dir, timeout});
    logs.push(result.stdout, result.stderr);
    if (result.timedOut) logs.push('Stopped: time limit reached. Check for an infinite loop or a blocked thread.');
    if (result.overflow) logs.push('Stopped: output limit reached.');
    return result;
  };
  const finish = (ok, extra = {}) => ({ok, mode, output:logs.filter(Boolean).join('\n').replaceAll(dir, '<exercise>'), ...extra});
  try {
    for (const [name, content] of Object.entries(files)) {
      const destination = path.join(dir, name); await mkdir(path.dirname(destination), {recursive:true}); await writeFile(destination, content);
    }
    if (mode === 'format') {
      for (const file of Object.keys(files).filter(s => s.endsWith('.rs'))) {
        const result = await step('rustfmt', ['--edition','2024',path.join(dir,file)], 10000);
        if (result.code !== 0) return finish(false);
      }
      const formatted = Object.fromEntries(await Promise.all(Object.keys(files).map(async f => [f, await readFile(path.join(dir,f), 'utf8')])));
      return finish(true, {files:formatted});
    }
    if (lesson.kind === 'cargo') {
      if (mode === 'check') {
        for (const rule of lesson.fileChecks || []) {
          const contents = (files[rule.file] || '').split('\n').filter(line => !/^\s*(?:#|\/\/)/.test(line)).join('\n');
          if (!contents.includes(rule.contains)) { logs.push(`Requirement: ${rule.file} must contain ${rule.contains}`); return finish(false); }
        }
        await mkdir(path.join(dir, 'tests'), {recursive:true});
        await writeFile(path.join(dir, 'tests', '__workshop_checks.rs'), `#[test]\nfn workshop_behavior() {\n${lesson.tests}\n}\n`);
      }
      // Cargo manifests are learner-controlled. No network fetches or shell commands are issued by the runner.
      const action=mode==='check'?'test':files['src/main.rs']?'run':'check';
      const result = await step('cargo', [action, '--offline', '--color', 'never'], 45000);
      return finish(result.code === 0, {message: action==='check'?'Library project compiled. Check runs the project tests.':undefined});
    }
    const source = files['main.rs'];
    if (typeof source !== 'string') throw new Error('This exercise requires main.rs.');
    const nightlyArgs = lesson.toolchain === 'nightly' ? ['+nightly'] : [];
    if (nightlyArgs.length) {
      const status = await toolchainStatus();
      if (!status.nightly) { logs.push('Nightly is not installed. This optional exercise requires: rustup toolchain install nightly\nStable lessons work without it.'); return finish(false, {blocked:true}); }
    }
    if (mode === 'check' && lesson.compileFail) {
      const result = await step('rustc', [...nightlyArgs,'--edition=2024','--crate-type=lib','--emit=metadata',path.join(dir,'main.rs')], 20000);
      const expected = lesson.expectedError;
      const ok = result.code !== 0 && !result.timedOut && !result.overflow && (!expected || result.stderr.includes(expected));
      if (ok) logs.push(`Expected diagnostic observed: ${expected || 'compilation rejected'}.`);
      return finish(ok);
    }
    const binary = path.join(dir, `exercise${isWindows ? '.exe' : ''}`);
    const useTests = mode === 'check' && !lesson.expectedOutput;
    if (useTests) {
      await writeFile(path.join(dir,'main.rs'), `${source}\n#[cfg(test)]\nmod __workshop_checks {\nuse super::*;\n#[test]\nfn required_behavior() {\n${lesson.tests}\n}\n}\n`);
    } else if (mode === 'run' && !/\bfn\s+main\s*\(/.test(source)) {
      // A library exercise has no entry point. Run its public examples as a test binary.
      await writeFile(path.join(dir,'main.rs'), `${source}\n#[cfg(test)] mod __workshop_examples { use super::*; #[test] fn examples() { ${lesson.tests} } }\n`);
    }
    const testMode = useTests || (mode === 'run' && !/\bfn\s+main\s*\(/.test(source));
    const compile = await step('rustc', [...nightlyArgs,'--edition=2024',...(testMode ? ['--test'] : []),path.join(dir,'main.rs'),'-o',binary], 25000);
    if (compile.code !== 0) return finish(false);
    const result = await step(binary, testMode ? ['--nocapture','--test-threads=1'] : [], 8000);
    let ok = result.code === 0;
    if (mode === 'check' && lesson.expectedOutput !== undefined) {
      ok &&= result.stdout.replaceAll('\r\n','\n') === lesson.expectedOutput;
      if (!ok) logs.push(`Expected stdout: ${JSON.stringify(lesson.expectedOutput)}\nActual stdout: ${JSON.stringify(result.stdout)}`);
    }
    return finish(ok);
  } finally { await rm(dir, {recursive:true, force:true, maxRetries:5, retryDelay:150}); }
}
