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
const { plants } = JSON.parse(await read("assets/data/plants.json"));
const { regions } = JSON.parse(await read("assets/data/regions.json"));
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

const NEW = ["mezcal-cupreata-rio-de-parras-michoacan", "mezcal-papalometl-mixteca-puebla"];
const NEW_BOTTLES = ["palalma-michoacan-cupreata", "zinacantan-papalometl"];
const profileById = new Map(profiles.map((p) => [p.id, p]));
const bottleById = new Map(bottles.map((b) => [b.id, b]));

test("pair 21: two bounded profiles ship, each with one expression-matched example", () => {
  for (const id of NEW) {
    const p = profileById.get(id);
    assert.ok(p, `${id} exists`);
    const example = bottleById.get(p.exampleBottleId);
    assert.ok(example, `${id} has an example bottle`);
    assert.equal(example.profileId, id, `${id}'s example maps back to it`);
    const mapped = bottles.filter((b) => b.profileId === id);
    assert.equal(mapped.length, 1, `${id} has exactly one example (bounded)`);
    assert.equal(p.traditionId, example.traditionId, "traditions agree");
    const region = regions.find((r) => r.id === p.regionIds[0]);
    assert.equal(region.stateId, p.stateId, `${id}'s region is in its state`);
  }
  assert.equal(profiles.length, 23);
  assert.equal(bottles.length, 51);
});

test("pair 21: local plant names stay regional and state-attached, never promoted to legal classes", () => {
  const mic = profileById.get("mezcal-cupreata-rio-de-parras-michoacan");
  assert.ok(/penca ancha.*regional name|regional name.*penca ancha/i.test(mic.category),
    "penca ancha stated as a regional plant name, not a legal class");
  assert.ok(mic.context.includes("penca ancha"), "the Michoacán name is taught in context");
  const pue = profileById.get("mezcal-papalometl-mixteca-puebla");
  assert.ok(/papalometl is a regional plant name|regional plant name/i.test(pue.category),
    "papalometl stated as a regional plant name, not a legal class");
  assert.ok(/potatorum/i.test(pue.category), "the documented species is stated for the example's case");
  // No single taste imposed on a state: both profiles qualify their tendencies.
  for (const id of NEW) {
    assert.ok(/tendency|tends|tend to|often|varies|genuinely/i.test(profileById.get(id).description),
      `${id} describes tendencies, not a state-wide rule`);
  }
});

test("pair 21: the Puebla papalometl is potatorum and does not duplicate the Montelobos record", () => {
  const pue = profileById.get("mezcal-papalometl-mixteca-puebla");
  assert.deepEqual(pue.plantIds, ["agave-potatorum"], "the Puebla profile uses potatorum");
  const ex = bottleById.get("zinacantan-papalometl");
  assert.equal(ex.brand, "Zinacantan", "the example is the documented Puebla papalometl");
  const montelobos = bottleById.get("montelobos-tobala");
  assert.notEqual(montelobos.profileId, "mezcal-papalometl-mixteca-puebla",
    "the tobalá Montelobos record is not duplicated into the papalometl profile");
  assert.equal(montelobos.profileId, null, "Montelobos keeps its honest unmapped state");
});

test("pair 21: the evidence contract holds — tasting sources are reviews, never identity", () => {
  for (const id of NEW_BOTTLES) {
    const b = bottleById.get(id);
    assert.equal(b.tastingSourceIds.length, 1, `${id}: exactly one expression-matched review`);
    const tasting = sourceList.find((s) => s.id === b.tastingSourceIds[0]);
    assert.equal(tasting.kind, "review", `${id}: the tasting source is a review`);
    assert.ok(b.sourceIds.includes(tasting.id), `${id}: the review is on the record`);
    for (const sid of b.sourceIds) {
      assert.ok(sourceList.some((s) => s.id === sid), `${id}: source ${sid} resolves`);
      const src = sourceList.find((s) => s.id === sid);
      if (src.kind === "producer") {
        assert.ok(!b.tastingSourceIds.includes(sid), `${id}: producer source ${sid} is not tasting evidence`);
      }
    }
  }
  for (const id of NEW) {
    for (const sid of profileById.get(id).sourceIds) {
      assert.ok(sourceList.some((s) => s.id === sid), `${id}: profile source ${sid} resolves`);
    }
  }
});

test("pair 21: profiles render end to end in EN and ES with serving advice and no untranslated disclosures", async () => {
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
      const serving = locale.get() === "es" ? contentEs.profiles[id].pairing.serving : p.pairing.serving;
      assert.ok(root.querySelector(".profile-pairing").textContent.includes(serving.slice(0, 40)));
      assert.ok(root.textContent.includes(ex.brand), `${id} example bottle appears in ${locale.get()}`);
    }
  }
});

