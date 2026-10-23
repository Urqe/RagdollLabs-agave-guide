import { el } from "./dom-utils.js";
import { ui } from "./presentation.js";

/**
 * Pair 18 (P18-2): a shared tasting-basis renderer for catalogue entries
 * and profile example-bottle cards. A sensory summary is attributed only
 * to the sources that actually support it — the data contract is
 * `tastingSourceIds` (the sources behind the sensory text) and
 * `tastingVoice` ("review" | "producer"), never the general `sourceIds`
 * of the bottle record. Entries without sensory evidence render a
 * facts-only line instead of an inflated attribution.
 */

function resolveEvidence(sources, bottle) {
  const ids = bottle.tastingSourceIds || [];
  const found = ids
    .map((id) => sources.find((s) => s.id === id))
    .filter(Boolean);
  return [...new Set(found)];
}

/**
 * Basis line for a bottle with a sensory summary. Returns the paragraph,
 * or null when no source resolves (the caller then omits the line rather
 * than inventing an attribution).
 */
export function tastingBasisLine(sources, bottle, locale = null) {
  const noteSources = resolveEvidence(sources, bottle);
  if (noteSources.length === 0) return null;
  const reviews = noteSources.filter((s) => s.kind === "review");
  const producers = noteSources.filter((s) => s.kind === "producer");
  const styles = noteSources.filter((s) => s.kind === "style");
  const p = el("p", { class: "bottle-basis" });
  const t = (key, args = {}) => {
    let text = ui(locale, key);
    for (const [k, v] of Object.entries(args)) text = text.replaceAll(`{${k}}`, v);
    return text;
  };

  if (reviews.length > 0) {
    // Independent reviews are the evidence; producer/style sources listed
    // alongside them are not counted as tasting evidence.
    const countText = reviews.length === 1
      ? t("basisOneReview")
      : t("basisReviews", { count: reviews.length });
    p.appendChild(el("span", { class: "bottle-basis-text" }, countText));
    return p;
  }
  if (producers.length > 0) {
    const countText = producers.length === 1
      ? t("basisOneProducer")
      : t("basisProducers", { count: producers.length });
    p.appendChild(el("span", { class: "bottle-basis-text" }, countText));
    return p;
  }
  if (styles.length > 0) {
    const countText = styles.length === 1
      ? t("basisOneStyle")
      : t("basisStyles", { count: styles.length });
    p.appendChild(el("span", { class: "bottle-basis-text" }, countText));
    return p;
  }
  return null;
}

/**
 * Line for an entry whose text is factual only (identity, place, process)
 * or whose tasting notes are explicitly unavailable. Distinct from a
 * tasting summary: it never implies published sensory evidence.
 */
export function factsOnlyLine(locale = null) {
  return el("p", { class: "bottle-basis facts-only" }, ui(locale, "basisFactsOnly"));
}
