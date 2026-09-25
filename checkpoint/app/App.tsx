import { useState } from 'react';
import { Modal, Platform, Pressable, StatusBar, Text, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { TabBar, type Tab } from './src/components/TabBar';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { color } from './src/theme';

// Safe-area padding without pulling in react-native-safe-area-context.
const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;

/** A sheet needs its own way out — there is no tab bar inside one. */
function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View
      style={{
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#191C22',
      }}
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{ minHeight: 44, minWidth: 60, justifyContent: 'center', paddingHorizontal: 8 }}
      >
        <Text style={{ fontSize: 14, color: color.textDim }}>Close</Text>
      </Pressable>
      <Text style={{ fontSize: 15, fontWeight: '600', color: color.text }}>{title}</Text>
      <View style={{ minWidth: 60 }} />
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [logOpen, setLogOpen] = useState(false);

  // The centre button opens a sheet rather than switching tabs, so you never
  // lose the screen you were on to log something.
  function onTab(next: Tab) {
    if (next === 'log') {
      setLogOpen(true);
      return;
    }
    setTab(next);
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.bg, paddingTop: topInset }}>
      <ExpoStatusBar style="light" />

      <View style={{ flex: 1 }}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'library' && <LibraryScreen />}
        {tab === 'search' && <SearchScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </View>

      <TabBar active={tab} onChange={onTab} />

      <Modal
        visible={logOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLogOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: color.bg }}>
          <SheetHeader title="Elden Ring" onClose={() => setLogOpen(false)} />
          <GameScreen />
        </View>
      </Modal>
    </View>
  );
}
