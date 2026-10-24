import { el, clear } from "./dom-utils.js";
import { tasteNote } from "./taste-notes.js";
import { localizedTitle } from "./editorial.js";
import { SPIRIT_LABELS } from "./spirit-labels.js";
import { DIMENSIONS, levelOf } from "./compare.js";

const COPY = {
  en: {
    brand: "reference tools", title: "Agave Guide", tagline: "Find the character behind the pour.",
    intro: "Explore Mexico’s spirits through their plants, places and craft. Start with a familiar name, or follow your curiosity somewhere new.",
    explore: "Browse styles", exploreHint: "Search and filter every style profile.",
    compare: "Compare styles", compareHint: "Find what makes each expression different.",
    learn: "Keep learning", learnHint: "Chapters, plants, processes and label vocabulary.",
    start: "New to agave?", startHint: "A five-step first journey — no glass, no purchase, no quiz.",
    catalogue: "Browse bottles", catalogueHint: "Find a brand, producer or expression.",
    pathsLabel: "Three ways in",
    pathStart: "Start here", pathStartHint: "New to agave? Five short lessons and a guided tasting, with or without a glass.",
    pathExplore: "Explore", pathExploreHint: "Browse the styles by spirit, flavour, plant or place, and put two or three side by side.",
    pathLookUp: "Look it up", pathLookUpHint: "Find a bottle, a label term or how a spirit is made.",
    linkGlossary: "Label vocabulary", linkPlantToGlass: "From plant to glass",
    featured: "A few places to begin", featuredHint: "Three traditions. Three ways into the glass.",
    scene: "A little curiosity. Good company.", all: "Explore the collection",
    guide: "An invitation to explore", browse: "Find your next discovery",
    browseIntro: "Browse a tradition, follow a flavour, or explore a place. Every profile is a starting point.",
    tradition: "Spirit / tradition", allTraditions: "All traditions", flavour: "Flavour mood",
    allFlavours: "All flavours", map: "Browse by place — map & state list", mapHint: "Map shading shows guide coverage, not legal production boundaries.",
    results: "Style profiles", reset: "Clear all",
    profile: "profile", profiles: "profiles",
    compareSelected: "In your comparison \u2197", compareFull: "Comparison full \u2014 open your selection \u2197", removed: "Removed from your comparison.",
    noneSelected: "No profiles selected.", oneSelected: "1 profile selected",
    comparing: "Comparing", removedFrom: "Removed {name}.", addedTo: "Added {name}.", noMatches: "No profiles match these filters. Try another combination.",
    sensory: "Character in the glass",
    body: "Body", notes: "Typical notes", smoke: "Smoke", finish: "Finish",
    light: "Light body", medium: "Medium body", full: "Full body",
    bodyLevelLight: "Light", bodyLevelMedium: "Medium", bodyLevelFull: "Full",
    sources: "Sources & references",
    legal: "Legal category", plant: "Plant", process: "Production",
    compareThis: "Compare this style", choices: "Your comparison",
    remove: "Remove", slots: "Choose up to three styles. Remove a selection to make room.",
    scroll: "Scroll sideways to compare all styles.", dimension: "Attribute",
    none: "None", low: "Low", high: "High", mediumLevel: "Medium", unknown: "Not documented",
    herbal: "Herbal / vegetal", fruit: "Fruit / floral", sweetness: "Perceived sweetness", pepper: "Pepper / spice", oak: "Oak",
    home: "Return to Agave Guide home", search: "Search the guide",
    disclosure: "Editorial content and some reference labels are currently in English.",
    partialDisclosure: "This section is available in English.",
    notDocumented: "not documented", labelFact: "label fact",
    factSpirit: "Spirit", factAbv: "ABV", factAbvLong: "Alcohol by volume", factProducer: "Producer", factPlace: "Place",
    factBatch: "Batch/version", factComposition: "Composition",
    factClassification: "Classification", factPlantComposition: "Plant composition",
    fitsPrefix: "How it fits the \u201c{title}\u201d profile (editorial): ", fitsPrefixPlain: "How it fits the reference profile (editorial): ",
    relatesPrefix: "How it relates to the guide's coverage (editorial): ",
    catalogueEmpty: "No bottles match \u201c{query}\u201d. Try a brand (Fortaleza), an expression (Blanco Tequila) or a place (Sonora).",
    jumpTo: "Jump to {name} in the catalogue",
    kindSource: "{kind} source", verifiedAs: "verified {date}",
    kindProducer: "producer", kindReview: "review", kindStyle: "style", kindOfficial: "official",
    contextPrefix: "Context: ",
    classTerms: "Class terms are spirit-specific: tequila's rules do not transfer to mezcal or raicilla. Where a term is not a legal class, that is stated.",
    missingData: "Not compared because the data is not documented: {list}. Unknown means not documented, never zero.",
    loading: "Loading\u2026", errorTitle: "Something went wrong", reload: "Reload the page",
    skipToContent: "Skip to content", mainNav: "Main", preferences: "Preferences",
    switchTheme: "Switch theme", toLight: "Switch to light theme", toDark: "Switch to dark theme",
    switchToEs: "Cambiar a Espa\u00f1ol (M\u00e9xico)", switchToEn: "Switch to English",
    currentEdition: "Current edition: English (United Kingdom flag icon)", currentEditionEs: "Current edition: Español (México)",
    learnSections: "Learn sections", statesWithProfiles: "States with profiles",
    docTitle: "RagDollLabs \u00b7 Agave Guide", docDescription: "A small guide to the body and taste of Mexican agave spirits \u2014 tequila, mezcal, bacanora and raicilla style profiles with example bottles.",
    noScript: "This app needs JavaScript to load its local data files. Esta aplicaci\u00f3n necesita JavaScript para cargar sus datos locales.",
    brandProduct: "Agave Guide",
    mapFailed: "The map could not be loaded. You can still use the state list below.",
    notFoundTitle: "Profile not found", notFoundBody: "No profile exists with the id \u201c{id}\u201d.", backToExplore: "\u2190 Back to explore",
    coordsNote: "Location: {lat}, {lon} ({precision}).",
    discoverHeading: "Understand what is in the glass",
    discoverIntro: "Start from a spirit you know, or follow a flavour \u2014 plants, regions and traditions are here too. Every path leads to the same style profiles.",
    discoverBySpirit: "Spirit traditions", discoverBySpiritIntro: "The traditions in this guide, with their origin and legal status.",
    discoverByFlavour: "Follow a flavour", discoverByFlavourIntro: "Approachable flavour paths from existing sensory data \u2014 a starting point, never a promise about every bottle.",
    discoverByPlant: "Plants", discoverByPlantIntro: "Agave species (and sotol's Dasylirion), common names first.",
    discoverByRegion: "Places", discoverByRegionIntro: "Subregions and municipalities where the guide's traditions are practiced. Coverage here means app coverage \u2014 not legal production boundaries.",
    discoverMore: "Full lists stay searchable in Browse styles.",
    discoverBack: "\u2190 Back to plants & places", alsoKnownAs: "Also known as", cultivationLabel: "Harvest & cultivation",
    traditionsUsing: "Traditions using this plant", whereItGrows: "Regions where it grows",
    expressionsFromPlant: "Expressions from this plant", expressionsFromTradition: "Style profiles in this tradition",
    expressionsHere: "Style profiles here", expressionsNote: "Editorial profiles, not a promise that every bottle tastes the same.",
    traditionsHere: "Traditions practiced here", plantsHere: "Plants used here",
    otherPlantsSameTradition: "Other plants in the same traditions",
    bottlesFromTradition: "Example bottles in this tradition", seeCatalogue: "See all bottles in the catalogue",
    seeState: "See this state's profiles on the map",
    tHistory: "History", tLegal: "Legal status", tMaterials: "Materials", tPractices: "Practices", tDiversity: "Diversity",
    discoverNoneYet: "Nothing here yet \u2014 this is guide coverage, not a claim that nothing exists.",
    discoverNotFoundTitle: "Not found",
    discoverNotFoundKind: "No {kind} exists with the id “{id}”. Use a discovery path below — or browse the styles.",
    discoverKindPlant: "plant", discoverKindRegion: "region", discoverKindSpirit: "spirit tradition", discoverKindFlavour: "flavour category", discoverKindUnknown: "entry",
    flavourUnknown: "That flavour category does not exist.",
    flavourFreshHerbal: "Fresh and herbal", flavourFruityFloral: "Fruity and floral", flavourSmokyEarthy: "Smoky and earthy",
    flavourPepperySpicy: "Peppery and spicy", flavourRichOak: "Rich and oak-influenced", flavourAdventurous: "Unusual and adventurous",
    flavourIntroFreshHerbal: "High herbal character with little or no smoke.",
    flavourIntroFruityFloral: "Fruit and floral notes over a gentle roast.",
    flavourIntroSmokyEarthy: "Medium or high smoke from pit roasting.",
    flavourIntroPepperySpicy: "A peppery, savoury edge.",
    flavourIntroRichOak: "Wood maturation does the heavy lifting.",
    flavourIntroAdventurous: "Regional traditions beyond tequila and mezcal.",
    reasonHerbal: "Editorial herbal level: {value}.", reasonFruit: "Editorial fruit/floral level: {value}.",
    reasonSmoke: "Editorial smoke level: {value}.", reasonPepper: "Editorial pepper level: {value}.",
    reasonOak: "Editorial oak level: {value}.", reasonAdventurous: "A regional tradition: {tradition}.",
    reasonSuffix: "Editorial impression \u2014 bottles and batches vary.",
    flavourDisclaimer: "These are editorial style groupings from profile data. They describe typical style tendencies, never every bottle of a tradition.",
    sharesWhy: "A similar read in the glass: both show {list}; same spirit and plant, so place and producer make the difference.", sharesWhyOtherSpirit: "A similar read in the glass: both show {list}; this one gets there as {spirit}, by a different road.", sharesWhyOtherPlant: "A similar read in the glass: both show {list}; the difference is the plant.", sharesWhyOtherRest: "A similar read in the glass: both show {list}; the difference is the time in wood.", seeStyleProfile: "See the {spirit} style profile \u2192", reasonSpirit: "Matches the spirit \u201c{spirit}\u201d.", bottleEyebrow: "Bottle in the catalogue",
    reasonBrand: "Example bottle brand matches: {brand}.", reasonProducer: "Producer matches: {producer}.",
    reasonNote: "Taste note matches: \u201c{note}\u201d.", reasonPlant: "Agave plant matches: {plant}.",
    reasonPlace: "Place matches: {place}.", reasonGeneral: "Matches \u201c{query}\u201d in this profile.",
    hintSmoke: "Editorial smoke impression \u2014 not measured peat or smoke content.",
    hintHerbal: "Fresh or cooked vegetal and herb character.",
    hintFruit: "Orchard, citrus and floral notes.",
    hintSweetness: "Perceived sweetness on the palate \u2014 not measured sugar.",
    hintPepper: "Black pepper and spice bite.",
    hintBody: "Editorial body level, from the profile's body field.",
    hintOak: "Wood influence; most unaged agave spirits are none.",
    hintFinish: "How long the finish lasts.",
    guidance: "Editorial style guidance — a description of the style, not a review or rating of any bottle.",
    footer: "Explore with curiosity. Enjoy responsibly.",
    "abvUnknown": "ABV not documented",
    "noReviewYet": "No attributed tasting note for this expression yet.",
    basisOneReview: "Character notes from one independent review",
    basisReviews: "Character notes from {count} independent reviews",
    basisOneProducer: "Character notes from the producer's own description",
    basisProducers: "Character notes from {count} producer descriptions",
    basisOneStyle: "Character notes from one published account of this expression",
    basisStyles: "Character notes from {count} published accounts of this expression",
    basisFactsOnly: "Factual listing — no tasting notes documented for this expression yet.",
    "learn.heading": "Learn",
  },
  es: {
    brand: "herramientas de consulta", title: "Guía del Agave", tagline: "Descubre el carácter de cada copa.",
    intro: "Explora los destilados de México a través de sus plantas, lugares y métodos. Empieza por un nombre conocido o sigue tu curiosidad.",
    explore: "Explorar estilos", exploreHint: "Busca y filtra todos los perfiles de estilo.",
    compare: "Comparar estilos", compareHint: "Descubre qué distingue a cada expresión.",
    learn: "Sigue aprendiendo", learnHint: "Capítulos, plantas, procesos y vocabulario de etiqueta.",
    start: "¿Nuevo en el agave?", startHint: "Un primer recorrido de cinco pasos — sin copa, sin compra, sin examen.",
    catalogue: "Explorar botellas", catalogueHint: "Busca una marca, productor o expresión.",
    pathsLabel: "Tres maneras de entrar",
    pathStart: "Empieza aquí", pathStartHint: "¿Nuevo en el agave? Cinco lecciones cortas y una cata guiada, con o sin copa.",
    pathExplore: "Explora", pathExploreHint: "Recorre los estilos por destilado, sabor, planta o lugar, y pon dos o tres lado a lado.",
    pathLookUp: "Consulta", pathLookUpHint: "Encuentra una botella, un término de etiqueta o cómo se hace un destilado.",
    linkGlossary: "Vocabulario de etiqueta", linkPlantToGlass: "De la planta a la copa",
    featured: "Por dónde empezar", featuredHint: "Tres tradiciones. Tres formas de descubrir.",
    scene: "Un poco de curiosidad. Buena compañía.", all: "Explorar la colección",
    guide: "Una invitación a explorar", browse: "Encuentra tu próximo descubrimiento",
    browseIntro: "Explora una tradición, sigue un sabor o descubre un lugar. Cada perfil es un punto de partida.",
    tradition: "Destilado / tradición", allTraditions: "Todas las tradiciones", flavour: "Perfil de sabor",
    allFlavours: "Todos los sabores", map: "Explorar por lugar — mapa y lista de estados", mapHint: "El sombreado indica la cobertura de la guía, no los límites legales de producción.",
    results: "Perfiles de estilo", reset: "Borrar todo",
    profile: "perfil", profiles: "perfiles",
    compareSelected: "En tu comparaci\u00f3n \u2197", compareFull: "Comparaci\u00f3n completa \u2014 abre tu selecci\u00f3n \u2197", removed: "Quitado de tu comparaci\u00f3n.",
    noneSelected: "Ning\u00fan perfil seleccionado.", oneSelected: "1 perfil seleccionado",
    comparing: "Comparando", removedFrom: "Quitado {name}.", addedTo: "A\u00f1adido {name}.", noMatches: "Ningún perfil coincide. Prueba otra combinación.",
    sensory: "Carácter en la copa",
    body: "Cuerpo", notes: "Notas típicas", smoke: "Humo", finish: "Final",
    light: "Cuerpo ligero", medium: "Cuerpo medio", full: "Cuerpo pleno",
    bodyLevelLight: "Ligero", bodyLevelMedium: "Medio", bodyLevelFull: "Pleno",
    sources: "Fuentes y referencias",
    legal: "Categoría legal", plant: "Planta", process: "Elaboración",
    compareThis: "Comparar este estilo", choices: "Tu comparación",
    remove: "Quitar", slots: "Elige hasta tres estilos. Quita uno para dejar espacio.",
    scroll: "Desliza horizontalmente para comparar todos los estilos.", dimension: "Atributo",
    none: "Nada", low: "Bajo", high: "Alto", mediumLevel: "Medio", unknown: "No documentado",
    herbal: "Herbal / vegetal", fruit: "Fruta / floral", sweetness: "Dulzor percibido", pepper: "Pimienta / especias", oak: "Roble",
    home: "Volver al inicio de la Guía del Agave", search: "Buscar en la guía",
    disclosure: "El contenido editorial y algunas etiquetas de referencia están actualmente en inglés.",
    partialDisclosure: "Esta secci\u00f3n est\u00e1 disponible en ingl\u00e9s.",
    notDocumented: "no documentado", labelFact: "dato de etiqueta",
    factSpirit: "Destilado", factAbv: "Graduaci\u00f3n alcoh\u00f3lica", factAbvLong: "Graduaci\u00f3n alcoh\u00f3lica (% Alc. Vol.)", factProducer: "Productor", factPlace: "Lugar",
    factBatch: "Lote/versi\u00f3n", factComposition: "Composici\u00f3n",
    factClassification: "Clasificaci\u00f3n", factPlantComposition: "Composici\u00f3n de agave",
    fitsPrefix: "C\u00f3mo encaja con el perfil \u00ab{title}\u00bb (editorial): ", fitsPrefixPlain: "C\u00f3mo encaja con el perfil de referencia (editorial): ",
    relatesPrefix: "C\u00f3mo se relaciona con la cobertura de la gu\u00eda (editorial): ",
    catalogueEmpty: "Ninguna botella coincide con \u00ab{query}\u00bb. Prueba una marca (Fortaleza), una expresi\u00f3n (Blanco Tequila) o un lugar (Sonora).",
    jumpTo: "Ir a {name} en el cat\u00e1logo",
    kindSource: "fuente {kind}", verifiedAs: "verificado {date}",
    kindProducer: "productor", kindReview: "rese\u00f1a", kindStyle: "estilo", kindOfficial: "oficial",
    contextPrefix: "Contexto: ",
    classTerms: "Los t\u00e9rminos de clase son espec\u00edficos de cada destilado: las reglas del tequila no se transfieren al mezcal ni a la raicilla. Cuando un t\u00e9rmino no es una clase legal, se indica.",
    missingData: "No comparado porque el dato no est\u00e1 documentado: {list}. \u201cNo documentado\u201d nunca significa cero.",
    loading: "Cargando\u2026", errorTitle: "Algo sali\u00f3 mal", reload: "Recargar la p\u00e1gina",
    skipToContent: "Saltar al contenido", mainNav: "Principal", preferences: "Preferencias",
    switchTheme: "Cambiar tema", toLight: "Cambiar al tema claro", toDark: "Cambiar al tema oscuro",
    switchToEs: "Cambiar a Espa\u00f1ol (M\u00e9xico)", switchToEn: "Cambiar a ingl\u00e9s",
    currentEdition: "Edici\u00f3n actual: English (bandera del Reino Unido)", currentEditionEs: "Edici\u00f3n actual: Espa\u00f1ol (M\u00e9xico)",
    learnSections: "Secciones de aprendizaje", statesWithProfiles: "Estados con perfiles",
    docTitle: "RagDollLabs \u00b7 Gu\u00eda del Agave", docDescription: "Una peque\u00f1a gu\u00eda del cuerpo y el sabor de los destilados mexicanos de agave \u2014 perfiles de estilo de tequila, mezcal, bacanora y raicilla con botellas de ejemplo.",
    noScript: "Esta aplicaci\u00f3n necesita JavaScript para cargar sus datos locales. This app needs JavaScript to load its local data files.",
    brandProduct: "Gu\u00eda del Agave",
    mapFailed: "No se pudo cargar el mapa. Todav\u00eda puedes usar la lista de estados.",
    notFoundTitle: "Perfil no encontrado", notFoundBody: "No existe ning\u00fan perfil con el id \u00ab{id}\u00bb.", backToExplore: "\u2190 Volver a explorar",
    coordsNote: "Ubicaci\u00f3n: {lat}, {lon} ({precision}).",
    discoverHeading: "Entiende qu\u00e9 hay en la copa",
    discoverIntro: "Comienza con un destilado que conozcas, o sigue un sabor \u2014 aqu\u00ed est\u00e1n tambi\u00e9n las plantas, las regiones y las tradiciones. Todos los caminos llevan a los mismos perfiles de estilo.",
    discoverBySpirit: "Tradiciones de destilados", discoverBySpiritIntro: "Las tradiciones de esta gu\u00eda, con su origen y estatus legal.",
    discoverByFlavour: "Sigue un sabor", discoverByFlavourIntro: "Rutas de sabor accesibles a partir de los datos sensoriales existentes \u2014 un punto de partida, nunca una promesa sobre cada botella.",
    discoverByPlant: "Plantas", discoverByPlantIntro: "Especies de agave (y el Dasylirion del sotol), nombres comunes primero.",
    discoverByRegion: "Lugares", discoverByRegionIntro: "Subregiones y municipios donde se practican las tradiciones de la gu\u00eda. La cobertura aqu\u00ed es de la app \u2014 no son l\u00edmites legales de producci\u00f3n.",
    discoverMore: "Las listas completas siguen siendo buscables en Explorar estilos.",
    discoverBack: "\u2190 Volver a plantas y lugares", alsoKnownAs: "Tambi\u00e9n conocido como", cultivationLabel: "Cosecha y cultivo",
    traditionsUsing: "Tradiciones que usan esta planta", whereItGrows: "Regiones donde crece",
    expressionsFromPlant: "Expresiones de esta planta", expressionsFromTradition: "Perfiles de estilo de esta tradici\u00f3n",
    expressionsHere: "Perfiles de estilo aqu\u00ed", expressionsNote: "Perfiles editoriales, no una promesa de que todas las botellas sepan igual.",
    traditionsHere: "Tradiciones practicadas aqu\u00ed", plantsHere: "Plantas usadas aqu\u00ed",
    otherPlantsSameTradition: "Otras plantas de las mismas tradiciones",
    bottlesFromTradition: "Botellas de ejemplo de esta tradici\u00f3n", seeCatalogue: "Ver todas las botellas en el cat\u00e1logo",
    seeState: "Ver los perfiles de este estado en el mapa",
    tHistory: "Historia", tLegal: "Estatus legal", tMaterials: "Materiales", tPractices: "Pr\u00e1cticas", tDiversity: "Diversidad",
    discoverNoneYet: "Nada aqu\u00ed todav\u00eda \u2014 esto es cobertura de la gu\u00eda, no una afirmaci\u00f3n de que no exista nada.",
    discoverNotFoundTitle: "No encontrado",
    discoverNotFoundKind: "No existe {kind} con el id \u00ab{id}\u00bb. Usa un camino de descubrimiento \u2014 o explora los estilos.",
    discoverKindPlant: "planta", discoverKindRegion: "regi\u00f3n", discoverKindSpirit: "tradici\u00f3n de destilado", discoverKindFlavour: "categor\u00eda de sabor", discoverKindUnknown: "entrada",
    flavourUnknown: "Esa categor\u00eda de sabor no existe.",
    flavourFreshHerbal: "Fresco y herbal", flavourFruityFloral: "Frutal y floral", flavourSmokyEarthy: "Con humo y terroso",
    flavourPepperySpicy: "Especiado y picante", flavourRichOak: "Rico con roble", flavourAdventurous: "Poco com\u00fan y aventurero",
    flavourIntroFreshHerbal: "Car\u00e1cter herbal alto con poco o nada de humo.",
    flavourIntroFruityFloral: "Notas de fruta y flor sobre un asado suave.",
    flavourIntroSmokyEarthy: "Humo medio o alto por el asado en pozo.",
    flavourIntroPepperySpicy: "Un filo de pimienta y sabor umami.",
    flavourIntroRichOak: "La maduraci\u00f3n en madera hace el trabajo pesado.",
    flavourIntroAdventurous: "Tradiciones regionales m\u00e1s all\u00e1 del tequila y el mezcal.",
    reasonHerbal: "Nivel editorial de herbal: {value}.", reasonFruit: "Nivel editorial de fruta/floral: {value}.",
    reasonSmoke: "Nivel editorial de humo: {value}.", reasonPepper: "Nivel editorial de pimienta: {value}.",
    reasonOak: "Nivel editorial de roble: {value}.", reasonAdventurous: "Una tradici\u00f3n regional: {tradition}.",
    reasonSuffix: "Impresi\u00f3n editorial \u2014 las botellas y los lotes var\u00edan.",
    flavourDisclaimer: "Son agrupaciones editoriales de estilo a partir de datos de perfiles. Describen tendencias t\u00edpicas de estilo, nunca cada botella de una tradici\u00f3n.",
    sharesWhy: "Una lectura similar en la copa: ambos muestran {list}; mismo destilado y misma planta, así que el lugar y el productor marcan la diferencia.", sharesWhyOtherSpirit: "Una lectura similar en la copa: ambos muestran {list}; este llega ahí como {spirit}, por otro camino.", sharesWhyOtherPlant: "Una lectura similar en la copa: ambos muestran {list}; la diferencia está en la planta.", sharesWhyOtherRest: "Una lectura similar en la copa: ambos muestran {list}; la diferencia está en el tiempo en madera.", seeStyleProfile: "Ver el perfil de estilo de {spirit} \u2192", reasonSpirit: "Coincide con el destilado \u00ab{spirit}\u00bb.", bottleEyebrow: "Botella del cat\u00e1logo",
    reasonBrand: "La marca de la botella de ejemplo coincide: {brand}.", reasonProducer: "El productor coincide: {producer}.",
    reasonNote: "La nota de cata coincide: \u00ab{note}\u00bb.", reasonPlant: "La planta de agave coincide: {plant}.",
    reasonPlace: "El lugar coincide: {place}.", reasonGeneral: "Coincide con \u00ab{query}\u201d en este perfil.",
    hintSmoke: "Impresi\u00f3n editorial de humo \u2014 no es turba ni contenido de humo medido.",
    hintHerbal: "Car\u00e1cter vegetal fresco o cocido y herb\u00e1ceo.",
    hintFruit: "Notas de huerto, c\u00edtricos y florales.",
    hintSweetness: "Dulzor percibido en el paladar \u2014 no az\u00facar medido.",
    hintPepper: "Punza de pimienta negra y especias.",
    hintBody: "Nivel editorial de cuerpo, seg\u00fan el campo de cuerpo del perfil.",
    hintOak: "Influencia de madera; la mayor\u00eda de los destilados de agave sin crianza es ninguna.",
    hintFinish: "Cu\u00e1nto dura el final.",
    guidance: "Orientación editorial sobre el estilo; no es una reseña ni una calificación de una botella.",
    footer: "Explora con curiosidad. Disfruta con responsabilidad.",
    "abvUnknown": "ABV no documentado",
    "noReviewYet": "Aún no hay nota de cata atribuida para esta expresión.",
    basisOneReview: "Notas de carácter seg\u00fan una rese\u00f1a independiente",
    basisReviews: "Notas de carácter según {count} reseñas independientes",
    basisOneProducer: "Notas de carácter según la descripción del propio productor",
    basisProducers: "Notas de carácter según {count} descripciones de productor",
    basisOneStyle: "Notas de carácter según un relato publicado de esta expresión",
    basisStyles: "Notas de carácter según {count} relatos publicados de esta expresión",
    basisFactsOnly: "Registro factual — aún no hay notas de cata documentadas para esta expresión.",
    "learn.heading": "Aprender",
  },
};

