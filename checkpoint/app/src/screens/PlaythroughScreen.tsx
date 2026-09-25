import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Backdrop } from '../components/Backdrop';
import { Chip } from '../components/Chip';
import { Cover } from '../components/Cover';
import { LinkRow } from '../components/LinkRow';
import { Stars } from '../components/Stars';
import type { PlaythroughScreenProps } from '../navigation';
import { useLibrary } from '../store';
import { color, radius, space } from '../theme';

/** How each status reads, and which accent carries it. */
const STATUS_LABEL: Record<string, string> = {
  wishlist: 'You want this',
  backlog: 'In the backlog',
  playing: 'Playing',
  paused: 'Paused',
  finished: 'Finished',
  abandoned: 'Gave up on it',
  ongoing: 'Ongoing — no ending',
};

export function PlaythroughScreen({ route, navigation }: PlaythroughScreenProps) {
  const { all, remove } = useLibrary();
  const p = all.find((x) => x.id === route.params.id);

  // Deleting pops this screen, so a brief nothing-found state is normal rather
  // than an error worth shouting about.
  if (p === undefined) {
    return (
      <View style={{ flex: 1, padding: space.xl }}>
        <Text style={{ color: color.textDim, fontSize: 14 }}>This entry is gone.</Text>
      </View>
    );
  }

  function confirmDelete() {
    if (p === undefined) return;
    Alert.alert('Delete this entry?', `${p.title} will be removed from your library.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          remove(p.id);
          navigation.goBack();
        },
      },
    ]);
  }

  const accent =
    p.status === 'playing' || p.status === 'ongoing'
      ? color.active
      : p.status === 'abandoned'
        ? color.warm
        : color.star;

  const openGame = () =>
    navigation.navigate('Game', { title: p.title, coverUrl: p.coverUrl });

  return (
    <ScrollView style={{ backgroundColor: color.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Backdrop title={p.title} url={p.backdropUrl} onBack={() => navigation.goBack()} />

      <View style={{ paddingHorizontal: space.xl, marginTop: -72 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <Avatar initials="PG" tint="#2E3A46" size={34} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: color.text }}>You</Text>
            </View>

            <Pressable onPress={openGame} accessibilityRole="link">
              <Text style={{ fontSize: 26, fontWeight: '700', color: color.text, lineHeight: 31 }}>
                {p.title}
              </Text>
            </Pressable>

            <Text style={{ fontSize: 10, letterSpacing: 1, color: accent, fontWeight: '600', marginTop: 10 }}>
              {(STATUS_LABEL[p.status] ?? p.status).toUpperCase()}
            </Text>

            <Text style={{ fontSize: 30, fontWeight: '700', color: color.text, marginTop: 8 }}>
              {p.hours}
              <Text style={{ fontSize: 17, color: color.textDim }}>h</Text>
            </Text>

            {p.rating !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 13 }}>
                <Stars value={p.rating} size={19} />
                {p.liked === true && (
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
            )}
          </View>

          <Pressable onPress={openGame} accessibilityRole="button" accessibilityLabel={p.title}>
            <Cover title={p.title} url={p.coverUrl} width={92} height={130} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
          {p.platform !== undefined && p.platform !== '' && <Chip label={p.platform} />}
          {p.lastPlayed !== undefined && <Chip label={`played ${p.lastPlayed}`} />}
          {p.droppedAtHour !== undefined && (
            <Chip label={`dropped at ${p.droppedAtHour}h`} tone="warm" />
          )}
          {p.rating === undefined && <Chip label="not rated" />}
        </View>

        <View style={{ marginTop: space.xxl }}>
          {p.review === undefined || p.review.trim() === '' ? (
            <Text style={{ fontSize: 14, color: color.textFaint, lineHeight: 22 }}>
              No words on this one. A rating with nothing written is still a complete log.
            </Text>
          ) : (
            <Text style={{ fontSize: 15.5, lineHeight: 26, color: '#C8CDD5' }}>{p.review}</Text>
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: space.xxl,
            marginTop: space.xxl,
            paddingTop: space.sm,
            borderTopWidth: 1,
            borderTopColor: color.surface2,
          }}
        >
          <LinkRow label="Go to game" onPress={openGame} />
          <LinkRow label="See more logs" muted />
        </View>

        <View style={{ gap: 10, marginTop: space.xxl }}>
          <Pressable
            onPress={() =>
              navigation.navigate('Log', { title: p.title, coverUrl: p.coverUrl, editId: p.id })
            }
            accessibilityRole="button"
            style={{
              minHeight: 52,
              borderRadius: radius.lg,
              backgroundColor: color.star,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#14120F' }}>
              Edit this log
            </Text>
          </Pressable>

          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            style={{
              minHeight: 48,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: color.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: color.warm }}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

