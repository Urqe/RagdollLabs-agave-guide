/**
 * Locale support. The locale is a pure presentation concern:
 * it never appears in routes, entity IDs or URLs. `en` is the
 * fallback for any missing string, and untranslated content is
 * disclosed rather than silently shown in the wrong language.
 */

export const LOCALES = ["en", "es"];

const STRINGS = {
  en: {
    "nav.explore": "Explore",
    "nav.compare": "Compare",
    "nav.catalogue": "Catalogue",
    "nav.learn": "Learn",
    "theme.label": "Switch color theme",
    "locale.label": "Switch language",
    "home.heading": "Agave spirits style guide",
    "home.intro": "A small guide to the body and taste of Mexican agave spirits \u2014 tequila, mezcal, bacanora and raicilla. Each profile describes a style, with one example bottle to show what it can taste like. The examples are single bottles, not a verdict on every tequila or mezcal from a region.",
    "home.cta": "Browse the map of M\u00e9xico \u2192",
    "explore.heading": "Explore by state",
    "explore.intro": "Shaded states have style profiles in this app; the full map of M\u00e9xico is shown for context. Shading shows app coverage only \u2014 it is not a legal production boundary map. Only states with profiles can be selected.",
    "explore.hint": "Select one of the shaded states with profiles to see their style profiles.",
    "explore.empty": "No profiles added here yet",
    "explore.searchPlaceholder": "Search: spirit, agave, place, producer, brand\u2026",
    "explore.searchEmpty": "No profiles match",
    "compare.heading": "Compare styles",
    "compare.intro": "Compare two or three editorial style profiles side by side. Sensory levels are editorial impressions \u2014 perceived sweetness is not measured sugar, smoke is not peat content, and ABV stays a factual property. Choosing an example bottle never turns these profile levels into bottle measurements.",
    "compare.pick": "Pick at least two profiles to compare.",
    "compare.oneMore": "One more pick starts the comparison.",
    "compare.remove": "Remove",
    "compare.biggestDiffs": "Biggest differences",
    "compare.noDiffs": "No documented differences large enough to highlight.",
    "compare.notDocumented": "Not documented",
    "compare.removeLabel": "Remove",
    "level.none": "None",
    "level.low": "Low",
    "level.medium": "Medium",
    "level.high": "High",
    "mood.smoke-forward": "Smoke-forward",
    "mood.clean-herbal": "Clean & herbal",
    "mood.round-fruity": "Round & fruity",
    "mood.peppery-savory": "Peppery & savory",
    "mood.long-finish": "Long finish",
    "mood.desert-garden": "Desert garden",
    "catalogue.heading": "Bottle catalogue",
    "catalogue.intro": "Every bottle entry keeps the brand, the actual producer and the exact expression as separate facts. Reviewer impressions are attributed to their source; the app's own profile-relative notes are labeled editorial; factual entries without review or profile coverage say so instead of borrowing character.",
    "catalogue.searchPlaceholder": "Search: expression, brand, producer, place\u2026",
    "catalogue.allBottles": "All bottles (alphabetical)",
    "catalogue.brands": "Browse all brands",
    "coverage.tasting": "Tasting notes not yet documented",
    "coverage.profile": "Profile not yet covered",
    "profile.backExplore": "\u2190 Back to explore",
    "profile.sources": "Sources for this profile",
    "profile.sourcesBottle": "Sources for this bottle:",
    "profile.exampleBottle": "Example bottle",
    "profile.pairing": "Serving & pairings (editorial)",
    "profile.pairingFoods": "Foods to try:",
    "profile.moods": "Flavor moods:",
    "profile.ifYouLike": "If you like this, try\u2026",
    "profile.learnLink": "Learn about the agaves, methods and label terms \u2192",
    "profile.aboutPlant": "About this agave \u2192",
    "profile.moreBottles": "See more bottles for this style",
    "learn.heading": "Learn",
    "learn.intro": "Agave plants, production methods and label vocabulary behind the profiles. Educational descriptions do not guarantee flavor from geography, species or age; where the botany is genuinely unsettled, we say so instead of guessing.",
    "learn.plants": "The agaves",
    "learn.processes": "How the spirits are made",
    "learn.terms": "Label vocabulary",
    "learn.commonNames": "Common names:",
    "learn.harvest": "Harvest:",
    "learn.uncertainty": "Uncertainty:",
    "learn.seenIn": "Seen in:",
    "learn.relatesTo": "Relates to:",
    "learn.verified": "verified",
    "learn.sources": "Sources",
    "catalogue.groupBottle": "For this bottle:",
    "catalogue.groupNote": "For the editorial note:",
    "untranslated.note": "Part of this content is shown in English because a reviewed Spanish translation is not yet available.",
  },
  es: {
    "nav.explore": "Explorar",
    "nav.compare": "Comparar",
    "nav.catalogue": "Cat\u00e1logo",
    "nav.learn": "Aprender",
    "theme.label": "Cambiar tema de color",
    "locale.label": "Cambiar idioma",
    "home.heading": "Gu\u00eda de estilos de destilados de agave",
    "home.intro": "Una peque\u00f1a gu\u00eda del cuerpo y el sabor de los destilados mexicanos de agave \u2014 tequila, mezcal, bacanora y raicilla. Cada perfil describe un estilo, con una botella de ejemplo para mostrar c\u00f3mo puede saber. Los ejemplos son botellas individuales, no un veredicto sobre cada tequila o mezcal de una regi\u00f3n.",
    "home.cta": "Explora el mapa de M\u00e9xico \u2192",
    "explore.heading": "Explora por estado",
    "explore.intro": "Los estados sombreados tienen perfiles de estilo en esta app; se muestra el mapa completo de M\u00e9xico como contexto. El sombreado representa solo la cobertura de la app \u2014 no es un mapa de l\u00edmites legales de producci\u00f3n. Solo se pueden seleccionar los estados con perfiles.",
    "explore.hint": "Selecciona uno de los estados sombreados con perfiles para ver sus estilos.",
    "explore.empty": "A\u00fan no hay perfiles aqu\u00ed",
    "explore.searchPlaceholder": "Buscar: destilado, agave, lugar, productor, marca\u2026",
    "explore.searchEmpty": "Ning\u00fan perfil coincide con",
    "compare.heading": "Compara estilos",
    "compare.intro": "Compara dos o tres perfiles de estilo editoriales lado a lado. Los niveles sensoriales son impresiones editoriales \u2014 el dulzor percibido no es az\u00facar medido, el humo no es contenido de turba, y el ABV sigue siendo un dato factual. Elegir una botella de ejemplo nunca convierte estos niveles de perfil en mediciones de botella.",
    "compare.pick": "Elige al menos dos perfiles para comparar.",
    "compare.oneMore": "Una elecci\u00f3n m\u00e1s inicia la comparaci\u00f3n.",
    "compare.remove": "Quitar",
    "compare.biggestDiffs": "Mayores diferencias",
    "compare.noDiffs": "No hay diferencias documentadas lo bastante grandes para destacar.",
    "compare.notDocumented": "No documentado",
    "compare.removeLabel": "Quitar",
    "level.none": "Nada",
    "level.low": "Bajo",
    "level.medium": "Medio",
    "level.high": "Alto",
    "mood.smoke-forward": "Con humo",
    "mood.clean-herbal": "Limpio y herbal",
    "mood.round-fruity": "Redondo y afrutado",
    "mood.peppery-savory": "Especiado y sabroso",
    "mood.long-finish": "Final largo",
    "mood.desert-garden": "Jardín del desierto",
    "catalogue.heading": "Cat\u00e1logo de botellas",
    "catalogue.intro": "Cada entrada mantiene la marca, el productor real y la expresi\u00f3n exacta como datos separados. Las impresiones de los revisores se atribuyen a su fuente; las notas editoriales de la app se etiquetan como tales; las entradas f\u00e1cticas sin rese\u00f1a o cobertura de perfil lo declaran en lugar de tomar car\u00e1cter prestado.",
    "catalogue.searchPlaceholder": "Buscar: expresi\u00f3n, marca, productor, lugar\u2026",
    "catalogue.allBottles": "Todas las botellas (alfab\u00e9tico)",
    "catalogue.brands": "Explorar todas las marcas",
    "coverage.tasting": "Notas de cata a\u00fan no documentadas",
    "coverage.profile": "Perfil a\u00fan no cubierto",
    "profile.backExplore": "\u2190 Volver a explorar",
    "profile.sources": "Fuentes de este perfil",
    "profile.sourcesBottle": "Fuentes de esta botella:",
    "profile.exampleBottle": "Botella de ejemplo",
    "profile.pairing": "Servir y maridar (editorial)",
    "profile.pairingFoods": "Comidas sugeridas:",
    "profile.moods": "Perfiles de sabor:",
    "profile.ifYouLike": "Si te gusta esto, prueba\u2026",
    "profile.learnLink": "Conoce los agaves, m\u00e9todos y t\u00e9rminos de etiqueta \u2192",
    "profile.aboutPlant": "Sobre este agave \u2192",
    "profile.moreBottles": "Ver m\u00e1s botellas de este estilo",
    "learn.heading": "Aprende",
    "learn.intro": "Los agaves, los m\u00e9todos de producci\u00f3n y el vocabulario de etiqueta detr\u00e1s de los perfiles. Las descripciones educativas no garantizan sabor por geograf\u00eda, especie o edad; donde la bot\u00e1nica est\u00e1 genuinamente sin resolver, lo decimos en lugar de adivinar.",
    "learn.plants": "Los agaves",
    "learn.processes": "C\u00f3mo se hacen los destilados",
    "learn.terms": "Vocabulario de etiqueta",
    "learn.commonNames": "Nombres comunes:",
    "learn.harvest": "Cosecha:",
    "learn.uncertainty": "Incertidumbre:",
    "learn.seenIn": "Visto en:",
    "learn.relatesTo": "Relacionado con:",
    "learn.verified": "verificado",
    "learn.sources": "Fuentes",
    "catalogue.groupBottle": "Para esta botella:",
    "catalogue.groupNote": "Para la nota editorial:",
    "untranslated.note": "Parte de este contenido se muestra en ingl\u00e9s porque a\u00fan no hay una traducci\u00f3n al espa\u00f1ol revisada.",
  },
};

