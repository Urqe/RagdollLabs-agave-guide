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
const { regions } = JSON.parse(await read("assets/data/regions.json"));
const { traditions } = JSON.parse(await read("assets/data/traditions.json"));
const { plants } = JSON.parse(await read("assets/data/plants.json"));
const contentEs = JSON.parse(await read("assets/data/content-es.json"));

const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);

localStorage.clear();
const es = createLocale();
es.set("es");
localStorage.clear();
const en = createLocale();
en.set("en");

test("P18-1: the region bucket resolves Spanish region fields", async () => {
  const { fieldEs } = await import("../assets/js/editorial.js");
  const sonora = regions.find((r) => r.id === "sierra-sonora");
  assert.ok(sonora, "sierra-sonora region exists");
  const esName = fieldEs("region", sonora.id, "name", es);
  assert.ok(esName, "region name lookup returns a translation");
  assert.equal(esName, contentEs.regions["sierra-sonora"].name);
  assert.equal(fieldEs("region", sonora.id, "name", en), null,
    "English locale returns null so the English name renders");
});

test("P18-1: Sonora region page renders Spanish name, geography and distinctions", async () => {
  const { renderDiscover } = await import("../assets/js/discovery-view.js");
  const root = document.createElement("div");
  renderDiscover(root, { kind: "region", id: "sierra-sonora", plants, regions, traditions, profiles, bottles, locale: es });
  const entry = contentEs.regions["sierra-sonora"];
  assert.equal(root.querySelector("#discover-heading").textContent, entry.name,
    "region heading is the Spanish name");
  const text = root.textContent;
  assert.ok(text.includes(entry.geography), "geography renders in Spanish");
  assert.ok(text.includes(entry.distinctions), "distinctions render in Spanish");
  assert.ok(!text.includes("Mountain municipalities (Aconchi"),
    "English geography no longer leaks on the Spanish region page");
});

test("P18-1: every region renders its Spanish name on the region page", async () => {
  const { renderDiscover } = await import("../assets/js/discovery-view.js");
  for (const region of regions) {
    const root = document.createElement("div");
    renderDiscover(root, { kind: "region", id: region.id, plants, regions, traditions, profiles, bottles, locale: es });
    const entry = contentEs.regions[region.id];
    assert.ok(entry, `ES entry exists for region ${region.id}`);
    assert.equal(root.querySelector("#discover-heading").textContent, entry.name,
      `${region.id} heading is Spanish`);
    assert.ok(root.textContent.includes(entry.geography), `${region.id} geography is Spanish`);
    assert.ok(root.textContent.includes(entry.distinctions), `${region.id} distinctions is Spanish`);
  }
});

test("P18-1: tradition history and authored sections render in Spanish", async () => {
  const { renderTraditionPage } = await import("../assets/js/plant-tradition-view.js");
  const tradition = traditions.find((t) => t.id === "bacanora");
  const root = document.createElement("div");
  renderTraditionPage(root, { tradition, traditions, regions, plants, profiles, bottles, sources: sourceList, locale: es });
  const text = root.textContent;
  const entry = contentEs.traditions["bacanora"];
  assert.ok(text.includes(entry.history), "tradition history is Spanish");
  assert.ok(text.includes(entry.origin), "tradition origin is Spanish");
  assert.ok(text.includes(entry.legalStatus), "tradition legal status is Spanish");
  assert.ok(text.includes(entry.materials), "tradition materials is Spanish");
  assert.ok(text.includes(entry.practices), "tradition practices is Spanish");
  assert.ok(text.includes(entry.diversity), "tradition diversity is Spanish");
  assert.ok(!text.includes("Long a regional practice"),
    "English tradition history no longer leaks on the Spanish tradition page");
});

