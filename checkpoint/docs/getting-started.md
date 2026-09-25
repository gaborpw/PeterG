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

## Step 4a — give Claude access to GitLab

GitLab runs an **official remote MCP server**, so a local Claude Code session can
read and act on your merge requests, issues and pipelines directly. This has
nothing to do with the claude.ai connector directory — Claude Code adds MCP
servers itself.

This repository already carries the config, in `.mcp.json` at the root:

```json
{
  "mcpServers": {
    "gitlab": {
      "type": "http",
      "url": "https://gitlab.com/api/v4/mcp"
    }
  }
}
```

Because it is project-scoped and committed, Claude Code picks it up when you run
it in this folder. The first time it does, it asks you to approve the server —
that prompt exists so a repository you clone cannot wire up a server behind your
back. Approve it, then authorize in the browser window GitLab opens. Credentials
are reused after that.

Check it worked:

```
/mcp
```

`gitlab` should be listed as connected.

**Self-managed GitLab:** swap `gitlab.com` for your host. The path stays
`/api/v4/mcp`.

**Extra toolsets:** some are opt-in rather than exposed by default. Add a header
to turn them on:

```sh
claude mcp add -s user --transport http gitlab https://gitlab.com/api/v4/mcp \
  --header "X-Gitlab-Enabled-Mcp-Server-Toolsets: core,work_items"
```

### If your GitLab tier does not include it

The MCP server is reported to require **Premium or Ultimate**. On Free it may not
be available — confirm against
https://docs.gitlab.com/user/model_context_protocol/mcp_server/ before assuming
either way.

If it is not available to you, a community server works against the ordinary
GitLab REST API on any tier, authenticated with a personal access token. Use
environment-variable expansion so the token never lands in git:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["-y", "@zereight/mcp-gitlab"],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "${GITLAB_PERSONAL_ACCESS_TOKEN}",
        "GITLAB_API_URL": "https://gitlab.com/api/v4"
      }
    }
  }
}
```

Set `GITLAB_PERSONAL_ACCESS_TOKEN` in your shell profile, not in this file.
Community servers are third-party code running locally with write access to your
repositories — read what you are installing first.

## Step 5 — make it a professional repo

In your GitLab project's settings:

| Setting | Where | Value |
|---|---|---|
| Protect `main` | Settings → Repository → Protected branches | Allowed to push: **No one**. Allowed to merge: Maintainers |
| Require a green pipeline | Settings → Merge requests | Tick **Pipelines must succeed** |
| Squash commits | Settings → Merge requests | **Encourage** or **Require** |
| Delete source branch | Settings → Merge requests | Tick the default |
| Secrets | Settings → CI/CD → Variables | Add as **Masked** and **Protected** |

The templates in `.gitlab/` are picked up automatically. `CODEOWNERS` only
*enforces* review on GitLab Premium and above; on Free it is documentation, which
is still worth having.

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
