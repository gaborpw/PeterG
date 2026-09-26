import { Text, View } from 'react-native';
import { color } from '../theme';

/**
 * Two weeks of sessions as fourteen bars.
 *
 * The point is not the hours, it is the gaps. A game you meant to keep playing
 * and have not opened in nine days looks exactly like that here, which is the
 * thing a backlog app should be telling you and the thing a total never can:
 * 40h reads the same whether you played it last night or last spring.
 */
export function Sparkline({ days }: { days: number[] }) {
  const peak = Math.max(...days, 1);
  const played = days.filter((h) => h > 0).length;

  if (played === 0) {
    return (
      <Text style={{ fontSize: 10.5, color: color.textFaint }}>no sessions in two weeks</Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16 }}>
      {days.map((hours, i) => (
        <View
          key={i}
          style={{
            width: 4,
            // A day with nothing keeps a sliver, so the row reads as two weeks
            // of days rather than a handful of floating bars.
            height: hours === 0 ? 2 : Math.max(4, (hours / peak) * 16),
            borderRadius: 1,
            backgroundColor: hours === 0 ? color.border : color.active,
          }}
        />
      ))}
    </View>
  );
}

/**
 * Bucket sessions into the last fourteen days, oldest first.
 *
 * Indexed by how many days ago, so today is always the rightmost bar however
 * sparse the history is.
 */
export function toDays(
  sessions: { playedOn: string; hours: number }[],
  daysAgoOf: (iso: string) => number,
): number[] {
  const days = new Array<number>(14).fill(0);
  for (const s of sessions) {
    const ago = daysAgoOf(s.playedOn);
    if (ago >= 0 && ago < 14) days[13 - ago] += s.hours;
  }
  return days;
}
