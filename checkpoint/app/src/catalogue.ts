/**
 * The game catalogue: one place that answers "what games exist?".
 *
 * Today it is built from the sample data in data.ts. Tomorrow searchGames
 * calls our IGDB mirror instead. Everything above this file — the search tab,
 * the picker, the log form's prefill — is written against these two functions
 * and does not change when that happens, which is the point of the seam.
 *
 * searchGames is async even though the local implementation answers
 * immediately. A synchronous signature here would mean rewriting every call
 * site the day the network appears behind it.
 */

import {
  backlog,
  catalogue,
  favourites,
  feed,
  finished,
  friendsPlaying,
  mine,
  popularReviews,
  popularThisWeek,
  titleKey,
} from './data';

export type GameSummary = {
  /** The normalised title. Stable, and doubles as the index key. */
  id: string;
  title: string;
  year?: number;
  developer?: string;
  genres?: string[];
  coverUrl?: string;
  backdropUrl?: string;
};

type Art = { title: string; coverUrl?: string; backdropUrl?: string };

/**
 * Every title the sample data mentions, with the best art any of them carries.
 *
 * The same game appears in several arrays and not always with art attached —
 * Baldur's Gate 3 sits in three of them. Merging by normalised title means one
 * entry with a cover beats three without.
 */
function buildIndex(): Map<string, GameSummary> {
  const sources: Art[] = [
    ...mine,
    ...backlog,
    ...finished,
    ...friendsPlaying,
    ...feed,
    ...popularThisWeek,
    ...popularReviews,
    ...favourites,
  ];

  const index = new Map<string, GameSummary>();

  for (const item of sources) {
    const id = titleKey(item.title);
    const existing = index.get(id);
    if (existing === undefined) {
      index.set(id, {
        id,
        title: item.title,
        coverUrl: item.coverUrl,
        backdropUrl: item.backdropUrl,
      });
      continue;
    }
    // Keep the first art we saw; fill only the gaps.
    existing.coverUrl ??= item.coverUrl;
    existing.backdropUrl ??= item.backdropUrl;
  }

  // Facts are keyed by normalised title and carry no display title of their
  // own, so they decorate entries rather than creating them.
  for (const [id, facts] of Object.entries(catalogue)) {
    const entry = index.get(id);
    if (entry === undefined) continue;
    entry.year = facts.year;
    entry.developer = facts.developer;
    entry.genres = facts.genres;
  }

  return index;
}

const INDEX = buildIndex();

/** Every game we know about, best first for an empty query. */
export const allGames = (): GameSummary[] =>
  [...INDEX.values()].sort((a, b) => a.title.localeCompare(b.title));

export const gameByTitle = (title: string): GameSummary | undefined =>
  INDEX.get(titleKey(title));

/**
 * Search the catalogue.
 *
 * Ranked so that typing "bal" puts Balatro and Baldur's Gate 3 above a game
 * that merely contains those letters. A substring match is enough for 15
 * games; IGDB does its own ranking and this local branch goes away.
 */
export async function searchGames(query: string): Promise<GameSummary[]> {
  const q = titleKey(query);
  if (q === '') return allGames();

  const scored: { game: GameSummary; rank: number }[] = [];
  for (const game of INDEX.values()) {
    const key = game.id;
    const rank = key === q ? 0 : key.startsWith(q) ? 1 : key.includes(q) ? 2 : -1;
    if (rank >= 0) scored.push({ game, rank });
  }

  return scored
    .sort((a, b) => a.rank - b.rank || a.game.title.localeCompare(b.game.title))
    .map((s) => s.game);
}
