import { el, clear } from "./dom-utils.js";
import { navigateTo } from "./router.js";
import { ui } from "./presentation.js";
import {
  DIMENSIONS,
  biggestDifferences,
  missingDimensions,
  levelOf,
  comparisonSummary,
} from "./compare.js";
import { SPIRIT_LABELS, groupProfilesBySpirit } from "./spirit-labels.js";
import { dimensionLabel, dimensionHint } from "./presentation.js";
import { editorialText, localizedTitle, fieldEs } from "./editorial.js";
import { PRESETS, presetById, presetHref, checkPreset } from "./compare-presets.js";

const MAX_SLOTS = 3;


function parseIds(raw) {
  const seen = new Set();
  return (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((id) => {
      if (seen.has(id)) return false; // dedupe: one column per profile
      seen.add(id);
      return true;
    })
    .slice(0, MAX_SLOTS);
}

const normalize = (text) =>
  (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Picker button for one profile. */
function pickButton(profile, isSelected, disabled, onPick, titleFn) {
  const button = el("button", {
    type: "button",
    class: "compare-pick-button",
    dataset: { profileId: profile.id },
    "aria-pressed": isSelected ? "true" : "false",
    disabled: disabled ? "true" : null,
  },
    `${titleFn(profile)} — ${SPIRIT_LABELS[profile.spirit] || profile.spirit}`);
  button.addEventListener("click", () => onPick(profile.id));
  return button;
}

/**
 * Searchable, grouped profile picker. Profiles group by spirit in logical
 * order, alphabetically within each group; a filter box narrows the list;
 * selected profiles always stay visible (so they can be deselected) even
 * when they fall outside the current filter.
 */
function slotSelector(profiles, selectedIds, onPick, { locale = null, initialQuery = "", titleFn = (p) => p.title } = {}) {
  const t = (key) => (locale ? locale.t(key) : key);
  const compare = locale ? (a, b) => locale.compare(a, b) : null;
  const holder = el("div", { class: "compare-picker-search" });

  const searchInput = el("input", {
    type: "search",
    class: "search-input",
    id: "compare-search",
    placeholder: t("compare.searchPlaceholder"),
    "aria-label": t("compare.searchPlaceholder"),
    value: initialQuery,
  });
  const form = el("form", { class: "search-form", role: "search" });
  form.addEventListener("submit", (event) => event.preventDefault());
  form.appendChild(searchInput);
  holder.appendChild(form);

  const results = el("div", { class: "compare-picker-results", "aria-live": "polite" });
  holder.appendChild(results);

  const renderList = () => {
    clear(results);
    const q = normalize(searchInput.value);
    const matches = q.length < 2
      ? profiles
      : profiles.filter((p) =>
          normalize([titleFn(p), p.title, p.spirit, SPIRIT_LABELS[p.spirit] || ""].join(" ")).includes(q));
    // Keep selected profiles visible regardless of the filter.
    const visible = q.length < 2
      ? matches
      : [...matches, ...profiles.filter((p) => selectedIds.includes(p.id) && !matches.includes(p))];
    if (visible.length === 0) {
      results.appendChild(el("p", { class: "search-empty" },
        `${t("compare.searchEmpty")} “${searchInput.value}”.`));
      return;
    }
    const grouped = groupProfilesBySpirit(visible, compare);
    const list = el("ul", { class: "compare-picker-list" });
    let lastSpirit = null;
    for (const profile of grouped) {
      const item = el("li");
      if (profile.spirit !== lastSpirit) {
        item.appendChild(el("span", { class: "profile-group-label" },
          SPIRIT_LABELS[profile.spirit] || profile.spirit));
        lastSpirit = profile.spirit;
      }
      const isSelected = selectedIds.includes(profile.id);
      const disabled = isSelected || (selectedIds.length >= MAX_SLOTS && !isSelected);
      item.appendChild(pickButton(profile, isSelected, disabled, onPick, titleFn));
      list.appendChild(item);
    }
    results.appendChild(list);
  };

  searchInput.addEventListener("input", renderList);
  renderList();
  return holder;
}

const LEVEL_POSITION = { none: 0, low: 1, medium: 2, high: 3 };
/** Pair 30: the style markers, in selection order. Letters, not colour alone, tell styles apart. */
export const STYLE_KEYS = ["A", "B", "C"];

/**
 * Pair 30: a level as a small slider-style meter (none at the left, high
 * at the right) followed by the word. The meter is decorative: the word
 * stays the cell's text, so screen readers and copy-paste read "Medium".
 * An undocumented level draws an empty dashed track, never a zero.
 */
export function levelMeter(profile, dimKey, t) {
  const level = levelOf(profile, dimKey);
  const known = level !== null && level !== undefined && level in LEVEL_POSITION;
  const meter = el("span", { class: "cmp-meter" + (known ? "" : " is-unknown"), "aria-hidden": "true" });
  if (known) meter.style.setProperty("--pos", String(LEVEL_POSITION[level]));
  return meter;
}

function levelCell(profile, dimKey, t, key) {
  const level = levelOf(profile, dimKey);
  const unknown = level === null || level === undefined;
  const td = el("td", { class: unknown ? "compare-unknown" : "", role: "cell", dataset: { key } });
  td.appendChild(levelMeter(profile, dimKey, t));
  td.appendChild(el("span", { class: "cmp-level" }, levelText(profile, dimKey, t)));
  return td;
}

/**
 * A level as readers see it everywhere: body uses Light / Medium / Full
 * (Pair 24), every other dimension None / Low / Medium / High.
 */
function levelText(profile, dimKey, t) {
  const level = levelOf(profile, dimKey);
  if (level === null || level === undefined) return t("compare.notDocumented");
  if (dimKey === "bodyLevel" && ["light", "medium", "full"].includes(profile.body)) {
    return t(`compare.body.${profile.body}`);
  }
  return t(`level.${level}`) || level;
}

/** Pair 27: the active guided comparison — question, focus, answer, limits, next. */
function presetPanel(preset, byId, { locale, title, short, t, from }) {
  const lang = locale ? locale.get() : "en";
  const [a, b] = preset.ids.map((id) => byId.get(id));
  const panel = el("section", { class: "compare-preset", "aria-labelledby": "compare-preset-question" });
  panel.appendChild(el("p", { class: "eyebrow" }, `${t("compare.presets.eyebrow")} · ${preset.title[lang] || preset.title.en}`));
  panel.appendChild(el("h2", { id: "compare-preset-question" }, preset.question[lang] || preset.question.en));
  const look = el("p", { class: "compare-preset-focus" });
  look.appendChild(el("strong", {}, t("compare.presets.lookAt") + " "));
  look.appendChild(document.createTextNode(preset.focus.map((k) => dimensionLabel(k, locale)).join(", ") + "."));
  panel.appendChild(look);

  const answer = el("details", { class: "compare-preset-answer" });
  answer.appendChild(el("summary", {}, t("compare.presets.reveal")));
  const list = el("dl", { class: "compare-preset-levels" });
  for (const key of preset.focus) {
    list.appendChild(el("dt", {}, dimensionLabel(key, locale)));
    // Pair 30: the same letters, short names and meters as the table.
    const dd = el("dd", {});
    const rows = el("ul", { class: "compare-diff-rows" });
    [a, b].forEach((p, i) => {
      const row = el("li", { dataset: { key: STYLE_KEYS[i] } });
      row.appendChild(el("span", { class: "cmp-badge", "aria-hidden": "true" }, STYLE_KEYS[i]));
      row.appendChild(el("span", { class: "compare-diff-name" }, short(p)));
      row.appendChild(levelMeter(p, key, t));
      row.appendChild(el("span", { class: "cmp-level" }, levelText(p, key, t)));
      rows.appendChild(row);
    });
    dd.appendChild(rows);
    list.appendChild(dd);
  }
  answer.appendChild(list);
  answer.appendChild(el("p", {}, preset.shows[lang] || preset.shows.en));
  answer.appendChild(el("h3", {}, t("compare.presets.limitsHeading")));
  answer.appendChild(el("p", {}, preset.limits[lang] || preset.limits.en));
  panel.appendChild(answer);

  const next = preset.next ? presetById(preset.next) : null;
  const nextLine = el("p", { class: "compare-preset-next" });
  if (next) {
    nextLine.appendChild(el("a", { href: presetHref(next, from ? { from } : {}), class: "cta-link" },
      t("compare.presets.next").replace("{title}", next.title[lang] || next.title.en)));
  } else {
    nextLine.appendChild(el("a", { href: "#/compare", class: "cta-link" }, t("compare.presets.ownLink")));
  }
  panel.appendChild(nextLine);
  return panel;
}

/** Pair 27: the list of guided comparisons, first on an empty Compare page. */
function presetsBlock(byId, { locale, title, t, from, place }) {
  const lang = locale ? locale.get() : "en";
  const block = el("section", { class: `compare-presets compare-presets-${place}`, "aria-labelledby": `compare-presets-heading-${place}` });
  block.appendChild(el("h2", { id: `compare-presets-heading-${place}` }, t(place === "top" ? "compare.presets.heading" : "compare.presets.headingAfter")));
  if (place === "top") {
    block.appendChild(el("p", {}, t("compare.presets.intro")));
    // Pair 29: on phones the five exercises fill more than a screen, so a
    // skip link reaches the free picker without scrolling past them. The
    // app uses hash routes, so the link scrolls instead of navigating.
    const skip = el("a", { href: "#/compare", class: "compare-skip-own" }, t("compare.presets.skipToOwn"));
    skip.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.getElementById("compare-own-heading");
      if (!target) return;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      target.focus({ preventScroll: true });
    });
    block.appendChild(skip);
  }
  const list = el("ul", { class: "discovery-matches compare-preset-list" });
  for (const preset of PRESETS) {
    if (checkPreset(preset, byId).length) continue; // never offer a stale exercise
    const [a, b] = preset.ids.map((id) => byId.get(id));
    const li = el("li");
    const link = el("a", { href: presetHref(preset, from ? { from } : {}), class: "discovery-card" });
    link.appendChild(el("strong", {}, preset.title[lang] || preset.title.en));
    link.appendChild(el("span", { class: "discovery-place" }, `${title(a)} · ${title(b)}`));
    li.appendChild(link);
    li.appendChild(el("p", { class: "discovery-reason" }, preset.question[lang] || preset.question.en));
    list.appendChild(li);
  }
  block.appendChild(list);
  return block;
}

