/**
 * The platforms you can log on.
 *
 * `value` is what the API stores and returns — platform.abbreviation, seeded in
 * migrations 0002 and 0003. Sending a name saves fine, because the lookup
 * matches on either, but it reads back as the abbreviation: a form offering
 * "Steam Deck" and a database returning "Deck" is how editing a Steam Deck
 * entry silently reset it to PC. Send and compare the stored value; show the
 * label.
 *
 * Ordered by how likely you are to reach for it rather than alphabetically —
 * current consoles, then last generation, then everything else. Adding a row
 * here without the matching migration row makes that platform unsavable.
 */
export const PLATFORMS: { value: string; label: string }[] = [
  { value: 'PS5', label: 'PS5' },
  { value: 'Xbox', label: 'Xbox Series' },
  { value: 'Switch 2', label: 'Switch 2' },
  { value: 'Switch', label: 'Switch' },
  { value: 'PC', label: 'PC' },
  { value: 'Deck', label: 'Steam Deck' },
  { value: 'PS4', label: 'PS4' },
  { value: 'Xbox One', label: 'Xbox One' },
  { value: 'Mac', label: 'Mac' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'VR', label: 'VR' },
  { value: 'Other', label: 'Other' },
];

export const PLATFORM_VALUES = PLATFORMS.map((p) => p.value);

/**
 * What to show the user for a stored platform value.
 *
 * The library card printed the raw "Deck" while the form said "Steam Deck" —
 * one platform, two spellings, depending on which screen you were on. Anything
 * we do not recognise is shown as-is rather than hidden, so a platform that
 * exists in the database but not in this list still reads sensibly.
 */
export const platformLabel = (value: string): string =>
  PLATFORMS.find((p) => p.value === value)?.label ?? value;
