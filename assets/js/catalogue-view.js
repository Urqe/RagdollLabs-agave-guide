import { el, clear, safeLink } from "./dom-utils.js";
import { navigateTo } from "./router.js";
import { searchBottles, brandDirectory } from "./catalogue.js";

const SPIRIT_LABELS = {
  tequila: "Tequila",
  mezcal: "Mezcal",
  bacanora: "Bacanora",
  raicilla: "Raicilla",
  tuxca: "Tuxca",
  comiteco: "Comiteco",
  "destilado-de-pulque": "Destilado de pulque",
};

const COVERAGE_LABELS = {
  "tasting-not-documented": "Tasting notes not yet documented",
  "profile-not-covered": "Profile not yet covered",
};

function sourceLinks(sources, sourceIds) {
  const list = el("ul", { class: "source-list" });
  for (const id of sourceIds || []) {
    const source = sources.find((s) => s.id === id);
    if (!source) continue;
    const item = el("li");
    item.appendChild(safeLink(source.url, source.title, { class: "source-link" }));
    item.appendChild(el("span", { class: "source-kind" }, ` \u2014 ${source.kind} source`));
    list.appendChild(item);
  }
  return list;
}

/**
 * Bottle entry: identity + facts + review summary with attribution +
 * profile-relative editorial note + explicit coverage disclosures.
 * Reviewer impressions, producer facts and the app's synthesis stay
 * visually and semantically distinguishable.
 */
export function bottleEntry(bottle, { sources, profiles = [], linkToProfile = true, locale = null } = {}) {
  const t = (key) => (locale ? locale.t(key) : key);
  const article = el("article", { class: "catalogue-entry", "aria-labelledby": `bottle-${bottle.id}-title` });
  article.id = `bottle-${bottle.id}`;

  const name = el("h3", {
    id: `bottle-${bottle.id}-title`,
    class: "catalogue-entry-title",
    tabindex: "-1",
  }, `${bottle.brand} \u2014 ${bottle.expression}`);
  article.appendChild(name);

  const facts = el("ul", { class: "catalogue-facts" });
  facts.appendChild(el("li", {}, `Spirit: ${SPIRIT_LABELS[bottle.spirit] || bottle.spirit || "not documented"}`));
  if (bottle.abv != null) facts.appendChild(el("li", {}, `ABV: ${bottle.abv}% (label fact)`));
  if (bottle.abv == null && bottle.abvNote) facts.appendChild(el("li", {}, `ABV: ${bottle.abvNote}`));
  if (bottle.producer) facts.appendChild(el("li", {}, `Producer: ${bottle.producer}`));
  if (bottle.place) facts.appendChild(el("li", {}, `Place: ${bottle.place}`));
  if (bottle.batch) facts.appendChild(el("li", {}, `Batch/version: ${bottle.batch}`));
  if (bottle.composition) facts.appendChild(el("li", {}, `Composition: ${bottle.composition}`));
  article.appendChild(facts);

  // Coverage disclosures first: factual entry without borrowed character.
  for (const label of bottle.coverage || []) {
    const coverageText = label === "tasting-not-documented" ? t("coverage.tasting") : label === "profile-not-covered" ? t("coverage.profile") : (COVERAGE_LABELS[label] || label);
    article.appendChild(el("p", { class: "coverage-label" }, coverageText));
  }

  // Reviewer impressions (attributed).
  if (bottle.reviewSummary) {
    article.appendChild(el("p", { class: "bottle-review" }, bottle.reviewSummary));
  }

  // The app's synthesis, explicitly profile-relative and sourced.
  if (bottle.editorialNote) {
    const note = el("p", { class: "editorial-note" });
    const profile = profiles.find((p) => p.id === bottle.noteProfileId);
    note.appendChild(document.createTextNode(
      `How it fits the ${profile ? `\u201c${profile.title}\u201d` : "reference"} profile (editorial): ${bottle.editorialNote}`
    ));
    article.appendChild(note);
    if (bottle.noteSourceIds && bottle.noteSourceIds.length > 0) {
      article.appendChild(el("p", { class: "bottle-links-label" }, "Note sources:"));
      article.appendChild(sourceLinks(sources, bottle.noteSourceIds));
    }
  }

  if (bottle.coverageNote) {
    article.appendChild(el("p", { class: "editorial-note" }, bottle.coverageNote));
  }

  article.appendChild(el("p", { class: "bottle-links-label" }, "Sources:"));
  article.appendChild(sourceLinks(sources, bottle.sourceIds));

  if (linkToProfile && bottle.profileId) {
    const profile = profiles.find((p) => p.id === bottle.profileId);
    if (profile) {
      article.appendChild(el("a", {
        href: `#/profile/${encodeURIComponent(profile.id)}`,
        class: "catalogue-profile-link",
      }, `See the ${SPIRIT_LABELS[profile.spirit] || profile.spirit} style profile \u2192`));
    }
  }

  return article;
}

