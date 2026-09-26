import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import * as api from '../api';
import type { Session } from '../api';
import { friendlyDate } from '../dates';
import { color, radius } from '../theme';

/**
 * The diary for one playthrough.
 *
 * Sessions were write-only until this existed: you could log an evening and
 * the total would move, but the evening itself — the date, the note you wrote
 * about it — had nowhere to be read. A diary you cannot read back is a
 * counter with extra steps.
 */
export function SessionList({ playthroughId }: { playthroughId: string }) {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    api
      .listSessions(playthroughId)
      .then((found) => {
        if (live) setSessions(found);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [playthroughId]);

  if (failed) {
    return (
      <Text style={{ fontSize: 12.5, color: color.textFaint, lineHeight: 19 }}>
        Could not load your sessions.
      </Text>
    );
  }

  // Nothing at all while loading. A spinner for a list that is usually short
  // and usually empty is more motion than information.
  if (sessions === null) return null;

  if (sessions.length === 0) {
    return (
      <Text style={{ fontSize: 12.5, color: color.textFaint, lineHeight: 19 }}>
        No sessions yet. The hours above were typed in rather than logged — use ➕ and they
        start collecting here.
      </Text>
    );
  }

  const total = sessions.reduce((sum, s) => sum + s.hours, 0);

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 11.5, color: color.textFaint }}>
        {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} · {total}h logged this way
      </Text>

      {sessions.map((s) => (
        <View
          key={s.id}
          style={{
            padding: 12,
            borderRadius: radius.md,
            backgroundColor: color.surface,
            borderWidth: 1,
            borderColor: color.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: color.active }}>
              {s.hours}h
            </Text>
            <Text style={{ fontSize: 12, color: color.textFaint }}>{friendlyDate(s.playedOn)}</Text>
          </View>
          {s.note !== undefined && s.note !== '' && (
            <Text style={{ fontSize: 12.5, color: '#C8CDD5', marginTop: 7, lineHeight: 18 }}>
              {s.note}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
