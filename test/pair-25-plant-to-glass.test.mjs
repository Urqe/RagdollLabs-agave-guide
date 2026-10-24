import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Pair 25 — production → sensory explanation. A plant-to-glass page that
 * walks the production steps, links each to possible effects and real
 * profiles, follows two contrasting routes with a predict-then-reveal
 * question, and keeps disputed process records visibly open.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");
const rawFiles = {};
for (const f of ["profiles", "bottles", "sources", "plants", "processes", "glossary", "content-es", "traditions", "chapters", "regions"]) {
  rawFiles[`${f}.json`] = await read(`assets/data/${f}.json`);
}
const { profiles } = JSON.parse(rawFiles["profiles.json"]);
const { processes } = JSON.parse(rawFiles["processes.json"]);
const { sources } = JSON.parse(rawFiles["sources.json"]);
const { bottles } = JSON.parse(rawFiles["bottles.json"]);
const { chapters } = JSON.parse(rawFiles["chapters.json"]);
const contentEs = JSON.parse(rawFiles["content-es.json"]);
const profileById = new Map(profiles.map((p) => [p.id, p]));

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

const { renderPlantToGlass, STAGES, ROUTES, OPEN_QUESTIONS } = await import("../assets/js/plant-to-glass.js");
const { parseHash, buildHash } = await import("../assets/js/router.js");

function page(locale, from = null) {
  const box = document.createElement("div");
  renderPlantToGlass(box, { processes, profiles, sources, locale, from });
  return box;
}

test("pair 25: the route parses and builds, with an optional return context", () => {
  assert.deepEqual(parseHash("#/plant-to-glass"), { name: "plantToGlass", params: {} });
  assert.deepEqual(parseHash("#/plant-to-glass?from=start%3Arecognise-the-notes"),
    { name: "plantToGlass", params: { from: "start:recognise-the-notes" } });
  assert.equal(buildHash({ name: "plantToGlass", params: {} }), "#/plant-to-glass");
  assert.equal(buildHash({ name: "plantToGlass", params: { from: "learn" } }), "#/plant-to-glass?from=learn");
});

test("pair 25: the steps run plant → cook → crush → ferment → still → rest → finish", () => {
  assert.deepEqual(STAGES.map((s) => s.id), ["plant", "cooking", "extraction", "fermentation", "distillation", "resting", "finishing"]);
  const box = page(en);
  const stages = [...box.querySelectorAll(".ptg-stage")];
  assert.equal(stages.length, 7, "seven stage cards");
  assert.equal(box.querySelectorAll(".ptg-overview li").length, 7, "a compact overview of the same sequence");
  const covered = new Set(STAGES.flatMap((s) => s.processIds));
  for (const proc of processes) assert.ok(covered.has(proc.id), `${proc.id} appears in a stage`);
  for (const proc of processes) {
    assert.ok(box.textContent.includes(proc.glassEffect), `${proc.id}: its possible effect is shown`);
  }
});

