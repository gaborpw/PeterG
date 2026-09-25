/**
 * The Checkpoint API client.
 *
 * Base URL is derived from Metro's own address rather than hardcoded: the app
 * runs on a phone, so `localhost` would mean the phone, not the Mac serving it.
 * React Native already exposes the bundler URL, so this needs no extra package.
 */

import { NativeModules, Platform } from 'react-native';
import type { Playthrough, Status } from './data';

const API_PORT = 8080;

/**
 * Where the API lives.
 *
 * The app runs on a phone, so `localhost` would mean the phone rather than the
 * Mac serving it. The host has to come from the dev server's own address.
 *
 * Three sources, in order:
 *
 *  1. EXPO_PUBLIC_API_URL — an explicit override. Expo inlines any
 *     EXPO_PUBLIC_* variable from app/.env at bundle time. This is the escape
 *     hatch when the automatic paths fail, and the only one that will work in a
 *     production build, where there is no dev server at all.
 *  2. getDevServer() — reads scriptURL through the TurboModule spec. This is
 *     the one that works under the New Architecture, which RN 0.86 uses.
 *  3. NativeModules.SourceCode — the old-architecture path. Empty under
 *     bridgeless, kept only for older runtimes.
 */
function resolveHost(): string | null {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (typeof explicit === 'string' && explicit !== '') return explicit;

  const fromUrl = (url: unknown): string | null => {
    if (typeof url !== 'string') return null;
    const match = /^https?:\/\/([^/:]+)/.exec(url);
    return match === null ? null : `http://${match[1]}:${API_PORT}`;
  };

  try {
    // Internal RN path, so guarded: a rename upstream must not crash the app.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native/Libraries/Core/Devtools/getDevServer');
    const getDevServer = (mod.default ?? mod) as () => { url?: string };
    const host = fromUrl(getDevServer()?.url);
    if (host !== null) return host;
  } catch {
    // fall through
  }

  const legacy = fromUrl(NativeModules?.SourceCode?.scriptURL);
  if (legacy !== null) return legacy;

  if (Platform.OS === 'web') return `http://localhost:${API_PORT}`;
  return null;
}

let cached: string | null | undefined;

function baseUrl(): string | null {
  if (cached === undefined) cached = resolveHost();
  return cached;
}

/** What the app should tell the user when it cannot find the API. */
export function apiHost(): string {
  return baseUrl() ?? 'not found';
}

export type SaveInput = {
  title: string;
  coverUrl?: string;
  platform?: string;
  status: Status;
  hours: number;
  rating?: number;
  liked?: boolean;
  review?: string;
};

/** Wire shape. `id` is a number server-side; the app uses strings throughout. */
type WirePlaythrough = {
  id: number;
  title: string;
  coverUrl?: string;
  platform?: string;
  status: Status;
  hours: number;
  rating?: number;
  liked: boolean;
  review?: string;
};

function fromWire(w: WirePlaythrough): Playthrough {
  return {
    id: String(w.id),
    title: w.title,
    coverUrl: w.coverUrl,
    platform: w.platform ?? '—',
    status: w.status,
    hours: w.hours,
    rating: w.rating,
    liked: w.liked,
    review: w.review,
  };
}

/** Short, because an unreachable API should fall back fast, not hang the UI. */
async function request(path: string, init?: RequestInit): Promise<Response> {
  const url = baseUrl();
  if (url === null) {
    throw new Error(
      'could not find the API host — set EXPO_PUBLIC_API_URL in app/.env',
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    return await fetch(url + path, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function listPlaythroughs(): Promise<Playthrough[]> {
  const res = await request('/v1/me/playthroughs');
  if (!res.ok) throw new Error(`API ${res.status}`);

  const body: unknown = await res.json();
  if (!Array.isArray(body)) throw new Error('unexpected response shape');
  return (body as WirePlaythrough[]).map(fromWire);
}

export async function savePlaythrough(input: SaveInput): Promise<Playthrough> {
  const res = await request('/v1/me/playthroughs', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const detail: unknown = await res.json().catch(() => null);
    const message =
      typeof detail === 'object' && detail !== null && 'error' in detail
        ? String((detail as { error: unknown }).error)
        : `API ${res.status}`;
    throw new Error(message);
  }
  return fromWire((await res.json()) as WirePlaythrough);
}

export async function deletePlaythrough(id: string): Promise<void> {
  const res = await request(`/v1/me/playthroughs/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 404) throw new Error(`API ${res.status}`);
}

/** Whether the API answered. Used to tell the user why they are offline. */
export async function ping(): Promise<boolean> {
  try {
    const res = await request('/readyz');
    return res.ok;
  } catch {
    return false;
  }
}
