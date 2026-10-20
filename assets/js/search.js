/**
 * Basic search over profiles, spirits, places, producers, brands and
 * bottles. Accent- and case-insensitive; supports curated aliases so
 * common alternate spellings and regional names find their targets.
 */

const normalize = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Curated aliases: normalized alias -> normalized target term. */
const ALIASES = new Map([
  ["espadin", "espadín"],
  ["pacifica", "pacifica"],
  ["yaquiana", "yaquiana"],
  ["maximiliana", "maximiliana"],
  ["blue agave", "blue weber agave"],
  ["tequilana weber", "blue weber agave"],
  ["joven", "joven"],
  ["blanco", "blanco"],
  ["silver", "blanco"],
  ["plata", "blanco"],
  ["sierra raicilla", "sierra"],
  ["mountain raicilla", "sierra"],
  ["coastal raicilla", "costa"],
  ["sonora", "sonora"],
  ["oaxaca", "oaxaca"],
  ["jalisco", "jalisco"],
  ["tepua", "tepúa"],
  ["venenosa", "venenosa"],
]);

export function applyAliases(normalizedQuery) {
  const mapped = ALIASES.get(normalizedQuery);
  return mapped ? normalize(mapped) : normalizedQuery;
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
        reason: reasonFor(profile, example, q),
      });
    }
  }
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
