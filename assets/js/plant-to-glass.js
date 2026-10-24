import { educationalFigure } from "./educational-images.js";
import { el, clear, safeLink } from "./dom-utils.js";
import { ui, dimensionLabel } from "./presentation.js";
import { localizedTitle, fieldEs } from "./editorial.js";
import { levelOf } from "./compare.js";

/**
 * Pair 25 — From plant to glass. One page that walks the production
 * sequence and links each step to its possible effect in the glass and to
 * real profiles. It reads the existing process, plant and profile records
 * (process names, explanations, glassEffect lines and sources live in
 * processes.json / content-es.json); only the short stage framing and the
 * route questions are authored here. Nothing here claims that a note
 * proves its cause.
 */

export const STAGES = [
  {
    id: "plant",
    processIds: [],
    examples: ["mezcal-espadin-valles-centrales", "mezcal-tobala-sierra-oaxaca", "sotol-chihuahua"],
    title: { en: "The plant", es: "La planta" },
    text: {
      en: "Every spirit starts with a plant. Blue agave is the only one allowed in tequila, and espadín is mezcal's cultivated workhorse. Others, like tobalá in Oaxaca's mountains, are often wild-harvested. Sotol isn't an agave at all: it's distilled from Dasylirion, a close relative.",
      es: "Todo destilado empieza con una planta. El agave azul es el único permitido en el tequila, y el espadín es el caballito de batalla cultivado del mezcal. Otros, como el tobalá de las montañas de Oaxaca, suelen ser silvestres. El sotol ni siquiera es agave: se destila del Dasylirion, un pariente cercano.",
    },
    effect: {
      en: "The species and where it grows are part of the character, as tendencies rather than rules.",
      es: "La especie y el lugar donde crece son parte del carácter, como tendencias y no como reglas.",
    },
    link: { href: "#/discover", label: { en: "Meet the plants", es: "Conoce las plantas" } },
  },
  {
    id: "cooking",
    processIds: ["pit-roast", "steam-cook", "sap-collection"],
    examples: ["mezcal-espadin-valles-centrales", "tequila-blanco-valley-jalisco", "comiteco-aguamiel-chiapas"],
    title: { en: "The cook (or no cook)", es: "La cocción (o sin cocción)" },
    text: {
      en: "Most traditions cook the agave heart, the piña, to turn its complex carbohydrates into sugar it can ferment. Comiteco and destilado de pulque take a different road: they never cook the piña, and ferment sap collected from the living plant instead.",
      es: "La mayoría de las tradiciones cuecen el corazón del agave, la piña, para convertir sus carbohidratos complejos en azúcar que pueda fermentar. El comiteco y el destilado de pulque toman otro camino: nunca cuecen la piña y fermentan la savia que se recoge de la planta viva.",
    },
  },
  {
    id: "extraction",
    processIds: ["milling-extraction"],
    examples: ["mezcal-espadin-valles-centrales", "mezcal-cenizo-sierra-durango", "mezcal-cupreata-rio-de-parras-michoacan"],
    title: { en: "The crush", es: "La molienda" },
    text: {
      en: "The cooked agave is crushed to free its juice: by a stone wheel, a mill, a shredder, wooden mallets or an axe.",
      es: "El agave cocido se machaca para liberar su jugo: con una rueda de piedra, un molino, una desgarradora, mazos de madera o hacha.",
    },
  },
  {
    id: "fermentation",
    processIds: ["wild-fermentation"],
    examples: ["mezcal-cupreata-rio-de-parras-michoacan", "mezcal-papalometl-mixteca-puebla", "tuxca-lineno-cimarron-jalisco-colima"],
    title: { en: "The ferment", es: "La fermentación" },
    text: {
      en: "Yeast turns the sugar into alcohol. In most small-batch spirits the yeast comes from the air and the vats, so every place and season adds its own hand.",
      es: "La levadura convierte el azúcar en alcohol. En la mayoría de los destilados de lotes pequeños la levadura viene del aire y de las tinas, así que cada lugar y cada temporada ponen su propia mano.",
    },
  },
  {
    id: "distillation",
    processIds: ["distillation-methods"],
    examples: ["tuxca-lineno-cimarron-jalisco-colima", "mezcal-tobala-sierra-oaxaca", "tequila-blanco-valley-jalisco"],
    title: { en: "The still", es: "El alambique" },
    text: {
      en: "The ferment is distilled, often twice, and the distiller keeps the heart of the run. Copper, clay and wooden Filipino stills all have their traditions.",
      es: "Lo fermentado se destila, muchas veces dos veces, y el destilador se queda con el corazón. El cobre, el barro y los alambiques filipinos de madera tienen cada uno su tradición.",
    },
  },
  {
    id: "resting",
    processIds: ["wood-maturation", "glass-resting"],
    examples: ["tequila-anejo-valley-jalisco", "comiteco-anejo-comitan-chiapas", "tequila-reposado-valley-jalisco"],
    title: { en: "The rest", es: "El reposo" },
    text: {
      en: "Many spirits go straight into the bottle. Others rest: in oak, in glass, or, for comiteco añejo, in glass with branches of white oak.",
      es: "Muchos destilados van directo a la botella. Otros reposan: en roble, en vidrio o, en el caso del comiteco añejo, en vidrio con ramas de roble blanco.",
    },
  },
  {
    id: "finishing",
    processIds: ["filtration"],
    examples: ["tequila-cristalino-style"],
    title: { en: "The finish before bottling", es: "El acabado antes de embotellar" },
    text: {
      en: "Some spirits are filtered before bottling, for clarity or to take the colour out of an aged spirit.",
      es: "Algunos destilados se filtran antes de embotellar, para darles claridad o para quitarle el color a un destilado con reposo.",
    },
  },
];

