# 3. Ship iOS first, with React Native and Expo

- **Status:** accepted
- **Date:** 2026-09-23
- **Spec:** `docs/spec.md` §7, §8

## Context

The original plan was web-first, following how Letterboxd and Backloggd grew.
Peter's call is to launch on the App Store.

Logging happens on a couch, mid-session, on a phone, which the app-first argument
gets right. But going app-first gives up the single best acquisition channel in
this category: an indexable game page per title, ranking for "[game] review".
That is how Backloggd reached roughly 650k users.

## Decision

1. The iOS app is the product, built with **React Native + Expo** — one codebase,
   Android essentially free later, over-the-air updates for JS-only changes.
2. A **thin read-only public web surface ships alongside it**: server-rendered
   game pages, reviews, profiles and lists. No logging UI, no authenticated
   flows. It exists for crawlers and for links people paste.
3. Apple's UGC requirements (guideline 1.2: content filter, report, block,
   published contact info) and in-app account deletion (5.1.1(v)) are treated as
   v1 scope, scheduled at M2, not as launch polish.

## Consequences

- Native SwiftUI would feel marginally better in scroll and gesture polish. We
  accept that cost to avoid a second codebase for Android. Revisit only if feed
  scrolling actually disappoints on older devices.
- **User blocking must be in the schema from the start.** It has to hide both
  directions in feeds, game pages and comment threads; retrofitting it into every
  query later is invasive. This is the main reason M2 sits early.
- App Store review sits between us and every release, which makes Expo's
  over-the-air JS updates more valuable than they first appear.
- Apple takes 15–30% of subscription revenue. Pricing is modelled on the worst
  case; the exact current rate needs confirming in Apple's own documentation
  before Pro goes live.
- The `web/` component is not optional and is not a "later" item. Skipping it
  means paying for every user.
