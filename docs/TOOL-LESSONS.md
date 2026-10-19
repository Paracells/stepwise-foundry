# Introductory coding-agent labs

Choose **Codex** or **Claude Code** in the learning-track selector. Each has two introductory chapters and six small lessons: identify the client and documentation, create a scratch baseline, inspect one file, examine permissions, write project instructions, then request and review a one-line edit. The existing four language/library tracks and Rust beginner review path are independent.

These are open, **self-reported field labs**, not executable checks or mentor review gates. Write a short prediction when useful, try the small action yourself, compare observed behavior, and bring your evidence to a mentor. Checking a box or saving 80 characters does not demonstrate understanding. No assistant is launched, no model grades the answer, and no tool-lab submission sends a notification. An external assistant's account and usage requirements apply when you choose to use it; Foundry itself needs no account or model API key.

Use a new scratch folder, not this checkout or an existing learning/work project. Type its files and setup commands yourself. A mentor may inspect relevant evidence read-only, but must not perform the exercise in the learner's project. The Codex introduction targets a local desktop project. The Claude Code introduction targets the interactive CLI. Other surfaces need their own current instructions.

## Documentation verification

The `documentation` record on each lesson names its revision, product, surface, OS scope, official release-notes page, documentation-review date, and tested client version. The initial lessons were checked against official documentation on **2026-10-19**. Their `testedVersion` is null: the author did not run these external-client experiments. The UI shows that limit explicitly. This is not a certificate that a newer client still behaves the same way.

Before authoring, teaching, or publishing a chapter, open its exact official sections and release notes, compare them with the learner's installed client, and verify the affected commands/settings/examples. Source availability and matching anchors are useful link checks but do not establish behavioral correctness. Record your client/version and observations in the evidence; do not claim an installation was tested just because its documentation was read.

If a step does not match the actual client, preserve the mismatch and resolve it before assigning the action. Do not silently install, upgrade, broaden permissions, or substitute a different interface. Review proposed content changes, verify affected examples, and update the lesson revision, verification record, and changelog together. Do not automatically apply upstream documentation changes. Checks occur during authoring, chapter start, publication, or a reported mismatch; there is no scheduled AI polling.

## Evidence and lesson revisions

Draft saves update the current response. Each explicit **Save lab submission** keeps a separate snapshot of the learner's notes, evidence, checklist, timestamp, and exact authored lesson, including its prompt, readings, examples, and verification metadata. Changing the lesson or editing a later draft does not replace that snapshot. Backups preserve the complete snapshots; mentor reports include original tasks, readings, revision/date, and submitted evidence. The page shows saved submissions separately from the current draft.

This history records self-reported attempts, not mentor approval or independent mastery. Existing language labs retain their current behavior; missing legacy versions are not fabricated. When a concept changes materially, use a short follow-up exercise instead of resetting completed work. For durable agent instructions, see [AGENTS.md](../AGENTS.md).
