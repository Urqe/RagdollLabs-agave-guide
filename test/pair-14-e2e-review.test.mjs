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
const { plants } = JSON.parse(await read("assets/data/plants.json"));
const { regions } = JSON.parse(await read("assets/data/regions.json"));
const { traditions } = JSON.parse(await read("assets/data/traditions.json"));

const { renderDiscover } = await import("../assets/js/discovery-view.js");
const { renderCatalogue } = await import("../assets/js/catalogue-view.js");
const { renderProfile } = await import("../assets/js/profile.js");
const { renderHome } = await import("../assets/js/presentation.js");
const { renderStartHub, renderLesson } = await import("../assets/js/journey.js");
const { renderCompare } = await import("../assets/js/compare-view.js");
const { parseHash } = await import("../assets/js/router.js");
const { createLocale } = await import("../assets/js/locale.js");
const en = createLocale();
const es = createLocale();
es.set("es");

const RAW_KEY = /[a-z]+\.[A-Z][a-zA-Z]+/;

test("pair 14 (owner-reported): spirit-page bottle cards never leak raw locale keys", () => {
  for (const locale of [en, es]) {
    for (const tradition of traditions) {
      const c = document.createElement("div");
      renderDiscover(c, { kind: "spirit", id: tradition.id, plants, regions, traditions, profiles, bottles, locale });
      for (const eyebrow of [...c.querySelectorAll(".discovery-card .eyebrow")]) {
        assert.ok(!RAW_KEY.test(eyebrow.textContent),
          `${tradition.id} (${locale.get()}): eyebrow is not a raw key, got: ${eyebrow.textContent}`);
      }
      assert.ok(c.textContent.includes("Bottle in the catalogue") || c.textContent.includes("Botella del cat\u00e1logo"),
        `${tradition.id} (${locale.get()}): bottle cards carry a proper catalogue label`);
    }
  }
});

test("pair 14: no raw locale keys leak across every rendered surface (EN and ES)", () => {
  const views = [];
  for (const locale of [en, es]) {
    views.push({ name: "hub", c: (() => { const c = document.createElement("div"); renderDiscover(c, { plants, regions, traditions, profiles, bottles, locale }); return c; })() });
    views.push({ name: "catalogue", c: (() => { const c = document.createElement("div"); renderCatalogue(c, { bottles, profiles, sources: sourceList, locale }); return c; })() });
    views.push({ name: "flavour", c: (() => { const c = document.createElement("div"); renderDiscover(c, { kind: "flavour", id: "smoky-earthly", plants, regions, traditions, profiles, bottles, locale }); return c; })() });
    views.push({ name: "lesson", c: (() => { const c = document.createElement("div"); renderLesson(c, { lessonId: "first-comparison", profiles, locale }); return c; })() });
    views.push({ name: "home", c: (() => { const c = document.createElement("div"); renderHome(c, { profiles, locale }); return c; })() });
    views.push({ name: "start", c: (() => { const c = document.createElement("div"); renderStartHub(c, { profiles, locale }); return c; })() });
    views.push({ name: "compare", c: (() => { const c = document.createElement("div"); renderCompare(c, { profiles, compareIds: "tequila-blanco-valley-jalisco,tequila-reposado-valley-jalisco", locale, onSelectionChange: () => {} }); return c; })() });
  }
  // The shared-string ui() helper must never fall back to the key itself.
  for (const { name, c } of views) {
    for (const eyebrow of [...c.querySelectorAll(".eyebrow, .catalogue-status, .coverage-label, summary")]) {
      assert.ok(!RAW_KEY.test(eyebrow.textContent),
        `${name}: raw key leaked: ${eyebrow.textContent}`);
    }
  }
});

test("pair 14: combined search/filter/reset, unknown fields, disclosure state, anchors (EN and ES)", () => {
  for (const locale of [en, es]) {
    const c = document.createElement("div");
    renderCatalogue(c, { bottles, profiles, sources: sourceList, locale });
    const sel = c.querySelector("#catalogue-tradition");
    const input = c.querySelector("#catalogue-search");
    sel.value = "tequila"; sel.dispatchEvent(new dom.window.Event("change"));
    input.value = "blanco"; input.dispatchEvent(new dom.window.Event("input"));
    const visible = [...c.querySelectorAll(".catalogue-summary h3")].map((h) => h.textContent);
    assert.ok(visible.length > 0 && visible.every((t) => /blanco/i.test(t)),
      `${locale.get()}: search applies within the filter`);
    assert.ok([...c.querySelectorAll(".catalogue-summary")].every((e) => e.id.startsWith("bottle-")),
      `${locale.get()}: anchors stable while filtered`);
    // unknown-field honesty in the compact view
    sel.value = ""; sel.dispatchEvent(new dom.window.Event("change"));
    input.value = "balam"; input.dispatchEvent(new dom.window.Event("input"));
    const balam = c.querySelector("#bottle-balam-raicilla-costa");
    assert.ok(balam, `${locale.get()}: factual entry found`);
    assert.ok(/tasting notes not yet documented/i.test(balam.textContent) || /notas de cata aún no documentadas/i.test(balam.textContent), `${locale.get()}: unknown tasting stated`);
    assert.equal(balam.querySelector("details.catalogue-depth").open, false, `${locale.get()}: depth closed by default`);
    assert.ok(balam.querySelector("details.catalogue-depth .source-link"), `${locale.get()}: sources reachable inside the disclosure`);
    // reset
    c.querySelector(".catalogue-reset").dispatchEvent(new dom.window.Event("click"));
    assert.equal(c.querySelectorAll(".catalogue-summary").length, bottles.length, `${locale.get()}: reset restores the catalogue`);
  }
});

