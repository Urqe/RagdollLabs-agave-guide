import { el, clear } from "./dom-utils.js";
import { parseHash, startRouter, navigateTo } from "./router.js";
import { loadAppData } from "./data-loader.js";
import { renderExplore } from "./explore.js";
import { renderProfile, renderProfileNotFound } from "./profile.js";
import { renderCompare } from "./compare-view.js";
import { renderCatalogue } from "./catalogue-view.js";
import { renderLearn } from "./learn-view.js";
import { createLocale } from "./locale.js";
import { renderHome, ui } from "./presentation.js";
import { getCompareSelection, setCompareSelection } from "./compare-selection.js";
import { takeView, captureView } from "./view-memory.js";

const locale = createLocale();

const state = {
  data: null,
  error: null,
  exploreApi: null,
  catalogueActive: false,
  consumedRestore: null,
  lastComparePick: null,
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
    renderHome(container, { profiles, locale });
    return;
  }

  if (route.name === "explore" || route.name === "state") {
    const selectedStateId = route.name === "state" ? route.params.stateId : null;
    const restore = takeView("explore");
    state.consumedRestore = restore;
    state.exploreApi = await renderExplore(container, {
      profiles,
      bottles,
      selectedStateId,
      locale,
      mapUrl: new URL("assets/geo/mexico-states.svg", baseUrl()).href,
      ...(restore ? { restore } : {}),
    });
    return;
  }

  if (route.name === "learn") {
    state.exploreApi = null;
    renderLearn(container, {
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
    renderCatalogue(container, { bottles, profiles, sources, locale, ...(restore ? { restore } : {}) });
    return;
  }
  if (route.name === "compare") {
    state.exploreApi = null;
    // Deep links carry the selection; a bare #/compare reopens the saved one.
    const deepIds = parseIds(route.params.compareIds);
    const persisted = getCompareSelection();
    let ids = deepIds;
    if (deepIds.length === 0 && persisted.length > 0) {
      ids = persisted;
      navigateTo({ name: "compare", params: { compareIds: ids.join(",") } });
      return;
    }
    setCompareSelection(ids);
    renderCompare(container, {
      profiles,
      locale,
      compareIds: ids.join(","),
      focusProfileId: state.lastComparePick,
      onSelectionChange: (nextIds) => {
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
      renderProfileNotFound(container, route.params.profileId);
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
  renderProfileNotFound(container, "");
}

function wireLocaleToggle(refresh) {
  const button = document.getElementById("locale-toggle");
  if (!button) return;
  const render = () => {
    const next = locale.get() === "en" ? "es" : "en";
    button.textContent = next.toUpperCase();
    button.setAttribute("aria-label", locale.get() === "en" ? "Cambiar idioma" : "Switch language");
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
    button.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
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
  wireThemeToggle();
  wireLocaleToggle(() => {
    handleRoute();
  });

  try {
    state.data = await loadAppData(baseUrl());
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
    if (route.name !== "profile") return;
    if (state.exploreApi && typeof state.exploreApi.capture === "function") state.exploreApi.capture();
    if (state.catalogueActive) {
      const input = document.getElementById("catalogue-search");
      captureView("catalogue", { query: input ? input.value : "" });
    }
  };

  const handleRoute = async () => {
    const route = parseHash(window.location.hash);
    rememberListViews(route);
    state.consumedRestore = null;
    state.catalogueActive = route.name === "catalogue";
    syncCompareNav(route);
    document.documentElement.lang = locale.get();
    for (const link of document.querySelectorAll(".nav-link")) {
      const name = link.dataset.view;
      link.textContent = locale.t("nav." + name);
      const active = name === route.name || (name === "explore" && (route.name === "state" || route.name === "profile"));
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    const brand = document.querySelector(".brand");
    if (brand) brand.setAttribute("aria-label", ui(locale, "home"));
    const footer = document.querySelector(".app-footer p");
    if (footer) footer.textContent = ui(locale, "footer");
    clear(main);
    main.appendChild(el("p", { class: "loading-note" }, "Loading…"));
    try {
      await renderRoute(main, route);
      appendUntranslatedNote(main);
    } catch (error) {
      renderError(main, error);
    }
    const restoreScroll = state.consumedRestore && typeof state.consumedRestore.scrollY === "number"
      ? state.consumedRestore.scrollY
      : null;
    if (restoreScroll != null) {
      window.scrollTo(0, restoreScroll);
    } else {
      // New pages start at their heading.
      const heading = main.querySelector("h1, h2");
      if (heading && typeof heading.scrollIntoView === "function") heading.scrollIntoView({ block: "start" });
    }
    if (!main.contains(document.activeElement)) main.focus({ preventScroll: true });
  };

  // Render the initial route without pushing a duplicate history entry.
  await handleRoute();
  startRouter(handleRoute);
}

/**
 * When the active locale lacks reviewed strings, disclose it once per
 * render instead of silently showing English.
 */
function appendUntranslatedNote(container) {
  if (locale.get() === "es") {
    const note = document.createElement("p");
    note.className = "editorial-note untranslated-note";
    note.textContent = ui(locale, "disclosure");
    container.appendChild(note);
  }
}

boot();
