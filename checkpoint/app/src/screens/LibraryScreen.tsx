import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { playthroughMeta } from '../format';
import { useNavigation } from '@react-navigation/native';
import { Chip } from '../components/Chip';
import { Cover } from '../components/Cover';
import { Stars } from '../components/Stars';
import { type Playthrough } from '../data';
import { useLibrary } from '../store';
import { type Segment } from '../tabs';
import { color, radius, space } from '../theme';



/**
 * Four groups, named for what you would say out loud.
 *
 * "Backlog" is jargon; "Going to play" is the same shelf described honestly.
 * Dropped games sit under Done rather than Finished, because you did put time
 * into them and they are over either way — filing them under Finished was the
 * app contradicting its own "dropped at 9h" label one line below.
 *
 * Paused has no tab. It lives in Playing, sorted by when you last touched it,
 * so a game you have not opened in a month sinks to the bottom on its own
 * rather than needing a shelf to be filed on.
 */
const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'playing', label: 'Playing' },
  { key: 'soon', label: 'Going to play' },
  { key: 'done', label: 'Done' },
  { key: 'all', label: 'All' },
];

export function LibraryScreen({
  segment,
  onSegment,
}: {
  segment: Segment;
  onSegment: (next: Segment) => void;
}) {
  // Playing is the default on purpose: the games you are in the middle of are
  // what you came here for. docs/information-architecture.md section 2.
  const { all, byStatus, source, lastError, remove } = useLibrary();
  const navigation = useNavigation();

  /**
   * Which row's menu is open, if any.
   *
   * This was Alert.alert, which dims the whole screen and demands a decision
   * for what is a two-item menu — far more weight than "edit or remove" asks
   * for. A small panel under the button is what the gesture implies.
   */
  const [menuFor, setMenuFor] = useState<string | null>(null);

  function confirmRemove(p: Playthrough) {
    setMenuFor(null);
    // Removing still asks. It is destructive and there is no undo.
    Alert.alert('Delete this entry?', `${p.title} will be removed from your library.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(p.id) },
    ]);
  }

  const games: Playthrough[] =
    segment === 'playing'
      ? recentFirst(byStatus('playing', 'ongoing', 'paused'))
      : segment === 'soon'
        ? byStatus('backlog', 'wishlist')
        : segment === 'done'
          ? byStatus('finished', 'abandoned')
          : all;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: space.xl, gap: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 25, fontWeight: '700', color: color.text }}>Library</Text>
          <View style={{ flex: 1 }} />
          {/* Say where the data came from rather than letting it be ambiguous. */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 9,
              paddingVertical: 5,
              borderRadius: radius.pill,
              backgroundColor: color.surface,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  source === 'server' ? color.active : source === 'offline' ? color.warm : color.textFaint,
              }}
            />
            <Text style={{ fontSize: 10.5, color: color.textDim }}>
              {source === 'server' ? 'Synced' : source === 'offline' ? 'On this device' : 'Loading'}
            </Text>
          </View>
        </View>

        {lastError !== null && (
          <Text style={{ fontSize: 11.5, color: color.warm, lineHeight: 17 }}>
            Saved on this device — {lastError}
          </Text>
        )}

        <View
          style={{
            flexDirection: 'row',
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: color.border,
            overflow: 'hidden',
          }}
        >
          {SEGMENTS.map((s, i) => {
            const on = segment === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => onSegment(s.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={{
                  flex: 1,
                  minHeight: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? color.text : 'transparent',
                  borderLeftWidth: i === 0 ? 0 : 1,
                  borderLeftColor: color.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: on ? '600' : '400',
                    color: on ? color.bg : color.textDim,
                  }}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: space.xxl, gap: 10 }}>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint }}>
          {games.length} {games.length === 1 ? 'GAME' : 'GAMES'}
        </Text>

        {games.length === 0 && <Empty segment={segment} />}

        {games.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              if (menuFor !== null) {
                setMenuFor(null);
                return;
              }
              navigation.navigate('Playthrough', { id: p.id });
            }}
            accessibilityRole="button"
            accessibilityLabel={`${p.title}, ${p.status}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 13,
              padding: 12,
              borderRadius: radius.lg,
              backgroundColor: color.surface,
              borderWidth: 1,
              borderColor: p.status === 'playing' ? '#33513F' : color.border,
              // The open row draws over the one below rather than under it.
              zIndex: menuFor === p.id ? 10 : 0,
            }}
          >
            <Cover title={p.title} url={p.coverUrl} width={46} height={64} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '600', color: color.text }}>
                {p.title}
              </Text>
              <Text style={{ fontSize: 11.5, color: color.textFaint, marginTop: 4 }}>
                {playthroughMeta(p)}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                {p.hours > 0 && (
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: p.status === 'abandoned' ? color.warm : color.active,
                    }}
                  >
                    {p.hours}h
                  </Text>
                )}
                {p.rating !== undefined && <Stars value={p.rating} size={11} />}
                {p.status === 'ongoing' && <Chip label="ongoing" />}
                {p.status === 'backlog' && <Chip label="not started" />}
                {p.status === 'wishlist' && <Chip label="want it" />}
                {p.status === 'abandoned' && (
                  <Chip label={`dropped at ${p.droppedAtHour}h`} tone="warm" />
                )}
              </View>
            </View>

            <Pressable
              onPress={() => setMenuFor((open) => (open === p.id ? null : p.id))}
              accessibilityRole="button"
              accessibilityLabel={`Actions for ${p.title}`}
              accessibilityState={{ expanded: menuFor === p.id }}
              hitSlop={8}
              style={{
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 19,
                  color: menuFor === p.id ? color.text : color.textFaint,
                  marginTop: -4,
                }}
              >
                ⋯
              </Text>
            </Pressable>

            {menuFor === p.id && (
              <View
                style={{
                  position: 'absolute',
                  top: 52,
                  right: 10,
                  minWidth: 168,
                  borderRadius: radius.md,
                  backgroundColor: color.surface2,
                  borderWidth: 1,
                  borderColor: color.border,
                  overflow: 'hidden',
                }}
              >
                <MenuItem
                  label="Edit this log"
                  onPress={() => {
                    setMenuFor(null);
                    navigation.navigate('Log', {
                      title: p.title,
                      coverUrl: p.coverUrl,
                      editId: p.id,
                    });
                  }}
                />
                <View style={{ height: 1, backgroundColor: color.border }} />
                <MenuItem label="Remove" destructive onPress={() => confirmRemove(p)} />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/** One row of the row menu. */
function MenuItem({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 14 }}
    >
      <Text style={{ fontSize: 13.5, color: destructive ? color.warm : color.text }}>{label}</Text>
    </Pressable>
  );
}

