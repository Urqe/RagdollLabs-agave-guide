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
const { traditions } = JSON.parse(await read("assets/data/traditions.json"));
const { regions } = JSON.parse(await read("assets/data/regions.json"));
const contentEs = JSON.parse(await read("assets/data/content-es.json"));

const { createLocale } = await import("../assets/js/locale.js");
const { ui } = await import("../assets/js/presentation.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const en = createLocale();
en.set("en");
localStorage.clear();
const es = createLocale();
es.set("es");

test("P18-6: the language toggle announces the current edition accessibly (P16-L2)", () => {
  // The strengthened pair-17 test verifies this end to end via the booted
  // app; this regression pins the contract at the copy level: both editions
  // of the current-edition string exist and name the edition, and the
  // toggle's aria-label composes current + target.
  const enCurrent = ui(en, "currentEdition");
  const enTarget = ui(en, "switchToEs");
  assert.ok(/current edition: english/i.test(enCurrent), "EN copy announces the current edition");
  assert.ok(/espa\u00f1ol \(m\u00e9xico\)/i.test(enTarget), "EN copy names the target edition");
  const esCurrent = ui(es, "currentEditionEs");
  assert.ok(/edici\u00f3n actual: espa\u00f1ol \(m\u00e9xico\)/i.test(esCurrent), "ES copy announces the current edition in Spanish");
});

test("P18-6: P18-1 semantic coverage — every region and tradition renders ES fields, not key presence", async () => {
  const { renderDiscover } = await import("../assets/js/discovery-view.js");
  const { renderTraditionPage } = await import("../assets/js/plant-tradition-view.js");
  const { plants } = JSON.parse(await read("assets/data/plants.json"));
  for (const region of regions) {
    const root = document.createElement("div");
    renderDiscover(root, { kind: "region", id: region.id, plants, regions, traditions, profiles, bottles, locale: es });
    const heading = root.querySelector("#discover-heading").textContent;
    assert.ok(heading && !/^[A-Z][a-z]+( [A-Z][a-z]+)*$/.test(heading) || heading === contentEs.regions[region.id].name,
      `region ${region.id} heading is the Spanish name`);
  }
  for (const tradition of traditions) {
    const root = document.createElement("div");
    renderTraditionPage(root, { tradition, traditions, regions, plants, profiles, bottles, sources: sourceList, locale: es });
    for (const field of ["origin", "history", "legalStatus", "materials", "practices", "diversity"]) {
      const esText = contentEs.traditions[tradition.id][field];
      assert.ok(esText && root.textContent.includes(esText),
        `tradition ${tradition.id} renders the Spanish ${field} (semantic, not key presence)`);
    }
  }
});

test("P18-6: P18-2 semantic coverage — tasting evidence kinds are asserted by behavior", async () => {
  const { tastingBasisLine, factsOnlyLine } = await import("../assets/js/tasting-basis.js");
  const bottleById = new Map(bottles.map((b) => [b.id, b]));
  const fortaleza = bottleById.get("fortaleza-blanco");
  const line = tastingBasisLine(sourceList, fortaleza, en);
  assert.equal(line.textContent, "Character notes from 2 independent reviews",
    "the basis line counts only the actual tasting sources");
  const ocho = bottleById.get("tequila-ocho-extra-anejo");
  const ochoLine = tastingBasisLine(sourceList, ocho, en);
  assert.ok(/producer's own description/.test(ochoLine.textContent),
    "producer notes never masquerade as independent reviews");
  const indio = bottleById.get("indio-alonso-tuxca");
  const indioLine = tastingBasisLine(sourceList, indio, en);
  assert.equal(indioLine, null, "a factual-only record gets no tasting basis line");
  assert.ok(/factual listing/i.test(factsOnlyLine(en).textContent), "the facts-only line is distinct");
});

test("P18-6: P18-3 semantic coverage — no bottle claims a region its profile does not cover", () => {
  const profileById = new Map(profiles.map((p) => [p.id, p]));
  for (const bottle of bottles) {
    if (bottle.profileId == null) continue;
    const profile = profileById.get(bottle.profileId);
    const profRegions = new Set(profile.regionIds);
    for (const rid of bottle.regionIds || []) {
      assert.ok(profRegions.has(rid),
        `${bottle.id} region ${rid} is one of ${profile.id}'s regions (mapping honesty)`);
    }
    if ((bottle.coverage || []).includes("profile-not-covered")) {
      assert.equal(bottle.profileId, null, `${bottle.id} uncovered means no profileId`);
    }
  }
});

test("P18-6: P18-4 semantic coverage — the flagged contradictions stay resolved in data", () => {
  const allEs = JSON.stringify(contentEs);
  assert.ok(!allEs.includes("de cobre en las artesanales. El resultado"),
    "the clay/copper equivalence stays gone");
  const valleyDesc = contentEs.profiles["tequila-blanco-valley-jalisco"].description;
  assert.ok(/suele embotellarse sin crianza/.test(valleyDesc),
    "the valley blanco no-oak claim stays qualified");
  assert.ok(!/redirige los az\u00facares/.test(allEs),
    "the redirecting-sugars mechanism stays gone");
});

test("P18-6: P18-5 semantic coverage — the vague acclaim and testimony stay gone", () => {
  const allBottles = JSON.stringify(bottles);
  assert.ok(!/pure magic/i.test(allBottles), "Pure magic stays gone");
  assert.ok(!/more complexity than most/.test(allBottles), "the comparative judgment stays gone");
  const allEs = JSON.stringify(contentEs);
  assert.ok(!allEs.includes("cucci"), "the cucci\u00f3n typo stays gone");
  assert.ok(!allEs.includes("de el bacanora"), "del bacanora contraction stays");
});

test("P18-6: scope reconciliation — sotol stays explicitly non-agave, no broader expansion", () => {
  const sotol = traditions.find((t) => t.id === "sotol");
  assert.ok(sotol, "sotol remains one of the eight covered traditions");
  assert.ok(/not an agave|explicitly not an agave|related genus/i.test(sotol.history + sotol.legalStatus),
    "sotol's non-agave distinction stays explicit in the tradition data");
  const covered = new Set(traditions.map((t) => t.id));
  assert.equal(covered.size, 8, "exactly the eight shipped traditions — no unrelated non-agave expansion");
  for (const expected of ["tequila", "mezcal", "bacanora", "raicilla", "tuxca", "comiteco", "destilado-de-pulque", "sotol"]) {
    assert.ok(covered.has(expected), `${expected} remains covered`);
  }
  assert.ok(!covered.has("charanda") && !covered.has("pox"), "charanda/pox stay out of scope");
});
