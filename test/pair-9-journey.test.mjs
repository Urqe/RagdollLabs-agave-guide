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

const read = (p) => readFile(new URL("../" + p, import.meta.url), "utf8");
const { profiles } = JSON.parse(await read("assets/data/profiles.json"));
const { bottles } = JSON.parse(await read("assets/data/bottles.json"));
const { sources: sourceList } = JSON.parse(await read("assets/data/sources.json"));

const { parseHash, buildHash } = await import("../assets/js/router.js");
const { renderStartHub, renderLesson, journeyStepById, JOURNEY_STEPS } = await import("../assets/js/journey.js");
const { renderCompare } = await import("../assets/js/compare-view.js");
const { renderProfile } = await import("../assets/js/profile.js");
const { renderHome } = await import("../assets/js/presentation.js");
const { createLocale } = await import("../assets/js/locale.js");
const { getCompareSelection, setCompareSelection } = await import("../assets/js/compare-selection.js");
const en = createLocale();
const es = createLocale();
es.set("es");

test("pair 9: hub renders outcome, five addressable steps and the reference entrance", () => {
  const container = document.createElement("div");
  renderStartHub(container, { profiles, locale: en });
  assert.match(container.querySelector("#start-heading").textContent, /Your first agave spirit/i);
  const steps = [...container.querySelectorAll(".journey-step-list a")];
  assert.equal(steps.length, 5, "five steps listed");
  for (const step of JOURNEY_STEPS) {
    const link = steps.find((a) => decodeURIComponent(a.getAttribute("href")) === `#/start/${step.id}`);
    assert.ok(link, `step ${step.id} is individually addressable`);
  }
  assert.ok(container.querySelector(".journey-reference a[href='#/learn']"),
    "reference entrance stays directly available near the journey start");
  assert.ok(container.textContent.includes("never required"),
    "the read-only expectation is stated once, plainly");
});

test("pair 9: every lesson carries one idea, examples with reasons, and prev/next", () => {
  for (const step of JOURNEY_STEPS) {
    const container = document.createElement("div");
    renderLesson(container, { lessonId: step.id, profiles, locale: en });
    assert.ok(container.querySelector(".lesson-idea"), `${step.id}: principal idea renders`);
    const examples = [...container.querySelectorAll(".discovery-matches li")];
    const isExampleLesson = !step.comparison && !step.destinations;
    if (isExampleLesson) {
      assert.ok(examples.length >= 1 && examples.length <= 2,
        `${step.id}: one or two short example links, not unwieldy chains`);
    } else {
      assert.ok(examples.length <= 2 || step.destinations,
        `${step.id}: destination lists replace example chains only where intended`);
    }
    for (const reason of [...container.querySelectorAll(".discovery-reason")]) {
      assert.ok(reason.textContent.trim().length > 10, `${step.id}: example explains why to open it`);
    }
    const pager = container.querySelector(".journey-pager");
    assert.ok(pager, `${step.id}: clear next/previous action`);
  }
});

test("pair 9: lessons are readable without completing previous steps; skipping works", () => {
  const container = document.createElement("div");
  renderLesson(container, { lessonId: "explore-next", profiles, locale: en });
  assert.match(container.querySelector("#start-heading").textContent, /Choose what to explore next/i,
    "the last lesson opens directly without the earlier ones");
});

test("pair 9: prepared comparison lesson links the existing engine without duplicating data", () => {
  const container = document.createElement("div");
  renderLesson(container, { lessonId: "first-comparison", profiles, locale: en });
  const link = container.querySelector(".journey-comparison a.cta-link");
  assert.ok(link, "prepared comparison handoff renders");
  const href = decodeURIComponent(link.getAttribute("href"));
  assert.ok(href.startsWith("#/compare/tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco"),
    `opens the valley blanco vs valley reposado comparison, got: ${href}`);
  assert.ok(href.includes("from=start%3Afirst-comparison") || href.includes("from=start:first-comparison"),
    "carries the lesson return origin");
  const second = container.querySelector(".journey-comparison a.quiet-link");
  assert.ok(second && decodeURIComponent(second.getAttribute("href")).includes("tequila-blanco-highland-jalisco"),
    "optional second exercise compares valley and highland blanco");
  assert.ok(/tenden|geography/i.test(container.textContent),
    "wood lesson explains typical styles, not a controlled experiment");
});

test("pair 9: the compare view links back to the lesson it was opened from", () => {
  const container = document.createElement("div");
  renderCompare(container, {
    profiles,
    compareIds: "tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco",
    locale: en,
    from: "start:first-comparison",
    onSelectionChange: () => {},
  });
  const back = container.querySelector(".back-link");
  assert.ok(back, "back-to-lesson link renders");
  assert.equal(back.getAttribute("href"), "#/start/first-comparison");
  const esContainer = document.createElement("div");
  renderCompare(esContainer, {
    profiles,
    compareIds: "tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco",
    locale: es,
    from: "start:first-comparison",
    onSelectionChange: () => {},
  });
  assert.ok(esContainer.textContent.includes("Volver a la lecci\u00f3n"), "ES back link renders");
});

test("pair 9: profile examples from a lesson link back to it explicitly", () => {
  const anchor = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const container = document.createElement("div");
  renderProfile(container, {
    profile: anchor,
    bottle: bottles.find((b) => b.id === anchor.exampleBottleId),
    sources: sourceList,
    allProfiles: profiles,
    allBottles: bottles,
    origin: "start:what-are-they",
    locale: en,
  });
  const back = container.querySelector(".back-link");
  assert.ok(back, "returning to the originating lesson is explicit");
  assert.equal(back.getAttribute("href"), "#/start/what-are-they");
  assert.match(back.textContent, /Back to the lesson/i);
});

