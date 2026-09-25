# web

Not built yet — milestone M5.

A read-only, server-rendered public surface: game pages, reviews, profiles and
lists, crawlable, with an "open in app" prompt. No logging UI, no authenticated
flows — those live in `app/`.

It exists for one reason. Launching on the App Store gives up an indexable page
per game, which is the main acquisition channel in this category and how
Backloggd grew. See `docs/adr/0003-ios-first-with-expo.md`.
