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
  platform: string;
  status: Status;
  hours: number;
  /** ISO date the playthrough started. */
  startedAt?: string;
  lastPlayed?: string;
  rating?: number;
  liked?: boolean;
  droppedAtHour?: number;
};

export type FriendActivity = {
  id: string;
  who: string;
  initials: string;
  tint: string;
  title: string;
  coverUrl?: string;
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
    title: 'Elden Ring',
    platform: 'PS5',
    status: 'playing',
    hours: 47,
    startedAt: '12 Aug',
    lastPlayed: 'Sunday',
  },
  {
    id: 'p2',
    title: 'Balatro',
    platform: 'Switch',
    status: 'ongoing',
    hours: 63,
    lastPlayed: 'today',
  },
];

/** Backlog and finished, so Library's segments have something in them. */
export const backlog: Playthrough[] = [
  { id: 'b1', title: 'Blue Prince', platform: 'PC', status: 'backlog', hours: 0 },
  { id: 'b2', title: 'Pentiment', platform: 'Xbox', status: 'backlog', hours: 0 },
  { id: 'b3', title: 'Citizen Sleeper 2', platform: 'Switch', status: 'backlog', hours: 0 },
  { id: 'b4', title: 'Signalis', platform: 'PC', status: 'backlog', hours: 0 },
];

export const finished: Playthrough[] = [
  { id: 'd1', title: 'Outer Wilds', platform: 'PC', status: 'finished', hours: 27, rating: 5, liked: true },
  { id: 'd2', title: 'Disco Elysium', platform: 'PC', status: 'finished', hours: 41, rating: 5, liked: true },
  { id: 'd3', title: 'Return of the Obra Dinn', platform: 'Switch', status: 'finished', hours: 9, rating: 4.5 },
  { id: 'd4', title: 'Starfield', platform: 'PC', status: 'abandoned', hours: 9, rating: 2, droppedAtHour: 9 },
];

export const friendsPlaying: FriendActivity[] = [
  { id: 'f1', who: 'Mia', initials: 'MK', tint: '#2E4640', title: 'Hollow Knight: Silksong', platform: 'Switch 2', hours: 12, lastSession: '2h yesterday' },
  { id: 'f2', who: 'Dev', initials: 'DA', tint: '#3A3346', title: "Baldur's Gate 3", platform: 'PC', hours: 71, lastSession: '4h today' },
  { id: 'f3', who: 'Sam', initials: 'SR', tint: '#46342E', title: 'Hades II', platform: 'PC', hours: 26, lastSession: '1h today' },
  { id: 'f4', who: 'Rae', initials: 'RL', tint: '#2E3A46', title: 'Metaphor: ReFantazio', platform: 'PS5', hours: 38, lastSession: '3h Sunday' },
  { id: 'f5', who: 'Jon', initials: 'JT', tint: '#2E3A46', title: 'Elden Ring', platform: 'PS5', hours: 31, lastSession: '2h Saturday' },
];

export const feed: FeedEntry[] = [
  {
    id: 'e1',
    who: 'Mia', initials: 'MK', tint: '#2E4640',
    verb: 'finished', title: 'Elden Ring',
    hours: 112, rating: 5, liked: true,
    tags: ['6 weeks', 'PS5', '100%'],
    review: 'The last stretch asks you to be a different player than the one who started, and somehow you already are.',
    when: '2h ago',
  },
  {
    id: 'e2',
    who: 'Dev', initials: 'DA', tint: '#3A3346',
    verb: 'gave up on', title: 'Starfield',
    hours: 9, rating: 2,
    tags: ['dropped at 9h', 'bored'],
    review: 'Nine hours and every planet was the same three rocks.',
    when: 'Yesterday',
  },
  {
    id: 'e3',
    who: 'Rae', initials: 'RL', tint: '#2E3A46',
    verb: 'finished', title: 'Blue Prince',
    hours: 34, rating: 4.5,
    tags: ['PC', 'no review'],
    when: 'Sunday',
  },
];

export type PopularGame = {
  id: string;
  title: string;
  coverUrl?: string;
  avgRating: number;
  /** People who logged a session this week. */
  playersThisWeek: string;
};

/** Popular this week, across everyone. The home screen's first row. */
export const popularThisWeek: PopularGame[] = [
  { id: 'g1', title: 'Hollow Knight: Silksong', avgRating: 4.6, playersThisWeek: '18.2k' },
  { id: 'g2', title: 'Elden Ring', avgRating: 4.4, playersThisWeek: '14.9k' },
  { id: 'g3', title: 'Blue Prince', avgRating: 4.3, playersThisWeek: '11.4k' },
  { id: 'g4', title: 'Baldur\u2019s Gate 3', avgRating: 4.7, playersThisWeek: '9.8k' },
  { id: 'g5', title: 'Metaphor: ReFantazio', avgRating: 4.2, playersThisWeek: '7.1k' },
  { id: 'g6', title: 'Hades II', avgRating: 4.5, playersThisWeek: '6.6k' },
  { id: 'g7', title: 'Balatro', avgRating: 4.4, playersThisWeek: '5.9k' },
];

export type CommunityReview = {
  id: string;
  who: string;
  initials: string;
  tint: string;
  title: string;
  coverUrl?: string;
  rating: number;
  liked: boolean;
  /** How far in they were — drives the spoiler gate. */
  context: string;
  body: string;
  likes: number;
  comments: number;
};

/** Popular reviews across everyone. Home's third row. */
export const popularReviews: CommunityReview[] = [
  {
    id: 'r1',
    who: 'Nadia', initials: 'NV', tint: '#3A3346',
    title: 'Hollow Knight: Silksong',
    rating: 4.5, liked: true, context: 'finished · 41h',
    body: 'Every boss taught me something I did not know I was being taught. The difficulty is not cruelty, it is tuition.',
    likes: 842, comments: 63,
  },
  {
    id: 'r2',
    who: 'Theo', initials: 'TM', tint: '#46342E',
    title: 'Blue Prince',
    rating: 5, liked: true, context: '100% · 34h',
    body: 'I have not taken notes on paper for a game since I was twelve. Three pages in and I understood what it wanted from me.',
    likes: 611, comments: 94,
  },
  {
    id: 'r3',
    who: 'Iris', initials: 'IK', tint: '#2E4640',
    title: 'Metaphor: ReFantazio',
    rating: 4, liked: false, context: 'dropped at 22h',
    body: 'Beautiful, and I bounced. The calendar pressure turned a fantasy into a scheduling problem I already have at work.',
    likes: 508, comments: 121,
  },
];

/** Aggregates for the game page. Computed server-side in the real thing. */
export const gameStats = {
  title: 'Elden Ring',
  coverUrl: undefined as string | undefined,
  year: 2022,
  developer: 'FromSoftware',
  medianHours: 94,
  avgRating: 4.4,
  ratingCount: '128k',
  finishRate: 58,
  playthroughs: '41,204',
  funnel: [
    { label: 'Started', pct: 100 },
    { label: 'Past 5h', pct: 82 },
    { label: 'Past 20h', pct: 64 },
    { label: 'Finished', pct: 58 },
  ],
};

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
