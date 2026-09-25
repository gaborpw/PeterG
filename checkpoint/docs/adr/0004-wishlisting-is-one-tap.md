# 4. Wishlisting is a gesture, not a status in the log form

- **Status:** accepted
- **Date:** 2026-09-25
- **Spec:** `docs/spec.md` §3.1, §3.8

## Context

The schema has seven playthrough statuses; the log form offered six. `wishlist`
was missing, which surfaced as a mismatch rather than a decision.

Two ways to close it: add `Wishlist` alongside Playing and Finished in the log
form, or treat wanting a game as a different action entirely.

The distinction the spec draws is ownership. **Backlog** means you have it and
have not started. **Wishlist** means you do not have it yet. Conflating them is
how a backlog turns into a guilt pile — a list of things you have paid for and
not played reads very differently from a list of things you fancy.

## Decision

Wishlisting is a **one-tap button on the game page**, not an option in the log
form.

- Game page, when the game is not in your library: **Log this game** and
  **Want it** side by side. Want it writes a `wishlist` log with zero hours and
  no form.
- The log form keeps its six statuses. `wishlist` is reachable but never in the
  way.
- A wishlisted game's action becomes **Start playing**, which opens the full
  form.
- Library's Backlog segment holds both, distinguished by a chip: *not started*
  versus *want it*.

## Consequences

- Wanting something costs one tap from wherever you found it. That is the right
  price: it happens while browsing, not while recording.
- The log form stays about what you actually played. It is the screen you touch
  most, and every option you scroll past on the way to Playing is a small tax
  on the habit the product depends on.
- Cost: two ways in. Someone looking for Wishlist in the log form will not find
  it. Accepted, because the alternative taxes the frequent action to serve the
  rare one.
- Backlog and wishlist share a segment for now. If the chip turns out not to be
  enough separation, they split — cheap to change, since the statuses are
  already distinct in the data.
