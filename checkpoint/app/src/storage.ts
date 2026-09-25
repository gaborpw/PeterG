/**
 * Persistence, behind an interface small enough to swap.
 *
 * Today it is AsyncStorage on the device. When the API exists this module is
 * what changes — every caller goes through `loadPlaythroughs` /
 * `savePlaythroughs` and never touches a storage library directly.
 *
 * AsyncStorage is loaded lazily and defensively: if the native module is not
 * present (a web preview, a build where it did not link), the app still runs
 * and simply forgets between launches rather than crashing on boot.
 */

import type { Playthrough } from './data';

const KEY = 'checkpoint.playthroughs.v1';

type Backend = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

let backend: Backend | null | undefined;

function getBackend(): Backend | null {
  if (backend !== undefined) return backend;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-async-storage/async-storage');
    backend = (mod.default ?? mod) as Backend;
  } catch {
    console.warn('[storage] AsyncStorage unavailable — logs will not survive a reload.');
    backend = null;
  }
  return backend;
}

/** Returns null when nothing has been saved yet, so callers can seed. */
export async function loadPlaythroughs(): Promise<Playthrough[] | null> {
  const store = getBackend();
  if (store === null) return null;

  try {
    const raw = await store.getItem(KEY);
    if (raw === null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    // Anything on disk is from an older version of this app, so treat it as
    // untrusted shape rather than assuming it matches today's type.
    return parsed.filter(isPlaythrough);
  } catch (err) {
    console.warn('[storage] could not read saved playthroughs:', err);
    return null;
  }
}

export async function savePlaythroughs(all: Playthrough[]): Promise<void> {
  const store = getBackend();
  if (store === null) return;

  try {
    await store.setItem(KEY, JSON.stringify(all));
  } catch (err) {
    // A failed write must not take the app down mid-log.
    console.warn('[storage] could not save playthroughs:', err);
  }
}

function isPlaythrough(v: unknown): v is Playthrough {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return typeof p.id === 'string' && typeof p.title === 'string' && typeof p.status === 'string';
}
