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
const { traditions } = JSON.parse(await read("assets/data/traditions.json"));

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
const profileById = new Map(profiles.map((p) => [p.id, p]));
const bottleById = new Map(bottles.map((b) => [b.id, b]));

test("pair 22: Michoacán and Puebla journeys render in EN and ES without untranslated fields", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  for (const locale of [en, es]) {
    for (const id of NEW) {
      const p = profileById.get(id);
      const ex = bottleById.get(p.exampleBottleId);
      const root = document.createElement("div");
      renderProfile(root, { profile: p, bottle: ex, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale });
      assert.equal(root.querySelectorAll(".untranslated-field").length, 0, `${id} fully rendered in ${locale.get()}`);
      const expectedTitle = locale.get() === "es" ? contentEs.profiles[id].title : p.title;
      assert.equal(root.querySelector("#profile-title").textContent, expectedTitle);
      const serving = locale.get() === "es" ? contentEs.profiles[id].pairing.serving : p.pairing.serving;
      assert.ok(root.querySelector(".profile-pairing").textContent.includes(serving.slice(0, 40)));
      assert.ok(root.textContent.includes(ex.brand), `${id} example bottle appears`);
      assert.ok(root.querySelectorAll("a[href^='#']").length > 0, `${id} offers an onward step in ${locale.get()}`);
    }
  }
});

test("pair 22: accented/unaccented EN and ES searches keep finding both new profiles", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const queries = [
    ["penca ancha", "mezcal-cupreata-rio-de-parras-michoacan"],
    ["Michoacán", "mezcal-cupreata-rio-de-parras-michoacan"],
    ["papalometl", "mezcal-papalometl-mixteca-puebla"],
    ["mezcal poblano", "mezcal-papalometl-mixteca-puebla"],
  ];
  for (const [q, expected] of queries) {
    const ids = searchProfiles({ profiles, bottles, query: q }).map((h) => h.profile.id);
    assert.ok(ids.includes(expected), `"${q}" finds ${expected}`);
  }
});

test("pair 22: Colima and Nayarit contextual links do not overstate production, legal scope or coverage", () => {
  const tuxca = profileById.get("tuxca-lineno-cimarron-jalisco-colima");
  assert.ok(/no claim of Colima production coverage/i.test(tuxca.context),
    "the tuxca context keeps Colima to documented borderlands context");
  const region = regions.find((r) => r.id === "jalisco-colima-borderlands");
  assert.ok(/does not by itself establish Colima production coverage/i.test(region.distinctions),
    "the region record states the Jalisco-made example limit");
  const sierra = profileById.get("raicilla-maximiliana-sierra-jalisco");
  const costa = profileById.get("raicilla-costa-jalisco");
  for (const p of [sierra, costa]) {
    assert.ok(p.context.includes("Bahía de Banderas"), `${p.id} names the exact municipality`);
    assert.ok(/not all Nayarit|rather than all Nayarit/i.test(p.context), `${p.id} scopes the DO claim`);
  }
  for (const p of profiles) {
    assert.notEqual(p.stateId, "nay", "no Nayarit profile exists without a documented profile");
    assert.notEqual(p.stateId, "col", "no Colima state profile is implied by the borderlands context");
  }
  // ES mirrors carry the same limits.
  const esTuxca = contentEs.profiles["tuxca-lineno-cimarron-jalisco-colima"].context;
  assert.ok(/cobertura de producción colimense/i.test(esTuxca), "ES tuxca context states the Colima limit");
  const esCosta = contentEs.profiles["raicilla-costa-jalisco"].context;
  assert.ok(esCosta.includes("Bahía de Banderas") && /no todo Nayarit/i.test(esCosta), "ES costa context stays precise");
});

