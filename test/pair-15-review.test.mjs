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
globalThis.localStorage = dom.window.localStorage;
globalThis.sessionStorage = dom.window.sessionStorage;

const read = (p) => readFile(new URL("../" + p, import.meta.url), "utf8");
const { profiles } = JSON.parse(await read("assets/data/profiles.json"));
const { bottles } = JSON.parse(await read("assets/data/bottles.json"));
const { sources: sourceList } = JSON.parse(await read("assets/data/sources.json"));
const { plants } = JSON.parse(await read("assets/data/plants.json"));
const { regions } = JSON.parse(await read("assets/data/regions.json"));
const { traditions } = JSON.parse(await read("assets/data/traditions.json"));
const { chapters } = JSON.parse(await read("assets/data/chapters.json"));

const { renderCatalogue } = await import("../assets/js/catalogue-view.js");
const { renderLesson, JOURNEY_STEPS } = await import("../assets/js/journey.js");
const { createLocale } = await import("../assets/js/locale.js");
const en = createLocale();
const es = createLocale();
es.set("es");

// A raw key leaks when the rendered text contains a lookup key that exists in
// either shared string bundle — the source-validated form of the missing-string
// check, rather than a prose-agnostic regex alone.
const presentationSrc = await read("assets/js/presentation.js");
const localeSrc = await read("assets/js/locale.js");
const knownKeys = new Set();
for (const m of presentationSrc.matchAll(/"([A-Za-z][A-Za-z0-9._]*)"\s*:/g)) knownKeys.add(m[1]);
for (const m of localeSrc.matchAll(/"([A-Za-z][A-Za-z0-9._]*)"\s*:\s*"/g)) knownKeys.add(m[1]);
// Bare single-word keys collide with natural prose ("es", "all"), so the
// rendered-text sweep only checks dotted lookup keys; bare keys are covered
// by the source-validated ui() bundle test above.
const keyAlt = [...knownKeys].filter((k) => k.includes("."))
  .sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/\./g, "\\."));
const RAW_KEY = keyAlt.length
  ? new RegExp("(?<![\\w.])(" + keyAlt.join("|") + ")(?![\\w])")
  : /^(?!x)x/;

test("pair 15: every lookup key used with ui() resolves in both shared bundles", async () => {
  const jsFiles = [
    "assets/js/catalogue-view.js",
    "assets/js/discovery-view.js",
    "assets/js/journey.js",
    "assets/js/learn-view.js",
    "assets/js/plant-tradition-view.js",
    "assets/js/presentation.js",
    "assets/js/profile.js",
    "assets/js/compare-view.js",
    "assets/js/explore.js",
  ];
  const copySections = presentationSrc.split("const COPY = {", 2)[1] ?? "";
  for (const file of jsFiles) {
    const src = await read(file);
    for (const m of src.matchAll(/ui\((?:locale|null|[a-zA-Z]+),\s*"([A-Za-z][A-Za-z0-9._]*)"\)/g)) {
      const quoted = '"' + m[1] + '":';
      const bare = new RegExp('(?<!["\\w])' + m[1].replace(/\./g, "\\.") + '\\s*:')
        .test(copySections);
      assert.ok(copySections.includes(quoted) || bare,
        `${file}: ui() key "${m[1]}" missing from presentation COPY`);
    }
  }
});

test("pair 15: all five lessons render with no raw keys in any text (EN and ES)", () => {
  for (const locale of [en, es]) {
    for (const step of JOURNEY_STEPS) {
      const c = document.createElement("div");
      renderLesson(c, { lessonId: step.id, profiles, chapters, locale });
      for (const node of c.querySelectorAll("*")) {
        const text = node.textContent ?? "";
        assert.ok(!RAW_KEY.test(text),
          `${step.id} (${locale.get()}): raw key leaked: ${text.slice(0, 80)}`);
      }
    }
  }
});

test("pair 15: the chapter example card labels the real chapter, not learn.heading", () => {
  for (const locale of [en, es]) {
    const c = document.createElement("div");
    renderLesson(c, { lessonId: "how-to-taste", profiles, chapters, locale });
    const cards = [...c.querySelectorAll(".discovery-card strong")].map((s) => s.textContent);
    const flavour = chapters.find((ch) => ch.id === "understanding-flavour");
    assert.ok(cards.includes(flavour.title),
      `${locale.get()}: chapter card should carry the localized chapter title`);
    assert.ok(!cards.includes("learn.heading") && !cards.includes("Learn"),
      `${locale.get()}: chapter card must not fall back to the generic Learn label`);
  }
});

