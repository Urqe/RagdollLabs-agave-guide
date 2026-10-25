import { el } from "./dom-utils.js";

// Editorial reconstructions, not documentary evidence or botanical identification.
// Images are stored in assets/img as WebP, resized to 1120x840 (2x the 560px display width).
// Subject mappings for agave, fermentation and distillation were corrected using mobile screenshots.
const images = {
  agave: ["agave-landscape.webp", "agave-plant.svg",
    "Illustrated agave-growing landscape with a ragdoll cat; not a species identification photograph.",
    "Paisaje ilustrado de cultivo de agave con un gato ragdoll; no es una foto para identificar especies."],
  roast: ["roasting-pit.webp", "cooking-process.svg",
    "Illustration of cooked agave hearts in a roasting pit, with a curious ragdoll cat; methods vary.",
    "Ilustración de piñas de agave cocidas en un horno de pozo, con un gato ragdoll curioso; los métodos varían."],
  ferment: ["fermentation-vats.webp", "cooking-process.svg",
    "Illustration of wooden vats with fermenting agave material in a distillery courtyard.",
    "Ilustración de tinas de madera con agave en fermentación en el patio de una destilería."],
  distill: ["copper-still.webp", "distillation.svg",
    "Illustration of an artisanal copper still and condenser; actual stills vary by tradition.",
    "Ilustración de un alambique artesanal de cobre y su condensador; los equipos reales varían según la tradición."],
  tasting: ["tasting-table.webp", "tasting-glass.svg",
    "Illustration of a tasting glass, water and a curious ragdoll cat beside the table.",
    "Ilustración de una copa de cata, agua y un gato ragdoll curioso junto a la mesa."],
};
export function educationalFigure(key, locale = null) {
  const item = images[key];
  if (!item) return null;
  const spanish = locale?.get?.() === "es";
  const caption = item[spanish ? 3 : 2];
  const figure = el("figure", { class: "educational-figure" });
  const img = el("img", {
    src: `assets/img/${item[0]}`, alt: caption, loading: "lazy", decoding: "async",
    width: "1120", height: "840"
  });
  // If an illustration fails to load, fall back to the simple SVG diagram.
  img.addEventListener("error", () => {
    if (!img.src.endsWith(item[1])) img.src = `assets/img/${item[1]}`;
  });
  figure.appendChild(img);
  figure.appendChild(el("figcaption", {}, caption));
  return figure;
}
