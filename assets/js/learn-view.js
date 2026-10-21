import { el, clear, safeLink } from "./dom-utils.js";

/** URL/focus-safe slug for term anchors (no slashes or accents). */
function termSlug(term) {
  return term.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
import { ui } from "./presentation.js";
import { sourceKindLabel, fieldEs } from "./editorial.js";
import { localizedTitle } from "./editorial.js";
import { SPIRIT_LABELS } from "./spirit-labels.js";

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

function profileExampleLink(profile, locale) {
  return el("a", { href: `#/profile/${encodeURIComponent(profile.id)}`, class: "catalogue-profile-link" },
    `${localizedTitle("profile", profile.id, profile.title, locale)} (${SPIRIT_LABELS[profile.spirit] || profile.spirit}) →`);
}

/** A block's example chips: real profiles, linked with honest framing. */
function exampleRow(label, profiles, locale) {
  if (!profiles.length) return null;
  const row = el("p", { class: "learn-usedby" }, `${label} `);
  for (const p of profiles) {
    row.appendChild(profileExampleLink(p, locale));
    row.appendChild(document.createTextNode(" "));
  }
  return row;
}

/**
 * Learn view — Release 19 progressive learning journey. Seven
 * non-sequential chapters (basic to advanced within each), followed by
 * the preserved reference sections: plants, processes, glossary. Every
 * chapter links to real profiles/plants/processes/terms; direct access
 * to reference sections is preserved through the jump nav.
 */
export function renderLearn(container, { chapters = [], plants, processes, glossary, profiles, bottles, sources, locale = null, section: deepSection = null }) {
  clear(container);
  const section = el("section", { class: "learn-view", "aria-labelledby": "learn-heading" });
  const t = (key) => (locale ? locale.t(key) : key);
  section.appendChild(el("h2", { id: "learn-heading" }, t("learn.heading")));
  section.appendChild(el("p", { class: "view-intro" }, t("learn.intro")));

  const jumps = el("nav", { class: "learn-jumps", "aria-label": ui(locale, "learnSections") });
  const jumpTargets = [];
  for (const ch of chapters) jumpTargets.push([`chapter-${ch.id}`, (fieldEs("chapter", ch.id, "title", locale) || ch.title)]);
  jumpTargets.push(["learn-plants", t("learn.plants")], ["learn-processes", t("learn.processes")], ["learn-terms", t("learn.terms")]);
  for (const [id, label] of jumpTargets) {
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

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const plantById = new Map((plants || []).map((p) => [p.id, p]));
  const processById = new Map((processes || []).map((p) => [p.id, p]));
  const terms = glossary || [];
  const termByTerm = new Map(terms.map((x) => [x.term, x]));

  for (const [index, ch] of chapters.entries()) {
    const card = el("article", { class: "learn-card learn-chapter", "aria-labelledby": `chapter-${ch.id}` });
    card.appendChild(el("h3", { id: `chapter-${ch.id}`, tabindex: "-1" },
      `${index + 1}. ${fieldEs("chapter", ch.id, "title", locale) || ch.title}`));
    card.appendChild(el("p", { class: "view-intro" }, fieldEs("chapter", ch.id, "intro", locale) || ch.intro));
    for (const block of ch.blocks || []) {
      const bi = ch.blocks.indexOf(block);
      const text = fieldEs("chapter", ch.id, "block" + bi, locale) || block.text;
      card.appendChild(el("p", { class: "learn-block" }, text));
      const exampleProfiles = (block.exampleProfileIds || []).map((id) => profileById.get(id)).filter(Boolean);
      const examples = exampleRow(t("learn.seenIn"), exampleProfiles, locale);
      if (examples) card.appendChild(examples);
      const plantProfiles = (block.plantIds || []).map((id) => plantById.get(id)).filter(Boolean);
      if (plantProfiles.length) {
        const row = el("p", { class: "learn-usedby" }, `${t("learn.plants")}: `);
        for (const pl of plantProfiles) {
          row.appendChild(el("a", { href: `#/discover/plant/${encodeURIComponent(pl.id)}`, class: "catalogue-profile-link" }, `${pl.species} →`));
          row.appendChild(document.createTextNode(" "));
        }
        card.appendChild(row);
      }
      const blockProcesses = (block.processIds || []).map((id) => processById.get(id)).filter(Boolean);
      if (blockProcesses.length) {
        const row = el("p", { class: "learn-usedby" }, `${t("learn.processes")}: `);
        for (const proc of blockProcesses) {
          row.appendChild(el("a", { href: "#/learn", class: "catalogue-profile-link", onclick: (event) => {
            event.preventDefault();
            const target = section.querySelector(`#process-${proc.id}`);
            if (target && typeof target.scrollIntoView === "function") {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            target?.focus?.({ preventScroll: true });
          } }, `${proc.name} (see process reference below) → `));
          row.appendChild(document.createTextNode(" "));
        }
        card.appendChild(row);
      }
      const blockTerms = (block.termIds || []).map((id) => termByTerm.get(id)).filter(Boolean);
      if (blockTerms.length) {
        const row = el("p", { class: "learn-usedby" }, `${t("learn.terms")}: `);
        for (const term of blockTerms) {
          row.appendChild(el("a", { href: `#/learn/terms`, class: "term-link", dataset: { term: term.term }, onclick: (event) => {
            event.preventDefault();
            const target = section.querySelector(`#term-${termSlug(term.term)}`);
            if (target && typeof target.scrollIntoView === "function") {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
            target?.focus?.({ preventScroll: true });
          } }, `${term.term} → `));
          row.appendChild(document.createTextNode(" "));
        }
        card.appendChild(row);
      }
      if (block.deeper) {
        const deeperText = fieldEs("chapter", ch.id, "block" + bi + "deeper", locale) || block.deeper;
        const deeper = el("details", { class: "learn-deeper" });
        deeper.appendChild(el("summary", {}, t("learn.deeper")));
        deeper.appendChild(el("p", { class: "learn-block" }, deeperText));
        card.appendChild(deeper);
      }
    }
    section.appendChild(card);
  }

  // --- Plants reference (preserved direct access) ---
  section.appendChild(el("h3", { id: "learn-plants", tabindex: "-1" }, t("learn.plants")));
  for (const plant of plants) {
    const card = el("article", { class: "learn-card", "aria-labelledby": `plant-${plant.id}` });
    card.appendChild(el("h4", { id: `plant-${plant.id}` }, plant.species));
    const names = el("p", { class: "learn-names" });
    names.appendChild(document.createTextNode(
      t("learn.commonNames") + " " + plant.commonNames.map((n) => `${n.name} (${n.region})`).join(", ")
    ));
    card.appendChild(names);
    card.appendChild(el("p", { class: "learn-cultivation" }, `${t("learn.harvest")} ${fieldEs("plant", plant.id, "cultivation", locale) || plant.cultivation}.`));
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

  // --- Processes reference (preserved direct access) ---
  section.appendChild(el("h3", { id: "learn-processes", tabindex: "-1" }, t("learn.processes")));
  for (const proc of processes) {
    const card = el("article", { class: "learn-card", "aria-labelledby": `process-${proc.id}` });
    card.appendChild(el("h4", { id: `process-${proc.id}`, tabindex: "-1" }, `${proc.name} — ${proc.stage}`));
    card.appendChild(el("p", {}, fieldEs("process", proc.id, "explanation", locale) || proc.explanation));
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

  // --- Glossary (preserved direct access; chapters link here) ---
  section.appendChild(el("h3", { id: "learn-terms", tabindex: "-1" }, t("learn.terms")));
  section.appendChild(el("p", { class: "view-intro" }, ui(locale, "classTerms")));
  for (const term of terms) {
    const slug = termSlug(term.term);
    const card = el("article", { class: "learn-card", "aria-labelledby": `term-${slug}` });
    card.appendChild(el("h4", { id: `term-${slug}`, tabindex: "-1" }, term.term));
    card.appendChild(el("p", { class: "learn-term-context" }, ui(locale, "contextPrefix") + term.context));
    card.appendChild(el("p", {}, fieldEs("term", term.term, "definition", locale) || term.definition));
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

  // Deep links (#/learn/terms etc.) land on the requested reference
  // section instead of the top of the page.
  const SECTION_TARGETS = { terms: "learn-terms", plants: "learn-plants", processes: "learn-processes" };
  const targetId = SECTION_TARGETS[deepSection] || null;
  if (targetId) {
    const target = section.querySelector(`#${targetId}`);
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ block: "start" });
    }
    target?.focus?.({ preventScroll: true });
  }
}
