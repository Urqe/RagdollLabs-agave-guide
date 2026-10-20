import { el, clear } from "./dom-utils.js";
import { parseHash, startRouter, navigateTo } from "./router.js";
import { loadAppData } from "./data-loader.js";
import { renderExplore } from "./explore.js";
import { renderProfile, renderProfileNotFound } from "./profile.js";
import { renderCompare } from "./compare-view.js";
import { renderCatalogue } from "./catalogue-view.js";
import { renderLearn } from "./learn-view.js";
import { createLocale } from "./locale.js";

const locale = createLocale();

const state = {
  data: null,
  error: null,
  exploreApi: null,
  lastComparePick: null,
};

function baseUrl() {
  return new URL(".", document.baseURI);
}

function renderHome(container) {
  clear(container);
  const section = el("section", { class: "home-view", "aria-labelledby": "home-heading" });
  section.appendChild(el("h2", { id: "home-heading" }, "Agave spirits style guide"));
  section.appendChild(el("p", { class: "home-intro" },
    "A small guide to the body and taste of Mexican agave spirits — tequila, mezcal, bacanora and raicilla. "
    + "Each profile describes a style, with one example bottle to show what it can taste like. "
    + "The examples are single bottles, not a verdict on every tequila or mezcal from a region."));
  const cta = el("p", { class: "home-cta" });
  cta.appendChild(el("a", { href: "#/explore", class: "cta-link" }, "Browse the map of México →"));
  section.appendChild(cta);
  container.appendChild(section);
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
    renderHome(container);
    return;
  }

  if (route.name === "explore" || route.name === "state") {
    const selectedStateId = route.name === "state" ? route.params.stateId : null;
    state.exploreApi = await renderExplore(container, {
      profiles,
      bottles,
      selectedStateId,
      locale,
      mapUrl: new URL("assets/geo/mexico-states.svg", baseUrl()).href,
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
    renderCatalogue(container, { bottles, profiles, sources, locale });
    return;
  }
  if (route.name === "compare") {
    state.exploreApi = null;
    renderCompare(container, {
      profiles,
      compareIds: route.params.compareIds || "",
      focusProfileId: state.lastComparePick,
      onSelectionChange: (ids) => {
        state.lastComparePick = state.lastComparePick && ids.includes(state.lastComparePick)
          ? state.lastComparePick
          : ids[ids.length - 1] || null;
        navigateTo({ name: "compare", params: { compareIds: ids.join(",") } });
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
    renderProfile(container, { profile, bottle, sources, returnTo: route.params.from || null, allProfiles: profiles, allBottles: bottles, locale });
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
    const route = parseHash(window.location.hash);
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
    const target = route.name === "compare" && route.params.compareIds
      ? `#/compare/${encodeURIComponent(route.params.compareIds)}`
      : "#/compare";
    if (navCompare.getAttribute("href") !== target) {
      navCompare.setAttribute("href", target);
    }
  };

  const handleRoute = async () => {
    const route = parseHash(window.location.hash);
    syncCompareNav(route);
    clear(main);
    main.appendChild(el("p", { class: "loading-note" }, "Loading…"));
    try {
      await renderRoute(main, route);
      appendUntranslatedNote(main);
    } catch (error) {
      renderError(main, error);
    }
    main.focus({ preventScroll: true });
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
  if (locale.hasMissing()) {
    const note = document.createElement("p");
    note.className = "editorial-note untranslated-note";
    note.textContent = locale.t("untranslated.note");
    container.appendChild(note);
  }
}

boot();
