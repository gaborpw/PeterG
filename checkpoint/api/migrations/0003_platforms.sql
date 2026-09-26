-- More platforms, and a constraint so seeding them is actually idempotent.
--
-- 0002 seeded five, which left Switch 2 unloggable — it reached 19.86M units
-- by March 2026 and is the fastest-selling home console in US history, so a
-- games tracker that cannot record it is missing current releases. The rest
-- cover machines people still play on, plus Other so nothing is unloggable for
-- want of a row.
--
-- The unique indexes are the load-bearing part. platform.name and
-- .abbreviation had no constraint and igdb_id is NULL for hand-seeded rows,
-- and NULLs never conflict — so the ON CONFLICT DO NOTHING in 0002 was
-- decorative. A second run would have produced two 'PC' rows, and
-- playthrough's lookup (WHERE abbreviation = $1 OR name = $1 LIMIT 1) would
-- then pick one arbitrarily and attach logs to whichever it happened to find.
--
-- This runs against a live database: docker-entrypoint-initdb.d only fires on
-- an empty volume, so 0002 already ran and will not run again. Apply with
--
--   docker compose exec -T postgres psql -U checkpoint -d checkpoint \
--     < api/migrations/0003_platforms.sql
--
-- Safe to run more than once. If the index creation fails, duplicates already
-- exist and want looking at rather than forcing.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS platform_name_key ON platform (name);
CREATE UNIQUE INDEX IF NOT EXISTS platform_abbreviation_key ON platform (abbreviation);

INSERT INTO platform (name, abbreviation, family) VALUES
    ('PlayStation 4',     'PS4',      'PlayStation'),
    ('Nintendo Switch 2', 'Switch 2', 'Nintendo'),
    ('Xbox One',          'Xbox One', 'Xbox'),
    ('Mac',               'Mac',      'PC'),
    ('Mobile',            'Mobile',   'Mobile'),
    ('VR',                'VR',       'VR'),
    ('Other',             'Other',    'Other')
ON CONFLICT (name) DO NOTHING;

COMMIT;
