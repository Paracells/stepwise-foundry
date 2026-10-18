# Rust beginner path

The optional beginner path teaches a small Rust practice project in six chapters and sixteen sections. It currently uses PowerShell on Windows. Start at **Rust beginner path** in the sidebar. Pick a new empty practice folder yourself; replace the displayed `PATH_TO_YOUR_PRACTICE_FOLDER` placeholder with its full address when prompted. No folder or environment has been inspected in advance.

The learner types every command and source edit. Each section has one prompt, short official readings with stopping points, and hints where useful. Save keeps a draft. Submit holds the response for review. Later sections remain locked until the mentor reviews the current submission and permits the next section. Review may instead request revision. One review permits one next teaching step; it does not certify mastery.

The learning loop is: explain a principle, predict a result, make a small change, compare actual behavior, then try a changed example with fewer hints. Check mentor and AI explanations against exact documentation and observed evidence. Avoid having an assistant implement exercises for the learner.

## Review workflow

No AI or messaging service is built in. After submitting, export **Short mentor handoff**, bring it to your chosen mentor, and discuss the response. A local assistant can read the exact current submission with:

```sh
node scripts/review-beginner.mjs
```

The mentor uses the section and submission IDs returned by that command. Put feedback in a text file, then record the decision:

```sh
node scripts/review-beginner.mjs --section SECTION_ID --submission SUBMISSION_ID --outcome advance --feedback-file FEEDBACK_FILE
```

Use `--outcome revise` to request another attempt. A stale submission ID is rejected. The learner clicks **Check for mentor feedback** to see the result. A human mentor can also use the same helper on the learner's machine after discussing the response.

The helper reads the local `.data/mentor-review.key`, which is never included in the learner page or progress exports. This separates browser submission from review, but is not an access boundary against someone with access to the local filesystem. Do not put the key in a prompt, issue, screenshot, or commit. `PORT` and `FOUNDRY_DATA_DIR` must match the running server when using a custom environment.

The path's progress is stored in `mentoring.beginner.flow`. Section IDs are stable and must remain stable as new chapters are added. Backups preserve submitted responses and review receipts. The open curriculum has independent progress and does not bypass or award guided reviews.

The initial teaching checkpoint has no learner evidence. Fields for earlier context are available for compatibility with exported records; no completion or mentor receipt is supplied by default.
