# CLAUDE.md

Guidance for Claude Code sessions working in this repository.

## What this is

Checkpoint — a games equivalent of Letterboxd. Right now it is a specification
and a prototype; there is no application code yet. Read
[`docs/spec.md`](docs/spec.md) before proposing anything structural, and prefer
amending the spec over inventing a parallel design in code.

## The one idea that must not get lost

**The atomic logged object is a playthrough, not a log entry.** A playthrough has
status, platform, start and end dates, hours, a replay number, and a drop point.
Ratings and reviews attach to the playthrough, never directly to the game.

Every shortcut away from this (rating on the game, a single boolean "played")
breaks replays, per-platform opinions and progress-gated spoilers at the same
time. If a change seems to need it, that is a spec discussion, not an
implementation detail.

## Layout

| Path | Responsibility |
|---|---|
| `api/` | Go service. `cmd/checkpointd` wires it up; `internal/` holds config, httpapi, store. Migrations in `api/migrations/`. |
| `app/` | Expo / React Native client, iOS first. Screens in `src/screens/`, shared UI in `src/components/`, tokens in `src/theme.ts`. |
| `web/` | Next.js public read-only pages. Not built — M5. |
| `docs/` | Spec, ADRs, prototype source |

`app/src/data.ts` is sample data standing in for the API. Its types mirror the
schema, so replacing it with real fetches should not move the screens around.

Handlers in `internal/httpapi` do transport work only — decode, call inward,
encode. Domain logic gets its own package so it is testable without a request.

`web/` exists for one reason: an indexable page per game is the main acquisition
channel, and going app-first gives it up unless we build it deliberately. Do not
add logging UI or authenticated flows there.

## Conventions

- Solo project. Pushing straight to `main` is the normal path; branch only when
  a change might get abandoned halfway. Do not propose a merge-request workflow
  unless asked.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
  CI checks this on merge requests only, so it never blocks a direct push.
- Every architectural choice gets an ADR in `docs/adr/`. Copy `0001` as the shape.
- Secrets never enter the repo. They are GitLab CI/CD variables, masked and
  protected. `.env` is git-ignored and must stay that way.

## Things that will bite you

- **Mirror IGDB, never proxy it.** Its rate limit (~4 req/s) cannot serve live
  traffic, and RAWG's free tier is 20k requests/month. Sync into our own Postgres
  and serve from there.
- **Game identity is a graph.** Remasters, ports, editions, DLC and bundles are
  separate rows linked by `parent_game_id`. Flattening this makes every rating
  average wrong.
- **Blocking must exist in the schema from the start.** Apple's guideline 1.2
  requires user blocking, and retrofitting it into feed queries is invasive.
- **PSN and Xbox imports use unofficial endpoints.** Isolate them behind one
  interface; a sync failure must never degrade the core product.

## GitLab access

`.mcp.json` wires up GitLab's official remote MCP server
(`https://gitlab.com/api/v4/mcp`), so a local session can read merge requests,
issues and pipelines. Approve it when Claude Code prompts, then authorize in the
browser. `/mcp` shows whether it connected. Setup and the Free-tier fallback are
in [`docs/getting-started.md`](docs/getting-started.md).

Never put a token in `.mcp.json`. Use `${VAR}` expansion and set the variable in
your shell.

## Before you push

```sh
make check      # runs everything CI runs: gofmt, go vet, go test, app typecheck
```

CI skips any stage whose directory does not exist, so adding `web/` later needs
no pipeline changes.

Running it locally is in [`README.md`](README.md). The short version: `docker
compose up -d` then `go run ./cmd/checkpointd` for the API, and `npx expo start`
in `app/` for the phone client.
