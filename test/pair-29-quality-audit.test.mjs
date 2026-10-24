import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Pair 29 — learning quality and usability audit. Regressions for what the
 * audit found and fixed (skip link routing to not-found, a Back trap on the
 * bare Compare route, focus starting inside the page on first load, phrase
 * search returning nothing, the phone header and Compare layout), plus the
 * sweep the plan asks for: every journey route, curated comparison, term
 * link, Spanish parity and unknown sensory state.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");
const files = {};
for (const f of ["profiles", "bottles", "sources", "plants", "processes", "glossary", "content-es", "traditions", "chapters", "regions"]) {
  files[`${f}.json`] = await read(`assets/data/${f}.json`);
}
const { profiles } = JSON.parse(files["profiles.json"]);
const { bottles } = JSON.parse(files["bottles.json"]);
const { chapters } = JSON.parse(files["chapters.json"]);
const contentEs = JSON.parse(files["content-es.json"]);
const css = await read("assets/css/styles.css");
const indexHtml = await read("index.html");

// A base window for unit-level checks; each boot swaps in its own.
const baseDom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/guide/" });
Object.assign(globalThis, { window: baseDom.window, document: baseDom.window.document, Node: baseDom.window.Node,
  localStorage: baseDom.window.localStorage, sessionStorage: baseDom.window.sessionStorage });

function stubFetch() {
  return async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel in files) return { ok: true, json: async () => JSON.parse(files[rel]), text: async () => files[rel] };
    return { ok: false, status: 404 };
  };
}

let bootCount = 0;
const HEADER = `<a class="skip-link" href="#main">Skip to content</a>
<header class="app-header"><a class="brand" href="#/">Agave Guide</a>
<nav aria-label="Main"><a class="nav-link" data-view="explore" href="#/explore">Browse styles</a><a class="nav-link" data-view="compare" href="#/compare" id="nav-compare">Compare</a><a class="nav-link" data-view="learn" href="#/learn">Learn</a></nav>
<div class="header-preferences"><button type="button" class="theme-toggle" id="theme-toggle"></button><button type="button" class="theme-toggle locale-toggle" id="locale-toggle"><span class="locale-flag"></span><span class="locale-name">English</span></button></div></header>`;

