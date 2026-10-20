import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const readJson = async (rel) => JSON.parse(await readFile(path.join(root, rel), "utf8"));

const errors = [];
const fail = (msg) => errors.push(msg);

const { profiles } = await readJson("assets/data/profiles.json");
const { bottles } = await readJson("assets/data/bottles.json");
const { sources } = await readJson("assets/data/sources.json");

const profileIds = new Set(profiles.map((p) => p.id));
const bottleIds = new Set(bottles.map((b) => b.id));
const sourceIds = new Set(sources.map((s) => s.id));

const VALID_STATES = new Set([
  "ags", "bc", "bcs", "camp", "cdmx", "chih", "chis", "coah", "col", "dgo",
  "edomex", "gto", "gro", "hgo", "jal", "mich", "mor", "nay", "nl", "oax",
  "pue", "qro", "qroo", "slp", "sin", "son", "tab", "tamps", "tlax", "ver",
  "yuc", "zac",
]);

const VALID_SPIRITS = new Set(["tequila", "mezcal", "bacanora", "raicilla"]);
const VALID_BODIES = new Set(["light", "medium", "full"]);
const VALID_KINDS = new Set(["style", "producer", "review"]);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FORBIDDEN_WORDS = ["sotol"];

if (!Array.isArray(profiles) || profiles.length === 0) fail("profiles.json must contain a non-empty profiles array");
if (!Array.isArray(bottles) || bottles.length === 0) fail("bottles.json must contain a non-empty bottles array");
if (!Array.isArray(sources) || sources.length === 0) fail("sources.json must contain a non-empty sources array");

for (const p of profiles) {
  const label = `profile ${p.id ?? "(missing id)"}`;
  if (!p.id || !ID_PATTERN.test(p.id)) fail(`${label}: id must be kebab-case`);
  if (!p.title || typeof p.title !== "string") fail(`${label}: title required`);
  if (!VALID_SPIRITS.has(p.spirit)) fail(`${label}: spirit must be tequila or mezcal`);
  if (!VALID_STATES.has(p.stateId)) fail(`${label}: unknown stateId ${p.stateId}`);
  if (!p.stateName || typeof p.stateName !== "string") fail(`${label}: stateName required`);
  if (!p.context || p.context.length < 40) fail(`${label}: context too short`);
  if (!p.description || p.description.length < 80) fail(`${label}: description too short`);
  if (!VALID_BODIES.has(p.body)) fail(`${label}: body must be light, medium or full`);
  if (!Array.isArray(p.tasteNotes) || p.tasteNotes.length < 3 || p.tasteNotes.length > 5) {
    fail(`${label}: tasteNotes must have 3–5 entries`);
  }
  if (p.smoke !== null && typeof p.smoke !== "string") fail(`${label}: smoke must be a string or null`);
  if (p.plant !== undefined && typeof p.plant !== "string") fail(`${label}: plant must be a string when present`);
  if (p.process !== undefined && typeof p.process !== "string") fail(`${label}: process must be a string when present`);
  if (p.category !== undefined && typeof p.category !== "string") fail(`${label}: category must be a string when present`);
  if (p.beginnerNote !== undefined && typeof p.beginnerNote !== "string") fail(`${label}: beginnerNote must be a string when present`);
  if (!p.finish || typeof p.finish !== "string") fail(`${label}: finish required`);
  if (!bottleIds.has(p.exampleBottleId)) fail(`${label}: exampleBottleId ${p.exampleBottleId} not in bottles.json`);
  if (!Array.isArray(p.sourceIds) || p.sourceIds.length === 0) fail(`${label}: sourceIds required`);
  for (const sid of p.sourceIds) {
    if (!sourceIds.has(sid)) fail(`${label}: sourceId ${sid} not in sources.json`);
  }
  const text = JSON.stringify(p).toLowerCase();
  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) fail(`${label}: mentions excluded spirit "${word}"`);
  }
}

// Exactly one example bottle per profile.
const bottleUse = new Map();
for (const p of profiles) {
  bottleUse.set(p.exampleBottleId, (bottleUse.get(p.exampleBottleId) ?? 0) + 1);
}
for (const [bid, count] of bottleUse) {
  if (count > 1) fail(`bottle ${bid} is the example for ${count} profiles; exactly one example bottle per profile is required`);
}

for (const b of bottles) {
  const label = `bottle ${b.id ?? "(missing id)"}`;
  if (!b.id || !ID_PATTERN.test(b.id)) fail(`${label}: id must be kebab-case`);
  if (!b.brand || typeof b.brand !== "string") fail(`${label}: brand required`);
  if (!b.expression || typeof b.expression !== "string") fail(`${label}: expression required`);
  if (b.abv != null && (typeof b.abv !== "number" || b.abv < 35 || b.abv > 55)) {
    fail(`${label}: abv must be a number between 35 and 55 when present`);
  }
  if (b.producer !== undefined && typeof b.producer !== "string") fail(`${label}: producer must be a string when present`);
  if (b.place !== undefined && typeof b.place !== "string") fail(`${label}: place must be a string when present`);
  if (!b.reviewSummary || b.reviewSummary.length < 40) fail(`${label}: reviewSummary too short`);
  if (!Array.isArray(b.sourceIds) || b.sourceIds.length === 0) fail(`${label}: sourceIds required`);
  for (const sid of b.sourceIds) {
    if (!sourceIds.has(sid)) fail(`${label}: sourceId ${sid} not in sources.json`);
  }
}

for (const s of sources) {
  const label = `source ${s.id ?? "(missing id)"}`;
  if (!s.id || !ID_PATTERN.test(s.id)) fail(`${label}: id must be kebab-case`);
  if (!s.title || typeof s.title !== "string") fail(`${label}: title required`);
  let url;
  try {
    url = new URL(s.url);
  } catch {
    fail(`${label}: url is not a valid URL`);
    continue;
  }
  if (url.protocol !== "https:") fail(`${label}: url must be https`);
  if (url.username || url.password) fail(`${label}: url must not embed credentials`);
  if (!VALID_KINDS.has(s.kind)) fail(`${label}: kind must be style, producer or review`);
  if (s.author !== undefined && typeof s.author !== "string") fail(`${label}: author must be a string when present`);
  if (s.date !== undefined && typeof s.date !== "string") fail(`${label}: date must be a string when present`);
}

// Duplicated ids.
for (const [name, arr] of [["profiles", profiles], ["bottles", bottles], ["sources", sources]]) {
  const ids = arr.map((x) => x.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) fail(`${name}: duplicate ids ${[...new Set(dupes)].join(", ")}`);
}

// SVG sanity: 32 state paths with data-state.
const svg = await readFile(path.join(root, "assets/geo/mexico-states.svg"), "utf8");
const svgStates = [...svg.matchAll(/data-state="([a-z]+)"/g)].map((m) => m[1]);
if (svgStates.length !== 32) fail(`mexico-states.svg should have 32 state paths, found ${svgStates.length}`);
for (const p of profiles) {
  if (!svgStates.includes(p.stateId)) fail(`profile stateId ${p.stateId} has no path in mexico-states.svg`);
}

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Validation passed: ${profiles.length} profiles, ${bottles.length} bottles, ${sources.length} sources.`);
