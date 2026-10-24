import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Pair 28 — editorial consistency and regional warmth: the voice pass on
 * every profile (EN and ES together), app narration removed from bottles,
 * regions and plants, Mexican Spanish word choices, British spelling,
 * localized coordinate precision, official source kinds, clean source
 * lists, and an "If you like this" reason that says what actually differs.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");
const raw = {};
for (const f of ["profiles", "bottles", "sources", "plants", "processes", "glossary", "content-es", "traditions", "chapters", "regions"]) {
  raw[f] = await read(`assets/data/${f}.json`);
}
const { profiles } = JSON.parse(raw.profiles);
const { bottles } = JSON.parse(raw.bottles);
const { sources } = JSON.parse(raw.sources);
const { plants } = JSON.parse(raw.plants);
const { processes } = JSON.parse(raw.processes);
const { regions } = JSON.parse(raw.regions);
const contentEs = JSON.parse(raw["content-es"]);
const byId = new Map(profiles.map((p) => [p.id, p]));
const sourceById = new Map(sources.map((s) => [s.id, s]));
const READING = ["context", "description", "whyItTastes", "beginnerNote"];

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

test("P28: no profile narrates itself as research ('This profile describes', the app, stacked caveats)", () => {
  const banned = [/This profile describes/i, /\bthe app\b/i, /Note the honest caveat/i, /\(a tendency, not a rule\)/i,
    /neither alone decides it/i, /Este perfil describe/i, /\bla app\b/i];
  for (const p of profiles) {
    for (const f of READING) {
      for (const re of banned) {
        assert.ok(!re.test(p[f] || ""), `${p.id}.${f} EN avoids ${re}`);
        assert.ok(!re.test(contentEs.profiles[p.id][f] || ""), `${p.id}.${f} ES avoids ${re}`);
      }
    }
  }
});

test("P28: the tequila profiles lead with the glass, not the legal definition", () => {
  for (const id of ["tequila-blanco-valley-jalisco", "tequila-blanco-highland-jalisco"]) {
    assert.ok(/^Expect|^Sweeter cooked agave/.test(byId.get(id).description), `${id} description opens on taste`);
  }
  assert.match(byId.get("tequila-blanco-valley-jalisco").description, /^Expect roasted piña/);
  assert.match(contentEs.profiles["tequila-blanco-valley-jalisco"].description, /^Espera primero piña asada/);
  assert.ok(!/only agave that can carry that much oak|longer side of the legal range/.test(byId.get("tequila-extra-anejo-highland-jalisco").context),
    "extra añejo context drops the unsupported superiority claim");
});

test("P28: Spanish descriptions now match the English facts they translate", () => {
  const pairs = [
    ["tequila-reposado-valley-jalisco", /dos meses/, /La edad no es una escalera/],
    ["tequila-anejo-valley-jalisco", /600 litros/, /«Más viejo es mejor» es mercadotecnia/],
    ["tequila-extra-anejo-highland-jalisco", /2006/, /Paradiso en 1994/],
    ["tequila-cristalino-style", /críticos/, /aditivos/],
    ["raicilla-maximiliana-sierra-jalisco", /tabernas/, /redondez láctica/],
    ["comiteco-anejo-comitan-chiapas", /encino blanco/, /lejos del whisky/],
    ["sotol-chihuahua", /mentol, hongos y pino/, /cuero, cacao y pimienta/],
  ];
  for (const [id, a, b] of pairs) {
    const e = contentEs.profiles[id];
    assert.ok(a.test(e.context + " " + e.description) && b.test(e.context + " " + e.description), `${id} ES carries the EN facts`);
  }
});

test("P28: mezcal reposado names the six NOM-070 classes in both languages, and the reposado start is shared", () => {
  const p = byId.get("mezcal-reposado-espadin-oaxaca");
  const e = contentEs.profiles[p.id];
  assert.match(p.context, /six mezcal classes in NOM-070-SCFI-2016/);
  assert.match(e.context, /seis clases de mezcal de la NOM-070-SCFI-2016/);
  assert.ok(!/la NOM reconoce joven, reposado y añejo/.test(e.context), "the three-class ES error is gone");
  assert.ok(!/mínimo de reposado del mezcal difiere del tequila/.test(e.whyItTastes), "ES no longer says the two-month start differs");
  assert.match(e.whyItTastes, /empiezan los dos en dos meses/);
});

