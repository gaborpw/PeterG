import { Pressable, Text, View } from 'react-native';
import { color, radius } from '../theme';

/**
 * A small panel of actions anchored under the button that opened it.
 *
 * Shared because the library rows and the game page both want one, and the
 * alternative — a system alert — dims the whole screen and demands a decision
 * for what is a two or three item menu.
 */
export function Menu({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 46,
        [align]: 0,
        minWidth: 190,
        borderRadius: radius.md,
        backgroundColor: color.surface2,
        borderWidth: 1,
        borderColor: color.border,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

export function MenuItem({
  label,
  onPress,
  destructive,
  first,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  first?: boolean;
}) {
  return (
    <>
      {first !== true && <View style={{ height: 1, backgroundColor: color.border }} />}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={{ minHeight: 46, justifyContent: 'center', paddingHorizontal: 15 }}
      >
        <Text style={{ fontSize: 13.5, color: destructive === true ? color.warm : color.text }}>
          {label}
        </Text>
      </Pressable>
    </>
  );
}

/** The button that opens one. Kept here so the two never drift apart. */
export function MenuButton({ open, onPress, label }: { open: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded: open }}
      hitSlop={8}
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: 19, color: open ? color.text : color.textFaint, marginTop: -4 }}>
        ⋯
      </Text>
    </Pressable>
  );
}
