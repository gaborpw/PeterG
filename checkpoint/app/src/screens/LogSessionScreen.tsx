import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Paused games are here on purpose: picking one back up after a month is
  // exactly the moment you want to log a session, and hiding it would mean
  // going the long way round to do the obvious thing.
  const candidates = byStatus('playing', 'ongoing', 'paused');

  const entries = Object.entries(hours)
    .filter(([, h]) => h > 0)
    .map(([id, h]) => ({ id, hours: h, note: notes[id]?.trim() ?? '' }));

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
                  padding: 11,
                  borderRadius: radius.lg,
                  backgroundColor: color.surface,
                  borderWidth: 1,
                  borderColor: added > 0 ? '#33513F' : color.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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

                {/* Only once there is time to describe. A note box on every
                    row, most of them blank, is a form; one that appears when
                    you add half an hour is an invitation. */}
                {added > 0 && (
                  <TextInput
                    value={notes[p.id] ?? ''}
                    onChangeText={(text) => setNotes((n) => ({ ...n, [p.id]: text }))}
                    placeholder="How was it? (optional)"
                    placeholderTextColor={color.textFaint}
                    maxLength={280}
                    style={{
                      marginTop: 10,
                      minHeight: 42,
                      paddingHorizontal: 11,
                      borderRadius: radius.md,
                      backgroundColor: color.bg,
                      borderWidth: 1,
                      borderColor: color.border,
                      color: color.text,
                      fontSize: 13.5,
                    }}
                  />
                )}
              </View>
            );
          })
        )}

        {lastError !== null && (
          <Text style={{ fontSize: 12.5, color: color.warm, lineHeight: 18 }}>{lastError}</Text>
        )}

        {/* Whichever action you are actually here for is the filled one.
            With time added, that is the session; with none, you have opened
            this screen to start something, so that becomes primary. Two
            filled buttons would mean neither is. */}
        {entries.length > 0 && (
          <Pressable
            onPress={save}
            disabled={saving}
            accessibilityRole="button"
            style={{
              minHeight: 54,
              borderRadius: radius.md,
              backgroundColor: color.star,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: saving ? 0.5 : 1,
            }}
          >
            <Text style={{ fontSize: 15.5, fontWeight: '700', color: '#14120F' }}>
              {saving
                ? 'Saving…'
                : `Log ${total}h across ${entries.length} ${entries.length === 1 ? 'game' : 'games'}`}
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => navigation.replace('PickGame')}
          accessibilityRole="button"
          style={{
            minHeight: 54,
            borderRadius: radius.md,
            backgroundColor: entries.length === 0 ? color.star : 'transparent',
            borderWidth: entries.length === 0 ? 0 : 1,
            borderColor: color.star,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 15.5,
              fontWeight: '700',
              color: entries.length === 0 ? '#14120F' : color.star,
            }}
          >
            Log a new game
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
