import { el, safeLink, clear } from "./dom-utils.js";
import { STATE_NAMES } from "./map.js";
import { flavorMoods, ifYouLikeThis } from "./compare.js";
import { bottlesForProfile } from "./catalogue.js";
import { SPIRIT_LABELS, ADVENTUROUS_TRADITIONS } from "./spirit-labels.js";
import { ui, sensoryOverview, dimensionLabel } from "./presentation.js";
import { tasteNote } from "./taste-notes.js";
import { editorialText, fieldEs, fieldEsAny, localizedTitle, sourceKindLabel } from "./editorial.js";

function sourceLinks(sources, sourceIds, locale = null) {
  const list = el("ul", { class: "source-list" });
  for (const id of sourceIds) {
    const source = sources.find((s) => s.id === id);
    if (!source) continue;
    const item = el("li");
    item.appendChild(safeLink(source.url, source.title, { class: "source-link" }));
    item.appendChild(el("span", { class: "source-kind" }, ` — ${ui(locale, "kindSource").replace("{kind}", sourceKindLabel(source.kind, locale, ui))}`));
    list.appendChild(item);
  }
  return list;
}

function exampleBottleCard(bottle, sources, t, locale = null) {
  const L = (field, english) => fieldEs("bottle", bottle.id, field, locale) || english;
  const card = el("article", { class: "bottle-card", "aria-labelledby": "bottle-card-heading" });
  card.appendChild(el("h3", { id: "bottle-card-heading", class: "bottle-card-title" }, t("profile.exampleBottle")));
  const name = el("p", { class: "bottle-name" });
  name.appendChild(el("strong", {}, `${bottle.brand} ${bottle.expression}`));
  if (bottle.abv != null) {
        name.appendChild(el("span", { class: "bottle-abv" }, ` \u00b7 ${bottle.abv}% ${ui(locale, "factAbvLong")}`));
  }
  if (bottle.abv == null && bottle.abvNote) {
    name.appendChild(el("span", { class: "bottle-abv" }, ` \u00b7 ${L("abvNote", bottle.abvNote)}`));
  }
  card.appendChild(name);
  if (bottle.producer) card.appendChild(el("p", { class: "bottle-producer" }, bottle.producer));
  if (bottle.place) card.appendChild(el("p", { class: "bottle-place" }, bottle.place));
  if (bottle.composition) card.appendChild(el("p", { class: "bottle-composition editorial-note" }, `${ui(locale, "factComposition")}: ${L("composition", bottle.composition)}`));
  card.appendChild(el("p", { class: "bottle-review" }, L("reviewSummary", bottle.reviewSummary)));
  const linksLabel = el("p", { class: "bottle-links-label" }, t("profile.sourcesBottle"));
  card.appendChild(linksLabel);
  card.appendChild(collapsibleBottleSources(sources, bottle, t, locale));
  return card;
}

/**
 * Bottle reference links stay available but collapsed out of the reading
 * flow, mirroring the catalogue's source disclosure pattern.
 */
function collapsibleBottleSources(sources, bottle, t, locale = null) {
  const details = el("details", { class: "source-details" });
  const total = (bottle.sourceIds || []).length + (bottle.noteSourceIds || []).length;
  details.appendChild(el("summary", {}, `${t("learn.sources")} (${total})`));
  details.appendChild(sourceLinks(sources, bottle.sourceIds, locale));
  if (bottle.noteSourceIds && bottle.noteSourceIds.length > 0) {
    details.appendChild(el("p", { class: "source-group-label" }, t("catalogue.groupNote")));
    details.appendChild(sourceLinks(sources, bottle.noteSourceIds, locale));
  }
  return details;
}


