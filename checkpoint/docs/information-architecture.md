# Information architecture

What screens exist, which five earn a tab, what each one must contain, and the
work each represents.

Read [`spec.md`](spec.md) first for *why*. This is the *what* and the *in what
order*.

---

## 1. What the neighbours do

### Letterboxd (film)

Bottom tabs: **Home/Activity · Search · + · Activity · Profile**. The thing worth
copying is the **centre `+` button**. Logging is the habit the whole product
depends on, so it gets a permanent, thumb-reachable slot rather than living
inside a screen you have to navigate to first.

Everything else nests under Profile — Films, Diary, Lists, Reviews are sections
there, not tabs.

### Serializd (TV)

The self-described "Letterboxd for TV". Its structural lesson is bigger than its
navigation:

**It lets you log at three levels — episode, season, or whole series.** You rate
each episode on a half-star scale and each one lands in your diary, which builds
a far more detailed record than one rating on the show. Its show pages then do
something no film tracker can: chart **quality across seasons**, because it has
per-episode data.

This is the same problem we have, and we answered it differently. TV is
series → season → episode. Games are game → expansion → playthrough. Serializd
said "log at whatever level you like". We said "the playthrough is the atom"
(ADR 0002).

Two things to take from it anyway:

1. **Granularity pays off in aggregate.** Their per-episode ratings produce the
   season-quality chart. Our per-playthrough hours produce the completion funnel
   and the median-hours figure. Keep feeding the aggregates — they are what make
   a game page worth visiting.
2. **Release notifications drive return visits.** They ping you when a new
   episode of something you follow drops. Our equivalent: DLC released for a
   game you finished, a backlog game leaving Game Pass, a sequel announced.
   Worth building; not M1.

---

## 2. The tab decision

Five slots, one of which is the `+`. That leaves four real tabs.

### The candidates

Everything that wants a tab: Feed, Playing, Backlog, Library, Search, Lists,
Profile, Stats. Eight into four.

### What I recommend

| # | Tab | Contains |
|---|---|---|
| 1 | **Feed** | Friends' activity. Plus a "playing now" rail pinned at the top. |
| 2 | **Library** | Your games. Segmented: **Playing** (default) · Backlog · Finished · All |
| 3 | **➕** | Modal. Search a game → log sheet. Not a screen. |
| 4 | **Search** | Find any game. Browse trending, new, by genre or platform. |
| 5 | **Profile** | You: Top 4, stats, lists, reviews, settings. |

### Why not a dedicated "Playing" tab

