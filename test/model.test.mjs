import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Release 15 — Interconnected Content Model.
 * Regression suite for the normalized five-entity model: profiles and
 * bottles now carry explicit tradition/region/process/plant references,
 * regions.json and traditions.json exist as first-class entities, and
 * every cross-reference resolves in both directions.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => readFile(path.join(root, rel), "utf8").then((t) => JSON.parse(t));

const { profiles } = await readJson("assets/data/profiles.json");
const { bottles } = await readJson("assets/data/bottles.json");
const { plants } = await readJson("assets/data/plants.json");
const { processes } = await readJson("assets/data/processes.json");
const { regions } = await readJson("assets/data/regions.json");
const { traditions } = await readJson("assets/data/traditions.json");
const { sources: sourceList } = await readJson("assets/data/sources.json");

const profileIds = new Set(profiles.map((p) => p.id));
const regionIds = new Set(regions.map((r) => r.id));
const traditionIds = new Set(traditions.map((t) => t.id));
const plantIds = new Set(plants.map((p) => p.id));
const processIds = new Set(processes.map((p) => p.id));

test("R15: traditions.json covers every spirit used by profiles", () => {
  for (const p of profiles) {
    assert.ok(traditionIds.has(p.traditionId), `${p.id} tradition ${p.traditionId} has no entity`);
    assert.equal(p.traditionId, p.spirit, `${p.id}: traditionId matches spirit (migration fidelity)`);
  }
});

test("R15: every tradition records the per-entity editorial structure", () => {
  for (const t of traditions) {
    for (const field of ["origin", "history", "legalStatus", "materials", "practices", "diversity"]) {
      assert.ok(typeof t[field] === "string" && t[field].length > 20, `${t.id}.${field} present`);
    }
    for (const pid of t.plantIds) assert.ok(plantIds.has(pid), `${t.id} plant ${pid} exists`);
    for (const rid of t.regionIds) assert.ok(regionIds.has(rid), `${t.id} region ${rid} exists`);
  }
});

test("R15: one plant may serve multiple traditions (many-to-many)", () => {
  const espadin = plants.find((p) => p.id === "agave-angustifolia");
  assert.ok(espadin.traditionIds.length >= 2, "espadín serves more than one tradition");
  assert.ok(new Set(espadin.traditionIds).size === espadin.traditionIds.length, "no duplicate tradition links");
});

test("R15: one expression may use multiple plants", () => {
  const costa = profiles.find((p) => p.id === "raicilla-costa-jalisco");
  assert.ok(costa.plantIds.length >= 2, "Costa raicilla lists both chico aguiar and rhodacantha");
  for (const pid of costa.plantIds) assert.ok(plantIds.has(pid), `plant ${pid} exists`);
});

test("R15: regions carry state, type, geography and legal-vs-cultural distinctions", () => {
  const VALID_TYPES = new Set(["state", "subregion", "municipality"]);
  for (const r of regions) {
    assert.ok(VALID_TYPES.has(r.type), `${r.id} type`);
    assert.ok(r.stateId && r.geography && r.distinctions, `${r.id} structure`);
    for (const tid of r.traditionIds) assert.ok(traditionIds.has(tid), `${r.id} tradition ${tid}`);
    for (const pid of r.plantIds) assert.ok(plantIds.has(pid), `${r.id} plant ${pid}`);
    for (const pid of r.processIds) assert.ok(processIds.has(pid), `${r.id} process ${pid}`);
  }
});

test("R15: region geography is never a whole-state legal zone claim", () => {
  const wholeState = regions.filter((r) => r.type === "state");
  assert.equal(wholeState.length, 0, "all regions are subregion/municipality scoped, never whole states");
  const sonora = regions.find((r) => r.id === "sierra-sonora");
  assert.match(sonora.distinctions, /municipal/i);
});

