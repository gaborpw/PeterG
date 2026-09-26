// Package playthrough owns the app's central object: one person's run at one
// game. See docs/adr/0002 for why this, rather than a dated log, is the atom.
package playthrough

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"
)

// DevAccountID is the single local account used until sign-in exists.
// Everything here takes an accountID so removing this constant is the only
// change auth will need on this side.
const DevAccountID int64 = 1

type Playthrough struct {
	ID        int64      `json:"id"`
	Title     string     `json:"title"`
	CoverURL  *string    `json:"coverUrl,omitempty"`
	Platform  *string    `json:"platform,omitempty"`
	Status    string     `json:"status"`
	Hours     float64    `json:"hours"`
	Rating    *float64   `json:"rating,omitempty"`
	Liked     bool       `json:"liked"`
	Review    *string    `json:"review,omitempty"`
	UpdatedAt time.Time  `json:"updatedAt"`
	StartedAt *time.Time `json:"startedAt,omitempty"`
	// The most recent dated session, if any. A real date rather than a phrase
	// like "today", so the client can sort by it and answer "this week".
	LastPlayedOn *time.Time `json:"lastPlayedOn,omitempty"`
}

// Input is what the client sends. Rating arrives as 0.5–5.0 and is stored as
// the 1–10 half-step integer the schema uses.
type Input struct {
	Title    string   `json:"title"`
	CoverURL *string  `json:"coverUrl"`
	Platform *string  `json:"platform"`
	Status   string   `json:"status"`
	Hours    float64  `json:"hours"`
	Rating   *float64 `json:"rating"`
	Liked    bool     `json:"liked"`
	Review   *string  `json:"review"`
}

var ErrInvalid = errors.New("invalid playthrough")

var validStatus = map[string]bool{
	"wishlist": true, "backlog": true, "playing": true, "paused": true,
	"finished": true, "abandoned": true, "ongoing": true,
}

// Validate rejects anything the database would reject, with a message a client
// can act on rather than a constraint-violation string.
func (in Input) Validate() error {
	if strings.TrimSpace(in.Title) == "" {
		return fmt.Errorf("%w: title is required", ErrInvalid)
	}
	if !validStatus[in.Status] {
		return fmt.Errorf("%w: unknown status %q", ErrInvalid, in.Status)
	}
	if in.Hours < 0 {
		return fmt.Errorf("%w: hours cannot be negative", ErrInvalid)
	}
	if in.Rating != nil && (*in.Rating < 0.5 || *in.Rating > 5) {
		return fmt.Errorf("%w: rating must be between 0.5 and 5", ErrInvalid)
	}
	return nil
}

type Repo struct{ db *sql.DB }

func NewRepo(db *sql.DB) *Repo { return &Repo{db: db} }

