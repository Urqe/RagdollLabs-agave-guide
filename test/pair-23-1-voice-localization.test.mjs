import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Pair 23.1 — editorial voice and Spanish localization corrective
 * maintenance. Covers the voice guide, the five regional rewrites,
 * localized plant fields, the Spanish calques, the taste-note contract,
 * body-only suggestions, same-plant chips, the page-level Spanish
 * disclosure and the two Los Altos pins.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");

const rawFiles = {
  "profiles.json": await read("assets/data/profiles.json"),
  "bottles.json": await read("assets/data/bottles.json"),
  "sources.json": await read("assets/data/sources.json"),
  "plants.json": await read("assets/data/plants.json"),
  "processes.json": await read("assets/data/processes.json"),
  "glossary.json": await read("assets/data/glossary.json"),
  "content-es.json": await read("assets/data/content-es.json"),
  "traditions.json": await read("assets/data/traditions.json"),
  "chapters.json": await read("assets/data/chapters.json"),
  "regions.json": await read("assets/data/regions.json"),
};
const { profiles } = JSON.parse(rawFiles["profiles.json"]);
const { bottles } = JSON.parse(rawFiles["bottles.json"]);
const { plants } = JSON.parse(rawFiles["plants.json"]);
const { regions } = JSON.parse(rawFiles["regions.json"]);
const { traditions } = JSON.parse(rawFiles["traditions.json"]);
const { sources } = JSON.parse(rawFiles["sources.json"]);
const contentEs = JSON.parse(rawFiles["content-es.json"]);
const profileById = new Map(profiles.map((p) => [p.id, p]));

const FIVE = [
  "mezcal-papalote-montana-guerrero",
  "mezcal-cenizo-sierra-durango",
  "mezcal-verde-altiplano-slp",
  "mezcal-cupreata-rio-de-parras-michoacan",
  "mezcal-papalometl-mixteca-puebla",
];

// A shared jsdom for the direct-render tests.
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/guide/", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.localStorage = dom.window.localStorage;
globalThis.sessionStorage = dom.window.sessionStorage;

const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const es = createLocale();
es.set("es");
localStorage.clear();
const en = createLocale();
en.set("en");

// ---------------------------------------------------------------- voice guide

test("pair 23.1: the editorial voice guide exists and covers the agreed rules", async () => {
  const guide = await read("EDITORIAL_VOICE.md");
  for (const heading of ["## Who is talking", "## The order of a profile", "## Caution, said once",
    "## Spanish (Mexico)", "## Before and after", "## Checklist for every rewrite"]) {
    assert.ok(guide.includes(heading), `voice guide has "${heading}"`);
  }
  assert.ok(/no invented "I"/i.test(guide), "the guide rules out a fictional narrator");
  assert.ok(/savory.*not.*sabroso/is.test(guide), "the guide names the savory/sabroso false friend");
});

// ------------------------------------------------------- five regional rewrites

test("pair 23.1: the five regional profiles open on the glass, not on a formula", () => {
  const formulas = [/this profile is grounded/i, /what the glass shows and how it is made/i, /separate records/i,
    /documented method/i, /documented tasting/i];
  const esFormulas = [/este perfil se apoya/i, /dos registros distintos/i, /m[ée]todo documentado/i, /cata documentada/i];
  const openingsEn = new Set();
  const openingsEs = new Set();
  for (const id of FIVE) {
    const p = profileById.get(id);
    const e = contentEs.profiles[id];
    for (const f of formulas) {
      assert.ok(!f.test(p.description) && !f.test(p.whyItTastes), `${id} EN drops ${f}`);
    }
    for (const f of esFormulas) {
      assert.ok(!f.test(e.description) && !f.test(e.whyItTastes), `${id} ES drops ${f}`);
    }
    const firstEn = p.description.split(/[.:]/)[0];
    assert.ok(!/profile|guide|record/i.test(firstEn), `${id} EN first sentence is about the glass: "${firstEn}"`);
    openingsEn.add(p.description.split(" ").slice(0, 3).join(" ").toLowerCase());
    openingsEs.add(e.description.split(" ").slice(0, 3).join(" ").toLowerCase());
    for (const field of ["description", "whyItTastes"]) {
      assert.ok(!/genuinely/i.test(p[field]), `${id} EN ${field} drops "genuinely"`);
      assert.ok(!/genuinamente/i.test(e[field]), `${id} ES ${field} drops "genuinamente"`);
    }
  }
  assert.equal(openingsEn.size, FIVE.length, "each EN description opens differently");
  assert.equal(openingsEs.size, FIVE.length, "each ES description opens differently");
});

