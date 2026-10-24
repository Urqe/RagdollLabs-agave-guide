import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Pair 24 — guided sensory tasting. The how-to-taste lesson becomes a
 * six-step guided tasting with a no-glass read-along mode built from the
 * example profile's data; lesson 3 gains the five common confusions and a
 * small lexicon; profiles show body once, as Light / Medium / Full.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");

const rawFiles = {
  "profiles.json": await read("assets/data/profiles.json"),
  "bottles.json": await read("assets/data/bottles.json"),
  "sources.json": await read("assets/data/sources.json"),
  "plants.json": await read("assets/data/plants.json"),
  "processes.json": await read("assets/data/processes.json"),
  "glossary.json": await read("assets/data/glossary.json"),
  "content-es.json": await read("assets/data/content-es.json"),
  "traditions.json": await read("assets/data/traditions.json"),
  "chapters.json": await read("assets/data/chapters.json"),
  "regions.json": await read("assets/data/regions.json"),
};
const { profiles } = JSON.parse(rawFiles["profiles.json"]);
const { bottles } = JSON.parse(rawFiles["bottles.json"]);
const { sources } = JSON.parse(rawFiles["sources.json"]);
const { chapters } = JSON.parse(rawFiles["chapters.json"]);
const contentEs = JSON.parse(rawFiles["content-es.json"]);
const blanco = profiles.find((p) => p.id === "tequila-blanco-valley-jalisco");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/guide/", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.localStorage = dom.window.localStorage;
globalThis.sessionStorage = dom.window.sessionStorage;

const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const es = createLocale();
es.set("es");
localStorage.clear();
const en = createLocale();
en.set("en");

const { renderLesson, JOURNEY_STEPS } = await import("../assets/js/journey.js");
const { tasteNote } = await import("../assets/js/taste-notes.js");

function lesson(id, locale) {
  const box = document.createElement("div");
  document.body.appendChild(box);
  renderLesson(box, { lessonId: id, profiles, chapters, locale });
  return box;
}

const STEP_IDS = ["prepare", "aroma", "sip", "texture", "finish", "reflect"];

test("pair 24: the guided tasting runs prepare → aroma → sip → texture → finish → reflect", () => {
  for (const locale of [en, es]) {
    const box = lesson("how-to-taste", locale);
    const steps = [...box.querySelectorAll(".lesson-practice-step")];
    assert.deepEqual(steps.map((s) => s.dataset.step), STEP_IDS, `${locale.get()}: step order`);
    for (const s of steps) {
      assert.ok(s.querySelector(".lesson-practice-heading").textContent.trim(), `${locale.get()}: ${s.dataset.step} has a heading`);
      assert.ok(s.querySelector(":scope > p").textContent.length > 40, `${locale.get()}: ${s.dataset.step} explains the technique`);
    }
    box.remove();
  }
});

test("pair 24: a reader without a glass gets a read-along panel on every step, from the profile's data", () => {
  for (const locale of [en, es]) {
    const box = lesson("how-to-taste", locale);
    const readButton = box.querySelector('[data-mode="read"]');
    assert.equal(readButton.getAttribute("aria-pressed"), "true", `${locale.get()}: reading along is the default`);
    const panel = (id) => box.querySelector(`[data-step="${id}"] .tasting-box.is-read`);
    for (const id of ["prepare", "aroma", "sip", "texture", "finish"]) {
      assert.ok(panel(id), `${locale.get()}: ${id} has a read-along panel`);
    }
    assert.ok(box.querySelector(`[data-step="reflect"] fieldset.tasting-reflect`), `${locale.get()}: reflect step offers the prompt`);
    // Every panel is built from the profile, not from duplicated copy.
    for (const note of blanco.tasteNotes) {
      assert.ok(panel("aroma").textContent.includes(tasteNote(note, locale)), `${locale.get()}: aroma lists "${note}"`);
    }
    const notice = locale === es ? contentEs.profiles[blanco.id].pairing.notice : blanco.pairing.notice;
    assert.ok(panel("sip").textContent.includes(notice), `${locale.get()}: sip shows the profile's what-to-notice line`);
    assert.ok(panel("texture").textContent.includes(locale === es ? "ligero" : "light"), `${locale.get()}: texture shows the body word`);
    assert.ok(panel("texture").textContent.includes(locale === es ? "media" : "medium"), `${locale.get()}: texture shows the pepper level`);
    const finish = (locale === es ? contentEs.profiles[blanco.id].finish : blanco.finish).replace(/\.$/, "");
    assert.ok(panel("finish").textContent.includes(finish), `${locale.get()}: finish quotes the profile`);
    const link = panel("prepare").querySelector("a");
    assert.equal(decodeURIComponent(link.getAttribute("href")), `#/profile/${blanco.id}?origin=start:how-to-taste`,
      `${locale.get()}: the worked example keeps the lesson origin`);
    box.remove();
  }
});