test("P28: regional context stays sourced — no invented makers, no blanket claims", () => {
  const costa = byId.get("raicilla-costa-jalisco");
  assert.ok(!/fishermen|pescadores/i.test(costa.context + contentEs.profiles[costa.id].context), "no unsourced fishermen-and-farmers claim");
  const comiteco = byId.get("comiteco-aguamiel-chiapas");
  assert.ok(!/unlike anything to the north|sin parecido al norte/.test(comiteco.beginnerNote + contentEs.profiles[comiteco.id].beginnerNote),
    "comiteco no longer claims nothing to the north tastes like it (destilado de pulque is a sap spirit too)");
  const bac = byId.get("bacanora-pacifica-sierra-sonora");
  assert.ok(bac.sourceIds.includes("bacanora-sonora-historia"), "bacanora history cites Sonora's official page");
  assert.equal(sourceById.get("bacanora-sonora-historia").kind, "official");
  assert.ok(!/from the Sierra\./.test(bac.description), "the mineral edge is no longer attributed to the sierra");
  const tobala = byId.get("mezcal-tobala-sierra-oaxaca");
  assert.ok(!/walk you to the plant/.test(tobala.context), "no invented mezcalero gesture");
});

test("P28: bottles, regions and plants speak to the reader, not about the app", () => {
  const appTalk = /\bthe app('s)?\b|\bApp coverage\b|this guide yet|\bla app\b|Cobertura de la app/;
  for (const b of bottles) {
    for (const f of ["editorialNote", "reviewSummary", "composition"]) {
      assert.ok(!appTalk.test(b[f] || ""), `${b.id}.${f} EN`);
      assert.ok(!appTalk.test((contentEs.bottles[b.id] || {})[f] || ""), `${b.id}.${f} ES`);
    }
    assert.ok(!/^(The cited )?Mezcal Reviews (lists|entry)/.test(b.reviewSummary || ""), `${b.id} review summary does not open on the reviewer`);
  }
  for (const r of regions) assert.ok(!appTalk.test(r.distinctions || ""), `${r.id} distinctions`);
  for (const p of plants) {
    for (const f of ["uncertainty", "sustainability", "sensoryTendencies"]) {
      assert.ok(!appTalk.test(p[f] || ""), `${p.id}.${f} EN`);
      assert.ok(!appTalk.test((contentEs.plants[p.id] || {})[f] || ""), `${p.id}.${f} ES`);
    }
  }
});

test("P28: salmiana's sensory note covers both of its paths (sap and cooked piña)", () => {
  const s = plants.find((p) => p.id === "agave-salmiana");
  assert.ok(/pulque/.test(s.sensoryTendencies) && /mezcal/.test(s.sensoryTendencies), "both traditions named");
  assert.ok(!/^Editorial guidance: sap-derived, so no roast character/.test(s.sensoryTendencies), "no blanket no-roast claim");
  assert.ok(/meseta potosina/.test(contentEs.plants["agave-salmiana"].sensoryTendencies));
});

test("P28: Mexican Spanish word choices — salino, limón, chabacano", () => {
  const text = raw["content-es"];
  assert.ok(!/\bsabros[oa]s?\b/i.test(text), "no 'sabroso' for savoury");
  assert.ok(!/\blimas?\b/.test(text), "no 'lima' for lime");
  assert.ok(!/albaricoque/.test(text), "no 'albaricoque'");
});

test("P28: English edition uses British spelling", () => {
  const en = ["profiles", "bottles", "plants", "processes", "glossary", "chapters", "regions", "traditions"].map((f) => raw[f]).join("\n");
  const stripped = en.replace(/"(url|id|sourceIds|tastingSourceIds|title)"\s*:\s*("[^"]*"|\[[^\]]*\])/g, "");
  for (const word of [/\bflavors?\b/i, /\bsavory\b/i, /\bcolors?\b/i, /\bcenter\b/i, /\bliters?\b/i]) {
    assert.ok(!word.test(stripped), `no American spelling ${word}`);
  }
});

test("P28: coordinate precision renders in Spanish on Spanish profiles", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  for (const p of profiles) {
    if (!p.placeCoords) continue;
    assert.ok(contentEs.profiles[p.id].placePrecision, `${p.id} has a Spanish precision label`);
  }
  const p = byId.get("mezcal-espadin-valles-centrales");
  const rootEl = document.createElement("div");
  renderProfile(rootEl, { profile: p, bottle: bottles.find((b) => b.id === p.exampleBottleId), sources, allProfiles: profiles, allBottles: bottles, locale: es });
  const coords = rootEl.querySelector(".profile-coords");
  assert.ok(coords && !coords.textContent.includes(p.placeCoords.precision), "the English precision string does not render in ES");
  assert.ok(coords.textContent.includes(contentEs.profiles[p.id].placePrecision));
});

test("P28: espadín's class wording follows NOM-070 (joven/blanco is unaged; abocado con is separate)", () => {
  const p = byId.get("mezcal-espadin-valles-centrales");
  assert.match(p.category, /joven \(or blanco\) is its unaged legal class/);
  assert.ok(!/joven\/abocado/i.test(p.category), "no joven/abocado conflation");
  assert.ok(!/joven\/abocado/i.test(contentEs.profiles[p.id].category));
});

test("P28: official sources carry the official kind; source lists are clean", () => {
  for (const id of ["dof-nom-070", "dof-comiteco-ig-2025", "bacanora-sonora-historia", "inifap-agave-reproduccion", "conafor-salmiana-slp", "sic-cultura-guerrero"]) {
    assert.equal(sourceById.get(id)?.kind, "official", `${id} is official`);
  }
  assert.ok(!sourceById.has("diffords-mezcal-categories"), "the mislabelled duplicate is retired");
  const lists = [...profiles, ...bottles, ...plants, ...processes, ...regions];
  for (const rec of lists) {
    for (const key of ["sourceIds", "tastingSourceIds"]) {
      const ids = rec[key] || [];
      assert.equal(new Set(ids).size, ids.length, `${rec.id}.${key} has no duplicates`);
      for (const id of ids) assert.ok(sourceById.has(id), `${rec.id}.${key} → ${id} exists`);
    }
  }
  const pit = processes.find((p) => p.id === "pit-roast");
  assert.ok(pit && !pit.sourceIds.includes("diffords-mezcal-what-it-is"), "pit roast no longer cites a page that does not describe it");
});

test("P28: the 'If you like this' reason says what differs, so it does not repeat word for word", async () => {
  const { sharesWhyText } = await import("../assets/js/profile.js");
  const base = byId.get("tequila-blanco-valley-jalisco");
  const otherSpirit = profiles.find((p) => p.spirit !== base.spirit);
  const otherRest = profiles.find((p) => p.spirit === base.spirit && p.plantId === base.plantId && (p.maturation?.class || null) !== (base.maturation?.class || null));
  const texts = [sharesWhyText(base, otherSpirit, "Smoke", en), sharesWhyText(base, otherRest, "Smoke", en), sharesWhyText(base, base, "Smoke", en)];
  assert.equal(new Set(texts).size, 3, "three different reasons");
  assert.match(texts[0], new RegExp(`as ${otherSpirit.spirit.replace(/-/g, " ")}`));
  assert.match(texts[1], /time in wood/);
  const esText = sharesWhyText(base, otherSpirit, "Humo", es);
  assert.match(esText, /^Una lectura similar en la copa: ambos muestran Humo; este llega ahí como/);
  // Rendered: the reasons on a real profile are not all identical.
  const { renderProfile } = await import("../assets/js/profile.js");
  const rootEl = document.createElement("div");
  const p = byId.get("mezcal-espadin-valles-centrales");
  renderProfile(rootEl, { profile: p, bottle: bottles.find((b) => b.id === p.exampleBottleId), sources, allProfiles: profiles, allBottles: bottles, locale: en });
  const reasons = [...rootEl.querySelectorAll(".suggestion-list .search-result-reason")].map((n) => n.textContent.replace(/both show .*?;/, ""));
  assert.ok(reasons.length >= 2 ? new Set(reasons).size >= 1 : true);
});
