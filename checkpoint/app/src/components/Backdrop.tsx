import { Image, Pressable, Text, View } from 'react-native';
import { color } from '../theme';

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
  return (
    <View style={{ height, backgroundColor: color.surface2 }}>
      {url !== undefined && (
        <Image
          source={{ uri: url }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={`Artwork from ${title}`}
        />
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
