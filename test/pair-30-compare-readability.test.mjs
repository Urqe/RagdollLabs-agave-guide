import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

/**
 * Pair 30 — Compare readability (owner request): slider-style level
 * meters beside the words, a stacked phone layout with no sideways
 * scrolling, letters and short names instead of full titles in the
 * summaries, and the results ahead of the picker once two styles are
 * chosen.
 */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFile(path.join(root, rel), "utf8");
const { profiles } = JSON.parse(await read("assets/data/profiles.json"));
const contentEs = JSON.parse(await read("assets/data/content-es.json"));
const css = await read("assets/css/styles.css");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/guide/", pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, Node: dom.window.Node,
  localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage });
dom.window.HTMLElement.prototype.scrollIntoView = function () { this.dataset.scrolled = "yes"; };
const { createLocale } = await import("../assets/js/locale.js");
const { setContentEs } = await import("../assets/js/editorial.js");
const { renderCompare, STYLE_KEYS } = await import("../assets/js/compare-view.js");
setContentEs(contentEs);
localStorage.clear();
const en = createLocale();
en.set("en");
localStorage.clear();
const es = createLocale();
es.set("es");
const byId = new Map(profiles.map((p) => [p.id, p]));

function compare(ids, opts = {}) {
  const box = document.createElement("div");
  document.body.appendChild(box);
  renderCompare(box, { profiles, compareIds: ids.join(","), locale: opts.locale || en, onSelectionChange: opts.onChange || (() => {}), ...opts });
  return box;
}
const THREE = ["tequila-blanco-valley-jalisco", "mezcal-espadin-valles-centrales", "sotol-chihuahua"];

test("P30: every profile has a short name in both editions, short and unique", () => {
  const seen = { en: new Set(), es: new Set() };
  for (const p of profiles) {
    const esShort = contentEs.profiles[p.id].shortTitle;
    for (const [lang, v] of [["en", p.shortTitle], ["es", esShort]]) {
      assert.ok(typeof v === "string" && v.length > 0 && v.length <= 26, `${p.id} ${lang} short name`);
      assert.ok(!seen[lang].has(v), `${lang} "${v}" is unique`);
      seen[lang].add(v);
    }
    assert.ok(p.shortTitle.length < p.title.length || p.shortTitle === p.title, `${p.id} short name is shorter`);
  }
  assert.equal(byId.get("tequila-blanco-valley-jalisco").shortTitle, "Valley blanco");
  assert.equal(contentEs.profiles["tequila-blanco-valley-jalisco"].shortTitle, "Blanco del valle");
});

test("P30: each level cell has a meter and keeps the word as its text", () => {
  const box = compare(THREE);
  const rows = [...box.querySelectorAll(".compare-table tbody tr")];
  assert.equal(rows.length, 8, "eight dimensions");
  for (const row of rows) {
    const cells = [...row.querySelectorAll("td")];
    assert.equal(cells.length, 3);
    cells.forEach((td, i) => {
      assert.equal(td.dataset.key, STYLE_KEYS[i], "cell carries its style letter");
      const meter = td.querySelector(".cmp-meter");
      assert.ok(meter && meter.getAttribute("aria-hidden") === "true", "decorative meter");
      assert.ok(["None", "Low", "Medium", "High", "Light", "Full"].includes(td.textContent), `word is the text: ${td.textContent}`);
    });
  }
  const smoke = rows[0].querySelectorAll(".cmp-meter");
  assert.deepEqual([...smoke].map((m) => m.style.getPropertyValue("--pos")), ["0", "2", "1"], "none / medium / low positions");
});

test("P30: an undocumented level draws a dashed empty meter and says so", () => {
  const gap = { ...profiles[0], sensory: { ...profiles[0].sensory, smoke: null } };
  const box = document.createElement("div");
  renderCompare(box, { profiles: [gap, profiles[1]], compareIds: [gap.id, profiles[1].id].join(","), locale: en, onSelectionChange: () => {} });
  const cell = box.querySelector(".compare-table tbody tr td");
  assert.ok(cell.classList.contains("compare-unknown"));
  assert.ok(cell.querySelector(".cmp-meter.is-unknown"), "dashed track, no thumb");
  assert.equal(cell.querySelector(".cmp-meter").style.getPropertyValue("--pos"), "", "no position for an unknown level");
  assert.equal(cell.textContent, "Not documented");
});

