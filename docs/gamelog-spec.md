# Checkpoint — a Letterboxd for games

**Status:** design spec, v0.2 — nothing built yet
**Clickable prototype:** https://claude.ai/artifact/9TEpKgxDqL9xi19M6tTqf2 (§12)
**Platform decision:** iOS first, App Store launch (§7)
**Working name:** Checkpoint (placeholder)
**One line:** A social diary for the games you play, built around the playthrough
rather than the purchase.

---

## 1. What Letterboxd actually is

Letterboxd is not a review site with a social layer bolted on. It is a **personal
diary that happens to be public**, and almost every design decision follows from
that. Its core loop:

| Concept | What it does |
|---|---|
| **Log** | You mark a film watched on a date. That's the atomic action. |
| **Diary** | Every dated log, in order. Your year in film, automatically. |
| **Rating** | 5 stars in half-star steps (10 buckets). Optional. |
| **Like** | A separate ❤️. Decouples *"this is good"* from *"I love this"*. |
| **Review** | Free text attached to a log. Spoiler flag hides it by default. |
| **Watchlist** | One per user, aspirational, unranked. |
| **Lists** | Arbitrary user-curated collections, public or private, rankable. |
| **Four favorites** | Exactly four films pinned to your profile. Identity, not a ranking. |
| **Follow + feed** | Activity stream of the people you follow. No algorithm. |
| **Stats** | Annual and all-time breakdowns (paid tier). |
| **Pro / Patron** | Paid tiers: no ads, stats, streaming-service filters, custom art. |

Three things are worth stealing outright:

1. **The constraint is the feature.** Four favorites. Half-stars only. One
   watchlist. Scarcity makes a profile legible at a glance.
2. **Rating is optional, the log is not.** The diary works even for people who
   never write a word. Low-effort logging is the retention engine.
3. **The feed is chronological and social, not recommended.** You follow people
   whose taste you want, and discovery falls out of that.

Two things are worth *not* stealing: the watchlist-as-guilt-pile (games make this
much worse), and the assumption that consumption is a single dated event.

---

## 2. Why games are not films

This is the whole design problem. A film is two hours, consumed once, in a fixed
form. A game is none of those things.

| | Film | Game |
|---|---|---|
| Duration | ~2h, one sitting | 8–200h across weeks or months |
| Completion | Binary — you watched it | Story done ≠ 100% ≠ mastered |
| Abandonment | Rare | **The normal outcome.** Most games are never finished |
| The artifact | Stable forever | Patched, remastered, re-released, live-updated |
| Platform | Irrelevant to the work | Changes the experience materially |
| Endings | Every film has one | Live-service and roguelikes have none |
| Evidence | Your memory | Steam/PSN/Xbox already know your hours |

Five consequences, each of which becomes a product decision in §3:

**a. The atomic unit is a playthrough, not a log.** "I played Elden Ring" is not a
fact you can date. "I played Elden Ring from March 2 to April 18 on PS5, finished
the story, 94 hours" is. A playthrough has a start, an end, a state, a platform,
and possibly a replay counter.

