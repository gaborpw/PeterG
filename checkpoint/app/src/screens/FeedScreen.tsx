import { ScrollView, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { Cover } from '../components/Cover';
import { Stars } from '../components/Stars';
import { feed } from '../data';
import { color, radius, space } from '../theme';

export function FeedScreen() {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: space.xl, gap: space.md }}
    >
      <Text style={{ fontSize: 25, fontWeight: '700', color: color.text, marginBottom: 8 }}>
        Feed
      </Text>

      {feed.map((e) => (
        <View
          key={e.id}
          style={{ padding: 14, borderRadius: 15, backgroundColor: color.surface, gap: 11 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Avatar initials={e.initials} tint={e.tint} size={30} />
            <Text style={{ flex: 1, fontSize: 13, color: color.text }}>
              <Text style={{ fontWeight: '600' }}>{e.who}</Text>
              <Text style={{ color: e.verb === 'finished' ? color.textDim : color.warm }}>
                {' '}
                {e.verb}
              </Text>
            </Text>
            <Text style={{ fontSize: 10.5, color: color.textFaint }}>{e.when}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 13 }}>
            <Cover title={e.title} url={e.coverUrl} width={52} height={70} />
            <View style={{ flex: 1, gap: 7 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: color.text }}>
                {e.title}
              </Text>
              <Stars value={e.rating} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                <Chip label={`${e.hours}h`} />
                {e.tags.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    tone={t.startsWith('dropped') ? 'warm' : t === '100%' ? 'active' : 'neutral'}
                  />
                ))}
              </View>
            </View>
          </View>

          {e.review && (
            <Text style={{ fontSize: 12.5, lineHeight: 19, color: '#C8CDD5' }}>{e.review}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