/** Release 21: related destinations with a short why-relevant explanation. */
function exploreNextLinks(profile, allProfiles, locale) {
  const t = (key) => (locale ? locale.t(key) : key);
  const out = [];
  const title = (p) => localizedTitle("profile", p.id, p.title, locale);
  const href = (p) => `#/profile/${encodeURIComponent(p.id)}`;
  // Same plant, different region
  const samePlant = allProfiles.find((p) => p.id !== profile.id && (p.plantIds || []).some((pid) => (profile.plantIds || []).includes(pid)) && p.regionIds[0] !== profile.regionIds[0]);
  if (samePlant) out.push({ label: t("profile.exploreSamePlant"), profile: samePlant, reason: title(samePlant) });
  // Same tradition, different method (different processIds)
  const sameTradition = allProfiles.find((p) => p.id !== profile.id && p.traditionId === profile.traditionId && JSON.stringify([...(p.processIds || [])].sort()) !== JSON.stringify([...(profile.processIds || [])].sort()));
  if (sameTradition) out.push({ label: t("profile.exploreSameTradition"), profile: sameTradition, reason: title(sameTradition) });
  // Similar character (sensory overlap)
  const similar = ifYouLikeThis(profile, allProfiles, { maxSuggestions: 1 }).map((x) => x.profile)[0];
  if (similar) out.push({ label: t("profile.exploreSimilar"), profile: similar, reason: title(similar) });
  // More adventurous (different tradition entirely)
  const adventurous = allProfiles.find((p) => p.id !== profile.id && p.traditionId !== profile.traditionId && ADVENTUROUS_TRADITIONS.includes(p.traditionId) && !out.some((x) => x.profile.id === p.id));
  if (adventurous) out.push({ label: t("profile.exploreAdventurous"), profile: adventurous, reason: title(adventurous) });
  return out;
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
  const fromDiscovery = origin != null && !fromCatalogue;
  const originKind = fromDiscovery && origin.includes(":") ? origin.split(":")[0] : null;
  const originId = fromDiscovery && origin.includes(":") ? origin.split(":")[1] : null;
  const backHref = fromCatalogue
    ? "#/catalogue"
    : originKind === "profile"
      ? `#/profile/${encodeURIComponent(originId)}`
      : originKind === "plant" || originKind === "region" || originKind === "spirit" || originKind === "flavour"
        ? `#/discover/${encodeURIComponent(originKind)}/${encodeURIComponent(originId)}`
        : returnTo ? `#/explore/${encodeURIComponent(returnTo)}` : "#/explore";
  const backLabel = fromCatalogue
    ? t("profile.backCatalogue")
    : originKind === "profile"
      ? t("profile.backProfile")
      : fromDiscovery ? t("profile.backDiscover") : t("profile.backExplore");
  const back = el("a", { href: backHref, class: "back-link" }, backLabel);
  section.appendChild(back);

  section.appendChild(el("h1", { id: "profile-title" }, fieldEs("profile", profile.id, "title", locale) || profile.title));

  

  const place = el("p", { class: "profile-place" });
  place.appendChild(el("span", { class: "profile-spirit-tag" }, SPIRIT_LABELS[profile.spirit] || profile.spirit));
  place.appendChild(document.createTextNode(` · ${profile.stateName}, México`));
  section.appendChild(place);

  if (profile.placeCoords) {
    const c = profile.placeCoords;
    section.appendChild(el("p", { class: "profile-coords editorial-note" },
      ui(locale, "coordsNote")
        .replace("{lat}", c.lat.toFixed(2))
        .replace("{lon}", c.lon.toFixed(2))
        .replace("{precision}", c.precision)));
  }

  const contextText = editorialText("profile", profile.id, "context", profile.context, locale);
  const contextNode = el("p", { class: "profile-context" }, contextText.text);
  if (!contextText.translated) contextNode.appendChild(el("span", { class: "editorial-note untranslated-field" }, " " + ui(locale, "partialDisclosure")));
  section.appendChild(contextNode);

  

  const descriptionText = editorialText("profile", profile.id, "description", profile.description, locale);
  const descriptionNode = el("p", { class: "profile-description" }, descriptionText.text);
  if (!descriptionText.translated) descriptionNode.appendChild(el("span", { class: "editorial-note untranslated-field" }, " " + ui(locale, "partialDisclosure")));
  section.appendChild(descriptionNode);
  if (profile.beginnerNote) {
    section.appendChild(el("p", { class: "beginner-note" }, fieldEs("profile", profile.id, "beginnerNote", locale) || profile.beginnerNote));
  }
  const guidanceNote = el("p", { class: "editorial-note" },
    ui(locale, "guidance"));
  section.appendChild(guidanceNote);

  const craft = el("dl", { class: "profile-facts profile-craft" });
  if (profile.category) {
    craft.appendChild(el("dt", {}, ui(locale, "legal")));
    const categoryDd = el("dd", { class: "profile-category" });
    categoryDd.appendChild(document.createTextNode(fieldEs("profile", profile.id, "category", locale) || profile.category));
    categoryDd.appendChild(document.createTextNode(" "));
    categoryDd.appendChild(el("a", { href: "#/learn/terms", class: "term-link" }, t("profile.categoryLearn")));
    craft.appendChild(categoryDd);
  }
  if (profile.plant) {
    craft.appendChild(el("dt", {}, ui(locale, "plant")));
    const plantDd = el("dd", { class: "profile-plant" }, profile.plant);
    if (profile.plantId) {
      plantDd.appendChild(document.createTextNode(" "));
      plantDd.appendChild(el("a", { href: `#/plant/${encodeURIComponent(profile.plantId)}`, class: "plant-learn-link" }, t("profile.aboutPlant")));
    }
    craft.appendChild(plantDd);
  }
  if (profile.process) {
    craft.appendChild(el("dt", {}, ui(locale, "process")));
    craft.appendChild(el("dd", { class: "profile-process" }, fieldEs("profile", profile.id, "process", locale) || profile.process));
  }
  if (craft.childNodes.length > 0) section.appendChild(craft);

  

  

  const facts = el("dl", { class: "profile-facts" });
  facts.appendChild(el("dt", {}, ui(locale, "body")));
  facts.appendChild(el("dd", { class: "profile-body" }, ["light", "medium", "full"].includes(profile.body) ? ui(locale, profile.body) : profile.body));
  facts.appendChild(el("dt", {}, ui(locale, "notes")));
  const notes = el("dd", { class: "profile-taste" });
  const tasteList = el("ul", { class: "taste-list" });
  for (const note of profile.tasteNotes) tasteList.appendChild(el("li", {}, tasteNote(note, locale)));
  notes.appendChild(tasteList);
  facts.appendChild(notes);
  if (profile.smoke) {
    facts.appendChild(el("dt", {}, ui(locale, "smoke")));
    facts.appendChild(el("dd", { class: "profile-smoke" }, fieldEs("profile", profile.id, "smoke", locale) || profile.smoke));
  }
  facts.appendChild(el("dt", {}, ui(locale, "finish")));
  facts.appendChild(el("dd", { class: "profile-finish" }, fieldEs("profile", profile.id, "finish", locale) || profile.finish));
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

  if (bottle) section.appendChild(exampleBottleCard(bottle, sources, t, locale));

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
      if (other.reviewSummary) item.appendChild(el("p", { class: "bottle-review" }, fieldEs("bottle", other.id, "reviewSummary", locale) || other.reviewSummary));
      if (other.editorialNote) item.appendChild(el("p", { class: "editorial-note" }, fieldEs("bottle", other.id, "editorialNote", locale) || other.editorialNote));
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
    const esPairing = fieldEsAny("profile", profile.id, "pairing", locale);
    pairing.appendChild(el("p", {}, (esPairing && esPairing.serving) || profile.pairing.serving));
    const foods = (esPairing && esPairing.foods) || profile.pairing.foods;
    if (foods && foods.length > 0) {
      pairing.appendChild(el("p", {}, t("profile.pairingFoods") + " " + foods.join(", ") + "."));
    }
    section.appendChild(pairing);
  }
  

  const suggestions = ifYouLikeThis(profile, allProfiles);
  if (suggestions.length > 0) {
    const suggHeading = el("h3", { class: "suggestions-heading" }, t("profile.ifYouLike"));
    section.appendChild(suggHeading);
    const suggList = el("ul", { class: "suggestion-list" });
    for (const { profile: other, sharedDimensionKeys } of suggestions) {
      const item = el("li");
      const params = [];
      if (returnTo) params.push(`from=${encodeURIComponent(returnTo)}`);
      if (fromCatalogue) params.push("origin=catalogue");
      const link = el("a", {
        href: `#/profile/${encodeURIComponent(other.id)}` + (params.length ? `?${params.join("&")}` : ""),
        class: "suggestion-link",
      }, localizedTitle("profile", other.id, other.title, locale));
      item.appendChild(link);
      item.appendChild(el("span", { class: "search-result-reason" },
        ` — ${ui(locale, "sharesWith").replace("{list}", sharedDimensionKeys.map((k) => dimensionLabel(k, locale)).join(", "))}`));
      suggList.appendChild(item);
    }
    section.appendChild(suggList);
  }

  const learnLink = el("a", { href: "#/learn", class: "learn-callout-link" }, t("profile.learnLink"));
  section.appendChild(learnLink);

  const srcHeading = el("h3", { class: "sources-heading" }, t("profile.sources"));
  section.appendChild(srcHeading);
  section.appendChild(sourceLinks(sources, profile.sourceIds, locale));

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
    class: "compare-profile-link quiet-link" + (isSelected ? " is-selected" : "") + (isFull ? " is-full" : ""),
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

  // Release 21 redesign: visible "special" statement, character (the
  // sensory overview already rendered in core), "why it tastes this way",
  // "how to enjoy it", example bottles, then explore-next with reasons.
  if (profile.whyItTastes) {
    const whyBlock = el("section", { class: "profile-why", "aria-labelledby": "why-heading" });
    whyBlock.appendChild(el("h2", { id: "why-heading" }, t("profile.why")));
    const whyText = editorialText("profile", profile.id, "whyItTastes", profile.whyItTastes, locale);
    const whyP = el("p", {}, whyText.text);
    if (!whyText.translated) whyP.appendChild(el("span", { class: "editorial-note untranslated-field" }, " " + ui(locale, "partialDisclosure")));
    whyBlock.appendChild(whyP);
    whyBlock.appendChild(el("p", { class: "editorial-note" }, t("profile.whyNote")));
    section.appendChild(whyBlock);
  }

  if (pairingNode) {
    const enjoyBlock = el("section", { class: "profile-enjoy", "aria-labelledby": "enjoy-heading" });
    enjoyBlock.appendChild(el("h2", { id: "enjoy-heading" }, t("profile.enjoy")));
    enjoyBlock.appendChild(pairingNode);
    section.appendChild(enjoyBlock);
  }

  if (bottleNode || moreNode) {
    const bottlesBlock = el("section", { class: "profile-bottles", "aria-labelledby": "bottles-heading" });
    bottlesBlock.appendChild(el("h2", { id: "bottles-heading" }, t("profile.exampleBottle")));
    if (bottleNode) bottlesBlock.appendChild(bottleNode);
    if (moreNode) bottlesBlock.appendChild(moreNode);
    section.appendChild(bottlesBlock);
  }

  if (suggestionsHeading || suggestionsNode) {
    const nextBlock = el("section", { class: "profile-next", "aria-labelledby": "next-heading" });
    nextBlock.appendChild(el("h2", { id: "next-heading" }, t("profile.exploreNext")));
    if (suggestionsNode) nextBlock.appendChild(suggestionsNode);
    const suggestedIds = new Set((suggestions || []).map((x) => x.profile.id));
    const destinations = exploreNextLinks(profile, allProfiles, locale).filter((d) => !suggestedIds.has(d.profile.id));
    if (destinations.length) {
      const list = el("ul", { class: "discovery-matches" });
      for (const d of destinations) {
        const li = el("li");
        const a = el("a", { class: "discovery-card", href: `#/profile/${encodeURIComponent(d.profile.id)}?origin=${encodeURIComponent("profile:" + profile.id)}` });
        a.appendChild(el("span", { class: "eyebrow" }, d.label));
        a.appendChild(el("strong", {}, d.reason));
        li.appendChild(a);
        list.appendChild(li);
      }
      nextBlock.appendChild(list);
    }
    section.appendChild(nextBlock);
  }

  section.append(details, references);

  container.appendChild(section);
  return section;
}

export function renderProfileNotFound(container, profileId, locale = null) {
  clear(container);
  const t = (key, english) => (locale ? locale.t(key) : english);
  const section = el("section", { class: "profile-view" });
  section.appendChild(el("a", { href: "#/explore", class: "back-link" }, t("profile.backExplore", "← Back to explore")));
  section.appendChild(el("h2", {}, t("profile.notFound", "Profile not found")));
  section.appendChild(el("p", {}, t("profile.notFoundBody", "No profile exists with the id “{id}”.").replace("{id}", profileId)));
  container.appendChild(section);
}
