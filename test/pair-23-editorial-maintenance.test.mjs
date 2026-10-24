import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.test/guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.sessionStorage = dom.window.sessionStorage;
globalThis.localStorage = dom.window.localStorage;

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const { profiles } = JSON.parse(await read("assets/data/profiles.json"));
const { bottles } = JSON.parse(await read("assets/data/bottles.json"));
const { sources: sourceList } = JSON.parse(await read("assets/data/sources.json"));
const contentEs = JSON.parse(await read("assets/data/content-es.json"));

const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const { createLocale } = await import("../assets/js/locale.js");
const en = createLocale();
en.set("en");
localStorage.clear();
const es = createLocale();
es.set("es");

const FIVE = [
  "mezcal-papalote-montana-guerrero",
  "mezcal-cenizo-sierra-durango",
  "mezcal-verde-altiplano-slp",
  "mezcal-cupreata-rio-de-parras-michoacan",
  "mezcal-papalometl-mixteca-puebla",
];
const profileById = new Map(profiles.map((p) => [p.id, p]));
const bottleById = new Map(bottles.map((b) => [b.id, b]));

const {
  ifYouLikeThis,
  comparisonPerspectives,
  levelOf,
  DIMENSIONS,
} = await import("../assets/js/compare.js");

/** A synthetic profile with full sensory control (null = not documented). */
function fixture(id, sensory, body = "medium") {
  return { id, title: id, body, sensory, plantIds: [], processIds: [], traditionId: "x", regionIds: [] };
}

const full = (smoke, herbal, fruit, sweetness, pepper, oak, finishLength) => ({
  smoke, herbal, fruit, sweetness, pepper, oak, finishLength,
});

test("pair 23: shared high/medium attributes qualify a suggestion; shared low/none alone never does", () => {
  const anchor = fixture("anchor", full("low", "high", "high", "medium", "low", "none", "medium"));
  const sharedHigh = fixture("shared-high", full("low", "high", "high", "medium", "low", "none", "medium"));
  const sharedLowOnly = fixture("shared-low-only", full("low", "low", "low", "low", "low", "none", "low"), "light");
  const sharedLowLightBody = fixture("shared-low-light-body", full("low", "low", "low", "low", "low", "none", "low"), "light");
  const suggestions = ifYouLikeThis(anchor, [sharedLowOnly, sharedLowLightBody, sharedHigh]);
  assert.equal(suggestions.length, 1, "only the strong-overlap candidate qualifies");
  assert.equal(suggestions[0].profile.id, "shared-high");
  assert.ok(suggestions[0].sharedDimensionKeys.includes("herbal"), "the reason names a strong shared attribute");
  assert.ok(
    suggestions[0].sharedDimensionKeys.every((k) => LEVEL_ORDER[levelOf(anchor, k)] >= LEVEL_ORDER.medium),
    "every named shared attribute is medium or high — a low reading is never the reason"
  );
  assert.equal(ifYouLikeThis(anchor, [sharedLowOnly]).length, 0,
    "shared low/none alone never produces a suggestion");
});

const LEVEL_ORDER = { none: 0, low: 1, medium: 2, high: 3 };

test("pair 23: shared unknown stays distinct from shared low and none", () => {
  const anchor = fixture("anchor", full("low", "high", "high", "medium", "low", "none", "medium"));
  const unknownSmoke = fixture("unknown-smoke", full(null, "high", "high", "medium", "low", "none", "medium"), "light");
  const unknownAll = fixture("unknown-all", full(null, null, null, null, null, null, null), "light");
  const suggestions = ifYouLikeThis(anchor, [unknownSmoke, unknownAll]);
  assert.equal(suggestions.length, 1, "the partly-unknown candidate can still qualify on known overlap");
  assert.equal(suggestions[0].profile.id, "unknown-smoke");
  assert.ok(
    !suggestions[0].sharedDimensionKeys.includes("smoke"),
    "an undocumented dimension is never counted as shared evidence"
  );
  assert.equal(ifYouLikeThis(anchor, [unknownAll]).length, 0,
    "a fully undocumented candidate never qualifies — unknown is not a shared attribute");
});

