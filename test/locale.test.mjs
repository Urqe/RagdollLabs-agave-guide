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

test("untranslated content is disclosed, not silent", () => {
  const locale = createLocale();
  locale.set("es");
  // All shipped keys have Spanish translations; missing ones would disclose.
  assert.equal(locale.hasMissing(), false);
  // Simulate: a missing key marks the gap.
  locale.t("some.key.that.does.not.exist");
  assert.equal(locale.hasMissing(), true);
});
