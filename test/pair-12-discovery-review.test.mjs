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
const { plants } = JSON.parse(await read("assets/data/plants.json"));
const { regions } = JSON.parse(await read("assets/data/regions.json"));
const { traditions } = JSON.parse(await read("assets/data/traditions.json"));
const { sources: sourceList } = JSON.parse(await read("assets/data/sources.json"));

const { parseHash } = await import("../assets/js/router.js");
const { renderDiscover, renderDiscoverNotFound } = await import("../assets/js/discovery-view.js");
const { renderProfile } = await import("../assets/js/profile.js");
const { createLocale } = await import("../assets/js/locale.js");
const en = createLocale();
const es = createLocale();
es.set("es");

const data = () => ({ plants, regions, traditions, profiles, bottles });

test("pair 12: every discovery link parses to a real route and a real entity", () => {
  const views = [
    {},
    { kind: "plant", id: "agave-tequilana" },
    { kind: "region", id: "tequila-valley-jal" },
    { kind: "spirit", id: "tequila" },
    { kind: "flavour", id: "smoky-earthly" },
  ];
  for (const params of views) {
    const container = document.createElement("div");
    renderDiscover(container, { ...data(), locale: en, ...params });
    for (const link of [...container.querySelectorAll("a")]) {
      const href = link.getAttribute("href");
      const route = parseHash(href);
      assert.notEqual(route.name, "notFound", `${params.kind || "hub"}: link resolves: ${href}`);
      if (route.name === "discover") {
        const pool = route.params.kind === "plant" ? plants : route.params.kind === "region" ? regions
          : route.params.kind === "spirit" ? traditions : null;
        if (pool && route.params.id) {
          assert.ok(pool.some((x) => x.id === route.params.id), `${href} references an existing entity`);
        }
      }
    }
  }
});

test("pair 12: profile back link returns to the exact discovery origin (EN and ES)", () => {
  const anchor = profiles.find((p) => p.id === "raicilla-maximiliana-sierra-jalisco");
  const bottle = bottles.find((b) => b.id === anchor.exampleBottleId);
  for (const locale of [en, es]) {
    const container = document.createElement("div");
    renderProfile(container, {
      profile: anchor, bottle, sources: sourceList,
      origin: "plant:agave-maximiliana",
      allProfiles: profiles, allBottles: bottles,
      locale,
    });
    const back = container.querySelector(".back-link");
    assert.equal(back.getAttribute("href"), "#/discover/plant/agave-maximiliana");
    assert.ok(/plants & places|plantas y lugares/i.test(back.textContent),
      `back link names the destination in ${locale.get()}`);
  }
});

test("pair 12: invalid discovery ids recover with the entity kind named (EN and ES)", () => {
  for (const locale of [en, es]) {
    for (const [kind, id] of [["plant", "nonsense-plant"], ["region", "nonsense-region"], ["spirit", "nonsense-spirit"], ["flavour", "nonsense-flavour"]]) {
      const container = document.createElement("div");
      renderDiscover(container, { ...data(), locale, kind, id });
      assert.ok(container.textContent.includes("Not found") || container.textContent.includes("No encontrado"),
        `${kind} recovery renders`);
      assert.ok(!/Profile not found|Perfil no encontrado/.test(container.textContent),
        `${kind}: recovery does not claim a missing profile`);
      assert.ok(container.querySelector('a[href="#/discover"]'),
        `${kind}: the discovery paths stay reachable from the recovery`);
    }
  }
  // ES names the kind in Spanish.
  const esContainer = document.createElement("div");
  renderDiscover(esContainer, { ...data(), locale: es, kind: "plant", id: "nonsense" });
  assert.ok(/planta/.test(esContainer.textContent), "ES recovery names the entity kind");
});

test("pair 12: unknown plant and tradition routes use the typed recovery, not the profile view", () => {
  // The recovery contract: the app route handler renders renderDiscoverNotFound
  // for unknown plant/tradition ids. Verify the exported view matches what the
  // handler needs — a typed message plus the paths back.
  const container = document.createElement("div");
  renderDiscoverNotFound(container, "plant", "nonsense", { plants, regions, traditions, locale: en });
  assert.ok(/No plant exists with the id/.test(container.textContent),
    "the message names the entity kind");
  assert.ok(container.querySelector('a[href="#/discover"]'), "paths reachable");
  const spirit = document.createElement("div");
  renderDiscoverNotFound(spirit, "spirit", "nonsense", { plants, regions, traditions, locale: en });
  assert.ok(/spirit tradition/.test(spirit.textContent), "spirit kind named");
});

test("pair 12: common/scientific names never merge distinct species", () => {
  // lechuguilla is a documented local usage for maximiliana AND a trade usage
  // for tuxca wild agaves; the chips must keep them visually distinct.
  const container = document.createElement("div");
  renderDiscover(container, { ...data(), locale: en });
  const chips = [...container.querySelectorAll('a[href^="#/discover/plant/"]')].map((a) => a.textContent);
  assert.equal(new Set(chips.map((t) => t.split(" (")[0])).size, chips.length,
    "no two plant chips share the same leading name");
  const max = chips.find((t) => t.includes("maximiliana"));
  const tuxca = chips.find((t) => t.includes("Li\u00f1eno"));
  assert.ok(max && tuxca && max !== tuxca, "maximiliana and Li\u00f1eno stay distinct entries");
});

test("pair 12: sotol stays explicitly non-agave on its discovery surfaces", () => {
  const container = document.createElement("div");
  renderDiscover(container, { ...data(), kind: "plant", id: "dasylirion-desert-spoon", locale: en });
  assert.ok(/Dasylirion/.test(container.textContent), "genus distinction kept");
  const profile = profiles.find((p) => p.id === "sotol-chihuahua");
  const pContainer = document.createElement("div");
  renderProfile(pContainer, {
    profile,
    bottle: bottles.find((b) => b.id === profile.exampleBottleId),
    sources: sourceList,
    allProfiles: profiles, allBottles: bottles,
    locale: en,
  });
  assert.ok(/explicitly not an agave spirit|not an agave/i.test(pContainer.textContent),
    "the sotol profile keeps its non-agave disclosure");
});

test("pair 12: discovery routes are distinct route keys (scroll/history correctness)", () => {
  // The app route key must distinguish discover detail pages; verified by
  // contract: parseHash yields distinct kind/id params for distinct pages.
  const a = parseHash("#/discover/plant/agave-tequilana");
  const b = parseHash("#/discover/region/tequila-valley-jal");
  assert.notEqual(a.params.kind + a.params.id, b.params.kind + b.params.id,
    "plant and region pages are different routes");
  // Bookmarks/legacy routes still parse.
  for (const hash of ["#/discover", "#/explore", "#/catalogue", "#/learn", "#/start"]) {
    assert.notEqual(parseHash(hash).name, "notFound", `${hash} still parses`);
  }
});

test("pair 12: hub and detail pages keep keyboard-accessible wrapped chips", async () => {
  const css = await read("assets/css/styles.css");
  assert.ok(/\.discovery-chip-list[\s\S]{0,160}flex-wrap: wrap/.test(css),
    "chip lists wrap on narrow widths");
  assert.ok(/\.discovery-chip[\s\S]{0,260}min-height: 44px/.test(css),
    "chips keep the 44px tap target");
  const container = document.createElement("div");
  renderDiscover(container, { ...data(), locale: en });
  for (const chip of [...container.querySelectorAll(".discovery-chip")]) {
    assert.equal(chip.tagName, "A", "chips are links (keyboard reachable)");
  }
});
