import { Modal, Pressable, Text, View } from 'react-native';
import { Star } from './Stars';
import type { Playthrough } from '../data';
import { color, radius } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Your log of this game, if you have one. */
  yours?: Playthrough;
  onRate: (rating: number) => void;
  onToggleLike: () => void;
  onSetPlaying: () => void;
  onWishlist: () => void;
  onLogSession: () => void;
  onReviewOrLog: () => void;
  onRemove: () => void;
};

/**
 * Everything you can do to a game, in one sheet.
 *
 * Modelled on Letterboxd's, and the reason it beats a menu is the rating row:
 * you can put four stars on something in two taps without opening a form,
 * which is the difference between rating games and meaning to.
 *
 * A scrim rather than a blur. Blurring needs expo-blur, and a dependency for
 * one backdrop on one sheet is not a trade worth making — on a dark theme the
 * scrim reads nearly the same.
 */
export function GameActionSheet(props: Props) {
  const { visible, onClose, title, subtitle, yours } = props;
  const inLibrary = yours !== undefined;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{
          flex: 1,
          backgroundColor: 'rgba(8,9,12,0.86)',
          justifyContent: 'flex-end',
          padding: 14,
        }}
      >
        {/* Swallows taps so pressing the sheet does not dismiss it. */}
        <Pressable onPress={() => {}} style={{ gap: 10 }}>
          <View style={{ alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: color.text }}>{title}</Text>
            {subtitle !== undefined && (
              <Text style={{ fontSize: 13, color: color.textDim, marginTop: 3 }}>{subtitle}</Text>
            )}
          </View>

          <View
            style={{
              borderRadius: radius.lg,
              backgroundColor: color.surface2,
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <IconAction
                glyph="▶"
                label="Playing"
                on={yours?.status === 'playing' || yours?.status === 'ongoing'}
                onPress={props.onSetPlaying}
              />
              <Divider vertical />
              <IconAction
                glyph="♥"
                label="Like"
                on={yours?.liked === true}
                warm
                onPress={props.onToggleLike}
              />
              <Divider vertical />
              <IconAction
                glyph="＋"
                label="Wishlist"
                on={yours?.status === 'wishlist'}
                onPress={props.onWishlist}
              />
            </View>

            <Divider />

            <View style={{ paddingVertical: 13, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: color.textDim }}>
                {yours?.rating === undefined ? 'Rate' : `Rated ${yours.rating}`}
              </Text>
              <RatingRow value={yours?.rating ?? 0} onRate={props.onRate} />
            </View>

            {inLibrary && (
              <>
                <Divider />
                <RowAction label="Log a session" onPress={props.onLogSession} />
              </>
            )}

            <Divider />
            <RowAction
              label={inLibrary ? 'Review or log' : 'Log this game'}
              onPress={props.onReviewOrLog}
            />

            {inLibrary && (
              <>
                <Divider />
                <RowAction label="Remove from library" onPress={props.onRemove} destructive />
              </>
            )}
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={{
              minHeight: 54,
              borderRadius: radius.lg,
              backgroundColor: color.surface2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: color.text }}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * Five stars, each split down the middle.
 *
 * The left half of a star is the half rating, the right half is the whole one,
 * which is how Letterboxd does it and why half stars there cost no extra
 * interface. Our log form needs a separate ½ toggle; this does not.
 */
function RatingRow({ value, onRate }: { value: number; onRate: (rating: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 9 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <View key={n} style={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}>
          <Star fill={Math.min(Math.max(value - (n - 1), 0), 1)} size={30} />

          <Pressable
            onPress={() => onRate(n - 0.5)}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${n - 0.5} out of 5`}
            style={{ position: 'absolute', left: 0, top: 0, width: 23, height: 46 }}
          />
          <Pressable
            onPress={() => onRate(n)}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${n} out of 5`}
            style={{ position: 'absolute', right: 0, top: 0, width: 23, height: 46 }}
          />
        </View>
      ))}
    </View>
  );
}

function IconAction({
  glyph,
  label,
  on,
  warm,
  onPress,
}: {
  glyph: string;
  label: string;
  on: boolean;
  warm?: boolean;
  onPress: () => void;
}) {
  const tint = on ? (warm === true ? color.warm : color.active) : color.textDim;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={{ flex: 1, paddingVertical: 15, alignItems: 'center', gap: 7 }}
    >
      <Text style={{ fontSize: 23, color: tint }}>{glyph}</Text>
      <Text style={{ fontSize: 12.5, color: tint }}>{label}</Text>
    </Pressable>
  );
}

function RowAction({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ minHeight: 52, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: 15, color: destructive === true ? color.warm : color.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

const Divider = ({ vertical }: { vertical?: boolean }) => (
  <View
    style={
      vertical === true
        ? { width: 1, backgroundColor: color.border }
        : { height: 1, backgroundColor: color.border }
    }
  />
);
