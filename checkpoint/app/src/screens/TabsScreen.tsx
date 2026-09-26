import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar, type Tab } from '../components/TabBar';
import { HomeScreen } from './HomeScreen';
import { LibraryScreen } from './LibraryScreen';
import { ProfileScreen } from './ProfileScreen';
import { SearchScreen } from './SearchScreen';
import { TabsProvider, type Segment } from '../tabs';
import { color } from '../theme';

export function TabsScreen() {
  const [tab, setTab] = useState<Tab>('home');
  // Held here rather than inside the library so another tab can point at a
  // particular segment — see useTabs.
  const [segment, setSegment] = useState<Segment>('playing');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // The centre button opens the session sheet rather than switching tabs, so
  // you never lose the screen you were on to log something. It leads with
  // adding time to what you are already playing, because that is the thing
  // you will do a hundred times for every new game you start; starting one is
  // a link away from there.
  function onTab(next: Tab) {
    if (next === 'log') {
      navigation.navigate('LogSession');
      return;
    }
    setTab(next);
  }

  const control = useMemo(
    () => ({
      openLibrary: (next: Segment) => {
        setSegment(next);
        setTab('library');
      },
    }),
    [],
  );

  return (
    <TabsProvider value={control}>
    <View style={{ flex: 1, backgroundColor: color.bg, paddingTop: insets.top }}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'search' && <SearchScreen />}
        {tab === 'library' && <LibraryScreen segment={segment} onSegment={setSegment} />}
        {tab === 'profile' && <ProfileScreen />}
      </View>
      <TabBar active={tab} onChange={onTab} bottomInset={insets.bottom} />
    </View>
    </TabsProvider>
  );
}
