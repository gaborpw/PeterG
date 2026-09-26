// Package profile is the account's own record: who you are, and the four games
// you want at the top of your page.
//
// Favorites are deliberately not a list of titles. They point at game rows, so
// a favorite carries the same identity, art and metadata as a logged game and
// keeps doing so when IGDB replaces the catalogue underneath it.
package profile

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"gitlab.com/gaborpw/checkpoint/api/internal/playthrough"
)

// ErrInvalid marks input the caller got wrong, so the transport layer can
// answer 422 rather than 500.
var ErrInvalid = errors.New("invalid profile")

// ErrHandleTaken is separate because it is the one failure a person can fix by
// choosing differently, and the UI should say so specifically.
var ErrHandleTaken = errors.New("handle already taken")

type Profile struct {
	Handle      string     `json:"handle"`
	DisplayName string     `json:"displayName"`
	Bio         string     `json:"bio"`
	Favorites   []Favorite `json:"favorites"`
}

type Favorite struct {
	Position int     `json:"position"`
	Title    string  `json:"title"`
	CoverURL *string `json:"coverUrl,omitempty"`
}

// Input is a partial update: a nil field means "leave it alone", which is what
// lets the edit form send only what changed.
type Input struct {
	Handle      *string `json:"handle"`
	DisplayName *string `json:"displayName"`
	Bio         *string `json:"bio"`
}

// Handles are the one field other people will type at, so keep them boring:
// letters, digits and underscore, 3–20 characters.
var handlePattern = regexp.MustCompile(`^[a-zA-Z0-9_]{3,20}$`)

const (
	maxDisplayName = 60
	maxBio         = 200
)

// Validate normalises and checks an update.
//
// The caps are enforced here rather than trusted from the form: a client is
// something anyone can write, and a 10MB bio is a database problem.
func (in *Input) Validate() error {
	if in.Handle != nil {
		*in.Handle = strings.TrimSpace(*in.Handle)
		if !handlePattern.MatchString(*in.Handle) {
			return fmt.Errorf("%w: handle must be 3-20 letters, digits or underscore", ErrInvalid)
		}
	}
	if in.DisplayName != nil {
		*in.DisplayName = strings.TrimSpace(*in.DisplayName)
		if *in.DisplayName == "" {
			return fmt.Errorf("%w: name cannot be empty", ErrInvalid)
		}
		if len([]rune(*in.DisplayName)) > maxDisplayName {
			return fmt.Errorf("%w: name is too long", ErrInvalid)
		}
	}
	if in.Bio != nil {
		*in.Bio = strings.TrimSpace(*in.Bio)
		if len([]rune(*in.Bio)) > maxBio {
			return fmt.Errorf("%w: bio is too long", ErrInvalid)
		}
	}
	return nil
}

type Repo struct{ db *sql.DB }

func NewRepo(db *sql.DB) *Repo { return &Repo{db: db} }

func (r *Repo) Get(ctx context.Context, accountID int64) (Profile, error) {
	var p Profile
	var name, bio sql.NullString

	err := r.db.QueryRowContext(ctx,
		`SELECT handle, display_name, bio FROM account WHERE id = $1 AND deleted_at IS NULL`,
		accountID).Scan(&p.Handle, &name, &bio)
	if errors.Is(err, sql.ErrNoRows) {
		return Profile{}, fmt.Errorf("account %d not found", accountID)
	}
	if err != nil {
		return Profile{}, fmt.Errorf("load account: %w", err)
	}
	p.DisplayName = name.String
	p.Bio = bio.String

	favs, err := r.favorites(ctx, accountID)
	if err != nil {
		return Profile{}, err
	}
	p.Favorites = favs
	return p, nil
}

