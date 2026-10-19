# Curriculum and source map

420 lessons in 54 chapters across 6 independent tracks. Every lesson has commented code or a concrete field-lab checklist, and a relevant source link.

- Rust: 200 lessons. Learn Rust by writing Rust. Start with Cargo, then build through ownership, concurrency, and systems programming.
- Python: 100 lessons. Learn Python 3.15 through real programs, clear comments, precise documentation, and a testable project workflow.
- PyTorch: 60 lessons. Build from tensor shapes and gradients to training, evaluation, checkpoints, and a complete small model. Python fundamentals are recommended first.
- Hugging Face: 48 lessons. Learn the Hugging Face ecosystem with local datasets, trained tokenizers, tiny transformer architectures, and parameter-efficient adaptation. Python and PyTorch foundations are recommended.
- Codex: 6 lessons. Two introductory chapters for Codex in a local desktop project: inspect context, scope actions, write project guidance, and review one tiny change. Self-reported field labs use your own separate scratch project.
- Claude Code: 6 lessons. Two introductory chapters for the interactive Claude Code CLI: verify setup, inspect a file, understand permissions and instructions, and review a small edit. Self-reported field labs use your own separate scratch project.

Python exercises use Python 3.15. PyTorch 2.14 and Hugging Face use a separate Python 3.14 CPU environment for binary-wheel compatibility. Built-in ML exercises use local data and tiny randomly initialized models, not downloaded pretrained weights.

This is a broad original curriculum, not a reproduction or exhaustive implementation of every documentation entry. Field labs are self-reported; host models do not establish hardware behavior.

## Rust / Set up your workbench

A project you can understand from the first file.

A Rust program starts as ordinary text. rustc turns that text into machine code, and Cargo organizes the files, dependencies, build commands, and tests around it. You will use the real tools installed on your computer throughout this course.

Begin with the setup checklist. Then edit the exercise files, run the program to see its behavior, and run the checks to test the requirements. Compiler errors are feedback: start with the first error, read the location, and make one focused change. There is no score or timer to beat.

