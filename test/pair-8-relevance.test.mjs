import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.test/guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;

const read = (p) => readFile(new URL("../" + p, import.meta.url), "utf8");
const { profiles } = JSON.parse(await read("assets/data/profiles.json"));
const { bottles } = JSON.parse(await read("assets/data/bottles.json"));
const { sources: sourceList } = JSON.parse(await read("assets/data/sources.json"));

const { ifYouLikeThis, comparisonPerspectives } = await import("../assets/js/compare.js");
const { createLocale } = await import("../assets/js/locale.js");
const { renderProfile } = await import("../assets/js/profile.js");
const { bottleEntry } = await import("../assets/js/catalogue-view.js");
const es = createLocale();
es.set("es");
const en = createLocale();

test("pair 8: valley blanco recommends highland blanco, never extra a\u00f1ejo", () => {
  const anchor = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderProfile(container, {
    profile: anchor,
    bottle: bottles.find((b) => b.id === anchor.exampleBottleId),
    sources: sourceList,
    allProfiles: profiles,
    allBottles: bottles,
    locale: en,
  });
  const samePlantCard = [...container.querySelectorAll(".discovery-card")]
    .find((a) => a.querySelector(".eyebrow").textContent.includes("Same plant"));
  assert.ok(samePlantCard, "same-plant destination renders");
  const href = decodeURIComponent(samePlantCard.getAttribute("href"));
  assert.ok(href.includes("tequila-blanco-highland-jalisco"),
    `same-plant link goes to the highland blanco, got: ${href}`);
  assert.ok(!href.includes("extra-anejo"), "extra a\u00f1ejo never offered as the regional learning link");
  container.remove();
});

test("pair 8: explore-next destinations are unique and never self-links", () => {
  for (const anchor of profiles) {
    const container = document.createElement("div");
    document.body.appendChild(container);
    renderProfile(container, {
      profile: anchor,
      bottle: bottles.find((b) => b.id === anchor.exampleBottleId),
      sources: sourceList,
      allProfiles: profiles,
      allBottles: bottles,
      locale: en,
    });
    const hrefs = [...container.querySelectorAll(".profile-next .discovery-card")]
      .map((a) => decodeURIComponent(a.getAttribute("href").split("?")[0]));
    assert.ok(!hrefs.some((h) => h.includes(anchor.id)), `${anchor.id}: no self-link`);
    assert.equal(new Set(hrefs).size, hrefs.length, `${anchor.id}: no duplicate destinations`);
    container.remove();
  }
});

test("pair 8: if-you-like selection is deterministic and excludes shared-absence-only matches", () => {
  const anchor = { id: "a", sensory: { smoke: "none", herbal: "high", fruit: "low", sweetness: "none", pepper: "low", oak: "none", finishLength: "low" }, body: "light" };
  const sharedLowOnly = { id: "b-low", sensory: { smoke: "none", herbal: "low", fruit: "low", sweetness: "none", pepper: "low", oak: "none", finishLength: "low" }, body: "light" };
  assert.equal(ifYouLikeThis(anchor, [sharedLowOnly]).length, 0,
    "shared absence and low readings alone never produce a suggestion");
  const strong = { id: "c-strong", sensory: { smoke: "none", herbal: "high", fruit: "low", sweetness: "none", pepper: "low", oak: "none", finishLength: "low" }, body: "light" };
  const suggestions = ifYouLikeThis(anchor, [sharedLowOnly, strong]);
  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].profile.id, "c-strong");
  const again = ifYouLikeThis(anchor, [strong, sharedLowOnly]);
  assert.deepEqual(suggestions.map((s) => s.profile.id), again.map((s) => s.profile.id),
    "candidate order never changes the outcome");
  const dup = ifYouLikeThis(anchor, [strong, { ...strong }]);
  assert.equal(dup.length, 1, "duplicate candidates yield one destination");
  assert.equal(ifYouLikeThis(anchor, [anchor]).length, 0, "self never suggested");
});

test("pair 8: suggestion reason explains the overlap, never a raw 'Shares' list", () => {
  const anchor = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderProfile(container, {
    profile: anchor,
    bottle: bottles.find((b) => b.id === anchor.exampleBottleId),
    sources: sourceList,
    allProfiles: profiles,
    allBottles: bottles,
    locale: en,
  });
  const reasons = [...container.querySelectorAll(".suggestion-list .search-result-reason")].map((n) => n.textContent);
  assert.ok(reasons.length > 0, "suggestions render");
  for (const reason of reasons) assert.ok(!reason.includes("Shares "), "raw shared-dimension list replaced with useful language");
  container.remove();
});