/**
 * Compare view: pick up to three profiles, see a side-by-side editorial
 * sensory table, plant/process context, biggest differences and explicit
 * missing-data notes. Selections live in the route (#/compare/a,b,c) so
 * they survive reload, sharing and Back/Forward.
 */
/**
 * Pair 23.1: the same-plant perspective names the shared plant by its
 * canonical species from plants.json. The profile's full `plant` string
 * carries its own parenthetical (cultivation, local names), which nested
 * inside "Same plant (...)" produced double parentheses.
 */
function sharedPlantName(perspective, plants) {
  const record = (plants || []).find((p) => p.id === perspective.plantId);
  return (record && record.species) || perspective.plant;
}

export function renderCompare(container, { profiles, plants = [], compareIds, onSelectionChange, focusProfileId = null, keepPickerQuery = "", locale = null, from = null, preset: presetParam = null, revealResults = false, focusSource = null }) {
  clear(container);
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const parsedIds = parseIds(compareIds);
  const selectedIds = parsedIds.filter((id) => byId.has(id)); // prune unknown ids
  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean);

  // Pruned or duplicated ids in the route are canonicalized once, silently.
  if (selectedIds.length !== parsedIds.length && onSelectionChange) {
    onSelectionChange(selectedIds);
  }

  const section = el("section", { class: "compare-view", "aria-labelledby": "compare-heading" });
  const t = (key) => (locale ? locale.t(key) : key);
  const title = (p) => localizedTitle("profile", p.id, p.title, locale);
  // Pair 30: comparisons name styles by their short name ("Valley blanco");
  // the full title appears once, in the legend.
  const short = (p) => fieldEs("profile", p.id, "shortTitle", locale) || p.shortTitle || title(p);
  // Pair 9: a comparison opened from a lesson links back to it, above the
  // heading so it reads as a return path, mirroring the profile back link.
  if (from && from.startsWith("start:")) {
    const lessonId = from.slice("start:".length);
    section.appendChild(el("a", { href: `#/start/${encodeURIComponent(lessonId)}`, class: "back-link" },
      t("compare.backToLesson")));
  }
  section.appendChild(el("h1", { id: "compare-heading" }, t("compare.heading")));
  section.appendChild(el("p", { class: "view-intro" }, t("compare.intro")));

  // Pair 27: a curated exercise is active only when the route names a
  // preset, the selection is exactly its pair, and its data still holds.
  const requested = presetParam ? presetById(presetParam) : null;
  const activePreset = requested
    && selectedIds.length === 2
    && requested.ids.every((id, i) => selectedIds[i] === id)
    && checkPreset(requested, byId).length === 0 ? requested : null;
  if (activePreset) section.appendChild(presetPanel(activePreset, byId, { locale, title, short, t, from }));
  // Pair 27: with fewer than two styles chosen, the guided comparisons and
  // the instruction come first; the free picker follows.
  if (!activePreset && selected.length < 2) {
    section.appendChild(presetsBlock(byId, { locale, title, t, from, place: "top" }));
    section.appendChild(el("h2", { class: "compare-own-heading", id: "compare-own-heading", tabindex: "-1" }, t("compare.presets.ownHeading")));
    section.appendChild(el("p", { class: "compare-instruction" }, t(selected.length === 1 ? "compare.oneMore" : "compare.pick")));
  }

  // Picker
  const status = el("p", { class: "compare-status", role: "status", "aria-live": "polite" });
  section.appendChild(status);
  const dimLabel = (key) => dimensionLabel(key, locale);
  const total = (n) => `${n} ${n === 1 ? ui(locale, "profile") : ui(locale, "profiles")}`;
  const announce = (message) => {
    clear(status);
    status.appendChild(document.createTextNode(message));
  };

  const pickerHolder = el("div", { class: "compare-picker" });
  const currentQuery = () => pickerHolder.querySelector("#compare-search")?.value || "";
  // Pair 16: a comparison opened from a lesson teaches first — the
  // prepared comparison's explanation and results render before the full
  // profile picker, which stays available as a secondary control below.
  const fromLessonView = Boolean(from && from.startsWith("start:"));
  // A guided comparison teaches first in the same way as a lesson handoff.
  const teachFirst = fromLessonView || Boolean(activePreset);
  const pick = (profileId, pickerQuery, source = "picker") => {
    const removing = selectedIds.includes(profileId);
    const next = removing
      ? selectedIds.filter((id) => id !== profileId)
      : [...selectedIds, profileId].slice(0, MAX_SLOTS);
    const profile = byId.get(profileId);
    const name = profile ? title(profile) : profileId;
    announce(removing
      ? `${ui(locale, "removedFrom").replace("{name}", name)} ${total(next.length)}.`
      : `${ui(locale, "addedTo").replace("{name}", name)} ${total(next.length)}.`);
    if (onSelectionChange) onSelectionChange(next, pickerQuery ?? currentQuery(), source);
  };
  const selections = el("section", { class: "comparison-selections", "aria-label": ui(locale, "choices") });
  selections.appendChild(el("p", { class: "sensory-note" }, ui(locale, "slots")));
  const selectionList = el("div", { class: "selection-list" });
  for (const profile of selected) {
    const chip = el("div", { class: "selection-chip" });
    chip.appendChild(el("span", {}, title(profile)));
    const remove = el("button", { type: "button", class: "selection-remove", "aria-label": ui(locale, "remove") + ": " + title(profile) }, ui(locale, "remove") + " ×");
    remove.addEventListener("click", () => pick(profile.id));
    chip.appendChild(remove);
    selectionList.appendChild(chip);
  }
  selections.appendChild(selectionList);
  pickerHolder.appendChild(slotSelector(profiles, selectedIds, pick, { locale, initialQuery: keepPickerQuery || "", titleFn: title }));
  // Pair 30: once two styles are chosen the comparison comes first; the
  // legend takes over the chips' job, and the picker moves into a
  // collapsible control after the results.
  if (selected.length < 2) {
    section.appendChild(selections);
    section.appendChild(pickerHolder);
  }

  if (selected.length === 0) {
    announce(ui(locale, "noneSelected"));
    container.appendChild(section);
    restoreFocus(pickerHolder, focusProfileId);
    return;
  }

  if (selected.length === 1) {
    announce(`${ui(locale, "oneSelected")}: ${title(selected[0])}.`);
    container.appendChild(section);
    restoreFocus(pickerHolder, focusProfileId);
    return;
  }

  announce(`${ui(locale, "comparing")} ${total(selected.length)}: ${selected.map((p) => title(p)).join(", ")}.`);

  // Pair 30: a legend gives each style a letter and a short name, with its
  // full title and the remove control, so the table and the summaries
  // below can stay short.
  const keyOf = new Map(selected.map((p, i) => [p.id, STYLE_KEYS[i]]));
  const legend = el("ol", { class: "compare-legend", "aria-label": t("compare.legendLabel") });
  for (const profile of selected) {
    const item = el("li", { class: "compare-legend-item", dataset: { key: keyOf.get(profile.id) } });
    item.appendChild(el("span", { class: "cmp-badge", "aria-hidden": "true" }, keyOf.get(profile.id)));
    const names = el("span", { class: "compare-legend-names" });
    names.appendChild(el("a", { href: `#/profile/${encodeURIComponent(profile.id)}`, class: "compare-legend-short" }, short(profile)));
    names.appendChild(el("span", { class: "compare-legend-full" }, title(profile)));
    item.appendChild(names);
    const removeButton = el("button", {
      type: "button",
      class: "compare-remove-button",
      dataset: { profileId: profile.id },
      "aria-label": `${t("compare.removeLabel")}: ${title(profile)}`,
    }, t("compare.removeLabel"));
    removeButton.addEventListener("click", () => pick(profile.id, undefined, "legend"));
    item.appendChild(removeButton);
    legend.appendChild(item);
  }

  // Sensory table: one row per dimension, a meter and a word per style.
  // Explicit roles keep the table semantics when phones restyle it as
  // stacked rows.
  const table = el("table", { class: "compare-table", role: "table" });
  const thead = el("thead", { role: "rowgroup" });
  const headRow = el("tr", { role: "row" });
  headRow.appendChild(el("th", { scope: "col", role: "columnheader" }, ui(locale, "dimension")));
  for (const profile of selected) {
    const th = el("th", { scope: "col", role: "columnheader", dataset: { key: keyOf.get(profile.id) } });
    th.appendChild(el("span", { class: "cmp-badge", "aria-hidden": "true" }, keyOf.get(profile.id)));
    th.appendChild(document.createTextNode(short(profile)));
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el("tbody", { role: "rowgroup" });
  for (const { key } of DIMENSIONS) {
    const row = el("tr", { role: "row" });
    const th = el("th", { scope: "row", role: "rowheader", title: dimensionHint(key, locale) }, dimLabel(key));
    row.appendChild(th);
    for (const profile of selected) row.appendChild(levelCell(profile, key, t, keyOf.get(profile.id)));
    tbody.appendChild(row);
  }
  table.appendChild(tbody);

  // Release 23: plain-language interpretation above the detail — what
  // differs and possibly why, or an honest statement when the data
  // cannot support one.
  const summary = comparisonSummary(selected);
  const summaryBlock = el("section", { class: "compare-summary", "aria-labelledby": "compare-summary-heading" });
  summaryBlock.appendChild(el("h3", { id: "compare-summary-heading" }, t("compare.summaryHeading")));
  if (summary.perspectives.length > 0) {
    const persList = el("ul", { class: "compare-perspectives" });
    for (const perspective of summary.perspectives) {
      const item = el("li", {});
      let text = "";
      if (perspective.id === "samePlantDifferentRegion") {
        text = t("compare.perspective.samePlant").replace("{plant}", sharedPlantName(perspective, plants));
      } else if (perspective.id === "samePlantDifferentRegionAndClass") {
        text = t("compare.perspective.samePlantAndClass").replace("{plant}", sharedPlantName(perspective, plants));
      } else if (perspective.id === "sameTraditionDifferentPlant") {
        text = t("compare.perspective.sameTraditionPlant").replace("{tradition}", SPIRIT_LABELS[perspective.tradition] || perspective.tradition);
      } else if (perspective.id === "sameTraditionDifferentPlantAndPlace") {
        text = t("compare.perspective.sameTraditionPlantPlace").replace("{tradition}", SPIRIT_LABELS[perspective.tradition] || perspective.tradition);
      } else if (perspective.id === "sameTraditionDifferentMethod") {
        text = t("compare.perspective.sameTraditionMethod").replace("{tradition}", SPIRIT_LABELS[perspective.tradition] || perspective.tradition);
      } else if (perspective.id === "similarFlavoursAcrossTraditions") {
        const moods = perspective.moods.map((m) => (locale ? locale.mood(m) : m)).join(", ");
        text = t("compare.perspective.similarFlavours").replace("{moods}", moods);
      } else if (perspective.id === "unagedVersusWoodRested") {
        const woodName = short(byId.get(perspective.wood) || { title: "" });
        const unagedName = short(byId.get(perspective.unaged) || { title: "" });
        text = t("compare.perspective.woodVsUnaged").replace("{wood}", woodName).replace("{unaged}", unagedName);
      } else if (perspective.id === "differentMaturation") {
        const classes = perspective.classes.map((c) => c).join(" vs ");
        text = t("compare.perspective.differentMaturation").replace("{classes}", classes);
      }
      item.appendChild(el("span", { class: "compare-perspective-chip" }, text));
      persList.appendChild(item);
    }
    summaryBlock.appendChild(persList);
  }
  if (summary.differences.length > 0) {
    const diffLine = el("p", { class: "compare-summary-line" });
    // Pair 30: the summary names the dimensions; the levels themselves are
    // in the meters below, so the sentence no longer repeats every style.
    const parts = summary.differences.map((d) => dimLabel(d.key));
    diffLine.appendChild(document.createTextNode(`${t("compare.summaryDifferences")} ${parts.join(", ")}. ${t("compare.summaryDetailsBelow")}`));
    summaryBlock.appendChild(diffLine);
  } else {
    summaryBlock.appendChild(el("p", { class: "compare-summary-line" }, t("compare.noDiffs")));
  }
  section.appendChild(legend);
  section.appendChild(summaryBlock);

  section.appendChild(el("p", { class: "sensory-note cmp-scale-note" }, t("compare.scaleNote")));
  const scroll = el("div", { class: "comparison-scroll", role: "region", "aria-label": t("compare.tableLabel") });
  scroll.appendChild(table);
  section.appendChild(scroll);

  // Plant/process context (cross-tradition differences shown clearly)
  // Pair 30: one line per style, led by its letter and short name.
  const craft = el("dl", { class: "profile-facts compare-craft" });
  const craftLines = (valueFor) => {
    const dd = el("dd", {});
    const list = el("ul", { class: "compare-craft-list" });
    for (const p of selected) {
      const li = el("li", { dataset: { key: keyOf.get(p.id) } });
      li.appendChild(el("span", { class: "cmp-badge", "aria-hidden": "true" }, keyOf.get(p.id)));
      li.appendChild(el("strong", {}, `${short(p)}: `));
      li.appendChild(document.createTextNode(valueFor(p)));
      list.appendChild(li);
    }
    dd.appendChild(list);
    return dd;
  };
  craft.appendChild(el("dt", {}, ui(locale, "plant")));
  craft.appendChild(craftLines((p) => fieldEs("profile", p.id, "plant", locale) || p.plant || ui(locale, "notDocumented")));
  craft.appendChild(el("dt", {}, ui(locale, "process")));
  craft.appendChild(craftLines((p) => editorialText("profile", p.id, "process", p.process || ui(locale, "notDocumented"), locale).text));
  section.appendChild(craft);

  // Biggest differences
  const diffs = biggestDifferences(selected);
  if (diffs.length > 0) {
    const diffHeading = el("h3", {}, t("compare.biggestDiffs"));
    section.appendChild(diffHeading);
    const diffList = el("ul", { class: "compare-diff-list" });
    for (const diff of diffs) {
      // Pair 30: the dimension, then one short line per style with its
      // letter, meter and level, instead of a sentence of full titles.
      const item = el("li", {});
      item.appendChild(el("strong", { class: "compare-diff-dimension" }, dimLabel(diff.key)));
      const rows = el("ul", { class: "compare-diff-rows" });
      for (const p of selected) {
        const row = el("li", { dataset: { key: keyOf.get(p.id) } });
        row.appendChild(el("span", { class: "cmp-badge", "aria-hidden": "true" }, keyOf.get(p.id)));
        row.appendChild(el("span", { class: "compare-diff-name" }, short(p)));
        row.appendChild(levelMeter(p, diff.key, t));
        row.appendChild(el("span", { class: "cmp-level" }, levelText(p, diff.key, t)));
        rows.appendChild(row);
      }
      item.appendChild(rows);
      diffList.appendChild(item);
    }
    section.appendChild(diffList);
  } else {
    section.appendChild(el("p", { class: "compare-empty" }, t("compare.noDiffs")));
  }

  // Explicit missing-data note
  const missing = missingDimensions(selected);
  if (missing.length > 0) {
    const note = el("p", { class: "editorial-note" },
      ui(locale, "missingData").replace("{list}", missing.map((m) => dimLabel(m.key)).join(", ")));
    section.appendChild(note);
  }

  // Pair 16: the lesson keeps its explanation and results first; changing
  // styles stays available through this clearly labelled secondary control.
  {
    // Open when the reader has just added or removed a style from inside
    // it, so their place and focus are kept.
    const changeBlock = el("details", { class: "compare-change-styles", ...(!revealResults && focusSource === "picker" ? { open: "" } : {}) });
    changeBlock.appendChild(el("summary", {}, t("compare.changeStyles")));
    changeBlock.appendChild(pickerHolder);
    section.appendChild(changeBlock);
  }
  if (!activePreset) section.appendChild(presetsBlock(byId, { locale, title, t, from, place: "after" }));

  container.appendChild(section);
  // Pair 30: focus follows the control the reader used. Completing a
  // comparison, removing from the legend, or filling the last slot (no
  // picker button left to focus) all land on the legend.
  const focusLegend = (scroll) => {
    legend.setAttribute("tabindex", "-1");
    legend.focus({ preventScroll: true });
    if (scroll && typeof legend.scrollIntoView === "function") legend.scrollIntoView({ block: "start", behavior: "instant" });
  };
  if (revealResults) return focusLegend(true);
  if (focusSource === "legend") return focusLegend(false);
  if (focusSource === "picker" && !restoreFocus(pickerHolder, focusProfileId)) return focusLegend(true);
}

/**
 * After a route-driven re-render, put focus back on the picker button for
 * the profile the user just acted on, so keyboard users never lose their
 * place. Falls back to the first enabled picker button.
 */
function restoreFocus(pickerHolder, focusProfileId) {
  // Pair 26: only after the reader acted on a picker button. A fresh visit
  // leaves focus to the app, which lands the page at its heading.
  if (!focusProfileId) return false;
  const button = pickerHolder.querySelector(`[data-profile-id="${focusProfileId}"]`);
  if (button && !button.disabled) {
    button.focus();
    return true;
  }
  const firstEnabled = pickerHolder.querySelector(".compare-pick-button:not([disabled])");
  if (firstEnabled) {
    firstEnabled.focus();
    return true;
  }
  return false;
}
