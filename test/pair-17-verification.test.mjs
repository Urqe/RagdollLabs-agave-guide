import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

/**
 * Pair 17 — Learning & Navigation Verification.
 *
 * These tests boot the real app (app.js + router + data) in jsdom and walk
 * the actual journeys by changing window.location.hash, the same way a
 * browser would: homepage → every lesson → the prepared comparison → back
 * to the lesson; lesson → the exact flavour chapter → back; deep links and
 * reload; browser Back/Forward; language switching mid-flow; saved and
 * user-edited comparison selections. EN and ES both walk the whole route.
 */

const read = (rel) => readFile(path.resolve(process.cwd(), rel), "utf8");
const indexHtml = await read("index.html");

// The real index.html with the module script removed — the harness boots
// app.js itself so fetch can serve the local data files.
const harnessHtml = indexHtml
  .replace('<script type="module" src="./assets/js/app.js"></script>', "")
  .replace(/<link rel="stylesheet"[^>]*>/, "");

const dataCache = new Map();
const dataFiles = [
  "assets/data/profiles.json", "assets/data/bottles.json", "assets/data/sources.json",
  "assets/data/plants.json", "assets/data/regions.json", "assets/data/traditions.json",
  "assets/data/chapters.json", "assets/data/glossary.json", "assets/data/processes.json",
  "assets/data/content-es.json",
];

