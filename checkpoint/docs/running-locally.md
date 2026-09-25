# Running everything

Three things run: the database, the API, and the app. Each wants its own
terminal window.

## Once per machine

Already done on Peter's Mac; here for the next one.

- Docker Desktop — docker.com/products/docker-desktop
- Node LTS — nodejs.org
- Go — go.dev/dl (Apple macOS ARM64)
- Expo Go on the phone, from the App Store

## Every time

### 1. Database

Start Docker Desktop from Applications first and wait for the whale in the
menu bar to settle. Then, in **window 1**:

```sh
cd ~/PeterG/checkpoint
docker compose up -d
```

It detaches, so this window is free again. The database keeps running in the
background even after you close the window — `-d` is what does that.

### 2. API — window 2

```sh
cd ~/PeterG/checkpoint/api
go run ./cmd/checkpointd
```

Wait for a line containing `"msg":"listening"`. **This window is now the
server.** It has no prompt and logs every request. Leave it alone.

### 3. App — window 3

```sh
cd ~/PeterG/checkpoint/app
npx expo start
```

A QR code appears. Scan it with the iPhone Camera and tap the banner.
**This window is now Metro.** Press `r` to reload the app, `Ctrl+C` to stop.

### 4. Commands — window 4

Everything else goes here: `git pull`, `psql`, anything one-off.

## Checking it works

```sh
curl localhost:8080/readyz
```

`{"status":"ready"}` means the API reached the database. In the app, Library's
badge should read **Synced** with a green dot; **On this device** means it fell
back to local storage and something above is not running.

## Seeing your data

```sh
cd ~/PeterG/checkpoint
docker compose exec postgres psql -U checkpoint -d checkpoint \
  -c "select g.title, p.status, p.hours, p.rating from playthrough p join game g on g.id = p.game_id;"
```

Rating is stored in half-steps out of ten, so 8 is four stars.

## Stopping

- App and API: `Ctrl+C` in their windows
- Database: `docker compose down` — add `-v` to also wipe the data and re-run
  the migrations from scratch

## When something is wrong

| Symptom | Cause |
|---|---|
| `Port 8081 is running this app in another window` | Metro is already up somewhere. Answer `no` and use that window. |
| Library says **On this device** | The API is not running, or the phone is on a different network from the Mac |
| `DATABASE_URL is required` | No `.env` in `checkpoint/` — `cp .env.example .env` |
| `command not found: docker` | Docker Desktop has not been launched since install |
| A migration did not run | `docker-entrypoint-initdb.d` only runs on an empty volume. `docker compose down -v` then `up -d`. |