// ----------------------------------------------------- localized plant fields

const cupreata = plants.find((p) => p.id === "agave-cupreata");
const cupreataEsCultivation = contentEs.plants["agave-cupreata"].cultivation;
const mountainsEs = contentEs.commonNameRegions["Guerrero and Michoacán mountains"];

test("pair 23.1: the plant page shows Spanish cultivation and region labels", async () => {
  const { renderPlantPage } = await import("../assets/js/plant-tradition-view.js");
  const box = document.createElement("div");
  renderPlantPage(box, { plant: cupreata, plants, regions, traditions, profiles, sources, locale: es });
  assert.ok(box.textContent.includes(cupreataEsCultivation), "localized cultivation renders");
  assert.ok(!box.textContent.includes(cupreata.cultivation), "English cultivation does not leak");
  assert.ok(box.textContent.includes(mountainsEs), "localized common-name region renders");
  assert.ok(!box.textContent.includes("Guerrero and Michoacán mountains"), "English region label does not leak");
  assert.ok(box.textContent.includes("Agave cupreata"), "the scientific name is preserved");

  const enBox = document.createElement("div");
  renderPlantPage(enBox, { plant: cupreata, plants, regions, traditions, profiles, sources, locale: en });
  assert.ok(enBox.textContent.includes(cupreata.cultivation), "English edition keeps the English cultivation");
  assert.ok(enBox.textContent.includes("Guerrero and Michoacán mountains"), "English edition keeps the English label");
});

test("pair 23.1: the discover plant page shows Spanish cultivation and region labels", async () => {
  const { renderDiscover } = await import("../assets/js/discovery-view.js");
  const box = document.createElement("div");
  renderDiscover(box, { kind: "plant", id: "agave-cupreata", plants, regions, traditions, profiles, bottles, locale: es });
  assert.ok(box.textContent.includes(cupreataEsCultivation), "localized cultivation renders");
  assert.ok(!box.textContent.includes(cupreata.cultivation), "English cultivation does not leak");
  assert.ok(box.textContent.includes(mountainsEs), "localized common-name region renders");
});

test("pair 23.1: the Learn plant reference localizes region labels on every plant", async () => {
  const { renderLearn } = await import("../assets/js/learn-view.js");
  const { chapters } = JSON.parse(rawFiles["chapters.json"]);
  const { processes } = JSON.parse(rawFiles["processes.json"]);
  const { glossary } = JSON.parse(rawFiles["glossary.json"]);
  const box = document.createElement("div");
  renderLearn(box, { chapters, plants, processes, glossary, profiles, bottles, sources, locale: es });
  const text = box.textContent;
  for (const plant of plants) {
    for (const n of plant.commonNames || []) {
      const esLabel = contentEs.commonNameRegions[n.region];
      if (esLabel !== n.region) {
        assert.ok(!text.includes(`(${n.region})`), `Learn does not show the English label "${n.region}"`);
      }
      assert.ok(text.includes(`(${esLabel})`), `Learn shows the Spanish label "${esLabel}"`);
    }
  }
});