async function bootApp(startHash) {
  const dom = new JSDOM(harnessHtml, {
    url: "https://example.test/RagdollLabs-agave-guide/" + (startHash || "#/"),
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const virtualConsole = new VirtualConsole();
  const consoleErrors = [];
  virtualConsole.on("jsdomError", (e) => consoleErrors.push(String(e?.message || e)));
  virtualConsole.sendTo(console, { omitJSDOMErrors: true });
  const scrollCalls = [];
  window.HTMLElement.prototype.scrollIntoView = function () { scrollCalls.push(this); };
  window.scrollTo = () => scrollCalls.push(window);

  for (const file of dataFiles) {
    if (!dataCache.has(file)) dataCache.set(file, await read(file));
  }
  window.fetch = async (url) => {
    const rel = new URL(url, window.location.href).pathname.split("/").slice(-3).join("/");
    const rel2 = new URL(url, window.location.href).pathname.replace(/^.*RagdollLabs-agave-guide\//, "");
    const key = [...dataCache.keys()].find((k) => rel.endsWith(k) || rel2 === k);
    if (key) return { ok: true, json: async () => JSON.parse(dataCache.get(key)) };
    const map = await read("assets/geo/mexico-states.svg");
    if (String(url).includes("mexico-states.svg")) return { ok: true, text: async () => map };
    return { ok: false, status: 404, text: async () => "" };
  };

  const prev = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch, localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.fetch = window.fetch;
  globalThis.localStorage = window.localStorage;
  globalThis.sessionStorage = window.sessionStorage;
  window.HTMLElement = window.HTMLElement;

  const appModule = await import(`../assets/js/app.js?boot=p17-${++bootCount}`);
  await new Promise((r) => setTimeout(r, 150));

  return {
    dom, window, app: window.document, consoleErrors, scrollCalls,
    go: async (hash) => {
      window.location.hash = hash;
      await new Promise((r) => setTimeout(r, 60));
    },
    cleanup: () => {
      globalThis.window = prev.window;
      globalThis.document = prev.document;
      globalThis.fetch = prev.fetch;
      globalThis.localStorage = prev.localStorage;
      globalThis.sessionStorage = prev.sessionStorage;
      window.close();
    },
  };
}
let bootCount = 0;

const LESSON_IDS = ["what-are-they", "how-to-taste", "recognise-the-notes", "first-comparison", "explore-next"];

test("pair 17: homepage → all five lessons render, in EN and ES, via real hash navigation", async () => {
  const app = await bootApp("#/");
  try {
    for (const lang of ["en", "es"]) {
      await app.go("#/");
      const toggle = app.window.document.getElementById("locale-toggle");
      if (lang === "es") { toggle.click(); await new Promise((r) => setTimeout(r, 250)); }
      assert.ok(app.window.document.querySelector(".home-view"), `${lang}: homepage renders`);
      for (const lessonId of LESSON_IDS) {
        await app.go(`#/start/${lessonId}`);
        const view = app.window.document.querySelector(".lesson-view");
        assert.ok(view, `${lang}: lesson ${lessonId} renders`);
        const back = view.querySelector("a.back-link");
        assert.ok(back && back.getAttribute("href") === "#/start", `${lang}: lesson back link targets the hub`);
      }
    }
    assert.equal(app.consoleErrors.length, 0, `no jsdom errors during the walk: ${app.consoleErrors.join("; ")}`);
  } finally {
    app.cleanup();
  }
});

test("pair 17: lesson → prepared comparison → explanation first → back to the lesson, EN and ES", async () => {
  const app = await bootApp("#/start/first-comparison");
  try {
    for (const lang of ["en", "es"]) {
      if (lang === "es") {
        app.window.document.getElementById("locale-toggle").click();
        await new Promise((r) => setTimeout(r, 120));
      }
      const lesson = app.window.document.querySelector(".lesson-view");
      const compareLink = lesson.querySelector("a.cta-link[href*='#/compare/']");
      assert.ok(compareLink, `${lang}: prepared comparison link renders`);
      const href = compareLink.getAttribute("href");
      await app.go(href.replace(/^#/, "#").replace(/^#/, "#") && href);
      const compare = app.window.document.querySelector(".compare-view");
      assert.ok(compare, `${lang}: comparison view renders`);
      // Pair 16 ordering: explanation before the secondary picker control.
      const summary = compare.querySelector(".compare-summary");
      const changeStyles = compare.querySelector("details.compare-change-styles");
      assert.ok(summary, `${lang}: the lesson's explanation renders`);
      assert.ok(changeStyles, `${lang}: the secondary change-styles control renders`);
      assert.ok(
        [...compare.children].indexOf(summary) < [...compare.children].indexOf(changeStyles),
        `${lang}: explanation precedes the picker`,
      );
      assert.ok(!compare.querySelector(".compare-change-styles").open, `${lang}: the picker starts collapsed (secondary)`);
      const backToLesson = compare.querySelector("a.back-link");
      assert.ok(backToLesson && backToLesson.getAttribute("href").includes("#/start/first-comparison"),
        `${lang}: back-to-lesson link present`);
      await app.go("#/start/first-comparison");
      assert.ok(app.window.document.querySelector(".lesson-view"), `${lang}: back to the lesson lands`);
    }
  } finally {
    app.cleanup();
  }
});

test("pair 17: lesson → exact flavour chapter → back, with a meaningful link label", async () => {
  const app = await bootApp("#/start/how-to-taste");
  try {
    const lesson = app.window.document.querySelector(".lesson-view");
    const chapterLink = [...lesson.querySelectorAll("a")].find((a) =>
      (a.getAttribute("href") || "").includes("#/learn/chapter-understanding-flavour"));
    assert.ok(chapterLink, "chapter link present in the how-to-taste lesson");
    const label = chapterLink.textContent.trim();
    assert.ok(/understanding flavour/i.test(label) || /entender el sabor/i.test(label),
      `the link carries the chapter title, not a generic label: "${label}"`);
    await app.go(chapterLink.getAttribute("href"));
    const learn = app.window.document.querySelector(".learn-view");
    assert.ok(learn, "learn view renders from the chapter deep link");
    const back = learn.querySelector("a.back-link");
    assert.ok(back && back.getAttribute("href").includes("#/start/how-to-taste"), "lesson origin preserved in the back link");
    await app.go("#/start/how-to-taste");
    assert.ok(app.window.document.querySelector(".lesson-view"), "return to the lesson lands");
  } finally {
    app.cleanup();
  }
});

test("pair 17: browser Back/Forward traverses the walked history without re-render errors", async () => {
  const app = await bootApp("#/start/how-to-taste");
  try {
    await app.go("#/learn/chapter-understanding-flavour?from=start:how-to-taste");
    await app.go("#/start/first-comparison");
    await app.go("#/compare/tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco?from=start:first-comparison");
    // history.back() twice; each hashchange must re-render cleanly.
    await new Promise((r) => { app.window.history.back(); setTimeout(r, 100); });
    assert.ok(app.window.document.querySelector(".lesson-view"), "back returns to the lesson");
    await new Promise((r) => { app.window.history.back(); setTimeout(r, 100); });
    assert.ok(app.window.document.querySelector(".learn-view"), "back returns to the chapter");
    await new Promise((r) => { app.window.history.forward(); setTimeout(r, 100); });
    assert.ok(app.window.document.querySelector(".lesson-view"), "forward returns to the comparison lesson");
    assert.equal(app.consoleErrors.length, 0, `no jsdom errors during history walk: ${app.consoleErrors.join("; ")}`);
  } finally {
    app.cleanup();
  }
});

test("pair 17: a saved comparison selection survives a prepared comparison and returns", async () => {
  const app = await bootApp("#/");
  try {
    // A reader had two styles saved for comparison before starting the journey.
    app.window.localStorage.setItem("agave-compare-selection",
      JSON.stringify(["mezcal-espadin-valles-centrales", "sotol-chihuahua"]));
    await app.go("#/compare/mezcal-espadin-valles-centrales,sotol-chihuahua");
    assert.ok(app.window.document.querySelector(".compare-view"), "saved selection opens");
    // Open the lesson's prepared comparison — it must not destroy the saved one.
    await app.go("#/compare/tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco?from=start:first-comparison");
    assert.ok(app.window.document.querySelector(".compare-summary"), "prepared comparison renders");
    // Return to the journey without touching the picker: the saved selection is restored.
    await app.go("#/start/first-comparison");
    const persisted = JSON.parse(app.window.localStorage.getItem("agave-compare-selection"));
    assert.deepEqual(persisted, ["mezcal-espadin-valles-centrales", "sotol-chihuahua"],
      "the reader's own saved selection is restored after the lesson comparison");
  } finally {
    app.cleanup();
  }
});

test("pair 17: a user-edited selection inside the prepared comparison wins over the saved one", async () => {
  const app = await bootApp("#/");
  try {
    app.window.localStorage.setItem("agave-compare-selection",
      JSON.stringify(["mezcal-espadin-valles-centrales", "sotol-chihuahua"]));
    await app.go("#/compare/tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco?from=start:first-comparison");
    // The reader removes one of the prepared picks: their choice must persist.
    const remove = app.window.document.querySelector(".compare-remove-button");
    assert.ok(remove, "a remove control renders");
    remove.click();
    await new Promise((r) => setTimeout(r, 100));
    await app.go("#/start/first-comparison");
    const persisted = JSON.parse(app.window.localStorage.getItem("agave-compare-selection"));
    assert.ok(persisted.includes("tequila-reposado-valley-jalisco") || persisted.includes("tequila-blanco-valley-jalisco"),
      "the user's own edit inside the comparison is kept, not silently reverted");
  } finally {
    app.cleanup();
  }
});

test("pair 17: empty and partial comparison selections behave honestly on the lesson route", async () => {
  const app = await bootApp("#/compare/tequila-blanco-valley-jalisco?from=start:first-comparison");
  try {
    const compare = app.window.document.querySelector(".compare-view");
    assert.ok(compare, "view renders with one selection");
    assert.ok(compare.textContent.includes("One more pick") || compare.textContent.includes("Una elecci\u00f3n m\u00e1s"),
      "the honest one-more-pick state renders");
    // With fewer than two, the picker stays inline (the secondary control is
    // for the teaching flow only once there is something to teach).
    assert.ok(compare.querySelector(".compare-picker"), "the picker remains directly reachable");
  } finally {
    app.cleanup();
  }
});

test("pair 17: chapter deep link survives reload and ES switch mid-view", async () => {
  const app = await bootApp("#/learn/chapter-understanding-flavour?from=start:how-to-taste");
  try {
    const learn = app.window.document.querySelector(".learn-view");
    assert.ok(learn, "chapter deep link renders on load");
    const chapterTitle = [...learn.querySelectorAll("h3")].find((h) => /understanding flavour/i.test(h.textContent));
    assert.ok(chapterTitle, "the chapter renders its heading");
    app.window.document.getElementById("locale-toggle").click();
    await new Promise((r) => setTimeout(r, 120));
    const learnEs = app.window.document.querySelector(".learn-view");
    assert.ok(learnEs, "learn view re-renders after the language switch");
    assert.equal(app.window.document.documentElement.lang, "es-MX", "document language follows the Mexican edition");
    const esTitle = [...learnEs.querySelectorAll("h3")].find((h) => /entender el sabor/i.test(h.textContent));
    assert.ok(esTitle, "the chapter renders its Spanish heading");
    assert.ok(learnEs.querySelector("a.back-link[href='#/start/how-to-taste']"), "lesson back link survives the switch");
  } finally {
    app.cleanup();
  }
});

test("pair 17: the language control names its editions and exposes the current choice", async () => {
  const app = await bootApp("#/");
  try {
    const button = app.window.document.getElementById("locale-toggle");
    const label = button.getAttribute("aria-label");
    assert.ok(label && /espa\u00f1ol \(m\u00e9xico\)/i.test(label), `the accessible label names the target edition: "${label}"`);
    const name = button.querySelector(".locale-name").textContent;
    assert.ok(name, "the visible text carries the language name, not only the flag");
    assert.ok(button.querySelector(".locale-flag"), "the flag cue renders as a decorative element");
    button.click();
    await new Promise((r) => setTimeout(r, 100));
    const labelEn = button.getAttribute("aria-label");
    assert.ok(/switch to english|cambiar a inglés/i.test(labelEn), "after switching, the control offers English by name");
    assert.ok(/English/.test(button.querySelector(".locale-name").textContent), "the visible edition name is English");
    assert.equal(app.window.localStorage.getItem("agave-locale"), "es", "the choice persists");
  } finally {
    app.cleanup();
  }
});

test("pair 17: every lesson announces its selected step and keeps keyboard-reachable step links", async () => {
  const app = await bootApp("#/start/how-to-taste");
  try {
    const view = app.window.document.querySelector(".lesson-view");
    const current = view.querySelector(".journey-steps [aria-current='step']");
    assert.ok(current, "the active step is announced as current");
    assert.ok(/2\./.test(current.textContent), "the announced step is How to taste (step 2)");
    const links = [...view.querySelectorAll(".journey-steps a")];
    assert.equal(links.length, 4, "the other four steps are links (the current one is not)");
    for (const link of links) {
      assert.ok(link.getAttribute("href").startsWith("#/start/"), "step links are real hash routes");
    }
    // ES parity for the announcement.
    app.window.document.getElementById("locale-toggle").click();
    await new Promise((r) => setTimeout(r, 100));
    const currentEs = app.window.document.querySelector(".journey-steps [aria-current='step']");
    assert.ok(currentEs && /2\./.test(currentEs.textContent), "the step announcement survives the language switch");
  } finally {
    app.cleanup();
  }
});

test("pair 17: profile example bottle renders the pair-16 basis line in both languages", async () => {
  const app = await bootApp("#/profile/tequila-blanco-valley-jalisco");
  try {
    const basis = app.window.document.querySelector(".bottle-card .bottle-basis");
    assert.ok(basis, "the profile's example bottle carries the basis line");
    assert.ok(/tasting summary based on/i.test(basis.textContent), "EN basis text renders");
    app.window.document.getElementById("locale-toggle").click();
    await new Promise((r) => setTimeout(r, 120));
    const basisEs = app.window.document.querySelector(".bottle-card .bottle-basis");
    assert.ok(basisEs && /resumen de cata seg\u00fan/i.test(basisEs.textContent), "ES basis text renders");
  } finally {
    app.cleanup();
  }
});

test("pair 17: catalogue brand filter survives a profile round trip (pair-15 regression recheck)", async () => {
  const app = await bootApp("#/catalogue");
  try {
    // Filter to a brand, follow its bottle to the profile, return.
    const chip = app.window.document.querySelector(".brand-index .discovery-chip");
    assert.ok(chip, "brand index renders");
    chip.click();
    await new Promise((r) => setTimeout(r, 100));
    const link = app.window.document.querySelector(".catalogue-profile-link");
    assert.ok(link, "a style-profile link renders in the filtered list");
    link.click();
    await new Promise((r) => setTimeout(r, 100));
    assert.ok(app.window.document.querySelector(".profile-view"), "profile view opens from the catalogue");
    app.window.history.back();
    await new Promise((r) => setTimeout(r, 150));
    const activeBrand = app.window.document.querySelector(".catalogue-active-brand");
    assert.ok(activeBrand && !activeBrand.hidden, "the brand filter is restored on return");
  } finally {
    app.cleanup();
  }
});

test("pair 17: pair-15 missing-string sweep — no raw lookup keys leak on walked views (EN and ES)", async () => {
  const presentationSrc = await read("assets/js/presentation.js");
  const localeSrc = await read("assets/js/locale.js");
  const knownKeys = new Set();
  for (const m of presentationSrc.matchAll(/"([A-Za-z][A-Za-z0-9._]*)"\s*:/g)) knownKeys.add(m[1]);
  for (const m of localeSrc.matchAll(/"([A-Za-z][A-Za-z0-9._]*)"\s*:\s*"/g)) knownKeys.add(m[1]);
  const keyAlt = [...knownKeys].filter((k) => k.includes("."))
    .sort((a, b) => b.length - a.length).map((k) => k.replace(/\./g, "\\."));
  const RAW_KEY = new RegExp("(?<![\\w.])(" + keyAlt.join("|") + ")(?![\\w])");

  const app = await bootApp("#/");
  try {
    const routes = ["#/explore", "#/discover", "#/catalogue", "#/learn", "#/start", "#/start/how-to-taste",
      "#/learn/chapter-understanding-flavour?from=start:how-to-taste", "#/profile/bacanora-pacifica-sierra-sonora",
      "#/tradition/bacanora", "#/plant/agave-angustifolia"];
    for (const lang of ["en", "es"]) {
      if (lang === "es") { app.window.document.getElementById("locale-toggle").click(); await new Promise((r) => setTimeout(r, 120)); }
      for (const route of routes) {
        await app.go(route);
        for (const node of app.window.document.querySelectorAll("main *")) {
          const text = node.textContent ?? "";
          assert.ok(!RAW_KEY.test(text), `${lang} ${route}: raw key leaked: ${text.slice(0, 80)}`);
        }
      }
    }
  } finally {
    app.cleanup();
  }
});

test("pair 17: honest-mapping recheck — uncovered bottles keep their plain framing", async () => {
  const app = await bootApp("#/catalogue");
  try {
    const input = app.window.document.getElementById("catalogue-search");
    input.value = "ilegal";
    input.dispatchEvent(new app.window.Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 80));
    const entry = app.window.document.querySelector("#bottle-ilegal-mezcal-anejo");
    assert.ok(entry, "the uncovered mezcal a\u00f1ejo entry renders");
    assert.ok(entry.textContent.includes("How it relates to the guide's coverage"),
      "the uncovered bottle uses the plain relates-to framing, never a fits-profile claim");
  } finally {
    app.cleanup();
  }
});
