import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * App-level regressions that need the real boot path (app.js), not the
 * callback-injected render functions: persisted compare selection, deep
 * link healing and same-route re-render scroll behavior. Each test boots a
 * fresh app.js instance against its own jsdom window.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");

const files = {
  "profiles.json": await read("assets/data/profiles.json"),
  "bottles.json": await read("assets/data/bottles.json"),
  "sources.json": await read("assets/data/sources.json"),
  "plants.json": await read("assets/data/plants.json"),
  "processes.json": await read("assets/data/processes.json"),
  "glossary.json": await read("assets/data/glossary.json"),
  "content-es.json": await read("assets/data/content-es.json"),
  "traditions.json": await read("assets/data/traditions.json"),
  "chapters.json": await read("assets/data/chapters.json"),
  "regions.json": await read("assets/data/regions.json"),
};

const profileIds = JSON.parse(files["profiles.json"]).profiles.map((p) => p.id);

function stubFetch() {
  return async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel in files) return { ok: true, json: async () => JSON.parse(files[rel]), text: async () => files[rel] };
    return { ok: false, status: 404 };
  };
}

let bootCount = 0;

async function bootApp(startHash, { seedSelection = null, withHeader = false } = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${withHeader
    ? `<header class="app-header"><button type="button" class="theme-toggle" id="theme-toggle"></button><button type="button" class="theme-toggle" id="locale-toggle">ES</button></header>`
    : ""}<div id="app"></div></body></html>`, {
    url: `https://example.test/RagdollLabs-agave-guide/${startHash}`,
    pretendToBeVisual: true,
  });
  dom.window.localStorage.clear();
  dom.window.sessionStorage.clear();
  if (seedSelection) {
    dom.window.localStorage.setItem("agave-compare-selection", JSON.stringify(seedSelection));
  }
  const prevWindow = globalThis.window;
  const prevDocument = globalThis.document;
  const prevFetch = globalThis.fetch;
  const prevLocalStorage = globalThis.localStorage;
  const prevSessionStorage = globalThis.sessionStorage;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.sessionStorage = dom.window.sessionStorage;
  globalThis.fetch = stubFetch();
  const scrollCalls = [];
  dom.window.HTMLElement.prototype.scrollIntoView = function () { scrollCalls.push(this); };
  const restoreGlobals = () => {
    globalThis.window = prevWindow;
    globalThis.document = prevDocument;
    globalThis.localStorage = prevLocalStorage;
    globalThis.sessionStorage = prevSessionStorage;
    globalThis.fetch = prevFetch;
  };
  try {
    // Query-bust the module cache so each boot runs a fresh app.js instance.
    await import(`../assets/js/app.js?boot=${++bootCount}`);
    await new Promise((r) => setTimeout(r, 80));
    return {
      dom,
      window: dom.window,
      document: dom.window.document,
      scrollCalls,
      cleanup: restoreGlobals,
    };
  } catch (error) {
    restoreGlobals();
    throw error;
  }
}

test("a bare #/compare reopens the persisted selection", async () => {
  const app = await bootApp("#/compare", { seedSelection: [profileIds[0], profileIds[1]] });
  try {
    assert.ok(app.window.location.hash.includes(profileIds[0]),
      "route reopens with the first saved id");
    assert.ok(app.window.location.hash.includes(profileIds[1]),
      "route reopens with the second saved id");
    assert.ok(app.document.querySelector(".compare-table"),
      "the saved comparison renders without new picks");
    // Pair 30: with two styles the legend carries the removal controls.
    const chips = [...app.document.querySelectorAll(".compare-legend .compare-remove-button")];
    assert.equal(chips.length, 2, "both saved selections have removal controls");
    const persisted = JSON.parse(app.window.localStorage.getItem("agave-compare-selection"));
    assert.deepEqual(persisted, [profileIds[0], profileIds[1]], "persistence is untouched by the reopen");
  } finally {
    app.cleanup();
  }
});

test("an unknown-id deep link heals the route and the persisted selection", async () => {
  const app = await bootApp("#/compare/not-a-profile");
  try {
    assert.equal(app.window.location.hash, "#/compare",
      "route prunes the unknown id instead of keeping it");
    const saved = JSON.parse(app.window.localStorage.getItem("agave-compare-selection"));
    assert.deepEqual(saved, [], "persisted selection does not keep the unknown id");
    assert.ok(app.document.querySelector(".compare-pick-button"),
      "picker still renders after healing");
  } finally {
    app.cleanup();
  }
});

test("F6: profile-to-profile navigation scrolls to the heading; locale toggle does not", async () => {
  const app = await bootApp("#/profile/" + profileIds[0], { withHeader: true });
  try {
    app.scrollCalls.length = 0;
    // A different profile is a new page: start at its heading.
    app.window.location.hash = "#/profile/" + profileIds[1];
    await new Promise((r) => setTimeout(r, 80));
    assert.ok(app.scrollCalls.length >= 1, "profile-to-profile navigation scrolls to the heading");
    // The language toggle on the same profile keeps the position.
    app.scrollCalls.length = 0;
    const toggle = app.document.getElementById("locale-toggle");
    toggle.click();
    await new Promise((r) => setTimeout(r, 80));
    assert.equal(app.scrollCalls.length, 0, "locale re-render preserves the scroll position");
    assert.equal(app.document.documentElement.lang, "es-MX");
  } finally {
    app.cleanup();
  }
});

