# Email Classification Rules

This file decides what shows up in the morning briefing. The daily scan reads it
before every run, so edits take effect the next morning.

It is meant to be edited — by hand, or by the biweekly calibration session. Plain
English is fine; there's no syntax to get right.

---

## Accounts

- **Personal:** `gaborpw19@gmail.com` (Gmail)
- **Work:** `Peter.Gabor@kinective.io` (Outlook)

Scan the inbox, spam, and junk folders of both. Spam is included deliberately —
real mail lands there sometimes, and a missed bank alert costs more than a few
seconds of scanning.

### Known alias

Mail addressed to `peter.gabor@nexussoft.com` arrives in the Kinective mailbox.
Nexussoft appears to be a prior or parent company domain still forwarding. Treat
it as a **personal-mail channel that happens to land at work** — it currently
receives Credit Karma, HelloFresh, and Bose mail, not work correspondence. Do not
assume it is work traffic just because it is in the Outlook account.

---

## Always report

**Work — anything expecting a response from Peter**
- Jira: direct `@mentions`, assignments, status changes on his own issues
- GitLab: review comments on his merge requests, threads started on his code,
  pipeline failures, merges of his branches
- Any email thread where a colleague addresses him by name or asks a question
- Anything from Kinective people: Chris Schnorr, Sonny Horton, Joshua Becker,
  Jonathan Steele, Sasha Taylor, Jeremy Stone

**Billing and money**
- Charges, payments, refunds, and receipts — always include the amount
- Subscription renewals, price increases, cancellation confirmations
- Overdrafts, declines, failed payments, unusual-activity alerts
- Medical bills and statements (UH Hospitals / MyChart)

**Meetings**
- Invitations, reschedules, cancellations
- Anything with a time and a place attached

**Security and account access**
- Login verification codes, new-device sign-ins, password resets
- New payment methods added to any account
- Report these even when expected — a legitimate-looking one Peter did not
  trigger is exactly the case worth catching

**Important dates**
- Deadlines, appointments, on-sale times, expirations
- Events he already has tickets or a reservation for

**Family and real people**
- Anything from a named individual writing personally, in either account
- Prioritize this above everything else. A short note from a family member
  outranks any automated alert.

---

## Never report

Marketing and promotional mail, which is the large majority of the personal
inbox. Specifically:

- Retail and brand mail: Macy's, Gap, J.Crew, Brooks Brothers, Urban Outfitters,
  Patagonia, Dr. Martens, Allen Edmonds, Charles Tyrwhitt, Indochino, YETI,
  Carhartt, END, Jomashop, dbrand, OtterBox, Ugreen, Anker, Adorama, Micro
  Center, Best Buy, Home Depot, Sur La Table, Zwilling, John Boos, YesStyle
- Mattress and sleep brands: Purple, Helix, Eight Sleep, Coop
- Grocery and food: ALDI, Meijer, Panda Express, HelloFresh, Ibotta, NYT Cooking
- Travel and deals: Skyscanner, Going, Allegiant, Slickdeals, Honey, GasBuddy,
  The Parking Spot
- Entertainment promos: Ticketmaster, SeatGeek, Vivid Seats, Fandango, Regal,
  IMAX, AEG/PromoWest, Netflix, Letterboxd, Patreon creator posts
- Sports marketing: MLB, NBA, Guardians, Cavs, WWE, Rock Hall
- Political fundraising: DSCC, DLCC, and all campaign mail
- Credit card offers and prescreened invitations: Capital One, Citi, Credit Karma
  promotional mail (score-change *alerts* are still worth reporting)
- Cold sales pitches to the personal address (e.g. tradeecho.com, lotto.com)
- Newsletters and digests he did not act on: Apple News, Rumble, IFTTT,
  MasterClass, 23andMe surveys

### Judgment calls, not blanket bans

- **Confluence and Jira weekly digests** — skip the routine roundups, but never
  skip a direct mention or assignment buried in one.
- **Loyalty and rewards mail** — skip the promotions, report an expiring balance
  or a real account change.
- **Shipping notifications** — skip carrier marketing (FedEx app ads), report an
  actual delivery, exception, or delay on a real package.

---

## How to write the briefing

Short. Scannable on a phone. Nothing that reads like an email client.

- Lead with the single most important thing, whatever category it's in
- Group by category; drop any category with nothing in it
- One line per item: who, what, and what it needs from him
- Always include concrete specifics — amounts, dates, times, ticket numbers
- Say what action is needed, if any
- End with a one-line count of what was scanned and filtered out
- If nothing matters, say exactly that in one sentence. A quiet day should
  produce a short briefing, not a padded one.

---

## Change log

Calibration sessions append here so the reasoning behind each rule is traceable.

- **2026-08-12** — Initial rules, written from the first scan of both accounts
  (~100 personal emails, 19 work emails, 1 junk). Suppression list built from
  senders actually observed that day. Not yet reviewed by Peter.