export function createLocale() {
  let current = "en";
  try {
    const stored = localStorage.getItem("agave-locale");
    if (LOCALES.includes(stored)) current = stored;
  } catch (error) { /* storage unavailable */ }

  const missing = new Set();

  const api = {
    get() { return current; },
    set(next) {
      if (!LOCALES.includes(next)) return false;
      current = next;
      try { localStorage.setItem("agave-locale", next); } catch (error) { /* storage unavailable */ }
      return true;
    },
    /** Translate a key; falls back to English and records the gap. */
    t(key) {
      if (current !== "en" && STRINGS.es[key] === undefined) missing.add(key);
      const bundle = STRINGS[current] || STRINGS.en;
      return bundle[key] ?? STRINGS.en[key] ?? key;
    },
    /** True when the active locale lacks reviewed strings (for disclosure). */
    hasMissing() { return current !== "en" && missing.size > 0; },
    /** Translate an editorial mood label ("Smoke-forward" etc.). */
    mood(name) {
      const key = "mood." + String(name).toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
      const bundle = STRINGS[current] || STRINGS.en;
      return bundle[key] ?? name;
    },
    /** Translate a sensory level (None/Low/Medium/High). */
    level(level) {
      if (level === null || level === undefined) return null;
      const key = "level." + level;
      const bundle = STRINGS[current] || STRINGS.en;
      return bundle[key] ?? level;
    },
    /** Locale-aware alphabetical comparison for lists. */
    compare(a, b) { return String(a).localeCompare(String(b), current === "es" ? "es" : "en"); },
    /** Locale-aware sort helper. */
    sort(items, keyOf) {
      return [...items].sort((x, y) => api.compare(keyOf(x), keyOf(y)));
    },
  };
  return api;
}
