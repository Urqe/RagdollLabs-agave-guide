import { el, clear } from "./dom-utils.js";
import { navigateTo } from "./router.js";
import { ui, renderHome } from "./presentation.js";
import { localizedTitle, fieldEs } from "./editorial.js";
import { SPIRIT_LABELS } from "./spirit-labels.js";

/**
 * Pair 9 — "Your First Agave Spirit": a short, optional beginner
 * journey through existing material. Five individually addressable
 * steps, each with one principal idea, a concrete example and a clear
 * next action. Lessons never duplicate sensory data: they point at
 * the existing profiles, chapters and comparison engine. Progression
 * is free — every step is directly reachable and readable without
 * completing the previous ones.
 */

export const JOURNEY_STEPS = [
  {
    id: "what-are-they",
    title: { en: "What these spirits are", es: "Qué son estos destilados" },
    idea: {
      en: "This guide mainly covers agave spirits: a mature agave plant — cooked, or its fresh sap — fermented and distilled. It also includes sotol, a close relative distilled from the Dasylirion plant, honestly labeled as such. Tequila and mezcal are the two you will meet most; bacanora, raicilla and other traditions keep their own names, places and methods.",
      es: "Esta guía cubre principalmente destilados de agave: una planta de agave madura — cocida, o de su savia fresca — fermentada y destilada. También incluye el sotol, un pariente cercano destilado de la planta Dasylirion, etiquetado con honestidad como tal. El tequila y el mezcal son los dos que más vas a encontrar; la bacanora, la raicilla y otras tradiciones conservan sus propios nombres, lugares y métodos.",
    },
    examples: [
      { profileId: "tequila-blanco-valley-jalisco", reason: { en: "The clearest place to start: unaged tequila, straight cooked agave in the glass.", es: "El mejor punto de partida: tequila sin crianza, agave cocido directo en la copa." } },
      { profileId: "mezcal-espadin-valles-centrales", reason: { en: "The other great tradition: pit-roasted espadín agave, with its gentle smoke.", es: "La otra gran tradición: agave espadín asado en pozo, con su humo suave." } },
    ],
  },
  {
    id: "how-to-taste",
    title: { en: "How to taste", es: "Cómo catar" },
    idea: {
      en: "You do not need a glass to learn: this guide describes styles, so reading one profile and its character levels teaches the vocabulary. When you do taste, go neat, in a small pour, and notice the body and the finish before naming any note.",
      es: "No necesitas una copa para aprender: esta guía describe estilos, así que leer un perfil y sus niveles de carácter enseña el vocabulario. Cuando pruebes, sírvelo solo — sin hielo ni mezcladores — en una porción pequeña, y nota el cuerpo y el final antes de nombrar cualquier nota.",
    },
    examples: [
      { profileId: "tequila-blanco-valley-jalisco", reason: { en: "Read the character levels of one style first — the labels mean the same thing everywhere in the guide.", es: "Lee primero los niveles de carácter de un estilo — las etiquetas significan lo mismo en toda la guía." } },
      { chapterId: "understanding-flavour", reason: { en: "The flavour chapter explains each dimension with real profiles.", es: "El capítulo de sabor explica cada dimensión con perfiles reales." } },
    ],
  },
  {
    id: "recognise-the-notes",
    title: { en: "Recognise agave, smoke, body and oak", es: "Reconoce el agave, el humo, el cuerpo y el roble" },
    idea: {
      en: "Four landmarks cover most of what you will taste. Cooked agave reads savory and vegetal; smoke comes from the pit roast, not from peat; body is how the spirit feels in the mouth; oak — vanilla, caramel, spice — only arrives when the spirit rests in wood. Sweetness here means perceived sweetness, never measured sugar.",
      es: "Cuatro puntos de referencia cubren la mayor parte de lo que probarás. El agave cocido se lee sabroso y vegetal; el humo viene del asado en pozo, no de la turba; el cuerpo es cómo se siente el destilado en la boca; el roble — vainilla, caramelo, especia — solo llega cuando el destilado reposa en madera. La dulzura aquí significa dulzura percibida, nunca azúcar medido.",
    },
    examples: [
      { profileId: "mezcal-espadin-valles-centrales", reason: { en: "Gentle smoke from the pit roast — compare its smoke level with a tequila blanco's none.", es: "Humo suave del asado en pozo — compara su nivel de humo con el «ninguno» de un tequila blanco." } },
      { profileId: "tequila-anejo-valley-jalisco", reason: { en: "What oak contributes once a spirit rests in wood.", es: "Lo que aporta el roble cuando un destilado reposa en madera." } },
    ],
  },
  {
    id: "first-comparison",
    title: { en: "Try a comparison", es: "Prueba una comparación" },
    idea: {
      en: "The fastest way to feel what wood resting changes: compare the valley blanco with the valley reposado — same tradition, same region, same plant, and the reposado's oak rest (the legal minimum is two months; the typical style runs two months to a year) is the difference the view highlights. These are typical styles, not a laboratory experiment isolating every production variable; bottles within each style vary.",
      es: "La forma más rápida de sentir lo que cambia el reposo en madera: compara el blanco del valle con el reposado del valle — misma tradición, misma región, misma planta, y el reposo en roble del reposado (el mínimo legal son dos meses; el estilo típico va de dos meses a un año) es la diferencia que la vista destaca. Son estilos típicos, no un experimento de laboratorio que aísle cada variable de producción; las botellas dentro de cada estilo varían.",
    },
    comparison: ["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"],
    comparisonLabel: { en: "Open the prepared comparison: valley blanco vs valley reposado", es: "Abre la comparación preparada: blanco del valle contra reposado del valle" },
    secondExercise: {
      label: { en: "Optional second exercise: valley blanco vs highland blanco", es: "Segundo ejercicio opcional: blanco del valle contra blanco de los Altos" },
      ids: ["tequila-blanco-valley-jalisco", "tequila-blanco-highland-jalisco"],
      reason: { en: "Same plant and class, different region. The comparison describes tendencies — geography shapes flavor together with method and plant, it never decides it alone.", es: "Misma planta y clase, distinta región. La comparación describe tendencias — la geografía moldea el sabor junto con el método y la planta, nunca lo decide sola." },
    },
  },
  {
    id: "explore-next",
    title: { en: "Choose what to explore next", es: "Elige qué explorar después" },
    idea: {
      en: "That is the whole foundation: a style, four landmarks and one comparison. From here you can browse the styles, follow a flavor, look up a bottle you liked, or keep reading the reference chapters — no purchase or tasting required to go further.",
      es: "Ese es todo el fundamento: un estilo, cuatro puntos de referencia y una comparación. Desde aquí puedes explorar los estilos, seguir un sabor, buscar una botella que te gustó, o seguir leyendo los capítulos de referencia — no se requiere compra ni cata para avanzar.",
    },
    destinations: [
      { href: "#/explore", label: { en: "Browse the styles", es: "Explora los estilos" }, reason: { en: "Every profile in the guide, searchable.", es: "Todos los perfiles de la guía, con búsqueda." } },
      { href: "#/discover", label: { en: "Plants & places", es: "Plantas y lugares" }, reason: { en: "Understand the plants, regions and traditions behind the styles.", es: "Entiende las plantas, regiones y tradiciones detrás de los estilos." } },
      { href: "#/catalogue", label: { en: "Look up a bottle", es: "Busca una botella" }, reason: { en: "The reviewed bottle catalogue.", es: "El catálogo de botellas con reseñas." } },
      { href: "#/learn", label: { en: "Keep learning", es: "Sigue aprendiendo" }, reason: { en: "The seven chapters and reference material.", es: "Los siete capítulos y el material de referencia." } },
    ],
  },
];

