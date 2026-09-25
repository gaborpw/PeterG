// Package config loads runtime configuration from the environment.
//
// Everything the service needs is read once, at startup, and validated there.
// A missing required value is a startup failure, not a nil-pointer panic on the
// first request that happens to need it.
package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

type Config struct {
	// Addr is the host:port the HTTP server listens on.
	Addr string

	// DatabaseURL is the Postgres connection string.
	DatabaseURL string

	// IGDBClientID and IGDBClientSecret authenticate the metadata sync against
	// Twitch. They are optional: without them the service runs, but the
	// catalogue sync is disabled.
	IGDBClientID     string
	IGDBClientSecret string

	// ShutdownTimeout bounds how long in-flight requests get to finish.
	ShutdownTimeout time.Duration
}

// Load reads configuration from the environment, after folding in a .env file
// if one sits beside the binary or one directory up. Real environment variables
// always win.
func Load() (Config, error) {
	loadDotEnv(".env", filepath.Join("..", ".env"))

	c := Config{
		Addr:             envOr("CHECKPOINT_ADDR", ":8080"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		IGDBClientID:     os.Getenv("IGDB_CLIENT_ID"),
		IGDBClientSecret: os.Getenv("IGDB_CLIENT_SECRET"),
	}

	secs, err := strconv.Atoi(envOr("CHECKPOINT_SHUTDOWN_SECONDS", "15"))
	if err != nil {
		return Config{}, fmt.Errorf("CHECKPOINT_SHUTDOWN_SECONDS: %w", err)
	}
	c.ShutdownTimeout = time.Duration(secs) * time.Second

	if c.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL is required")
	}
	return c, nil
}

// SyncEnabled reports whether the IGDB catalogue sync has credentials.
func (c Config) SyncEnabled() bool {
	return c.IGDBClientID != "" && c.IGDBClientSecret != ""
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
