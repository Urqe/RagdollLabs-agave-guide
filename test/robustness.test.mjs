import { test } from "node:test";
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
globalThis.localStorage = dom.window.localStorage;

const readJson = async (rel) => JSON.parse(await readFile(path.join(root, rel), "utf8"));
const profiles = (await readJson("assets/data/profiles.json")).profiles;
const bottles = (await readJson("assets/data/bottles.json")).bottles;
const sources = (await readJson("assets/data/sources.json")).sources;
const plants = (await readJson("assets/data/plants.json")).plants;
const traditions = (await readJson("assets/data/traditions.json")).traditions;
const regions = (await readJson("assets/data/regions.json")).regions;
const processes = (await readJson("assets/data/processes.json")).processes;
const glossary = (await readJson("assets/data/glossary.json")).glossary;

const { parseHash } = await import("../assets/js/router.js");
const { createLocale } = await import("../assets/js/locale.js");
const enLocale = createLocale();

test("router: malformed percent-encoding never throws and degrades to not-found", () => {
  // A mangled shared URL must not crash app boot with URIError.
  let route;
  assert.doesNotThrow(() => {
    route = parseHash("#/profile/%E0%A4%A");
  }, "parseHash must survive malformed escapes");
  assert.equal(route.name, "profile", "the raw segment flows on as an id");
  assert.equal(route.params.profileId, "%E0%A4%A", "raw segment kept when decoding fails");

  // Malformed encoding in other route shapes degrades the same way.
  assert.doesNotThrow(() => parseHash("#/explore/%E0%A4%A"));
  assert.doesNotThrow(() => parseHash("#/compare/%E0%A4%A,%E0%A4%B"));
  // Valid encodings still decode.
  assert.deepEqual(parseHash("#/profile/a%20b"), { name: "profile", params: { profileId: "a b" } });
  assert.deepEqual(parseHash("#/explore/jal"), { name: "state", params: { stateId: "jal" } });
});

test("an unknown decoded profile id still renders the existing not-found view", async () => {
  const { renderProfileNotFound } = await import("../assets/js/profile.js");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const route = parseHash("#/profile/%E0%A4%A");
  renderProfileNotFound(container, route.params.profileId);
  assert.ok(container.textContent.includes("Profile not found"));
  assert.equal(container.querySelector(".back-link").getAttribute("href"), "#/explore");
  container.remove();
});

test("compare picker labels every supported spirit, never a raw id", async () => {
  const { renderCompare } = await import("../assets/js/compare-view.js");
  const { SPIRIT_LABELS } = await import("../assets/js/spirit-labels.js");

  // Every spirit in the data set has a display label in the shared map.
  for (const profile of profiles) {
    assert.ok(SPIRIT_LABELS[profile.spirit], `spirit ${profile.spirit} has a label`);
  }

  // The picker shows the human label, not the raw spirit id.
  const container = document.createElement("div");
  document.body.appendChild(container);
  const regional = profiles.filter((p) => ["tuxca", "comiteco", "destilado-de-pulque"].includes(p.spirit));
  renderCompare(container, {
    profiles: regional,
    locale: enLocale,
    compareIds: "",
    onSelectionChange: () => {},
  });
  const labels = [...container.querySelectorAll(".compare-pick-button")].map((b) => b.textContent);
  assert.equal(labels.length, regional.length, "every regional-spirit profile renders in the picker");
  for (const label of labels) {
    const shown = label.split(" \u2014 ")[1];
    assert.ok(
      Object.values(SPIRIT_LABELS).includes(shown),
      `picker shows a display label, got raw id: ${shown}`
    );
    assert.ok(shown[0] === shown[0].toUpperCase(), "label starts with a capital letter");
  }
  assert.ok(labels.some((l) => l.includes("Tuxca")));
  assert.ok(labels.some((l) => l.includes("Comiteco")));
  assert.ok(labels.some((l) => l.includes("Destilado de pulque")));
  container.remove();
});

