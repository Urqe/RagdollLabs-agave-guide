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

const VALID_SPIRITS = new Set(["tequila", "mezcal", "bacanora", "raicilla", "tuxca", "comiteco", "destilado-de-pulque", "sotol"]);
const VALID_BODIES = new Set(["light", "medium", "full"]);
const VALID_KINDS = new Set(["style", "producer", "review"]);
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FORBIDDEN_WORDS = [];

if (!Array.isArray(profiles) || profiles.length === 0) fail("profiles.json must contain a non-empty profiles array");
if (!Array.isArray(bottles) || bottles.length === 0) fail("bottles.json must contain a non-empty bottles array");
if (!Array.isArray(sources) || sources.length === 0) fail("sources.json must contain a non-empty sources array");

for (const p of profiles) {
  const label = `profile ${p.id ?? "(missing id)"}`;
  if (!p.id || !ID_PATTERN.test(p.id)) fail(`${label}: id must be kebab-case`);
  if (!p.title || typeof p.title !== "string") fail(`${label}: title required`);
  if (!VALID_SPIRITS.has(p.spirit)) fail(`${label}: spirit must be a known spirit id`);
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
  if (p.placeCoords !== undefined) {
    const c = p.placeCoords;
    if (typeof c.lat !== "number" || typeof c.lon !== "number") fail(`${label}: placeCoords requires numeric lat/lon`);
    else if (c.lat < 14.5 || c.lat > 32.6 || c.lon < -118.4 || c.lon > -86.7) {
      fail(`${label}: placeCoords outside Mexico's bounding box`);
    }
    if (typeof c.precision !== "string" || !c.precision.toLowerCase().includes("approximate")) {
      fail(`${label}: placeCoords requires an honest precision label containing "approximate"`);
    }
  }
  if (p.aliases !== undefined) {
    if (!Array.isArray(p.aliases) || p.aliases.some((a) => typeof a !== "string" || !a.trim())) {
      fail(`${label}: aliases must be an array of non-empty strings when present`);
    }
  }
  if (p.sensory !== undefined) {
    if (typeof p.sensory !== "object" || Array.isArray(p.sensory)) fail(`${label}: sensory must be an object when present`);
    else {
      const VALID_LEVELS = new Set(["none", "low", "medium", "high", null]);
      for (const [dim, level] of Object.entries(p.sensory)) {
        if (!VALID_LEVELS.has(level)) fail(`${label}: sensory.${dim} must be none, low, medium, high or null (unknown), got ${JSON.stringify(level)}`);
      }
    }
  }
  if (!p.finish || typeof p.finish !== "string") fail(`${label}: finish required`);
  if (p.exampleBottleId != null && !bottleIds.has(p.exampleBottleId)) fail(`${label}: exampleBottleId ${p.exampleBottleId} not in bottles.json`);
  if (p.notableBottleIds !== undefined) {
    if (!Array.isArray(p.notableBottleIds)) fail(`${label}: notableBottleIds must be an array when present`);
    else for (const bid of p.notableBottleIds) {
      if (!bottleIds.has(bid)) fail(`${label}: notableBottleId ${bid} not in bottles.json`);
    }
  }
  if (!Array.isArray(p.sourceIds) || p.sourceIds.length === 0) fail(`${label}: sourceIds required`);
  for (const sid of p.sourceIds) {
    if (!sourceIds.has(sid)) fail(`${label}: sourceId ${sid} not in sources.json`);
  }
  const text = JSON.stringify(p).toLowerCase();
  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) fail(`${label}: mentions excluded spirit "${word}"`);
  }
}

