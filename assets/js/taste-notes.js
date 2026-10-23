/**
 * Tasting-note presentation layer. Notes are authored in English in the
 * data files; this module maps the known note vocabulary to Spanish for
 * display. Unknown notes fall back to the English text — the app-level
 * language disclosure already tells Spanish readers some reference
 * content is in English.
 */

export const ES_NOTES = {
  "baking spice": "especias de repostería",
  "black pepper": "pimienta negra",
  "caramel": "caramelo",
  "chocolate": "chocolate",
  "citrus": "cítricos",
  "citrus peel": "cáscara cítrica",
  "coffee": "café",
  "cooked agave": "agave cocido",
  "creamy vanilla": "vainilla cremosa",
  "deep oak": "roble profundo",
  "desert herbs": "hierbas del desierto",
  "dried fruit": "fruta seca",
  "earthy notes": "notas terrosas",
  "fermented funk": "matiz fermentado",
  "floral agave": "agave floral",
  "florals": "florales",
  "fresh herbs": "hierbas frescas",
  "fresh pulque": "pulque fresco",
  "fresh-cut grass": "pasto recién cortado",
  "gentle citrus": "cítricos suaves",
  "gentle roast": "tostado suave",
  "gentle smoke": "humo suave",
  "gentle sweetness": "dulzor suave",
  "green apple": "manzana verde",
  "green herbs": "hierbas verdes",
  "green vegetal": "vegetal verde",
  "honeyed sweetness": "dulzor mielado",
  "lactic freshness": "frescura láctica",
  "lactic tang": "acidez láctica",
  "light oak": "roble ligero",
  "lime zest": "ralladura de lima",
  "mesquite smoke": "humo de mezquite",
  "mineral": "mineral",
  "mint / eucalyptus freshness": "frescura de menta / eucalipto",
  "oak": "roble",
  "olive brine": "salmuera de aceituna",
  "orchard fruit": "fruta de huerto",
  "pit-roast smoke": "humo de horno de piña",
  "pit-roasted agave": "agave asado en horno",
  "roasted agave": "agave asado",
  "smoke": "humo",
  "soft agave": "agave suave",
  "soft oak spice": "especias suaves de roble",
  "soft sweetness": "dulzor suave",
  "stone fruit (plum, raisin)": "fruta de hueso (ciruela, pasa)",
  "sweet agave": "agave dulce",
  "sweet cooked agave": "agave cocido dulce",
  "gentle spice": "especias suaves",
  "buttery sweetness": "dulzor mantecoso",
  "pepper": "pimienta",
  "sweet citrus": "cítricos dulces",
  "sweet corn": "maíz dulce",
  "tropical fruit": "fruta tropical",
  "vanilla": "vainilla",
  "wet earth": "tierra húmeda",
};

/**
 * Localized note label. Returns the Spanish label for the exact known
 * English note; otherwise the note unchanged (English fallback).
 */
export function tasteNote(note, locale = null) {
  if (locale && locale.get() === "es") return ES_NOTES[note] || note;
  return note;
}

/** Reverse lookup: Spanish label -> English note (for search). */
export const ES_NOTE_BY_LABEL = new Map(Object.entries(ES_NOTES).map(([en, es]) => [es, en]));