// Boot the real app at a route, optionally in Spanish and with file overrides.
let bootCount = 0;
async function bootApp(startHash, { localeCode = "en", overrides = {} } = {}) {
  const files = { ...rawFiles, ...overrides };
  const appDom = new JSDOM(`<!doctype html><html><body><div id="app"></div></body></html>`, {
    url: `https://example.test/RagdollLabs-agave-guide/${startHash}`,
    pretendToBeVisual: true,
  });
  appDom.window.localStorage.setItem("agave-locale", localeCode);
  appDom.window.HTMLElement.prototype.scrollIntoView = function () {};
  const prev = {
    window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch,
    localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage,
  };
  globalThis.window = appDom.window;
  globalThis.document = appDom.window.document;
  globalThis.localStorage = appDom.window.localStorage;
  globalThis.sessionStorage = appDom.window.sessionStorage;
  globalThis.fetch = async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel in files) return { ok: true, json: async () => JSON.parse(files[rel]), text: async () => files[rel] };
    return { ok: false, status: 404 };
  };
  const cleanup = () => {
    Object.assign(globalThis, prev);
    setContentEs(contentEs);
  };
  try {
    await import(`../assets/js/app.js?pair231=${++bootCount}`);
    await new Promise((r) => setTimeout(r, 80));
    return { window: appDom.window, document: appDom.window.document, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}

test("pair 23.1: navigating into plant pages in Spanish shows no English plant fields", async () => {
  for (const hash of ["#/plant/agave-cupreata", "#/discover/plant/agave-cupreata"]) {
    const app = await bootApp(hash, { localeCode: "es" });
    try {
      const main = app.document.querySelector("main");
      assert.ok(main.textContent.includes(cupreataEsCultivation), `${hash}: localized cultivation`);
      assert.ok(main.textContent.includes(mountainsEs), `${hash}: localized region label`);
      assert.ok(!main.textContent.includes(cupreata.cultivation), `${hash}: no English cultivation`);
    } finally {
      app.cleanup();
    }
  }
});

// ------------------------------------------------- page-level Spanish disclosure

test("pair 23.1: a fully translated Spanish page carries no blanket 'in English' note", async () => {
  const app = await bootApp("#/profile/tequila-blanco-valley-jalisco", { localeCode: "es" });
  try {
    assert.equal(app.document.querySelectorAll(".untranslated-field").length, 0, "no field falls back to English");
    assert.equal(app.document.querySelector(".untranslated-note"), null, "no page-level note");
  } finally {
    app.cleanup();
  }
});

test("pair 23.1: a Spanish page that does fall back to English still discloses it", async () => {
  const patched = JSON.parse(rawFiles["content-es.json"]);
  delete patched.profiles["tequila-blanco-valley-jalisco"].context;
  const app = await bootApp("#/profile/tequila-blanco-valley-jalisco", {
    localeCode: "es", overrides: { "content-es.json": JSON.stringify(patched) },
  });
  try {
    assert.ok(app.document.querySelector(".untranslated-field"), "the fallback field is marked");
    assert.ok(app.document.querySelector(".untranslated-note"), "the page-level note appears");
  } finally {
    app.cleanup();
  }
});

// ------------------------------------------------------------- Spanish calques

test("pair 23.1: Spanish copy drops the listed calques and English loanwords", () => {
  const whole = JSON.stringify(contentEs);
  for (const artifact of ["leerse sabrosos", "se leen sabrosos", "taffy", "funky", "genuinamente divididas",
    "el agave firma", "pasadas de una generación", "carga la presión", "viajes minerales"]) {
    assert.ok(!whole.includes(artifact), `ES copy drops "${artifact}"`);
  }
  assert.ok(!/\bse lee(n)?\b|leerse/.test(whole), "no 'se lee' flavour phrasing remains");
});

test("pair 23.1: bottle summaries name their reviewers once", () => {
  for (const id of ["palalma-michoacan-cupreata", "zinacantan-papalometl"]) {
    const b = bottles.find((x) => x.id === id);
    assert.ok((b.reviewSummary.match(/reviewers/g) || []).length <= 1, `${id} EN says "reviewers" at most once`);
    const esSummary = contentEs.bottles[id].reviewSummary;
    assert.ok((esSummary.match(/reseñistas|catadores/g) || []).length <= 1, `${id} ES names its tasters at most once`);
  }
});

// -------------------------------------------------------- taste-note contract

test("pair 23.1: taste notes have one localization contract", async () => {
  const { ES_NOTES } = await import("../assets/js/taste-notes.js");
  for (const [id, entry] of Object.entries(contentEs.profiles)) {
    assert.equal(entry.tasteNotes, undefined, `${id} carries no unused Spanish tasteNotes string`);
  }
  for (const p of profiles) {
    for (const note of p.tasteNotes || []) {
      assert.ok(ES_NOTES[note], `"${note}" (${p.id}) has a Spanish label in ES_NOTES`);
    }
  }
});

// ------------------------------------------------------ body-only suggestions

test("pair 23.1: sharing only body never produces a flavour suggestion", async () => {
  const { ifYouLikeThis } = await import("../assets/js/compare.js");
  const sensory = (o) => ({ smoke: "none", herbal: "low", fruit: "low", sweetness: "low", pepper: "low", oak: "none", finishLength: "low", ...o });
  const anchor = { id: "anchor", body: "medium", sensory: sensory({ herbal: "high" }) };
  const bodyOnly = { id: "body-only", body: "medium", sensory: sensory({ fruit: "high" }) };
  const flavourMatch = { id: "flavour-match", body: "light", sensory: sensory({ herbal: "high" }) };
  const result = ifYouLikeThis(anchor, [bodyOnly, flavourMatch]);
  assert.ok(!result.some((s) => s.profile.id === "body-only"), "a body-only match is not suggested");
  const match = result.find((s) => s.profile.id === "flavour-match");
  assert.ok(match, "a real flavour match still qualifies");
  assert.deepEqual(match.sharedDimensionKeys, ["herbal"], "the reason names the shared flavour");
});

// ------------------------------------------------------------ same-plant chips

test("pair 23.1: same-plant perspectives name the plant without nested parentheses", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  for (const locale of [en, es]) {
    const box = document.createElement("div");
    renderCompare(box, {
      profiles, plants, locale, onSelectionChange: () => {},
      compareIds: "tequila-blanco-valley-jalisco,tequila-blanco-highland-jalisco",
    });
    const item = [...box.querySelectorAll(".compare-perspectives li")]
      .find((li) => li.textContent.includes("Agave tequilana Weber var. azul"));
    assert.ok(item, `${locale.get()}: the perspective names the canonical species`);
    assert.ok(!/\([^)]*\(/.test(item.textContent), `${locale.get()}: no nested parentheses`);
  }
});

// --------------------------------------------------------------- Los Altos pins

test("pair 23.1: the Los Altos profiles are pinned in Los Altos, not the valley", () => {
  const inLosAltos = (c) => c.lat >= 20.4 && c.lat <= 21.2 && c.lon >= -102.9 && c.lon <= -101.8;
  for (const id of ["tequila-extra-anejo-highland-jalisco", "tequila-blanco-highland-jalisco"]) {
    const c = profileById.get(id).placeCoords;
    assert.ok(inLosAltos(c), `${id} sits in Los Altos (${c.lat}, ${c.lon})`);
    assert.ok(/Los Altos/.test(c.precision) && /approximate/.test(c.precision), `${id} keeps an honest label`);
  }
  assert.ok(/Arandas/.test(profileById.get("tequila-extra-anejo-highland-jalisco").placeCoords.precision),
    "the extra añejo label names Arandas, where its example producer is");
  const valley = profileById.get("tequila-blanco-valley-jalisco").placeCoords;
  assert.ok(!inLosAltos(valley), "the valley blanco stays in the Tequila Valley");
});
