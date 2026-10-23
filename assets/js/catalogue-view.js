import { el, clear, safeLink } from "./dom-utils.js";
import { navigateTo } from "./router.js";
import { searchBottles, brandDirectory } from "./catalogue.js";
import { SPIRIT_LABELS } from "./spirit-labels.js";
import { ui } from "./presentation.js";
import { sourceKindLabel, fieldEs } from "./editorial.js";

const COVERAGE_LABELS = {
  "tasting-not-documented": "Tasting notes not yet documented",
  "profile-not-covered": "Profile not yet covered",
};

function sourceLinks(sources, sourceIds, locale = null) {
  const list = el("ul", { class: "source-list" });
  for (const id of sourceIds || []) {
    const source = sources.find((s) => s.id === id);
    if (!source) continue;
    const item = el("li");
    item.appendChild(safeLink(source.url, source.title, { class: "source-link" }));
    item.appendChild(el("span", { class: "source-kind" },
      ` \u2014 ${ui(locale, "kindSource").replace("{kind}", sourceKindLabel(source.kind, locale, ui))}`));
    list.appendChild(item);
  }
  return list;
}

/** Sources stay available but out of the reading flow. */
function collapsibleSources(sources, sourceIds, t, locale = null) {
  const details = el("details", { class: "source-details" });
  const summary = el("summary", {}, `${t("learn.sources")} (${(sourceIds || []).length})`);
  details.appendChild(summary);
  details.appendChild(sourceLinks(sources, sourceIds, locale));
  return details;
}

/**
 * One disclosure per entry holding every reference group, each with a
 * small label so the bottle's own reviews and the editorial note's
 * dependencies stay distinguishable without two mystery dropdowns.
 */
function mergedSourceDetails(sources, bottle, t, locale = null) {
  const total = (bottle.sourceIds || []).length + (bottle.noteSourceIds || []).length;
  const details = el("details", { class: "source-details" });
  details.appendChild(el("summary", {}, `${t("learn.sources")} (${total})`));
  details.appendChild(el("p", { class: "source-group-label" }, t("catalogue.groupBottle")));
  details.appendChild(sourceLinks(sources, bottle.sourceIds, locale));
  if (bottle.noteSourceIds && bottle.noteSourceIds.length > 0) {
    details.appendChild(el("p", { class: "source-group-label" }, t("catalogue.groupNote")));
    details.appendChild(sourceLinks(sources, bottle.noteSourceIds, locale));
  }
  return details;
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

  const L = (field, english) => fieldEs("bottle", bottle.id, field, locale) || english;
  const facts = el("ul", { class: "catalogue-facts" });
  facts.appendChild(el("li", {}, `${ui(locale, "factSpirit")}: ${SPIRIT_LABELS[bottle.spirit] || bottle.spirit || ui(locale, "notDocumented")}`));
  if (bottle.abv != null) facts.appendChild(el("li", {}, `${ui(locale, "factAbvLong")}: ${bottle.abv}% (${ui(locale, "labelFact")})`));
  if (bottle.abv == null && bottle.abvNote) facts.appendChild(el("li", {}, `${ui(locale, "factAbv")}: ${L("abvNote", bottle.abvNote)}`));
  if (bottle.producer) facts.appendChild(el("li", {}, `${ui(locale, "factProducer")}: ${L("producer", bottle.producer)}`));
  if (bottle.place) facts.appendChild(el("li", {}, `${ui(locale, "factPlace")}: ${L("place", bottle.place)}`));
  if (bottle.batch) facts.appendChild(el("li", {}, `${ui(locale, "factBatch")}: ${L("batch", bottle.batch)}`));
  if (bottle.composition) facts.appendChild(el("li", {}, `${ui(locale, "factComposition")}: ${L("composition", bottle.composition)}`));
  if (bottle.classification) facts.appendChild(el("li", {}, `${ui(locale, "factClassification")}: ${L("classification", bottle.classification)}`));
  if (bottle.plantComposition) facts.appendChild(el("li", {}, `${ui(locale, "factPlantComposition")}: ${L("plantComposition", bottle.plantComposition)}`));
  article.appendChild(facts);

  // Coverage disclosures first: factual entry without borrowed character.
  for (const label of bottle.coverage || []) {
    const coverageText = label === "tasting-not-documented" ? t("coverage.tasting") : label === "profile-not-covered" ? t("coverage.profile") : (COVERAGE_LABELS[label] || label);
    article.appendChild(el("p", { class: "coverage-label" }, coverageText));
  }

  // Reviewer impressions (attributed).
  if (bottle.reviewSummary) {
    article.appendChild(el("p", { class: "bottle-review" }, L("reviewSummary", bottle.reviewSummary)));
  }

  // The app's synthesis, explicitly profile-relative and sourced. An
  // uncovered bottle never gets the "how it fits" heading — it is
  // introduced as a reference point, not as a member of that profile.
  if (bottle.editorialNote) {
    const note = el("p", { class: "editorial-note" });
    const profile = profiles.find((p) => p.id === bottle.noteProfileId);
    const uncovered = (bottle.coverage || []).includes("profile-not-covered") || !bottle.profileId;
    const prefix = uncovered
      ? ui(locale, "relatesPrefix")
      : profile
        ? ui(locale, "fitsPrefix").replace("{title}", profile.title)
        : ui(locale, "fitsPrefixPlain");
    note.appendChild(document.createTextNode(prefix + L("editorialNote", bottle.editorialNote)));
    article.appendChild(note);
  }

  if (bottle.coverageNote) {
    article.appendChild(el("p", { class: "editorial-note" }, bottle.coverageNote));
  }

  article.appendChild(mergedSourceDetails(sources, bottle, t, locale));

  if (linkToProfile && bottle.profileId) {
    const profile = profiles.find((p) => p.id === bottle.profileId);
    if (profile) {
      article.appendChild(el("a", {
        href: `#/profile/${encodeURIComponent(profile.id)}?origin=catalogue`,
        class: "catalogue-profile-link",
      }, ui(locale, "seeStyleProfile").replace("{spirit}", SPIRIT_LABELS[profile.spirit] || profile.spirit)));
    }
  }

  return article;
}
/** Safe selector fragment for a bottle id anchor. */
function CSS_ESCAPE(value) {
  if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (c) => "\\u{0}".replace("{0}", c.charCodeAt(0).toString(16)));
}