// Note: compare-selection.js keeps the selection in module memory across
// boots in one process, so tests that need an empty Compare run first.
async function bootApp(startHash, { seedSelection = null, locale = null } = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${HEADER}<div id="app"></div></body></html>`, {
    url: `https://example.test/RagdollLabs-agave-guide/${startHash}`,
    pretendToBeVisual: true,
  });
  dom.window.localStorage.clear();
  if (seedSelection) dom.window.localStorage.setItem("agave-compare-selection", JSON.stringify(seedSelection));
  if (locale) dom.window.localStorage.setItem("agave-locale", locale);
  const prev = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch,
    localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, fetch: stubFetch(),
    localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage });
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  const cleanup = () => Object.assign(globalThis, prev);
  try {
    await import(`../assets/js/app.js?pair29=${++bootCount}`);
    await new Promise((r) => setTimeout(r, 80));
    return { window: dom.window, document: dom.window.document, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}

const settle = () => new Promise((r) => setTimeout(r, 60));

test("P29: the skip link moves focus to the page instead of routing to #main (which rendered not-found)", async () => {
  const app = await bootApp("#/learn");
  try {
    const before = app.window.location.hash;
    app.document.querySelector(".skip-link").dispatchEvent(new app.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    await settle();
    assert.equal(app.window.location.hash, before, "the route is unchanged");
    assert.equal(app.document.activeElement.id, "main", "focus lands on the main content");
    assert.ok(!/not found|no encontrad/i.test(app.document.querySelector("main").textContent.slice(0, 200)), "no not-found page");
  } finally {
    app.cleanup();
  }
});

test("P29: the Compare skip link reaches the free picker without changing the route", async () => {
  const app = await bootApp("#/compare");
  try {
    const skip = app.document.querySelector(".compare-skip-own");
    assert.ok(skip, `the skip link renders above the guided comparisons (${app.window.location.hash}: ${app.document.querySelector("main")?.textContent.slice(0, 160)})`);
    const presets = app.document.querySelector(".compare-preset-list");
    assert.ok(skip.compareDocumentPosition(presets) & app.window.Node.DOCUMENT_POSITION_FOLLOWING, "it comes before the list");
    skip.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    await settle();
    assert.equal(app.window.location.hash, "#/compare");
    assert.equal(app.document.activeElement.id, "compare-own-heading");
  } finally {
    app.cleanup();
  }
});

test("P29: the first load leaves focus on the body, so Tab reaches the skip link first", async () => {
  const app = await bootApp("#/start");
  try {
    const active = app.document.activeElement;
    assert.ok(!active || active === app.document.body, `focus stays on the body (got ${active && active.tagName})`);
  } finally {
    app.cleanup();
  }
});

test("P29: a bare #/compare with a saved selection replaces its history entry, so Back does not bounce", async () => {
  const ids = [profiles[0].id, profiles[1].id];
  const app = await bootApp("#/compare", { seedSelection: ids });
  try {
    assert.ok(app.window.location.hash.includes(ids[0]) && app.window.location.hash.includes(ids[1]), "the saved selection is in the route");
    assert.equal(app.window.history.length, 1, "no extra history entry was pushed");
    assert.ok(app.document.querySelector(".compare-table"), "the saved comparison renders in the same pass");
  } finally {
    app.cleanup();
  }
});

test("P29: phrase search matches word by word and ranks by the editorial level", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const ids = (q) => searchProfiles({ profiles, bottles, query: q }).map((r) => r.profile.id);
  for (const q of ["smoky mezcal", "mezcal ahumado"]) {
    const found = ids(q);
    assert.ok(found.length > 0, `"${q}" finds something`);
    assert.ok(found.every((id) => id.startsWith("mezcal-")), `"${q}" stays within mezcal`);
    const medium = profiles.filter((p) => p.spirit === "mezcal" && p.sensory?.smoke === "medium").map((p) => p.id);
    assert.ok(medium.includes(found[0]), `"${q}" ranks a medium-smoke style first`);
  }
  assert.ok(ids("fruity raicilla").length > 0);
  assert.deepEqual(ids("xyzzy plugh"), [], "nonsense still finds nothing");
  assert.ok(ids("mezcal").length > ids("smoky mezcal").length, "single words keep their broader results");
});

test("P29: every journey lesson renders in both languages and its links resolve", async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/guide/" });
  const prev = { window: globalThis.window, document: globalThis.document, localStorage: globalThis.localStorage };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, Node: dom.window.Node, localStorage: dom.window.localStorage });
  try {
    const { JOURNEY_STEPS, renderLesson } = await import("../assets/js/journey.js");
    const { parseHash } = await import("../assets/js/router.js");
    const { createLocale } = await import("../assets/js/locale.js");
    const { setContentEs } = await import("../assets/js/editorial.js");
    const { presetById } = await import("../assets/js/compare-presets.js");
    setContentEs(contentEs);
    const profileIds = new Set(profiles.map((p) => p.id));
    const chapterIds = new Set(chapters.map((c) => c.id));
    for (const lang of ["en", "es"]) {
      dom.window.localStorage.clear();
      const locale = createLocale();
      locale.set(lang);
      for (const step of JOURNEY_STEPS) {
        const c = dom.window.document.createElement("div");
        renderLesson(c, { lessonId: step.id, profiles, chapters, locale });
        assert.ok(c.textContent.trim().length > 200, `${lang} ${step.id} renders`);
        for (const a of c.querySelectorAll('a[href^="#/"]')) {
          const route = parseHash(a.getAttribute("href"));
          assert.notEqual(route.name, "notFound", `${lang} ${step.id}: ${a.getAttribute("href")}`);
          if (route.name === "profile") assert.ok(profileIds.has(route.params.profileId), a.getAttribute("href"));
          if (route.name === "compare") {
            for (const id of route.params.compareIds.split(",")) assert.ok(profileIds.has(decodeURIComponent(id)), a.getAttribute("href"));
            if (route.params.preset) assert.ok(presetById(route.params.preset), `preset ${route.params.preset} exists`);
          }
          if (route.name === "learn" && route.params.section?.startsWith("chapter-")) {
            assert.ok(chapterIds.has(route.params.section.slice("chapter-".length)), a.getAttribute("href"));
          }
        }
      }
    }
  } finally {
    Object.assign(globalThis, prev);
  }
});

test("P29: unknown sensory levels render as 'not documented', never as none", async () => {
  const { sensoryOverview, ui } = await import("../assets/js/presentation.js");
  assert.equal(ui(null, "unknown"), "Not documented");
  const p = { ...profiles[0], sensory: { ...profiles[0].sensory } };
  delete p.sensory.smoke;
  const overview = sensoryOverview(p, null);
  const text = typeof overview === "string" ? overview : JSON.stringify(overview);
  assert.ok(!/smoke[^,]*none/i.test(text), "a missing smoke level is never shown as none");
});

test("P29: Spanish parity holds for every new interface string", async () => {
  const locale = await read("assets/js/locale.js");
  assert.equal((locale.match(/"compare\.presets\.skipToOwn"/g) || []).length, 2, "EN and ES skip-to-own labels");
  const pres = await read("assets/js/presentation.js");
  for (const key of ["sharesWhyOtherSpirit", "sharesWhyOtherPlant", "sharesWhyOtherRest"]) {
    assert.equal((pres.match(new RegExp(`${key}:`, "g")) || []).length, 2, `${key} in EN and ES`);
  }
});

test("P29: the phone header is two rows — the nav scrolls in one row and keeps Learn and Compare", () => {
  assert.match(css, /@media \(max-width: 48rem\) \{\n  \.app-header \{ row-gap: \.25rem;[\s\S]*?flex-wrap: nowrap;[\s\S]*?overflow-x: auto;/);
  assert.match(css, /\.locale-toggle \.locale-region \{ display: none; \}/);
  assert.match(indexHtml, /data-view="learn"/);
  assert.match(indexHtml, /data-view="compare"/);
  assert.match(indexHtml, /styles\.css\?v=agave-pair(29|[3-9]\d)-\d+/, "the CSS cache key is bumped (Pair 29 or later)");
  assert.match(css, /\.app-main \{ overflow-wrap: break-word; \}/, "long words wrap at enlarged text sizes");
});
