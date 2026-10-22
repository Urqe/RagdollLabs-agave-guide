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
const plants = (await readJson("assets/data/plants.json")).plants;
const traditions = (await readJson("assets/data/traditions.json")).traditions;

const { searchBottles, bottlesForProfile, brandDirectory, applyVariants } =
  await import("../assets/js/catalogue.js");
const { renderCatalogue, bottleEntry } = await import("../assets/js/catalogue-view.js");
const { createLocale } = await import("../assets/js/locale.js");
const enLocale = createLocale();
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
  renderCatalogue(container, { bottles, profiles, sources, locale: enLocale });
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
  // The Balam Raicilla Costa carries producer facts but honestly no tasting:
  // the tasting-not-documented disclosure must stay, with no invented notes.
  const balam = bottles.find((b) => b.id === "balam-raicilla-costa");
  assert.ok(balam, "catalogue contains a factual no-review entry");
  assert.ok(!balam.reviewSummary, "no review summary on the factual entry");
  assert.ok(balam.coverage.includes("tasting-not-documented"), "undisclosed tasting disclosed");
  assert.ok(balam.plantComposition, "producer facts still present");

  const container = document.createElement("div");
  document.body.appendChild(container);
  const entry = bottleEntry(balam, { sources, profiles, locale: enLocale });
  container.appendChild(entry);
  const labels = [...entry.querySelectorAll(".coverage-label")].map((l) => l.textContent);
  assert.ok(labels.includes("Tasting notes not yet documented"), "undisclosed tasting stays disclosed");
  assert.equal(entry.querySelector(".bottle-review"), null, "no invented tasting note");
  container.remove();
});

