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
const map = await read("assets/geo/mexico-states.svg");

const { getCompareSelection, setCompareSelection, addToSelection } =
  await import("../assets/js/compare-selection.js");
const { captureView, takeView } = await import("../assets/js/view-memory.js");
const { parseHash, buildHash } = await import("../assets/js/router.js");
const { createLocale } = await import("../assets/js/locale.js");
const { renderProfile } = await import("../assets/js/profile.js");
const { renderExplore } = await import("../assets/js/explore.js");
const locale = createLocale();

test("issue 1: compare selection persists, unions and caps at three", () => {
  localStorage.clear();
  setCompareSelection([]);
  assert.deepEqual(getCompareSelection(), []);
  addToSelection([profiles[0].id]);
  addToSelection([profiles[1].id]);
  assert.deepEqual(getCompareSelection(), [profiles[0].id, profiles[1].id],
    "selection persists across calls and appends");
  addToSelection([profiles[0].id]);
  assert.equal(getCompareSelection().length, 2, "re-adding an id does not duplicate it");
  addToSelection([profiles[2].id, profiles[3].id]);
  assert.deepEqual(getCompareSelection(), [profiles[0].id, profiles[1].id, profiles[2].id],
    "selection is capped at three slots in insertion order");
  setCompareSelection([profiles[1].id]);
  assert.deepEqual(getCompareSelection(), [profiles[1].id]);
});

test("issue 1: profile compare action adds to the selection with selected and full states", () => {
  localStorage.clear();
  const root = document.createElement("div");
  const bottle = bottles.find((b) => b.id === profiles[0].exampleBottleId);
  const render = (selection) => renderProfile(root, {
    profile: profiles[0], bottle, sources: sourceList,
    compareSelection: selection, allProfiles: profiles, allBottles: bottles, locale,
  });

  // Empty selection: adds this style to an empty comparison.
  render([]);
  let link = root.querySelector(".compare-profile-link");
  assert.equal(link.getAttribute("href"), "#/compare/" + profiles[0].id);
  assert.ok(!link.classList.contains("is-selected"));
  assert.ok(!link.classList.contains("is-full"));

  // Existing selection: the link appends, keeping the earlier picks.
  render([profiles[1].id, profiles[2].id]);
  link = root.querySelector(".compare-profile-link");
  assert.equal(link.getAttribute("href"),
    `#/compare/${profiles[1].id},${profiles[2].id},${profiles[0].id}`,
    "compare-this-style adds to the existing selection");

  // Already selected: the link reopens the current selection.
  render([profiles[0].id, profiles[2].id]);
  link = root.querySelector(".compare-profile-link");
  assert.ok(link.classList.contains("is-selected"));
  assert.ok(link.textContent.includes("In your comparison"), "selected state is labeled");
  assert.equal(link.getAttribute("href"), `#/compare/${profiles[0].id},${profiles[2].id}`);

  // Full comparison: the link reopens the selection instead of overflowing.
  render([profiles[1].id, profiles[2].id, profiles[3].id]);
  link = root.querySelector(".compare-profile-link");
  assert.ok(link.classList.contains("is-full"));
  assert.equal(link.getAttribute("href"),
    `#/compare/${profiles[1].id},${profiles[2].id},${profiles[3].id}`);
});

