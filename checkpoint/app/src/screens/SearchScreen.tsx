import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Cover } from '../components/Cover';
import { Stars } from '../components/Stars';
import { searchGames, type GameSummary } from '../catalogue';
import { aggregateFor, popularThisWeek } from '../data';
import { color, radius, space } from '../theme';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const navigation = useNavigation();

  const [results, setResults] = useState<GameSummary[]>([]);
  const q = query.trim();

  // Searching goes through the catalogue, not the trending row — that row is
  // seven games and searching it made most of the library unfindable. Same
  // function the log picker uses, so the two can never disagree.
  useEffect(() => {
    let current = true;
    searchGames(q).then((found) => {
      if (current) setResults(found);
    });
    return () => {
      current = false;
    };
  }, [q]);

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

        {q === ''
          ? popularThisWeek.map((g) => (
              <Row
                key={g.id}
                title={g.title}
                coverUrl={g.coverUrl}
                rating={g.avgRating}
                sub={`${g.playersThisWeek} playing`}
                onPress={() =>
                  navigation.navigate('Game', { title: g.title, coverUrl: g.coverUrl })
                }
              />
            ))
          : results.map((g) => {
              const agg = aggregateFor(g.title);
              return (
                <Row
                  key={g.id}
                  title={g.title}
                  coverUrl={g.coverUrl}
                  rating={agg.avgRating}
                  sub={
                    g.developer !== undefined
                      ? `${g.year} · ${g.developer}`
                      : 'Not in the catalogue'
                  }
                  onPress={() =>
                    navigation.navigate('Game', { title: g.title, coverUrl: g.coverUrl })
                  }
                />
              );
            })}

        {q !== '' && results.length === 0 && (
          <Text style={{ fontSize: 13, color: color.textDim, lineHeight: 20 }}>
            Nothing matches “{query}”. The catalogue is sample data until the IGDB sync lands.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

/** One result. Shared by the trending row and the search results. */
function Row({
  title,
  coverUrl,
  rating,
  sub,
  onPress,
}: {
  title: string;
  coverUrl?: string;
  rating?: number;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 62 }}
    >
      <Cover title={title} url={coverUrl} width={44} height={62} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: color.text }}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 6 }}>
          {/* No rating at all beats a zero for a game nobody has logged. */}
          {rating !== undefined && <Stars value={rating} size={10} />}
          <Text style={{ fontSize: 11, color: color.textFaint }}>{sub}</Text>
        </View>
      </View>
    </Pressable>
  );
}
