import { Text, View } from 'react-native';
import { color, space } from '../theme';

type Props = { title: string; meta?: string };

export function SectionHeading({ title, meta }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingHorizontal: space.xl,
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 1,
          fontWeight: '600',
          color: color.textFaint,
        }}
      >
        {title.toUpperCase()}
      </Text>
      {meta !== undefined && (
        <Text style={{ fontSize: 11, color: color.textFaint }}>{meta}</Text>
      )}
    </View>
  );
}
