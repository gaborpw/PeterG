// Sample data standing in for the API. Shapes mirror docs/spec.md section 4, so
// swapping this for real fetches does not move the screens around.

/**
 * The seven playthrough states. Mirrors the playthrough_status enum in
 * api/migrations/0001_init.sql — keep them in step.
 */
export type Status =
  | 'wishlist'
  | 'backlog'
  | 'playing'
  | 'paused'
  | 'finished'
  | 'abandoned'
  | 'ongoing';

export type Playthrough = {
  id: string;
  title: string;
  /** Remote cover art. Filled by the IGDB mirror; undefined falls back. */
  coverUrl?: string;
  /** Wide atmospheric art, for screen headers. Optional everywhere. */
  backdropUrl?: string;
  platform: string;
  status: Status;
  hours: number;
  /** ISO date the playthrough started. */
  startedAt?: string;
  lastPlayed?: string;
  rating?: number;
  liked?: boolean;
  droppedAtHour?: number;
  /** The review you wrote on this playthrough, if any. */
  review?: string;
};

export type FriendActivity = {
  id: string;
  who: string;
  initials: string;
  tint: string;
  title: string;
  coverUrl?: string;
  backdropUrl?: string;
  platform: string;
  hours: number;
  lastSession: string;
};

export type FeedEntry = {
  id: string;
  who: string;
  initials: string;
  tint: string;
  verb: 'finished' | 'gave up on';
  title: string;
  coverUrl?: string;
  backdropUrl?: string;
  hours: number;
  rating: number;
  liked?: boolean;
  tags: string[];
  review?: string;
  when: string;
};

export const mine: Playthrough[] = [
  {
    id: 'p1',
    title: 'Elden Ring', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg',
    platform: 'PS5',
    status: 'playing',
    hours: 47,
    startedAt: '12 Aug',
    lastPlayed: 'Sunday',
  },
  {
    id: 'p2',
    title: 'Balatro', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/library_hero.jpg',
    platform: 'Switch',
    status: 'ongoing',
    hours: 63,
    lastPlayed: 'today',
  },
];

