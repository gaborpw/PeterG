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

function baseUrl(): string {
  // e.g. "http://192.168.0.200:8081/index.bundle?platform=ios&dev=true"
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;

  const host = (() => {
    if (typeof scriptURL === 'string') {
      const match = /^https?:\/\/([^/:]+)/.exec(scriptURL);
      if (match !== null) return match[1];
    }
    // Web preview, or a production build where Metro is not involved.
    return Platform.OS === 'web' ? 'localhost' : null;
  })();

  if (host === null) return '';
  return `http://${host}:${API_PORT}`;
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
  };
}

/** Short, because an unreachable API should fall back fast, not hang the UI. */
async function request(path: string, init?: RequestInit): Promise<Response> {
  const url = baseUrl();
  if (url === '') throw new Error('no API host');

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
