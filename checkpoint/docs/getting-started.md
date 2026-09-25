# Getting started

How to get this repository onto your own machine, open it in VS Code, and work on
it from GitLab.

## Step 0 — is it in GitLab yet?

The canonical copy currently lives on **GitHub**, in `gaborpw/PeterG`, on the
branch `claude/game-tracking-app-spec-8ivukk`, under `checkpoint/`.

Open your GitLab project page. Then:

- **It has files in it** → skip to Step 3 and clone it.
- **It is empty, or you never created it** → do Step 2a first. This is a one-time
  import; after it, GitLab is the only place you need.

## Step 1 — install the tools

| Tool | Why | Where |
|---|---|---|
| Git | everything below | https://git-scm.com/downloads |
| VS Code | the editor | https://code.visualstudio.com/ |
| Claude Code | the CLI, in the VS Code terminal | https://claude.com/claude-code |
| Node LTS | `app/` and `web/`, when they exist | https://nodejs.org/ |
| Go | `api/`, when it exists | https://go.dev/dl/ |

On Windows install **Git for Windows** — it brings Git Bash, so every command
below works exactly as written.

Check it worked: open a terminal and run `git --version`.

## Step 2 — authenticate to GitLab

GitLab does not accept your account password for Git over HTTPS. You need one of:

### Personal access token (simplest)

1. On gitlab.com, click your avatar (top right) → **Edit profile**
2. **Access tokens** in the left sidebar → **Add new token**
3. Name it `laptop`, set an expiry, tick **write_repository**
4. **Create personal access token**, then copy it — it is shown once

When Git asks for a password, paste the token, not your account password. Your
username is your GitLab username.

On Windows, Git may instead open a browser window to sign in — that is Git
Credential Manager doing the same job. Sign in and you are done; no token needed.

### SSH key (nicer once set up)

```sh
ssh-keygen -t ed25519 -C "your@email"
cat ~/.ssh/id_ed25519.pub
```

Paste that public key into gitlab.com → avatar → **Edit profile** → **SSH keys**.
Then use the `git@gitlab.com:...` form of the remote instead of `https://`.

### Step 2a — one-time import from GitHub into GitLab

Only if your GitLab project is empty.

First create the project: on gitlab.com, **+ → New project → Create blank project**.
Name it `checkpoint`, set it **Private**, and **untick** "Initialize repository
with a README" — this folder already has one.

Then:

```sh
git clone https://github.com/gaborpw/PeterG.git
cd PeterG
git checkout claude/game-tracking-app-spec-8ivukk
cd ..

cp -r PeterG/checkpoint ./checkpoint
cd checkpoint
git init
git add .
git commit -m "chore: initial import of spec, prototype and repo scaffolding"
git branch -M main
git remote add origin https://gitlab.com/<your-username>/checkpoint.git
git push -u origin main
```

`<your-username>` is the one in your GitLab URL. After this push, GitLab has
everything and you can delete the `PeterG` clone.

## Step 3 — clone it in VS Code

Without touching a terminal:

1. Open VS Code
2. `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac) → type **Git: Clone** → Enter
3. Paste your repository URL — the one from the blue **Code** button on your
   GitLab project page, e.g. `https://gitlab.com/<your-username>/checkpoint.git`
4. Pick a folder to put it in
5. **Open** when VS Code offers

Or in a terminal:

```sh
git clone https://gitlab.com/<your-username>/checkpoint.git
code checkpoint
```

## Step 4 — install the extensions

VS Code will prompt you to install the workspace's recommended extensions the
first time you open the folder. Say yes. If you miss the prompt: `Ctrl+Shift+P` →
**Extensions: Show Recommended Extensions**.

| Extension | What it gives you |
|---|---|
| **GitLab Workflow** | Merge requests, issues and pipeline status inside VS Code. This is the main reason to bother — it closes the gap left by there being no GitLab connector for Claude. |
| **Claude Code** | Claude in the editor and in the integrated terminal |
| **EditorConfig** | Honors `.editorconfig`, so formatting matches CI |
| **Go** | Language support for `api/` when it exists |
| **ESLint / Prettier** | Same, for `app/` and `web/` |
| **Expo Tools** | Expo config and app.json support |

Sign GitLab Workflow in when it asks: it will offer OAuth in a browser, which is
the easiest route.

## Step 4a — a note on GitLab and Claude

Claude Code drives this repo through ordinary `git`: it reads and writes files,
branches, commits, and pushes with the credentials your Mac already has. That is
the whole integration, and it needs no setup.

GitLab does run an official MCP server at `https://gitlab.com/api/v4/mcp`, which
would additionally let Claude read merge requests, issues and pipelines. It
requires **Premium or Ultimate** — on a Free account the OAuth flow completes and
the server then rejects the connection with "gitlab rejected them on reconnect".

It was tried here and removed. For a solo project it adds nothing: there are no
merge requests to read. If you ever upgrade or add collaborators, add it back
with:

```sh
claude mcp add -s user --transport http gitlab https://gitlab.com/api/v4/mcp
```

## Step 5 — GitLab settings worth turning on

This is a solo repo, so most "professional setup" advice is wrong for you.
Do not protect `main` against your own pushes and do not require merge requests
— you would be building a gate and then holding the only key.

Worth setting:

| Setting | Where | Value |
|---|---|---|
| Secrets | Settings → CI/CD → Variables | **Masked** and **Protected** |
| Delete source branch | Settings → Merge requests | Tick the default |
| Squash commits | Settings → Merge requests | **Encourage** |

Leave protected branches alone until someone else has push access.

The MR and issue templates in `.gitlab/` cost nothing and are there for that
day. `CODEOWNERS` was removed — it only means something with more than one
owner.

## Step 6 — check it works

```sh
make check
```

On Windows run that from Git Bash. With no code in the repo yet this passes
trivially — that is deliberate, so the pipeline is green from the first commit
instead of red until M1.

To see the prototype, open `docs/prototype/` — those are the five screen sources.
The rendered version lives at the artifact link in the spec.

## Day-to-day after this

```sh
git checkout -b feat/whatever   # never commit to main, it is protected
# ...work...
make check
git add -A
git commit -m "feat: what you did"
git push -u origin feat/whatever
```

Then open a merge request from the link GitLab prints, or from the GitLab
Workflow sidebar in VS Code. See `CONTRIBUTING.md` for the commit format CI
enforces.
