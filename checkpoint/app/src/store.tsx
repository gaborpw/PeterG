/**
 * The app's one source of truth for playthroughs.
 *
 * Screens read through `useLibrary()` and never reach for `data.ts` directly,
 * so when the API lands only this file changes.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as api from './api';
import { backlog, finished, mine, type Playthrough, type Status } from './data';
import { loadPlaythroughs, savePlaythroughs } from './storage';

/** What a first launch starts with, so the app is not an empty room. */
const SEED: Playthrough[] = [...mine, ...backlog, ...finished];

export type NewLog = {
  title: string;
  platform: string;
  status: Status;
  hours: number;
  rating?: number;
  liked?: boolean;
  review?: string;
  coverUrl?: string;
};

/** Where the data on screen actually came from. Shown, not hidden. */
export type Source = 'loading' | 'server' | 'offline';

type Library = {
  all: Playthrough[];
  ready: boolean;
  source: Source;
  /** Set when the last save could not reach the server. */
  lastError: string | null;
  byStatus(...statuses: Status[]): Playthrough[];
  /** Adds a playthrough, or updates the existing one for that title. */
  log(entry: NewLog): void;
  remove(id: string): void;
};

const LibraryContext = createContext<Library | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Playthrough[]>(SEED);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<Source>('loading');
  const [lastError, setLastError] = useState<string | null>(null);

  // Server first, local cache second, seed last. The cache means the app opens
  // with your real library even when the API is not running, which for a
  // laptop-hosted dev server is most of the time.
  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const fromServer = await api.listPlaythroughs();
        if (!live) return;
        setAll(fromServer);
        setSource('server');
        void savePlaythroughs(fromServer);
      } catch {
        const cached = await loadPlaythroughs();
        if (!live) return;
        if (cached !== null && cached.length > 0) setAll(cached);
        setSource('offline');
      } finally {
        if (live) setReady(true);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  // Persist on every change, but not before the first load has landed —
  // otherwise the seed would overwrite real data on a slow read.
  useEffect(() => {
    if (!ready) return;
    void savePlaythroughs(all);
  }, [all, ready]);

  const log = useCallback((entry: NewLog) => {
    // Write to the server in the background. The optimistic update below is
    // what the user sees; a failure surfaces as lastError rather than silently
    // losing the log, which stays in the local cache either way.
    void api
      .savePlaythrough({
        title: entry.title.trim(),
        coverUrl: entry.coverUrl,
        platform: entry.platform,
        status: entry.status,
        hours: entry.hours,
        rating: entry.rating,
        liked: entry.liked,
        review: entry.review,
      })
      .then(() => {
        setSource('server');
        setLastError(null);
      })
      .catch((err: unknown) => {
        setSource('offline');
        setLastError(err instanceof Error ? err.message : 'could not reach the server');
      });

    setAll((current) => {
      const i = current.findIndex(
        (p) => p.title.toLowerCase() === entry.title.trim().toLowerCase(),
      );

      const next: Playthrough = {
        id: i === -1 ? `p${Date.now()}` : current[i].id,
        title: entry.title.trim(),
        platform: entry.platform,
        status: entry.status,
        hours: entry.hours,
        rating: entry.rating,
        liked: entry.liked,
        // Every field the form can set has to be here. Leaving review out
        // meant the server stored it and the app forgot it the instant you
        // saved: reopening the entry showed an empty box over text that was
        // sitting safely in the database.
        review: entry.review,
        coverUrl: entry.coverUrl ?? (i === -1 ? undefined : current[i].coverUrl),
        // Wanting or shelving a game is not playing it. Stamping every save
        // with "today" is what made a wishlisted game claim it was played.
        lastPlayed:
          entry.status === 'wishlist' || entry.status === 'backlog'
            ? i === -1
              ? undefined
              : current[i].lastPlayed
            : 'today',
        startedAt: i === -1 ? undefined : current[i].startedAt,
      };

      if (i === -1) return [next, ...current];
      const copy = [...current];
      copy[i] = next;
      return copy;
    });
  }, []);

  const remove = useCallback((id: string) => {
    // Same contract as log: the row goes from the screen immediately, and a
    // failure says so. Without this a delete the server rejected looked
    // exactly like one it accepted — the row vanished, stayed in the
    // database, and came back on the next read with no explanation.
    void api
      .deletePlaythrough(id)
      .then(() => {
        setSource('server');
        setLastError(null);
      })
      .catch((err: unknown) => {
        setSource('offline');
        setLastError(err instanceof Error ? err.message : 'could not reach the server');
      });

    setAll((current) => current.filter((p) => p.id !== id));
  }, []);

  const value = useMemo<Library>(
    () => ({
      all,
      ready,
      source,
      lastError,
      byStatus: (...statuses: Status[]) => all.filter((p) => statuses.includes(p.status)),
      log,
      remove,
    }),
    [all, ready, source, lastError, log, remove],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): Library {
  const ctx = useContext(LibraryContext);
  if (ctx === null) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return ctx;
}