test("issue 2: explore captures query, filters and origin; returning restores them", async () => {
  sessionStorage.clear();
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, text: async () => map });
  try {
    const root = document.createElement("div");
    const api = await renderExplore(root, {
      profiles, bottles, locale, mapUrl: "https://example.test/map.svg",
    });
    const { flavorMoods } = await import("../assets/js/compare.js");
    const moodProfile = profiles.find((p) => flavorMoods(p).length > 0);
    const aMood = flavorMoods(moodProfile)[0];
    root.querySelector("#profile-search").value = "";
    root.querySelector("#spirit-filter").value = moodProfile.spirit;
    root.querySelector("#mood-filter").value = aMood;
    api.capture();
    const snapshot = takeView("explore");
    assert.ok(snapshot, "explore snapshot captured");
    assert.equal(snapshot.query, "");
    assert.equal(snapshot.spirit, moodProfile.spirit);
    assert.equal(snapshot.mood, aMood, "flavour filter captured");
    assert.ok(typeof snapshot.scrollY === "number");

    // A fresh render with the snapshot restores the view.
    const root2 = document.createElement("div");
    await renderExplore(root2, {
      profiles, bottles, locale, mapUrl: "https://example.test/map.svg",
      restore: snapshot,
    });
    assert.equal(root2.querySelector("#profile-search").value, "", "query restored");
    assert.equal(root2.querySelector("#spirit-filter").value, moodProfile.spirit, "tradition filter restored");
    assert.equal(root2.querySelector("#mood-filter").value, aMood, "flavour filter restored");
    assert.ok(root2.querySelector(".results-count"), "result count restored with the view");
    assert.ok(root2.querySelectorAll(".state-results .profile-link").length >= 1);

    // Captured snapshots are consumed once: a later return starts fresh.
    assert.equal(takeView("explore"), null);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("issue 2: catalogue origin is preserved in routes and back links", () => {
  const route = parseHash("#/profile/tequila-blanco-valley-jalisco?origin=catalogue");
  assert.equal(route.name, "profile");
  assert.equal(route.params.origin, "catalogue");
  assert.equal(
    buildHash({ name: "profile", params: { profileId: "x", origin: "catalogue" } }),
    "#/profile/x?origin=catalogue",
    "shareable routes keep the origin"
  );
  const both = parseHash("#/profile/sotol-chihuahua?from=chih&origin=catalogue");
  assert.equal(both.params.profileId, "sotol-chihuahua");
  assert.equal(both.params.from, "chih");
  assert.equal(both.params.origin, "catalogue", "from and origin coexist");
  assert.equal(
    buildHash({ name: "profile", params: { profileId: "sotol-chihuahua", from: "chih", origin: "catalogue" } }),
    "#/profile/sotol-chihuahua?from=chih&origin=catalogue",
    "round-trip preserves both params"
  );

  const root = document.createElement("div");
  const profile = profiles[0];
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  renderProfile(root, {
    profile, bottle, sources: sourceList, origin: "catalogue",
    allProfiles: profiles, allBottles: bottles, locale,
  });
  assert.equal(root.querySelector(".back-link").getAttribute("href"), "#/catalogue",
    "back link returns to the catalogue when the profile came from there");

  // In-page suggestion links keep the origin for a second hop.
  const suggestions = [...root.querySelectorAll(".suggestion-link")];
  assert.ok(suggestions.length >= 1, "profile offers suggestions");
  for (const link of suggestions) {
    assert.ok(link.getAttribute("href").includes("origin=catalogue"),
      "suggestion links keep the catalogue origin");
  }

  // Without an origin, suggestion links stay clean shareable routes.
  const root2 = document.createElement("div");
  renderProfile(root2, {
    profile, bottle, sources: sourceList,
    allProfiles: profiles, allBottles: bottles, locale,
  });
  for (const link of root2.querySelectorAll(".suggestion-link")) {
    assert.ok(!link.getAttribute("href").includes("origin="), "no origin param without catalogue context");
  }
});

test("issue 3: search and filters feed one results collection with a count and Clear all", async () => {
  sessionStorage.clear();
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, text: async () => map });
  try {
    const root = document.createElement("div");
    await renderExplore(root, {
      profiles, bottles, locale, mapUrl: "https://example.test/map.svg",
    });
    const all = profiles.length;
    assert.equal(root.querySelectorAll(".state-results .profile-link").length, all,
      "unfiltered collection shows every profile");
    const count = root.querySelector(".results-count");
    assert.ok(count && count.textContent.trim() === `${all} profiles`, "result count matches the collection");

    // Search and a filter combine multiplicatively.
    const search = root.querySelector("#profile-search");
    search.value = "mezcal";
    search.dispatchEvent(new window.Event("input", { bubbles: true }));
    const afterSearch = root.querySelectorAll(".state-results .profile-link").length;
    assert.ok(afterSearch >= 1 && afterSearch < all, "search narrows the collection");
    assert.equal(root.querySelector(".results-count").textContent.trim(), `${afterSearch} profiles`,
      "count tracks the combined result");

    // Clear all resets the query and every filter at once.
    root.querySelector("#spirit-filter").value = "mezcal";
    root.querySelector("#mood-filter").value =
      [...root.querySelector("#mood-filter").options].map((o) => o.value).find((v) => v) || "";
    root.querySelector(".discovery-controls button").click();
    assert.equal(search.value, "", "query cleared");
    assert.equal(root.querySelector("#spirit-filter").value, "", "tradition filter cleared");
    assert.equal(root.querySelector("#mood-filter").value, "", "flavour filter cleared");
    assert.equal(root.querySelectorAll(".state-results .profile-link").length, all,
      "collection is whole again after Clear all");
  } finally {
    globalThis.fetch = previousFetch;
  }
});
