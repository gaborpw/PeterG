/**
 * "Today", "Yesterday", a weekday, then a date.
 *
 * Parsed as local midnight rather than handed to Date(string), which reads a
 * bare YYYY-MM-DD as UTC and so shows "Yesterday" to anyone west of Greenwich
 * — which is everyone using this.
 */
export function friendlyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) return iso;

  const when = new Date(y, m - 1, d);
  const today = new Date();
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((midnight.getTime() - when.getTime()) / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return when.toLocaleDateString(undefined, { weekday: 'long' });
  return when.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** How many days ago, for "this week" style questions. Negative means future. */
export function daysAgo(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  if (y === undefined || m === undefined || d === undefined) return Number.MAX_SAFE_INTEGER;

  const when = new Date(y, m - 1, d);
  const today = new Date();
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((midnight.getTime() - when.getTime()) / 86400000);
}