test("pair 8: uncovered bottles are never introduced as fitting the excluded profile", () => {
  for (const bottle of bottles) {
    const uncovered = (bottle.coverage || []).includes("profile-not-covered") || !bottle.profileId;
    if (!uncovered || !bottle.editorialNote) continue;
    const entry = bottleEntry(bottle, { sources: sourceList, profiles, locale: en });
    assert.ok(!entry.textContent.includes("How it fits"),
      `${bottle.id}: uncovered bottle never gets the fits-profile heading`);
    assert.ok(entry.textContent.includes("How it relates"),
      `${bottle.id}: relationship labeled as coverage, not membership`);
    const esEntry = bottleEntry(bottle, { sources: sourceList, profiles, locale: es });
    assert.ok(!esEntry.textContent.includes("C\u00f3mo encaja con el perfil"),
      `${bottle.id}: ES keeps the honest relationship heading`);
  }
});

test("pair 8: place-only perspective fires only for controlled regional comparisons", () => {
  const valleyBlanco = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const highlandBlanco = profiles.find((p) => p.id === "tequila-blanco-highland-jalisco");
  const extraAnejo = profiles.find((p) => p.id === "tequila-extra-anejo-highland-jalisco");
  const controlled = comparisonPerspectives([valleyBlanco, highlandBlanco]);
  assert.ok(controlled.some((x) => x.id === "samePlantDifferentRegion"),
    "same class and method: place is the variable");
  const uncontrolled = comparisonPerspectives([valleyBlanco, extraAnejo]);
  assert.ok(!uncontrolled.some((x) => x.id === "samePlantDifferentRegion"),
    "class also changes: place-only claim suppressed");
  assert.ok(uncontrolled.some((x) => x.id === "samePlantDifferentRegionAndClass"),
    "honest perspective names the additional variable");
});

test("pair 8: valley blanco reading blocks each carry a distinct purpose", async () => {
  const p = profiles.find((x) => x.id === "tequila-blanco-valley-jalisco");
  const blocks = [p.context, p.description, p.beginnerNote, p.whyItTastes];
  const defining = blocks.filter((text) => /unaged|without oak aging/i.test(text));
  assert.equal(defining.length, 1,
    "the unaged/agave-led definition appears once across the reading blocks");
  const pairCount = blocks.map((a, i) => blocks.filter((b, j) => j !== i && a.slice(0, 40) === b.slice(0, 40)).length);
  assert.ok(pairCount.every((c) => c === 0), "no two blocks open the same way");
  const esData = JSON.parse(await read("assets/data/content-es.json"));
  const esBlocks = [esData.profiles[p.id].context, esData.profiles[p.id].description, esData.profiles[p.id].beginnerNote, esData.profiles[p.id].whyItTastes];
  assert.ok(esBlocks.every((t) => t && t.length > 20), "ES parity for all four blocks");
});

test("pair 8: no internal implementation language in visitor-facing data", async () => {
  const files = ["profiles.json", "bottles.json", "glossary.json", "processes.json", "chapters.json"];
  for (const f of files) {
    const text = await read("assets/data/" + f);
    assert.ok(!text.includes("per the plan"), `${f}: no plan language`);
    assert.ok(!text.includes("eligibility"), `${f}: no app-eligibility language`);
    assert.ok(!text.match(/in this app/), `${f}: no app-meta phrasing`);
  }
  const esText = await read("assets/data/content-es.json");
  assert.ok(!esText.includes("seg\u00fan el plan"), "ES: no plan language");
  assert.ok(!esText.match(/en esta app/), "ES: no app-meta phrasing");
});

test("pair 8: one guidance note per profile view, methodology lives in Learn", async () => {
  const anchor = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderProfile(container, {
    profile: anchor,
    bottle: bottles.find((b) => b.id === anchor.exampleBottleId),
    sources: sourceList,
    allProfiles: profiles,
    allBottles: bottles,
    locale: en,
  });
  const guidanceNotes = [...container.querySelectorAll(".profile-guidance")];
  assert.equal(guidanceNotes.length, 1, "exactly one editorial-guidance note per view");
  const coords = container.querySelector(".profile-coords");
  if (coords) {
    assert.equal((coords.textContent.match(/approximate/gi) || []).length, 1,
      "coords note says approximate once");
  }
  const why = container.querySelector(".profile-why");
  if (why) assert.ok(!/never deterministic/i.test(why.textContent),
    "deterministic-hedging boilerplate moved to Learn");
  const chapters = JSON.parse(await read("assets/data/chapters.json"));
  const flavour = chapters.chapters.find((c) => c.id === "understanding-flavour");
  assert.ok(flavour.blocks.some((b) => /How this guide reaches its conclusions/.test(b.text)),
    "extended methodology documented in the Learn reference chapter");
  const esData = JSON.parse(await read("assets/data/content-es.json"));
  const n = flavour.blocks.length - 1;
  assert.ok(esData.chapters["understanding-flavour"]["block" + n],
    "ES parity for the methodology block");
  container.remove();
});
