import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></html></html>", {
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
const { chapters } = JSON.parse(await read("assets/data/chapters.json"));
const contentEs = JSON.parse(await read("assets/data/content-es.json"));

const { renderLesson, renderStartHub, JOURNEY_STEPS } = await import("../assets/js/journey.js");
const { createLocale } = await import("../assets/js/locale.js");
const { parseHash } = await import("../assets/js/router.js");
const { renderCompare } = await import("../assets/js/compare-view.js");
const { renderCatalogue } = await import("../assets/js/catalogue-view.js");
const en = createLocale();
const es = createLocale();
es.set("es");

// Pair 24 extended the four-step sequence to the six-step guided tasting
// (sip and texture became separate steps; reflect was added). The content
// checks below are unchanged.
test("pair 16: how-to-taste teaches a usable practical sequence in both languages", () => {
  for (const locale of [en, es]) {
    const container = document.createElement("div");
    renderLesson(container, { lessonId: "how-to-taste", profiles, chapters, locale });
    const practice = container.querySelector(".lesson-practice");
    assert.ok(practice, `${locale.get()}: practical sequence renders in the reading flow`);
    const steps = [...practice.querySelectorAll(".lesson-practice-step")];
    assert.equal(steps.length, 6, `${locale.get()}: six guided steps`);
    assert.ok(!container.querySelector("details.lesson-practice"),
      `${locale.get()}: the technique is not buried in a collapsed paragraph`);
    const headings = steps.map((s) => s.querySelector("strong").textContent);
    if (locale.get() === "en") {
      assert.deepEqual(headings, ["Prepare", "Smell, gently", "Sip", "Texture and warmth", "Follow the finish", "Reflect"]);
      assert.ok(practice.textContent.includes("no special stemware"));
      assert.ok(practice.textContent.includes("swirl"));
      assert.ok(practice.textContent.includes("warmth"));
    } else {
      assert.ok(practice.textContent.includes("copa peque"));
      assert.ok(practice.textContent.includes("textura"));
    }
  }
});

test("pair 16: tasting sequence never requires drinking, swallowing or buying", () => {
  const container = document.createElement("div");
  renderLesson(container, { lessonId: "how-to-taste", profiles, chapters, locale: en });
  const text = container.textContent;
  assert.ok(text.includes("nothing here requires swallowing"), "spitting is offered");
  assert.ok(!/must purchase|need to buy|required to drink/i.test(text), "no purchase or completion drinking");
});

test("pair 16: hub outcomes promise a tasting sequence, not only vocabulary", () => {
  for (const locale of [en, es]) {
    const container = document.createElement("div");
    renderStartHub(container, { profiles, locale });
    const outcome = container.querySelector(".journey-outcome").textContent;
    assert.ok(locale.get() === "en"
      ? /aroma, flavour, body, alcohol warmth and finish/.test(outcome) && /guided tasting/.test(outcome)
      : /aroma, sabor, cuerpo, calor del alcohol y final/.test(outcome) && /cata guiada/.test(outcome),
      `${locale.get()}: the outcome names the taught sequence`);
    assert.ok(!/no purchase, no glass, no account, no quiz/.test(outcome),
      `${locale.get()}: the repeated reassurance list is gone`);
  }
});

