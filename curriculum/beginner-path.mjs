import {submissionHistoryText} from '../public/mentor-flow.js';
import {functionsChapter} from './beginner-functions.mjs';
import {parametersChapter} from './beginner-parameters.mjs';
import {valuesChapter} from './beginner-values.mjs';
import {validateFlow,flowFor,currentSection,pathSections} from '../public/mentor-flow.js';
export const checkpointFields=['currentExercise','observedOutput','readingsAssigned','readingsRead','learnerExplanation','mentorReview','blockers','decisionNotes','nextAction'];
export const beginnerPath={
  "id": "beginner",
  "title": "Rust beginner path",
  "track": "rust",
  "learningGoal": "Build a small Rust practice project while learning to explain, predict, diagnose, and adapt your own work.",
  "teachingContract": [
    "Explain the principle and the purpose it serves in this project.",
    "Predict an outcome before running a command or changing source.",
    "Implement one small step yourself, then explain observations or diagnose an error.",
    "After review, solve a small changed example with fewer hints to try transferring the idea.",
    "When a decision is relevant, compare alternatives and justify a choice against requirements and evidence.",
    "Look up the exact official section and evaluate mentor or AI suggestions against it and your observations. Reduce support as understanding is demonstrated; one successful build or exercise does not establish mastery."
  ],
  "projectDirectory": "A new empty practice folder you choose",
  "briefUrl": "/api/beginner/brief",
  "handoffUrl": "/api/beginner/handoff",
  "observation": "No learner environment has been inspected. Choose a new empty practice folder, and record your own terminal observations before initializing it.",
  "initialCheckpoint": {
    "currentExercise": "Orientation: find your current folder in PowerShell.",
    "observedOutput": "",
    "readingsAssigned": "After the first command: Cargo guide, Creating a New Package — read only the opening explanation and the file tree, stopping before Cargo.toml. https://doc.rust-lang.org/cargo/guide/creating-a-new-project.html#creating-a-new-package\nRead the example first; the existing project folder will use cargo init in the later guided step.",
    "readingsRead": "",
    "learnerExplanation": "",
    "mentorReview": "Not yet reviewed. No conceptual understanding has been demonstrated in this path.",
    "blockers": "Not yet assessed; learner environment output has not been provided.",
    "decisionNotes": "No project decisions have been accepted. Record proposals and your own choices separately.",
    "nextAction": "Open PowerShell, type Get-Location, press Enter, and paste its output into Observed output."
  },
  "vocabulary": [
    [
      "Folder / directory",
      "A container that organizes files and other folders. A path is its address, such as C:\\Projects\\rust-practice."
    ],
    [
      "File",
      "One named item containing data. A source file is an ordinary text file that holds instructions you write."
    ],
    [
      "Source code / executable",
      "Source code is the text you edit. A compiler translates it into an executable program Windows can run. Editing the source does not change an already-built executable."
    ],
    [
      "Terminal / PowerShell",
      "A terminal displays a command session. PowerShell reads the commands you type there and displays their results. Press Enter to submit one command."
    ],
    [
      "Rust / rustc / Cargo",
      "Rust is the programming language. rustc is its compiler. Cargo organizes a Rust package and asks the compiler to build it."
    ],
    [
      "Cargo.toml / src/main.rs",
      "Cargo.toml describes a package and its settings. src is a folder; main.rs is the Rust source file inside it that starts this small executable program."
    ]
  ],
  "practice": [
    [
      "hello-rust",
      "Your first running program",
      "Rehearse a greeting in the Workshop after the orientation conversation."
    ],
    [
      "cargo-manifest",
      "Give your project an identity",
      "Revisit the manifest after examining your own Cargo.toml."
    ],
    [
      "first-function",
      "Give a calculation a name",
      "Continue later, when the first program and file roles can be explained."
    ]
  ],
  "roadmap": [
    "First: one folder, one package, one greeting, and a reviewed explanation.",
    "Next: values and variables with predictions, compiler diagnostics, and a small changed example.",
    "Later: use the open Rust lessons for functions, ownership, errors, tests, and small command-line projects.",
    "When choosing a design, compare options, explain tradeoffs, and record your own rationale. Future chapters can be contributed without changing existing section IDs."
  ],
  "chapters": [
    {
      "id": "orientation",
      "title": "Find your bearings",
      "sections": [
        {
          "id": "location",
          "title": "Your current folder",
          "explanation": "Open the Windows Start menu, type PowerShell, and open Windows PowerShell or PowerShell. The prompt is where you type. Type the command below without adding a $ or > prompt symbol. It reports the current folder; it creates no files.",
          "commands": [
            [
              "Get-Location",
              "Get asks for information; Location means the current folder. Predict whether the result will be a folder address or your source code, then press Enter."
            ]
          ],
          "prompt": "Before running Get-Location, say whether you expect a folder address or source code. Then run it, paste the output, and explain what the path names.",
          "needsOutput": true,
          "readings": [
            [
              "Cargo guide: Creating a New Package",
              "https://doc.rust-lang.org/cargo/guide/creating-a-new-project.html#creating-a-new-package"
            ]
          ],
          "stoppingPoint": "Optional context: opening explanation and file tree only. Stop before Cargo.toml; do not run the tutorial commands.",
          "hints": [
            "The current folder belongs to this PowerShell session. It may differ from a folder open in your editor.",
            "The output normally has a Path heading followed by a Windows folder address. Preserve an error exactly if one appears."
          ]
        },
        {
          "id": "location-transfer",
          "title": "A second PowerShell window",
          "explanation": "Each command session has its own current folder. This small variation checks how you apply the idea with fewer hints.",
          "prompt": "Predict whether a second PowerShell window must start in the same folder as the first. Open one, compare both locations using the command you learned, and explain what your observations support.",
          "needsOutput": true,
          "readings": [],
          "hints": []
        }
      ]
    },
    {
      "id": "cargo-reading",
      "title": "Read a Cargo package",
      "sections": [
        {
          "id": "cargo-role",
          "title": "What Cargo creates",
          "explanation": "Read the opening of the guide as an example. You are learning what the tool does before creating anything in your own folder.",
          "prompt": "In your own words, what does Cargo manage, and how do the executable and library examples differ? Include any questions in the same notes field.",
          "readings": [
            [
              "Cargo guide: Creating a New Package",
              "https://doc.rust-lang.org/cargo/guide/creating-a-new-project.html#creating-a-new-package"
            ]
          ],
          "stoppingPoint": "Read the opening explanation and generated file tree. Stop before the Cargo.toml example. Do not execute the commands.",
          "hints": [
            "Use the guide to distinguish a package, its manifest, and its source files."
          ]
        },
        {
          "id": "cargo-manifest",
          "title": "Cargo.toml: the package manifest",
          "explanation": "A manifest is a text file of package settings that Cargo reads. Read the example and the paragraph beneath it, then explain one field. You are still reading; no terminal command is assigned here.",
          "prompt": "In the Cargo.toml example, does version = \"0.1.0\" describe this project or the installed Rust compiler? Explain in one sentence. Put any other notes or questions in the same response.",
          "readings": [
            [
              "Cargo guide: Creating a New Package",
              "https://doc.rust-lang.org/cargo/guide/creating-a-new-project.html#creating-a-new-package"
            ]
          ],
          "stoppingPoint": "Read only the Cargo.toml example and the paragraph immediately beneath it. Stop before “Here’s what’s in src/main.rs”.",
          "hints": [
            "Look at the example’s [package] heading and the paragraph that calls this file a manifest."
          ]
        }
      ]
    },
    {
      "id": "environment",
      "title": "Check your own environment",
      "sections": [
        {
          "id": "tool-versions",
          "title": "The compiler and Cargo",
          "explanation": "These commands report which tools this PowerShell session can find. The Workshop runtime badge describes a different observation. If a command fails, preserve the actual error for review.",
          "commands": [
            [
              "rustc --version",
              "rustc names the compiler. --version asks it to print its version instead of compiling source."
            ],
            [
              "cargo --version",
              "cargo names the project tool. --version asks for its version; it does not create a package."
            ]
          ],
          "prompt": "Run each version command separately and paste both results. Explain which tool compiles Rust source and which organizes and builds a package.",
          "needsOutput": true,
          "readings": [
            [
              "Rust Book: Hello, Cargo! — opening paragraphs, stopping before Creating a Project with Cargo",
              "https://doc.rust-lang.org/book/ch01-03-hello-cargo.html#hello-cargo"
            ]
          ],
          "stoppingPoint": "Read the opening Hello, Cargo! explanation. Stop before Creating a Project with Cargo.",
          "hints": [
            "PowerShell commands and Rust source go in different places: commands at the prompt, Rust source in a .rs file.",
            "A command-not-found message is useful evidence. It does not establish which component needs installation."
          ]
        },
        {
          "id": "destination",
          "title": "Check the project destination",
          "explanation": "Choose a new, empty folder in your file manager for this practice project. Open PowerShell there, or replace PATH_TO_YOUR_PRACTICE_FOLDER below with its full address. Inspect the folder before creating any files. These commands change only the session’s current folder and display information.",
          "commands": [
            [
              "Set-Location -LiteralPath \"PATH_TO_YOUR_PRACTICE_FOLDER\"",
              "Set-Location changes this session’s current folder. -LiteralPath treats the quoted address literally. This command changes no files."
            ],
            [
              "Get-Location",
              "Check the full address now. Confirm that this is the new practice folder you chose."
            ],
            [
              "Get-ChildItem -Force",
              "List the current folder’s entries, including hidden ones. No prior inspection has been performed; inspect it yourself. If it contains unexpected files, stop and show the listing instead of initializing over them."
            ]
          ],
          "prompt": "Paste the full location and folder listing. Explain whether this is the intended Rust practice folder and whether any existing entries need review before initialization. Stop here if anything is unexpected.",
          "needsOutput": true,
          "readings": [],
          "hints": [
            "An empty listing is useful evidence too. Keep the command and its prompt in the pasted output."
          ]
        }
      ]
    },
    {
      "id": "first-package",
      "title": "Create and inspect a package",
      "sections": [
        {
          "id": "initialize",
          "title": "Create the package yourself",
          "explanation": "Only after the correct folder, empty listing, and tool output have been reviewed: predict which files Cargo will create. You will type the commands and edit the source yourself. The Workshop does not write into your real project.",
          "commands": [
            [
              "cargo init --bin --name rust-practice --vcs none .",
              "init creates a package in an existing folder; . means the current folder. --bin requests an executable, --name supplies its package name, and --vcs none defers Git setup to a later lesson. cargo new is for creating a new project folder; this folder already exists."
            ],
            [
              "Get-Content -LiteralPath .\\Cargo.toml",
              "Get-Content displays a text file. Inspect the package name, version, and edition. The edition, such as 2024, chooses language compatibility rules; the package version, such as 0.1.0, is a separate value."
            ]
          ],
          "prompt": "Before running the initialization command, predict which files it will create. Then run it in the reviewed destination, read Cargo.toml, and explain why init fits an existing folder and what --vcs none does.",
          "needsOutput": true,
          "readings": [
            [
              "Cargo init: Description and Init Options only",
              "https://doc.rust-lang.org/cargo/commands/cargo-init.html#description"
            ]
          ],
          "stoppingPoint": "Read Description and Init Options only.",
          "hints": [
            "The final dot means the current folder. Check the prompt before pressing Enter."
          ]
        },
        {
          "id": "source",
          "title": "Find the source and entry point",
          "explanation": "The manifest describes the package. The generated Rust source contains the program’s instructions. Open the exact Rust practice folder in VS Code using File → Open Folder, expand src, and open main.rs.",
          "commands": [
            [
              "Get-Content -LiteralPath .\\src\\main.rs",
              "Read the generated source. In VS Code use File → Open Folder to open the exact Rust practice folder, expand src, and open main.rs. Do not assume the code command is installed."
            ]
          ],
          "prompt": "Read the generated source and explain which file contains the greeting and where execution begins. What would you edit to change the greeting? Do not change it yet.",
          "needsOutput": true,
          "readings": [
            [
              "Rust Book: The Anatomy of a Rust Program — first function and greeting explanation only",
              "https://doc.rust-lang.org/book/ch01-02-hello-world.html#the-anatomy-of-a-rust-program"
            ]
          ],
          "stoppingPoint": "Read the first function and greeting explanation. Stop before Compiling and Running Are Separate Steps.",
          "hints": [
            "Follow the src folder to main.rs. Compare that file with Cargo.toml."
          ]
        }
      ]
    },
    {
      "id": "build-change",
      "title": "Build, observe, and adapt",
      "sections": [
        {
          "id": "first-run",
          "title": "Build and run",
          "explanation": "Cargo can build the source and launch the resulting executable. Its own build messages and your program’s output have different purposes.",
          "commands": [
            [
              "cargo run",
              "Cargo builds the program, then runs it. Before pressing Enter, predict which line comes from your program. Record the actual output, including any errors."
            ]
          ],
          "prompt": "Predict the greeting before running the command. Paste the actual output, identify the line printed by your program, and explain what Cargo did. Keep any errors exactly as printed.",
          "needsOutput": true,
          "readings": [
            [
              "Rust Book: Building and Running a Cargo Project",
              "https://doc.rust-lang.org/book/ch01-03-hello-cargo.html#building-and-running-a-cargo-project"
            ]
          ],
          "stoppingPoint": "Read through the cargo run explanation. Stop before Building for Release.",
          "hints": [
            "Compare the greeting in the saved main.rs with the output."
          ]
        },
        {
          "id": "greeting-transfer",
          "title": "Change one thing and explain it",
          "explanation": "Apply the source → build → output relationship yourself. Keep this variation small and use fewer hints.",
          "prompt": "Change only the greeting text to Hello, Rust practice!, save, predict the output, and run again. Explain which file you edited, which tool rebuilt it, and what changed. What would you check first if the old greeting still appeared?",
          "needsOutput": true,
          "readings": [
            [
              "Rust Book: The Anatomy of a Rust Program — first function and greeting explanation only",
              "https://doc.rust-lang.org/book/ch01-02-hello-world.html#the-anatomy-of-a-rust-program"
            ]
          ],
          "stoppingPoint": "Use the greeting explanation only if needed.",
          "hints": [
            "The characters between the double quotes are the greeting. Start by finding those quotes, without changing braces or parentheses.",
            "Save your source file before cargo run. If the output stays the same, inspect the saved file and current folder before changing more code."
          ],
          "reveal": "The greeting line can be println!(\"Hello, Rust practice!\");. Type it yourself only after trying the hints, then explain what each part does. This is an intentional example, not a project change made for you."
        }
      ]
    }
  ]
};
// Keep chapter data shared by the page and its executable examples.
beginnerPath.chapters.push(valuesChapter,functionsChapter,parametersChapter);

