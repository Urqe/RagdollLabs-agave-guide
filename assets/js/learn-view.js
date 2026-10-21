import { el, clear, safeLink } from "./dom-utils.js";
import { ui } from "./presentation.js";
import { sourceKindLabel } from "./editorial.js";

/** Sources stay available but out of the reading flow. */
function collapsibleSources(sources, sourceIds, t, locale = null) {
  const details = el("details", { class: "source-details" });
  const label = t("learn.sources") || "Sources";
  const summary = el("summary", {}, `${label} (${(sourceIds || []).length})`);
  details.appendChild(summary);
  details.appendChild(sourceLinks(sources, sourceIds, locale));
  return details;
}

/**
 * Narrow, non-empty keyword rules mapping a process id to the process
 * descriptions that genuinely use it. A rule must never match every
 * profile (no empty search term) and must not cross traditions: pit
 * roasting is not steam cooking, and resting in wood is not implied by
 * any roast mention.
 */
const PROCESS_KEYWORDS = {
  "pit-roast": ["pit roast", "pit-roasted", "roasted in earthen", "cylindrical pit", "conical ovens", "adobe-oven roast", "underground pit roast"],
  "steam-cook": ["steam-cooked", "steam cooked", "steam-cook", "oven/autoclave"],
  "sap-collection": ["sap-derived", "sap collected", "aguamiel collected", "aguamiel fermented"],
  "wild-fermentation": ["wild-yeast", "wild yeast", "wild-fermented", "open fermentation", "open wild-yeast", "wild-fe"],
  "distillation-methods": ["distilled", "distillation", "still"],
  "glass-resting": ["glass resting", "madurado", "glass-rested"],
  "wood-maturation": ["rested in oak", "rested in wood", "aged in oak", "wooden casks", "barrel-rested", "charcoal-filtered clear"],
  "filtration": ["filtered", "filtration"],
};

function relevantTo(profile, proc) {
  const text = (profile.process || "").toLowerCase();
  return (PROCESS_KEYWORDS[proc.id] || []).some((k) => k && text.includes(k));
}

function sourceLinks(sources, sourceIds, locale = null) {
  const list = el("ul", { class: "source-list" });
  for (const id of sourceIds || []) {
    const source = sources.find((s) => s.id === id);
    if (!source) continue;
    const item = el("li");
    item.appendChild(safeLink(source.url, source.title, { class: "source-link" }));
    item.appendChild(el("span", { class: "source-kind" }, ` — ${ui(locale, "kindSource").replace("{kind}", sourceKindLabel(source.kind, locale, ui))}${source.verified ? `, ${ui(locale, "verifiedAs").replace("{date}", source.verified)}` : ""}`));
    list.appendChild(item);
  }
  return list;
}

/**
 * Learn view: plant pages (with regional common names, scientific
 * identity, honest uncertainty, and links to the profiles/bottles that
 * use them), production explanations, and a label-terms glossary.
 */
