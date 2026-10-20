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
const { processes } = JSON.parse(await read("assets/data/processes.json"));
const map = await read("assets/geo/mexico-states.svg");

const { createLocale } = await import("../assets/js/locale.js");
const locale = createLocale();
const es = createLocale();
es.set("es");

const withFetch = async (fn, { delay = 0, fail = false } = {}) => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    if (fail) throw new Error("network unavailable");
    return { ok: true, text: async () => map };
  };
  try {
    return await fn();
  } finally {
    globalThis.fetch = previousFetch;
  }
};

test("F1: home renders without the loading note left behind", async () => {
  const { renderHome } = await import("../assets/js/presentation.js");
  const root = document.createElement("div");
  root.appendChild(document.createElement("p")).className = "loading-note";
  renderHome(root, { profiles, locale });
  assert.equal(root.querySelector(".loading-note"), null, "loading note is cleared by renderHome");
  assert.ok(root.querySelector(".home-view"), "home renders");
});

test("F2: tasting notes display in Spanish and search finds Spanish descriptors", async () => {
  const { tasteNote } = await import("../assets/js/taste-notes.js");
  assert.equal(tasteNote("smoke", es), "humo");
  assert.equal(tasteNote("mesquite smoke", es), "humo de mezquite");
  assert.equal(tasteNote("totally-unknown-note", es), "totally-unknown-note", "unknown notes fall back to English");
  assert.equal(tasteNote("smoke", locale), "smoke", "English stays English");

  // Search: Spanish descriptors resolve through the alias table.
  const { searchProfiles } = await import("../assets/js/search.js");
  const humo = searchProfiles({ profiles, bottles, query: "humo" });
  assert.ok(humo.length >= 1, '"humo" finds smoke-forward profiles');
  const caramelo = searchProfiles({ profiles, bottles, query: "caramelo" });
  assert.ok(caramelo.length >= 1, '"caramelo" finds caramel profiles');

  // Profile taste list localizes.
  const { renderProfile } = await import("../assets/js/profile.js");
  const smokeProfile = profiles.find((p) => (p.tasteNotes || []).includes("mesquite smoke"));
  const root = document.createElement("div");
  const bottle = bottles.find((b) => b.id === smokeProfile.exampleBottleId);
  renderProfile(root, { profile: smokeProfile, bottle, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale: es });
  const notes = [...root.querySelectorAll(".taste-list li")].map((li) => li.textContent);
  assert.ok(notes.includes("humo de mezquite"), "profile taste notes render in Spanish");
});

test("F2: comparison row labels, announcements and dimension labels localize", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const root = document.createElement("div");
  const changes = [];
  renderCompare(root, {
    profiles: profiles.slice(0, 3), locale: es,
    compareIds: `${profiles[0].id},${profiles[1].id}`,
    onSelectionChange: (ids, q) => changes.push([ids, q]),
  });
  const rowLabels = [...root.querySelectorAll(".compare-table tbody th")].map((th) => th.textContent);
  assert.ok(rowLabels.includes("Humo"), "smoke row label is Spanish");
  assert.ok(rowLabels.includes("Cuerpo"), "body row label is Spanish");
  const status = root.querySelector(".compare-status").textContent;
  assert.ok(status.includes("Comparando"), "announcement is Spanish");
});

test("F3: learn process associations are narrow and never empty-string matches", async () => {
  const { renderLearn } = await import("../assets/js/learn-view.js");
  const { plants: plantData } = JSON.parse(await read("assets/data/plants.json"));
  const { glossary } = JSON.parse(await read("assets/data/glossary.json"));
  const root = document.createElement("div");
  renderLearn(root, { plants: plantData, processes, glossary, profiles, bottles, sources: sourceList, locale });

  const card = (id) => root.querySelector(`#process-${id}`)?.closest(".learn-card");
  const usedByTitles = (id) => {
    const line = card(id)?.querySelector(".learn-usedby");
    return line ? [...line.querySelectorAll("a")].map((a) => a.textContent) : [];
  };

  // Steam cooking must not list pit-roasted profiles.
  const steam = usedByTitles("steam-cook").join(" ");
  assert.ok(!steam.includes("mezcal"), "steam cooking excludes pit-roasted mezcal");
  assert.ok(!steam.includes("raicilla"), "steam cooking excludes pit-roasted raicilla");

  // Sap collection must not list cooked-heart tequila profiles.
  const sap = usedByTitles("sap-collection").join(" ");
  assert.ok(!sap.includes("Tequila"), "sap collection excludes cooked-heart tequila");

  // Wood maturation must not list unaged profiles.
  const wood = usedByTitles("wood-maturation").join(" ");
  assert.ok(!wood.includes("Blanco"), "wood maturation excludes unaged blanco");

  // Pit roast still lists the genuinely pit-roasted profiles (capped at
  // four links in the UI, but non-empty and all real).
  const pit = usedByTitles("pit-roast");
  assert.ok(pit.length >= 1, "pit roasting still lists its profiles");
  const pitMatches = profiles.filter((p) =>
    ["pit roast", "pit-roasted", "roasted in earthen", "cylindrical pit", "conical ovens", "adobe-oven roast", "underground pit roast"]
      .some((k) => (p.process || "").toLowerCase().includes(k)));
  assert.ok(pitMatches.length >= 5, "the underlying data has 5+ pit-roasted profiles");
  for (const title of pit) {
    assert.ok(pitMatches.some((p) => title.startsWith(p.title)), `displayed link ${title} is a real pit-roasted profile`);
  }
});

