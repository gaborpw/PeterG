import { useState } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { TabBar, type Tab } from './src/components/TabBar';
import { FeedScreen } from './src/screens/FeedScreen';
import { GameScreen } from './src/screens/GameScreen';
import { PlayingScreen } from './src/screens/PlayingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { color } from './src/theme';

// Safe-area padding without pulling in react-native-safe-area-context. Swap this
// for useSafeAreaInsets when expo-router lands — see README.
const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 44;

export default function App() {
  const [tab, setTab] = useState<Tab>('playing');

  return (
    <View style={{ flex: 1, backgroundColor: color.bg, paddingTop: topInset }}>
      <ExpoStatusBar style="light" />
      <View style={{ flex: 1 }}>
        {tab === 'feed' && <FeedScreen />}
        {tab === 'playing' && <PlayingScreen />}
        {tab === 'game' && <GameScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </View>
      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}
