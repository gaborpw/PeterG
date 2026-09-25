import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { Cover } from '../components/Cover';
import { Stars } from '../components/Stars';
import { aggregateFor, factsFor } from '../data';
import type { GameScreenProps } from '../navigation';
import { useLibrary } from '../store';
import { color, radius, space } from '../theme';

export function GameScreen({ route, navigation }: GameScreenProps) {
  // Progress-aware spoiler gating: a review written past where you have got to
  // stays collapsed until you ask for it. docs/spec.md 3.4.
  const [revealed, setRevealed] = useState(false);
  const { all, log } = useLibrary();

  const { title, coverUrl } = route.params;

  // Your own playthrough of this game, if you have one.
  const yours = all.find((p) => p.title.toLowerCase() === title.toLowerCase());

  const facts = factsFor(title);

  // Your own log counts towards the game's numbers, but wanting a game is not
  // playing it — a wishlist entry would drag the median to zero.
  const agg = aggregateFor(
    title,
    all.filter((p) => p.status !== 'wishlist'),
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: space.xl, gap: space.xxl }}
    >
      <View style={{ flexDirection: 'row', gap: space.lg }}>
        <Cover title={title} url={coverUrl} width={100} height={134} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 27, fontWeight: '700', color: color.text }}>
            {title}
          </Text>
          {/* No byline at all beats another game's byline. */}
          {facts !== undefined && (
            <>
              <Text style={{ fontSize: 13, color: color.textDim, marginTop: 6 }}>
                {facts.year} · {facts.developer}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {facts.genres.map((genre) => (
                  <Chip key={genre} label={genre} />
                ))}
              </View>
            </>
          )}
        </View>
      </View>

      {agg.logs === 0 ? (
        <View
          style={{
            padding: 16,
            borderRadius: radius.lg,
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor: color.border,
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: color.text }}>
            No one has logged this yet
          </Text>
          <Text style={{ fontSize: 12, color: color.textDim, marginTop: 6, lineHeight: 18 }}>
            Playtime and ratings appear once there are logs to average.
          </Text>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <StatCell
              label="Avg playtime"
              value={agg.medianHours === undefined ? '—' : `${agg.medianHours}h`}
              sub={agg.medianHours === undefined ? 'nobody has played it' : 'median logged'}
            />
            <StatCell
              label="Avg rating"
              value={agg.avgRating === undefined ? '—' : agg.avgRating.toFixed(1)}
              sub={agg.ratings === 0 ? 'no ratings yet' : plural(agg.ratings, 'rating')}
              accent
            />
            <StatCell
              label="Finish rate"
              value={`${agg.finishRate ?? 0}%`}
              sub={`of ${plural(agg.logs, 'log')}`}
            />
          </View>

          {/* Percentages over three logs describe the sample, not the game. */}
          {agg.funnel !== undefined && (
            <View>
              <Text
                style={{ fontSize: 14, fontWeight: '600', color: color.text, marginBottom: 12 }}
              >
                How far people get
              </Text>
              <View style={{ gap: 8 }}>
                {agg.funnel.map((row, i) => (
                  <View
                    key={row.label}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                  >
                    <Text style={{ width: 66, fontSize: 11.5, color: color.textDim }}>
                      {row.label}
                    </Text>
                    <View
                      style={{ flex: 1, height: 9, borderRadius: 5, backgroundColor: color.border }}
                    >
                      <View
                        style={{
                          width: `${row.pct}%`,
                          height: 9,
                          borderRadius: 5,
                          backgroundColor:
                            i === (agg.funnel?.length ?? 0) - 1 ? color.star : color.active,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        width: 36,
                        textAlign: 'right',
                        fontSize: 11.5,
                        color: color.text,
                      }}
                    >
                      {row.pct}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      <View
        style={{
          padding: 14,
          borderRadius: radius.lg,
          backgroundColor: color.surface,
          borderWidth: 1,
          borderColor: yours === undefined ? color.border : '#33513F',
        }}
      >
        {yours === undefined ? (
          <>
            <Text style={{ fontSize: 13, color: color.textDim, lineHeight: 20 }}>
              Not in your library yet.
            </Text>
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 12 }}>
              <Pressable
                onPress={() => navigation.navigate('Log', { title, coverUrl })}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  minHeight: 46,
                  borderRadius: radius.md,
                  backgroundColor: color.star,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#14120F' }}>
                  Log this game
                </Text>
              </Pressable>

              {/* Wanting a game is one tap, not a form. See ADR 0004. */}
              <Pressable
                onPress={() =>
                  log({ title, platform: '', status: 'wishlist', hours: 0, coverUrl })
                }
                accessibilityRole="button"
                accessibilityLabel={`Add ${title} to your wishlist`}
                style={{
                  minHeight: 46,
                  paddingHorizontal: 16,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: color.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, color: color.text }}>Want it</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 10, letterSpacing: 1, color: color.active, fontWeight: '600' }}>
              {yours.status.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '600', color: color.text, marginTop: 9 }}>
              {yours.hours}
              <Text style={{ fontSize: 14, color: color.textDim }}>h</Text>
            </Text>
            <Text style={{ fontSize: 11.5, color: color.textFaint, marginTop: 5 }}>
              {yours.platform}
              {yours.lastPlayed !== undefined ? ` · last played ${yours.lastPlayed}` : ''}
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Log', { title, coverUrl, editId: yours.id })}
              accessibilityRole="button"
              style={{
                marginTop: 12,
                minHeight: 44,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: color.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '500', color: color.text }}>
                {yours.status === 'wishlist' ? 'Start playing' : 'Update'}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <View>
        <Text style={{ fontSize: 14, fontWeight: '600', color: color.text, marginBottom: 12 }}>
          Reviews
        </Text>

        <View style={{ padding: 14, borderRadius: 13, backgroundColor: color.surface, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Avatar initials="JT" tint="#2E3A46" size={24} />
            <Text style={{ fontSize: 12.5, fontWeight: '500', color: color.text }}>Jon</Text>
            <Chip label="31h in" />
            <View style={{ flex: 1 }} />
            <Stars value={4.5} />
          </View>
          <Text style={{ fontSize: 12.5, lineHeight: 19, color: '#C8CDD5' }}>
            Thirty hours in and it still hands me a cliff I have no business climbing.
          </Text>
        </View>

        <View
          style={{
            marginTop: 9,
            padding: 14,
            borderRadius: 13,
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor: color.border,
            borderStyle: 'dashed',
            gap: 10,
          }}
        >
          {revealed ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Avatar initials="MK" tint="#2E4640" size={24} />
                <Text style={{ fontSize: 12.5, fontWeight: '500', color: color.text }}>Mia</Text>
                <Chip label="finished · 112h" />
                <View style={{ flex: 1 }} />
                <Stars value={5} />
              </View>
              <Text style={{ fontSize: 12.5, lineHeight: 19, color: '#C8CDD5' }}>
                The last stretch asks you to be a different player than the one who started,
                and somehow you already are.
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 12, color: color.textDim, lineHeight: 17 }}>
                Written after finishing. You are 47h in.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setRevealed(true)}
                style={{
                  minHeight: 44,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: color.border,
                  backgroundColor: color.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 12.5, fontWeight: '500', color: color.text }}>
                  Reveal anyway
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function StatCell({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        borderRadius: radius.md,
        backgroundColor: color.surface,
        borderWidth: 1,
        borderColor: color.border,
      }}
    >
      <Text style={{ fontSize: 9.5, letterSpacing: 0.9, color: color.textFaint }}>
        {label.toUpperCase()}
      </Text>
      <Text
        style={{
          fontSize: 25,
          fontWeight: '600',
          marginTop: 7,
          color: accent ? color.star : color.text,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 10.5, color: color.textFaint, marginTop: 5 }}>{sub}</Text>
    </View>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
