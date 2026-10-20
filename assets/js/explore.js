import { el, clear } from "./dom-utils.js";
import { renderMap, shadeCovered, STATE_NAMES } from "./map.js";
import { navigateTo } from "./router.js";
import { searchProfiles } from "./search.js";
import { ui } from "./presentation.js";
import { flavorMoods } from "./compare.js";
import { SPIRIT_LABELS, groupProfilesBySpirit } from "./spirit-labels.js";

const EMPTY_MESSAGE = "No profiles added here yet";

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
    link.appendChild(el("span", { class: "discovery-place" }, profile.stateName));
    link.appendChild(el("span", { class: "discovery-notes" }, (profile.tasteNotes || []).slice(0, 3).join(" · ")));
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
  section.appendChild(el("h1", { id: "explore-heading" }, ui(locale, "browse")));
  const intro = el("p", { class: "view-intro" }, ui(locale, "browseIntro"));
  section.appendChild(intro);

  const searchHolder = el("div", { class: "search-holder" });
  section.appendChild(searchHolder);

  const mapHolder = el("div", { class: "map-holder" });
  const mapDetails = el("details", { class: "place-disclosure", ...(selectedStateId ? { open: "" } : {}) });
  mapDetails.appendChild(el("summary", {}, ui(locale, "map")));
  mapDetails.appendChild(el("p", { class: "view-intro" }, ui(locale, "mapHint")));
  mapDetails.appendChild(mapHolder);

  const results = el("div", { class: "state-results", "aria-live": "polite" });
  const controls = el("div", { class: "discovery-controls" });
  const spirit = el("select", { id: "spirit-filter" });
  spirit.appendChild(el("option", { value: "" }, ui(locale, "allTraditions")));
  for (const id of new Set(groupProfilesBySpirit(profiles).map(p => p.spirit))) {
    spirit.appendChild(el("option", { value: id }, SPIRIT_LABELS[id] || id));
  }
  const mood = el("select", { id: "mood-filter" });
  mood.appendChild(el("option", { value: "" }, ui(locale, "allFlavours")));
  for (const name of new Set(profiles.flatMap(flavorMoods))) {
    mood.appendChild(el("option", { value: name }, locale ? locale.mood(name) : name));
  }
  for (const [key, input] of [["tradition", spirit], ["flavour", mood]]) {
    const field = el("div", { class: "filter-field" });
    field.appendChild(el("label", { for: input.id }, ui(locale, key)));
    field.appendChild(input);
    controls.appendChild(field);
  }
  const reset = el("button", { type: "button", class: "secondary-button" }, ui(locale, "reset"));
  controls.appendChild(reset);
  section.append(controls, mapDetails, results);
  let currentStateId = selectedStateId || null;

  container.appendChild(section);

  const coveredStateIds = [...new Set(profiles.map((profile) => profile.stateId))];

  const renderResults = (stateId) => {
    clear(results);
    const name = stateId ? (STATE_NAMES[stateId] || stateId) : ui(locale, "results");
    results.appendChild(el("h2", { class: "state-results-title" }, name));
    const covered = (stateId ? profilesForState(profiles, stateId) : profiles)
      .filter(p => !spirit.value || p.spirit === spirit.value)
      .filter(p => !mood.value || flavorMoods(p).includes(mood.value));
    if (covered.length === 0) {
      results.appendChild(el("p", { class: "empty-state" }, stateId && !profilesForState(profiles, stateId).length ? t("explore.empty") : ui(locale, "noMatches")));
      return;
    }
    results.appendChild(profileList(covered, stateId, locale));
  };

  for (const input of [spirit, mood]) input.addEventListener("change", () => renderResults(currentStateId));
  reset.addEventListener("click", () => {
    spirit.value = "";
    mood.value = "";
    if (currentStateId) navigateTo({ name: "explore" });
    else renderResults(null);
  });
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
    "aria-label": ui(locale, "search"),
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
      currentStateId = stateId || null;
      if (mapApi) mapApi.select(stateId || "");
      renderResults(stateId || null);
    },
  };
}
