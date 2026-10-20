import { el, safeLink, clear } from "./dom-utils.js";
import { STATE_NAMES } from "./map.js";
import { flavorMoods, ifYouLikeThis } from "./compare.js";
import { bottlesForProfile } from "./catalogue.js";
import { SPIRIT_LABELS } from "./spirit-labels.js";
import { ui, sensoryOverview } from "./presentation.js";

function sourceLinks(sources, sourceIds) {
  const list = el("ul", { class: "source-list" });
  for (const id of sourceIds) {
    const source = sources.find((s) => s.id === id);
    if (!source) continue;
    const item = el("li");
    item.appendChild(safeLink(source.url, source.title, { class: "source-link" }));
    item.appendChild(el("span", { class: "source-kind" }, ` — ${source.kind} source`));
    list.appendChild(item);
  }
  return list;
}

function exampleBottleCard(bottle, sources, t) {
  const card = el("article", { class: "bottle-card", "aria-labelledby": "bottle-card-heading" });
  card.appendChild(el("h3", { id: "bottle-card-heading", class: "bottle-card-title" }, t("profile.exampleBottle")));
  const name = el("p", { class: "bottle-name" });
  name.appendChild(el("strong", {}, `${bottle.brand} ${bottle.expression}`));
  if (bottle.abv != null) {
    name.appendChild(el("span", { class: "bottle-abv" }, ` \u00b7 ${bottle.abv}% ABV`));
  }
  if (bottle.abv == null && bottle.abvNote) {
    name.appendChild(el("span", { class: "bottle-abv" }, ` \u00b7 ${bottle.abvNote}`));
  }
  card.appendChild(name);
  if (bottle.producer) card.appendChild(el("p", { class: "bottle-producer" }, bottle.producer));
  if (bottle.place) card.appendChild(el("p", { class: "bottle-place" }, bottle.place));
  if (bottle.composition) card.appendChild(el("p", { class: "bottle-composition editorial-note" }, `Composition: ${bottle.composition}`));
  card.appendChild(el("p", { class: "bottle-review" }, bottle.reviewSummary));
  const linksLabel = el("p", { class: "bottle-links-label" }, t("profile.sourcesBottle"));
  card.appendChild(linksLabel);
  card.appendChild(collapsibleBottleSources(sources, bottle, t));
  return card;
}

/**
 * Bottle reference links stay available but collapsed out of the reading
 * flow, mirroring the catalogue's source disclosure pattern.
 */
function collapsibleBottleSources(sources, bottle, t) {
  const details = el("details", { class: "source-details" });
  const total = (bottle.sourceIds || []).length + (bottle.noteSourceIds || []).length;
  details.appendChild(el("summary", {}, `${t("learn.sources")} (${total})`));
  details.appendChild(sourceLinks(sources, bottle.sourceIds));
  if (bottle.noteSourceIds && bottle.noteSourceIds.length > 0) {
    details.appendChild(el("p", { class: "source-group-label" }, t("catalogue.groupNote")));
    details.appendChild(sourceLinks(sources, bottle.noteSourceIds));
  }
  return details;
}

/**
 * Profile view: title, place/style context, description, body, taste notes,
 * smoke (where relevant), finish, one example bottle card and source links.
 */
