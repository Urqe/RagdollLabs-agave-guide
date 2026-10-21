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
globalThis.sessionStorage = dom.window.sessionStorage;
globalThis.localStorage = dom.window.localStorage;

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
const { profiles } = JSON.parse(await read("assets/data/profiles.json"));
const { bottles } = JSON.parse(await read("assets/data/bottles.json"));
const { sources: sourceList } = JSON.parse(await read("assets/data/sources.json"));
const contentEs = JSON.parse(await read("assets/data/content-es.json"));

const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);

localStorage.clear();
const es = createLocale();
es.set("es");
localStorage.clear();
const en = createLocale();
en.set("en");

test("F14: content-es.json ships complete Spanish coverage for every profile", () => {
  const required = ["title", "context", "description", "beginnerNote", "category", "process", "finish"];
  const requiredWhenPresent = ["smoke"];
  for (const profile of profiles) {
    const entry = contentEs.profiles[profile.id];
    assert.ok(entry, `ES entry exists for ${profile.id}`);
    for (const field of required) {
      assert.ok(typeof entry[field] === "string" && entry[field].length > 0,
        `${profile.id}.${field} has Spanish content`);
    }
    for (const field of requiredWhenPresent) {
      if (profile[field]) {
        assert.ok(typeof entry[field] === "string" && entry[field].length > 0,
          `${profile.id}.${field} has Spanish content`);
      }
    }
    assert.ok(entry.pairing && typeof entry.pairing.serving === "string",
      `${profile.id}.pairing.serving has Spanish content`);
    assert.ok(Array.isArray(entry.pairing.foods) && entry.pairing.foods.length > 0,
      `${profile.id}.pairing.foods has Spanish content`);
    assert.ok(!/[a-z]{4,}\s+(style|coastal|highland)\b/i.test(entry.title),
      `${profile.id} title is genuinely Spanish, not English leftovers`);
  }
});

test("F1/F2: home cards show Spanish notes and titles in Spanish mode", async () => {
  const { renderHome } = await import("../assets/js/presentation.js");
  const root = document.createElement("div");
  renderHome(root, { profiles, locale: es });
  const cards = [...root.querySelectorAll(".discovery-card")];
  assert.equal(cards.length, 3);
  for (const card of cards) {
    const notes = card.querySelector(".discovery-notes").textContent;
    assert.ok(!notes.includes("cooked agave"), "no English tasting notes on home cards");
    assert.ok(!notes.includes("black pepper"), "no English tasting notes on home cards");
    const title = card.querySelector("strong").textContent;
    assert.ok(!/\bstyle\b/.test(title), `card title "${title}" is Spanish`);
  }
  // And English mode still shows English.
  const rootEn = document.createElement("div");
  renderHome(rootEn, { profiles, locale: en });
  assert.ok(rootEn.querySelector(".discovery-notes").textContent.includes("cooked agave"),
    "English mode keeps English notes");
});

test("F4: profile view renders Spanish editorial content end to end", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const profile = profiles[0];
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  const root = document.createElement("div");
  renderProfile(root, { profile, bottle, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: es });

  assert.equal(root.querySelector("#profile-title").textContent, "Tequila blanco, estilo Valle de Tequila",
    "profile title is Spanish");
  assert.ok(root.querySelector(".profile-context").textContent.includes("Tequila sin crianza"),
    "context is Spanish");
  assert.ok(root.querySelector(".profile-description").textContent.includes("blanco"),
    "description is Spanish");
  assert.ok(root.querySelector(".beginner-note").textContent.includes("¿Nuevo en el tequila?"),
    "beginner note is Spanish");
  assert.ok(root.querySelector(".profile-category").textContent.includes("clase legal"),
    "category is Spanish");
  assert.ok(root.querySelector(".profile-process").textContent.includes("Cocción al vapor"),
    "process is Spanish");
  assert.ok(root.querySelector(".profile-finish").textContent.includes("Limpio y picante"),
    "finish is Spanish");
  const pairing = root.querySelector(".profile-pairing").textContent;
  assert.ok(pairing.includes("Margarita"), "pairing serving renders");
  assert.ok(pairing.includes("Sugerencia editorial"), "pairing serving is Spanish");
  assert.ok(!/Neat in a small glass/.test(pairing), "no English pairing text");
  // No per-section disclosures: everything relevant is translated.
  assert.equal(root.querySelectorAll(".untranslated-field").length, 0,
    "no untranslated-field disclosures on a fully translated profile");
});

