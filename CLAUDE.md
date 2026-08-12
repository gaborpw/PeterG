# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## What this project is

An automated daily email briefing for Peter Gabor. Two scheduled jobs scan his
Gmail and Outlook accounts and report what matters; a second job periodically
tunes the filter. There is no application code — the "program" is this repo's
prose plus two scheduled Claude sessions. Treat the Markdown as the source of
truth and keep it precise.

## Repository layout

| File | Role |
|---|---|
| `README.md` | Human-facing overview |
| `email-rules.md` | **The filter.** What to report, what to suppress |
| `CLAUDE.md` | This file — conventions and gotchas |

`email-rules.md` is the file that actually changes behavior. Read it at the start
of any run and write calibration results back into it.

## Accounts

- Personal: `gaborpw19@gmail.com` — Gmail connector
- Work: `Peter.Gabor@kinective.io` — Microsoft 365 connector
- Peter is an Associate Software Engineer at Kinective, based in Ohio
  (`America/New_York`)

`peter.gabor@nexussoft.com` forwards into the Outlook mailbox. It carries
personal mail, not work mail — see `email-rules.md` before classifying it.

## Running the daily scan

Search both accounts for the last 24 hours, spam and junk included.

- **Gmail:** `newer_than:1d in:anywhere -in:sent -in:draft`
  `in:anywhere` covers spam and trash. Page through results — one page is not the
  whole day; personal volume runs ~100 threads in 24 hours.
- **Outlook:** `outlook_email_search` with `afterDateTime` set 24 hours back.
  The default search covers the Inbox only — **query `Junk Email` separately**
  with `folderName`, or junk is silently missed.

Read metadata and snippets first. Only open a full message body when the snippet
is genuinely ambiguous and the answer changes whether it gets reported. Opening
everything wastes the context budget and produces a worse summary, not a better
one.

## Writing the briefing

Formatting rules live in `email-rules.md` under "How to write the briefing".
Follow them there rather than duplicating them here.

Two things worth repeating: never pad a quiet day into a long report, and always
carry concrete specifics through — dollar amounts, dates, ticket numbers. A
briefing that says "a bill arrived" instead of "$140.60 to UH Hospitals, paid"
has failed at its job.

## Calibration runs

Every two weeks, ask Peter about **specific messages**, not preferences in the
abstract. "Was the Confluence digest on the 14th worth flagging?" produces a
usable rule; "what kinds of email do you care about?" does not.

Keep it to a handful of questions. Then edit `email-rules.md`, append an entry to
its change log explaining the reasoning, and commit. Do not let calibration turn
into an interview.

## Scheduling

Both jobs run as Routines (`create_trigger`), each firing a fresh session.

**Cron is evaluated in UTC**, and Ohio observes daylight saving:

| Period | 9:00 AM Eastern is | Cron |
|---|---|---|
| Mar–Nov (EDT, UTC−4) | 13:00 UTC | `0 13 * * *` |
| Nov–Mar (EST, UTC−5) | 14:00 UTC | `0 14 * * *` |

The schedule does not adjust itself. When clocks change, update both Routines
with `update_trigger` or the briefing arrives an hour early all winter. Use
`list_triggers` to find the trigger IDs.

## Environment constraints

Discovered the hard way during setup — save yourself the detour:

- **Repository settings writes are blocked** by the agent proxy. Renaming the
  repo, changing visibility, and creating new repositories all return 403. The
  repo is named `PeterG` for this reason, not by preference. Peter has to make
  those changes himself in the GitHub web UI.
- Reading repos, pushing commits, and opening PRs all work normally.
- No `gh` CLI. Use the `mcp__github__*` tools.

## Working style

Peter is directing this from a phone. Optimize accordingly:

- Lead with the answer, then the detail
- Prefer a short summary in chat over a long file he has to open
- Don't ask him to run terminal commands — do the work and report back
- Flag anything that needs his hands (like the repo rename) explicitly and give
  tap-by-tap steps
