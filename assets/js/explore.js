import { el, clear } from "./dom-utils.js";
import { renderMap, shadeCovered, STATE_NAMES } from "./map.js";
import { navigateTo } from "./router.js";

const EMPTY_MESSAGE = "No profiles added here yet";

function profilesForState(profiles, stateId) {
  return profiles.filter((profile) => profile.stateId === stateId);
}

function profileList(profiles) {
  const list = el("ul", { class: "profile-list" });
  for (const profile of profiles) {
    const item = el("li");
    const link = el("a", { href: `#/profile/${encodeURIComponent(profile.id)}`, class: "profile-link" });
    link.appendChild(el("span", { class: "profile-link-title" }, profile.title));
    link.appendChild(el("span", { class: "profile-link-spirit" }, profile.spirit === "mezcal" ? "Mezcal" : "Tequila"));
    item.appendChild(link);
    list.appendChild(item);
  }
  return list;
}

/**
 * Explore view: SVG map + state list on the left, covered profiles for the
 * selected state on the right.
 */
export async function renderExplore(container, { profiles, selectedStateId, mapUrl }) {
  clear(container);
  const section = el("section", { class: "explore-view", "aria-labelledby": "explore-heading" });
  section.appendChild(el("h2", { id: "explore-heading" }, "Explore by state"));
  const intro = el("p", { class: "view-intro" },
    "Shaded states have style profiles in this app; the full map of México is shown for context. Shading shows app coverage only — it is not a legal production boundary map. Only states with profiles can be selected.");
  section.appendChild(intro);

  const mapHolder = el("div", { class: "map-holder" });
  section.appendChild(mapHolder);

  const results = el("div", { class: "state-results", "aria-live": "polite" });
  section.appendChild(results);

  container.appendChild(section);

  const coveredStateIds = [...new Set(profiles.map((profile) => profile.stateId))];

  const renderResults = (stateId) => {
    clear(results);
    if (!stateId) {
      results.appendChild(el("p", { class: "state-results-hint" },
        "Select one of the shaded states with profiles to see their style profiles."));
      return;
    }
    const name = STATE_NAMES[stateId] || stateId;
    results.appendChild(el("h3", { class: "state-results-title" }, name));
    const covered = profilesForState(profiles, stateId);
    if (covered.length === 0) {
      results.appendChild(el("p", { class: "empty-state" }, EMPTY_MESSAGE));
      return;
    }
    results.appendChild(profileList(covered));
  };

  let mapApi = null;
  try {
    mapApi = await renderMap(mapHolder, mapUrl, {
      selectedStateId: selectedStateId || null,
      coveredStateIds,
      onSelect: (stateId) => {
        navigateTo({ name: "state", params: { stateId } });
      },
    });
    shadeCovered(mapHolder, coveredStateIds);
  } catch (error) {
    clear(mapHolder);
    mapHolder.appendChild(el("p", { class: "error-state", role: "alert" },
      "The map could not be loaded. You can still use the state list below."));
    // Fallback: render the list standalone so the view stays usable.
    const list = el("ul", { class: "state-list state-list-fallback", "aria-label": "States with profiles" });
    for (const code of coveredStateIds) {
      const name = STATE_NAMES[code] || code;
      const item = el("li");
      const button = el("button", { type: "button", class: "state-list-button is-covered", dataset: { state: code } }, name);
      button.addEventListener("click", () => navigateTo({ name: "state", params: { stateId: code } }));
      item.appendChild(button);
      list.appendChild(item);
    }
    mapHolder.appendChild(list);
  }

  renderResults(selectedStateId || null);

  return {
    setState(stateId) {
      if (mapApi) mapApi.select(stateId || "");
      renderResults(stateId || null);
    },
  };
}
