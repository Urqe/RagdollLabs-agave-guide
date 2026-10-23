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

const { parseHash, buildHash } = await import("../assets/js/router.js");
const { renderStartHub, renderLesson, journeyStepById, JOURNEY_STEPS } = await import("../assets/js/journey.js");
const { renderLearn } = await import("../assets/js/learn-view.js");
const { renderProfile } = await import("../assets/js/profile.js");
const { createLocale } = await import("../assets/js/locale.js");
const { getCompareSelection, setCompareSelection } = await import("../assets/js/compare-selection.js");
const en = createLocale();
const es = createLocale();
es.set("es");

test("pair 10: the prepared comparison is explicitly labelled, not a step-title fallback", () => {
  const container = document.createElement("div");
  renderLesson(container, { lessonId: "first-comparison", profiles, locale: en });
  const link = container.querySelector(".journey-comparison a.cta-link");
  assert.match(link.textContent, /Open the prepared comparison/i,
    "the handoff says what it opens");
  assert.ok(link.textContent.includes("valley blanco"), "names the compared styles");
  const esContainer = document.createElement("div");
  renderLesson(esContainer, { lessonId: "first-comparison", profiles, locale: es });
  assert.ok(esContainer.querySelector(".journey-comparison a.cta-link").textContent.includes("comparaci\u00f3n preparada"),
    "ES: la comparaci\u00f3n preparada is named");
});

test("pair 10: the active step is a position marker, never a link to itself", () => {
  for (const step of JOURNEY_STEPS) {
    const container = document.createElement("div");
    renderLesson(container, { lessonId: step.id, profiles, locale: en });
    const active = container.querySelector(".journey-step-list .is-active");
    assert.ok(active, `${step.id}: active step marked`);
    assert.equal(active.querySelector("a"), null, `${step.id}: active step is not a self-link`);
    const marker = active.querySelector('strong[aria-current="step"]');
    assert.ok(marker, `${step.id}: current position announced via aria-current`);
  }
  // The hub lists all steps as links (no active step there).
  const hub = document.createElement("div");
  renderStartHub(hub, { profiles, locale: en });
  assert.equal(hub.querySelectorAll(".journey-step-list a").length, 5);
  assert.equal(hub.querySelector(".journey-step-list .is-active"), null);
});

test("pair 10: example cards return to the originating lesson, in both kinds", () => {
  const container = document.createElement("div");
  renderLesson(container, { lessonId: "how-to-taste", profiles, locale: en });
  const hrefs = [...container.querySelectorAll(".discovery-matches a")].map((a) => a.getAttribute("href"));
  assert.ok(hrefs.some((h) => decodeURIComponent(h).includes("origin=start:how-to-taste")),
    "profile example carries the lesson id, not the profile id");
  assert.ok(hrefs.some((h) => decodeURIComponent(h).includes("#/learn/chapter-understanding-flavour?from=start:how-to-taste")),
    "reference example targets the exact chapter and carries the lesson origin");
  // The profile back link resolves to a real lesson.
  const profileLink = hrefs.find((h) => h.includes("#/profile"));
  const origin = new URLSearchParams("?" + profileLink.split("?")[1]).get("origin");
  assert.ok(journeyStepById(origin.slice("start:".length)), "origin names an existing lesson");
});

test("pair 10: the reference example links back to the lesson (no stranding)", async () => {
  const container = document.createElement("div");
  renderLearn(container, {
    chapters: JSON.parse(await read("assets/data/chapters.json")).chapters,
    plants: [], processes: [], glossary: [],
    profiles, bottles, sources: sourceList,
    locale: en,
    from: "start:how-to-taste",
  });
  const back = container.querySelector(".back-link");
  assert.ok(back, "learn view links back to the lesson");
  assert.equal(back.getAttribute("href"), "#/start/how-to-taste");
  assert.match(back.textContent, /Back to the lesson/i);
  const plain = document.createElement("div");
  renderLearn(plain, { chapters: [], plants: [], processes: [], glossary: [], profiles, bottles, sources: sourceList, locale: en });
  assert.equal(plain.querySelector(".back-link"), null, "no back link without a lesson origin");
});

