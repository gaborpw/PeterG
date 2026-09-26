package playthrough

import (
	"context"
	"errors"
	"testing"
)

func TestValidate(t *testing.T) {
	five := 5.0
	tooHigh := 5.5
	tooLow := 0.4

	cases := []struct {
		name    string
		in      Input
		wantErr bool
	}{
		{"ok", Input{Title: "Elden Ring", Status: "playing", Hours: 47, Rating: &five}, false},
		{"blank title", Input{Title: "   ", Status: "playing"}, true},
		{"unknown status", Input{Title: "X", Status: "beaten"}, true},
		{"negative hours", Input{Title: "X", Status: "playing", Hours: -1}, true},
		{"rating too high", Input{Title: "X", Status: "playing", Rating: &tooHigh}, true},
		{"rating too low", Input{Title: "X", Status: "playing", Rating: &tooLow}, true},
		{"no rating is fine", Input{Title: "X", Status: "backlog"}, false},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			err := c.in.Validate()
			if c.wantErr && err == nil {
				t.Fatal("expected an error, got nil")
			}
			if !c.wantErr && err != nil {
				t.Fatalf("expected no error, got %v", err)
			}
		})
	}
}

func TestSlugify(t *testing.T) {
	cases := map[string]string{
		"Elden Ring":              "elden-ring",
		"Hollow Knight: Silksong": "hollow-knight-silksong",
		"Baldur’s Gate 3":         "baldur-s-gate-3",
		"  Spaces  Everywhere  ":  "spaces-everywhere",
		"Metaphor: ReFantazio":    "metaphor-refantazio",
	}
	for in, want := range cases {
		if got := Slugify(in); got != want {
			t.Errorf("Slugify(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestSessionEntryValidation(t *testing.T) {
	// LogSessions validates before it touches the database, so these cases
	// exercise the guard without needing one.
	r := &Repo{}
	ctx := context.Background()

	cases := []struct {
		name string
		in   []SessionEntry
	}{
		{"nothing at all", nil},
		{"empty batch", []SessionEntry{}},
		{"zero hours", []SessionEntry{{PlaythroughID: 1, Hours: 0}}},
		{"negative hours", []SessionEntry{{PlaythroughID: 1, Hours: -2}}},
		{"more hours than a day has", []SessionEntry{{PlaythroughID: 1, Hours: 25}}},
		{"unparseable date", []SessionEntry{{PlaythroughID: 1, Hours: 2, PlayedOn: "yesterday"}}},
		{"american date", []SessionEntry{{PlaythroughID: 1, Hours: 2, PlayedOn: "09/25/2026"}}},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			err := r.LogSessions(ctx, 1, c.in)
			if err == nil {
				t.Fatal("expected an error")
			}
			if !errors.Is(err, ErrInvalid) {
				t.Fatalf("expected ErrInvalid, got %v", err)
			}
		})
	}
}

func TestSessionBatchCap(t *testing.T) {
	r := &Repo{}
	many := make([]SessionEntry, 21)
	for i := range many {
		many[i] = SessionEntry{PlaythroughID: int64(i + 1), Hours: 1}
	}
	if err := r.LogSessions(context.Background(), 1, many); !errors.Is(err, ErrInvalid) {
		t.Fatalf("expected ErrInvalid for an oversized batch, got %v", err)
	}
}
