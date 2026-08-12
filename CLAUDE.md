# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## What this is

A Go program that scans Peter's personal Gmail and emails him a daily briefing
of what matters. It runs in GitHub Actions on a cron schedule. See
[`README.md`](./README.md) for setup and [`email-rules.md`](./email-rules.md)
for the filter.

## Scope — personal Gmail only

**Do not add work email to this project.** An earlier version scanned Peter's
Outlook account at Kinective; he removed it deliberately. Do not reintroduce
Microsoft 365, Outlook, or `kinective.io` anywhere — not in the scanner, not in
the rules, not as an example in the docs.

The one account is `gaborpw19@gmail.com`.

## Building and testing

```sh
go build ./...        # must compile
go vet ./...          # must be clean
gofmt -l .            # must print nothing
go run ./cmd/briefing -dry-run   # prints the briefing, sends nothing
```

`-dry-run` needs real credentials in the environment but touches no mailbox
beyond reading it — the right way to check a rules or prompt change.

There are no tests yet. The interesting behavior is Claude's classification,
which is better verified by reading a real `-dry-run` briefing than by asserting
on a mock.

## Layout and where things go

| Package | Responsibility |
|---|---|
| `cmd/briefing` | Config from env, wiring, top-level error handling |
| `internal/mail` | Gmail auth, paging, message fetch |
| `internal/brief` | The Claude call — classification and writing |
| `internal/deliver` | Email and push delivery |

Keep the Claude call in `internal/brief`. It is the only place model behavior is
configured, and scattering prompt text across packages makes it impossible to
reason about what the model is actually being asked.

## Things that will bite you

- **Page through Gmail results.** One page is not a full day — personal volume
  runs ~100 threads in 24 hours. The paging loop in `mail.Recent` is
  load-bearing, not defensive.
- **`in:anywhere` is what reaches spam and trash.** Dropping it silently halves
  the point of the project.
- **Metadata format only.** `Format("metadata")` fetches headers without bodies.
  Switching to `full` would multiply token cost roughly tenfold for a marginal
  accuracy gain — don't, without a measured reason.
- **Check `StopReason` before reading content.** A safety classifier can decline
  a request with a normal HTTP 200 and an empty content array; indexing blocks
  unconditionally panics on that path.
- **The rules file is read at runtime, not embedded.** `email-rules.md` is
  passed to Claude on every run so edits take effect the next morning without a
  redeploy. Keep it that way.
- **Push failures must not fail the run.** The email is the durable copy; a
  dropped notification is logged and ignored.

## Model configuration

`brief.Model` is `claude-opus-5`. Thinking is adaptive; the system prompt is
cached (it is byte-identical across runs, so it costs one write and is served at
cache-read rates after).

Do not downgrade the model to save money without asking Peter — the judgment
call about what matters is the entire product, and it is his call to trade
quality for cost.

## Scheduling

GitHub Actions cron is UTC and does not follow US clock changes:

| Period | 9:00 AM Eastern is | Cron |
|---|---|---|
| Mar–Nov (EDT, UTC−4) | 13:00 UTC | `0 13 * * *` |
| Nov–Mar (EST, UTC−5) | 14:00 UTC | `0 14 * * *` |

The workflow is pinned to `0 13 * * *`. Update it when the clocks change.

## Environment constraints

Discovered the hard way — save yourself the detour:

- **The Anthropic Go SDK must be v1.60.0 or newer.** `ThinkingConfigAdaptiveParam`
  and `Message.StopDetails` do not exist on older versions and the build fails
  with `undefined:` errors.
- **Repository settings writes are blocked** by the agent proxy. Renaming the
  repo, changing visibility, and creating repositories all return 403. The repo
  is named `PeterG` for that reason, not by preference — Peter has to make those
  changes himself in the GitHub web UI.
- Reading repos, pushing commits, and opening PRs all work normally.
- No `gh` CLI. Use the `mcp__github__*` tools.
- **Routines created via `create_trigger` cannot carry mail connectors** — the
  parameter is unavailable for this organization, so sessions they fire may lack
  `mcp__Gmail__*` tools. This is why the daily briefing moved to GitHub Actions.
  A Gmail-only calibration Routine still exists as a Claude session.

## Working style

Peter is directing this from a phone:

- Lead with the answer, then the detail
- Prefer a short summary in chat over a long file he has to open
- Don't ask him to run terminal commands — do the work and report back
- Flag anything that needs his hands (OAuth setup, the repo rename) explicitly,
  with tap-by-tap steps
