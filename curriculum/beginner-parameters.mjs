// Extend the learner's existing helper; never pre-complete the real project.
const parameters=['Rust Book: Functions — Parameters','https://doc.rust-lang.org/book/ch03-03-how-functions-work.html#parameters'];
const text=['Standard library: str — Basic Usage','https://doc.rust-lang.org/std/primitive.str.html#basic-usage'];
const parameterReading='Read Parameters from its heading through the first one-parameter example and the explanation that parameter types must be declared. Stop before the example with two parameters. Skip creating a new project. In str, read only the opening description and the first quoted-text example under Basic Usage; stop before the lifetime explanation and Representation.';

export const parametersChapter={
  id:'function-inputs',title:'One function, different inputs',sections:[
    {
      id:'argument-prediction',title:'A parameter receives an argument',
      explanation:'A parameter is a named input written in a function definition. An argument is the value supplied by a call. In label: &str, label is the parameter name and &str is its type: borrowed text that this helper can read. Quoted text works as an argument here. Rust requires parameter types to be written in the definition. This : &str is real source text, unlike an optional faded editor hint beside an inferred let binding. Each call supplies its own input; the helper uses its one body with that value. A number in parentheses is an argument, not an automatic repeat instruction. Borrowing details and return values come later.',
      readings:[parameters,text],stoppingPoint:parameterReading,
      example:{filename:'example.rs',caption:'Trace the argument from each call into the same parameter. Read only for now.',code:`fn main() {
    print_label("Notebook"); // Supply the first text argument.
    print_label("Terminal"); // Supply different text to the same function.
}

fn print_label(label: &str) { // Receive one text input named label.
    println!("Label: {label}"); // Read the input supplied by this call.
}`},
      prompt:'Predict the two output lines in order. Identify the parameter name and its declared type, then the argument supplied by each call. Explain why the two calls can print different text while using one definition. Submit this written prediction before editing or running your project.',
      hints:['Find the name inside the definition\'s parentheses, then follow each call\'s quoted value into that name.','The text Label: is printed literally; the placeholder reads this call\'s input.'],
    },
    {
      id:'session-input-plan',title:'Plan a session name supplied by the caller',
      explanation:'Let main choose the name for each summary. Plan one text parameter named session_name on your existing show_session definition, with the type &str. Each existing call will supply one quoted session name. The parameter will provide the binding used by the helper\'s existing name placeholders, so the old fixed let session_name line must be removed when you implement the plan. Keeping that fixed local declaration would hide the supplied name. Keep the rest of your current helper, including its status behavior, unchanged. This still displays text; it does not create real sessions.',
      readings:[parameters,text],stoppingPoint:parameterReading,
      prompt:'Choose two different session names, one for each existing call. Record the complete summaries you expect, including your current status and ending lines if you added them. Describe the parameter name/type, which old local binding will be removed, and what argument each call will supply. Explain why this plan does not need mut for session_name. Submit the plan before editing. Keep any existing status reassignment separate from this input change.',
      hints:['The name input belongs in the function definition\'s parentheses. The chosen values belong in the calls\' parentheses.','An existing mutable status may still need mut for its own later assignment. That does not make the name parameter mutable.'],
    },
    {
      id:'session-input-build',title:'Pass two names to your existing helper',
      explanation:'Implement only the reviewed input plan. Give show_session its one typed parameter, remove its old fixed session_name binding, and update both calls with their planned text arguments. Preserve your print statements, status behavior, comments, and earlier greeting/count exercise. One function body now displays the name selected by each caller.',
      readings:[parameters,text],stoppingPoint:parameterReading,
      commands:[['cargo run','After saving, build and run from the existing Rust practice folder. Keep any actual diagnostic for review.']],
      prompt:'Make the reviewed changes yourself, save, and run cargo run. Submit the full actual terminal result and the relevant definition/call source. In Your learning notes, compare both summaries with the plan and explain where each displayed session name came from. A compiler diagnostic is useful evidence if a call or definition was missed; preserve it rather than pasting expected output.',needsOutput:true,
      hints:['Check the definition and both call sites; changing only one of them leaves the input agreement incomplete.','The parameter provides session_name inside the helper. Look for an old local let line that would replace that input with fixed text.'],
      reveal:'After an attempt, compare this separate example. It uses another helper name and different messages. Adapt the idea yourself rather than replacing your project.',
      revealExample:{filename:'example.rs',caption:'Two calls supply different text to one helper.',code:`fn main() {
    print_badge("Draft"); // First argument.
    print_badge("Review"); // Second argument.
}

fn print_badge(name: &str) { // The parameter receives each argument.
    println!("Badge: {name}"); // Read the supplied text.
}`},
    },
    {
      id:'argument-change-prediction',title:'Predict a change to one call',
      explanation:'Editing a literal inside one call changes the input supplied by that call. The helper definition and the other call can stay unchanged. This differs from the earlier exercise that edited a fixed value inside the shared helper. Trace where the changed text actually enters the program before predicting which summary changes.',
      readings:[parameters],stoppingPoint:'Reuse only the one-parameter example and its explanation. Keep the definition unchanged; do not read return values or add another parameter.',
      example:{filename:'example.rs',caption:'Imagine changing only the second argument, from Notes to Reports.',code:`fn main() {
    print_label("Calendar"); // Leave this argument unchanged.
    print_label("Notes"); // Plan to edit only this quoted text.
}

fn print_label(label: &str) {
    println!("Label: {label}"); // Read the argument for this call.
}`},
      prompt:'Predict both lines after the proposed edit to this example, and explain which call changes its output and why. Then choose one argument in your own main to change to a new session name, leaving the other call alone. Record the complete summaries you expect from your current helper and identify the one literal you will edit. Submit this prediction and plan; do not make the edit yet.',
      hints:['Distinguish the definition, first call, and second call. Only one of those places is being edited.'],
    },
    {
      id:'session-argument-change',title:'Change one argument and compare both summaries',
      explanation:'Apply the one-call literal edit reviewed in the previous section. Keep the helper and the other call unchanged. Use the saved prediction to check whether your change affected the intended summary. All of your current status and ending messages still belong to the same helper body.',
      readings:[parameters],stoppingPoint:'Reuse the first Parameters example only. No parameter reassignment, new helper, or repetition feature is needed.',
      commands:[['cargo run','Run after saving the one reviewed argument edit.']],
      prompt:'Edit the one reviewed argument yourself, save, and run. Submit the full actual output and relevant calls/helper source. Compare both summaries with your prediction and explain why the unchanged call kept its own name. Explain whether this source edit added any runtime reassignment.',needsOutput:true,
      hints:['Check the literal at the call you meant to edit before changing the shared helper.'],
    },
    {
      id:'argument-type-prediction',title:'An argument must match the input type',
      explanation:'A type annotation describes the kind of input the function accepts. Our parameter accepts &str text. Supplying one argument of another kind is different from supplying the wrong number of arguments. In your earlier show_session(2) experiment, the old helper accepted zero inputs. Now the text parameter accepts one input, so check its type as well as the argument count. A repeat count has behavior only when the function is written to use a count; this helper just prints text.',
      readings:[parameters,text],stoppingPoint:parameterReading,
      example:{filename:'example.rs',caption:'This deliberately questionable call is for prediction, not a project edit.',code:`fn main() {
    print_label(2); // Consider whether this argument matches &str.
}

fn print_label(label: &str) { // One text parameter.
    println!("Label: {label}"); // The body is still a text display.
}`},
      prompt:'Without editing or running, predict whether this example compiles and explain your reason using the parameter type and the supplied argument. Then explain what changing only 2 to the quoted text "2" would do. Would either spelling automatically ask the function to run twice? Submit your explanation before the final transfer task.',
      hints:['Count the arguments, then compare the kind of the argument with the type written after the parameter name.','Quotation marks distinguish a text literal from a numeric literal.'],
    },
    {
      id:'caller-binding-transfer',title:'Supply a value through a caller binding',
      explanation:'An argument can be a binding\'s value rather than a literal written directly in the call. Put a read-only text binding in main, then supply its name as one call\'s argument. The caller\'s binding and the helper\'s parameter may have different names: the argument supplies a value, and the parameter gives that input its local name inside the helper. Keep the same text value so you can judge whether changing how it is supplied changed the display.',
      readings:[parameters],stoppingPoint:'Reuse the meaning of a parameter and an argument. Ownership mechanics, String allocation, return values, and UI framework APIs remain later topics.',
      commands:[['cargo run','Run after saving your prediction and the small caller-binding change.']],
      prompt:'First write and save your expected output when one existing quoted argument is replaced with a read-only binding in main containing exactly the same text. Choose a caller binding name different from session_name. Then make that change yourself, keep the other call and helper unchanged, save, and run. Submit complete actual output and relevant source. Compare with the prediction; identify the caller binding, argument, and parameter; explain whether their names must match and whether any reassignment was introduced. Finally, say what you would inspect first if the wrong session name appeared.',needsOutput:true,
      hints:['Follow the value from the let line in main, through that call\'s argument, into the helper parameter.'],
    },
  ],
};
