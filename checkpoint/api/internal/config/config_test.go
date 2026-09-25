package config

import "testing"

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
