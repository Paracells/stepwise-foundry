#!/usr/bin/env bash
set -euo pipefail

UPSTREAM_URL="${UPSTREAM_URL:-https://gitlab.com/koraji95coder/stepwise-foundry.git}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-main}"
TARGET_BRANCH="${TARGET_BRANCH:-main}"
ISSUE_TITLE="GitLab sync needs attention"
TEMP_DIR="${RUNNER_TEMP:-/tmp}"
LOG_FILE="$TEMP_DIR/gitlab-sync-test.log"
BASE_REVISION="$(git rev-parse HEAD)"

mkdir -p "$TEMP_DIR"
: > "$LOG_FILE"

say() {
  printf '%s\n' "$*"
}

summary() {
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    printf '%s\n' "$*" >> "$GITHUB_STEP_SUMMARY"
  fi
}

find_open_issue() {
  command -v gh >/dev/null 2>&1 || return 0
  [ -n "${GH_TOKEN:-}" ] || return 0
  gh issue list --state open --search "GitLab sync needs attention in:title" --limit 100 \
    --json number,title \
    --jq '.[] | select(.title == "GitLab sync needs attention") | .number' \
    | head -n 1
}

report_failure() {
  local reason="$1"
  local details_file="${2:-}"

  summary "### GitLab sync needs attention"
  summary ""
  summary "$reason"
  summary ""
  summary "Nothing was pushed. The workflow checkout was restored to \`$BASE_REVISION\`."

  if [ -z "${GH_TOKEN:-}" ] || ! command -v gh >/dev/null 2>&1; then
    say "GH_TOKEN is unavailable; skipping issue creation."
    return 0
  fi

  local body_file
  body_file="$(mktemp)"
  {
    printf 'The scheduled GitLab sync could not update `%s`.\n\n' "$TARGET_BRANCH"
    printf '**Reason:** %s\n\n' "$reason"
    printf -- '- Run: %s/%s/actions/runs/%s\n' \
      "${GITHUB_SERVER_URL:-https://github.com}" \
      "${GITHUB_REPOSITORY:-}" \
      "${GITHUB_RUN_ID:-}"
    printf -- '- Upstream: `%s` (`%s`)\n\n' "$UPSTREAM_URL" "$UPSTREAM_BRANCH"
    printf 'Nothing was pushed. The workflow checkout was restored to `%s`.\n\n' "$BASE_REVISION"

    if [ -n "$details_file" ] && [ -s "$details_file" ]; then
      printf '<details><summary>Last output</summary>\n\n'
      printf '~~~text\n'
      tail -n 120 "$details_file"
      printf '\n~~~\n\n'
      printf '</details>\n\n'
    fi

    printf 'Resolve locally:\n\n'
    printf '~~~sh\n'
    printf 'git fetch upstream\n'
    printf 'git merge upstream/%s\n' "$UPSTREAM_BRANCH"
    printf 'npm ci && npm test\n'
    printf 'git push origin %s\n' "$TARGET_BRANCH"
    printf '~~~\n\n'
    printf 'The next successful sync closes this issue automatically.\n'
  } > "$body_file"

  local issue_number
  issue_number="$(find_open_issue || true)"
  if [ -n "$issue_number" ]; then
    gh issue comment "$issue_number" --body-file "$body_file" \
      || say "Could not comment on issue #$issue_number."
  else
    gh issue create --title "$ISSUE_TITLE" --body-file "$body_file" \
      || say "Could not create the sync issue."
  fi
  rm -f "$body_file"
}

close_issue_on_success() {
  [ -n "${GH_TOKEN:-}" ] || return 0
  command -v gh >/dev/null 2>&1 || return 0

  local issue_number
  issue_number="$(find_open_issue || true)"
  [ -n "$issue_number" ] || return 0

  gh issue comment "$issue_number" \
    --body "GitLab sync succeeded in ${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-}/actions/runs/${GITHUB_RUN_ID:-}. Closing this issue." \
    || true
  gh issue close "$issue_number" || true
}

say "Fetching $UPSTREAM_URL ($UPSTREAM_BRANCH)"
git remote remove upstream 2>/dev/null || true
git remote add upstream "$UPSTREAM_URL"
if ! git fetch --no-tags upstream "$UPSTREAM_BRANCH" > "$LOG_FILE" 2>&1; then
  report_failure "Could not fetch the upstream branch." "$LOG_FILE"
  exit 1
fi
UPSTREAM_REVISION="$(git rev-parse FETCH_HEAD)"
say "Upstream revision: $UPSTREAM_REVISION"

if git merge-base --is-ancestor "$UPSTREAM_REVISION" HEAD; then
  say "GitHub already contains the current upstream revision."
  summary "### GitLab sync"
  summary ""
  summary "Already up to date with \`$UPSTREAM_REVISION\`."
  close_issue_on_success
  exit 0
fi

if git merge-base --is-ancestor HEAD "$UPSTREAM_REVISION"; then
  say "Fast-forwarding to the upstream revision."
  git merge --ff-only "$UPSTREAM_REVISION"
else
  say "Merging upstream changes with the GitHub branch."
  if ! git merge --no-ff --no-edit "$UPSTREAM_REVISION"; then
    CONFLICT_FILE="$TEMP_DIR/gitlab-sync-conflicts.txt"
    {
      printf 'Conflicting files:\n\n'
      git diff --name-only --diff-filter=U || true
    } > "$CONFLICT_FILE"
    git merge --abort 2>/dev/null || git reset --hard "$BASE_REVISION"
    report_failure "The upstream merge has conflicts." "$CONFLICT_FILE"
    exit 1
  fi
fi

say "Running npm ci and the core test suite on the merged revision."
if ! { npm ci && npm test; } > "$LOG_FILE" 2>&1; then
  git reset --hard "$BASE_REVISION"
  report_failure "The merged revision failed npm ci or npm test." "$LOG_FILE"
  exit 1
fi

if ! git push origin "HEAD:$TARGET_BRANCH"; then
  git reset --hard "$BASE_REVISION"
  report_failure "GitHub rejected the push. Check branch protection and token permissions." "$LOG_FILE"
  exit 1
fi

NEW_REVISION="$(git rev-parse HEAD)"
say "Pushed $NEW_REVISION to origin/$TARGET_BRANCH."
summary "### GitLab sync"
summary ""
summary "Updated \`$TARGET_BRANCH\` from \`$UPSTREAM_REVISION\` and passed core tests."
close_issue_on_success
