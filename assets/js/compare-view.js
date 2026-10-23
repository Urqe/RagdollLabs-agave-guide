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

function levelCell(profile, dimKey, t) {
  const level = levelOf(profile, dimKey);
  if (level === null || level === undefined) {
    return el("td", { class: "compare-unknown" }, t("compare.notDocumented"));
  }
  return el("td", {}, t(`level.${level}`) || level);
}

/**
 * Compare view: pick up to three profiles, see a side-by-side editorial
 * sensory table, plant/process context, biggest differences and explicit
 * missing-data notes. Selections live in the route (#/compare/a,b,c) so
 * they survive reload, sharing and Back/Forward.
 */
export function renderCompare(container, { profiles, compareIds, onSelectionChange, focusProfileId = null, keepPickerQuery = "", locale = null, from = null }) {
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
  // Pair 9: a comparison opened from a lesson links back to it, above the
  // heading so it reads as a return path, mirroring the profile back link.
  if (from && from.startsWith("start:")) {
    const lessonId = from.slice("start:".length);
    section.appendChild(el("a", { href: `#/start/${encodeURIComponent(lessonId)}`, class: "back-link" },
      t("compare.backToLesson")));
  }
  section.appendChild(el("h1", { id: "compare-heading" }, t("compare.heading")));
  section.appendChild(el("p", { class: "view-intro" }, t("compare.intro")));

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
  const pick = (profileId, pickerQuery) => {
    const removing = selectedIds.includes(profileId);
    const next = removing
      ? selectedIds.filter((id) => id !== profileId)
      : [...selectedIds, profileId].slice(0, MAX_SLOTS);
    const profile = byId.get(profileId);
    const name = profile ? title(profile) : profileId;
    announce(removing
      ? `${ui(locale, "removedFrom").replace("{name}", name)} ${total(next.length)}.`
      : `${ui(locale, "addedTo").replace("{name}", name)} ${total(next.length)}.`);
    if (onSelectionChange) onSelectionChange(next, pickerQuery ?? currentQuery());
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
  section.appendChild(selections);
  pickerHolder.appendChild(slotSelector(profiles, selectedIds, pick, { locale, initialQuery: keepPickerQuery || "", titleFn: title }));
  if (!fromLessonView || selected.length < 2) {
    section.appendChild(pickerHolder);
  }

  if (selected.length === 0) {
    announce(ui(locale, "noneSelected"));
    section.appendChild(el("p", { class: "compare-empty" }, t("compare.pick")));
    container.appendChild(section);
    restoreFocus(pickerHolder, focusProfileId);
    return;
  }

  if (selected.length === 1) {
    announce(`${ui(locale, "oneSelected")}: ${title(selected[0])}.`);
    section.appendChild(el("p", { class: "compare-empty" }, t("compare.oneMore")));
    container.appendChild(section);
    restoreFocus(pickerHolder, focusProfileId);
    return;
  }

  announce(`${ui(locale, "comparing")} ${total(selected.length)}: ${selected.map((p) => title(p)).join(", ")}.`);

  // Sensory table
  const table = el("table", { class: "compare-table" });
  const thead = el("thead", {});
  const headRow = el("tr", {});
  headRow.appendChild(el("th", { scope: "col" }, ui(locale, "dimension")));
  for (const profile of selected) {
    const th = el("th", { scope: "col" }, title(profile));
    const removeButton = el("button", {
      type: "button",
      class: "compare-remove-button",
      dataset: { profileId: profile.id },
      "aria-label": `${t("compare.removeLabel")}: ${title(profile)}`,
    }, t("compare.removeLabel"));
    removeButton.addEventListener("click", () => pick(profile.id));
    th.appendChild(removeButton);
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el("tbody", {});
  for (const { key } of DIMENSIONS) {
    const row = el("tr", {});
    const th = el("th", { scope: "row", title: dimensionHint(key, locale) }, dimLabel(key));
    row.appendChild(th);
    for (const profile of selected) row.appendChild(levelCell(profile, key, t));
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
        text = t("compare.perspective.samePlant").replace("{plant}", (perspective.plantProfileId ? fieldEs("profile", perspective.plantProfileId, "plant", locale) : null) || perspective.plant);
      } else if (perspective.id === "samePlantDifferentRegionAndClass") {
        text = t("compare.perspective.samePlantAndClass").replace("{plant}", (perspective.plantProfileId ? fieldEs("profile", perspective.plantProfileId, "plant", locale) : null) || perspective.plant);
      } else if (perspective.id === "sameTraditionDifferentPlant") {
        text = t("compare.perspective.sameTraditionPlant").replace("{tradition}", SPIRIT_LABELS[perspective.tradition] || perspective.tradition);
      } else if (perspective.id === "sameTraditionDifferentMethod") {
        text = t("compare.perspective.sameTraditionMethod").replace("{tradition}", SPIRIT_LABELS[perspective.tradition] || perspective.tradition);
      } else if (perspective.id === "similarFlavoursAcrossTraditions") {
        const moods = perspective.moods.map((m) => (locale ? locale.mood(m) : m)).join(", ");
        text = t("compare.perspective.similarFlavours").replace("{moods}", moods);
      } else if (perspective.id === "unagedVersusWoodRested") {
        const woodName = title(byId.get(perspective.wood) || { title: "" });
        const unagedName = title(byId.get(perspective.unaged) || { title: "" });
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
    const parts = summary.differences.map((d) => {
      const labels = d.levels.map((l, i) => `${title(selected[i])}: ${t(`level.${l}`) || t("compare.notDocumented")}`);
      return `${dimLabel(d.key)} (${labels.join(" vs ")})`;
    });
    diffLine.appendChild(document.createTextNode(t("compare.summaryDifferences") + " " + parts.join("; ") + "."));
    summaryBlock.appendChild(diffLine);
  } else {
    summaryBlock.appendChild(el("p", { class: "compare-summary-line" }, t("compare.noDiffs")));
  }
  section.appendChild(summaryBlock);

  const scrollHint = el("p", { id: "compare-scroll-hint", class: "sensory-note compare-scroll-hint" }, ui(locale, "scroll"));
  section.appendChild(scrollHint);
  const scroll = el("div", { class: "comparison-scroll", tabindex: "0", role: "region", "aria-label": ui(locale, "choices"), "aria-describedby": "compare-scroll-hint" });
  scroll.appendChild(table);
  section.appendChild(scroll);

  // Plant/process context (cross-tradition differences shown clearly)
  const craft = el("dl", { class: "profile-facts compare-craft" });
  craft.appendChild(el("dt", {}, ui(locale, "plant")));
  craft.appendChild(el("dd", {}, selected.map((p) => `${title(p)}: ${fieldEs("profile", p.id, "plant", locale) || p.plant || ui(locale, "notDocumented")}`).join(" · ")));
  craft.appendChild(el("dt", {}, ui(locale, "process")));
  craft.appendChild(el("dd", {}, selected.map((p) => `${title(p)}: ${editorialText("profile", p.id, "process", p.process || ui(locale, "notDocumented"), locale).text}`).join(" · ")));
  section.appendChild(craft);

  // Biggest differences
  const diffs = biggestDifferences(selected);
  if (diffs.length > 0) {
    const diffHeading = el("h3", {}, t("compare.biggestDiffs"));
    section.appendChild(diffHeading);
    const diffList = el("ul", { class: "compare-diff-list" });
    for (const diff of diffs) {
      const item = el("li", {});
      item.appendChild(el("strong", {}, `${dimLabel(diff.key)}: `));
      item.appendChild(document.createTextNode(
        selected.map((p, i) => `${title(p)} — ${t(`level.${diff.levels[i]}`) || t("compare.notDocumented")}`).join("; ")
      ));
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
  if (fromLessonView) {
    const changeBlock = el("details", { class: "compare-change-styles" });
    changeBlock.appendChild(el("summary", {}, t("compare.changeStyles")));
    changeBlock.appendChild(pickerHolder);
    section.appendChild(changeBlock);
  }

  container.appendChild(section);
  restoreFocus(pickerHolder, focusProfileId);
}

/**
 * After a route-driven re-render, put focus back on the picker button for
 * the profile the user just acted on, so keyboard users never lose their
 * place. Falls back to the first enabled picker button.
 */
function restoreFocus(pickerHolder, focusProfileId) {
  if (focusProfileId) {
    const button = pickerHolder.querySelector(`[data-profile-id="${focusProfileId}"]`);
    if (button && !button.disabled) {
      button.focus();
      return;
    }
  }
  const firstEnabled = pickerHolder.querySelector(".compare-pick-button:not([disabled])");
  if (firstEnabled) firstEnabled.focus();
}
