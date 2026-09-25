import { Pressable, Text, View } from 'react-native';
import { color } from '../theme';

type Props = { label: string; onPress?: () => void; muted?: boolean };

/** The "Go to game ›" affordance. Two of these sit side by side. */
export function LinkRow({ label, onPress, muted }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: muted === true ? color.textFaint : color.text,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 15, color: muted === true ? color.textFaint : color.star }}>›</Text>
    </Pressable>
  );
}