test("pair 25: the sap route and sotol's non-agave identity are taught", () => {
  const text = page(en).textContent;
  assert.ok(/never cook the piña/.test(text) && /sap collected from the living plant/.test(text), "sap-derived route");
  assert.ok(/Sotol isn't an agave/.test(text) && /Dasylirion/.test(text), "sotol is not an agave");
  const esText = page(es).textContent;
  assert.ok(/nunca cuecen la piña/.test(esText) && /Dasylirion/.test(esText));
});

test("pair 25: each stage's examples genuinely use that stage", () => {
  const toolWords = {
    extraction: /tahona|mill|mallet|axe|shredder|desgarradora/i,
  };
  for (const stage of STAGES) {
    for (const id of stage.examples) {
      const p = profileById.get(id);
      assert.ok(p, `${stage.id}: example ${id} exists`);
      if (stage.processIds.length && !toolWords[stage.id]) {
        assert.ok(stage.processIds.some((pid) => p.processIds.includes(pid)),
          `${stage.id}: ${id} lists one of ${stage.processIds.join(", ")}`);
      }
      if (toolWords[stage.id]) assert.ok(toolWords[stage.id].test(p.process), `${stage.id}: ${id}'s method names its crushing tool`);
    }
  }
  const sotol = STAGES.find((s) => s.id === "plant").examples.includes("sotol-chihuahua");
  assert.ok(sotol, "the plant stage shows sotol as the non-agave case");
});

test("pair 25: possible effects are labelled editorial and the detail sits behind a disclosure with sources", () => {
  const box = page(en);
  for (const stage of box.querySelectorAll(".ptg-stage")) {
    for (const eyebrow of stage.querySelectorAll(".ptg-effects .eyebrow")) {
      assert.ok(/editorial reading/.test(eyebrow.textContent), "each effect line is labelled as an editorial reading");
    }
  }
  const details = [...box.querySelectorAll(".ptg-stage details.ptg-details")];
  assert.equal(details.length, 6, "every stage with process records has a detail disclosure");
  for (const d of details) {
    assert.equal(d.open, false, "details start closed (progressive reveal)");
    const links = [...d.querySelectorAll("a.source-link")];
    assert.ok(links.length >= 1, "each disclosure lists attributed sources");
    for (const a of links) assert.ok(a.getAttribute("href").startsWith("https://"), "sources are https links");
  }
  const milling = processes.find((p) => p.id === "milling-extraction");
  assert.ok(milling.sourceIds.includes("diffords-tequila-made"), "the new milling record is sourced");
  const steam = processes.find((p) => p.id === "steam-cook");
  assert.ok(!/which is why|reads/.test(steam.explanation), "steam cooking no longer overstates its cause");
  const pit = processes.find((p) => p.id === "pit-roast");
  assert.ok(pit.sourceIds.includes("diffords-lost-explorer-palenque"), "the pit-roast smoke claim cites a source that makes it");
  const still = processes.find((p) => p.id === "distillation-methods");
  assert.ok(/heads and tails/.test(still.explanation) && /do not by themselves guarantee/.test(still.explanation),
    "cuts are taught without guaranteeing a flavour");
});

test("pair 25: two contrasting routes, built from profile data, with a prediction and its confounders", () => {
  for (const locale of [en, es]) {
    const box = page(locale);
    const routes = [...box.querySelectorAll(".ptg-route")];
    assert.equal(routes.length, ROUTES.length, `${locale.get()}: both routes render`);
    for (const [i, route] of ROUTES.entries()) {
      const block = routes[i];
      const columns = [...block.querySelectorAll(".ptg-route-column")];
      assert.equal(columns.length, 2, "two columns");
      route.ids.forEach((id, c) => {
        const p = profileById.get(id);
        assert.equal(columns[c].querySelectorAll(".ptg-route-steps li").length, p.processIds.length,
          `${id}: one route step per documented process`);
        const documented = locale === es ? contentEs.profiles[id].process : p.process;
        assert.ok(columns[c].textContent.includes(documented), `${id}: the profile's documented method is quoted`);
      });
      assert.ok(block.querySelector(".ptg-question").textContent.length > 20, "a question to predict first");
      const answer = block.querySelector("details.ptg-answer");
      assert.equal(answer.open, false, "the answer starts hidden");
      assert.ok(answer.querySelector("table.ptg-levels"), "levels are shown in a table");
      assert.ok(answer.querySelector(`a[href="#/compare/${route.ids.join(",")}"]`), "links to the side-by-side comparison");
    }
  }
  const box = page(en);
  const [cook, rest] = [...box.querySelectorAll(".ptg-route")];
  const cells = (block, label) => [...[...block.querySelectorAll("tbody tr")].find((r) => r.querySelector("th").textContent === label).querySelectorAll("td")].map((td) => td.textContent);
  assert.deepEqual(cells(cook, "Smoke"), ["None", "Medium"], "the steam/fire route reveals the smoke levels from data");
  assert.deepEqual(cells(rest, "Oak"), ["None", "High"], "the rest route reveals the oak levels from data");
  assert.deepEqual(cells(rest, "Body"), ["Light", "Full"], "body uses Light/Medium/Full");
  assert.ok(/isn't the only difference/.test(cook.textContent) && /blue agave and espadín/.test(cook.textContent),
    "the cook route names its confounders");
  assert.ok(/not one spirit before and after/.test(rest.textContent), "the rest route says it is not a controlled experiment");
});

test("pair 25: disputed and untested process links stay visibly open", () => {
  for (const locale of [en, es]) {
    const box = page(locale);
    const items = [...box.querySelectorAll(".ptg-open li")];
    assert.equal(items.length, OPEN_QUESTIONS.length, `${locale.get()}: every open question renders`);
    for (const [i, q] of OPEN_QUESTIONS.entries()) {
      assert.ok(items[i].querySelector(`a[href^="#/profile/${q.profileId}"]`), `${q.profileId} is linked`);
    }
  }
  const slp = profileById.get("mezcal-verde-altiplano-slp");
  assert.ok(/disputed/i.test(slp.context) && /disputed/.test(OPEN_QUESTIONS[0].text.en), "the SLP dispute matches its profile");
});

test("pair 25: the Spanish page shows Spanish process names and effects, with no English fallback", () => {
  const box = page(es);
  for (const proc of processes) {
    const esEntry = contentEs.processes[proc.id];
    assert.ok(box.textContent.includes(esEntry.name), `${proc.id}: Spanish name`);
    assert.ok(box.textContent.includes(esEntry.glassEffect), `${proc.id}: Spanish effect`);
    assert.ok(!box.textContent.includes(proc.glassEffect), `${proc.id}: no English effect`);
  }
  assert.equal(box.querySelector("h1").textContent, "De la planta a la copa");
});

test("pair 25: every entry point keeps its return context", async () => {
  // From the page back to its origin.
  assert.equal(page(en, "learn").querySelector(".back-link").getAttribute("href"), "#/learn/chapter-from-plant-to-glass");
  assert.equal(page(en, "start:recognise-the-notes").querySelector(".back-link").getAttribute("href"), "#/start/recognise-the-notes");
  assert.equal(page(en, "profile:mezcal-espadin-valles-centrales").querySelector(".back-link").getAttribute("href"),
    "#/profile/mezcal-espadin-valles-centrales");
  assert.equal(page(en).querySelector(".back-link"), null, "no back link without an origin");

  // Profiles opened from the page return to it.
  const { renderProfile } = await import("../assets/js/profile.js");
  const espadin = profileById.get("mezcal-espadin-valles-centrales");
  const prof = document.createElement("div");
  renderProfile(prof, { profile: espadin, bottle: bottles.find((b) => b.id === espadin.exampleBottleId), sources,
    origin: "page:plant-to-glass", allProfiles: profiles, allBottles: bottles, locale: en });
  assert.equal(prof.querySelector(".back-link").getAttribute("href"), "#/plant-to-glass");
  const craftLink = prof.querySelector("a.profile-plant-to-glass");
  assert.equal(decodeURIComponent(craftLink.getAttribute("href")), "#/plant-to-glass?from=profile:mezcal-espadin-valles-centrales",
    "each profile's method section links to the page");

  // Lesson 3 and the Learn production chapter link in.
  const { renderLesson } = await import("../assets/js/journey.js");
  const lesson = document.createElement("div");
  renderLesson(lesson, { lessonId: "recognise-the-notes", profiles, chapters, locale: en });
  assert.ok(lesson.querySelector('a[href="#/plant-to-glass?from=start%3Arecognise-the-notes"]'), "lesson 3 links in");
  const { renderLearn } = await import("../assets/js/learn-view.js");
  const learn = document.createElement("div");
  const { plants } = JSON.parse(rawFiles["plants.json"]);
  const { glossary } = JSON.parse(rawFiles["glossary.json"]);
  renderLearn(learn, { chapters, plants, processes, glossary, profiles, bottles, sources, locale: en });
  const chapter = learn.querySelector("#chapter-from-plant-to-glass").closest("article");
  assert.ok(chapter.querySelector('a[href="#/plant-to-glass?from=learn"]'), "the production chapter links in");
  // The page links back to the tasting exercises.
  const p = page(en);
  for (const href of ["#/start/how-to-taste", "#/start/recognise-the-notes", "#/learn/processes"]) {
    assert.ok(p.querySelector(`a[href="${href}"]`), `the page links to ${href}`);
  }
});

test("pair 25: Learn's process reference shows localized names and stages", async () => {
  const { renderLearn } = await import("../assets/js/learn-view.js");
  const { plants } = JSON.parse(rawFiles["plants.json"]);
  const { glossary } = JSON.parse(rawFiles["glossary.json"]);
  const learn = document.createElement("div");
  renderLearn(learn, { chapters, plants, processes, glossary, profiles, bottles, sources, locale: es });
  const heading = learn.querySelector("#process-milling-extraction");
  assert.equal(heading.textContent, "Molienda y extracción — extracción");
  assert.ok(!learn.textContent.includes("see process reference below"), "no hard-coded English chip label");
});

// ---------------------------------------------------------------- real boot

let bootCount = 0;
async function bootApp(startHash, localeCode) {
  const appDom = new JSDOM(`<!doctype html><html><body><nav aria-label="main"><a class="nav-link" data-view="learn" href="#/learn">Learn</a></nav><div id="app"></div></body></html>`, {
    url: `https://example.test/RagdollLabs-agave-guide/${startHash}`, pretendToBeVisual: true,
  });
  appDom.window.localStorage.setItem("agave-locale", localeCode);
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
  const cleanup = () => { Object.assign(globalThis, prev); setContentEs(contentEs); };
  try {
    await import(`../assets/js/app.js?pair25=${++bootCount}`);
    await new Promise((r) => setTimeout(r, 80));
    return { document: appDom.window.document, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}

test("pair 25: a direct link boots the page in both languages, under the Learn nav item", async () => {
  for (const localeCode of ["en", "es"]) {
    const app = await bootApp("#/plant-to-glass?from=learn", localeCode);
    try {
      const main = app.document.querySelector("main");
      assert.ok(main.querySelector(".plant-to-glass-view"), `${localeCode}: page renders`);
      assert.equal(main.querySelectorAll(".untranslated-field").length, 0, `${localeCode}: no English fallback`);
      assert.equal(app.document.querySelector('.nav-link[data-view="learn"]').getAttribute("aria-current"), "page",
        `${localeCode}: Learn is highlighted`);
    } finally {
      app.cleanup();
    }
  }
});

test("pair 25: narrow screens stack the route columns and keep tap targets", async () => {
  const css = await read("assets/css/styles.css");
  assert.ok(/@media \(max-width: 40rem\) \{\n  \.ptg-route-columns \{ grid-template-columns: 1fr; \}/.test(css), "route columns stack");
  assert.ok(/\.ptg-details summary \{[^}]*min-height: var\(--tap\)/.test(css), "disclosures keep the tap height");
});