test("pair 15: Balam catalogue entry shows the localized noReviewYet message, not the raw key", () => {
  for (const locale of [en, es]) {
    const c = document.createElement("div");
    renderCatalogue(c, { bottles, profiles, sources: sourceList, locale });
    const input = c.querySelector("#catalogue-search");
    input.value = "balam";
    input.dispatchEvent(new dom.window.Event("input"));
    const balam = c.querySelector("#bottle-balam-raicilla-costa");
    assert.ok(balam, `${locale.get()}: factual entry found`);
    const text = balam.textContent;
    assert.ok(!text.includes("noReviewYet"), `${locale.get()}: raw key must not render`);
    assert.ok(/No attributed tasting note|A\u00fan no hay nota de cata/.test(text),
      `${locale.get()}: localized fallback shown`);
  }
});

test("pair 15: brand filter is snapshotted, restored, and clearable", () => {
  const c = document.createElement("div");
  const api = renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en, restore: null });
  const chip = [...c.querySelectorAll(".brand-index a")].find((a) => a.textContent === "Fortaleza");
  chip.dispatchEvent(new dom.window.Event("click", { cancelable: true }));
  const shown = () => [...c.querySelectorAll(".catalogue-summary h3")].map((h) => h.textContent);
  assert.equal(shown().length, 3, "Fortaleza filter shows three entries");
  const snap = api.snapshot();
  assert.equal(snap.brandFilter, "Fortaleza", "snapshot carries brandFilter");

  const c2 = document.createElement("div");
  renderCatalogue(c2, { bottles, profiles, sources: sourceList, locale: en, restore: snap });
  assert.equal([...c2.querySelectorAll(".catalogue-summary h3")].length, 3,
    "restore brings back the three Fortaleza entries");
  const clear = c2.querySelector(".catalogue-active-brand button");
  assert.ok(clear, "active brand exposes a clear action");
  clear.dispatchEvent(new dom.window.Event("click"));
  assert.equal([...c2.querySelectorAll(".catalogue-summary h3")].length, bottles.length,
    "clearing the brand filter restores the full catalogue");
});

test("pair 15: an a\u00f1ejo mezcal is not presented as reposado, aged sotol not as unaged style", () => {
  const ilegal = bottles.find((b) => b.id === "ilegal-mezcal-anejo");
  const sotol = bottles.find((b) => b.id === "hacienda-de-chihuahua-sotol-anejo");
  assert.equal(ilegal.profileId, null, "Ilegal a\u00f1ejo no longer maps onto the reposado profile");
  assert.ok((ilegal.coverage || []).includes("profile-not-covered"), "Ilegal a\u00f1ejo disclosed as uncovered");
  assert.match(ilegal.batch, /14 months/, "the a\u00f1ejo maturation fact is kept");
  assert.equal(sotol.profileId, null, "aged sotol no longer maps onto the unaged sotol profile");
  assert.ok((sotol.coverage || []).includes("profile-not-covered"), "aged sotol disclosed as uncovered");
  assert.match(sotol.batch, /2 years/, "the sotol maturation fact is kept");

  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  for (const id of ["ilegal-mezcal-anejo", "hacienda-de-chihuahua-sotol-anejo"]) {
    const entry = c.querySelector(`#bottle-${id}`);
    assert.equal(entry.querySelector(".catalogue-profile-link"), null,
      `${id}: uncovered bottle carries no style-profile link`);
    assert.ok(entry.querySelector(".editorial-note"),
      `${id}: editorial note explains the coverage decision`);
  }
});

test("pair 15: content corrections hold in the source data", () => {
  const comiteco = profiles.find((p) => p.id === "comiteco-aguamiel-chiapas");
  assert.match(comiteco.category, /Indicaci\u00f3n Geogr\u00e1fica/, "comiteco states its IG protection");
  assert.ok(!/not a spirit with a denomination of origin/.test(comiteco.category),
    "the outdated no-DO claim is gone");
  assert.match(comiteco.context, /6 October 2025/, "declaration date recorded");
  assert.match(comiteco.plant, /Agave americana L\./, "IG plant identity recorded");

  const anejo = profiles.find((p) => p.id === "tequila-anejo-valley-jalisco");
  assert.ok(!/middle of the legal range/.test(anejo.context), "no invented legal range for a\u00f1ejo");
  const extra = profiles.find((p) => p.id === "tequila-extra-anejo-highland-jalisco");
  assert.ok(!/longer side of the legal range/.test(extra.context), "no invented legal range for extra a\u00f1ejo");
  assert.ok(!/only agave that can carry that much oak/.test(extra.context), "no only-highland-oak claim");

  const sotol = profiles.find((p) => p.id === "sotol-chihuahua");
  assert.ok(!/sustainable by design/.test(sotol.whyItTastes), "no sustainable-by-design claim");
  assert.ok(!/illegal in Mexico before 1994/.test(sotol.context), "no unqualified nationwide-ban claim");
  const bacanora = profiles.find((p) => p.id === "bacanora-pacifica-sierra-sonora");
  assert.match(bacanora.context, /1915\u20131992/, "prohibition timeline kept");
  assert.match(bacanora.context, /legalized again in 1992/, "legalization year distinguished from the DO");
});
