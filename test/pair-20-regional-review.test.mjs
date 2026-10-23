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

const NEW = ["mezcal-papalote-montana-guerrero", "mezcal-cenizo-sierra-durango", "mezcal-verde-altiplano-slp"];
const profileById = new Map(profiles.map((p) => [p.id, p]));
const bottleById = new Map(bottles.map((b) => [b.id, b]));

test("pair 20: papalote search is not hijacked by the raicilla alias", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const hits = searchProfiles({ profiles, bottles, query: "papalote" });
  const ids = hits.map((h) => h.profile.id);
  assert.ok(ids.includes("mezcal-papalote-montana-guerrero"),
    "the Guerrero cupreata profile is findable via its regional plant name");
  assert.ok(ids.includes("raicilla-costa-jalisco"),
    "the raicilla alias still works alongside the raw term");
});

test("pair 20: accented and unaccented regional queries find the new profiles", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const queries = [
    ["papalometl", "mezcal-papalote-montana-guerrero"],
    ["cenizo", "mezcal-cenizo-sierra-durango"],
    ["durangensis", "mezcal-cenizo-sierra-durango"],
    ["maguey verde", "mezcal-verde-altiplano-slp"],
    ["mezcal potosino", "mezcal-verde-altiplano-slp"],
    ["San Luis Potosí", "mezcal-verde-altiplano-slp"],
    ["San Luis Potosi", "mezcal-verde-altiplano-slp"],
    ["Apango", "mezcal-papalote-montana-guerrero"],
    ["El Mezquital", "mezcal-cenizo-sierra-durango"],
    ["Santa Isabel", "mezcal-verde-altiplano-slp"],
  ];
  for (const [q, expected] of queries) {
    const ids = searchProfiles({ profiles, bottles, query: q }).map((h) => h.profile.id);
    assert.ok(ids.includes(expected), `query "${q}" finds ${expected}`);
  }
});

test("pair 20: profile/bottle fit and maker-versus-brand identity hold", () => {
  const cases = [
    ["mezcal-papalote-montana-guerrero", "legendario-domingo-cupreata", "Alcaraz"],
    ["mezcal-cenizo-sierra-durango", "lamata-cenizo-durango", "Cruz"],
    ["mezcal-verde-altiplano-slp", "leyendas-san-luis-potosi", "Hernández"],
  ];
  for (const [profileId, bottleId, maker] of cases) {
    const p = profileById.get(profileId);
    const b = bottleById.get(bottleId);
    assert.equal(b.profileId, profileId, `${bottleId} maps to its profile`);
    assert.equal(b.traditionId, p.traditionId, "traditions agree");
    assert.ok(p.regionIds.every((r) => regions.some((x) => x.id === r)), "regions resolve");
    assert.ok(p.plantIds.every((x) => plants.some((pl) => pl.id === x)), "plants resolve");
    assert.ok(b.tastingSourceIds.length >= 1, `${bottleId} has tasting evidence`);
    for (const sid of [...b.tastingSourceIds, ...b.sourceIds, ...p.sourceIds]) {
      assert.ok(sourceList.some((s) => s.id === sid), `source ${sid} resolves`);
    }
    assert.ok(b.producer.includes(maker), `${bottleId} names the actual maker family`);
    assert.ok(b.regionIds.some((r) => p.regionIds.includes(r)), `${bottleId} place fits the profile region`);
  }
});

test("pair 20: sensory summaries stay anchored to review sources, never identity sources", () => {
  for (const id of ["legendario-domingo-cupreata", "lamata-cenizo-durango", "leyendas-san-luis-potosi"]) {
    const b = bottleById.get(id);
    for (const sid of b.tastingSourceIds) {
      const src = sourceList.find((s) => s.id === sid);
      assert.equal(src.kind, "review", `${id}: ${sid} is a review, not identity`);
      assert.ok(b.sourceIds.includes(sid), `${id}: tasting source is on the record`);
    }
    const brandSources = b.sourceIds.filter((sid) => sourceList.find((s) => s.id === sid)?.kind === "producer");
    for (const sid of brandSources) {
      assert.ok(!b.tastingSourceIds.includes(sid), `${id}: producer source ${sid} is not tasting evidence`);
    }
  }
});