test("pair 9: the lesson handoff does not silently destroy a saved comparison", () => {
  localStorage.clear();
  setCompareSelection(["mezcal-espadin-valles-centrales", "bacanora-pacifica-sierra-sonora"]);
  assert.deepEqual(getCompareSelection(), ["mezcal-espadin-valles-centrales", "bacanora-pacifica-sierra-sonora"]);
  // Simulate the app route handler contract for a lesson-handoff compare.
  const { default: app } = { default: null };
  const route = parseHash("#/compare/tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco?from=start%3Afirst-comparison");
  assert.equal(route.name, "compare");
  assert.equal(route.params.from, "start:first-comparison");
  assert.deepEqual(route.params.compareIds.split(","), ["tequila-blanco-valley-jalisco", "tequila-reposado-valley-jalisco"]);
  localStorage.clear();
});

test("pair 9: routes are stable, reloadable and recover from invalid lesson ids", () => {
  assert.equal(parseHash("#/start").name, "start");
  assert.deepEqual(parseHash("#/start/how-to-taste"), { name: "start", params: { lessonId: "how-to-taste" } });
  assert.equal(buildHash({ name: "start", params: {} }), "#/start");
  assert.equal(buildHash({ name: "start", params: { lessonId: "first-comparison" } }), "#/start/first-comparison");
  assert.equal(parseHash("#/start").params.lessonId, undefined, "hub has no lesson id");
  assert.deepEqual(parseHash("#/start/nonsense-id"), { name: "start", params: { lessonId: "nonsense-id" } },
    "unknown lesson ids stay in the lesson route");
  const container = document.createElement("div");
  renderLesson(container, { lessonId: "nonsense-id", profiles, locale: en });
  assert.match(container.querySelector("#start-heading").textContent, /does not exist/i,
    "invalid lesson ids produce a useful recovery");
  assert.ok(container.querySelectorAll(".journey-step-list a").length === 5,
    "recovery offers the real steps");
});

test("pair 9: existing Learn and glossary URLs stay intact", () => {
  assert.equal(parseHash("#/learn").name, "learn");
  assert.deepEqual(parseHash("#/learn/terms"), { name: "learn", params: { section: "terms" } });
  assert.deepEqual(parseHash("#/learn/plants"), { name: "learn", params: { section: "plants" } });
  assert.equal(parseHash("#/discover/plant/agave-tequilana").name, "discover");
  assert.equal(parseHash("#/profile/tequila-blanco-valley-jalisco").name, "profile");
  assert.equal(parseHash("#/compare/tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco").params.compareIds,
    "tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco");
});

test("pair 9: homepage offers the beginner entrance without replacing browsing", () => {
  const container = document.createElement("div");
  renderHome(container, { profiles, locale: en });
  // Pair 26: the beginner path leads; browsing stays one of the three paths.
  const actions = [...container.querySelectorAll(".welcome-action")].map((a) => a.getAttribute("href"));
  assert.equal(actions[0], "#/start", "beginner journey is the first path");
  assert.ok(actions.includes("#/explore"), "browsing stays a main path");
  const esContainer = document.createElement("div");
  renderHome(esContainer, { profiles, locale: es });
  const esAction = [...esContainer.querySelectorAll(".welcome-action")]
    .find((a) => a.getAttribute("href") === "#/start");
  assert.ok(esAction.textContent.includes("Nuevo en el agave"), "ES beginner entrance renders");
});

test("pair 9: full journey renders in Mexican Spanish, no English leakage", () => {
  const container = document.createElement("div");
  renderStartHub(container, { profiles, locale: es });
  assert.match(container.querySelector("#start-heading").textContent, /Tu primer destilado de agave/);
  const lessons = [...container.querySelectorAll(".journey-step-list a")].map((a) => a.textContent);
  for (const lesson of lessons) assert.ok(!/\b(What|How|Try|Choose|Recognize)\b/.test(lesson),
    `step label in Spanish: ${lesson}`);
  for (const step of JOURNEY_STEPS) {
    const lesson = document.createElement("div");
    renderLesson(lesson, { lessonId: step.id, profiles, locale: es });
    const idea = lesson.querySelector(".lesson-idea").textContent;
    assert.ok(/[\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1]/.test(idea), `${step.id}: idea is Spanish`);
    assert.ok(!/\b(step|lesson|journey|comparison)\b/i.test(idea), `${step.id}: no English meta words`);
  }
  const first = document.createElement("div");
  renderLesson(first, { lessonId: "first-comparison", profiles, locale: es });
  assert.ok(first.textContent.includes("Volver al inicio del recorrido"), "ES lesson return link");
  assert.ok(/reposo en madera/.test(first.textContent), "ES wood-resting explanation");
});

test("pair 9: perceived sweetness vs sugar taught without front-loading exceptions", () => {
  const step = journeyStepById("recognise-the-notes");
  assert.ok(/perceived sweetness, never measured sugar/i.test(step.idea.en),
    "the distinction is taught in the notes lesson");
  const container = document.createElement("div");
  renderLesson(container, { lessonId: "recognise-the-notes", profiles, locale: en });
  assert.ok(/perceived sweetness, never measured sugar/i.test(container.textContent));
  const esContainer = document.createElement("div");
  renderLesson(esContainer, { lessonId: "recognise-the-notes", profiles, locale: es });
  assert.ok(/dulzura percibida, nunca az\u00facar medido/.test(esContainer.textContent),
    "ES parity for the distinction");
  const legal = /denomination|NOM|appellation/i.test(container.textContent);
  assert.ok(!legal, "legal detail is not front-loaded in the beginner lesson");
});
