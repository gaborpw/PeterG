// Command checkpointd is the Checkpoint API server.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	// Registers the "pgx" driver with database/sql. Imported for its side
	// effect only; nothing else in the codebase touches pgx directly.
	_ "github.com/jackc/pgx/v5/stdlib"

	"gitlab.com/gaborpw/checkpoint/api/internal/config"
	"gitlab.com/gaborpw/checkpoint/api/internal/httpapi"
	"gitlab.com/gaborpw/checkpoint/api/internal/playthrough"
	"gitlab.com/gaborpw/checkpoint/api/internal/store"
)

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	if err := run(log); err != nil {
		log.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run(log *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	st, err := store.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer func() {
		if st != nil {
			_ = st.Close()
		}
	}()

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           httpapi.New(st, playthrough.NewRepo(st.DB()), log).Routes(),
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	// Shut down on SIGINT/SIGTERM, draining in-flight requests first.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	errs := make(chan error, 1)
	go func() {
		log.Info("listening", "addr", cfg.Addr, "sync_enabled", cfg.SyncEnabled())
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errs <- err
		}
	}()

	select {
	case err := <-errs:
		return err
	case <-ctx.Done():
		log.Info("shutting down")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	}
}
