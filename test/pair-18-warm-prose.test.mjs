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
const contentEs = JSON.parse(await read("assets/data/content-es.json"));

const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const en = createLocale();
en.set("en");
localStorage.clear();
const es = createLocale();
es.set("es");

const bottleById = new Map(bottles.map((b) => [b.id, b]));
const profileById = new Map(profiles.map((p) => [p.id, p]));

test("P18-5: Clande Yellow replaces vague acclaim with the cited review's sensory detail", () => {
  const clande = bottleById.get("clande-sotol-yellow");
  const review = clande.reviewSummary;
  assert.ok(!/Pure magic|favorite sotol/i.test(review), "the vague acclaim is gone");
  assert.ok(/banana, wood, cotija cheese, honey and nuts/.test(review),
    "the summary now conveys aroma, texture and flavor from the cited review");
  const esReview = contentEs.bottles["clande-sotol-yellow"].reviewSummary;
  assert.ok(/pl\u00e1tano, madera, queso cotija, miel y nueces/.test(esReview),
    "the ES mirror carries the same sensory detail");
  assert.ok(!/Magia pura/.test(esReview), "ES vague acclaim gone");
});

test("P18-5: Fortaleza Blanco drops the site's comparative judgment for sensory character", () => {
  const fortaleza = bottleById.get("fortaleza-blanco");
  const review = fortaleza.reviewSummary;
  assert.ok(!/more complexity than most/.test(review), "the comparative judgment is gone");
  assert.ok(/savou?ry, assertive cooked agave/.test(review), "the character description stays");
  assert.ok(/long, minerally finish/.test(review), "the finish is described, not just praised");
  const esReview = contentEs.bottles["fortaleza-blanco"].reviewSummary;
  assert.ok(!/m\u00e1s complejidad que la mayor\u00eda/.test(esReview), "ES comparative judgment gone");
  assert.ok(/final largo y mineral/.test(esReview), "ES mirror describes the finish");
});

test("P18-5: invented local testimony is gone; warmth is built from documented facts", () => {
  for (const [id, field] of [["sotol-chihuahua", "context"]]) {
    const enText = profileById.get(id)[field];
    const esText = contentEs.profiles[id][field];
    assert.ok(!/Ask a sotolero|you will hear it plainly/i.test(enText),
      "EN invented testimony removed");
    assert.ok(!/Un sotolero te lo dir\u00e1/.test(esText), "ES invented testimony removed");
    assert.ok(/vinatas .* kept the tradition alive|clandestine production/.test(enText),
      "EN warmth comes from documented history, makers and vocabulary");
    assert.ok(esText.includes("Las vinatas de la sierra mantuvieron viva la tradici\u00f3n"),
      "ES warmth comes from documented history");
    // The legal qualification is preserved without the invented speech.
    assert.ok(/no single nationwide pre-1994 ban/.test(enText), "EN legal qualification kept");
    assert.ok(esText.includes("no afirma una sola prohibici\u00f3n nacional"), "ES legal qualification kept");
  }
});

test("P18-5: the ES language defects are corrected across the whole file", () => {
  const all = JSON.stringify(contentEs);
  assert.ok(!all.includes("cucci"), "the cucci\u00f3n typo is gone");
  assert.ok(!all.includes("de el bacanora"), "de el bacanora contracted to del bacanora");
  assert.ok(!all.includes("se leen sabrosos"), "the awkward se leen sabrosos phrasing is gone");
  assert.ok(!all.includes("hacerla fue prohibido"), "el bacanora gender is consistent (masculine)");
  assert.ok(!all.includes("La bacanora tradicional"), "no feminine article on bacanora");
});

test("P18-5: routine model/evidence explanations moved out of the intros", async () => {
  const catalogueIntroEn = en.t("catalogue.intro");
  assert.ok(!/attributed to their source|labeled editorial|borrowing character/.test(catalogueIntroEn),
    "the EN catalogue intro no longer explains the evidence model");
  const catalogueIntroEs = es.t("catalogue.intro");
  assert.ok(!/se atribuyen a su fuente|tomar car\u00e1cter prestado/.test(catalogueIntroEs),
    "the ES catalogue intro no longer explains the evidence model");
  const compareIntroEn = en.t("compare.intro");
  assert.ok(!/Choosing an example bottle never turns/.test(compareIntroEn),
    "the EN compare intro drops the model mechanic");
  assert.ok(/Sensory levels are editorial impressions/.test(compareIntroEn),
    "the material editorial-levels qualification stays in the compare intro");
  const compareIntroEs = es.t("compare.intro");
  assert.ok(!/Elegir una botella de ejemplo nunca convierte/.test(compareIntroEs),
    "the ES compare intro drops the model mechanic");
  assert.ok(compareIntroEs.includes("impresiones editoriales"),
    "the ES material qualification stays");
  // The evidence-kind teaching lives in the Learn chapter instead.
  const { chapters } = JSON.parse(await read("assets/data/chapters.json"));
  const labels = chapters.find((c) => c.id === "understanding-labels");
  const evidenceBlock = labels.blocks.find((b) => /Independent reviews, producer descriptions/.test(b.text));
  assert.ok(evidenceBlock, "the Learn chapter still teaches the evidence kinds");
});

test("P18-5: the corrected sotol context renders end to end in both languages", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  for (const locale of [en, es]) {
    const sotol = profileById.get("sotol-chihuahua");
    const bottle = bottleById.get(sotol.exampleBottleId);
    const root = document.createElement("div");
    renderProfile(root, { profile: sotol, bottle, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale });
    const context = root.querySelector(".profile-context").textContent;
    assert.ok(!/Ask a sotolero|Un sotolero te lo dir\u00e1/.test(context),
      `no invented testimony renders in ${locale.get()}`);
    const expected = locale.get() === "es"
      ? contentEs.profiles["sotol-chihuahua"].context
      : sotol.context;
    assert.ok(context.includes(expected.slice(0, 60)), `the corrected context renders in ${locale.get()}`);
  }
});
