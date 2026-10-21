import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Release 19 — Progressive Learning Journey. Seven non-sequential
 * chapters, contextual glossary links from educational content and
 * profiles, preserved direct access to reference sections, complete
 * Mexican Spanish learning coverage, and validation against missing
 * translations.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (rel) => readFile(path.join(root, rel), "utf8").then((t) => JSON.parse(t));

const { chapters } = await readJson("assets/data/chapters.json");
const { profiles } = await readJson("assets/data/profiles.json");
const { plants } = await readJson("assets/data/plants.json");
const { processes } = await readJson("assets/data/processes.json");
const { glossary } = await readJson("assets/data/glossary.json");
const { bottles } = await readJson("assets/data/bottles.json");
const { sources } = await readJson("assets/data/sources.json");
const contentEs = await readJson("assets/data/content-es.json");

const dom = new JSDOM("<!doctype html><html><body><div id=\"app\"></div></body></html>", {
  url: "https://example.test/RagdollLabs-agave-guide/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;

const { renderLearn } = await import("../assets/js/learn-view.js");
const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");

const container = document.getElementById("app");
function render(locale = null) {
  container.innerHTML = "";
  renderLearn(container, {
    chapters, plants, processes, glossary, profiles, bottles, sources,
    locale,
  });
  return container;
}

function renderDeep(section) {
  container.innerHTML = "";
  renderLearn(container, {
    chapters, plants, processes, glossary, profiles, bottles, sources,
    locale: null, section,
  });
  return container;
}

function renderUnused(locale = null) {
  container.innerHTML = "";
  renderLearn(container, {
    chapters, plants, processes, glossary, profiles, bottles, sources,
    locale,
  });
  return container;
}

test("R19: seven progressive chapters render in order", () => {
  const view = render();
  const headings = [...view.querySelectorAll(".learn-chapter h3")].map((h) => h.textContent);
  assert.equal(headings.length, 7, "exactly seven chapters");
  assert.match(headings[0], /^1\. /, "chapters are numbered");
  assert.match(headings[6], /^7\. /, "last chapter numbered 7");
  for (const ch of chapters) {
    assert.ok(headings.some((h) => h.includes(ch.title)), `chapter ${ch.id} renders`);
  }
});

test("R19: each chapter opens with a short explanation (intro)", () => {
  for (const ch of chapters) {
    assert.ok(ch.intro.length > 30 && ch.intro.length < 220, `${ch.id} intro is short and present`);
  }
  const view = render();
  const cards = [...view.querySelectorAll(".learn-chapter")];
  for (const card of cards) {
    assert.ok(card.querySelector(".view-intro"), "chapter renders its intro");
    assert.ok(card.querySelectorAll(".learn-block").length >= 3, "chapter has multiple blocks (basic to advanced)");
  }
});

test("R19: chapters link to real profiles and plants — no invented examples", () => {
  const view = render();
  const profileLinks = [...view.querySelectorAll('a[href^="#/profile/"]')];
  assert.ok(profileLinks.length >= 10, "chapters link to many real profiles");
  for (const a of profileLinks) {
    const id = decodeURIComponent(a.getAttribute("href").split("/profile/")[1]);
    assert.ok(profiles.some((p) => p.id === id), `link target ${id} is a real profile`);
  }
  const plantLinks = [...view.querySelectorAll('a[href^="#/discover/plant/"]')];
  for (const a of plantLinks) {
    const id = decodeURIComponent(a.getAttribute("href").split("/plant/")[1]);
    assert.ok(plants.some((p) => p.id === id), `link target ${id} is a real plant`);
  }
});

test("R19: optional deeper explanations are disclosures, not inline walls", () => {
  const view = render();
  const deepers = [...view.querySelectorAll(".learn-deeper")];
  assert.ok(deepers.length >= 4, "several chapters offer deeper explanations");
  for (const d of deepers) {
    assert.equal(d.tagName, "DETAILS", "deeper text lives in a collapsed disclosure");
    assert.ok(d.querySelector("summary").textContent.length > 0, "disclosure has a summary");
  }
});

test("R19: contextual glossary links render from label chapter blocks", () => {
  const view = render();
  const termLinks = [...view.querySelectorAll(".term-link")];
  assert.ok(termLinks.length >= 5, "label chapter links glossary terms");
  for (const a of termLinks) {
    const label = a.textContent.replace(" →", "").trim();
    assert.ok(glossary.some((t) => t.term === label), `linked term "${label}" exists in the glossary`);
  }
});

test("R19: profiles link contextually to the label vocabulary", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const locale = createLocale();
  const profile = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  container.innerHTML = "";
  renderProfile(container, { profile, bottle, sources, allProfiles: profiles, allBottles: bottles, locale });
  const termLink = container.querySelector(".profile-category .term-link");
  assert.ok(termLink, "category field links to the label vocabulary");
  assert.equal(termLink.getAttribute("href"), "#/learn/terms");
  assert.match(termLink.textContent, /label vocabulary/i);
});

test("R19: direct access to reference sections is preserved (no forced sequence)", () => {
  const view = render();
  const jumps = [...view.querySelectorAll(".learn-jump")].map((b) => b.textContent);
  assert.ok(jumps.length === 10, "jump nav lists chapters plus the three reference sections");
  for (const id of ["learn-plants", "learn-processes", "learn-terms"]) {
    const target = view.querySelector(`#${id}`);
    assert.ok(target, `reference section ${id} still exists`);
    assert.equal(target.getAttribute("tabindex"), "-1", "reference section is focusable for jump navigation");
  }
  assert.ok([...view.querySelectorAll("h4")].some((h) => h.textContent.includes("Agave tequilana")), "plant reference cards still render");
  assert.ok([...view.querySelectorAll("h4")].some((h) => h.textContent.includes("blanco / plata")), "glossary cards still render");
});

test("R19: every chapter ships a complete natural Spanish translation", () => {
  for (const ch of chapters) {
    const es = contentEs.chapters[ch.id];
    assert.ok(es, `ES chapter ${ch.id}`);
    assert.ok(es.title && es.intro, `${ch.id} title/intro translated`);
    assert.ok(!/^Discover|^Meet|^From Plant|^Understanding|^Choosing|^Explore Deeper/.test(es.title), `${ch.id} title is genuinely Spanish`);
    for (const [bi, block] of ch.blocks.entries()) {
      assert.ok(typeof es["block" + bi] === "string" && es["block" + bi].length > 20, `${ch.id} block${bi} translated`);
      if (block.deeper) assert.ok(es["block" + bi + "deeper"], `${ch.id} block${bi}deeper translated`);
    }
  }
});

test("R19: every glossary term ships a Spanish definition", () => {
  for (const term of glossary) {
    const es = contentEs.terms[term.term];
    assert.ok(es && es.definition && es.definition.length > 20, `ES definition for "${term.term}"`);
    assert.ok(!/^(An?|The) [a-z]+ed /.test(es.definition), `"${term.term}" definition is natural Spanish`);
  }
});

test("R19: Learn renders fully in Spanish without English leftovers", () => {
  const locale = createLocale();
  setContentEs(contentEs);
  locale.set("es");
  const view = render(locale);
  const headings = [...view.querySelectorAll(".learn-chapter h3")].map((h) => h.textContent);
  assert.ok(headings.some((h) => h.includes("Descubre los destilados")), "chapter 1 title in Spanish");
  assert.ok(!headings.some((h) => /^7\. Explore Deeper/.test(h)), "no English chapter titles in ES mode");
  const termCards = [...view.querySelectorAll("h4")]
    .filter((h) => glossary.some((t) => t.term === h.textContent))
    .map((h) => h.parentElement);
  assert.ok(termCards.length > 0, "glossary cards found");
  const firstDef = termCards[0].querySelectorAll("p")[1];
  assert.ok(firstDef.textContent.includes("clase"), "glossary definition renders in Spanish");
  locale.set("en");
});

test("R19: validation rejects a missing chapter translation", async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const fs = await import("node:fs/promises");
  const file = path.join(root, "assets/data/content-es.json");
  const original = await fs.readFile(file, "utf8");
  const broken = JSON.parse(original);
  delete broken.chapters["meet-the-plants"].block1;
  try {
    await fs.writeFile(file, JSON.stringify(broken, null, 2) + "\n");
    let failed = false;
    try {
      await run("node", [path.join(root, "scripts/validate.mjs")], { cwd: root });
    } catch (error) {
      failed = true;
      assert.match(error.stderr, /block1 missing Spanish translation/, "validator names the missing translation");
    }
    assert.ok(failed, "validation must fail on a missing translation");
  } finally {
    await fs.writeFile(file, original);
  }
  const restore = await run("node", [path.join(root, "scripts/validate.mjs")], { cwd: root });
  assert.match(restore.stdout, /Validation passed/, "restored content passes validation");
});

