import { Pressable, ScrollView, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { Cover } from '../components/Cover';
import { Stars } from '../components/Stars';
import { popularReviews } from '../data';
import type { EntryScreenProps } from '../navigation';
import { color, radius, space } from '../theme';

const STATUS_LABEL: Record<string, string> = {
  wishlist: 'wants to play',
  backlog: 'has this in their backlog',
  playing: 'is playing',
  paused: 'has paused',
  finished: 'finished',
  abandoned: 'gave up on',
  ongoing: 'keeps coming back to',
};

/**
 * Somebody else's entry. Read-only: you can open the game from here, but the
 * only thing you own on this screen is the like.
 *
 * "Entry" and "review" are the same thing — status, hours, rating, and words
 * if they wrote any. An entry without words is still worth reading.
 */
export function EntryScreen({ route, navigation }: EntryScreenProps) {
  const entry = popularReviews.find((r) => r.id === route.params.id);

  if (entry === undefined) {
    return (
      <View style={{ flex: 1, padding: space.xl }}>
        <Text style={{ color: color.textDim, fontSize: 14 }}>That entry is gone.</Text>
      </View>
    );
  }

  const openGame = () =>
    navigation.navigate('Game', { title: entry.title, coverUrl: entry.coverUrl });

  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xxl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar initials={entry.initials} tint={entry.tint} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: color.text }}>{entry.who}</Text>
          <Text style={{ fontSize: 12.5, color: color.textDim, marginTop: 3 }}>
            {STATUS_LABEL[entry.status] ?? entry.status}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Follow"
          style={{
            minHeight: 36,
            paddingHorizontal: 14,
            justifyContent: 'center',
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: color.border,
          }}
        >
          <Text style={{ fontSize: 12.5, color: color.text }}>Follow</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={openGame}
        accessibilityRole="button"
        accessibilityLabel={`Open the page for ${entry.title}`}
        style={{ flexDirection: 'row', gap: 16 }}
      >
        <Cover title={entry.title} url={entry.coverUrl} width={92} height={130} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: color.text, lineHeight: 26 }}>
            {entry.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12 }}>
            <Stars value={entry.rating} size={16} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: color.star }}>
              {entry.rating.toFixed(1)}
            </Text>
            {entry.liked && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: color.warm,
                  borderRadius: 2,
                  transform: [{ rotate: '45deg' }],
                }}
              />
            )}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            <Chip label={`${entry.hours}h`} />
            <Chip
              label={entry.context}
              tone={entry.status === 'abandoned' ? 'warm' : 'neutral'}
            />
          </View>
          <Text style={{ fontSize: 11.5, color: color.textFaint, marginTop: 12 }}>
            Tap to open the game
          </Text>
        </View>
      </Pressable>

      {entry.body === undefined ? (
        <Text style={{ fontSize: 13.5, color: color.textFaint, lineHeight: 21 }}>
          {entry.who} rated this without writing anything. That is a complete entry —
          most people rate far more often than they review.
        </Text>
      ) : (
        <Text style={{ fontSize: 15, lineHeight: 25, color: '#C8CDD5' }}>{entry.body}</Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingTop: 4,
          borderTopWidth: 1,
          borderTopColor: color.surface2,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Like this entry"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            minHeight: 44,
            paddingHorizontal: 14,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: color.border,
            marginTop: 12,
          }}
        >
          <View
            style={{
              width: 11,
              height: 11,
              backgroundColor: color.warm,
              borderRadius: 2,
              transform: [{ rotate: '45deg' }],
            }}
          />
          <Text style={{ fontSize: 13, color: color.text }}>{entry.likes}</Text>
        </Pressable>

        <Text style={{ fontSize: 12.5, color: color.textFaint, marginTop: 12 }}>
          {entry.comments} comments
        </Text>
      </View>

      {/* Say what is not real rather than letting the screen imply it is. */}
      <Text style={{ fontSize: 11.5, color: color.textFaint, lineHeight: 18 }}>
        This entry is sample data. Liking and following need real accounts, which
        arrive with the social milestone.
      </Text>
    </ScrollView>
  );
}