func (r *Repo) favorites(ctx context.Context, accountID int64) ([]Favorite, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT f.position, g.title, g.cover_url
		FROM favorite f
		JOIN game g ON g.id = f.game_id
		WHERE f.account_id = $1
		ORDER BY f.position`, accountID)
	if err != nil {
		return nil, fmt.Errorf("load favorites: %w", err)
	}
	defer rows.Close()

	// Never nil: an empty list encodes as [] rather than null, so the client
	// does not have to handle two shapes of "nothing".
	out := []Favorite{}
	for rows.Next() {
		var f Favorite
		if err := rows.Scan(&f.Position, &f.Title, &f.CoverURL); err != nil {
			return nil, fmt.Errorf("scan favorite: %w", err)
		}
		out = append(out, f)
	}
	return out, rows.Err()
}

func (r *Repo) Update(ctx context.Context, accountID int64, in Input) (Profile, error) {
	if err := in.Validate(); err != nil {
		return Profile{}, err
	}

	// COALESCE leaves a column alone when its parameter is nil, so one
	// statement serves a partial update without building SQL by hand.
	_, err := r.db.ExecContext(ctx, `
		UPDATE account
		   SET handle       = COALESCE($2, handle),
		       display_name = COALESCE($3, display_name),
		       bio          = COALESCE($4, bio)
		 WHERE id = $1 AND deleted_at IS NULL`,
		accountID, in.Handle, in.DisplayName, in.Bio)
	if err != nil {
		// handle is CITEXT UNIQUE; a clash is a person's mistake, not a fault.
		if strings.Contains(err.Error(), "account_handle_key") ||
			strings.Contains(strings.ToLower(err.Error()), "duplicate key") {
			return Profile{}, ErrHandleTaken
		}
		return Profile{}, fmt.Errorf("update account: %w", err)
	}
	return r.Get(ctx, accountID)
}

// FavoriteInput names a game by title, the same way a playthrough does, so the
// picker can hand over whatever the catalogue gave it.
type FavoriteInput struct {
	Position int    `json:"position"`
	Title    string `json:"title"`
	CoverURL string `json:"coverUrl"`
}

// SetFavorites replaces the whole set.
//
// Replacing rather than patching keeps it honest: the client sends the four it
// wants and gets exactly that, with no way to end up with a stale fifth or a
// gap where position 3 used to be.
func (r *Repo) SetFavorites(ctx context.Context, accountID int64, in []FavoriteInput) (Profile, error) {
	if len(in) > 4 {
		return Profile{}, fmt.Errorf("%w: four favorites at most", ErrInvalid)
	}

	seen := map[int]bool{}
	for _, f := range in {
		if f.Position < 1 || f.Position > 4 {
			return Profile{}, fmt.Errorf("%w: position must be 1-4", ErrInvalid)
		}
		if seen[f.Position] {
			return Profile{}, fmt.Errorf("%w: position %d given twice", ErrInvalid, f.Position)
		}
		seen[f.Position] = true
		if strings.TrimSpace(f.Title) == "" {
			return Profile{}, fmt.Errorf("%w: a favorite needs a title", ErrInvalid)
		}
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return Profile{}, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		`DELETE FROM favorite WHERE account_id = $1`, accountID); err != nil {
		return Profile{}, fmt.Errorf("clear favorites: %w", err)
	}

	for _, f := range in {
		var gameID int64
		title := strings.TrimSpace(f.Title)
		var cover *string
		if strings.TrimSpace(f.CoverURL) != "" {
			c := strings.TrimSpace(f.CoverURL)
			cover = &c
		}

		// Same upsert-by-slug a playthrough uses, so favoriting a game you
		// have not logged does not invent a second row for it.
		if err := tx.QueryRowContext(ctx, `
			INSERT INTO game (slug, title, sort_title, cover_url)
			VALUES ($1, $2, $2, $3)
			ON CONFLICT (slug) DO UPDATE
			  SET cover_url = COALESCE(EXCLUDED.cover_url, game.cover_url)
			RETURNING id`, playthrough.Slugify(title), title, cover).Scan(&gameID); err != nil {
			return Profile{}, fmt.Errorf("upsert game: %w", err)
		}

		if _, err := tx.ExecContext(ctx,
			`INSERT INTO favorite (account_id, game_id, position) VALUES ($1, $2, $3)`,
			accountID, gameID, f.Position); err != nil {
			return Profile{}, fmt.Errorf("insert favorite: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return Profile{}, fmt.Errorf("commit: %w", err)
	}
	return r.Get(ctx, accountID)
}