test("learn view renders plants, processes and glossary with source disclosures", async () => {
  const { renderLearn } = await import("../assets/js/learn-view.js");
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderLearn(container, {
    plants, processes, glossary, profiles, bottles, sources, locale: enLocale,
  });

  // Section jump targets exist for all three sections.
  for (const id of ["learn-plants", "learn-processes", "learn-terms"]) {
    const target = container.querySelector(`#${id}`);
    assert.ok(target, `section ${id} renders`);
    assert.equal(target.getAttribute("tabindex"), "-1", `${id} is focusable for jump navigation`);
  }
  assert.equal(container.querySelectorAll(".learn-jump").length, 3, "three jump buttons");

  // Every plant, process and glossary term renders as a card.
  assert.equal(container.querySelectorAll(".learn-card").length,
    plants.length + processes.length + glossary.length, "one card per entry in all three data sets");
  for (const plant of plants) {
    assert.ok(container.querySelector(`#plant-${plant.id}`), `plant ${plant.id} card exists`);
  }
  assert.ok(container.textContent.includes(plants[0].species));

  // Plant cards link back to the profiles that use them.
  const tequilanaLinks = container.querySelectorAll(`a[href="#/profile/tequila-blanco-valley-jalisco"]`);
  assert.ok(tequilanaLinks.length >= 1, "plant-to-profile links render");

  // Sources are disclosed per card, collapsed out of the reading flow.
  const details = container.querySelectorAll("details.source-details");
  assert.equal(details.length, plants.length + processes.length + glossary.length,
    "every card keeps a collapsible sources disclosure");
  for (const d of details) {
    assert.ok(d.querySelector("summary").textContent.includes("Sources"));
  }
  for (const link of container.querySelectorAll(".source-link")) {
    assert.equal(new URL(link.href).protocol, "https:");
    assert.equal(link.getAttribute("rel"), "noopener noreferrer");
  }
  container.remove();
});

test("learn view: jump buttons move focus to the target section", async () => {
  const { renderLearn } = await import("../assets/js/learn-view.js");
  const container = document.createElement("div");
  document.body.appendChild(container);
  renderLearn(container, { plants, processes, glossary, profiles, bottles, sources, locale: enLocale });
  const jump = [...container.querySelectorAll(".learn-jump")].find((b) => b.textContent === "Label vocabulary" || b.textContent.includes("terms"));
  jump.dispatchEvent(new window.Event("click", { bubbles: true }));
  const focused = document.activeElement;
  assert.equal(focused && focused.id, "learn-terms", "focus lands on the jumped-to section");
  container.remove();
});

test("data-loader rejects with one clear error when a file fails", async () => {
  const { loadAppData } = await import("../assets/js/data-loader.js");
  const files = {
    "profiles.json": JSON.stringify({ profiles }),
    "bottles.json": JSON.stringify({ bottles }),
    "sources.json": JSON.stringify({ sources }),
    "plants.json": JSON.stringify({ plants }),
    "processes.json": JSON.stringify({ processes }),
    "glossary.json": JSON.stringify({ glossary }),
    "traditions.json": JSON.stringify({ traditions }),
    "chapters.json": JSON.stringify({ chapters: [] }),
    "regions.json": JSON.stringify({ regions }),
  };
  const baseUrl = new URL("https://example.test/RagdollLabs-agave-guide/");
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel === "sources.json") return { ok: false, status: 404, statusText: "Not Found" };
    if (rel in files) return { ok: true, json: async () => JSON.parse(files[rel]) };
    return { ok: false, status: 404, statusText: "Not Found" };
  };
  try {
    await assert.rejects(
      () => loadAppData(baseUrl),
      /Could not load app data: Request failed: 404/,
      "one non-OK response rejects with a single readable error"
    );
  } finally {
    globalThis.fetch = prevFetch;
  }
});

test("data-loader rejects on malformed JSON with a wrapped error", async () => {
  const { loadAppData } = await import("../assets/js/data-loader.js");
  const ok = (data) => ({ ok: true, json: async () => data });
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const rel = new URL(url).pathname.split("/").pop();
    if (rel === "bottles.json") {
      return {
        ok: true,
        json: async () => { throw new SyntaxError("Unexpected token < in JSON"); },
      };
    }
    return ok({
      profiles, sources, plants, processes, glossary,
    }[rel.replace(".json", "")] ? { [rel.replace(".json", "")]: [] } : {});
  };
  try {
    await assert.rejects(
      () => loadAppData(new URL("https://example.test/RagdollLabs-agave-guide/")),
      /Could not load app data/,
      "malformed JSON rejects with the single wrapped error the error view expects"
    );
  } finally {
    globalThis.fetch = prevFetch;
  }
});

test("data-loader times out bounded requests instead of hanging forever", async () => {
  const { loadAppData } = await import("../assets/js/data-loader.js");
  const prevFetch = globalThis.fetch;
  globalThis.fetch = (url, { signal } = {}) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => {
      const error = new Error("The operation was aborted");
      error.name = "AbortError";
      reject(error);
    });
  });
  try {
    await assert.rejects(
      () => loadAppData(new URL("https://example.test/RagdollLabs-agave-guide/"), 20),
      /Could not load app data/,
      "a hanging fetch rejects through the timeout wrapper"
    );
  } finally {
    globalThis.fetch = prevFetch;
  }
});
