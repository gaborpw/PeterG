# Getting started

## Moving this to your PC

Everything lives in git, so "moving locally" is a clone.

### 1. Install the basics

| Tool | Why | Where |
|---|---|---|
| Git | everything | https://git-scm.com/downloads |
| VS Code | editor | https://code.visualstudio.com/ |
| Claude Code | the CLI you have been talking to | https://claude.com/claude-code |
| Node LTS | the app and web clients | https://nodejs.org/ |
| Go | the backend, when it exists | https://go.dev/dl/ |

On Windows, install **Git for Windows** — it gives you Git Bash, which makes the
commands below identical to the ones in every tutorial you will read.

### 2. Clone

```sh
git clone https://github.com/gaborpw/PeterG.git
cd PeterG
git checkout claude/game-tracking-app-spec-8ivukk
```

Everything for Checkpoint is under `checkpoint/`.

### 3. Lift it into its own GitLab repo

Checkpoint is a separate product from the mail briefing it currently sits beside.
Give it its own repository.

1. On gitlab.com: **+ → New project → Create blank project**
   - Name: `checkpoint`
   - Visibility: **Private**
   - **Uncheck** "Initialize repository with a README" — this folder already has one
2. Then, locally:

```sh
cp -r PeterG/checkpoint ~/checkpoint
cd ~/checkpoint
git init
git add .
git commit -m "chore: initial import of spec, prototype and repo scaffolding"
git branch -M main
git remote add origin https://gitlab.com/<your-username>/checkpoint.git
git push -u origin main
```

### 4. Turn on the things that make it a professional repo

In your new GitLab project:

| Setting | Where | Value |
|---|---|---|
| Protect `main` | Settings → Repository → Protected branches | Allowed to push: **No one**. Allowed to merge: Maintainers |
| Require a green pipeline | Settings → Merge requests | Tick **Pipelines must succeed** |
| Squash commits | Settings → Merge requests | **Encourage** or **Require** |
| Delete source branch | Settings → Merge requests | Tick the default |
| Secrets | Settings → CI/CD → Variables | Add as **Masked** and **Protected** |

The MR and issue templates in `.gitlab/` are picked up automatically. `CODEOWNERS`
only enforces review on paid GitLab tiers; on Free it is documentation, which is
still worth having.

## Running the checks

```sh
make check
```

On a repo with no code yet this passes trivially — that is intentional, so the
pipeline is green from the first commit rather than red until M1.