/** Backlog and finished, so Library's segments have something in them. */
export const backlog: Playthrough[] = [
  { id: 'b1', title: 'Blue Prince', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1569580/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1569580/library_hero.jpg', platform: 'PC', status: 'backlog', hours: 0 },
  { id: 'b2', title: 'Pentiment', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1205520/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1205520/library_hero.jpg', platform: 'Xbox', status: 'backlog', hours: 0 },
  { id: 'b3', title: 'Citizen Sleeper 2', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2442460/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2442460/library_hero.jpg', platform: 'Switch', status: 'backlog', hours: 0 },
  { id: 'b4', title: 'Signalis', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1262350/library_hero.jpg', platform: 'PC', status: 'backlog', hours: 0 },
];

export const finished: Playthrough[] = [
  { id: 'd1', title: 'Outer Wilds', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/753640/library_hero.jpg', platform: 'PC', status: 'finished', hours: 27, rating: 5, liked: true },
  { id: 'd2', title: 'Disco Elysium', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/632470/library_hero.jpg', platform: 'PC', status: 'finished', hours: 41, rating: 5, liked: true },
  { id: 'd3', title: 'Return of the Obra Dinn', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/653530/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/653530/library_hero.jpg', platform: 'Switch', status: 'finished', hours: 9, rating: 4.5 },
  { id: 'd4', title: 'Starfield', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/library_hero.jpg', platform: 'PC', status: 'abandoned', hours: 9, rating: 2, droppedAtHour: 9 },
];

export const friendsPlaying: FriendActivity[] = [
  { id: 'f1', who: 'Mia', initials: 'MK', tint: '#2E4640', title: 'Hollow Knight: Silksong', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/library_hero.jpg', platform: 'Switch 2', hours: 12, lastSession: '2h yesterday' },
  { id: 'f2', who: 'Dev', initials: 'DA', tint: '#3A3346', title: "Baldur's Gate 3", coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_hero.jpg', platform: 'PC', hours: 71, lastSession: '4h today' },
  { id: 'f3', who: 'Sam', initials: 'SR', tint: '#46342E', title: 'Hades II', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/library_hero.jpg', platform: 'PC', hours: 26, lastSession: '1h today' },
  { id: 'f4', who: 'Rae', initials: 'RL', tint: '#2E3A46', title: 'Metaphor: ReFantazio', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2679460/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2679460/library_hero.jpg', platform: 'PS5', hours: 38, lastSession: '3h Sunday' },
  { id: 'f5', who: 'Jon', initials: 'JT', tint: '#2E3A46', title: 'Elden Ring', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg', platform: 'PS5', hours: 31, lastSession: '2h Saturday' },
];

export const feed: FeedEntry[] = [
  {
    id: 'e1',
    who: 'Mia', initials: 'MK', tint: '#2E4640',
    verb: 'finished', title: 'Elden Ring', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg',
    hours: 112, rating: 5, liked: true,
    tags: ['6 weeks', 'PS5', '100%'],
    review: 'The last stretch asks you to be a different player than the one who started, and somehow you already are.',
    when: '2h ago',
  },
  {
    id: 'e2',
    who: 'Dev', initials: 'DA', tint: '#3A3346',
    verb: 'gave up on', title: 'Starfield', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/library_hero.jpg',
    hours: 9, rating: 2,
    tags: ['dropped at 9h', 'bored'],
    review: 'Nine hours and every planet was the same three rocks.',
    when: 'Yesterday',
  },
  {
    id: 'e3',
    who: 'Rae', initials: 'RL', tint: '#2E3A46',
    verb: 'finished', title: 'Blue Prince', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1569580/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1569580/library_hero.jpg',
    hours: 34, rating: 4.5,
    tags: ['PC', 'no review'],
    when: 'Sunday',
  },
];

export type PopularGame = {
  id: string;
  title: string;
  coverUrl?: string;
  backdropUrl?: string;
  avgRating: number;
  /** People who logged a session this week. */
  playersThisWeek: string;
};

/** Popular this week, across everyone. The home screen's first row. */
export const popularThisWeek: PopularGame[] = [
  { id: 'g1', title: 'Hollow Knight: Silksong', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/library_hero.jpg', avgRating: 4.6, playersThisWeek: '18.2k' },
  { id: 'g2', title: 'Elden Ring', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg', avgRating: 4.4, playersThisWeek: '14.9k' },
  { id: 'g3', title: 'Blue Prince', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1569580/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1569580/library_hero.jpg', avgRating: 4.3, playersThisWeek: '11.4k' },
  { id: 'g4', title: "Baldur's Gate 3", coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_hero.jpg', avgRating: 4.7, playersThisWeek: '9.8k' },
  { id: 'g5', title: 'Metaphor: ReFantazio', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2679460/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2679460/library_hero.jpg', avgRating: 4.2, playersThisWeek: '7.1k' },
  { id: 'g6', title: 'Hades II', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/library_hero.jpg', avgRating: 4.5, playersThisWeek: '6.6k' },
  { id: 'g7', title: 'Balatro', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/library_hero.jpg', avgRating: 4.4, playersThisWeek: '5.9k' },
];

/**
 * Someone else's log of a game. "Review" means the whole entry — status,
 * hours, rating and optionally words — not just the prose. An entry with no
 * text is still a review; plenty of people rate without writing.
 */
export type CommunityReview = {
  id: string;
  who: string;
  initials: string;
  tint: string;
  title: string;
  coverUrl?: string;
  backdropUrl?: string;
  /** When they logged it. Serializd gives this real prominence and it earns it. */
  loggedOn: string;
  rating: number;
  liked: boolean;
  status: Status;
  hours: number;
  /** How far in they were — drives the spoiler gate. */
  context: string;
  /** Optional. An entry with a rating and no words is still an entry. */
  body?: string;
  likes: number;
  comments: number;
};

/** Popular reviews across everyone. Home's third row. */
export const popularReviews: CommunityReview[] = [
  {
    id: 'r1', loggedOn: '24 Sep 2026',
    who: 'Nadia', initials: 'NV', tint: '#3A3346',
    title: 'Hollow Knight: Silksong', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/library_hero.jpg',
    rating: 4.5, liked: true, status: 'finished', hours: 41, context: 'finished · 41h',
    body: 'Every boss taught me something I did not know I was being taught. The difficulty is not cruelty, it is tuition.',
    likes: 842, comments: 63,
  },
  {
    id: 'r2', loggedOn: '22 Sep 2026',
    who: 'Theo', initials: 'TM', tint: '#46342E',
    title: 'Blue Prince', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1569580/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1569580/library_hero.jpg',
    rating: 5, liked: true, status: 'finished', hours: 34, context: '100% · 34h',
    body: 'I have not taken notes on paper for a game since I was twelve. Three pages in and I understood what it wanted from me.',
    likes: 611, comments: 94,
  },
  {
    id: 'r3', loggedOn: '19 Sep 2026',
    who: 'Iris', initials: 'IK', tint: '#2E4640',
    title: 'Metaphor: ReFantazio', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2679460/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2679460/library_hero.jpg',
    rating: 4, liked: false, status: 'abandoned', hours: 22, context: 'dropped at 22h',
    body: 'Beautiful, and I bounced. The calendar pressure turned a fantasy into a scheduling problem I already have at work.',
    likes: 508, comments: 121,
  },
  {
    id: 'r4', loggedOn: '25 Sep 2026',
    who: 'Owen', initials: 'OB', tint: '#2E3A46',
    title: 'Balatro', coverUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/library_600x900.jpg', backdropUrl: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2379780/library_hero.jpg',
    rating: 4.5, liked: true, status: 'ongoing', hours: 63,
    context: 'ongoing · 63h',
    likes: 297, comments: 12,
  },
];

/**
 * Release year, studio and genres per game.
 *
 * These are facts about the games, not invented aggregates, but they are typed
 * in by hand and have not been checked against a source — IGDB replaces this
 * whole table and is the point at which they become trustworthy. A title that
 * is missing here renders without the byline rather than borrowing another
 * game's, which is what the page used to do.
 */
export type GameFacts = {
  year: number;
  developer: string;
  genres: string[];
};

export const catalogue: Record<string, GameFacts> = {
  'elden ring': { year: 2022, developer: 'FromSoftware', genres: ['Action RPG', 'Open world'] },
  balatro: { year: 2024, developer: 'LocalThunk', genres: ['Deckbuilder', 'Roguelike'] },
  'blue prince': { year: 2025, developer: 'Dogubomb', genres: ['Puzzle', 'Roguelite'] },
  pentiment: { year: 2022, developer: 'Obsidian Entertainment', genres: ['Adventure', 'Narrative'] },
  'citizen sleeper 2': { year: 2025, developer: 'Jump Over The Age', genres: ['RPG', 'Narrative'] },
  signalis: { year: 2022, developer: 'rose-engine', genres: ['Survival horror'] },
  'outer wilds': { year: 2019, developer: 'Mobius Digital', genres: ['Exploration', 'Mystery'] },
  'disco elysium': { year: 2019, developer: 'ZA/UM', genres: ['RPG', 'Narrative'] },
  'return of the obra dinn': { year: 2018, developer: 'Lucas Pope', genres: ['Puzzle', 'Mystery'] },
  starfield: { year: 2023, developer: 'Bethesda Game Studios', genres: ['Action RPG', 'Space'] },
  'hollow knight silksong': { year: 2025, developer: 'Team Cherry', genres: ['Metroidvania', 'Action'] },
  'baldurs gate 3': { year: 2023, developer: 'Larian Studios', genres: ['CRPG', 'Turn-based'] },
  'hades ii': { year: 2025, developer: 'Supergiant Games', genres: ['Roguelike', 'Action'] },
  'metaphor refantazio': { year: 2024, developer: 'Atlus', genres: ['JRPG', 'Turn-based'] },
  'dark souls': { year: 2011, developer: 'FromSoftware', genres: ['Action RPG'] },
};

/**
 * Titles are compared normalised, so "Baldur's Gate 3" and "Baldur\u2019s Gate 3"
 * are one game. Typographic apostrophes coming from a real catalogue make this
 * load-bearing rather than defensive.
 */
export const titleKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const factsFor = (title: string): GameFacts | undefined =>
  catalogue[titleKey(title)];

/** The parts of a log the game page aggregates over, from anyone. */
export type KnownLog = {
  title: string;
  status: Status;
  hours: number;
  rating?: number;
};

/**
 * Extra sample logs for games the screens link to.
 *
 * Fixtures, not measurements. They exist so the game page has a realistic
 * spread to aggregate over before real accounts do — but every number on that
 * page is computed from these by aggregateFor, never written down as a
 * headline. That is the whole difference from the hardcoded block this
 * replaced, which showed one game's totals on every game. Delete this once the
 * API serves real aggregates.
 */
const seedLogs: KnownLog[] = ([
  ['Elden Ring', 'paused', 31],
  ['Elden Ring', 'backlog', 0],
  ['Elden Ring', 'finished', 107, 4.5],
  ['Elden Ring', 'finished', 86, 4.5],
  ['Elden Ring', 'finished', 106, 4.0],
  ['Elden Ring', 'finished', 107],
  ['Elden Ring', 'finished', 106],
  ['Blue Prince', 'finished', 27, 4.0],
  ['Blue Prince', 'backlog', 0],
  ['Blue Prince', 'finished', 37, 4.0],
  ['Blue Prince', 'finished', 26],
  ['Blue Prince', 'backlog', 0],
  ['Blue Prince', 'finished', 31, 5],
  ['Blue Prince', 'finished', 31, 4.5],
  ['Blue Prince', 'abandoned', 9, 3.0],
  ['Balatro', 'abandoned', 31],
  ['Balatro', 'backlog', 0],
  ['Balatro', 'ongoing', 49, 5],
  ['Balatro', 'ongoing', 87, 4.5],
  ['Balatro', 'abandoned', 23, 3.0],
  ['Balatro', 'ongoing', 121, 4.0],
  ['Balatro', 'ongoing', 41, 3.5],
  ['Balatro', 'ongoing', 61, 3.0],
  ["Baldur's Gate 3", 'finished', 116],
  ["Baldur's Gate 3", 'finished', 87, 5],
  ["Baldur's Gate 3", 'finished', 145],
  ["Baldur's Gate 3", 'finished', 122, 5],
  ["Baldur's Gate 3", 'paused', 59, 4.5],
  ["Baldur's Gate 3", 'paused', 64],
  ["Baldur's Gate 3", 'finished', 99, 5],
  ['Hollow Knight: Silksong', 'paused', 10, 5],
  ['Hollow Knight: Silksong', 'abandoned', 7],
  ['Hollow Knight: Silksong', 'paused', 24, 5],
  ['Hollow Knight: Silksong', 'backlog', 0],
  ['Hollow Knight: Silksong', 'finished', 55, 4.5],
  ['Hollow Knight: Silksong', 'finished', 42, 4.0],
  ['Hollow Knight: Silksong', 'finished', 37, 4.5],
  ['Hollow Knight: Silksong', 'abandoned', 4, 3.5],
  ['Hades II', 'playing', 22],
  ['Hades II', 'finished', 38, 5],
  ['Hades II', 'abandoned', 4, 3.0],
  ['Hades II', 'playing', 19, 5],
  ['Hades II', 'playing', 19, 5],
  ['Metaphor: ReFantazio', 'finished', 112, 4.0],
  ['Metaphor: ReFantazio', 'backlog', 0],
  ['Metaphor: ReFantazio', 'finished', 96],
  ['Metaphor: ReFantazio', 'paused', 31, 3.0],
  ['Metaphor: ReFantazio', 'finished', 73, 3.5],
  ['Outer Wilds', 'backlog', 0],
  ['Outer Wilds', 'backlog', 0],
  ['Outer Wilds', 'abandoned', 3, 3.5],
  ['Outer Wilds', 'finished', 18],
  ['Outer Wilds', 'finished', 22, 5],
  ['Outer Wilds', 'paused', 14, 4.5],
  ['Disco Elysium', 'finished', 29, 4.5],
  ['Disco Elysium', 'paused', 15],
  ['Disco Elysium', 'backlog', 0],
  ['Disco Elysium', 'finished', 42, 5],
  ['Disco Elysium', 'finished', 36, 5],
  ['Disco Elysium', 'finished', 42],
  ['Disco Elysium', 'paused', 17, 5],
  ['Return of the Obra Dinn', 'finished', 8],
  ['Return of the Obra Dinn', 'finished', 12, 5],
  ['Return of the Obra Dinn', 'backlog', 0],
  ['Return of the Obra Dinn', 'finished', 9, 5],
  ['Return of the Obra Dinn', 'finished', 7, 4.0],
  ['Starfield', 'abandoned', 11, 1.5],
  ['Starfield', 'finished', 26, 3.0],
  ['Starfield', 'finished', 29],
  ['Starfield', 'playing', 12, 3.5],
  ['Starfield', 'backlog', 0],
  ['Starfield', 'playing', 13, 2.0],
  ['Pentiment', 'backlog', 0],
  ['Pentiment', 'abandoned', 5, 3.0],
  ['Pentiment', 'finished', 14, 4.5],
  ['Pentiment', 'abandoned', 4, 3.0],
  ['Pentiment', 'abandoned', 7],
  ['Citizen Sleeper 2', 'finished', 18, 3.5],
  ['Citizen Sleeper 2', 'backlog', 0],
  ['Citizen Sleeper 2', 'finished', 16, 4.0],
  ['Citizen Sleeper 2', 'finished', 17, 3.5],
  ['Citizen Sleeper 2', 'paused', 7, 4.0],
  ['Citizen Sleeper 2', 'paused', 4, 5],
  ['Signalis', 'finished', 12, 4.0],
  ['Signalis', 'abandoned', 3],
  ['Signalis', 'finished', 10, 5],
  ['Signalis', 'finished', 11],
  ['Signalis', 'finished', 15],
  ['Signalis', 'backlog', 0],
  ['Dark Souls', 'playing', 42],
  ['Dark Souls', 'finished', 65, 4.0],
  ['Dark Souls', 'finished', 57, 5],
  ['Dark Souls', 'finished', 46, 4.5],
  ['Dark Souls', 'abandoned', 15],
  ['Dark Souls', 'playing', 40, 5],
] as [string, Status, number, number?][]).map(([title, status, hours, rating]) => ({
  title,
  status,
  hours,
  rating,
}));

/**
 * Every log the app can currently see from other people. The real version of
 * this is a GROUP BY on the server; keeping the shape identical means the game
 * page does not change when that lands.
 */
export const communityLogs: KnownLog[] = [
  ...seedLogs,
  ...popularReviews.map((r) => ({
    title: r.title,
    status: r.status,
    hours: r.hours,
    rating: r.rating,
  })),
  ...feed.map((e) => ({
    title: e.title,
    status: (e.verb === 'finished' ? 'finished' : 'abandoned') as Status,
    hours: e.hours,
    rating: e.rating,
  })),
  ...friendsPlaying.map((f) => ({
    title: f.title,
    status: 'playing' as Status,
    hours: f.hours,
  })),
];

export type GameAggregate = {
  /** How many logs these numbers are drawn from. Shown, never hidden. */
  logs: number;
  ratings: number;
  avgRating?: number;
  medianHours?: number;
  /**
   * Absent when the game has no ending to reach. A roguelike sitting at "0%
   * finished" reads as a game people fail at, rather than one with nothing to
   * fail at — true arithmetic, wrong claim.
   */
  finishRate?: number;
  /** The number that replaces it: share of logs still in progress. */
  stillPlaying?: number;
  /** Nobody has finished it and people log it as ongoing. See above. */
  endless: boolean;
  funnel?: { label: string; pct: number }[];
};

/** Below this the percentages say more about the sample than the game. */
const FUNNEL_MIN_LOGS = 4;

/**
 * Aggregate every known log of one game.
 *
 * Each field is absent rather than zero when nothing supports it, so a game
 * nobody has logged renders an empty state instead of a confident number. The
 * counts are deliberately on screen: "4.5 from 3 logs" is honest in a way that
 * a bare 4.5 is not.
 */
export function aggregateFor(title: string, own: KnownLog[] = []): GameAggregate {
  const key = titleKey(title);
  const logs = [...communityLogs, ...own].filter((l) => titleKey(l.title) === key);

  if (logs.length === 0) return { logs: 0, ratings: 0, endless: false };

  const rated = logs.filter((l) => typeof l.rating === 'number');
  const avgRating =
    rated.length > 0
      ? rated.reduce((a, l) => a + (l.rating ?? 0), 0) / rated.length
      : undefined;

  // Hours only mean something once someone has actually played.
  const played = logs.filter((l) => l.hours > 0).map((l) => l.hours).sort((a, b) => a - b);
  const medianHours =
    played.length > 0
      ? played.length % 2 === 1
        ? played[(played.length - 1) / 2]
        : Math.round((played[played.length / 2 - 1] + played[played.length / 2]) / 2)
      : undefined;

  const finished = logs.filter((l) => l.status === 'finished').length;
  const ongoing = logs.filter((l) => l.status === 'ongoing').length;
  const pct = (n: number) => Math.round((n / logs.length) * 100);

  // Derived, not curated: a game nobody has finished that people keep logging
  // as ongoing is one without an ending. IGDB has no flag for this, and 200k
  // games is too many to mark by hand, so the logs have to say it.
  const endless = finished === 0 && ongoing > 0;

  return {
    logs: logs.length,
    ratings: rated.length,
    avgRating,
    medianHours,
    endless,
    finishRate: endless ? undefined : pct(finished),
    stillPlaying: endless
      ? pct(logs.filter((l) => l.status === 'playing' || l.status === 'ongoing').length)
      : undefined,
    // Thresholds scale to the game. Fixed 5h/20h buckets put "past 20h" below
    // "finished" on anything short, which is true and reads as a broken chart.
    funnel:
      logs.length >= FUNNEL_MIN_LOGS && medianHours !== undefined
        ? (() => {
            const early = Math.max(2, Math.round(medianHours * 0.25));
            const late = Math.max(early + 1, Math.round(medianHours * 0.75));
            const tier = (h: number) => pct(logs.filter((l) => l.hours >= h).length);
            return [
              { label: 'Started', pct: 100 },
              { label: `Past ${early}h`, pct: tier(early) },
              { label: `Past ${late}h`, pct: tier(late) },
              // Without an ending, "how far people get" is just how long they
              // stay, so the last rung is another hour tier rather than a
              // Finished bar that would always read zero.
              endless
                ? { label: `Past ${medianHours * 2}h`, pct: tier(medianHours * 2) }
                : { label: 'Finished', pct: pct(finished) },
            ];
          })()
        : undefined,
  };
}


/** A review as the game page shows it: somebody's log, with or without words. */
export type GameReview = {
  id: string;
  who: string;
  initials: string;
  tint: string;
  rating?: number;
  status: Status;
  hours: number;
  context: string;
  body?: string;
};

/**
 * Every review of one game.
 *
 * The game page used to render two hardcoded reviews of Elden Ring on whatever
 * you opened, the same mistake the stats block made. Nobody's words should
 * appear under a game they were not written about.
 */
export function reviewsFor(title: string): GameReview[] {
  const key = titleKey(title);

  const fromReviews: GameReview[] = popularReviews
    .filter((r) => titleKey(r.title) === key)
    .map((r) => ({
      id: r.id,
      who: r.who,
      initials: r.initials,
      tint: r.tint,
      rating: r.rating,
      status: r.status,
      hours: r.hours,
      context: r.context,
      body: r.body,
    }));

  const fromFeed: GameReview[] = feed
    .filter((e) => titleKey(e.title) === key)
    .map((e) => ({
      id: e.id,
      who: e.who,
      initials: e.initials,
      tint: e.tint,
      rating: e.rating,
      status: (e.verb === 'finished' ? 'finished' : 'abandoned') as Status,
      hours: e.hours,
      context: e.verb === 'finished' ? `finished · ${e.hours}h` : `dropped at ${e.hours}h`,
      body: e.review,
    }));

  return [...fromReviews, ...fromFeed];
}

/** Games pinned to the profile. Four, always. */
export const favourites = [
  { id: 'fav1', title: 'Outer Wilds' },
  { id: 'fav2', title: 'Disco Elysium' },
  { id: 'fav3', title: 'Return of the Obra Dinn' },
  { id: 'fav4', title: 'Dark Souls' },
] as { id: string; title: string; coverUrl?: string }[];

export const profile = {
  name: 'Peter G',
  handle: '@peterg',
  bio: 'Long RPGs, short roguelikes, no patience for tutorials.',
  logged: 412,
  finished: 58,
  finishRate: 41,
  allTimeHours: '3,190',
};
