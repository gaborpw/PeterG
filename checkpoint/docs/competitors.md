# Competitive notes

What the incumbents do, where they leave room, and what that means for us.

**On sourcing:** `backloggd.com`, `letterboxd.com` and several others are
unreachable from the environment these notes were gathered in, so most of this
comes from third-party reviews read through search summaries rather than from
the products' own pages. Treat specific numbers as reported, not verified.
Sources are listed at the end.

---

## Backloggd — the one to beat

The default answer to "is there a Letterboxd for games." Roughly 650,000
registered users, which is the largest community in this space.

**What it does well**
- Five-star ratings, journal-style logging, clean interface
- A real community — reviews get read and replied to
- Genuine status granularity: Played / Playing / Backlog / Wishlist, with
  Completed, Mastered, Retired, Shelved and Abandoned underneath
- Powered by a broad catalogue, so the game you want is there

**What it does not have**

As of a February 2026 FAQ update, **no native app.** Mobile is a
mobile-optimised website.

One reviewer described the consequence precisely: logging on a phone means
loading the site, finding the game, opening the log editor, and tapping through
fields laid out for a mouse. Their log drifted out of date as a result — they
called it *"an old photo"* rather than a current tracker.

**Why it stays that way:** one developer, full-time on it since 2025. Feature
work moves at the pace one person can manage.

---

## The gap, stated plainly

The opening in this market is not a missing feature. Backloggd has the
community, the catalogue and the status model.

**The opening is the thirty seconds between finishing a session and having it
recorded.** Backloggd loses logs to friction. A tracker whose data is stale is
worse than useless, because you stop trusting the stats built on it.

One reviewer's benchmark was **thirty seconds or less** to log, rate and get
out. That is one person's number rather than research — take the direction as
sound and the figure as illustrative.

### What that changes for us

It argues for spending effort on the log flow before adding screens:

- ➕ stays one thumb-reach from every screen — already true
- Pre-fill platform from last time; most people play on one machine
- Remember hours and offer "+1h since yesterday" rather than an empty field
- A one-tap "played today" that logs a session without opening the full form
- Never block a log on a field the user does not care about

It also reframes the native app from a preference into the main advantage. The
`web/` surface still earns its place for search traffic (ADR 0003), but the app
is where the product wins.

---

## Others worth knowing

| | Shape | Where it leaves room |
|---|---|---|
| **GG (ggapp.io)** | Mobile-first, native iOS and Android, freemium ~$5/mo. Connects Steam, PSN, Xbox, Switch, Epic. | Library management over community; the social side is thinner |
| **Grouvee** | Clean tracker on Giant Bomb's catalogue. Free. | Deliberately not a social network |
| **HowLongToBeat** | Time-to-finish estimates | Self-reported, not measured. Our medians come from real playthroughs — see spec §3.7 |
| **Serializd** | The Letterboxd for TV. Per-episode half-star ratings feed a season-quality chart. | Its lesson is structural: granularity is what makes the aggregates worth visiting |
| **Letterboxd** | The model. Log, diary, four favourites, half-stars, chronological feed, Pro/Patron tiers. | Films are stable and watched once; games are none of that — see spec §2 |

---

## Sources

- [Backloggd Review: I Tested It for 6 Months](https://www.twoaveragegamers.com/backloggd-review/) — no native app as of Feb 2026, mobile-web friction, "an old photo", solo developer full-time since 2025
- [Letterboxd for Games? We Tested 7](https://www.twoaveragegamers.com/best-letterboxd-alternatives-for-gamers-who-track-everything-2026/) — ~650K users, web-only, GG mobile-first
- [Backloggd vs GG vs SavePoint](https://www.twoaveragegamers.com/backloggd-vs-gg-vs-savepoint/) and [GG App Review](https://www.twoaveragegamers.com/gg-app-review/) — the thirty-second benchmark
- [Famiboards — Is Backloggd the go-to game tracker?](https://famiboards.com/threads/is-backloggd-the-go-to-game-tracker.12194/)
- [Backloggd — About](https://backloggd.com/about/) — status model, journal, 1–10 rating
- [Serializd press kit](https://impresskit.net/serializd) — per-episode ratings, season-quality stats

**Weigh this carefully:** four of the six sources are the same publication. The
"no native app" fact is corroborated across them and matches Backloggd being
web-only, so it is solid. The thirty-second figure is one reviewer's judgement.
Nothing here replaces looking at the products yourself.