// List returns an account's playthroughs, most recently touched first.
func (r *Repo) List(ctx context.Context, accountID int64) ([]Playthrough, error) {
	const q = `
		SELECT p.id, g.title, g.cover_url, pl.abbreviation, p.status,
		       COALESCE(p.hours, 0), p.rating, p.liked, r.body,
		       p.updated_at, p.started_at,
		       (SELECT MAX(played_on) FROM session s WHERE s.playthrough_id = p.id)
		FROM playthrough p
		JOIN game g ON g.id = p.game_id
		LEFT JOIN platform pl ON pl.id = p.platform_id
		LEFT JOIN review r ON r.playthrough_id = p.id AND r.deleted_at IS NULL
		WHERE p.account_id = $1
		ORDER BY p.updated_at DESC`

	rows, err := r.db.QueryContext(ctx, q, accountID)
	if err != nil {
		return nil, fmt.Errorf("list playthroughs: %w", err)
	}
	defer func() { _ = rows.Close() }()

	out := make([]Playthrough, 0, 32)
	for rows.Next() {
		var p Playthrough
		var rating sql.NullInt16
		var started sql.NullTime
		var lastPlayed sql.NullTime
		if err := rows.Scan(&p.ID, &p.Title, &p.CoverURL, &p.Platform, &p.Status,
			&p.Hours, &rating, &p.Liked, &p.Review, &p.UpdatedAt, &started,
			&lastPlayed); err != nil {
			return nil, fmt.Errorf("scan playthrough: %w", err)
		}
		if rating.Valid {
			v := float64(rating.Int16) / 2
			p.Rating = &v
		}
		if lastPlayed.Valid {
			t := lastPlayed.Time
			p.LastPlayedOn = &t
		}
		if started.Valid {
			p.StartedAt = &started.Time
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

// Save creates or updates the account's playthrough of a game, creating the
// game row if the catalogue has never seen it. All of it in one transaction:
// a half-written game with no playthrough is worse than a failed save.
func (r *Repo) Save(ctx context.Context, accountID int64, in Input) (Playthrough, error) {
	if err := in.Validate(); err != nil {
		return Playthrough{}, err
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return Playthrough{}, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	title := strings.TrimSpace(in.Title)
	slug := Slugify(title)

	// Until the IGDB mirror exists, a title we have not seen becomes a
	// minimal game row. The sync will later match these on slug.
	var gameID int64
	err = tx.QueryRowContext(ctx, `
		INSERT INTO game (slug, title, sort_title, cover_url)
		VALUES ($1, $2, $2, $3)
		ON CONFLICT (slug) DO UPDATE
		  SET cover_url = COALESCE(EXCLUDED.cover_url, game.cover_url)
		RETURNING id`, slug, title, in.CoverURL).Scan(&gameID)
	if err != nil {
		return Playthrough{}, fmt.Errorf("upsert game: %w", err)
	}

	var platformID *int64
	if in.Platform != nil && *in.Platform != "" {
		var id int64
		err := tx.QueryRowContext(ctx,
			`SELECT id FROM platform WHERE abbreviation = $1 OR name = $1 LIMIT 1`,
			*in.Platform).Scan(&id)
		if err == nil {
			platformID = &id
		} else if !errors.Is(err, sql.ErrNoRows) {
			return Playthrough{}, fmt.Errorf("lookup platform: %w", err)
		}
	}

	var rating *int16
	if in.Rating != nil {
		v := int16(*in.Rating * 2)
		rating = &v
	}

	// Completion and drop fields are constrained by status in the schema, so
	// send the defaults and let a later edit screen set them properly.
	var id int64
	err = tx.QueryRowContext(ctx, `
		INSERT INTO playthrough
		    (account_id, game_id, platform_id, status, hours, rating, liked, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, now())
		ON CONFLICT (account_id, game_id, replay_number) DO UPDATE SET
		    platform_id = EXCLUDED.platform_id,
		    status      = EXCLUDED.status,
		    hours       = EXCLUDED.hours,
		    rating      = EXCLUDED.rating,
		    liked       = EXCLUDED.liked,
		    updated_at  = now()
		RETURNING id`,
		accountID, gameID, platformID, in.Status, in.Hours, rating, in.Liked).Scan(&id)
	if err != nil {
		return Playthrough{}, fmt.Errorf("upsert playthrough: %w", err)
	}

	// A review the form sent, even an empty one, is an instruction. Treating
	// empty as "no change" meant a review could be written but never taken
	// back: clearing the box and saving left the old text in place.
	if in.Review != nil {
		body := strings.TrimSpace(*in.Review)
		if body == "" {
			_, err = tx.ExecContext(ctx,
				`UPDATE review SET deleted_at = now() WHERE playthrough_id = $1 AND deleted_at IS NULL`,
				id)
		} else {
			_, err = tx.ExecContext(ctx, `
				INSERT INTO review (playthrough_id, body, progress)
				VALUES ($1, $2, 'midgame')
				ON CONFLICT (playthrough_id) DO UPDATE
				  SET body = EXCLUDED.body, edited_at = now(), deleted_at = NULL`,
				id, body)
		}
		if err != nil {
			return Playthrough{}, fmt.Errorf("upsert review: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return Playthrough{}, fmt.Errorf("commit: %w", err)
	}

	all, err := r.List(ctx, accountID)
	if err != nil {
		return Playthrough{}, err
	}
	for _, p := range all {
		if p.ID == id {
			return p, nil
		}
	}
	return Playthrough{}, fmt.Errorf("saved playthrough %d not found", id)
}

// Delete removes one of the account's playthroughs. Scoped by account so a
// guessed id cannot reach someone else's row.
func (r *Repo) Delete(ctx context.Context, accountID, id int64) error {
	res, err := r.db.ExecContext(ctx,
		`DELETE FROM playthrough WHERE id = $1 AND account_id = $2`, id, accountID)
	if err != nil {
		return fmt.Errorf("delete playthrough: %w", err)
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// Slugify turns a title into the game table's natural key.
//
// Exported because the profile package upserts games too: two spellings of one
// game must land on one row, and a second implementation of this rule would
// eventually disagree with this one and split them.
func Slugify(title string) string {
	var b strings.Builder
	lastDash := true
	for _, r := range strings.ToLower(title) {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
			lastDash = false
		default:
			if !lastDash {
				b.WriteByte('-')
				lastDash = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}

// SessionEntry is one game's share of a sitting: which playthrough, how long,
// and when. Note is optional and usually empty.
type SessionEntry struct {
	PlaythroughID int64   `json:"playthroughId"`
	Hours         float64 `json:"hours"`
	// Empty means today. The client sends a date rather than relying on the
	// server's clock, because "today" is the player's today, not the server's.
	PlayedOn string `json:"playedOn"`
	Note     string `json:"note"`
}

// LogSessions records a sitting across one or more games.
//
// Sessions are the diary; playthrough.hours stays the running total and each
// session adds to it. That keeps hours meaningful for entries logged before
// sessions existed — they read as a starting balance nobody has to backfill —
// and honours the spec's rule that sessions are optional (3.2): someone who
// only ever types a total still gets a working app.
//
// The whole batch is one transaction. Logging an evening across three games
// and having the third fail would leave a total that no set of sessions adds
// up to, which is worse than logging nothing.
func (r *Repo) LogSessions(ctx context.Context, accountID int64, in []SessionEntry) error {
	if len(in) == 0 {
		return fmt.Errorf("%w: nothing to log", ErrInvalid)
	}
	if len(in) > 20 {
		return fmt.Errorf("%w: too many games in one sitting", ErrInvalid)
	}

	for _, e := range in {
		if e.Hours <= 0 {
			return fmt.Errorf("%w: a session needs some time in it", ErrInvalid)
		}
		if e.Hours > 24 {
			return fmt.Errorf("%w: more than 24 hours in a day", ErrInvalid)
		}
		if e.PlayedOn != "" {
			if _, err := time.Parse("2006-01-02", e.PlayedOn); err != nil {
				return fmt.Errorf("%w: date must be YYYY-MM-DD", ErrInvalid)
			}
		}
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	for _, e := range in {
		playedOn := e.PlayedOn
		if playedOn == "" {
			playedOn = time.Now().Format("2006-01-02")
		}

		var note *string
		if trimmed := strings.TrimSpace(e.Note); trimmed != "" {
			note = &trimmed
		}

		// Scoped by account in the statement itself. A playthrough id is a
		// guessable integer, so ownership is checked where it cannot be
		// forgotten rather than in a separate lookup above.
		var id int64
		err := tx.QueryRowContext(ctx, `
			INSERT INTO session (playthrough_id, played_on, hours, note)
			SELECT p.id, $3::date, $4, $5
			FROM playthrough p
			WHERE p.id = $1 AND p.account_id = $2
			RETURNING id`,
			e.PlaythroughID, accountID, playedOn, e.Hours, note).Scan(&id)
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("%w: no such playthrough", ErrInvalid)
		}
		if err != nil {
			return fmt.Errorf("insert session: %w", err)
		}

		if _, err := tx.ExecContext(ctx, `
			UPDATE playthrough
			   SET hours = COALESCE(hours, 0) + $3, updated_at = now()
			 WHERE id = $1 AND account_id = $2`,
			e.PlaythroughID, accountID, e.Hours); err != nil {
			return fmt.Errorf("add hours: %w", err)
		}
	}

	return tx.Commit()
}

// Session is one dated entry in a playthrough's diary.
type Session struct {
	ID       int64   `json:"id"`
	PlayedOn string  `json:"playedOn"`
	Hours    float64 `json:"hours"`
	Note     *string `json:"note,omitempty"`
}

// Sessions lists one playthrough's diary, newest first.
//
// Scoped by account in the join rather than by a separate ownership check: a
// playthrough id is a guessable integer, and a check you have to remember to
// write is one you can forget.
func (r *Repo) Sessions(ctx context.Context, accountID, playthroughID int64) ([]Session, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT s.id, s.played_on, COALESCE(s.hours, 0), s.note
		FROM session s
		JOIN playthrough p ON p.id = s.playthrough_id
		WHERE s.playthrough_id = $1 AND p.account_id = $2
		ORDER BY s.played_on DESC, s.id DESC`, playthroughID, accountID)
	if err != nil {
		return nil, fmt.Errorf("list sessions: %w", err)
	}
	defer rows.Close()

	// Never nil, so the client handles one shape of "nothing" rather than two.
	out := []Session{}
	for rows.Next() {
		var s Session
		var playedOn time.Time
		if err := rows.Scan(&s.ID, &playedOn, &s.Hours, &s.Note); err != nil {
			return nil, fmt.Errorf("scan session: %w", err)
		}
		s.PlayedOn = playedOn.Format("2006-01-02")
		out = append(out, s)
	}
	return out, rows.Err()
}
