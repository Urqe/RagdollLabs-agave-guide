/**
 * Catalogue search over bottles (expressions, brands, producers, places,
 * spirits). Exact-expression matches rank first, then brand matches, then
 * everything else. Accent/case-insensitive with curated spelling variants.
 */

const normalize = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Curated spelling variants: normalized variant -> normalized target. */
const SPELLING_VARIANTS = new Map([
  ["tepua", "tep\u00faa".normalize("NFD").replace(/[\u0300-\u036f]/g, "")],
  ["rancho tepua", "rancho tep\u00faa".normalize("NFD").replace(/[\u0300-\u036f]/g, "")],
  ["bojorquez", "boj\u00f3rquez".normalize("NFD").replace(/[\u0300-\u036f]/g, "")],
  ["alamos", "\u00e1lamos".normalize("NFD").replace(/[\u0300-\u036f]/g, "")],
  ["cielo rojo bacanora", "cielo rojo"],
]);

export function applyVariants(normalizedQuery) {
  return SPELLING_VARIANTS.get(normalizedQuery) || normalizedQuery;
}

function searchableText(bottle) {
  return normalize([
    bottle.brand, bottle.expression, bottle.producer || "",
    bottle.place || "", bottle.spirit || "", bottle.batch || "",
  ].join(" "));
}

/** rank 0 = exact expression, 1 = brand, 2 = other content match */
function rankOf(bottle, q) {
  if (normalize(bottle.expression) === q) return 0;
  if (normalize(bottle.brand) === q) return 1;
  return 2;
}

export function searchBottles(bottles, query) {
  const q = applyVariants(normalize(query));
  if (!q) return [];
  const matches = [];
  for (const bottle of bottles) {
    if (searchableText(bottle).includes(q)) {
      matches.push({ bottle, rank: rankOf(bottle, q) });
    }
  }
  matches.sort((a, b) =>
    a.rank - b.rank ||
    a.bottle.brand.localeCompare(b.bottle.brand) ||
    a.bottle.expression.localeCompare(b.bottle.expression)
  );
  return matches.map((m) => m.bottle);
}

/** All bottles for one profile, alphabetical, featured example first. */
export function bottlesForProfile(bottles, profile) {
  const featured = bottles.find((b) => b.id === profile.exampleBottleId) || null;
  const others = bottles
    .filter((b) => b.profileId === profile.id && b.id !== profile.exampleBottleId)
    .sort((a, b) =>
      a.brand.localeCompare(b.brand) || a.expression.localeCompare(b.expression)
    );
  return { featured, others };
}

/** Brand directory: unique brands with their bottles, alphabetical. */
export function brandDirectory(bottles, compare) {
  const byBrand = new Map();
  for (const bottle of bottles) {
    if (!byBrand.has(bottle.brand)) byBrand.set(bottle.brand, []);
    byBrand.get(bottle.brand).push(bottle);
  }
  const cmp = compare || ((a, b) => a.localeCompare(b));
  return [...byBrand.entries()]
    .sort((a, b) => cmp(a[0], b[0]))
    .map(([brand, brandBottles]) => ({
      brand,
      bottles: [...brandBottles].sort((a, b) =>
        a.expression.localeCompare(b.expression)
      ),
    }));
}
