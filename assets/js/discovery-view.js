import { el, clear } from "./dom-utils.js";
import { navigateTo } from "./router.js";
import { ui } from "./presentation.js";
import { localizedTitle } from "./editorial.js";
import { SPIRIT_LABELS, ADVENTUROUS_TRADITIONS } from "./spirit-labels.js";
import { flavorMoods } from "./compare.js";

/**
 * Release 17 — Three Discovery Paths. One surface with three entry
 * points (plant, region, spirit) plus a flavour finder, all reading the
 * same normalized entities from Release 15. Every card links to existing
 * profile routes so discovery never creates a dead end.
 */


const FLAVOUR_LABEL_KEYS = {
  "fresh-herbal": "flavourFreshHerbal",
  "fruity-floral": "flavourFruityFloral",
  "smoky-earthly": "flavourSmokyEarthy",
  "peppery-spicy": "flavourPepperySpicy",
  "rich-oak": "flavourRichOak",
  "adventurous": "flavourAdventurous",
};
const FLAVOUR_INTRO_KEYS = {
  "fresh-herbal": "flavourIntroFreshHerbal",
  "fruity-floral": "flavourIntroFruityFloral",
  "smoky-earthly": "flavourIntroSmokyEarthy",
  "peppery-spicy": "flavourIntroPepperySpicy",
  "rich-oak": "flavourIntroRichOak",
  "adventurous": "flavourIntroAdventurous",
};
const REASON_KEYS = {
  herbal: "reasonHerbal",
  fruit: "reasonFruit",
  smoke: "reasonSmoke",
  pepper: "reasonPepper",
  oak: "reasonOak",
};
function flavourLabel(id) { return FLAVOUR_LABEL_KEYS[id] || "flavourUnknown"; }
function flavourIntro(id) { return FLAVOUR_INTRO_KEYS[id] || "flavourUnknown"; }
function reasonKey(key) { return REASON_KEYS[key] || "reasonSuffix"; }

const FLAVOUR_CATEGORIES = [
  { id: "fresh-herbal", match: (p) => (p.sensory?.herbal === "high" && (p.sensory?.smoke === "none" || p.sensory?.smoke === "low")) },
  { id: "fruity-floral", match: (p) => (p.sensory?.fruit === "high" || p.sensory?.fruit === "medium") && (p.sensory?.smoke === "none" || p.sensory?.smoke === "low") },
  { id: "smoky-earthly", match: (p) => p.sensory?.smoke === "high" || p.sensory?.smoke === "medium" },
  { id: "peppery-spicy", match: (p) => p.sensory?.pepper === "high" || p.sensory?.pepper === "medium" },
  { id: "rich-oak", match: (p) => p.sensory?.oak === "high" || p.sensory?.oak === "medium" },
  { id: "adventurous", match: (p) => ADVENTUROUS_TRADITIONS.includes(p.traditionId || p.spirit) },
];

function profileLinkRow(profile, locale, origin) {
  const href = `#/profile/${encodeURIComponent(profile.id)}${origin ? `?origin=${encodeURIComponent(origin)}` : ""}`;
  const link = el("a", { class: "discovery-card", href });
  link.appendChild(el("span", { class: "eyebrow" }, SPIRIT_LABELS[profile.spirit] || profile.spirit));
  link.appendChild(el("strong", {}, localizedTitle("profile", profile.id, profile.title, locale)));
  link.appendChild(el("span", { class: "discovery-place" }, `${profile.stateName}, México`));
  link.appendChild(el("span", { class: "discovery-notes" }, (profile.tasteNotes || []).slice(0, 3).join(" · ")));
  return link;
}

function profilesCardList(profiles, locale, origin, emptyText) {
  if (!profiles.length) return el("p", { class: "empty-state" }, emptyText);
  const list = el("div", { class: "discovery-grid" });
  for (const p of profiles) list.appendChild(profileLinkRow(p, locale, origin));
  return list;
}

