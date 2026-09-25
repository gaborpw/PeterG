import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Cover } from '../components/Cover';
import type { Status } from '../data';
import type { LogScreenProps } from '../navigation';
import { useLibrary } from '../store';
import { color, radius, space } from '../theme';

const STATUSES: { key: Status; label: string }[] = [
  { key: 'playing', label: 'Playing' },
  { key: 'finished', label: 'Finished' },
  { key: 'paused', label: 'Paused' },
  { key: 'abandoned', label: 'Dropped' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'backlog', label: 'Backlog' },
];

const PLATFORMS = ['PS5', 'Xbox', 'Switch', 'PC', 'Steam Deck'];

export function LogScreen({ route, navigation }: LogScreenProps) {
  const { log, all } = useLibrary();

  // Editing an existing entry rather than creating one. Everything below is
  // seeded from it, so the form opens as a record of what you already said.
  const editing =
    route.params?.editId !== undefined
      ? all.find((p) => p.id === route.params?.editId)
      : undefined;

  const [title, setTitle] = useState(editing?.title ?? route.params?.title ?? '');
  const [platform, setPlatform] = useState(
    editing?.platform !== undefined && PLATFORMS.includes(editing.platform)
      ? editing.platform
      : 'PC',
  );
  const [status, setStatus] = useState<Status>(editing?.status ?? 'playing');
  const [hours, setHours] = useState(String(editing?.hours ?? 0));
  // A 4.5 is stored as four whole stars plus the half toggle.
  const [rating, setRating] = useState(
    editing?.rating !== undefined ? Math.ceil(editing.rating) : 0,
  );
  const [half, setHalf] = useState(
    editing?.rating !== undefined && editing.rating % 1 !== 0,
  );
  const [liked, setLiked] = useState(editing?.liked ?? false);
  const [review, setReview] = useState(editing?.review ?? '');

  const value = rating > 0 && half ? rating - 0.5 : rating;
  const canSave = title.trim().length > 0;

  function save() {
    if (!canSave) return;
    log({
      title,
      platform,
      status,
      hours: Number.parseFloat(hours) || 0,
      rating: value > 0 ? value : undefined,
      liked,
      review: review.trim() === '' ? undefined : review.trim(),
      coverUrl: editing?.coverUrl ?? route.params?.coverUrl,
    });
    navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xxl, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <Cover
            title={title || 'Untitled'}
            url={editing?.coverUrl ?? route.params?.coverUrl}
            width={56}
            height={78}
          />
          <View style={{ flex: 1 }}>
            <Label>Game</Label>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What did you play?"
              placeholderTextColor={color.textFaint}
              style={{
                minHeight: 46,
                paddingHorizontal: 13,
                borderRadius: radius.md,
                backgroundColor: color.surface,
                borderWidth: 1,
                borderColor: color.border,
                color: color.text,
                fontSize: 15,
              }}
            />
          </View>
        </View>

        <View>
          <Label>Status</Label>
          <Pills
            options={STATUSES.map((s) => s.label)}
            selected={STATUSES.find((s) => s.key === status)?.label ?? ''}
            onSelect={(label) => {
              const hit = STATUSES.find((s) => s.label === label);
              if (hit) setStatus(hit.key);
            }}
            tone="active"
          />
        </View>

        <View>
          <Label>Platform</Label>
          <Pills options={PLATFORMS} selected={platform} onSelect={setPlatform} tone="neutral" />
        </View>

        <View>
          <Label>Hours</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Step label="−" onPress={() => setHours((h) => String(Math.max(0, (Number(h) || 0) - 1)))} />
            <TextInput
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: radius.md,
                backgroundColor: color.surface,
                borderWidth: 1,
                borderColor: color.border,
                color: color.text,
                fontSize: 19,
                fontWeight: '600',
                textAlign: 'center',
              }}
            />
            <Step label="+" onPress={() => setHours((h) => String((Number(h) || 0) + 1))} />
          </View>
        </View>

        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Label>Rating</Label>
            <Text style={{ fontSize: 13, color: color.star }}>
              {value > 0 ? `${value.toFixed(1)} / 5` : 'Not rated'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= Math.floor(value);
              const isHalf = n === Math.ceil(value) && value % 1 !== 0;
              return (
                <Pressable
                  key={n}
                  onPress={() => {
                    setRating(n);
                    setHalf(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${n} out of 5`}
                  style={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: filled || isHalf ? color.star : color.starEmpty,
                      opacity: isHalf ? 0.55 : 1,
                    }}
                  />
                </Pressable>
              );
            })}
            <View style={{ flex: 1 }} />
            <Toggle label="½" on={half} onPress={() => setHalf((h) => !h)} />
            <Toggle label="♥" on={liked} onPress={() => setLiked((l) => !l)} warm />
          </View>
        </View>

        <View>
          <Label>Review</Label>
          <TextInput
            value={review}
            onChangeText={setReview}
            multiline
            placeholder="Optional. What did it feel like?"
            placeholderTextColor={color.textFaint}
            style={{
              minHeight: 96,
              padding: 13,
              borderRadius: radius.md,
              backgroundColor: color.surface,
              borderWidth: 1,
              borderColor: color.border,
              color: color.text,
              fontSize: 13.5,
              lineHeight: 20,
              textAlignVertical: 'top',
            }}
          />
        </View>

        <Pressable
          onPress={save}
          disabled={!canSave}
          accessibilityRole="button"
          style={{
            minHeight: 52,
            borderRadius: radius.lg,
            backgroundColor: canSave ? color.star : color.surface2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: canSave ? '#14120F' : color.textFaint,
            }}
          >
            {editing !== undefined ? 'Save changes' : 'Save to library'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Label({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontSize: 10,
        letterSpacing: 1,
        fontWeight: '600',
        color: color.textFaint,
        marginBottom: 10,
      }}
    >
      {children.toUpperCase()}
    </Text>
  );
}

function Pills({
  options,
  selected,
  onSelect,
  tone,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  tone: 'active' | 'neutral';
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const on = o === selected;
        const border = on ? (tone === 'active' ? color.active : color.star) : color.border;
        const bg = on ? (tone === 'active' ? '#1D2A23' : '#2B2419') : 'transparent';
        const fg = on ? (tone === 'active' ? '#8FCBA8' : color.star) : '#C8CDD5';
        return (
          <Pressable
            key={o}
            onPress={() => onSelect(o)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              minHeight: 44,
              paddingHorizontal: 15,
              justifyContent: 'center',
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: bg,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: on ? '500' : '400', color: fg }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Step({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'More hours' : 'Fewer hours'}
      style={{
        width: 46,
        height: 46,
        borderRadius: radius.md,
        backgroundColor: color.surface2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 20, color: color.text }}>{label}</Text>
    </Pressable>
  );
}

function Toggle({
  label,
  on,
  onPress,
  warm,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  warm?: boolean;
}) {
  const accent = warm === true ? color.warm : color.star;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={{
        minWidth: 46,
        minHeight: 46,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: on ? accent : color.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 16, color: on ? accent : color.textFaint }}>{label}</Text>
    </Pressable>
  );
}
