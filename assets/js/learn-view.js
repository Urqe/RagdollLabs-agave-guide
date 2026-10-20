import { el, clear, safeLink } from "./dom-utils.js";

function sourceLinks(sources, sourceIds) {
  const list = el("ul", { class: "source-list" });
  for (const id of sourceIds || []) {
    const source = sources.find((s) => s.id === id);
    if (!source) continue;
    const item = el("li");
    item.appendChild(safeLink(source.url, source.title, { class: "source-link" }));
    item.appendChild(el("span", { class: "source-kind" }, ` — ${source.kind} source`));
    list.appendChild(item);
  }
  return list;
}

/**
 * Learn view: plant pages (with regional common names, scientific
 * identity, honest uncertainty, and links to the profiles/bottles that
 * use them), production explanations, and a label-terms glossary.
 */
export function renderLearn(container, { plants, processes, glossary, profiles, bottles, sources }) {
  clear(container);
  const section = el("section", { class: "learn-view", "aria-labelledby": "learn-heading" });
  section.appendChild(el("h2", { id: "learn-heading" }, "Learn"));
  section.appendChild(el("p", { class: "view-intro" },
    "Agave plants, production methods and label vocabulary behind the profiles. Educational descriptions do not guarantee flavor from geography, species or age; where the botany is genuinely unsettled, we say so instead of guessing."));

  // --- Plants ---
  section.appendChild(el("h3", {}, "The agaves"));
  for (const plant of plants) {
    const card = el("article", { class: "learn-card", "aria-labelledby": `plant-${plant.id}` });
    card.appendChild(el("h4", { id: `plant-${plant.id}` }, plant.species));
    const names = el("p", { class: "learn-names" });
    names.appendChild(document.createTextNode(
      "Common names: " + plant.commonNames.map((n) => `${n.name} (${n.region})`).join(", ")
    ));
    card.appendChild(names);
    card.appendChild(el("p", { class: "learn-cultivation" }, `Harvest: ${plant.cultivation}.`));
    if (plant.uncertainty) {
      card.appendChild(el("p", { class: "editorial-note" }, `Uncertainty: ${plant.uncertainty}`));
    }
    const links = el("p", {});
    for (const pid of plant.profileIds || []) {
      const profile = profiles.find((p) => p.id === pid);
      if (profile) {
        links.appendChild(el("a", { href: `#/profile/${encodeURIComponent(profile.id)}`, class: "catalogue-profile-link" }, `${profile.title} → `));
      }
    }
    card.appendChild(links);
    card.appendChild(sourceLinks(sources, plant.sourceIds));
    section.appendChild(card);
  }

  // --- Processes ---
  section.appendChild(el("h3", {}, "How the spirits are made"));
  for (const proc of processes) {
    const card = el("article", { class: "learn-card", "aria-labelledby": `process-${proc.id}` });
    card.appendChild(el("h4", { id: `process-${proc.id}` }, `${proc.name} — ${proc.stage}`));
    card.appendChild(el("p", {}, proc.explanation));
    card.appendChild(sourceLinks(sources, proc.sourceIds));
    section.appendChild(card);
  }

  // --- Glossary ---
  section.appendChild(el("h3", {}, "Label vocabulary"));
  section.appendChild(el("p", { class: "view-intro" },
    "Class terms are spirit-specific: tequila's rules do not transfer to mezcal or raicilla. Where a term is not a legal class, that is stated."));
  for (const term of glossary) {
    const card = el("article", { class: "learn-card", "aria-labelledby": `term-${term.term.replace(/\s+/g, "-")}` });
    card.appendChild(el("h4", { id: `term-${term.term.replace(/\s+/g, "-")}` }, term.term));
    card.appendChild(el("p", { class: "learn-term-context" }, `Context: ${term.context}`));
    card.appendChild(el("p", {}, term.definition));
    card.appendChild(sourceLinks(sources, term.sourceIds));
    section.appendChild(card);
  }

  container.appendChild(section);
}
