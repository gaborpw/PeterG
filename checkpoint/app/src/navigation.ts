import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * One stack for the whole app: the tab shell, plus the screens you push on top
 * of it. Pushing rather than swapping tabs is what gives every detail screen a
 * back button for free.
 */
export type RootStackParamList = {
  Tabs: undefined;
  Game: { title: string; coverUrl?: string };
  /** One of your own playthroughs, by store id. */
  Playthrough: { id: string };
  /** Somebody else's entry, by id. */
  Entry: { id: string };
  /** The everyday action: time played today, across however many games. */
  LogSession: undefined;
  /** Starting something new: choose the game, then fill the form. */
  PickGame: undefined;
  Log: { title?: string; coverUrl?: string; editId?: string } | undefined;
  EditProfile: undefined;
  /** Choosing the game for one of the four slots. */
  PickFavorite: { position: number };
};

export type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'Game'>;
export type PlaythroughScreenProps = NativeStackScreenProps<RootStackParamList, 'Playthrough'>;
export type EntryScreenProps = NativeStackScreenProps<RootStackParamList, 'Entry'>;
export type LogScreenProps = NativeStackScreenProps<RootStackParamList, 'Log'>;
export type PickGameScreenProps = NativeStackScreenProps<RootStackParamList, 'PickGame'>;
export type LogSessionScreenProps = NativeStackScreenProps<RootStackParamList, 'LogSession'>;
export type EditProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;
export type PickFavoriteScreenProps = NativeStackScreenProps<RootStackParamList, 'PickFavorite'>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