test("pair 23: a genuine single-variable regional comparison needs matching class and method", () => {
  const base = {
    plantIds: ["agave-tequilana"], traditionId: "tequila", regionIds: ["tequila-valley-jal"],
    processIds: ["steam-cook", "wild-fermentation"], maturation: { class: "blanco" },
  };
  const valley = { ...base, id: "v", title: "Valley", regionIds: ["tequila-valley-jal"] };
  const highland = { ...base, id: "h", title: "Highland", regionIds: ["tequila-highlands-jal"] };
  const samePlantDiffRegion = comparisonPerspectives([valley, highland]);
  assert.ok(samePlantDiffRegion.some((x) => x.id === "samePlantDifferentRegion"),
    "matching class and method: the place-variable perspective is earned");

  const methodChanged = { ...highland, id: "m", processIds: ["steam-cook"] };
  const mixed = comparisonPerspectives([valley, methodChanged]);
  assert.ok(!mixed.some((x) => x.id === "samePlantDifferentRegion"),
    "method also changes: the place-only perspective is suppressed");
  const honest = mixed.find((x) => x.id === "samePlantDifferentRegionAndClass");
  assert.ok(honest, "the multi-variable perspective appears instead");
  assert.equal(honest.sameMethodSet, false, "it records which variables actually differ");

  const classChanged = { ...highland, id: "c", maturation: { class: "reposado" } };
  const classMixed = comparisonPerspectives([valley, classChanged]);
  const honestClass = classMixed.find((x) => x.id === "samePlantDifferentRegionAndClass");
  assert.ok(honestClass, "a class change also yields the multi-variable perspective");
  assert.equal(honestClass.sameMaturationClass, false, "the class difference is recorded");
});

test("pair 23: Michoac\u00e1n\u2013Puebla comparison never claims a single variable", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const mic = profileById.get("mezcal-cupreata-rio-de-parras-michoacan");
  const pue = profileById.get("mezcal-papalometl-mixteca-puebla");
  const r = comparisonPerspectives([mic, pue]);
  assert.ok(!r.some((x) => x.id === "samePlantDifferentRegion"),
    "different plants and methods: no place-only claim");
  const container = document.createElement("div");
  renderCompare(container, {
    profiles, compareIds: `${mic.id},${pue.id}`, locale: en, onSelectionChange: () => {},
  });
  const chips = [...container.querySelectorAll(".compare-perspective-chip")].map((c) => c.textContent);
  for (const chip of chips) {
    assert.ok(!/place is the variable/i.test(chip), `no chip claims place alone: ${chip}`);
    assert.ok(!/the agave is the variable/i.test(chip), `no chip claims the agave alone when place and method differ too: ${chip}`);
    assert.ok(/not only the plant changes|combination/i.test(chip), `the chip names the changing combination: ${chip}`);
  }
  const plantRow = [...container.querySelectorAll(".compare-craft dd")][0].textContent;
  assert.ok(plantRow.includes("cupreata") && plantRow.includes("potatorum"),
    "the plant row shows the actual differing plants");
});

test("pair 23: suggestion reasons describe strong shared attributes, never a shared-low 'lean'", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  for (const locale of [en, es]) {
    const anchor = profileById.get("mezcal-papalometl-mixteca-puebla");
    const container = document.createElement("div");
    renderProfile(container, {
      profile: anchor,
      bottle: bottleById.get(anchor.exampleBottleId),
      sources: sourceList,
      allProfiles: profiles,
      allBottles: bottles,
      locale,
    });
    const reasons = [...container.querySelectorAll(".suggestion-list .search-result-reason")].map((n) => n.textContent);
    assert.ok(reasons.length > 0, `suggestions render in ${locale.get()}`);
    for (const reason of reasons) {
      assert.ok(!/both lean/i.test(reason), "EN reason does not claim a shared 'lean'");
      assert.ok(!/ambos tienden/i.test(reason), "ES reason does not claim a shared leaning");
      const named = reason.match(/:(.*?);/);
      if (named) {
        for (const word of named[1].split(",")) {
          const label = word.trim();
          assert.ok(label.length > 0, "no empty dimension in the reason");
        }
      }
    }
    container.remove();
  }
});

