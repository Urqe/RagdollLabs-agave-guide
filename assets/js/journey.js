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
      es: "Esta guía cubre principalmente destilados de agave: una planta de agave madura — cocida, o de su savia fresca — fermentada y destilada. También incluye el sotol, un pariente cercano destilado de la planta Dasylirion, etiquetado con honestidad como tal. El tequila y el mezcal son los dos que más vas a encontrar; el bacanora, la raicilla y otras tradiciones conservan sus propios nombres, lugares y métodos.",
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
      en: "Reading one profile and its character levels teaches the vocabulary on its own — no glass needed. When you do have a glass, the sequence is short: gently smell, take a small sip, notice the mouthfeel, then follow the finish.",
      es: "Leer un perfil y sus niveles de carácter enseña el vocabulario por sí solo — no hace falta copa. Cuando tengas una, la secuencia es corta: huele con suavidad, toma un sorbo pequeño, nota la sensación en la boca y sigue el final.",
    },
    practice: {
      title: { en: "A first tasting, step by step", es: "Una primera cata, paso a paso" },
      steps: [
        {
          heading: { en: "Prepare", es: "Prepara" },
          text: {
            en: "A small, clean glass is enough — no special stemware. A modest pour, neat — that means without ice or mixers — with water alongside; a few drops of water or an ice cube are a choice, not a requirement, and they soften the alcohol warmth without taking it away.",
            es: "Basta una copa pequeña y limpia — no hace falta cristal especial. Una porción modesta, sola — es decir, sin hielo ni mezcladores — con agua al lado; unas gotas de agua o un cubo de hielo son una elección, no un requisito, y suavizan el calor del alcohol sin eliminarlo.",
          },
        },
        {
          heading: { en: "Smell, gently", es: "Huele, con suavidad" },
          text: {
            en: "Bring the glass to your nose without plunging in, and skip the vigorous wine-style swirl — a short, calm sniff is enough. Aroma is what the nose alone picks up: citrus, herbs, smoke, even a peppery tingle.",
            es: "Acerca la copa a la nariz sin hundirla y olvida el giro enérgico al estilo del vino — una inhalación corta y tranquila basta. El aroma es lo que percibes solo con la nariz: cítricos, hierbas, humo, incluso un cosquilleo de pimienta.",
          },
        },
        {
          heading: { en: "Sip and notice the texture", es: "Sorbe y nota la textura" },
          text: {
            en: "Take a small sip and let it sit a moment. Alcohol warmth in the throat is one thing; peppery or herbal flavors are another. Then ask about the body — light like water, or full and coating? Taste and texture are different questions: a spirit can taste fruity and still feel lean.",
            es: "Toma un sorbo pequeño y déjalo un momento. El calor del alcohol en la garganta es una cosa; los sabores picantes o herbales son otra. Después pregunta por el cuerpo — ¿ligero como el agua, o pleno y envolvente? Sabor y textura son preguntas distintas: un destilado puede saber a fruta y aun así sentirse ligero.",
          },
        },
        {
          heading: { en: "Follow the finish", es: "Sigue el final" },
          text: {
            en: "After you swallow — or spit; nothing here requires swallowing or finishing the glass — notice how long the flavor stays: a few seconds or a slow, fading minute. That lingering character is the finish — both how long it lasts and what it tastes like as it fades.",
            es: "Después de tragar — o escupir; nada aquí exige tragar ni acabar la copa — nota cuánto permanece el sabor: unos segundos o un minuto que se apaga despacio. Ese carácter que se queda es el final — tanto cuánto dura como a qué sabe mientras se apaga.",
          },
        },
      ],
      closing: {
        en: "This sequence is enough for a first tasting, and no part of it is a test. The Choosing and Enjoying chapter goes deeper.",
        es: "Esta secuencia basta para una primera cata, y nada de esto es un examen. El capítulo Elegir y disfrutar va más a fondo.",
      },
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
      en: "Four landmarks cover most of what you will meet. Cooked agave reads savory and vegetal; smoke usually comes from the pit roast, not from peat — and not every agave spirit is smoky. Body is how the spirit feels in the mouth. Oak notes only arrive when the spirit actually rests in wood — though vanilla or caramel alone do not prove that it did. Sweetness here means perceived sweetness, never measured sugar.",
      es: "Cuatro puntos de referencia cubren la mayor parte de lo que encontrarás. El agave cocido se percibe sabroso y vegetal; el humo suele venir del asado en pozo, no de la turba — y no todo destilado de agave es ahumado. El cuerpo es cómo se siente el destilado en la boca. Las notas de roble solo llegan cuando el destilado reposa de verdad en madera — aunque vainilla o caramelo por sí solos no lo prueban. La dulzura aquí significa dulzura percibida, nunca azúcar medido.",
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
      en: "That is the whole foundation: a style, a tasting sequence, four landmarks and one comparison. From here you can browse the styles, follow a flavor, look up a bottle you liked, or keep reading the reference chapters.",
      es: "Ese es todo el fundamento: un estilo, una secuencia de cata, cuatro puntos de referencia y una comparación. Desde aquí puedes explorar los estilos, seguir un sabor, buscar una botella que te gustó, o seguir leyendo los capítulos de referencia.",
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
    hubIntro: "New to agave? In five short steps you will learn a usable tasting sequence, recognize a few flavor landmarks and understand your first comparison — reading along works too; a glass is never required.",
    stepsLabel: "The steps",
    outcomeLabel: "What you will get out of it",
    outcomes: "Describe a basic tasting sequence — smell, sip, mouthfeel, finish — recognize four flavor landmarks and read one prepared comparison that shows what wood resting changes.",
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
    hubIntro: "¿Nuevo en el agave? En cinco pasos cortos aprenderás una secuencia de cata útil, reconocerás algunos rasgos de sabor y entenderás tu primera comparación — leer también funciona; nunca hace falta una copa.",
    stepsLabel: "Los pasos",
    outcomeLabel: "Qué te llevarás",
    outcomes: "Describirás una secuencia de cata básica — olfato, sorbo, textura, final —, reconocerás cuatro rasgos de sabor y leerás una comparación preparada que muestra lo que cambia el reposo en madera.",
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
    // Pair 16: the example links to the exact chapter, not the bare Learn
    // page, keeping the originating lesson in the return context.
    const link = el("a", {
      href: `#/learn/chapter-${encodeURIComponent(chapterId)}?from=${encodeURIComponent("start:" + lessonId)}`,
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

  // Pair 16: the practical tasting sequence stays in the main reading flow —
  // never buried in a collapsed deeper paragraph.
  if (step.practice) {
    const practice = el("div", { class: "lesson-practice", role: "group", "aria-labelledby": "lesson-practice-heading" });
    practice.appendChild(el("h3", { id: "lesson-practice-heading", class: "sources-heading" }, step.practice.title[lang] || step.practice.title.en));
    const list = el("ol", { class: "lesson-practice-list" });
    for (const item of step.practice.steps || []) {
      const li = el("li", { class: "lesson-practice-step" });
      li.appendChild(el("strong", { class: "lesson-practice-heading" }, item.heading[lang] || item.heading.en));
      li.appendChild(el("p", {}, item.text[lang] || item.text.en));
      list.appendChild(li);
    }
    practice.appendChild(list);
    if (step.practice.closing) {
      practice.appendChild(el("p", { class: "editorial-note" }, step.practice.closing[lang] || step.practice.closing.en));
    }
    section.appendChild(practice);
  }

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
