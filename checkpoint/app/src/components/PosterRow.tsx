import { ScrollView, View } from 'react-native';
import { space } from '../theme';

type Props = { children: React.ReactNode };

/**
 * A horizontally scrolling shelf of posters.
 *
 * The screen edge padding lives here rather than on the parent, so the first
 * poster lines up with the headings above it while the last one can still
 * scroll clear of the right edge.
 */
export function PosterRow({ children }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: space.xl, gap: 12 }}
    >
      {children}
      <View style={{ width: 4 }} />
    </ScrollView>
  );
}
