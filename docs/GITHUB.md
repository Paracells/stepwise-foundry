# GitHub copy and GitLab sync

This repository can live on GitHub while the original project stays on GitLab. GitHub is the working copy; GitLab is the read-only upstream. A scheduled GitHub Actions workflow fetches upstream, merges it, runs the core tests, and pushes only when the result is healthy.

## Remotes

After the one-time move, use these names:

```sh
git remote -v
# origin    https://github.com/<owner>/<repo>.git   (push and pull)
# upstream  https://gitlab.com/koraji95coder/stepwise-foundry.git
```

Move an existing GitLab checkout with:

```sh
git remote rename origin upstream
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

Do not keep `origin` pointed at GitLab if GitHub is the working copy.

## Workflows

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `CI` | Push to `main`, pull request, manual | Installs Node 22 and Rust, runs `npm ci` and `npm test`, then starts the local server and checks `/api/bootstrap`. |
| `Sync from GitLab` | Daily at about 03:17 UTC, manual | Fetches GitLab `main`, fast-forwards or merges, runs `npm ci` and `npm test`, then pushes. |

The sync workflow never force-pushes. If upstream and GitHub changed the same lines, or if the merged code fails tests, it restores the checkout and opens an issue named **GitLab sync needs attention**. The next successful sync closes that issue. GitHub disables scheduled workflows after 60 days without repository activity; run the workflow manually or push a commit to re-enable the schedule.

To run a sync immediately, open **Actions → Sync from GitLab → Run workflow**. You can also test the merge locally:

```sh
git fetch upstream
git merge upstream/main
npm ci && npm test
git push origin main
```

## Optional sync token

The default `GITHUB_TOKEN` can push the merge, and the sync workflow runs the tests itself. It has two limitations:

- A push made with `GITHUB_TOKEN` does not trigger another workflow run.
- It cannot change files under `.github/workflows/`.

If you want the synced push to start the normal `CI` workflow, create a fine-grained personal access token for this repository with **Contents: Read and write** and **Workflows: Read and write**, then add it as the `SYNC_TOKEN` Actions secret. The workflow uses it automatically. Keep the token private.

Branch protection must allow the sync workflow to push to `main`. If you require pull requests, use a sync PR workflow instead of direct pushes.

## Codespaces

`.devcontainer/devcontainer.json` creates a Node 22 + Rust environment, installs dependencies, builds Monaco, and forwards port 4173.

1. On GitHub, choose **Code → Codespaces → Create codespace on main**.
2. Wait for `npm ci` and `npm run build:editor`.
3. Run `npm start`.
4. Open the forwarded port 4173. Keep its visibility **Private**.

The app remains a local, single-user code-execution workbench. It binds to `127.0.0.1` and validates Host and Origin. Do not make the forwarded port public and do not weaken those checks. If the Codespaces proxy rejects the forwarded host, run the app in a local clone instead; GitHub Actions is CI, not a public hosting service.

## Secrets and learner data

`.data/`, mentor keys, virtual environments, and `test-results/` are ignored by Git. Do not commit progress backups, tokens, or terminal output. The sync workflow needs no GitLab credentials because the upstream repository is public.
