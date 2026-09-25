-- Checkpoint initial schema. See docs/spec.md section 4.
--
-- The two decisions this file encodes, both load-bearing:
--   1. game (the work) is separate from release (a shippable thing on a
--      platform). Remasters, ports and DLC hang off parent_game_id. Flattening
--      this makes every rating average wrong.
--   2. playthrough is the atomic logged object. Rating and review attach to it,
--      never to (account, game). See docs/adr/0002.

BEGIN;

-- --- catalogue (mirrored from IGDB, never user-writable) --------------------

CREATE TABLE platform (
    id           BIGSERIAL PRIMARY KEY,
    igdb_id      BIGINT UNIQUE,
    name         TEXT NOT NULL,
    abbreviation TEXT,
    family       TEXT
);

CREATE TYPE game_type AS ENUM (
    'main', 'dlc', 'expansion', 'remake', 'remaster', 'bundle', 'port', 'episode'
);

CREATE TABLE game (
    id                 BIGSERIAL PRIMARY KEY,
    igdb_id            BIGINT UNIQUE,
    slug               TEXT NOT NULL UNIQUE,
    title              TEXT NOT NULL,
    sort_title         TEXT NOT NULL,
    summary            TEXT,
    first_release_date DATE,
    type               game_type NOT NULL DEFAULT 'main',
    -- A DLC, remaster or bundle member points at its base game.
    parent_game_id     BIGINT REFERENCES game (id) ON DELETE SET NULL,
    cover_url          TEXT,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX game_parent_idx ON game (parent_game_id) WHERE parent_game_id IS NOT NULL;
CREATE INDEX game_title_trgm_idx ON game USING gin (title gin_trgm_ops);

CREATE TABLE release (
    id           BIGSERIAL PRIMARY KEY,
    game_id      BIGINT NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    platform_id  BIGINT NOT NULL REFERENCES platform (id),
    edition_name TEXT,
    region       TEXT,
    release_date DATE,
    store_ids    JSONB NOT NULL DEFAULT '{}'::jsonb,
    UNIQUE (game_id, platform_id, edition_name)
);

-- --- people -----------------------------------------------------------------

CREATE TABLE account (
    id           BIGSERIAL PRIMARY KEY,
    handle       CITEXT NOT NULL UNIQUE,
    email        CITEXT NOT NULL UNIQUE,
    display_name TEXT,
    bio          TEXT,
    avatar_url   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ
);

-- Exactly four, positions 1-4. Identity, not a ranking.
CREATE TABLE favorite (
    account_id BIGINT NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    game_id    BIGINT NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    position   SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 4),
    PRIMARY KEY (account_id, position)
);

CREATE TABLE follow (
    follower_id BIGINT NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    followee_id BIGINT NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id <> followee_id)
);

-- Apple's guideline 1.2 requires user blocking, and it has to hide both
-- directions everywhere. It is here from the first migration on purpose.
CREATE TABLE block (
    blocker_id BIGINT NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    blocked_id BIGINT NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);

-- --- the core ---------------------------------------------------------------

CREATE TYPE playthrough_status AS ENUM (
    'wishlist', 'backlog', 'playing', 'paused', 'finished', 'abandoned', 'ongoing'
);

CREATE TYPE completion AS ENUM ('none', 'story', 'full', 'hundred', 'mastered');

CREATE TYPE drop_reason AS ENUM (
    'bounced', 'bored', 'too_hard', 'too_long', 'broken', 'life', 'other'
);