function linkChips(items, kind, labelOf, locale) {
  const nav = el("ul", { class: "discovery-chip-list" });
  if (!items.length) return nav.appendChild(el("li", {}, el("span", { class: "empty-state" }, ui(locale, "discoverNoneYet"))), nav);
  for (const item of items) {
    const li = el("li");
    li.appendChild(el("a", { class: "discovery-chip", href: `#/discover/${kind}/${encodeURIComponent(item.id)}` }, labelOf(item)));
    nav.appendChild(li);
  }
  return nav;
}

function backToDiscover(locale) {
  return el("a", { class: "text-action", href: "#/discover" }, ui(locale, "discoverBack") + " →");
}

function sectionHeader(id, text) {
  return el("h2", { id, tabindex: "-1" }, text);
}

/** Browse hub: the three entry points as equal, keyboard-accessible lists. */
function renderHub(container, { plants, regions, traditions, profiles, locale }) {
  const section = el("section", { class: "discover-view", "aria-labelledby": "discover-heading" });
  section.appendChild(el("h1", { id: "discover-heading" }, ui(locale, "discoverHeading")));
  section.appendChild(el("p", { class: "view-intro" }, ui(locale, "discoverIntro")));

  const compare = (a, b) => (locale ? locale.compare(a, b) : a.localeCompare(b));

  const plantBlock = el("section", { class: "discover-block", "aria-labelledby": "discover-plants" });
  plantBlock.appendChild(sectionHeader("discover-plants", ui(locale, "discoverByPlant")));
  plantBlock.appendChild(el("p", { class: "view-intro" }, ui(locale, "discoverByPlantIntro")));
  plantBlock.appendChild(linkChips(
    [...plants].sort((a, b) => compare(a.species, b.species)),
    "plant", (p) => `${p.species} — ${(p.commonNames || []).map((n) => n.name).slice(0, 2).join(", ")}`, locale));
  section.appendChild(plantBlock);

  const regionBlock = el("section", { class: "discover-block", "aria-labelledby": "discover-regions" });
  regionBlock.appendChild(sectionHeader("discover-regions", ui(locale, "discoverByRegion")));
  regionBlock.appendChild(el("p", { class: "view-intro" }, ui(locale, "discoverByRegionIntro")));
  regionBlock.appendChild(linkChips(
    [...regions].sort((a, b) => compare(a.name, b.name)),
    "region", (r) => r.name, locale));
  section.appendChild(regionBlock);

  const spiritBlock = el("section", { class: "discover-block", "aria-labelledby": "discover-spirits" });
  spiritBlock.appendChild(sectionHeader("discover-spirits", ui(locale, "discoverBySpirit")));
  spiritBlock.appendChild(el("p", { class: "view-intro" }, ui(locale, "discoverBySpiritIntro")));
  spiritBlock.appendChild(linkChips(
    [...traditions].sort((a, b) => compare(a.name, b.name)),
    "spirit", (t) => t.name, locale));
  section.appendChild(spiritBlock);

  const flavourBlock = el("section", { class: "discover-block", "aria-labelledby": "discover-flavours" });
  flavourBlock.appendChild(sectionHeader("discover-flavours", ui(locale, "discoverByFlavour")));
  flavourBlock.appendChild(el("p", { class: "view-intro" }, ui(locale, "discoverByFlavourIntro")));
  flavourBlock.appendChild(linkChips(
    FLAVOUR_CATEGORIES.map((c) => ({ id: c.id })),
    "flavour", (c) => ui(locale, flavourLabel(c.id, locale)), locale));
  section.appendChild(flavourBlock);

  container.appendChild(section);
}

