import { el, clear } from "./dom-utils.js";
import { navigateTo } from "./router.js";
import { ui } from "./presentation.js";
import {
  DIMENSIONS,
  biggestDifferences,
  missingDimensions,
  levelOf,
} from "./compare.js";
import { SPIRIT_LABELS, groupProfilesBySpirit } from "./spirit-labels.js";

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
function pickButton(profile, isSelected, disabled, onPick) {
  const button = el("button", {
    type: "button",
    class: "compare-pick-button",
    dataset: { profileId: profile.id },
    "aria-pressed": isSelected ? "true" : "false",
    disabled: disabled ? "true" : null,
  },
    `${profile.title} — ${SPIRIT_LABELS[profile.spirit] || profile.spirit}`);
  button.addEventListener("click", () => onPick(profile.id));
  return button;
}

/**
 * Searchable, grouped profile picker. Profiles group by spirit in logical
 * order, alphabetically within each group; a filter box narrows the list;
 * selected profiles always stay visible (so they can be deselected) even
 * when they fall outside the current filter.
 */
function slotSelector(profiles, selectedIds, onPick, { locale = null } = {}) {
  const t = (key) => (locale ? locale.t(key) : key);
  const compare = locale ? (a, b) => locale.compare(a, b) : null;
  const holder = el("div", { class: "compare-picker-search" });

  const searchInput = el("input", {
    type: "search",
    class: "search-input",
    id: "compare-search",
    placeholder: t("compare.searchPlaceholder"),
    "aria-label": t("compare.searchPlaceholder"),
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
          normalize([p.title, p.spirit, SPIRIT_LABELS[p.spirit] || ""].join(" ")).includes(q));
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
      item.appendChild(pickButton(profile, isSelected, disabled, onPick));
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
export function renderCompare(container, { profiles, compareIds, onSelectionChange, focusProfileId = null, locale = null }) {
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
  section.appendChild(el("h1", { id: "compare-heading" }, t("compare.heading")));
  section.appendChild(el("p", { class: "view-intro" }, t("compare.intro")));

  // Picker
  const status = el("p", { class: "compare-status", role: "status", "aria-live": "polite" });
  section.appendChild(status);
  const announce = (message) => {
    clear(status);
    status.appendChild(document.createTextNode(message));
  };

  const pickerHolder = el("div", { class: "compare-picker" });
  const pick = (profileId) => {
    const removing = selectedIds.includes(profileId);
    const next = removing
      ? selectedIds.filter((id) => id !== profileId)
      : [...selectedIds, profileId].slice(0, MAX_SLOTS);
    const name = byId.get(profileId)?.title || profileId;
    announce(removing ? `Removed ${name}. ${next.length} profile${next.length === 1 ? "" : "s"} selected.` : `Added ${name}. ${next.length} profile${next.length === 1 ? "" : "s"} selected.`);
    if (onSelectionChange) onSelectionChange(next);
  };
  const selections = el("section", { class: "comparison-selections", "aria-label": ui(locale, "choices") });
  selections.appendChild(el("p", { class: "sensory-note" }, ui(locale, "slots")));
  const selectionList = el("div", { class: "selection-list" });
  for (const profile of selected) {
    const chip = el("div", { class: "selection-chip" });
    chip.appendChild(el("span", {}, profile.title));
    const remove = el("button", { type: "button", class: "selection-remove", "aria-label": ui(locale, "remove") + ": " + profile.title }, ui(locale, "remove") + " ×");
    remove.addEventListener("click", () => pick(profile.id));
    chip.appendChild(remove);
    selectionList.appendChild(chip);
  }
  selections.appendChild(selectionList);
  section.appendChild(selections);
  pickerHolder.appendChild(slotSelector(profiles, selectedIds, pick, { locale }));
  section.appendChild(pickerHolder);

  if (selected.length === 0) {
    announce("No profiles selected.");
    section.appendChild(el("p", { class: "compare-empty" }, t("compare.pick")));
    container.appendChild(section);
    restoreFocus(pickerHolder, focusProfileId);
    return;
  }

  if (selected.length === 1) {
    announce(`1 profile selected: ${selected[0].title}.`);
    section.appendChild(el("p", { class: "compare-empty" }, t("compare.oneMore")));
    container.appendChild(section);
    restoreFocus(pickerHolder, focusProfileId);
    return;
  }

  announce(`Comparing ${selected.length} profiles: ${selected.map((p) => p.title).join(", ")}.`);

  // Sensory table
  const table = el("table", { class: "compare-table" });
  const thead = el("thead", {});
  const headRow = el("tr", {});
  headRow.appendChild(el("th", { scope: "col" }, ui(locale, "dimension")));
  for (const profile of selected) {
    const th = el("th", { scope: "col" }, profile.title);
    const removeButton = el("button", {
      type: "button",
      class: "compare-remove-button",
      dataset: { profileId: profile.id },
      "aria-label": `${t("compare.removeLabel")}: ${profile.title}`,
    }, t("compare.removeLabel"));
    removeButton.addEventListener("click", () => pick(profile.id));
    th.appendChild(removeButton);
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el("tbody", {});
  for (const { key, label, hint } of DIMENSIONS) {
    const row = el("tr", {});
    const th = el("th", { scope: "row", title: hint }, label);
    row.appendChild(th);
    for (const profile of selected) row.appendChild(levelCell(profile, key, t));
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  const scrollHint = el("p", { id: "compare-scroll-hint", class: "sensory-note compare-scroll-hint" }, ui(locale, "scroll"));
  section.appendChild(scrollHint);
  const scroll = el("div", { class: "comparison-scroll", tabindex: "0", role: "region", "aria-label": ui(locale, "choices"), "aria-describedby": "compare-scroll-hint" });
  scroll.appendChild(table);
  section.appendChild(scroll);

  // Plant/process context (cross-tradition differences shown clearly)
  const craft = el("dl", { class: "profile-facts compare-craft" });
  craft.appendChild(el("dt", {}, "Agave"));
  craft.appendChild(el("dd", {}, selected.map((p) => `${p.title}: ${p.plant || "not documented"}`).join(" · ")));
  craft.appendChild(el("dt", {}, "Process"));
  craft.appendChild(el("dd", {}, selected.map((p) => `${p.title}: ${p.process || "not documented"}`).join(" · ")));
  section.appendChild(craft);

  // Biggest differences
  const diffs = biggestDifferences(selected);
  if (diffs.length > 0) {
    const diffHeading = el("h3", {}, t("compare.biggestDiffs"));
    section.appendChild(diffHeading);
    const diffList = el("ul", { class: "compare-diff-list" });
    for (const diff of diffs) {
      const item = el("li", {});
      item.appendChild(el("strong", {}, `${diff.label}: `));
      item.appendChild(document.createTextNode(
        selected.map((p, i) => `${p.title} — ${t(`level.${diff.levels[i]}`) || t("compare.notDocumented")}`).join("; ")
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
      `Not compared because the data is not documented: ${missing.map((m) => m.label).join(", ")}. Unknown means not documented, never zero.`);
    section.appendChild(note);
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