/** Segment-specific copy. "0 GAMES" and then black tells you nothing. */
const EMPTY: Record<Segment, { head: string; body: string }> = {
  playing: {
    head: 'Nothing on the go',
    body: 'Games you are playing, paused, or keep coming back to, most recent first.',
  },
  soon: {
    head: 'Nothing lined up',
    body: 'Games you own but have not started, and ones you want, collect here.',
  },
  done: {
    head: 'Nothing finished yet',
    body: 'Games you saw through, and the ones you gave up on. Both took real time.',
  },
  all: {
    head: 'Your library is empty',
    body: 'Tap the + button to log the first one. It takes about thirty seconds.',
  },
};

function Empty({ segment }: { segment: Segment }) {
  const copy = EMPTY[segment];
  return (
    <View
      style={{
        marginTop: 6,
        padding: 18,
        borderRadius: radius.lg,
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.border,
        borderStyle: 'dashed',
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: color.text }}>{copy.head}</Text>
      <Text style={{ fontSize: 12.5, color: color.textDim, marginTop: 7, lineHeight: 19 }}>
        {copy.body}
      </Text>
    </View>
  );
}

/**
 * Most recently played first, then everything nobody has logged a session for.
 *
 * lastPlayedOn is a real date from the session table, so this is the order you
 * would put the shelf in yourself: what you touched last night at the top, the
 * thing you paused in March at the bottom.
 */
function recentFirst(games: Playthrough[]): Playthrough[] {
  return [...games].sort((a, b) => {
    const left = a.lastPlayedOn ?? '';
    const right = b.lastPlayedOn ?? '';
    if (left === right) return a.title.localeCompare(b.title);
    if (left === '') return 1;
    if (right === '') return -1;
    return right.localeCompare(left);
  });
}
