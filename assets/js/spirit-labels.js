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

/** Human label for a spirit id, falling back to the raw id. */
export function spiritLabel(spirit) {
  return SPIRIT_LABELS[spirit] || spirit;
}
