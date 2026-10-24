import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Pair 26 — three-intention navigation and lesson continuity: the three
 * home paths, landing at the top of each page below the sticky header,
 * heading focus and per-page titles, nav highlighting, lesson return
 * context with "what to notice", and orientation on long pages.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");
const rawFiles = {};
for (const f of ["profiles", "bottles", "sources", "plants", "processes", "glossary", "content-es", "traditions", "chapters", "regions"]) {
  rawFiles[`${f}.json`] = await read(`assets/data/${f}.json`);
}
const { profiles } = JSON.parse(rawFiles["profiles.json"]);
const { bottles } = JSON.parse(rawFiles["bottles.json"]);
const { sources } = JSON.parse(rawFiles["sources.json"]);
const { chapters } = JSON.parse(rawFiles["chapters.json"]);
const { processes } = JSON.parse(rawFiles["processes.json"]);
const contentEs = JSON.parse(rawFiles["content-es.json"]);
const indexHtml = await read("index.html");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/guide/", pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, Node: dom.window.Node,
  localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage });
const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const es = createLocale();
es.set("es");
localStorage.clear();
const en = createLocale();
en.set("en");

// ------------------------------------------------------------------- home

test("pair 26: the home page offers three named paths, beginner first", async () => {
  const { renderHome } = await import("../assets/js/presentation.js");
  const expected = {
    en: ["Start here →", "Explore →", "Look it up →"],
    es: ["Empieza aquí →", "Explora →", "Consulta →"],
  };
  for (const locale of [en, es]) {
    const box = document.createElement("div");
    renderHome(box, { profiles, locale });
    const paths = [...box.querySelectorAll(".welcome-paths > li")];
    assert.equal(paths.length, 3, `${locale.get()}: three paths`);
    assert.deepEqual(paths.map((p) => p.querySelector(".welcome-action strong").textContent), expected[locale.get()]);
    assert.deepEqual(paths.map((p) => p.querySelector(".welcome-action").getAttribute("href")), ["#/start", "#/explore", "#/catalogue"]);
    for (const p of paths) assert.ok(p.querySelector(".welcome-action span").textContent.length > 30, "each path says what it is for");
    const hrefs = [...box.querySelectorAll(".welcome-paths a")].map((a) => a.getAttribute("href"));
    for (const href of ["#/start", "#/explore", "#/discover", "#/compare", "#/catalogue", "#/learn", "#/learn/terms", "#/plant-to-glass"]) {
      assert.ok(hrefs.includes(href), `${locale.get()}: ${href} is reachable from a path`);
    }
    assert.ok(!/no purchase, no quiz|sin compra, sin examen/.test(box.textContent), "the repeated reassurance list is gone");
    assert.ok(!/Keep learning|Sigue aprendiendo/.test(box.textContent), "no competing 'learning' label beside Learn");
  }
});

test("pair 26: the Spanish edition names the reference section 'Aprender' everywhere", async () => {
  const files = ["assets/js/locale.js", "assets/js/journey.js", "assets/js/plant-to-glass.js", "assets/js/presentation.js"];
  for (const f of files) {
    assert.ok(!/\bAprende\b(?!r)/.test(await read(f)), `${f} uses the nav label Aprender`);
  }
});

// ---------------------------------------------------- lessons and profiles

test("pair 26: lessons say where the reader is in the journey", async () => {
  const { renderLesson } = await import("../assets/js/journey.js");
  for (const [locale, text] of [[en, "Step 2 of 5"], [es, "Paso 2 de 5"]]) {
    const box = document.createElement("div");
    renderLesson(box, { lessonId: "how-to-taste", profiles, chapters, locale });
    assert.equal(box.querySelector(".lesson-position").textContent, text);
  }
});

test("pair 26: a profile opened from a lesson repeats what the lesson wanted noticed", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const { JOURNEY_STEPS } = await import("../assets/js/journey.js");
  const render = (id, origin, locale) => {
    const p = profiles.find((x) => x.id === id);
    const box = document.createElement("div");
    renderProfile(box, { profile: p, bottle: bottles.find((b) => b.id === p.exampleBottleId), sources,
      origin, allProfiles: profiles, allBottles: bottles, locale });
    return box;
  };
  const lesson3 = JOURNEY_STEPS.find((s) => s.id === "recognise-the-notes");
  const reason = lesson3.examples.find((e) => e.profileId === "mezcal-espadin-valles-centrales").reason;
  for (const locale of [en, es]) {
    const box = render("mezcal-espadin-valles-centrales", "start:recognise-the-notes", locale);
    const note = box.querySelector("aside.lesson-note");
    assert.ok(note, `${locale.get()}: lesson note renders`);
    assert.ok(note.textContent.includes(reason[locale.get()]), `${locale.get()}: the lesson's own reason is shown`);
    assert.ok(note.textContent.includes(locale === es ? "De la lección" : "From the lesson"), "it names the lesson");
    assert.equal(box.querySelector(".back-link").getAttribute("href"), "#/start/recognise-the-notes", "and links back to it");
  }
  assert.equal(render("mezcal-espadin-valles-centrales", "start:not-a-lesson", en).querySelector(".lesson-note"), null,
    "an unknown lesson adds no note");
  assert.equal(render("mezcal-espadin-valles-centrales", null, en).querySelector(".lesson-note"), null, "no note without a lesson origin");
});