test("pair 23: the five regional profiles keep tasting evidence at bottle scale", () => {
  const overreach = [
    /Durango's welcome is sweeter and often hotter than Oaxaca['’]s/i,
    /unmistakably Michoac[aá]n/i,
    /inconfundiblemente michoacana/i,
    /defines Oaxacan mezcal/i,
    /define al mezcal oaxaqueño/i,
    /el estado honesto de una tradición/i,
  ];
  for (const id of FIVE) {
    const p = profileById.get(id);
    const esEntry = contentEs.profiles[id];
    const enText = [p.context, p.description, p.beginnerNote, p.whyItTastes, p.smoke, p.finish, p.pairing.notice].join(" ");
    const esText = [esEntry.context, esEntry.description, esEntry.beginnerNote, esEntry.whyItTastes, esEntry.smoke, esEntry.finish, esEntry.pairing.notice].join(" ");
    for (const pattern of overreach) {
      assert.ok(!pattern.test(enText), `${id} EN drops the overreaching claim ${pattern}`);
      assert.ok(!pattern.test(esText), `${id} ES drops the overreaching claim ${pattern}`);
    }
    assert.ok(/the example bottle|the example expression/i.test(enText),
      `${id} anchors its tasting in the example bottle`);
    assert.ok(/botella de ejemplo|expresión de ejemplo/i.test(esText),
      `${id} ES anchors its tasting in the example bottle`);
  }
});

// Pair 23.1 rewrote these why-blocks in the voice of EDITORIAL_VOICE.md and
// removed the "separate records" formula on purpose. What stays pinned is the
// substance: the method and the tasting are both stated, and the causal link
// between them is visibly unestablished.
test("pair 23: causal explanations keep method and tasting apart and the cause open", () => {
  const mic = profileById.get("mezcal-cupreata-rio-de-parras-michoacan");
  assert.ok(/pulque/i.test(mic.whyItTastes) && /taster|review/i.test(mic.whyItTastes),
    "the Michoac\u00e1n why-block states both the method and what tasters find");
  assert.ok(/not a mechanism|no source isolates|does not establish/i.test(mic.whyItTastes),
    "the pulque-starter causal link stays flagged as unestablished");
  assert.ok(/open/i.test(mic.whyItTastes), "the causal question stays visibly open");
  const esMic = contentEs.profiles[mic.id].whyItTastes;
  assert.ok(/pulque/i.test(esMic) && /catador|reseña/i.test(esMic),
    "the ES why-block states both the method and what tasters find");
  assert.ok(/no un mecanismo|ninguna fuente a[ií]sla|no establezcan/i.test(esMic),
    "the ES causal link stays flagged as unestablished");
  assert.ok(/abierta/i.test(esMic), "the ES causal question stays visibly open");

  const pue = profileById.get("mezcal-papalometl-mixteca-puebla");
  assert.ok(/ferment/i.test(pue.whyItTastes) && /review/i.test(pue.whyItTastes),
    "the Puebla why-block states both the method and what reviews report");
  assert.ok(/not something the reviews establish|they report the acidity, not its cause/i.test(pue.whyItTastes),
    "the fermentation/acidity causal link stays flagged as unestablished");
  const esPue = contentEs.profiles[pue.id].whyItTastes;
  assert.ok(/no algo que las reseñas establezcan|reportan la acidez, no su causa/i.test(esPue),
    "the ES fermentation/acidity causal link stays flagged");
  assert.ok(/abierto/i.test(esPue), "the ES Puebla causal link stays open");

  const slp = profileById.get("mezcal-verde-altiplano-slp");
  assert.ok(/disputed|unresolved/i.test(slp.whyItTastes), "the SLP oven dispute stays visible in the why-block");
  assert.ok(/open question/i.test(slp.whyItTastes), "the SLP cause stays an open question, not a settled mechanism");
});