// Exactly one featured example per profile; several bottles may map to the
// same profile, but only one of them is the featured example.
const bottleUse = new Map();
for (const p of profiles) {
  if (p.exampleBottleId == null) continue;
  bottleUse.set(p.exampleBottleId, (bottleUse.get(p.exampleBottleId) ?? 0) + 1);
}
for (const [bid, count] of bottleUse) {
  if (count > 1) fail(`bottle ${bid} is the featured example for ${count} profiles; a bottle can only be featured by one profile`);
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
  if (b.spirit !== undefined && !VALID_SPIRITS.has(b.spirit)) fail(`${label}: spirit must be a known spirit id`);
  if (b.profileId != null && !profileIds.has(b.profileId)) fail(`${label}: profileId ${b.profileId} not in profiles.json`);
  if (b.profileId === undefined) fail(`${label}: profileId is required (null means no profile coverage yet)`);
  if (b.batch !== undefined && typeof b.batch !== "string") fail(`${label}: batch must be a string when present`);
  if (b.composition !== undefined && typeof b.composition !== "string") fail(`${label}: composition must be a string when present`);
  if (b.abv == null && !b.abvNote) fail(`${label}: missing ABV requires an abvNote saying it is not documented`);
  if (b.abv != null && b.abvNote) fail(`${label}: abvNote must be omitted when the ABV is documented`);
  if (b.spirit === "comiteco" && !b.composition) {
    fail(`${label}: comiteco bottles must carry a composition disclosure (agave vs cane-source facts)`);
  }
  const VALID_COVERAGE = new Set(["tasting-not-documented", "profile-not-covered"]);
  if (b.coverage !== undefined) {
    if (!Array.isArray(b.coverage)) fail(`${label}: coverage must be an array when present`);
    else for (const c of b.coverage) {
      if (!VALID_COVERAGE.has(c)) fail(`${label}: unknown coverage label ${c}`);
    }
  }
  if (b.coverage?.includes("tasting-not-documented") && b.reviewSummary) {
    fail(`${label}: marked tasting-not-documented but has a reviewSummary`);
  }
  if (!b.reviewSummary && !(b.coverage || []).includes("tasting-not-documented")) {
    fail(`${label}: reviewSummary required unless the bottle is labeled tasting-not-documented`);
  }
  if (b.editorialNote !== undefined && typeof b.editorialNote !== "string") fail(`${label}: editorialNote must be a string when present`);
  // Profile-relative notes must store their compared profile and review deps.
  if (b.noteProfileId != null && !profileIds.has(b.noteProfileId)) fail(`${label}: noteProfileId ${b.noteProfileId} not in profiles.json`);
  if (b.editorialNote && b.noteProfileId == null) fail(`${label}: editorialNote requires noteProfileId (the profile it is relative to)`);
  if (b.noteSourceIds !== undefined) {
    if (!Array.isArray(b.noteSourceIds)) fail(`${label}: noteSourceIds must be an array when present`);
    else for (const sid of b.noteSourceIds) {
      if (!sourceIds.has(sid)) fail(`${label}: noteSourceId ${sid} not in sources.json`);
    }
  }
  if (b.coverageNote !== undefined && typeof b.coverageNote !== "string") fail(`${label}: coverageNote must be a string when present`);
  if (b.reviewSummary && b.reviewSummary.length < 40 && !(b.coverage || []).includes("tasting-not-documented")) {
    fail(`${label}: reviewSummary too short`);
  }
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
  if (!s.verified || !/^\d{4}-\d{2}-\d{2}$/.test(s.verified)) {
    fail(`${label}: verified (ISO date the source was last checked) is required`);
  }
}

// Duplicate or ambiguous bottle names: brand + expression must be unique
// so catalogue entries can never collide ambiguously.
const bottleNames = bottles.map((b) => `${b.brand}||${b.expression}`.toLowerCase());
const nameDupes = bottleNames.filter((n, i) => bottleNames.indexOf(n) !== i);
if (nameDupes.length) {
  fail(`bottles: duplicate brand+expression combinations: ${[...new Set(nameDupes)].join(", ")}`);
}
// Maker attribution: a bottle must have either a producer or a place.
for (const b of bottles) {
  if (!b.producer && !b.place) {
    fail(`bottle ${b.id}: requires a producer or a place for maker attribution`);
  }
}
// Coverage consistency: profile-not-covered requires profileId null and
// vice versa: a mapped profile bottle may not carry profile-not-covered.
for (const b of bottles) {
  if ((b.coverage || []).includes("profile-not-covered") && b.profileId != null) {
    fail(`bottle ${b.id}: marked profile-not-covered but links profileId ${b.profileId}`);
  }
}

// Duplicated ids.
for (const [name, arr] of [["profiles", profiles], ["bottles", bottles], ["sources", sources]]) {
  const ids = arr.map((x) => x.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) fail(`${name}: duplicate ids ${[...new Set(dupes)].join(", ")}`);
}

