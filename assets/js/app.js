import { el, clear } from "./dom-utils.js";
import { parseHash, startRouter, navigateTo } from "./router.js";
import { loadAppData } from "./data-loader.js";
import { renderExplore } from "./explore.js";
import { renderProfile, renderProfileNotFound } from "./profile.js";
import { renderCompare } from "./compare-view.js";
import { renderCatalogue } from "./catalogue-view.js";
import { renderLearn } from "./learn-view.js";
import { renderStartHub, renderLesson } from "./journey.js";
import { renderPlantToGlass } from "./plant-to-glass.js";
import { renderDiscoverNotFound } from "./discovery-view.js";
import { renderDiscover } from "./discovery-view.js";
import { renderPlantPage, renderTraditionPage } from "./plant-tradition-view.js";
import { createLocale } from "./locale.js";
import { renderHome, ui } from "./presentation.js";
import { getCompareSelection, setCompareSelection } from "./compare-selection.js";
import { takeView, captureView } from "./view-memory.js";
import { setContentEs } from "./editorial.js";

const locale = createLocale();

const state = {
  data: null,
  error: null,
  exploreApi: null,
  catalogueActive: false,
  intraExploreMove: false,
  lastExploreState: null,
  consumedRestore: null,
  lastComparePick: null,
  lastCompareQuery: null,
  savedBeforeLesson: null,
  lessonPreparedSelection: null,
  catalogueApi: null,
};

function baseUrl() {
  return new URL(".", document.baseURI);
}