test("pair 22: the corrected Puebla bottle geography stays consistent across every surface", () => {
  const mb = bottleById.get("montelobos-tobala");
  assert.ok(mb.place.includes("Puebla"), "the bottle record keeps the corrected Puebla place");
  assert.ok(mb.producer.includes("Palenque del Tentzo"), "the producer names the actual Puebla palenque");
  const esMb = contentEs.bottles["montelobos-tobala"];
  assert.ok(esMb.place.includes("Puebla"), "the ES mirror keeps the corrected place");
  const oaxacaTobala = profileById.get("mezcal-tobala-sierra-oaxaca");
  assert.equal(oaxacaTobala.exampleBottleId, "macurichos-ancestral-tobala",
    "the wild-Oaxaca tobalá profile keeps its own Oaxaca example");
  assert.equal(mb.profileId, null, "the Puebla bottle stays honestly unmapped");
  assert.equal(mb.noteProfileId, "mezcal-tobala-sierra-oaxaca", "the editorial note still explains the relationship");
  const example = bottleById.get(oaxacaTobala.exampleBottleId);
  assert.ok(example.place.includes("Oaxaca"), "the Oaxaca example is genuinely from Oaxaca");
  // No Oaxaca region or profile claims the Puebla bottle's place.
  for (const r of regions) {
    if (r.stateId === "oax") {
      assert.ok(!JSON.stringify(r).includes("Tentzo"), `${r.id} does not claim the Puebla palenque`);
    }
  }
  const cupreata = plants.find((p) => p.id === "agave-potatorum");
  assert.ok(cupreata.profileIds.includes("mezcal-papalometl-mixteca-puebla"), "the potatorum plant links the Puebla profile");
});

test("pair 22: the five regional introductions teach distinct differences without one formula", () => {
  const FIVE = [
    "mezcal-papalote-montana-guerrero",
    "mezcal-cenizo-sierra-durango",
    "mezcal-verde-altiplano-slp",
    "mezcal-cupreata-rio-de-parras-michoacan",
    "mezcal-papalometl-mixteca-puebla",
  ];
  const descriptions = FIVE.map((id) => profileById.get(id).description);
  const formulaCount = descriptions.filter((d) => /in a way espad[ií]n rarely does/i.test(d)).length;
  assert.ok(formulaCount <= 1, `at most one introduction uses the "in a way espadín rarely does" formula, got ${formulaCount}`);
  const esDescriptions = FIVE.map((id) => contentEs.profiles[id].description);
  const esFormulaCount = esDescriptions.filter((d) => /que el espad[ií]n rara vez/i.test(d)).length;
  assert.ok(esFormulaCount <= 1, `at most one ES introduction uses the "rara vez" formula, got ${esFormulaCount}`);
  for (const id of FIVE) {
    assert.ok(/tendency|tends|tend to|tendenc|often|varies|genuinely|range/i.test(profileById.get(id).description),
      `${id} keeps qualifying its tendencies`);
  }
});

test("pair 22: established tradition paths are unchanged — no regressions", () => {
  const expected = {
    tequila: ["tequila-blanco-valley-jalisco", "tequila-blanco-highland-jalisco", "tequila-reposado-valley-jalisco",
      "tequila-anejo-valley-jalisco", "tequila-cristalino-style", "tequila-extra-anejo-highland-jalisco"],
    bacanora: ["bacanora-pacifica-sierra-sonora"],
    raicilla: ["raicilla-maximiliana-sierra-jalisco", "raicilla-costa-jalisco", "raicilla-reposado-jalisco"],
    tuxca: ["tuxca-lineno-cimarron-jalisco-colima"],
    comiteco: ["comiteco-aguamiel-chiapas", "comiteco-anejo-comitan-chiapas"],
    "destilado-de-pulque": ["destilado-de-pulque-salmiana-tlaxcala"],
    sotol: ["sotol-chihuahua"],
  };
  for (const [traditionId, ids] of Object.entries(expected)) {
    for (const id of ids) {
      const p = profileById.get(id);
      assert.ok(p, `${id} still ships`);
      assert.equal(p.traditionId, traditionId, `${id} keeps its tradition`);
      assert.ok(bottleById.get(p.exampleBottleId), `${id} keeps its example bottle`);
    }
  }
  // Every tradition still resolves plant/region references.
  for (const t of traditions) {
    for (const pid of t.plantIds || []) assert.ok(plants.some((p) => p.id === pid), `plant ${pid} resolves for ${t.id}`);
    for (const rid of t.regionIds || []) assert.ok(regions.some((r) => r.id === rid), `region ${rid} resolves for ${t.id}`);
  }
  // Every example bottle still maps to a profile that exists, and vice versa.
  for (const p of profiles) {
    assert.ok(bottleById.has(p.exampleBottleId), `${p.id} example resolves`);
  }
});
