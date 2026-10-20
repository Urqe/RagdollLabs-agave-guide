import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const dom = new JSDOM("<!doctype html><html><body><div id='app'></div></body></html>", {
  url: "https://example.test/RagdollLabs-agave-guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Event = dom.window.Event;

const readJson = async (rel) => JSON.parse(await readFile(path.join(root, rel), "utf8"));
const bottles = (await readJson("assets/data/bottles.json")).bottles;
const profiles = (await readJson("assets/data/profiles.json")).profiles;
const sources = (await readJson("assets/data/sources.json")).sources;

const { searchBottles, bottlesForProfile, brandDirectory, applyVariants } =
  await import("../assets/js/catalogue.js");
const { renderCatalogue, bottleEntry } = await import("../assets/js/catalogue-view.js");
const { renderProfile } = await import("../assets/js/profile.js");

test("catalogue search prioritizes exact expression, then brand, then content", () => {
  const hits = searchBottles(bottles, "Bacanora Blanco");
  assert.ok(hits.length >= 1);
  assert.equal(hits[0].expression, "Bacanora Blanco", "exact expression first");

  const brandHits = searchBottles(bottles, "Fortaleza");
  assert.equal(brandHits[0].brand, "Fortaleza");

  const placeHits = searchBottles(bottles, "sonora");
  assert.ok(placeHits.length >= 2, "content matches included");
  for (const b of placeHits) {
    assert.ok([b.brand, b.expression, b.producer, b.place].join(" ").toLowerCase().includes("sonora"));
  }
});

test("catalogue search applies curated spelling variants and normalization", () => {
  // Accent-stripped query still finds accented producers via normalization.
  const hits = searchBottles(bottles, "alamos");
  assert.ok(hits.some((b) => (b.place || "").includes("\u00c1lamos") || (b.producer || "").includes("\u00c1lamos")));
  assert.equal(applyVariants("tepua"), "tepua"); // normalize makes variants identity-safe
});

test("catalogue lists entries alphabetically and shows the brand directory", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderCatalogue(container, { bottles, profiles, sources });
  assert.equal(container.querySelectorAll(".catalogue-entry").length, bottles.length);
  const names = [...container.querySelectorAll(".catalogue-entry-title")].map((n) => n.textContent);
  const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(names, sortedNames, "alphabetical by brand");
  const brands = [...container.querySelectorAll(".brand-directory-item h4")].map((h) => h.textContent);
  assert.equal(new Set(brands).size, brands.length, "one directory entry per brand");
  assert.ok(brands.length >= 5);
  container.remove();
});

test("factual entries disclose missing coverage instead of borrowing character", () => {
  const costa = bottles.find((b) => b.id === "la-venenosa-costa");
  assert.ok(costa, "catalogue contains a factual no-review entry");
  assert.equal(costa.reviewSummary, null);
  assert.ok(costa.coverage.includes("tasting-not-documented"));
  assert.ok(costa.coverage.includes("profile-not-covered"));

  const container = document.createElement("div");
  document.body.appendChild(container);
  const entry = bottleEntry(costa, { sources, profiles });
  container.appendChild(entry);
  const labels = [...entry.querySelectorAll(".coverage-label")].map((l) => l.textContent);
  assert.ok(labels.includes("Tasting notes not yet documented"));
  assert.ok(labels.includes("Profile not yet covered"));
  assert.equal(entry.querySelector(".bottle-review"), null, "no invented tasting note");
  assert.equal(entry.querySelector(".catalogue-profile-link"), null, "no profile link when uncovered");
  container.remove();
});

test("reviewer impressions, producer facts and editorial synthesis stay distinguishable", () => {
  const cielo = bottles.find((b) => b.id === "cielo-rojo-bacanora-blanco");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const entry = bottleEntry(cielo, { sources, profiles });
  container.appendChild(entry);
  assert.ok(entry.querySelector(".catalogue-facts").textContent.includes("Producer:"));
  assert.ok(entry.querySelector(".bottle-review").textContent.includes("TEQUILA.net describes"), "review attributed");
  const note = entry.querySelector(".editorial-note").textContent;
  assert.ok(note.includes("editorial)"), "editorial note labeled as the app's synthesis");
  assert.ok(entry.textContent.includes("How it fits"), "note is profile-relative");
  container.remove();
});

test("profile view keeps one featured example and hides extras behind See more bottles", () => {
  const profile = profiles.find((p) => p.id === "bacanora-pacifica-sierra-sonora");
  const featured = bottles.find((b) => b.id === profile.exampleBottleId);
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderProfile(container, {
    profile,
    bottle: featured,
    sources,
    allProfiles: profiles,
    allBottles: bottles,
  });
  assert.ok(container.querySelector(".bottle-card"), "featured example remains the card");
  const details = container.querySelector(".more-bottles");
  assert.ok(details, "expansion control present when more bottles map to the profile");
  assert.equal((bottlesForProfile(bottles, profile).others).length, 2, "bacanora profile has two additional bottles");
  assert.ok(details.querySelector("summary").textContent.includes("See more bottles"));
  const tag = details.tagName.toLowerCase();
  assert.equal(tag, "details", "native disclosure element: keyboard accessible");
  container.remove();

  // A profile without extra bottles has no expansion control.
  const teq = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const container2 = document.createElement("div");
  document.body.appendChild(container2);
  renderProfile(container2, {
    profile: teq,
    bottle: bottles.find((b) => b.id === teq.exampleBottleId),
    sources, allProfiles: profiles, allBottles: bottles,
  });
  assert.equal(container2.querySelector(".more-bottles"), null);
  container2.remove();
});

test("brands, producers and expressions remain separate linked entities", () => {
  // Same brand, different producers: La Venenosa bottles come from distinct tabernas.
  const laVenenosa = bottles.filter((b) => b.brand === "La Venenosa");
  assert.ok(laVenenosa.length >= 2);
  const producers = new Set(laVenenosa.map((b) => b.producer));
  assert.equal(producers.size, laVenenosa.length, "each bottle keeps its own producer fact");

  const dir = brandDirectory(bottles);
  const lv = dir.find((d) => d.brand === "La Venenosa");
  assert.equal(lv.bottles.length, laVenenosa.length, "directory groups by brand without merging producers");
});
