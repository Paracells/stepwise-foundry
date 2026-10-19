# Delayed-practice pilot

Open **My progress → Revisit a concept**, or `/revisit`. The pilot has two changed function exercises: Rust one day after `first-function` is completed, and Python two days after `py-first-function`. It uses the first recorded completion timestamp, so repeating the original does not postpone the revisit. Older records use their existing completion timestamp as the baseline, including timestamps restored from backups. An imported completion is a saved claim, not independently verified learning.

These optional revisits never lock the main curriculum or change its completion marks. There is no scheduled assistant, background model request, reminder, ranking, or streak. Due times are evaluated when the page is opened; return at your convenience.

Write a prediction and implement the changed task. **Save prediction and check code** persists an immutable copy of both before execution. Local assertions check the code, including additional inputs; they do not grade the free-text prediction or establish conceptual understanding. Compare the observed output with the saved prediction, and bring the mentor report for discussion.

The first attempt has no original explanation, app hint, or worked solution on this page. After one completed check, **Open help after trying** reveals the reference, hint, and worked example and records the time. Later attempts remain marked as assisted. Help opened later does not relabel an earlier unassisted attempt. A checkbox records help used outside this page; it is self-reported, not monitored. The report separately records whether the original lesson's worked solution had previously been viewed. Hidden help is a learning flow, not a security boundary against inspecting source or other pages.

Drafts and all submitted pilot attempts live under `revisits` in the normal local progress file and travel with backups/reports. Each attempt includes its prediction, source, timestamp, code result/output, and assistance flags. An interrupted pending check is retained without being counted as a pass. The pilot limits each variant to 200 attempts without silently dropping old attempts. This pilot provides evidence for a conversation; it does not claim to measure mastery or long-term retention by itself.

Contributors can review the task/reference/check agreement in `curriculum/revisits.mjs`. Verify that each worked implementation passes and each unfinished starter fails. More languages, varied tasks, debugging exercises, and repeated follow-ups can follow once the pilot has been evaluated.
