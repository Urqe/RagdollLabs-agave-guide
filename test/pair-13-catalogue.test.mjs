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

const { renderCatalogue } = await import("../assets/js/catalogue-view.js");
const { parseHash, buildHash } = await import("../assets/js/router.js");
const { createLocale } = await import("../assets/js/locale.js");
const en = createLocale();
const es = createLocale();
es.set("es");

const count = (c) => c.querySelectorAll(".catalogue-summary").length;
const status = (c) => c.querySelector(".catalogue-status").textContent;

test("pair 13: tradition filter, result count and reset combine predictably (EN and ES)", () => {
  for (const locale of [en, es]) {
    const c = document.createElement("div");
    renderCatalogue(c, { bottles, profiles, sources: sourceList, locale });
    assert.ok(/46/.test(status(c)), `${locale.get()}: full count visible`);
    const sel = c.querySelector("#catalogue-tradition");
    const tequilaOption = [...sel.options].find((o) => o.value === "tequila");
    assert.ok(tequilaOption, "tequila filter option present");
    sel.value = "tequila";
    sel.dispatchEvent(new dom.window.Event("change"));
    const expected = bottles.filter((b) => (b.traditionId || b.spirit) === "tequila").length;
    assert.equal(count(c), expected, `${locale.get()}: filter narrows the list`);
    assert.ok(status(c).includes(String(expected)) && status(c).includes("46"),
      `${locale.get()}: count shows filtered out of total`);
    // search combines with the filter
    const input = c.querySelector("#catalogue-search");
    input.value = "fortaleza";
    input.dispatchEvent(new dom.window.Event("input"));
    assert.ok(count(c) >= 1 && count(c) <= expected, `${locale.get()}: search applies within the filter`);
    // reset clears both
    c.querySelector(".catalogue-reset").dispatchEvent(new dom.window.Event("click"));
    assert.equal(count(c), bottles.length, `${locale.get()}: reset restores the full catalogue`);
  }
});

test("pair 13: no-results state is useful in both languages", () => {
  for (const locale of [en, es]) {
    const c = document.createElement("div");
    renderCatalogue(c, { bottles, profiles, sources: sourceList, locale });
    const input = c.querySelector("#catalogue-search");
    input.value = "zzzz-qqqq";
    input.dispatchEvent(new dom.window.Event("input"));
    const empty = c.querySelector(".search-empty");
    assert.ok(empty, `${locale.get()}: no-results state renders`);
    assert.ok(/zzzz-qqqq/.test(empty.textContent), "names the query");
    assert.ok(c.querySelector(".catalogue-reset"), "reset stays available from the empty state");
  }
});

test("pair 13: compact summaries keep identity, tradition, producer/place and ABV honest", () => {
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  for (const bottle of bottles) {
    const entry = c.querySelector(`#bottle-${bottle.id}`);
    assert.ok(entry, `${bottle.id} renders`);
    assert.ok(entry.querySelector(".catalogue-depth"), `${bottle.id}: depth stays available behind a labelled disclosure`);
    if (bottle.abv == null && !bottle.abvNote) {
      assert.ok(/ABV not documented/i.test(entry.textContent), `${bottle.id}: unknown ABV stated, never blank`);
    }
    if ((bottle.coverage || []).includes("tasting-not-documented")) {
      assert.ok(/tasting notes not yet documented/i.test(entry.textContent), `${bottle.id}: coverage disclosure stays visible in the compact view`);
    }
    if (bottle.composition) {
      assert.ok(entry.querySelector(".composition-note"), `${bottle.id}: composition distinction stays visible`);
    }
  }
});

test("pair 13: reviewer, producer and editorial voices stay distinguishable in summaries", () => {
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  const cielo = bottles.find((b) => b.id === "cielo-rojo-bacanora-blanco");
  const entry = c.querySelector("#bottle-cielo-rojo-bacanora-blanco");
  assert.ok(entry.querySelector(".bottle-review").textContent.includes("Grassy, sweet agave"), "bottle-first description");
  assert.ok(entry.querySelector(".bottle-basis"), "basis line attributes the evidence");
  // A factual-only entry gets no invented tasting summary.
  const balam = bottles.find((b) => b.id === "balam-raicilla-costa");
  const balamEntry = c.querySelector("#bottle-balam-raicilla-costa");
  assert.ok(!balamEntry.querySelector(".bottle-review") || /TEQUILA|review|describes/i.test(balamEntry.querySelector(".bottle-review").textContent) === false,
    "no invented tasting note");
});

