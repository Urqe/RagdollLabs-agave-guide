import { el, clear } from "./dom-utils.js";
import { renderMap, shadeCovered, STATE_NAMES } from "./map.js";
import { navigateTo } from "./router.js";
import { searchProfiles } from "./search.js";
import { SPIRIT_LABELS, SPIRIT_GROUP_ORDER } from "./spirit-labels.js";

const EMPTY_MESSAGE = "No profiles added here yet";

/**
 * Group profiles by spirit in a logical order (tequila together, raicilla
 * together, …) so related styles read as neighbors instead of interleaving
 * by encounter order. Stable within each group by title.
 */
export function groupProfilesBySpirit(profiles, compare) {
  const cmp = compare || ((a, b) => a.localeCompare(b));
  const rank = (spirit) => {
    const index = SPIRIT_GROUP_ORDER.indexOf(spirit);
    return index === -1 ? SPIRIT_GROUP_ORDER.length : index;
  };
  return [...profiles].sort((a, b) =>
    rank(a.spirit) - rank(b.spirit) ||
    cmp(a.title, b.title)
  );
}

function profilesForState(profiles, stateId) {
  return profiles.filter((profile) => profile.stateId === stateId);
}

function profileList(profiles, stateId = null, locale = null) {
  const compare = locale ? (a, b) => locale.compare(a, b) : null;
  const grouped = groupProfilesBySpirit(profiles, compare);
  const list = el("ul", { class: "profile-list" });
  let lastSpirit = null;
  for (const profile of grouped) {
    const item = el("li");
    if (profile.spirit !== lastSpirit) {
      item.appendChild(el("span", { class: "profile-group-label" },
        SPIRIT_LABELS[profile.spirit] || profile.spirit));
      lastSpirit = profile.spirit;
    }
    const suffix = stateId ? `?from=${encodeURIComponent(stateId)}` : "";
    const link = el("a", { href: `#/profile/${encodeURIComponent(profile.id)}${suffix}`, class: "profile-link" });
    link.appendChild(el("span", { class: "profile-link-title" }, profile.title));
    link.appendChild(el("span", { class: "profile-link-spirit" }, SPIRIT_LABELS[profile.spirit] || profile.spirit));
    item.appendChild(link);
    list.appendChild(item);
  }
  return list;
}

/**
 * Explore view: SVG map + state list on the left, covered profiles for the
 * selected state on the right.
 */
export async function renderExplore(container, { profiles, bottles, selectedStateId, locale, mapUrl }) {
  clear(container);
  const section = el("section", { class: "explore-view", "aria-labelledby": "explore-heading" });
  const t = (key) => (locale ? locale.t(key) : key);
  section.appendChild(el("h2", { id: "explore-heading" }, t("explore.heading")));
  const intro = el("p", { class: "view-intro" }, t("explore.intro"));
  section.appendChild(intro);

  const searchHolder = el("div", { class: "search-holder" });
  section.appendChild(searchHolder);

  const mapHolder = el("div", { class: "map-holder" });
  section.appendChild(mapHolder);

  const results = el("div", { class: "state-results", "aria-live": "polite" });
  section.appendChild(results);

  container.appendChild(section);

  const coveredStateIds = [...new Set(profiles.map((profile) => profile.stateId))];

  const renderResults = (stateId) => {
    clear(results);
    if (!stateId) {
      results.appendChild(el("p", { class: "state-results-hint" }, t("explore.hint")));
      return;
    }
    const name = STATE_NAMES[stateId] || stateId;
    results.appendChild(el("h3", { class: "state-results-title" }, name));
    const covered = profilesForState(profiles, stateId);
    if (covered.length === 0) {
      results.appendChild(el("p", { class: "empty-state" }, t("explore.empty")));
      return;
    }
    results.appendChild(profileList(covered, stateId, locale));
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

  // Basic search over spirits, plants, places, producers, brands and bottles.
  const searchInput = el("input", {
    type: "search",
    class: "search-input",
    id: "profile-search",
    placeholder: t("explore.searchPlaceholder"),
    "aria-label": "Search profiles",
  });
  const searchResults = el("div", { class: "search-results", "aria-live": "polite" });
  const searchForm = el("form", { class: "search-form", role: "search" });
  searchForm.addEventListener("submit", (event) => event.preventDefault());
  searchForm.appendChild(searchInput);
  searchHolder.appendChild(searchForm);
  searchHolder.appendChild(searchResults);

  const renderSearch = () => {
    clear(searchResults);
    const query = searchInput.value;
    if (!query || query.trim().length < 2) return;
    const matches = searchProfiles({ profiles, bottles: bottles || [], query });
    if (matches.length === 0) {
      searchResults.appendChild(el("p", { class: "search-empty" },
        `${t("explore.searchEmpty")} “${query}”.`));
      return;
    }
    const list = el("ul", { class: "search-result-list" });
    for (const { profile, reason } of matches) {
      const item = el("li");
      const link = el("a", {
        href: `#/profile/${encodeURIComponent(profile.id)}`,
        class: "search-result-link",
      });
      link.appendChild(el("span", { class: "profile-link-title" }, profile.title));
      link.appendChild(el("span", { class: "search-result-reason" }, reason));
      item.appendChild(link);
      list.appendChild(item);
    }
    searchResults.appendChild(list);
  };
  searchInput.addEventListener("input", renderSearch);

  renderResults(selectedStateId || null);

  return {
    setState(stateId) {
      if (mapApi) mapApi.select(stateId || "");
      renderResults(stateId || null);
    },
  };
}
