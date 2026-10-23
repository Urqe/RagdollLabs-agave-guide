import { el, clear, safeLink } from "./dom-utils.js";
import { ui } from "./presentation.js";
import { localizedTitle, fieldEs } from "./editorial.js";
import { SPIRIT_LABELS } from "./spirit-labels.js";
import { tasteNote } from "./taste-notes.js";

/**
 * Release 21 — dedicated plant and spirit-tradition pages. These turn the
 * Release 15 entities into full educational pages with the structure the
 * plan requires, keeping honest framing (no universal sensory claims, no
 * merged local names, wild vs cultivated distinguished) and a clear way
 * back to discovery.
 */

function backLink(href, label) {
  return el("a", { href, class: "back-link" }, label);
}

function sourcesBlock(sources, sourceIds, t, locale) {
  const list = el("ul", { class: "source-list" });
  for (const id of sourceIds || []) {
    const source = sources.find((s) => s.id === id);
    if (!source) continue;
    const li = el("li");
    li.appendChild(safeLink(source.url, source.title, { class: "source-link" }));
    li.appendChild(el("span", { class: "source-kind" }, ` — ${source.verified ? `${ui(locale, "verifiedAs").replace("{date}", source.verified)}` : ""}`));
    list.appendChild(li);
  }
  return list;
}

function relatedProfileList(profiles, ids, locale, origin) {
  const ul = el("ul", { class: "discovery-matches" });
  for (const id of ids || []) {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) continue;
    const li = el("li");
    const a = el("a", { class: "discovery-card", href: `#/profile/${encodeURIComponent(profile.id)}${origin ? `?origin=${encodeURIComponent(origin)}` : ""}` });
    a.appendChild(el("span", { class: "eyebrow" }, SPIRIT_LABELS[profile.spirit] || profile.spirit));
    a.appendChild(el("strong", {}, localizedTitle("profile", profile.id, profile.title, locale)));
    a.appendChild(el("span", { class: "discovery-notes" }, (profile.tasteNotes || []).slice(0, 3).map((n) => tasteNote(n, locale)).join(" · ")));
    li.appendChild(a);
    ul.appendChild(li);
  }
  return ul;
}

/**
 * Plant page: identity, at a glance, where it grows, harvesting and
 * production, qualified sensory tendencies, regional expressions,
 * sustainability, further reading (sources). Beginners get the glance
 * line immediately; technical detail follows.
 */
export function renderPlantPage(container, { plant, plants, regions, traditions, profiles, sources, locale = null }) {
  clear(container);
  const t = (key) => (locale ? locale.t(key) : key);
  const section = el("section", { class: "plant-view entity-view", "aria-labelledby": "plant-title" });
  section.appendChild(backLink("#/discover", t("plant.backToDiscover")));
  section.appendChild(el("p", { class: "eyebrow" }, t("plant.eyebrow")));
  section.appendChild(el("h1", { id: "plant-title" }, plant.species));

  const identity = el("p", { class: "view-intro" }, plant.id.startsWith("dasylirion") ? t("plant.notAnAgave") : t("plant.isAnAgave"));
  section.appendChild(identity);

  section.appendChild(el("h2", {}, t("plant.atAGlance")));
  section.appendChild(el("p", { class: "view-intro" }, fieldEs("plant", plant.id, "atAGlance", locale) || plant.atAGlance || plant.cultivation));

  const alsoKnown = el("p", { class: "learn-names" });
  alsoKnown.appendChild(document.createTextNode(t("plant.alsoKnownAs") + " "));
  alsoKnown.appendChild(document.createTextNode((plant.commonNames || []).map((n) => `${n.name} (${n.region})`).join(", ")));
  section.appendChild(alsoKnown);

  section.appendChild(el("h2", {}, t("plant.whereItGrows")));
  section.appendChild(el("p", {}, fieldEs("plant", plant.id, "whereItGrows", locale) || plant.whereItGrows || ""));
  if ((plant.regionIds || []).length) {
    const row = el("p", { class: "learn-usedby" });
    row.appendChild(document.createTextNode(t("plant.regions") + " "));
    for (const rid of plant.regionIds) {
      const region = (regions || []).find((r) => r.id === rid);
      if (region) {
        row.appendChild(el("a", { href: `#/discover/region/${encodeURIComponent(rid)}`, class: "discovery-chip" }, fieldEs("region", rid, "name", locale) || region.name));
        row.appendChild(document.createTextNode(" "));
      }
    }
    section.appendChild(row);
  }

  section.appendChild(el("h2", {}, t("plant.harvestProduction")));
  section.appendChild(el("p", {}, fieldEs("plant", plant.id, "harvestProduction", locale) || plant.harvestProduction || plant.cultivation));
  section.appendChild(el("p", { class: "editorial-note" }, t("plant.cultivationLabel") + ": " + plant.cultivation));
  if (plant.uncertainty) section.appendChild(el("p", { class: "editorial-note" }, fieldEs("plant", plant.id, "uncertainty", locale) || plant.uncertainty));

  section.appendChild(el("h2", {}, t("plant.sensoryTendencies")));
  section.appendChild(el("p", {}, fieldEs("plant", plant.id, "sensoryTendencies", locale) || plant.sensoryTendencies || ""));

  section.appendChild(el("h2", {}, t("plant.regionalExpressions")));
  section.appendChild(el("p", { class: "editorial-note" }, t("plant.expressionsNote")));
  section.appendChild(relatedProfileList(profiles, plant.profileIds || [], locale, `plant:${plant.id}`));

  section.appendChild(el("h2", {}, t("plant.sustainability")));
  section.appendChild(el("p", {}, fieldEs("plant", plant.id, "sustainability", locale) || plant.sustainability || ""));

  section.appendChild(el("h2", {}, t("plant.furtherReading")));
  section.appendChild(sourcesBlock(sources, plant.sourceIds, t, locale));

  // Pair 11: one clear onward action after the reference material.
  section.appendChild(el("a", { href: "#/explore", class: "cta-link" }, t("plant.browseStyles")));

  container.appendChild(section);
}

