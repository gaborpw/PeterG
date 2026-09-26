import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '../components/Avatar';
import { Cover } from '../components/Cover';
import { PosterRow } from '../components/PosterRow';
import { SectionHeading } from '../components/SectionHeading';
import { gameByTitle } from '../catalogue';
import { useTabs } from '../tabs';
import { RatingSummary } from '../components/RatingSummary';
import { Stars } from '../components/Stars';
import { aggregateFor, aggregateLogs, favorites, profile } from '../data';
import { useLibrary } from '../store';
import { color, radius, space } from '../theme';

export function ProfileScreen() {
  const { all, byStatus } = useLibrary();
  const navigation = useNavigation();
  const { openLibrary } = useTabs();

  const active = byStatus('playing', 'ongoing');
  const wishlist = byStatus('wishlist');
  const finishedGames = byStatus('finished');

  // Finish rate counts only games you actually started — a backlog you have
  // not touched is not a failure to finish anything.
  const started = all.filter((p) => p.status !== 'backlog' && p.status !== 'wishlist');
  const finishRate =
    started.length === 0 ? 0 : Math.round((finishedGames.length / started.length) * 100);
  const totalHours = all.reduce((sum, p) => sum + p.hours, 0);

  // Wanting or shelving a game says nothing about how you rate, so the spread
  // is drawn from the games you actually played.
  const mine = aggregateLogs(started);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: space.xl, gap: space.xxl }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
        <Avatar initials="PG" tint="#2E3A46" size={62} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 21, fontWeight: '700', color: color.text }}>
            {profile.name}
          </Text>
          <Text style={{ fontSize: 12.5, color: color.textFaint, marginTop: 3 }}>
            {profile.handle}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 13, lineHeight: 20, color: '#C8CDD5' }}>{profile.bio}</Text>

      <View
        style={{
          flexDirection: 'row',
          borderRadius: radius.lg,
          backgroundColor: color.surface,
          borderWidth: 1,
          borderColor: color.border,
          overflow: 'hidden',
        }}
      >
        <Stat value={String(all.length)} label="LOGGED" onPress={() => openLibrary('all')} />
        <Divider />
        <Stat
          value={String(finishedGames.length)}
          label="FINISHED"
          onPress={() => openLibrary('finished')}
        />
        <Divider />
        <Stat value={`${finishRate}%`} label="FINISH RATE" warm />
        <Divider />
        <Stat value={`${Math.round(totalHours)}h`} label="ALL TIME" />
      </View>

      <View>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint, marginBottom: 11 }}>
          FAVORITES
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {favorites.map((f) => {
            const agg = aggregateFor(f.title);
            return (
              // Favorites are titles, not full records, so both the art and the
              // rating come from the catalogue rather than being duplicated
              // alongside them.
              <Pressable
                key={f.id}
                onPress={() =>
                  navigation.navigate('Game', {
                    title: f.title,
                    coverUrl: f.coverUrl ?? gameByTitle(f.title)?.coverUrl,
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={f.title}
              >
                <Cover
                  title={f.title}
                  url={f.coverUrl ?? gameByTitle(f.title)?.coverUrl}
                  width={76}
                  height={104}
                />
                {agg.avgRating !== undefined && (
                  <View style={{ marginTop: 6, alignItems: 'center' }}>
                    <Stars value={agg.avgRating} size={10} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Your own spread, not a game's. Same component, because a histogram
          that meant something different here would be worse than none. */}
      {mine.ratings > 0 && (
        <View>
          <Text
            style={{
              fontSize: 10,
              letterSpacing: 1,
              fontWeight: '600',
              color: color.textFaint,
              marginBottom: 11,
            }}
          >
            HOW YOU RATE
          </Text>
          <RatingSummary agg={mine} label="YOUR RATINGS" />
        </View>
      )}

      <View>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint, marginBottom: 11 }}>
          NOW PLAYING
        </Text>
        {active.length === 0 && (
          <Text style={{ fontSize: 13, color: color.textFaint, lineHeight: 20 }}>
            Nothing on the go. Tap ➕ when you next sit down with something.
          </Text>
        )}
        <View style={{ gap: 9 }}>
          {active.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => navigation.navigate('Playthrough', { id: p.id })}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 10,
                borderRadius: radius.md,
                backgroundColor: color.surface,
              }}
            >
              <Cover title={p.title} url={p.coverUrl} width={34} height={46} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '500', color: color.text }}>
                  {p.title}
                </Text>
                <Text style={{ fontSize: 11, color: color.textFaint, marginTop: 3 }}>
                  {p.platform} · {p.status}
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: color.active }}>
                {p.hours}h
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* What you want, as opposed to what you own and have not played. The
          distinction is the point — see ADR 0004. */}
      {wishlist.length > 0 && (
        <View style={{ marginHorizontal: -space.xl }}>
          <SectionHeading title="Wishlist" meta={`${wishlist.length}`} />
          <PosterRow>
            {wishlist.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => navigation.navigate('Playthrough', { id: p.id })}
                accessibilityRole="button"
                accessibilityLabel={p.title}
                style={{ width: 84 }}
              >
                <Cover title={p.title} url={p.coverUrl} width={84} height={120} />
                <Text
                  numberOfLines={2}
                  style={{ fontSize: 11, color: color.textDim, marginTop: 8, lineHeight: 15 }}
                >
                  {p.title}
                </Text>
              </Pressable>
            ))}
          </PosterRow>
        </View>
      )}
    </ScrollView>
  );
}

/**
 * One number.
 *
 * The two that stand for a list you can actually open are pressable; the two
 * that are derived — a rate and a total — are not, because there is no list
 * behind them to show and a tile that does nothing is worse than a tile that
 * plainly is not a button.
 */
function Stat({
  value,
  label,
  warm,
  onPress,
}: {
  value: string;
  label: string;
  warm?: boolean;
  onPress?: () => void;
}) {
  const body = (
    <>
      <Text style={{ fontSize: 19, fontWeight: '600', color: warm ? color.warm : color.text }}>
        {value}
      </Text>
      <Text style={{ fontSize: 9.5, color: color.textFaint, marginTop: 6 }}>{label}</Text>
    </>
  );

  const box = { flex: 1, paddingVertical: 13, alignItems: 'center' as const };

  if (onPress === undefined) return <View style={box}>{body}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label.toLowerCase()}, open in library`}
      style={box}
    >
      {body}
    </Pressable>
  );
}

function Divider() {
  return <View style={{ width: 1, backgroundColor: color.border }} />;
}
