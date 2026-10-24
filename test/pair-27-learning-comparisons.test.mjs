import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Pair 27 — comparison as a learning exercise: curated presets inside the
 * existing Compare view, checked against live profile data, offered first
 * on an empty Compare page and linked from lessons, flavour paths and
 * profiles. The free comparison stays fully available.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");
const rawFiles = {};
for (const f of ["profiles", "bottles", "sources", "plants", "processes", "glossary", "content-es", "traditions", "chapters", "regions"]) {
  rawFiles[`${f}.json`] = await read(`assets/data/${f}.json`);
}
const { profiles } = JSON.parse(rawFiles["profiles.json"]);
const { bottles } = JSON.parse(rawFiles["bottles.json"]);
const { sources } = JSON.parse(rawFiles["sources.json"]);
const { plants } = JSON.parse(rawFiles["plants.json"]);
const { chapters } = JSON.parse(rawFiles["chapters.json"]);
const contentEs = JSON.parse(rawFiles["content-es.json"]);
const byId = new Map(profiles.map((p) => [p.id, p]));

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/guide/", pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, Node: dom.window.Node,
  localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage });
const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const es = createLocale();
es.set("es");
localStorage.clear();
const en = createLocale();
en.set("en");

const { PRESETS, PRESET_FOR_FLAVOUR, checkPreset, presetById, presetForProfile } = await import("../assets/js/compare-presets.js");
const { renderCompare } = await import("../assets/js/compare-view.js");
const { parseHash, buildHash } = await import("../assets/js/router.js");

function compare(compareIds, { locale = en, preset = null, from = null } = {}) {
  const box = document.createElement("div");
  renderCompare(box, { profiles, plants, compareIds, locale, preset, from, onSelectionChange: () => {} });
  return box;
}

// ---------------------------------------------------------------- the data

test("pair 27: the presets cover the planned comparisons and all hold against the data", () => {
  assert.deepEqual(PRESETS.map((p) => p.ids), [
    ["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"],
    ["tequila-blanco-valley-jalisco", "tequila-blanco-highland-jalisco"],
    ["tequila-blanco-valley-jalisco", "mezcal-espadin-valles-centrales"],
    ["mezcal-espadin-valles-centrales", "mezcal-tobala-sierra-oaxaca"],
    ["bacanora-pacifica-sierra-sonora", "raicilla-maximiliana-sierra-jalisco"],
  ]);
  for (const preset of PRESETS) {
    assert.deepEqual(checkPreset(preset, byId), [], `${preset.id} holds`);
    assert.ok(preset.focus.length >= 2 && preset.focus.length <= 3, `${preset.id} points to two or three dimensions`);
  }
});

test("pair 27: a profile change that contradicts a preset is caught, and unknown is never read as none", () => {
  const wood = presetById("wood");
  const edited = new Map(byId);
  const reposado = structuredClone(byId.get("tequila-reposado-valley-jalisco"));
  reposado.sensory.oak = "none";
  edited.set(reposado.id, reposado);
  assert.ok(checkPreset(wood, edited).some((p) => /expected oak to rise/.test(p)), "a contradicted direction is reported");
  const unknown = structuredClone(byId.get("tequila-reposado-valley-jalisco"));
  unknown.sensory.oak = null;
  edited.set(unknown.id, unknown);
  assert.ok(checkPreset(wood, edited).some((p) => /not documented/.test(p)), "an undocumented level is reported, not treated as none");
});

test("pair 27: the validator runs the preset check", async () => {
  const validator = await read("scripts/validate.mjs");
  assert.ok(/compare-presets\.js/.test(validator) && /checkPreset/.test(validator));
});

test("pair 27: preset routes parse and build alongside a lesson origin", () => {
  assert.deepEqual(parseHash("#/compare/a,b?preset=wood&from=start%3Afirst-comparison"),
    { name: "compare", params: { compareIds: "a,b", from: "start:first-comparison", preset: "wood" } });
  assert.equal(buildHash({ name: "compare", params: { compareIds: "a,b", preset: "wood" } }), "#/compare/a,b?preset=wood");
  assert.equal(buildHash({ name: "compare", params: { compareIds: "a,b", from: "start:x" } }), "#/compare/a,b?from=start%3Ax");
});

// ----------------------------------------------------------- empty Compare

