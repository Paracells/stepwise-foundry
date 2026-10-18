# Stepwise Foundry

Learn programming locally: read a short explanation, follow the official reference, write code, and check what it actually does.

Stepwise Foundry is a free, MIT-licensed learning workbench with a Monaco code editor, real local execution, and progress stored on your computer. It started as a learner's project built with Codex. The teaching material is AI-assisted and needs continued human review; passing checks or mentor review does not establish mastery.

![Rust lesson in the local workbench](docs/workbench.png)

| Track | Lessons | Runtime |
| --- | ---: | --- |
| Rust | 200 | Rust through rustup; edition 2024 |
| Python | 100 | Python 3.15 |
| PyTorch | 60 | PyTorch 2.14 CPU, Python 3.14 |
| Hugging Face | 48 | Python 3.14 with the pinned ML packages |

There are no accounts, rankings, streaks, telemetry, payments, or required model API keys. Built-in ML exercises use tiny local data and randomly initialized models without downloading pretrained weights. Online documentation and first-time dependency installation require internet access.

## Quick start

Install [Node.js 22 or newer](https://nodejs.org/) and [Rust through rustup](https://rust-lang.org/tools/install/). On Windows, Rust's MSVC toolchain also needs the Visual Studio C++ build tools. Confirm `rustc --version` and `cargo --version` work in your terminal.

```sh
git clone https://gitlab.com/koraji95coder/stepwise-foundry.git
cd stepwise-foundry
npm ci
npm start
```

Open [127.0.0.1:4173](http://127.0.0.1:4173). Stop with Ctrl+C and use `npm start` to return. Rust works without installing the optional Python environments. Code uses a portable dark theme and system monospace fonts; no personal editor profile is needed.

The full app was tested on Windows, and the core tests also pass in Linux CI. macOS installation feedback is welcome. The optional guided Rust beginner path currently teaches PowerShell commands. The main 408-lesson curriculum is separate and freely navigable.

## Two ways to learn

- **Open curriculum:** choose a track, read the explanation and linked documentation section, edit the commented starter, then Run or Check. Checks execute real assertions or expected compiler diagnostics. Hints and worked solutions are available. Manual field labs are explicitly self-reported.
- **Rust beginner path:** six chapters and sixteen small sections cover folders, Cargo, a first program, values, and variables. Write predictions, submit explanations and observed output, then have a mentor review that exact submission before the next section opens. This path uses a new practice folder you choose; the app does not create or edit that external project.

Mentor review is a local workflow, not an integrated AI service. Submitting does not contact Codex, Claude, or another person. Bring the exported handoff to a human mentor or an assistant with local project access. See [the beginner and mentor guide](docs/BEGINNER.md). General curriculum exercises remain available while a guided section awaits review.

## Optional Python and ML tracks

Use an existing Python installation to run:

```sh
python scripts/setup-python.py --python-only
# To also install the CPU ML environment:
python scripts/setup-python.py
```

On Windows, setup downloads the official Python 3.15 runtime and verifies its advertised SHA-256. It creates `.venv-python` for the language track and `.venv-ml` for ML. The ML environment needs a Python 3.14 bootstrap interpreter (`py -3.14` on Windows or `python3.14` elsewhere). These installs can be large and require network access. No system Python or PATH changes are made.

On macOS/Linux, install Python 3.15 yourself or set `PYTHON315` to its executable. `PYTHON_ML_BOOTSTRAP` can select a Python 3.14 interpreter. Setup writes machine-local paths to ignored `.runtime/runtimes.json`. `WORKSHOP_PYTHON` and `WORKSHOP_ML_PYTHON` override those paths. Restart the server after setup. Other Python/ML versions are not verified against this curriculum's pinned checks.

## Keep your learning record

Drafts, notes, attempts, review receipts, and completion records live in `.data/progress.json`, with atomic saves and a previous-file recovery copy. Export a JSON backup or a mentor report from **My progress**. Backups include all four tracks. Restoring replaces the active record and keeps its previous version locally; imported completion and review claims are preserved rather than regraded.

Learning records, mentor keys, virtual environments, and generated assets are ignored by Git. Do not attach real progress backups or private terminal output to a public issue. No learner history is included in this repository.

Set `PORT` to change the port and `FOUNDRY_DATA_DIR` to select another data directory. For example, in PowerShell:

```powershell
$env:PORT = '4174'
$env:FOUNDRY_DATA_DIR = 'C:\learning-data\foundry'
npm start
```

## Contribute

Helpful contributions include reviewing lesson accuracy and progression, fixing confusing explanations, checking documentation links, improving accessibility, and testing installation on other systems. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [the curriculum map](docs/CURRICULUM.md). Issues and merge requests are welcome.

```sh
npm test                         # core app, storage, Rust execution, review gates
npm run test:python              # requires the optional Python and ML environments
npm run verify:curriculum -- --starters --module=ownership
node scripts/check-links.mjs     # optional online reference check
```

The full verifier can also select `--track=python`, `--track=pytorch`, or `--track=huggingface`. It runs supplied solutions and checks unfinished starters; field labs are reported separately. Optional nightly Rust exercises need `rustup toolchain install nightly --profile minimal`.

## Local execution and license

The server binds to `127.0.0.1` and checks Host, Origin, and a per-process token before mutations. Submitted programs run with your user permissions, **without an operating-system sandbox**. Run trusted code only. Keep this a local app; publishing the source does not make it suitable for a hosted execution service. See [SECURITY.md](SECURITY.md).

Original teaching material and application code are licensed under [MIT](LICENSE). Linked documentation retains its own licenses and is not bundled. Monaco Editor is MIT-licensed; its license and bundled notices are preserved by the editor build. There is no affiliation with the projects whose documentation is linked.
