# Changelog

User-visible changes to Stepwise Foundry, newest first.

## 2026-10-19

### Added

- Repository-level `AGENTS.md` guidance for application maintenance, learner-owned practice, exact-submission review, verification, and clean public defaults.
- A saved dark-mode toggle and softer response-box backgrounds in both themes.
- Tab indentation and Shift+Tab outdent in writing fields, with Esc then Tab to move focus out.
- Automatic code blocks for recognizable pasted source in notes, highlighted previews, and formatted source in submission history. Terminal-output fields retain the original pasted text.
- Submitted revision history for the guided path. Each explicit submission keeps its answer, output, timestamp, and matching mentor feedback in the page, backups, and handoffs. Draft saves do not create attempts; missing older revisions are not reconstructed.
- An optional delayed-practice pilot with changed Rust and Python function tasks, available one and two days after their original lessons. Predictions and code are saved before checking, help opens after the first completed attempt, and assistance is recorded per attempt.
- Opt-in Submit notifications for an existing local Codex Desktop chat, with a setup helper and documentation. Notifications are disabled by default and run only on explicit submission, without periodic AI checks.
- The Python setup helper referenced by the installation guide.

### Changed

- Expanded the guided Rust beginner path to eight chapters and thirty sections, adding reusable functions and caller-supplied inputs with small prediction, planning, implementation, and review steps.
- Recorded mentor feedback now updates the open guided page automatically and retains the preceding feedback when advancing.
- Backups and mentor reports include submitted revision history and delayed-practice attempts. Code checks and mentor reviews remain separate from claims of mastery.

### Fixed

- Historical mentor reviews now use the same colored feedback block as the current review, with clear revision-request and approval headings, so feedback is easier to distinguish from learner submissions.

## 2026-10-17

### Added

- Initial public MIT-licensed release: 408 lessons across Rust, Python, PyTorch, and Hugging Face, with commented starters, official reference links, real local checks, hints, and worked examples.
- A Monaco editor, local progress storage, backup import/export, mentor reports, and an optional guided Rust review workflow.
- Contribution, security, installation, and curriculum documentation, plus Linux core CI.

### Changed

- Clarified that all four tracks share the learning workflow, while the first authored sequence of guided mentor gates covers Rust.
