import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.test/RagdollLabs-agave-guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Event = dom.window.Event;

const readJson = async (rel) => JSON.parse(await readFile(path.join(root, rel), "utf8"));
const profiles = (await readJson("assets/data/profiles.json")).profiles;
const bottles = (await readJson("assets/data/bottles.json")).bottles;
const sources = (await readJson("assets/data/sources.json")).sources;
const { renderProfile } = await import("../assets/js/profile.js");
const { bottleEntry } = await import("../assets/js/catalogue-view.js");

test("release 9: three regional traditions added with one example bottle each", () => {
  const ids = ["tuxca-lineno-cimarron-jalisco-colima", "comiteco-aguamiel-chiapas", "destilado-de-pulque-salmiana-tlaxcala"];
  for (const id of ids) {
    const profile = profiles.find((p) => p.id === id);
    assert.ok(profile, `${id} exists`);
    const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
    assert.ok(bottle, `${id} has its example bottle`);
    assert.equal(bottle.profileId, profile.id, "bottle maps back to its profile");
  }
});

test("release 9: regional identities are not implied to be legal DOs", () => {
  for (const id of ["tuxca-lineno-cimarron-jalisco-colima", "comiteco-aguamiel-chiapas", "destilado-de-pulque-salmiana-tlaxcala"]) {
    const profile = profiles.find((p) => p.id === id);
    assert.ok(
      /no denomination|not a spirit with a denomination|not legally equivalent|no denomination of origin/.test(profile.category),
      `${id} category states its non-DO status honestly`
    );
  }
});

test("release 9: comiteco composition is disclosed and 100%-agave kept distinct", () => {
  const comitecoBottle = bottles.find((b) => b.id === "nine-guardianes-comiteco-blanco");
  assert.ok(comitecoBottle.composition, "comiteco carries a composition disclosure");
  assert.ok(comitecoBottle.composition.includes("cane-based sugar source"), "non-agave ingredient possibility disclosed");
  assert.ok(comitecoBottle.composition.includes("not documented"), "no false 100%-agave claim");
});

test("release 9: sap-derived vs cooked-heart production is explicit, no taste inference", () => {
  const comiteco = profiles.find((p) => p.id === "comiteco-aguamiel-chiapas");
  const pulque = profiles.find((p) => p.id === "destilado-de-pulque-salmiana-tlaxcala");
  const tuxca = profiles.find((p) => p.id === "tuxca-lineno-cimarron-jalisco-colima");
  assert.ok(comiteco.process.includes("Sap-derived"));
  assert.ok(pulque.process.includes("Sap-derived"));
  assert.ok(tuxca.process.includes("roast"), "cooked-heart tradition says so");
  // Fermented pulque itself is not a spirit in the catalogue.
  assert.ok(!bottles.some((b) => b.spirit === "pulque"), "fermented pulque is not catalogued");
  assert.ok(pulque.category.includes("fermented pulque is not a spirit"));
});

test("release 9: regional aliases recorded and search-normalized", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const byAlias = searchProfiles({ profiles, bottles, query: "destilado de pulque" });
  assert.ok(byAlias.some((r) => r.profile.id === "destilado-de-pulque-salmiana-tlaxcala"), "alias-style query finds the tradition");
  const comiteco = profiles.find((x) => x.id === "comiteco-aguamiel-chiapas");
  assert.ok(Array.isArray(comiteco.aliases) && comiteco.aliases.includes("comiteco"), "aliases recorded");
});

test("release 9: composition shows on profile and catalogue bottle entries", () => {
  const comitecoBottle = bottles.find((b) => b.id === "nine-guardianes-comiteco-blanco");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const entry = bottleEntry(comitecoBottle, { sources, profiles });
  container.appendChild(entry);
  assert.ok(entry.textContent.includes("Composition:"), "catalogue entry shows composition");
  container.remove();
});

test("release 9: new traditions pass the same map gate (state ids valid)", async () => {
  const svg = await readFile(path.join(root, "assets/geo/mexico-states.svg"), "utf8");
  for (const id of ["tuxca-lineno-cimarron-jalisco-colima", "comiteco-aguamiel-chiapas", "destilado-de-pulque-salmiana-tlaxcala"]) {
    const profile = profiles.find((p) => p.id === id);
    assert.ok(svg.includes(`data-state="${profile.stateId}"`), `${profile.stateId} exists on the map`);
  }
});

test("release 10: sources carry verification dates", () => {
  for (const src of sources) {
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(src.verified || ""), `${src.id} has a verified date`);
  }
});

