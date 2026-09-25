package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadRequiresDatabaseURL(t *testing.T) {
	t.Setenv("DATABASE_URL", "")

	if _, err := Load(); err == nil {
		t.Fatal("expected an error when DATABASE_URL is unset, got nil")
	}
}

func TestLoadDefaults(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://localhost/checkpoint")

	c, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if c.Addr != ":8080" {
		t.Errorf("Addr = %q, want :8080", c.Addr)
	}
	if c.ShutdownTimeout.Seconds() != 15 {
		t.Errorf("ShutdownTimeout = %v, want 15s", c.ShutdownTimeout)
	}
	if c.SyncEnabled() {
		t.Error("SyncEnabled = true without IGDB credentials, want false")
	}
}

func TestSyncEnabledNeedsBothCredentials(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://localhost/checkpoint")
	t.Setenv("IGDB_CLIENT_ID", "id")

	c, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if c.SyncEnabled() {
		t.Error("SyncEnabled = true with only a client ID, want false")
	}
}

func TestDotEnvDoesNotOverrideRealEnvironment(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, ".env")
	body := "# a comment\nDATABASE_URL=postgres://from-file\nexport CHECKPOINT_ADDR=\":9999\"\nIGDB_CLIENT_ID='from-file'\nnot a pair\n"
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}

	// Set one of them for real; the file must not win.
	t.Setenv("DATABASE_URL", "postgres://from-environment")
	t.Setenv("CHECKPOINT_ADDR", "")
	t.Setenv("IGDB_CLIENT_ID", "")

	loadDotEnv(path)

	if got := os.Getenv("DATABASE_URL"); got != "postgres://from-environment" {
		t.Errorf("DATABASE_URL = %q, want the environment value to win", got)
	}
	if got := os.Getenv("CHECKPOINT_ADDR"); got != ":9999" {
		t.Errorf("CHECKPOINT_ADDR = %q, want :9999 with quotes stripped", got)
	}
	if got := os.Getenv("IGDB_CLIENT_ID"); got != "from-file" {
		t.Errorf("IGDB_CLIENT_ID = %q, want single quotes stripped", got)
	}
}
