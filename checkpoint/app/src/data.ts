// Sample data standing in for the API. Shapes mirror docs/spec.md section 4, so
// swapping this for real fetches does not move the screens around.

export type Status = 'playing' | 'finished' | 'paused' | 'abandoned' | 'ongoing';

export type Playthrough = {
  id: string;
  title: string;
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

/** Aggregates for the game page. Computed server-side in the real thing. */
export const gameStats = {
  title: 'Elden Ring',
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

export const profile = {
  name: 'Peter G',
  handle: '@peterg',
  bio: 'Long RPGs, short roguelikes, no patience for tutorials.',
  logged: 412,
  finished: 58,
  finishRate: 41,
  allTimeHours: '3,190',
};