test("pair 14: every changed expression/profile link matches tradition and coverage honestly", () => {
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  for (const bottle of bottles) {
    const uncovered = (bottle.coverage || []).includes("profile-not-covered") || !bottle.profileId;
    const entry = c.querySelector(`#bottle-${bottle.id}`);
    const link = entry.querySelector(".catalogue-profile-link");
    if (uncovered) {
      assert.equal(link, null, `${bottle.id}: no profile link on an uncovered bottle`);
    } else {
      assert.ok(link, `${bottle.id}: covered bottle links a profile`);
      const pid = decodeURIComponent(link.getAttribute("href").split("/profile/")[1].split("?")[0]);
      const profile = profiles.find((p) => p.id === pid);
      assert.ok(profile, `${bottle.id}: link target exists`);
      assert.equal(profile.traditionId, bottle.traditionId || bottle.spirit,
        `${bottle.id}: link target matches the bottle's tradition`);
    }
  }
});

test("pair 14: compact summaries lose no attribution, composition or producer identity", () => {
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  for (const bottle of bottles) {
    const entry = c.querySelector(`#bottle-${bottle.id}`);
    if (bottle.reviewSummary) assert.ok(entry.querySelector(".bottle-review"), `${bottle.id}: attributed review preserved`);
    if (bottle.composition) assert.ok(entry.querySelector(".composition-note") || entry.textContent.includes(bottle.composition.slice(0, 30)),
      `${bottle.id}: composition distinction preserved`);
    if (bottle.producer) assert.ok(entry.textContent.includes(bottle.producer.split(",")[0]),
      `${bottle.id}: producer identity preserved`);
    assert.ok(entry.querySelector("details.catalogue-depth .source-link"), `${bottle.id}: sources stay reachable`);
  }
});

test("pair 14: acceptance scenario — beginner journey end to end", () => {
  const home = document.createElement("div");
  renderHome(home, { profiles, locale: en });
  assert.ok(home.querySelector('a[href="#/start"]'), "homepage -> journey entrance exists");
  const lesson = document.createElement("div");
  renderLesson(lesson, { lessonId: "first-comparison", profiles, locale: en });
  const href = lesson.querySelector(".journey-comparison a.cta-link").getAttribute("href");
  const route = parseHash(href);
  assert.equal(route.name, "compare", "lesson -> prepared comparison route");
  const cmp = document.createElement("div");
  renderCompare(cmp, { profiles, compareIds: route.params.compareIds, locale: en, from: route.params.from, onSelectionChange: () => {} });
  assert.equal(cmp.querySelector(".back-link").getAttribute("href"), "#/start/first-comparison",
    "comparison -> back to the lesson");
  const profile = document.createElement("div");
  const target = profiles.find((p) => p.id === "tequila-reposado-valley-jalisco");
  renderProfile(profile, { profile: target, bottle: bottles.find((b) => b.id === target.exampleBottleId), sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: en });
  assert.ok(profile.querySelector("#profile-title"), "profile opens from the comparison context");
  const lessonAgain = document.createElement("div");
  renderLesson(lessonAgain, { lessonId: "first-comparison", profiles, locale: en });
  assert.ok(lessonAgain.querySelector("#start-heading"), "lesson is reachable again — no dead end");
});

test("pair 14: acceptance scenario — enthusiast journey end to end", async () => {
  const c = document.createElement("div");
  const api = renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  const input = c.querySelector("#catalogue-search");
  input.value = "fortaleza blanco"; input.dispatchEvent(new dom.window.Event("input"));
  const matches = c.querySelectorAll(".catalogue-summary").length;
  assert.equal(matches, 1, "known-name search finds the bottle");
  const link = c.querySelector("#bottle-fortaleza-blanco .catalogue-profile-link");
  const profileRoute = parseHash(link.getAttribute("href"));
  assert.equal(profileRoute.name, "profile", "bottle -> profile route");
  const profile = document.createElement("div");
  const target = profiles.find((p) => p.id === profileRoute.params.profileId);
  renderProfile(profile, { profile: target, bottle: bottles.find((b) => b.id === target.exampleBottleId), sources: sourceList, allProfiles: profiles, allBottles: bottles, origin: "catalogue", locale: en });
  assert.ok(profile.querySelector(".profile-craft"), "technical reference present");
  assert.ok(profile.querySelector("details.profile-learning"), "sources reachable");
  assert.equal(profile.querySelector(".back-link").getAttribute("href"), "#/catalogue", "contextual return to the catalogue");
  const { captureView, takeView } = await import("../assets/js/view-memory.js");
  captureView("catalogue", api.snapshot());
  const snap = takeView("catalogue");
  assert.equal(snap.query, "fortaleza blanco", "search state survives the return");
});

test("pair 14: disclosure semantics, focus and announcements hold at the catalogue", async () => {
  const css = await read("assets/css/styles.css");
  assert.ok(/summary:focus-visible/.test(css), "summary elements are focusable with visible focus");
  assert.ok(/prefers-reduced-motion: reduce/.test(css), "reduced-motion respected");
  const c = document.createElement("div");
  renderCatalogue(c, { bottles, profiles, sources: sourceList, locale: en });
  const status = c.querySelector(".catalogue-status");
  assert.equal(status.getAttribute("role"), "status", "result count announced politely");
  assert.ok(c.querySelector("#catalogue-tradition").getAttribute("aria-label"), "filter has an accessible name");
  for (const depth of [...c.querySelectorAll("details.catalogue-depth")]) {
    assert.ok(depth.querySelector(":scope > summary"), "disclosures use summary semantics");
    assert.ok(!depth.open, "depth closed by default — optional, not required reading");
  }
});
