# Optional Codex Desktop submission notifications

Stepwise Foundry works without an assistant or account. This opt-in bridge lets **Submit for mentor review** queue a request in an existing local Codex Desktop chat. It uses the installed CLI's documented [codex queue command](https://learn.chatgpt.com/docs/cli/reference#codex-queue); it is not a public webhook or a new app-server client.

The guided path currently covers Rust. The other three tracks can export mentor reports. This bridge does not turn their code checks into automatic conceptual reviews.

## Choose and identify the mentoring chat

Open this checkout as a project in Codex Desktop and use a chat that can read its files. Give the mentor [BEGINNER.md](BEGINNER.md) and the exported short handoff. Ask it to review explanations and give hints, leaving your external practice project for you to edit and run.

Ask that chat to verify its **technical thread UUID**, using its chat tools or `CODEX_THREAD_ID` in its agent tool environment. The environment variable is not guaranteed to exist in an ordinary terminal. Do not guess an ID from a title or reuse an example ID. A Codex local-chat link has the documented form `codex://threads/<thread-id>`; its technical ID identifies the chat, not an API credential. See [Codex links](https://learn.chatgpt.com/docs/reference/commands).

From that chat's tool environment, the setup helper can use the verified `CODEX_THREAD_ID` automatically:

```sh
node scripts/configure-mentor.mjs
```

Or supply the UUID explicitly from a terminal in the checkout:

```sh
node scripts/configure-mentor.mjs --thread YOUR_VERIFIED_CHAT_UUID
```

The helper locates the installed `codex` CLI on PATH and checks `queue --help` without sending a message. If detection fails, pass `--codex` with an absolute path to `codex.exe`, the official npm package's `bin/codex.js`, or a Unix Codex executable. On Windows it recognizes the official npm wrapper without launching a shell. For example, replace both placeholders in:

```powershell
node scripts/configure-mentor.mjs --thread YOUR_VERIFIED_CHAT_UUID --codex 'C:\path\to\codex.exe'
```

The helper writes only the ignored `.data/mentor-notification-config.json` (or `FOUNDRY_DATA_DIR`). No key, account token, or session ID is shipped in the repository. The server reads this config for each submission, so it needs no restart. Running the helper again explicitly changes the destination; use it when moving to a fresh mentoring chat.

## What Submit does

The server first saves the exact answer, then queues a bounded message containing its section/submission IDs and review instructions. It does not embed learner notes, execute the external student project, grade the answer, or unlock a section. The mentor reads the saved response with `node scripts/review-beginner.mjs` and records an advance/revise decision when the evidence supports it.

When Codex is busy, Queue waits for the current response to finish. The learner can choose **Steer** on the queued card. The installed queue command has no steering switch; changing the desktop typed-message preference does not change this command. Keep the local computer, Codex app, and Foundry server running. Delivery to other hosts or versions has not been verified.

Only explicit Submit clicks trigger messages. Draft saves, code-file saves, and unchanged state send nothing. There is no minute-based AI polling or scheduled task. Actual mentoring still uses the user's normal Codex allowance. If queuing fails, the answer stays saved and the page asks for a manual review request. Delivery receipts prevent automatic repeats, including after restart; ambiguous failures are not retried on a timer.

After responding, the mentor acknowledges the exact response:

```sh
node scripts/check-mentor-submission.mjs --ack SECTION_ID --submission SUBMISSION_ID
```

Acknowledgment suppresses duplicate discussion; it is separate from conceptual approval. Leave a section pending when a focused chat clarification is needed. Do not acknowledge changed IDs or drafts. Do not print `.data/mentor-review.key` or the bootstrap token. Follow [the review workflow](BEGINNER.md#review-workflow).

To disable notifications, without deleting learning records:

```sh
node scripts/configure-mentor.mjs --disable
```