/**
 * Pair 13 — compact catalogue summary: identity, tradition, documented
 * producer/place, ABV (or its honest unknown state) and one short
 * attributed character note. Longer production, composition, batch and
 * source detail stays behind the existing full entry's disclosure, so
 * the list stays scannable without hiding material facts: composition
 * warnings and coverage disclosures remain visible here.
 */
function bottleSummary(bottle, { sources, profiles = [], locale = null } = {}) {
  const t = (key) => (locale ? locale.t(key) : key);
  const L = (field, english) => fieldEs("bottle", bottle.id, field, locale) || english;
  const uncovered = (bottle.coverage || []).includes("profile-not-covered") || !bottle.profileId;
  const article = el("article", {
    class: "catalogue-entry catalogue-summary" + (uncovered ? " is-uncovered" : ""),
    "aria-labelledby": `bottle-${bottle.id}-title`,
  });
  article.id = `bottle-${bottle.id}`;
  const name = el("h3", {
    id: `bottle-${bottle.id}-title`,
    class: "catalogue-entry-title",
    tabindex: "-1",
  }, `${bottle.brand} \u2014 ${bottle.expression}`);
  article.appendChild(name);

  const facts = el("ul", { class: "catalogue-facts catalogue-facts-compact" });
  facts.appendChild(el("li", {}, SPIRIT_LABELS[bottle.traditionId] || SPIRIT_LABELS[bottle.spirit] || bottle.spirit || ui(locale, "notDocumented")));
  if (bottle.producer || bottle.place) {
    facts.appendChild(el("li", {}, [L("producer", bottle.producer), L("place", bottle.place)].filter(Boolean).join(" \u00b7 ")));
  }
  facts.appendChild(el("li", {}, bottle.abv != null
    ? `${bottle.abv}% ${ui(locale, "factAbvLong").toLowerCase()}`
    : (bottle.abvNote ? L("abvNote", bottle.abvNote) : ui(locale, "abvUnknown"))));
  article.appendChild(facts);

  // Material distinctions stay visible in the compact view; only depth
  // is deferred to the disclosure.
  for (const label of bottle.coverage || []) {
    const coverageText = label === "tasting-not-documented" ? t("coverage.tasting") : label === "profile-not-covered" ? t("coverage.profile") : (COVERAGE_LABELS[label] || label);
    article.appendChild(el("p", { class: "coverage-label" }, coverageText));
  }
  if (bottle.composition) {
    article.appendChild(el("p", { class: "editorial-note composition-note" }, L("composition", bottle.composition)));
  }

  if (bottle.reviewSummary) {
    article.appendChild(el("p", { class: "bottle-review" }, L("reviewSummary", bottle.reviewSummary)));
  } else if (!uncovered) {
    article.appendChild(el("p", { class: "editorial-note" }, ui(locale, "noReviewYet")));
  }

  // Optional depth: the full facts and every source group, clearly
  // labelled, collapsed out of the scan.
  const depth = el("details", { class: "source-details catalogue-depth" });
  depth.appendChild(el("summary", {}, t("catalogue.depthLabel")));
  const full = bottleEntry(bottle, { sources, profiles, linkToProfile: false, locale });
  for (const node of [...full.children].slice(1)) depth.appendChild(node);
  article.appendChild(depth);

  // A style-profile link only where the mapping genuinely matches; an
  // uncovered bottle is described plainly and gets no profile link.
  if (!uncovered && bottle.profileId) {
    const profile = profiles.find((x) => x.id === bottle.profileId);
    if (profile) {
      article.appendChild(el("a", {
        href: `#/profile/${encodeURIComponent(profile.id)}?origin=catalogue`,
        class: "catalogue-profile-link",
      }, ui(locale, "seeStyleProfile").replace("{spirit}", SPIRIT_LABELS[profile.spirit] || profile.spirit)));
    }
  } else if (uncovered && bottle.editorialNote) {
    const note = el("p", { class: "editorial-note" });
    note.appendChild(document.createTextNode(ui(locale, "relatesPrefix") + L("editorialNote", bottle.editorialNote)));
    article.appendChild(note);
  }
  return article;
}


