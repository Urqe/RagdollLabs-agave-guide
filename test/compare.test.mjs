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

test("release 6: dedupe, invalid-id pruning and route canonicalization", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const profiles = [
    fixture({ id: "a", title: "Profile A" }),
    fixture({ id: "b", title: "Profile B", sensory: { smoke: "high" } }),
  ];
  const changes = [];
  renderCompare(container, { profiles, compareIds: "a,a,not-a-profile", onSelectionChange: (ids) => changes.push(ids) });
  // Duplicates collapse and unknown ids are pruned, canonicalizing the route once.
  assert.deepEqual(changes[changes.length - 1], ["a"]);
  assert.equal(container.querySelector(".compare-table"), null, "no table with one valid profile");
  assert.equal(container.textContent.includes("One more pick"), true);
  container.remove();
});

test("release 6: duplicate route ids never render duplicate columns", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const profiles = [
    fixture({ id: "a", title: "Profile A" }),
    fixture({ id: "b", title: "Profile B", sensory: { smoke: "high" } }),
  ];
  renderCompare(container, { profiles, compareIds: "a,a,b", onSelectionChange: () => {} });
  const columns = container.querySelectorAll("thead th[scope]");
  assert.equal(columns.length - 1, 2, "exactly two columns for a,a,b");
  const titles = [...columns].slice(1).map((c) => c.textContent);
  assert.equal(new Set(titles).size, titles.length, "no duplicate column titles");
  container.remove();
});

test("release 6: live announcements on add and remove", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const profiles = [
    fixture({ id: "a", title: "Profile A" }),
    fixture({ id: "b", title: "Profile B", sensory: { smoke: "high" } }),
  ];
  const changes = [];
  renderCompare(container, { profiles, compareIds: "a", onSelectionChange: (ids) => changes.push(ids) });
  const status = container.querySelector(".compare-status");
  assert.equal(status.getAttribute("role"), "status");

  const addButton = [...container.querySelectorAll(".compare-pick-button")].find((b) => b.dataset.profileId === "b");
  addButton.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.ok(status.textContent.includes("Added Profile B"), "announces adds");

  // After re-render with the new route, removing announces too.
  container.textContent = "";
  renderCompare(container, { profiles, compareIds: "a,b", onSelectionChange: (ids) => changes.push(ids) });
  const status2 = container.querySelector(".compare-status");
  const removeButton = container.querySelector(".compare-remove-button");
  removeButton.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.ok(status2.textContent.includes("Removed"), "announces removes");
  container.remove();
});

test("release 6: focus restores to the acted-on picker button", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const profiles = [
    fixture({ id: "a", title: "Profile A" }),
    fixture({ id: "b", title: "Profile B", sensory: { smoke: "high" } }),
  ];
  // After removing profile A, its picker button is enabled again and focus
  // lands on it, so keyboard users keep their place.
  renderCompare(container, { profiles, compareIds: "b", focusProfileId: "a", onSelectionChange: () => {} });
  const focused = document.activeElement;
  assert.equal(focused && focused.dataset ? focused.dataset.profileId : null, "a");
  container.remove();
});

test("end-to-end: real app boots and compare selection updates the route and table", async () => {
  // Separate jsdom window: this test imports the real app module, which
  // was the blind spot of the callback-injected tests.
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const bootDom = new JSDOM("<!doctype html><html><body><div id='app'></div></body></html>", {
    url: "https://example.test/RagdollLabs-agave-guide/#/compare",
    pretendToBeVisual: true,
  });
  const prevWindow = globalThis.window;
  const prevDocument = globalThis.document;
  globalThis.window = bootDom.window;
  globalThis.document = bootDom.window.document;

  const files = {
    "profiles.json": await readFile(path.join(root, "assets/data/profiles.json"), "utf8"),
    "bottles.json": await readFile(path.join(root, "assets/data/bottles.json"), "utf8"),
    "sources.json": await readFile(path.join(root, "assets/data/sources.json"), "utf8"),
    "plants.json": await readFile(path.join(root, "assets/data/plants.json"), "utf8"),
    "processes.json": await readFile(path.join(root, "assets/data/processes.json"), "utf8"),
    "glossary.json": await readFile(path.join(root, "assets/data/glossary.json"), "utf8"),
  };
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel in files) return { ok: true, json: async () => JSON.parse(files[rel]), text: async () => files[rel] };
    return { ok: false, status: 404 };
  };

  try {
    await import(path.join(root, "assets/js/app.js"));
    await new Promise((r) => setTimeout(r, 50));
    const buttons = () => [...bootDom.window.document.querySelectorAll(".compare-pick-button")];
    const expected = JSON.parse(files["profiles.json"]).profiles.length;
    assert.equal(buttons().length, expected, "picker renders every profile");

    buttons().find((b) => b.dataset.profileId === "tequila-blanco-valley-jalisco").click();
    await new Promise((r) => setTimeout(r, 30));
    assert.ok(bootDom.window.location.hash.includes("tequila-blanco-valley-jalisco"), "first pick updates the route");

    buttons().find((b) => b.dataset.profileId === "mezcal-espadin-valles-centrales").click();
    await new Promise((r) => setTimeout(r, 30));
    assert.ok(bootDom.window.document.querySelector(".compare-table"), "second pick renders the comparison");
    assert.ok(bootDom.window.location.hash.includes(","), "route keeps both ids");
  } finally {
    globalThis.window = prevWindow;
    globalThis.document = prevDocument;
    globalThis.fetch = prevFetch;
  }
});