export function journeyStepById(id) {
  return JOURNEY_STEPS.find((s) => s.id === id) || null;
}

const STRINGS = {
  en: {
    hubTitle: "Your first agave spirit",
    hubIntro: "New to agave? In five short steps you will recognize a few useful flavor differences and understand your first comparison — reading only, no purchase, no glass, no account, no quiz.",
    stepsLabel: "The steps",
    outcomeLabel: "What you will get out of it",
    outcomes: "Recognize four landmarks — cooked agave, smoke, body and oak — and read one prepared comparison that shows what wood resting changes.",
    referenceLabel: "Prefer the reference material?",
    referenceLink: "Go straight to the Learn chapters",
    lessonBack: "← Back to the journey start",
    next: "Next step: {title} →",
    previous: "← Previous: {title}",
    finish: "Finish the journey →",
    stepListLabel: "All steps",
    exampleLabel: "Open an example",
    exampleFrom: "From the guide",
    startOver: "Start the journey",
    invalidLesson: "That lesson does not exist.",
    invalidLessonBody: "The journey has five steps — pick any of them below; each one reads on its own.",
    whyThisExample: "Why open it",
    preparedComparisonNote: "The comparison opens in the existing comparison view with these two styles selected. If you had styles saved for comparison, returning to the journey brings them back — your own picks in the comparison are always kept.",
  },
  es: {
    hubTitle: "Tu primer destilado de agave",
    hubIntro: "¿Nuevo en el agave? En cinco pasos cortos reconocerás algunas diferencias de sabor útiles y entenderás tu primera comparación — solo lectura, sin compra, sin copa, sin cuenta, sin examen.",
    stepsLabel: "Los pasos",
    outcomeLabel: "Qué te llevarás",
    outcomes: "Reconocerás cuatro puntos de referencia — agave cocido, humo, cuerpo y roble — y leerás una comparación preparada que muestra lo que cambia el reposo en madera.",
    referenceLabel: "¿Prefieres el material de referencia?",
    referenceLink: "Ve directo a los capítulos de Aprende",
    lessonBack: "← Volver al inicio del recorrido",
    next: "Siguiente paso: {title} →",
    previous: "← Anterior: {title}",
    finish: "Termina el recorrido →",
    stepListLabel: "Todos los pasos",
    exampleLabel: "Abre un ejemplo",
    exampleFrom: "De la guía",
    startOver: "Empieza el recorrido",
    invalidLesson: "Esa lección no existe.",
    invalidLessonBody: "El recorrido tiene cinco pasos — elige cualquiera de ellos abajo; cada uno se lee por sí solo.",
    whyThisExample: "Por qué abrirlo",
    preparedComparisonNote: "La comparación se abre en la vista de comparación existente con estos dos estilos seleccionados. Si tenías estilos guardados para comparar, volver al recorrido los recupera — lo que tú elijas en la comparación siempre se conserva.",
  },
};

