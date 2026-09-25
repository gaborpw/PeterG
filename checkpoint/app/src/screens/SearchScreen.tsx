import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Cover } from '../components/Cover';
import { Stars } from '../components/Stars';
import { popularThisWeek } from '../data';
import { color, radius, space } from '../theme';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const navigation = useNavigation();

  const q = query.trim().toLowerCase();
  const results =
    q === '' ? popularThisWeek : popularThisWeek.filter((g) => g.title.toLowerCase().includes(q));

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: space.xl, gap: space.lg }}>
        <Text style={{ fontSize: 25, fontWeight: '700', color: color.text }}>Search</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Find a game"
          placeholderTextColor={color.textFaint}
          autoCorrect={false}
          style={{
            minHeight: 46,
            paddingHorizontal: 14,
            borderRadius: radius.md,
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor: color.border,
            color: color.text,
            fontSize: 14.5,
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.xl, gap: 12 }}>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint }}>
          {q === '' ? 'TRENDING' : `${results.length} RESULT${results.length === 1 ? '' : 'S'}`}
        </Text>

        {results.map((g) => (
          <Pressable
            key={g.id}
            onPress={() => navigation.navigate('Game', { title: g.title, coverUrl: g.coverUrl })}
            accessibilityRole="button"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 62 }}
          >
            <Cover title={g.title} url={g.coverUrl} width={44} height={62} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: color.text }}>{g.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 }}>
                <Stars value={g.avgRating} size={10} />
                <Text style={{ fontSize: 11, color: color.textFaint }}>
                  {g.playersThisWeek} playing
                </Text>
              </View>
            </View>
          </Pressable>
        ))}

        {results.length === 0 && (
          <Text style={{ fontSize: 13, color: color.textDim, lineHeight: 20 }}>
            Nothing matches “{query}”. The catalogue is sample data until the IGDB sync lands.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
