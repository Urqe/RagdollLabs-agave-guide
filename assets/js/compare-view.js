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
export function renderCompare(container, { profiles, compareIds, onSelectionChange, focusProfileId = null }) {
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
  section.appendChild(el("h2", { id: "compare-heading" }, "Compare styles"));
  section.appendChild(el("p", { class: "view-intro" },
    "Compare two or three editorial style profiles side by side. Sensory levels are editorial impressions — perceived sweetness is not measured sugar, smoke is not peat content, and ABV stays a factual property. Choosing an example bottle never turns these profile levels into bottle measurements."));

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
  pickerHolder.appendChild(slotSelector(profiles, selectedIds, pick));
  section.appendChild(pickerHolder);

  if (selected.length === 0) {
    announce("No profiles selected.");
    section.appendChild(el("p", { class: "compare-empty" }, "Pick at least two profiles to compare."));
    container.appendChild(section);
    restoreFocus(pickerHolder, focusProfileId);
    return;
  }

  if (selected.length === 1) {
    announce(`1 profile selected: ${selected[0].title}.`);
    section.appendChild(el("p", { class: "compare-empty" }, "One more pick starts the comparison."));
    container.appendChild(section);
    restoreFocus(pickerHolder, focusProfileId);
    return;
  }

  announce(`Comparing ${selected.length} profiles: ${selected.map((p) => p.title).join(", ")}.`);

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
