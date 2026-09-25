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

type Library = {
  all: Playthrough[];
  ready: boolean;
  byStatus(...statuses: Status[]): Playthrough[];
  /** Adds a playthrough, or updates the existing one for that title. */
  log(entry: NewLog): void;
  remove(id: string): void;
};

const LibraryContext = createContext<Library | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Playthrough[]>(SEED);
  const [ready, setReady] = useState(false);

  // Load once on mount. Until it resolves the seed is shown, which means no
  // empty flash on a cold start.
  useEffect(() => {
    let live = true;
    void (async () => {
      const saved = await loadPlaythroughs();
      if (!live) return;
      if (saved !== null && saved.length > 0) setAll(saved);
      setReady(true);
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
        coverUrl: entry.coverUrl ?? (i === -1 ? undefined : current[i].coverUrl),
        lastPlayed: 'today',
        startedAt: i === -1 ? undefined : current[i].startedAt,
      };

      if (i === -1) return [next, ...current];
      const copy = [...current];
      copy[i] = next;
      return copy;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setAll((current) => current.filter((p) => p.id !== id));
  }, []);

  const value = useMemo<Library>(
    () => ({
      all,
      ready,
      byStatus: (...statuses: Status[]) => all.filter((p) => statuses.includes(p.status)),
      log,
      remove,
    }),
    [all, ready, log, remove],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): Library {
  const ctx = useContext(LibraryContext);
  if (ctx === null) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return ctx;
}
