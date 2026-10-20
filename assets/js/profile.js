import { el, safeLink, clear } from "./dom-utils.js";
import { STATE_NAMES } from "./map.js";

const BODY_LABELS = { light: "Light body", medium: "Medium body", full: "Full body" };

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

function exampleBottleCard(bottle, sources) {
  const card = el("article", { class: "bottle-card", "aria-labelledby": "bottle-card-heading" });
  card.appendChild(el("h3", { id: "bottle-card-heading", class: "bottle-card-title" }, "Example bottle"));
  const name = el("p", { class: "bottle-name" });
  name.appendChild(el("strong", {}, `${bottle.brand} ${bottle.expression}`));
  if (bottle.abv != null) {
    name.appendChild(el("span", { class: "bottle-abv" }, ` · ${bottle.abv}% ABV`));
  }
  card.appendChild(name);
  card.appendChild(el("p", { class: "bottle-review" }, bottle.reviewSummary));
  const linksLabel = el("p", { class: "bottle-links-label" }, "Sources for this bottle:");
  card.appendChild(linksLabel);
  card.appendChild(sourceLinks(sources, bottle.sourceIds));
  return card;
}

/**
 * Profile view: title, place/style context, description, body, taste notes,
 * smoke (where relevant), finish, one example bottle card and source links.
 */
export function renderProfile(container, { profile, bottle, sources }) {
  clear(container);
  const section = el("section", { class: "profile-view", "aria-labelledby": "profile-title" });

  const back = el("a", { href: "#/explore", class: "back-link" }, "← Back to explore");
  section.appendChild(back);

  section.appendChild(el("h2", { id: "profile-title" }, profile.title));

  const place = el("p", { class: "profile-place" });
  place.appendChild(el("span", { class: "profile-spirit-tag" }, profile.spirit === "mezcal" ? "Mezcal" : "Tequila"));
  place.appendChild(document.createTextNode(` · ${profile.stateName}, México`));
  section.appendChild(place);

  section.appendChild(el("p", { class: "profile-context" }, profile.context));

  const guidanceNote = el("p", { class: "editorial-note" },
    "Editorial style guidance — a description of the style, not a review or rating of any bottle.");
  section.appendChild(guidanceNote);

  section.appendChild(el("p", { class: "profile-description" }, profile.description));

  const facts = el("dl", { class: "profile-facts" });
  facts.appendChild(el("dt", {}, "Body"));
  facts.appendChild(el("dd", { class: "profile-body" }, BODY_LABELS[profile.body] || profile.body));
  facts.appendChild(el("dt", {}, "Taste notes"));
  const notes = el("dd", { class: "profile-taste" });
  const tasteList = el("ul", { class: "taste-list" });
  for (const note of profile.tasteNotes) tasteList.appendChild(el("li", {}, note));
  notes.appendChild(tasteList);
  facts.appendChild(notes);
  if (profile.smoke) {
    facts.appendChild(el("dt", {}, "Smoke"));
    facts.appendChild(el("dd", { class: "profile-smoke" }, profile.smoke));
  }
  facts.appendChild(el("dt", {}, "Finish"));
  facts.appendChild(el("dd", { class: "profile-finish" }, profile.finish));
  section.appendChild(facts);

  if (bottle) section.appendChild(exampleBottleCard(bottle, sources));

  const srcHeading = el("h3", { class: "sources-heading" }, "Sources for this profile");
  section.appendChild(srcHeading);
  section.appendChild(sourceLinks(sources, profile.sourceIds));

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
