import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Cover } from '../components/Cover';
import { searchGames, type GameSummary } from '../catalogue';
import type { PickGameScreenProps } from '../navigation';
import { color, radius, space } from '../theme';

/**
 * Step one of logging: which game?
 *
 * The form used to open on an empty text field, which made the fastest path to
 * a log "type the name and hope you spelled it the same as last time". Picking
 * from the catalogue means the title, cover and art are attached before you
 * reach the form. Logging speed is the thing we are competing on — see
 * docs/competitors.md.
 */
export function PickGameScreen({ navigation }: PickGameScreenProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameSummary[]>([]);

  useEffect(() => {
    // searchGames is a network call once IGDB is behind it, so a slow earlier
    // query must not overwrite a faster later one.
    let current = true;
    searchGames(query).then((found) => {
      if (current) setResults(found);
    });
    return () => {
      current = false;
    };
  }, [query]);

  const typed = query.trim();

  function choose(game: GameSummary) {
    navigation.replace('Log', { title: game.title, coverUrl: game.coverUrl });
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <View style={{ padding: space.xl, gap: space.lg }}>
        <Text style={{ fontSize: 25, fontWeight: '700', color: color.text }}>
          What are you logging?
        </Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a game"
          placeholderTextColor={color.textFaint}
          autoCorrect={false}
          autoFocus
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

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: 40, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint }}>
          {typed === '' ? 'ALL GAMES' : `${results.length} RESULT${results.length === 1 ? '' : 'S'}`}
        </Text>

        {results.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => choose(game)}
            accessibilityRole="button"
            accessibilityLabel={`Log ${game.title}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 13, minHeight: 62 }}
          >
            <Cover title={game.title} url={game.coverUrl} width={44} height={62} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: color.text }}>
                {game.title}
              </Text>
              {game.developer !== undefined && (
                <Text style={{ fontSize: 11.5, color: color.textFaint, marginTop: 5 }}>
                  {game.year} · {game.developer}
                </Text>
              )}
            </View>
            <Text style={{ fontSize: 20, color: color.textFaint }}>›</Text>
          </Pressable>
        ))}

        {/* The catalogue is 15 games today and will never be everything, so
            never trap someone who owns a game we have not heard of. */}
        {typed !== '' && (
          <Pressable
            onPress={() => navigation.replace('Log', { title: typed })}
            accessibilityRole="button"
            style={{
              marginTop: results.length === 0 ? 0 : 10,
              padding: 14,
              borderRadius: radius.lg,
              backgroundColor: color.surface,
              borderWidth: 1,
              borderColor: color.border,
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: color.text }}>
              {results.length === 0 ? 'Not in the catalogue yet' : "Can't find it?"}
            </Text>
            <Text style={{ fontSize: 12, color: color.textDim, marginTop: 5, lineHeight: 18 }}>
              Log “{typed}” anyway — it just won't have art.
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