function jt(locale, key) {
  const lang = locale ? locale.get() : "en";
  return (STRINGS[lang] || STRINGS.en)[key];
}

function stepTitle(step, locale) {
  const lang = locale ? locale.get() : "en";
  return step.title[lang] || step.title.en;
}

function localizedProfileById(id, profiles, locale) {
  const profile = profiles.find((p) => p.id === id);
  if (!profile) return null;
  return { profile, title: localizedTitle("profile", profile.id, profile.title, locale) };
}

/** Example card: one or two per lesson, each with a reason to open it. */
function exampleCard({ profileId, chapterId, reason }, { profiles, chapters = [], locale, lessonId }) {
  const lang = locale ? locale.get() : "en";
  const card = el("li");
  if (profileId) {
    const found = localizedProfileById(profileId, profiles, locale);
    if (!found) return null;
    const link = el("a", {
      href: `#/profile/${encodeURIComponent(profileId)}?origin=${encodeURIComponent("start:" + lessonId)}`,
      class: "discovery-card",
    });
    link.appendChild(el("span", { class: "eyebrow" }, SPIRIT_LABELS[found.profile.spirit] || found.profile.spirit));
    link.appendChild(el("strong", {}, found.title));
    link.appendChild(el("span", { class: "discovery-place" }, `${found.profile.stateName}, México`));
    card.appendChild(link);
  } else if (chapterId) {
    const chapter = (chapters || []).find((c) => c.id === chapterId);
    const chapterTitle = chapter
      ? (fieldEs("chapter", chapter.id, "title", locale) || chapter.title)
      : ui(locale, "learn.heading");
    const link = el("a", {
      href: `#/learn?from=${encodeURIComponent("start:" + lessonId)}`,
      class: "discovery-card",
    });
    link.appendChild(el("span", { class: "eyebrow" }, jt(locale, "exampleFrom")));
    link.appendChild(el("strong", {}, chapterTitle));
    card.appendChild(link);
  } else {
    return null;
  }
  if (reason) card.appendChild(el("p", { class: "discovery-reason" }, reason[lang] || reason.en));
  return card;
}

/** The visible step list: direct skipping, active step announced. */
function stepList(activeId, locale) {
  const nav = el("nav", { class: "journey-steps", "aria-label": jt(locale, "stepListLabel") });
  const list = el("ol", { class: "journey-step-list" });
  JOURNEY_STEPS.forEach((step, index) => {
    const label = `${index + 1}. ${stepTitle(step, locale)}`;
    const item = el("li", { class: step.id === activeId ? "is-active" : undefined });
    if (step.id === activeId) {
      // The current position is a marker, never a link to itself.
      const marker = el("strong", { "aria-current": "step" }, label);
      item.appendChild(marker);
    } else {
      item.appendChild(el("a", { href: `#/start/${encodeURIComponent(step.id)}` }, label));
    }
    list.appendChild(item);
  });
  nav.appendChild(list);
  return nav;
}