function parseIds(raw) {
  const seen = new Set();
  return (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((id) => (seen.has(id) ? false : (seen.add(id), true)))
    .slice(0, 3);
}

function renderError(container, error) {
  clear(container);
  const section = el("section", { class: "error-view", role: "alert" });
  section.appendChild(el("h2", {}, "Something went wrong"));
  section.appendChild(el("p", {}, error.message));
  section.appendChild(el("a", { href: ".", class: "cta-link" }, "Reload the page"));
  container.appendChild(section);
}

async function renderRoute(container, route) {
  if (!state.data) return;
  const { profiles, bottles, sources } = state.data;

  if (route.name === "home") {
    state.exploreApi = null;
    state.intraExploreMove = false;
    state.lastExploreState = null;
    renderHome(container, { profiles, locale });
    return;
  }

  if (route.name === "explore" || route.name === "state") {
    const selectedStateId = route.name === "state" ? route.params.stateId : null;
    // A state selection (or a locale re-render) rebuilds the view; keep the
    // active query and filters instead of discarding them. Intra-explore
    // carries come from the in-memory snapshot (no scroll restore); profile
    // returns come from the captured snapshot (with scroll). A bare
    // #/explore is an explicit return to the whole collection, so a carried
    // state restriction must not resurrect itself there.
    let restore = null;
    if (state.intraExploreMove) {
      restore = state.lastExploreState;
    } else {
      restore = takeView("explore");
    }
    if (restore && route.name === "explore") restore = { ...restore, stateId: null };
    state.consumedRestore = restore;
    state.exploreApi = await renderExplore(container, {
      profiles,
      bottles,
      selectedStateId,
      locale,
      mapUrl: new URL("assets/geo/mexico-states.svg", baseUrl()).href,
      ...(restore ? { restore } : {}),
    });
    state.lastExploreState = null;
    return;
  }

  if (route.name === "plant") {
    state.exploreApi = null;
    const plant = state.data.plants.find((x) => x.id === route.params.plantId);
    if (plant) {
      renderPlantPage(container, {
        plant,
        plants: state.data.plants,
        regions: state.data.regions,
        traditions: state.data.traditions,
        profiles,
        sources,
        locale,
      });
    } else {
      renderDiscoverNotFound(container, "plant", route.params.plantId, locale);
    }
    return;
  }
  if (route.name === "tradition") {
    state.exploreApi = null;
    const tradition = state.data.traditions.find((x) => x.id === route.params.traditionId);
    if (tradition) {
      renderTraditionPage(container, {
        tradition,
        traditions: state.data.traditions,
        regions: state.data.regions,
        plants: state.data.plants,
        profiles,
        bottles,
        sources,
        locale,
      });
    } else {
      renderDiscoverNotFound(container, "spirit", route.params.traditionId, locale);
    }
    return;
  }
  if (route.name === "discover") {
    state.exploreApi = null;
    renderDiscover(container, {
      kind: route.params.kind || null,
      id: route.params.id || null,
      plants: state.data.plants,
      regions: state.data.regions,
      traditions: state.data.traditions,
      profiles, bottles,
      locale,
    });
    return;
  }
  if (route.name === "start") {
    state.exploreApi = null;
    // Returning to the journey restores a compare selection the lesson
    // handoff replaced — but only if the reader made no picks of their
    // own inside the comparison; their own choices always win.
    if (state.savedBeforeLesson) {
      const current = getCompareSelection();
      const prepared = state.lessonPreparedSelection || [];
      const untouched = prepared.length > 0 &&
        current.length === prepared.length && current.every((id, i) => id === prepared[i]);
      if (untouched) setCompareSelection(state.savedBeforeLesson);
      state.savedBeforeLesson = null;
      state.lessonPreparedSelection = null;
    }
    if (route.params.lessonId) {
      renderLesson(container, { lessonId: route.params.lessonId, profiles, chapters: state.data.chapters, locale });
    } else {
      renderStartHub(container, { profiles, locale });
    }
    return;
  }
  if (route.name === "plantToGlass") {
    state.exploreApi = null;
    renderPlantToGlass(container, {
      processes: state.data.processes,
      profiles, sources, locale,
      from: route.params.from || null,
    });
    return;
  }
  if (route.name === "learn") {
    state.exploreApi = null;
    renderLearn(container, {
      section: route.params.section || null,
      from: route.params.from || null,
      chapters: state.data.chapters,
      plants: state.data.plants,
      processes: state.data.processes,
      glossary: state.data.glossary,
      profiles, bottles, sources,
      locale,
    });
    return;
  }
  if (route.name === "catalogue") {
    state.exploreApi = null;
    const restore = takeView("catalogue");
    state.consumedRestore = restore;
    const api = renderCatalogue(container, {
      bottles, profiles, sources, locale,
      ...(restore ? { restore } : {}),
      ...(route.params.bottle ? { revealBottleId: route.params.bottle } : {}),
    });
    state.catalogueApi = api || null;
    return;
  }
  if (route.name === "compare") {
    state.exploreApi = null;
    // Deep links carry the selection; a bare #/compare reopens the saved one.
    const deepIds = parseIds(route.params.compareIds);
    const fromLesson = typeof route.params.from === "string" && route.params.from.startsWith("start:");
    const persisted = getCompareSelection();
    let ids = deepIds;
    if (deepIds.length === 0 && persisted.length > 0) {
      ids = persisted;
      navigateTo({ name: "compare", params: { compareIds: ids.join(","), ...(route.params.from ? { from: route.params.from } : {}) } });
      return;
    }
    // A lesson handoff never silently destroys a saved selection: the
    // prepared comparison renders, and the lesson keeps the previous
    // selection to restore when the reader returns — unless the reader
    // made their own picks inside the comparison view.
    if (fromLesson && !state.savedBeforeLesson) {
      state.savedBeforeLesson = persisted.length > 0 ? [...persisted] : null;
      state.lessonPreparedSelection = [...ids];
    }
    // Pair 26: a picker focus belongs to the visit it happened in.
    if (state.previousRouteName !== "compare") state.lastComparePick = null;
    setCompareSelection(ids);
    renderCompare(container, {
      profiles,
      plants: state.data.plants,
      locale,
      compareIds: ids.join(","),
      from: route.params.from || null,
      preset: route.params.preset || null,
      focusProfileId: state.lastComparePick,
      keepPickerQuery: state.lastCompareQuery,
      onSelectionChange: (nextIds, pickerQuery) => {
        state.lastCompareQuery = pickerQuery;
        setCompareSelection(nextIds);
        state.lastComparePick = state.lastComparePick && nextIds.includes(state.lastComparePick)
          ? state.lastComparePick
          : nextIds[nextIds.length - 1] || null;
        navigateTo({ name: "compare", params: { compareIds: nextIds.join(",") } });
      },
    });
    return;
  }
  if (route.name === "profile") {
    state.exploreApi = null;
    const profile = profiles.find((p) => p.id === route.params.profileId);
    if (!profile) {
      renderProfileNotFound(container, route.params.profileId, locale);
      return;
    }
    const bottle = bottles.find((b) => b.id === profile.exampleBottleId) || null;
    renderProfile(container, {
      profile,
      bottle,
      sources,
      returnTo: route.params.from || null,
      origin: route.params.origin || null,
      compareSelection: getCompareSelection(),
      allProfiles: profiles,
      allBottles: bottles,
      locale,
    });
    return;
  }
  state.exploreApi = null;
  renderProfileNotFound(container, "", locale);
}

function wireLocaleToggle(refresh) {
  const button = document.getElementById("locale-toggle");
  if (!button) return;
  // Pair 16: the toggle shows the language the reader would switch TO,
  // as two clearly identified editions (UK flag → English, Mexican flag →
  // Español (México)). The accessible label always names the target
  // language, and the flag is decorative next to the text, so the control
  // stays readable if the flag fails to render.
  const render = () => {
    const next = locale.get() === "en" ? "es" : "en";
    const flag = button.querySelector(".locale-flag");
    const name = button.querySelector(".locale-name");
    const label = ui(locale, next === "en" ? "switchToEn" : "switchToEs");
    const current = locale.get() === "es" ? ui(locale, "currentEditionEs") : ui(locale, "currentEdition");
    if (flag) flag.textContent = next === "en" ? "\uD83C\uDDEC\uD83C\uDDE7" : "\uD83C\uDDF2\uD83C\uDDFD";
    if (name) name.textContent = next === "en" ? "English" : "Espa\u00f1ol (M\u00e9xico)";
    if (!flag || !name) button.textContent = `${next === "en" ? "\uD83C\uDDEC\uD83C\uDDE7" : "\uD83C\uDDF2\uD83C\uDDFD"} ${next === "en" ? "English" : "Espa\u00f1ol"}`;
    button.setAttribute("aria-label", `${current}. ${label}`);
    button.title = `${current}. ${label}`;
  };
  button.addEventListener("click", () => {
    locale.set(locale.get() === "en" ? "es" : "en");
    render();
    refresh();
  });
  render();
}

function wireThemeToggle() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;
  const render = () => {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    button.textContent = theme === "dark" ? "\u2600" : "\u263e";
    button.setAttribute("aria-label", ui(locale, theme === "dark" ? "toLight" : "toDark"));
    button.title = ui(locale, "switchTheme");
  };
  button.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("agave-theme", next); } catch (error) { /* storage unavailable */ }
    render();
  });
  render();
}

