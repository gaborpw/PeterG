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
		       p.updated_at, p.started_at
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
		if err := rows.Scan(&p.ID, &p.Title, &p.CoverURL, &p.Platform, &p.Status,
			&p.Hours, &rating, &p.Liked, &p.Review, &p.UpdatedAt, &started); err != nil {
			return nil, fmt.Errorf("scan playthrough: %w", err)
		}
		if rating.Valid {
			v := float64(rating.Int16) / 2
			p.Rating = &v
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
	slug := slugify(title)

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

func slugify(title string) string {
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
