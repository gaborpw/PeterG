import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as api from '../api';
import type { Activity } from '../api';
import { Cover } from './Cover';
import { friendlyDate } from '../dates';
import { color, radius } from '../theme';

/**
 * What you have actually been playing, newest first.
 *
 * The diary on a playthrough answers "how did this game go". This answers
 * "what have I been up to", which is the question a profile exists to answer
 * and the reason a session is worth logging at all — otherwise it is a number
 * that goes up in private.
 */
export function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const navigation = useNavigation();
  const [items, setItems] = useState<Activity[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    api
      .listActivity(limit)
      .then((found) => {
        if (live) setItems(found);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [limit]);

  if (failed) {
    return (
      <Text style={{ fontSize: 12.5, color: color.textFaint, lineHeight: 19 }}>
        Could not load your activity.
      </Text>
    );
  }

  if (items === null) return null;

  if (items.length === 0) {
    return (
      <Text style={{ fontSize: 12.5, color: color.textFaint, lineHeight: 19 }}>
        Nothing logged yet. Tap ➕ after you play and it shows up here.
      </Text>
    );
  }

  return (
    <View style={{ gap: 9 }}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() =>
            navigation.navigate('Playthrough', { id: String(item.playthroughId) })
          }
          accessibilityRole="button"
          accessibilityLabel={`${item.hours} hours of ${item.title}, ${friendlyDate(item.playedOn)}`}
          style={{
            flexDirection: 'row',
            gap: 11,
            padding: 11,
            borderRadius: radius.lg,
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor: color.border,
          }}
        >
          <Cover title={item.title} url={item.coverUrl} width={38} height={53} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13.5, fontWeight: '600', color: color.text }}>
              {item.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 }}>
              <Text style={{ fontSize: 12.5, fontWeight: '600', color: color.active }}>
                {item.hours}h
              </Text>
              <Text style={{ fontSize: 11.5, color: color.textFaint }}>
                {friendlyDate(item.playedOn)}
              </Text>
            </View>
            {item.note !== undefined && item.note !== '' && (
              <Text style={{ fontSize: 12.5, color: '#C8CDD5', marginTop: 6, lineHeight: 18 }}>
                {item.note}
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
