import { el } from "./dom-utils.js";

// Original conceptual illustrations. Not photographs or species-identification guides.
// Captions stay bilingual and explicitly distinguish examples from evidence.
const images = {
  agave: ["agave-plant.svg", "An illustration of a generic agave rosette; species vary in appearance.", "Ilustración de una roseta genérica de agave; cada especie tiene su aspecto."],
  roast: ["cooking-process.svg", "Schematic cross-section of an agave roasting pit; real ovens vary.", "Esquema de un horno de pozo para agave; los hornos reales varían."],
  distill: ["distillation.svg", "Simplified still diagram; equipment differs across traditions.", "Esquema simplificado de un alambique; el equipo varía según la tradición."],
  tasting: ["tasting-glass.svg", "A small tasting glass with water alongside.", "Una copa pequeña de cata con agua al lado."],
};
export function educationalFigure(key, locale = null) {
  const item = images[key];
  if (!item) return null;
  const spanish = locale?.lang === "es" || locale?.language === "es" || locale?.code === "es" || locale?.lang === "es-MX";
  const caption = item[spanish ? 2 : 1];
  const figure = el("figure", { class: "educational-figure" });
  figure.appendChild(el("img", { src: `assets/img/${item[0]}`, alt: caption, loading: "lazy", decoding: "async", width: "640", height: "300" }));
  figure.appendChild(el("figcaption", {}, caption));
  return figure;
}
