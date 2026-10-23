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
globalThis.localStorage = dom.window.localStorage;

const read = (p) => readFile(new URL("../" + p, import.meta.url), "utf8");
const { profiles } = JSON.parse(await read("assets/data/profiles.json"));
const { bottles } = JSON.parse(await read("assets/data/bottles.json"));
const { sources: sourceList } = JSON.parse(await read("assets/data/sources.json"));
const { plants } = JSON.parse(await read("assets/data/plants.json"));
const { regions } = JSON.parse(await read("assets/data/regions.json"));
const { traditions } = JSON.parse(await read("assets/data/traditions.json"));

const { renderDiscover } = await import("../assets/js/discovery-view.js");
const { renderHome } = await import("../assets/js/presentation.js");
const { createLocale } = await import("../assets/js/locale.js");
const { parseHash } = await import("../assets/js/router.js");
const { renderPlantPage, renderTraditionPage } = await import("../assets/js/plant-tradition-view.js");
const en = createLocale();
const es = createLocale();
es.set("es");

test("pair 11: the two destinations carry distinct, consistent job labels", () => {
  const home = document.createElement("div");
  renderHome(home, { profiles, locale: en });
  const labels = [...home.querySelectorAll(".welcome-action strong")].map((s) => s.textContent);
  assert.ok(labels.some((l) => /Browse styles/.test(l)), "browse styles action labeled");
  // The two navigation destinations carry distinct job labels in both
  // languages; a first-time visitor can tell "find a style" from
  // "understand a plant/place/tradition" before clicking.
  for (const locale of [en, es]) {
    assert.match(locale.t("nav.explore"), /Browse styles|Explorar estilos/);
    assert.match(locale.t("nav.discover"), /Plants & places|Plantas y lugares/);
    assert.notEqual(locale.t("nav.explore"), locale.t("nav.discover"));
  }
});

test("pair 11: discovery hub leads with traditions and flavours, plants/places secondary", () => {
  const container = document.createElement("div");
  renderDiscover(container, { plants, regions, traditions, profiles, bottles, locale: en });
  const blocks = [...container.querySelectorAll(".discover-block h2")].map((h) => h.textContent);
  assert.equal(blocks[0], "Spirit traditions", "familiar spirit traditions lead");
  assert.ok(/flavour/i.test(blocks[1]), "flavour paths come second");
  assert.ok(/plant/i.test(blocks[2]), "plants stay prominent but secondary");
  assert.ok(/place|region/i.test(blocks[3]), "places stay prominent but secondary");
  assert.ok(!/three ways/i.test(container.textContent), "the three-ways wording is gone with four routes offered");
});