/** Two contrasting routes, each with a prediction and its confounders. */
export const ROUTES = [
  {
    id: "cook",
    ids: ["tequila-blanco-valley-jalisco", "mezcal-espadin-valles-centrales"],
    title: { en: "Steam or fire: valley blanco and espadín mezcal", es: "Vapor o fuego: blanco del valle y mezcal espadín" },
    question: { en: "Before you look: which would you expect to taste smokier?", es: "Antes de mirar: ¿cuál esperarías que fuera más ahumado?" },
    dimensions: ["smoke", "herbal", "fruit"],
    caveat: {
      en: "The cook is the likeliest reason for the smoke, but it isn't the only difference. The plants (blue agave and espadín), the places (Jalisco and Oaxaca) and the producers all differ too, and a pit roast doesn't always mean a smoky mezcal.",
      es: "La cocción es la explicación más probable del humo, pero no es la única diferencia. También cambian las plantas (agave azul y espadín), los lugares (Jalisco y Oaxaca) y los productores, y un horno de tierra no siempre da un mezcal ahumado.",
    },
  },
  {
    id: "rest",
    ids: ["tequila-blanco-valley-jalisco", "tequila-anejo-valley-jalisco"],
    title: { en: "Straight to the bottle or a year in oak: valley blanco and añejo", es: "Directo a la botella o un año en roble: blanco y añejo del valle" },
    question: { en: "Before you look: which would you expect to show vanilla, spice and a fuller body?", es: "Antes de mirar: ¿cuál esperarías que mostrara vainilla, especias y más cuerpo?" },
    dimensions: ["oak", "bodyLevel", "sweetness"],
    caveat: {
      en: "These two share the route until the rest, which makes oak the clearest difference. They are still two styles, not one spirit before and after: barrel, time and producer vary, and vanilla on its own wouldn't prove that a spirit saw wood.",
      es: "Estos dos comparten el camino hasta el reposo, así que el roble es la diferencia más clara. Aun así son dos estilos, no un mismo destilado antes y después: la barrica, el tiempo y el productor cambian, y la vainilla por sí sola no probaría que un destilado pasó por madera.",
    },
  },
];

