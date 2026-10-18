// Original examples use different names from the project exercises.
// Prediction sections are reviewed before their matching command sections open.
const variables=['Rust Book: Variables and Mutability','https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html#variables-and-mutability'];
const formatting=['Rust Book: Printing Values with println! Placeholders','https://doc.rust-lang.org/book/ch02-00-guessing-game-tutorial.html#printing-values-with-println-placeholders'];

export const valuesChapter={
  id:'values-variables',title:'Values and variables',sections:[
    {
      id:'value-prediction',title:'A value and a name',
      explanation:'A value is a piece of data, such as quoted text or a whole number. A literal writes a value directly in source. A binding gives a value a name: let introduces the name, = supplies its initial value, and ; ends the statement (one instruction). In the example, message is the name and "Ready." is the text value. Inside the quoted format text, {message} asks println! to insert that name’s value. Those braces are part of the printing format; the braces outside quotes enclose the function body.',
      example:{filename:'example.rs',caption:'Read this example; do not run it yet.',code:`fn main() {
    let message = "Ready."; // Bind a name to a text value.
    println!("{message}"); // Insert the value named message.
}`},
      readings:[variables,formatting],
      stoppingPoint:'In Variables and Mutability, read the opening paragraphs and the first let x = 5 line; stop before x = 6. In Printing Values, read only the placeholder explanation and its small x/y example. Keep your existing Rust practice package; skip the guessing-game setup, input handling, and cargo new instructions.',
      prompt:'Before editing or running anything, write your prediction in Your learning notes: what line would the example print, and why? Then plan a binding named greeting for the exact text currently in your own main.rs: state its value and the output you expect when println! uses that name. Submit this written plan for review. No terminal output is needed yet; the edit-and-run section stays locked.',
      hints:['A name such as message is not itself the quoted text value. Trace which value that name is bound to.','The braces inside "{message}" request substitution. Compare that with printing the literal word "message".'],
    },
    {
      id:'greeting-binding',title:'Use a binding in your greeting',
      explanation:'Now apply the plan reviewed in 6.1 to the existing src/main.rs. Inside main, bind the current greeting text to a name with let, then make println! print the value through that name. Keep your current text and existing comments. The purpose is to give a value a meaningful name while preserving what the program does.',
      readings:[variables,formatting],stoppingPoint:'Reuse the let and captured-name explanations from 6.1 only. No new package, dependency, or type annotation is needed.',
      commands:[['cargo run','From the Rust practice project folder, build if needed and run the saved source. Do this after making the small source edit described in the prompt.']],
      prompt:'Use your reviewed 6.1 plan: add the greeting binding inside main and update the print statement to use it. Save the source and run the command. Paste the actual terminal result and the small source excerpt you changed into Observed output. In Your learning notes, compare the result with your saved prediction and explain which part is the name, which is its value, and how the print statement uses it. You do not need to copy the earlier prediction again.',
      needsOutput:true,
      hints:['Put the binding before the print statement so the name is available when you use it.','Use the same name in the let statement and inside the printing placeholder. Preserve the quotes around the text value and format text.'],
      reveal:'Compare this pattern with your own attempt. Keep your own greeting text, then explain the name and value yourself.',
      revealExample:{filename:'example.rs',caption:'One possible binding-and-print pattern, inside main.',code:`let greeting = "Welcome to Rust!"; // Give the existing text a name.
println!("{greeting}"); // Print the value through that name.`},
    },
    {
      id:'reassignment-prediction',title:'Predict a reassignment',
      explanation:'A binding made with let is immutable by default: this binding does not permit assigning another value to its name. Initializing a binding with let name = value and later assigning with name = value are different operations. A second assignment does not contain let. Read the example and reason about the compiler before trying anything.',
      example:{filename:'example.rs',caption:'Predict what the compiler will do; do not run this example yet.',code:`fn main() {
    let label = "Ready."; // Initialize an immutable binding.
    label = "Working."; // Attempt to assign another value.
    println!("{label}"); // Would execution reach this line?
}`},
      readings:[variables],stoppingPoint:'Read the first reassignment example and its error explanation. Stop before the paragraph beginning “But mutability can be very useful”. Do not apply the compiler’s suggested repair yet.',
      prompt:'Without editing or running, predict whether this example reaches println! or is rejected during compilation. Identify the line responsible and explain what immutable means here. Relate that prediction to trying a second assignment to your own greeting binding. Submit this prediction for review; the compiler experiment stays locked until then.',
      hints:['Look for the difference between the line that introduces label and the later line that assigns to it.'],
    },
    {
      id:'immutable-diagnostic',title:'Read an immutable-binding error',
      explanation:'Test the prediction from 6.3 in your own package. Immediately after the existing greeting binding and before its print statement, add one assignment that gives the same name a different text value, such as "Ready to learn!". Leave let unchanged and do not add mut yet. A compiler rejection is the expected observation for this exercise; it is evidence to explain, not a failed lesson.',
      readings:[variables,['Rust error index: E0384','https://doc.rust-lang.org/error_codes/E0384.html']],
      stoppingPoint:'Read the first E0384 diagnostic and why the second assignment is rejected. Stop before applying a repair; that is the next reviewed section.',
      commands:[['cargo check','Check the saved source without running a program. Keep the complete diagnostic, including the error code and marked lines.']],
      prompt:'Use your reviewed 6.3 prediction, make the one reassignment, save, and run cargo check. Paste the complete diagnostic and the affected source excerpt into Observed output. In Your learning notes, explain which line introduced the binding, which tried to change it, and whether the result matched your prediction. Keep the failed attempt available for review. If you get a different error, preserve that instead of rewriting it as E0384.',
      needsOutput:true,
      hints:['Read the marked source lines and the error code before the suggested fix. The compiler distinguishes the original binding from the attempted reassignment.','Use cargo check for this experiment. A previously built executable can still be on disk after a failed check; running it would not test the rejected source.'],
    },
    {
      id:'mutable-greeting',title:'Allow one value to change',
      explanation:'Adding mut to a let binding permits later assignment to that binding. Use it when a value really needs to change as the program proceeds. The statement order matters: the print statement observes the value after the assignments before it. This step repairs the reassignment reviewed in 6.4.',
      example:{filename:'example.rs',caption:'A separate example of opting into reassignment.',code:`fn main() {
    let mut status = "Ready."; // Permit this binding to change.
    status = "Working."; // Assign another text value.
    println!("{status}"); // Read the value after the assignment.
}`},
      readings:[variables],stoppingPoint:'Read the paragraph introducing mut and the working mutable example. Stop at Declaring Constants; constants and shadowing are later topics.',
      commands:[['cargo run','After the small binding edit and your saved prediction, build the current source and run it.']],
      prompt:'In Your learning notes, first write the greeting you expect after your second assignment and save the draft before running. Add mut to the existing greeting binding, keeping the reassignment and print statement in order. Save and run. Paste the actual output and changed source excerpt, then explain what permission mut added and why that value was printed. Compare with your prediction in the same notes field.',
      needsOutput:true,
      hints:['Make the change where the binding is introduced. The reassignment line and the print statement still refer to the same name.'],
    },
    {
      id:'values-transfer',title:'Try a numeric value with less help',
      explanation:'Apply the same binding idea to a different kind of value. Whole numbers such as 1 and 2 are integer values. Keep your greeting, and add a tiny count demonstration after it inside main. This is a console exercise, not a persistent project feature. You choose the binding and printing statements yourself.',
      readings:[variables,formatting],stoppingPoint:'Use the existing let, mut, and captured-name explanations only if needed. Leave constants, shadowing, and detailed types for later chapters.',
      prompt:'Plan a binding named steps_completed that starts at 1, is printed, is assigned 2, and is printed again. Before running, write and save your predicted two count lines and whether this binding needs mut, with a reason. Then implement the small change in main yourself, save, and run. Paste the relevant source and actual terminal output. Explain the two observed values and what you would check first if they differed from your prediction.',
      commands:[['cargo run','Run only after writing your prediction and saving the small source change.']],needsOutput:true,
      hints:['Decide whether the same binding is assigned another value after it is introduced.','Place each print statement where it will observe the value you intend. Keep the numeric values unquoted.'],
      reveal:'Open this only after an attempt. Compare it with your own reasoning and explain why each print sees its value.',
      revealExample:{filename:'example.rs',caption:'A possible count demonstration, inside main after your greeting.',code:`let mut steps_completed = 1; // The count will be reassigned.
println!("{steps_completed}"); // Observe the starting value.
steps_completed = 2; // Assign the next value.
println!("{steps_completed}"); // Observe the updated value.`},
    },
  ],
};
