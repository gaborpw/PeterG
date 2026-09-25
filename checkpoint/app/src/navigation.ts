import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * One stack for the whole app: the tab shell, plus the screens you push on top
 * of it. Pushing rather than swapping tabs is what gives every detail screen a
 * back button for free.
 */
export type RootStackParamList = {
  Tabs: undefined;
  Game: { title: string; coverUrl?: string };
  Log: { title?: string; coverUrl?: string } | undefined;
};

export type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'Game'>;
export type LogScreenProps = NativeStackScreenProps<RootStackParamList, 'Log'>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
