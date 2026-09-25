import { ScrollView, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { friendsPlaying, mine } from '../data';
import { color, radius, space } from '../theme';

export function PlayingScreen() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: space.xl, gap: space.xxl }}
    >
      <Text style={{ fontSize: 25, fontWeight: '700', color: color.text }}>Playing</Text>

      <View>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint, marginBottom: 11 }}>
          YOURS
        </Text>
        <View style={{ gap: 10 }}>
          {mine.map((p) => (
            <View
              key={p.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                padding: 13,
                borderRadius: radius.lg,
                backgroundColor: color.surface,
                borderWidth: 1,
                borderColor: p.status === 'playing' ? '#33513F' : color.border,
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 62,
                  borderRadius: radius.sm,
                  backgroundColor: color.surface2,
                  borderWidth: 1,
                  borderColor: color.border,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, fontWeight: '600', color: color.text }}>
                  {p.title}
                </Text>
                <Text style={{ fontSize: 11.5, color: color.textFaint, marginTop: 4 }}>
                  {p.platform} · last played {p.lastPlayed}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Text style={{ fontSize: 17, fontWeight: '600', color: color.active }}>
                    {p.hours}h
                  </Text>
                  {p.status === 'ongoing' && <Chip label="ongoing" />}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint, marginBottom: 11 }}>
          FRIENDS PLAYING NOW
        </Text>
        <View>
          {friendsPlaying.map((f, i) => (
            <View
              key={f.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 9,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: '#191C22',
              }}
            >
              <Avatar initials={f.initials} tint={f.tint} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13.5, color: color.text }}>
                  <Text style={{ fontWeight: '600' }}>{f.who}</Text>
                  <Text style={{ color: color.textDim }}> is playing</Text>
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 12, color: '#C8CDD5', marginTop: 2 }}>
                  {f.title}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: color.active }}>
                  {f.hours}h
                </Text>
                <Text style={{ fontSize: 10.5, color: color.textFaint, marginTop: 2 }}>
                  {f.lastSession}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