test("pair 16: the flavour-chapter example deep-links to the exact chapter with the lesson origin", () => {
  const container = document.createElement("div");
  renderLesson(container, { lessonId: "how-to-taste", profiles, chapters, locale: en });
  const hrefs = [...container.querySelectorAll(".discovery-matches a")].map((a) => a.getAttribute("href"));
  const chapterLink = hrefs.find((h) => h.includes("chapter-understanding-flavour"));
  assert.ok(chapterLink, "chapter example links to the chapter route");
  assert.ok(decodeURIComponent(chapterLink).includes("from=start:how-to-taste"), "lesson origin preserved");
  const route = parseHash("#" + chapterLink.replace(/^#/, ""));
  assert.equal(route.name, "learn");
  assert.equal(route.params.section, "chapter-understanding-flavour");
});

test("pair 16: learn routes keep supporting reference sections and gain chapter addressing", () => {
  assert.deepEqual(parseHash("#/learn/terms"), { name: "learn", params: { section: "terms" } });
  assert.deepEqual(parseHash("#/learn/plants"), { name: "learn", params: { section: "plants" } });
  const r = parseHash("#/learn/chapter-understanding-flavour?from=start:how-to-taste");
  assert.equal(r.params.section, "chapter-understanding-flavour");
  assert.equal(r.params.from, "start:how-to-taste");
  assert.equal(parseHash("#/learn/chapter-not-a-real-chapter").name, "learn");
});

test("pair 16: a lesson-opened comparison shows its explanation before the full picker", () => {
  const container = document.createElement("div");
  renderCompare(container, {
    profiles,
    compareIds: "tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco",
    from: "start:first-comparison",
    locale: en,
  });
  const summary = container.querySelector(".compare-summary");
  const changeStyles = container.querySelector("details.compare-change-styles");
  assert.ok(summary, "explanation renders for the prepared comparison");
  assert.ok(changeStyles, "changing styles stays available as a secondary control");
  assert.ok(container.querySelector(".compare-change-styles .compare-picker"), "the full picker lives inside the secondary control");
  assert.ok(
    (container.compareViewOrder = [...container.querySelectorAll(".compare-summary, .compare-change-styles")]),
    "both render",
  );
  const order = [...container.children[0].children];
  assert.ok(order.indexOf(summary) < order.indexOf(changeStyles),
    "the explanation comes before the picker control");
});

test("pair 16: a general-purpose comparison keeps the picker in its usual place", () => {
  const container = document.createElement("div");
  renderCompare(container, {
    profiles,
    compareIds: "tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco",
    locale: en,
  });
  assert.equal(container.querySelector("details.compare-change-styles"), null,
    "no secondary control outside the lesson flow");
  assert.ok(container.querySelector(".compare-picker"), "the full picker renders directly");
});

test("pair 16: bottle descriptions lead with character; attribution moves to a compact basis line", () => {
  const container = document.createElement("div");
  renderCatalogue(container, { bottles, profiles, sources: sourceList, locale: en });
  const fortaleza = container.querySelector("#bottle-fortaleza-blanco");
  assert.ok(fortaleza, "entry renders");
  const review = fortaleza.querySelector(".bottle-review").textContent;
  assert.ok(review.startsWith("A benchmark lowland blanco"), "description opens with the expression's character");
  assert.ok(!/^reviewers|^a member|^according to|^difford/i.test(review), "no reviewer-led opening");
  const basis = fortaleza.querySelector(".bottle-basis");
  assert.ok(basis, "basis line present");
  assert.ok(basis.textContent.includes("review"), "basis line names the evidence kind");
});

test("pair 16: the basis line is honest about producer-only evidence", () => {
  const ocho = bottles.find((b) => b.id === "tequila-ocho-extra-anejo");
  assert.ok(ocho.reviewSummary.includes("producer's own notes"), "producer attribution stays explicit in prose");
  const container = document.createElement("div");
  renderCatalogue(container, { bottles, profiles, sources: sourceList, locale: en });
  const entry = container.querySelector("#bottle-tequila-ocho-extra-anejo");
  assert.ok(entry.textContent.includes("No independent review"), "the review gap stays stated");
});

test("pair 16: staged local speech and invented quotations are gone from profile voices", () => {
  const all = JSON.stringify(profiles);
  for (const banned of [
    "watch their chest",
    "Ask anyone",
    "they will tell you",
    "nobody calls that a flaw",
    "salt in its soul",
    "birthright of their hills",
    "Sonoran-style with lime",
    "small-occasion spirit",
    "florals fade in cocktails",
    "Margarita upgrade",
  ]) {
    assert.ok(!all.includes(banned), `staged/universal claim removed: ${banned}`);
  }
});

test("pair 16: serving guidance stays clearly editorial without repeating the label every sentence", () => {
  for (const profile of profiles) {
    if (!profile.pairing) continue;
    assert.match(profile.pairing.serving, /editorial|suggestion/i, `${profile.id} labeled editorial once`);
    const matches = profile.pairing.serving.match(/editorial suggestion/gi);
    assert.ok(!matches || matches.length <= 1, `${profile.id}: the editorial label appears at most once`);
  }
});

test("pair 16: the label walkthrough is clearly illustrative, never a real bottle", () => {
  const labels = chapters.find((c) => c.id === "understanding-labels");
  const walkthrough = labels.blocks.find((b) => (b.text || "").includes("illustrative label walkthrough"));
  assert.ok(walkthrough, "walkthrough block present");
  assert.ok(walkthrough.text.includes("invented for teaching, not a real bottle"), "explicitly not a real bottle");
  assert.ok(walkthrough.text.includes("Alc. Vol."), "ABV field taught");
  assert.ok(walkthrough.text.includes("cannot tell you what it tastes like"), "fields' limits taught");
});

test("pair 16: every rewritten bottle description keeps a Spanish counterpart", () => {
  let checked = 0;
  for (const bottle of bottles) {
    if (!bottle.reviewSummary) continue;
    const esEntry = contentEs.bottles[bottle.id];
    assert.ok(esEntry && esEntry.reviewSummary && esEntry.reviewSummary.length > 30,
      `${bottle.id}: Spanish reviewSummary present`);
    checked += 1;
  }
  assert.ok(checked >= 40, `all ${checked} reviewed bottles carry Spanish`);
});
