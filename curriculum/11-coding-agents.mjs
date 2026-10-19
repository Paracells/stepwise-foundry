import {lab,moduleInfo} from './helpers.mjs';

const codexDocs='https://learn.chatgpt.com/docs/';
const claudeDocs='https://code.claude.com/docs/en/';
const reading=(title,url,stop)=>({title,url,stop});
const scratch='<!-- Practice file: type this yourself in a separate scratch folder. -->\n# Agent practice\nStatus: Planned\nKeep: My own notes\n';
const instructions='# Practice project instructions\n\n<!-- These guide the assistant; they do not enforce filesystem permissions. -->\n- Explain the proposed change before editing.\n- Keep changes limited to the requested file.\n- Report the verification you actually performed.\n';
const inspectPrompt='# Paste this as a request, not as a terminal command.\nRead only README.md in this scratch project. Quote its Status line and explain what it says. Do not edit files, run commands, install anything, or publish. Stop after the explanation.';
const editPrompt='# This requests one edit; it does not authorize a commit or push.\nIn README.md only, replace Status: Planned with Status: Ready. Preserve every other line. Explain your plan first and wait for me before editing. After I approve the plan, make that one edit, show the diff, and report what you checked. Do not install packages, commit, push, or edit other files.';

export const modules=[
  {...moduleInfo('codex-orientation','Meet Codex in your own workspace','Identify your client, choose a scratch project, and inspect one file.','Tool foundations','codex_quickstart',[
    'These optional field labs teach how to work with an assistant while keeping your reasoning visible. They do not launch Codex from Foundry, require an API key in Foundry, or install an integration.',
    'Use an existing Codex setup or follow the current official setup yourself. External assistant use follows that service\'s account and usage rules. If unavailable, read the material and record the blocker; do not claim the experiment ran.',
    'Work in a new scratch folder. These lessons are independent of the Rust beginner path and do not authorize changes to an existing learning project. Ask a mentor to review your evidence between lessons if you want conceptual feedback.',
  ]),track:'codex'},
  {...moduleInfo('codex-first-change','Guide and review one Codex change','Inspect permissions, write three instructions, and review a tiny diff.','First supervised change','codex_practice',[
    'Continue with the same scratch README and baseline from the first chapter. Keep the experiment small enough that you can explain every changed line.',
    'A prompt describes your request; client permissions control available actions. Review both, then inspect the actual result. An assistant\'s claim that a check passed is a starting point for examining evidence.',
    'These are open, self-reported field labs. Saving completion is not mentor approval, and does not configure automatic messages or grant the assistant access.',
  ]),track:'codex'},
  {...moduleInfo('claude-orientation','Meet Claude Code in your own workspace','Identify the CLI, select a scratch project, and inspect one file.','Tool foundations','claude_quickstart',[
    'This introduction targets Claude Code\'s interactive CLI. Claude chat, Desktop, IDE extensions, and the API have their own workflows; do not assume their controls are interchangeable.',
    'Use your own supported setup and current official instructions. Foundry neither installs nor starts Claude Code, signs in, or stores provider credentials. External assistant use follows that service\'s account and usage rules.',
    'Use a separate scratch project. Small predictions and actual observations provide evidence for a mentor; a checked box alone does not demonstrate understanding.',
  ]),track:'claude'},
  {...moduleInfo('claude-first-change','Guide and review one Claude Code change','Inspect permissions, write project guidance, and verify one small edit.','First supervised change','claude_workings',[
    'Keep using your scratch README and baseline. You will examine the tools available to the session, introduce a small instruction file, and review one requested change.',
    'Check your installed version against current docs before using a mode or command. Instructions, permissions, and retained session context solve different problems; none substitutes for reviewing your result.',
    'Finish with a short evidence handoff. These labs do not create a background listener, add dependencies, or run a model from Foundry.',
  ]),track:'claude'},
];