test("pair 26: the long plant-to-glass page offers a working jump list", async () => {
  const { renderPlantToGlass } = await import("../assets/js/plant-to-glass.js");
  const box = document.createElement("div");
  document.body.appendChild(box);
  const scrolled = [];
  const original = dom.window.HTMLElement.prototype.scrollIntoView;
  dom.window.HTMLElement.prototype.scrollIntoView = function () { scrolled.push(this); };
  renderPlantToGlass(box, { processes, profiles, sources, locale: en });
  const jumps = [...box.querySelectorAll(".ptg-overview button.ptg-jump")];
  assert.equal(jumps.length, 7, "one jump per step");
  jumps[4].click();
  const target = box.querySelector("#ptg-stage-distillation h3");
  assert.equal(scrolled.at(-1), target, "the jump scrolls to its step");
  assert.equal(document.activeElement, target, "and moves focus there");
  dom.window.HTMLElement.prototype.scrollIntoView = original;
  box.remove();
});

// ---------------------------------------------------------------- real boot

let bootCount = 0;
async function bootApp(startHash, localeCode = "en") {
  const appDom = new JSDOM(`<!doctype html><html><body>
    <header class="app-header"><a class="brand" href="#/">Agave Guide</a>
      <nav aria-label="Main">
        <a class="nav-link" data-view="explore" href="#/explore">Browse styles</a>
        <a class="nav-link" data-view="discover" href="#/discover">Plants &amp; places</a>
        <a class="nav-link" data-view="compare" href="#/compare" id="nav-compare">Compare</a>
        <a class="nav-link" data-view="catalogue" href="#/catalogue">Catalogue</a>
        <a class="nav-link" data-view="learn" href="#/learn">Learn</a>
      </nav>
      <div class="header-preferences"><button type="button" id="theme-toggle">☾</button>
      <button type="button" id="locale-toggle"><span class="locale-flag"></span><span class="locale-name">English</span></button></div>
    </header><div id="app"></div></body></html>`, {
    url: `https://example.test/RagdollLabs-agave-guide/${startHash}`, pretendToBeVisual: true,
  });
  appDom.window.localStorage.setItem("agave-locale", localeCode);
  const scrolled = [];
  appDom.window.HTMLElement.prototype.scrollIntoView = function () { scrolled.push(this); };
  appDom.window.scrollTo = () => {};
  const prev = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch,
    localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  Object.assign(globalThis, { window: appDom.window, document: appDom.window.document,
    localStorage: appDom.window.localStorage, sessionStorage: appDom.window.sessionStorage });
  globalThis.fetch = async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel in rawFiles) return { ok: true, json: async () => JSON.parse(rawFiles[rel]), text: async () => rawFiles[rel] };
    return { ok: false, status: 404 };
  };
  const cleanup = () => { Object.assign(globalThis, prev); setContentEs(contentEs); };
  try {
    await import(`../assets/js/app.js?pair26=${++bootCount}`);
    await new Promise((r) => setTimeout(r, 80));
    const doc = appDom.window.document;
    return {
      window: appDom.window, document: doc, scrolled, cleanup,
      main: () => doc.querySelector("main"),
      go: async (hash) => { appDom.window.location.hash = hash; await new Promise((r) => setTimeout(r, 60)); },
      back: async () => { appDom.window.history.back(); await new Promise((r) => setTimeout(r, 80)); },
    };
  } catch (error) {
    cleanup();
    throw error;
  }
}

test("pair 26: every page names itself in the browser title, in both languages", async () => {
  const blanco = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const app = await bootApp("#/", "en");
  try {
    assert.equal(app.document.title, "RagDollLabs · Agave Guide", "home keeps the site title");
    await app.go("#/profile/tequila-blanco-valley-jalisco");
    assert.equal(app.document.title, `${blanco.title} · Agave Guide`);
    await app.go("#/start/how-to-taste");
    assert.equal(app.document.title, "2. How to taste · Agave Guide");
    await app.go("#/plant-to-glass");
    assert.equal(app.document.title, "From plant to glass · Agave Guide");
  } finally {
    app.cleanup();
  }
  const esApp = await bootApp("#/profile/tequila-blanco-valley-jalisco", "es");
  try {
    assert.equal(esApp.document.title, `${contentEs.profiles[blanco.id].title} · Guía del Agave`);
  } finally {
    esApp.cleanup();
  }
});

