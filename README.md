# Email Scheduler

A Go program that reads the last 24 hours of Peter's Gmail every morning and
sends back a short summary of what actually matters.

It runs on a schedule in GitHub Actions — no server, no laptop left on, and
nothing to keep running. Scope is deliberately narrow: **personal Gmail only**.
Work email is not connected and should not be.

## What it does

Every morning at **9:00 AM Eastern**:

1. Reads the last 24 hours of `gaborpw19@gmail.com` — inbox, spam, and trash
2. Sends the sender, subject, and preview of each message to Claude, along with
   the rules in [`email-rules.md`](./email-rules.md)
3. Emails the resulting briefing back to the same address, and sends a push
   notification to Peter's phone

Spam is scanned on purpose. Real mail lands there sometimes, and a missed bank
alert costs more than a few seconds of scanning — when something important turns
up in spam, the briefing says so.

Message bodies are never read. Sender, subject, and Gmail's preview snippet are
enough to classify nearly everything, and skipping bodies cuts the token cost by
roughly an order of magnitude.

## What it reports

Six categories, and silence about everything else: **billing**, **security**,
**meetings**, **important dates**, **family and real people**, and **genuine
sales conversations**. Marketing is filtered out entirely — on a typical day
that is the overwhelming majority of the volume. The first scan found ~100
emails, of which about 6 were worth reading.

The filter itself lives in [`email-rules.md`](./email-rules.md), in plain
English. It is sent to Claude on every run, so editing that file changes the
next morning's briefing — no code change, no redeploy.

## Layout

```
cmd/briefing/        entry point, config loading
internal/mail/       Gmail client — auth, paging, message fetch
internal/brief/      Claude call — classification and writing
internal/deliver/    email + push delivery
email-rules.md       the filter (plain English, edit freely)
```

## Setup

Four things, once.

### 1. Google OAuth credentials

Gmail needs its own OAuth client — an ordinary Google account password won't do.

1. Open [console.cloud.google.com](https://console.cloud.google.com), create a
   project
2. Enable the **Gmail API**
3. **OAuth consent screen** → External → add `gaborpw19@gmail.com` as a test user
4. **Credentials** → Create credentials → OAuth client ID → **Desktop app**
5. Save the **client ID** and **client secret**

### 2. A refresh token

Run the [OAuth Playground](https://developers.google.com/oauthplayground):

1. Gear icon → check *Use your own OAuth credentials*, paste the ID and secret
2. Authorize these two scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
3. Exchange the authorization code, and copy the **refresh token**

Refresh tokens are long-lived but not permanent — a Google account password
change or a long idle period revokes them. If the job starts failing on auth,
minting a new one here is the fix.

### 3. An Anthropic API key

From [console.anthropic.com](https://console.anthropic.com). Billed per use;
see Cost below.

### 4. Repository secrets

**Settings → Secrets and variables → Actions** on this repo:

| Secret | Value |
|---|---|
| `GMAIL_CLIENT_ID` | from step 1 |
| `GMAIL_CLIENT_SECRET` | from step 1 |
| `GMAIL_REFRESH_TOKEN` | from step 2 |
| `GMAIL_ADDRESS` | `gaborpw19@gmail.com` |
| `ANTHROPIC_API_KEY` | from step 3 |
| `NTFY_TOPIC` | optional — see Push notifications |

Then open the **Actions** tab and run **Daily briefing** manually to confirm it
works, rather than waiting for tomorrow morning.

### Push notifications

Install [ntfy](https://ntfy.sh) (free, iOS and Android), subscribe to a topic,
and set that topic as the `NTFY_TOPIC` secret.

**The topic name is the only credential** — anyone who guesses it can send you
notifications, and anyone who knows it can read them. Use something long and
random, not `peter-email`. Leave the secret unset and the program simply skips
push and sends only the email.

## Running it locally

```sh
export GMAIL_CLIENT_ID=... GMAIL_CLIENT_SECRET=... GMAIL_REFRESH_TOKEN=...
export GMAIL_ADDRESS=gaborpw19@gmail.com ANTHROPIC_API_KEY=...

go run ./cmd/briefing -dry-run
```

`-dry-run` prints the briefing to the terminal and sends nothing — the right way
to test a rules change before it reaches your inbox.

## Cost

Roughly **a few cents a day** — about 8,000 input tokens and under 1,000 output
tokens per run on `claude-opus-5`, so a couple of dollars a month at typical
volume. GitHub Actions is free for this on a personal account (a few seconds of
compute per day against a 2,000-minute monthly allowance).

If that ever looks high, switching `Model` in
[`internal/brief/brief.go`](./internal/brief/brief.go) to `claude-sonnet-5`
costs less per token. Worth measuring the quality difference on a week of real
mail before deciding — the whole value of this thing is the judgment call about
what matters.

## Daylight saving

GitHub evaluates cron in UTC and does not follow US clock changes. The schedule
is pinned at `0 13 * * *` — 9:00 AM Eastern during daylight time.

**When the clocks go back in November, change it to `0 14 * * *`** in
[`.github/workflows/daily-briefing.yml`](./.github/workflows/daily-briefing.yml),
or the briefing starts arriving at 8:00 AM.

## Changing things

Ask in a Claude Code session on this repo — "stop flagging shipping emails",
"always surface anything from my sister", "move it to 7 AM". Conventions and
gotchas are in [`CLAUDE.md`](./CLAUDE.md).