// Plants, processes and glossary datasets.
const { plants } = await readJson("assets/data/plants.json");
const { processes } = await readJson("assets/data/processes.json");
const { glossary } = await readJson("assets/data/glossary.json");
const { regions } = await readJson("assets/data/regions.json");
const { traditions } = await readJson("assets/data/traditions.json");
const regionIdSet = new Set(regions.map((r) => r.id));
const traditionIdSet = new Set(VALID_SPIRITS);
if (!Array.isArray(plants) || plants.length === 0) fail("plants.json must contain a non-empty plants array");
// Profiles link to a real plant entry (guide-to-profile routing + drift guard).
const plantIdSet = new Set(plants.map((x) => x.id));
for (const p3 of profiles) {
  if (p3.plantId !== undefined && !plantIdSet.has(p3.plantId)) {
    fail(`profile ${p3.id}: plantId ${p3.plantId} not in plants.json`);
  }
}
if (!Array.isArray(processes) || processes.length === 0) fail("processes.json must contain a non-empty processes array");
if (!Array.isArray(glossary) || glossary.length === 0) fail("glossary.json must contain a non-empty glossary array");
for (const plant of plants) {
  const label = `plant ${plant.id ?? "(missing id)"}`;
  if (!plant.id || !ID_PATTERN.test(plant.id)) fail(`${label}: id must be kebab-case`);
  if (!plant.species || typeof plant.species !== "string") fail(`${label}: species required`);
  if (!Array.isArray(plant.commonNames) || plant.commonNames.length === 0) {
    fail(`${label}: at least one common name with region required`);
  } else {
    for (const name of plant.commonNames) {
      if (!name.name || !name.region) fail(`${label}: common names need name and region`);
    }
  }
  if (plant.uncertainty !== null && plant.uncertainty !== undefined && typeof plant.uncertainty !== "string") {
    fail(`${label}: uncertainty must be a string or null`);
  }
  for (const pid of plant.profileIds || []) {
    if (!profileIds.has(pid)) fail(`${label}: profileId ${pid} not in profiles.json`);
  }
  for (const sid of plant.sourceIds || []) {
    if (!sourceIds.has(sid)) fail(`${label}: sourceId ${sid} not in sources.json`);
  }
}
for (const proc of processes) {
  const label = `process ${proc.id ?? "(missing id)"}`;
  if (!proc.id || !ID_PATTERN.test(proc.id)) fail(`${label}: id must be kebab-case`);
  if (!proc.name || !proc.explanation || !proc.stage) fail(`${label}: name, stage and explanation required`);
  for (const sid of proc.sourceIds || []) {
    if (!sourceIds.has(sid)) fail(`${label}: sourceId ${sid} not in sources.json`);
  }
}
// Plants: normalized cross-references (Release 15 interconnected model).
const processIdSet = new Set(processes.map((x) => x.id));
for (const plant of plants) {
  const label = `plant ${plant.id}`;
  for (const tid of plant.traditionIds || []) {
    if (!VALID_SPIRITS.has(tid)) fail(`${label}: traditionId ${tid} is not a known tradition id`);
  }
  for (const rid of plant.regionIds || []) {
    if (!regionIdSet.has(rid)) fail(`${label}: regionId ${rid} not in regions.json`);
  }
}
// Profiles: normalized cross-references must point at real entities.
for (const p of profiles) {
  const label = `profile ${p.id}`;
  if (!traditionIdSet.has(p.traditionId)) fail(`${label}: traditionId ${p.traditionId} not in traditions.json`);
  if (!Array.isArray(p.regionIds) || p.regionIds.length === 0) fail(`${label}: regionIds required`);
  for (const rid of p.regionIds) {
    if (!regionIdSet.has(rid)) fail(`${label}: regionId ${rid} not in regions.json`);
  }
  if (!Array.isArray(p.processIds) || p.processIds.length === 0) fail(`${label}: processIds required`);
  for (const pid of p.processIds) {
    if (!processIdSet.has(pid)) fail(`${label}: processId ${pid} not in processes.json`);
  }
  if (!Array.isArray(p.plantIds) || p.plantIds.length === 0) fail(`${label}: plantIds required`);
  for (const pid of p.plantIds) {
    if (!plantIdSet.has(pid)) fail(`${label}: plantId ${pid} not in plants.json`);
  }
  // Profile regions must belong to the same state as the profile.
  for (const rid of p.regionIds) {
    const region = regions.find((r) => r.id === rid);
    if (region && region.stateId !== p.stateId) {
      fail(`${label}: region ${rid} is in ${region.stateId}, profile claims ${p.stateId}`);
    }
  }
  // Regions must practice the profile's tradition.
  for (const rid of p.regionIds) {
    const region = regions.find((r) => r.id === rid);
    if (region && !region.traditionIds.includes(p.traditionId)) {
      fail(`${label}: region ${rid} does not list tradition ${p.traditionId}`);
    }
  }
}
// Bottles: normalized cross-references.
for (const b of bottles) {
  const label = `bottle ${b.id}`;
  if (!traditionIdSet.has(b.traditionId)) fail(`${label}: traditionId ${b.traditionId} not in traditions.json`);
  if (!Array.isArray(b.regionIds)) fail(`${label}: regionIds required (may be empty when no profile is covered)`);
  for (const rid of b.regionIds) {
    if (!regionIdSet.has(rid)) fail(`${label}: regionId ${rid} not in regions.json`);
  }
  // A bottle's tradition must match its mapped profile's tradition.
  if (b.profileId != null) {
    const prof = profiles.find((p) => p.id === b.profileId);
    if (prof && prof.traditionId !== b.traditionId) {
      fail(`${label}: tradition ${b.traditionId} disagrees with profile ${prof.id} tradition ${prof.traditionId}`);
    }
    const profRegionSet = new Set(prof.regionIds);
    for (const rid of b.regionIds) {
      if (!profRegionSet.has(rid)) fail(`${label}: region ${rid} is not one of profile ${prof.id}'s regions`);
    }
  }
}
// Regions: valid state ids, known traditions/plants/processes, no state-level
// whole-state legal-zone claims.
for (const region of regions) {
  const label = `region ${region.id ?? "(missing id)"}`;
  if (!region.id || !ID_PATTERN.test(region.id)) fail(`${label}: id must be kebab-case`);
  if (!VALID_STATES.has(region.stateId)) fail(`${label}: unknown stateId ${region.stateId}`);
  if (region.type !== "state" && region.type !== "subregion" && region.type !== "municipality") {
    fail(`${label}: type must be state, subregion or municipality`);
  }
  if (!Array.isArray(region.sourceIds) || region.sourceIds.length === 0) {
    fail(`${label}: sourceIds required (regions carry legal/geographic claims that must stay source-backed)`);
  }
  for (const sid of region.sourceIds || []) {
    if (!sourceIds.has(sid)) fail(`${label}: sourceId ${sid} not in sources.json`);
  }
  for (const tid of region.traditionIds || []) {
    if (!VALID_SPIRITS.has(tid)) fail(`${label}: traditionId ${tid} not a known tradition`);
  }
  for (const pid of region.plantIds || []) {
    if (!plantIdSet.has(pid)) fail(`${label}: plantId ${pid} not in plants.json`);
  }
  for (const pid of region.processIds || []) {
    if (!processIdSet.has(pid)) fail(`${label}: processId ${pid} not in processes.json`);
  }
  for (const p of profiles) {
    if (!p.regionIds.includes(region.id)) continue;
    for (const pid of p.plantIds) {
      if (!region.plantIds.includes(pid)) {
        fail(`region ${region.id}: profile ${p.id} lists plant ${pid} but the region does not`);
      }
    }
  }
}
// Traditions: stable ids matching the spirit vocabulary, real plants/regions/sources.
for (const trad of traditions) {
  const label = `tradition ${trad.id ?? "(missing id)"}`;
  if (!trad.id || !ID_PATTERN.test(trad.id)) fail(`${label}: id must be kebab-case`);
  if (!VALID_SPIRITS.has(trad.id)) fail(`${label}: id must be a known spirit id`);
  if (!trad.name || typeof trad.name !== "string") fail(`${label}: name required`);
  for (const field of ["origin", "history", "legalStatus", "materials", "practices", "diversity"]) {
    if (!trad[field] || typeof trad[field] !== "string") fail(`${label}: ${field} required`);
  }
  for (const pid of trad.plantIds || []) {
    if (!plantIdSet.has(pid)) fail(`${label}: plantId ${pid} not in plants.json`);
  }
  for (const rid of trad.regionIds || []) {
    if (!regionIdSet.has(rid)) fail(`${label}: regionId ${rid} not in regions.json`);
  }
  for (const sid of trad.sourceIds || []) {
    if (!sourceIds.has(sid)) fail(`${label}: sourceId ${sid} not in sources.json`);
  }
}
// Tradition coverage: every VALID_SPIRIT used by a profile must have a tradition entity.
for (const p of profiles) {
  if (!traditions.some((t) => t.id === p.traditionId)) fail(`profile ${p.id}: no tradition entity for ${p.traditionId}`);
}
// Duplicate ids for the new entity files.
for (const [name, arr] of [["regions", regions], ["traditions", traditions]]) {
  const ids = arr.map((x) => x.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) fail(`${name}: duplicate ids ${[...new Set(dupes)].join(", ")}`);
}
// No duplicated descriptions across data files: tradition legal-status text
// must not be copied verbatim into any profile or bottle field.
for (const trad of traditions) {
  const snippet = (trad.legalStatus || "").slice(0, 60);
  if (snippet.length < 30) continue;
  const blob = JSON.stringify([...profiles, ...bottles]);
  if (blob.includes(snippet)) fail(`tradition ${trad.id}: legalStatus text duplicated in profiles/bottles`);
}
for (const term of glossary) {
  const label = `glossary term ${term.term ?? "(missing)"}`;
  if (!term.term || !term.context || !term.definition) fail(`${label}: term, context and definition required`);
  for (const sid of term.sourceIds || []) {
    if (!sourceIds.has(sid)) fail(`${label}: sourceId ${sid} not in sources.json`);
  }
}
// Pairings (optional) on profiles: serving text required when present.
for (const p2 of profiles) {
  if (p2.pairing !== undefined) {
    if (!p2.pairing.serving || typeof p2.pairing.serving !== "string") {
      fail(`profile ${p2.id}: pairing requires a serving string`);
    }
    if (p2.pairing.foods !== undefined && !Array.isArray(p2.pairing.foods)) {
      fail(`profile ${p2.id}: pairing.foods must be an array when present`);
    }
    const text = (p2.pairing.serving || "").toLowerCase();
    if (!text.includes("editorial") && !text.includes("suggestion")) {
      fail(`profile ${p2.id}: serving guidance must be labeled editorial/suggestion`);
    }
  }
}

