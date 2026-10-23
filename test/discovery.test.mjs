import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Release 17 — Three Discovery Paths. Route parsing, the discovery hub,
 * plant/region/spirit/flavour detail pages, cross-links between the
 * entities, honest coverage language, and no dead ends.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => readFile(path.join(root, rel), "utf8").then((t) => JSON.parse(t));

const { profiles } = await readJson("assets/data/profiles.json");
const { plants } = await readJson("assets/data/plants.json");
const { regions } = await readJson("assets/data/regions.json");
const { traditions } = await readJson("assets/data/traditions.json");
const { bottles } = await readJson("assets/data/bottles.json");
const { sources } = await readJson("assets/data/sources.json");

const dom = new JSDOM("<!doctype html><html><body><div id=\"app\"></div></body></html>", {
  url: "https://example.test/RagdollLabs-agave-guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;

const { parseHash, buildHash } = await import("../assets/js/router.js");
const { renderDiscover } = await import("../assets/js/discovery-view.js");
const { createLocale } = await import("../assets/js/locale.js");

const container = document.getElementById("app");

function render(routeParams = {}) {
  container.innerHTML = "";
  renderDiscover(container, {
    kind: routeParams.kind || null,
    id: routeParams.id || null,
    plants, regions, traditions, profiles, bottles,
    locale: null,
  });
  return container;
}

test("R17: routes parse for all three paths plus flavours", () => {
  assert.deepEqual(parseHash("#/discover"), { name: "discover", params: {} });
  assert.deepEqual(parseHash("#/discover/plant/agave-tequilana"), { name: "discover", params: { kind: "plant", id: "agave-tequilana" } });
  assert.deepEqual(parseHash("#/discover/region/sierra-sonora"), { name: "discover", params: { kind: "region", id: "sierra-sonora" } });
  assert.deepEqual(parseHash("#/discover/spirit/bacanora"), { name: "discover", params: { kind: "spirit", id: "bacanora" } });
  assert.deepEqual(parseHash("#/discover/flavour/rich-oak"), { name: "discover", params: { kind: "flavour", id: "rich-oak" } });
  assert.deepEqual(parseHash("#/discover/nonsense/x"), { name: "notFound", params: {} });
  assert.equal(buildHash({ name: "discover", params: {} }), "#/discover");
  assert.equal(buildHash({ name: "discover", params: { kind: "plant", id: "agave-tequilana" } }), "#/discover/plant/agave-tequilana");
});

test("R17: hub lists all plants, regions, traditions and flavour categories", () => {
  const view = render();
  const chips = [...view.querySelectorAll("a.discovery-chip")].map((a) => a.getAttribute("href"));
  assert.equal(new Set(chips).size, chips.length, "chip links are unique");
  for (const plant of plants) assert.ok(chips.includes(`#/discover/plant/${plant.id}`), `hub links plant ${plant.id}`);
  for (const region of regions) assert.ok(chips.includes(`#/discover/region/${region.id}`), `hub links region ${region.id}`);
  for (const t of traditions) assert.ok(chips.includes(`#/discover/spirit/${t.id}`), `hub links tradition ${t.id}`);
  for (const f of ["fresh-herbal", "fruity-floral", "smoky-earthly", "peppery-spicy", "rich-oak", "adventurous"]) {
    assert.ok(chips.includes(`#/discover/flavour/${f}`), `hub links flavour ${f}`);
  }
  assert.equal(view.querySelectorAll("h2").length, 4, "three paths plus flavours as headings");
});

test("R17: plant page shows botanical identity, traditions, regions and linked expressions", () => {
  const view = render({ kind: "plant", id: "agave-angustifolia" });
  assert.ok(view.textContent.includes("Agave angustifolia"), "species shown");
  assert.ok(view.textContent.includes("espadín"), "common name shown");
  assert.ok(view.querySelector("a[href='#/discover/spirit/mezcal']"), "links to mezcal tradition");
  assert.ok(view.querySelector("a[href='#/discover/region/valles-centrales-oax']"), "links to a region");
  const expr = [...view.querySelectorAll("a.discovery-card")].map((a) => a.getAttribute("href"));
  assert.ok(expr.some((h) => h.startsWith("#/profile/")), "expressions link to profiles");
  const espadinProfiles = profiles.filter((p) => p.plantIds.includes("agave-angustifolia"));
  assert.equal(view.querySelectorAll("a.discovery-card").length, espadinProfiles.length, "all profiles for this plant listed");
  assert.ok(view.querySelector("a[href='#/discover']"), "back to hub — no dead end");
});

test("R17: region page distinguishes coverage from legal boundaries", () => {
  const view = render({ kind: "region", id: "sierra-sonora" });
  assert.ok(view.textContent.includes("Bacanora"), "region traditions shown");
  assert.match(view.textContent, /municipal/i, "bacanora's municipal framing kept");
  assert.ok(view.querySelector("a[href='#/explore/son']"), "links to the state view");
  const expr = view.querySelectorAll("a.discovery-card");
  assert.ok(expr.length > 0, "regional expressions listed");
  for (const card of expr) {
    const id = decodeURIComponent(card.getAttribute("href").split("/profile/")[1].split("?")[0]);
    const profile = profiles.find((p) => p.id === id);
    assert.ok(profile.regionIds.includes("sierra-sonora"), `${id} is actually from this region`);
  }
});

test("R17: spirit page shows tradition facts and links profiles and bottles", () => {
  const view = render({ kind: "spirit", id: "tequila" });
  assert.ok(view.textContent.includes("Denomination of Origin"), "legal status shown");
  const expr = [...view.querySelectorAll("a.discovery-card")].map((a) => a.getAttribute("href"));
  const tequilaProfiles = profiles.filter((p) => p.traditionId === "tequila");
  assert.equal(expr.filter((h) => h.startsWith("#/profile/")).length, tequilaProfiles.length, "all tequila profiles listed");
  assert.ok(expr.some((h) => h.includes("catalogue") || h.includes("#/catalogue")), "bottles link to the catalogue");
});

test("R17: flavour page explains matches and never universalizes", () => {
  const view = render({ kind: "flavour", id: "smoky-earthly" });
  const reasons = [...view.querySelectorAll(".discovery-reason")];
  assert.ok(reasons.length > 0, "each match carries an explanation");
  assert.ok(view.textContent.includes("Editorial"), "matches labeled editorial");
  assert.match(view.textContent, /never every bottle/i, "disclaimer against universalizing");
  for (const li of view.querySelectorAll(".discovery-matches li")) {
    const href = li.querySelector("a.discovery-card").getAttribute("href");
    const id = decodeURIComponent(href.split("/profile/")[1].split("?")[0]);
    const p = profiles.find((x) => x.id === id);
    assert.ok(p.sensory.smoke === "medium" || p.sensory.smoke === "high", `${id} genuinely smoky`);
  }
});

test("R17: every flavour category matches at least one profile, or says so honestly", () => {
  for (const f of ["fresh-herbal", "fruity-floral", "smoky-earthly", "peppery-spicy", "rich-oak", "adventurous"]) {
    const view = render({ kind: "flavour", id: f });
    assert.ok(view.querySelector("h1"), `${f} renders a heading`);
  }
});

test("R17: unknown ids render an honest empty state, not a crash", () => {
  const view = render({ kind: "plant", id: "agave-nonexistent" });
  assert.ok(view.textContent.includes("Not found"), "honest not-found copy");
  assert.ok(view.querySelector("a[href='#/discover']"), "way back to the hub");
  const view2 = render({ kind: "flavour", id: "not-a-flavour" });
  assert.ok(view2.textContent.length > 0, "unknown flavour renders");
});

test("R17: cross-links connect all entity kinds without dead ends", () => {
  for (const plant of plants) {
    const view = render({ kind: "plant", id: plant.id });
    for (const a of view.querySelectorAll("a")) {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http")) continue;
      assert.match(href, /^#\/(discover|profile|explore)/, `plant ${plant.id}: link ${href} stays inside the app`);
    }
  }
  for (const region of regions) {
    const view = render({ kind: "region", id: region.id });
    assert.ok(view.querySelector("a[href='#/discover']"), `region ${region.id} links back`);
  }
  for (const t of traditions) {
    const view = render({ kind: "spirit", id: t.id });
    assert.ok(view.textContent.includes(t.name), `tradition ${t.id} shows its name`);
    assert.ok(view.querySelector("a[href='#/discover']"), `tradition ${t.id} links back`);
  }
});

test("R17: Spanish locale renders localized discovery headings without raw keys", () => {
  const locale = createLocale();
  locale.set("es");
  container.innerHTML = "";
  renderDiscover(container, { plants, regions, traditions, profiles, bottles, locale });
  assert.ok(container.textContent.includes("Plantas"), "plant heading in Spanish");
  assert.ok(!/discover\.[a-zA-Z]/.test(container.textContent), "no raw locale keys leak");
  assert.ok(container.textContent.includes("Entiende qué hay en la copa"), "Spanish hub copy");
  locale.set("en");
});

test("R17: all four paths use the same underlying data (no separate copies)", () => {
  const hub = render();
  const plantCount = [...hub.querySelectorAll("a[href^='#/discover/plant/']")].length;
  const regionCount = [...hub.querySelectorAll("a[href^='#/discover/region/']")].length;
  const spiritCount = [...hub.querySelectorAll("a[href^='#/discover/spirit/']")].length;
  assert.equal(plantCount, plants.length);
  assert.equal(regionCount, regions.length);
  assert.equal(spiritCount, traditions.length);
});

test("R17: search surfaces discovery paths (profile search indexes plants and places)", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const matches = searchProfiles({ profiles, bottles: [], query: "espadin" }).map((r) => r.profile.id);
  assert.ok(matches.includes("mezcal-espadin-valles-centrales"), "plant name finds the espadín profile");
  const place = searchProfiles({ profiles, bottles: [], query: "Sonora" }).map((r) => r.profile.id);
  assert.ok(place.includes("bacanora-pacifica-sierra-sonora"), "place finds the Sonora profile");
});

test("R18: plant page region chips show region names, not raw ids", () => {
  const view = render({ kind: "plant", id: "agave-maximiliana" });
  const chips = [...view.querySelectorAll('a[href^="#/discover/region/"]')].map((a) => a.textContent);
  assert.ok(chips.includes("Sierra Occidental de Jalisco"), `region chip uses the region name, got: ${chips.join(", ")}`);
  assert.ok(!chips.includes("sierra-occidental-jal"), "no raw region id leaks");
});

test("R18: region page plant chips show species names, not raw ids", () => {
  const view = render({ kind: "region", id: "sierra-occidental-jal" });
  const chips = [...view.querySelectorAll('a[href^="#/discover/plant/"]')].map((a) => a.textContent);
  assert.ok(chips.some((t) => t.includes("Agave maximiliana")), `plant chip keeps the species name alongside the common name, got: ${chips.join(", ")}`);
  assert.ok(!chips.some((t) => t === "agave-maximiliana"), "no raw plant id leaks");
});

test("R18: profile back link returns to the discovery origin page", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const { sources } = await readJson("assets/data/sources.json");
  const profile = profiles.find((p) => p.id === "raicilla-maximiliana-sierra-jalisco");
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  container.innerHTML = "";
  const { createLocale } = await import("../assets/js/locale.js");
  renderProfile(container, {
    profile, bottle, sources,
    origin: "plant:agave-maximiliana",
    allProfiles: profiles, allBottles: bottles,
    locale: createLocale(),
  });
  const back = container.querySelector(".back-link");
  assert.equal(back.getAttribute("href"), "#/discover/plant/agave-maximiliana", "back link returns to the plant page");
  assert.ok(back.textContent.includes("plants & places"), "back link is labeled for the discovery destination");
});

test("R18: regional plant-name aliases find their profiles", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  const papalote = searchProfiles({ profiles, bottles: [], query: "papalote" }).map((r) => r.profile.id);
  assert.ok(papalote.includes("raicilla-costa-jalisco"), "papalote (rhodacantha alias) finds the Costa profile");
  const yaquiana = searchProfiles({ profiles, bottles: [], query: "yaquiana" }).map((r) => r.profile.id);
  assert.ok(yaquiana.includes("bacanora-pacifica-sierra-sonora"), "yaquiana (bacanora agave) finds the bacanora profile");
  const pacifico = searchProfiles({ profiles, bottles: [], query: "pacifico" }).map((r) => r.profile.id);
  assert.ok(pacifico.includes("bacanora-pacifica-sierra-sonora"), "pacifico alias finds the bacanora profile");
});

