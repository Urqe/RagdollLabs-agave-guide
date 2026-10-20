/**
 * Basic search over profiles, spirits, places, producers, brands and
 * bottles. Accent- and case-insensitive; supports curated aliases so
 * common alternate spellings and regional names find their targets.
 * Exact spirit matches rank first, so querying "mezcal" surfaces the
 * mezcal profile above profiles that merely mention mezcal.
 */

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
const ALIASES = new Map([
  ["tequilana weber", "tequilana"],
  ["blue agave", "tequilana"],
  ["weber azul", "tequilana"],
  ["silver", "blanco"],
  ["plata", "blanco"],
  ["lechuguilla", "maximiliana"],
  ["mountain raicilla", "sierra raicilla"],
  ["coastal raicilla", "costa"],
  ["bacanorero", "bacanora"],
  ["tabernero", "taberna"],
]);

export function applyAliases(normalizedQuery) {
  const mapped = ALIASES.get(normalizedQuery);
  return mapped || normalizedQuery;
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
    profile.context || "",
  ];
}

function rankFor(profile, q) {
  // Exact spirit match ranks above profiles that only mention the term.
  if (normalize(profile.spirit) === q) return 0;
  return 1;
}

export function searchProfiles({ profiles, bottles, query }) {
  const q = applyAliases(normalize(query));
  if (!q) return [];
  const bottleById = new Map((bottles || []).map((b) => [b.id, b]));

  const results = [];
  for (const profile of profiles) {
    const example = bottleById.get(profile.exampleBottleId);
    const haystack = normalize([
      ...profileSearchTerms(profile),
      example ? example.brand : "",
      example ? example.expression : "",
      example ? example.producer || "" : "",
      example ? example.place || "" : "",
    ].join(" "));
    if (haystack.includes(q)) {
      results.push({
        profile,
        exampleBottle: example || null,
        rank: rankFor(profile, q),
        reason: reasonFor(profile, example, q),
      });
    }
  }
  results.sort((a, b) => a.rank - b.rank || a.profile.title.localeCompare(b.profile.title));
  return results;
}

function reasonFor(profile, example, q) {
  if (normalize(profile.spirit) === q) return `Matches the spirit “${profile.spirit}”.`;
  if (example && normalize(example.brand).includes(q)) return `Example bottle brand matches: ${example.brand}.`;
  if (example && normalize(example.producer || "").includes(q)) return `Producer matches: ${example.producer}.`;
  if (profile.tasteNotes.some((n) => normalize(n).includes(q))) return `Taste note matches: “${q}”.`;
  if (normalize(profile.plant || "").includes(q)) return `Agave plant matches: ${profile.plant}.`;
  if (normalize(profile.stateName).includes(q)) return `Place matches: ${profile.stateName}.`;
  return `Matches “${q}” in this profile.`;
}
