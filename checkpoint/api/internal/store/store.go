// Package store owns the database. Nothing outside it opens a connection or
// writes SQL.
package store

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

// Store is the handle every other package takes a dependency on.
type Store struct {
	db *sql.DB
}

// Open validates the connection string and configures the pool. It does not
// dial: use Ping for that, so a database that is briefly down delays readiness
// rather than preventing startup.
func Open(driver, dsn string) (*Store, error) {
	db, err := sql.Open(driver, dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)
	return &Store{db: db}, nil
}

// Ping reports whether the database is reachable.
func (s *Store) Ping(ctx context.Context) error {
	if s == nil || s.db == nil {
		return fmt.Errorf("store is not configured")
	}
	return s.db.PingContext(ctx)
}

// Close releases the pool.
func (s *Store) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

// DB exposes the pool to packages that build queries. It exists so the rest of
// the codebase does not reach for a package-level global.
func (s *Store) DB() *sql.DB { return s.db }
