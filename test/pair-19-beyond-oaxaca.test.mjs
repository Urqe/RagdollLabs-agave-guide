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
const { plants } = JSON.parse(await read("assets/data/plants.json"));
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

const NEW = ["mezcal-papalote-montana-guerrero", "mezcal-cenizo-sierra-durango", "mezcal-verde-altiplano-slp"];
const NEW_BOTTLES = ["legendario-domingo-cupreata", "lamata-cenizo-durango", "leyendas-san-luis-potosi"];
const profileById = new Map(profiles.map((p) => [p.id, p]));
const bottleById = new Map(bottles.map((b) => [b.id, b]));

test("pair 19: three bounded profiles ship, each with one expression-matched example", () => {
  for (const id of NEW) {
    const p = profileById.get(id);
    assert.ok(p, `${id} exists`);
    const example = bottleById.get(p.exampleBottleId);
    assert.ok(example, `${id} has an example bottle`);
    assert.equal(example.profileId, id, `${id}'s example maps back to it`);
    const mapped = bottles.filter((b) => b.profileId === id);
    assert.equal(mapped.length, 1, `${id} has exactly one example (bounded)`);
    assert.equal(p.traditionId, example.traditionId, "traditions agree");
  }
  assert.equal(profiles.length, 21);
  assert.equal(bottles.length, 49);
});

test("pair 19: local plant names stay regional, never promoted to spirit families", () => {
  const papalote = profileById.get("mezcal-papalote-montana-guerrero");
  assert.equal(papalote.spirit, "mezcal");
  assert.ok(/papalote.*cupreata-lineage|regional name/i.test(papalote.category),
    "the category states papalote is a regional plant name, not a legal class");
  const cenizo = profileById.get("mezcal-cenizo-sierra-durango");
  assert.ok(/cenizo is the regional name/i.test(cenizo.category), "cenizo stated as a regional name");
  const verde = profileById.get("mezcal-verde-altiplano-slp");
  assert.ok(/maguey verde is the regional salmiana name/i.test(verde.category),
    "maguey verde stated as a regional name");
  // No single taste imposed on a state: each profile qualifies its tendencies.
  for (const id of NEW) {
    assert.ok(/tendency|tends|tend to|tendenc|often|varies|genuinely/i.test(profileById.get(id).description),
      `${id} describes tendencies, not a state-wide rule`);
  }
});

test("pair 19: the salmiana plant page now covers both its traditions without conflating them", () => {
  const salmiana = plants.find((p) => p.id === "agave-salmiana");
  assert.ok(salmiana.traditionIds.includes("destilado-de-pulque"), "pulque tradition kept");
  assert.ok(salmiana.traditionIds.includes("mezcal"), "mezcal tradition added");
  const verde = profileById.get("mezcal-verde-altiplano-slp");
  assert.ok(/different tradition from the destilado de pulque|cooks the pi\u00f1a mezcal-style rather than tapping sap/i.test(verde.context),
    "the SLP profile distinguishes cooked-pi\u00f1a salmiana from sap traditions");
});

test("pair 19: profiles render end to end in EN and ES with no untranslated disclosures", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  for (const locale of [en, es]) {
    for (const id of NEW) {
      const p = profileById.get(id);
      const ex = bottleById.get(p.exampleBottleId);
      const root = document.createElement("div");
      renderProfile(root, { profile: p, bottle: ex, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale });
      assert.equal(root.querySelectorAll(".untranslated-field").length, 0,
        `${id} fully translated in ${locale.get()}`);
      const expectedTitle = locale.get() === "es" ? contentEs.profiles[id].title : p.title;
      assert.equal(root.querySelector("#profile-title").textContent, expectedTitle);
      assert.ok(root.querySelector(".pairing-notice"), `${id} notice line renders in ${locale.get()}`);
      const expectedServing = locale.get() === "es"
        ? contentEs.profiles[id].pairing.serving
        : p.pairing.serving;
      assert.ok(root.querySelector(".profile-pairing").textContent.includes(expectedServing.slice(0, 40)));
    }
  }
});