/**
 * Tradition page: what it is, origin, history and cultural significance,
 * materials, traditional production, distinguishing traits, legal
 * status, regional variations, beginner starting points, expressions
 * for exploration.
 */
export function renderTraditionPage(container, { tradition, traditions, regions, plants, profiles, bottles, sources, locale = null }) {
  clear(container);
  const t = (key) => (locale ? locale.t(key) : key);
  const section = el("section", { class: "tradition-view entity-view", "aria-labelledby": "tradition-title" });
  section.appendChild(backLink("#/discover", t("plant.backToDiscover")));
  section.appendChild(el("p", { class: "eyebrow" }, t("tradition.eyebrow")));
  section.appendChild(el("h1", { id: "tradition-title" }, fieldEs("tradition", tradition.id, "name", locale) || tradition.name));

  section.appendChild(el("h2", {}, t("tradition.whatItIs")));
  section.appendChild(el("p", { class: "view-intro" }, fieldEs("tradition", tradition.id, "origin", locale) || tradition.origin));

  section.appendChild(el("h2", {}, t("tradition.history")));
  section.appendChild(el("p", {}, fieldEs("tradition", tradition.id, "history", locale) || tradition.history));

  section.appendChild(el("h2", {}, t("tradition.legalStatus")));
  section.appendChild(el("p", {}, fieldEs("tradition", tradition.id, "legalStatus", locale) || tradition.legalStatus));

  section.appendChild(el("h2", {}, t("tradition.materials")));
  section.appendChild(el("p", {}, fieldEs("tradition", tradition.id, "materials", locale) || tradition.materials));
  if ((tradition.plantIds || []).length) {
    const row = el("p", { class: "learn-usedby" });
    row.appendChild(document.createTextNode(t("tradition.plantsLink") + " "));
    for (const pid of tradition.plantIds) {
      const plant = (plants || []).find((p) => p.id === pid);
      if (plant) {
        row.appendChild(el("a", { href: `#/plant/${encodeURIComponent(pid)}`, class: "discovery-chip" }, plant.species));
        row.appendChild(document.createTextNode(" "));
      }
    }
    section.appendChild(row);
  }

  section.appendChild(el("h2", {}, t("tradition.production")));
  section.appendChild(el("p", {}, fieldEs("tradition", tradition.id, "practices", locale) || tradition.practices));

  section.appendChild(el("h2", {}, t("tradition.distinctions")));
  section.appendChild(el("p", {}, fieldEs("tradition", tradition.id, "diversity", locale) || tradition.diversity));

  if (tradition.sustainability) {
    section.appendChild(el("h2", {}, t("plant.sustainability")));
    section.appendChild(el("p", {}, fieldEs("tradition", tradition.id, "sustainability", locale) || tradition.sustainability));
  }

  section.appendChild(el("h2", {}, t("tradition.regionalVariations")));
  if ((tradition.regionIds || []).length) {
    const row = el("p", { class: "learn-usedby" });
    for (const rid of tradition.regionIds) {
      const region = (regions || []).find((r) => r.id === rid);
      if (region) {
        row.appendChild(el("a", { href: `#/discover/region/${encodeURIComponent(rid)}`, class: "discovery-chip" }, fieldEs("region", rid, "name", locale) || region.name));
        row.appendChild(document.createTextNode(" "));
      }
    }
    section.appendChild(row);
  } else {
    section.appendChild(el("p", { class: "empty-state" }, t("tradition.noRegions")));
  }

  const traditionProfiles = profiles.filter((p) => p.traditionId === tradition.id);
  section.appendChild(el("h2", {}, t("tradition.startingPoints")));
  if (traditionProfiles.length) {
    const beginner = traditionProfiles.find((p) => p.beginnerNote) || traditionProfiles[0];
    section.appendChild(el("p", { class: "beginner-note" }, fieldEs("profile", beginner.id, "beginnerNote", locale) || beginner.beginnerNote || ""));
    const startRow = el("p", { class: "learn-usedby" });
    startRow.appendChild(el("a", { class: "discovery-chip", href: `#/profile/${encodeURIComponent(beginner.id)}?origin=${encodeURIComponent(`spirit:${tradition.id}`)}` }, localizedTitle("profile", beginner.id, beginner.title, locale)));
    section.appendChild(startRow);
  } else {
    section.appendChild(el("p", { class: "empty-state" }, t("tradition.noProfiles")));
  }

  section.appendChild(el("h2", {}, t("tradition.expressions")));
  section.appendChild(relatedProfileList(profiles, traditionProfiles.map((p) => p.id), locale, `spirit:${tradition.id}`));

  section.appendChild(el("h2", {}, t("plant.furtherReading")));
  section.appendChild(sourcesBlock(sources, tradition.sourceIds, t, locale));

  // Pair 11: one clear onward action after the reference material.
  section.appendChild(el("a", { href: "#/explore", class: "cta-link" }, t("plant.browseStyles")));

  container.appendChild(section);
}
