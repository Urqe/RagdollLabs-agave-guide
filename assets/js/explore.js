import { el, clear } from "./dom-utils.js";
import { renderMap, shadeCovered, STATE_NAMES } from "./map.js";
import { navigateTo } from "./router.js";
import { searchProfiles } from "./search.js";
import { ui } from "./presentation.js";
import { flavorMoods } from "./compare.js";
import { SPIRIT_LABELS, groupProfilesBySpirit } from "./spirit-labels.js";
import { captureView } from "./view-memory.js";
import { tasteNote } from "./taste-notes.js";

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
    link.appendChild(el("span", { class: "discovery-notes" },
      (profile.tasteNotes || []).slice(0, 3).map((n) => tasteNote(n, locale)).join(" · ")));
    item.appendChild(link);
    list.appendChild(item);
  }
  return list;
}

/**
 * Explore view: one combined discovery surface. Search, tradition and
 * flavour-mood filters all narrow the same results collection, with a
 * visible result count; the map stays available as a place disclosure.
 */
export async function renderExplore(container, { profiles, bottles, selectedStateId, locale, mapUrl, restore = null }) {
  clear(container);
  const section = el("section", { class: "explore-view", "aria-labelledby": "explore-heading" });
  const t = (key) => (locale ? locale.t(key) : key);
  section.appendChild(el("h1", { id: "explore-heading" }, ui(locale, "browse")));
  const intro = el("p", { class: "view-intro" }, ui(locale, "browseIntro"));
  section.appendChild(intro);

  const searchInput = el("input", {
    type: "search",
    class: "search-input",
    id: "profile-search",
    placeholder: t("explore.searchPlaceholder"),
    "aria-label": ui(locale, "search"),
  });
  if (restore && restore.query) searchInput.value = restore.query;

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
  if (restore && restore.spirit) spirit.value = restore.spirit;
  if (restore && restore.mood) mood.value = restore.mood;
  for (const [key, input, labelText] of [["search", searchInput, ui(locale, "search")], ["tradition", spirit, ui(locale, "tradition")], ["flavour", mood, ui(locale, "flavour")]]) {
    const field = el("div", { class: "filter-field" });
    field.appendChild(el("label", { for: input.id }, labelText));
    field.appendChild(input);
    controls.appendChild(field);
  }
  const reset = el("button", { type: "button", class: "secondary-button" }, ui(locale, "reset"));
  controls.appendChild(reset);
  section.append(controls, mapDetails, results);
  let currentStateId = selectedStateId || null;

  container.appendChild(section);

  const coveredStateIds = [...new Set(profiles.map((profile) => profile.stateId))];

  // One results collection: place (state) + search + tradition + mood.
  const renderResults = (stateId) => {
    clear(results);
    const name = stateId ? (STATE_NAMES[stateId] || stateId) : ui(locale, "results");
    results.appendChild(el("h2", { class: "state-results-title" }, name));
    const base = stateId ? profilesForState(profiles, stateId) : profiles;
    const query = searchInput.value.trim();
    const searched = query.length >= 2
      ? searchProfiles({ profiles: base, bottles: bottles || [], query }).map((r) => r.profile)
      : base;
    const covered = searched
      .filter(p => !spirit.value || p.spirit === spirit.value)
      .filter(p => !mood.value || flavorMoods(p).includes(mood.value));
    const count = el("p", { class: "results-count" },
      `${covered.length} ${covered.length === 1 ? ui(locale, "profile") : ui(locale, "profiles")}`);
    results.appendChild(count);
    if (covered.length === 0) {
      results.appendChild(el("p", { class: "empty-state" }, stateId && base.length === 0 ? t("explore.empty") : ui(locale, "noMatches")));
      return;
    }
    results.appendChild(profileList(covered, stateId, locale));
  };

  searchInput.addEventListener("input", () => renderResults(currentStateId));
  for (const input of [spirit, mood]) {
    input.addEventListener("change", () => renderResults(currentStateId));
  }
  reset.addEventListener("click", () => {
    searchInput.value = "";
    spirit.value = "";
    mood.value = "";
    if (currentStateId) navigateTo({ name: "explore" });
    else renderResults(null);
  });
  // Controls and results render before the map so a stalled (or slow)
  // map request never delays the discovery list.
  renderResults(selectedStateId || null);
  let mapApi = null;
  try {
    mapApi = await Promise.race([
      renderMap(mapHolder, mapUrl, {
        selectedStateId: selectedStateId || null,
        coveredStateIds,
        onSelect: (stateId) => {
          navigateTo({ name: "state", params: { stateId } });
        },
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("map timeout")), 8000)),
    ]);
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

  return {
    capture() {
      captureView("explore", {
        query: searchInput.value,
        spirit: spirit.value,
        mood: mood.value,
        stateId: currentStateId,
      });
    },
    snapshot() {
      return {
        query: searchInput.value,
        spirit: spirit.value,
        mood: mood.value,
        stateId: currentStateId,
      };
    },
    setState(stateId) {
      currentStateId = stateId || null;
      if (mapApi) mapApi.select(stateId || "");
      renderResults(stateId || null);
    },
  };
}