export function renderLearn(container, { plants, processes, glossary, profiles, bottles, sources, locale = null }) {
  clear(container);
  const section = el("section", { class: "learn-view", "aria-labelledby": "learn-heading" });
  const t = (key) => (locale ? locale.t(key) : key);
  section.appendChild(el("h2", { id: "learn-heading" }, t("learn.heading")));
  const jumps = el("nav", { class: "learn-jumps", "aria-label": ui(locale, "learnSections") });
  for (const [id, label] of [["learn-plants", t("learn.plants")], ["learn-processes", t("learn.processes")], ["learn-terms", t("learn.terms")]]) {
    const jump = el("button", { type: "button", class: "nav-link learn-jump" }, label);
    jump.addEventListener("click", () => {
      const target = section.querySelector(`#${id}`);
      if (target && typeof target.scrollIntoView === "function") {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      target?.focus?.({ preventScroll: true });
    });
    jumps.appendChild(jump);
  }
  section.appendChild(jumps);
  section.appendChild(el("p", { class: "view-intro" },
    t("learn.intro")));

  // --- Plants ---
  section.appendChild(el("h3", { id: "learn-plants", tabindex: "-1" }, t("learn.plants")));
  for (const plant of plants) {
    const card = el("article", { class: "learn-card", "aria-labelledby": `plant-${plant.id}` });
    card.appendChild(el("h4", { id: `plant-${plant.id}` }, plant.species));
    const names = el("p", { class: "learn-names" });
    names.appendChild(document.createTextNode(
      t("learn.commonNames") + " " + plant.commonNames.map((n) => `${n.name} (${n.region})`).join(", ")
    ));
    card.appendChild(names);
    card.appendChild(el("p", { class: "learn-cultivation" }, `${t("learn.harvest")} ${plant.cultivation}.`));
    if (plant.uncertainty) {
      card.appendChild(el("p", { class: "editorial-note" }, `${t("learn.uncertainty")} ${plant.uncertainty}`));
    }
    const links = el("p", {});
    for (const pid of plant.profileIds || []) {
      const profile = profiles.find((p) => p.id === pid);
      if (profile) {
        links.appendChild(el("a", { href: `#/profile/${encodeURIComponent(profile.id)}`, class: "catalogue-profile-link" }, `${profile.title} → `));
      }
    }
    card.appendChild(links);
    card.appendChild(collapsibleSources(sources, plant.sourceIds, t, locale));
    section.appendChild(card);
  }

  // --- Processes ---
  section.appendChild(el("h3", { id: "learn-processes", tabindex: "-1" }, t("learn.processes")));
  for (const proc of processes) {
    const card = el("article", { class: "learn-card", "aria-labelledby": `process-${proc.id}` });
    card.appendChild(el("h4", { id: `process-${proc.id}` }, `${proc.name} — ${proc.stage}`));
    card.appendChild(el("p", {}, proc.explanation));
    const usedBy = profiles.filter((pr) => relevantTo(pr, proc));
    if (usedBy.length > 0) {
      const line = el("p", { class: "learn-usedby" }, `${t("learn.seenIn")} `);
      for (const pr of usedBy.slice(0, 4)) {
        line.appendChild(el("a", { href: `#/profile/${encodeURIComponent(pr.id)}`, class: "catalogue-profile-link" }, `${pr.title}; `));
      }
      card.appendChild(line);
    }
    card.appendChild(collapsibleSources(sources, proc.sourceIds, t, locale));
    section.appendChild(card);
  }

  // --- Glossary ---
  section.appendChild(el("h3", { id: "learn-terms", tabindex: "-1" }, t("learn.terms")));
  section.appendChild(el("p", { class: "view-intro" }, ui(locale, "classTerms")));
  for (const term of glossary) {
    const card = el("article", { class: "learn-card", "aria-labelledby": `term-${term.term.replace(/\s+/g, "-")}` });
    card.appendChild(el("h4", { id: `term-${term.term.replace(/\s+/g, "-")}` }, term.term));
    card.appendChild(el("p", { class: "learn-term-context" }, ui(locale, "contextPrefix") + term.context));
    card.appendChild(el("p", {}, term.definition));
    const related = profiles.filter((pr) => (pr.category || "").toLowerCase().includes(term.term.split(" ")[0].toLowerCase()));
    if (related.length > 0) {
      const line = el("p", { class: "learn-usedby" }, `${t("learn.relatesTo")} `);
      for (const pr of related.slice(0, 4)) {
        line.appendChild(el("a", { href: `#/profile/${encodeURIComponent(pr.id)}`, class: "catalogue-profile-link" }, `${pr.title}; `));
      }
      card.appendChild(line);
    }
    card.appendChild(collapsibleSources(sources, term.sourceIds, t, locale));
    section.appendChild(card);
  }

  container.appendChild(section);
}
