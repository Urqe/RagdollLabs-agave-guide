import { el } from "./dom-utils.js";

// Editorial reconstructions, not documentary evidence or botanical identification.
// Images are stored in assets/img on main. UUID filenames correspond to user uploads.
// Subject mappings for agave, fermentation and distillation were corrected using mobile screenshots.
const images = {
  agave: ["D4F9B2CD-2586-4FE6-A1AE-DC356A8F0211.png", "agave-plant.svg",
    "Illustrated agave-growing landscape with a ragdoll cat; not a species identification photograph.",
    "Paisaje ilustrado de cultivo de agave con un gato ragdoll; no es una foto para identificar especies."],
  roast: ["58A173D6-C9DF-495D-B006-860C8CF97F1E.png", "cooking-process.svg",
    "Illustration of cooked agave hearts in a roasting pit, with a curious ragdoll cat; methods vary.",
    "Ilustración de piñas de agave cocidas en un horno de pozo, con un gato ragdoll curioso; los métodos varían."],
  ferment: ["1C3620A7-8657-40DF-84FF-A1CBF4D3329C.png", "cooking-process.svg",
    "Illustration of wooden vats with fermenting agave material in a distillery courtyard.",
    "Ilustración de tinas de madera con agave en fermentación en el patio de una destilería."],
  distill: ["716BCA85-2FE1-4412-B7A9-A119620493E1.png", "distillation.svg",
    "Illustration of an artisanal copper still and condenser; actual stills vary by tradition.",
    "Ilustración de un alambique artesanal de cobre y su condensador; los equipos reales varían según la tradición."],
  tasting: ["083E4693-176F-4663-BE33-76A386B3F03C.png", "tasting-glass.svg",
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
    width: "960", height: "720"
  });
  // Safe until binary assets are added to the repository: preserve old diagrams.
  img.addEventListener("error", () => {
    if (!img.src.endsWith(item[1])) img.src = `assets/img/${item[1]}`;
  });
  figure.appendChild(img);
  figure.appendChild(el("figcaption", {}, caption));
  return figure;
}