/**
 * Catalogue view: search over bottles/brands/producers, an alphabetical
 * bottle list, and a brand directory. Search results and the list link to
 * profiles with the catalogue context preserved in the route.
 */
export function renderCatalogue(container, { bottles, profiles, sources, locale = null, returnTo = "catalogue", restore = null, revealBottleId = null } = {}) {
  clear(container);
  const t = (key) => (locale ? locale.t(key) : key);
  const section = el("section", { class: "catalogue-view", "aria-labelledby": "catalogue-heading" });
  section.appendChild(el("h2", { id: "catalogue-heading" }, t("catalogue.heading")));
  section.appendChild(el("p", { class: "view-intro" }, t("catalogue.intro")));

  // --- Controls: search + tradition filter, one row, predictable combination
  const controls = el("div", { class: "discovery-controls catalogue-controls" });
  const searchInput = el("input", {
    type: "search",
    class: "search-input",
    id: "catalogue-search",
    placeholder: t("catalogue.searchPlaceholder"),
    "aria-label": ui(locale, "search"),
  });
  const tradition = el("select", { id: "catalogue-tradition", "aria-label": t("catalogue.filterTradition") });
  tradition.appendChild(el("option", { value: "" }, t("catalogue.allTraditions")));
  const traditionsPresent = [...new Set(bottles.map((b) => b.traditionId || b.spirit))]
    .sort((a, b) => (SPIRIT_LABELS[a] || a).localeCompare(SPIRIT_LABELS[b] || b));
  for (const id of traditionsPresent) {
    tradition.appendChild(el("option", { value: id }, SPIRIT_LABELS[id] || id));
  }
  const resetBtn = el("button", { type: "button", class: "quiet-link catalogue-reset" }, t("catalogue.reset"));
  controls.append(searchInput, tradition, resetBtn);
  section.appendChild(controls);

  const status = el("p", { class: "compare-status catalogue-status", role: "status", "aria-live": "polite" });
  section.appendChild(status);

  const searchResults = el("div", { class: "search-results", "aria-live": "polite" });
  section.appendChild(searchResults);

  // --- The list: compact summaries, search and filter combined predictably.
  const listHeading = el("h3", { id: "catalogue-list-heading" }, t("catalogue.allBottles"));
  section.appendChild(listHeading);
  const resultList = el("ul", { class: "catalogue-list" });
  section.appendChild(resultList);

  const sorted = [...bottles].sort((a, b) =>
    a.brand.localeCompare(b.brand) || a.expression.localeCompare(b.expression)
  );

  let brandFilter = "";
  const activeBrand = el("p", { class: "editorial-note catalogue-active-brand" });
  activeBrand.hidden = true;
  const clearBrandBtn = el("button", { type: "button", class: "quiet-link" }, t("catalogue.clearBrand"));
  clearBrandBtn.addEventListener("click", () => {
    brandFilter = "";
    renderList();
    searchInput.focus();
  });
  activeBrand.appendChild(clearBrandBtn);
  resultList.before(activeBrand);

  const renderList = () => {
    clear(resultList);
    clear(searchResults);
    if (brandFilter) {
      activeBrand.hidden = false;
      clear(activeBrand);
      activeBrand.appendChild(document.createTextNode(
        t("catalogue.activeBrand").replace("{brand}", brandFilter) + " "));
      activeBrand.appendChild(clearBrandBtn);
    } else {
      activeBrand.hidden = true;
    }
    const query = (searchInput.value || "").trim();
    const filterId = tradition.value;
    let matches = sorted;
    if (brandFilter) matches = matches.filter((b) => b.brand === brandFilter);
    if (filterId) matches = matches.filter((b) => (b.traditionId || b.spirit) === filterId);
    if (query.length >= 2) matches = searchBottles(matches, query);
    const visible = brandFilter || query.length >= 2 || filterId ? matches : sorted;
    // Result count: visible results out of the full catalogue.
    const countText = t("catalogue.count")
      .replace("{shown}", visible.length)
      .replace("{total}", bottles.length);
    clear(status);
    status.appendChild(document.createTextNode(countText));
    if (visible.length === 0) {
      const message = filterId
        ? t("catalogue.noResults").replace("{query}", query || "").replace("{tradition}", SPIRIT_LABELS[filterId] || filterId)
        : t("catalogue.noResults").replace("{query}", query || "").replace(" in {tradition}", "").replace("{tradition}", "");
      searchResults.appendChild(el("p", { class: "search-empty" }, message));
      return;
    }
    for (const bottle of visible) {
      const item = el("li");
      item.appendChild(bottleSummary(bottle, { sources, profiles, locale }));
      resultList.appendChild(item);
    }
  };

  const reset = () => {
    searchInput.value = "";
    tradition.value = "";
    brandFilter = "";
    renderList();
    searchInput.focus();
  };
  resetBtn.addEventListener("click", reset);
  searchInput.addEventListener("input", () => { brandFilter = ""; renderList(); });
  tradition.addEventListener("change", renderList);

  // Restore captures both the query and the filter now.
  if (restore) {
    if (restore.query) searchInput.value = restore.query;
    if (restore.traditionId) tradition.value = restore.traditionId;
    if (restore.brandFilter) brandFilter = restore.brandFilter;
  }
  renderList();

  // --- Brand index: one compact jump-link row per brand. The per-brand
  // bottle lists moved into the filterable main list; the index keeps
  // useful brand browsing without repeating every expression twice.
  const dirHeading = el("h3", { id: "catalogue-brands-heading" }, t("catalogue.brands"));
  section.appendChild(dirHeading);
  const dir = el("ul", { class: "discovery-chip-list brand-index" });
  for (const { brand } of brandDirectory(bottles)) {
    const li = el("li");
    const chip = el("a", { class: "discovery-chip", href: "#/catalogue" }, brand);
    chip.addEventListener("click", (event) => {
      event.preventDefault();
      brandFilter = brand;
      searchInput.value = "";
      tradition.value = "";
      renderList();
      const target = resultList.querySelector(`[id^="bottle-"] h3`);
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.focus({ preventScroll: true });
      }
    });
    li.appendChild(chip);
    dir.appendChild(li);
  }
  section.appendChild(dir);

  // A deep-linked bottle inside a filtered view or collapsed depth is
  // revealed, or the reader is clearly offered to show it.
  if (revealBottleId) {
    const anchor = resultList.querySelector(`#bottle-${CSS_ESCAPE(revealBottleId)}`);
    if (anchor) {
      const depth = anchor.querySelector("details.catalogue-depth");
      if (depth) depth.open = true;
      const title = anchor.querySelector("h3");
      if (title && typeof title.scrollIntoView === "function") {
        title.scrollIntoView({ behavior: "smooth", block: "start" });
        title.focus({ preventScroll: true });
      }
    } else {
      searchResults.appendChild(el("p", { class: "editorial-note" },
        t("catalogue.revealFiltered").replace("{id}", revealBottleId)));
      const show = el("button", { type: "button", class: "quiet-link" }, t("catalogue.showAnyway"));
      show.addEventListener("click", () => {
        reset();
        const target = resultList.querySelector(`#bottle-${CSS_ESCAPE(revealBottleId)} h3`);
        if (target && typeof target.scrollIntoView === "function") {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          target.focus({ preventScroll: true });
        }
      });
      searchResults.appendChild(show);
    }
  }

  container.appendChild(section);
  return {
    snapshot: () => ({ query: searchInput.value, traditionId: tradition.value, brandFilter }),
  };
}
