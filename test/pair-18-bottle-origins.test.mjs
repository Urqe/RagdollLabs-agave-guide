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

const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const en = createLocale();
en.set("en");
localStorage.clear();
const es = createLocale();
es.set("es");

const bottleById = new Map(bottles.map((b) => [b.id, b]));
const profileById = new Map(profiles.map((p) => [p.id, p]));

test("P18-3: Montelobos tobalá carries its expression-specific Puebla origin", async () => {
  const montelobos = bottleById.get("montelobos-tobala");
  assert.ok(montelobos.place.includes("Puebla"), "origin names Puebla");
  assert.ok(montelobos.producer.includes("Palenque del Tentzo"), "producer names the actual palenque");
  assert.ok(!/Matatlán|Oaxaca/.test(montelobos.place), "the wrong Santiago Matatlán, Oaxaca place is gone");
  assert.equal(montelobos.profileId, null, "no representative mapping to the wild-Sierra profile");
  assert.ok((montelobos.coverage || []).includes("profile-not-covered"), "uncovered via the established mechanism");
  assert.equal(montelobos.noteProfileId, "mezcal-tobala-sierra-oaxaca", "contextual note targets the tobalá profile");
});

test("P18-3: Del Maguey pechuga carries its Santa Catarina Minas origin", async () => {
  const pechuga = bottleById.get("del-maguey-pechuga");
  assert.equal(pechuga.place, "Santa Catarina Minas, Oaxaca");
  assert.ok(!/Real del Peñón/.test(pechuga.place + pechuga.producer), "the wrong Minas de Real del Peñón place is gone");
  assert.equal(pechuga.profileId, null, "no representative mapping to the plain joven espadín profile");
  assert.ok((pechuga.coverage || []).includes("profile-not-covered"));
  assert.equal(pechuga.noteProfileId, "mezcal-espadin-valles-centrales", "contextual note targets the espadín profile");
});

test("P18-3: the wild tobalá profile exemplifies a genuinely wild bottle", async () => {
  const tobalá = profileById.get("mezcal-tobala-sierra-oaxaca");
  const example = bottleById.get(tobalá.exampleBottleId);
  assert.equal(example.id, "macurichos-ancestral-tobala");
  assert.ok(/wild|silvestre/i.test(JSON.stringify(example.batch)), "the example is a wild-harvest bottle");
  assert.ok(example.place.includes("Santiago Matatlán"), "produced in the Sierra community");
  assert.equal(example.profileId, tobalá.id, "the example maps to its profile");
  assert.ok(!tobalá.description.includes("100% cultivated tobalá"),
    "the profile description no longer describes the cultivated Puebla bottle");
  assert.ok(tobalá.description.includes("wild-harvested tobalá"),
    "the description matches the new example");
  assert.ok(tobalá.placeCoords.precision.includes("produced in Santiago Matatlán"),
    "the coords precision no longer claims the example is cultivated in Santiago Matatlán");
});

test("P18-3: cultivated Puebla tobalá vs wild Oaxaca tobalá stay distinct", async () => {
  const montelobos = bottleById.get("montelobos-tobala");
  const macurichos = bottleById.get("macurichos-ancestral-tobala");
  assert.equal(montelobos.profileId, null);
  assert.equal(macurichos.profileId, "mezcal-tobala-sierra-oaxaca");
  assert.notEqual(montelobos.place, macurichos.place, "the two bottles never share an origin");
  assert.ok(montelobos.editorialNote && /Puebla/.test(montelobos.editorialNote),
    "the contextual note explains the regional difference");
});

test("P18-3: pechuga vs plain joven espadín stay distinct", async () => {
  const pechuga = bottleById.get("del-maguey-pechuga");
  const espadinProfile = profileById.get("mezcal-espadin-valles-centrales");
  const espadinExample = bottleById.get(espadinProfile.exampleBottleId);
  assert.equal(pechuga.profileId, null);
  assert.equal(espadinExample.profileId, espadinProfile.id, "the plain joven example keeps its mapping");
  assert.notEqual(pechuga.id, espadinExample.id);
  assert.ok(pechuga.editorialNote && /festival-production style/.test(pechuga.editorialNote),
    "the contextual note explains the production-style difference");
});

test("P18-3: catalogue renders the corrected origins and contextual notes (EN/ES)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  for (const locale of [en, es]) {
    for (const id of ["montelobos-tobala", "del-maguey-pechuga"]) {
      const bottle = bottleById.get(id);
      const entry = bottleEntry(bottle, { sources: sourceList, profiles, locale });
      const text = entry.textContent;
      assert.ok(!entry.querySelector(".catalogue-profile-link"), `${id} gets no profile link in ${locale.get()}`);
      assert.ok(/How it relates|Cómo se relaciona/.test(text), `${id} uses the contextual prefix`);
      const esPlace = contentEs.bottles[id].place;
      const shownPlace = locale.get() === "es" ? esPlace : bottle.place;
      assert.ok(text.includes(shownPlace), `${id} shows the localized corrected place`);
    }
  }
});

test("P18-3: the tobalá profile renders the wild example end to end", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const tobalá = profileById.get("mezcal-tobala-sierra-oaxaca");
  const example = bottleById.get(tobalá.exampleBottleId);
  const root = document.createElement("div");
  renderProfile(root, { profile: tobalá, bottle: example, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: en });
  const cardText = root.querySelector(".bottle-card").textContent;
  assert.ok(cardText.includes("Macurichos"), "the example card names Macurichos");
  assert.ok(!cardText.includes("Montelobos"), "the cultivated Puebla bottle is not the example");
  assert.ok(cardText.includes("Santiago Matatlán"), "the card names the producing community");
});

test("P18-3: ES mirrors of the corrected fields are consistent", () => {
  const esMontelobos = contentEs.bottles["montelobos-tobala"];
  assert.ok(esMontelobos.place.includes("Puebla"), "ES place names Puebla");
  assert.ok(esMontelobos.producer.includes("Palenque del Tentzo"), "ES producer names the palenque");
  assert.ok(esMontelobos.editorialNote && esMontelobos.editorialNote.includes("Puebla"), "ES contextual note explains the region");
  const esPechuga = contentEs.bottles["del-maguey-pechuga"];
  assert.equal(esPechuga.place, "Santa Catarina Minas, Oaxaca");
  assert.ok(!/Real del Peñón/.test(esPechuga.place + esPechuga.producer), "ES drops the wrong place");
  const esTobala = contentEs.profiles["mezcal-tobala-sierra-oaxaca"];
  assert.ok(esTobala.description.includes("tobalá silvestre"), "ES profile description matches the wild example");
  assert.ok(!esTobala.description.includes("cultivado"), "ES description drops the cultivated example claim");
  const esPlant = contentEs.plants["agave-potatorum"];
  assert.ok(esPlant.cultivation.includes("Puebla"), "ES plant note anchors the cultivated example to Puebla");
});
