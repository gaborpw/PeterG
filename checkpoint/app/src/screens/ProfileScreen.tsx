import { ScrollView, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Cover } from '../components/Cover';
import { favourites, mine, profile } from '../data';
import { color, radius, space } from '../theme';

export function ProfileScreen() {
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
        <Stat value={String(profile.logged)} label="LOGGED" />
        <Divider />
        <Stat value={String(profile.finished)} label="FINISHED" />
        <Divider />
        <Stat value={`${profile.finishRate}%`} label="FINISH RATE" warm />
        <Divider />
        <Stat value={`${profile.allTimeHours}h`} label="ALL TIME" />
      </View>

      <View>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint, marginBottom: 11 }}>
          FAVOURITES
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {favourites.map((f) => (
            <Cover key={f.id} title={f.title} url={f.coverUrl} width={76} height={104} />
          ))}
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint, marginBottom: 11 }}>
          NOW PLAYING
        </Text>
        <View style={{ gap: 9 }}>
          {mine.map((p) => (
            <View
              key={p.id}
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
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label, warm }: { value: string; label: string; warm?: boolean }) {
  return (
    <View style={{ flex: 1, paddingVertical: 13, alignItems: 'center' }}>
      <Text style={{ fontSize: 19, fontWeight: '600', color: warm ? color.warm : color.text }}>
        {value}
      </Text>
      <Text style={{ fontSize: 9.5, color: color.textFaint, marginTop: 6 }}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, backgroundColor: color.border }} />;
}
