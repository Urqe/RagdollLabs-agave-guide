import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Release 21 — Richer Profiles. Dedicated plant and tradition pages,
 * the redesigned expression profile (why it tastes this way, how to
 * enjoy, explore next with reasons), honest plant framing, and full
 * Spanish parity for the new fields.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => readFile(path.join(root, rel), "utf8").then((t) => JSON.parse(t));

const { profiles } = await readJson("assets/data/profiles.json");
const { plants } = await readJson("assets/data/plants.json");
const { regions } = await readJson("assets/data/regions.json");
const { traditions } = await readJson("assets/data/traditions.json");
const { bottles } = await readJson("assets/data/bottles.json");
const { sources } = await readJson("assets/data/sources.json");
const contentEs = await readJson("assets/data/content-es.json");

const dom = new JSDOM("<!doctype html><html><body><div id=\"app\"></div></body></html>", {
  url: "https://example.test/RagdollLabs-agave-guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;

const { renderPlantPage, renderTraditionPage } = await import("../assets/js/plant-tradition-view.js");
const { renderProfile } = await import("../assets/js/profile.js");
const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);

const container = document.getElementById("app");
const locale = createLocale();

function renderPlant(id) {
  container.innerHTML = "";
  renderPlantPage(container, {
    plant: plants.find((p) => p.id === id),
    plants, regions, traditions, profiles, sources, locale,
  });
  return container;
}

function renderTradition(id) {
  container.innerHTML = "";
  renderTraditionPage(container, {
    tradition: traditions.find((t) => t.id === id),
    traditions, regions, plants, profiles, bottles, sources, locale,
  });
  return container;
}

test("R21: plant page follows the plan structure", () => {
  const view = renderPlant("agave-potatorum");
  const h2s = [...view.querySelectorAll("h2")].map((h) => h.textContent);
  for (const expected of ["At a glance", "Where it grows", "Harvesting and production", "Characteristics (qualified)", "Regional expressions", "Sustainability", "Further reading"]) {
    assert.ok(h2s.includes(expected), `plant page has "${expected}" (got: ${h2s.join(", ")})`);
  }
  assert.ok(view.textContent.includes("tobalá"), "common names shown");
  assert.ok(view.textContent.includes("wild"), "wild-harvest distinguished");
  assert.match(view.textContent, /Editorial guidance/, "sensory tendencies qualified as editorial");
  const exprLinks = view.querySelectorAll('a[href^="#/profile/"]');
  assert.ok(exprLinks.length >= 1, "regional expressions link out");
});

test("R21: sotol plant page keeps the not-an-agave distinction", () => {
  const view = renderPlant("dasylirion-desert-spoon");
  assert.match(view.textContent, /Not an agave/i, "Dasylirion page states the genus distinction up front");
  assert.ok(view.textContent.includes("Asparagaceae") || view.textContent.includes("related genus"), "botanical framing kept");
});

test("R21: plant page links back to discovery and out to regions", () => {
  const view = renderPlant("agave-angustifolia");
  assert.ok(view.querySelector('a[href="#/discover"]'), "back to discovery");
  const regionChips = [...view.querySelectorAll('a[href^="#/discover/region/"]')];
  assert.ok(regionChips.length >= 2, "links to its regions");
  for (const a of regionChips) {
    const id = decodeURIComponent(a.getAttribute("href").split("/region/")[1]);
    assert.ok(regions.some((r) => r.id === id), `region ${id} exists`);
  }
});

test("R21: tradition page follows the plan structure", () => {
  const view = renderTradition("bacanora");
  const h2s = [...view.querySelectorAll("h2")].map((h) => h.textContent);
  for (const expected of ["What it is", "Origin, history and cultural significance", "Legal status", "Materials", "Traditional production", "Distinguishing traits and diversity", "Regional variations", "Beginner starting points", "Expressions for exploration", "Further reading"]) {
    assert.ok(h2s.includes(expected), `tradition page has "${expected}" (got: ${h2s.join(", ")})`);
  }
  assert.match(view.textContent, /Denomination of Origin \(Sonora/i);
  assert.match(view.textContent, /New to bacanora|beginner starting points/i, "beginner note surfaced");
});

test("R21: tradition page links its plants and expressions", () => {
  const view = renderTradition("mezcal");
  const plantChips = [...view.querySelectorAll('a[href^="#/plant/"]')];
  assert.ok(plantChips.length >= 2, "tradition links its plants");
  for (const a of plantChips) {
    const id = decodeURIComponent(a.getAttribute("href").split("/plant/")[1]);
    assert.ok(plants.some((p) => p.id === id), `plant ${id} exists`);
  }
  const mezcalProfiles = profiles.filter((p) => p.traditionId === "mezcal");
  const expr = [...view.querySelectorAll('.tradition-expressions-section a[href^="#/profile/"], a[href^="#/profile/"]')];
  assert.ok(expr.length >= mezcalProfiles.length, "all mezcal profiles listed");
});

test("R21: expression profile renders the why-it-tastes section with honest framing", () => {
  const profile = profiles.find((p) => p.id === "bacanora-pacifica-sierra-sonora");
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  container.innerHTML = "";
  renderProfile(container, { profile, bottle, sources, allProfiles: profiles, allBottles: bottles, locale });
  const why = container.querySelector(".profile-why");
  assert.ok(why, "why section renders");
  assert.match(why.textContent, /Why does it taste this way/i);
  assert.ok(why.textContent.includes("pit"), "cause-and-effect text present");
  assert.match(why.textContent, /never deterministic/i, "why section carries the non-deterministic note");
});

test("R21: expression profile renders enjoy, bottles and explore-next sections", () => {
  const profile = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  container.innerHTML = "";
  renderProfile(container, { profile, bottle, sources, allProfiles: profiles, allBottles: bottles, locale });
  const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent);
  assert.ok(h2s.includes("How to enjoy it"), "enjoy section (pairing retained)");
  assert.ok(h2s.includes("Example bottle"), "bottles section");
  assert.ok(h2s.includes("Explore next"), "explore-next section");
  assert.ok(container.querySelector(".suggestion-list"), "existing sensory suggestions retained");
  assert.ok(container.querySelector(".bottle-card"), "example bottle card retained");
  assert.ok(container.querySelector(".sensory-overview"), "sensory overview retained");
});

test("R21: explore-next destinations carry why-relevant labels", () => {
  const profile = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  container.innerHTML = "";
  renderProfile(container, { profile, bottle, sources, allProfiles: profiles, allBottles: bottles, locale });
  const next = container.querySelector(".profile-next");
  const cards = [...next.querySelectorAll(".discovery-card .eyebrow")].map((e) => e.textContent);
  assert.ok(cards.length >= 2, "multiple destinations offered");
  assert.ok(cards.includes("Similar character"), "similar-character destination labeled");
  for (const label of cards) {
    assert.ok(label.length > 3, `destination has an explanatory label: ${label}`);
  }
});

test("R21: every profile carries evidence-based why text (validator-enforced)", () => {
  for (const p of profiles) {
    assert.ok(p.whyItTastes && p.whyItTastes.length >= 80, `${p.id} has why text`);
    const es = contentEs.profiles[p.id];
    assert.ok(es && es.whyItTastes && es.whyItTastes.length > 40, `${p.id} has ES why text`);
  }
});

test("R21: why text renders in Spanish without disclosures on translated profiles", () => {
  locale.set("es");
  const profile = profiles.find((p) => p.id === "bacanora-pacifica-sierra-sonora");
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  container.innerHTML = "";
  renderProfile(container, { profile, bottle, sources, allProfiles: profiles, allBottles: bottles, locale });
  const why = container.querySelector(".profile-why");
  assert.ok(why.textContent.includes("pozo"), "why text in Spanish");
  assert.ok(!why.querySelector(".untranslated-field"), "no untranslated disclosure for a translated field");
  locale.set("en");
});

test("R21: plant pages render in Spanish", () => {
  locale.set("es");
  const view = renderPlant("agave-tequilana");
  const h2s = [...view.querySelectorAll("h2")].map((h) => h.textContent);
  assert.ok(h2s.includes("De un vistazo"), "at-a-glance in Spanish");
  assert.ok(view.textContent.includes("cultivado"), "cultivation in Spanish");
  locale.set("en");
});
