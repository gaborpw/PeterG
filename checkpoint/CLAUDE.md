# CLAUDE.md

Guidance for Claude Code sessions working in this repository. Read on every
prompt, automatically.

## Rules

Standing rules for every session here. They outrank convenience.

1. **Show the change before making it.** Propose the edit, wait for a yes. The
   before/after diff comes from `.claude/settings.json`
   (`permissions.defaultMode: "default"`) — that file enforces it; this rule
   means don't route around it by piping a heredoc through Bash.
2. **One change at a time.** A refactor and a feature are two approvals, not
   one. If a task needs five files touched, say so first and get agreement on
   the shape before touching any of them.
3. **Run `make check` before saying it works.** "It should work" is not a
   report. If it was not run, say it was not run.
4. **Do what was asked.** No extra features, no drive-by renames, no
   reorganising files that were not part of the task. Notice something worth
   fixing — say so, do not fix it.
5. **Say when you are unsure.** A guess presented confidently costs more than a
   question. Flag assumptions at the point they are made, not at the end.
6. **Never invent data.** No placeholder ratings, fake hours, or made-up API
   responses presented as real. Sample data lives in `app/src/data.ts` and is
   labelled as sample data.
7. **Secrets never enter the repo.** Not in code, not in config, not in a
   commit message, not in `.mcp.json`. `.env` stays git-ignored.
8. **Explain the trade-off in a sentence.** Every decision costs something. Name
   it. If there is no cost, the decision was obvious and needs no explanation.
9. **Push back before building.** If the request conflicts with the spec or an
   ADR, say so first. Peter decides; do not quietly comply with something that
   breaks the playthrough model.

## What this is

Checkpoint — a games equivalent of Letterboxd.
[`docs/information-architecture.md`](docs/information-architecture.md) holds the
tab structure, the screen inventory and the per-screen work breakdown — read it
before adding a screen or moving something between tabs. Right now it is a specification
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

## State and persistence

`src/store.tsx` is the only source of truth for playthroughs. Screens call
`useLibrary()`; nothing reads `src/data.ts` for the user's own games any more
(it still holds the catalogue and the community sample data).

`src/storage.ts` sits behind it and is the only file that knows about
AsyncStorage. When the API lands, that file changes and nothing else does. It
loads the backend lazily and falls back to memory-only if the native module is
missing, so a broken link degrades to forgetfulness rather than a crash on boot.

The first write is deliberately gated on the first read completing — otherwise
the seed data would overwrite real logs on a slow disk.

## Navigation

One native stack: `Tabs`, `Game`, `Log`. Detail screens are pushed rather than
swapped in, which is where back buttons come from. The tab bar lives inside the
`Tabs` screen and the centre button pushes `Log` instead of switching tabs, so
logging never costs you the screen you were on.

Route params are the game's title and cover. Adding a screen means adding it to
`RootStackParamList` in `src/navigation.ts` — that file types the whole graph.

## Cover art

`app/src/components/Cover.tsx` is the only place a cover is drawn. Everything
passes it a title, an optional url and a size.

Two rules:

- **The fallback is not an error state.** A meaningful share of any game
  catalogue has no art — obscure releases, regional editions, most things before
  2000. Cover draws a typographic card tinted deterministically from the title,
  so a shelf of them reads as deliberate rather than broken. Never replace it
  with a spinner, a broken-image glyph or a grey box.
- **Never hotlink IGDB's CDN in production.** Cache the images and re-serve them
  from our own, with our own crops. Hotlinking puts our uptime in someone else's
  hands and their terms can change. Dev is a different matter: pointing
  `coverUrl` at `https://images.igdb.com/igdb/image/upload/t_cover_big/<id>.jpg`
  while building is fine.

Cover art is copyrighted by its publishers. Displaying it alongside a review of
the game is the same editorial use Letterboxd, Backloggd and IGDB itself rely
on. Do not build features that repackage the art on its own — wallpapers,
galleries, downloads.

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

## GitLab

Plain `git` over HTTPS, using the machine's stored credentials. Push straight to
`main`.

There is deliberately no MCP server for GitLab here. The official one
(`https://gitlab.com/api/v4/mcp`) requires a Premium or Ultimate plan — on Free
it completes OAuth and then rejects the connection — and all it adds is reading
merge requests and pipelines, which a solo project does not have. Do not
re-add it unless the plan changes.

## Before you push

```sh
make check      # runs everything CI runs: gofmt, go vet, go test, app typecheck
```

CI skips any stage whose directory does not exist, so adding `web/` later needs
no pipeline changes.

Running it locally is in [`README.md`](README.md). The short version: `docker
compose up -d` then `go run ./cmd/checkpointd` for the API, and `npx expo start`
in `app/` for the phone client.