/** Hub page: outcome, step list, reference entrance. */
export function renderStartHub(container, { profiles, locale = null } = {}) {
  clear(container);
  const section = el("section", { class: "start-view", "aria-labelledby": "start-heading" });
  section.appendChild(el("h2", { id: "start-heading" }, jt(locale, "hubTitle")));
  section.appendChild(el("p", { class: "view-intro" }, jt(locale, "hubIntro")));
  const outcome = el("p", { class: "journey-outcome" });
  outcome.appendChild(el("strong", {}, jt(locale, "outcomeLabel") + " "));
  outcome.appendChild(document.createTextNode(jt(locale, "outcomes")));
  section.appendChild(outcome);
  section.appendChild(el("h3", { class: "sources-heading" }, jt(locale, "stepsLabel")));
  section.appendChild(stepList(null, locale));
  const reference = el("p", { class: "journey-reference" });
  reference.appendChild(el("strong", {}, jt(locale, "referenceLabel") + " "));
  reference.appendChild(el("a", { href: "#/learn", class: "learn-callout-link" }, jt(locale, "referenceLink")));
  section.appendChild(reference);
  container.appendChild(section);
  return section;
}

/** One lesson: principal idea, examples, prepared comparison, step list, prev/next. */
export function renderLesson(container, { lessonId, profiles, chapters = [], locale = null } = {}) {
  clear(container);
  const lang = locale ? locale.get() : "en";
  const step = journeyStepById(lessonId);
  const section = el("section", { class: "start-view lesson-view", "aria-labelledby": "start-heading" });
  section.appendChild(el("a", { href: "#/start", class: "back-link" }, jt(locale, "lessonBack")));
  if (!step) {
    section.appendChild(el("h2", { id: "start-heading" }, jt(locale, "invalidLesson")));
    section.appendChild(el("p", { class: "view-intro" }, jt(locale, "invalidLessonBody")));
    section.appendChild(stepList(null, locale));
    container.appendChild(section);
    return section;
  }
  const index = JOURNEY_STEPS.indexOf(step);
  section.appendChild(el("h2", { id: "start-heading" }, `${index + 1}. ${stepTitle(step, locale)}`));
  section.appendChild(el("p", { class: "view-intro lesson-idea" }, step.idea[lang] || step.idea.en));
  section.appendChild(stepList(step.id, locale));

  const examples = step.examples || [];
  if (examples.length > 0) {
    section.appendChild(el("h3", { class: "sources-heading" }, jt(locale, "exampleLabel")));
    const list = el("ul", { class: "discovery-matches" });
    for (const example of examples) {
      const card = exampleCard(example, { profiles, chapters, locale, lessonId: step.id });
      if (card) list.appendChild(card);
    }
    if (list.childNodes.length > 0) section.appendChild(list);
  }

  if (step.comparison) {
    const ids = step.comparison.join(",");
    const handoff = el("p", { class: "journey-comparison" });
    const link = el("a", {
      href: `#/compare/${ids}?from=${encodeURIComponent("start:" + step.id)}`,
      class: "cta-link",
    }, step.comparisonLabel[lang] || step.comparisonLabel.en || stepTitle(step, locale));
    handoff.appendChild(link);
    section.appendChild(handoff);
    section.appendChild(el("p", { class: "editorial-note" }, jt(locale, "preparedComparisonNote")));
    if (step.secondExercise) {
      const second = el("p", { class: "journey-comparison" });
      const secondLink = el("a", {
        href: `#/compare/${step.secondExercise.ids.join(",")}?from=${encodeURIComponent("start:" + step.id)}`,
        class: "quiet-link",
      }, step.secondExercise.label[lang] || step.secondExercise.label.en);
      second.appendChild(secondLink);
      section.appendChild(second);
      section.appendChild(el("p", { class: "discovery-reason" }, step.secondExercise.reason[lang] || step.secondExercise.reason.en));
    }
  }

  if (step.destinations) {
    const list = el("ul", { class: "discovery-matches" });
    for (const dest of step.destinations) {
      const li = el("li");
      const a = el("a", { href: dest.href, class: "discovery-card" });
      a.appendChild(el("strong", {}, dest.label[lang] || dest.label.en));
      li.appendChild(a);
      li.appendChild(el("p", { class: "discovery-reason" }, dest.reason[lang] || dest.reason.en));
      list.appendChild(li);
    }
    section.appendChild(list);
  }

  const pager = el("p", { class: "journey-pager" });
  if (index > 0) {
    const prev = JOURNEY_STEPS[index - 1];
    pager.appendChild(el("a", { href: `#/start/${encodeURIComponent(prev.id)}`, class: "quiet-link" },
      jt(locale, "previous").replace("{title}", stepTitle(prev, locale))));
  }
  if (index < JOURNEY_STEPS.length - 1) {
    const next = JOURNEY_STEPS[index + 1];
    pager.appendChild(el("a", { href: `#/start/${encodeURIComponent(next.id)}`, class: "cta-link" },
      jt(locale, "next").replace("{title}", stepTitle(next, locale))));
  } else {
    pager.appendChild(el("a", { href: "#/start", class: "quiet-link" }, jt(locale, "finish")));
  }
  section.appendChild(pager);
  container.appendChild(section);
  return section;
}