// Release 19: progressive learning chapters with valid cross-references.
const { chapters } = await readJson("assets/data/chapters.json");
if (!Array.isArray(chapters) || chapters.length !== 7) fail("chapters.json must contain exactly 7 chapters");
const termTexts = new Set(glossary.map((x) => x.term));
const chapterIds = new Set();
for (const ch of chapters) {
  const label = `chapter ${ch.id ?? "(missing id)"}`;
  if (!ch.id || !ID_PATTERN.test(ch.id)) fail(`${label}: id must be kebab-case`);
  if (chapterIds.has(ch.id)) fail(`${label}: duplicate chapter id`);
  chapterIds.add(ch.id);
  if (!ch.title || !ch.intro) fail(`${label}: title and intro required`);
  if (!Array.isArray(ch.blocks) || ch.blocks.length === 0) fail(`${label}: blocks required`);
  for (const [bi, block] of (ch.blocks || []).entries()) {
    if (!block.text || typeof block.text !== "string") fail(`${label}: block ${bi} text required`);
    for (const pid of block.exampleProfileIds || []) {
      if (!profileIds.has(pid)) fail(`${label}: block ${bi} example profile ${pid} not in profiles.json`);
    }
    for (const pid of block.plantIds || []) {
      if (!plantIdSet.has(pid)) fail(`${label}: block ${bi} plant ${pid} not in plants.json`);
    }
    for (const pid of block.processIds || []) {
      if (!processIdSet.has(pid)) fail(`${label}: block ${bi} process ${pid} not in processes.json`);
    }
    for (const tid of block.termIds || []) {
      if (!termTexts.has(tid)) fail(`${label}: block ${bi} term "${tid}" not in glossary.json`);
    }
  }
}
// Spanish learning completeness: every chapter and glossary term must ship a
// reviewed translation — missing translations are a validation failure.
const contentEsAll = await readJson("assets/data/content-es.json");
const esChapters = contentEsAll.chapters || {};
for (const ch of chapters) {
  const entry = esChapters[ch.id];
  if (!entry) fail(`content-es.json: missing Spanish chapter ${ch.id}`);
  else {
    for (const field of ["title", "intro"]) {
      if (typeof entry[field] !== "string" || !entry[field].trim()) {
        fail(`content-es.json: chapter ${ch.id} ${field} missing Spanish translation`);
      }
    }
    for (const [bi, block] of (ch.blocks || []).entries()) {
      if (typeof entry["block" + bi] !== "string" || !entry["block" + bi].trim()) {
        fail(`content-es.json: chapter ${ch.id} block${bi} missing Spanish translation`);
      }
      if (block.deeper && (typeof entry["block" + bi + "deeper"] !== "string" || !entry["block" + bi + "deeper"].trim())) {
        fail(`content-es.json: chapter ${ch.id} block${bi}deeper missing Spanish translation`);
      }
    }
  }
}
// Release 20: reference-section Spanish parity — plant cultivation and
// process explanations must ship translations (they render on Learn).
const esPlants = contentEsAll.plants || {};
for (const plant of plants) {
  const entry = esPlants[plant.id];
  if (!entry || typeof entry.cultivation !== "string" || !entry.cultivation.trim()) {
    fail(`content-es.json: plant ${plant.id} cultivation missing Spanish translation`);
  }
}
const esProcesses = contentEsAll.processes || {};
for (const proc of processes) {
  const entry = esProcesses[proc.id];
  if (!entry || typeof entry.explanation !== "string" || !entry.explanation.trim()) {
    fail(`content-es.json: process ${proc.id} explanation missing Spanish translation`);
  }
}
const esTerms = contentEsAll.terms || {};
for (const term of glossary) {
  const entry = esTerms[term.term];
  if (!entry || typeof entry.definition !== "string" || !entry.definition.trim()) {
    fail(`content-es.json: glossary term "${term.term}" missing Spanish definition`);
  }
}

