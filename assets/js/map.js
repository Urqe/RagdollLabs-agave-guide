import { el, clear } from "./dom-utils.js";

export const STATE_NAMES = {
  ags: "Aguascalientes",
  bc: "Baja California",
  bcs: "Baja California Sur",
  camp: "Campeche",
  cdmx: "Ciudad de M\u00e9xico",
  chih: "Chihuahua",
  chis: "Chiapas",
  coah: "Coahuila",
  col: "Colima",
  dgo: "Durango",
  edomex: "Estado de M\u00e9xico",
  gto: "Guanajuato",
  gro: "Guerrero",
  hgo: "Hidalgo",
  jal: "Jalisco",
  mich: "Michoac\u00e1n",
  mor: "Morelos",
  nay: "Nayarit",
  nl: "Nuevo Le\u00f3n",
  oax: "Oaxaca",
  pue: "Puebla",
  qro: "Quer\u00e9taro",
  qroo: "Quintana Roo",
  slp: "San Luis Potos\u00ed",
  sin: "Sinaloa",
  son: "Sonora",
  tab: "Tabasco",
  tamps: "Tamaulipas",
  tlax: "Tlaxcala",
  ver: "Veracruz",
  yuc: "Yucat\u00e1n",
  zac: "Zacatecas",
};

/**
 * Render the Mexico SVG into `container`, then wire selection.
 *
 * All 32 states stay visible on the map, but only states with app
 * coverage are interactive: uncovered states are drawn without a
 * pointer cursor, are not focusable and have no button in the state
 * list. `onSelect(stateId)` is called when a covered state is chosen.
 */
export async function renderMap(container, mapUrl, { selectedStateId = null, coveredStateIds = [], onSelect } = {}) {
  clear(container);
  const response = await fetch(mapUrl);
  if (!response.ok) throw new Error(`Map failed to load: ${response.status}`);
  const svgText = await response.text();
  const parsed = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = parsed.querySelector("svg");
  if (!svg || parsed.querySelector("parsererror")) {
    throw new Error("Map SVG could not be parsed");
  }
  svg.classList.add("mexico-map");
  svg.setAttribute("focusable", "false");
  container.appendChild(svg);

  const covered = new Set(coveredStateIds);
  const paths = new Map();
  for (const path of svg.querySelectorAll("path[data-state]")) {
    const code = path.getAttribute("data-state");
    paths.set(code, path);
    const name = STATE_NAMES[code] || code;
    if (covered.has(code)) {
      path.classList.add("is-selectable");
      path.setAttribute("role", "button");
      path.setAttribute("tabindex", "0");
      path.setAttribute("aria-pressed", "false");
      path.setAttribute("aria-label", name);
    } else {
      path.setAttribute("aria-hidden", "true");
      path.setAttribute("focusable", "false");
      const title = path.querySelector("title");
      if (title) path.removeChild(title);
    }
  }

  const list = el("ul", { class: "state-list", "aria-label": "States with profiles" });
  const items = new Map();
  for (const code of coveredStateIds) {
    if (!paths.has(code)) continue;
    const name = STATE_NAMES[code] || code;
    const item = el("li");
    const button = el("button", {
      type: "button",
      class: "state-list-button is-covered",
      dataset: { state: code },
      "aria-pressed": "false",
    }, name);
    item.appendChild(button);
    list.appendChild(item);
    items.set(code, { button, item });
  }

  let current = covered.has(selectedStateId) ? selectedStateId : null;
  const applySelection = () => {
    for (const [code, path] of paths) {
      if (!covered.has(code)) continue;
      const selected = code === current;
      path.classList.toggle("is-selected", selected);
      path.setAttribute("aria-pressed", selected ? "true" : "false");
    }
    for (const [code, { button }] of items) {
      const selected = code === current;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    }
  };

  const select = (code) => {
    if (!covered.has(code) || !paths.has(code)) return;
    current = code;
    applySelection();
    if (onSelect) onSelect(code);
  };

  for (const [code, path] of paths) {
    if (!covered.has(code)) continue;
    path.addEventListener("click", () => select(code));
    path.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(code);
      }
    });
  }
  for (const [code, { button }] of items) {
    button.addEventListener("click", () => select(code));
  }

  const wrap = el("div", { class: "map-and-list" });
  wrap.appendChild(svg);
  wrap.appendChild(list);
  container.appendChild(wrap);
  applySelection();
  return { select, getSelected: () => current };
}

/** Highlight the states that have profiles (app coverage shading). */
export function shadeCovered(container, coveredStateIds) {
  const covered = new Set(coveredStateIds);
  for (const path of container.querySelectorAll("path[data-state]")) {
    const isCovered = covered.has(path.getAttribute("data-state"));
    path.classList.toggle("is-covered", isCovered);
    path.classList.toggle("is-selectable", isCovered);
    path.classList.toggle("is-inert", !isCovered);
  }
}
