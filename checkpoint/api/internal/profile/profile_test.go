package profile

import (
	"errors"
	"strings"
	"testing"
)

func TestValidate(t *testing.T) {
	str := func(s string) *string { return &s }

	cases := []struct {
		name string
		in   Input
		ok   bool
	}{
		{"nothing to change", Input{}, true},
		{"plain handle", Input{Handle: str("peterg")}, true},
		{"underscores and digits", Input{Handle: str("peter_g_99")}, true},
		{"handle trimmed", Input{Handle: str("  peterg  ")}, true},
		{"handle too short", Input{Handle: str("pg")}, false},
		{"handle too long", Input{Handle: str(strings.Repeat("a", 21))}, false},
		{"handle with a space", Input{Handle: str("peter g")}, false},
		{"handle with an at sign", Input{Handle: str("@peterg")}, false},
		{"name", Input{DisplayName: str("Peter G")}, true},
		{"name of spaces is empty", Input{DisplayName: str("   ")}, false},
		{"name too long", Input{DisplayName: str(strings.Repeat("a", 61))}, false},
		{"bio", Input{Bio: str("Long RPGs, short roguelikes.")}, true},
		{"empty bio clears it", Input{Bio: str("")}, true},
		{"bio too long", Input{Bio: str(strings.Repeat("a", 201))}, false},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			err := c.in.Validate()
			if c.ok && err != nil {
				t.Fatalf("expected valid, got %v", err)
			}
			if !c.ok {
				if err == nil {
					t.Fatal("expected an error")
				}
				if !errors.Is(err, ErrInvalid) {
					t.Fatalf("expected ErrInvalid, got %v", err)
				}
			}
		})
	}
}

// The @ is decoration the UI adds. Storing it would mean "@peterg" and
// "peterg" were two different handles.
func TestHandleRejectsLeadingAt(t *testing.T) {
	at := "@peterg"
	in := Input{Handle: &at}
	if err := in.Validate(); err == nil {
		t.Fatal("expected @ to be rejected")
	}
}

func TestValidateTrimsInPlace(t *testing.T) {
	name := "  Peter G  "
	in := Input{DisplayName: &name}
	if err := in.Validate(); err != nil {
		t.Fatalf("unexpected: %v", err)
	}
	if *in.DisplayName != "Peter G" {
		t.Fatalf("got %q, want %q", *in.DisplayName, "Peter G")
	}
}
