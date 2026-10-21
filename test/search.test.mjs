import { test } from "node:test";
import assert from "node:assert/strict";
import { searchProfiles, applyAliases } from "../assets/js/search.js";

const profiles = [
  {
    id: "tequila-valle",
    title: "Tequila del valle",
    spirit: "tequila",
    stateName: "Jalisco",
    plant: "Blue agave",
    tasteNotes: ["cooked agave", "vanilla", "citrus"],
    context: "Valley tequila profile",
    exampleBottleId: "b1",
  },
  {
    id: "mezcal-oaxaca",
    title: "Mezcal oaxaqueño",
    spirit: "mezcal",
    stateName: "Oaxaca",
    plant: "Espadín",
    tasteNotes: ["mesquite smoke", "pepper"],
    context: "Oaxacan mezcal profile",
  },
];

const bottles = [
  { id: "b1", brand: "Valle Azul", expression: "Blanco", producer: "La Destilería", place: "Jalisco" },
];

test("alias keys are normalized: accented Spanish queries match their targets", () => {
  // "cítricos" normalizes to "citricos"; the alias table key must not
  // outlive normalization (the old literal accented key could never match).
  assert.equal(applyAliases("citricos"), "citrus");
  assert.equal(applyAliases("cítricos"), "citrus");
  assert.equal(applyAliases("CÍTRICOS"), "citrus");
});

test("alias lookups use the deduped normalized key: dulce maps to sweetness, not clobbered", () => {
  assert.equal(applyAliases("dulce"), "sweetness");
});

test("alias values are normalized before matching", () => {
  // The mapped value participates in normalized matching, so an alias value
  // with internal spaces or accents still matches the haystack.
  assert.equal(applyAliases("humo de mezquite"), "mesquite smoke");
  assert.equal(applyAliases("humo"), "smoke");
});

test("normalized alias key shadows nothing: every entry is reachable", () => {
  for (const key of ["tequilana weber", "blue agave", "weber azul", "silver", "plata", "ahumado", "envejecido", "roble"]) {
    const mapped = applyAliases(key);
    assert.notEqual(mapped, key, `alias for "${key}" should map to a different term`);
  }
});

test("searchProfiles finds Spanish-alias queries over English note vocabulary", () => {
  const results = searchProfiles({ profiles, bottles, query: "humo" });
  // "humo" -> "smoke" matches the "mesquite smoke" taste note
  const ids = results.map((r) => r.profile.id);
  assert.ok(ids.includes("mezcal-oaxaca"), `expected mezcal-oaxaca for "humo", got ${ids.join(", ")}`);
});

test("searchProfiles ranks exact spirit matches first", () => {
  const results = searchProfiles({ profiles, bottles, query: "tequila" });
  assert.ok(results.length > 0);
  assert.equal(results[0].profile.spirit, "tequila");
  assert.equal(results[0].rank, 0);
});

test("searchProfiles matches example bottle producer and brand", () => {
  const byBrand = searchProfiles({ profiles, bottles, query: "Valle Azul" });
  assert.equal(byBrand.map((r) => r.profile.id)[0], "tequila-valle");
  const byProducer = searchProfiles({ profiles, bottles, query: "La Destilería" });
  assert.equal(byProducer.map((r) => r.profile.id)[0], "tequila-valle");
});

test("searchProfiles reason cites the Spanish note hit through esNoteHit", () => {
  // A query hitting only the ES label of a taste note yields a taste-note
  // reason (the previously dead esNoteHit argument is now wired).
  const results = searchProfiles({ profiles, bottles, query: "humo" });
  const mezcal = results.find((r) => r.profile.id === "mezcal-oaxaca");
  assert.ok(mezcal, "mezcal should match humo/smoke");
  assert.match(mezcal.reason, /Taste note matches|Matches/);
});