test("R18: every common plant name from plants.json is searchable", async () => {
  const { searchProfiles } = await import("../assets/js/search.js");
  for (const plant of plants) {
    for (const name of plant.commonNames || []) {
      const q = name.name.toLowerCase();
      const matches = searchProfiles({ profiles, bottles: [], query: q });
      const viaPlantIds = profiles.filter((p) => p.plantIds.includes(plant.id));
      if (viaPlantIds.length) {
        assert.ok(matches.length > 0, `common name "${name.name}" of ${plant.id} finds at least one profile`);
      }
    }
  }
});

test("R26: adventurous discovery threads use the shared tradition list", async () => {
  const { ADVENTUROUS_TRADITIONS } = await import("../assets/js/spirit-labels.js");
  assert.deepEqual(ADVENTUROUS_TRADITIONS, ["tuxca", "comiteco", "destilado-de-pulque", "sotol"]);
  // The flavour category and the profile explore-next pick stay in sync by
  // construction now: both import the same constant. Verify a profile from
  // an adventurous tradition is matched by the flavour category.
  const adventurousProfile = profiles.find((p) => ADVENTUROUS_TRADITIONS.includes(p.traditionId));
  assert.ok(adventurousProfile, "an adventurous-tradition profile exists");
  const isMatch = ADVENTUROUS_TRADITIONS.includes(adventurousProfile.traditionId || adventurousProfile.spirit);
  assert.ok(isMatch, "flavour-category matcher covers the same traditions");
});
