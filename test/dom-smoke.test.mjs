import { test, before } from "node:test";
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
globalThis.DOMParser = dom.window.DOMParser;
globalThis.Event = dom.window.Event;
globalThis.KeyboardEvent = dom.window.KeyboardEvent;
globalThis.Node = dom.window.Node;

const readText = (rel) => readFile(path.join(root, rel), "utf8");

const profiles = JSON.parse(await readText("assets/data/profiles.json"));
const bottles = JSON.parse(await readText("assets/data/bottles.json"));
const sources = JSON.parse(await readText("assets/data/sources.json"));
const svgText = await readText("assets/geo/mexico-states.svg");

// Minimal fetch stub backed by the real local files.
const files = {
  "assets/data/profiles.json": JSON.stringify(profiles),
  "assets/data/bottles.json": JSON.stringify(bottles),
  "assets/data/sources.json": JSON.stringify(sources),
  "assets/geo/mexico-states.svg": svgText,
};
globalThis.fetch = async (url) => {
  const rel = new URL(url, "https://example.test/RagdollLabs-agave-guide/").pathname
    .replace(/^\/RagdollLabs-agave-guide\//, "");
  if (rel in files) {
    return { ok: true, status: 200, json: async () => JSON.parse(files[rel]), text: async () => files[rel] };
  }
  return { ok: false, status: 404, statusText: "Not Found" };
};

const { parseHash, buildHash, navigateTo } = await import("../assets/js/router.js");
const { renderExplore } = await import("../assets/js/explore.js");
const { renderProfile, renderProfileNotFound } = await import("../assets/js/profile.js");
const { renderMap, shadeCovered, STATE_NAMES } = await import("../assets/js/map.js");

test("router parses all route shapes", () => {
  assert.deepEqual(parseHash(""), { name: "home", params: {} });
  assert.deepEqual(parseHash("#/"), { name: "home", params: {} });
  assert.deepEqual(parseHash("#/explore"), { name: "explore", params: {} });
  assert.deepEqual(parseHash("#/explore/jal"), { name: "state", params: { stateId: "jal" } });
  assert.deepEqual(parseHash("#/profile/tequila-blanco-valley-jalisco"), {
    name: "profile",
    params: { profileId: "tequila-blanco-valley-jalisco" },
  });
  assert.deepEqual(parseHash("#/profile/tequila-blanco-valley-jalisco?from=jal"), {
    name: "profile",
    params: { profileId: "tequila-blanco-valley-jalisco", from: "jal" },
  });
  assert.equal(buildHash({ name: "profile", params: { profileId: "x", from: "jal" } }), "#/profile/x?from=jal");
  assert.deepEqual(parseHash("#/nonsense"), { name: "notFound", params: {} });
  assert.equal(buildHash({ name: "state", params: { stateId: "oax" } }), "#/explore/oax");
  assert.equal(buildHash({ name: "profile", params: { profileId: "x" } }), "#/profile/x");
});

test("navigateTo does not duplicate history entry for same hash", () => {
  window.location.hash = "#/explore";
  const before = window.history.length;
  const changed = navigateTo({ name: "explore" });
  assert.equal(changed, false);
  assert.equal(window.history.length, before);
  const changed2 = navigateTo({ name: "home" });
  assert.equal(changed2, true);
  assert.equal(window.location.hash, "#/");
});

test("map renders 32 states; only covered states are selectable", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const selections = [];
  const api = await renderMap(container, "https://example.test/RagdollLabs-agave-guide/assets/geo/mexico-states.svg", {
    coveredStateIds: ["jal", "oax"],
    onSelect: (id) => selections.push(id),
  });
  // All 32 states stay visible on the map.
  assert.equal(container.querySelectorAll("path[data-state]").length, 32);
  // Only covered states are interactive on the map.
  assert.equal(container.querySelectorAll("path[data-state].is-selectable").length, 2);
  assert.equal(container.querySelectorAll("path[data-state][tabindex]").length, 2);
  // Only covered states appear in the list.
  assert.equal(container.querySelectorAll(".state-list-button").length, 2);

  const jalPath = container.querySelector('path[data-state="jal"]');
  jalPath.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.deepEqual(selections, ["jal"]);
  assert.equal(jalPath.getAttribute("aria-pressed"), "true");
  const jalButton = container.querySelector('.state-list-button[data-state="jal"]');
  assert.equal(jalButton.getAttribute("aria-pressed"), "true");

  // Keyboard selection on the SVG path.
  const oaxPath = container.querySelector('path[data-state="oax"]');
  oaxPath.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert.deepEqual(selections, ["jal", "oax"]);
  assert.equal(api.getSelected(), "oax");
  assert.equal(jalPath.getAttribute("aria-pressed"), "false");

  // List button selection syncs back to the map.
  jalButton.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.equal(jalPath.getAttribute("aria-pressed"), "true");

  // Uncovered states are not selectable and not announced.
  const sonPath = container.querySelector('path[data-state="son"]');
  sonPath.dispatchEvent(new window.Event("click", { bubbles: true }));
  assert.deepEqual(selections, ["jal", "oax", "jal"]);
  assert.equal(sonPath.getAttribute("role"), null);
  assert.equal(sonPath.getAttribute("aria-hidden"), "true");
  assert.equal(container.querySelector('.state-list-button[data-state="son"]'), null);

  // Coverage shading.
  shadeCovered(container, ["jal", "oax"]);
  assert.ok(jalPath.classList.contains("is-covered"));
  assert.ok(!sonPath.classList.contains("is-covered"));
  assert.ok(sonPath.classList.contains("is-inert"));

  container.remove();
});

