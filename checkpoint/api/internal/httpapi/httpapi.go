// Package httpapi wires HTTP routes to the rest of the service.
//
// Handlers here do transport work only: decode, call inward, encode. Domain
// logic belongs in its own package so it stays testable without a request.
package httpapi

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"time"
)

// Pinger is the part of the store this package needs. Taking the narrow
// interface rather than *store.Store keeps the dependency one-directional and
// makes the readiness handler trivial to test.
type Pinger interface {
	Ping(context.Context) error
}

type Server struct {
	store Pinger
	log   *slog.Logger
}

func New(store Pinger, log *slog.Logger) *Server {
	return &Server{store: store, log: log}
}

// Routes returns the service's handler.
func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()

	// Liveness: the process is up. Never touches the database, so a database
	// outage does not get the container killed and restarted pointlessly.
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Readiness: the process can serve traffic, which means the database is
	// reachable.
	mux.HandleFunc("GET /readyz", s.handleReady)

	mux.HandleFunc("GET /v1/games/{id}", s.handleGetGame)

	return s.withRequestLog(mux)
}

func (s *Server) handleReady(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if err := s.store.Ping(ctx); err != nil {
		s.log.WarnContext(ctx, "readiness check failed", "err", err)
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{
			"status": "unavailable",
			"reason": "database unreachable",
		})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

// handleGetGame is a placeholder so the route shape is settled before there is
// a query behind it. See docs/spec.md section 3.7 for what this must return.
func (s *Server) handleGetGame(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusNotImplemented, map[string]string{
		"error": "not implemented",
		"id":    r.PathValue("id"),
	})
}

func (s *Server) withRequestLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)
		s.log.InfoContext(r.Context(), "request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rec.status,
			"duration", time.Since(start),
		)
	})
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