test("pair 27: an empty Compare page offers the guided comparisons and the instruction before the picker", () => {
  for (const locale of [en, es]) {
    const box = compare("", { locale });
    const presets = box.querySelector(".compare-presets-top");
    const instruction = box.querySelector(".compare-instruction");
    const picker = box.querySelector(".compare-picker");
    assert.ok(presets && instruction && picker, `${locale.get()}: all three render`);
    const order = (a, b) => a.compareDocumentPosition(b) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING;
    assert.ok(order(presets, instruction) && order(instruction, picker), `${locale.get()}: presets → instruction → picker`);
    assert.equal(instruction.textContent, locale === es ? "Elige al menos dos perfiles para comparar." : "Pick at least two profiles to compare.");
    const links = [...presets.querySelectorAll("a.discovery-card")];
    assert.equal(links.length, PRESETS.length, `${locale.get()}: every preset is offered`);
    for (const [i, a] of links.entries()) {
      assert.equal(parseHash(a.getAttribute("href")).params.preset, PRESETS[i].id);
      assert.ok(a.textContent.includes(PRESETS[i].title[locale.get()]), `${locale.get()}: localized title`);
    }
  }
  const one = compare("tequila-blanco-valley-jalisco");
  assert.equal(one.querySelector(".compare-instruction").textContent, "One more pick starts the comparison.");
});

// ------------------------------------------------------------ active preset

test("pair 27: an active preset asks its question, hides the answer, then names what it shows and what it can't", () => {
  const box = compare("tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco", { preset: "wood" });
  const panel = box.querySelector(".compare-preset");
  assert.ok(panel, "the guided panel renders");
  assert.equal(panel.querySelector("h2").textContent, presetById("wood").question.en);
  assert.ok(/Oak, Perceived sweetness, Body/.test(panel.querySelector(".compare-preset-focus").textContent), "names the dimensions to look at");
  const answer = panel.querySelector("details.compare-preset-answer");
  assert.equal(answer.open, false, "the answer starts hidden");
  const rows = Object.fromEntries([...answer.querySelectorAll("dt")].map((dt) => [dt.textContent, dt.nextElementSibling.textContent]));
  assert.ok(/: None · .*: Medium/.test(rows.Oak), `oak levels come from the data: ${rows.Oak}`);
  assert.ok(/: Light · .*: Medium/.test(rows.Body), `body reads Light/Medium: ${rows.Body}`);
  assert.ok(answer.textContent.includes(presetById("wood").shows.en));
  assert.ok(answer.textContent.includes("What this doesn't show") && answer.textContent.includes(presetById("wood").limits.en));
  const next = panel.querySelector(".compare-preset-next a");
  assert.equal(parseHash(next.getAttribute("href")).params.preset, "region", "a logical next exercise");
  // Teach first: the free picker moves into the secondary control below.
  assert.ok(box.querySelector("details.compare-change-styles .compare-picker"), "the picker stays available below");
  assert.ok(box.querySelector(".compare-table"), "the full table still renders");
  assert.equal(box.querySelector(".compare-presets"), null, "no preset list competes with the active exercise");
});

test("pair 27: the last preset hands over to the free picker, and Spanish renders throughout", () => {
  const last = PRESETS.at(-1);
  const box = compare(last.ids.join(","), { preset: last.id, locale: es });
  const panel = box.querySelector(".compare-preset");
  assert.equal(panel.querySelector(".compare-preset-next a").getAttribute("href"), "#/compare");
  assert.ok(panel.textContent.includes(last.question.es) && panel.textContent.includes(last.limits.es));
  assert.ok(panel.textContent.includes("Lo que esto no muestra"));
  assert.ok(!/What this|Look at|Next exercise/.test(panel.textContent), "no English in the Spanish panel");
});

test("pair 27: a preset whose pair no longer matches the selection falls back to the free comparison", () => {
  const box = compare("tequila-blanco-valley-jalisco,mezcal-tobala-sierra-oaxaca", { preset: "wood" });
  assert.equal(box.querySelector(".compare-preset"), null, "no mismatched exercise");
  assert.ok(box.querySelector(".compare-table"), "the free comparison renders");
  assert.ok(box.querySelector(".compare-presets-after"), "guided comparisons are offered after the results");
  assert.ok(!box.querySelector("details.compare-change-styles"), "the picker is not tucked away in free mode");
});

test("pair 27: the comparison table and summaries show body as Light / Medium / Full", () => {
  const box = compare("tequila-blanco-valley-jalisco,tequila-anejo-valley-jalisco");
  const bodyRow = [...box.querySelectorAll(".compare-table tbody tr")].find((r) => r.querySelector("th").textContent === "Body");
  assert.deepEqual([...bodyRow.querySelectorAll("td")].map((td) => td.textContent), ["Light", "Full"]);
  assert.ok(!/Body \([^)]*Low/.test(box.textContent), "no Low/High wording for body in the summary");
});