/** Disputed or unresolved process cases, kept visible. */
export const OPEN_QUESTIONS = [
  {
    profileId: "mezcal-verde-altiplano-slp",
    text: {
      en: "How the plateau's maguey verde is cooked is disputed: the producer describes a traditional clay oven, a local reviewer reports an autoclave.",
      es: "Cómo se cuece el maguey verde de la meseta está en disputa: el productor habla de un horno tradicional de barro y un reseñista local reporta autoclave.",
    },
  },
  {
    profileId: "mezcal-cupreata-rio-de-parras-michoacan",
    text: {
      en: "Several tasters credit the pulque that starts the fermentation for the creamy, lactic notes. No source has tested it, and the lots also rested in glass.",
      es: "Varios catadores le atribuyen las notas cremosas y lácticas al pulque con el que arranca la fermentación. Ninguna fuente lo ha comprobado, y los lotes además reposaron en vidrio.",
    },
  },
  {
    profileId: "mezcal-papalometl-mixteca-puebla",
    text: {
      en: "Whether the dry-then-wet fermentation sharpens the acidity is a natural guess. The reviews report the acidity, not its cause.",
      es: "Que la fermentación en seco y luego en húmedo afile la acidez es una suposición natural. Las reseñas reportan la acidez, no su causa.",
    },
  },
];

const STRINGS = {
  en: {
    title: "From plant to glass",
    intro: "Every agave spirit makes roughly the same trip: a plant, a cook, a crush, a ferment, a still and sometimes a rest. Each step can leave something in the glass. None of them guarantees a flavour, and no single note proves which step put it there.",
    overviewLabel: "The trip at a glance",
    stepsHeading: "The steps",
    canShow: "Can show up as",
    editorial: "editorial reading",
    seenIn: "Seen in:",
    howItWorks: "How it works, and the sources",
    routesHeading: "Follow two routes",
    routesIntro: "Same questions, two spirits. Guess first, then open the answer.",
    documented: "How it's made, from the profile",
    reveal: "See what the profiles say",
    notGuarantee: "Why that isn't proof",
    compareLink: "Compare them side by side",
    openHeading: "Still open",
    openIntro: "Some links between method and taste are disputed or simply untested. They stay open here rather than settled by guesswork.",
    practiseHeading: "Practise it",
    practiseTaste: "Try the guided tasting",
    practiseNotes: "Recognise agave, smoke, body and oak",
    practiseReference: "Look up every production step",
    back: { learn: "← Back to Learn", start: "← Back to the lesson", profile: "← Back to the profile" },
  },
  es: {
    title: "De la planta a la copa",
    intro: "Todo destilado de agave hace más o menos el mismo viaje: una planta, una cocción, una molienda, una fermentación, un alambique y a veces un reposo. Cada paso puede dejar algo en la copa. Ninguno garantiza un sabor, y ninguna nota por sí sola prueba qué paso la puso ahí.",
    overviewLabel: "El viaje de un vistazo",
    stepsHeading: "Los pasos",
    canShow: "Se puede notar como",
    editorial: "lectura editorial",
    seenIn: "Visto en:",
    howItWorks: "Cómo funciona, y las fuentes",
    routesHeading: "Sigue dos caminos",
    routesIntro: "Las mismas preguntas, dos destilados. Primero adivina y luego abre la respuesta.",
    documented: "Cómo se hace, según el perfil",
    reveal: "Mira lo que dicen los perfiles",
    notGuarantee: "Por qué eso no es prueba",
    compareLink: "Compáralos lado a lado",
    openHeading: "Todavía abierto",
    openIntro: "Algunas relaciones entre el método y el sabor están en disputa o nadie las ha comprobado. Aquí se quedan abiertas en vez de resolverse adivinando.",
    practiseHeading: "Ponlo en práctica",
    practiseTaste: "Haz la cata guiada",
    practiseNotes: "Reconoce el agave, el humo, el cuerpo y el roble",
    practiseReference: "Consulta cada paso de la elaboración",
    back: { learn: "← Volver a Aprender", start: "← Volver a la lección", profile: "← Volver al perfil" },
  },
};