/**
 * Catalogue view: search over bottles/brands/producers, an alphabetical
 * bottle list, and a brand directory. Search results and the list link to
 * profiles with the catalogue context preserved in the route.
 */
export function renderCatalogue(container, { bottles, profiles, sources, locale = null, returnTo = "catalogue" }) {
  clear(container);
  const t = (key) => (locale ? locale.t(key) : key);
  const section = el("section", { class: "catalogue-view", "aria-labelledby": "catalogue-heading" });
  section.appendChild(el("h2", { id: "catalogue-heading" }, t("catalogue.heading")));
  section.appendChild(el("p", { class: "view-intro" }, t("catalogue.intro")));

  // Search
  const searchInput = el("input", {
    type: "search",
    class: "search-input",
    id: "catalogue-search",
    placeholder: t("catalogue.searchPlaceholder"),
    "aria-label": "Search the catalogue",
  });
  const searchResults = el("div", { class: "search-results", "aria-live": "polite" });
  const form = el("form", { class: "search-form", role: "search" });
  form.addEventListener("submit", (event) => event.preventDefault());
  form.appendChild(searchInput);
  const searchHolder = el("div", { class: "search-holder" });
  searchHolder.appendChild(form);
  searchHolder.appendChild(searchResults);
  section.appendChild(searchHolder);

  const renderSearch = () => {
    clear(searchResults);
    const query = searchInput.value;
    if (!query || query.trim().length < 2) return;
    const matches = searchBottles(bottles, query);
    if (matches.length === 0) {
      searchResults.appendChild(el("p", { class: "search-empty" },
        `No bottles match \u201c${query}\u201d. Try a brand (Fortaleza), an expression (Blanco Tequila) or a place (Sonora).`));
      return;
    }
    const list = el("ul", { class: "search-result-list" });
    for (const bottle of matches) {
      const item = el("li");
      const link = el("a", {
        href: `#/${returnTo}`,
        class: "search-result-link",
        "aria-label": `Jump to ${bottle.brand} ${bottle.expression} in the catalogue`,
      });
      link.appendChild(el("span", { class: "profile-link-title" }, `${bottle.brand} \u2014 ${bottle.expression}`));
      link.appendChild(el("span", { class: "search-result-reason" },
        `${SPIRIT_LABELS[bottle.spirit] || bottle.spirit}${bottle.place ? ` \u00b7 ${bottle.place}` : ""}`));
      item.appendChild(link);
      // Context-preserving navigation: stay on the catalogue, scroll to the
      // entry and move focus to its title so keyboard users land on it.
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const target = document.getElementById(`bottle-${bottle.id}-title`);
        if (target) {
          if (typeof target.scrollIntoView === "function") {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          target.focus({ preventScroll: true });
        }
      });
      list.appendChild(item);
    }
    searchResults.appendChild(list);
  };
  searchInput.addEventListener("input", renderSearch);

  // Alphabetical bottle list
  const listHeading = el("h3", {}, t("catalogue.allBottles"));
  section.appendChild(listHeading);
  const alphaList = el("ul", { class: "catalogue-list" });
  const sorted = [...bottles].sort((a, b) =>
    a.brand.localeCompare(b.brand) || a.expression.localeCompare(b.expression)
  );
  for (const bottle of sorted) {
    const item = el("li");
    item.appendChild(bottleEntry(bottle, { sources, profiles, locale }));
    alphaList.appendChild(item);
  }
  section.appendChild(alphaList);

  // Brand directory
  const dirHeading = el("h3", {}, t("catalogue.brands"));
  section.appendChild(dirHeading);
  const dir = el("ul", { class: "brand-directory" });
  for (const { brand, bottles: brandBottles } of brandDirectory(bottles)) {
    const item = el("li", { class: "brand-directory-item" });
    item.appendChild(el("h4", {}, brand));
    const bl = el("ul", { class: "brand-directory-bottles" });
    for (const bottle of brandBottles) {
      bl.appendChild(el("li", {}, bottle.expression));
    }
    item.appendChild(bl);
    dir.appendChild(item);
  }
  section.appendChild(dir);

  container.appendChild(section);
}