The prototype has one, and it was right for showing off the idea. But Playing,
Backlog and Finished are three views of one thing — your games — and splitting
them across tabs means the thing you want ("what do I own that I haven't
played?") lives in two places.

Library with **Playing as the default segment** keeps the differentiator as the
first thing you see, and puts backlog triage one tap away instead of buried in
Profile.

### What this costs

Spec §3.6 designed "Currently Playing" as one screen with two halves — yours and
your friends'. This splits them: yours goes to Library/Playing, theirs becomes a
rail at the top of Feed.

The juxtaposition is lost, and that juxtaposition was part of the appeal. It is
a real trade, made because "my games" and "their games" are different mental
modes and users reach for them at different moments. **Revisit after M4** when
there is real usage to judge it by. If the rail gets tapped constantly, the
combined screen was right.

### Search is not negotiable

You cannot log a game you cannot find. Search carries the `+` flow, so it earns
its slot even though it feels utilitarian next to the social tabs.

---

## 3. Screen inventory

Fourteen screens. Five are tab roots; the rest are pushed or presented.

| # | Screen | Type | Milestone |
|---|---|---|---|
| 1 | Feed | tab root | M4 |
| 2 | Library | tab root | M1 |
| 3 | Log sheet | modal | M1 |
| 4 | Search | tab root | M1 |
| 5 | Profile (own) | tab root | M1 |
| 6 | Game page | pushed | M1 |
| 7 | Playthrough detail | pushed | M2 |
| 8 | Review detail + comments | pushed | M4 |
| 9 | List detail | pushed | M6 |
| 10 | Member profile (someone else) | pushed | M4 |
| 11 | Followers / following | pushed | M4 |
| 12 | Settings | pushed | M2 |
| 13 | Onboarding + import | flow | M3 |
| 14 | Stats / Year in Play | pushed | M6 |

---

## 3a. What Home is for

Three rows, and they answer three different questions. Worth stating because
two of them are sample data today and it would be easy to mistake the stand-in
for the design.

**You lately** — your own recent sessions. Real now. It sits above the shelves
because it is the only row on the screen that is true, and it stays when the
others become real.

**Popular this week** — global. What everyone is playing, regardless of who you
follow. Tapping a cover opens that game's page; these are games, not people.
Today the order is editorial and the numbers under each cover come from
aggregateFor, so they at least agree with the game page.

**Friends are playing** — the people you follow: what they are in the middle
of, and what they have written. Both belong in this row. A friend finishing
something and saying why is the same kind of event as a friend starting
something, and splitting them across two shelves would mean the interesting one
scrolls off.

Mia, Dev, Sam, Nadia and Theo are placeholders for that row. They are not
decoration and not a design: they are what it will look like with five people
in it. Real accounts arrive with the social milestone (M4), and at that point
this row is a query rather than an array.

The rule that follows from this: **do not mix your real activity into the
sample rows.** One true row among nine invented ones, on the screen where
someone forms their first impression, is worse than an honest placeholder.
Your activity has its own row for exactly that reason.

## 4. Per-screen breakdown

Each screen: what it must have to ship, what can wait, and the work.

### 1. Feed — M4

**Must have**
- Playing-now rail: friends currently in a game, hours, horizontally scrolling
- Activity entries: finishes, drops, reviews, new lists
- Filter chips: Finishes · Everything · Reviews
- Empty state when you follow nobody — this is most new users, so it is not an
  edge case. Offer import and suggested members.

**Can wait:** comments inline, likes, pagination beyond 50.

**Work**
- Activity table plus fan-out on write (schema exists)
- `GET /v1/feed` with cursor pagination, block-filtered both directions
- FeedEntry card component (built)
- Playing-now rail component
- Empty state

### 2. Library — M1

**Must have**
- Segmented control: Playing · Backlog · Finished · All
- Playing: cover, platform, hours, last played, one-tap log
- Backlog: filters by length, platform, and "free tonight" (< 3h sessions)
- Finished: grid by cover, sortable by rating / date / hours
- Search within your own library

**Can wait:** service awareness (leaving Game Pass), amnesty flow, sale alerts.

**Work**
- `GET /v1/me/playthroughs?status=` with filters
- Segmented control component
- Grid and row layouts sharing Cover
- Backlog filter sheet

### 3. Log sheet — M1

The single most-used screen. Every extra tap here costs you logs.

**Must have**
- Game search, or pre-filled when opened from a game page
- Status pills: Playing · Finished · Paused · Dropped · Ongoing
- Conditional: completion depth when Finished, drop reason when Dropped
- Platform picker, hours, date
- Rating (5 stars, half steps) and ❤️
- Review body, spoiler flag, auto progress context

**Can wait:** per-session journaling, difficulty, replay numbering in the UI.

**Work**
- `POST /v1/playthroughs`, `PATCH /v1/playthroughs/{id}`
- Star rating component with half steps
- Conditional field logic (prototyped)
- Optimistic update so it dismisses instantly

### 4. Search — M1

**Must have**
- Search field, results in under 200ms
- Result rows: cover, title, year, platform icons, your status if any
- Browse when the field is empty: trending, recent releases
- Tapping a result opens the Game page

**Can wait:** filters by genre/platform/year, search within reviews and members.

**Work**
- `GET /v1/games/search?q=` over the IGDB mirror, trigram index exists
- Debounced input
- Result row component

### 5. Profile (own) — M1

**Must have**
- Header: avatar, name, handle, bio, follower counts
- Top 4 favourites
- Stats strip: logged, finished, finish rate, all-time hours
- Now playing (2–3 rows)
- Entry points: Lists, Reviews, Diary, Settings

**Can wait:** hours-by-month chart, genre breakdown, custom art.

**Work**
- `GET /v1/me`, `GET /v1/me/stats`
- Favourite picker (search → assign to slot 1–4)
- Stats aggregation job

### 6. Game page — M1

The page that has to beat Backloggd's.

**Must have**
- Cover, title, year, developer, genres
- **Stats block**: median playtime · average rating · finish rate
- **Completion funnel**: started → 5h → 20h → finished
- Your playthrough card, or a Log button if none
- Friends who played, with ratings and hours
- Reviews, progress-gated
- Rating histogram

**Can wait:** DLC list, related games, where-to-play, screenshots.

**Work**
- `GET /v1/games/{id}` with `game_stats` joined
- Aggregate refresh job (median, funnel, histogram)
- Funnel and histogram components
- Progress-gating logic client-side, using your own hours vs review's

### 7. Playthrough detail — M2
Sessions list, edit, delete, replay history. Work: session CRUD, calendar heatmap.

### 8. Review detail — M4
Full review, comments, likes, report and block entry points. Work: comment CRUD,
report queue, block enforcement.

### 9. List detail — M6
Ordered games, notes per entry, total hours, clone. Work: list CRUD, reorder.

### 10. Member profile — M4
Same as own profile minus editing, plus Follow, Block, Report. Work: block
filtering everywhere, follow endpoints.

### 11. Followers / following — M4
Two tabs of member rows. Work: paginated list endpoints.

### 12. Settings — M2
**Apple requires several of these before the app can ship** (spec §8): account
deletion in-app, blocked-users management, report history, published contact
info. Plus connections (Steam), notifications, privacy, sign out.
Work: `DELETE /v1/me` with real data removal, blocked list UI, Steam OAuth.

### 13. Onboarding + import — M3
Sign in with Apple, handle, connect Steam, then the payoff screen — 400 games and
3,000 hours already there. Then pick four favourites. Work: auth, Steam OAuth,
import worker, title matching with a review bucket.

### 14. Stats / Year in Play — M6
Annual recap, shareable card. Work: aggregation, share image generation.

---

## 5. Work order

Dependencies, not wishes.

```
M0  Catalogue      IGDB mirror → search → game page data
M1  Solo diary     Library · Log sheet · Search · Profile · Game page
M2  Ship-ready     Settings, account deletion, block, report   ← Apple gate
M3  Imports        Onboarding, Steam, CSV migration
M4  Social         Feed, member profiles, follows, review comments
M5  Public web     Indexable game pages, App Store submission
M6  Retention      Lists, stats, Year in Play, notifications
```

M1 is four screens plus the game page. Everything else is leverage on top of it.

**Do not start M4 before M2.** Blocking has to be in the feed queries from the
first day the feed exists, and Apple will not approve the app without it.
