package playthrough

import "testing"

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
		if got := slugify(in); got != want {
			t.Errorf("slugify(%q) = %q, want %q", in, got, want)
		}
	}
}