test("pair 24: switching to 'I have a glass' swaps the panels for prompts and keeps focus on the switch", () => {
  const box = lesson("how-to-taste", en);
  box.querySelector('[data-mode="glass"]').click();
  const glassButton = box.querySelector('[data-mode="glass"]');
  assert.equal(glassButton.getAttribute("aria-pressed"), "true", "the glass mode is pressed");
  assert.equal(box.querySelector('[data-mode="read"]').getAttribute("aria-pressed"), "false");
  assert.equal(document.activeElement, glassButton, "focus stays on the pressed switch");
  assert.equal(box.querySelectorAll(".tasting-box.is-read").length, 0, "no read-along panels in glass mode");
  assert.equal(box.querySelectorAll(".tasting-box.is-glass").length, 5, "a prompt on each tasting step");
  assert.equal(box.querySelector("fieldset.tasting-reflect legend").textContent, "What stood out most?");
  box.querySelector('[data-mode="read"]').click();
  assert.equal(box.querySelectorAll(".tasting-box.is-read").length, 5, "switching back restores the read-along panels");
  box.remove();
});

test("pair 24: reflection offers choices, never a score, and stores nothing", () => {
  const box = lesson("how-to-taste", en);
  const before = localStorage.length;
  const fieldset = box.querySelector("fieldset.tasting-reflect");
  const radios = [...fieldset.querySelectorAll('input[type="radio"]')];
  assert.equal(radios.length, 5, "five optional choices");
  for (const r of radios) assert.ok(fieldset.querySelector(`label[for="${r.id}"]`), `${r.value} is labelled`);
  const answer = fieldset.querySelector('[aria-live="polite"]');
  assert.equal(answer.textContent, "", "nothing is said before a choice");

  const pick = (value) => {
    const input = fieldset.querySelector(`input[value="${value}"]`);
    input.checked = true;
    input.dispatchEvent(new dom.window.Event("change"));
  };
  pick("fruit");
  assert.equal(answer.querySelector("a").getAttribute("href"), "#/discover/flavour/fruity-floral", "fruit leads to the fruity path");
  pick("smoke");
  assert.equal(answer.querySelector("a").getAttribute("href"), "#/discover/flavour/smoky-earthly");
  pick("unsure");
  assert.equal(answer.querySelector("a").getAttribute("href"), "#/start/first-comparison", "unsure leads to the comparison step");
  assert.ok(!/correct|wrong|score|right answer/i.test(fieldset.textContent), "no right/wrong language");
  assert.equal(localStorage.length, before, "no answer or mode is written to storage");
  box.remove();
});

test("pair 24: lesson 3 separates the five common confusions in EN and ES", () => {
  const expected = {
    en: [/sweet/i, /sugar/i, /warmth/i, /pepper/i, /smoke/i, /roast/i, /body/i, /intensity/i, /aroma/i, /back of the mouth/i],
    es: [/dulce/i, /azúcar/i, /calor/i, /pimienta/i, /humo/i, /asado/i, /cuerpo/i, /intensidad/i, /aroma/i, /fondo de la boca/i],
  };
  for (const locale of [en, es]) {
    const box = lesson("recognise-the-notes", locale);
    const block = box.querySelector(".lesson-distinctions");
    assert.ok(block, `${locale.get()}: distinctions render`);
    assert.equal(block.querySelectorAll("dt").length, 5, `${locale.get()}: five distinctions`);
    for (const pattern of expected[locale.get()]) {
      assert.ok(pattern.test(block.textContent), `${locale.get()}: distinctions cover ${pattern}`);
    }
    box.remove();
  }
});

test("pair 24: the lexicon covers the agreed descriptors with everyday anchors", () => {
  const terms = {
    en: ["Cooked agave", "Vegetal", "Herbal", "Earthy", "Mineral", "Floral", "Fruit", "Pepper", "Oak"],
    es: ["Agave cocido", "Vegetal", "Herbal", "Terroso", "Mineral", "Floral", "Fruta", "Pimienta", "Roble"],
  };
  for (const locale of [en, es]) {
    const box = lesson("recognise-the-notes", locale);
    const block = box.querySelector(".lesson-lexicon");
    const dts = [...block.querySelectorAll("dt")].map((d) => d.textContent);
    for (const term of terms[locale.get()]) assert.ok(dts.includes(term), `${locale.get()}: lexicon has ${term}`);
    for (const dd of block.querySelectorAll("dd")) assert.ok(dd.textContent.includes(","), `${locale.get()}: each term has anchors`);
    const mineral = [...block.querySelectorAll("dt")].find((d) => d.textContent === "Mineral").nextElementSibling;
    assert.ok(locale === en ? /not proof/.test(mineral.textContent) : /no prueba/.test(mineral.textContent),
      `${locale.get()}: mineral is flagged as a description, not proof`);
    box.remove();
  }
});

