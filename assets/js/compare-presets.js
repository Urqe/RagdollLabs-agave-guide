import { levelOf } from "./compare.js";

/**
 * Pair 27 — curated learning comparisons. Each preset is a two-profile
 * exercise inside the existing Compare view: one beginner question, two or
 * three dimensions to look at, the differences the data supports, what the
 * pair cannot establish, and a next exercise.
 *
 * `expect` records, per dimension, which way the second profile's level
 * goes relative to the first ("up" or "down"). The explanation text is
 * written against those directions, and `checkPreset` verifies them
 * against the live profile data (validate.mjs runs it), so a profile edit
 * cannot silently leave a preset saying something the data no longer shows.
 */

export const PRESETS = [
  {
    id: "wood",
    ids: ["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"],
    expect: { oak: "up", sweetness: "up", bodyLevel: "up", herbal: "down" },
    focus: ["oak", "sweetness", "bodyLevel"],
    next: "region",
    title: { en: "What does oak change?", es: "¿Qué cambia el roble?" },
    question: {
      en: "Same agave, same valley: what do a few months in oak add?",
      es: "El mismo agave, el mismo valle: ¿qué le agregan unos meses en roble?",
    },
    shows: {
      en: "The route is the same until the rest, so oak is the clearest difference. The reposado gains oak, a little more sweetness and more body; the blanco keeps the sharper herbal edge.",
      es: "El camino es el mismo hasta el reposo, así que el roble es la diferencia más clara. El reposado gana roble, algo más de dulzor y más cuerpo; el blanco conserva el filo herbal más marcado.",
    },
    limits: {
      en: "These are two styles, not one tequila before and after. Barrel, time and producer vary, and vanilla on its own wouldn't prove that a spirit saw wood.",
      es: "Son dos estilos, no un mismo tequila antes y después. La barrica, el tiempo y el productor cambian, y la vainilla por sí sola no probaría que un destilado pasó por madera.",
    },
  },
  {
    id: "region",
    ids: ["tequila-blanco-valley-jalisco", "tequila-blanco-highland-jalisco"],
    expect: { fruit: "up", sweetness: "up", herbal: "down" },
    focus: ["fruit", "sweetness", "herbal"],
    next: "tradition",
    title: { en: "Valley or highlands?", es: "¿Valle o Altos?" },
    question: {
      en: "Same blue agave, two parts of Jalisco: does the place show in the glass?",
      es: "El mismo agave azul, dos zonas de Jalisco: ¿se nota el lugar en la copa?",
    },
    shows: {
      en: "The highland blanco leans fruitier and a little sweeter; the valley blanco is more herbal. That's the tendency Jalisco talks about.",
      es: "El blanco de los Altos tiende a lo afrutado y a algo más de dulzor; el del valle es más herbal. Es la tendencia de la que se habla en Jalisco.",
    },
    limits: {
      en: "It's a tendency, not proof that place alone does it: producers and methods differ too, and one blind tasting panel found the pattern weaker than folklore suggests.",
      es: "Es una tendencia, no una prueba de que el lugar lo haga solo: los productores y los métodos también cambian, y un panel de cata a ciegas encontró el patrón más débil de lo que sugiere el folclore.",
    },
  },
  {
    id: "tradition",
    ids: ["tequila-blanco-valley-jalisco", "mezcal-espadin-valles-centrales"],
    expect: { smoke: "up", fruit: "up", herbal: "down" },
    focus: ["smoke", "herbal", "fruit"],
    next: "plant",
    title: { en: "Tequila or mezcal?", es: "¿Tequila o mezcal?" },
    question: {
      en: "A valley blanco and an espadín mezcal: where do they part ways?",
      es: "Un blanco del valle y un mezcal espadín: ¿dónde se separan?",
    },
    shows: {
      en: "Smoke is the big gap: none in the blanco, a clear thread in the espadín. The mezcal also shows a little more fruit, and the blanco more green, herbal notes.",
      es: "El humo es la gran diferencia: nada en el blanco, un hilo claro en el espadín. El mezcal también muestra algo más de fruta, y el blanco más notas verdes y herbales.",
    },
    limits: {
      en: "Almost everything differs here: the plant (blue agave and espadín), the place (Jalisco and Oaxaca), the cook (steam and earthen pit) and the producers. The pit roast is the likeliest reason for the smoke, but this pair can't single it out.",
      es: "Aquí cambia casi todo: la planta (agave azul y espadín), el lugar (Jalisco y Oaxaca), la cocción (vapor y horno de tierra) y los productores. El horno de tierra es la explicación más probable del humo, pero esta pareja no puede aislarlo.",
    },
  },
  {
    id: "plant",
    ids: ["mezcal-espadin-valles-centrales", "mezcal-tobala-sierra-oaxaca"],
    expect: { fruit: "up", sweetness: "up", smoke: "down", bodyLevel: "down" },
    focus: ["fruit", "smoke", "sweetness"],
    next: "mountains",
    title: { en: "One mezcal, two agaves", es: "Un mezcal, dos agaves" },
    question: {
      en: "Espadín and tobalá, both from Oaxaca: what changes when the agave changes?",
      es: "Espadín y tobalá, los dos de Oaxaca: ¿qué cambia cuando cambia el agave?",
    },
    shows: {
      en: "The tobalá leans fruitier and sweeter, with less smoke and a lighter body; the espadín is smokier and has more weight.",
      es: "El tobalá tiende a lo afrutado y más dulce, con menos humo y un cuerpo más ligero; el espadín es más ahumado y tiene más peso.",
    },
    limits: {
      en: "The plant isn't the only difference: this tobalá is a wild mountain style and the espadín a cultivated valley one, and the producers differ. It shows the range, not a test of the plant alone.",
      es: "La planta no es la única diferencia: este tobalá es un estilo silvestre de montaña y el espadín uno cultivado de valle, y los productores son distintos. Muestra el rango, no una prueba de la planta por sí sola.",
    },
  },
  {
    id: "mountains",
    ids: ["bacanora-pacifica-sierra-sonora", "raicilla-maximiliana-sierra-jalisco"],
    expect: { fruit: "up", sweetness: "up", herbal: "down", pepper: "down" },
    focus: ["herbal", "pepper", "fruit"],
    next: null,
    title: { en: "Two mountain spirits", es: "Dos destilados de la sierra" },
    question: {
      en: "Bacanora from the Sonoran sierra and raicilla from the Sierra de Jalisco: how do they differ?",
      es: "Bacanora de la sierra sonorense y raicilla de la Sierra de Jalisco: ¿en qué se distinguen?",
    },
    shows: {
      en: "The bacanora comes across more herbal and peppery; the Sierra raicilla rounder, with more fruit and sweetness.",
      es: "El bacanora se siente más herbal y especiado; la raicilla de la Sierra, más redonda, con más fruta y dulzor.",
    },
    limits: {
      en: "They differ in plant (angustifolia and maximiliana), state, tradition and maker, so no single cause can be read from this pair.",
      es: "Cambian la planta (angustifolia y maximiliana), el estado, la tradición y el productor, así que de esta pareja no se puede leer una sola causa.",
    },
  },
];