function s(locale, key) {
  const lang = locale ? locale.get() : "en";
  return (STRINGS[lang] || STRINGS.en)[key];
}

function pick(obj, locale) {
  const lang = locale ? locale.get() : "en";
  return obj[lang] || obj.en;
}

const ORIGIN = "page:plant-to-glass";

/**
 * Profiles do not carry a milling process id; a route shows the crush step
 * only when the profile's own documented method names a crushing tool.
 */
export const CRUSH_TOOLS = /tahona|roller-mill|roller mill|horse-drawn mill|stone-milled|mallet|by axe|desgarradora|shredder|hand-mash/i;

export function routeProcessIds(profile) {
  const ids = [...(profile.processIds || [])];
  if (CRUSH_TOOLS.test(profile.process || "") && !ids.includes("milling-extraction")) ids.push("milling-extraction");
  const order = STAGES.flatMap((st) => st.processIds);
  return ids.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function profileLink(profile, locale) {
  return el("a", {
    href: `#/profile/${encodeURIComponent(profile.id)}?origin=${encodeURIComponent(ORIGIN)}`,
    class: "discovery-chip",
  }, localizedTitle("profile", profile.id, profile.title, locale));
}

function levelWord(profile, key, locale) {
  if (key === "bodyLevel" && ["light", "medium", "full"].includes(profile.body)) {
    return ui(locale, "bodyLevel" + profile.body.replace(/^./, (c) => c.toUpperCase()));
  }
  const level = levelOf(profile, key);
  return ui(locale, level === "medium" ? "mediumLevel" : level || "unknown");
}

function backLink(from, locale) {
  if (!from) return null;
  const labels = s(locale, "back");
  if (from === "learn") return el("a", { href: "#/learn/chapter-from-plant-to-glass", class: "back-link" }, labels.learn);
  const [kind, id] = from.split(":");
  if (kind === "start" && id) return el("a", { href: `#/start/${encodeURIComponent(id)}`, class: "back-link" }, labels.start);
  if (kind === "profile" && id) return el("a", { href: `#/profile/${encodeURIComponent(id)}`, class: "back-link" }, labels.profile);
  return null;
}

function stageCard(stage, index, { processById, profileById, sourceById, locale }) {
  const item = el("li", { class: "ptg-stage", id: `ptg-stage-${stage.id}` });
  item.appendChild(el("span", { class: "ptg-stage-number", "aria-hidden": "true" }, String(index + 1)));
  const body = el("div", { class: "ptg-stage-body" });
  body.appendChild(el("h3", {}, pick(stage.title, locale)));
  if (["cook", "cooking", "roast"].includes(stage.id)) body.appendChild(educationalFigure("roast", locale));
  if (["distill", "distillation", "still"].includes(stage.id)) body.appendChild(educationalFigure("distill", locale));
  body.appendChild(el("p", {}, pick(stage.text, locale)));

  const effects = el("ul", { class: "ptg-effects" });
  if (stage.effect) {
    const li = el("li");
    li.appendChild(el("span", { class: "eyebrow" }, `${s(locale, "canShow")} · ${s(locale, "editorial")}`));
    li.appendChild(el("p", {}, pick(stage.effect, locale)));
    effects.appendChild(li);
  }
  const processes = stage.processIds.map((id) => processById.get(id)).filter(Boolean);
  for (const proc of processes) {
    const li = el("li");
    li.appendChild(el("strong", { class: "ptg-process-name" }, fieldEs("process", proc.id, "name", locale) || proc.name));
    li.appendChild(el("span", { class: "eyebrow" }, `${s(locale, "canShow")} · ${s(locale, "editorial")}`));
    li.appendChild(el("p", {}, fieldEs("process", proc.id, "glassEffect", locale) || proc.glassEffect));
    effects.appendChild(li);
  }
  body.appendChild(effects);

  const examples = stage.examples.map((id) => profileById.get(id)).filter(Boolean);
  if (examples.length) {
    const row = el("p", { class: "ptg-seen-in" });
    row.appendChild(document.createTextNode(s(locale, "seenIn") + " "));
    for (const p of examples) {
      row.appendChild(profileLink(p, locale));
      row.appendChild(document.createTextNode(" "));
    }
    body.appendChild(row);
  }
  if (stage.link) {
    body.appendChild(el("a", { href: stage.link.href, class: "quiet-link" }, pick(stage.link.label, locale) + " →"));
  }

  // Progressive reveal: the full explanation and attributed sources.
  if (processes.length) {
    const details = el("details", { class: "ptg-details" });
    details.appendChild(el("summary", {}, s(locale, "howItWorks")));
    for (const proc of processes) {
      details.appendChild(el("h4", {}, fieldEs("process", proc.id, "name", locale) || proc.name));
      details.appendChild(el("p", {}, fieldEs("process", proc.id, "explanation", locale) || proc.explanation));
      const list = el("ul", { class: "source-list" });
      for (const sid of proc.sourceIds || []) {
        const src = sourceById.get(sid);
        if (!src) continue;
        const li = el("li");
        li.appendChild(safeLink(src.url, src.title, { class: "source-link" }));
        list.appendChild(li);
      }
      if (list.childNodes.length) details.appendChild(list);
    }
    body.appendChild(details);
  }
  item.appendChild(body);
  return item;
}

function routeBlock(route, { processById, profileById, locale }) {
  const profiles = route.ids.map((id) => profileById.get(id)).filter(Boolean);
  if (profiles.length !== route.ids.length) return null;
  const block = el("article", { class: "ptg-route", "aria-labelledby": `ptg-route-${route.id}` });
  block.appendChild(el("h3", { id: `ptg-route-${route.id}` }, pick(route.title, locale)));

  const columns = el("div", { class: "ptg-route-columns" });
  for (const p of profiles) {
    const col = el("section", { class: "ptg-route-column", "aria-label": localizedTitle("profile", p.id, p.title, locale) });
    col.appendChild(el("h4", {}, localizedTitle("profile", p.id, p.title, locale)));
    const steps = el("ol", { class: "ptg-route-steps" });
    for (const pid of routeProcessIds(p)) {
      const proc = processById.get(pid);
      if (proc) steps.appendChild(el("li", {}, fieldEs("process", proc.id, "name", locale) || proc.name));
    }
    col.appendChild(steps);
    const documented = el("p", { class: "editorial-note" });
    documented.appendChild(el("strong", {}, s(locale, "documented") + ": "));
    documented.appendChild(document.createTextNode(fieldEs("profile", p.id, "process", locale) || p.process));
    col.appendChild(documented);
    columns.appendChild(col);
  }
  block.appendChild(columns);

  block.appendChild(el("p", { class: "ptg-question" }, pick(route.question, locale)));
  const details = el("details", { class: "ptg-details ptg-answer" });
  details.appendChild(el("summary", {}, s(locale, "reveal")));
  const table = el("table", { class: "ptg-levels" });
  const head = el("tr");
  head.appendChild(el("th", { scope: "col" }, ""));
  for (const p of profiles) head.appendChild(el("th", { scope: "col" }, localizedTitle("profile", p.id, p.title, locale)));
  const thead = el("thead");
  thead.appendChild(head);
  table.appendChild(thead);
  const tbody = el("tbody");
  for (const key of route.dimensions) {
    const row = el("tr");
    row.appendChild(el("th", { scope: "row" }, dimensionLabel(key, locale)));
    for (const p of profiles) row.appendChild(el("td", {}, levelWord(p, key, locale)));
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  // Pair 29: wide tables scroll inside their own box, never the page.
  const scroller = el("div", { class: "ptg-levels-scroll" });
  scroller.appendChild(table);
  details.appendChild(scroller);
  details.appendChild(el("h4", {}, s(locale, "notGuarantee")));
  details.appendChild(el("p", {}, pick(route.caveat, locale)));
  details.appendChild(el("a", { href: `#/compare/${route.ids.join(",")}`, class: "cta-link" }, s(locale, "compareLink")));
  block.appendChild(details);
  return block;
}

export function renderPlantToGlass(container, { processes = [], profiles = [], sources = [], locale = null, from = null } = {}) {
  clear(container);
  const processById = new Map(processes.map((p) => [p.id, p]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const sourceById = new Map(sources.map((x) => [x.id, x]));
  const ctx = { processById, profileById, sourceById, locale };

  const section = el("section", { class: "plant-to-glass-view", "aria-labelledby": "plant-to-glass-heading" });
  const back = backLink(from, locale);
  if (back) section.appendChild(back);
  section.appendChild(el("h1", { id: "plant-to-glass-heading" }, s(locale, "title")));
  section.appendChild(el("p", { class: "view-intro" }, s(locale, "intro")));

  // Pair 26: the overview doubles as a jump list on this long page. Hash
  // links would change the route, so these are buttons that scroll.
  const overview = el("ol", { class: "ptg-overview", "aria-label": s(locale, "overviewLabel") });
  for (const stage of STAGES) {
    const li = el("li");
    const jump = el("button", { type: "button", class: "ptg-jump", "data-stage": stage.id }, pick(stage.title, locale));
    jump.addEventListener("click", () => {
      const target = section.querySelector(`#ptg-stage-${stage.id} h3`);
      if (!target) return;
      if (typeof target.scrollIntoView === "function") target.scrollIntoView({ block: "start" });
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
    li.appendChild(jump);
    overview.appendChild(li);
  }
  section.appendChild(overview);

  section.appendChild(el("h2", {}, s(locale, "stepsHeading")));
  const steps = el("ol", { class: "ptg-stages" });
  STAGES.forEach((stage, index) => steps.appendChild(stageCard(stage, index, ctx)));
  section.appendChild(steps);

  section.appendChild(el("h2", {}, s(locale, "routesHeading")));
  section.appendChild(el("p", {}, s(locale, "routesIntro")));
  for (const route of ROUTES) {
    const block = routeBlock(route, ctx);
    if (block) section.appendChild(block);
  }

  section.appendChild(el("h2", {}, s(locale, "openHeading")));
  section.appendChild(el("p", {}, s(locale, "openIntro")));
  const open = el("ul", { class: "ptg-open" });
  for (const q of OPEN_QUESTIONS) {
    const p = profileById.get(q.profileId);
    if (!p) continue;
    const li = el("li");
    li.appendChild(el("p", {}, pick(q.text, locale)));
    li.appendChild(profileLink(p, locale));
    open.appendChild(li);
  }
  section.appendChild(open);

  section.appendChild(el("h2", {}, s(locale, "practiseHeading")));
  const practise = el("ul", { class: "discovery-matches" });
  for (const [href, key] of [["#/start/how-to-taste", "practiseTaste"], ["#/start/recognise-the-notes", "practiseNotes"], ["#/learn/processes", "practiseReference"]]) {
    const li = el("li");
    const a = el("a", { href, class: "discovery-card" });
    a.appendChild(el("strong", {}, s(locale, key)));
    li.appendChild(a);
    practise.appendChild(li);
  }
  section.appendChild(practise);

  container.appendChild(section);
  return section;
}