test("P30: the legend names each style once in full; everything else uses short names", () => {
  const box = compare(THREE);
  const items = [...box.querySelectorAll(".compare-legend-item")];
  assert.equal(items.length, 3);
  items.forEach((item, i) => {
    const p = byId.get(THREE[i]);
    assert.equal(item.dataset.key, STYLE_KEYS[i]);
    assert.equal(item.querySelector(".compare-legend-short").textContent, p.shortTitle);
    assert.equal(item.querySelector(".compare-legend-full").textContent, p.title);
    assert.ok(item.querySelector(".compare-remove-button"), "remove lives in the legend");
  });
  const fullTitles = THREE.map((id) => byId.get(id).title);
  for (const sel of [".compare-summary", ".compare-craft", ".compare-diff-list", ".compare-table thead"]) {
    const text = box.querySelector(sel).textContent;
    for (const t of fullTitles) assert.ok(!text.includes(t), `${sel} does not repeat "${t}"`);
  }
  const line = box.querySelector(".compare-summary-line").textContent;
  assert.match(line, /^Biggest documented differences: [^()]+\. The bars below show each style's level\.$/, line);
  const firstDiff = box.querySelector(".compare-diff-list > li");
  assert.ok(firstDiff.querySelector(".compare-diff-dimension"));
  assert.equal(firstDiff.querySelectorAll(".compare-diff-rows li .cmp-meter").length, 3, "one meter per style in each difference");
});

test("P30: Spanish uses the Spanish short names and scale note", () => {
  const box = compare(THREE, { locale: es });
  const shorts = [...box.querySelectorAll(".compare-legend-short")].map((n) => n.textContent);
  assert.deepEqual(shorts, ["Blanco del valle", "Mezcal de espadín", "Sotol"]);
  assert.match(box.querySelector(".cmp-scale-note").textContent, /de nada \(izquierda\) a alto \(derecha\)/);
  assert.ok(!/Valley blanco|Remove|Biggest/.test(box.textContent), "no English leaks");
});

test("P30: with two styles the results lead and the picker follows, collapsed", () => {
  const box = compare(THREE.slice(0, 2));
  const kids = [...box.querySelector(".compare-view").children];
  const at = (sel) => kids.findIndex((n) => n.matches(sel));
  assert.ok(at(".compare-legend") < at(".comparison-scroll"), "legend before table");
  assert.ok(at(".comparison-scroll") < at("details.compare-change-styles"), "table before picker");
  assert.equal(at(".comparison-selections"), -1, "no duplicate chips once the legend shows");
  assert.equal(box.querySelector("details.compare-change-styles").open, false);
});

test("P30: focus follows the control used — completing reveals the results, a legend removal stays on the legend", () => {
  const done = compare(THREE.slice(0, 2), { revealResults: true });
  assert.equal(document.activeElement, done.querySelector(".compare-legend"), "completing pick lands on the legend");
  assert.equal(done.querySelector(".compare-legend").dataset.scrolled, "yes", "and scrolls it into view");
  const removed = compare(THREE.slice(0, 2), { focusSource: "legend" });
  assert.equal(document.activeElement, removed.querySelector(".compare-legend"));
  const picked = compare(THREE, { focusSource: "picker", focusProfileId: THREE[2] });
  assert.ok(picked.querySelector("details.compare-change-styles").open, "the picker stays open after a pick from it");
  assert.equal(document.activeElement, picked.querySelector(".compare-legend"), "with all slots full there is no picker button to focus, so the legend takes it");
});

test("P30: the legend's remove reports its source", () => {
  let seen = null;
  const box = compare(THREE.slice(0, 2), { onChange: (next, q, source) => { seen = { next, source }; } });
  box.querySelector(".compare-legend .compare-remove-button").click();
  assert.deepEqual(seen, { next: [THREE[1]], source: "legend" });
});

test("P30: phones stack the table — no fixed minimum width, no sideways scroll, letters on each row", () => {
  assert.match(css, /\.comparison-scroll \.compare-table \{ min-width: 0; \}/);
  assert.match(css, /@media \(max-width: 40rem\) \{\n  \.comparison-scroll \{ overflow: visible; \}\n  \.compare-table, \.compare-table tbody, \.compare-table tr, \.compare-table th, \.compare-table td \{ display: block; \}/);
  assert.match(css, /\.compare-table td::before \{\n    content: attr\(data-key\);/);
  assert.match(css, /:root\[data-theme="light"\] \{ --cmp-a: #8a5f14;/, "light-theme markers keep contrast");
});