test("release 10: coordinates are in Mexico and labeled approximate", () => {
  for (const profile of profiles) {
    const c = profile.placeCoords;
    if (!c) continue;
    assert.ok(c.lat >= 14.5 && c.lat <= 32.6, `${profile.id} lat in Mexico`);
    assert.ok(c.lon >= -118.4 && c.lon <= -86.7, `${profile.id} lon in Mexico`);
    assert.ok(c.precision.toLowerCase().includes("approximate"), `${profile.id} precision is honest`);
  }
});

test("release 10: missing ABV is explicitly noted, never silently blank", () => {
  for (const bottle of bottles) {
    if (bottle.abv == null) {
      assert.ok(bottle.abvNote, `${bottle.id} notes its undocumented ABV`);
    } else {
      assert.ok(!bottle.abvNote, `${bottle.id} has no redundant abvNote`);
    }
  }
});

test("release 10: backlog maintains uncovered expressions and missing profiles", async () => {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const backlog = JSON.parse(await readFile(path.join(root, "assets/data/backlog.json"), "utf8"));
  assert.ok(backlog.backlog.length >= 5, "backlog entries recorded");
  for (const entry of backlog.backlog) {
    assert.ok(entry.kind && entry.item && entry.reason, "each entry has kind, item and reason");
  }
  // Costa raicilla gap is tracked (its bottle exists without a profile).
  assert.ok(backlog.backlog.some((e) => e.item.includes("Costa raicilla")));
});

test("release 11: learn datasets validate and link to real profiles", async () => {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const plants = JSON.parse(await readFile(path.join(root, "assets/data/plants.json"), "utf8")).plants;
  const processes = JSON.parse(await readFile(path.join(root, "assets/data/processes.json"), "utf8")).processes;
  const glossary = JSON.parse(await readFile(path.join(root, "assets/data/glossary.json"), "utf8")).glossary;

  assert.ok(plants.length >= 6, "plant pages exist");
  const profileIds = new Set(profiles.map((p) => p.id));
  for (const plant of plants) {
    assert.ok(plant.species, "scientific identity recorded");
    assert.ok(plant.commonNames.length > 0, "common names with regions");
    for (const pid of plant.profileIds || []) assert.ok(profileIds.has(pid), `plant ${plant.id} links a real profile`);
  }
  // Uncertainty is honest, not guessed: the Pacifica/espadin debate is preserved.
  const angustifolia = plants.find((p) => p.id === "agave-angustifolia");
  assert.ok(angustifolia.uncertainty.includes("debated"), "botanical uncertainty preserved");

  assert.ok(processes.length >= 8, "process explanations exist");
  for (const proc of processes) assert.ok(proc.sourceIds.length > 0, "process explanations are sourced");

  const terms = glossary.map((g) => g.term);
  for (const expected of ["pechuga", "ensamble", "cristalino", "NOM"]) {
    assert.ok(terms.some((t) => t.includes(expected)), `${expected} explained in context`);
  }
});

test("release 11: pairings are optional editorial guidance, never guarantees", () => {
  for (const profile of profiles) {
    if (!profile.pairing) continue;
    assert.ok(profile.pairing.serving.toLowerCase().match(/editorial|suggestion/), `${profile.id} serving guidance labeled editorial`);
    assert.ok(Array.isArray(profile.pairing.foods), "foods are a list");
    // No universal age-to-flavor claims in serving guidance.
    assert.ok(!/older is better|aged is better/i.test(profile.pairing.serving), "no age ladder claims");
  }
});

test("release 11: learn view renders plants, processes and glossary", async () => {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const plants = JSON.parse(await readFile(path.join(root, "assets/data/plants.json"), "utf8")).plants;
  const processes = JSON.parse(await readFile(path.join(root, "assets/data/processes.json"), "utf8")).processes;
  const glossary = JSON.parse(await readFile(path.join(root, "assets/data/glossary.json"), "utf8")).glossary;
  const { renderLearn } = await import("../assets/js/learn-view.js");
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderLearn(container, { plants, processes, glossary, profiles, bottles, sources });
  assert.equal(container.querySelectorAll(".learn-card").length, plants.length + processes.length + glossary.length);
  assert.ok(container.textContent.includes("Uncertainty"), "uncertainty shown where it exists");
  assert.ok(container.querySelectorAll(".source-link").length > 10, "claims carry references");
  container.remove();
});

test("release 11: profile pairing section renders with editorial label", () => {
  const profile = profiles.find((p) => p.id === "bacanora-pacifica-sierra-sonora");
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderProfile(container, { profile, bottle, sources, allProfiles: profiles, allBottles: bottles });
  assert.ok(container.querySelector(".profile-pairing"), "pairing section present");
  assert.ok(container.textContent.includes("Serving & pairings (editorial)"), "labeled editorial");
  assert.ok(container.textContent.includes("carne asada"), "food suggestions listed");
  container.remove();
});
