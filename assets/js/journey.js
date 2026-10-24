import { el, clear } from "./dom-utils.js";
import { navigateTo } from "./router.js";
import { ui, renderHome } from "./presentation.js";
import { localizedTitle, fieldEs, fieldEsAny } from "./editorial.js";
import { tasteNote } from "./taste-notes.js";
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
      en: "You can learn this with or without a glass. The guided tasting below takes six short steps. If you're reading along without a bottle, each step shows what the valley blanco's profile says instead, so you practise the same questions on a real style.",
      es: "Esto se aprende con o sin copa. La cata guiada de abajo tiene seis pasos cortos. Si vas leyendo sin botella, cada paso te muestra lo que dice el perfil del blanco del valle, así practicas las mismas preguntas con un estilo real.",
    },
    // Pair 24: a guided practice. Each step has the technique (always shown),
    // a prompt for readers with a glass, and a read-along panel built from
    // the example profile's own data, so nothing sensory is duplicated here.
    practice: {
      title: { en: "A guided first tasting", es: "Una primera cata guiada" },
      exampleProfileId: "tequila-blanco-valley-jalisco",
      steps: [
        {
          id: "prepare",
          heading: { en: "Prepare", es: "Prepara" },
          text: {
            en: "A small, clean glass is enough — no special stemware. A modest pour, neat — that means without ice or mixers — with water alongside; a few drops of water or an ice cube are a choice, not a requirement, and they soften the alcohol warmth without taking it away.",
            es: "Basta una copa pequeña y limpia — no hace falta cristal especial. Una porción modesta, sola — es decir, sin hielo ni mezcladores — con agua al lado; unas gotas de agua o un cubo de hielo son una elección, no un requisito, y suavizan el calor del alcohol sin eliminarlo.",
          },
          glass: {
            en: "Pour a little, set the water beside it and give the glass a minute to settle.",
            es: "Sirve poquito, pon el agua al lado y deja reposar la copa un minuto.",
          },
          readAlong: "prepare",
        },
        {
          id: "aroma",
          heading: { en: "Smell, gently", es: "Huele, con suavidad" },
          text: {
            en: "Bring the glass to your nose without plunging in, and skip the vigorous wine-style swirl — a short, calm sniff is enough. Aroma is what the nose alone picks up: citrus, herbs, smoke, even a peppery tingle.",
            es: "Acerca la copa a la nariz sin hundirla y olvida el giro enérgico al estilo del vino — una inhalación corta y tranquila basta. El aroma es lo que percibes solo con la nariz: cítricos, hierbas, humo, incluso un cosquilleo de pimienta.",
          },
          glass: {
            en: "What reaches your nose first? Say it in your own words: \"lime\", \"cut grass\" or \"something like baked squash\" all count.",
            es: "¿Qué te llega primero a la nariz? Dilo con tus palabras: «limón», «pasto recién cortado» o «algo como calabaza horneada», todo cuenta.",
          },
          readAlong: "aroma",
        },
        {
          id: "sip",
          heading: { en: "Sip", es: "Sorbe" },
          text: {
            en: "Take a small sip and let it sit a moment. This is where flavour arrives, and much of it is aroma travelling up from the back of your mouth to your nose. That's why a sip can show notes the sniff missed.",
            es: "Toma un sorbo pequeño y déjalo un momento. Aquí llega el sabor, y buena parte es aroma que sube desde el fondo de la boca hasta la nariz. Por eso un sorbo puede mostrar notas que no notaste al olerlo.",
          },
          glass: {
            en: "Take a second small sip. Does the flavour match the smell, or does something new turn up?",
            es: "Toma un segundo sorbo pequeño. ¿El sabor coincide con el aroma, o aparece algo nuevo?",
          },
          readAlong: "sip",
        },
        {
          id: "texture",
          heading: { en: "Texture and warmth", es: "Textura y calor" },
          text: {
            en: "Now ask about the body — light like water, or full and coating? Alcohol warmth in the throat is one thing; peppery or herbal flavours are another. Taste and texture are different questions: a spirit can taste fruity and still feel lean.",
            es: "Ahora pregunta por el cuerpo — ¿ligero como el agua, o pleno y envolvente? El calor del alcohol en la garganta es una cosa; los sabores picantes o herbales son otra. Sabor y textura son preguntas distintas: un destilado puede saber a fruta y aun así sentirse ligero.",
          },
          glass: {
            en: "Does it feel thin or coating? And where is the heat: a tingle on the tongue, or warmth lower in the throat?",
            es: "¿Se siente ligero o envolvente? ¿Y dónde está el calor: un cosquilleo en la lengua, o calor más abajo, en la garganta?",
          },
          readAlong: "texture",
        },
        {
          id: "finish",
          heading: { en: "Follow the finish", es: "Sigue el final" },
          text: {
            en: "After you swallow — or spit; nothing here requires swallowing or finishing the glass — notice how long the flavour stays: a few seconds or a slow, fading minute. That lingering character is the finish — both how long it lasts and what it tastes like as it fades.",
            es: "Después de tragar — o escupir; nada aquí exige tragar ni acabar la copa — nota cuánto permanece el sabor: unos segundos o un minuto que se apaga despacio. Ese carácter que se queda es el final — tanto cuánto dura como a qué sabe mientras se apaga.",
          },
          glass: {
            en: "Count slowly. Is the flavour gone by five, or still there at twenty? And what is the last thing you taste?",
            es: "Cuenta despacio. ¿El sabor se va antes de cinco, o sigue ahí a los veinte? ¿Y qué es lo último que sientes?",
          },
          readAlong: "finish",
        },
        {
          id: "reflect",
          heading: { en: "Reflect", es: "Reflexiona" },
          text: {
            en: "Nobody finds every listed note on a first try, and the notes on a profile are not a checklist. What counts is what you noticed, in your own words.",
            es: "Nadie encuentra todas las notas de la lista a la primera, y las notas de un perfil no son una lista para palomear. Lo que cuenta es lo que tú notaste, con tus palabras.",
          },
          reflect: true,
        },
      ],
      closing: {
        en: "That's a complete tasting, and no part of it is a test. The Choosing and Enjoying chapter goes deeper.",
        es: "Esa es una cata completa, y nada de esto es un examen. El capítulo Elegir y disfrutar va más a fondo.",
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
      en: "Four landmarks cover most of what you will meet. Cooked agave tastes savoury and vegetal, a little like roasted sweet potato; smoke usually comes from the pit roast, not from peat — and not every agave spirit is smoky. Body is how the spirit feels in the mouth. Oak notes only arrive when the spirit actually rests in wood — though vanilla or caramel alone do not prove that it did. Sweetness here means perceived sweetness, never measured sugar.",
      es: "Cuatro puntos de referencia cubren la mayor parte de lo que encontrarás. El agave cocido sabe vegetal y más salado que dulce, un poco como camote asado; el humo suele venir del asado en pozo, no de la turba — y no todo destilado de agave es ahumado. El cuerpo es cómo se siente el destilado en la boca. Las notas de roble solo llegan cuando el destilado reposa de verdad en madera — aunque vainilla o caramelo por sí solos no lo prueban. La dulzura aquí significa dulzura percibida, nunca azúcar medido.",
    },
    // Pair 24: the five pairs beginners most often confuse.
    distinctions: {
      title: { en: "Easy to mix up", es: "Fácil de confundir" },
      items: [
        {
          term: { en: "Sweet taste vs sugar", es: "Sabor dulce contra azúcar" },
          text: {
            en: "A spirit can taste sweet even though distilling leaves almost no sugar behind. Cooked agave, fruit and vanilla all come across as sweet. \"Perceived sweetness\" in this guide is that impression, not a measurement.",
            es: "Un destilado puede saber dulce aunque la destilación casi no deja azúcar. El agave cocido, la fruta y la vainilla se sienten dulces. La «dulzura percibida» de esta guía es esa impresión, no una medición.",
          },
        },
        {
          term: { en: "Alcohol warmth vs pepper", es: "Calor del alcohol contra pimienta" },
          text: {
            en: "Alcohol warmth is heat you feel, mostly in the throat and chest, and it grows with strength. Pepper is a flavour on the tongue, often with a tingle. A gentle-strength spirit can still be very peppery.",
            es: "El calor del alcohol es una sensación, sobre todo en la garganta y el pecho, y crece con la graduación. La pimienta es un sabor en la lengua, a menudo con cosquilleo. Un destilado de graduación suave puede ser muy especiado.",
          },
        },
        {
          term: { en: "Smoke vs roast", es: "Humo contra asado" },
          text: {
            en: "Smoke smells like a campfire or grilled food. Cooked agave can smell roasted and caramelised with no smoke at all. A pit roast can add smoke; steam-cooked tequila usually has none.",
            es: "El humo huele a fogata o a carne asada. El agave cocido puede oler a asado y caramelizado sin nada de humo. El asado en pozo puede aportar humo; el tequila cocido al vapor normalmente no tiene.",
          },
        },
        {
          term: { en: "Body vs intensity", es: "Cuerpo contra intensidad" },
          text: {
            en: "Body is weight and texture: thin like water or round like milk. Intensity is how loud the flavours are. A light-bodied blanco can still be intensely peppery.",
            es: "El cuerpo es peso y textura: ligero como el agua o redondo como la leche. La intensidad es qué tan fuertes son los sabores. Un blanco de cuerpo ligero puede ser muy especiado.",
          },
        },
        {
          term: { en: "Smell vs flavour in the mouth", es: "Olor contra sabor en la boca" },
          text: {
            en: "Aroma is what you catch through your nose before sipping. Much of what we call taste is aroma reaching the nose from the back of the mouth as you sip and swallow. That's why a note can show up on the palate that you missed on the nose.",
            es: "El aroma es lo que hueles antes de dar el sorbo. Buena parte de lo que llamamos sabor es aroma que llega a la nariz desde el fondo de la boca al beber y tragar. Por eso una nota puede aparecer en la boca aunque no la hayas notado al oler.",
          },
        },
      ],
    },
    // Pair 24: a small lexicon with everyday anchors. Anchors are ways to
    // describe an impression, not claims about what is in the glass.
    lexicon: {
      title: { en: "Words for what you taste", es: "Palabras para lo que pruebas" },
      intro: {
        en: "These are the words the profiles use, each with a few everyday things it can remind you of. Use whichever comparison fits what you notice.",
        es: "Estas son las palabras que usan los perfiles, cada una con cosas cotidianas que te pueden recordar. Usa la comparación que mejor le quede a lo que notas.",
      },
      items: [
        { term: { en: "Cooked agave", es: "Agave cocido" }, anchors: { en: "roasted sweet potato, baked squash, a touch of caramel", es: "camote asado, calabaza en tacha, un toque de caramelo" } },
        { term: { en: "Vegetal", es: "Vegetal" }, anchors: { en: "green pepper, cucumber skin, olive brine", es: "pimiento morrón verde, cáscara de pepino, salmuera de aceituna" } },
        { term: { en: "Herbal", es: "Herbal" }, anchors: { en: "fresh-cut grass, mint, dried herbs", es: "pasto recién cortado, hierbabuena, hierbas secas" } },
        { term: { en: "Earthy", es: "Terroso" }, anchors: { en: "wet soil after rain, mushrooms", es: "tierra mojada después de la lluvia, hongos" } },
        {
          term: { en: "Mineral", es: "Mineral" },
          anchors: { en: "wet stone, chalk, a salty edge", es: "piedra mojada, gis, un borde salino" },
          note: {
            en: "A description of an impression, not proof that minerals from the soil are in the glass.",
            es: "Describe una impresión; no prueba que haya minerales del suelo en la copa.",
          },
        },
        { term: { en: "Floral", es: "Floral" }, anchors: { en: "orange blossom, honeysuckle", es: "azahar, madreselva" } },
        { term: { en: "Fruit", es: "Fruta" }, anchors: { en: "green apple, citrus peel, banana, tropical fruit", es: "manzana verde, cáscara de limón, plátano, fruta tropical" } },
        { term: { en: "Pepper", es: "Pimienta" }, anchors: { en: "cracked black pepper, the tingle of fresh chilli", es: "pimienta negra molida, el cosquilleo del chile fresco" } },
        {
          term: { en: "Oak", es: "Roble" },
          anchors: { en: "vanilla, toasted wood, caramel, baking spice", es: "vainilla, madera tostada, cajeta, especias de repostería" },
          note: {
            en: "Only when the spirit really rested in wood: vanilla on its own doesn't prove it.",
            es: "Solo si el destilado de verdad reposó en madera: la vainilla sola no lo prueba.",
          },
        },
        { term: { en: "Smoke", es: "Humo" }, anchors: { en: "campfire, grilled food, ash", es: "fogata, carne asada, ceniza" } },
      ],
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
    outcomes: "Tell aroma, flavour, body, alcohol warmth and finish apart, try a guided tasting with or without a glass, recognise four flavour landmarks and read one prepared comparison that shows what wood resting changes.",
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
    modeLabel: "How are you following along?",
    modeRead: "Reading along, no glass",
    modeGlass: "I have a glass",
    yourTurn: "Your turn",
    fromExample: "From the example profile",
    raPrepare: "We'll read along with {title}. Everything in these boxes comes from its profile.",
    raOpenProfile: "Open the {title} profile",
    raAroma: "Its profile lists {notes}. Reading that list, which would you expect to reach the nose first? Bright notes like citrus and herbs often do.",
    raTexture: "Its profile rates the body {body} and the pepper {pepper}, so {feel} The peppery tingle is flavour; warmth lower in the throat is the alcohol.",
    raFinish: "Its profile describes the finish as \u201c{finish}\u201d and rates its length {length}.",
    bodyWord: { light: "light", medium: "medium", full: "full" },
    bodyFeel: { light: "expect it to feel lean, closer to water than to syrup.", medium: "expect some weight, without being syrupy.", full: "expect it to feel round and coating." },
    pepperWord: { none: "none", low: "low", medium: "medium", high: "high" },
    lengthWord: { low: "short", medium: "medium", high: "long" },
    reflectLegendRead: "Reading the notes, which would you look for first?",
    reflectLegendGlass: "What stood out most?",
    reflectChoices: {
      fresh: "Fresh: herbs, grass or green notes",
      fruit: "Fruit or flowers",
      pepper: "Pepper or spice",
      smoke: "Smoke or roast",
      unsure: "Hard to say yet",
    },
    reflectFlavour: "A good next step is the \u201c{path}\u201d flavour path: styles where that comes through more.",
    reflectFlavourLink: "Open the {path} path",
    reflectUnsure: "That's normal, and the most common answer on a first try. Differences are much easier to spot side by side, and step 4 does exactly that.",
    reflectUnsureLink: "Go to the comparison step",
    reflectNoStore: "Your answer stays on this page. Nothing is saved or sent.",
  },
  es: {
    hubTitle: "Tu primer destilado de agave",
    hubIntro: "¿Nuevo en el agave? En cinco pasos cortos aprenderás una secuencia de cata útil, reconocerás algunos rasgos de sabor y entenderás tu primera comparación — leer también funciona; nunca hace falta una copa.",
    stepsLabel: "Los pasos",
    outcomeLabel: "Qué te llevarás",
    outcomes: "Distinguirás aroma, sabor, cuerpo, calor del alcohol y final, harás una cata guiada con o sin copa, reconocerás cuatro rasgos de sabor y leerás una comparación preparada que muestra lo que cambia el reposo en madera.",
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
    modeLabel: "¿Cómo lo vas a seguir?",
    modeRead: "Leyendo, sin copa",
    modeGlass: "Tengo una copa",
    yourTurn: "Tu turno",
    fromExample: "Del perfil de ejemplo",
    raPrepare: "Vamos a leer junto con «{title}». Todo lo que aparece en estos recuadros viene de su perfil.",
    raOpenProfile: "Abre el perfil «{title}»",
    raAroma: "Su perfil anota {notes}. Leyendo esa lista, ¿cuál crees que llega primero a la nariz? Las notas vivas, como los cítricos y las hierbas, suelen llegar antes.",
    raTexture: "Su perfil califica el cuerpo como {body} y la pimienta como {pepper}, así que {feel} El cosquilleo picante es sabor; el calor más abajo, en la garganta, es el alcohol.",
    raFinish: "Su perfil describe el final así: «{finish}», y califica su duración como {length}.",
    bodyWord: { light: "ligero", medium: "medio", full: "pleno" },
    bodyFeel: { light: "espera que se sienta ligero, más cerca del agua que del jarabe.", medium: "espera algo de peso, sin llegar a ser espeso.", full: "espera que se sienta redondo y envolvente." },
    pepperWord: { none: "nula", low: "baja", medium: "media", high: "alta" },
    lengthWord: { low: "corta", medium: "media", high: "larga" },
    reflectLegendRead: "Leyendo las notas, ¿cuál buscarías primero?",
    reflectLegendGlass: "¿Qué destacó más?",
    reflectChoices: {
      fresh: "Fresco: hierbas, pasto o notas verdes",
      fruit: "Fruta o flores",
      pepper: "Pimienta o especias",
      smoke: "Humo o asado",
      unsure: "Todavía no sé",
    },
    reflectFlavour: "Un buen siguiente paso es la ruta de sabor «{path}»: estilos donde eso se nota más.",
    reflectFlavourLink: "Abre la ruta {path}",
    reflectUnsure: "Es normal, y es la respuesta más común en una primera cata. Las diferencias se notan mucho más lado a lado, y eso es justo lo que hace el paso 4.",
    reflectUnsureLink: "Ir al paso de comparación",
    reflectNoStore: "Tu respuesta se queda en esta página. No se guarda ni se envía nada.",
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

// ------------------------------------------------------------------ Pair 24

/** Reading mode for the guided tasting: in memory only, never stored. */
let practiceMode = "read";

const FLAVOUR_FOR_CHOICE = { fresh: "fresh-herbal", fruit: "fruity-floral", pepper: "peppery-spicy", smoke: "smoky-earthly" };
const FLAVOUR_LABEL_KEY = {
  "fresh-herbal": "flavourFreshHerbal",
  "fruity-floral": "flavourFruityFloral",
  "peppery-spicy": "flavourPepperySpicy",
  "smoky-earthly": "flavourSmokyEarthy",
};

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}

/**
 * The read-along panel for one step, built from the example profile's own
 * data (taste notes, what to notice, body, pepper and finish). Returns null
 * when the profile lacks the field, so no panel ever shows guessed data.
 */
function readAlongContent(kind, profile, locale) {
  const title = localizedTitle("profile", profile.id, profile.title, locale);
  const box = el("div");
  if (kind === "prepare") {
    box.appendChild(el("p", {}, fill(jt(locale, "raPrepare"), { title })));
    box.appendChild(el("a", {
      href: `#/profile/${encodeURIComponent(profile.id)}?origin=${encodeURIComponent("start:how-to-taste")}`,
      class: "quiet-link",
    }, fill(jt(locale, "raOpenProfile"), { title })));
    return box;
  }
  if (kind === "aroma") {
    const notes = (profile.tasteNotes || []).map((n) => tasteNote(n, locale));
    if (notes.length === 0) return null;
    box.appendChild(el("p", {}, fill(jt(locale, "raAroma"), { notes: notes.join(", ") })));
    return box;
  }
  if (kind === "sip") {
    const pairing = fieldEsAny("profile", profile.id, "pairing", locale) || profile.pairing || {};
    if (!pairing.notice) return null;
    box.appendChild(el("p", {}, pairing.notice));
    return box;
  }
  if (kind === "texture") {
    const body = jt(locale, "bodyWord")[profile.body];
    const feel = jt(locale, "bodyFeel")[profile.body];
    const pepper = jt(locale, "pepperWord")[profile.sensory && profile.sensory.pepper];
    if (!body || !feel || !pepper) return null;
    box.appendChild(el("p", {}, fill(jt(locale, "raTexture"), { body, pepper, feel })));
    return box;
  }
  if (kind === "finish") {
    const finish = fieldEs("profile", profile.id, "finish", locale) || profile.finish;
    const length = jt(locale, "lengthWord")[profile.sensory && profile.sensory.finishLength];
    if (!finish || !length) return null;
    box.appendChild(el("p", {}, fill(jt(locale, "raFinish"), { finish: finish.replace(/\.$/, ""), length })));
    return box;
  }
  return null;
}

/** Reflection prompt: optional choices, no score, nothing stored. */
function reflectionBlock(locale) {
  const fieldset = el("fieldset", { class: "tasting-reflect" });
  fieldset.appendChild(el("legend", {}, jt(locale, practiceMode === "glass" ? "reflectLegendGlass" : "reflectLegendRead")));
  const live = el("div", { class: "tasting-reflect-answer", "aria-live": "polite" });
  const choices = jt(locale, "reflectChoices");
  for (const key of Object.keys(choices)) {
    const id = `tasting-reflect-${key}`;
    const row = el("div", { class: "tasting-reflect-choice" });
    const input = el("input", { type: "radio", name: "tasting-reflect", id, value: key });
    input.addEventListener("change", () => {
      clear(live);
      const path = FLAVOUR_FOR_CHOICE[key];
      if (path) {
        const label = ui(locale, FLAVOUR_LABEL_KEY[path]);
        live.appendChild(el("p", {}, fill(jt(locale, "reflectFlavour"), { path: label })));
        live.appendChild(el("a", { href: `#/discover/flavour/${path}`, class: "cta-link" }, fill(jt(locale, "reflectFlavourLink"), { path: label })));
      } else {
        live.appendChild(el("p", {}, jt(locale, "reflectUnsure")));
        live.appendChild(el("a", { href: "#/start/first-comparison", class: "cta-link" }, jt(locale, "reflectUnsureLink")));
      }
    });
    row.appendChild(input);
    row.appendChild(el("label", { for: id }, choices[key]));
    fieldset.appendChild(row);
  }
  fieldset.appendChild(live);
  fieldset.appendChild(el("p", { class: "editorial-note" }, jt(locale, "reflectNoStore")));
  return fieldset;
}

/**
 * Pair 24 guided tasting: prepare → aroma → sip → texture and warmth →
 * finish → reflect. The technique text always shows; a mode switch picks
 * between a "your turn" prompt (with a glass) and a read-along panel from
 * the example profile (no glass), so a non-drinker completes every step.
 */
function guidedPractice(step, { profiles, locale }) {
  const lang = locale ? locale.get() : "en";
  const practice = step.practice;
  const profile = (profiles || []).find((p) => p.id === practice.exampleProfileId) || null;
  const wrapper = el("div", { class: "lesson-practice", role: "group", "aria-labelledby": "lesson-practice-heading" });
  wrapper.appendChild(el("h3", { id: "lesson-practice-heading", class: "sources-heading" }, practice.title[lang] || practice.title.en));

  const modes = el("div", { class: "tasting-mode", role: "group", "aria-label": jt(locale, "modeLabel") });
  modes.appendChild(el("p", { class: "tasting-mode-label", "aria-hidden": "true" }, jt(locale, "modeLabel")));
  for (const [mode, key] of [["read", "modeRead"], ["glass", "modeGlass"]]) {
    const button = el("button", {
      type: "button",
      class: "compare-pick-button tasting-mode-button",
      "aria-pressed": practiceMode === mode ? "true" : "false",
      "data-mode": mode,
    }, jt(locale, key));
    button.addEventListener("click", () => {
      if (practiceMode === mode) return;
      practiceMode = mode;
      const fresh = guidedPractice(step, { profiles, locale });
      wrapper.replaceWith(fresh);
      const again = fresh.querySelector(`[data-mode="${mode}"]`);
      if (again) again.focus();
    });
    modes.appendChild(button);
  }
  wrapper.appendChild(modes);

  const list = el("ol", { class: "lesson-practice-list" });
  for (const item of practice.steps || []) {
    const li = el("li", { class: "lesson-practice-step", "data-step": item.id || "" });
    li.appendChild(el("strong", { class: "lesson-practice-heading" }, item.heading[lang] || item.heading.en));
    li.appendChild(el("p", {}, item.text[lang] || item.text.en));
    if (item.reflect) {
      li.appendChild(reflectionBlock(locale));
    } else if (practiceMode === "glass" && item.glass) {
      const box = el("div", { class: "tasting-box is-glass" });
      box.appendChild(el("span", { class: "eyebrow" }, jt(locale, "yourTurn")));
      box.appendChild(el("p", {}, item.glass[lang] || item.glass.en));
      li.appendChild(box);
    } else if (practiceMode === "read" && item.readAlong && profile) {
      const content = readAlongContent(item.readAlong, profile, locale);
      if (content) {
        const box = el("div", { class: "tasting-box is-read" });
        box.appendChild(el("span", { class: "eyebrow" }, jt(locale, "fromExample")));
        box.appendChild(content);
        li.appendChild(box);
      }
    }
    list.appendChild(li);
  }
  wrapper.appendChild(list);
  if (practice.closing) {
    wrapper.appendChild(el("p", { class: "editorial-note" }, practice.closing[lang] || practice.closing.en));
  }
  return wrapper;
}

/** "Easy to mix up": the distinctions beginners most often blur. */
function distinctionsBlock(distinctions, lang) {
  const block = el("section", { class: "lesson-distinctions", "aria-labelledby": "lesson-distinctions-heading" });
  block.appendChild(el("h3", { id: "lesson-distinctions-heading", class: "sources-heading" }, distinctions.title[lang] || distinctions.title.en));
  const dl = el("dl", { class: "lesson-term-list" });
  for (const item of distinctions.items) {
    dl.appendChild(el("dt", {}, item.term[lang] || item.term.en));
    dl.appendChild(el("dd", {}, item.text[lang] || item.text.en));
  }
  block.appendChild(dl);
  return block;
}

/** Small sensory lexicon with everyday anchors. */
function lexiconBlock(lexicon, lang) {
  const block = el("section", { class: "lesson-lexicon", "aria-labelledby": "lesson-lexicon-heading" });
  block.appendChild(el("h3", { id: "lesson-lexicon-heading", class: "sources-heading" }, lexicon.title[lang] || lexicon.title.en));
  if (lexicon.intro) block.appendChild(el("p", {}, lexicon.intro[lang] || lexicon.intro.en));
  const dl = el("dl", { class: "lesson-term-list" });
  for (const item of lexicon.items) {
    dl.appendChild(el("dt", {}, item.term[lang] || item.term.en));
    const dd = el("dd", {}, item.anchors[lang] || item.anchors.en);
    if (item.note) dd.appendChild(el("span", { class: "editorial-note lexicon-note" }, " " + (item.note[lang] || item.note.en)));
    dl.appendChild(dd);
  }
  block.appendChild(dl);
  return block;
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
  // never buried in a collapsed deeper paragraph. Pair 24 makes it guided.
  if (step.practice) section.appendChild(guidedPractice(step, { profiles, locale }));
  if (step.distinctions) section.appendChild(distinctionsBlock(step.distinctions, lang));
  if (step.lexicon) section.appendChild(lexiconBlock(step.lexicon, lang));

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
