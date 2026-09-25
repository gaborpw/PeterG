import { View } from 'react-native';
import { Avatar } from './Avatar';
import { color } from '../theme';

const FACES = [
  { initials: 'MK', tint: '#2E4640' },
  { initials: 'DA', tint: '#3A3346' },
  { initials: 'SR', tint: '#46342E' },
  { initials: 'RL', tint: '#2E3A46' },
  { initials: 'JT', tint: '#453040' },
] as const;

/** Overlapping faces, the way every social app signals "people did this". */
export function AvatarPile({ count = 5, size = 32 }: { count?: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {FACES.slice(0, count).map((f, i) => (
        <View
          key={f.initials}
          style={{
            marginLeft: i === 0 ? 0 : -size * 0.34,
            borderRadius: size,
            borderWidth: 2,
            borderColor: color.bg,
          }}
        >
          <Avatar initials={f.initials} tint={f.tint} size={size} />
        </View>
      ))}
    </View>
  );
}
