import { View } from 'react-native';
import { color } from '../theme';

type Props = { value: number; size?: number };

/**
 * Five stars in half-star steps — the 10-bucket scale from docs/spec.md 3.3.
 * A half is drawn as two clipped halves rather than a gradient, which keeps it
 * crisp at every size.
 */
export function Stars({ value, size = 13 }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.min(Math.max(value - (n - 1), 0), 1);
        return <Star key={n} fill={fill} size={size} />;
      })}
    </View>
  );
}

function Star({ fill, size }: { fill: number; size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color.starEmpty,
        }}
      />
      {fill > 0 && (
        <View
          style={{
            position: 'absolute',
            width: size * fill,
            height: size,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color.star,
            }}
          />
        </View>
      )}
    </View>
  );
}
