import { ScrollView, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Cover } from '../components/Cover';
import { PosterRow } from '../components/PosterRow';
import { SectionHeading } from '../components/SectionHeading';
import { Stars } from '../components/Stars';
import { friendsPlaying, popularThisWeek } from '../data';
import { color, space } from '../theme';

const POSTER_W = 112;
const POSTER_H = 168;

export function HomeScreen() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: space.xxl }}>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xxl }}>
        <Text style={{ fontSize: 25, fontWeight: '700', color: color.text }}>Checkpoint</Text>
      </View>

      <View style={{ marginBottom: 30 }}>
        <SectionHeading title="Popular this week" meta="See all" />
        <PosterRow>
          {popularThisWeek.map((g) => (
            <View key={g.id} style={{ width: POSTER_W }}>
              <Cover title={g.title} url={g.coverUrl} width={POSTER_W} height={POSTER_H} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 9,
                }}
              >
                <Stars value={g.avgRating} size={10} />
                <Text style={{ fontSize: 11, color: color.textDim }}>
                  {g.avgRating.toFixed(1)}
                </Text>
              </View>
              <Text style={{ fontSize: 10.5, color: color.textFaint, marginTop: 3 }}>
                {g.playersThisWeek} playing
              </Text>
            </View>
          ))}
        </PosterRow>
      </View>

      <View>
        <SectionHeading title="Friends are playing" meta={`${friendsPlaying.length} this week`} />
        <PosterRow>
          {friendsPlaying.map((f) => (
            <View key={f.id} style={{ width: POSTER_W }}>
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
                <Text style={{ fontSize: 11.5, fontWeight: '600', color: color.active }}>
                  {f.hours}h
                </Text>
                <Text style={{ fontSize: 10.5, color: color.textFaint }}>{f.platform}</Text>
              </View>
            </View>
          ))}
        </PosterRow>
      </View>
    </ScrollView>
  );
}