test("pair 13: profile links appear only where the mapping genuinely matches", () => {
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  for (const bottle of bottles) {
    const uncovered = (bottle.coverage || []).includes("profile-not-covered") || !bottle.profileId;
    const entry = c.querySelector(`#bottle-${bottle.id}`);
    const link = entry.querySelector(".catalogue-profile-link");
    if (uncovered) {
      assert.equal(link, null, `${bottle.id}: uncovered bottle gets no profile link`);
      if (bottle.editorialNote) {
        assert.ok(/How it relates/i.test(entry.textContent), `${bottle.id}: plain coverage relationship, not membership`);
      }
    } else {
      assert.ok(link, `${bottle.id}: covered bottle links its style profile`);
      assert.ok(link.getAttribute("href").includes(encodeURIComponent(bottle.profileId)), `${bottle.id}: links the mapped profile`);
    }
  }
});

test("pair 13: brand index browses without repeating the catalogue", () => {
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  const chips = [...c.querySelectorAll(".brand-index .discovery-chip")];
  assert.equal(chips.length, new Set(bottles.map((b) => b.brand)).size);
  // clicking a brand chip narrows the list to that brand
  chips[0].dispatchEvent(new dom.window.Event("click", { bubbles: true, cancelable: true }));
  const brand = chips[0].textContent;
  const visibleBrands = [...c.querySelectorAll(".catalogue-entry-title")].map((t) => t.textContent.split(" —")[0]);
  assert.ok(visibleBrands.length > 0 && visibleBrands.every((b) => b === brand),
    "brand chip filters the main list");
});

test("pair 13: stable anchors survive; deep-linked bottles outside a filter are revealed or offered", () => {
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en, revealBottleId: "cielo-rojo-bacanora-blanco" });
  assert.ok(c.querySelector("#bottle-cielo-rojo-bacanora-blanco"), "linked bottle visible without filters; its depth disclosure opens");
  assert.ok(c.querySelector("#bottle-cielo-rojo-bacanora-blanco details.catalogue-depth").open,
    "deep link opens the collapsed depth");
  // filtered-out deep link: offered to show
  const c2 = document.createElement("div");
  renderCatalogue(c2, { bottles, profiles, sources: sourceList, locale: en, restore: { query: "fortaleza", traditionId: "" }, revealBottleId: "cielo-rojo-bacanora-blanco" });
  assert.ok(c2.textContent.includes("outside the current search"), "filtered-out deep link explained");
  assert.ok(c2.textContent.includes("Show it anyway"), "clear offer to reveal");
  // routes parse
  assert.deepEqual(parseHash("#/catalogue?bottle=fortaleza-blanco"), { name: "catalogue", params: { bottle: "fortaleza-blanco" } });
  assert.equal(parseHash("#/catalogue").name, "catalogue");
  assert.equal(buildHash({ name: "catalogue", params: { bottle: "x" } }), "#/catalogue?bottle=x");
});

test("pair 13: filter and search state is captured for the return trip", async () => {
  const { captureView, takeView } = await import("../assets/js/view-memory.js");
  sessionStorage.clear();
  const c = document.createElement("div");
  const api = renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  c.querySelector("#catalogue-search").value = "fortaleza";
  c.querySelector("#catalogue-tradition").value = "tequila";
  captureView("catalogue", api.snapshot());
  const snap = takeView("catalogue");
  assert.equal(snap.query, "fortaleza", "query captured");
  assert.equal(snap.traditionId, "tequila", "filter captured");
  const c2 = document.createElement("div");
  renderCatalogue(c2, { bottles, profiles, sources: sourceList, locale: en, restore: snap });
  assert.equal(c2.querySelector("#catalogue-search").value, "fortaleza", "query restored");
  assert.equal(c2.querySelector("#catalogue-tradition").value, "tequila", "filter restored");
  assert.ok(count(c2) < bottles.length, "restored state narrows the list");
});

test("pair 13: every control, status and message renders in Mexican Spanish", () => {
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: es });
  assert.ok(/Mostrando 46 de 46 botellas/.test(status(c)), "count in Spanish");
  assert.ok(c.querySelector("#catalogue-tradition").querySelector('option[value=""]').textContent.includes("Todas las tradiciones"), "filter label in Spanish");
  assert.ok(c.querySelector(".catalogue-reset").textContent.includes("Restablecer"), "reset in Spanish");
  for (const depth of [...c.querySelectorAll("details.catalogue-depth > summary")]) {
    assert.ok(depth.textContent.includes("Producci\u00f3n"), "depth label in Spanish");
  }
  assert.ok(!/Showing|Reset filters|All traditions/.test(c.textContent), "no English control labels leak");
});
