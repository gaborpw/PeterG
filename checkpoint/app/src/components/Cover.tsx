import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { color, radius } from '../theme';

type Props = {
  title: string;
  /** Remote cover art. Undefined, or a URL that fails to load, falls back. */
  url?: string;
  width: number;
  height: number;
};

/**
 * A game's cover.
 *
 * Every catalogue has holes — obscure releases, regional editions, anything
 * pre-2000 — so the fallback is not an error state, it is the normal state for
 * a chunk of the library. It draws a typographic cover instead of a grey box:
 * the title set on a tint derived from the title itself, so the same game is
 * always the same colour and a shelf of them reads as deliberate.
 */
export function Cover({ title, url, width, height }: Props) {
  const [failed, setFailed] = useState(false);
  const showArt = url !== undefined && !failed;

  return (
    <View
      style={{
        width,
        height,
        borderRadius: Math.max(6, width * 0.09),
        backgroundColor: showArt ? color.surface2 : tintFor(title),
        borderWidth: 1,
        borderColor: color.border,
        overflow: 'hidden',
        justifyContent: 'flex-end',
      }}
    >
      {showArt ? (
        <Image
          source={{ uri: url }}
          onError={() => setFailed(true)}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={`${title} cover art`}
        />
      ) : (
        <Text
          numberOfLines={4}
          style={{
            padding: Math.max(5, width * 0.09),
            color: color.text,
            fontSize: Math.max(8, Math.min(15, width * 0.155)),
            lineHeight: Math.max(10, Math.min(18, width * 0.19)),
            fontWeight: '600',
          }}
        >
          {title}
        </Text>
      )}
    </View>
  );
}

/**
 * A stable colour per title. Deterministic so a game keeps its identity across
 * screens and app launches, and dark enough that the title stays legible on it.
 */
function tintFor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }
  return TINTS[Math.abs(hash) % TINTS.length];
}

const TINTS = [
  '#2E3A46',
  '#3A3346',
  '#46342E',
  '#2E4640',
  '#453040',
  '#2F3E4A',
  '#463D2E',
  '#33304A',
] as const;