test("explore view shows covered profiles, empty state and search", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const api = await renderExplore(container, {
    profiles: profiles.profiles,
    bottles: bottles.bottles,
    selectedStateId: "jal",
    mapUrl: "https://example.test/RagdollLabs-agave-guide/assets/geo/mexico-states.svg",
  });
  assert.ok(container.querySelector(".state-results-title").textContent.includes("Jalisco"));
  const link = container.querySelector('.profile-link');
  assert.equal(link.getAttribute("href"), "#/profile/tequila-blanco-valley-jalisco?from=jal");

  // Search: by spirit (accent/case-insensitive), with a reason.
  const searchInput = container.querySelector(".search-input");
  searchInput.value = "Raicilla";
  searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  const searchLinks = container.querySelectorAll(".search-result-link");
  assert.ok(searchLinks.length >= 1);
  assert.ok(searchLinks[0].getAttribute("href").includes("#/profile/raicilla-maximiliana-sierra-jalisco"));
  assert.ok(container.querySelector(".search-result-reason").textContent.length > 0);

  // Search: by agave alias without accent.
  searchInput.value = "espadin";
  searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.ok(container.querySelector('.search-result-link[href*="mezcal-espadin-valles-centrales"]'));

  // Search: by place.
  searchInput.value = "sonora";
  searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.ok(container.querySelector('.search-result-link[href*="bacanora-pacifica-sierra-sonora"]'));

  // Search: no match message.
  searchInput.value = "zzz-unknown";
  searchInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert.ok(container.querySelector(".search-empty").textContent.includes("No profiles match"));

  // Sonora is covered now (bacanora) and carries its state context in links.
  api.setState("son");
  assert.ok(container.querySelector(".state-results-title").textContent.includes("Sonora"));
  assert.ok(container.querySelector('a[href="#/profile/bacanora-pacifica-sierra-sonora?from=son"]'));

  // An uncovered state still renders the neutral empty state.
  api.setState("chih");
  assert.equal(container.querySelector(".empty-state").textContent, "No profiles added here yet");

  api.setState("oax");
  assert.ok(container.querySelector(".state-results-title").textContent.includes("Oaxaca"));
  assert.ok(container.querySelector('a[href="#/profile/mezcal-espadin-valles-centrales?from=oax"]'));

  container.remove();
});

test("profile view renders all sections and the example bottle card", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const profile = profiles.profiles[0];
  const bottle = bottles.bottles.find((b) => b.id === profile.exampleBottleId);
  renderProfile(container, { profile, bottle, sources: sources.sources });

  assert.equal(container.querySelector("#profile-title").textContent, profile.title);
  assert.ok(container.querySelector(".profile-plant").textContent.includes("Agave tequilana"));
  assert.ok(container.querySelector(".profile-process").textContent.length > 0);
  assert.ok(container.querySelector(".profile-category").textContent.includes("Tequila"));
  assert.ok(container.querySelector(".beginner-note").textContent.length > 0);
  assert.ok(container.querySelector(".profile-context").textContent.length > 0);
  assert.ok(container.querySelector(".editorial-note").textContent.includes("Editorial style guidance"));
  assert.equal(container.querySelectorAll(".taste-list li").length, profile.tasteNotes.length);
  assert.ok(container.querySelector(".profile-body").textContent.includes("Light"));
  assert.ok(container.querySelector(".profile-finish").textContent.length > 0);

  const card = container.querySelector(".bottle-card");
  assert.ok(card.textContent.includes("Fortaleza"));
  assert.ok(card.textContent.includes("40% ABV"));
  assert.ok(card.querySelector(".bottle-review").textContent.length > 0);
  assert.ok(card.querySelectorAll(".source-link").length >= 2);

  // Profile sources rendered as https links.
  for (const link of container.querySelectorAll(".source-link")) {
    assert.equal(new URL(link.href).protocol, "https:");
    assert.equal(link.getAttribute("rel"), "noopener noreferrer");
  }
  assert.equal(container.querySelector(".back-link").getAttribute("href"), "#/explore");

  container.remove();
});