/** Explore by Plant detail. */
function renderPlant(container, { plant, plants, regions, profiles, locale }) {
  const section = el("section", { class: "discover-view", "aria-labelledby": "discover-heading" });
  section.appendChild(backToDiscover(locale));
  section.appendChild(el("p", { class: "eyebrow" }, ui(locale, "discoverByPlant")));
  section.appendChild(el("h1", { id: "discover-heading" }, plant.species));
  section.appendChild(el("p", { class: "view-intro" }, `${ui(locale, "alsoKnownAs")}: ${(plant.commonNames || []).map((n) => `${n.name} (${n.region})`).join("; ")}`));
  section.appendChild(el("p", { class: "view-intro" }, `${ui(locale, "cultivationLabel")}: ${plant.cultivation}`));
  if (plant.uncertainty) section.appendChild(el("p", { class: "editorial-note" }, plant.uncertainty));

  const traditionsBlock = el("section", { class: "discover-block", "aria-labelledby": "plant-traditions" });
  traditionsBlock.appendChild(sectionHeader("plant-traditions", ui(locale, "traditionsUsing")));
  const traditionIds = plant.traditionIds || [];
  traditionsBlock.appendChild(linkChips(
    traditionIds.map((id) => ({ id })),
    "spirit", (t) => SPIRIT_LABELS[t.id] || t.id, locale));
  section.appendChild(traditionsBlock);

  const regionsBlock = el("section", { class: "discover-block", "aria-labelledby": "plant-regions" });
  regionsBlock.appendChild(sectionHeader("plant-regions", ui(locale, "whereItGrows")));
  const regionName = (id) => {
    const r = (regions || []).find((x) => x.id === id);
    return r ? r.name : id;
  };
  regionsBlock.appendChild(linkChips(
    (plant.regionIds || []).map((id) => ({ id })),
    "region", (r) => regionName(r.id), locale));
  section.appendChild(regionsBlock);

  const expr = profiles.filter((p) => (p.plantIds || []).includes(plant.id));
  const exprBlock = el("section", { class: "discover-block", "aria-labelledby": "plant-expressions" });
  exprBlock.appendChild(sectionHeader("plant-expressions", ui(locale, "expressionsFromPlant")));
  exprBlock.appendChild(el("p", { class: "view-intro" }, ui(locale, "expressionsNote")));
  exprBlock.appendChild(profilesCardList(expr, locale, `plant:${plant.id}`, ui(locale, "discoverNoneYet")));
  section.appendChild(exprBlock);

  const others = plants.filter((p) => p.id !== plant.id && (p.traditionIds || []).some((t) => traditionIds.includes(t)));
  if (others.length) {
    const otherBlock = el("section", { class: "discover-block", "aria-labelledby": "plant-others" });
    otherBlock.appendChild(sectionHeader("plant-others", ui(locale, "otherPlantsSameTradition")));
    otherBlock.appendChild(linkChips(others, "plant", (p) => p.species, locale));
    section.appendChild(otherBlock);
  }
  container.appendChild(section);
}

