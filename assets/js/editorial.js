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
const BUCKET = { profile: "profiles", bottle: "bottles", process: "processes", plant: "plants", term: "terms" };

export function setContentEs(data) {
  contentEs = data && typeof data === "object" ? data : {};
}

/**
 * Localized editorial field, or null when only English exists.
 * entity: "profile" | "bottle" | "process" | "plant" | "term".
 */
export function fieldEs(entity, id, field) {
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
export function editorialText(entity, id, field, englishText, locale = null) {
  if (!locale || locale.get() !== "es") {
    return { text: englishText, translated: true };
  }
  const es = fieldEs(entity, id, field);
  return es ? { text: es, translated: true } : { text: englishText, translated: false };
}