test("mezcal profile shows smoke; tequila profile does not", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const mezcal = profiles.profiles.find((p) => p.spirit === "mezcal");
  const bottle = bottles.bottles.find((b) => b.id === mezcal.exampleBottleId);
  renderProfile(container, { profile: mezcal, bottle, sources: sources.sources });
  assert.ok(container.querySelector(".profile-smoke").textContent.length > 0);
  container.remove();

  const tequila = profiles.profiles.find((p) => p.spirit === "tequila");
  const tbottle = bottles.bottles.find((b) => b.id === tequila.exampleBottleId);
  renderProfile(container, { profile: tequila, bottle: tbottle, sources: sources.sources });
  assert.equal(container.querySelector(".profile-smoke"), null);
  container.remove();
});

test("profile back link returns to the selected state when context exists", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const profile = profiles.profiles[0];
  const bottle = bottles.bottles.find((b) => b.id === profile.exampleBottleId);
  renderProfile(container, { profile, bottle, sources: sources.sources, returnTo: "jal" });
  assert.equal(container.querySelector(".back-link").getAttribute("href"), "#/explore/jal");
  container.remove();

  const container2 = document.createElement("div");
  document.body.appendChild(container2);
  renderProfile(container2, { profile, bottle, sources: sources.sources });
  assert.equal(container2.querySelector(".back-link").getAttribute("href"), "#/explore");
  container2.remove();
});

test("release 4 maintenance: overlapping state coverage, alias ranking, producer visibility", async () => {
  // Jalisco now holds two profiles (tequila + raicilla); both render under the state view.
  const container = document.createElement("div");
  document.body.appendChild(container);
  const api = await renderExplore(container, {
    profiles: profiles.profiles,
    bottles: bottles.bottles,
    selectedStateId: "jal",
    mapUrl: "https://example.test/RagdollLabs-agave-guide/assets/geo/mexico-states.svg",
  });
  const jalLinks = container.querySelectorAll('.state-results a[href*="#/profile/"]');
  assert.equal(jalLinks.length, profiles.profiles.filter((p) => p.stateId === "jal").length);
  container.remove();

  const { searchProfiles, applyAliases } = await import("../assets/js/search.js");

  // Exact spirit match ranks first: "mezcal" -> the mezcal profile, not mentioners.
  const mezcalHits = searchProfiles({ profiles: profiles.profiles, bottles: bottles.bottles, query: "mezcal" });
  assert.ok(mezcalHits.length >= 1);
  assert.equal(mezcalHits[0].profile.spirit, "mezcal");
  assert.equal(mezcalHits[0].rank, 0);

  // Aliases: no-op identity entries are gone; real aliases map.
  assert.equal(applyAliases("espadin"), "espadin");
  assert.equal(applyAliases("silver"), "blanco");
  assert.equal(applyAliases("blue agave"), "tequilana");
  assert.equal(applyAliases("lechuguilla"), "maximiliana");

  // Duplicate results: every search returns each profile at most once.
  const all = searchProfiles({ profiles: profiles.profiles, bottles: bottles.bottles, query: "agave" });
  const ids = all.map((r) => r.profile.id);
  assert.equal(new Set(ids).size, ids.length);

  // Seed bottles now show producer and place (brand vs producer identity).
  const fortaleza = bottles.bottles.find((b) => b.id === "fortaleza-blanco");
  assert.ok(fortaleza.producer.includes("Tequila Fortaleza"));
  assert.ok(fortaleza.place.includes("Jalisco"));
  const explorer = bottles.bottles.find((b) => b.id === "lost-explorer-espadin");
  assert.ok(explorer.producer.length > 0 && explorer.place.length > 0);
});

test("unknown profile id renders a not-found view with a way back", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderProfileNotFound(container, "does-not-exist");
  assert.ok(container.textContent.includes("Profile not found"));
  assert.equal(container.querySelector(".back-link").getAttribute("href"), "#/explore");
  container.remove();
});

test("state list covers all 32 states and matches the SVG", () => {
  assert.equal(Object.keys(STATE_NAMES).length, 32);
  const svgStates = [...svgText.matchAll(/data-state="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...Object.keys(STATE_NAMES)].sort(), svgStates.sort());
});
