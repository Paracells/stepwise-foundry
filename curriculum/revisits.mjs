// Small, optional retention pilot. These variants do not award course completion.
export const revisits=[
  {
    id:'rust-function-revisit',origin:'first-function',track:'rust',kind:'rust',entryFile:'main.rs',days:1,
    title:'Use a function in a different calculation',
    task:'Write ticket_price(age): tickets cost 3 times the age. Return that integer. Keep the supplied function signature. The checks include zero and negative values to test the calculation, even though a real ticket system would need additional rules.',
    predictionPrompt:'Before checking, predict ticket_price(4), ticket_price(0), and ticket_price(-2). Explain which part supplies the returned value.',
    starter:'// Return the calculated price for the supplied age.\npub fn ticket_price(age: i32) -> i32 {\n    todo!("Implement this changed task")\n}\n',
    solution:'// The final expression supplies the returned integer.\npub fn ticket_price(age: i32) -> i32 {\n    age * 3\n}\n',
    tests:'assert_eq!(ticket_price(4),12); assert_eq!(ticket_price(0),0); assert_eq!(ticket_price(-2),-6); assert_eq!(ticket_price(7),21);',
    hint:'The calculation uses the input each time. In Rust, the final expression without a semicolon supplies this return value.',
    reference:['Rust Book: Functions with Return Values','https://doc.rust-lang.org/book/ch03-03-how-functions-work.html#functions-with-return-values'],
  },
  {
    id:'python-function-revisit',origin:'py-first-function',track:'python',kind:'python',runtime:'python',entryFile:'main.py',days:2,
    title:'Return a calculated distance',
    task:'Write walk_distance(minutes): return 5 times the supplied number of minutes. Keep the supplied function signature. The checks include zero and negative values to test the calculation, not to model valid walking times.',
    predictionPrompt:'Before checking, predict walk_distance(3), walk_distance(0), and walk_distance(-2). Explain how the caller receives the result.',
    starter:'# Return the distance calculated from this call\'s input.\ndef walk_distance(minutes: int) -> int:\n    raise NotImplementedError("Implement this changed task")\n',
    solution:'# return sends the calculated value to the caller.\ndef walk_distance(minutes: int) -> int:\n    return minutes * 5\n',
    tests:'assert walk_distance(3) == 15\nassert walk_distance(0) == 0\nassert walk_distance(-2) == -10\nassert walk_distance(8) == 40',
    hint:'Use the parameter in the calculation and return the result. Printing a value does not return it to the caller.',
    reference:['Python 3.15: Defining Functions','https://docs.python.org/3.15/tutorial/controlflow.html#defining-functions'],
  },
];
export const revisitMap=new Map(revisits.map(item=>[item.id,item]));
export function publicRevisit({solution,tests,hint,reference,...item}){return item;}
