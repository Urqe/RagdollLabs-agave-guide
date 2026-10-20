import { el, clear } from "./dom-utils.js";
import { tasteNote } from "./taste-notes.js";
import { SPIRIT_LABELS } from "./spirit-labels.js";
import { DIMENSIONS, levelOf } from "./compare.js";

const COPY = {
  en: {
    brand: "reference tools", title: "Agave Guide", tagline: "Find the character behind the pour.",
    intro: "Explore Mexico’s spirits through their plants, places and craft. Start with a familiar name, or follow your curiosity somewhere new.",
    explore: "Explore spirits", exploreHint: "Discover styles, places and flavours.",
    compare: "Compare styles", compareHint: "Find what makes each expression different.",
    learn: "New to agave?", learnHint: "Get to know the plants and the craft.",
    catalogue: "Browse bottles", catalogueHint: "Find a brand, producer or expression.",
    featured: "A few places to begin", featuredHint: "Three traditions. Three ways into the glass.",
    scene: "A little curiosity. Good company.", all: "Explore the collection",
    guide: "An invitation to explore", browse: "Find your next discovery",
    browseIntro: "Browse a tradition, follow a flavour, or explore a place. Every profile is a starting point.",
    tradition: "Spirit / tradition", allTraditions: "All traditions", flavour: "Flavour mood",
    allFlavours: "All flavours", map: "Explore by place", mapHint: "Map shading shows guide coverage, not legal production boundaries.",
    results: "Style profiles", reset: "Clear all",
    profile: "profile", profiles: "profiles",
    compareSelected: "In your comparison \u2197", compareFull: "Comparison full \u2014 open your selection \u2197", removed: "Removed from your comparison.",
    noneSelected: "No profiles selected.", oneSelected: "1 profile selected",
    comparing: "Comparing", removedFrom: "Removed {name}.", addedTo: "Added {name}.", noMatches: "No profiles match these filters. Try another combination.",
    sensory: "Character in the glass", sensoryNote: "Qualitative editorial guidance; individual bottles and batches vary.",
    body: "Body", notes: "Typical notes", smoke: "Smoke", finish: "Finish",
    light: "Light body", medium: "Medium body", full: "Full body",
    details: "Place, plant & craft", sources: "Sources & references",
    legal: "Legal category", plant: "Plant", process: "Production",
    compareThis: "Compare this style", choices: "Your comparison",
    remove: "Remove", slots: "Choose up to three styles. Remove a selection to make room.",
    scroll: "Scroll sideways to compare all styles.", dimension: "Attribute",
    none: "None", low: "Low", high: "High", mediumLevel: "Medium", unknown: "Not documented",
    herbal: "Herbal / vegetal", fruit: "Fruit / floral", sweetness: "Perceived sweetness", pepper: "Pepper / spice", oak: "Oak",
    home: "Return to Agave Guide home", search: "Search the guide",
    disclosure: "Editorial content and some reference labels are currently in English.",
    guidance: "Editorial style guidance — a description of the style, not a review or rating of any bottle.",
    footer: "Explore with curiosity. Enjoy responsibly.",
  },
  es: {
    brand: "herramientas de consulta", title: "Guía del Agave", tagline: "Descubre el carácter de cada copa.",
    intro: "Explora los destilados de México a través de sus plantas, lugares y métodos. Empieza por un nombre conocido o sigue tu curiosidad.",
    explore: "Explorar destilados", exploreHint: "Descubre estilos, lugares y sabores.",
    compare: "Comparar estilos", compareHint: "Descubre qué distingue a cada expresión.",
    learn: "¿Nuevo en el agave?", learnHint: "Conoce las plantas y su elaboración.",
    catalogue: "Explorar botellas", catalogueHint: "Busca una marca, productor o expresión.",
    featured: "Por dónde empezar", featuredHint: "Tres tradiciones. Tres formas de descubrir.",
    scene: "Un poco de curiosidad. Buena compañía.", all: "Explorar la colección",
    guide: "Una invitación a explorar", browse: "Encuentra tu próximo descubrimiento",
    browseIntro: "Explora una tradición, sigue un sabor o descubre un lugar. Cada perfil es un punto de partida.",
    tradition: "Destilado / tradición", allTraditions: "Todas las tradiciones", flavour: "Perfil de sabor",
    allFlavours: "Todos los sabores", map: "Explorar por lugar", mapHint: "El sombreado indica la cobertura de la guía, no los límites legales de producción.",
    results: "Perfiles de estilo", reset: "Borrar todo",
    profile: "perfil", profiles: "perfiles",
    compareSelected: "En tu comparaci\u00f3n \u2197", compareFull: "Comparaci\u00f3n completa \u2014 abre tu selecci\u00f3n \u2197", removed: "Quitado de tu comparaci\u00f3n.",
    noneSelected: "Ning\u00fan perfil seleccionado.", oneSelected: "1 perfil seleccionado",
    comparing: "Comparando", removedFrom: "Quitado {name}.", addedTo: "A\u00f1adido {name}.", noMatches: "Ningún perfil coincide. Prueba otra combinación.",
    sensory: "Carácter en la copa", sensoryNote: "Orientación editorial cualitativa; cada botella y lote puede variar.",
    body: "Cuerpo", notes: "Notas típicas", smoke: "Humo", finish: "Final",
    light: "Cuerpo ligero", medium: "Cuerpo medio", full: "Cuerpo pleno",
    details: "Lugar, planta y elaboración", sources: "Fuentes y referencias",
    legal: "Categoría legal", plant: "Planta", process: "Elaboración",
    compareThis: "Comparar este estilo", choices: "Tu comparación",
    remove: "Quitar", slots: "Elige hasta tres estilos. Quita uno para dejar espacio.",
    scroll: "Desliza horizontalmente para comparar todos los estilos.", dimension: "Atributo",
    none: "Nada", low: "Bajo", high: "Alto", mediumLevel: "Medio", unknown: "No documentado",
    herbal: "Herbal / vegetal", fruit: "Fruta / floral", sweetness: "Dulzor percibido", pepper: "Pimienta / especias", oak: "Roble",
    home: "Volver al inicio de la Guía del Agave", search: "Buscar en la guía",
    disclosure: "El contenido editorial y algunas etiquetas de referencia están actualmente en inglés.",
    guidance: "Orientación editorial sobre el estilo; no es una reseña ni una calificación de una botella.",
    footer: "Explora con curiosidad. Disfruta con responsabilidad.",
  },
};

