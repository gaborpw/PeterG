import { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar, type Tab } from '../components/TabBar';
import { HomeScreen } from './HomeScreen';
import { LibraryScreen } from './LibraryScreen';
import { ProfileScreen } from './ProfileScreen';
import { SearchScreen } from './SearchScreen';
import { color } from '../theme';

export function TabsScreen() {
  const [tab, setTab] = useState<Tab>('home');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // The centre button pushes the log screen rather than switching tabs, so you
  // never lose the screen you were on to log something.
  function onTab(next: Tab) {
    if (next === 'log') {
      navigation.navigate('Log');
      return;
    }
    setTab(next);
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'search' && <SearchScreen />}
        {tab === 'library' && <LibraryScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </View>
      <TabBar active={tab} onChange={onTab} bottomInset={insets.bottom} />
    </View>
  );
}
