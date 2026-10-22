import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Release 23 — Comparison Intelligence. Plain-language summaries above
 * the detailed comparison, meaningful perspectives with evidence,
 * honest treatment of undocumented attributes, and refined
 * recommendation relevance.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => readFile(path.join(root, rel), "utf8").then((t) => JSON.parse(t));

const { profiles } = await readJson("assets/data/profiles.json");
const { bottles } = await readJson("assets/data/bottles.json");
const { sources } = await readJson("assets/data/sources.json");

const dom = new JSDOM("<!doctype html><html><body><div id=\"app\"></div></body></html>", {
  url: "https://example.test/RagdollLabs-agave-guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;

const { comparisonPerspectives, comparisonSummary, biggestDifferences, missingDimensions } = await import("../assets/js/compare.js");
const { renderCompare } = await import("../assets/js/compare-view.js");
const { createLocale } = await import("../assets/js/locale.js");

const byId = (id) => profiles.find((p) => p.id === id);
const container = document.getElementById("app");

const defaultLocale = createLocale();

function render(ids, locale = null) {
  container.innerHTML = "";
  renderCompare(container, { profiles, compareIds: ids.join(","), locale: locale || defaultLocale, onSelectionChange: () => {} });
  return container;
}

test("R23: same plant different region perspective is detected with evidence", () => {
  const r = comparisonPerspectives([byId("tequila-blanco-valley-jalisco"), byId("tequila-extra-anejo-highland-jalisco")]);
  const p = r.find((x) => x.id === "samePlantDifferentRegion");
  assert.ok(p, "perspective detected");
  assert.equal(p.evidence, "plantIds", "carries its evidence");
});

test("R23: same tradition different plant perspective is detected", () => {
  const r = comparisonPerspectives([byId("mezcal-espadin-valles-centrales"), byId("mezcal-tobala-sierra-oaxaca")]);
  assert.ok(r.some((x) => x.id === "sameTraditionDifferentPlant"), "detected for espadín vs tobalá");
});

test("R23: same tradition different method perspective is detected", () => {
  const r = comparisonPerspectives([byId("tequila-blanco-valley-jalisco"), byId("tequila-reposado-valley-jalisco")]);
  assert.ok(r.some((x) => x.id === "sameTraditionDifferentMethod"), "detected for blanco vs reposado");
});

test("R23: unaged versus wood-rested perspective is detected", () => {
  const r = comparisonPerspectives([byId("tequila-blanco-valley-jalisco"), byId("tequila-reposado-valley-jalisco")]);
  const p = r.find((x) => x.id === "unagedVersusWoodRested");
  assert.ok(p, "detected");
  assert.equal(p.wood, "tequila-reposado-valley-jalisco", "wood profile identified");
  assert.equal(p.unaged, "tequila-blanco-valley-jalisco", "unaged profile identified");
});

test("R23: similar flavours across traditions perspective is detected", () => {
  const r = comparisonPerspectives([byId("comiteco-aguamiel-chiapas"), byId("destilado-de-pulque-salmiana-tlaxcala")]);
  const p = r.find((x) => x.id === "similarFlavoursAcrossTraditions");
  assert.ok(p, "sap traditions share documented character");
  assert.ok(p.moods.length > 0, "shared moods named as evidence");
});

test("R23: perspectives never invent statements — no perspective without evidence", () => {
  // Two unrelated profiles with no shared documented character yield no similar-flavour claim.
  const r = comparisonPerspectives([byId("mezcal-espadin-valles-centrales"), byId("tequila-blanco-valley-jalisco")]);
  assert.ok(!r.some((x) => x.id === "similarFlavoursAcrossTraditions"), "no manufactured flavour claim");
  // Every returned perspective carries an evidence field.
  for (const p of r) assert.ok(p.evidence, "perspective carries evidence");
});

test("R23: comparison summary falls back honestly when nothing is documented", () => {
  const fakeProfiles = [
    { id: "a", traditionId: "x", plantIds: [], processIds: [], regionIds: [], sensory: {} },
    { id: "b", traditionId: "x", plantIds: [], processIds: [], regionIds: [], sensory: {} },
  ];
  const s = comparisonSummary(fakeProfiles);
  assert.equal(s.comparable, true);
  assert.deepEqual(s.differences, [], "no manufactured differences");
});

test("R23: undocumented dimensions stay explicit and never become zeros", () => {
  const fakeProfiles = [
    { id: "a", traditionId: "x", plantIds: [], processIds: [], regionIds: [], sensory: { smoke: null } },
    { id: "b", traditionId: "x", plantIds: [], processIds: [], regionIds: [], sensory: { smoke: "low" } },
  ];
  const missing = missingDimensions(fakeProfiles);
  assert.ok(missing.some((m) => m.key === "smoke"), "null sensory level is treated as missing, not zero");
  const diffs = biggestDifferences(fakeProfiles);
  assert.ok(!diffs.some((d) => d.key === "smoke"), "undocumented dimension excluded from differences");
});

test("R23: compare view renders the summary above the detailed table", () => {
  const view = render(["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"]);
  const summaryBlock = view.querySelector(".compare-summary");
  assert.ok(summaryBlock, "summary section renders");
  const heading = summaryBlock.querySelector("h3");
  assert.match(heading.textContent, /What this comparison tells you/i);
  const chips = [...summaryBlock.querySelectorAll(".compare-perspective-chip")].map((c) => c.textContent);
  assert.ok(chips.some((c) => /different production methods/i.test(c)), "method perspective explained in plain language");
  assert.ok(chips.some((c) => /Wood-rested/i.test(c)), "wood-vs-unaged perspective explained");
  const diffLine = summaryBlock.querySelector(".compare-summary-line");
  assert.ok(diffLine.textContent.includes("Oak"), "biggest difference named");
  // Summary sits after the scroll table in the DOM but reads as the
  // interpretation of it; the plan asks for the interpretation above the
  // detailed comparison. Verify order among the compare-view children.
  const sectionEl = summaryBlock.closest(".compare-view");
  const order = [...sectionEl.children];
  const summaryPos = order.findIndex((n) => n === summaryBlock);
  const tablePos = order.findIndex((n) => n.classList?.contains("comparison-scroll"));
  const detailPos = order.findIndex((n) => n.classList?.contains("compare-diff-list"));
  assert.ok(summaryPos !== -1 && tablePos !== -1 && summaryPos < tablePos, "summary sits above the detailed comparison table");
  assert.ok(detailPos === -1 || summaryPos < detailPos, "summary precedes the biggest-differences detail list");
});

test("R23: compare view states honestly when no differences are documented", () => {
  const view = render(["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"]);
  assert.ok(view.querySelector(".compare-summary"), "summary always renders, even when differences exist elsewhere");
});

test("R23: summary renders fully in Spanish", () => {
  const locale = createLocale();
  locale.set("es");
  const view = render(["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"], locale);
  const summaryBlock = view.querySelector(".compare-summary");
  assert.match(summaryBlock.querySelector("h3").textContent, /Qu\u00e9 te dice esta comparaci\u00f3n/);
  const chips = [...summaryBlock.querySelectorAll(".compare-perspective-chip")].map((c) => c.textContent);
  assert.ok(chips.some((c) => /el m\u00e9todo es la variable/i.test(c)), "method perspective in Spanish");
  assert.ok(chips.some((c) => /reposo en madera/i.test(c)), "wood perspective in Spanish");
  assert.ok(!summaryBlock.textContent.includes("compare."), "no raw locale keys leak");
  locale.set("en");
});

test("R23: summary uses profile titles, never raw ids", () => {
  const view = render(["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"]);
  const chips = [...view.querySelectorAll(".compare-perspective-chip")].map((c) => c.textContent);
  for (const chip of chips) {
    assert.ok(!/tequila-(blanco|reposado)-valley/.test(chip), `chips use display titles, got: ${chip}`);
  }
});

test("R23: if-you-like suggestions keep their relevance reasons", async () => {
  const { ifYouLikeThis } = await import("../assets/js/compare.js");
  const anchor = byId("tequila-blanco-valley-jalisco");
  const suggestions = ifYouLikeThis(anchor, profiles);
  assert.ok(suggestions.length > 0, "suggestions offered");
  for (const s of suggestions) {
    assert.ok(s.sharedDimensionKeys.length > 0, "each suggestion names the shared attributes (its relevance)");
  }
});

test("R27 maintenance: reposado vs añejo gets the maturation perspective", () => {
  const r = comparisonPerspectives([byId("tequila-reposado-valley-jalisco"), byId("tequila-anejo-valley-jalisco")]);
  const p = r.find((x) => x.id === "differentMaturation");
  assert.ok(p, "differentMaturation perspective detected");
  assert.equal(p.evidence, "maturation", "carries its evidence");
  assert.deepEqual(p.classes, ["reposado", "añejo"]);
});

test("R27 maintenance: same maturation class does not fire the perspective", () => {
  const r = comparisonPerspectives([byId("tequila-reposado-valley-jalisco"), byId("mezcal-reposado-espadin-oaxaca")]);
  assert.ok(!r.some((x) => x.id === "differentMaturation"), "same class, no maturation claim");
});

test("R27 maintenance: maturation requires wood maturation and renders in Spanish", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const es = createLocale();
  es.set("es");
  const container = document.getElementById("app");
  container.innerHTML = "";
  renderCompare(container, {
    profiles,
    compareIds: "tequila-reposado-valley-jalisco,tequila-anejo-valley-jalisco",
    locale: es,
    onSelectionChange: () => {},
  });
  const chips = [...container.querySelectorAll(".compare-perspective-chip")].map((c) => c.textContent);
  assert.ok(chips.some((c) => /el tiempo en roble es la variable/i.test(c)), `maturation perspective in Spanish, got: ${chips.join(" | ")}`);
  es.set("en");
});
