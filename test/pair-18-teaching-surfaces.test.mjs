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
const { chapters } = JSON.parse(await read("assets/data/chapters.json"));
const { traditions } = JSON.parse(await read("assets/data/traditions.json"));
const contentEs = JSON.parse(await read("assets/data/content-es.json"));

const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
setContentEs(contentEs);
localStorage.clear();
const en = createLocale();
en.set("en");
localStorage.clear();
const es = createLocale();
es.set("es");

const profileById = new Map(profiles.map((p) => [p.id, p]));
const chapterById = new Map(chapters.map((c) => [c.id, c]));

test("P18-4: ES tobalá description no longer equates clay with ancestral and copper with artesanal", () => {
  const desc = contentEs.profiles["mezcal-tobala-sierra-oaxaca"].description;
  assert.ok(!desc.includes("en alambiques de barro en las producciones ancestrales, de cobre en las artesanales"),
    "the old clay=ancestral/copper=artesanal equivalence is gone");
  assert.ok(desc.includes("en cobre o barro en las artesanales, pues la categoría artesanal permite ambos caminos"),
    "the corrected description states both paths are permitted in the artesanal category");
  assert.ok(desc.includes("tobalá silvestre"), "the P18-3 wild example is preserved");
});

test("P18-4: valley blanco description qualifies the no-oak claim (EN and ES)", () => {
  const enDesc = profileById.get("tequila-blanco-valley-jalisco").description;
  const esDesc = contentEs.profiles["tequila-blanco-valley-jalisco"].description;
  for (const [label, desc] of [["EN", enDesc], ["ES", esDesc]]) {
    assert.ok(/typically bottled|suele embotellarse/.test(desc),
      `${label} description says typically, not an absolute`);
    assert.ok(/rules allow brief|reglas permiten un reposo breve/.test(desc),
      `${label} description keeps the legal qualification`);
    assert.ok(!/is tequila bottled without oak aging, so what/.test(desc),
      `${label} absolute claim removed`);
  }
  // The category field already said this; the two fields now agree.
  const category = profileById.get("tequila-blanco-valley-jalisco").category;
  assert.ok(/typically sold unaged, though the rules permit/.test(category),
    "the category qualification is unchanged");
});

test("P18-4: Meet the Plants deeper passage explains the harvest mechanism honestly", () => {
  const ch = chapterById.get("meet-the-plants");
  const deeper = ch.blocks.map((b) => b.deeper || "").find((d) => d.includes("flowers once"));
  assert.ok(deeper, "the deeper passage exists");
  assert.ok(!/redirects sugars/.test(deeper), "the redirecting-sugars phrasing is gone");
  assert.ok(deeper.includes("taking its accumulated sugars once"),
    "piña harvest is described as a one-time sugar store");
  assert.ok(/repeated tapping also drains the plant/.test(deeper),
    "sap collection is not described as simply keeping the plant alive");
  const esDeep = contentEs.chapters["meet-the-plants"].block2deeper;
  assert.ok(esDeep.includes("el sangrado repetido también agota la planta"),
    "ES mirror states the exhaustion honestly");
  assert.ok(!/redirige los azúcares/.test(esDeep), "ES redirecting phrasing gone");
});

test("P18-4: Understanding Labels separates standard, registration and certification", () => {
  const ch = chapterById.get("understanding-labels");
  const b1 = ch.blocks[1].text;
  assert.ok(/official Mexican standard that defines/.test(b1), "the standard is defined");
  assert.ok(/producer.s registration under that standard/.test(b1), "the registration is distinct");
  assert.ok(/certification seals are issued separately/.test(b1), "certification is distinct");
  assert.ok(/Three different things/.test(b1), "the distinction is explicit");
  const b2 = ch.blocks[2].text;
  assert.ok(/tequila producer-number convention is not a universal rule/.test(b2),
    "the illustrative mezcal label no longer applies the tequila convention universally");
  const esB1 = contentEs.chapters["understanding-labels"].block1;
  assert.ok(esB1.includes("la norma, el registro y la certificación"), "ES mirror states the three-way distinction");
  const esB2 = contentEs.chapters["understanding-labels"].block2;
  assert.ok(esB2.includes("no es una regla universal"), "ES mirror fixes the label walkthrough");
});

