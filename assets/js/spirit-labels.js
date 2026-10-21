/**
 * Single source of truth for display labels of the supported spirits.
 * Every view must use this map so newly added spirits cannot drift
 * (the compare picker once showed raw ids for tuxca/comiteco because
 * its private copy of this map had not been updated).
 */
export const SPIRIT_LABELS = {
  tequila: "Tequila",
  mezcal: "Mezcal",
  bacanora: "Bacanora",
  raicilla: "Raicilla",
  tuxca: "Tuxca",
  comiteco: "Comiteco",
  "destilado-de-pulque": "Destilado de pulque",
  sotol: "Sotol",
};

/**
 * Logical grouping order for profile lists: agave classics first, regional
 * sap traditions next, northern Dasylirion last. Spirits not listed keep
 * their encounter order after the known ones.
 */
export const SPIRIT_GROUP_ORDER = [
  "tequila",
  "mezcal",
  "raicilla",
  "bacanora",
  "sotol",
  "tuxca",
  "comiteco",
  "destilado-de-pulque",
];

/**
 * Traditions the discovery threads treat as "more adventurous" picks —
 * the lesser-known regional traditions. Shared by the flavour-category
 * matcher and the profile explore-next links so the list cannot drift.
 */
export const ADVENTUROUS_TRADITIONS = ["tuxca", "comiteco", "destilado-de-pulque", "sotol"];

/**
 * Group profiles by spirit in a logical order (tequila together, raicilla
 * together, …) so related styles read as neighbors instead of interleaving
 * by encounter order. Stable within each group by title.
 */
export function groupProfilesBySpirit(profiles, compare) {
  const cmp = compare || ((a, b) => a.localeCompare(b));
  const rank = (spirit) => {
    const index = SPIRIT_GROUP_ORDER.indexOf(spirit);
    return index === -1 ? SPIRIT_GROUP_ORDER.length : index;
  };
  return [...profiles].sort((a, b) =>
    rank(a.spirit) - rank(b.spirit) ||
    cmp(a.title, b.title)
  );
}

/** Human label for a spirit id, falling back to the raw id. */
export function spiritLabel(spirit) {
  return SPIRIT_LABELS[spirit] || spirit;
}
