import { Pressable, ScrollView, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { AvatarPile } from '../components/AvatarPile';
import { Backdrop } from '../components/Backdrop';
import { Cover } from '../components/Cover';
import { LinkRow } from '../components/LinkRow';
import { Stars } from '../components/Stars';
import { popularReviews } from '../data';
import type { EntryScreenProps } from '../navigation';
import { color, space } from '../theme';

/** What someone did with a game, in words rather than an enum. */
const DID: Record<string, string> = {
  wishlist: 'Wants to play',
  backlog: 'In their backlog',
  playing: 'Playing',
  paused: 'Paused',
  finished: 'Finished',
  abandoned: 'Dropped',
  ongoing: 'Ongoing',
};

/**
 * Somebody else's log.
 *
 * Laid out after Serializd's entry screen: art across the top, the cover
 * overlapping it, then who, what, how they rated it and when. The art is what
 * makes it feel like a place rather than a card.
 */
export function EntryScreen({ route, navigation }: EntryScreenProps) {
  const entry = popularReviews.find((r) => r.id === route.params.id);

  if (entry === undefined) {
    return (
      <View style={{ flex: 1, padding: space.xl, backgroundColor: color.bg }}>
        <Text style={{ color: color.textDim, fontSize: 14 }}>That entry is gone.</Text>
      </View>
    );
  }

  const openGame = () =>
    navigation.navigate('Game', { title: entry.title, coverUrl: entry.coverUrl });

  return (
    <ScrollView style={{ backgroundColor: color.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Backdrop
        title={entry.title}
        url={entry.backdropUrl}
        onBack={() => navigation.goBack()}
      />

      <View style={{ paddingHorizontal: space.xl, marginTop: -72 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <Avatar initials={entry.initials} tint={entry.tint} size={34} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: color.text }}>
                {entry.who}
              </Text>
            </View>

            <Pressable onPress={openGame} accessibilityRole="link">
              <Text style={{ fontSize: 26, fontWeight: '700', color: color.text, lineHeight: 31 }}>
                {entry.title}
              </Text>
            </Pressable>

            <Text style={{ fontSize: 13.5, color: color.textDim, marginTop: 7 }}>
              {DID[entry.status] ?? entry.status} · {entry.hours}h
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 13 }}>
              <Stars value={entry.rating} size={19} />
              {entry.liked && (
                <View
                  style={{
                    width: 11,
                    height: 11,
                    backgroundColor: color.warm,
                    borderRadius: 2,
                    transform: [{ rotate: '45deg' }],
                  }}
                />
              )}
            </View>

            <Text style={{ fontSize: 12.5, color: color.textFaint, marginTop: 13 }}>
              Logged on {entry.loggedOn}
            </Text>
          </View>

          <Pressable onPress={openGame} accessibilityRole="button" accessibilityLabel={entry.title}>
            <Cover title={entry.title} url={entry.coverUrl} width={92} height={130} />
          </Pressable>
        </View>

        <View style={{ marginTop: space.xxl }}>
          {entry.body === undefined ? (
            <Text style={{ fontSize: 14, color: color.textFaint, lineHeight: 22 }}>
              {entry.who} rated this without writing anything — which is a complete
              log. Most people rate far more often than they write.
            </Text>
          ) : (
            <Text style={{ fontSize: 15.5, lineHeight: 26, color: '#C8CDD5' }}>{entry.body}</Text>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Like, ${entry.likes} so far`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: space.xxl }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: color.textFaint,
              borderRadius: 3,
              transform: [{ rotate: '45deg' }],
            }}
          />
          <Text style={{ fontSize: 15, color: color.textDim }}>{entry.likes}</Text>
        </Pressable>

        <View
          style={{
            flexDirection: 'row',
            gap: space.xxl,
            marginTop: space.lg,
            paddingTop: space.sm,
            borderTopWidth: 1,
            borderTopColor: color.surface2,
          }}
        >
          <LinkRow label="Go to game" onPress={openGame} />
          <LinkRow label="See more logs" muted />
        </View>

        <View
          style={{
            marginTop: space.md,
            paddingTop: space.lg,
            borderTopWidth: 1,
            borderTopColor: color.surface2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: color.text }}>Liked by</Text>
            <LinkRow label={`See all ${entry.likes}`} muted />
          </View>
          <AvatarPile />
        </View>

        <Text style={{ fontSize: 11.5, color: color.textFaint, lineHeight: 18, marginTop: space.xxl }}>
          This entry is sample data. Liking, following and “see more logs” need real
          accounts, which arrive with the social milestone.
        </Text>
      </View>
    </ScrollView>
  );
}