test("R20: glossary card ids are slug-safe anchors (no slashes)", () => {
  const view = render();
  for (const term of glossary) {
    const slug = term.term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const card = view.querySelector(`#term-${slug}`);
    assert.ok(card, `glossary card anchor #term-${slug} exists for "${term.term}"`);
    assert.ok(!slug.includes("/"), "slug contains no slash");
  }
});

test("R20: chapter term chips scroll to the actual glossary card", () => {
  const view = render();
  const termChip = view.querySelector(".term-link");
  assert.ok(termChip, "term chips render");
  const slug = "blanco-plata-silver";
  assert.ok(view.querySelector(`#term-${slug}`), "target card exists with a focusable anchor");
  const target = view.querySelector(`#term-${slug}`);
  assert.equal(target.tagName, "H4", "anchor is the card heading");
  assert.equal(target.getAttribute("tabindex"), "-1", "glossary heading is focusable after scroll");
});

test("R20: #/learn/terms deep link focuses the glossary section", () => {
  const view = renderDeep("terms");
  assert.equal(document.activeElement && document.activeElement.id, "learn-terms", "focus lands on the glossary heading");
});

test("R20: profile label-vocabulary link targets the glossary section", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const { parseHash } = await import("../assets/js/router.js");
  const route = parseHash("#/learn/terms");
  assert.equal(route.name, "learn");
  assert.equal(route.params.section, "terms");
  const locale = createLocale();
  const profile = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");
  const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
  container.innerHTML = "";
  renderProfile(container, { profile, bottle, sources, allProfiles: profiles, allBottles: bottles, locale });
  const termLink = container.querySelector(".profile-category .term-link");
  assert.equal(termLink.getAttribute("href"), "#/learn/terms", "profile link lands on the glossary, not the page top");
});