test("pair 23: reviewer-led narration and guide-model asides stay out of the regional reading flow", () => {
  const patterns = [/this guide records/i, /this profile records/i, /reviewer-led/i];
  for (const id of FIVE) {
    const p = profileById.get(id);
    const esEntry = contentEs.profiles[id];
    for (const text of [p.context, p.description, p.beginnerNote, esEntry.context, esEntry.description, esEntry.beginnerNote]) {
      for (const pattern of patterns) {
        assert.ok(!pattern.test(text), `${id} drops "${pattern}" from the reading flow`);
      }
    }
  }
  // Warmth survives: each profile still names a specific person, family or place.
  const anchors = [
    ["mezcal-papalote-montana-guerrero", /Alcaraz|Apango/],
    ["mezcal-cenizo-sierra-durango", /Cruz|El Mezquital/],
    ["mezcal-verde-altiplano-slp", /Hernández|Santa Isabel/],
    ["mezcal-cupreata-rio-de-parras-michoacan", /María E. Pérez|Río de Parras/],
    ["mezcal-papalometl-mixteca-puebla", /Torres Monfil|Tochimilitzingo/],
  ];
  for (const [id, pattern] of anchors) {
    const p = profileById.get(id);
    assert.ok(pattern.test(p.context) || pattern.test(p.description),
      `${id} keeps a specific person or place in its prose`);
    const esEntry = contentEs.profiles[id];
    assert.ok(pattern.test(esEntry.context) || pattern.test(esEntry.description),
      `${id} ES keeps a specific person or place`);
  }
});

test("pair 23: the ES regional copy is natural Spanish with no literal-translation artifacts", () => {
  const artifacts = ["atérran", "sodá", "en voz baja", "el estado honesto de una tradición"];
  const whole = JSON.stringify(contentEs);
  for (const artifact of artifacts) {
    assert.ok(!whole.includes(artifact), `ES copy drops the literal artifact "${artifact}"`);
  }
  for (const id of FIVE) {
    const entry = contentEs.profiles[id];
    for (const field of ["context", "description", "beginnerNote", "whyItTastes", "smoke", "finish"]) {
      assert.ok(entry[field] && entry[field].length > 30, `${id} ES ${field} is substantive prose`);
      assert.ok(!/^[A-Z][a-z]+ [a-z]+ the /.test(entry[field]), `${id} ES ${field} is not English`);
    }
  }
});

test("pair 23: missing sensory values stay distinct from low and none in the comparison table", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const anchor = fixture("anchor-f", full("low", "high", "high", "medium", "low", "none", "medium"), "light");
  const unknown = fixture("unknown-f", full("low", null, "high", null, "low", "none", null), "full");
  const container = document.createElement("div");
  renderCompare(container, {
    profiles: [anchor, unknown], compareIds: "anchor-f,unknown-f", locale: en, onSelectionChange: () => {},
  });
  const rows = [...container.querySelectorAll(".compare-table tbody tr")];
  const cells = new Map(rows.map((r) => [
    r.querySelector("th").textContent.trim(),
    [...r.querySelectorAll("td")].map((c) => c.textContent.trim()),
  ]));
  assert.deepEqual(cells.get("Herbal / vegetal"), ["High", "Not documented"],
    "unknown renders as Not documented, never as Low or None");
  assert.deepEqual(cells.get("Smoke"), ["Low", "Low"], "a documented Low renders as Low, distinct from unknown");
  assert.deepEqual(cells.get("Oak"), ["None", "None"], "a documented None renders as None, distinct from unknown");
  assert.ok(cells.get("Finish").includes("Not documented"), "finish unknown stays Not documented");
  const missingNote = container.querySelector(".editorial-note");
  assert.ok(missingNote, "the missing-data note still lists the uncomparable dimensions");
  container.remove();
});
