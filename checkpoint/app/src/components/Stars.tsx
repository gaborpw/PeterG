import { Text, View } from 'react-native';
import { color } from '../theme';

type Props = { value: number; size?: number };

/**
 * Five stars in half-star steps — the 10-bucket scale from docs/spec.md 3.3.
 *
 * A partial star is a gold star clipped to a fraction of its width, sitting
 * over a grey one, rather than a gradient or a separate half glyph. That keeps
 * it crisp at every size and means a 4.3 average can be drawn honestly instead
 * of being rounded to the nearest half before it reaches the screen.
 */
export function Stars({ value, size = 13 }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} fill={Math.min(Math.max(value - (n - 1), 0), 1)} size={size} />
      ))}
    </View>
  );
}

function Star({ fill, size }: { fill: number; size: number }) {
  // The glyph is a touch narrower than its font size; the box matches the
  // glyph so five of them sit evenly rather than drifting apart.
  const box = size * 0.94;

  const glyph = (tone: string) => (
    <Text
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: size,
        fontSize: size,
        lineHeight: size * 1.16,
        color: tone,
      }}
    >
      ★
    </Text>
  );

  return (
    <View style={{ width: box, height: size * 1.16 }}>
      {glyph(color.starEmpty)}
      {fill > 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: size * fill,
            height: size * 1.16,
            overflow: 'hidden',
          }}
        >
          {glyph(color.star)}
        </View>
      )}
    </View>
  );
}
