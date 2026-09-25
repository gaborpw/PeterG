import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Chip } from '../components/Chip';
import { Cover } from '../components/Cover';
import { Stars } from '../components/Stars';
import { type Playthrough } from '../data';
import { useLibrary } from '../store';
import { color, radius, space } from '../theme';

type Segment = 'playing' | 'backlog' | 'finished' | 'all';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'playing', label: 'Playing' },
  { key: 'backlog', label: 'Backlog' },
  { key: 'finished', label: 'Finished' },
  { key: 'all', label: 'All' },
];

export function LibraryScreen() {
  // Playing is the default on purpose: the games you are in the middle of are
  // what you came here for. docs/information-architecture.md section 2.
  const [segment, setSegment] = useState<Segment>('playing');
  const { all, byStatus, source, lastError } = useLibrary();
  const navigation = useNavigation();

  const games: Playthrough[] =
    segment === 'playing'
      ? byStatus('playing', 'ongoing')
      : segment === 'backlog'
        ? byStatus('backlog', 'wishlist')
        : segment === 'finished'
          ? byStatus('finished', 'abandoned', 'paused')
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
                onPress={() => setSegment(s.key)}
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

        {games.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => navigation.navigate('Playthrough', { id: p.id })}
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
            }}
          >
            <Cover title={p.title} url={p.coverUrl} width={46} height={64} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14.5, fontWeight: '600', color: color.text }}>
                {p.title}
              </Text>
              <Text style={{ fontSize: 11.5, color: color.textFaint, marginTop: 4 }}>
                {p.platform}
                {p.lastPlayed !== undefined ? ` · last played ${p.lastPlayed}` : ''}
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
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
