// Package httpapi wires HTTP routes to the rest of the service.
//
// Handlers here do transport work only: decode, call inward, encode. Domain
// logic belongs in its own package so it stays testable without a request.
package httpapi

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"gitlab.com/gaborpw/checkpoint/api/internal/playthrough"
	"gitlab.com/gaborpw/checkpoint/api/internal/profile"
)

// Pinger is the part of the store this package needs. Taking the narrow
// interface rather than *store.Store keeps the dependency one-directional and
// makes the readiness handler trivial to test.
type Pinger interface {
	Ping(context.Context) error
}

type Server struct {
	store    Pinger
	plays    *playthrough.Repo
	profiles *profile.Repo
	log      *slog.Logger
}

func New(store Pinger, plays *playthrough.Repo, profiles *profile.Repo, log *slog.Logger) *Server {
	return &Server{store: store, plays: plays, profiles: profiles, log: log}
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

	mux.HandleFunc("GET /v1/me/playthroughs", s.handleListPlaythroughs)
	mux.HandleFunc("POST /v1/me/playthroughs", s.handleSavePlaythrough)
	mux.HandleFunc("DELETE /v1/me/playthroughs/{id}", s.handleDeletePlaythrough)

	mux.HandleFunc("GET /v1/me/profile", s.handleGetProfile)
	mux.HandleFunc("PATCH /v1/me/profile", s.handleUpdateProfile)
	mux.HandleFunc("PUT /v1/me/favorites", s.handleSetFavorites)

	return s.withCORS(s.withRequestLog(mux))
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

// Every handler below acts as the one local account. Auth replaces this.
func (s *Server) accountID() int64 { return playthrough.DevAccountID }

func (s *Server) handleListPlaythroughs(w http.ResponseWriter, r *http.Request) {
	all, err := s.plays.List(r.Context(), s.accountID())
	if err != nil {
		s.log.ErrorContext(r.Context(), "list playthroughs", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not load"})
		return
	}
	writeJSON(w, http.StatusOK, all)
}

func (s *Server) handleSavePlaythrough(w http.ResponseWriter, r *http.Request) {
	// Cap the body: an unbounded decode is a memory-exhaustion path.
	var in playthrough.Input
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64<<10))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&in); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "malformed body"})
		return
	}

	saved, err := s.plays.Save(r.Context(), s.accountID(), in)
	if errors.Is(err, playthrough.ErrInvalid) {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
		return
	}
	if err != nil {
		s.log.ErrorContext(r.Context(), "save playthrough", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not save"})
		return
	}
	writeJSON(w, http.StatusOK, saved)
}

func (s *Server) handleDeletePlaythrough(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "bad id"})
		return
	}

	err = s.plays.Delete(r.Context(), s.accountID(), id)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	if err != nil {
		s.log.ErrorContext(r.Context(), "delete playthrough", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not delete"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// withCORS exists so Expo's web preview can reach the dev API. It is
// deliberately wide open, which is fine for a service bound to a laptop and
// must be narrowed before anything is deployed.
func (s *Server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
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

func (s *Server) handleGetProfile(w http.ResponseWriter, r *http.Request) {
	p, err := s.profiles.Get(r.Context(), s.accountID())
	if err != nil {
		s.log.ErrorContext(r.Context(), "get profile", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not load"})
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (s *Server) handleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	var in profile.Input
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 16<<10))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&in); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "malformed body"})
		return
	}

	p, err := s.profiles.Update(r.Context(), s.accountID(), in)
	switch {
	case errors.Is(err, profile.ErrHandleTaken):
		// 409, not 422: the input is well formed, somebody else just has it.
		writeJSON(w, http.StatusConflict, map[string]string{"error": "that handle is taken"})
		return
	case errors.Is(err, profile.ErrInvalid):
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
		return
	case err != nil:
		s.log.ErrorContext(r.Context(), "update profile", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not save"})
		return
	}
	writeJSON(w, http.StatusOK, p)
}

func (s *Server) handleSetFavorites(w http.ResponseWriter, r *http.Request) {
	var in []profile.FavoriteInput
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 16<<10))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&in); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "malformed body"})
		return
	}

	p, err := s.profiles.SetFavorites(r.Context(), s.accountID(), in)
	if errors.Is(err, profile.ErrInvalid) {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": err.Error()})
		return
	}
	if err != nil {
		s.log.ErrorContext(r.Context(), "set favorites", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "could not save"})
		return
	}
	writeJSON(w, http.StatusOK, p)
}
