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
 * derived only from supported attributes: a candidate qualifies only
 * when it shares at least one documented medium-or-high dimension level
 * with the anchor — shared absence or shared low readings alone never
 * imply a strong match. The strong shared levels are what the reason
 * names; a shared low reading is recorded but never described as a
 * shared leaning. Selection is deterministic: candidates rank by
 * documented overlap, ties break by profile id, and self-links and
 * duplicate destinations are excluded.
 */
export function ifYouLikeThis(anchor, candidates, { maxSuggestions = 2 } = {}) {
  const qualified = [];
  const seen = new Set();
  for (const candidate of candidates) {
    if (!candidate || candidate.id === anchor.id || seen.has(candidate.id)) continue;
    const strongShared = [];
    const modestShared = [];
    for (const { key } of DIMENSIONS) {
      const a = levelOf(anchor, key);
      const c = levelOf(candidate, key);
      if (isKnown(a) && a === c && a !== "none") {
        (LEVEL_ORDER[a] >= LEVEL_ORDER.medium ? strongShared : modestShared).push(key);
      }
    }
    if (strongShared.length > 0) {
      seen.add(candidate.id);
      qualified.push({
        profile: candidate,
        sharedDimensionKeys: strongShared.slice(0, 2),
        modestSharedKeys: modestShared.slice(0, 2),
        sharedCount: strongShared.length + modestShared.length,
      });
    }
  }
  qualified.sort((x, y) => y.sharedCount - x.sharedCount || x.profile.id.localeCompare(y.profile.id));
  return qualified.slice(0, maxSuggestions);
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

/** The maturation class of a profile, from its structured maturation field. */
const maturationClassOf = (p) => p?.maturation?.class || null;

const methodSetOf = (p) => [...(p.processIds || [])].sort().join(",");

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
  const sameMethodSet = new Set(profiles.map(methodSetOf)).size === 1;

  if (allSharePlant && !sameRegion) {
    const plant = (sharedPlantIds[0] || "").replace(/-/g, " ");
    const classSet = new Set(profiles.map((p) => maturationClassOf(p)));
    const sameMaturationClass = classSet.size === 1;
    // "Place is the variable" is claimed only when the compared styles
    // also share maturation class and production method. Otherwise this
    // is not a controlled comparison: place, plant-keeping and method all
    // change together, and the perspective says so instead of implying a
    // single-variable comparison.
    if (sameMaturationClass && sameMethodSet) {
      out.push({ id: "samePlantDifferentRegion", plant, plantProfileId: profiles[0].id, evidence: "plantIds" });
    } else {
      out.push({
        id: "samePlantDifferentRegionAndClass",
        plant,
        plantProfileId: profiles[0].id,
        evidence: "plantIds",
        sameMaturationClass,
        sameMethodSet,
      });
    }
  }
  if (sameTradition && !allSharePlant) {
    // "The agave is the variable" is claimed only when the compared styles
    // share region and production method; when place or method differ too,
    // the perspective names the combination instead of implying a
    // controlled plant-only comparison.
    if (sameRegion && sameMethodSet) {
      out.push({ id: "sameTraditionDifferentPlant", tradition: profiles[0].traditionId, evidence: "traditionId" });
    } else {
      out.push({
        id: "sameTraditionDifferentPlantAndPlace",
        tradition: profiles[0].traditionId,
        evidence: "traditionId",
        sameRegion,
        sameMethodSet,
      });
    }
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