test("F7: every compare tooltip resolves to a Spanish explanation", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const root = document.createElement("div");
  renderCompare(root, {
    profiles: profiles.slice(0, 3), locale: es,
    compareIds: `${profiles[0].id},${profiles[1].id}`,
    onSelectionChange: () => {},
  });
  const hints = [...root.querySelectorAll(".compare-table tbody th")].map((th) => th.getAttribute("title"));
  assert.equal(hints.length, 8);
  for (const hint of hints) {
    assert.ok(hint && !/^hint[A-Z]/.test(hint), `tooltip "${hint}" is not a raw key`);
    assert.ok(hint && /[áéíóúñA-Za-z]/.test(hint) && !hint.startsWith("Editorial"),
      `tooltip "${hint}" is Spanish`);
  }
  const rowLabels = [...root.querySelectorAll(".compare-table tbody th")].map((th) => th.textContent);
  assert.ok(rowLabels.includes("Cuerpo"), "bodyLevel label maps to Cuerpo");
  assert.ok(rowLabels.includes("Final"), "finishLength label maps to Final");
});

test("F8: suggestion reasons are fully Spanish", async () => {
  const { ifYouLikeThis } = await import("../assets/js/compare.js");
  const { renderProfile } = await import("../assets/js/profile.js");
  const anchor = profiles.find((p) => p.id === "mezcal-espadin-valles-centrales");
  const root = document.createElement("div");
  const bottle = bottles.find((b) => b.id === anchor.exampleBottleId);
  renderProfile(root, { profile: anchor, bottle, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: es });
  const reasons = [...root.querySelectorAll(".suggestion-list .search-result-reason")].map((s) => s.textContent);
  assert.ok(reasons.length >= 1, "suggestions render");
  for (const reason of reasons) {
    assert.ok(reason.includes("Comparte"), "reason template is Spanish");
    assert.ok(!/\b(smoke|herbal|fruit|sweetness|pepper|oak|body|finish)\b/i.test(reason),
      `reason "${reason}" contains no English dimension labels`);
  }
});

test("F9: catalogue-to-profile link template is Spanish", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const bottle = bottles.find((b) => b.profileId);
  const entry = bottleEntry(bottle, { sources: sourceList, profiles, locale: es });
  const link = entry.querySelector(".catalogue-profile-link");
  assert.ok(link.textContent.startsWith("Ver el perfil de estilo de"),
    `link text "${link.textContent}" is Spanish`);
});

test("F11/F13: shell, buttons and ABV label are Spanish", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const bottle = bottles.find((b) => b.abv != null);
  const entry = bottleEntry(bottle, { sources: sourceList, profiles, locale: es });
  const facts = entry.querySelector(".catalogue-facts").textContent;
  assert.ok(facts.includes("Graduación alcohólica"), "ABV is explained in Spanish");
  assert.ok(facts.includes("dato de etiqueta"), "label-fact is Spanish");

  const { ui } = await import("../assets/js/presentation.js");
  assert.equal(ui(es, "skipToContent"), "Saltar al contenido");
  assert.equal(ui(es, "switchToEn"), "Cambiar a inglés");
  assert.ok(ui(es, "docTitle").includes("Guía del Agave"));
  assert.ok(ui(es, "docDescription").startsWith("Una pequeña guía"));
});

test("F12: Spanish descriptors find profiles through aliases and ES titles", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const altos = searchProfiles({ profiles, bottles, query: "altos" });
  assert.ok(altos.length >= 1, '"altos" finds highland profiles');
  const barrica = searchProfiles({ profiles, bottles, query: "barrica" });
  assert.ok(barrica.length >= 1, '"barrica" finds barrel profiles');
  const sinCrianza = searchProfiles({ profiles, bottles, query: "sin crianza" });
  assert.ok(sinCrianza.length >= 1, '"sin crianza" finds unaged profiles');
  // ES titles are searchable too.
  const valley = searchProfiles({ profiles, bottles, query: "valle de tequila" });
  assert.ok(valley.length >= 1 && valley.some((r) => r.profile.spirit === "tequila"),
    '"valle de tequila" finds tequila profiles via the ES title');
});

