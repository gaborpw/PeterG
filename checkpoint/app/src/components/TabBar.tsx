import { Pressable, Text, View } from 'react-native';
import { color } from '../theme';

export type Tab = 'home' | 'library' | 'log' | 'search' | 'profile';

type Props = { active: Tab; onChange: (t: Tab) => void };

export function TabBar({ active, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: color.surface2,
        backgroundColor: color.bg,
        paddingBottom: 18,
        paddingTop: 10,
      }}
    >
      <Slot tab="home" label="Home" active={active} onChange={onChange}>
        <HomeIcon on={active === 'home'} />
      </Slot>
      <Slot tab="library" label="Library" active={active} onChange={onChange}>
        <LibraryIcon on={active === 'library'} />
      </Slot>

      <Pressable
        onPress={() => onChange('log')}
        accessibilityRole="button"
        accessibilityLabel="Log a game"
        style={{ width: 62, alignItems: 'center', justifyContent: 'center' }}
      >
        <View
          style={{
            width: 46,
            height: 34,
            borderRadius: 10,
            backgroundColor: color.star,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus />
        </View>
      </Pressable>

      <Slot tab="search" label="Search" active={active} onChange={onChange}>
        <SearchIcon on={active === 'search'} />
      </Slot>
      <Slot tab="profile" label="Profile" active={active} onChange={onChange}>
        <ProfileIcon on={active === 'profile'} />
      </Slot>
    </View>
  );
}

function Slot({
  tab,
  label,
  active,
  onChange,
  children,
}: {
  tab: Tab;
  label: string;
  active: Tab;
  onChange: (t: Tab) => void;
  children: React.ReactNode;
}) {
  const on = active === tab;
  return (
    <Pressable
      onPress={() => onChange(tab)}
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      accessibilityLabel={label}
      style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 6 }}
    >
      <View style={{ height: 18, justifyContent: 'center' }}>{children}</View>
      <Text style={{ fontSize: 9.5, color: on ? color.star : color.textFaint }}>{label}</Text>
    </Pressable>
  );
}

// Icons are drawn from Views rather than SVG, which keeps the dependency list
// to what actually installs. Each is 18 wide so the row stays even.

function tint(on: boolean) {
  return on ? color.star : color.textFaint;
}

function HomeIcon({ on }: { on: boolean }) {
  return (
    <View style={{ width: 18, alignItems: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 9,
          borderRightWidth: 9,
          borderBottomWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: tint(on),
        }}
      />
      <View
        style={{
          width: 13,
          height: 9,
          backgroundColor: tint(on),
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
    </View>
  );
}

function LibraryIcon({ on }: { on: boolean }) {
  return (
    <View style={{ width: 18, flexDirection: 'row', gap: 2.5, alignItems: 'flex-end' }}>
      <View style={{ width: 4, height: 13, borderRadius: 1, backgroundColor: tint(on) }} />
      <View style={{ width: 4, height: 17, borderRadius: 1, backgroundColor: tint(on) }} />
      <View style={{ width: 4, height: 15, borderRadius: 1, backgroundColor: tint(on) }} />
    </View>
  );
}

function SearchIcon({ on }: { on: boolean }) {
  return (
    <View style={{ width: 18, height: 18 }}>
      <View
        style={{
          width: 13,
          height: 13,
          borderRadius: 7,
          borderWidth: 2,
          borderColor: tint(on),
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 1,
          bottom: 1,
          width: 6,
          height: 2,
          borderRadius: 1,
          backgroundColor: tint(on),
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

function ProfileIcon({ on }: { on: boolean }) {
  return (
    <View style={{ width: 18, alignItems: 'center' }}>
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: tint(on),
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 14,
          height: 8,
          borderTopLeftRadius: 7,
          borderTopRightRadius: 7,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: tint(on),
        }}
      />
    </View>
  );
}

function Plus() {
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 14, height: 2.2, borderRadius: 2, backgroundColor: '#14120F' }} />
      <View style={{ position: 'absolute', width: 2.2, height: 14, borderRadius: 2, backgroundColor: '#14120F' }} />
    </View>
  );
}