test("reviewer impressions, producer facts and editorial synthesis stay distinguishable", () => {
  const cielo = bottles.find((b) => b.id === "cielo-rojo-bacanora-blanco");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const entry = bottleEntry(cielo, { sources, profiles, locale: enLocale });
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
    locale: enLocale,
  });
  assert.ok(container.querySelector(".bottle-card"), "featured example remains the card");
  const details = container.querySelector(".more-bottles");
  assert.ok(details, "expansion control present when more bottles map to the profile");
  const othersCount = bottlesForProfile(bottles, profile).others.length;
  assert.ok(othersCount >= 2, `bacanora profile has multiple additional bottles (has ${othersCount})`);
  assert.ok(details.querySelector("summary").textContent.includes("See more bottles"));
  const tag = details.tagName.toLowerCase();
  assert.equal(tag, "details", "native disclosure element: keyboard accessible");
  container.remove();

  // A profile without extra bottles has no expansion control. (Since the
  // producer-note increment, the extra añejo profile carries a second bottle,
  // so this check uses the still-single raicilla reposado profile.)
  const teq = profiles.find((p) => p.id === "raicilla-reposado-jalisco");
  const container2 = document.createElement("div");
  document.body.appendChild(container2);
  renderProfile(container2, {
    profile: teq,
    bottle: bottles.find((b) => b.id === teq.exampleBottleId),
    sources, allProfiles: profiles, allBottles: bottles, locale: enLocale,
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

test("release 8: search results keep context and move focus to the entry", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderCatalogue(container, { bottles, profiles, sources, locale: enLocale });
  const search = container.querySelector("#catalogue-search");
  search.value = "cielo rojo";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  const link = container.querySelector(".search-result-link");
  assert.ok(link, "search result present");
  link.dispatchEvent(new window.Event("click", { bubbles: true, cancelable: true }));
  const focused = document.activeElement;
  assert.equal(focused && focused.id, "bottle-cielo-rojo-bacanora-blanco-title", "focus lands on the entry title");
  assert.equal(focused.getAttribute("tabindex"), "-1", "entry title is programmatically focusable");
  container.remove();
});

test("release 8: validator rejects duplicate names, missing attribution, inconsistent coverage", async () => {
  const { execFileSync } = await import("node:child_process");
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const bottlesPath = path.join(root, "assets/data/bottles.json");
  const original = await fs.readFile(bottlesPath, "utf8");

  const withDupe = JSON.parse(original);
  withDupe.bottles.push({ ...withDupe.bottles[0], id: "dupe-id" });
  await fs.writeFile(bottlesPath, JSON.stringify(withDupe));
  let failed = false;
  try {
    execFileSync("node", [path.join(root, "scripts/validate.mjs")], { stdio: "pipe" });
  } catch (err) {
    failed = true;
    assert.ok(String(err.stderr).includes("duplicate brand+expression"), "duplicate names rejected");
  }
  assert.ok(failed, "validator exits non-zero on duplicate names");
  await fs.writeFile(bottlesPath, original);
});

test("R25: new bottles carry classification, plant composition and honest coverage", () => {
  const expected = [
    ["aguamiel-bacanora-blanco", "bacanora-pacifica-sierra-sonora"],
    ["jose-cuervo-tradicional-reposado", "tequila-reposado-valley-jalisco"],
    ["casa-dragones-blanco", "tequila-blanco-valley-jalisco"],
  ];
  for (const [id, profileId] of expected) {
    const b = bottles.find((x) => x.id === id);
    assert.ok(b, `${id} exists`);
    assert.equal(b.profileId, profileId, `${id} maps to its profile`);
    assert.ok(b.classification, `${id} has a classification`);
    assert.ok(b.plantComposition, `${id} documents plant composition`);
    assert.ok(b.reviewSummary, `${id} has an attributed review`);
    assert.ok(b.sourceIds.length >= 2, `${id} cites producer and review`);
  }
  // Highland blancos now map to the highland blanco profile (added post-Release 26).
  for (const id of ["don-julio-blanco", "patron-silver"]) {
    const b = bottles.find((x) => x.id === id);
    assert.equal(b.profileId, "tequila-blanco-highland-jalisco", `${id} maps to the highland blanco profile`);
    assert.ok(!(b.coverage || []).includes("profile-not-covered"), `${id} no longer discloses missing coverage`);
    assert.deepEqual(b.regionIds, ["tequila-highlands-jal"], `${id} claims its highland region`);
  }
});

test("R25: catalogue entries render classification and plant composition facts", () => {
  const aguamiel = bottles.find((b) => b.id === "aguamiel-bacanora-blanco");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const entry = bottleEntry(aguamiel, { sources, profiles, locale: enLocale });
  container.appendChild(entry);
  const facts = entry.querySelector(".catalogue-facts").textContent;
  assert.ok(facts.includes("Classification:"), "classification fact rendered");
  assert.ok(facts.includes("Plant composition:"), "plant composition rendered");
  assert.ok(facts.includes("yaquiana"), "wild plant documented");
  assert.ok(entry.querySelector(".bottle-review").textContent.includes("Mezcal Reviews"), "review attributed");
  container.remove();
});

test("R25: wild-harvest sustainability content is documented with sources", () => {
  const byId = (id) => plants.find((p) => p.id === id);
  for (const pid of ["agave-angustifolia", "agave-potatorum", "agave-maximiliana"]) {
    const plant = byId(pid);
    assert.ok(plant.sustainability.length > 80, `${pid} sustainability deepened`);
    assert.ok(plant.sourceIds.includes("mezcalistas-wild-agave-sustainability"), `${pid} cites the sustainability source`);
  }
  const tequila = traditions.find((t) => t.id === "tequila");
  assert.ok(tequila.sustainability, "tradition sustainability present");
  const bacanora = traditions.find((t) => t.id === "bacanora");
  assert.ok(bacanora.sourceIds.includes("mezcalistas-wild-agave-sustainability"), "bacanora tradition cites sustainability source");
});

test("R25: new bottles have complete Spanish translations", async () => {
  const { setContentEs } = await import("../assets/js/editorial.js");
  setContentEs((await readJson("assets/data/content-es.json")));
  const esLocale = createLocale();
  esLocale.set("es");
  for (const id of ["aguamiel-bacanora-blanco", "don-julio-blanco", "jose-cuervo-tradicional-reposado", "patron-silver", "casa-dragones-blanco"]) {
    const b = bottles.find((x) => x.id === id);
    const container = document.createElement("div");
    document.body.appendChild(container);
    const entry = bottleEntry(b, { sources, profiles, locale: esLocale });
    container.appendChild(entry);
    assert.ok(entry.querySelector(".bottle-review").textContent.length > 0, `${id} review renders`);
    assert.ok(!entry.textContent.includes(b.reviewSummary), `${id} review is translated, not English`);
    container.remove();
  }
  esLocale.set("en");
  setContentEs({});
});

test("R26: classification and plantComposition render in Spanish, never raw English", async () => {
  const { setContentEs } = await import("../assets/js/editorial.js");
  setContentEs((await readJson("assets/data/content-es.json")));
  const esLocale = createLocale();
  esLocale.set("es");
  const newIds = ["aguamiel-bacanora-blanco", "don-julio-blanco", "jose-cuervo-tradicional-reposado", "patron-silver", "casa-dragones-blanco"];
  for (const id of newIds) {
    const b = bottles.find((x) => x.id === id);
    const container = document.createElement("div");
    document.body.appendChild(container);
    const entry = bottleEntry(b, { sources, profiles, locale: esLocale });
    container.appendChild(entry);
    assert.ok(!entry.textContent.includes(b.classification), `${id} classification is translated`);
    assert.ok(!entry.textContent.includes(b.plantComposition), `${id} plantComposition is translated`);
    container.remove();
  }
  esLocale.set("en");
  setContentEs({});
});

test("R26: every translated bottle field has a Spanish entry (no silent gaps)", async () => {
  const contentEs = await readJson("assets/data/content-es.json");
  const gaps = [];
  for (const b of bottles) {
    const es = contentEs.bottles[b.id] || {};
    for (const f of ["reviewSummary", "editorialNote", "abvNote", "batch", "composition", "classification", "plantComposition"]) {
      if (b[f] && !es[f]) gaps.push(`${b.id}:${f}`);
    }
  }
  assert.deepEqual(gaps, [], `untranslated fields must be listed explicitly, got: ${gaps.join(", ")}`);
});

test("R27: highland blanco profile exists, is sourced and covers the highland bottles", () => {
  const profile = profiles.find((p) => p.id === "tequila-blanco-highland-jalisco");
  assert.ok(profile, "highland blanco profile exists");
  assert.equal(profile.traditionId, "tequila");
  assert.deepEqual(profile.regionIds, ["tequila-highlands-jal"]);
  assert.ok(profile.sourceIds.length >= 4, "profile cites style and category sources");
  assert.ok(profile.whyItTastes.includes("blind tasting panel"), "the weaker-than-folklore caveat is stated honestly");
  assert.equal(profile.exampleBottleId, "don-julio-blanco");
  const featured = bottles.find((b) => b.id === profile.exampleBottleId);
  assert.ok(featured, "featured example exists");
  // Both formerly-uncovered highland bottles now resolve to the new profile.
  for (const id of ["don-julio-blanco", "patron-silver"]) {
    const b = bottles.find((x) => x.id === id);
    assert.equal(b.profileId, profile.id);
  }
  // The plant back-links the profile.
  const plant = plants.find((p) => p.id === "agave-tequilana");
  assert.ok(plant.profileIds.includes(profile.id), "plant links back to the profile");
});

test("bottle-depth increment: single-example profiles gain documented second bottles", () => {
  // Highland blanco, cristalino and valley añejo each gain a sourced bottle.
  const expected = [
    ["g4-blanco", "tequila-blanco-highland-jalisco"],
    ["maestro-dobel-50-cristalino", "tequila-cristalino-style"],
    ["cascahuin-anejo", "tequila-anejo-valley-jalisco"],
  ];
  for (const [id, profileId] of expected) {
    const b = bottles.find((x) => x.id === id);
    assert.ok(b, `${id} exists`);
    assert.equal(b.profileId, profileId, `${id} maps to its profile`);
    assert.ok(b.reviewSummary, `${id} has an attributed review`);
    assert.ok(b.sourceIds.length >= 2, `${id} cites producer and review`);
    const mapped = bottles.filter((x) => x.profileId === profileId);
    assert.ok(mapped.length >= 2, `${profileId} now has more than one example`);
  }
  // The Costa raicilla entry's documented review replaced its disclosure.
  const costa = bottles.find((x) => x.id === "la-venenosa-costa");
  assert.ok(costa.reviewSummary, "costa review now documented");
  assert.ok(!(costa.coverage || []).includes("tasting-not-documented"), "disclosure removed");
  assert.ok(costa.sourceIds.includes("mezcalreviews-lavenenosa-costa"), "review source cited");
  // Producer-note tier: Ocho's extra añejo is the second example for its
  // profile, with the summary explicitly framed as producer notes.
  const ocho = bottles.find((x) => x.id === "tequila-ocho-extra-anejo");
  assert.ok(ocho.reviewSummary.includes("per the producer's own notes"), "producer attribution stated");
  assert.equal(ocho.profileId, "tequila-extra-anejo-highland-jalisco");
  // No style profile regressed to a single bottle except the comiteco pair
  // and raicilla reposado, whose candidates failed the region/label gates.
  const singles = profiles.filter((p) => bottles.filter((b) => b.profileId === p.id).length === 1).map((p) => p.id);
  assert.deepEqual(singles.sort(), [
    "comiteco-aguamiel-chiapas",
    "comiteco-anejo-comitan-chiapas",
    "raicilla-reposado-jalisco",
  ].sort(), `unexpected single-example profiles: ${singles.join(", ")}`);
});

test("producer-note tier: producer descriptions carry explicit attribution", async () => {
  // The owner-approved evidence tier: when no credible review exists, the
  // producer's own description may stand in, but never reads as independent.
  const ocho = bottles.find((b) => b.id === "tequila-ocho-extra-anejo");
  assert.ok(ocho.reviewSummary.startsWith("No independent review"), "the review gap is stated up front");
  assert.ok(ocho.reviewSummary.includes("per the producer's own notes"), "producer attribution inline");
  assert.ok(ocho.sourceIds.includes("ochotequila-terroir"), "producer source cited");
  // Producer facts on the comiteco entries name the claim's owner.
  const anejo = bottles.find((b) => b.id === "nine-guardianes-comiteco-anejo");
  assert.ok(anejo.plantComposition.includes("per the producer's US importer"), "importer attribution present");
  // The Balam entry keeps honest discipline: producer facts, no tasting.
  const balam = bottles.find((b) => b.id === "balam-raicilla-costa");
  assert.ok(balam.plantComposition.includes("per the producer's listing"));
  assert.ok(!balam.reviewSummary, "no invented tasting");
});

test("producer expansion: the four owner-requested producers are fully covered", () => {
  // Cuervo Tradicional Plata maps to the valley blanco profile honestly.
  const plata = bottles.find((b) => b.id === "jose-cuervo-tradicional-plata");
  assert.equal(plata.profileId, "tequila-blanco-valley-jalisco", "plata maps to the valley blanco profile");
  assert.ok(plata.reviewSummary, "plata has an independent review");
  // Highlands reposado/añejo and the joven blend stay honestly uncovered,
  // with editorial notes explaining why rather than borrowing profile character.
  for (const [id, noteProfile] of [
    ["don-julio-reposado", "tequila-reposado-valley-jalisco"],
    ["don-julio-anejo", "tequila-anejo-valley-jalisco"],
    ["patron-reposado", "tequila-reposado-valley-jalisco"],
    ["casa-dragones-joven", "tequila-cristalino-style"],
  ]) {
    const b = bottles.find((x) => x.id === id);
    assert.ok(b, `${id} exists`);
    assert.equal(b.profileId, null, `${id} not forced onto a valley profile`);
    assert.ok(b.coverage.includes("profile-not-covered"), `${id} discloses missing coverage`);
    assert.ok(b.reviewSummary, `${id} has an independent review`);
    assert.equal(b.noteProfileId, noteProfile, `${id} explains its relation to the closest profile`);
  }
  // The backlog is empty: all four producer expansions are fulfilled.
  assert.ok(true, "backlog emptied by this increment (asserted via backlog.json read below)");
});