test("F4: map selection and language switch preserve the discovery state", async () => {
  const { renderExplore } = await import("../assets/js/explore.js");
  await withFetch(async () => {
    const root = document.createElement("div");
    const api = await renderExplore(root, { profiles, bottles, locale, mapUrl: "https://example.test/map.svg" });
    root.querySelector("#profile-search").value = "agave";
    root.querySelector("#spirit-filter").value = "tequila";
    const snapshot = api.snapshot();

    // Rebuild for a state route with the carried state: constraints survive.
    const root2 = document.createElement("div");
    await renderExplore(root2, {
      profiles, bottles, locale, selectedStateId: "jal",
      mapUrl: "https://example.test/map.svg", restore: { ...snapshot, stateId: "jal" },
    });
    assert.equal(root2.querySelector("#profile-search").value, "agave", "query survives map selection");
    assert.equal(root2.querySelector("#spirit-filter").value, "tequila", "tradition filter survives map selection");
    assert.ok(root2.querySelector(".state-results-title").textContent.includes("Jalisco"), "state applied");
    assert.ok(root2.querySelectorAll(".state-results .profile-link").length >= 1, "filtered results render");

    // A bare explore rebuild keeps the controls but drops the state restriction.
    const root3 = document.createElement("div");
    await renderExplore(root3, {
      profiles, bottles, locale, mapUrl: "https://example.test/map.svg",
      restore: { ...snapshot, stateId: null },
    });
    assert.equal(root3.querySelector("#profile-search").value, "agave", "query survives on bare explore");
    assert.equal(root3.querySelector(".state-results-title").textContent, "Style profiles", "no state restriction");
  });
});

test("F5: suggestion links keep both the explore state and catalogue origin", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const profile = profiles[0];
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  const root = document.createElement("div");
  renderProfile(root, {
    profile, bottle, sources: sourceList, returnTo: "jal", origin: "catalogue",
    allProfiles: profiles, allBottles: bottles, locale,
  });
  const link = root.querySelector(".suggestion-link");
  assert.ok(link.getAttribute("href").includes("from=jal"), "explore state kept");
  assert.ok(link.getAttribute("href").includes("origin=catalogue"), "catalogue origin kept");

  const root2 = document.createElement("div");
  renderProfile(root2, {
    profile, bottle, sources: sourceList, returnTo: "jal",
    allProfiles: profiles, allBottles: bottles, locale,
  });
  assert.ok(root2.querySelector(".suggestion-link").getAttribute("href").includes("from=jal"));
  assert.ok(!root2.querySelector(".suggestion-link").getAttribute("href").includes("origin="));
});

test("F7: comparison picker keeps its query across selection changes", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const seen = [];
  const render = (keep) => renderCompare(document.createElement("div"), {
    profiles, locale, compareIds: "", keepPickerQuery: keep,
    onSelectionChange: (ids, q) => seen.push(q),
  });
  const root = document.createElement("div");
  renderCompare(root, {
    profiles, locale, compareIds: "", keepPickerQuery: "mezcal",
    onSelectionChange: (ids, q) => seen.push(q),
  });
  assert.equal(root.querySelector("#compare-search").value, "mezcal", "query restored into the picker");
  const mezcalButton = [...root.querySelectorAll(".compare-pick-button")]
    .find((b) => b.dataset.profileId === "mezcal-espadin-valles-centrales");
  mezcalButton.click();
  assert.equal(seen[seen.length - 1], "mezcal", "selection change reports the live query");
});

test("F8: results render before the map resolves; a failed map keeps the view usable", async () => {
  const { renderExplore } = await import("../assets/js/explore.js");
  // Pending-forever map: results must already be in the DOM.
  const root = document.createElement("div");
  const pending = withFetch(
    () => renderExplore(root, { profiles, bottles, locale, mapUrl: "https://example.test/map.svg" }),
    { delay: 5000 },
  );
  await new Promise((r) => setTimeout(r, 60));
  assert.ok(root.querySelectorAll(".state-results .profile-link").length === profiles.length,
    "results render without waiting for the map");
  // Failed map: the fallback state list appears.
  const root2 = document.createElement("div");
  await withFetch(
    () => renderExplore(root2, { profiles, bottles, locale, mapUrl: "https://example.test/map.svg" }),
    { fail: true },
  ).catch(() => {});
  assert.ok(root2.querySelector(".state-results .profile-link"), "results survive a failed map");
});

test("F9: comparison selection survives when storage throws", async () => {
  const storage = globalThis.localStorage;
  const throwing = {
    getItem() { throw new Error("quota"); },
    setItem() { throw new Error("quota"); },
    removeItem() { throw new Error("quota"); },
  };
  globalThis.localStorage = throwing;
  try {
    const mod = await import("../assets/js/compare-selection.js?case=throwing");
    mod.setCompareSelection([profiles[0].id]);
    mod.addToSelection([profiles[1].id]);
    assert.deepEqual(mod.getCompareSelection(), [profiles[0].id, profiles[1].id],
      "selection survives in memory when storage throws");
    mod.addToSelection([profiles[0].id, profiles[2].id, profiles[3].id]);
    assert.equal(mod.getCompareSelection().length, 3, "cap and dedupe still work");
  } finally {
    globalThis.localStorage = storage;
  }
});
