// Append-only teaching sections preserve earlier submissions and review receipts.
// Examples have different names from the learner's project function.
const functions=['Rust Book: Functions — definition and call','https://doc.rust-lang.org/book/ch03-03-how-functions-work.html#functions'];
const variables=['Rust Book: Variables and Mutability — the opening examples','https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html#variables-and-mutability'];
const formatting=['Rust Book: Printing Values with println! Placeholders','https://doc.rust-lang.org/book/ch02-00-guessing-game-tutorial.html#printing-values-with-println-placeholders'];
const functionsOnly='Read Functions from its heading through the first example and the explanation of its output. Stop at Parameters. Keep your existing Rust practice package; skip the instruction to create a new project. This chapter uses functions with empty parentheses: no inputs or return values to learn yet.';

export const functionsChapter={
  id:'first-session-function',title:'Your first useful function',sections:[
    {
      id:'function-call-prediction',title:'Define a function, then call it',
      explanation:'A function is a named group of instructions. Defining it describes those instructions; calling it runs them. fn introduces a definition, the following name identifies the function, and its outer braces enclose its body. Empty parentheses mean this function takes no inputs. A call uses the function name followed by () and, here, a semicolon. Execution starts in main. When main calls another function, that body runs; when it finishes, execution continues after the call. A definition placed below main does not run just because it is written there.',
      readings:[functions],stoppingPoint:functionsOnly,
      example:{filename:'example.rs',caption:'Read and trace this separate example. Do not edit or run yet.',code:`fn main() {
    println!("Before."); // Run the first instruction in main.
    show_notice(); // Call the function defined below.
    println!("After."); // Continue here when the call finishes.
}

fn show_notice() { // Define a named group of instructions.
    println!("A notice."); // This runs when show_notice is called.
}`},
      prompt:'In Your learning notes, identify the line that defines show_notice and the line that calls it. Predict the three lines this program prints, in order, and explain where execution continues after show_notice finishes. Submit this written explanation for review. Keep your project unchanged; the first project edit is a later section.',
      hints:['Start at the first statement inside main, rather than reading every definition as if it ran immediately.','A definition starts with fn. A call inside main asks that function to run. Trace the call before continuing to the next statement in main.'],
    },
    {
      id:'session-function-plan',title:'Plan two lines of session information',
      explanation:'Our first project feature is a fixed session display in the console: a session name and a status. These are just text values for now; displaying them does not start a coding agent or a shell. Plan a function named show_session with no inputs. Its body will introduce two text bindings and print their values with Session: and Status: labels. Put this definition after the closing brace of main. Later, a call at the end of main will use it. Keep the data inside show_session so the body has the names it reads. No later assignment is needed for this fixed display.',
      readings:[functions,formatting],
      stoppingPoint:'Reuse the Functions definition/call explanation, stopping at Parameters. If needed, read only the captured-name placeholder explanation in Printing Values. Skip project creation and all guessing-game input handling.',
      prompt:'Choose a short session name and a status such as Ready. Write the exact two summary lines you want show_session to print, and choose a binding name for each text value. Describe where the function definition and its call will go. Say whether these bindings need mut when they are only printed, with a reason. Submit this plan before editing. Count the two new summary lines separately from the greeting/count output already in your project.',
      hints:['A printed label is ordinary text; a placeholder inside the quoted format text reads the value associated with a binding name.','A new binding does not automatically need mut. Decide whether this body will assign to that binding again after its initialization.'],
    },
    {
      id:'session-function-build',title:'Write your function and call it once',
      explanation:'Now implement the plan reviewed in 7.2. Add show_session as a separate function after main ends, with its own body and empty parentheses. Introduce your two text bindings inside it, then print the two labelled lines from your plan. Add one call at the end of main. Keep your existing greeting, count exercise, and comments. The helper groups a small job under a meaningful name; main says when that job runs.',
      readings:[functions,formatting],
      stoppingPoint:'Reuse the definition/call and captured-name explanations only. Parameters, return values, dependencies, GUI setup, and interactive terminals are outside this step.',
      commands:[['cargo run','From your existing Rust practice project folder, build and run after saving the small source edit.']],
      prompt:'Write show_session and its one call yourself using your reviewed plan, save main.rs, then run cargo run. Paste the complete actual terminal result and your new function plus its call into Observed output. In Your learning notes, compare the two new summary lines with the plan and explain which line calls the function. Existing greeting/count lines can appear before the summary; they are part of the full output too. Preserve any diagnostic and ask for help rather than replacing it with expected output.',
      needsOutput:true,
      hints:['Find the closing brace belonging to main. Place the new function definition after it, and the function call before it.','The call contains the function name and parentheses. The body of that function contains the bindings and print statements.','Check matching names and quoted text, then check each statement-ending semicolon. The body braces outside quotes and placeholder braces inside quotes have different jobs.'],
      reveal:'After trying, compare this separate worked example with your plan. It uses another function name and different values. Keep your own project text and explain your adaptation.',
      revealExample:{filename:'example.rs',caption:'A separate function that prints a small notice.',code:`fn main() {
    show_note(); // Call the helper from main.
}

fn show_note() { // The helper is defined outside main.
    let title = "Notebook"; // Introduce a text binding.
    let state = "Draft"; // This value is only read, not reassigned.
    println!("Title: {title}"); // Insert the title's value.
    println!("State: {state}"); // Insert the state's value.
}`},
    },
    {
      id:'repeated-call-prediction',title:'One definition, two calls',
      explanation:'A function definition can be used by more than one call. Each call starts that function body again. A local binding introduced inside the body is introduced for that call; printing reads it. Calling the function again is different from adding an assignment to an existing binding. Reuse lets us keep one definition of a job rather than writing a second copy of its body.',
      readings:[functions,variables],
      stoppingPoint:'Reuse the first Functions example and explanation of execution order. For mutability, reuse only the opening let/assignment distinction. Skip Parameters, constants, and shadowing.',
      example:{filename:'example.rs',caption:'Predict this example before trying repeated calls in your project.',code:`fn main() {
    show_number(); // First call to the one definition.
    show_number(); // Second call to that same definition.
}

fn show_number() {
    let number = 4; // Introduce a local binding for this call.
    println!("{number}"); // Read it; do not assign another value.
}`},
      prompt:'Without editing or running, predict the two lines printed by this example. Identify how many show_number definitions and calls it contains. Explain whether number needs mut merely because the function is called twice. Submit the prediction and reason; the second-call project edit stays locked until review.',
      hints:['Trace the body afresh for each call. Look for any statement that assigns to number after let introduces it.'],
    },
    {
      id:'session-function-reuse',title:'Reuse your session display',
      explanation:'Use the same show_session definition twice. Add one more call immediately after its existing call in main. Keep the helper body unchanged. Both calls should use that same definition; you are practicing reuse rather than copying the two print statements into main.',
      readings:[functions],stoppingPoint:'Reuse the first Functions example only; no new section of the Book is needed.',
      commands:[['cargo run','Run after saving your expectations and the extra call in main.']],
      prompt:'First write and save the four new summary lines you expect from two calls to your own show_session; keep older greeting/count lines separate in this prediction. Then add the second call, save the source, and run. Paste the full actual result and the relevant function/call excerpt in Observed output. Explain how one definition produced both summaries and whether you added any reassignment. Compare with the prediction already saved in your notes.',
      needsOutput:true,
      hints:['The change in main is another call. You do not need another function definition or another copy of its body.'],
    },
    {
      id:'session-literal-prediction',title:'Edit source or reassign a value?',
      explanation:'Editing a literal in a source file and rebuilding changes the program you will run next. It is different from a second assignment during one run. An immutable binding may have a different initial literal in an edited program; mut is required when the running body assigns to that already initialized binding again. This distinction will let you change the displayed session information in one place while keeping its fixed bindings immutable.',
      readings:[functions,variables],
      stoppingPoint:'Reuse only the function definition/call example and the opening initialization-versus-reassignment examples. Do not add mut, a second assignment, parameters, or shadowing for this source-edit exercise.',
      example:{filename:'example.rs',caption:'Imagine editing only the literal Draft below to Saved, then rebuilding.',code:`fn main() {
    show_state(); // Both calls use the same definition.
    show_state();
}

fn show_state() {
    let state = "Draft"; // The planned edit changes this initial literal.
    println!("{state}"); // This body only reads the binding.
}`},
      prompt:'Before editing or running, predict the example\'s two printed lines after changing only Draft to Saved in the source. Explain whether that source edit requires mut and why. Then choose one initial text literal to change in your own show_session, and record the four summary lines you expect from its two calls. Submit this plan. Leave the actual edit for the next section after review.',
      hints:['Compare editing the text on a let line with adding a separate name = value statement later in the running body. They change different things.','Both calls still refer to the same function definition in the rebuilt program.'],
    },
    {
      id:'session-function-transfer',title:'Change one definition and explain both results',
      explanation:'Apply the one-literal edit reviewed in 7.6 to your own show_session. Keep the two calls and the rest of the helper unchanged. This is a small change to the session display, with fewer hints: use your plan, source, and actual output to judge whether the function behaves as intended.',
      readings:[functions,variables],stoppingPoint:'Use the earlier short excerpts only if you need them. Inputs, return values, shared application state, and UI frameworks remain later steps.',
      commands:[['cargo run','Run after saving the one planned literal edit.']],
      prompt:'Make the one reviewed source edit yourself, save, and run. Put the complete actual output and the relevant source excerpt in Observed output. In Your learning notes, compare with your saved plan, explain why one definition affects both calls, and explain why this did or did not require mut. Finally, say what you would inspect first if only one summary reflected the edit. You do not need to copy the prediction again.',
      needsOutput:true,
      hints:['If you are stuck, first compare the function name at each call with the definition you edited. Keep the original result available for review.'],
    },
  ],
};
