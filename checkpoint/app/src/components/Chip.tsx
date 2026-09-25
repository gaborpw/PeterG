import { Text, View } from 'react-native';
import { color, radius } from '../theme';

type Props = {
  label: string;
  tone?: 'neutral' | 'active' | 'warm';
};

export function Chip({ label, tone = 'neutral' }: Props) {
  const bg =
    tone === 'active' ? '#223026' : tone === 'warm' ? '#2E211E' : color.surface2;
  const fg =
    tone === 'active' ? '#8FCBA8' : tone === 'warm' ? '#D99C8B' : color.textDim;

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radius.pill,
        backgroundColor: bg,
      }}
    >
      <Text style={{ fontSize: 10.5, color: fg }}>{label}</Text>
    </View>
  );
}
