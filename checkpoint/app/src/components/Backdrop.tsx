import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { color } from '../theme';

/**
 * A stable colour per title, so a game with no art still looks like itself
 * every time you open it rather than a different grey each render.
 */
const tintFor = (title: string) => {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) | 0;
  const tints = ['#2E3A46', '#3A3346', '#2E4640', '#46342E', '#3B2E46', '#464232'];
  return tints[Math.abs(h) % tints.length];
};

type Props = {
  title: string;
  url?: string;
  onBack: () => void;
  height?: number;
};

/**
 * The atmospheric image behind a screen's header.
 *
 * Without one the screen still works: the fallback is a deep tint rather than
 * a grey rectangle, so a game with no art reads as deliberate. The scrim at the
 * bottom is not decoration — content sits over it and needs the contrast.
 */
export function Backdrop({ title, url, onBack, height = 260 }: Props) {
  // Not every Steam app has a library_hero image, so a URL being present is not
  // a promise that it loads. Treat a failed load exactly like having no art.
  const [failed, setFailed] = useState(false);
  const showArt = url !== undefined && !failed;

  return (
    <View style={{ height, backgroundColor: tintFor(title) }}>
      {showArt ? (
        <Image
          source={{ uri: url }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={`Artwork from ${title}`}
          onError={() => setFailed(true)}
        />
      ) : (
        // The title set large and low-contrast reads as a deliberate cover
        // treatment; an empty tinted box reads as a loading bug.
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 22 }}>
          <Text
            numberOfLines={3}
            style={{
              fontSize: 34,
              fontWeight: '800',
              letterSpacing: -0.5,
              color: color.text,
              opacity: 0.13,
            }}
          >
            {title}
          </Text>
        </View>
      )}

      {/* Bottom third fades to the page colour so the content below joins on. */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.55,
          backgroundColor: color.bg,
          opacity: 0.86,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: height * 0.25,
          backgroundColor: color.bg,
        }}
      />

      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: 'rgba(15,17,21,0.72)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20, color: color.text, lineHeight: 22, marginLeft: -2 }}>‹</Text>
        </View>
      </Pressable>
    </View>
  );
}