test("pair 26: navigation lands on the page top and focuses its heading; the first load does not move focus", async () => {
  const app = await bootApp("#/explore");
  try {
    assert.ok(!app.main().contains(app.document.activeElement) || app.document.activeElement === app.main(),
      "the initial load leaves focus alone");
    app.scrolled.length = 0;
    await app.go("#/profile/mezcal-espadin-valles-centrales");
    const main = app.main();
    assert.equal(app.scrolled.at(-1), main.firstElementChild, "lands on the top of the view, back link included");
    const h1 = main.querySelector("h1");
    assert.equal(app.document.activeElement, h1, "focus moves to the page heading");
    assert.equal(h1.getAttribute("tabindex"), "-1", "the heading is programmatically focusable only");
    await app.go("#/start/recognise-the-notes");
    assert.equal(app.document.activeElement, app.main().querySelector("h2#start-heading"), "lesson pages focus their h2");
  } finally {
    app.cleanup();
  }
});

test("pair 26: a view that placed the reader itself is not scrolled back to the top", async () => {
  const app = await bootApp("#/explore");
  try {
    app.scrolled.length = 0;
    await app.go("#/learn/terms");
    const target = app.document.getElementById("learn-terms");
    assert.equal(app.scrolled.at(-1), target, "the Learn deep link keeps its landing on the glossary");
    assert.equal(app.document.activeElement, target, "and its focus");
  } finally {
    app.cleanup();
  }
});

test("pair 26: entering Compare from another page focuses the heading, not a picker button", async () => {
  const app = await bootApp("#/explore");
  try {
    await app.go("#/compare/tequila-blanco-valley-jalisco,mezcal-espadin-valles-centrales");
    const active = app.document.activeElement;
    assert.ok(!active.classList.contains("compare-pick-button"), "no picker button steals focus on arrival");
    assert.ok(/^H[12]$/.test(active.tagName), "the comparison heading has focus");
  } finally {
    app.cleanup();
  }
});

test("pair 26: switching language keeps focus on the switch", async () => {
  const app = await bootApp("#/profile/tequila-blanco-valley-jalisco");
  try {
    const toggle = app.document.getElementById("locale-toggle");
    toggle.focus();
    toggle.click();
    await new Promise((r) => setTimeout(r, 80));
    assert.equal(app.document.documentElement.lang, "es-MX", "the language switched");
    assert.equal(app.document.activeElement, app.document.getElementById("locale-toggle"), "focus stays on the language switch");
  } finally {
    app.cleanup();
  }
});

test("pair 26: plant, tradition and plant-to-glass pages highlight their nav section", async () => {
  const app = await bootApp("#/plant/agave-cupreata");
  try {
    const current = () => [...app.document.querySelectorAll('.nav-link[aria-current="page"]')].map((a) => a.dataset.view);
    assert.deepEqual(current(), ["discover"], "plant page sits under Plants & places");
    await app.go("#/tradition/mezcal");
    assert.deepEqual(current(), ["discover"], "tradition page sits under Plants & places");
    await app.go("#/plant-to-glass");
    assert.deepEqual(current(), ["learn"], "plant to glass sits under Learn");
    await app.go("#/start");
    assert.deepEqual(current(), [], "the journey is reached from the home path, not a nav item");
  } finally {
    app.cleanup();
  }
});

test("pair 26: Back returns to the previous page with its heading focused", async () => {
  const app = await bootApp("#/start/how-to-taste");
  try {
    await app.go("#/profile/tequila-blanco-valley-jalisco?origin=start%3Ahow-to-taste");
    assert.ok(app.main().querySelector("aside.lesson-note"), "the lesson note shows on the profile");
    await app.back();
    assert.equal(app.window.location.hash, "#/start/how-to-taste");
    assert.equal(app.document.activeElement, app.main().querySelector("h2#start-heading"), "back lands on the lesson heading");
  } finally {
    app.cleanup();
  }
});

test("pair 26: headings clear the sticky header and the no-JS message stays bilingual", async () => {
  const css = await read("assets/css/styles.css");
  assert.ok(/\.app-main > \*, \.app-main \[tabindex="-1"\], \.ptg-stage \{ scroll-margin-top: calc\(var\(--header-offset, 5rem\) \+ 0\.75rem\); \}/.test(css),
    "landing targets use the measured header height");
  assert.ok(!/scroll-margin-top: 5rem;/.test(css), "no fixed 5rem margins remain");
  const app = await read("assets/js/app.js");
  assert.ok(/--header-offset/.test(app) && /ResizeObserver/.test(app), "the header height is measured and kept current");
  assert.ok(/<noscript>[\s\S]*needs JavaScript[\s\S]*necesita JavaScript[\s\S]*<\/noscript>/.test(indexHtml), "no-JS message in EN and ES");
});