test("pair 24: the hub promises the five sensory distinctions and a glass-optional tasting", async () => {
  const { renderStartHub } = await import("../assets/js/journey.js");
  const box = document.createElement("div");
  renderStartHub(box, { profiles, locale: en });
  const outcome = box.querySelector(".journey-outcome").textContent;
  assert.ok(/aroma, flavour, body, alcohol warmth and finish/.test(outcome));
  assert.ok(/with or without a glass/.test(outcome));
  assert.equal(JOURNEY_STEPS.length, 5, "still five lessons — no second syllabus");
});

test("pair 24: the new lesson copy follows the voice guide's Spanish rules", async () => {
  const source = await read("assets/js/journey.js");
  // "se lee por sí solo" (a lesson can be read on its own) is about reading, not flavour.
  const flavourCalques = source.replace(/se lee por sí solo/g, "");
  assert.ok(!/se lee|leerse|sabros[oa]/.test(flavourCalques), "no 'se lee' flavour phrasing or sabroso-for-savoury in the journey");
  assert.ok(!/se lee|sabroso/.test(contentEs.profiles[blanco.id].pairing.notice), "the read-along notice is natural Spanish");
});

// ------------------------------------------------------------- profile body

test("pair 24: profiles show body once, as Light / Medium / Full", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  for (const [locale, word] of [[en, "Light"], [es, "Ligero"]]) {
    const box = document.createElement("div");
    const bottle = bottles.find((b) => b.id === blanco.exampleBottleId);
    renderProfile(box, { profile: blanco, bottle, sources, allProfiles: profiles, allBottles: bottles, locale });
    const bodyCells = box.querySelectorAll(".profile-body");
    assert.equal(bodyCells.length, 1, `${locale.get()}: body appears once`);
    assert.equal(bodyCells[0].querySelector(".sensory-value").textContent, word, `${locale.get()}: body reads ${word}`);
    const factTerms = [...box.querySelectorAll(".profile-facts dt")].map((d) => d.textContent);
    assert.ok(!factTerms.includes(locale === es ? "Cuerpo" : "Body"), `${locale.get()}: no duplicate body fact`);
  }
});

// ---------------------------------------------------------------- real boot

let bootCount = 0;
async function bootApp(startHash, localeCode) {
  const appDom = new JSDOM(`<!doctype html><html><body><div id="app"></div></body></html>`, {
    url: `https://example.test/RagdollLabs-agave-guide/${startHash}`, pretendToBeVisual: true,
  });
  appDom.window.localStorage.setItem("agave-locale", localeCode);
  appDom.window.HTMLElement.prototype.scrollIntoView = function () {};
  const prev = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch,
    localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage };
  Object.assign(globalThis, { window: appDom.window, document: appDom.window.document,
    localStorage: appDom.window.localStorage, sessionStorage: appDom.window.sessionStorage });
  globalThis.fetch = async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel in rawFiles) return { ok: true, json: async () => JSON.parse(rawFiles[rel]), text: async () => rawFiles[rel] };
    return { ok: false, status: 404 };
  };
  const cleanup = () => { Object.assign(globalThis, prev); setContentEs(contentEs); };
  try {
    await import(`../assets/js/app.js?pair24=${++bootCount}`);
    await new Promise((r) => setTimeout(r, 80));
    return { window: appDom.window, document: appDom.window.document, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}

test("pair 24: direct links to the lessons boot complete in both languages", async () => {
  for (const localeCode of ["en", "es"]) {
    for (const hash of ["#/start/how-to-taste", "#/start/recognise-the-notes"]) {
      const app = await bootApp(hash, localeCode);
      try {
        const main = app.document.querySelector("main");
        assert.ok(main.querySelector(".lesson-view"), `${localeCode} ${hash}: lesson renders`);
        assert.equal(main.querySelectorAll(".untranslated-field").length, 0, `${localeCode} ${hash}: nothing falls back to English`);
        if (hash.endsWith("how-to-taste")) {
          assert.equal(main.querySelectorAll(".tasting-box.is-read").length, 5, `${localeCode}: read-along panels on boot`);
        } else {
          assert.ok(main.querySelector(".lesson-lexicon"), `${localeCode}: lexicon on boot`);
        }
      } finally {
        app.cleanup();
      }
    }
  }
});

test("pair 24: narrow screens stack the term lists into one column", async () => {
  const css = await read("assets/css/styles.css");
  assert.ok(/@media \(max-width: 40rem\) \{\n  \.lesson-term-list \{ grid-template-columns: 1fr;/.test(css),
    "term lists collapse to one column on narrow screens");
  assert.ok(/\.lesson-term-list dd \{[^}]*overflow-wrap: anywhere/.test(css), "long Spanish words wrap instead of overflowing");
  assert.ok(/\.tasting-reflect-choice \{[^}]*min-height: var\(--tap\)/.test(css), "reflection choices keep the tap-target height");
});