async function boot() {
  const root = document.getElementById("app");
  const main = el("main", { id: "main", class: "app-main", tabindex: "-1" });
  root.appendChild(main);
  trackHeaderOffset();
  let onLocaleSwitch = null;
  wireThemeToggle();
  wireLocaleToggle(() => {
    if (onLocaleSwitch) onLocaleSwitch();
  });

  try {
    state.data = await loadAppData(baseUrl());
    setContentEs(state.data.contentEs || {});
  } catch (error) {
    state.error = error;
    renderError(main, error);
    return;
  }

  const syncCompareNav = (route) => {
    const navCompare = document.getElementById("nav-compare");
    if (!navCompare) return;
    const persisted = getCompareSelection();
    const ids = (route.name === "compare" && route.params.compareIds) || (persisted.length ? persisted.join(",") : "");
    const target = ids ? `#/compare/${ids.split(",").map(encodeURIComponent).join(",")}` : "#/compare";
    if (navCompare.getAttribute("href") !== target) {
      navCompare.setAttribute("href", target);
    }
  };

  // Leaving a list view for a profile captures its query, filters and
  // scroll so the return trip reopens exactly where the user left off.
  const rememberListViews = (route) => {
    // Only leaving for a profile captures the durable snapshot (with
    // scroll); intra-explore moves use the in-memory snapshot instead.
    if (route.name === "profile" && state.exploreApi && typeof state.exploreApi.capture === "function") {
      state.exploreApi.capture();
    }
    if (route.name === "profile" && state.catalogueActive) {
      const input = document.getElementById("catalogue-search");
      const filter = document.getElementById("catalogue-tradition");
      const snapshot = state.catalogueApi && typeof state.catalogueApi.snapshot === "function"
        ? state.catalogueApi.snapshot()
        : null;
      captureView("catalogue", {
        query: input ? input.value : "",
        traditionId: filter ? filter.value : "",
        ...(snapshot && snapshot.brandFilter ? { brandFilter: snapshot.brandFilter } : {}),
      });
    }
  };

  let lastRouteKey = null;
  let firstRender = true;

  const handleRoute = async () => {
    const route = parseHash(window.location.hash);
    const previousRouteKey = lastRouteKey;
    const previousWasExplore = ["explore", "state"].includes((previousRouteKey || "").split(":")[0]);
    const intraExploreMove = ["state", "explore"].includes(route.name) && previousWasExplore;
    rememberListViews(route);
    if (intraExploreMove && state.exploreApi && typeof state.exploreApi.snapshot === "function") {
      state.lastExploreState = state.exploreApi.snapshot();
    }
    state.intraExploreMove = intraExploreMove;
    state.previousRouteName = (previousRouteKey || "").split(":")[0] || null;
    const routeKey = route.name + ":" + (route.params.profileId || route.params.stateId || route.params.compareIds || route.params.lessonId || (route.params.kind ? route.params.kind + ":" + (route.params.id || "") : "") || "");
    const routeChanged = routeKey !== lastRouteKey;
    lastRouteKey = routeKey;
    state.consumedRestore = null;
    state.catalogueActive = route.name === "catalogue";
    syncCompareNav(route);
    document.documentElement.lang = locale.get() === "es" ? "es-MX" : "en";
    for (const link of document.querySelectorAll(".nav-link")) {
      const name = link.dataset.view;
      link.textContent = locale.t("nav." + name);
      const active = name === route.name
        || (name === "explore" && (route.name === "state" || route.name === "profile"))
        || (name === "discover" && ["discover", "plant", "tradition"].includes(route.name))
        || (name === "learn" && route.name === "plantToGlass");
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    const brand = document.querySelector(".brand");
    if (brand) brand.setAttribute("aria-label", ui(locale, "home"));
    const footer = document.querySelector(".app-footer p");
    if (footer) footer.textContent = ui(locale, "footer");
    const skip = document.querySelector(".skip-link");
    if (skip) skip.textContent = ui(locale, "skipToContent");
    const nav = document.querySelector("nav[aria-label]");
    if (nav) nav.setAttribute("aria-label", ui(locale, "mainNav"));
    const prefs = document.querySelector(".header-preferences");
    if (prefs) prefs.setAttribute("aria-label", ui(locale, "preferences"));
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", ui(locale, "docDescription"));
    const product = document.querySelector(".brand-product");
    if (product) product.textContent = ui(locale, "brandProduct");
    const themeButton = document.getElementById("theme-toggle");
    if (themeButton) {
      const theme = document.documentElement.getAttribute("data-theme") || "dark";
      themeButton.setAttribute("aria-label", ui(locale, theme === "dark" ? "toLight" : "toDark"));
      themeButton.title = ui(locale, "switchTheme");
    }
    // Remember which disclosures were expanded so a same-route re-render
    // (language or theme switch) does not collapse them.
    const openDisclosures = routeChanged ? [] : [...main.querySelectorAll("details[open]")].map((node) => {
      const first = (node.className || "details").split(" ")[0];
      const sameClass = node.parentElement ? [...node.parentElement.querySelectorAll("details." + first)] : [node];
      return { cls: first, index: Math.max(0, sameClass.indexOf(node)) };
    });
    clear(main);
    main.appendChild(el("p", { class: "loading-note" }, ui(locale, "loading")));
    try {
      await renderRoute(main, route);
      appendUntranslatedNote(main);
    } catch (error) {
      renderError(main, error);
    }
    for (const { cls, index } of openDisclosures) {
      const candidates = [...main.querySelectorAll("details." + cls)];
      if (candidates[index]) candidates[index].open = true;
    }
    const heading = main.querySelector("h1") || main.querySelector("h2");
    // Pair 26: every page names itself in the browser tab and history.
    document.title = route.name === "home" || !heading
      ? ui(locale, "docTitle")
      : `${heading.textContent.trim()} · ${ui(locale, "title")}`;

    // A view that moved focus itself (a Learn deep link, a catalogue
    // reveal, the compare picker) has already placed the reader; the app
    // must not undo that by scrolling back to the top.
    const viewPlacedFocus = main.contains(document.activeElement) && document.activeElement !== main;
    const restoreScroll = state.consumedRestore && typeof state.consumedRestore.scrollY === "number"
      ? state.consumedRestore.scrollY
      : null;
    if (restoreScroll != null) {
      window.scrollTo(0, restoreScroll);
    } else if (routeChanged && !viewPlacedFocus) {
      // Pair 26: new pages open at the top of their content. The landing
      // target's scroll-margin matches the measured sticky-header height,
      // so the back link and heading are never hidden under the header.
      // "instant": a new page should not animate in from the old scroll
      // position (html has scroll-behavior: smooth for in-page jumps).
      const landing = main.firstElementChild;
      if (landing && typeof landing.scrollIntoView === "function") landing.scrollIntoView({ block: "start", behavior: "instant" });
    }
    if (routeChanged && !viewPlacedFocus && !firstRender && heading) {
      // Pair 26: focus the page heading, so screen readers announce the
      // new page; the initial load leaves focus where the browser put it.
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    } else if (!routeChanged && (!document.activeElement || document.activeElement === document.body)) {
      // A same-route re-render detached the focused element: keep the
      // reader inside the page. Focus outside main (the language or theme
      // switch in the header) is left where it is.
      main.focus({ preventScroll: true });
    }
    firstRender = false;
  };

  // Render the initial route without pushing a duplicate history entry.
  onLocaleSwitch = handleRoute;
  await handleRoute();
  startRouter(handleRoute);
}

/**
 * Pair 26: keep --header-offset equal to the sticky header's real height
 * (it wraps to two rows on phones), so landing and in-page jumps clear it.
 */
function trackHeaderOffset() {
  const header = document.querySelector(".app-header");
  if (!header) return;
  const update = () => {
    const height = Math.ceil(header.getBoundingClientRect().height);
    if (height > 0) document.documentElement.style.setProperty("--header-offset", `${height}px`);
  };
  update();
  if (typeof ResizeObserver === "function") new ResizeObserver(update).observe(header);
  else window.addEventListener("resize", update);
}

/**
 * When the rendered page actually shows English fallback text in the
 * Spanish edition, disclose it once per render. Renderers mark each
 * fallback field with `.untranslated-field`; a fully translated page gets
 * no page-level note (Pair 23.1 — the note used to appear on every
 * Spanish page, including fully translated ones).
 */
function appendUntranslatedNote(container) {
  if (locale.get() === "es" && container.querySelector(".untranslated-field")) {
    const note = document.createElement("p");
    note.className = "editorial-note untranslated-note";
    note.textContent = ui(locale, "disclosure");
    container.appendChild(note);
  }
}

boot();
