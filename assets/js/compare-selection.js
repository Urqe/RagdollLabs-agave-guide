/**
 * Comparison selection store. Up to three profile ids persist in
 * localStorage so the selection survives page changes and reloads; the
 * compare route (#/compare/a,b,c) stays the shareable source of truth for
 * what is currently on screen.
 */

const STORAGE_KEY = "agave-compare-selection";
export const MAX_SLOTS = 3;

// In-page fallback so selections survive navigation even when storage is
// unavailable or throws (private mode, quota, disabled cookies).
let memorySelection = [];

function readStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? raw : memorySelection;
  } catch (error) {
    return memorySelection;
  }
}

function normalize(ids) {
  const seen = new Set();
  const out = [];
  for (const id of ids || []) {
    if (typeof id !== "string" || !id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_SLOTS) break;
  }
  return out;
}

export function getCompareSelection() {
  return normalize(readStored());
}

export function setCompareSelection(ids) {
  const next = normalize(ids);
  memorySelection = [...next];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    /* storage unavailable: the in-memory selection keeps working */
  }
  return [...next];
}

/**
 * Union the stored selection with the given ids, keeping the existing
 * order first so "compare this style" appends to (never replaces) what is
 * already selected, capped at three slots.
 */
export function addToSelection(ids) {
  return setCompareSelection([...readStored(), ...(ids || [])]);
}
