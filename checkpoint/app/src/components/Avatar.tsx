import { Text, View } from 'react-native';

type Props = { initials: string; tint: string; size?: number };

export function Avatar({ initials, tint, size = 38 }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.33, fontWeight: '600', color: '#E4E9EE' }}>
        {initials}
      </Text>
    </View>
  );
}
