import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { EditProfileScreenProps } from '../navigation';
import { useProfile } from '../profile';
import { color, radius, space } from '../theme';

const MAX_NAME = 60;
const MAX_BIO = 200;

/**
 * Editing who you are.
 *
 * The server validates all of this again — a client is something anyone can
 * write — but the limits are mirrored here so you find out as you type rather
 * than after tapping Save.
 */
export function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { profile, save, error } = useProfile();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [handle, setHandle] = useState(profile?.handle ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const trimmedName = displayName.trim();
  const trimmedHandle = handle.trim();
  const handleOk = /^[a-zA-Z0-9_]{3,20}$/.test(trimmedHandle);
  const canSave =
    !saving && trimmedName !== '' && trimmedName.length <= MAX_NAME && handleOk;

  async function onSave() {
    setSaving(true);
    const ok = await save({
      displayName: trimmedName,
      handle: trimmedHandle,
      bio: bio.trim(),
    });
    setSaving(false);
    // Stay put on failure: the error is above the button and the text you
    // typed is still here to fix.
    if (ok) navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl, paddingBottom: 40 }}>
        <Field label="Name" hint={`${trimmedName.length}/${MAX_NAME}`}>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={color.textFaint}
            maxLength={MAX_NAME}
            style={input}
          />
        </Field>

        <Field
          label="Handle"
          hint={handleOk || trimmedHandle === '' ? '3–20 letters, digits or _' : 'Not a valid handle'}
          warn={!handleOk && trimmedHandle !== ''}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* The @ is ours to draw, not yours to store — keeping it out of
                the value means "@peterg" and "peterg" cannot become two
                different handles. */}
            <Text style={{ fontSize: 15, color: color.textFaint, marginRight: 6 }}>@</Text>
            <TextInput
              value={handle}
              onChangeText={setHandle}
              placeholder="handle"
              placeholderTextColor={color.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              style={[input, { flex: 1 }]}
            />
          </View>
        </Field>

        <Field label="Bio" hint={`${bio.trim().length}/${MAX_BIO}`}>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="What do you play?"
            placeholderTextColor={color.textFaint}
            multiline
            maxLength={MAX_BIO}
            style={[input, { height: 92, paddingTop: 12, textAlignVertical: 'top' }]}
          />
        </Field>

        {error !== null && (
          <Text style={{ fontSize: 13, color: color.warm, lineHeight: 19 }}>{error}</Text>
        )}

        <Pressable
          onPress={onSave}
          disabled={!canSave}
          accessibilityRole="button"
          style={{
            minHeight: 52,
            borderRadius: radius.md,
            backgroundColor: color.star,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canSave ? 1 : 0.4,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#14120F' }}>
            {saving ? 'Saving…' : 'Save profile'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const input = {
  minHeight: 48,
  paddingHorizontal: 13,
  borderRadius: radius.md,
  backgroundColor: color.surface,
  borderWidth: 1,
  borderColor: color.border,
  color: color.text,
  fontSize: 15,
};

function Field({
  label,
  hint,
  warn,
  children,
}: {
  label: string;
  hint: string;
  warn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }}>
        <Text style={{ fontSize: 10, letterSpacing: 1, fontWeight: '600', color: color.textFaint }}>
          {label.toUpperCase()}
        </Text>
        <Text style={{ fontSize: 11, color: warm(warn) }}>{hint}</Text>
      </View>
      {children}
    </View>
  );
}

const warm = (on?: boolean) => (on === true ? color.warm : color.textFaint);
