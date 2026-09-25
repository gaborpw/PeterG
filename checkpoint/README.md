# Checkpoint

A social diary for the games you play — Letterboxd, but built around the
playthrough instead of the purchase.

**Status: M1 skeleton. The app runs; the API serves health checks; neither is
wired to the other yet.**

| What | Where |
|---|---|
| Product spec | [`docs/spec.md`](docs/spec.md) |
| Clickable iOS prototype (source) | [`docs/prototype/`](docs/prototype/) |
| Information architecture | [`docs/information-architecture.md`](docs/information-architecture.md) |
| Competitive notes | [`docs/competitors.md`](docs/competitors.md) |
| Running it locally | [`docs/running-locally.md`](docs/running-locally.md) |
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
| `api/` | Go + Postgres | server, config, health checks, schema |
| `app/` | React Native + Expo (iOS first) | four screens, sample data, runs on device |
| `web/` | Next.js, read-only public pages for SEO | M5 |
| `docs/` | spec, ADRs, prototype | current |

## Running it

**The app, on your phone** — no Apple Developer account needed:

```sh
cd app
npm install
npx expo start
```

Scan the QR code with the Expo Go app. Four tabs, real navigation, sample data.
The Game tab's collapsed review demonstrates progress-aware spoiler gating: tap
"Reveal anyway".

**The API:**

```sh
docker compose up -d          # Postgres, migrations applied on first boot
cp .env.example .env
cd api && go run ./cmd/checkpointd
```

Then `curl localhost:8080/healthz` and `curl localhost:8080/readyz`. The second
only passes once Postgres is up, which is the point of having both.

**Everything CI runs:**

```sh
make check
```

The milestone plan lives in [§10 of the spec](docs/spec.md). M1 is the one that
matters: a private, single-player diary that is worth using with zero other users.

## Working on this

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for branch naming, commit format and the
merge request flow, and [`CLAUDE.md`](CLAUDE.md) for the context Claude Code loads
automatically in this repo.
