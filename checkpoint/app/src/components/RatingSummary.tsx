import { Text, View } from 'react-native';
import { Stars } from './Stars';
import type { GameAggregate } from '../data';
import { color, radius } from '../theme';

/**
 * The ratings block on a game page — histogram, average, count.
 *
 * Modelled on Letterboxd's, and it earns the space for the reason theirs does:
 * the shape of the ratings says something an average cannot. A game rated four
 * by everyone and a game half the room adores and half the room resents land
 * on similar averages and are not remotely the same game. The bars show which
 * one you are looking at.
 *
 * Bars are scaled against the tallest bucket rather than the total, so a
 * modest sample still reads as a shape instead of ten identical stubs.
 */
export function RatingSummary({ agg, label = 'RATINGS' }: { agg: GameAggregate; label?: string }) {
  const peak = Math.max(...agg.distribution, 1);

  return (
    <View
      style={{
        padding: 14,
        borderRadius: radius.lg,
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <Text style={{ fontSize: 9.5, letterSpacing: 0.9, color: color.textFaint }}>{label}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 54 }}>
            {agg.distribution.map((count, i) => (
              <View key={i} style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View
                  style={{
                    // A bucket with nothing in it keeps a sliver so the axis
                    // reads as a scale rather than a gap.
                    height: count === 0 ? 2 : Math.max(4, (count / peak) * 54),
                    borderRadius: 2,
                    backgroundColor: count === 0 ? color.border : color.star,
                    opacity: count === 0 ? 1 : 0.55 + (count / peak) * 0.45,
                  }}
                />
              </View>
            ))}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 7,
            }}
          >
            <Stars value={0.5} size={10} />
            <Stars value={5} size={10} />
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', minWidth: 74 }}>
          {agg.avgRating === undefined ? (
            <Text style={{ fontSize: 13, color: color.textFaint }}>Not rated</Text>
          ) : (
            <>
              <Text style={{ fontSize: 34, fontWeight: '700', color: color.text, lineHeight: 38 }}>
                {agg.avgRating.toFixed(1)}
              </Text>
              <Stars value={agg.avgRating} size={11} />
              <Text style={{ fontSize: 10.5, color: color.textFaint, marginTop: 5 }}>
                {agg.ratings} {agg.ratings === 1 ? 'rating' : 'ratings'}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