test("R20: plant and process reference text renders in Spanish", () => {
  const locale = createLocale();
  setContentEs(contentEs);
  locale.set("es");
  const view = render(locale);
  const tequilanaCard = [...view.querySelectorAll("h4")].find((h) => h.textContent.includes("Agave tequilana")).parentElement;
  assert.ok(tequilanaCard.textContent.includes("cultivado"), "plant cultivation renders in Spanish");
  const pitCard = [...view.querySelectorAll("h4")].find((h) => h.textContent.includes("Earthen pit roast")).parentElement;
  assert.ok(pitCard.textContent.includes("pozos"), "process explanation renders in Spanish");
  locale.set("en");
});

test("R20: validator rejects a missing process translation", async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const fs = await import("node:fs/promises");
  const file = path.join(root, "assets/data/content-es.json");
  const original = await fs.readFile(file, "utf8");
  const broken = JSON.parse(original);
  delete broken.processes["pit-roast"].explanation;
  try {
    await fs.writeFile(file, JSON.stringify(broken, null, 2) + "\n");
    let failed = false;
    try {
      await run("node", [path.join(root, "scripts/validate.mjs")], { cwd: root });
    } catch (error) {
      failed = true;
      assert.match(error.stderr, /process pit-roast explanation missing Spanish translation/);
    }
    assert.ok(failed, "validation must fail on a missing process translation");
  } finally {
    await fs.writeFile(file, original);
  }
});
