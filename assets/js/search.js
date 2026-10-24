/**
 * Basic search over profiles, spirits, places, producers, brands and
 * bottles. Accent- and case-insensitive; supports curated aliases so
 * common alternate spellings and regional names find their targets.
 * Exact spirit matches rank first, so querying "mezcal" surfaces the
 * mezcal profile above profiles that merely mention mezcal.
 *
 * Reasons are returned as { reasonKey, vars } so the view can localize
 * them; unknown keys fall back to a general match phrase.
 */
import { ES_NOTES } from "./taste-notes.js";
import { fieldEsAnyLocale } from "./editorial.js";

const normalize = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Curated aliases. Keys are normalized (accent-stripped, lowercase)
 * queries; values are normalized target terms that participate in
 * matching. Values are compared normalized too, so accented targets
 * like "espadín" are written here accent-stripped.
 */
const normalizeAliasKey = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const ALIAS_ENTRIES = [
  ["tequilana weber", "tequilana"],
  ["blue agave", "tequilana"],
  ["weber azul", "tequilana"],
  ["papalote", "rhodacantha"],
  ["amarillo", "rhodacantha"],
  ["yaquiana", "angustifolia"],
  ["pacifico", "angustifolia"],
  ["agave azul", "tequilana"],
  ["maguey de mesa", "potatorum"],
  ["ixtero", "angustifolia"],
  ["pacifica / yaquiana", "angustifolia"],
  ["ixtero / lechuguilla", "angustifolia"],
  ["li\u00f1eno", "angustifolia"],
  ["papalote / amarillo", "rhodacantha"],
  ["silver", "blanco"],
  ["plata", "blanco"],
  ["lechuguilla", "maximiliana"],
  ["mountain raicilla", "sierra raicilla"],
  ["coastal raicilla", "costa"],
  ["raicilla de la costa", "costa"],
  ["bacanorero", "bacanora"],
  ["tabernero", "taberna"],
  ["humo de mezquite", "mesquite smoke"],
  ["humo", "smoke"],
  ["pimienta", "pepper"],
  ["caramelo", "caramel"],
  ["vainilla", "vanilla"],
  ["citricos", "citrus"],
  ["agave cocido", "cooked agave"],
  ["agave asado", "roasted agave"],
  ["roble", "oak"],
  ["hierbas", "herbs"],
  ["florales", "floral"],
  ["mineral", "mineral"],
  ["dulce", "sweetness"],
  // Spanish descriptors for common English style terms.
  ["altos", "highland"],
  ["barrica", "barrel"],
  ["sin crianza", "unaged"],
  ["reposado en barrica", "barrel-rested"],
  ["con humo", "smoky"],
  ["ahumado", "smoky"],
  ["con crianza", "aged"],
  ["envejecido", "aged"],
];

const ALIASES = new Map(ALIAS_ENTRIES.map(([key, value]) => [normalizeAliasKey(key), value]));

export function applyAliases(query) {
  const normalized = normalizeAliasKey(query);
  const mapped = ALIASES.get(normalized);
  return mapped ? normalizeAliasKey(mapped) : normalized;
}

function profileSearchTerms(profile) {
  return [
    profile.title,
    profile.spirit,
    profile.stateName,
    profile.plant || "",
    profile.process || "",
    profile.category || "",
    ...(profile.tasteNotes || []),
    ...(profile.aliases || []),
    profile.context || "",
  ];
}

/**
 * Pair 29: per-word variants for phrase search. Each word goes through the
 * alias map, and an adjective ending in -y also tries its stem, so
 * "smoky" finds "smoke" and "fruity" finds "fruit".
 */
const LEVEL = { none: 0, low: 1, medium: 2, high: 3 };
const SENSORY_WORDS = [
  ["smoke", ["smok"]],
  ["fruit", ["fruit"]],
  ["sweetness", ["sweet"]],
  ["oak", ["oak", "wood"]],
  ["herbal", ["herb"]],
  ["pepper", ["pepper", "spic"]],
];