test("pair 21: region pages render for Michoacán and Puebla in Spanish with honest distinctions", async () => {
  const { renderDiscover } = await import("../assets/js/discovery-view.js");
  const { traditions } = JSON.parse(await read("assets/data/traditions.json"));
  for (const id of NEW) {
    const p = profileById.get(id);
    const region = regions.find((r) => r.id === p.regionIds[0]);
    const root = document.createElement("div");
    renderDiscover(root, { kind: "region", id: region.id, plants, regions, traditions, profiles, bottles, locale: es });
    assert.equal(root.querySelector("#discover-heading").textContent, contentEs.regions[region.id].name,
      `${region.id} heading in Spanish`);
    assert.ok(/not a legal boundary|no un límite legal/i.test(root.textContent),
      `${region.id} states app coverage is not a legal boundary`);
  }
});

test("pair 21: search findability for the new regional names, accented and unaccented", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const queries = [
    ["penca ancha", "mezcal-cupreata-rio-de-parras-michoacan"],
    ["michoacano", "mezcal-cupreata-rio-de-parras-michoacan"],
    ["Rio de Parras", "mezcal-cupreata-rio-de-parras-michoacan"],
    ["papalometl", "mezcal-papalometl-mixteca-puebla"],
    ["mezcal poblano", "mezcal-papalometl-mixteca-puebla"],
    ["Zinacantan", "mezcal-papalometl-mixteca-puebla"],
    ["Michoacán", "mezcal-cupreata-rio-de-parras-michoacan"],
    ["Michoacan", "mezcal-cupreata-rio-de-parras-michoacan"],
    ["Puebla", "mezcal-papalometl-mixteca-puebla"],
  ];
  for (const [q, expected] of queries) {
    const ids = searchProfiles({ profiles, bottles, query: q }).map((h) => h.profile.id);
    assert.ok(ids.includes(expected), `query "${q}" finds ${expected}`);
  }
  // papalometl finds both Puebla and Guerrero — the shared word, both contexts.
  const papalometlIds = searchProfiles({ profiles, bottles, query: "papalometl" }).map((h) => h.profile.id);
  assert.ok(papalometlIds.includes("mezcal-papalometl-mixteca-puebla"));
  assert.ok(papalometlIds.includes("mezcal-papalote-montana-guerrero"));
});

test("pair 21: comparison vs espadín derives from supported sensory differences", async () => {
  const { biggestDifferences, comparisonSummary, missingDimensions } = await import("../assets/js/compare.js");
  const espadin = profileById.get("mezcal-espadin-valles-centrales");
  for (const id of NEW) {
    const p = profileById.get(id);
    const diffs = biggestDifferences([p, espadin]);
    assert.ok(diffs.length > 0, `${id} vs espadín has supported differences`);
    for (const d of diffs) assert.ok(d.known && d.gap > 0, `${id}: ${d.key} gap is supported`);
    const summary = comparisonSummary([p, espadin]);
    assert.equal(summary.perspectives[0].evidence, "traditionId", `${id}: perspectives cite real fields`);
    assert.equal(missingDimensions([p, espadin]).length, 0, `${id} has no undocumented dimensions`);
  }
});

test("pair 21: Colima's role stays borderlands-contextual, not production coverage", () => {
  const tuxca = profileById.get("tuxca-lineno-cimarron-jalisco-colima");
  assert.ok(/does not (by itself )?establish Colima production coverage|no claim of Colima production coverage|not for Colima/i.test(tuxca.context),
    "the tuxca context states the Jalisco-made example does not establish Colima coverage");
  const region = regions.find((r) => r.id === "jalisco-colima-borderlands");
  assert.ok(/does not (by itself )?establish Colima production coverage|can't speak for Colima production/i.test(region.distinctions),
    "the region record states the same honest limit");
  const balam = bottles.find((b) => b.id === tuxca.exampleBottleId);
  assert.equal(balam.place.includes("Jalisco"), true, "the example bottle's place stays honestly Jalisco");
});

test("pair 21: Nayarit's raicilla scope is precise — Bahía de Banderas only, not all Nayarit", () => {
  const sierra = profileById.get("raicilla-maximiliana-sierra-jalisco");
  assert.ok(sierra.context.includes("Bahía de Banderas"), "the Sierra context names the municipality");
  assert.ok(/not all Nayarit/i.test(sierra.context), "the Sierra context scopes the claim");
  const costa = profileById.get("raicilla-costa-jalisco");
  assert.ok(costa.context.includes("Bahía de Banderas"), "the Costa context names the municipality");
  assert.ok(/not all Nayarit|rather than all Nayarit/i.test(costa.context), "the Costa context scopes the claim");
  // No Nayarit profile or map coverage is implied without a documented profile.
  for (const p of profiles) {
    assert.notEqual(p.stateId, "nay", "no Nayarit state profile exists (correct — no documented profile yet)");
  }
});