test("R15: profile region references live in the profile's own state", () => {
  for (const p of profiles) {
    for (const rid of p.regionIds) {
      const region = regions.find((r) => r.id === rid);
      assert.ok(region, `${p.id} region ${rid} exists`);
      assert.equal(region.stateId, p.stateId, `${p.id} region ${rid} state mismatch`);
      assert.ok(region.traditionIds.includes(p.traditionId), `${p.id} region ${rid} lacks its tradition`);
    }
  }
});

test("R15: bottle facts stay bottle-scoped, identity/typical-character separation holds", () => {
  for (const b of bottles) {
    assert.ok(traditionIds.has(b.traditionId), `${b.id} tradition exists`);
    assert.ok(Array.isArray(b.regionIds), `${b.id} regionIds array`);
    if (b.profileId != null) {
      const prof = profiles.find((p) => p.id === b.profileId);
      assert.ok(prof, `${b.id} profile exists`);
      assert.equal(prof.traditionId, b.traditionId, `${b.id} tradition agrees with profile`);
      const profRegions = new Set(prof.regionIds);
      for (const rid of b.regionIds) assert.ok(profRegions.has(rid), `${b.id} region ${rid} subset of profile regions`);
    } else {
      assert.deepEqual(b.regionIds, [], `${b.id} uncovered bottle carries no region claims`);
    }
    // A bottle's reviewSummary is a bottle-specific fact; it must never appear
    // as a profile-level (universal) trait.
    if (b.reviewSummary) {
      for (const p of profiles) {
        assert.ok(!JSON.stringify(p).includes(b.reviewSummary), `${p.id} must not copy bottle ${b.id} note verbatim`);
      }
    }
  }
});

test("R15: profile ↔ plant references are bidirectional", () => {
  for (const p of profiles) {
    for (const pid of p.plantIds) {
      const plant = plants.find((x) => x.id === pid);
      assert.ok(plant, `${p.id} plant ${pid} exists`);
      assert.ok(plant.profileIds.includes(p.id), `plant ${pid} does not link back to profile ${p.id}`);
    }
    if (p.plantId != null) {
      assert.ok(p.plantIds.includes(p.plantId), `${p.id} legacy plantId stays within plantIds`);
    }
  }
});

test("R15: no duplicated descriptions across data files", () => {
  const traditionLegal = traditions.map((t) => t.legalStatus);
  const all = JSON.stringify([...profiles, ...bottles]);
  for (const text of traditionLegal) {
    assert.ok(!all.includes(text.slice(0, 60)), "tradition legalStatus text must not be copied into profiles/bottles");
  }
});

test("R15: routes unchanged — profile ids survive the migration", () => {
  const expected = [
    "tequila-blanco-valley-jalisco",
    "mezcal-espadin-valles-centrales",
    "bacanora-pacifica-sierra-sonora",
    "raicilla-maximiliana-sierra-jalisco",
    "tuxca-lineno-cimarron-jalisco-colima",
    "comiteco-aguamiel-chiapas",
    "destilado-de-pulque-salmiana-tlaxcala",
    "raicilla-costa-jalisco",
    "tequila-reposado-valley-jalisco",
    "tequila-anejo-valley-jalisco",
    "tequila-cristalino-style",
    "comiteco-anejo-comitan-chiapas",
    "raicilla-reposado-jalisco",
    "tequila-extra-anejo-highland-jalisco",
    "mezcal-reposado-espadin-oaxaca",
    "mezcal-tobala-sierra-oaxaca",
    "sotol-chihuahua",
  ];
  assert.deepEqual(profiles.map((p) => p.id).sort(), [...expected].sort());
  assert.equal(profiles.length, 17);
});

test("R15: data loader exposes the new entities", async () => {
  const { loadAppData } = await import("../assets/js/data-loader.js");
  const prevFetch = globalThis.fetch;
  const files = {
    "profiles.json": JSON.stringify({ profiles }),
    "bottles.json": JSON.stringify({ bottles }),
    "sources.json": JSON.stringify({ sources: [] }),
    "plants.json": JSON.stringify({ plants }),
    "processes.json": JSON.stringify({ processes }),
    "glossary.json": JSON.stringify({ glossary: [] }),
    "content-es.json": "{}",
    "traditions.json": JSON.stringify({ traditions }),
    "regions.json": JSON.stringify({ regions }),
  };
  globalThis.fetch = async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel in files) return { ok: true, json: async () => JSON.parse(files[rel]) };
    return { ok: false, status: 404 };
  };
  try {
    const data = await loadAppData(new URL("https://example.test/"));
    assert.equal(data.traditions.length, traditions.length);
    assert.equal(data.regions.length, regions.length);
  } finally {
    globalThis.fetch = prevFetch;
  }
});

