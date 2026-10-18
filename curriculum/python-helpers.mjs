// Python, PyTorch, and Hugging Face share the exercise contract, not a fake interpreter.
export const pyref = (path) => ['Python 3.15 · ' + path.split('/').at(-1).replace('.html',''), 'https://docs.python.org/3.15/' + path];
export const torchref = (path) => ['PyTorch 2.14 · API and semantics', 'https://docs.pytorch.org/docs/2.14/' + path];
export const hfref = (path) => ['Hugging Face · ' + path.split('/')[0], 'https://huggingface.co/docs/' + path];
export function chapter(track, id, title, subtitle, source, intro) {
  return {track,id:`${track}-${id}`,title,subtitle,source,stage:track==='python'?'Python 3.15':track==='pytorch'?'PyTorch 2.14':'Hugging Face',intro:Array.isArray(intro)?intro:[intro]};
}
const comment = (text) => text.split(/\r?\n/).map(line=>'# '+line).join('\n');
export function py(id,title,signature,body,tests,explanation,task,reference,options={}) {
  const paragraphs=Array.isArray(explanation)?explanation:[explanation];
  const concept=options.codeNote || paragraphs[0].split(/(?<=\.)\s/)[0];
  const header=`# Read: ${reference[1]}\n${comment(task)}\n`;
  const prefix=options.prelude ? options.prelude+'\n\n' : '';
  return {id,title,kind:'python',language:'python',entryFile:'main.py',runtime:options.runtime || 'python',minutes:12,
    explanation:paragraphs,task,reference,tests,
    starter:header+prefix+signature+'\n    '+comment(concept).replaceAll('\n','\n    ')+'\n    raise NotImplementedError("Implement the task, then run Check.")\n',
    solution:header+prefix+signature+'\n    '+comment(concept).replaceAll('\n','\n    ')+'\n'+body.split('\n').map(line=>'    '+line).join('\n')+'\n',
    hints:[options.hint1 || `Read the inputs to ${signature.split('(')[0].replace('def ','')} and compare every required result before editing.`,options.hint || concept,'Open the linked section and compare the worked solution. Close it, explain the steps in your notes, and implement them again.'],...options};
}
export function pycode(id,title,solution,starter,tests,explanation,task,reference,options={}) {
  const base=py(id,title,'def placeholder():','pass',tests,explanation,task,reference,options);
  const header=`# Read: ${reference[1]}\n${comment(task)}\n`;
  return {...base,solution:header+solution,starter:header+starter};
}
export function pyproject(id,title,starterFiles,solutionFiles,tests,explanation,task,reference,options={}) {
  const base=py(id,title,'def placeholder():','pass',tests,explanation,task,reference,options);
  const annotate=files=>Object.fromEntries(Object.entries(files).map(([name,content])=>[name,/\.(py|toml)$/.test(name)?`# Read: ${reference[1]}\n${comment(task)}\n${content}`:content]));
  return {...base,minutes:25,starterFiles:annotate(starterFiles),solutionFiles:annotate(solutionFiles),...options};
}
export function fieldLab(id,title,explanation,steps,task,reference,options={}) {
  return {id,title,kind:'lab',minutes:30,explanation:[explanation],steps,task,reference,
    hints:['Work through one checklist item at a time and save the actual output.','Use the linked primary documentation for the installed version and platform.','Record the artifact, the observed behavior, and what your evidence cannot establish.'],...options};
}