**b. Dropping a game is real data.** Letterboxd has no vocabulary for "I walked out
90 minutes in." For games that's half the library. Abandonment with a reason and an
hour-mark is one of the most useful signals in the whole product — for the user
(honest backlog) and for other users (*"73% of people who started this dropped it
before hour 10"*).

**c. Identity is a graph, not an ID.** *Final Fantasy VII*, *FF VII Remake*, and
*FF VII Rebirth* are three works. *The Last of Us* on PS3, PS4 and PS5 is one work
with three releases. *Mass Effect Legendary Edition* is a bundle of three. The data
model must separate **work** from **release** or every list and every rating
average will be wrong.

**d. A review has a timestamp *and* a patch context.** A review of Cyberpunk 2077
in Dec 2020 and one after patch 2.0 are reviews of different software. Reviews
carry the version/platform they refer to, and the UI surfaces it.

**e. Logging can be passive.** Steam's `IPlayerService/GetOwnedGames` returns owned
titles and playtime. PSN and Xbox expose trophies/achievements through
(unofficial-but-widely-used) endpoints. Letterboxd can never know you watched a
film; we can know you played a game. **Import is the cold-start weapon** — a new
user should see 400 games and 3,000 hours on day one, before they type anything.

---

## 3. Product spec

### 3.1 The object you log: a Playthrough

Every act of play creates or updates a **playthrough** of a game.

```
Playthrough
  game            → the work
  release         → optional: which edition/port
  platform        → PS5 / PC / Switch 2 / …
  status          → wishlist | backlog | playing | paused | finished | abandoned | ongoing
  completion      → none | story | full | 100% | mastered      (only if finished)
  started_at      → date, optional
  ended_at        → date, optional
  hours           → manual or imported
  replay_number   → 1 for first run, 2+ for replays
  difficulty      → optional free-ish enum
  dropped_at_hour → only for abandoned
  drop_reason     → bounced | bored | too hard | too long | broken | life | other
  private         → bool
```

Status notes:
- **`ongoing`** is for games with no ending — *Fortnite*, *Balatro*, *Rocket
  League*. They never get a completion state; they accumulate hours and sessions.
  Forcing these into "finished" is what makes existing trackers feel wrong.
- **`paused` vs `abandoned`** is the honest distinction. Paused means "I mean to go
  back". Abandoned means "I don't". Ask once, gently, after 90 days of silence:
  *"Still planning to come back to Disco Elysium?"* — this single prompt keeps the
  backlog truthful, which is the thing every other tracker gets wrong.

### 3.2 Sessions (the diary)

Inside a playthrough, a **session** is one dated entry: a date, optional hours,
optional note. This is the direct analogue of a Letterboxd diary entry, and it's
what fills the calendar heatmap on your profile.

Sessions are optional. A user who only sets statuses gets a fine experience; a user
who journals every night gets a rich one. Never require both.

### 3.3 Rating

**5 stars, half-star increments, 10 buckets.** Not Backloggd's 1–10.

Rationale: a 10-point scale invites false precision and, empirically on every site
that uses one, collapses into a 6–9 band. Half-stars read as a gesture, not a
measurement, which is exactly the register a personal diary wants. ★★★★ and ★★★★½
feel meaningfully different in a way 8 and 9 do not.

Plus, separately:
- **❤️ Like** — orthogonal to the rating. The 3-star game you adore is the most
  interesting data point in the system.
- **Rating is attached to the playthrough, not the game.** Replays can be rated
  differently. The profile shows your latest; the game page can show drift
  (*"rated ★★★ in 2019, ★★★★½ on replay in 2025"*).
- **You may rate an abandoned game.** Required, in fact, if you want the drop data
  to mean anything. The UI says "rate what you played" and stamps the review with
  *"abandoned at ~6h"*.

### 3.4 Reviews and the spoiler problem

Spoilers matter far more for a 60-hour narrative game than for a film, and blanket
spoiler-hiding is a blunt instrument. Because we track *your* progress, we can do
something Letterboxd structurally cannot:

> **Progress-aware spoiler gating.** A review is tagged with how far its author
> got. If you're 12 hours into a game, reviews written by people who finished it
> are collapsed by default with *"Written after finishing — tap to reveal."*

This is the headline feature. It is only possible because playthroughs carry
progress, and it is the single best answer to *"why not just use Backloggd."*

Reviews otherwise behave as on Letterboxd: markdown-lite, attached to a
playthrough, likeable, commentable, sortable by popularity or recency, with a hard
spoiler flag on top of the soft gating.

### 3.5 Profile

- **Top 4** — four games pinned, cover art, no ranking implied. Identity.
- **Now playing** — the 1–3 active playthroughs, front and centre. Games are
  slow; "what I'm in the middle of" is more interesting than "what I finished".
- **Diary / calendar heatmap** — sessions by day.
- **Backlog** — see §3.8.
- **Stats:** hours this year, games finished, **finish rate** (finished ÷ started —
  a wonderfully humbling number), platform split, genre distribution, average
  rating, decade distribution, longest playthrough, fastest drop.
- Lists, reviews, likes, followers/following, bio, favourite genres.

### 3.6 Currently playing

Games take weeks, so "what I am in the middle of" is a better social surface than
"what I finished" — and it has no Letterboxd equivalent, because nobody is 40 hours
into a film. This gets its own tab.

**Your half:**
- Each active playthrough with **hours so far**, platform, start date, last session.
- A session sparkline for the last two weeks, so a stalling game looks stalled.
- One-tap "log a session" straight from the row — the single most repeated action in
  the app, so it is never more than one tap from the tab bar.

**Your friends' half:**
- Who is playing what right now: game, platform, **their hours so far**, when they
  last played.
- Live, not an activity echo. A friend at 71 hours in Baldur's Gate 3 is a standing
  fact, not an event that scrolled past yesterday.
- Convergence nudges — *"three friends are playing Blue Prince, which is in your
  backlog"* — the one recommendation worth making, because it comes from the taste
  graph rather than a model.

Hours come from imports where connected (§6) and from manual entry otherwise; the UI
never distinguishes, and a synced game simply stops needing you to type.

### 3.7 The game page

The page that has to be better than everyone else's. Top to bottom:

**The stats block** — three cells, equal weight:

| Cell | Value | Sub-label |
|---|---|---|
| **Avg playtime** | median hours to finish | *median of N playthroughs* |
| **Avg rating** | mean rating to one decimal | *N ratings* |
| **Finish rate** | finished ÷ started | *of N who started* |

Median, not mean, for playtime — one 600-hour completionist should not move the
number. And it is **measured from real playthroughs**, not self-reported estimates,
which is the thing HowLongToBeat cannot claim and we can.

Where hours are imported, compute the median over synced playthroughs only and say
so; manual entries are noisier and belong in a separate, wider band.

**The completion funnel** — *started → past 5h → past 20h → finished*, as
proportions. This is the single most useful thing on the page and no film tracker can
have one. *"82% get past hour 5, only 58% finish"* tells you more about a 100-hour
game than any review does.

**Friends who played**, above the global average, with each friend's rating and
hours — and their drop point if they bailed, stated plainly rather than hidden.

**Rating distribution** as a histogram, not just a mean. A 3.9 that is bimodal is a
different game from a 3.9 that is a normal curve, and for games — difficulty,
bugs at launch, taste-splitting design — bimodal is common.

**Reviews**, progress-gated per §3.4.

### 3.8 Backlog — the killer utility

For films a watchlist is a wish. For games a backlog is a debt, and everyone has
one. Make it *useful* rather than accusatory:

- **Triage view:** filter by "I have 2 hours free", "short (<15h)", "on a service I
  subscribe to", "playable on the console in my living room".
- **Service awareness:** know what's on Game Pass / PS Plus / GeForce Now and warn
  when something in your backlog is **leaving the service in 3 weeks**. (Letterboxd
  sells almost exactly this as a Pro feature; it converts.)
- **Sale awareness:** optional price-drop notifications on backlog items.
- **"Play next" shuffle:** pick 3 candidates with reasons, not one algorithmic
  answer. Cheap to build, disproportionately loved.
- **Amnesty:** a one-tap "I'm never playing this" that moves items out without
  deleting them. Backlogs that only grow stop being used.

### 3.9 Lists

Same as Letterboxd: title, description, public/private, ordered or unordered, notes
per entry, cloneable, collaborative (later). Games-specific affordances: a list can
mix works and releases ("every Zelda in release order"), and list items can carry
an hours estimate so a list shows a total time cost.

### 3.10 Social

Chronological follow feed. No recommendation algorithm in v1 — the taste graph *is*
the algorithm, and an unranked feed is a signal about what kind of product this is.

What the graph feeds is the game page (§3.7) and the Currently Playing tab (§3.6):
friends' ratings above the global average, friends' live hours, and the aggregate
funnel. Follows are the only input; there is no engagement signal to optimize.

### 3.11 Year in Play

An annual generated recap: hours, games, best month, longest obsession, the game
you dropped fastest, your Top 4 of the year, a shareable card. Ships in December.
This is the primary organic growth loop; budget real design time for it.

---

## 4. Data model

Postgres. The critical split is `game` (the work) vs `release` (a shippable thing).

```sql
-- Canonical metadata, mirrored from IGDB nightly. Never user-writable.
game            (id, igdb_id, slug, title, sort_title, summary, first_release_date,
                 game_type,           -- main | dlc | expansion | remake | remaster | bundle | port
                 parent_game_id,      -- FK game(id): DLC/remaster → its base game
                 series_id, cover_url, updated_at)
release         (id, game_id, platform_id, edition_name, region, release_date, store_ids jsonb)
platform        (id, name, family, abbreviation)
genre, theme, mode, company, involved_company, game_genre, ...   -- join tables
franchise       (id, name)  +  game_franchise

-- Users
account         (id, handle, email, display_name, bio, avatar_url, created_at, tier)
favorite        (account_id, game_id, position 1..4)          -- unique(account_id, position)
follow          (follower_id, followee_id, created_at)
connection      (account_id, provider, provider_user_id, token_enc, last_synced_at)

-- The core
playthrough     (id, account_id, game_id, release_id NULL, platform_id NULL,
                 status, completion, started_at, ended_at, hours, replay_number,
                 difficulty, dropped_at_hour, drop_reason, is_private,
                 rating SMALLINT NULL,     -- 1..10, displayed as 0.5..5.0 stars
                 liked BOOLEAN,
                 created_at, updated_at)
                 -- unique(account_id, game_id, replay_number)

session         (id, playthrough_id, played_on DATE, hours NUMERIC NULL, note TEXT)

review          (id, playthrough_id, body, has_spoilers BOOLEAN,
                 progress_context,        -- early | midgame | finished | postgame
                 version_note,            -- "patch 2.0", "launch", "Definitive Edition"
                 created_at, edited_at)

-- Curation & social
list            (id, account_id, title, description, is_ranked, is_private, created_at)
list_item       (list_id, game_id, position, note)
reaction        (account_id, subject_type, subject_id, kind)   -- like on review/list
comment         (id, account_id, subject_type, subject_id, body, created_at)
activity        (id, account_id, verb, subject_type, subject_id, created_at)  -- feed fan-out
tag             (id, name) + playthrough_tag
```

Design notes:

- **Aggregates are materialized.** `game_stats` (avg rating, rating histogram, play
  counts, finish rate, median hours) refreshed on a schedule, never computed live.
- **`playthrough` is the join point for everything.** Rating, review, tags, sessions
  all hang off it. This is what makes replays, per-platform opinions and
  progress-gated spoilers fall out naturally instead of needing special cases.
- **Ratings roll up the `parent_game_id` chain for display but are stored at the
  leaf.** A rating of *The Witcher 3: Blood and Wine* counts toward the DLC's own
  average and is shown, separately, on the base game's page.
- **Soft-delete everything user-authored.** People delete reviews in anger.

---

## 5. Metadata: where the games come from

**Primary: IGDB** (Twitch-owned). Broadest catalogue, a real relational model —
`game_type` and `parent_game` give us the remaster/DLC/bundle graph almost for
free, which is exactly the hard part of §2c. Auth is Twitch client-credentials;
published rate limit is ~4 requests/second with 8 concurrent.

**Architecture rule: mirror, don't proxy.** Sync IGDB into our own Postgres
nightly and serve every user request from our copy. Reasons: 4 req/s cannot serve a
live site; we need our own search index; we need to survive IGDB downtime or a
terms change; and we need to attach our own fields (median hours, our art crops).

**Fallback/enrichment: RAWG** — useful for cross-checking and store links, but its
free tier is 20,000 requests/month, which is a batch-job budget, not a serving one.
That number alone settles the mirror question.

**User corrections:** a lightweight "suggest a fix" queue rather than a wiki. Wikis
need a community we won't have for a year; a queue needs one moderator.

⚠️ **Verify before committing to IGDB:** its terms are Twitch's, and commercial use
/ bulk-caching allowances need to be read directly (I could not reach the docs from
this environment — see §10). Have a fallback plan: RAWG + Wikidata + our own
corrections is a survivable, if worse, catalogue.

---

## 6. Imports — the cold-start weapon

A brand-new user with an empty profile churns. A brand-new user staring at 412
owned games and 2,900 recorded hours starts curating immediately.

| Source | Method | Gets us |
|---|---|---|
| **Steam** | Steam OpenID login + `IPlayerService/GetOwnedGames` | Owned games, lifetime playtime, last-played. Official, documented, generous limits (100k req/24h). **Do this first.** |
| **PlayStation** | Unofficial PSN endpoints via NPSSO token | Trophies, played titles, play duration |
| **Xbox** | OpenXBL or similar third-party gateway | Achievements, titles played |
| **Nintendo** | No usable API | Manual entry only. Be honest about it. |
| **Backloggd / Grouvee / HLTB** | CSV import | Migration path off the incumbent — build it early and make it excellent |

Mapping imported titles to our `game`/`release` rows is the real work: fuzzy title
match against IGDB's store IDs, with a human-reviewable "we weren't sure" bucket.
Budget for it; it's a week, not an afternoon.

⚠️ **PSN and Xbox integrations use unofficial endpoints.** They break, and they sit
in a grey area of those platforms' terms. Treat them as best-effort, isolate them
behind an interface, and never let a sync failure degrade the core product.

---

## 7. Technical shape — iOS first

**This launches on the App Store.** That inverts the web-first recommendation in
v0.1 of this spec, and the consequences are real enough to state plainly.

### What we gain

Logging happens on the couch, mid-session, on a phone. Backloggd's single biggest
weakness is being web-only; GG's main advantage is being mobile-first. An app also
gets push notifications (a friend finished the game you're playing; a backlog title
leaves Game Pass in three weeks) which are the retention mechanism a website can't
touch.

### What we give up, and the fix

Going app-first costs the best acquisition channel in this category: an indexable
game page for every title, ranking for *"[game] review"*. That is how Backloggd
grew to ~650k users, and it is not optional.

**The fix:** a thin, server-rendered, read-only public web surface from day one —
game pages, public reviews, public profiles, lists. No logging UI, no accounts, just
crawlable content with an "open in app" prompt. It shares the Go backend and costs
maybe two weeks. Skipping it means paying for every single user.

### Stack

- **App: React Native + Expo.** One codebase, iOS first with Android essentially
  free later, over-the-air updates for JS-only changes, and EAS handles builds and
  submission. This is a list/feed/detail app with no custom rendering — precisely
  the kind of product where React Native's tradeoffs don't bite.
  - *Native SwiftUI is the alternative* and would feel marginally better,
    especially in scroll and gesture polish. It costs an entire second codebase for
    Android. For a solo or small build, Expo is the right call; revisit only if the
    feed's scroll performance actually disappoints on older devices.
- **Backend: Go + Postgres.** Unchanged, and unaffected by the client decision.
- **Public web: Next.js**, read-only, server-rendered, same API.
- **Auth: Sign in with Apple** (required in practice once you offer any third-party
  sign-in), plus **Steam OpenID** — which doubles as the library import and should
  be presented as "connect Steam", not as a login.
- **Search, images, hosting:** per §5 and v0.1 — Postgres full-text first, our own
  CDN for cover art, Fly.io or Render + managed Postgres.

---

## 8. Shipping on the App Store

A social app with user reviews is a user-generated-content app, and Apple gates
those specifically. These are v1 scope, not polish — each one is a rejection:

| Requirement | What we must ship | Where |
|---|---|---|
| **UGC controls** | A content filter for objectionable material, a way to report any review or list, a way to **block** an abusive user, and published developer contact info | Guideline 1.2 |
| **Account deletion** | Deleting your account must be possible **from inside the app** — not a support email, not a web form | Guideline 5.1.1(v) |
| **Sign in with Apple** | Offer it wherever you offer another third-party sign-in; revoke tokens via its REST API on account deletion | Guideline 4.8 |
| **Age rating** | Rate honestly for user-generated content; game covers and review text will include mature material | App Store Connect |
| **Privacy labels** | Declare what the Steam/PSN imports collect and why | App Store Connect |

Two non-obvious consequences:

1. **Blocking has to exist in the data model**, not be bolted on. A block must hide
   both directions in the feed, on game pages, and in comment threads — cheap now,
   invasive later.
2. **Moderation is a launch cost, not a scale cost.** You need the report queue and
   one person watching it before the first public build.

### Commission, and what it does to pricing

Apple takes **15–30%** of in-app subscription revenue depending on the Small
Business Program (under $1M/yr) and subscription tenure. The exact current rate for
auto-renewing subscriptions is worth confirming in Apple's own documentation before
you set a price — reporting on it is inconsistent, and it has changed more than once.

**Model the worst case.** Pro at $25/yr nets $17.50 at 30%, $21.25 at 15%. That is
survivable, but it means the free tier has to be genuinely free (it is — §9) and the
paid tier has to be worth real money rather than a nag removal.

---

## 9. Monetization

Unchanged from v0.1 in structure, because Letterboxd's model works and keeps the
product honest — the free tier is fully usable and the paid tier sells *insight*,
not access.

- **Free:** unlimited logging, reviews, lists, social, imports. No walls on the
  diary, ever.
- **Pro (~$25/yr):** no ads, full stats, service filters (*"in my backlog and on
  Game Pass"*), leaving-soon and price-drop alerts, advanced filters, data export.
- **Patron (~$60/yr):** custom profile art, extra stats, early features.

No affiliate storefront in v1. The moment ratings are shaped by commissions, they
stop being trustworthy, and trust is the only asset here.

---

## 10. Phasing

Reordered for an App Store launch. M1 still matters most: if the private,
single-player diary isn't good enough to use alone, no amount of social saves it.

| Milestone | Scope | Done when |
|---|---|---|
| **M0 — Catalogue** | IGDB mirror, sync job, search, game pages incl. the §3.7 stats block | You can find any game and read its data |
| **M1 — Diary on your phone** | Expo app: accounts, playthroughs, sessions, ratings, reviews, backlog, profile. **On your own device via TestFlight.** | You use it daily with zero other users |
| **M2 — App Store requirements** | Report/block/filter, in-app account deletion, Sign in with Apple, privacy labels | It can legally be submitted |
| **M3 — Imports** | Steam first, then Backloggd/Grouvee CSV, then PSN/Xbox | A new user sees their library in under 60s |
| **M4 — Social** | Follow, feed, Currently Playing tab, friend ratings, progress-gated spoilers | It's worth inviting someone |
| **M5 — Public web + launch** | Read-only indexable game pages, marketing site, App Store submission | Strangers can find you |
| **M6 — Retention & revenue** | Lists, full stats, Year in Play, service data, Pro/Patron, Android | Growth loops and revenue exist |

M2 sits early on purpose. Discovering at submission time that blocking needs a
schema change is the classic way to lose a month.

---

## 11. Risks and open questions

1. **Cold start.** A social network with no users is a spreadsheet. In order of
   value: Steam import (instant personal value with zero friends), the public web
   surface for SEO, an excellent Backloggd CSV migration, and Year in Play in
   December.
2. **Backloggd is entrenched** — ~650k users and the default answer to this exact
   question. We don't win on parity. We win on the playthrough model, honest
   abandonment data, progress-gated spoilers, measured playtime medians, and being
   a genuinely good phone app.
3. **App Store gatekeeping.** §8. Plus the $99/yr Apple Developer Program fee and
   the fact that every update waits on review — which is why over-the-air JS updates
   via Expo matter more than they look like they do.
4. **Metadata terms.** §5 — IGDB's terms are Twitch's and must be read directly
   before writing code against them.
5. **Platform API fragility.** §6 — PSN/Xbox are unofficial and will break;
   Nintendo has no usable API at all. Isolate all three behind one interface and
   never let a sync failure degrade the core product.
6. **Moderation.** Gaming communities brigade. Budget for the report queue, rate
   limits on new accounts, and a review-bomb damper — weight ratings by whether the
   rater actually logged play time, which we can do and Metacritic can't.
7. **Open design questions:**
   - Rating on the playthrough or the game? *(Spec says playthrough — revisit once
     real replay volume exists.)*
   - Are DLCs separately ratable? *(Spec says yes. It may be clutter.)*
   - Does `ongoing` need different rating semantics — you can love a live-service
     game and have no opinion about "finishing" it.
   - Public per-user hours, or aggregate only? Hours are unusually revealing.
   - Do imported and manual hours get visibly distinguished, or silently merged?

---

## 12. How to see what it looks like

### Now — the clickable prototype

**https://claude.ai/artifact/9TEpKgxDqL9xi19M6tTqf2**

Five iPhone-sized screens laid out side by side, tappable on a phone: the game page
with the stats block and funnel, the Currently Playing tab, the finishes feed, a
profile, and a working log sheet. The tab bars and links navigate between them; the
log sheet's status pills and star rating actually respond. Every number in it is
sample data.

### Next — on your actual phone, no Apple account needed

**Expo Go** runs an Expo project on a real iPhone for free, with no Apple Developer
membership and no code signing. That is the cheapest way to hold M1 in your hand:
build the app in Expo, scan a QR code, and it runs. Good enough to judge feel,
scroll and typing — everything the prototype can't tell you.

### Then — TestFlight, which needs your hands

Installing a real signed build (or distributing to anyone else) requires the
**Apple Developer Program at $99/year**. Once that exists, EAS builds and submits to
TestFlight, and the app installs like any other.

**Tap-by-tap, when you want to do this:**
1. On your iPhone, open **developer.apple.com** → *Account*
2. Sign in with your Apple ID → **Enroll**
3. Choose **Individual** (a company entity needs a D-U-N-S number and takes weeks)
4. Pay the $99 — approval is usually same-day, occasionally a couple of days
5. Tell me when it's approved and I'll wire up the build and submission config

Nothing before M1 needs this. Don't pay until there's something to install.

---

## Sources

Direct access to `letterboxd.com` and `api-docs.igdb.com` was blocked by this
environment's network proxy, so Letterboxd's and IGDB's own pages were read only
through search-result summaries, not fetched in full. Apple's and Expo's pages were
likewise read through search summaries rather than fetched.

Anything not covered below — the playthrough model, progress-gated spoilers, the
stats-block and funnel design, the Currently Playing tab, the schema, the phasing
plan, and the Expo-over-SwiftUI recommendation — is original design work or general
knowledge, not sourced from a retrieved page.

**Letterboxd and the competitive landscape**
- Letterboxd — *Frequent questions*: https://letterboxd.com/about/faq/ (logging, diary, ratings, watchlist, lists, spoiler flag, follow feed)
- Letterboxd — *Paid subscriptions*: https://letterboxd.com/about/pro/ (Pro/Patron split, streaming-service filters, custom art)
- Two Average Gamers — *Letterboxd for Games? We Tested 7*: https://www.twoaveragegamers.com/best-letterboxd-alternatives-for-gamers-who-track-everything-2026/ (Backloggd ~650k users and web-only; GG mobile-first with console library sync)
- Backloggd — *About*: https://backloggd.com/about/ (status model: Played/Playing/Backlog/Wishlist plus Completed/Mastered/Retired/Shelved/Abandoned; 1–10 rating; journal and play sessions)
- MakeUseOf — *How to Track and Rate Your Video Games Using Backloggd*: https://www.makeuseof.com/backloggd-how-to-track-and-rate-video-games/ (advanced log fields: difficulty, hours, replay flag)

**Data and imports**
- IGDB API docs: https://api-docs.igdb.com/ and APIs.io: https://apis.io/rate-limits/igdb/igdb-rate-limits/ (~4 req/s, 8 concurrent; Twitch client credentials)
- IGDB contribution guidelines — *Game Types*: https://github.com/twitchtv/igdb-contribution-guidelines/wiki/Game-Types (`game_type`, `parent_game` for DLC/remaster/bundle relationships)
- RAWG — *API docs*: https://rawg.io/apidocs (free tier 20,000 requests/month)
- Steamworks — *IPlayerService*: https://partner.steamgames.com/doc/webapi/iplayerservice (`GetOwnedGames`, playtime, 100k requests per rolling 24h)

**App Store**
- Apple — *App Review Guidelines*: https://developer.apple.com/app-store/review/guidelines/ (guideline 1.2 UGC: content filter, report mechanism, user blocking, published contact info)
- AppCompliance — *Apple's 2026 App Review Guideline Changes*: https://appcompliance.io/blog/apple-2026-app-review-guideline-changes/ (Feb 2026 clarification extending 1.2 to anonymous/random chat; the full UGC control set)
- Apple Developer News — *Account deletion within apps required*: https://developer.apple.com/news/?id=mdkbobfo and https://developer.apple.com/news/?id=12m75xbj (guideline 5.1.1(v); Sign in with Apple REST API token revocation on deletion)
- Commission of 15–30%, the Small Business Program threshold, and the guideline 4.8 Sign in with Apple obligation came from search summaries of the above plus general knowledge, and are **flagged in §8 as needing direct confirmation in Apple's own docs before pricing.**

**Testing on device**
- Expo — *Distribute an iOS app with TestFlight*: https://docs.expo.dev/submit/testflight/ and *Build your project for app stores*: https://docs.expo.dev/deploy/build-project/ ($99/yr Apple Developer Program needed for EAS production builds and TestFlight)
- Expo — *Expo Go and the App Store, May 2026*: https://expo.dev/changelog/expo-go-and-app-store-may-2026 (Expo Go runs projects on a device free, without manual code signing)
