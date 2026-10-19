# Local execution model

Stepwise Foundry executes submitted Rust and Python programs as your local user. It is a trusted, single-user learning app, not a secure sandbox or a hosted grading service.

Keep the server on loopback. Do not expose it with a public tunnel, reverse proxy, or network bind. Do not run unfamiliar code or Cargo manifests from an untrusted source. Execution limits, temporary directories, path validation, and request tokens improve reliability but do not isolate native code from your files or network.

Progress records, exports, terminal output, and mentor feedback may contain private material. Review them before sharing. `.data/`, `.runtime/`, virtual environments, environment files, and mentor keys must stay out of version control.

The optional Codex Desktop bridge is disabled when local configuration is absent. Explicitly enabling it permits the server to invoke the installed CLI with the user's local permissions and queue a bounded review request in one selected chat. The notification contains section/submission IDs; the mentor reads the actual local evidence separately. Do not copy another user's CLI path, chat ID, or delivery receipts into a release. No public listener, API key, authentication change, or periodic model task is needed. Live browser feedback events contain identifiers only; submission history and revisit attempts remain in local progress and exports.

For a security concern, use a confidential GitLab issue when available. Describe the problem without publishing credentials, private learner records, or an exploit against another user's computer.