CREATE TABLE playthrough (
    id              BIGSERIAL PRIMARY KEY,
    account_id      BIGINT NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    game_id         BIGINT NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    release_id      BIGINT REFERENCES release (id) ON DELETE SET NULL,
    platform_id     BIGINT REFERENCES platform (id),

    status          playthrough_status NOT NULL,
    completion      completion NOT NULL DEFAULT 'none',
    started_at      DATE,
    ended_at        DATE,
    hours           NUMERIC(7, 1) CHECK (hours >= 0),
    -- Whether hours came from a platform sync rather than being typed in.
    hours_imported  BOOLEAN NOT NULL DEFAULT FALSE,
    replay_number   SMALLINT NOT NULL DEFAULT 1 CHECK (replay_number >= 1),
    difficulty      TEXT,
    dropped_at_hour NUMERIC(7, 1),
    drop_reason     drop_reason,

    -- 1..10, displayed as 0.5..5.0 stars. Half-steps, ten buckets.
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 10),
    liked           BOOLEAN NOT NULL DEFAULT FALSE,

    is_private      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (account_id, game_id, replay_number),
    -- A drop point only means something on an abandoned playthrough.
    CHECK (status = 'abandoned' OR (dropped_at_hour IS NULL AND drop_reason IS NULL)),
    -- Completion depth only means something once finished.
    CHECK (status = 'finished' OR completion = 'none'),
    CHECK (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
);

CREATE INDEX playthrough_account_idx ON playthrough (account_id, updated_at DESC);
CREATE INDEX playthrough_game_idx ON playthrough (game_id) WHERE is_private = FALSE;
CREATE INDEX playthrough_active_idx ON playthrough (account_id)
    WHERE status IN ('playing', 'ongoing');

CREATE TABLE session (
    id              BIGSERIAL PRIMARY KEY,
    playthrough_id  BIGINT NOT NULL REFERENCES playthrough (id) ON DELETE CASCADE,
    played_on       DATE NOT NULL,
    hours           NUMERIC(5, 1) CHECK (hours >= 0),
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX session_playthrough_idx ON session (playthrough_id, played_on DESC);

-- How far the author had got when they wrote it. This is what makes
-- progress-aware spoiler gating possible.
CREATE TYPE progress_context AS ENUM ('early', 'midgame', 'finished', 'postgame');

CREATE TABLE review (
    id               BIGSERIAL PRIMARY KEY,
    playthrough_id   BIGINT NOT NULL UNIQUE REFERENCES playthrough (id) ON DELETE CASCADE,
    body             TEXT NOT NULL,
    has_spoilers     BOOLEAN NOT NULL DEFAULT FALSE,
    progress         progress_context NOT NULL,
    -- Hours the author had logged when writing. Used to gate against the
    -- reader's own progress.
    progress_hours   NUMERIC(7, 1),
    -- "patch 2.0", "launch", "Definitive Edition"
    version_note     TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at        TIMESTAMPTZ,
    deleted_at       TIMESTAMPTZ
);

-- --- curation ---------------------------------------------------------------

CREATE TABLE list (
    id          BIGSERIAL PRIMARY KEY,
    account_id  BIGINT NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    is_ranked   BOOLEAN NOT NULL DEFAULT FALSE,
    is_private  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE list_item (
    list_id  BIGINT NOT NULL REFERENCES list (id) ON DELETE CASCADE,
    game_id  BIGINT NOT NULL REFERENCES game (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    note     TEXT,
    PRIMARY KEY (list_id, game_id)
);

-- --- aggregates -------------------------------------------------------------

-- Refreshed on a schedule. Never computed live: the game page reads one row.
CREATE TABLE game_stats (
    game_id            BIGINT PRIMARY KEY REFERENCES game (id) ON DELETE CASCADE,
    rating_count       INTEGER NOT NULL DEFAULT 0,
    rating_avg         NUMERIC(3, 2),
    rating_histogram   INTEGER[] NOT NULL DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0],
    started_count      INTEGER NOT NULL DEFAULT 0,
    finished_count     INTEGER NOT NULL DEFAULT 0,
    -- Median, not mean: one 600-hour completionist should not move it.
    median_hours       NUMERIC(7, 1),
    median_hours_synced NUMERIC(7, 1),
    past_5h_pct        SMALLINT,
    past_20h_pct       SMALLINT,
    refreshed_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
