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

const { biggestDifferences, missingDimensions, flavorMoods, ifYouLikeThis, levelOf, DIMENSIONS } =
  await import("../assets/js/compare.js");
const { renderCompare } = await import("../assets/js/compare-view.js");

/**
 * Deterministic fixtures for explanation invariants. These do NOT depend
 * on the live data files: the invariants must hold for any valid input.
 */
const fixture = (over = {}) => ({
  id: "fixture-profile",
  title: "Fixture Profile",
  spirit: "mezcal",
  body: "medium",
  sensory: {
    smoke: "low", herbal: "medium", fruit: "medium", sweetness: "low",
    pepper: "low", oak: "none", finishLength: "high",
    ...over.sensory,
  },
  ...over,
});

test("dimension levels: unknown is first-class and never coerced", () => {
  const p = fixture({ id: "a", sensory: { smoke: null } });
  assert.equal(levelOf(p, "smoke"), null);
  const diffs = biggestDifferences([p, fixture({ id: "b" })]);
  assert.ok(!diffs.some((d) => d.key === "smoke"), "unknown dimensions never appear in differences");
});

test("biggest differences: ordered by gap, deterministic", () => {
  const a = fixture({ id: "a", title: "A", sensory: { smoke: "none", pepper: "low" } });
  const b = fixture({ id: "b", title: "B", sensory: { smoke: "high", pepper: "medium" } });
  const c = fixture({ id: "c", title: "C", sensory: { smoke: "low", pepper: "low" } });
  const diffs = biggestDifferences([a, b, c]);
  assert.ok(diffs.length > 0);
  assert.equal(diffs[0].key, "smoke", "largest gap first");
  for (let i = 1; i < diffs.length; i++) {
    assert.ok(diffs[i - 1].gap >= diffs[i].gap, "non-increasing gaps");
  }
  // Deterministic: same input, same output.
  assert.deepEqual(diffs, biggestDifferences([a, b, c]));
});

test("missing dimensions are reported explicitly", () => {
  const a = fixture({ id: "a", sensory: { smoke: null } });
  const b = fixture({ id: "b" });
  const missing = missingDimensions([a, b]);
  assert.ok(missing.some((m) => m.key === "smoke"));
});

test("moods derive only from supported attributes", () => {
  const smoky = fixture({ id: "a", sensory: { smoke: "high" } });
  assert.ok(flavorMoods(smoky).includes("Smoke-forward"));
  // A profile with all dimensions unknown yields no moods.
  const blank = fixture({ id: "b", sensory: Object.fromEntries(
    DIMENSIONS.filter((d) => d.key !== "bodyLevel").map((d) => [d.key, null])
  ) });
  assert.deepEqual(flavorMoods(blank), []);
});

test("if-you-like suggestions name shared documented attributes and skip incompatible evidence", () => {
  const anchor = fixture({ id: "a", sensory: { smoke: "none", herbal: "high", pepper: "medium", fruit: "low", sweetness: "low", oak: "none", finishLength: "medium" } });
  const similar = fixture({ id: "b", title: "Similar", sensory: { smoke: "none", herbal: "high", pepper: "medium", fruit: "low", sweetness: "low", oak: "none", finishLength: "medium" } });
  const different = fixture({ id: "c", title: "Different", body: "full", sensory: { smoke: "high", herbal: "low", pepper: "low", fruit: "high", sweetness: "high", oak: "low", finishLength: "low" } });
  const suggestions = ifYouLikeThis(anchor, [similar, different]);
  const suggestedIds = suggestions.map((x) => x.profile.id);
  assert.ok(!suggestedIds.includes("c"), "incompatible profile is never suggested");
  assert.ok(suggestedIds.includes("b"), "profile sharing documented attributes is suggested");
  for (const s of suggestions) assert.ok(s.reason.includes("Shares"));
  assert.ok(ifYouLikeThis(anchor, [different]).length === 0);

  // Unknown anchor dimensions never generate suggestions.
  const unknownAnchor = fixture({
    id: "d", body: null,
    sensory: Object.fromEntries(DIMENSIONS.map((x) => [x.key, null]).filter(([k]) => k !== "bodyLevel")),
  });
  assert.deepEqual(ifYouLikeThis(unknownAnchor, [similar]), []);
});

test("suggestion reasons never claim bottle measurements", () => {
  const anchor = fixture({ id: "a" });
  const other = fixture({ id: "b" });
  for (const s of ifYouLikeThis(anchor, [other])) {
    assert.ok(!/abv|bottle|score|rating/i.test(s.reason), "reasons stay editorial");
  }
});

test("compare view: picker, table, remove controls, missing-data note", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const changes = [];
  const profiles = [
    fixture({ id: "a", title: "Profile A", spirit: "tequila", stateName: "Jalisco" }),
    fixture({ id: "b", title: "Profile B", spirit: "mezcal", stateName: "Oaxaca" }),
    fixture({ id: "c", title: "Profile C", spirit: "bacanora", stateName: "Sonora" }),
  ];

  // Empty state
  renderCompare(container, { profiles, compareIds: "", onSelectionChange: (ids) => changes.push(ids) });
  assert.ok(container.textContent.includes("Pick at least two profiles"));
  container.textContent = "";

  // One pick: prompt for one more, no table yet
  renderCompare(container, { profiles, compareIds: "a", onSelectionChange: (ids) => changes.push(ids) });
  assert.ok(container.textContent.includes("One more pick"));
  assert.equal(container.querySelector(".compare-table"), null);
  container.textContent = "";

  // Two picks: full comparison
  profiles[1] = fixture({ id: "b", title: "Profile B", spirit: "mezcal", stateName: "Oaxaca", sensory: { smoke: "high", herbal: "low", pepper: "high", fruit: "low", sweetness: "high", oak: "none", finishLength: "low" } });
  renderCompare(container, { profiles, compareIds: "a,b", onSelectionChange: (ids) => changes.push(ids) });
  assert.ok(container.querySelector(".compare-table"));
  assert.equal(container.querySelectorAll(".compare-remove-button").length, 2);
  assert.ok(container.textContent.includes("Biggest differences"));
  // Sensory legend wording: editorial, not measurements
  assert.ok(container.textContent.includes("not measured sugar"));

  // Remove control changes the selection via the route callback
  const remove = container.querySelector(".compare-remove-button");
  remove.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.deepEqual(changes[changes.length - 1], ["b"], "removing profile A leaves B selected");

  // Third slot allowed, fourth refused by disabling
  container.textContent = "";
  renderCompare(container, { profiles, compareIds: "a,b,c", onSelectionChange: (ids) => changes.push(ids) });
  assert.equal(container.querySelectorAll("thead th:not([scope]) , thead th[scope]").length - 1, 3);
  const disabled = [...container.querySelectorAll(".compare-pick-button")].filter((b) => b.disabled);
  assert.equal(disabled.length, 3, "all picker buttons disabled when 3 selected");
  container.remove();
});

test("compare view: missing sensory data renders explicit unknown cells", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const profiles = [
    fixture({ id: "a", title: "A" }),
    fixture({ id: "b", title: "B", sensory: { smoke: null } }),
  ];
  renderCompare(container, { profiles, compareIds: "a,b", onSelectionChange: () => {} });
  const unknownCells = container.querySelectorAll(".compare-unknown");
  assert.ok(unknownCells.length > 0);
  assert.ok([...unknownCells].some((c) => c.textContent.includes("Not documented")));
  container.remove();
});