/** Explore by Region detail. */
function renderRegion(container, { region, plants, profiles, locale }) {
  const section = el("section", { class: "discover-view", "aria-labelledby": "discover-heading" });
  section.appendChild(backToDiscover(locale));
  section.appendChild(el("p", { class: "eyebrow" }, ui(locale, "discoverByRegion")));
  section.appendChild(el("h1", { id: "discover-heading" }, region.name));
  section.appendChild(el("p", { class: "view-intro" }, region.geography));
  section.appendChild(el("p", { class: "editorial-note" }, region.distinctions));

  const traditionsBlock = el("section", { class: "discover-block", "aria-labelledby": "region-traditions" });
  traditionsBlock.appendChild(sectionHeader("region-traditions", ui(locale, "traditionsHere")));
  traditionsBlock.appendChild(linkChips(
    (region.traditionIds || []).map((id) => ({ id })),
    "spirit", (t) => SPIRIT_LABELS[t.id] || t.id, locale));
  section.appendChild(traditionsBlock);

  const plantsBlock = el("section", { class: "discover-block", "aria-labelledby": "region-plants" });
  plantsBlock.appendChild(sectionHeader("region-plants", ui(locale, "plantsHere")));
  const plantName = (id) => {
    const pl = (plants || []).find((x) => x.id === id);
    return pl ? pl.species : id;
  };
  plantsBlock.appendChild(linkChips(
    (region.plantIds || []).map((id) => ({ id })),
    "plant", (p) => plantName(p.id), locale));
  section.appendChild(plantsBlock);

  const expr = profiles.filter((p) => (p.regionIds || []).includes(region.id));
  const exprBlock = el("section", { class: "discover-block", "aria-labelledby": "region-expressions" });
  exprBlock.appendChild(sectionHeader("region-expressions", ui(locale, "expressionsHere")));
  exprBlock.appendChild(profilesCardList(expr, locale, `region:${region.id}`, ui(locale, "discoverNoneYet")));
  section.appendChild(exprBlock);

  const statesAnchor = el("a", { class: "text-action", href: `#/explore/${region.stateId}` }, ui(locale, "seeState") + " →");
  const statesLink = el("p");
  statesLink.appendChild(statesAnchor);
  section.appendChild(statesLink);
  container.appendChild(section);
}

/** Explore by Spirit detail. */
function renderSpirit(container, { tradition, profiles, bottles, locale }) {
  const section = el("section", { class: "discover-view", "aria-labelledby": "discover-heading" });
  section.appendChild(backToDiscover(locale));
  section.appendChild(el("p", { class: "eyebrow" }, ui(locale, "discoverBySpirit")));
  section.appendChild(el("h1", { id: "discover-heading" }, tradition.name));
  section.appendChild(el("p", { class: "view-intro" }, tradition.origin));
  const facts = el("dl", { class: "profile-facts profile-craft" });
  for (const [term, value] of [[ui(locale, "tHistory"), tradition.history], [ui(locale, "tLegal"), tradition.legalStatus], [ui(locale, "tMaterials"), tradition.materials], [ui(locale, "tPractices"), tradition.practices], [ui(locale, "tDiversity"), tradition.diversity]]) {
    facts.appendChild(el("dt", {}, term));
    facts.appendChild(el("dd", {}, value));
  }
  section.appendChild(facts);

  const expr = profiles.filter((p) => p.traditionId === tradition.id);
  const exprBlock = el("section", { class: "discover-block", "aria-labelledby": "spirit-expressions" });
  exprBlock.appendChild(sectionHeader("spirit-expressions", ui(locale, "expressionsFromTradition")));
  exprBlock.appendChild(profilesCardList(expr, locale, `spirit:${tradition.id}`, ui(locale, "discoverNoneYet")));
  section.appendChild(exprBlock);

  const traditionBottles = bottles.filter((b) => b.traditionId === tradition.id);
  if (traditionBottles.length) {
    const bottleBlock = el("section", { class: "discover-block", "aria-labelledby": "spirit-bottles" });
    bottleBlock.appendChild(sectionHeader("spirit-bottles", ui(locale, "bottlesFromTradition")));
    const list = el("div", { class: "discovery-grid" });
    for (const b of traditionBottles.slice(0, 6)) {
      const link = el("a", { class: "discovery-card", href: `#/catalogue?brand=${encodeURIComponent(b.brand)}` });
      link.appendChild(el("span", { class: "eyebrow" }, ui(locale, "catalogue.allBottles")));
      link.appendChild(el("strong", {}, `${b.brand} — ${b.expression}`));
      link.appendChild(el("span", { class: "discovery-place" }, b.place || ""));
      list.appendChild(link);
    }
    bottleBlock.appendChild(list);
    bottleBlock.appendChild(el("a", { class: "text-action", href: "#/catalogue" }, ui(locale, "seeCatalogue") + " →"));
    section.appendChild(bottleBlock);
  }
  container.appendChild(section);
}