function tokenVariants(raw) {
  return raw.split(/\s+/).filter((w) => w.length > 1).map((word) => {
    const variants = new Set([word, applyAliases(word)]);
    for (const v of [...variants]) if (v.length > 4 && v.endsWith("y")) variants.add(v.slice(0, -1));
    return [...variants];
  });
}

function rankFor(profile, q) {
  // Exact spirit match ranks above profiles that only mention the term.
  if (normalize(profile.spirit) === q) return 0;
  return 1;
}

export function searchProfiles({ profiles, bottles, query }) {
  const raw = normalize(query);
  const q = applyAliases(raw);
  if (!q && !raw) return [];
  const bottleById = new Map((bottles || []).map((b) => [b.id, b]));
  const tokens = tokenVariants(raw);

  const results = [];
  for (const profile of profiles) {
    const example = bottleById.get(profile.exampleBottleId);
    const esNoteHit = (profile.tasteNotes || []).some((n) => {
      const esLabel = ES_NOTES[n];
      return esLabel ? normalize(esLabel).includes(q) || normalize(esLabel).includes(raw) : false;
    });
    const haystack = normalize([
      ...profileSearchTerms(profile),
      fieldEsAnyLocale("profile", profile.id, "title") || "",
      ...(profile.tasteNotes || []).map((n) => ES_NOTES[n] || ""),
      example ? example.brand : "",
      example ? example.expression : "",
      example ? example.producer || "" : "",
      example ? example.place || "" : "",
    ].join(" "));
    let matched = haystack.includes(raw) ? raw : haystack.includes(q) ? q : null;
    // Pair 29: a reader's phrase ("smoky mezcal", "mezcal ahumado") rarely
    // appears verbatim. When the whole phrase misses, every word must match
    // somewhere in the profile instead.
    let wordScore = 0;
    if (!matched && tokens.length > 1 && tokens.every((variants) => variants.some((v) => haystack.includes(v)))) {
      matched = raw;
      // Words found in the title, spirit or taste notes count for more than
      // a passing mention in the context paragraph.
      const strong = normalize([profile.title, profile.spirit, ...(profile.tasteNotes || []),
        fieldEsAnyLocale("profile", profile.id, "title") || "", ...(profile.tasteNotes || []).map((n) => ES_NOTES[n] || "")].join(" "));
      // A word that names a sensory dimension ("smoky", "fruity", "sweet")
      // ranks by the profile's editorial level for it, so "smoky mezcal"
      // puts the medium-smoke styles above the gently smoky ones.
      wordScore = tokens.reduce((score, variants) => {
        const dim = SENSORY_WORDS.find(([, words]) => variants.some((v) => words.some((w) => v.startsWith(w))));
        if (dim) return score + (LEVEL[(profile.sensory || {})[dim[0]]] || 0);
        return score + (variants.some((v) => strong.includes(v)) ? 1 : 0);
      }, 0);
    }
    if (matched) {
      results.push({
        profile,
        exampleBottle: example || null,
        rank: rankFor(profile, matched) - wordScore / 10,
        reason: reasonFor(profile, example, matched, esNoteHit),
      });
    }
  }
  results.sort((a, b) => a.rank - b.rank || a.profile.title.localeCompare(b.profile.title));
  return results;
}

function reasonFor(profile, example, q, esNoteHit = false) {
  if (normalize(profile.spirit) === q) return `Matches the spirit “${profile.spirit}”.`;
  if (example && normalize(example.brand).includes(q)) return `Example bottle brand matches: ${example.brand}.`;
  if (example && normalize(example.producer || "").includes(q)) return `Producer matches: ${example.producer}.`;
  if (esNoteHit) return `Taste note matches: “${q}”.`;
  if (profile.tasteNotes.some((n) => normalize(n).includes(q))) return `Taste note matches: “${q}”.`;
  if (normalize(profile.plant || "").includes(q)) return `Agave plant matches: ${profile.plant}.`;
  if (normalize(profile.stateName).includes(q)) return `Place matches: ${profile.stateName}.`;
  return `Matches “${q}” in this profile.`;
}
