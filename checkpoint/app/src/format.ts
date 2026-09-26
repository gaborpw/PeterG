import type { Status } from './data';

/**
 * The "PC · last played today" line that sits under a game.
 *
 * Shared because it was written twice and fixed once. Two things it gets right
 * that the copies did not: a wishlist entry has no platform, so joining
 * unconditionally left a leading separator, and "last played" is a false claim
 * about a game that has only ever been wished for.
 */
export function playthroughMeta(p: {
  platform: string;
  status: Status;
  lastPlayed?: string;
}): string {
  const when =
    p.status === 'wishlist'
      ? 'not started'
      : p.lastPlayed !== undefined
        ? `last played ${p.lastPlayed}`
        : undefined;

  return [p.platform, when].filter((part) => part !== undefined && part !== '').join(' · ');
}