/** Flavour-based discovery with honest match explanations. */
function renderFlavour(container, { flavourId, profiles, locale }) {
  const category = FLAVOUR_CATEGORIES.find((c) => c.id === flavourId);
  const section = el("section", { class: "discover-view", "aria-labelledby": "discover-heading" });
  section.appendChild(backToDiscover(locale));
  section.appendChild(el("p", { class: "eyebrow" }, ui(locale, "discoverByFlavour")));
  section.appendChild(el("h1", { id: "discover-heading" }, ui(locale, flavourLabel(flavourId, locale))));
  if (!category) {
    section.appendChild(el("p", { class: "empty-state" }, ui(locale, "flavourUnknown")));
    container.appendChild(section);
    return;
  }
  section.appendChild(el("p", { class: "view-intro" }, ui(locale, flavourIntro(flavourId, locale))));

  const matched = profiles.filter(category.match);
  const list = el("ul", { class: "discovery-matches" });
  for (const p of matched) {
    const reasons = flavourReasons(p, category.id, locale);
    const li = el("li");
    li.appendChild(profileLinkRow(p, locale, `flavour:${flavourId}`));
    li.appendChild(el("p", { class: "discovery-reason" }, reasons));
    list.appendChild(li);
  }
  section.appendChild(list);
  if (!matched.length) section.appendChild(el("p", { class: "empty-state" }, ui(locale, "discoverNoneYet")));
  section.appendChild(el("p", { class: "editorial-note" }, ui(locale, "flavourDisclaimer")));
  container.appendChild(section);
}

/** Short, honest explanation of why a profile matches a flavour category. */
function flavourReasons(profile, categoryId, locale) {
  const s = profile.sensory || {};
  const reasons = [];
  const push = (key, text) => reasons.push(ui(locale, reasonKey(key, locale)).replace("{value}", ui(locale, "level." + (text || "unknown")).toLowerCase()));
  if (categoryId === "fresh-herbal") push("herbal", s.herbal);
  if (categoryId === "fruity-floral") push("fruit", s.fruit);
  if (categoryId === "smoky-earthly") push("smoke", s.smoke);
  if (categoryId === "peppery-spicy") push("pepper", s.pepper);
  if (categoryId === "rich-oak") push("oak", s.oak);
  if (categoryId === "adventurous") reasons.push(ui(locale, "reasonAdventurous").replace("{tradition}", SPIRIT_LABELS[profile.traditionId] || profile.traditionId));
  return reasons.join(" ") + " " + ui(locale, "reasonSuffix");
}

/**
 * Main entry: renders the hub or a detail page. Unknown ids render an
 * honest empty state with a way back (no dead ends).
 */
export function renderDiscover(container, { kind = null, id = null, plants, regions, traditions, profiles, bottles, locale = null }) {
  clear(container);
  if (kind === "plant") {
    const plant = plants.find((p) => p.id === id);
    if (plant) return renderPlant(container, { plant, plants, regions, profiles, locale });
  }
  if (kind === "region") {
    const region = regions.find((r) => r.id === id);
    if (region) return renderRegion(container, { region, plants, profiles, locale });
  }
  if (kind === "spirit") {
    const tradition = traditions.find((t) => t.id === id);
    if (tradition) return renderSpirit(container, { tradition, profiles, bottles, locale });
  }
  if (kind === "flavour") {
    return renderFlavour(container, { flavourId: id, profiles, locale });
  }
  if (kind) {
    const section = el("section", { class: "discover-view", "aria-labelledby": "discover-heading" });
    section.appendChild(backToDiscover(locale));
    section.appendChild(el("h1", { id: "discover-heading" }, ui(locale, "discoverNotFoundTitle")));
    section.appendChild(el("p", { class: "empty-state" }, ui(locale, "discoverNotFoundBody")));
    container.appendChild(section);
    return;
  }
  renderHub(container, { plants, regions, traditions, profiles, locale });
}
