# Contributing

Keep this a local learning environment centered on understanding the selected language or library. Do not add rankings, points, streaks, payments, telemetry, or a required account. The four tracks share the interface and backup format; progress, navigation, source libraries, and resume points are scoped by track.

## Add or improve a lesson

Use the existing lesson helpers in `curriculum/helpers.mjs` and the appropriate content module. Give each lesson a stable unique ID so existing progress continues to work. A lesson needs:

- A clear explanation of the concept and why the behavior matters.
- A precise task, examples, meaningful boundary checks, and three progressively helpful hints.
- Explanatory comments in the starter and worked solution. Explain ownership, control flow, and invariants where they matter. Unsafe blocks need a specific safety argument.
- A direct link to the relevant documentation chapter, subsection, API, or compiler error in `curriculum/references.mjs`.
- An unfinished starter that fails the required check and a solution that passes it.
- Honest labeling for optional nightly, manual evidence, host models, and hardware requirements.

Use `exercise` for a function, `codeExercise` for complete source, `project` for several Cargo files, and `lab` for work that the local compiler runner cannot establish. Built-in projects must resolve offline; use path dependencies instead of introducing registry downloads. Maintain progress compatibility if the curriculum grows; update the curriculum-size assertion intentionally.

For Python/ML content, use the helpers in `curriculum/python-helpers.mjs`, declare `entryFile`, `runtime`, dependencies, and a track-specific module. Python exercises require 3.15; ML currently uses the compatible 3.14 environment. Keep core ML examples small, CPU-capable, and offline; construct local data, tokenizers, and tiny model configurations rather than silently downloading artifacts. Label random weights honestly. Use `String.raw` for Python checks containing escaped text, so JavaScript and Python string escapes remain distinct. Preserve the original Rust IDs and namespace new IDs.

Run the targeted chapter verifier, `npm test`, and the online link check for new references. Regenerate the source map with `node scripts/write-curriculum-map.mjs`. For curriculum changes, verify every affected solution and starter. Full-track verification is available for broader curriculum maintenance. Review desktop and mobile layout when changing the interface.

## Architecture

Keep the browser interface in `public/`, tool execution in `lib/runner.mjs`, and progress persistence in `lib/progress.mjs`. Preserve local binding, request protections, timeouts, atomic saves, and readable failure messages. Never turn this runner into a public code-execution service without a separately designed isolation system.

Do not commit `.data/`, generated test results, credentials, or the user's lesson drafts. Original contributions must have a compatible license; link to third-party documentation rather than copying its chapters.
