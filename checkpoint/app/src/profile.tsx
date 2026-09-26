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
import type { Favorite, Profile } from './api';

export type { Favorite, Profile };

/**
 * Your account, from the server.
 *
 * Kept apart from the library because it fails differently: a playthrough is
 * yours whether or not the network is there, so the library writes optimistically
 * and reconciles. A handle is not yours until the server says nobody else has
 * it, so these writes wait for the answer and report what it was.
 */
type ProfileStore = {
  profile: Profile | null;
  ready: boolean;
  error: string | null;
  save: (input: api.ProfileInput) => Promise<boolean>;
  saveFavorites: (favorites: Favorite[]) => Promise<boolean>;
  reload: () => void;
};

const ProfileContext = createContext<ProfileStore | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    api
      .getProfile()
      .then((p) => {
        if (!live) return;
        setProfile(p);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!live) return;
        // The profile screen still renders without this; it just cannot be
        // edited, which is the honest state when the server is unreachable.
        setError(err instanceof Error ? err.message : 'could not reach the server');
      })
      .finally(() => {
        if (live) setReady(true);
      });
    return () => {
      live = false;
    };
  }, [nonce]);

  const save = useCallback(async (input: api.ProfileInput) => {
    try {
      setProfile(await api.updateProfile(input));
      setError(null);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'could not save');
      return false;
    }
  }, []);

  const saveFavorites = useCallback(async (favorites: Favorite[]) => {
    try {
      setProfile(await api.setFavorites(favorites));
      setError(null);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'could not save');
      return false;
    }
  }, []);

  const value = useMemo<ProfileStore>(
    () => ({
      profile,
      ready,
      error,
      save,
      saveFavorites,
      reload: () => setNonce((n) => n + 1),
    }),
    [profile, ready, error, save, saveFavorites],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileStore {
  const value = useContext(ProfileContext);
  if (value === null) throw new Error('useProfile must be used inside ProfileProvider');
  return value;
}