test("P18-1: every tradition carries Spanish coverage for its authored fields", async () => {
  const { renderTraditionPage } = await import("../assets/js/plant-tradition-view.js");
  for (const tradition of traditions) {
    const entry = contentEs.traditions[tradition.id];
    assert.ok(entry, `ES entry exists for tradition ${tradition.id}`);
    for (const field of ["name", "origin", "history", "legalStatus", "materials", "practices", "diversity"]) {
      assert.ok(typeof entry[field] === "string" && entry[field].length > 0,
        `${tradition.id}.${field} has Spanish content`);
    }
    if (tradition.sustainability) {
      assert.ok(entry.sustainability, `${tradition.id}.sustainability has Spanish content`);
    }
    const root = document.createElement("div");
    renderTraditionPage(root, { tradition, traditions, regions, plants, profiles, bottles, sources: sourceList, locale: es });
    for (const field of ["origin", "history", "legalStatus", "materials", "practices", "diversity"]) {
      assert.ok(root.textContent.includes(entry[field]),
        `${tradition.id} page renders the Spanish ${field}`);
    }
  }
});

test("P18-1: discovery cards localize taste notes and spirit-page facts", async () => {
  const { renderDiscover } = await import("../assets/js/discovery-view.js");
  const root = document.createElement("div");
  renderDiscover(root, { kind: "spirit", id: "bacanora", plants, regions, traditions, profiles, bottles, locale: es });
  const text = root.textContent;
  const entry = contentEs.traditions["bacanora"];
  assert.equal(root.querySelector("#discover-heading").textContent, entry.name, "spirit page heading is Spanish");
  assert.ok(text.includes(entry.origin), "spirit origin is Spanish");
  assert.ok(text.includes(entry.history), "spirit history is Spanish");
  const cardNotes = [...root.querySelectorAll(".discovery-notes")];
  for (const notes of cardNotes) {
    assert.ok(!/\bcooked agave\b|\bblack pepper\b|\bfresh herbs\b/.test(notes.textContent),
      "discovery card taste notes are not raw English");
  }
});

test("P18-1: comparison plant context and remove-control names are Spanish", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const pair = ["tequila-blanco-valley-jalisco", "tequila-blanco-highland-jalisco"];
  const root = document.createElement("div");
  renderCompare(root, { profiles, compareIds: pair.join(","), locale: es });
  const text = root.textContent;
  const valleyEs = contentEs.profiles[pair[0]];
  assert.ok(valleyEs.plant && text.includes(valleyEs.plant),
    "plant context under comparison renders the Spanish plant field");
  assert.ok(!/Blue weber agave|Weber blue agave/.test(text),
    "English plant prose does not leak into the Spanish comparison");
  const removeButtons = [...root.querySelectorAll(".selection-remove, .compare-remove-button")];
  assert.ok(removeButtons.length >= 2, "remove controls are present");
  for (const button of removeButtons) {
    const label = button.getAttribute("aria-label");
    assert.ok(label && !/Valley (blanco )?style|Highland blanco style/.test(label),
      `remove-control accessible name is Spanish: ${label}`);
  }
});

test("P18-1: catalogue descriptive producer prose is Spanish (Clande example)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const clande = bottles.find((b) => b.id === "clande-sotol-yellow");
  const root = document.createElement("div");
  root.appendChild(bottleEntry(clande, { sources: sourceList, profiles, locale: es }));
  const text = root.textContent;
  assert.ok(text.includes("más de 40 años de oficio"),
    "producer experience clause renders in Spanish");
  assert.ok(!text.includes("40+ years' experience"),
    "English producer experience clause no longer leaks in the catalogue");
  assert.ok(text.includes("vinatas clandestinas"), "place/maker context is Spanish");
});

test("P18-1: every profile taste note has a Spanish label available", async () => {
  const { ES_NOTES } = await import("../assets/js/taste-notes.js");
  const missing = new Set();
  for (const profile of profiles) {
    for (const note of profile.tasteNotes || []) {
      if (!ES_NOTES[note]) missing.add(note);
    }
  }
  assert.deepEqual([...missing], [],
    "no profile taste note lacks a Spanish display label");
});

test("P18-1: plant uncertainty notes render in Spanish on the plant page", async () => {
  const { renderPlantPage } = await import("../assets/js/plant-tradition-view.js");
  const plant = plants.find((p) => p.id === "agave-angustifolia");
  const root = document.createElement("div");
  renderPlantPage(root, { plant, plants, regions, traditions, profiles, sources: sourceList, locale: es });
  const text = root.textContent;
  assert.ok(text.includes(contentEs.plants["agave-angustifolia"].uncertainty),
    "plant uncertainty renders in Spanish");
  assert.ok(!text.includes("is debated; the app preserves the regional names"),
    "English plant uncertainty no longer leaks");
});
