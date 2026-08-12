# Email Classification Rules

This file decides what shows up in the morning briefing. It is sent to Claude on
every run, so edits take effect the next morning — no redeploy, no code change.

It is meant to be edited by hand or by the calibration session. Plain English is
fine; there is no syntax to get right.

---

## Account

**`gaborpw19@gmail.com`** — personal Gmail. Nothing else.

Scan the inbox, spam, and trash. Spam is included deliberately: real mail lands
there sometimes, and a missed bank alert costs more than a few seconds of
scanning. When something important is found in spam, say so — a fraud alert in
the spam folder reads differently from one in the inbox.

Work email is deliberately out of scope and must never be added.

---

## Always report

**Billing and money**
- Charges, payments, refunds, and receipts — always include the amount
- Subscription renewals, price increases, cancellation confirmations
- Overdrafts, declines, failed payments, unusual-activity alerts
- Medical bills and statements (UH Hospitals / MyChart)

**Security and account access**
- Login verification codes, new-device sign-ins, password resets
- New payment methods added to any account
- Report these even when expected — a legitimate-looking one Peter did not
  trigger is exactly the case worth catching

**Meetings and appointments**
- Invitations, reschedules, cancellations
- Anything with a time and a place attached

**Important dates**
- Deadlines, appointments, on-sale times, expirations
- Events he already has tickets or a reservation for

**Family and real people**
- Anything from a named individual writing personally
- Prioritize this above everything else. A short note from a family member
  outranks any automated alert.

**Genuine sales conversations**
- A real person following up on something Peter started
- Not marketing blasts, and not cold outreach from strangers

---

## Never report

Marketing and promotional mail, which is the large majority of the inbox:

- Retail and brands: Macy's, Gap, J.Crew, Brooks Brothers, Urban Outfitters,
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
- Credit card offers and prescreened invitations: Capital One, Citi, Credit
  Karma promotional mail — score-change *alerts* are still worth reporting
- Cold sales pitches from strangers (e.g. tradeecho.com, lotto.com)
- Newsletters and digests he did not act on: Apple News, Rumble, IFTTT,
  MasterClass, 23andMe surveys

### Judgment calls, not blanket bans

- **Loyalty and rewards mail** — skip the promotions, report an expiring balance
  or a real account change.
- **Shipping notifications** — skip carrier marketing (FedEx app ads), report an
  actual delivery, exception, or delay on a real package.
- **Anything from a real person** — never suppress on sender domain alone. A
  personal note from someone at a company on the suppression list still counts.

---

## How to write the briefing

Short. Scannable on a phone. Nothing that reads like an email client.

- Lead with the single most important thing, whatever category it's in
- Group by category; drop any category with nothing in it
- One line per item: who, what, and what it needs from him
- Always include concrete specifics — amounts, dates, times, order numbers
- Say what action is needed, if any
- Flag anything important that was found in spam
- End with a one-line count of what was scanned and filtered out
- If nothing matters, say exactly that in one sentence. A quiet day should
  produce a short briefing, not a padded one.

---

## Change log

Calibration sessions append here so the reasoning behind each rule is traceable.

- **2026-08-12** — Initial rules, written from a first scan of ~100 personal
  emails. The suppression list is built from senders actually observed that day
  rather than guessed at. Not yet reviewed by Peter.
- **2026-08-12** — Work email (Outlook / Kinective) removed from scope at
  Peter's request; this briefing covers personal Gmail only.