test("pair 20: comparison explanations derive from supported profile differences", async () => {
  const { biggestDifferences, comparisonSummary, missingDimensions } = await import("../assets/js/compare.js");
  const espadin = profileById.get("mezcal-espadin-valles-centrales");
  for (const id of NEW) {
    const p = profileById.get(id);
    const diffs = biggestDifferences([p, espadin]);
    assert.ok(diffs.length > 0, `${id} vs espadín has supported differences`);
    for (const d of diffs) {
      assert.ok(d.known && d.gap > 0, `${id}: ${d.key} gap is supported by sensory data`);
    }
    const summary = comparisonSummary([p, espadin]);
    assert.equal(summary.perspectives[0].evidence, "traditionId",
      `${id}: the same-tradition perspective cites real fields, not presumed geography`);
    assert.equal(missingDimensions([p, espadin]).length, 0, `${id} has no undocumented comparison dimensions`);
  }
});

test("pair 20: beginner journey — profile → serving advice → example bottle → next comparison (EN/ES)", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  for (const locale of [en, es]) {
    for (const id of NEW) {
      const p = profileById.get(id);
      const ex = bottleById.get(p.exampleBottleId);
      const root = document.createElement("div");
      renderProfile(root, { profile: p, bottle: ex, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale });
      const text = root.textContent;
      const serving = locale.get() === "es" ? contentEs.profiles[id].pairing.serving : p.pairing.serving;
      assert.ok(text.includes(serving.slice(0, 40)), `${id} serving advice renders in ${locale.get()}`);
      assert.ok(root.querySelector(".pairing-notice"), `${id} what-to-notice line renders in ${locale.get()}`);
      assert.ok(text.includes(ex.brand), `${id} example bottle appears in ${locale.get()}`);
      assert.equal(root.querySelectorAll(".untranslated-field").length, 0, `${id} fully rendered in ${locale.get()}`);
      const onwardLinks = root.querySelectorAll("a[href^='#']");
      assert.ok(onwardLinks.length > 0, `${id} offers a next reading step in ${locale.get()}`);
    }
  }
});

test("pair 20: enthusiast journey — bottle → production/source detail → contextual return", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  for (const id of NEW) {
    const p = profileById.get(id);
    const ex = bottleById.get(p.exampleBottleId);
    const entry = bottleEntry(ex, { sources: sourceList, profiles, locale: en });
    const text = entry.textContent;
    assert.ok(text.includes(ex.place), `${ex.id} shows the production place`);
    assert.ok(entry.querySelector(".bottle-basis"), `${ex.id} shows its tasting basis`);
    assert.ok(entry.querySelector(".catalogue-profile-link"), `${ex.id} links back to its profile`);
    assert.ok(entry.querySelectorAll("a[href^='https://']").length > 0, `${ex.id} exposes source links`);
  }
});

test("pair 20: unknown region and unknown profile routes render honest not-found surfaces", async () => {
  const { renderDiscover, renderDiscoverNotFound } = await import("../assets/js/discovery-view.js");
  const { traditions } = JSON.parse(await read("assets/data/traditions.json"));
  const root = document.createElement("div");
  renderDiscoverNotFound(root, "region", "no-such-region", { plants, regions, traditions, locale: es });
  assert.ok(root.textContent.length > 0, "unknown region renders a message");
  assert.equal(root.querySelectorAll(".untranslated-field").length, 0, "not-found surface is translated");
  const root2 = document.createElement("div");
  renderDiscover(root2, { kind: "region", id: "no-such-region", plants, regions, traditions, profiles, bottles, locale: es });
  assert.ok(root2.textContent.length > 0, "renderDiscover handles an unknown region id without throwing");
});