export function ui(locale, key) {
  return COPY[locale?.get() === "es" ? "es" : "en"][key] || key;
}

export function discoveryCard(profile, locale = null) {
  const link = el("a", { class: "discovery-card", href: "#/profile/" + encodeURIComponent(profile.id) });
  link.appendChild(el("span", { class: "eyebrow" }, SPIRIT_LABELS[profile.spirit] || profile.spirit));
  link.appendChild(el("strong", {}, profile.title));
  link.appendChild(el("span", { class: "discovery-place" }, profile.stateName + ", México"));
  link.appendChild(el("span", { class: "discovery-notes" },
    (profile.tasteNotes || []).slice(0, 3).map((n) => tasteNote(n, locale)).join(" · ")));
  link.appendChild(el("span", { class: "card-arrow", "aria-hidden": "true" }, "↗"));
  return link;
}

export function renderHome(container, { profiles, locale }) {
  clear(container);
  const section = el("section", { class: "home-view", "aria-labelledby": "home-heading" });
  const hero = el("div", { class: "welcome-hero" });
  const copy = el("div", { class: "welcome-copy" });
  copy.appendChild(el("p", { class: "eyebrow" }, "RagDollLabs · " + ui(locale, "brand")));
  copy.appendChild(el("h1", { id: "home-heading" }, ui(locale, "title")));
  copy.appendChild(el("p", { class: "welcome-tagline" }, ui(locale, "tagline")));
  copy.appendChild(el("p", { class: "home-intro" }, ui(locale, "intro")));
  const actions = el("div", { class: "welcome-actions" });
  for (const [key, href] of [["explore", "#/explore"], ["compare", "#/compare"], ["learn", "#/learn"], ["catalogue", "#/catalogue"]]) {
    const action = el("a", { class: "welcome-action" + (key === "explore" ? " is-primary" : ""), href });
    action.appendChild(el("strong", {}, ui(locale, key) + " ↗"));
    action.appendChild(el("span", {}, ui(locale, key + "Hint")));
    actions.appendChild(action);
  }
  copy.appendChild(actions);
  const scene = el("div", { class: "welcome-scene", "aria-hidden": "true" });
  scene.appendChild(el("div", { class: "scene-sun" }));
  scene.appendChild(el("div", { class: "scene-ridge scene-ridge-back" }));
  scene.appendChild(el("div", { class: "scene-ridge scene-ridge-front" }));
  for (let plant = 0; plant < 3; plant++) {
    const agave = el("div", { class: "scene-agave scene-agave-" + plant });
    for (let leaf = 0; leaf < 7; leaf++) agave.appendChild(el("i", { class: "agave-leaf leaf-" + leaf }));
    scene.appendChild(agave);
  }
  scene.appendChild(el("div", { class: "scene-table" }));
  scene.appendChild(el("img", { src: "./assets/ragdoll-cat.svg", class: "scene-cat", width: "320", height: "360", alt: "" }));
  scene.appendChild(el("div", { class: "scene-glass" }));
  scene.appendChild(el("p", { class: "scene-caption" }, ui(locale, "scene")));
  hero.append(copy, scene);
  section.appendChild(hero);
  const featured = el("section", { class: "featured-section", "aria-labelledby": "featured-heading" });
  featured.appendChild(el("p", { class: "eyebrow" }, ui(locale, "guide")));
  featured.appendChild(el("h2", { id: "featured-heading" }, ui(locale, "featured")));
  featured.appendChild(el("p", { class: "view-intro" }, ui(locale, "featuredHint")));
  const cards = el("div", { class: "discovery-grid featured-grid" });
  const ids = ["tequila-blanco-valley-jalisco", "mezcal-espadin-valles-centrales", "bacanora-pacifica-sierra-sonora"];
  const picks = ids.map(id => profiles.find(p => p.id === id)).filter(Boolean);
  for (const profile of picks.length ? picks : profiles.slice(0, 3)) cards.appendChild(discoveryCard(profile));
  featured.appendChild(cards);
  featured.appendChild(el("a", { class: "text-action", href: "#/explore" }, ui(locale, "all") + " →"));
  section.appendChild(featured);
  container.appendChild(section);
}