function toolLab(track,module,id,title,explanation,steps,task,readings,example,extra={}){
  const isCodex=track==='codex';
  return lab(`${track}-${id}`,title,explanation[0],steps,task,[readings[0].title,readings[0].url],{
    track,module,minutes:12,language:'plaintext',entryFile:'evidence.txt',explanation,readings,example,
    documentation:{revision:'1',product:isCodex?'Codex':'Claude Code',surface:isCodex?'Desktop: local project':'Interactive CLI',os:'Your supported local OS and shell',verifiedAt:'2026-10-19',testedVersion:null,validation:'Official documentation reviewed; external client workflow not executed by the lesson author. Verify your installed version before doing the lab.',releaseNotes:isCodex?codexDocs+'changelog':claudeDocs+'changelog'},
    hints:[
      'Separate your prediction from the observation. If you already tried the action, say so rather than inventing an earlier prediction.',
      'Use the linked section and stopping point. Record the client, version, and exact mismatch if your screen or output differs; leave the lab incomplete while blocked.',
      'Bring the exact request, relevant output or diff, and your explanation to a mentor. Reuse existing evidence when it answers the question; do not let the assistant complete the learning experiment for you.',
    ],...extra,
  });
}

export const lessons=[
  toolLab('codex','codex-orientation','identify-client','Identify your Codex client and current docs',[
    'Before copying a command, identify the product and surface it belongs to. This chapter targets Codex in a desktop local project; a CLI version number alone does not identify the desktop build or prove a particular control exists there.',
    'The documentation stamp below records what the author read, not a tested installation. Check the current setup section and release notes alongside the version shown by your own client. Use official setup if needed, and stop if your platform or account does not provide the feature.',
    'Make a small environment record in your own words. You will use it to explain a later mismatch without copying account details or credentials.',
  ],[
    'Read the setup section linked below and identify the desktop/local-project route; stop before starting a real project task.',
    'Record your OS and shell, the displayed product name and surface, and the installed desktop version if available. Write unknown if the version cannot be verified.',
    'Open the official release notes. Note one relevant recent change or record that none affects this introduction; do not automatically upgrade.',
    'Compare one setup instruction with your screen. Distinguish verified behavior, documentation-only guidance, and an unresolved mismatch.',
    'Explain why a command documented for the API or CLI is not automatically a desktop feature. Save your source URL and the date you checked it.',
  ],'Record your client/surface, OS, version or unknown, source section, verification date, and one comparison with your actual setup. If blocked, describe the blocker and leave completion unchecked.',[
    reading('Codex desktop setup',codexDocs+'quickstart#setup','Read the desktop setup steps through selecting the working folder. Stop before sending the first task.'),
    reading('ChatGPT and Codex release notes',codexDocs+'changelog','Read the most recent entry relevant to your installed desktop client; do not assume a CLI release describes your desktop build.'),
  ],{filename:'environment.txt',code:'# Example fields, not claims about your machine.\nProduct and surface:\nOS and shell:\nInstalled version or unknown:\nOfficial section and checked date:\nObserved match or mismatch:\n',caption:'Fill these fields with observations. Do not paste credentials or account identifiers.'}),

  toolLab('codex','codex-orientation','scratch-baseline','Choose a scratch project and save a baseline',[
    'The selected folder supplies project context. An ambiguous task aimed at your real application is harder to review than a request aimed at one practice file. Choose a new empty scratch folder yourself, separate from Foundry and any real project.',
    'Type the commented README below yourself. Its Status line is the future edit target; the Keep line lets you detect an accidental extra change. Save a baseline with your own Git workflow, or a separate before-copy if you have not learned Git yet.',
    'A checkpoint is evidence of the starting content. Creating it is not authorization for an assistant to edit, commit, push, or inspect other projects.',
  ],[
    'Choose a new empty scratch folder and record a short non-sensitive label for it. Do not use Foundry or an existing learning/work project.',
    'Type and save the README example yourself. Read each line and identify the single line intended for a later change.',
    'Create your own baseline checkpoint or before-copy, and confirm you can compare it with the working README.',
    'Open that folder as the local Codex project and verify the displayed working location before sending any task.',
    'Predict which README lines should remain unchanged in the later edit. Record your actual baseline and how you would detect an unintended change.',
  ],'Identify the scratch project, show the starting README and baseline method, and explain which line may change later and how you will compare it. Do not ask Codex to create the baseline for you.',[
    reading('Give Codex task context',codexDocs+'learn/best-practices#strong-first-use-context-and-prompts','Read the goal, context, constraints, and done-when guidance. Stop before model-selection advice.'),
  ],{filename:'README.md',code:scratch,caption:'Type this small fixture in your own scratch project. The HTML comment explains why the file exists.'}),

  toolLab('codex','codex-orientation','inspect-file','Ask for one inspection and compare the evidence',[
    'Start with a task whose answer you can verify by opening the file yourself. Predict the Status line before sending the request, then compare the response with the saved README and the recorded tool activity.',
    'Asking for no edits describes intent; it does not itself impose a filesystem boundary. A reply about a file is also not proof the assistant inspected it. Look at which file was read and what actions were actually reported.',
    'If the response changes a file or uses an unexpected tool, preserve the observation and discuss it before proceeding. Do not rewrite the evidence to make the trial look successful.',
  ],[
    'Read the linked section, then write your expected Status line in your notes before trying the request if you have not already tried it.',
    'Confirm the selected scratch folder and send the commented inspection request below as a message, not a shell command.',
    'Inspect the response and available tool activity. Record whether a file read is visible, or whether that cannot be verified.',
    'Open the saved README yourself and compare its Status line and baseline with the response. Record any unexpected change.',
    'Explain the difference between requesting no edit and enforcing a read-only permission boundary. Ask a mentor to review any uncertainty before continuing.',
  ],'Save your prediction or honestly recorded prior attempt, the inspection request and result, observed actions, baseline comparison, and one sentence about request scope versus permissions.',[
    reading('Plan before changing code',codexDocs+'learn/best-practices#plan-first-for-difficult-tasks','Read how planning separates investigation from implementation. Stop before reusable project guidance.'),
  ],{filename:'request.txt',code:inspectPrompt,caption:'This deliberately small request has an answer you can compare with a known file.'}),

  toolLab('codex','codex-first-change','permissions','Inspect action permissions without changing them',[
    'An instruction file tells the assistant how you want it to work. Permissions determine which actions its tools can perform or which actions need approval. Do not treat a sentence in a prompt as a sandbox.',
    'Find the current controls for your installed Codex client and read their matching documentation. Local command access, network access, and connected/browser tools can have separate controls. Record only what applies to this session.',
    'This step is inspection. Keep existing protections and organization policy intact. If you cannot explain an action or cannot find a matching control, record the uncertainty and ask a mentor rather than enabling broad access.',
  ],[
    'Open the official scope section and your current client permission/settings view. Record the installed version and relevant labels.',
    'Without changing settings, describe what you can verify about file reads, file edits, command execution, and network or connected-tool access.',
    'For the hypothetical request to change only README.md, predict what scope is intended and whether the current client would ask before the action; unknown is acceptable if supported by an explanation.',
    'Compare those observations with the earlier inspection trial. Separate documented restrictions from observed prompts and untested behavior.',
    'Explain why adding an AGENTS.md rule cannot grant a missing permission or guarantee confinement. Record one question to resolve before an edit.',
  ],'Record current controls and their official section, one hypothetical action/approval expectation, observed versus untested behavior, and why project instructions are different from permission enforcement. Do not change permissions for this lab.',[
    reading('Codex permission scope and enforcement',codexDocs+'permissions#scope-and-enforcement','Read what profiles control and which tools have separate controls. Stop before example configurations; do not copy configuration from this reading.'),
  ],{filename:'permission-notes.txt',code:'# Describe observed settings; this is not configuration.\nAction: edit README.md in the scratch project\nRequested scope:\nCurrent control and source:\nApproval expected, observed, or unknown:\nWhat this observation does not establish:\n',caption:'Write down the boundary instead of changing it to make an experiment pass.'}),

  toolLab('codex','codex-first-change','project-instructions','Write and verify three project instructions',[
    'Keep durable guidance short enough to read and verify. In the scratch project only, create a root AGENTS.md yourself with the three example rules. Each rule describes a concrete behavior a reviewer can notice.',
    'Read the current discovery rules and check the setup in a fresh session. Ask which instruction files were loaded and whether any override or higher-priority instruction changes the effective guidance. A correct answer establishes discovery for this trial, not permanent obedience.',
    'The file is guidance, not a permission grant. Do not add it to another learning project as a side effect of this exercise.',
  ],[
    'Read project instruction layering and the verification section. Note that a new run/session is needed to check the discovery chain.',
    'Type the commented AGENTS.md example yourself in the root of the scratch folder, then read back its three rules.',
    'Start a fresh Codex session in the same scratch project. Ask it to identify the loaded project instructions and applicable overrides without editing anything.',
    'Compare the reported file and rules with your saved file and current official discovery rules. Record evidence or a mismatch rather than assuming success.',
    'Explain which rule helps scope a task and which tool permission must still be inspected separately. Keep the file and its baseline for the next lesson.',
  ],'Save the small instruction file, the fresh-session discovery evidence, and an explanation of guidance versus enforcement. Identify unknown overrides without copying unrelated private instruction content.',[
    reading('Layer Codex project instructions',codexDocs+'agent-configuration/agents-md#layer-project-instructions','Read repository and nested discovery. Stop before code-review rules.'),
    reading('Verify Codex instruction discovery',codexDocs+'agent-configuration/agents-md#verify-your-setup','Read verification and troubleshooting. Use a fresh session in your scratch folder; do not change global settings.'),
  ],{filename:'AGENTS.md',code:instructions,caption:'Three practice rules, with a comment explaining their limits. This is not an instruction file for your real project.'}),

  toolLab('codex','codex-first-change','review-change','Request one edit, inspect the diff, and hand it off',[
    'Predict the whole intended diff: only Status: Planned becomes Status: Ready in README.md. The comment, heading, and Keep line stay unchanged. The assistant should explain its plan before you authorize this particular edit.',
    'After you approve the plan and it edits, inspect the saved file and diff yourself. Ask which checks ran and inspect their output. For this text fixture, a content comparison is meaningful; a claim that application tests passed would need separate evidence.',
    'Finish by describing what changed, how you checked it, and one uncertainty. As a transfer question, explain whether a later request to change the Keep line was authorized by this first request. A mentor can review that explanation; Foundry does not grade it.',
  ],[
    'Read the review guidance and write your predicted one-line change before sending the request if it is still untried.',
    'Send the commented edit request below. Compare the proposed plan with your scope, then explicitly authorize that one edit if it matches.',
    'Read the resulting diff and saved README yourself. Compare every line with the baseline and preserve any unintended changes for discussion.',
    'Record the actual verification performed and its result. A whitespace check does not prove content correctness; do not invent a test run.',
    'Write a short handoff with client/version, lesson revision, source-check date, request, diff/result, help received, and the Keep-line transfer answer. Leave commits and publishing for a separate decision.',
  ],'Save the request, plan/authorization, actual diff and verification evidence, and your explanation of whether the Keep line may change under that request. Include any help or mismatch honestly.',[
    reading('Codex testing and review',codexDocs+'learn/best-practices#improve-reliability-with-testing-and-review','Read the verification and diff-review guidance. Stop before external-context integrations.'),
  ],{filename:'request.txt',code:editPrompt,caption:'The task has an explicit target, stopping point, and observable result.'}),

  toolLab('claude','claude-orientation','identify-client','Identify Claude Code and check the current setup',[
    'This chapter uses Claude Code in an interactive terminal session. A conversation with Claude in another interface is not evidence that the same commands, file context, or permission controls are available.',
    'Read the current quickstart and release notes, then check your own supported installation. The non-model version command claude --version identifies the installed CLI; it does not run a coding task. Record unknown or blocked if the command is unavailable.',
    'Foundry does not install or launch Claude Code and does not store a provider key. Do your setup yourself using the relevant official platform instructions; do not paste an API key, login token, or account identifier into evidence.',
  ],[
    'Read Before you begin and the install section for your OS. Stop before starting a session in a real project.',
    'Record OS, shell, and surface. If Claude Code is installed, run its documented version command yourself and retain only the version output.',
    'Read the release entry relevant to your version or latest available version, distinguishing installed from latest. Do not silently upgrade.',
    'Compare one setup claim with actual behavior and record your source URL and check date. Stop and seek help if setup does not match.',
    'Explain why a Claude chat or API example is not automatically the same as this CLI workflow. Keep blocked experiments incomplete.',
  ],'Record the CLI version or blocker, OS/shell, exact official section and date checked, and one observed match or mismatch. Keep credentials out of the record.',[
    reading('Claude Code prerequisites',claudeDocs+'quickstart#before-you-begin','Read prerequisites and your platform setup. Stop before Step 2.'),
    reading('Claude Code release notes',claudeDocs+'changelog','Read the entry relevant to your installed version and compare it with the newest entry. Do not copy unrelated settings.'),
  ],{filename:'version-command.txt',code:'# Run this in your own terminal if Claude Code is installed.\n# It reports the CLI version; it does not start a model conversation.\nclaude --version\n',caption:'Record the result rather than treating the newest documentation as your installed version.'}),

  toolLab('claude','claude-orientation','scratch-baseline','Start Claude Code in a scratch project',[
    'A working directory supplies local project context. Choose a new empty scratch folder yourself, separate from Foundry and all real learning/work projects. Type the small README fixture yourself and preserve a baseline.',
    'Start the interactive CLI in that folder using the current quickstart. Inspect the location and any workspace trust or setup information shown before requesting work. Do not accept a prompt for a location you have not identified.',
    'A first session is a chance to verify context, not permission to delegate the whole exercise. Keep the README small enough that you can compare its entire content after a later edit.',
  ],[
    'Choose a new empty scratch folder and confirm it is separate from real projects and Foundry.',
    'Type and save the README example yourself. Identify the future Status-line target and the unchanged Keep line.',
    'Save your own baseline checkpoint or before-copy and explain how you will compare the working file against it.',
    'Follow Step 2 in the current quickstart to start the interactive CLI from that folder. Verify the working location before sending a task.',
    'Record actual session-start behavior and predict which file/line the later task may change. If the session cannot start, record the blocker without claiming completion.',
  ],'Save the scratch-project label, starting README, baseline method, verified working location, and session-start observation. Do not ask the assistant to create or run this learning setup for you.',[
    reading('Start your first Claude Code session',claudeDocs+'quickstart#step-2-start-your-first-session','Read Step 2 for opening the project. Stop before sending the first question in Step 3.'),
  ],{filename:'README.md',code:scratch,caption:'Use the same small fixture if comparing tools, but create an independent scratch folder for each track.'}),

  toolLab('claude','claude-orientation','inspect-file','Follow a read-only question through its tools',[
    'An agent can gather context with tools before replying. This task asks for a fact from a file whose content you already know, making the difference between a plausible answer and inspected evidence easy to discuss.',
    'Predict the Status line, send the inspection request, and inspect the visible file/tool activity alongside the reply. A request for no commands expresses intent; verify actual behavior and current permissions rather than assuming the words enforce it.',
    'Compare the saved README with your baseline. If tools or file access are not visible in your client, record that limit. Do not turn an unavailable observation into a claim that a file was read.',
  ],[
    'Read Step 3 and the agentic-loop section below. Write your expected Status line before trying the request if still untried.',
    'Confirm the scratch working directory and send the commented inspection request as a message in the interactive session.',
    'Observe the reply and visible tool/file activity; distinguish a cited file read from an unsupported assertion or an unobservable action.',
    'Open the saved README yourself, compare Status and the baseline, and retain any unexpected result.',
    'Explain the difference between a requested scope, available tools, and the evidence of what actually happened. Ask a mentor about any mismatch before the next experiment.',
  ],'Save your prediction or prior attempt, request/result, observed tools, file comparison, and one sentence about what this trial does and does not establish.',[
    reading('Ask Claude Code your first question',claudeDocs+'quickstart#step-3-ask-your-first-question','Read Step 3. Stop before the code-change step.'),
    reading('Claude Code agentic loop',claudeDocs+'how-claude-code-works#the-agentic-loop','Read the loop and tools descriptions. Stop at What Claude can access.'),
  ],{filename:'request.txt',code:inspectPrompt,caption:'You are learning to compare the answer with actions and saved source.'}),

  toolLab('claude','claude-first-change','permissions','Read the current permission mode and action scope',[
    'Inspect the actual permission mode and rules in your installed Claude Code session before an edit. The current documentation describes multiple modes; available behavior and defaults can depend on version and environment.',
    'Keep this experiment to observation. Do not switch to a mode that bypasses checks or add broad allow rules to make the task work. Distinguish permission decisions from any separate sandbox boundary.',
    'A request limited to README.md tells Claude what you intend. Understanding current permissions tells you what the tools may actually do. You need both when reviewing a proposed action.',
  ],[
    'Read the permission-system and permission-mode sections. Identify the installed version and the mode label actually shown in your session.',
    'Use the currently documented inspection UI/command to view permissions. Do not change rules or modes for this lesson.',
    'For a hypothetical edit to README.md, record the requested scope and what the current mode/rules lead you to expect about approval. Mark untested behavior explicitly.',
    'Compare this with the inspection trial and read how permissions relate to sandboxing. Record separate controls rather than assuming a prompt is a sandbox.',
    'Explain what you would do if an action requests broader scope than you intended. Resolve any uncertainty with a mentor before authorizing an edit.',
  ],'Record the observed mode and relevant controls, exact docs section, one approval expectation, and guidance versus permission versus sandbox distinctions. Keep configuration unchanged.',[
    reading('Claude Code permission modes',claudeDocs+'permissions#permission-modes','Read the mode descriptions and their limits. Stop before permission-rule syntax; do not copy bypass or allow rules.'),
    reading('Permissions and sandboxing',claudeDocs+'permissions#how-permissions-interact-with-sandboxing','Read the distinction between approval rules and execution boundaries; stop at Managed settings.'),
  ],{filename:'permission-notes.txt',code:'# Observation only; these fields are not executable settings.\nInstalled version and observed mode:\nRequested action: edit scratch README.md\nApproval expected, observed, or unknown:\nSeparate sandbox boundary, if verified:\nQuestion before granting broader scope:\n',caption:'Use the current labels shown by your installed version.'}),

  toolLab('claude','claude-first-change','project-instructions','Write and inspect a small CLAUDE.md',[
    'Use a scratch-root CLAUDE.md to practice three durable instructions. Type it yourself, read each rule, and explain how a reviewer could notice whether the assistant followed it.',
    'Check current discovery behavior in a fresh session and inspect the loaded instruction files with the documented memory view. Different versions or environments may also support AGENTS.md; do not assume that support, or that both files always load together. Read the matching source section if your scratch project already has another instruction file.',
    'Project guidance is distinct from auto memory and tool permissions. It is not a complete conversation history or an enforcement mechanism.',
  ],[
    'Read the project-file setup and memory-view sections, comparing them with your installed version.',
    'Type the commented CLAUDE.md example yourself in the scratch root. Do not put it in another project or global configuration.',
    'Start a fresh interactive session in that scratch folder and inspect the loaded instruction files with the currently documented memory view.',
    'Ask which project rules apply without requesting edits. Compare the answer and loaded-file evidence with the saved file; record any missing/overridden guidance.',
    'Explain one difference between your project instructions, auto memory, and permission enforcement. If AGENTS.md is also present, check its current loading rules before claiming it was used.',
  ],'Save the instruction file and discovery evidence, installed version, source date, and the instructions/auto-memory/permissions distinction. Do not assume two instruction formats load identically.',[
    reading('Set up a project CLAUDE.md',claudeDocs+'memory#set-up-a-project-claude-md','Read project setup and effective instructions. Stop before importing more files.'),
    reading('Inspect Claude Code memory',claudeDocs+'memory#view-and-edit-with-/memory','Read the memory view for loaded files. If relevant, also read the AGENTS.md section for your version; do not change global memory settings.'),
  ],{filename:'CLAUDE.md',code:instructions,caption:'These small rules are authored by the learner in a scratch project.'}),

  toolLab('claude','claude-first-change','review-change','Review a single Claude Code edit and make a handoff',[
    'Predict the same one-line README change you planned: Status becomes Ready while every other line stays the same. Read the proposed plan before authorizing this particular edit.',
    'Compare the actual saved file and diff with your baseline. Inspect what Claude says it checked and the evidence behind that statement. For a text fixture, verifying the content is useful; unrelated application-test claims would need their own evidence.',
    'Make a short handoff another mentor can understand without the whole conversation. Include help received and uncertainty. Explain whether changing the Keep line would need a new scoped request, and why the first task does not authorize publishing.',
  ],[
    'Read the code-change section and write your predicted diff before trying the request if it has not already been attempted.',
    'Send the commented edit request. Compare its plan with the intended single-file change, then explicitly authorize that edit if it matches.',
    'Inspect the saved README and actual diff yourself; compare every line with the baseline and preserve any unwanted change for discussion.',
    'Record what verification actually ran and what it establishes. If no executable check ran, state that directly rather than inventing output.',
    'Save a handoff with version, lesson revision, checked docs/date, request, diff/result, help received, and the Keep-line transfer answer. Ask a mentor to review the reasoning; do not delegate a commit or push.',
  ],'Save the request, plan/authorization, resulting diff, verification evidence, and short transfer explanation. Keep self-reported completion distinct from mentor approval.',[
    reading('Make your first Claude Code change',claudeDocs+'quickstart#step-4-make-your-first-code-change','Read Step 4. Stop before Git delegation in Step 5; this exercise does not authorize a commit or push.'),
  ],{filename:'request.txt',code:editPrompt,caption:'Keep the task narrow enough to review the whole result yourself.'}),
];
