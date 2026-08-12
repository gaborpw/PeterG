# Email Scheduler

A daily morning briefing that scans Peter's email accounts and reports back only
what actually matters.

Every weekday morning at **9:00 AM Eastern**, an automated session wakes up,
reads the last 24 hours of mail across both accounts — including spam and junk —
and sends back a short, readable summary. Everything else gets ignored.

## What it watches

| Account | Address | What it's for |
|---|---|---|
| Gmail | `gaborpw19@gmail.com` | Personal — billing, receipts, family, events |
| Outlook | `Peter.Gabor@kinective.io` | Work — Jira, GitLab, colleagues, meetings |

Both accounts are scanned in full: inbox, spam, and junk folders. Spam is
included on purpose — legitimate mail (bank alerts, appointment reminders,
messages from people who've never emailed you before) gets misfiled there more
often than people realize.

## What it reports

The briefing surfaces six categories, and stays quiet about everything else:

- **Work** — direct mentions, code review comments, threads awaiting your reply
- **Billing** — charges, payments, renewals, subscription changes
- **Meetings** — invitations, reschedules, cancellations
- **Sales** — genuine vendor or business conversations, not marketing blasts
- **Important dates** — deadlines, on-sale times, appointments, events
- **Family** — anything from a real person you know

Marketing email is filtered out entirely. On a typical day that's the
overwhelming majority of the volume — the first scan found roughly 100 personal
emails, of which about 6 were worth reading.

## How it learns

The filter starts from a set of rules in [`email-rules.md`](./email-rules.md)
and gets better over time.

Every two weeks, a second automated session reviews recent briefings and asks a
handful of specific questions — *was this worth flagging? did you want to see
this one?* — then writes the answers back into `email-rules.md`. Each daily scan
reads the current rules before it starts, so corrections take effect the very
next morning.

The rules file is plain English, not code. You can edit it directly, or just
answer the biweekly questions and let it update itself.

## Schedules

| Job | When | What it does |
|---|---|---|
| Daily briefing | 9:00 AM ET, daily | Scans 24h of mail, sends the summary |
| Calibration | 9:00 AM ET on the 1st and 15th | Asks what to keep or drop, updates the rules |

Delivery is by push notification and email.

> **Note on daylight saving:** schedules are stored in UTC and fixed at
> 13:00 UTC, which is 9:00 AM Eastern during daylight time. When clocks fall
> back in November the briefing will arrive at 8:00 AM ET until the schedule is
> shifted to 14:00 UTC. See [`CLAUDE.md`](./CLAUDE.md) for how to change it.

## Changing things

Just ask in a Claude Code session on this repo — "stop flagging Jira digests,"
"add my wife's address as always-important," "move the briefing to 7 AM." The
conventions and gotchas are documented in [`CLAUDE.md`](./CLAUDE.md).
