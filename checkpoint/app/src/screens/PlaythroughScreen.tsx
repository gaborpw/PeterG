import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Chip } from '../components/Chip';
import { Cover } from '../components/Cover';
import { Stars } from '../components/Stars';
import type { PlaythroughScreenProps } from '../navigation';
import { useLibrary } from '../store';
import { color, radius, space } from '../theme';

/** How each status reads, and which accent carries it. */
const STATUS_LABEL: Record<string, string> = {
  wishlist: 'On the wishlist',
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

  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xxl }}>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Pressable
          onPress={() => navigation.navigate('Game', { title: p.title, coverUrl: p.coverUrl })}
          accessibilityRole="button"
          accessibilityLabel={`Open the page for ${p.title}`}
        >
          <Cover title={p.title} url={p.coverUrl} width={100} height={140} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Pressable
            onPress={() => navigation.navigate('Game', { title: p.title, coverUrl: p.coverUrl })}
            accessibilityRole="link"
          >
            <Text style={{ fontSize: 22, fontWeight: '700', color: color.text, lineHeight: 28 }}>
              {p.title}
            </Text>
          </Pressable>

          <Text style={{ fontSize: 10, letterSpacing: 1, color: accent, fontWeight: '600', marginTop: 10 }}>
            {(STATUS_LABEL[p.status] ?? p.status).toUpperCase()}
          </Text>

          <Text style={{ fontSize: 30, fontWeight: '700', color: color.text, marginTop: 10 }}>
            {p.hours}
            <Text style={{ fontSize: 17, color: color.textDim }}>h</Text>
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {p.platform !== undefined && <Chip label={p.platform} />}
            {p.lastPlayed !== undefined && <Chip label={`played ${p.lastPlayed}`} />}
            {p.droppedAtHour !== undefined && (
              <Chip label={`dropped at ${p.droppedAtHour}h`} tone="warm" />
            )}
          </View>
        </View>
      </View>

      <View>
        <Label>Your rating</Label>
        {p.rating === undefined ? (
          <Text style={{ fontSize: 13.5, color: color.textFaint }}>
            Not rated. That is a valid answer — plenty of games do not need one.
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <Stars value={p.rating} size={22} />
            <Text style={{ fontSize: 17, fontWeight: '600', color: color.star }}>
              {p.rating.toFixed(1)}
            </Text>
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

      <View>
        <Label>Your review</Label>
        {p.review === undefined || p.review.trim() === '' ? (
          <Text style={{ fontSize: 13.5, color: color.textFaint, lineHeight: 20 }}>
            Nothing written yet.
          </Text>
        ) : (
          <View style={{ padding: 15, borderRadius: radius.lg, backgroundColor: color.surface }}>
            <Text style={{ fontSize: 14, lineHeight: 22, color: '#C8CDD5' }}>{p.review}</Text>
          </View>
        )}
      </View>

      <View style={{ gap: 10 }}>
        <Pressable
          onPress={() =>
            navigation.navigate('Log', {
              title: p.title,
              coverUrl: p.coverUrl,
              editId: p.id,
            })
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
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#14120F' }}>Edit this entry</Text>
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
    </ScrollView>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 10,
        letterSpacing: 1,
        fontWeight: '600',
        color: color.textFaint,
        marginBottom: 12,
      }}
    >
      {children.toUpperCase()}
    </Text>
  );
}
