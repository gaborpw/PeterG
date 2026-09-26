import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from '../components/Avatar';
import { Cover } from '../components/Cover';
import { PosterRow } from '../components/PosterRow';
import { SectionHeading } from '../components/SectionHeading';
import { Stars } from '../components/Stars';
import { aggregateFor, friendsPlaying, popularReviews, popularThisWeek } from '../data';
import { color, space } from '../theme';

const POSTER_W = 112;
const POSTER_H = 168;

export function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: space.xxl }}>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl }}>
        <Text style={{ fontSize: 25, fontWeight: '700', color: color.text }}>Checkpoint</Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <SectionHeading title="Popular this week" />
        <PosterRow>
          {popularThisWeek.map((g) => {
            const agg = aggregateFor(g.title);
            return (
            <Pressable
              key={g.id}
              onPress={() => navigation.navigate('Game', { title: g.title, coverUrl: g.coverUrl })}
              accessibilityRole="button"
              accessibilityLabel={g.title}
              style={{ width: POSTER_W }}
            >
              <Cover title={g.title} url={g.coverUrl} width={POSTER_W} height={POSTER_H} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 9,
                }}
              >
                {/* One source for this number. See popularThisWeek in data.ts. */}
                {agg.avgRating !== undefined && (
                  <>
                    <Stars value={agg.avgRating} size={10} />
                    <Text style={{ fontSize: 11, color: color.textDim }}>
                      {agg.avgRating.toFixed(1)}
                    </Text>
                  </>
                )}
              </View>
              <Text style={{ fontSize: 10.5, color: color.textFaint, marginTop: 3 }}>
                {agg.logs === 0 ? 'no logs yet' : `${agg.logs} ${agg.logs === 1 ? 'log' : 'logs'}`}
              </Text>
            </Pressable>
            );
          })}
        </PosterRow>
      </View>

      <View style={{ marginBottom: 30 }}>
        <SectionHeading title="Friends are playing" meta={`${friendsPlaying.length} this week`} />
        <PosterRow>
          {friendsPlaying.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => navigation.navigate('Game', { title: f.title, coverUrl: f.coverUrl })}
              accessibilityRole="button"
              accessibilityLabel={`${f.title}, played by ${f.who}`}
              style={{ width: POSTER_W }}
            >
              <View>
                <Cover title={f.title} url={f.coverUrl} width={POSTER_W} height={POSTER_H} />
                {/* The friend's mark sits on the poster, the way a Letterboxd
                    shelf puts the person before the title. */}
                <View
                  style={{
                    position: 'absolute',
                    left: -4,
                    bottom: -6,
                    borderRadius: 18,
                    borderWidth: 2.5,
                    borderColor: color.bg,
                  }}
                >
                  <Avatar initials={f.initials} tint={f.tint} size={30} />
                </View>
              </View>
              <Text
                numberOfLines={1}
                style={{ fontSize: 12, fontWeight: '600', color: color.text, marginTop: 13 }}
              >
                {f.who}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <Text style={{ fontSize: 11.5, fontWeight: '600', color: color.star }}>
                  {f.hours}h
                </Text>
                <Text style={{ fontSize: 10.5, color: color.textFaint }}>{f.platform}</Text>
              </View>
            </Pressable>
          ))}
        </PosterRow>
      </View>

      <View>
        <SectionHeading title="Popular reviews" meta="This week" />
        <View style={{ paddingHorizontal: space.xl, gap: 11 }}>
          {popularReviews.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => navigation.navigate('Entry', { id: r.id })}
              accessibilityRole="button"
              style={{ padding: 14, borderRadius: 15, backgroundColor: color.surface, gap: 11 }}
            >
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Cover title={r.title} url={r.coverUrl} width={44} height={62} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '600', color: color.text }}>
                    {r.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 }}>
                    <Avatar initials={r.initials} tint={r.tint} size={20} />
                    <Text style={{ fontSize: 12, color: color.textDim }}>{r.who}</Text>
                    <Stars value={r.rating} size={11} />
                    {r.liked && <Heart />}
                  </View>
                  <Text style={{ fontSize: 10.5, color: color.textFaint, marginTop: 6 }}>
                    {r.context}
                  </Text>
                </View>
              </View>

              {r.body !== undefined && (
                <Text style={{ fontSize: 12.5, lineHeight: 19, color: '#C8CDD5' }}>{r.body}</Text>
              )}

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Text style={{ fontSize: 11, color: color.textFaint }}>{r.likes} likes</Text>
                <Text style={{ fontSize: 11, color: color.textFaint }}>{r.comments} comments</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Heart() {
  return (
    <View
      style={{
        width: 9,
        height: 9,
        backgroundColor: color.warm,
        borderRadius: 2,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}