// ---------------------------------------------------------------- cross-links

test("pair 27: lessons, flavour paths and profiles lead into the matching preset", async () => {
  const { renderLesson } = await import("../assets/js/journey.js");
  const lesson = document.createElement("div");
  renderLesson(lesson, { lessonId: "first-comparison", profiles, chapters, locale: en });
  const main = parseHash(lesson.querySelector(".journey-comparison a.cta-link").getAttribute("href"));
  assert.equal(main.params.preset, "wood");
  assert.equal(main.params.from, "start:first-comparison", "the lesson return context is kept");
  const second = parseHash(lesson.querySelector(".journey-comparison a.quiet-link").getAttribute("href"));
  assert.equal(second.params.preset, "region");

  const fromLesson = compare(main.params.compareIds, { preset: "wood", from: main.params.from });
  assert.equal(fromLesson.querySelector(".back-link").getAttribute("href"), "#/start/first-comparison");
  assert.equal(parseHash(fromLesson.querySelector(".compare-preset-next a").getAttribute("href")).params.from,
    "start:first-comparison", "the next exercise keeps the way back to the lesson");

  const { renderDiscover } = await import("../assets/js/discovery-view.js");
  const { regions } = JSON.parse(rawFiles["regions.json"]);
  const { traditions } = JSON.parse(rawFiles["traditions.json"]);
  for (const [flavour, presetId] of Object.entries(PRESET_FOR_FLAVOUR)) {
    const box = document.createElement("div");
    renderDiscover(box, { kind: "flavour", id: flavour, plants, regions, traditions, profiles, bottles, locale: en });
    const link = box.querySelector(".discover-guided-compare a");
    assert.equal(parseHash(link.getAttribute("href")).params.preset, presetId, `${flavour} → ${presetId}`);
  }

  const { renderProfile } = await import("../assets/js/profile.js");
  const render = (id) => {
    const p = byId.get(id);
    const box = document.createElement("div");
    renderProfile(box, { profile: p, bottle: bottles.find((b) => b.id === p.exampleBottleId), sources, allProfiles: profiles, allBottles: bottles, locale: en });
    return box;
  };
  const tobala = render("mezcal-tobala-sierra-oaxaca").querySelector("a.profile-guided-compare");
  assert.equal(parseHash(tobala.getAttribute("href")).params.preset, presetForProfile("mezcal-tobala-sierra-oaxaca").id);
  assert.equal(render("sotol-chihuahua").querySelector("a.profile-guided-compare"), null, "no link where no preset exists");
});

// ---------------------------------------------------------------- real boot

test("pair 27: a guided comparison boots from a direct link and keeps the free picker working", async () => {
  const appDom = new JSDOM(`<!doctype html><html><body><div id="app"></div></body></html>`, {
    url: "https://example.test/RagdollLabs-agave-guide/#/compare/tequila-blanco-valley-jalisco,tequila-blanco-highland-jalisco?preset=region",
    pretendToBeVisual: true,
  });
  appDom.window.HTMLElement.prototype.scrollIntoView = function () {};
  const prev = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch,
    localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  Object.assign(globalThis, { window: appDom.window, document: appDom.window.document,
    localStorage: appDom.window.localStorage, sessionStorage: appDom.window.sessionStorage });
  globalThis.fetch = async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel in rawFiles) return { ok: true, json: async () => JSON.parse(rawFiles[rel]), text: async () => rawFiles[rel] };
    return { ok: false, status: 404 };
  };
  try {
    await import("../assets/js/app.js?pair27=1");
    await new Promise((r) => setTimeout(r, 80));
    const doc = appDom.window.document;
    assert.ok(doc.querySelector(".compare-preset"), "the region exercise renders on boot");
    assert.equal(doc.title, "Compare styles · Agave Guide");
    // Adding a third style leaves the exercise for a free comparison.
    const pickButton = doc.querySelector('details.compare-change-styles .compare-pick-button[data-profile-id="mezcal-espadin-valles-centrales"]');
    pickButton.click();
    await new Promise((r) => setTimeout(r, 80));
    assert.ok(!appDom.window.location.hash.includes("preset="), "the preset is dropped once the reader changes the pair");
    assert.equal(doc.querySelector(".compare-preset"), null);
    assert.equal(doc.querySelectorAll(".compare-table thead th").length, 4, "three styles compared freely");
  } finally {
    Object.assign(globalThis, prev);
    setContentEs(contentEs);
  }
});
