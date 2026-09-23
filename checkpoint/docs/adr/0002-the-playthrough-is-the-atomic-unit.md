# 2. The playthrough is the atomic logged object

- **Status:** accepted
- **Date:** 2026-09-23
- **Spec:** `docs/spec.md` §3.1

## Context

Letterboxd's atom is a dated log: you watched a film on a day. Games do not fit
that shape. A game is 8–200 hours across weeks, is usually abandoned rather than
finished, is played on a platform that changes the experience, and exists in
editions that get patched and remastered under you.

The obvious model — a row per (user, game) with a rating and a "played" flag —
fails on replays, on per-platform opinions, on abandonment, and on reviews that
refer to a specific patch.

## Decision

The atomic object is a **playthrough**: user, game, optional release and platform,
status, completion depth, start and end dates, hours, replay number, drop point
and drop reason.

Ratings, reviews, sessions and tags all attach to the playthrough. Nothing
attaches directly to the (user, game) pair.

## Consequences

- Replays are free: a second playthrough with `replay_number = 2` and its own
  rating. Rating drift over time becomes visible rather than destructive.
- Abandonment is first-class data — a drop point and reason — which powers the
  completion funnel on the game page and the honest backlog.
- **Progress-aware spoiler gating becomes possible**, because a review carries how
  far its author had got. This is the product's main differentiator and it is a
  direct consequence of this decision.
- Cost: every query that wants "this user's opinion of this game" goes through a
  playthrough lookup and must decide which one it means. Default to the most
  recent non-private playthrough, and make that helper a single function.
- Aggregates (average rating, median hours, finish rate) must be materialized.
  Computing them live across playthroughs will not hold up.