test("source classifications translate: productor, reseña, estilo", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const withSources = bottles.find((b) => (b.sourceIds || []).length > 0);
  const entry = bottleEntry(withSources, { sources: sourceList, profiles, locale: es });
  const text = entry.querySelector(".source-details").textContent;
  assert.ok(text.includes("fuente estilo") || text.includes("fuente reseña") || text.includes("fuente productor"),
    "source kind is translated");
  assert.ok(!/fuente (producer|review|style)\b/.test(text), "no mixed source classifications");
});

test("bottle prose translates: reviews, notes, batch, ABV notes, composition", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const counts = { reviewSummary: 0, batch: 0, abvNote: 0, composition: 0, editorialNote: 0 };
  for (const bottle of bottles) {
    const entry = bottleEntry(bottle, { sources: sourceList, profiles, locale: es });
    const text = entry.textContent;
    if (bottle.reviewSummary) {
      counts.reviewSummary++;
      assert.ok(!text.includes(bottle.reviewSummary.slice(0, 30)), `${bottle.id} review renders in Spanish`);
      assert.ok(text.includes(contentEs.bottles[bottle.id].reviewSummary.slice(0, 30)),
        `${bottle.id} shows the Spanish review`);
    }
    if (bottle.batch) {
      counts.batch++;
      assert.ok(!text.includes(bottle.batch.slice(0, 25)), `${bottle.id} batch is Spanish`);
    }
    if (bottle.abvNote) {
      counts.abvNote++;
      assert.ok(!text.includes("not documented in cited sources"), `${bottle.id} ABV note is Spanish`);
    }
    if (bottle.composition) {
      counts.composition++;
      assert.ok(!text.includes("cane-based sugar source"), `${bottle.id} composition is Spanish`);
    }
    if (bottle.editorialNote) {
      counts.editorialNote++;
      assert.ok(!text.includes(bottle.editorialNote.slice(0, 25)), `${bottle.id} editorial note is Spanish`);
    }
  }
  assert.ok(counts.reviewSummary >= 29 && counts.batch >= 22 && counts.abvNote >= 14,
    "every prose field exercised");
});

test("the reported case: Patrón Añejo Cristalino card is Spanish end to end", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const cristalino = profiles.find((p) => p.id === "tequila-cristalino-style");
  const patron = bottles.find((b) => b.id === "patron-anejo-cristalino");
  const root = document.createElement("div");
  renderProfile(root, { profile: cristalino, bottle: patron, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: es });
  const cardText = root.querySelector(".bottle-card").textContent;
  assert.ok(cardText.includes("Tastings.com encuentra aromas y sabores redondos y cremosos"),
    "review summary is Spanish");
  assert.ok(!cardText.includes("round, creamy aromas"), "no English review text remains");
  assert.ok(!/Reviewers|describes a|finds\b/.test(cardText) || cardText.includes("encuentra"),
    "review prose is translated, reviewer names preserved");
});

test("English mode never shows Spanish content (locale gate regression)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const { renderProfile } = await import("../assets/js/profile.js");

  // Catalogue entries.
  for (const bottle of bottles) {
    const entry = bottleEntry(bottle, { sources: sourceList, profiles, locale: en });
    if (bottle.reviewSummary) {
      assert.ok(entry.textContent.includes(bottle.reviewSummary.slice(0, 30)),
        `${bottle.id} shows the English review in English mode`);
    }
    if (bottle.batch) {
      assert.ok(entry.textContent.includes(bottle.batch.slice(0, 25)),
        `${bottle.id} shows the English batch in English mode`);
    }
  }

  // Profile view: English fields, no Spanish leakage.
  const profile = profiles[0];
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  const root = document.createElement("div");
  renderProfile(root, { profile, bottle, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: en });
  assert.equal(root.querySelector("#profile-title").textContent, profile.title, "English title");
  assert.ok(root.querySelector(".profile-context").textContent.includes("Unaged tequila"),
    "English context");
  assert.ok(root.querySelector(".bottle-review").textContent.includes("benchmark"),
    "English bottle review");
  assert.ok(!/encuentra|Comparte|Graduaci/.test(root.textContent),
    "no Spanish strings leak into the English view");
});
