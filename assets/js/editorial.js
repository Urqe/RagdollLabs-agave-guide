/**
 * Editorial content localization. Data files author editorial prose in
 * English; Spanish translations can land incrementally in
 * assets/data/content-es.json keyed by entity id and field. When a
 * translation exists it is used; when it does not, the English text
 * renders with an explicit per-section English disclosure so readers
 * know exactly which content is untranslated.
 *
 * The registry is injected once at boot ( setContentEs ) so views stay
 * synchronous and testable without fetching per field.
 */

let contentEs = {};

// Entity names used by callers map to the plural buckets in content-es.json.
const BUCKET = { profile: "profiles", bottle: "bottles", process: "processes", plant: "plants", term: "terms", chapter: "chapters", tradition: "traditions", region: "regions" };

export function setContentEs(data) {
  contentEs = data && typeof data === "object" ? data : {};
}

/**
 * Locale-independent lookup used by search indexing: the ES registry
 * entries participate in matching regardless of the interface language,
 * so a Spanish query finds its profile even from the English UI.
 */
export function fieldEsAnyLocale(entity, id, field) {
  const bucket = contentEs[BUCKET[entity] || entity];
  const entry = bucket && bucket[id];
  const value = entry ? entry[field] : null;
  return typeof value === "string" && value.trim() ? value : null;
}

/**
 * Localized editorial field, or null when the locale is English (or only
 * the English version exists).
 * entity: "profile" | "bottle" | "process" | "plant" | "term".
 */
export function fieldEs(entity, id, field, locale = null) {
  if (!locale || locale.get() !== "es") return null;
  const bucket = contentEs[BUCKET[entity] || entity];
  const entry = bucket && bucket[id];
  const value = entry ? entry[field] : null;
  return typeof value === "string" && value.trim() ? value : null;
}

/**
 * Render helper for editorial text: returns { text, translated } so the
 * view can append the per-section disclosure when translated is false
 * and the locale is Spanish.
 */
/**
 * Localized structured field (objects allowed), or null when only the
 * English version exists. Used for fields like profile.pairing.
 */
export function fieldEsAny(entity, id, field, locale = null) {
  if (!locale || locale.get() !== "es") return null;
  const bucket = contentEs[BUCKET[entity] || entity];
  const entry = bucket && bucket[id];
  const value = entry ? entry[field] : null;
  return value && typeof value === "object" ? value : null;
}

/**
 * Localized classification of a reference source kind. The data files
 * classify sources as producer/review/style; Spanish shows the
 * translated classification inside the localized template.
 */
export function sourceKindLabel(kind, locale, uiFn) {
  const map = { producer: "kindProducer", review: "kindReview", style: "kindStyle" };
  return uiFn(locale, map[kind] || "kind" + (kind || "").replace(/^./, (c) => c.toUpperCase()));
}

/**
 * Localized label for where a plant's common name is used. The labels are
 * authored once in plants.json (English) and translated once in the
 * content-es.json `commonNameRegions` map, keyed by the English label, so
 * every view shows the same Spanish wording. validate.mjs fails when a
 * label has no translation.
 */
export function commonNameRegion(region, locale = null) {
  if (!region || !locale || locale.get() !== "es") return region;
  const map = contentEs.commonNameRegions;
  const value = map && map[region];
  return typeof value === "string" && value.trim() ? value : region;
}

/**
 * A region label shown inside "name (region)" keeps its own aside, but
 * as a comma clause, so "Guerrero (Nahuatl-derived)" never renders as
 * nested parentheses: "papalometl (Guerrero, Nahuatl-derived)".
 */
export function flattenAside(label) {
  return String(label || "").replace(/\s*\(([^()]*)\)/g, ", $1");
}

/** "name (region)" list for a plant's common names, localized regions. */
export function commonNamesText(plant, locale = null, separator = ", ") {
  return ((plant && plant.commonNames) || [])
    .map((n) => (n.region ? `${n.name} (${flattenAside(commonNameRegion(n.region, locale))})` : n.name))
    .join(separator);
}

/** Localized plant cultivation note (falls back to the English field). */
export function plantCultivation(plant, locale = null) {
  if (!plant) return "";
  return fieldEs("plant", plant.id, "cultivation", locale) || plant.cultivation || "";
}

/** Localized display title for an entity (falls back to the English title). */
export function localizedTitle(entity, id, englishTitle, locale = null) {
  if (!locale || locale.get() !== "es") return englishTitle;
  return fieldEs(entity, id, "title", locale) || englishTitle;
}

export function editorialText(entity, id, field, englishText, locale = null) {
  if (!locale || locale.get() !== "es") {
    return { text: englishText, translated: true };
  }
  const es = fieldEs(entity, id, field, locale);
  return es ? { text: es, translated: true } : { text: englishText, translated: false };
}
