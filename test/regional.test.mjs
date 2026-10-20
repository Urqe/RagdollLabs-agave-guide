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