Your drafts, attempts, notes, and completed checks are saved on this computer. Use the Progress page to export a portable backup or a mentor report when you want help. Lessons remain open so you can revisit a topic or inspect what is coming next.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 1. Install, inspect, and create a project | Field lab | [Installing Rust](https://doc.rust-lang.org/book/ch01-01-installation.html) |
| 2. Your first running program | Rust checks | [Hello, World!](https://doc.rust-lang.org/book/ch01-02-hello-world.html) |
| 3. Give your project an identity | Cargo project | [Hello, Cargo!](https://doc.rust-lang.org/book/ch01-03-hello-cargo.html) |
| 4. Give a calculation a name | Rust checks | [Functions and return values](https://doc.rust-lang.org/book/ch03-03-how-functions-work.html) |
| 5. Build a useful message | Rust checks | [Formatting strings](https://doc.rust-lang.org/std/fmt/index.html) |
| 6. Read a compiler error | Rust checks | [E0308: mismatched types](https://doc.rust-lang.org/error_codes/E0308.html) |
| 7. Use checks as a specification | Rust checks | [Functions and return values](https://doc.rust-lang.org/book/ch03-03-how-functions-work.html) |
| 8. Write a contract for a reader | Rust checks | [Writing documentation comments](https://doc.rust-lang.org/rustdoc/how-to-write-documentation.html) |

## Rust / Values, types & decisions

Learn to say exactly what a program means.

A variable binds a name to a value. Its type describes which operations make sense. Rust checks types before your program runs, so a mistaken assumption becomes a compiler message instead of a surprise later.

Work slowly through signed numbers, booleans, text, and compound values. For each function, predict the result of the examples before running it. The examples double as executable checks.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 9. Name an intermediate value | Rust checks | [Variables and mutability](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html) |
| 10. Update a value deliberately | Rust checks | [Variables and mutability](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html) |
| 11. Transform a binding with shadowing | Rust checks | [Shadowing](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html#shadowing) |
| 12. Know what integer division keeps | Rust checks | [Data types](https://doc.rust-lang.org/book/ch03-02-data-types.html) |
| 13. Use floating point for a measurement | Rust checks | [Data types](https://doc.rust-lang.org/book/ch03-02-data-types.html) |
| 14. Combine conditions | Rust checks | [Data types](https://doc.rust-lang.org/book/ch03-02-data-types.html) |
| 15. Unpack a tuple | Rust checks | [Data types](https://doc.rust-lang.org/book/ch03-02-data-types.html) |
| 16. Read an array safely | Rust checks | [slice::first](https://doc.rust-lang.org/std/primitive.slice.html#method.first) |

## Rust / Functions & control flow

Turn small decisions into dependable behavior.

A function gives a piece of behavior a name and a contract: inputs and a return type. An expression produces a value; a semicolon usually turns an expression into a statement.

Loops repeat work, while branches choose work. Pay special attention to empty inputs, boundaries, and termination. These habits matter just as much in a small exercise as in a long-running service.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 17. Choose a value with if | Rust checks | [Control flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |
| 18. Describe ranges with match | Rust checks | [The match control flow construct](https://doc.rust-lang.org/book/ch06-02-match.html) |
| 19. Accumulate with a for loop | Rust checks | [Control flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |
| 20. Repeat until a condition changes | Rust checks | [Control flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |
| 21. Return a value from a loop | Rust checks | [Control flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |
| 22. Reject an invalid input early | Rust checks | [Control flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |
| 23. Walk over borrowed values | Rust checks | [Control flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |
| 24. Combine rules in the right order | Rust checks | [Control flow](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |

## Rust / Ownership & borrowing

Understand who owns a value and who may use it.

Every value has an owner. Moving an owned value transfers responsibility for it. Borrowing lets a function use a value without taking ownership, and a mutable borrow permits controlled changes.

Trace the lifetime of each value from creation to its last use. Shared references allow observation; exclusive references allow mutation. The rules prevent invalid memory access without a garbage collector. Cloning is sometimes useful, but first ask whether borrowing expresses the intent.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 25. Observe without taking ownership | Rust checks | [References and borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html) |
| 26. Change through an exclusive borrow | Rust checks | [References and borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html) |
| 27. Repair a moved value: E0382 | Rust checks | [Ownership and moves](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) |
| 28. Distinguish Copy from a move | Rust checks | [Ownership and moves](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) |
| 29. Borrow a slice of text | Rust checks | [The slice type](https://doc.rust-lang.org/book/ch04-03-slices.html) |
| 30. End a borrow before mutation: E0502 | Rust checks | [References and borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html) |
| 31. Borrow disjoint regions | Rust checks | [slice::swap](https://doc.rust-lang.org/std/primitive.slice.html#method.swap) |
| 32. Return ownership instead of a dangling borrow | Rust checks | [Ownership and moves](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html) |

## Rust / Structs, enums & patterns

Represent your domain so invalid states are harder to express.

A struct groups fields that belong together. An enum describes a choice among named alternatives, including alternatives that carry different data. Methods put useful behavior next to the data it operates on.

Pattern matching makes those choices explicit. Exhaustive matches let the compiler tell you when a new variant needs attention. Option represents a value that may be absent without inventing a magic number or null reference.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 33. Model a rectangle | Rust checks | [Defining and instantiating structs](https://doc.rust-lang.org/book/ch05-01-defining-structs.html) |
| 34. Attach behavior with impl | Rust checks | [Method syntax](https://doc.rust-lang.org/book/ch05-03-method-syntax.html) |
| 35. Describe alternatives with an enum | Rust checks | [The match control flow construct](https://doc.rust-lang.org/book/ch06-02-match.html) |
| 36. Handle absence explicitly | Rust checks | [Option::unwrap_or](https://doc.rust-lang.org/std/option/enum.Option.html#method.unwrap_or) |
| 37. Handle one pattern with if let | Rust checks | [Concise control flow with if let and let else](https://doc.rust-lang.org/book/ch06-03-if-let.html) |
| 38. Refine a pattern with a guard | Rust checks | [The match control flow construct](https://doc.rust-lang.org/book/ch06-02-match.html) |
| 39. Prevent a unit mix-up | Rust checks | [The newtype pattern](https://doc.rust-lang.org/book/ch20-02-advanced-traits.html#using-the-newtype-pattern-to-implement-external-traits-on-external-types) |
| 40. Unwrap a prerequisite with let else | Rust checks | [Concise control flow with if let and let else](https://doc.rust-lang.org/book/ch06-03-if-let.html) |

## Rust / Packages & visibility

Grow beyond a single file without losing your bearings.

A package is managed by a Cargo manifest. A crate is a compilation unit, commonly a library or a binary. Modules organize names inside a crate; use brings paths into a scope without moving the definitions.

Keep implementation details private and expose a small, useful interface. The exercises move from inline modules to real files so you can see where the language namespace meets the filesystem.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 41. Create a small public interface | Rust checks | [Separating modules into different files](https://doc.rust-lang.org/book/ch07-05-separating-modules-into-different-files.html) |
| 42. Bring a path into scope | Rust checks | [Bringing paths into scope with use](https://doc.rust-lang.org/book/ch07-04-bringing-paths-into-scope-with-the-use-keyword.html) |
| 43. Move a module into its own file | Cargo project | [Separating modules into different files](https://doc.rust-lang.org/book/ch07-05-separating-modules-into-different-files.html) |
| 44. Offer a stable path with pub use | Rust checks | [Bringing paths into scope with use](https://doc.rust-lang.org/book/ch07-04-bringing-paths-into-scope-with-the-use-keyword.html) |
| 45. Limit visibility to the crate | Rust checks | [Visibility and privacy](https://doc.rust-lang.org/reference/visibility-and-privacy.html) |
| 46. Compile a platform-specific branch | Rust checks | [Conditional compilation](https://doc.rust-lang.org/reference/conditional-compilation.html) |

## Rust / Collections & Unicode

Store, search, and transform real data.

Vec owns a growable sequence, String owns UTF-8 text, and maps associate keys with values. Each collection makes different operations convenient; choose according to how you will access the data.

UTF-8 text is not an array of characters. Bytes, Unicode scalar values, and user-perceived characters are distinct. These lessons use chars when scalar values matter and avoid slicing arbitrary byte positions.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 47. Build and return a Vec | Rust checks | [Vec operations](https://doc.rust-lang.org/std/vec/struct.Vec.html) |
| 48. Filter a collection in place | Rust checks | [Vec operations](https://doc.rust-lang.org/std/vec/struct.Vec.html) |
| 49. Sort before removing duplicates | Rust checks | [Vec operations](https://doc.rust-lang.org/std/vec/struct.Vec.html) |
| 50. Count characters without byte indexing | Rust checks | [Strings, UTF-8, and iteration](https://doc.rust-lang.org/book/ch08-02-strings.html) |
| 51. Transform text at valid boundaries | Rust checks | [Strings, UTF-8, and iteration](https://doc.rust-lang.org/book/ch08-02-strings.html) |
| 52. Count words with the entry API | Rust checks | [HashMap::entry](https://doc.rust-lang.org/std/collections/struct.HashMap.html#method.entry) |
| 53. Represent membership with a set | Rust checks | [HashSet](https://doc.rust-lang.org/std/collections/struct.HashSet.html) |
| 54. Process work in arrival order | Rust checks | [VecDeque](https://doc.rust-lang.org/std/collections/struct.VecDeque.html) |

## Rust / Errors without surprises

Make failure part of the contract.

Result<T, E> describes an operation that can succeed with T or fail with E. Match or propagate recoverable failures; reserve panics for broken assumptions that the caller cannot reasonably recover from.

A good error carries enough context to decide what to do next. Avoid using unwrap on untrusted inputs. Start with small parsing errors, then combine multiple fallible steps with the question-mark operator.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 55. Return a parsing error | Rust checks | [Recoverable errors with Result](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) |
| 56. Propagate failure with ? | Rust checks | [Recoverable errors with Result](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) |
| 57. Translate an error into your domain | Rust checks | [Recoverable errors with Result](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) |
| 58. Use ? with optional values | Rust checks | [Option and fallible transformations](https://doc.rust-lang.org/std/option/enum.Option.html#method.transpose) |
| 59. Stop a collection at the first error | Rust checks | [Recoverable errors with Result](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) |
| 60. Give a failure a concrete type | Rust checks | [Recoverable errors with Result](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html) |
| 61. Treat overflow as a recoverable failure | Rust checks | [u32::checked_mul](https://doc.rust-lang.org/std/primitive.u32.html#method.checked_mul) |
| 62. Separate missing data from invalid data | Rust checks | [Option and fallible transformations](https://doc.rust-lang.org/std/option/enum.Option.html#method.transpose) |

## Rust / Generics & traits

Reuse behavior without erasing its meaning.

Generic parameters describe families of types. Trait bounds state which operations those types must support, allowing the compiler to verify every use.

Traits are contracts, not just a way to reduce typing. Prefer a bound that expresses the actual operation you need. You will compare static dispatch, trait objects, associated types, and conversions.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 63. Write one function for many element types | Rust checks | [Generic data types](https://doc.rust-lang.org/book/ch10-01-syntax.html) |
| 64. State the comparison you need | Rust checks | [Generic data types](https://doc.rust-lang.org/book/ch10-01-syntax.html) |
| 65. Put a type parameter on a struct | Rust checks | [Generic data types](https://doc.rust-lang.org/book/ch10-01-syntax.html) |
| 66. Implement a behavior contract | Rust checks | [Traits as shared behavior](https://doc.rust-lang.org/book/ch10-02-traits.html) |
| 67. Reuse a default trait method | Rust checks | [Traits as shared behavior](https://doc.rust-lang.org/book/ch10-02-traits.html) |
| 68. Accept anything that can be displayed | Rust checks | [Traits as shared behavior](https://doc.rust-lang.org/book/ch10-02-traits.html) |
| 69. Choose behavior at runtime | Rust checks | [Trait objects](https://doc.rust-lang.org/book/ch18-02-trait-objects.html) |
| 70. Make an infallible conversion explicit | Rust checks | [From conversions](https://doc.rust-lang.org/std/convert/trait.From.html) |

## Rust / Lifetimes & API design

Describe relationships between borrowed values.

A lifetime annotation describes how long references must remain valid relative to one another. It does not keep a value alive or change when it is dropped. The compiler often infers these relationships through elision rules.

When a signature becomes difficult, ask what should be owned. An API returning an owned value can be simpler than borrowing from temporary data. Use borrowing where it has a clear relationship to caller-owned storage.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 71. Relate two inputs to one output | Rust checks | [Validating references with lifetimes](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html) |
| 72. Store a reference in a struct | Rust checks | [Validating references with lifetimes](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html) |
| 73. Let a single input lifetime be inferred | Rust checks | [Validating references with lifetimes](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html) |
| 74. Borrow when possible, own when needed | Rust checks | [Borrowed and owned data with Cow](https://doc.rust-lang.org/std/borrow/enum.Cow.html) |
| 75. Use static only for data that lives long enough | Rust checks | [Validating references with lifetimes](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html) |
| 76. Choose ownership at an API boundary | Rust checks | [Vec::remove](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.remove) |

## Rust / Tests & refactoring

Build evidence that survives a rewrite.

A meaningful test exercises observable behavior and a boundary that could reasonably fail. Unit tests inspect small pieces; integration tests use a public API; documentation tests ensure examples remain executable.

Passing tests is evidence for the cases they cover. It is not a proof of memory soundness or a guarantee about all inputs. Read the failure output, reduce the case, fix the behavior, and retain the regression test.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 77. Cover the threshold on both sides | Rust checks | [Writing useful tests](https://doc.rust-lang.org/book/ch11-01-writing-tests.html) |
| 78. Fix a bug and keep its smallest example | Rust checks | [Writing useful tests](https://doc.rust-lang.org/book/ch11-01-writing-tests.html) |
| 79. Write a test that can fail | Rust checks | [Writing useful tests](https://doc.rust-lang.org/book/ch11-01-writing-tests.html) |
| 80. Test a library from outside | Cargo project | [Test organization](https://doc.rust-lang.org/book/ch11-03-test-organization.html) |
| 81. Make the documentation executable | Cargo project | [Documentation tests](https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html) |
| 82. Check an invariant across many inputs | Rust checks | [Writing useful tests](https://doc.rust-lang.org/book/ch11-01-writing-tests.html) |

## Rust / The compiler clinic

Practice diagnosing a precise problem before editing.

Each starter in this chapter deliberately contains a compiler error. Run it once, find the first diagnostic, follow the location, and describe the mismatch in your notes before making the repair.

Use rustc --explain CODE or the linked error section for context. The goal is not memorizing error numbers. It is learning to connect a compiler explanation with ownership, types, scope, and the contract your function should fulfill.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 83. E0596: a mutable borrow needs a mutable binding | Rust checks | [E0596: compiler explanation](https://doc.rust-lang.org/error_codes/E0596.html) |
| 84. E0499: two exclusive borrows cannot overlap | Rust checks | [E0499: compiler explanation](https://doc.rust-lang.org/error_codes/E0499.html) |
| 85. E0716: keep the owner of a temporary alive | Rust checks | [E0716: compiler explanation](https://doc.rust-lang.org/error_codes/E0716.html) |
| 86. E0106: say which input the output borrows | Rust checks | [E0106: compiler explanation](https://doc.rust-lang.org/error_codes/E0106.html) |
| 87. E0277: require the behavior a generic function uses | Rust checks | [E0277: compiler explanation](https://doc.rust-lang.org/error_codes/E0277.html) |
| 88. E0599: bring the providing trait into scope | Rust checks | [E0599: compiler explanation](https://doc.rust-lang.org/error_codes/E0599.html) |
| 89. E0282: give inference enough context | Rust checks | [E0282: compiler explanation](https://doc.rust-lang.org/error_codes/E0282.html) |
| 90. E0004: handle every enum alternative | Rust checks | [E0004: compiler explanation](https://doc.rust-lang.org/error_codes/E0004.html) |
| 91. E0384: assignment and shadowing have different rules | Rust checks | [E0384: compiler explanation](https://doc.rust-lang.org/error_codes/E0384.html) |
| 92. E0515: return an owned value from local storage | Rust checks | [E0515: compiler explanation](https://doc.rust-lang.org/error_codes/E0515.html) |
| 93. E0432: follow the actual module path | Rust checks | [E0432: compiler explanation](https://doc.rust-lang.org/error_codes/E0432.html) |
| 94. E0061: a call must satisfy the parameter list | Rust checks | [E0061: compiler explanation](https://doc.rust-lang.org/error_codes/E0061.html) |
| 95. E0609: use the fields the type actually defines | Rust checks | [E0609: compiler explanation](https://doc.rust-lang.org/error_codes/E0609.html) |

## Rust / Closures & iterators

Compose transformations you can still reason about.

Closures capture values from their environment. Iterators separate the production of values from their consumption. Most iterator adapters are lazy: nothing happens until something asks for the next item.

Build a pipeline one step at a time. Check the item type after each adapter, especially whether it is owned or borrowed. Favor a straightforward loop whenever a pipeline becomes harder to read.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 96. Transform with map | Rust checks | [Processing sequences with iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html) |
| 97. Keep only successful transformations | Rust checks | [Processing sequences with iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html) |
| 98. Carry state through fold | Rust checks | [Processing sequences with iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html) |
| 99. Pair related sequences | Rust checks | [Processing sequences with iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html) |
| 100. Retain positions while filtering | Rust checks | [Processing sequences with iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html) |
| 101. Capture a parameter in a closure | Rust checks | [Capturing the environment with closures](https://doc.rust-lang.org/book/ch13-01-closures.html) |
| 102. Implement Iterator with an associated type | Rust checks | [Processing sequences with iterators](https://doc.rust-lang.org/book/ch13-02-iterators.html) |
| 103. Accept behavior as an input | Rust checks | [Traits as shared behavior](https://doc.rust-lang.org/book/ch10-02-traits.html) |

## Rust / Smart pointers & ownership graphs

Make indirection and shared ownership explicit.

Box owns a heap allocation, Rc shares ownership on one thread, and Arc shares ownership with atomic reference counting. RefCell moves borrow checking to runtime, while Mutex coordinates access across threads.

Shared ownership does not automatically mean shared mutation. Sketch which objects own which others. Cycles of strong references can leak; Weak describes a relationship that should not keep a value alive.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 104. Own a value behind a Box | Rust checks | [Using Box to point to data on the heap](https://doc.rust-lang.org/book/ch15-01-box.html) |
| 105. Give a recursive type a finite size | Rust checks | [Using Box to point to data on the heap](https://doc.rust-lang.org/book/ch15-01-box.html) |
| 106. Share one allocation on one thread | Rust checks | [Rc shared ownership](https://doc.rust-lang.org/book/ch15-04-rc.html) |
| 107. Mutate through runtime borrow checking | Rust checks | [RefCell and interior mutability](https://doc.rust-lang.org/book/ch15-05-interior-mutability.html) |
| 108. Observe without extending ownership | Rust checks | [Reference cycles and Weak](https://doc.rust-lang.org/book/ch15-06-reference-cycles.html) |
| 109. Use Drop for deterministic cleanup | Rust checks | [Cleaning up with Drop](https://doc.rust-lang.org/book/ch15-03-drop.html) |
| 110. Move out while leaving a valid state | Rust checks | [Option::take](https://doc.rust-lang.org/std/option/enum.Option.html#method.take) |
| 111. Borrow through a smart pointer | Rust checks | [Deref coercions](https://doc.rust-lang.org/book/ch15-02-deref.html) |

## Rust / Threads & synchronization

Coordinate work with clear ownership and shutdown.

A thread can execute independently of other threads. Ownership and the Send and Sync traits help the compiler enforce safe transfers and shared access. They do not prevent deadlocks or guarantee a correct protocol.

Join every worker you start in these exercises. Keep lock scopes short, avoid relying on scheduling order, and think about what happens when a sender or receiver disappears. Tests should check results rather than hoping one interleaving occurs.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 112. Move work to a thread and join it | Rust checks | [Using threads](https://doc.rust-lang.org/book/ch16-01-threads.html) |
| 113. Borrow local data with scoped threads | Rust checks | [Scoped threads](https://doc.rust-lang.org/std/thread/fn.scope.html) |
| 114. Transfer ownership through a channel | Rust checks | [Message passing between threads](https://doc.rust-lang.org/book/ch16-02-message-passing.html) |
| 115. Use channel closure as a shutdown signal | Rust checks | [Message passing between threads](https://doc.rust-lang.org/book/ch16-02-message-passing.html) |
| 116. Coordinate a shared counter | Rust checks | [Shared-state concurrency](https://doc.rust-lang.org/book/ch16-03-shared-state.html) |
| 117. Use an atomic for an independent count | Rust checks | [Atomic memory ordering](https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html) |
| 118. Initialize shared data at most once | Rust checks | [OnceLock initialization](https://doc.rust-lang.org/std/sync/struct.OnceLock.html) |
| 119. Choose shared reads and exclusive writes | Rust checks | [RwLock guards](https://doc.rust-lang.org/std/sync/struct.RwLock.html) |

## Rust / Async Rust from the ground up

Understand futures before choosing a runtime.

A future represents a computation that may not be ready yet. Calling an async function constructs a future; polling it drives progress. await can suspend the surrounding future, letting an executor run other work.

The standard library supplies Future, Poll, Pin, and task interfaces, but it does not supply a general-purpose async I/O runtime. These dependency-free exercises inspect futures directly. The field lab then connects those concepts to Tokio in your own project.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 120. Construct an immediately ready future | Rust checks | [Future and polling](https://doc.rust-lang.org/std/future/trait.Future.html) |
| 121. Compose a future with await | Rust checks | [Future and polling](https://doc.rust-lang.org/std/future/trait.Future.html) |
| 122. Implement a small Future | Rust checks | [Future and polling](https://doc.rust-lang.org/std/future/trait.Future.html) |
| 123. Request another poll before returning Pending | Rust checks | [Waker notification](https://doc.rust-lang.org/std/task/struct.Waker.html) |
| 124. Own a pinned future | Rust checks | [Pin and pointer stability](https://doc.rust-lang.org/std/pin/index.html) |
| 125. Connect futures to a real async runtime | Field lab | [Tokio tutorial](https://tokio.rs/tokio/tutorial) |

## Rust / Build a useful CLI

Inputs, configuration, errors, and output with a purpose.

A command-line program is a real application with an interface: arguments and input streams come in; output, diagnostics, and an exit status go out. Keep the core logic independent of the terminal so it is easy to test.

This chapter builds the pieces of a small search tool. Argument parsing and configuration are intentionally dependency-free here. More complex programs benefit from established crates; learn the contracts first so you can evaluate those abstractions.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 126. Validate a small argument list | Rust checks | [Parsing CLI arguments](https://rust-cli.github.io/book/tutorial/cli-args.html) |
| 127. Extract a testable search engine | Rust checks | [Building a CLI implementation](https://rust-cli.github.io/book/tutorial/impl-draft.html) |
| 128. Add a controlled search option | Rust checks | [Building a CLI implementation](https://rust-cli.github.io/book/tutorial/impl-draft.html) |
| 129. Add line numbers without losing context | Rust checks | [Building a CLI implementation](https://rust-cli.github.io/book/tutorial/impl-draft.html) |
| 130. Parse configuration without hiding mistakes | Rust checks | [Configuration files](https://rust-cli.github.io/book/in-depth/config-files.html) |
| 131. Choose an exit status deliberately | Rust checks | [Exit codes](https://rust-cli.github.io/book/in-depth/exit-code.html) |
| 132. Add context at the boundary | Rust checks | [Building a CLI implementation](https://rust-cli.github.io/book/tutorial/impl-draft.html) |
| 133. Finish and package your search tool | Field lab | [Packaging and distributing a Rust tool](https://rust-cli.github.io/book/tutorial/packaging.html) |

## Rust / Cargo beyond cargo run

Understand what your build is actually building.

Cargo coordinates packages, dependencies, targets, build profiles, and features. Cargo.toml describes your intent; Cargo.lock records concrete dependency resolution. Neither replaces testing the public behavior of your crate.

These projects use local path dependencies and offline builds, so no registry download is needed. Field labs cover commands that create distributable artifacts or inspect your own project. Publishing remains an explicit action you perform yourself.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 134. Describe a reusable library | Cargo project | [The Cargo manifest format](https://doc.rust-lang.org/cargo/reference/manifest.html) |
| 135. Share library logic with a binary | Cargo project | [The Cargo manifest format](https://doc.rust-lang.org/cargo/reference/manifest.html) |
| 136. Use a local path dependency | Cargo project | [The Cargo manifest format](https://doc.rust-lang.org/cargo/reference/manifest.html) |
| 137. Select optional behavior with a feature | Cargo project | [Cargo features](https://doc.rust-lang.org/cargo/reference/features.html) |
| 138. Place related packages in a workspace | Cargo project | [Cargo workspaces](https://doc.rust-lang.org/cargo/reference/workspaces.html) |
| 139. Make overflow policy explicit in release | Cargo project | [Cargo profiles](https://doc.rust-lang.org/cargo/reference/profiles.html) |
| 140. Inspect dependency resolution and reproducibility | Field lab | [Cargo.lock and reproducibility](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html) |
| 141. Audit a local package before sharing it | Field lab | [cargo package](https://doc.rust-lang.org/cargo/commands/cargo-package.html) |

## Rust / rustc, rustdoc & diagnostics

Learn to ask the toolchain better questions.

rustc checks and compiles crates, while rustdoc turns documentation comments into browsable API documentation. Cargo invokes both with consistent package configuration. Lints add feedback beyond the core type rules.

Learn the difference between a warning, a hard error, and a failing behavior test. A tool is most useful when you understand what it did verify and what it could not verify.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 142. Document an API with an example | Cargo project | [How to write documentation](https://doc.rust-lang.org/rustdoc/how-to-write-documentation.html) |
| 143. Keep examples complete with hidden setup | Cargo project | [Documentation tests](https://doc.rust-lang.org/rustdoc/write-documentation/documentation-tests.html) |
| 144. Turn a warning into a contract | Rust checks | [Compiler lint levels](https://doc.rust-lang.org/rustc/lints/levels.html) |
| 145. Repair an invalid cast: E0606 | Rust checks | [E0606: invalid cast](https://doc.rust-lang.org/error_codes/E0606.html) |
| 146. Inspect what rustc sees | Field lab | [rustc command-line arguments](https://doc.rust-lang.org/rustc/command-line-arguments.html) |
| 147. Explore edition and lint migration safely | Field lab | [The Rust 2024 Edition](https://doc.rust-lang.org/edition-guide/rust-2024/index.html) |

## Rust / The standard library in practice

Work with paths, streams, bytes, time, and addresses.

The standard library offers operating-system interfaces as well as collections and language support. Paths are not always UTF-8 strings, I/O operations can be partial, and bytes arriving from outside a process need validation.

These exercises use in-memory streams and pure boundary logic to stay repeatable across platforms. The project labs connect that logic to real files and terminal processes on your computer.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 148. Build a path using path operations | Rust checks | [Path and PathBuf](https://doc.rust-lang.org/std/path/index.html) |
| 149. Read lines through a buffered interface | Rust checks | [BufRead::lines](https://doc.rust-lang.org/std/io/trait.BufRead.html#method.lines) |
| 150. Write the entire message | Rust checks | [Write::write_all](https://doc.rust-lang.org/std/io/trait.Write.html#method.write_all) |
| 151. Represent time with a unit-aware type | Rust checks | [Duration arithmetic](https://doc.rust-lang.org/std/time/struct.Duration.html) |
| 152. Distinguish missing configuration from bad encoding | Rust checks | [Environment variable errors](https://doc.rust-lang.org/std/env/enum.VarError.html) |
| 153. Decode a fixed-width binary value | Rust checks | [Integers and byte order](https://doc.rust-lang.org/std/primitive.u32.html#method.from_le_bytes) |
| 154. Parse a network address without opening a socket | Rust checks | [SocketAddr parsing](https://doc.rust-lang.org/std/net/enum.SocketAddr.html) |
| 155. Build a deterministic process result summary | Rust checks | [Process exit status](https://doc.rust-lang.org/std/process/struct.ExitStatus.html) |

## Rust / Read Rust precisely

Patterns, constants, macros, layout, and associated items.

The Reference describes language rules more precisely than a tutorial. Use it to answer a concrete question: which pattern matches, when an expression is constant, or what a representation attribute guarantees.

These exercises connect a rule to observable behavior. Write your prediction first, then test it. Learn to distinguish a guaranteed rule from an incidental result on one compiler or target.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 156. Destructure a slice with a rest pattern | Rust checks | [Patterns and bindings](https://doc.rust-lang.org/reference/patterns.html) |
| 157. Bind and test a value with @ | Rust checks | [Patterns and bindings](https://doc.rust-lang.org/reference/patterns.html) |
| 158. Evaluate a function in a constant context | Rust checks | [Constant evaluation](https://doc.rust-lang.org/reference/const_eval.html) |
| 159. Express a length in the type | Rust checks | [Const generics](https://doc.rust-lang.org/reference/items/generics.html#const-generics) |
| 160. Repeat syntax with a declarative macro | Rust checks | [Macros by example](https://doc.rust-lang.org/reference/macros-by-example.html) |
| 161. Use an associated type to fix a relationship | Rust checks | [Associated items](https://doc.rust-lang.org/reference/items/associated-items.html) |
| 162. Implement an operator without surprising its reader | Rust checks | [Add operator trait](https://doc.rust-lang.org/std/ops/trait.Add.html) |
| 163. Coerce an array reference into a slice | Rust checks | [Type coercions](https://doc.rust-lang.org/reference/type-coercions.html) |

## Rust / Unsafe Rust with a contract

Make every unsafe operation carry an explanation.

Unsafe Rust permits specific operations that the compiler cannot fully verify. It does not disable the type system or excuse undefined behavior. Safe public functions must uphold their guarantees for every safe caller.

Before each unsafe block, identify validity, alignment, initialization, lifetime, aliasing, and ownership requirements that matter to that operation. A passing test alone cannot establish soundness. These examples keep the unsafe region small and explain its invariants.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 164. Dereference a pointer with a local proof | Rust checks | [Safe and unsafe abstractions](https://doc.rust-lang.org/nomicon/working-with-unsafe.html) |
| 165. Reconstruct a slice from a valid borrowed region | Rust checks | [Safe and unsafe abstractions](https://doc.rust-lang.org/nomicon/working-with-unsafe.html) |
| 166. Prove two mutable regions are disjoint | Rust checks | [Splitting borrows](https://doc.rust-lang.org/nomicon/borrow-splitting.html) |
| 167. Initialize before assuming initialization | Rust checks | [Uninitialized memory](https://doc.rust-lang.org/nomicon/uninitialized.html) |
| 168. Inspect a C-compatible field layout | Rust checks | [Type layout](https://doc.rust-lang.org/reference/type-layout.html) |
| 169. Call a foreign function through a narrow boundary | Rust checks | [Foreign function interfaces](https://doc.rust-lang.org/nomicon/ffi.html) |
| 170. Keep an unsafe operation inside a safe abstraction | Rust checks | [Safe and unsafe abstractions](https://doc.rust-lang.org/nomicon/working-with-unsafe.html) |
| 171. Review a safety argument with Miri | Field lab | [Miri installation and usage](https://github.com/rust-lang/miri/blob/master/README.md) |

## Rust / Embedded foundations

Learn allocation-free patterns before touching hardware.

Embedded programs often run without an operating system and may not have a heap allocator. core provides platform-independent primitives; no_std disables the automatic standard-library dependency but does not forbid every allocation by itself.

Host-checked exercises model fixed-capacity buffers, bit fields, and peripheral state. They deliberately do not claim to simulate electrical behavior, interrupt timing, or an actual board. A separate field lab performs target-specific work.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 172. Use core APIs without an operating-system dependency | Rust checks | [A no_std Rust environment](https://docs.rust-embedded.org/book/intro/no-std.html) |
| 173. Set and clear a register bit in a value model | Rust checks | [Memory-mapped registers](https://docs.rust-embedded.org/book/peripherals/a-first-attempt.html) |
| 174. Extract a multi-bit field | Rust checks | [Memory-mapped registers](https://docs.rust-embedded.org/book/peripherals/a-first-attempt.html) |
| 175. Encode a peripheral state in its type | Rust checks | [Typestate programming](https://docs.rust-embedded.org/book/static-guarantees/typestate-programming.html) |
| 176. Separate a driver from its hardware implementation | Rust checks | [Typestate programming](https://docs.rust-embedded.org/book/static-guarantees/typestate-programming.html) |
| 177. Write into a fixed-capacity buffer | Rust checks | [Collections without allocation](https://docs.rust-embedded.org/book/collections/index.html) |
| 178. Compile a no_std library on the host | Rust checks | [A no_std Rust environment](https://docs.rust-embedded.org/book/intro/no-std.html) |
| 179. Prepare an actual embedded target | Field lab | [Embedded hardware and tools](https://docs.rust-embedded.org/book/intro/hardware.html) |

## Rust / Inside an embedded runtime

Reset, memory regions, vectors, and the linker boundary.

The Embedonomicon explores the machinery beneath a small embedded program. Startup code initializes memory and establishes an entry point; linker scripts place sections in device memory; interrupt vector tables connect hardware events to handlers.

A host test can verify address arithmetic or a copied memory region, but it cannot prove a startup sequence works on a microcontroller. Use the cross-compilation lab to inspect a real target artifact and record which hardware assumptions it encodes.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 180. Check whether a region fits memory | Rust checks | [A minimal embedded application](https://docs.rust-embedded.org/embedonomicon/smallest-no-std.html) |
| 181. Model initialization of the BSS region | Rust checks | [A minimal embedded application](https://docs.rust-embedded.org/embedonomicon/smallest-no-std.html) |
| 182. Validate a model vector-table offset | Rust checks | [A minimal embedded application](https://docs.rust-embedded.org/embedonomicon/smallest-no-std.html) |
| 183. Inspect a target artifact and linker map | Field lab | [A minimal embedded application](https://docs.rust-embedded.org/embedonomicon/smallest-no-std.html) |

## Rust / Explore nightly deliberately

Use feature gates as experiments with a written exit plan.

Nightly exposes incomplete or experimental compiler features. A feature gate is not a guarantee that an API will stabilize unchanged. Always inspect its Unstable Book entry and tracking issue before using it.

Stable is the default throughout this course. The optional nightly exercises explicitly select +nightly and never change your default toolchain. Record the nightly version when experimenting so future compiler changes are easier to understand.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 184. Observe stable rejecting a feature gate | Expected diagnostic | [Unstable compiler features](https://doc.rust-lang.org/nightly/unstable-book/compiler-flags.html) |
| 185. Experiment with minimum specialization | Nightly checks | [min_specialization](https://doc.rust-lang.org/nightly/unstable-book/language-features/min-specialization.html) |
| 186. Resume a coroutine through yield and completion | Nightly checks | [Coroutines](https://doc.rust-lang.org/nightly/unstable-book/language-features/coroutines.html) |
| 187. Keep a notebook for unstable features | Field lab | [Unstable feature tracking](https://doc.rust-lang.org/nightly/unstable-book/index.html) |

## Rust / Specifications & compiler evidence

Connect a language claim to a reproducible observation.

The Ferrocene documentation index brings together the FLS, qualification-related traceability material, and Rust project documentation. Treat it as a deeper reading map rather than an introductory tutorial or a certification claim for your own project.

Traceability is useful even in a personal learning project: write down the rule you rely on, the source that describes it, and the test or experiment supporting your understanding. Compiler Explorer adds another view by showing generated code.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 188. Find your way through the Ferrocene index | Field lab | [Ferrocene documentation index](https://public-docs.ferrocene.dev/) |
| 189. Turn a language rule into an observable check | Rust checks | [FLS specification background](https://public-docs.ferrocene.dev/main/specification/background.html) |
| 190. Read generated code without guessing performance | Field lab | [Compiler Explorer for Rust](https://rust.godbolt.org/) |

## Rust / Capstone: an agent workbench

Bring the pieces together in a deterministic tool runner.

This capstone practices the mechanics useful around an AI agent: typed actions, tool dispatch, budgets, retries, history, and predictable errors. Its tools are deterministic local functions; it makes no model API calls and needs no credentials.

Work through the components before opening the multi-file project. Preserve clear boundaries between parsing, validation, tool execution, and orchestration. A future model can propose actions at that boundary, but its output must still be validated before a tool runs.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 191. Model tool requests as typed data | Rust checks | [Defining an enum](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html) |
| 192. Validate an action before execution | Rust checks | [Separating concerns in a program](https://doc.rust-lang.org/book/ch12-03-improving-error-handling-and-modularity.html) |
| 193. Make a work limit impossible to underflow | Rust checks | [Control flow and decisions](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |
| 194. Retry only a classified recoverable failure | Rust checks | [Control flow and decisions](https://doc.rust-lang.org/book/ch03-05-control-flow.html) |
| 195. Keep only the recent context you can afford | Rust checks | [Vec and slices](https://doc.rust-lang.org/std/vec/struct.Vec.html) |
| 196. Make terminal states explicit | Rust checks | [Defining an enum](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html) |
| 197. Reject an oversized plan before running any step | Rust checks | [Separating concerns in a program](https://doc.rust-lang.org/book/ch12-03-improving-error-handling-and-modularity.html) |
| 198. Keep a line-oriented log parseable | Rust checks | [String replacement and escaping](https://doc.rust-lang.org/std/primitive.str.html#method.replace) |
| 199. Summarize outcomes without hiding failures | Rust checks | [Iterator::fold](https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.fold) |
| 200. Build the complete local tool runner | Cargo project | [Building and testing a CLI application](https://doc.rust-lang.org/book/ch12-04-testing-the-librarys-functionality.html) |

## Python / Your Python workbench

Create a project and understand the interpreter.

Python executes source through an interpreter rather than compiling a native binary ahead of every run. The executable you select determines the language version and available packages. This track uses a private Python 3.15 interpreter, leaving your system installation alone.

Read the comments, change the starter, and use Check to run real Python assertions. Tracebacks identify the call chain and failing line. Your Rust progress remains available in its own track.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 1. Create a real Python 3.15 project | Field lab | [Python 3.15 · venv](https://docs.python.org/3.15/tutorial/venv.html) |
| 2. Run your first script | Python checks | [Python 3.15 · introduction](https://docs.python.org/3.15/tutorial/introduction.html) |
| 3. Name a reusable calculation | Python checks | [Python 3.15 · controlflow#defining-functions](https://docs.python.org/3.15/tutorial/controlflow.html#defining-functions) |
| 4. Repair the indentation | Python checks | [Python 3.15 · lexical_analysis#indentation](https://docs.python.org/3.15/reference/lexical_analysis.html#indentation) |
| 5. Inspect the interpreter you are actually using | Python checks | [Python 3.15 · sys#sys.version_info](https://docs.python.org/3.15/library/sys.html#sys.version_info) |
| 6. Separate importable behavior from script behavior | Python checks | [Python 3.15 · __main__](https://docs.python.org/3.15/library/__main__.html) |
| 7. Put a helper in another file | Python checks | [Python 3.15 · modules](https://docs.python.org/3.15/tutorial/modules.html) |
| 8. Check Python 3.15’s UTF-8 default | Python checks | [Python 3.15 · os#python-utf-8-mode](https://docs.python.org/3.15/library/os.html#python-utf-8-mode) |

## Python / Values, names & expressions

Understand types and the objects names refer to.

Assignment binds a name to an object. A name can later refer to another object, and several names can refer to the same mutable object. Python checks many operations at runtime, so explicit contracts and boundary tests matter.

Learn which operations create a new value and which mutate an existing one. Type annotations document intent and support external checking; they do not automatically enforce argument types at runtime.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 9. Bind meaningful intermediate names | Python checks | [Python 3.15 · simple_stmts#assignment-statements](https://docs.python.org/3.15/reference/simple_stmts.html#assignment-statements) |
| 10. Distinguish true division from floor division | Python checks | [Python 3.15 · expressions#binary-arithmetic-operations](https://docs.python.org/3.15/reference/expressions.html#binary-arithmetic-operations) |
| 11. Write the admission policy directly | Python checks | [Python 3.15 · expressions#boolean-operations](https://docs.python.org/3.15/reference/expressions.html#boolean-operations) |
| 12. Build text with an f-string | Python checks | [Python 3.15 · lexical_analysis#f-strings](https://docs.python.org/3.15/reference/lexical_analysis.html#f-strings) |
| 13. Parse before doing arithmetic | Python checks | [Python 3.15 · functions#int](https://docs.python.org/3.15/library/functions.html#int) |
| 14. Keep absence distinct from false values | Python checks | [Python 3.15 · constants#None](https://docs.python.org/3.15/library/constants.html#None) |
| 15. Recognize empty containers | Python checks | [Python 3.15 · stdtypes#truth-value-testing](https://docs.python.org/3.15/library/stdtypes.html#truth-value-testing) |
| 16. Distinguish an alias from an equal copy | Python checks | [Python 3.15 · expressions#is-not](https://docs.python.org/3.15/reference/expressions.html#is-not) |
| 17. Measure text and its encoding separately | Python checks | [Python 3.15 · stdtypes#text-sequence-type-str](https://docs.python.org/3.15/library/stdtypes.html#text-sequence-type-str) |
| 18. Compare a measurement with a tolerance | Python checks | [Python 3.15 · math#math.isclose](https://docs.python.org/3.15/library/math.html#math.isclose) |

## Python / Decisions & repetition

Make branches complete and loops terminate.

Conditions choose behavior; loops repeat it. Python uses indentation to delimit blocks, so whitespace is part of the program structure. A return ends the current function immediately.

Predict empty inputs, endpoints, and exceptional cases before checking. Prefer readable conditions and bounded loops to clever expressions that hide the policy.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 19. Choose a value for every branch | Python checks | [Python 3.15 · controlflow#if-statements](https://docs.python.org/3.15/tutorial/controlflow.html#if-statements) |
| 20. Know which endpoint range excludes | Python checks | [Python 3.15 · controlflow#the-range-function](https://docs.python.org/3.15/tutorial/controlflow.html#the-range-function) |
| 21. Make loop progress visible | Python checks | [Python 3.15 · compound_stmts#the-while-statement](https://docs.python.org/3.15/reference/compound_stmts.html#the-while-statement) |
| 22. Stop a search at the first match | Python checks | [Python 3.15 · controlflow#break-and-continue-statements](https://docs.python.org/3.15/tutorial/controlflow.html#break-and-continue-statements) |
| 23. Keep original positions while selecting values | Python checks | [Python 3.15 · functions#enumerate](https://docs.python.org/3.15/library/functions.html#enumerate) |
| 24. Pair sequences with an explicit length policy | Python checks | [Python 3.15 · functions#zip](https://docs.python.org/3.15/library/functions.html#zip) |
| 25. Match structured commands | Python checks | [Python 3.15 · compound_stmts#the-match-statement](https://docs.python.org/3.15/reference/compound_stmts.html#the-match-statement) |
| 26. Understand a loop’s else clause | Python checks | [Python 3.15 · controlflow#else-clauses-on-loops](https://docs.python.org/3.15/tutorial/controlflow.html#else-clauses-on-loops) |

## Python / Collections & text

Choose a structure for the operations you need.

Lists preserve sequence order, dictionaries map keys to values, and sets represent membership. Tuples describe fixed groupings. Mutating a collection through one alias changes the same object observed through another alias.

Text is a sequence of Unicode code points, while bytes represent encoded data. Convert deliberately at input and output boundaries; do not confuse character counts with encoded byte counts.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 27. Avoid mutating a caller’s list | Python checks | [Python 3.15 · datastructures#more-on-lists](https://docs.python.org/3.15/tutorial/datastructures.html#more-on-lists) |
| 28. Take a bounded recent history | Python checks | [Python 3.15 · stdtypes#common-sequence-operations](https://docs.python.org/3.15/library/stdtypes.html#common-sequence-operations) |
| 29. Transform and filter with a comprehension | Python checks | [Python 3.15 · datastructures#list-comprehensions](https://docs.python.org/3.15/tutorial/datastructures.html#list-comprehensions) |
| 30. Count exact words in a dictionary | Python checks | [Python 3.15 · stdtypes#dict](https://docs.python.org/3.15/library/stdtypes.html#dict) |
| 31. Preserve first-occurrence order while deduplicating | Python checks | [Python 3.15 · stdtypes#dict.fromkeys](https://docs.python.org/3.15/library/stdtypes.html#dict.fromkeys) |
| 32. Compare membership without ordering assumptions | Python checks | [Python 3.15 · stdtypes#set-types-set-frozenset](https://docs.python.org/3.15/library/stdtypes.html#set-types-set-frozenset) |
| 33. Unpack a structured record | Python checks | [Python 3.15 · datastructures#tuples-and-sequences](https://docs.python.org/3.15/tutorial/datastructures.html#tuples-and-sequences) |
| 34. Sort records by an explicit key | Python checks | [Python 3.15 · sorting](https://docs.python.org/3.15/howto/sorting.html) |
| 35. Decode at the text boundary | Python checks | [Python 3.15 · stdtypes#bytes.decode](https://docs.python.org/3.15/library/stdtypes.html#bytes.decode) |
| 36. Understand nested mutable aliases | Python checks | [Python 3.15 · copy](https://docs.python.org/3.15/library/copy.html) |

## Python / Functions, scope & iteration

Build small contracts and pass behavior explicitly.

Functions are objects that can be passed, returned, and stored. Their parameters define a calling interface, while closures can capture names from enclosing scopes. Default values are evaluated when the function is defined.

Iterators produce one item at a time; generators suspend and resume. These tools help process streams without constructing every intermediate list. Keep ownership of mutable state and resource lifetime visible.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 37. Avoid a shared mutable default | Python checks | [Python 3.15 · controlflow#default-argument-values](https://docs.python.org/3.15/tutorial/controlflow.html#default-argument-values) |
| 38. Make a policy flag explicit at the call site | Python checks | [Python 3.15 · controlflow#keyword-only-arguments](https://docs.python.org/3.15/tutorial/controlflow.html#keyword-only-arguments) |
| 39. Collect a variable number of inputs | Python checks | [Python 3.15 · controlflow#arbitrary-argument-lists](https://docs.python.org/3.15/tutorial/controlflow.html#arbitrary-argument-lists) |
| 40. Merge configuration with an explicit precedence | Python checks | [Python 3.15 · controlflow#keyword-arguments](https://docs.python.org/3.15/tutorial/controlflow.html#keyword-arguments) |
| 41. Return behavior that remembers a parameter | Python checks | [Python 3.15 · executionmodel#resolution-of-names](https://docs.python.org/3.15/reference/executionmodel.html#resolution-of-names) |
| 42. Update a captured counter | Python checks | [Python 3.15 · simple_stmts#the-nonlocal-statement](https://docs.python.org/3.15/reference/simple_stmts.html#the-nonlocal-statement) |
| 43. Yield values lazily | Python checks | [Python 3.15 · classes#generators](https://docs.python.org/3.15/tutorial/classes.html#generators) |
| 44. Stop a stream without loading it all | Python checks | [Python 3.15 · itertools#itertools.islice](https://docs.python.org/3.15/library/itertools.html#itertools.islice) |
| 45. Wrap a function while preserving its metadata | Python checks | [Python 3.15 · functools#functools.wraps](https://docs.python.org/3.15/library/functools.html#functools.wraps) |
| 46. Keep a comprehension’s variable local | Python checks | [Python 3.15 · expressions#displays-for-lists-sets-and-dictionaries](https://docs.python.org/3.15/reference/expressions.html#displays-for-lists-sets-and-dictionaries) |

## Python / Objects & protocols

Give state and behavior a dependable interface.

Classes define behavior for instances. Methods receive the instance explicitly as self, and special methods connect objects to language protocols such as len, iteration, and context management.

Prefer a small useful interface over a large inheritance hierarchy. Validate invariants where objects are constructed or updated, and test behavior through the public methods.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 47. Keep state behind a small class | Python checks | [Python 3.15 · classes#class-and-instance-variables](https://docs.python.org/3.15/tutorial/classes.html#class-and-instance-variables) |
| 48. Describe a record with a dataclass | Python checks | [Python 3.15 · dataclasses](https://docs.python.org/3.15/library/dataclasses.html) |
| 49. Validate an update through a property | Python checks | [Python 3.15 · functions#property](https://docs.python.org/3.15/library/functions.html#property) |
| 50. Participate in the len protocol | Python checks | [Python 3.15 · datamodel#object.__len__](https://docs.python.org/3.15/reference/datamodel.html#object.__len__) |
| 51. Implement a single-use iterator | Python checks | [Python 3.15 · stdtypes#iterator-types](https://docs.python.org/3.15/library/stdtypes.html#iterator-types) |
| 52. Release a resource on every exit path | Python checks | [Python 3.15 · datamodel#with-statement-context-managers](https://docs.python.org/3.15/reference/datamodel.html#with-statement-context-managers) |
| 53. Extend behavior through a clear override | Python checks | [Python 3.15 · classes#inheritance](https://docs.python.org/3.15/tutorial/classes.html#inheritance) |
| 54. Use a capability rather than a concrete class | Python checks | [Python 3.15 · io#io.IOBase.readline](https://docs.python.org/3.15/library/io.html#io.IOBase.readline) |

## Python / Exceptions & test evidence

Make failures clear and keep regressions small.

An exception interrupts normal control flow until a matching handler is found. Catch only failures you can handle meaningfully. A finally clause or context manager protects cleanup across successful and failing paths.

Assertions in the course are tests, not a replacement for validating external input. Practice boundary cases, custom error types, and test doubles without hiding actual failures.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 55. Distinguish invalid data from a fallback | Python checks | [Python 3.15 · errors#raising-exceptions](https://docs.python.org/3.15/tutorial/errors.html#raising-exceptions) |
| 56. Catch the exception you actually handle | Python checks | [Python 3.15 · errors#handling-exceptions](https://docs.python.org/3.15/tutorial/errors.html#handling-exceptions) |
| 57. Observe cleanup after an error | Python checks | [Python 3.15 · errors#defining-clean-up-actions](https://docs.python.org/3.15/tutorial/errors.html#defining-clean-up-actions) |
| 58. Give callers a domain-specific failure | Python checks | [Python 3.15 · errors#user-defined-exceptions](https://docs.python.org/3.15/tutorial/errors.html#user-defined-exceptions) |
| 59. Write a meaningful unit test | Python checks | [Python 3.15 · unittest#basic-example](https://docs.python.org/3.15/library/unittest.html#basic-example) |
| 60. Replace an external effect at the boundary | Python checks | [Python 3.15 · unittest.mock](https://docs.python.org/3.15/library/unittest.mock.html) |
| 61. Keep a documentation example executable | Python checks | [Python 3.15 · doctest](https://docs.python.org/3.15/library/doctest.html) |
| 62. Test a range of values and a reusable invariant | Python checks | [Python 3.15 · functions#max](https://docs.python.org/3.15/library/functions.html#max) |

## Python / A practical standard-library toolkit

Process structured data, paths, streams, and measurements.

The standard library provides mature tools for many everyday tasks. Pick a parser for the actual format instead of accumulating split rules, and keep filesystem and network effects separate from pure transformations.

These exercises use temporary or in-memory data for repeatability. Paths, encodings, time zones, and numeric precision remain real contracts even when the test input is small.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 63. Join path components without hard-coded separators | Python checks | [Python 3.15 · pathlib#basic-use](https://docs.python.org/3.15/library/pathlib.html#basic-use) |
| 64. Read UTF-8 text with an explicit contract | Python checks | [Python 3.15 · pathlib#pathlib.Path.read_text](https://docs.python.org/3.15/library/pathlib.html#pathlib.Path.read_text) |
| 65. Use an in-memory text stream | Python checks | [Python 3.15 · io#io.StringIO](https://docs.python.org/3.15/library/io.html#io.StringIO) |
| 66. Parse a structured interchange format | Python checks | [Python 3.15 · json](https://docs.python.org/3.15/library/json.html) |
| 67. Make machine-readable output predictable | Python checks | [Python 3.15 · json#json.dumps](https://docs.python.org/3.15/library/json.html#json.dumps) |
| 68. Respect quoted delimiters in CSV | Python checks | [Python 3.15 · csv#csv.DictReader](https://docs.python.org/3.15/library/csv.html#csv.DictReader) |
| 69. Read project metadata as TOML | Python checks | [Python 3.15 · tomllib](https://docs.python.org/3.15/library/tomllib.html) |
| 70. Use a purpose-built counting collection | Python checks | [Python 3.15 · collections#collections.Counter](https://docs.python.org/3.15/library/collections.html#collections.Counter) |
| 71. Use a queue for first-in, first-out work | Python checks | [Python 3.15 · collections#collections.deque](https://docs.python.org/3.15/library/collections.html#collections.deque) |
| 72. Find a precise token shape | Python checks | [Python 3.15 · re#re.findall](https://docs.python.org/3.15/library/re.html#re.findall) |
| 73. Keep a timestamp’s time zone explicit | Python checks | [Python 3.15 · datetime#aware-and-naive-objects](https://docs.python.org/3.15/library/datetime.html#aware-and-naive-objects) |
| 74. Choose decimal arithmetic for a decimal contract | Python checks | [Python 3.15 · decimal](https://docs.python.org/3.15/library/decimal.html) |
| 75. Handle an empty measurement set explicitly | Python checks | [Python 3.15 · statistics#statistics.mean](https://docs.python.org/3.15/library/statistics.html#statistics.mean) |
| 76. Encode query parameters instead of concatenating text | Python checks | [Python 3.15 · urllib.parse#urllib.parse.urlencode](https://docs.python.org/3.15/library/urllib.parse.html#urllib.parse.urlencode) |
| 77. Hash bytes with an explicit encoding boundary | Python checks | [Python 3.15 · hashlib](https://docs.python.org/3.15/library/hashlib.html) |
| 78. Keep CLI parsing testable | Python checks | [Python 3.15 · argparse](https://docs.python.org/3.15/library/argparse.html) |

## Python / Async, threads & processes

Understand scheduling and shared state before adding workers.

Concurrency means multiple tasks can make progress over overlapping periods; it does not promise that CPU work runs in parallel. Async I/O, threads, processes, and free-threaded builds have different constraints.

Use structured lifetimes, bounded work, and explicit error handling. These CPU-light examples stay local and deterministic; larger workloads belong in measured experiments with a recorded interpreter build.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 79. Await a coroutine inside a running event loop | Python checks | [Python 3.15 · asyncio-task#coroutines](https://docs.python.org/3.15/library/asyncio-task.html#coroutines) |
| 80. Give child tasks a structured lifetime | Python checks | [Python 3.15 · asyncio-task#task-groups](https://docs.python.org/3.15/library/asyncio-task.html#task-groups) |
| 81. Join bounded work through an executor | Python checks | [Python 3.15 · concurrent.futures#threadpoolexecutor](https://docs.python.org/3.15/library/concurrent.futures.html#threadpoolexecutor) |
| 82. Guard a shared update consistently | Python checks | [Python 3.15 · threading#lock-objects](https://docs.python.org/3.15/library/threading.html#lock-objects) |
| 83. Run a child without a shell | Python checks | [Python 3.15 · subprocess#subprocess.run](https://docs.python.org/3.15/library/subprocess.html#subprocess.run) |
| 84. Measure concurrency on a recorded interpreter build | Field lab | [Python 3.15 · concurrent.futures#processpoolexecutor](https://docs.python.org/3.15/library/concurrent.futures.html#processpoolexecutor) |

## Python / Package a project properly

Metadata, imports, entry points, and reproducible environments.

A project needs an importable layout, supported-Python declaration, dependency policy, tests, and useful documentation. pyproject.toml is a standard configuration boundary between your source and packaging tools.

Installing, building, and publishing are distinct operations. Core exercises inspect real project files and imports; the field lab builds a local wheel and inspects it without uploading to a package index.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 85. Read the package’s supported Python declaration | Python checks | [Python Packaging User Guide](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) |
| 86. Build an importable package boundary | Python checks | [Python Packaging User Guide](https://packaging.python.org/en/latest/tutorials/packaging-projects/) |
| 87. Understand a console script declaration | Python checks | [Python Packaging User Guide](https://packaging.python.org/en/latest/guides/creating-command-line-tools/) |
| 88. Separate optional features from base requirements | Python checks | [Python Packaging User Guide](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) |
| 89. Treat package data as a declared input | Python checks | [Python 3.15 · importlib.resources](https://docs.python.org/3.15/library/importlib.resources.html) |
| 90. Construct a test suite with an explicit result | Python checks | [Python 3.15 · unittest#loading-and-running-tests](https://docs.python.org/3.15/library/unittest.html#loading-and-running-tests) |
| 91. Build and inspect your own wheel | Field lab | [Python Packaging User Guide](https://packaging.python.org/en/latest/tutorials/packaging-projects/) |
| 92. Make the package easy to maintain | Field lab | [Python Packaging User Guide](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) |

## Python / The language model & Python 3.15

Read the Reference with precise questions.

The language Reference becomes useful when you want to explain evaluation order, name lookup, attribute access, or a protocol rather than memorize a snippet. Turn each claim into a small experiment.

The final lessons also exercise Python 3.15’s sentinel and frozendict directly. A new language version is not a guarantee that every binary extension already supports it, which is why the ML tracks have a separate environment.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 93. Use Python 3.15’s explicit absence marker | Python checks | [Python 3.15 · functions#sentinel](https://docs.python.org/3.15/library/functions.html#sentinel) |
| 94. Use Python 3.15’s immutable mapping | Python checks | [Python 3.15 · stdtypes#frozendict](https://docs.python.org/3.15/library/stdtypes.html#frozendict) |
| 95. Observe left-to-right argument evaluation | Python checks | [Python 3.15 · expressions#evaluation-order](https://docs.python.org/3.15/reference/expressions.html#evaluation-order) |
| 96. Look up a derived attribute through a descriptor | Python checks | [Python 3.15 · datamodel#implementing-descriptors](https://docs.python.org/3.15/reference/datamodel.html#implementing-descriptors) |
| 97. Inspect method resolution rather than guessing | Python checks | [Python 3.15 · datamodel#customizing-class-creation](https://docs.python.org/3.15/reference/datamodel.html#customizing-class-creation) |
| 98. Inspect annotations without pretending they validate calls | Python checks | [Python 3.15 · typing](https://docs.python.org/3.15/library/typing.html) |
| 99. Preserve a cause when adding domain context | Python checks | [Python 3.15 · errors#exception-chaining](https://docs.python.org/3.15/tutorial/errors.html#exception-chaining) |
| 100. Build a packaged local task runner | Python checks | [Python Packaging User Guide](https://packaging.python.org/en/latest/tutorials/packaging-projects/) |

## PyTorch / Tensors you can reason about

Shapes, dtypes, indexing, and storage before models.

A tensor is a typed multidimensional array with a shape, device, and storage layout. Those properties are part of every operation’s contract. Start by predicting shapes on paper before running a model.

Exercises use the installed PyTorch 2.14 CPU wheel with small tensors. They do not require CUDA, a GPU, an account, or a downloaded dataset. The Python interpreter for this track is shown separately from the Python 3.15 language track.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 1. Inspect the PyTorch learning environment | Field lab | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/notes/windows.html) |
| 2. Create a tensor with a declared dtype | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html) |
| 3. Read shape as structured information | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/tensors.html) |
| 4. Preserve shape and dtype when allocating | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.zeros_like.html) |
| 5. Reshape only when the element count agrees | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.reshape.html) |
| 6. Select a column while keeping row order | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/tensor_view.html) |
| 7. Filter values with a boolean mask | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.masked_select.html) |
| 8. Broadcast a feature bias across a batch | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/notes/broadcasting.html) |
| 9. Distinguish matrix multiplication from elementwise work | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.matmul.html) |
| 10. Reduce the intended axis | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.mean.html) |
| 11. Use cat and stack for different shape contracts | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.stack.html) |
| 12. Avoid accidental storage aliasing | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.clone.html) |

## PyTorch / Understand automatic differentiation

Trace the graph and control what gradients mean.

Autograd records eligible operations on tensors that require gradients and uses the resulting graph for differentiation. A gradient belongs to a specific scalar objective and current graph, not to a parameter in the abstract.

Practice scalar derivatives, accumulation, detachment, and finite-difference checks before a training loop hides those operations. Shape and reduction choices affect gradient scale.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 13. Differentiate a scalar objective | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html) |
| 14. Trace a reduction through a vector | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.Tensor.backward.html) |
| 15. Observe gradients accumulating across backward calls | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.Tensor.grad.html) |
| 16. Stop gradient tracking at a declared boundary | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.Tensor.detach.html) |
| 17. Disable graph recording around an inference calculation | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.no_grad.html) |
| 18. Request a derivative without filling .grad | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.autograd.grad.html) |
| 19. Check a derivative numerically on small double-precision data | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.autograd.gradcheck.gradcheck.html) |
| 20. Update a parameter without recording the update itself | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/notes/autograd.html) |

## PyTorch / Build neural-network components

Parameters, layers, losses, and train/eval behavior.

nn.Module registers parameters and child modules so optimizers and state dictionaries can find them. A forward pass transforms inputs; a loss expresses the training objective. Tensor shapes connect the two.

These small models are initialized locally. Random weights do not provide pretrained knowledge, and a correct shape does not establish useful predictions. Separate architecture checks from learning and evaluation evidence.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 21. Register a trainable layer in a Module | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html) |
| 22. Implement the affine-layer shape contract | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.functional.linear.html) |
| 23. Apply a nonlinearity elementwise | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.ReLU.html) |
| 24. Compose a small network with declared dimensions | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Sequential.html) |
| 25. Give classification loss logits and integer targets | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.CrossEntropyLoss.html) |
| 26. Make regression reduction explicit | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.MSELoss.html) |
| 27. Use evaluation mode for deterministic dropout behavior | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Dropout.html) |
| 28. Exclude parameters from gradient calculation | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/notes/autograd.html#setting-requires-grad) |
| 29. Turn token IDs into vector rows | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Embedding.html) |
| 30. Predict a convolution output shape | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Conv2d.html) |

## PyTorch / Make the data contract explicit

Datasets, batches, masks, splits, and leakage.

A Dataset describes access to samples, and a DataLoader organizes those samples into batches. Collation, padding, and dtype choices determine the model’s input contract.

Never let convenience obscure evaluation boundaries. Split before fitting transformations, preserve a held-out set, and make shuffle and random seeds explicit. A repeatable sample order is useful evidence but does not guarantee identical results on every device.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 31. Pair features and labels by sample index | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/data_tutorial.html) |
| 32. Inspect batch boundaries including the final partial batch | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/data.html#torch.utils.data.DataLoader) |
| 33. Make a split repeatable with an explicit generator | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/data.html#torch.utils.data.dataset.random_split) |
| 34. Apply training-derived statistics to other data | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.std.html) |
| 35. Pad unequal token sequences into a batch | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.utils.rnn.pad_sequence.html) |
| 36. Exclude padded positions from a pooled value | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.clamp.html) |
| 37. Measure label balance before training | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.bincount.html) |
| 38. Define the sample-to-batch transformation | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/data.html#working-with-collate-fn) |

## PyTorch / Write and inspect a training loop

Backpropagation, updates, metrics, and bounded experiments.

A training step usually clears gradients, computes predictions and loss, differentiates, then updates parameters. Each operation has a reason; changing the order can silently change the algorithm.

Use tiny synthetic problems to verify mechanics before spending compute. Keep a fixed baseline and evaluate without gradients. A falling training loss alone does not establish generalization.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 39. Verify an optimizer’s first update | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html) |
| 40. Clear old gradients before an independent step | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.optim.Optimizer.zero_grad.html) |
| 41. Learn a tiny synthetic relationship | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html) |
| 42. Keep evaluation out of the gradient graph | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.autograd.grad_mode.inference_mode.html) |
| 43. Calculate a metric with the correct axis | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.argmax.html) |
| 44. Combine batch losses by sample count | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.MSELoss.html) |
| 45. Bound a gradient norm before updating | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.utils.clip_grad_norm_.html) |
| 46. Inspect a learning-rate schedule after updates | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.optim.lr_scheduler.StepLR.html) |
| 47. Select a checkpoint by held-out loss | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/saveloadrun_tutorial.html) |
| 48. Use logits directly for stable binary classification loss | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.BCEWithLogitsLoss.html) |

## PyTorch / Checkpoints & deeper experiments

Save state, inspect artifacts, and measure carefully.

A model artifact needs architecture, weights, preprocessing, and enough configuration to reproduce its intended use. Saving only the displayed predictions is not a model checkpoint.

Core exercises stay on CPU and avoid downloading artifacts. GPU precision, compilation performance, export, profiling, and distributed training are explicit field experiments whose claims depend on the actual environment.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 49. Snapshot parameter values without retaining mutable aliases | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.Module.html#torch.nn.Module.state_dict) |
| 50. Save and restore weights through an in-memory artifact | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/saveloadrun_tutorial.html) |
| 51. Keep the state needed to resume training | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/optim.html) |
| 52. Move a tensor without pretending a GPU is available | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.Tensor.to.html) |
| 53. Make a transposed view contiguous when required | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/tensor_view.html) |
| 54. Convert logits into normalized class scores | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.functional.softmax.html) |
| 55. Calculate a small scaled dot-product attention block | Python checks | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/generated/torch.nn.functional.scaled_dot_product_attention.html) |
| 56. Verify a tiny model can fit a tiny dataset | Python checks | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html) |
| 57. Measure a real model before optimizing | Field lab | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/profiler.html) |
| 58. Inspect an exported model artifact | Field lab | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/export.html) |
| 59. Understand distributed and precision contracts | Field lab | [PyTorch 2.14 · API and semantics](https://docs.pytorch.org/docs/2.14/distributed.html) |
| 60. Build a complete small training project | Field lab | [PyTorch: Learn the Basics](https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html) |

## Hugging Face / Navigate the Hub deliberately

Repositories, revisions, model cards, and local artifacts.

The Hugging Face Hub hosts versioned repositories for models, datasets, and Spaces. A repository ID identifies a project, a revision selects a version, and a model card describes intended use and limitations. A recognizable name alone does not establish suitability or a license grant.

Core exercises use local objects and URL construction without making Hub requests. Account actions, remote downloads, and uploads are separate field labs you control; this app never needs your access token.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 1. Map the installed libraries to their roles | Field lab | [Hugging Face · transformers](https://huggingface.co/docs/transformers/installation) |
| 2. Validate a repository identifier locally | Python checks | [Hugging Face · huggingface_hub](https://huggingface.co/docs/huggingface_hub/package_reference/utilities) |
| 3. Pin a file URL to a specific revision | Python checks | [Hugging Face · huggingface_hub](https://huggingface.co/docs/huggingface_hub/package_reference/file_download) |
| 4. Attach useful metadata to a local model card | Python checks | [Hugging Face · huggingface_hub](https://huggingface.co/docs/huggingface_hub/guides/model-cards) |
| 5. Parse a local card’s metadata and prose | Python checks | [Hugging Face · huggingface_hub](https://huggingface.co/docs/huggingface_hub/package_reference/cards) |
| 6. Distinguish a dataset repository from a model repository | Python checks | [Hugging Face · huggingface_hub](https://huggingface.co/docs/huggingface_hub/package_reference/file_download) |
| 7. Keep an artifact’s required pieces explicit | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/main_classes/model) |
| 8. Inspect a public artifact before deciding to download it | Field lab | [Hugging Face · huggingface_hub](https://huggingface.co/docs/huggingface_hub/guides/download) |

## Hugging Face / Build a dataset you can explain

Schemas, transforms, splits, and evaluation boundaries.

Datasets provides column-oriented datasets with explicit features and transformation operations. Learn on small in-memory data so you can inspect every row before moving to a remote or large dataset.

A transformation pipeline is part of the experiment. Preserve the distinction between training and held-out data, make random operations reproducible, and inspect the schema after operations that add or remove columns.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 9. Construct an in-memory dataset with named columns | Python checks | [Hugging Face · datasets](https://huggingface.co/docs/datasets/create_dataset) |
| 10. Add a derived column without overwriting the source | Python checks | [Hugging Face · datasets](https://huggingface.co/docs/datasets/process) |
| 11. Apply a transform to a batch contract | Python checks | [Hugging Face · datasets](https://huggingface.co/docs/datasets/process) |
| 12. Filter samples with an inspectable policy | Python checks | [Hugging Face · datasets](https://huggingface.co/docs/datasets/process) |
| 13. Make a train/test split reproducible | Python checks | [Hugging Face · datasets](https://huggingface.co/docs/datasets/process) |
| 14. Expose tensor inputs without losing the dataset | Python checks | [Hugging Face · datasets](https://huggingface.co/docs/datasets/use_with_pytorch) |
| 15. Declare class labels in the feature schema | Python checks | [Hugging Face · datasets](https://huggingface.co/docs/datasets/about_dataset_features) |
| 16. Save and reload a local dataset artifact | Python checks | [Hugging Face · datasets](https://huggingface.co/docs/datasets/package_reference/main_classes) |

## Hugging Face / Understand the text-to-ID boundary

Vocabulary, unknowns, normalization, padding, and serialization.

A tokenizer converts text into model inputs under a specific vocabulary and processing configuration. Token IDs are meaningful only with the matching model and tokenizer artifacts. Changing normalization or special-token handling can change the experiment even when the model weights stay fixed.

These exercises construct and train tiny local tokenizers. They teach mechanics and artifact contracts; they are not substitutes for a pretrained model’s exact tokenizer.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 17. Encode known words with a local vocabulary | Python checks | [Hugging Face · tokenizers](https://huggingface.co/docs/tokenizers/quicktour) |
| 18. Handle an out-of-vocabulary piece explicitly | Python checks | [Hugging Face · tokenizers](https://huggingface.co/docs/tokenizers/api/models) |
| 19. Normalize before vocabulary lookup | Python checks | [Hugging Face · tokenizers](https://huggingface.co/docs/tokenizers/api/normalizers) |
| 20. Add the model’s special-token structure | Python checks | [Hugging Face · tokenizers](https://huggingface.co/docs/tokenizers/api/post-processors) |
| 21. Inspect the attention mask created by padding | Python checks | [Hugging Face · tokenizers](https://huggingface.co/docs/tokenizers/api/tokenizer) |
| 22. Bound the sequence length deliberately | Python checks | [Hugging Face · tokenizers](https://huggingface.co/docs/tokenizers/api/tokenizer) |
| 23. Train a tiny tokenizer from a local corpus | Python checks | [Hugging Face · tokenizers](https://huggingface.co/docs/tokenizers/quicktour) |
| 24. Serialize the tokenizer’s complete configuration | Python checks | [Hugging Face · tokenizers](https://huggingface.co/docs/tokenizers/api/tokenizer) |

## Hugging Face / Build and inspect tiny Transformers

Configuration, model outputs, inference, and a training step.

A configuration describes an architecture; initialized weights are a separate artifact. Constructing a tiny model from config needs no download but does not provide pretrained knowledge. Task heads translate hidden states into task-specific outputs.

Use the installed Transformers version, local objects, and explicit output shapes. Attention masks, label shapes, model mode, and gradient policy remain your responsibility even when an AutoClass or Trainer supplies convenience.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 25. Describe a small architecture before allocating weights | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/model_doc/bert) |
| 26. Inspect a randomly initialized encoder output | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/model_doc/bert) |
| 27. Choose an architecture with the intended task head | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/model_doc/bert) |
| 28. Pass the mask alongside padded IDs | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/glossary) |
| 29. Connect a local tokenizer to Transformers | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/main_classes/tokenizer) |
| 30. Round-trip a local model without Hub access | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/main_classes/model) |
| 31. Ask the task model for its supervised objective | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/model_doc/bert) |
| 32. Run one bounded Trainer update on local data | Python checks | [Hugging Face · transformers](https://huggingface.co/docs/transformers/main_classes/trainer) |

## Hugging Face / Adapters, acceleration & state

Control what trains and what gets saved.

Parameter-efficient methods train a smaller set of added or selected parameters. They still depend on a base architecture and a defined training objective. Verify which parameters are trainable rather than assuming an adapter configuration did what you intended.

Accelerate coordinates device and training concerns; safetensors stores tensors in a dedicated format. Neither chooses a good dataset, metric, or deployment policy for you. Keep artifacts and their required configuration together.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 33. Describe the adapter’s actual target modules | Python checks | [Hugging Face · peft](https://huggingface.co/docs/peft/package_reference/lora) |
| 34. Verify which parameters an adapter leaves trainable | Python checks | [Hugging Face · peft](https://huggingface.co/docs/peft/quicktour) |
| 35. Run the adapted model’s forward contract | Python checks | [Hugging Face · peft](https://huggingface.co/docs/peft/quicktour) |
| 36. Compare merged and unmerged inference | Python checks | [Hugging Face · peft](https://huggingface.co/docs/peft/developer_guides/lora) |
| 37. Prepare a small CPU model through Accelerate | Python checks | [Hugging Face · accelerate](https://huggingface.co/docs/accelerate/quicktour) |
| 38. Use the accelerator’s backward boundary | Python checks | [Hugging Face · accelerate](https://huggingface.co/docs/accelerate/quicktour) |
| 39. Round-trip named tensor state in memory | Python checks | [Hugging Face · safetensors](https://huggingface.co/docs/safetensors/torch_shared_tensors) |
| 40. Measure the trainable fraction rather than assuming it | Python checks | [Hugging Face · peft](https://huggingface.co/docs/peft/quicktour) |

## Hugging Face / Explore the wider ecosystem

Evaluation, diffusion, retrieval, demos, and a complete local project.

The Hugging Face documentation covers many libraries and services. Choose them by the job they do rather than treating the ecosystem as one interchangeable API. Record library versions and distinguish local execution from hosted compute or inference.

These field labs extend the tested core into larger workflows. They require concrete evidence, remain explicitly self-reported, and do not initiate uploads, paid jobs, account changes, or large model downloads from this app.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 41. Build an evaluation report with a baseline | Field lab | [Hugging Face · evaluate](https://huggingface.co/docs/evaluate/index) |
| 42. Explore sentence embeddings and retrieval | Field lab | [Sentence Transformers documentation](https://sbert.net/docs/quickstart.html) |
| 43. Map a Diffusers pipeline before running it | Field lab | [Hugging Face · diffusers](https://huggingface.co/docs/diffusers/using-diffusers/conditional_image_generation) |
| 44. Understand supervised and preference training objectives | Field lab | [Hugging Face · trl](https://huggingface.co/docs/trl/index) |
| 45. Wrap local inference in a useful demo | Field lab | [Gradio documentation](https://www.gradio.app/docs) |
| 46. Evaluate a smaller representation instead of assuming equivalence | Field lab | [Hugging Face · transformers](https://huggingface.co/docs/transformers/quantization/overview) |
| 47. Prepare an artifact for responsible sharing | Field lab | [Hugging Face · huggingface_hub](https://huggingface.co/docs/huggingface_hub/guides/upload) |
| 48. Build an end-to-end local text experiment | Field lab | [Hugging Face · transformers](https://huggingface.co/docs/transformers/training) |

## Codex / Meet Codex in your own workspace

Identify your client, choose a scratch project, and inspect one file.

These optional field labs teach how to work with an assistant while keeping your reasoning visible. They do not launch Codex from Foundry, require an API key in Foundry, or install an integration.

Use an existing Codex setup or follow the current official setup yourself. External assistant use follows that service's account and usage rules. If unavailable, read the material and record the blocker; do not claim the experiment ran.

Work in a new scratch folder. These lessons are independent of the Rust beginner path and do not authorize changes to an existing learning project. Ask a mentor to review your evidence between lessons if you want conceptual feedback.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 1. Identify your Codex client and current docs | Field lab | [Codex desktop setup](https://learn.chatgpt.com/docs/quickstart#setup) |
| 2. Choose a scratch project and save a baseline | Field lab | [Give Codex task context](https://learn.chatgpt.com/docs/learn/best-practices#strong-first-use-context-and-prompts) |
| 3. Ask for one inspection and compare the evidence | Field lab | [Plan before changing code](https://learn.chatgpt.com/docs/learn/best-practices#plan-first-for-difficult-tasks) |

## Codex / Guide and review one Codex change

Inspect permissions, write three instructions, and review a tiny diff.

Continue with the same scratch README and baseline from the first chapter. Keep the experiment small enough that you can explain every changed line.

A prompt describes your request; client permissions control available actions. Review both, then inspect the actual result. An assistant's claim that a check passed is a starting point for examining evidence.

These are open, self-reported field labs. Saving completion is not mentor approval, and does not configure automatic messages or grant the assistant access.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 4. Inspect action permissions without changing them | Field lab | [Codex permission scope and enforcement](https://learn.chatgpt.com/docs/permissions#scope-and-enforcement) |
| 5. Write and verify three project instructions | Field lab | [Layer Codex project instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md#layer-project-instructions) |
| 6. Request one edit, inspect the diff, and hand it off | Field lab | [Codex testing and review](https://learn.chatgpt.com/docs/learn/best-practices#improve-reliability-with-testing-and-review) |

## Claude Code / Meet Claude Code in your own workspace

Identify the CLI, select a scratch project, and inspect one file.

This introduction targets Claude Code's interactive CLI. Claude chat, Desktop, IDE extensions, and the API have their own workflows; do not assume their controls are interchangeable.

Use your own supported setup and current official instructions. Foundry neither installs nor starts Claude Code, signs in, or stores provider credentials. External assistant use follows that service's account and usage rules.

Use a separate scratch project. Small predictions and actual observations provide evidence for a mentor; a checked box alone does not demonstrate understanding.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 1. Identify Claude Code and check the current setup | Field lab | [Claude Code prerequisites](https://code.claude.com/docs/en/quickstart#before-you-begin) |
| 2. Start Claude Code in a scratch project | Field lab | [Start your first Claude Code session](https://code.claude.com/docs/en/quickstart#step-2-start-your-first-session) |
| 3. Follow a read-only question through its tools | Field lab | [Ask Claude Code your first question](https://code.claude.com/docs/en/quickstart#step-3-ask-your-first-question) |

## Claude Code / Guide and review one Claude Code change

Inspect permissions, write project guidance, and verify one small edit.

Keep using your scratch README and baseline. You will examine the tools available to the session, introduce a small instruction file, and review one requested change.

Check your installed version against current docs before using a mode or command. Instructions, permissions, and retained session context solve different problems; none substitutes for reviewing your result.

Finish with a short evidence handoff. These labs do not create a background listener, add dependencies, or run a model from Foundry.

| Lesson | Mode | Relevant section |
| --- | --- | --- |
| 4. Read the current permission mode and action scope | Field lab | [Claude Code permission modes](https://code.claude.com/docs/en/permissions#permission-modes) |
| 5. Write and inspect a small CLAUDE.md | Field lab | [Set up a project CLAUDE.md](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md) |
| 6. Review a single Claude Code edit and make a handoff | Field lab | [Make your first Claude Code change](https://code.claude.com/docs/en/quickstart#step-4-make-your-first-code-change) |