test("F10: switching language before data loads does not crash and applies after boot", async () => {
  const dom = new JSDOM(`<!doctype html><html><body><header class="app-header"><button type="button" class="theme-toggle" id="theme-toggle"></button><button type="button" class="theme-toggle" id="locale-toggle">ES</button></header><div id="app"></div></body></html>`, {
    url: "https://example.test/RagdollLabs-agave-guide/#/",
    pretendToBeVisual: true,
  });
  const prevWindow = globalThis.window;
  const prevDocument = globalThis.document;
  const prevFetch = globalThis.fetch;
  const prevLocalStorage = globalThis.localStorage;
  const prevSessionStorage = globalThis.sessionStorage;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.sessionStorage = dom.window.sessionStorage;
  let release;
  const gate = new Promise((r) => { release = r; });
  globalThis.fetch = async () => { await gate; return { ok: true, json: async () => ({}), text: async () => "" }; };
  const restore = () => {
    globalThis.window = prevWindow;
    globalThis.document = prevDocument;
    globalThis.fetch = prevFetch;
    globalThis.localStorage = prevLocalStorage;
    globalThis.sessionStorage = prevSessionStorage;
  };
  try {
    // Boot against a pending data load; click the toggle while it is pending.
    await import(`../assets/js/app.js?boot=early-${++bootCount}`);
    const toggle = dom.window.document.getElementById("locale-toggle");
    toggle.click(); // must not throw (handleRoute not yet initialized)
    assert.equal(dom.window.localStorage.getItem("agave-locale"), "es", "language persisted immediately");
    release();
    await new Promise((r) => setTimeout(r, 120));
    assert.equal(dom.window.document.documentElement.lang, "es-MX",
      "the completed page renders in the language chosen during loading");
  } finally {
    restore();
  }
});

test("same-route re-render (language toggle) does not scroll to the heading", async () => {
  const app = await bootApp("#/explore", { withHeader: true });
  try {
    app.scrollCalls.length = 0;
    const toggle = app.document.getElementById("locale-toggle");
    assert.ok(toggle, "locale toggle renders");
    toggle.click();
    await new Promise((r) => setTimeout(r, 80));
    assert.equal(app.document.documentElement.lang, "es-MX", "document language switched");
    assert.equal(app.scrollCalls.length, 0, "no scroll-to-heading on same-route re-render");
    assert.ok(app.document.body.textContent.includes("Perfiles de estilo"),
      "explore re-renders in Spanish");
    // A real route change still starts at the heading.
    app.window.location.hash = "#/catalogue";
    await new Promise((r) => setTimeout(r, 80));
    assert.ok(app.scrollCalls.length >= 1, "route change scrolls to the heading");
  } finally {
    app.cleanup();
  }
});

test("switching language keeps expanded disclosures open", async () => {
  const app = await bootApp("#/profile/bacanora-pacifica-sierra-sonora", { withHeader: true });
  try {
    // Open the "See more bottles" disclosure (this profile has 5 more).
    const more = app.document.querySelector("details.more-bottles");
    assert.ok(more, "more-bottles disclosure renders");
    more.open = true;
    // Also open a source disclosure to test multiple simultaneous restores.
    const sources = app.document.querySelector("details.profile-learning");
    if (sources) sources.open = true;

    app.scrollCalls.length = 0;
    const toggle = app.document.getElementById("locale-toggle");
    toggle.click();
    await new Promise((r) => setTimeout(r, 100));

    assert.equal(app.document.documentElement.lang, "es-MX", "language switched");
    assert.ok(app.document.querySelector("details.more-bottles")?.open,
      "more-bottles stays open after the language switch");
    const learnings = app.document.querySelectorAll("details.profile-learning");
    const wasOpen = sources ? [...learnings].some((d) => d.open) : true;
    assert.ok(wasOpen, "profile-learning disclosures restore their open state");
    // The re-render localized the content too.
    assert.ok(app.document.body.textContent.includes("Fuentes"), "rendered in Spanish");
  } finally {
    app.cleanup();
  }
});

test("switching language collapses nothing: explore map disclosure stays open", async () => {
  const app = await bootApp("#/explore", { withHeader: true });
  try {
    const map = app.document.querySelector("details.place-disclosure");
    assert.ok(map, "map disclosure renders");
    map.open = true;
    app.document.getElementById("locale-toggle").click();
    await new Promise((r) => setTimeout(r, 100));
    assert.ok(app.document.querySelector("details.place-disclosure")?.open,
      "map disclosure stays open after the language switch");
  } finally {
    app.cleanup();
  }
});
