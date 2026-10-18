export const sources = {
  book: ['The Rust Programming Language', 'https://doc.rust-lang.org/book/'],
  cargo: ['The Cargo Book', 'https://doc.rust-lang.org/cargo/'],
  reference: ['The Rust Reference', 'https://doc.rust-lang.org/reference/'],
  std: ['Standard library', 'https://doc.rust-lang.org/std/'],
  cli: ['Command Line Applications in Rust', 'https://rust-cli.github.io/book/'],
  rustc: ['The rustc book', 'https://doc.rust-lang.org/rustc/'],
  rustdoc: ['The rustdoc book', 'https://doc.rust-lang.org/rustdoc/'],
  errors: ['Compiler error explanations', 'https://doc.rust-lang.org/error_codes/'],
  nomicon: ['The Rustonomicon', 'https://doc.rust-lang.org/nomicon/'],
  embedded: ['The Embedded Rust Book', 'https://docs.rust-embedded.org/book/'],
  embedonomicon: ['The Embedonomicon', 'https://docs.rust-embedded.org/embedonomicon/'],
  unstable: ['The Unstable Book', 'https://doc.rust-lang.org/nightly/unstable-book/'],
  fls: ['FLS and Ferrocene documentation', 'https://public-docs.ferrocene.dev/'],
  godbolt: ['Compiler Explorer for Rust', 'https://rust.godbolt.org/'],
};
export function moduleInfo(id, title, subtitle, stage, source, intro) {
  return { id, title, subtitle, stage, source, intro };
}
export function exercise(id, title, signature, body, checks, explanation, task, options = {}) {
  const concept = (Array.isArray(explanation) ? explanation[0] : explanation).split(/(?<=\.)\s/)[0];
  const solution = `${options.prelude || ''}/// ${task}\n${signature} {\n    // ${options.codeNote || concept}\n${body.split('\n').map(s => '    ' + s).join('\n')}\n}\n`;
  return {
    id, title, kind: 'rust', minutes: 12, ...options,
    explanation: Array.isArray(explanation) ? explanation : [explanation],
    task, starter: `${options.prelude || ''}// ${concept}\n${signature} {\n    // ${task}\n    todo!("Implement this step")\n}\n`,
    solution, tests: checks,
    hints: options.hints || [
      `Start with the inputs and return type in ${signature.split('(')[0].trim()}. Identify what the caller owns and what it borrows.`,
      options.hint || 'Translate the requirement into one small expression or a short sequence of steps. Compare your result with every example in the checks, including the edge case.',
      `Study the linked documentation and the worked solution. Then close the solution and implement the idea yourself.`,
    ],
  };
}
export function codeExercise(id, title, solution, starter, checks, explanation, task, options = {}) {
  const concept = (Array.isArray(explanation) ? explanation[0] : explanation).split(/(?<=\.)\s/)[0];
  return { ...exercise(id, title, 'fn placeholder()', '', checks, explanation, task, options),
    solution: `// Task: ${task}\n// ${options.codeNote || concept}\n${solution}`,
    starter: `// Your task: ${task}\n// Read the checks, predict the results, then replace the unfinished parts.\n${starter}` };
}
export function diagnostic(id, title, starter, solution, checks, explanation, task, options = {}) {
  return { ...codeExercise(id, title, solution, starter, checks, explanation, task, options), kind: 'rust', diagnostic: true };
}
export function project(id, title, starterFiles, solutionFiles, checks, explanation, task, options = {}) {
  const commentFiles = (files, worked) => Object.fromEntries(Object.entries(files).map(([name, content]) => {
    const prefix = name.endsWith('.rs') ? '// ' : name.endsWith('.toml') ? '# ' : '';
    return [name, prefix ? `${prefix}${worked ? 'Worked example' : 'Exercise file'}: ${name}\n${prefix}${task}\n${content}` : content];
  }));
  return { id, title, kind: 'cargo', minutes: 20, explanation: [explanation], task,
    starterFiles:commentFiles(starterFiles,false), solutionFiles:commentFiles(solutionFiles,true), tests: checks,
    hints: ['Read the file tabs as a project tree. Cargo.toml describes the package; src/lib.rs contains its library.', 'Use the compiler output to choose the next file to edit. Run the checks after one change.', 'Compare each changed file with the worked solution, then explain why that file belongs in this location.'], ...options };
}
export function lab(id, title, explanation, steps, evidencePrompt, reference, options = {}) {
  return { id, title, kind: 'lab', minutes: 25, explanation: [explanation], task: evidencePrompt,
    steps, reference, hints: ['Work through the checklist in order and keep the terminal output.', 'Use the linked primary source for platform-specific setup.', 'Write what happened, why it happened, and one question to revisit.'], ...options };
}
export const manifest = '[package]\nname = "forge_lesson"\nversion = "0.1.0"\nedition = "2024"\n';