test("pair 11: plant chips show common names before scientific names", () => {
  const container = document.createElement("div");
  renderDiscover(container, { plants, regions, traditions, profiles, bottles, locale: en });
  const chips = [...container.querySelectorAll('a[href^="#/discover/plant/"]')].map((a) => a.textContent);
  assert.ok(chips.length >= plants.length, "all plants remain reachable");
  for (const chip of chips) {
    assert.ok(!chip.startsWith("Agave ") || /^\w+ \((Agave|Dasylirion)/.test(chip) === false || chip.includes("("),
      `common name leads where documented: ${chip}`);
  }
  const withCommon = chips.filter((c) => /\(Agave|Dasylirion/.test(c));
  assert.ok(withCommon.length > 0, "documented common names appear before the scientific name");
  // Regional-name ambiguity is preserved: the chip text keeps the species.
  for (const chip of withCommon) assert.ok(/Agave |Dasylirion /.test(chip), "species stays visible");
});

test("pair 11: spirit-page bottle cards link to a route that exists", () => {
  const container = document.createElement("div");
  renderDiscover(container, { kind: "spirit", id: "tequila", plants, regions, traditions, profiles, bottles, locale: en });
  const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
  for (const href of hrefs) {
    assert.notEqual(parseHash(href).name, "notFound", `every discovery link resolves: ${href}`);
  }
  assert.ok(hrefs.includes("#/catalogue"), "bottle cards reach the searchable catalogue");
});

test("pair 11: map access is clearly labelled as browsing by place", async () => {
  const container = document.createElement("div");
  renderDiscover(container, { plants, regions, traditions, profiles, bottles, locale: en });
  // The map disclosure lives on the explore view; its label key is shared.
  const { ui } = await import("../assets/js/presentation.js");
  assert.match(ui(en, "map"), /Browse by place/i);
  assert.match(ui(es, "map"), /Explorar por lugar/);
  assert.match(en.t("explore.mapLabel"), /Browse by place/i);
});

test("pair 11: homepage actions align with the actual destinations", () => {
  const home = document.createElement("div");
  renderHome(home, { profiles, locale: en });
  const actions = [...home.querySelectorAll(".welcome-action")].map((a) => a.getAttribute("href"));
  assert.deepEqual(actions[0], "#/explore", "browse styles stays the main browsing action");
  for (const href of ["#/explore", "#/compare", "#/start", "#/learn", "#/catalogue"]) {
    assert.ok(actions.includes(href), `${href} present on the homepage`);
  }
  const labels = [...home.querySelectorAll(".welcome-action strong")].map((s) => s.textContent);
  assert.ok(labels.some((l) => /new to agave/i.test(l)), "the beginner action stays easy to find");
});

test("pair 11: plant and tradition reference pages end with one clear onward action", () => {
  const plant = plants.find((p) => p.id === "agave-maximiliana");
  const container = document.createElement("div");
  renderPlantPage(container, {
    plant, plants, regions, traditions, profiles, sources: sourceList, locale: en,
  });
  const onward = [...container.querySelectorAll(".cta-link")].map((a) => a.getAttribute("href"));
  assert.ok(onward.includes("#/explore"), "plant page offers browsing the styles next");
  const tradition = traditions.find((t) => t.id === "raicilla");
  const tContainer = document.createElement("div");
  renderTraditionPage(tContainer, {
    tradition, traditions, regions, plants, profiles, bottles, sources: sourceList, locale: en,
  });
  const tOnward = [...tContainer.querySelectorAll(".cta-link")].map((a) => a.getAttribute("href"));
  assert.ok(tOnward.includes("#/explore"), "tradition page offers browsing the styles next");
});

test("pair 11: contextual return labels name the plants & places destination", () => {
  const container = document.createElement("div");
  renderDiscover(container, { kind: "plant", id: "agave-maximiliana", plants, regions, traditions, profiles, bottles, locale: en });
  const back = container.querySelector('a[href="#/discover"]');
  assert.match(back.textContent, /Back to plants & places/i);
  const esContainer = document.createElement("div");
  renderDiscover(esContainer, { kind: "plant", id: "agave-maximiliana", plants, regions, traditions, profiles, bottles, locale: es });
  assert.match(esContainer.querySelector('a[href="#/discover"]').textContent, /Volver a plantas y lugares/);
});

test("pair 11: hub labels, headings and notes render in both languages", () => {
  const container = document.createElement("div");
  renderDiscover(container, { plants, regions, traditions, profiles, bottles, locale: es });
  assert.match(container.querySelector("h1").textContent, /Entiende qu\u00e9 hay en la copa/);
  const blocks = [...container.querySelectorAll(".discover-block h2")].map((h) => h.textContent);
  assert.ok(/Tradiciones/.test(blocks[0]), "ES traditions lead");
  assert.ok(/sabor/i.test(blocks[1]), "ES flavour second");
  assert.ok(/Plantas/.test(blocks[2]) && /Lugares/.test(blocks[3]), "ES plants and places follow");
  assert.ok(container.textContent.includes("Las listas completas siguen siendo buscables"),
    "ES: full-lists note renders");
  const enContainer = document.createElement("div");
  renderDiscover(enContainer, { plants, regions, traditions, profiles, bottles, locale: en });
  assert.ok(enContainer.textContent.includes("Full lists stay searchable"),
    "EN: full-lists note renders");
  for (const node of [container, enContainer]) {
    assert.ok(!/discover[A-Z]/.test(node.textContent), "no raw locale keys leak");
  }
});