/** Flavour paths in Discover that lead naturally into a preset. */
export const PRESET_FOR_FLAVOUR = {
  "rich-oak": "wood",
  "fresh-herbal": "region",
  "smoky-earthly": "tradition",
  "fruity-floral": "plant",
  "peppery-spicy": "mountains",
};

const ORDER = { none: 0, low: 1, medium: 2, high: 3 };

export function presetById(id) {
  return PRESETS.find((p) => p.id === id) || null;
}

/** First preset that uses this profile, for a link from its page. */
export function presetForProfile(profileId) {
  return PRESETS.find((p) => p.ids.includes(profileId)) || null;
}

export function presetHref(preset, extra = {}) {
  const query = new URLSearchParams({ preset: preset.id, ...extra });
  return `#/compare/${preset.ids.join(",")}?${query.toString()}`;
}

/**
 * Returns a list of problems (empty when the preset holds): unknown or
 * duplicate profiles, focus dimensions without an expectation, unknown
 * levels on an expected dimension, or a direction the data contradicts.
 */
export function checkPreset(preset, profilesById) {
  const problems = [];
  const [a, b] = preset.ids.map((id) => profilesById.get(id));
  if (!a || !b) problems.push(`${preset.id}: unknown profile in ${preset.ids.join(", ")}`);
  if (preset.ids[0] === preset.ids[1]) problems.push(`${preset.id}: compares a profile with itself`);
  for (const key of preset.focus) {
    if (!(key in preset.expect)) problems.push(`${preset.id}: focus "${key}" has no expected direction`);
  }
  if (a && b) {
    for (const [key, direction] of Object.entries(preset.expect)) {
      const la = levelOf(a, key);
      const lb = levelOf(b, key);
      if (!(la in ORDER) || !(lb in ORDER)) {
        problems.push(`${preset.id}: ${key} is not documented for both profiles`);
        continue;
      }
      const diff = ORDER[lb] - ORDER[la];
      if (direction === "up" && !(diff > 0)) problems.push(`${preset.id}: expected ${key} to rise (${la} → ${lb})`);
      if (direction === "down" && !(diff < 0)) problems.push(`${preset.id}: expected ${key} to fall (${la} → ${lb})`);
    }
  }
  if (preset.next && !presetById(preset.next)) problems.push(`${preset.id}: unknown next preset "${preset.next}"`);
  for (const field of ["title", "question", "shows", "limits"]) {
    for (const lang of ["en", "es"]) {
      if (!preset[field] || typeof preset[field][lang] !== "string" || !preset[field][lang].trim()) {
        problems.push(`${preset.id}: ${field}.${lang} missing`);
      }
    }
  }
  return problems;
}
