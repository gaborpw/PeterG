# Checkpoint

A social diary for the games you play — Letterboxd, but built around the
playthrough instead of the purchase.

**Status: specification and prototype only. There is no application code yet.**

| What | Where |
|---|---|
| Product spec | [`docs/spec.md`](docs/spec.md) |
| Clickable iOS prototype (source) | [`docs/prototype/`](docs/prototype/) |
| Architecture decisions | [`docs/adr/`](docs/adr/) |
| Setting up locally | [`docs/getting-started.md`](docs/getting-started.md) |

## The idea in one paragraph

A film is two hours, watched once, in a fixed form. A game is 8–200 hours across
weeks, usually abandoned rather than finished, on a platform that changes the
experience, in an edition that gets patched and remastered. So the thing you log
is not a dated entry — it is a **playthrough**: a status, a platform, a start and
end, hours, a replay counter, and where you stopped if you stopped. Ratings and
reviews hang off the playthrough, which is what makes replays, per-platform
opinions and progress-aware spoiler gating fall out naturally.

## Planned shape

| Component | Stack | Status |
|---|---|---|
| `api/` | Go + Postgres | not started |
| `app/` | React Native + Expo (iOS first) | not started |
| `web/` | Next.js, read-only public pages for SEO | not started |
| `docs/` | spec, ADRs, prototype | in progress |

The milestone plan lives in [§10 of the spec](docs/spec.md). M1 is the one that
matters: a private, single-player diary that is worth using with zero other users.

## Working on this

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch naming, commit format and the
merge request flow, and [`CLAUDE.md`](CLAUDE.md) for the context Claude Code loads
automatically in this repo.
