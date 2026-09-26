import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import type { RootStackParamList } from './src/navigation';
import { GameScreen } from './src/screens/GameScreen';
import { LogScreen } from './src/screens/LogScreen';
import { PickGameScreen } from './src/screens/PickGameScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { PickFavoriteScreen } from './src/screens/PickFavoriteScreen';
import { EntryScreen } from './src/screens/EntryScreen';
import { PlaythroughScreen } from './src/screens/PlaythroughScreen';
import { TabsScreen } from './src/screens/TabsScreen';
import { ProfileProvider } from './src/profile';
import { LibraryProvider } from './src/store';
import { color } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation draws the gaps between screens, so it needs the palette too —
// otherwise pushes flash white on the way in.
const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: color.bg,
    card: color.bg,
    text: color.text,
    border: color.surface2,
    primary: color.star,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <ProfileProvider>
        <ExpoStatusBar style="light" />
        <NavigationContainer theme={theme}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: color.bg },
              headerTintColor: color.star,
              headerTitleStyle: { color: color.text, fontSize: 16 },
              contentStyle: { backgroundColor: color.bg },
            }}
          >
            <Stack.Screen name="Tabs" component={TabsScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={({ route }) => ({ title: route.params.title })}
            />
            <Stack.Screen
              name="Playthrough"
              component={PlaythroughScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Entry" component={EntryScreen} options={{ headerShown: false }} />
            {/* Both steps of logging are one modal: the picker replaces itself
                with the form, so dismissing either gets you out in one go. */}
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ title: 'Edit profile', presentation: 'modal' }}
            />
            <Stack.Screen
              name="PickFavorite"
              component={PickFavoriteScreen}
              options={{ title: 'Pick a favorite', presentation: 'modal' }}
            />
            <Stack.Screen
              name="PickGame"
              component={PickGameScreen}
              options={{ title: 'Log a game', presentation: 'modal' }}
            />
            <Stack.Screen
              name="Log"
              component={LogScreen}
              options={({ route }) => ({
                title: route.params?.editId !== undefined ? 'Edit entry' : 'Log a game',
                presentation: 'modal',
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ProfileProvider>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
