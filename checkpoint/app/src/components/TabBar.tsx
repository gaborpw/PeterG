import { Pressable, Text, View } from 'react-native';
import { color } from '../theme';

export type Tab = 'feed' | 'playing' | 'game' | 'profile';

const TABS: { key: Tab; label: string }[] = [
  { key: 'feed', label: 'Feed' },
  { key: 'playing', label: 'Playing' },
  { key: 'game', label: 'Game' },
  { key: 'profile', label: 'Profile' },
];

type Props = { active: Tab; onChange: (t: Tab) => void };

export function TabBar({ active, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: color.surface2,
        backgroundColor: color.bg,
        paddingBottom: 18,
      }}
    >
      {TABS.map((t) => (
        <Pressable
          key={t.key}
          onPress={() => onChange(t.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === t.key }}
          accessibilityLabel={t.label}
          style={{
            flex: 1,
            minHeight: 52,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              borderWidth: 2,
              borderColor: active === t.key ? color.star : color.textFaint,
            }}
          />
          <Text
            style={{
              fontSize: 9.5,
              color: active === t.key ? color.star : color.textFaint,
            }}
          >
            {t.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