test("R15: sotol's Dasylirion is never classified as an agave", () => {
  const sotol = plants.find((p) => p.id === "dasylirion-desert-spoon");
  assert.match(sotol.species, /^Dasylirion/);
  assert.match(sotol.uncertainty, /Not an agave/i);
  assert.ok(sotol.traditionIds.includes("sotol"));
  assert.ok(!sotol.traditionIds.includes("mezcal"), "Dasylirion never linked to an agave-category tradition");
  assert.ok(sotol.id.startsWith("dasylirion"), "id namespace keeps the genus distinct");
});

test("R16: regions are source-backed (data contract)", () => {
  const sourceIds = new Set(sourceList.map((s) => s.id));
  for (const r of regions) {
    assert.ok(Array.isArray(r.sourceIds) && r.sourceIds.length > 0, `${r.id} has sourceIds`);
    for (const sid of r.sourceIds) assert.ok(sourceIds.has(sid), `${r.id} source ${sid} exists`);
  }
});

test("R16: region plant lists agree with their profiles (no drift)", () => {
  for (const r of regions) {
    for (const p of profiles) {
      if (!p.regionIds.includes(r.id)) continue;
      for (const pid of p.plantIds) {
        assert.ok(r.plantIds.includes(pid), `region ${r.id} missing plant ${pid} claimed by profile ${p.id}`);
      }
    }
  }
});

test("R16: processIds agree with the process prose (migration fidelity)", () => {
  for (const p of profiles) {
    const ids = new Set(p.processIds);
    // Wood maturation must be present exactly when the prose mentions oak/barrel resting.
    const oakProse = /\boak|barrels?\b/i.test(p.process) && !/unaged|no barrel/i.test(p.process);
    assert.equal(ids.has("wood-maturation"), oakProse, `${p.id}: wood-maturation presence disagrees with prose`);
    // Cristalino must carry filtration; nothing else may.
    if (p.id === "tequila-cristalino-style") {
      assert.ok(ids.has("filtration"), "cristalino lists filtration");
    } else {
      assert.ok(!ids.has("filtration"), `${p.id} must not claim filtration`);
    }
    // Sap traditions carry sap-collection; cooked-heart traditions do not.
    if (/sap-derived|aguamiel/i.test(p.process)) {
      assert.ok(ids.has("sap-collection"), `${p.id} lists sap-collection`);
    } else {
      assert.ok(!ids.has("sap-collection"), `${p.id} must not claim sap-collection`);
    }
    // Pit roast only for pit-roast prose; steam cook only for steam prose.
    if (/steam/i.test(p.process)) assert.ok(ids.has("steam-cook"), `${p.id} lists steam-cook`);
    if (/pit roast|pit-roasted/i.test(p.process)) assert.ok(ids.has("pit-roast"), `${p.id} lists pit-roast`);
  }
});

test("R16: tradition entity set exactly matches spirits used by profiles and bottles", () => {
  const used = new Set([...profiles.map((p) => p.traditionId), ...bottles.map((b) => b.traditionId)]);
  assert.deepEqual([...used].sort(), [...traditionIds].sort());
});

test("R16: identifier stability — plant/tradition/region ids are unique and kebab-case", () => {
  const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const [name, arr, key] of [["plants", plants, "id"], ["regions", regions, "id"], ["traditions", traditions, "id"]]) {
    const ids = arr.map((x) => x[key]);
    assert.equal(new Set(ids).size, ids.length, `${name} ids unique`);
    for (const id of ids) assert.match(id, ID_PATTERN, `${name} id ${id} kebab-case`);
  }
});
