import { createContext, useContext } from 'react';

export type Segment = 'playing' | 'soon' | 'done' | 'all';

/**
 * A way for one tab to send you to another.
 *
 * The tab bar owns which tab is showing and the library owns which segment,
 * which left the profile unable to act on its own numbers: tapping "3 LOGGED"
 * did nothing, because the screen that could answer it was two levels away.
 * Rather than lifting all that state into a store, this exposes the one
 * crossing the app actually needs.
 */
export type TabsControl = {
  openLibrary: (segment: Segment) => void;
};

const TabsContext = createContext<TabsControl | null>(null);

export const TabsProvider = TabsContext.Provider;

export function useTabs(): TabsControl {
  const value = useContext(TabsContext);
  if (value === null) throw new Error('useTabs must be used inside TabsScreen');
  return value;
}