export function ui(locale, key) {
  return COPY[locale?.get() === "es" ? "es" : "en"][key] || key;
}

export function discoveryCard(profile, locale = null) {
  const link = el("a", { class: "discovery-card", href: "#/profile/" + encodeURIComponent(profile.id) });
  link.appendChild(el("span", { class: "eyebrow" }, SPIRIT_LABELS[profile.spirit] || profile.spirit));
  link.appendChild(el("strong", {}, localizedTitle("profile", profile.id, profile.title, locale)));
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
  // Pair 26: three clearly named ways in — learn, explore, look it up —
  // instead of five competing cards. Every earlier destination stays one
  // click away inside its path.
  const nav = (key) => (locale ? locale.t("nav." + key) : key);
  const paths = [
    { key: "pathStart", href: "#/start", primary: true, links: [] },
    { key: "pathExplore", href: "#/explore", links: [["#/explore", nav("explore")], ["#/discover", nav("discover")], ["#/compare", nav("compare")]] },
    { key: "pathLookUp", href: "#/catalogue", links: [["#/catalogue", nav("catalogue")], ["#/learn", nav("learn")], ["#/learn/terms", ui(locale, "linkGlossary")], ["#/plant-to-glass", ui(locale, "linkPlantToGlass")]] },
  ];
  const actions = el("ul", { class: "welcome-actions welcome-paths", "aria-label": ui(locale, "pathsLabel") });
  for (const path of paths) {
    const item = el("li", { class: "welcome-path" + (path.primary ? " is-primary" : "") });
    const action = el("a", { class: "welcome-action" + (path.primary ? " is-primary" : ""), href: path.href });
    action.appendChild(el("strong", {}, ui(locale, path.key) + " →"));
    action.appendChild(el("span", {}, ui(locale, path.key + "Hint")));
    item.appendChild(action);
    if (path.links.length) {
      const sub = el("p", { class: "welcome-sublinks" });
      path.links.forEach(([href, label], i) => {
        if (i) sub.appendChild(document.createTextNode(" · "));
        sub.appendChild(el("a", { href, class: "welcome-sublink" }, label));
      });
      item.appendChild(sub);
    }
    actions.appendChild(item);
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
  for (const profile of picks.length ? picks : profiles.slice(0, 3)) cards.appendChild(discoveryCard(profile, locale));
  featured.appendChild(cards);
  featured.appendChild(el("a", { class: "text-action", href: "#/explore" }, ui(locale, "all") + " →"));
  section.appendChild(featured);
  container.appendChild(section);
}

/** Localized label for a comparison/sensory dimension key. */
export function dimensionLabel(key, locale) {
  return ui(locale, DIMENSION_KEY_LABELS[key] || key);
}

/** Localized hint/tooltip for a dimension key. */
export function dimensionHint(key, locale) {
  return ui(locale, "hint" + (DIMENSION_KEY_LABELS[key] || key).replace(/^./, (c) => c.toUpperCase()));
}

const DIMENSION_KEY_LABELS = { bodyLevel: "body", finishLength: "finish" };

export function sensoryOverview(profile, locale) {
  const section = el("section", { class: "sensory-overview", "aria-labelledby": "sensory-heading" });
  section.appendChild(el("h2", { id: "sensory-heading" }, ui(locale, "sensory")));
  const list = el("dl", { class: "sensory-grid" });
  const keys = { bodyLevel: "body", finishLength: "finish" };
  for (const { key } of DIMENSIONS) {
    const level = levelOf(profile, key);
    const row = el("div", { class: "sensory-row" });
    row.appendChild(el("dt", {}, ui(locale, keys[key] || key)));
    // Pair 24: body is a texture, so it reads Light / Medium / Full (the
    // profile's own body word), not Low / Medium / High, and it is shown
    // only here rather than a second time in the facts list.
    const bodyWord = key === "bodyLevel" && ["light", "medium", "full"].includes(profile.body)
      ? ui(locale, "bodyLevel" + profile.body.replace(/^./, (c) => c.toUpperCase()))
      : null;
    const value = el("dd", key === "bodyLevel" ? { class: "profile-body" } : {});
    value.appendChild(el("span", { class: "sensory-value" }, bodyWord || ui(locale, level === "medium" ? "mediumLevel" : level || "unknown")));
    const track = el("span", { class: "sensory-track", "aria-hidden": "true" });
    track.appendChild(el("span", { class: "sensory-fill level-" + (level || "unknown") }));
    value.appendChild(track);
    row.appendChild(value);
    list.appendChild(row);
  }
  section.appendChild(list);
  return section;
}
