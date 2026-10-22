import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { renderHome } from "../assets/js/presentation.js";
import { renderExplore } from "../assets/js/explore.js";
import { renderProfile } from "../assets/js/profile.js";
import { renderCompare } from "../assets/js/compare-view.js";
import { createLocale } from "../assets/js/locale.js";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/guide/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.localStorage = dom.window.localStorage;
const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");
const { profiles } = JSON.parse(await read("assets/data/profiles.json"));
const { bottles } = JSON.parse(await read("assets/data/bottles.json"));
const { sources } = JSON.parse(await read("assets/data/sources.json"));
const map = await read("assets/geo/mexico-states.svg");
const locale = createLocale();

test("home discoveries open real profiles without requiring geography", () => {
  const root = document.createElement("div");
  renderHome(root, { profiles, locale });
  const cards = [...root.querySelectorAll(".discovery-card")];
  assert.equal(cards.length, 3);
  for (const card of cards) {
    const id = decodeURIComponent(card.getAttribute("href").split("/").pop());
    assert.ok(profiles.some(p => p.id === id));
  }
  assert.ok(root.querySelector('a[href="#/explore"]'));
  assert.ok(root.querySelector('a[href="#/compare"]'));
  assert.ok(root.querySelector('a[href="#/learn"]'));
});

test("Explore starts with profiles and combines tradition and documented flavour filters", async () => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, text: async () => map });
  try {
    const root = document.createElement("div");
    await renderExplore(root, { profiles, bottles, locale, mapUrl: "https://example.test/map.svg" });
    assert.equal(root.querySelectorAll(".profile-link").length, profiles.length);
    const tradition = root.querySelector("#spirit-filter");
    tradition.value = "mezcal";
    tradition.dispatchEvent(new dom.window.Event("change"));
    assert.ok(root.querySelectorAll(".profile-link").length > 0);
    for (const link of root.querySelectorAll(".profile-link")) {
      assert.equal(link.querySelector(".profile-link-spirit").textContent, "Mezcal");
    }
    const mood = root.querySelector("#mood-filter");
    mood.value = "Smoke-forward";
    mood.dispatchEvent(new dom.window.Event("change"));
    assert.ok(root.querySelectorAll(".profile-link").length > 0);
    root.querySelector(".discovery-controls button").click();
    assert.equal(root.querySelectorAll(".profile-link").length, profiles.length);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("profile leads with sensory information while retaining reference disclosures", () => {
  const root = document.createElement("div");
  const profile = profiles[0];
  renderProfile(root, { profile, bottle: bottles.find(b => b.id === profile.exampleBottleId), sources, allProfiles: profiles, allBottles: bottles, locale });
  const sensory = root.querySelector(".profile-core");
  const craft = root.querySelector(".profile-craft");
  assert.ok(sensory.compareDocumentPosition(craft) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(craft.closest("details"));
  assert.ok(root.querySelector(".profile-context").closest("details"));
  assert.ok(root.querySelector(".profile-learning .source-list"));
  assert.equal(root.querySelector(".compare-profile-link").getAttribute("href"), "#/compare/" + profile.id);
  assert.equal(root.querySelectorAll(".taste-list li").length, profile.tasteNotes.length);
});

test("a lone comparison selection can be removed before a table exists", () => {
  const root = document.createElement("div");
  const changes = [];
  renderCompare(root, { profiles, compareIds: profiles[0].id, onSelectionChange: ids => changes.push(ids), locale });
  assert.equal(root.querySelector(".compare-table"), null);
  const remove = root.querySelector(".selection-remove");
  assert.ok(remove);
  remove.click();
  assert.deepEqual(changes, [[]]);
});

test("new Spanish navigation paths and headings do not leak translation keys", () => {
  const es = createLocale();
  es.set("es");
  const root = document.createElement("div");
  renderHome(root, { profiles, locale: es });
  assert.equal(root.querySelector("h1").textContent, "Guía del Agave");
  assert.ok(root.textContent.includes("Explorar destilados"));
  assert.ok(!root.textContent.includes("exploreHint"));
  es.set("en");
});

test("UX pass: profile tail links are quiet, result cards keep the card treatment", async () => {
  const { readFile } = await import("node:fs/promises");
  const css = await readFile("assets/css/styles.css", "utf8");
  // The profile compare action is no longer a boxed button.
  assert.ok(!/secondary-button compare-profile-link/.test(css), "compare action not styled as a button");
  // The profile tail demotes discovery cards to inline links.
  assert.ok(/\.profile-next \.discovery-card \{ display: block; padding: 0; border: none;/.test(css), "explore-next cards demoted");
  // Result grids keep the real card treatment.
  assert.ok(/^\.discovery-card \{ position: relative; display: flex;/m.test(css), "result-grid card treatment retained");
  // The quiet link vocabulary exists for tail links.
  assert.ok(/\.quiet-link \{/.test(css), "quiet link style defined");
  assert.ok(/\.suggestion-link \{ color: var\(--text-soft\)/.test(css), "suggestions read as quiet text");
  // The reading hierarchy: editorial prose at the large step.
  assert.ok(/\.profile-why p, \.profile-context, \.profile-description \{ font-size: 1\.12rem/.test(css), "editorial prose enlarged");
  // Learn callout no longer lifts on hover.
  assert.ok(/\.learn-callout-link:hover \{ transform: none;/.test(css), "learn callout hover calmed");
});