test("pair 19: region pages, catalogue entries and the tasting basis render for the new states", async () => {
  const { renderDiscover } = await import("../assets/js/discovery-view.js");
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const { traditions } = JSON.parse(await read("assets/data/traditions.json"));
  for (const id of NEW) {
    const p = profileById.get(id);
    const region = regions.find((r) => r.id === p.regionIds[0]);
    const root = document.createElement("div");
    renderDiscover(root, { kind: "region", id: region.id, plants, regions, traditions, profiles, bottles, locale: es });
    assert.equal(root.querySelector("#discover-heading").textContent, contentEs.regions[region.id].name,
      `${region.id} heading in Spanish`);
    assert.ok(root.textContent.includes(contentEs.regions[region.id].geography.slice(0, 40)),
      `${region.id} geography in Spanish`);
    assert.ok(/not a legal boundary|no un l\u00edmite legal/i.test(root.textContent),
      `${region.id} states app coverage is not a legal boundary`);
    const ex = bottleById.get(p.exampleBottleId);
    const entry = bottleEntry(ex, { sources: sourceList, profiles, locale: en });
    assert.ok(/Character notes from one independent review/.test(entry.querySelector(".bottle-basis").textContent),
      `${ex.id} carries the honest tasting basis`);
    assert.ok(entry.querySelector(".catalogue-profile-link"), "the entry links to its profile");
  }
});

test("pair 19: search findability for the new regional names", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const queries = ["papalote", "papalometl", "cenizo", "durangensis", "maguey verde", "mezcal potosino", "Apango", "El Mezquital", "Santa Isabel"];
  for (const q of queries) {
    const hits = searchProfiles({ profiles, bottles, query: q });
    assert.ok(hits.length > 0, `query "${q}" finds at least one profile`);
  }
});

test("pair 19: the new sources follow the evidence contract (tasting vs identity)", () => {
  for (const id of NEW_BOTTLES) {
    const b = bottleById.get(id);
    assert.ok(b.tastingSourceIds.length === 1, `${id}: exactly one expression-matched review`);
    const tasting = sourceList.find((s) => s.id === b.tastingSourceIds[0]);
    assert.equal(tasting.kind, "review", `${id}: the tasting source is a review`);
    assert.ok(b.sourceIds.includes(tasting.id), `${id}: the review is also on the record`);
  }
});

test("pair 19: the honest-disputed SLP cooking method is recorded, not settled", () => {
  const b = bottleById.get("leyendas-san-luis-potosi");
  assert.ok(/disputed/i.test(b.batch), "the bottle record states the dispute");
  const p = profileById.get("mezcal-verde-altiplano-slp");
  assert.ok(/disputed|disputa/i.test(p.context), "the profile context states the dispute");
  const esContext = contentEs.profiles["mezcal-verde-altiplano-slp"].context;
  assert.ok(esContext.includes("en disputa"), "the ES mirror states the dispute");
  // The smoke claim stays tied to the reviews, not to the disputed oven type.
  assert.ok(/per the cited reviews/i.test(p.smoke), "smoke stays review-anchored");
});

test("pair 19: ES mirrors are complete for every authored field of the new content", () => {
  const profileFields = ["title","context","description","beginnerNote","category","plant","process","smoke","finish","whyItTastes"];
  for (const id of NEW) {
    const entry = contentEs.profiles[id];
    assert.ok(entry, `ES entry for ${id}`);
    for (const f of profileFields) {
      assert.ok(typeof entry[f] === "string" && entry[f].length > 0, `${id}.${f} ES present`);
    }
    assert.ok(entry.pairing && entry.pairing.serving && entry.pairing.notice, `${id} pairing ES present`);
  }
  for (const id of NEW_BOTTLES) {
    const entry = contentEs.bottles[id];
    assert.ok(entry && entry.reviewSummary && entry.producer && entry.place && entry.batch, `${id} ES bottle fields present`);
  }
  for (const rid of ["montana-guerrero", "sierra-el-mezquital-dgo", "altiplano-potosino"]) {
    const entry = contentEs.regions[rid];
    assert.ok(entry && entry.name && entry.geography && entry.distinctions, `${rid} ES region fields present`);
  }
  assert.ok(contentEs.plants["agave-cupreata"] && contentEs.plants["agave-cupreata"].uncertainty,
    "cupreata ES plant entry present with its regional-name uncertainty");
  assert.ok(contentEs.plants["agave-durangensis"] && contentEs.plants["agave-durangensis"].cultivation,
    "durangensis ES plant entry present");
});
