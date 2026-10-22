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
    for (const { key } of DIMENSIONS) {
      const a = levelOf(anchor, key);
      const c = levelOf(candidate, key);
      if (isKnown(a) && a === c && a !== "none") shared.push(key);
    }
    if (shared.length > 0) {
      suggestions.push({
        profile: candidate,
        sharedDimensionKeys: shared.slice(0, 2),
      });
    }
  }
  return suggestions.slice(0, maxSuggestions);
}

/**
 * Release 23 — Comparison Intelligence.
 *
 * Perspective detection and plain-language summaries, derived strictly
 * from documented entity relationships (plant/tradition/process/
 * region ids) and documented sensory levels. Where the data cannot
 * support a statement, none is made — perspectives simply don't
 * appear, and the summary falls back to the biggest-difference facts.
 */

const WOOD_PROCESS = "wood-maturation";

/** True when any of the profiles has documented wood maturation. */
const isWoodRested = (p) => (p.processIds || []).includes(WOOD_PROCESS);

/**
 * Detect meaningful comparison perspectives for two or three profiles.
 * Each perspective carries the evidence behind it so the view can
 * explain *why* it applies — never just label it.
 */
export function comparisonPerspectives(profiles) {
  if (profiles.length < 2) return [];
  const out = [];
  const sharedPlantIds = profiles[0].plantIds || [];
  const allSharePlant = profiles.every((p) => sharedPlantIds.some((pid) => (p.plantIds || []).includes(pid)));
  const sameTradition = profiles.every((p) => p.traditionId === profiles[0].traditionId);
  const sameRegion = profiles.every((p) => (p.regionIds || [])[0] === (profiles[0].regionIds || [])[0]);
  const allWood = profiles.every(isWoodRested);
  const noneWood = profiles.every((p) => !isWoodRested);
  const woodMix = !allWood && !noneWood && profiles.some(isWoodRested);
  const woodProfile = profiles.find(isWoodRested);
  const unagedProfile = profiles.find((p) => !isWoodRested(p));

  if (allSharePlant && !sameRegion) {
    out.push({
      id: "samePlantDifferentRegion",
      plant: (sharedPlantIds[0] || "").replace(/-/g, " "),
      evidence: "plantIds",
    });
  }
  if (sameTradition && !allSharePlant) {
    out.push({ id: "sameTraditionDifferentPlant", tradition: profiles[0].traditionId, evidence: "traditionId" });
  }
  if (sameTradition && allSharePlant) {
    const methodSets = profiles.map((p) => [...(p.processIds || [])].sort().join(","));
    if (new Set(methodSets).size > 1) {
      out.push({ id: "sameTraditionDifferentMethod", tradition: profiles[0].traditionId, evidence: "processIds" });
    }
  }
  if (!sameTradition) {
    const anchorMoods = flavorMoods(profiles[0]).map((m) => m);
    const othersMoods = profiles.slice(1).map((p) => flavorMoods(p));
    const shared = anchorMoods.filter((m) => othersMoods.every((list) => list.includes(m)));
    if (shared.length > 0) {
      out.push({ id: "similarFlavoursAcrossTraditions", moods: shared, evidence: "sensory" });
    }
  }
  if (woodMix && woodProfile && unagedProfile) {
    out.push({ id: "unagedVersusWoodRested", wood: woodProfile.id, unaged: unagedProfile.id, evidence: "processIds" });
  }
  // Two wood-rested profiles of the same tradition whose documented
  // maturation classes differ (e.g. reposado vs añejo): the variable at
  // play is maturation, even though the process id is identical.
  if (allWood) {
    const first = profiles[0].maturation;
    if (first && profiles.every((p) => p.maturation) && profiles.some((p) => p.maturation.class !== first.class)) {
      out.push({ id: "differentMaturation", classes: profiles.map((p) => p.maturation.class), evidence: "maturation" });
    }
  }
  return out;
}

/**
 * Plain-language summary of the primary differences, for rendering above
 * the detailed comparison. Returns structured facts (never pre-joined
 * strings) so the view can localize. Falls back to the biggest
 * documented difference; if nothing is documented enough to say, says
 * so instead of manufacturing a statement.
 */
export function comparisonSummary(profiles, { maxDiffs = 2 } = {}) {
  if (profiles.length < 2) return { perspectives: [], differences: [], comparable: false };
  const perspectives = comparisonPerspectives(profiles);
  const differences = biggestDifferences(profiles, { limit: maxDiffs }).map((d) => ({
    key: d.key,
    levels: d.levels,
    gap: d.gap,
  }));
  return { perspectives, differences, comparable: true };
}
