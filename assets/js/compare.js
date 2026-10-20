/**
 * Editorial comparison engine.
 *
 * All functions are pure so explanation invariants can be tested with
 * deterministic fixtures. Sensory levels are authored editorial levels
 * (none/low/medium/high); null means "not documented" and is a
 * first-class unknown — never coerced to a score or to zero.
 */

export const DIMENSIONS = [
  { key: "smoke", label: "Smoke", hint: "Editorial smoke impression — not measured peat or smoke content." },
  { key: "herbal", label: "Herbal / vegetal", hint: "Fresh or cooked vegetal and herb character." },
  { key: "fruit", label: "Fruit / floral", hint: "Orchard, citrus and floral notes." },
  { key: "sweetness", label: "Perceived sweetness", hint: "Perceived sweetness on the palate — not measured sugar." },
  { key: "pepper", label: "Pepper / spice", hint: "Black pepper and spice bite." },
  { key: "bodyLevel", label: "Body", hint: "Editorial body level, from the profile's body field." },
  { key: "oak", label: "Oak", hint: "Wood influence; most unaged agave spirits are none." },
  { key: "finishLength", label: "Finish", hint: "How long the finish lasts." },
];

const LEVEL_ORDER = { none: 0, low: 1, medium: 2, high: 3 };

const BODY_LEVEL_MAP = { light: "low", medium: "medium", full: "high" };

export function levelOf(profile, dimKey) {
  if (dimKey === "bodyLevel") {
    const raw = profile.body ?? profile.sensory?.body ?? null;
    if (raw === null || raw === undefined) return null;
    return BODY_LEVEL_MAP[raw] ?? raw;
  }
  return profile.sensory?.[dimKey] ?? null;
}

export const isKnown = (level) => level !== null && level !== undefined;

/** Biggest differences across two or three profiles, ordered by gap size. */
export function biggestDifferences(profiles, { limit = 4 } = {}) {
  if (profiles.length < 2) return [];
  const rows = [];
  for (const { key, label, hint } of DIMENSIONS) {
    const levels = profiles.map((p) => levelOf(p, key));
    if (!levels.every(isKnown)) {
      rows.push({ key, label, hint, levels, known: false, gap: -1 });
      continue;
    }
    const values = levels.map((l) => LEVEL_ORDER[l] ?? -1);
    const gap = Math.max(...values) - Math.min(...values);
    rows.push({ key, label, hint, levels, known: true, gap });
  }
  const known = rows.filter((r) => r.known && r.gap > 0).sort((a, b) => b.gap - a.gap || a.key.localeCompare(b.key));
  return known.slice(0, limit);
}

/** Dimensions that cannot be compared because data is missing. */
export function missingDimensions(profiles) {
  return DIMENSIONS.filter(({ key }) => !profiles.every((p) => isKnown(levelOf(p, key))));
}

const has = (profile, key, level) => levelOf(profile, key) === level;
const atLeast = (profile, key, level) => {
  const l = levelOf(profile, key);
  return isKnown(l) && LEVEL_ORDER[l] >= LEVEL_ORDER[level];
};

/**
 * Flavor moods: short, opinionated labels derived only from supported
 * profile attributes. A profile with missing relevant data yields
 * fewer (or no) moods rather than guessed ones.
 */
export function flavorMoods(profile) {
  const moods = [];
  if (atLeast(profile, "smoke", "medium")) moods.push("Smoke-forward");
  if (has(profile, "smoke", "none") && atLeast(profile, "herbal", "high")) moods.push("Clean & herbal");
  if (atLeast(profile, "fruit", "medium") && atLeast(profile, "sweetness", "medium")) moods.push("Round & fruity");
  if (atLeast(profile, "pepper", "medium")) moods.push("Peppery & savory");
  if (atLeast(profile, "finishLength", "high")) moods.push("Long finish");
  if (atLeast(profile, "herbal", "high") && !atLeast(profile, "smoke", "medium")) moods.push("Desert garden");
  return moods;
}

/**
 * "If you like this, try…" suggestions with reasons. Suggestions are
 * derived only from supported attributes: a suggestion is offered only
 * when the candidate shares at least one documented dimension level
 * with the anchor, and the reason names those shared attributes. Profiles
 * with too little documented overlap get no suggestion rather than a
 * guessed one.
 */
export function ifYouLikeThis(anchor, candidates, { maxSuggestions = 2 } = {}) {
  const suggestions = [];
  for (const candidate of candidates) {
    if (candidate.id === anchor.id) continue;
    const shared = [];
    for (const { key, label } of DIMENSIONS) {
      const a = levelOf(anchor, key);
      const c = levelOf(candidate, key);
      if (isKnown(a) && a === c && a !== "none") shared.push(label.toLowerCase());
    }
    if (shared.length > 0) {
      suggestions.push({
        profile: candidate,
        reason: `Shares ${shared.slice(0, 2).join(" and ")} with this profile.`,
      });
    }
  }
  return suggestions.slice(0, maxSuggestions);
}