export const defaultCheckpoint=()=>({...beginnerPath.initialCheckpoint});
export function validateCheckpoint(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Checkpoint must be an object.');
  const clean={};
  for(const key of checkpointFields){
    if(typeof value[key]!=='string')throw new Error(`Checkpoint ${key} must be text.`);
    const limit=['nextAction','currentExercise'].includes(key)?1000:key==='observedOutput'?12000:5000;
    if(value[key].length>limit)throw new Error(`Checkpoint ${key} is too long.`);
    clean[key]=value[key];
  }
  for(const key of ['nextAction','currentExercise'])if(!clean[key].trim()||/[\r\n]/.test(clean[key]))throw new Error('Use one nonempty line for the current exercise and exactly one next action.');
  if(typeof value.updatedAt==='string'&&!Number.isNaN(Date.parse(value.updatedAt)))clean.updatedAt=value.updatedAt;
  if(value.flow!==undefined)clean.flow=validateFlow(value.flow,beginnerPath);
  return clean;
}
export function checkpointReport(checkpoint=defaultCheckpoint()){
  const state=validateCheckpoint(checkpoint);
  const text=value=>value?value.replaceAll('```','~~~'):'Not provided.';
  const flow=flowFor(beginnerPath,state),section=currentSection(beginnerPath,flow);
  const sectionRecords=pathSections(beginnerPath).filter(item=>flow.sections[item.id]).map(item=>{
    const entry=flow.sections[item.id];
    return `### ${item.title}\nStatus: ${entry.status}\nSubmission: ${entry.submissionId || 'draft'}\nPrompt: ${item.prompt}\n\nLearning notes:\n${text(entry.notes)}\n\nObserved output:\n\x60\x60\x60text\n${text(entry.output)}\n\x60\x60\x60\n\nMentor feedback: ${entry.review?text(entry.review.feedback)+' ('+entry.review.outcome+', '+entry.review.reviewedAt+')':'Pending; no review recorded.'}`+submissionHistoryText(entry);
  });
  return [
    '# Rust practice — short mentoring handoff','',
    `Checkpoint saved: ${state.updatedAt || 'initial template; no learner evidence saved yet'}`,
    'Mentor guide: docs/BEGINNER.md in the Stepwise Foundry repository.',
    `Project destination: ${beginnerPath.projectDirectory}`,'',
    'Confirmed: begin from zero; explain every command, use short official readings, predictions, small exercises, and graduated hints. The learner types commands/source. Keep solutions behind an intentional reveal. Do not infer understanding from course completion or a successful compiler check.',
    'Learning goal: rebuild Rust practice from an empty project and develop independent engineering judgment. Explain a principle/purpose, predict, implement a small step, diagnose or explain observations, then try a changed example with reduced hints. Compare alternatives when relevant. Check mentor/AI suggestions against exact official documentation, requirements, and observed evidence. Fade support gradually; one exercise is not proof of mastery.',
    'The learner types their own commands and source. A mentor reviews evidence and gives feedback; do not implement the learner project for them or award understanding from a passing build.',
    beginnerPath.observation,'',
    `## Section gates — current teaching record\nCurrent: ${section?.title || 'All authored sections reviewed; agree on the next small task.'}\n${flow.startReason}\nA saved draft or submitted response does not unlock the next section. A mentor reviews the exact submission, records feedback, and either requests revision or allows the next section. No automatic conceptual grading or mastery claim.`,
    ...sectionRecords,
    '## Earlier resume checkpoint — preserved context, not gate approvals',
    `## Current exercise\n${text(state.currentExercise)}`,
    `## Observed output — learner-entered, not independently verified\n\x60\x60\x60text\n${text(state.observedOutput)}\n\x60\x60\x60`,
    `## Readings assigned\n${text(state.readingsAssigned)}`,
    `## Learner's learning notes — reading, summaries, questions, and responses\n${text(state.readingsRead)}`,
    ...(state.learnerExplanation?[`## Optional specific practice response\n${text(state.learnerExplanation)}`]:[]),
    `## Understanding demonstrated / mentor review\n${text(state.mentorReview)}`,
    `## Blockers / unknowns\n${text(state.blockers)}`,
    `## Decision checkpoint — proposals vs accepted choices\n${text(state.decisionNotes)}`,
    `## Exactly one next action\n${state.nextAction}`,'',
    'Start a fresh chat at a completed learning milestone, a change of task, or repeated context mistakes. Bring this handoff and the canonical brief; verify the last observation and agree on one next action. No automatic schedule or token threshold is implied.',
  ].join('\n\n');
}