export function renderProfile(container, { profile, bottle, sources, returnTo = null, origin = null, compareSelection = [], allProfiles = [], allBottles = [], locale = null }) {
  clear(container);
  const section = el("section", { class: "profile-view", "aria-labelledby": "profile-title" });

  const t = (key) => (locale ? locale.t(key) : key);
  const fromCatalogue = origin === "catalogue";
  const backHref = fromCatalogue ? "#/catalogue" : returnTo ? `#/explore/${encodeURIComponent(returnTo)}` : "#/explore";
  const back = el("a", { href: backHref, class: "back-link" }, fromCatalogue ? t("profile.backCatalogue") : t("profile.backExplore"));
  section.appendChild(back);

  section.appendChild(el("h1", { id: "profile-title" }, profile.title));

  

  const place = el("p", { class: "profile-place" });
  place.appendChild(el("span", { class: "profile-spirit-tag" }, SPIRIT_LABELS[profile.spirit] || profile.spirit));
  place.appendChild(document.createTextNode(` · ${profile.stateName}, México`));
  section.appendChild(place);

  if (profile.placeCoords) {
    const c = profile.placeCoords;
    section.appendChild(el("p", { class: "profile-coords editorial-note" },
      `Approximate location: ${c.lat.toFixed(2)}, ${c.lon.toFixed(2)} \u2014 precision: ${c.precision}. This is a place reference, not a legal boundary.`));
  }

  section.appendChild(el("p", { class: "profile-context" }, profile.context));

  

  section.appendChild(el("p", { class: "profile-description" }, profile.description));
  if (profile.beginnerNote) {
    section.appendChild(el("p", { class: "beginner-note" }, profile.beginnerNote));
  }
  const guidanceNote = el("p", { class: "editorial-note" },
    ui(locale, "guidance"));
  section.appendChild(guidanceNote);

  const craft = el("dl", { class: "profile-facts profile-craft" });
  if (profile.category) {
    craft.appendChild(el("dt", {}, ui(locale, "legal")));
    craft.appendChild(el("dd", { class: "profile-category" }, profile.category));
  }
  if (profile.plant) {
    craft.appendChild(el("dt", {}, ui(locale, "plant")));
    const plantDd = el("dd", { class: "profile-plant" }, profile.plant);
    if (profile.plantId) {
      plantDd.appendChild(document.createTextNode(" "));
      plantDd.appendChild(el("a", { href: "#/learn", class: "plant-learn-link" }, t("profile.aboutPlant")));
    }
    craft.appendChild(plantDd);
  }
  if (profile.process) {
    craft.appendChild(el("dt", {}, ui(locale, "process")));
    craft.appendChild(el("dd", { class: "profile-process" }, profile.process));
  }
  if (craft.childNodes.length > 0) section.appendChild(craft);

  

  

  const facts = el("dl", { class: "profile-facts" });
  facts.appendChild(el("dt", {}, ui(locale, "body")));
  facts.appendChild(el("dd", { class: "profile-body" }, ["light", "medium", "full"].includes(profile.body) ? ui(locale, profile.body) : profile.body));
  facts.appendChild(el("dt", {}, ui(locale, "notes")));
  const notes = el("dd", { class: "profile-taste" });
  const tasteList = el("ul", { class: "taste-list" });
  for (const note of profile.tasteNotes) tasteList.appendChild(el("li", {}, note));
  notes.appendChild(tasteList);
  facts.appendChild(notes);
  if (profile.smoke) {
    facts.appendChild(el("dt", {}, ui(locale, "smoke")));
    facts.appendChild(el("dd", { class: "profile-smoke" }, profile.smoke));
  }
  facts.appendChild(el("dt", {}, ui(locale, "finish")));
  facts.appendChild(el("dd", { class: "profile-finish" }, profile.finish));
  section.appendChild(facts);
  const moods = flavorMoods(profile);
  if (moods.length > 0) {
    const moodLine = el("p", { class: "mood-line" });
    moodLine.appendChild(el("strong", {}, t("profile.moods") + " "));
    moodLine.appendChild(document.createTextNode(
      moods.map((m) => (locale ? locale.mood(m) : m)).join(", ") + "."
    ));
    section.appendChild(moodLine);
  }

  if (bottle) section.appendChild(exampleBottleCard(bottle, sources, t));

  // Optional expansion: other catalogue bottles mapped to this profile.
  const { others } = bottlesForProfile(allBottles, profile);
  if (others.length > 0) {
    const details = el("details", { class: "more-bottles" });
    const summary = el("summary", {}, `${t("profile.moreBottles")} (${others.length})`);
    details.appendChild(summary);
    const moreList = el("ul", { class: "catalogue-list" });
    for (const other of others) {
      const item = el("li", { class: "more-bottle-item" });
      item.appendChild(el("strong", {}, `${other.brand} — ${other.expression}`));
      if (other.reviewSummary) item.appendChild(el("p", { class: "bottle-review" }, other.reviewSummary));
      if (other.editorialNote) item.appendChild(el("p", { class: "editorial-note" }, other.editorialNote));
      const src = el("p", {});
      for (const sid of other.sourceIds || []) {
        const source = sources.find((x) => x.id === sid);
        if (source) src.appendChild(safeLink(source.url, source.title, { class: "source-link" }));
      }
      item.appendChild(src);
      moreList.appendChild(item);
    }
    details.appendChild(moreList);
    section.appendChild(details);
  }

  if (profile.pairing) {
    const pairing = el("div", { class: "profile-pairing" });
    pairing.appendChild(el("h3", { class: "sources-heading" }, t("profile.pairing")));
    pairing.appendChild(el("p", {}, profile.pairing.serving));
    if (profile.pairing.foods && profile.pairing.foods.length > 0) {
      pairing.appendChild(el("p", {}, t("profile.pairingFoods") + " " + profile.pairing.foods.join(", ") + "."));
    }
    section.appendChild(pairing);
  }
  

  const suggestions = ifYouLikeThis(profile, allProfiles);
  if (suggestions.length > 0) {
    const suggHeading = el("h3", { class: "suggestions-heading" }, t("profile.ifYouLike"));
    section.appendChild(suggHeading);
    const suggList = el("ul", { class: "suggestion-list" });
    for (const { profile: other, reason } of suggestions) {
      const item = el("li");
      const link = el("a", {
        href: `#/profile/${encodeURIComponent(other.id)}` + (fromCatalogue ? "?origin=catalogue" : ""),
        class: "suggestion-link",
      }, other.title);
      item.appendChild(link);
      item.appendChild(el("span", { class: "search-result-reason" }, ` — ${reason}`));
      suggList.appendChild(item);
    }
    section.appendChild(suggList);
  }

  const learnLink = el("a", { href: "#/learn", class: "learn-callout-link" }, t("profile.learnLink"));
  section.appendChild(learnLink);

  const srcHeading = el("h3", { class: "sources-heading" }, t("profile.sources"));
  section.appendChild(srcHeading);
  section.appendChild(sourceLinks(sources, profile.sourceIds));

  // Lead with sensory information; retain the original reference content in disclosures.
  const titleNode = section.querySelector("#profile-title");
  const placeNode = section.querySelector(".profile-place");
  const factsNode = section.querySelector(".profile-facts:not(.profile-craft)");
  const bottleNode = section.querySelector(".bottle-card");
  const moreNode = section.querySelector(".more-bottles");
  const pairingNode = section.querySelector(".profile-pairing");
  const suggestionsHeading = section.querySelector(".suggestions-heading");
  const suggestionsNode = section.querySelector(".suggestion-list");
  const beginnerNode = section.querySelector(".beginner-note");
  const detailNodes = [".profile-context", ".profile-description", ".profile-craft", ".profile-coords", ".learn-callout-link"]
    .map(selector => section.querySelector(selector)).filter(Boolean);
  const sourceNodes = [...section.children].filter(node => node.classList.contains("source-list") || node === srcHeading);
  const identity = el("header", { class: "profile-heading" });
  identity.append(titleNode, placeNode);
  if (profile.plant) identity.appendChild(el("p", { class: "profile-plant-summary" }, ui(locale, "plant") + ": " + profile.plant));
  const core = el("div", { class: "profile-core" });
  core.append(sensoryOverview(profile, locale), factsNode);
  const isSelected = compareSelection.includes(profile.id);
  const isFull = compareSelection.length >= 3 && !isSelected;
  // "Compare this style" adds to the existing selection (capped at three);
  // when the style is already in — or the comparison is full — the link
  // reopens the current selection instead.
  const targetIds = isSelected || isFull
    ? [...compareSelection]
    : [...compareSelection, profile.id].slice(0, 3);
  const action = el("a", {
    class: "secondary-button compare-profile-link" + (isSelected ? " is-selected" : "") + (isFull ? " is-full" : ""),
    href: "#/compare/" + targetIds.map(encodeURIComponent).join(","),
  }, isSelected ? ui(locale, "compareSelected") : isFull ? ui(locale, "compareFull") : ui(locale, "compareThis") + " ↗");
  const details = el("details", { class: "profile-learning" });
  details.appendChild(el("summary", {}, ui(locale, "details")));
  for (const node of detailNodes) details.appendChild(node);
  const references = el("details", { class: "profile-learning" });
  references.appendChild(el("summary", {}, ui(locale, "sources")));
  for (const node of sourceNodes) references.appendChild(node);
  clear(section);
  section.append(back, identity, guidanceNote, core, action);
  if (beginnerNode) section.appendChild(beginnerNode);
  if (pairingNode) section.appendChild(pairingNode);
  if (bottleNode) section.appendChild(bottleNode);
  if (moreNode) section.appendChild(moreNode);
  if (suggestionsHeading) section.appendChild(suggestionsHeading);
  if (suggestionsNode) section.appendChild(suggestionsNode);
  section.append(details, references);

  container.appendChild(section);
  return section;
}

export function renderProfileNotFound(container, profileId) {
  clear(container);
  const section = el("section", { class: "profile-view" });
  section.appendChild(el("a", { href: "#/explore", class: "back-link" }, "← Back to explore"));
  section.appendChild(el("h2", {}, "Profile not found"));
  section.appendChild(el("p", {}, `No profile exists with the id “${profileId}”.`));
  container.appendChild(section);
}