// Release 21: richer profiles — why-it-tastes text required on every
// profile, ES parity for it, and the enriched plant structure.
for (const p of profiles) {
  if (!p.whyItTastes || typeof p.whyItTastes !== "string" || p.whyItTastes.length < 80) {
    fail(`profile ${p.id}: whyItTastes (evidence-based cause-and-effect) required`);
  }
  const esEntry = (contentEsAll.profiles || {})[p.id];
  if (!esEntry || typeof esEntry.whyItTastes !== "string" || !esEntry.whyItTastes.trim()) {
    fail(`content-es.json: profile ${p.id} whyItTastes missing Spanish translation`);
  }
}
for (const plant of plants) {
  for (const field of ["atAGlance", "whereItGrows", "harvestProduction", "sensoryTendencies", "sustainability"]) {
    if (!plant[field] || typeof plant[field] !== "string") {
      fail(`plant ${plant.id}: ${field} required for the dedicated plant page`);
    }
  }
}

// SVG sanity: 32 state paths with data-state.
const svg = await readFile(path.join(root, "assets/geo/mexico-states.svg"), "utf8");
const svgStates = [...svg.matchAll(/data-state="([a-z]+)"/g)].map((m) => m[1]);
if (svgStates.length !== 32) fail(`mexico-states.svg should have 32 state paths, found ${svgStates.length}`);

// Each state path must carry exactly one <title> so map.js can strip it
// from uncovered states without a null removeChild crash.
for (const m of svg.matchAll(/<path[^>]*data-state="([a-z]+)"[^>]*>\s*(<title>.*?<\/title>)?/gs)) {
  const titles = (m[0].match(/<title>/g) || []).length;
  if (titles !== 1) fail(`mexico-states.svg path ${m[1]} should have exactly one <title>, found ${titles}`);
}
for (const p of profiles) {
  if (!svgStates.includes(p.stateId)) fail(`profile stateId ${p.stateId} has no path in mexico-states.svg`);
}

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Validation passed: ${profiles.length} profiles, ${bottles.length} bottles, ${sources.length} sources.`);