/** Localized label for a comparison/sensory dimension key. */
export function dimensionLabel(key, locale) {
  const keys = { bodyLevel: "body", finishLength: "finish" };
  return ui(locale, keys[key] || key);
}

export function sensoryOverview(profile, locale) {
  const section = el("section", { class: "sensory-overview", "aria-labelledby": "sensory-heading" });
  section.appendChild(el("h3", { id: "sensory-heading" }, ui(locale, "sensory")));
  section.appendChild(el("p", { class: "sensory-note" }, ui(locale, "sensoryNote")));
  const list = el("dl", { class: "sensory-grid" });
  const keys = { bodyLevel: "body", finishLength: "finish" };
  for (const { key } of DIMENSIONS) {
    const level = levelOf(profile, key);
    const row = el("div", { class: "sensory-row" });
    row.appendChild(el("dt", {}, ui(locale, keys[key] || key)));
    const value = el("dd");
    value.appendChild(el("span", { class: "sensory-value" }, ui(locale, level === "medium" ? "mediumLevel" : level || "unknown")));
    const track = el("span", { class: "sensory-track", "aria-hidden": "true" });
    track.appendChild(el("span", { class: "sensory-fill level-" + (level || "unknown") }));
    value.appendChild(track);
    row.appendChild(value);
    list.appendChild(row);
  }
  section.appendChild(list);
  return section;
}
