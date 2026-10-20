import { el, clear } from "./dom-utils.js";
import { navigateTo } from "./router.js";
import {
  DIMENSIONS,
  biggestDifferences,
  missingDimensions,
  levelOf,
} from "./compare.js";

const MAX_SLOTS = 3;

const SPIRIT_LABELS = {
  tequila: "Tequila",
  mezcal: "Mezcal",
  bacanora: "Bacanora",
  raicilla: "Raicilla",
};

const LEVEL_LABELS = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
};

function parseIds(raw) {
  return (raw || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX_SLOTS);
}

function slotSelector(profiles, selectedIds, onPick) {
  const list = el("ul", { class: "compare-picker-list" });
  for (const profile of profiles) {
    const item = el("li");
    const isSelected = selectedIds.includes(profile.id);
    const button = el("button", {
      type: "button",
      class: "compare-pick-button",
      dataset: { profileId: profile.id },
      "aria-pressed": isSelected ? "true" : "false",
      disabled: isSelected || (selectedIds.length >= MAX_SLOTS && !isSelected) ? "true" : null,
    },
      `${profile.title} — ${SPIRIT_LABELS[profile.spirit] || profile.spirit}`);
    button.addEventListener("click", () => onPick(profile.id));
    item.appendChild(button);
    list.appendChild(item);
  }
  return list;
}

function levelCell(profile, dimKey) {
  const level = levelOf(profile, dimKey);
  if (level === null || level === undefined) {
    return el("td", { class: "compare-unknown" }, "Not documented");
  }
  return el("td", {}, LEVEL_LABELS[level] || level);
}

/**
 * Compare view: pick up to three profiles, see a side-by-side editorial
 * sensory table, plant/process context, biggest differences and explicit
 * missing-data notes. Selections live in the route (#/compare/a,b,c) so
 * they survive reload, sharing and Back/Forward.
 */
export function renderCompare(container, { profiles, compareIds, onSelectionChange }) {
  clear(container);
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const selectedIds = parseIds(compareIds);
  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean);

  const section = el("section", { class: "compare-view", "aria-labelledby": "compare-heading" });
  section.appendChild(el("h2", { id: "compare-heading" }, "Compare styles"));
  section.appendChild(el("p", { class: "view-intro" },
    "Compare two or three editorial style profiles side by side. Sensory levels are editorial impressions — perceived sweetness is not measured sugar, smoke is not peat content, and ABV stays a factual property. Choosing an example bottle never turns these profile levels into bottle measurements."));

  // Picker
  const pickerHolder = el("div", { class: "compare-picker" });
  const pick = (profileId) => {
    const next = selectedIds.includes(profileId)
      ? selectedIds.filter((id) => id !== profileId)
      : [...selectedIds, profileId].slice(0, MAX_SLOTS);
    if (onSelectionChange) onSelectionChange(next);
  };
  pickerHolder.appendChild(slotSelector(profiles, selectedIds, pick));
  section.appendChild(pickerHolder);

  if (selected.length === 0) {
    section.appendChild(el("p", { class: "compare-empty" }, "Pick at least two profiles to compare."));
    container.appendChild(section);
    return;
  }

  if (selected.length === 1) {
    section.appendChild(el("p", { class: "compare-empty" }, "One more pick starts the comparison."));
    container.appendChild(section);
    return;
  }

  // Sensory table
  const table = el("table", { class: "compare-table" });
  const thead = el("thead", {});
  const headRow = el("tr", {});
  headRow.appendChild(el("th", { scope: "col" }, "Dimension"));
  for (const profile of selected) {
    const th = el("th", { scope: "col" }, profile.title);
    const removeButton = el("button", {
      type: "button",
      class: "compare-remove-button",
      dataset: { profileId: profile.id },
      "aria-label": `Remove ${profile.title} from comparison`,
    }, "Remove");
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
    for (const profile of selected) row.appendChild(levelCell(profile, key));
    tbody.appendChild(row);
  }
  table.appendChild(tbody);
  section.appendChild(table);

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
    const diffHeading = el("h3", {}, "Biggest differences");
    section.appendChild(diffHeading);
    const diffList = el("ul", { class: "compare-diff-list" });
    for (const diff of diffs) {
      const item = el("li", {});
      item.appendChild(el("strong", {}, `${diff.label}: `));
      item.appendChild(document.createTextNode(
        selected.map((p, i) => `${p.title} — ${LEVEL_LABELS[diff.levels[i]] || "not documented"}`).join("; ")
      ));
      diffList.appendChild(item);
    }
    section.appendChild(diffList);
  } else {
    section.appendChild(el("p", { class: "compare-empty" }, "No documented differences large enough to highlight."));
  }

  // Explicit missing-data note
  const missing = missingDimensions(selected);
  if (missing.length > 0) {
    const note = el("p", { class: "editorial-note" },
      `Not compared because the data is not documented: ${missing.map((m) => m.label).join(", ")}. Unknown means not documented, never zero.`);
    section.appendChild(note);
  }

  container.appendChild(section);
  return {
    /** Restore focus to the picker for a given profile after a re-render. */
    focusProfile(profileId) {
      const button = pickerHolder.querySelector(`[data-profile-id="${profileId}"]`);
      if (button) button.focus();
    },
  };
}
