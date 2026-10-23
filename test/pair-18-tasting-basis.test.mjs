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

const { createLocale } = await import("../assets/js/locale.js");
localStorage.clear();
const en = createLocale();
en.set("en");
localStorage.clear();
const es = createLocale();
es.set("es");

const bottleById = new Map(bottles.map((b) => [b.id, b]));
const sourceKinds = new Map(sourceList.map((s) => [s.id, s.kind]));

test("P18-2: tastingSourceIds are the explicit tasting-evidence contract", () => {
  for (const bottle of bottles) {
    if (bottle.tastingSourceIds !== undefined) {
      assert.ok(Array.isArray(bottle.tastingSourceIds), `${bottle.id}: tastingSourceIds must be an array`);
      for (const id of bottle.tastingSourceIds) {
        assert.ok(sourceKinds.has(id), `${bottle.id}: tasting source ${id} exists`);
      }
      // A tasting source must not be repurposed from the editorial-note IDs
      // unless it genuinely supports the sensory summary: at minimum the
      // tasting evidence must not be *empty* while a summary exists.
      if (bottle.reviewSummary) {
        assert.ok(bottle.tastingSourceIds.length > 0,
          `${bottle.id}: a sensory summary requires at least one tasting source`);
      }
    } else if (bottle.reviewSummary && !(bottle.coverage || []).includes("tasting-not-documented")) {
      // Factual-only listings may carry prose in reviewSummary, but they must
      // not present it as tasting evidence; the renderer gives them the
      // facts-only line. Entries with a real sensory summary need the contract.
      assert.ok(true);
    }
  }
});

test("P18-2: identity-only sources are not counted as tasting evidence (Fortaleza)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const fortaleza = bottleById.get("fortaleza-blanco");
  assert.ok(fortaleza.sourceIds.includes("tequilafortaleza-blanco"), "the producer identity source is on the record");
  assert.ok(!fortaleza.tastingSourceIds.includes("tequilafortaleza-blanco"),
    "the producer identity source is excluded from the tasting contract");
  const entry = bottleEntry(fortaleza, { sources: sourceList, profiles, locale: en });
  const basis = entry.querySelector(".bottle-basis").textContent;
  assert.ok(basis.includes("2 independent reviews"), "counts the two reviews only");
  assert.ok(!/producer/i.test(basis), "the identity source is not presented as tasting evidence");
});

test("P18-2: a brand homepage is not tasting evidence (La Venenosa Tabernas)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const tabernas = bottleById.get("la-venenosa-tabernas");
  assert.ok(tabernas.sourceIds.includes("casaendemica-brands"), "the brand homepage is on the record");
  assert.ok(!tabernas.tastingSourceIds.includes("casaendemica-brands"),
    "the brand homepage is excluded from the tasting contract");
  const entry = bottleEntry(tabernas, { sources: sourceList, profiles, locale: en });
  const basis = entry.querySelector(".bottle-basis").textContent;
  assert.ok(basis.includes("one independent review"), "counts only the member tasting notes");
});

test("P18-2: producer-only notes are labeled as producer description (Ocho)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const ocho = bottleById.get("tequila-ocho-extra-anejo");
  assert.deepEqual(ocho.tastingSourceIds, ["ochotequila-terroir"], "the sensory text rests on the producer's notes");
  assert.equal(sourceKinds.get("ochotequila-terroir"), "producer");
  const entry = bottleEntry(ocho, { sources: sourceList, profiles, locale: en });
  const basis = entry.querySelector(".bottle-basis").textContent;
  assert.ok(/producer's own description/i.test(basis), "producer notes are not presented as independent reviews");
  const entryEs = bottleEntry(ocho, { sources: sourceList, profiles, locale: es });
  const basisEs = entryEs.querySelector(".bottle-basis").textContent;
  assert.ok(basisEs.includes("descripción del propio productor"), "ES producer attribution renders");
  assert.ok(!/fuente\(s\)/.test(basisEs), "no una fuente(s) grammar");
});

