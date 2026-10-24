import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.test/RagdollLabs-agave-guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;

const { createLocale } = await import("../assets/js/locale.js");

test("locale stays out of routes and IDs", async () => {
  const locale = createLocale();
  locale.set("es");
  const profiles = JSON.parse(await readFile(path.join(root, "assets/data/profiles.json"), "utf8")).profiles;
  for (const p of profiles) {
    assert.ok(!/-es$|-en$/.test(p.id), `${p.id} carries no locale suffix`);
  }
  // Hash routes never embed a locale prefix.
  const { parseHash } = await import("../assets/js/router.js");
  assert.deepEqual(parseHash("#/explore"), { name: "explore", params: {} });
});

test("spanish strings translate the UI chrome and fall back to English", () => {
  const locale = createLocale();
  locale.set("en");
  assert.equal(locale.t("explore.heading"), "Explore by state");
  locale.set("es");
  assert.equal(locale.t("explore.heading"), "Explora por estado");
  assert.equal(locale.t("catalogue.heading"), "Cat\u00e1logo de botellas");
  // Unknown keys fall back to the key itself; known keys never leak.
  assert.equal(locale.t("nonexistent.key"), "nonexistent.key");
});

test("spanish alphabetical behavior via locale-aware compare", () => {
  const locale = createLocale();
  locale.set("es");
  const sorted = locale.sort(["\u00c1lamos", "Aguascalientes", "Zacatecas", "Bacanora"], (x) => x);
  // Spanish treats Á as A: Álamos sorts with the A's, not after Z.
  assert.equal(sorted[0] > "A" ? sorted[0] : sorted[0], sorted[0]);
  assert.ok(sorted.indexOf("\u00c1lamos") < sorted.indexOf("Bacanora"), "\u00c1lamos sorts before B in Spanish");
});

test("translation fallback chain: es string, English fallback, then the key", () => {
  const locale = createLocale();
  locale.set("es");
  // Shipped keys have Spanish translations.
  assert.equal(locale.t("profile.backExplore"), "\u2190 Volver a explorar");
  // Unknown keys fall through both bundles to the raw key, which callers
  // only pass for dynamic keys (e.g. level.* ranks).
  assert.equal(locale.t("some.key.that.does.not.exist"), "some.key.that.does.not.exist");
});

test("release 14: compare view fully translates in Spanish", async () => {
  localStorage.clear();
  const { readFile: rf } = await import("node:fs/promises");
  const path = await import("node:path");
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const profiles = JSON.parse(await rf(path.join(root, "assets/data/profiles.json"), "utf8")).profiles;
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const es = createLocale();
  es.set("es");

  const container = document.createElement("div");
  document.body.appendChild(container);
  const withGap = { ...profiles[0], sensory: { ...profiles[0].sensory, smoke: null } };
  const ids = [profiles[0].id, profiles[1].id].join(",");
  renderCompare(container, { profiles: [withGap, profiles[1]], locale: es, compareIds: ids, onSelectionChange: () => {} });

  assert.equal(container.querySelector("#compare-heading").textContent, "Compara estilos");
  const cells = [...container.querySelectorAll(".compare-table tbody td")].map((c) => c.textContent);
  assert.ok(cells.includes("Nada") || cells.includes("Medio") || cells.includes("Bajo"), "levels translated");
  assert.ok(!cells.includes("Not documented"), "no English leakage in cells");
  assert.ok(!cells.includes("compare."), "no raw keys leak into cells");
  const remove = container.querySelector(".compare-remove-button");
  assert.equal(remove.textContent, "Quitar");
  assert.ok(container.textContent.includes("Mayores diferencias"), "diffs heading translated");
  assert.equal(container.querySelector(".compare-unknown")?.textContent, "No documentado");
  container.remove();
});

test("release 14: moods translate via locale.mood and home via strings", () => {
  localStorage.clear();
  const es = createLocale();
  es.set("es");
  assert.equal(es.mood("Smoke-forward"), "Con humo");
  assert.equal(es.mood("Clean & herbal"), "Limpio y herbal");
  assert.equal(es.mood("Long finish"), "Final largo");
  assert.equal(es.t("home.heading"), "Gu\u00eda de estilos de destilados de agave");
  assert.equal(es.t("home.cta"), "Explora el mapa de M\u00e9xico \u2192");
  // EN unchanged (fresh storage so the persisted ES choice does not leak in)
  localStorage.clear();
  const en = createLocale();
  assert.equal(en.mood("Smoke-forward"), "Smoke-forward");
});

test("pair 4: Spanish terminology stays consistent with the glossary's canonical terms", async () => {
  const es = JSON.parse(await readFile(new URL("../assets/data/content-es.json", import.meta.url), "utf8"));
  // commonNameRegions is keyed by the English label it translates (a lookup
  // key, never rendered); only its Spanish values are reader-facing prose.
  if (es.commonNameRegions) es.commonNameRegions = Object.values(es.commonNameRegions);
  const all = JSON.stringify(es);
  // The glossary term is "100% de agave"; translations must not drift to "100% agave".
  assert.equal((all.match(/100% agave/g) || []).length, 0, "no '100% agave' without the Spanish preposition");
  assert.ok((all.match(/100% de agave/g) || []).length > 20, "canonical form used throughout");
  // No English leakage beyond publication proper nouns.
  const prose = all.toLowerCase();
  for (const w of [" and ", " with ", " from ", " oak ", " wood ", " tasting note"]) {
    assert.ok(!prose.includes(w), `English leakage: ${w.trim()}`);
  }
  // ' the ' may only appear inside publication names.
  let idx = 0; let bad = null;
  while ((idx = prose.indexOf(" the ", idx)) !== -1) {
    const ctx = prose.slice(Math.max(0, idx - 20), idx + 24);
    if (!/rum howler|tequila whisperer|whiskey shelf|daily pour|lost explorer/.test(ctx)) { bad = ctx; break; }
    idx += 5;
  }
  assert.equal(bad, null, `unattributed English 'the' in ES content: ${bad}`);
});
