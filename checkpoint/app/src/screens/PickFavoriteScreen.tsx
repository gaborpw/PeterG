import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Cover } from '../components/Cover';
import { searchGames, type GameSummary } from '../catalogue';
import type { PickFavoriteScreenProps } from '../navigation';
import { useProfile } from '../profile';
import { color, radius, space } from '../theme';

/**
 * Choosing one of the four games on your profile.
 *
 * Deliberately the same searchGames the log picker uses. Favoriting a game and
 * logging one are the same question — "which game?" — and answering it two
 * different ways would mean two sets of results for one catalogue, and two
 * things to rewrite when IGDB lands.
 */
export function PickFavoriteScreen({ route, navigation }: PickFavoriteScreenProps) {
  const { position } = route.params;
  const { profile, saveFavorites, error } = useProfile();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameSummary[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let current = true;
    searchGames(query).then((found) => {
      if (current) setResults(found);
    });
    return () => {
      current = false;
    };
  }, [query]);

  async function choose(game: GameSummary) {
    if (profile === null) return;
    setSaving(true);
    // Replace whatever sits in this slot, keep the other three.
    const next = [
      ...profile.favorites.filter((f) => f.position !== position),
      { position, title: game.title, coverUrl: game.coverUrl },
    ].sort((a, b) => a.position - b.position);

    const ok = await saveFavorites(next);
    setSaving(false);
    if (ok) navigation.goBack();
  }

  async function clear() {
    if (profile === null) return;
    setSaving(true);
    const ok = await saveFavorites(profile.favorites.filter((f) => f.position !== position));
    setSaving(false);
    if (ok) navigation.goBack();
  }

  const occupied = profile?.favorites.find((f) => f.position === position);

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <View style={{ padding: space.xl, gap: space.lg }}>
        <Text style={{ fontSize: 25, fontWeight: '700', color: color.text }}>
          Favorite #{position}
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
        {error !== null && <Text style={{ fontSize: 12.5, color: color.warm }}>{error}</Text>}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: 40, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {occupied !== undefined && (
          <Pressable
            onPress={clear}
            disabled={saving}
            accessibilityRole="button"
            style={{
              padding: 13,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: color.border,
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ fontSize: 13, color: color.warm }}>
              Remove {occupied.title} from this slot
            </Text>
          </Pressable>
        )}

        {results.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => choose(game)}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={`Make ${game.title} favorite ${position}`}
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

        {query.trim() !== '' && results.length === 0 && (
          <Text style={{ fontSize: 13, color: color.textDim, lineHeight: 20 }}>
            Nothing matches “{query.trim()}”. A favorite has to be a game we know about — the
            catalogue grows when the IGDB sync lands.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