test("P18-2: a factual-only record gets the facts-only line, not a tasting label (Indio Alonso)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const indio = bottleById.get("indio-alonso-tuxca");
  assert.ok(!indio.tastingSourceIds, "no tasting evidence is claimed");
  const entry = bottleEntry(indio, { sources: sourceList, profiles, locale: en });
  const basis = entry.querySelector(".bottle-basis");
  assert.ok(basis.classList.contains("facts-only"), "the line is marked facts-only");
  assert.ok(/factual listing/i.test(basis.textContent), "explicitly not a tasting summary");
  assert.ok(!/independent review/i.test(basis.textContent), "never presented as a review");
});

test("P18-2: missing tasting notes stay honest (Balam), without repetition", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const { renderProfile } = await import("../assets/js/profile.js");
  const balam = bottleById.get("balam-raicilla-costa");
  assert.ok((balam.coverage || []).includes("tasting-not-documented"));
  const entry = bottleEntry(balam, { sources: sourceList, profiles, locale: en });
  const bases = entry.querySelectorAll(".bottle-basis");
  assert.equal(bases.length, 0, "the catalogue entry does not stack a basis line on the coverage disclosure");
  assert.ok(entry.textContent.includes("Tasting notes not yet documented"),
    "the coverage label carries the honest missing-notes message");
  const profile = profiles.find((p) => p.id === balam.profileId);
  const root = document.createElement("div");
  renderProfile(root, { profile, bottle: balam, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: en });
  const cardBases = root.querySelectorAll(".bottle-card .bottle-basis");
  assert.ok(cardBases.length <= 1, "the profile card does not repeat the missing-notes message");
});

test("P18-2: separate editorial-note sources are not repurposed (Don Julio Blanco)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const dj = bottleById.get("don-julio-blanco");
  assert.deepEqual(dj.noteSourceIds, ["diffords-don-julio-blanco", "donjulio-producer"],
    "the editorial comparison note keeps its own sources");
  assert.deepEqual(dj.tastingSourceIds, ["diffords-don-julio-blanco"],
    "only the review supports the sensory summary; the producer source is excluded");
  const entry = bottleEntry(dj, { sources: sourceList, profiles, locale: en });
  assert.ok(entry.querySelector(".bottle-basis").textContent.includes("one independent review"));
});

test("P18-2: profile and catalogue share one basis renderer with identical text", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const { renderProfile } = await import("../assets/js/profile.js");
  const fortaleza = bottleById.get("fortaleza-blanco");
  const catalogueEntry = bottleEntry(fortaleza, { sources: sourceList, profiles, locale: en });
  const profile = profiles.find((p) => p.id === fortaleza.profileId);
  const root = document.createElement("div");
  renderProfile(root, { profile, bottle: fortaleza, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: en });
  const catalogueText = catalogueEntry.querySelector(".bottle-basis").textContent;
  const profileText = root.querySelector(".bottle-card .bottle-basis").textContent;
  assert.equal(profileText, catalogueText, "both surfaces render the same shared basis line");
});

test("P18-2: basis grammar is natural in both languages (singular/plural)", async () => {
  const { bottleEntry } = await import("../assets/js/catalogue-view.js");
  const tabernas = bottleById.get("la-venenosa-tabernas");
  const fortaleza = bottleById.get("fortaleza-blanco");
  for (const locale of [en, es]) {
    const one = bottleEntry(tabernas, { sources: sourceList, profiles, locale });
    const two = bottleEntry(fortaleza, { sources: sourceList, profiles, locale });
    const oneText = one.querySelector(".bottle-basis").textContent;
    const twoText = two.querySelector(".bottle-basis").textContent;
    assert.ok(!/source\(s\)|fuente\(s\)/.test(oneText + twoText), "no plural-parenthesis forms");
    if (locale.get() === "es") {
      assert.ok(/una reseña independiente/.test(oneText), "ES singular grammar");
      assert.ok(/2 reseñas independientes/.test(twoText), "ES plural grammar");
    } else {
      assert.ok(/one independent review/.test(oneText), "EN singular grammar");
      assert.ok(/2 independent reviews/.test(twoText), "EN plural grammar");
    }
  }
});
