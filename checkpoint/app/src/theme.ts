// The design tokens from docs/prototype. Every colour and size in the app comes
// from here so a change lands everywhere at once.

export const color = {
  bg: '#0F1115',
  surface: '#181B21',
  surface2: '#20242C',
  border: '#2A2F39',

  text: '#F2F0EC',
  textDim: '#9BA1AC',
  textFaint: '#7C838F',

  /** Ratings only. */
  star: '#E9A84C',
  /** Active play, live hours, progress. */
  active: '#5CC39A',
  /** Abandonment, drops, the heart. */
  warm: '#C0705F',

  starEmpty: '#3A3F49',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

export const radius = { sm: 8, md: 11, lg: 14, pill: 999 } as const;

export const font = {
  /** Headings and every number. Numerals carry the brand. */
  display: 'System',
  body: 'System',
} as const;

export const type = {
  h1: { fontSize: 25, fontWeight: '700' },
  h2: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 10, letterSpacing: 1, fontWeight: '600' },
  body: { fontSize: 13 },
  small: { fontSize: 11.5 },
  tiny: { fontSize: 10.5 },
} as const;