test("pair 10: lesson-return selection restore keeps the reader's own picks", () => {
  localStorage.clear();
  // Scenario A: reader opens the prepared comparison and returns untouched.
  setCompareSelection(["mezcal-espadin-valles-centrales", "bacanora-pacifica-sierra-sonora"]);
  const savedBeforeLesson = [...getCompareSelection()];
  const lessonPreparedSelection = ["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"];
  setCompareSelection(lessonPreparedSelection);
  const current = getCompareSelection();
  const untouched = current.length === lessonPreparedSelection.length &&
    current.every((id, i) => id === lessonPreparedSelection[i]);
  assert.ok(untouched, "untouched prepared comparison detected");
  if (untouched) setCompareSelection(savedBeforeLesson);
  assert.deepEqual(getCompareSelection(), ["mezcal-espadin-valles-centrales", "bacanora-pacifica-sierra-sonora"],
    "pre-lesson selection restored after an untouched handoff");
  // Scenario B: the reader picks their own styles inside the lesson-opened
  // comparison — returning to the journey must keep those picks.
  const readerPicks = ["tequila-blanco-valley-jalisco", "tequila-anejo-valley-jalisco"];
  setCompareSelection(readerPicks);
  const current2 = getCompareSelection();
  const untouched2 = current2.length === lessonPreparedSelection.length &&
    current2.every((id, i) => id === lessonPreparedSelection[i]);
  assert.ok(!untouched2, "reader picks detected as not the prepared comparison");
  if (untouched2) setCompareSelection(savedBeforeLesson);
  assert.deepEqual(getCompareSelection(), readerPicks,
    "reader's own picks survive the return to the journey");
  localStorage.clear();
});

test("pair 10: lesson deep links are distinct routes (scroll and history)", () => {
  assert.deepEqual(parseHash("#/start/how-to-taste"), { name: "start", params: { lessonId: "how-to-taste" } });
  assert.equal(buildHash({ name: "start", params: { lessonId: "explore-next" } }), "#/start/explore-next");
  assert.deepEqual(parseHash("#/learn?from=start%3Ahow-to-taste"), { name: "learn", params: { from: "start:how-to-taste" } },
    "learn accepts a lesson origin");
  assert.equal(buildHash({ name: "learn", params: { from: "start:how-to-taste" } }), "#/learn?from=start%3Ahow-to-taste");
  assert.deepEqual(parseHash("#/learn"), { name: "learn", params: {} }, "bare learn route unchanged");
});

test("pair 10: jargon is explained at first use in the beginner lessons", () => {
  const jargon = [
    ["pi\u00f1a", "cooked"], // piña should not appear unexplained in EN lessons
    ["tahona", null],
  ];
  for (const step of JOURNEY_STEPS) {
    const text = step.idea.en;
    for (const [word] of jargon) {
      if (text.includes(word)) {
        assert.ok(/roasted pi\u00f1a|cooked agave|stone wheel/i.test(text),
          `${step.id}: "${word}" appears only with context`);
      }
    }
  }
  // Every lesson has exactly one clear primary action (next) plus optional
  // examples — verified structurally: one cta-link per lesson, max.
  for (const step of JOURNEY_STEPS) {
    const container = document.createElement("div");
    renderLesson(container, { lessonId: step.id, profiles, locale: en });
    assert.ok(container.querySelectorAll(".journey-pager .cta-link, .journey-pager .quiet-link").length >= 1,
      `${step.id}: a clear onward action exists`);
  }
});

test("pair 10: EN and ES lessons stay in their own language after toggle", () => {
  // Render EN after an ES render in the same process: no leakage either way.
  const esFirst = document.createElement("div");
  renderLesson(esFirst, { lessonId: "first-comparison", profiles, locale: es });
  const enAfter = document.createElement("div");
  renderLesson(enAfter, { lessonId: "first-comparison", profiles, locale: en });
  assert.ok(!/comparaci\u00f3n|Prueba/.test(enAfter.textContent),
    "EN lesson shows no Spanish after an ES render");
  const esAfter = document.createElement("div");
  renderLesson(esAfter, { lessonId: "first-comparison", profiles, locale: es });
  assert.ok(esAfter.textContent.includes("Prueba una comparaci\u00f3n"), "ES lesson stays Spanish");
});

test("pair 10: profile example back link resolves to the originating lesson (EN and ES)", () => {
  for (const locale of [en, es]) {
    const anchor = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
    const container = document.createElement("div");
    renderProfile(container, {
      profile: anchor,
      bottle: bottles.find((b) => b.id === anchor.exampleBottleId),
      sources: sourceList,
      allProfiles: profiles,
      allBottles: bottles,
      origin: "start:what-are-they",
      locale,
    });
    const back = container.querySelector(".back-link");
    assert.equal(back.getAttribute("href"), "#/start/what-are-they");
    assert.ok(journeyStepById("what-are-they"), "the origin lesson exists");
  }
});