test("P18-4: every covered profile carries a starting serve and a what-to-notice line", () => {
  for (const profile of profiles) {
    const pairing = profile.pairing || {};
    assert.ok(pairing.serving, `${profile.id} has a starting serve`);
    assert.ok(pairing.notice, `${profile.id} has a what-to-notice line`);
    assert.ok(/^What to notice first:/.test(pairing.notice), `${profile.id} notice is plain-language`);
    const esPairing = contentEs.profiles[profile.id]?.pairing;
    assert.ok(esPairing && esPairing.notice, `${profile.id} has an ES notice line`);
    assert.ok(esPairing.notice.startsWith("Qué notar primero:"), `${profile.id} ES notice renders naturally`);
  }
});

test("P18-4: the profile view renders the notice line (EN and ES)", async () => {
  const { renderProfile } = await import("../assets/js/profile.js");
  const { sources: sourceList } = JSON.parse(await read("assets/data/sources.json"));
  const { bottles } = JSON.parse(await read("assets/data/bottles.json"));
  for (const locale of [en, es]) {
    const profile = profileById.get("bacanora-pacifica-sierra-sonora");
    const bottle = bottles.find((b) => b.id === profile.exampleBottleId);
    const root = document.createElement("div");
    renderProfile(root, { profile, bottle, sources: sourceList, allProfiles: profiles, allBottles: bottles, locale });
    const notice = root.querySelector(".pairing-notice");
    assert.ok(notice, `notice line renders in ${locale.get()}`);
    const expected = locale.get() === "es"
      ? contentEs.profiles[profile.id].pairing.notice
      : profile.pairing.notice;
    assert.equal(notice.textContent, expected);
  }
});

test("P18-4: neat is defined at first use and finish means lingering character", async () => {
  const { JOURNEY_STEPS } = await import("../assets/js/journey.js");
  const lesson = JOURNEY_STEPS.find((l) => l.id === "how-to-taste");
  const prepare = lesson.practice.steps[0];
  const finish = lesson.practice.steps[3];
  assert.ok(prepare.text.en.includes("neat — that means without ice or mixers"),
    "the EN lesson defines neat at first use");
  assert.ok(prepare.text.es.includes("sin hielo ni mezcladores"),
    "the ES lesson defines neat at first use");
  assert.ok(finish.text.en.includes("lingering character is the finish — both how long it lasts and what it tastes like"),
    "the EN finish step explains character as well as duration");
  assert.ok(finish.text.es.includes("tanto cuánto dura como a qué sabe mientras se apaga"),
    "the ES finish step explains character as well as duration");
  assert.equal(lesson.practice.steps.length, 4, "the four-step lesson is preserved");
  const choosing = chapterById.get("choosing-and-enjoying");
  const serving = choosing.blocks.find((b) => b.text.startsWith("Serving is simple"));
  assert.ok(serving.text.includes("Neat — without ice or mixers —"),
    "the chapter also defines neat at first use");
  const esServing = contentEs.chapters["choosing-and-enjoying"].block1;
  assert.ok(esServing.includes("sin hielo ni mezcladores"), "ES chapter defines neat too");
});

test("P18-4: serve guidance is findable from every covered tradition's profiles", async () => {
  const byTradition = new Map();
  for (const profile of profiles) {
    byTradition.set(profile.traditionId, [...(byTradition.get(profile.traditionId) || []), profile.id]);
  }
  for (const tradition of traditions) {
    const ids = byTradition.get(tradition.id) || [];
    assert.ok(ids.length > 0, `${tradition.id} has at least one profile`);
    for (const id of ids) {
      const profile = profileById.get(id);
      assert.ok(profile.pairing && profile.pairing.serving,
        `${tradition.id} serve guidance findable from ${id}`);
    }
  }
});
