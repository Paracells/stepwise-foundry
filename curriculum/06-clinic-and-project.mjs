import { moduleInfo, exercise as e, codeExercise as c, diagnostic as d, project as p, manifest } from './helpers.mjs';
export const modules = [
  moduleInfo('clinic', 'The compiler clinic', 'Practice diagnosing a precise problem before editing.', 'Core Rust', 'errors', ['Each starter in this chapter deliberately contains a compiler error. Run it once, find the first diagnostic, follow the location, and describe the mismatch in your notes before making the repair.', 'Use rustc --explain CODE or the linked error section for context. The goal is not memorizing error numbers. It is learning to connect a compiler explanation with ownership, types, scope, and the contract your function should fulfill.']),
  moduleInfo('agent', 'Capstone: an agent workbench', 'Bring the pieces together in a deterministic tool runner.', 'Capstone', 'book', ['This capstone practices the mechanics useful around an AI agent: typed actions, tool dispatch, budgets, retries, history, and predictable errors. Its tools are deterministic local functions; it makes no model API calls and needs no credentials.', 'Work through the components before opening the multi-file project. Preserve clear boundaries between parsing, validation, tool execution, and orchestration. A future model can propose actions at that boundary, but its output must still be validated before a tool runs.']),
];
const finalFiles={
  'Cargo.toml':manifest,
  'src/lib.rs':'// Public API stays small while parsing and tools remain private.\nmod agent;\nmod tools;\npub use agent::Agent;\n',
  'src/tools.rs':`// Deterministic tools have no filesystem, network, or model effects.
pub fn dispatch(input: &str) -> Result<String, String> {
    let (name, payload) = input.trim().split_once(' ').unwrap_or((input.trim(), ""));
    match name {
        "echo" => Ok(payload.to_owned()),
        "sum" => {
            // Parse and add fallibly: malformed text and overflow are separate errors.
            let mut total = 0i32;
            for word in payload.split_whitespace() {
                let value: i32 = word.parse().map_err(|_| "invalid integer".to_owned())?;
                total = total.checked_add(value).ok_or("sum overflow")?;
            }
            Ok(total.to_string())
        }
        _ => Err("unknown tool".into()),
    }
}
`,
  'src/agent.rs':`pub struct Agent {
    remaining: u32,
    history: Vec<String>,
}
impl Agent {
    pub fn new(budget: u32) -> Self {
        Self { remaining: budget, history: Vec::new() }
    }
    pub fn execute(&mut self, input: &str) -> Result<String, String> {
        // Budget is checked before dispatch; rejected tools do not consume a step.
        if self.remaining == 0 { return Err("budget exhausted".into()); }
        let output = crate::tools::dispatch(input)?;
        // Commit state only after the tool succeeds.
        self.remaining -= 1;
        self.history.push(format!("{input} => {output}"));
        Ok(output)
    }
    pub fn remaining(&self) -> u32 { self.remaining }
    pub fn history(&self) -> &[String] { &self.history }
}
`,
  'src/main.rs':`fn main() {
    // Keep the terminal boundary thin; tests exercise the library directly.
    let mut agent = forge_lesson::Agent::new(3);
    for input in ["echo hello", "sum 2 3", "sum -1 4"] {
        match agent.execute(input) {
            Ok(output) => println!("{output}"),
            Err(error) => eprintln!("{error}"),
        }
    }
}
`,
};
const starterFiles={...finalFiles,
  'src/tools.rs':'// Implement the pure tool boundary before orchestration.\npub fn dispatch(input: &str) -> Result<String, String> { todo!() }\n',
  'src/agent.rs':`pub struct Agent { remaining: u32, history: Vec<String> }
impl Agent {
    pub fn new(budget:u32)->Self { Self { remaining:budget, history:Vec::new() } }
    // Check budget, call dispatch, and commit state only on success.
    pub fn execute(&mut self,input:&str)->Result<String,String> { todo!() }
    pub fn remaining(&self)->u32 { self.remaining }
    pub fn history(&self)->&[String] { &self.history }
}
`,
};
export const lessons = [
  ['clinic', d('clinic-e0596', 'E0596: a mutable borrow needs a mutable binding', 'pub fn append() -> String { let text=String::from("rust"); text.push(\'!\'); text }', 'pub fn append() -> String { let mut text=String::from("rust"); text.push(\'!\'); text }', 'assert_eq!(append(),"rust!");', 'A method taking &mut self needs permission to mutate the receiver. Adding mut to a binding grants that permission for the owned variable. It does not make all shared references to it mutable.', 'Allow the local String to be mutated, append !, and return it.')],
  ['clinic', d('clinic-e0499', 'E0499: two exclusive borrows cannot overlap', 'pub fn bump(n:&mut i32)->i32 { let a=&mut *n; let b=&mut *n; *a+=1; *b+=1; *n }', 'pub fn bump(n:&mut i32)->i32 { { let a=&mut *n; *a+=1; } { let b=&mut *n; *b+=1; } *n }', 'let mut n=3; assert_eq!(bump(&mut n),5); assert_eq!(n,5);', 'Two mutable borrows of the same location cannot both be live. Shortening the first borrow to its last use allows a later exclusive borrow. In ordinary code, directly updating through n is simpler; explicit scopes make this repair visible.', 'Perform the two increments with non-overlapping mutable borrows.')],
  ['clinic', d('clinic-e0716', 'E0716: keep the owner of a temporary alive', 'pub fn label()->String { let view=format!("agent:{}",7).as_str(); view.to_owned() }', 'pub fn label()->String { let owner=format!("agent:{}",7); let view=owner.as_str(); view.to_owned() }', 'assert_eq!(label(),"agent:7");', 'Borrowing through a temporary String can leave a reference after that owner is dropped at the end of a statement. Bind the owner first so its scope covers every use of the borrowed view. A lifetime annotation cannot keep an already dropped temporary alive.', 'Bind the formatted String before borrowing its str view.')],
  ['clinic', d('clinic-e0106', 'E0106: say which input the output borrows', 'pub fn choose(a:&str,_b:&str)->&str { a }', "pub fn choose<'a>(a:&'a str,_b:&str)->&'a str { a }", 'assert_eq!(choose("left","right"),"left");', 'With multiple borrowed inputs and no receiver, elision cannot always determine the source of an output reference. The implementation returns a, so only a needs to share the output lifetime. Do not tie unrelated inputs together without a reason.', 'Annotate the relationship between a and the returned reference, leaving b independent.')],
  ['clinic', d('clinic-e0277', 'E0277: require the behavior a generic function uses', 'pub fn printable<T>(value:T)->String { format!("{value}") }', 'pub fn printable<T:std::fmt::Display>(value:T)->String { format!("{value}") }', 'assert_eq!(printable(42),"42");\nassert_eq!(printable("rust"),"rust");', 'A generic body must be valid for every type allowed by its bounds. Without Display, T may be a type that cannot be formatted with {}. Add the needed trait contract rather than assuming every concrete caller happens to support it.', 'Add the Display bound needed by the format expression.')],
  ['clinic', d('clinic-e0599', 'E0599: bring the providing trait into scope', 'pub fn text()->Vec<u8> { let mut out=Vec::new(); out.write_all(b"rust").unwrap(); out }', 'use std::io::Write;\npub fn text()->Vec<u8> { let mut out=Vec::new(); out.write_all(b"rust").unwrap(); out }', 'assert_eq!(text(),b"rust");', 'Methods supplied by a trait often require that trait to be in scope. Vec<u8> implements Write, but importing the trait tells method lookup to consider its methods. Read compiler suggestions carefully and confirm the proposed trait matches the intended operation.', 'Import std::io::Write so write_all can be called on Vec<u8>.')],
  ['clinic', d('clinic-e0282', 'E0282: give inference enough context', 'pub fn empty_len()->usize { let values=Vec::new(); values.len() }', 'pub fn empty_len()->usize { let values:Vec<i32>=Vec::new(); values.len() }', 'assert_eq!(empty_len(),0);', 'An empty Vec has no elements from which to infer its item type. Calling len does not constrain that item type either. Add a type annotation at the point where it best explains the design, not at every use throughout the function.', 'Choose i32 as the element type of the empty Vec.')],
  ['clinic', d('clinic-e0004', 'E0004: handle every enum alternative', 'pub fn present(n:Option<i32>)->bool { match n { Some(_)=>true } }', 'pub fn present(n:Option<i32>)->bool { match n { Some(_)=>true,None=>false } }', 'assert!(present(Some(0)));\nassert!(!present(None));', 'Exhaustive matching ensures every possible variant produces a defined result. A broad wildcard can hide meaningful alternatives; an explicit None arm makes this small contract clearest. New enum variants can later prompt useful compiler feedback.', 'Handle None explicitly and return false for it.')],
  ['clinic', d('clinic-e0384', 'E0384: assignment and shadowing have different rules', 'pub fn change()->i32 { let n=1; n=2; n }', 'pub fn change()->i32 { let n=1; let n=n+1; n }', 'assert_eq!(change(),2);', 'Assigning to an immutable binding is rejected. Shadowing with a new let creates a new binding and can preserve an immutable style. Adding mut would also be a valid design when the variable is meant to evolve.', 'Use shadowing to derive two from the initial one.')],
  ['clinic', d('clinic-e0515', 'E0515: return an owned value from local storage', 'pub fn make()->&\'static str { let value=String::from("ready"); &value }', 'pub fn make()->String { let value=String::from("ready"); value }', 'assert_eq!(make(),"ready");', 'A function cannot return a reference into a local allocation that will be dropped on return. static does not promote that allocation into permanent storage. Return the String by value to transfer its ownership to the caller.', 'Change the return type to String and return the owned local value.')],
  ['clinic', d('clinic-e0432', 'E0432: follow the actual module path', 'use std::HashMap;\npub fn size()->usize { let map:HashMap<i32,i32>=HashMap::new(); map.len() }', 'use std::collections::HashMap;\npub fn size()->usize { let map:HashMap<i32,i32>=HashMap::new(); map.len() }', 'assert_eq!(size(),0);', 'A path must match where an item is exported. HashMap belongs under std::collections, not directly under std. Use the standard-library search to locate an API rather than repeatedly guessing names.', 'Correct the HashMap import path.')],
  ['clinic', d('clinic-e0061', 'E0061: a call must satisfy the parameter list', 'fn add(a:i32,b:i32)->i32 { a+b }\npub fn answer()->i32 { add(40) }', 'fn add(a:i32,b:i32)->i32 { a+b }\npub fn answer()->i32 { add(40,2) }', 'assert_eq!(answer(),42);', 'Rust function calls provide every required argument with a compatible type. An arity diagnostic identifies the declaration and the supplied call, letting you compare the contract directly. Choose the missing value according to intended behavior rather than merely silencing the error.', 'Supply the missing second argument so answer returns 42.')],
  ['clinic', d('clinic-e0609', 'E0609: use the fields the type actually defines', 'struct User { name:String }\npub fn username()->String { let user=User{name:"Learner".into()}; user.username }', 'struct User { name:String }\npub fn username()->String { let user=User{name:"Learner".into()}; user.name }', 'assert_eq!(username(),"Learner");', 'Struct field names are part of the type definition. A field access cannot invent an alias for a differently named field. The owned local User can move its name String out because no borrowed owner needs to remain intact.', 'Access the defined name field and return its String.')],
  ['agent', c('agent-router', 'Model tool requests as typed data', '#[derive(Debug,PartialEq)]\npub enum Action { Echo(String), Sum(i32,i32) }\npub fn execute(action:Action)->String { match action { Action::Echo(s)=>s, Action::Sum(a,b)=>(a+b).to_string() } }', '#[derive(Debug,PartialEq)]\npub enum Action { Echo(String), Sum(i32,i32) }\npub fn execute(action:Action)->String { todo!() }', 'assert_eq!(execute(Action::Echo("hi".into())),"hi");\nassert_eq!(execute(Action::Sum(2,3)),"5");', 'Typed actions prevent a tool dispatcher from receiving an undefined combination of fields. Every enum variant carries exactly the data its tool needs. A model or text parser should produce validated actions at a boundary rather than constructing arbitrary code to execute.', 'Execute either an owned echo or a two-number sum. Test sums fit i32.')],
  ['agent', e('agent-tools', 'Validate an action before execution', 'pub fn allowed_tool(name: &str) -> Result<&str, &\'static str>', 'match name { "echo"|"sum"=>Ok(name), _=>Err("unknown tool") }', 'assert_eq!(allowed_tool("echo"),Ok("echo"));\nassert_eq!(allowed_tool("sum"),Ok("sum"));\nassert_eq!(allowed_tool("shell"),Err("unknown tool"));', 'A tool registry defines which actions the orchestrator can request. Validation rejects unsupported names before work begins. This small allowlist is only one boundary: real tools also require argument validation, authorization appropriate to their effects, and resource limits.', 'Allow exactly echo and sum; reject every other name.')],
  ['agent', e('agent-budget', 'Make a work limit impossible to underflow', 'pub fn consume(remaining: &mut u32) -> Result<(), &\'static str>', 'if *remaining==0 { return Err("budget exhausted"); }\n*remaining-=1;\nOk(())', 'let mut n=1; assert_eq!(consume(&mut n),Ok(())); assert_eq!(n,0);\nassert_eq!(consume(&mut n),Err("budget exhausted")); assert_eq!(n,0);', 'A budget bounds repeated actions even when a planner never decides to stop. Check before subtraction so a zero budget does not underflow. A real system may track several budgets independently, such as calls, elapsed time, and bytes of output.', 'Consume one available step, or return budget exhausted without changing zero.')],
  ['agent', e('agent-retry', 'Retry only a classified recoverable failure', 'pub fn should_retry(attempt: u32, max_attempts: u32, transient: bool) -> bool', 'transient && attempt < max_attempts', 'assert!(should_retry(1,3,true));\nassert!(!should_retry(3,3,true));\nassert!(!should_retry(1,3,false));\nassert!(!should_retry(0,0,true));', 'Retrying a permanent validation error wastes work, while retrying an operation with side effects can repeat that effect. A retry policy needs both a failure classification and a bound. This function assumes attempt is the number of attempts already used and asks whether another attempt is permitted.', 'Permit a retry only for a transient failure with attempts remaining.')],
  ['agent', e('agent-history', 'Keep only the recent context you can afford', 'pub fn recent(history: &[String], limit: usize) -> Vec<String>', 'history[history.len().saturating_sub(limit)..].to_vec()', 'let h=vec!["a".into(),"b".into(),"c".into()];\nassert_eq!(recent(&h,2),vec!["b".to_owned(),"c".to_owned()]);\nassert!(recent(&h,0).is_empty());\nassert_eq!(recent(&h,9),h);', 'A bounded history is an explicit retention policy. saturating_sub handles limits larger than the current length without underflow. Cloning into a returned Vec makes this snapshot independent from the orchestrator’s mutable history.', 'Return the most recent limit entries, preserving chronological order.')],
  ['agent', c('agent-state', 'Make terminal states explicit', '#[derive(Debug,PartialEq)]\npub enum State { Ready, Working, Done, Failed }\npub fn terminal(state:&State)->bool { matches!(state,State::Done|State::Failed) }', '#[derive(Debug,PartialEq)]\npub enum State { Ready, Working, Done, Failed }\npub fn terminal(state:&State)->bool { todo!() }', 'assert!(terminal(&State::Done)); assert!(terminal(&State::Failed));\nassert!(!terminal(&State::Ready)); assert!(!terminal(&State::Working));', 'An explicit state machine distinguishes work that may continue from work that has finished. Both successful and failed outcomes can be terminal. Adding a state later should prompt a deliberate review of transition and shutdown behavior.', 'Return true only for Done and Failed.')],
  ['agent', e('agent-plan', 'Reject an oversized plan before running any step', 'pub fn validate_plan(steps: &[String], budget: usize) -> Result<(), &\'static str>', 'if steps.len()>budget { return Err("plan exceeds budget"); }\nif steps.iter().any(|s|s.trim().is_empty()) { return Err("empty step"); }\nOk(())', 'assert_eq!(validate_plan(&["echo hi".into()],1),Ok(()));\nassert_eq!(validate_plan(&["a".into(),"b".into()],1),Err("plan exceeds budget"));\nassert_eq!(validate_plan(&["  ".into()],1),Err("empty step"));\nassert_eq!(validate_plan(&[],0),Ok(()));', 'Validation before execution avoids partially running a plan that was invalid from the start. Ordering the validations makes error precedence part of the contract. An empty plan is valid and uses no work; an empty step inside a plan is a malformed request.', 'Reject an oversized plan first, then reject blank steps, otherwise accept.')],
  ['agent', e('agent-log', 'Keep a line-oriented log parseable', 'pub fn escape_log(text: &str) -> String', String.raw`text.replace('\\', "\\\\").replace('\n', "\\n").replace('\r', "\\r")`, String.raw`assert_eq!(escape_log("a\nb"),"a\\nb");
assert_eq!(escape_log("a\\b"),"a\\\\b");
assert_eq!(escape_log("\r"),"\\r");`, 'A line-oriented log needs an encoding for embedded newlines so one event does not become several apparent records. Escape the escape character first to avoid re-escaping your inserted sequences. This is a small log encoding, not a JSON serializer.', 'Escape backslash, newline, and carriage return as the visible sequences shown in the checks; preserve other characters.')],
  ['agent', e('agent-summary', 'Summarize outcomes without hiding failures', 'pub fn summary(results: &[Result<String,String>]) -> (usize,usize)', 'results.iter().fold((0,0),|(ok,err),result| if result.is_ok(){(ok+1,err)}else{(ok,err+1)})', 'assert_eq!(summary(&[Ok("a".into()),Err("offline".into()),Ok("b".into())]),(2,1));\nassert_eq!(summary(&[]),(0,0));', 'An orchestration report should distinguish successful outputs from recorded failures. Counting only successful calls can make an incomplete run look healthy. Keep the original outcomes for investigation while deriving a small summary for the user interface.', 'Return counts of successful and failed results in that order.')],
  ['agent', p('agent-project', 'Build the complete local tool runner', starterFiles, finalFiles,
    'let mut a=forge_lesson::Agent::new(2);\nassert_eq!(a.execute("echo hello"),Ok("hello".into()));\nassert_eq!(a.execute("missing x"),Err("unknown tool".into()));\nassert_eq!(a.remaining(),1);\nassert_eq!(a.execute("sum 2 x"),Err("invalid integer".into()));\nassert_eq!(a.execute("sum 2147483647 1"),Err("sum overflow".into()));\nassert_eq!(a.execute("sum 2 -1 4"),Ok("5".into()));\nassert_eq!(a.history(),&["echo hello => hello".to_owned(),"sum 2 -1 4 => 5".to_owned()]);\nassert_eq!(a.execute("echo again"),Err("budget exhausted".into()));\nlet mut b=forge_lesson::Agent::new(1); assert_eq!(b.execute("sum"),Ok("0".into()));',
    'Build a small multi-file Rust application from the contracts you practiced. tools.rs parses and executes two deterministic tools. agent.rs owns budget and history. lib.rs exposes only Agent, while main.rs demonstrates the public interface. Validation or tool errors must leave budget and history unchanged; successful calls commit both. Use checked addition for sum so overflow has a predictable error in every build profile. Read the external checks carefully, implement the tool boundary first, then orchestration. After it passes, copy the project into your own workspace and extend it with a new typed tool and tests.',
    'Implement echo and sum dispatch, checked integer parsing and addition, budget enforcement, and successful-call history. Exact errors: unknown tool, invalid integer, sum overflow, budget exhausted. Empty sum returns 0; rejected calls do not consume budget.', {minutes:50})],
].map(([module,lesson])=>({module,...lesson}));
