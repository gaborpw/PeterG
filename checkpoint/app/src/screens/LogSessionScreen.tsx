import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Cover } from '../components/Cover';
import type { LogSessionScreenProps } from '../navigation';
import { useLibrary } from '../store';
import { color, radius, space } from '../theme';

/**
 * What did you play today, and for how long.
 *
 * The most repeated action in the app, per docs/spec.md 4.1, and until now it
 * did not exist: keeping a total current meant opening a game, working out
 * what the new total should be, and typing it over the old one. Arithmetic is
 * not a feature. Here you say "two hours on this, one on that" and the totals
 * look after themselves — and because each session carries a date, the app
 * finally knows when you played rather than only how much.
 */
export function LogSessionScreen({ navigation }: LogSessionScreenProps) {
  const { byStatus, logSessions, lastError } = useLibrary();
  const [hours, setHours] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // Paused games are here on purpose: picking one back up after a month is
  // exactly the moment you want to log a session, and hiding it would mean
  // going the long way round to do the obvious thing.
  const candidates = byStatus('playing', 'ongoing', 'paused');

  const entries = Object.entries(hours)
    .filter(([, h]) => h > 0)
    .map(([id, h]) => ({ id, hours: h }));

  const total = entries.reduce((sum, e) => sum + e.hours, 0);

  function bump(id: string, by: number) {
    setHours((current) => {
      const next = Math.max(0, Math.round(((current[id] ?? 0) + by) * 2) / 2);
      return { ...current, [id]: next };
    });
  }

  async function save() {
    if (entries.length === 0) return;
    setSaving(true);
    const ok = await logSessions(entries);
    setSaving(false);
    if (ok) navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: 30 }}>
        <View>
          <Text style={{ fontSize: 25, fontWeight: '700', color: color.text }}>
            What did you play?
          </Text>
          <Text style={{ fontSize: 13, color: color.textDim, marginTop: 7, lineHeight: 19 }}>
            Add time to anything in rotation. Totals update themselves.
          </Text>
        </View>

        {candidates.length === 0 ? (
          <View
            style={{
              padding: 18,
              borderRadius: radius.lg,
              backgroundColor: color.surface,
              borderWidth: 1,
              borderColor: color.border,
              borderStyle: 'dashed',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: color.text }}>
              Nothing in rotation
            </Text>
            <Text style={{ fontSize: 12.5, color: color.textDim, marginTop: 7, lineHeight: 19 }}>
              Start a game first and it will show up here to add sessions to.
            </Text>
          </View>
        ) : (
          candidates.map((p) => {
            const added = hours[p.id] ?? 0;
            return (
              <View
                key={p.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 11,
                  borderRadius: radius.lg,
                  backgroundColor: color.surface,
                  borderWidth: 1,
                  borderColor: added > 0 ? '#33513F' : color.border,
                }}
              >
                <Cover title={p.title} url={p.coverUrl} width={40} height={56} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: color.text }}>
                    {p.title}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: color.textFaint, marginTop: 4 }}>
                    {p.hours}h logged
                    {added > 0 ? ` → ${p.hours + added}h` : ''}
                  </Text>
                </View>

                <Step label="−" onPress={() => bump(p.id, -0.5)} dim={added === 0} />
                <Text
                  style={{
                    minWidth: 42,
                    textAlign: 'center',
                    fontSize: 15,
                    fontWeight: '600',
                    color: added > 0 ? color.active : color.textFaint,
                  }}
                >
                  {added > 0 ? `${added}h` : '—'}
                </Text>
                <Step label="+" onPress={() => bump(p.id, 0.5)} />
              </View>
            );
          })
        )}

        {lastError !== null && (
          <Text style={{ fontSize: 12.5, color: color.warm, lineHeight: 18 }}>{lastError}</Text>
        )}

        <Pressable
          onPress={save}
          disabled={entries.length === 0 || saving}
          accessibilityRole="button"
          style={{
            minHeight: 52,
            borderRadius: radius.md,
            backgroundColor: color.star,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: entries.length === 0 || saving ? 0.4 : 1,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#14120F' }}>
            {saving
              ? 'Saving…'
              : entries.length === 0
                ? 'Add some time'
                : `Log ${total}h across ${entries.length} ${entries.length === 1 ? 'game' : 'games'}`}
          </Text>
        </Pressable>

        {/* Starting something new is a different job from continuing one, and
            it needs the whole form. */}
        <Pressable
          onPress={() => navigation.replace('PickGame')}
          accessibilityRole="button"
          style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 13.5, fontWeight: '500', color: color.text }}>
            Log something new instead ›
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Step({ label, onPress, dim }: { label: string; onPress: () => void; dim?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'Add half an hour' : 'Remove half an hour'}
      style={{
        width: 38,
        height: 38,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: color.border,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: dim === true ? 0.35 : 1,
      }}
    >
      <Text style={{ fontSize: 17, color: color.text }}>{label}</Text>
    </Pressable>
  );
}
