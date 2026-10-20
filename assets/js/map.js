import { el, svgEl, clear } from "./dom-utils.js";

export const STATE_NAMES = {
  ags: "Aguascalientes",
  bc: "Baja California",
  bcs: "Baja California Sur",
  camp: "Campeche",
  cdmx: "Ciudad de México",
  chih: "Chihuahua",
  chis: "Chiapas",
  coah: "Coahuila",
  col: "Colima",
  dgo: "Durango",
  edomex: "Estado de México",
  gto: "Guanajuato",
  gro: "Guerrero",
  hgo: "Hidalgo",
  jal: "Jalisco",
  mich: "Michoacán",
  mor: "Morelos",
  nay: "Nayarit",
  nl: "Nuevo León",
  oax: "Oaxaca",
  pue: "Puebla",
  qro: "Querétaro",
  qroo: "Quintana Roo",
  slp: "San Luis Potosí",
  sin: "Sinaloa",
  son: "Sonora",
  tab: "Tabasco",
  tamps: "Tamaulipas",
  tlax: "Tlaxcala",
  ver: "Veracruz",
  yuc: "Yucatán",
  zac: "Zacatecas",
};

/**
 * Render the Mexico SVG into `container`, then wire selection:
 * clicking or pressing Enter/Space on a state path selects it, and the
 * state list stays in sync. `onSelect(stateId)` is called on change.
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

  const paths = new Map();
  for (const path of svg.querySelectorAll("path[data-state]")) {
    paths.set(path.getAttribute("data-state"), path);
  }

  const list = el("ul", { class: "state-list", "aria-label": "States of Mexico" });
  const items = new Map();
  for (const [code, name] of Object.entries(STATE_NAMES)) {
    const item = el("li");
    const button = el("button", {
      type: "button",
      class: "state-list-button",
      dataset: { state: code },
      "aria-pressed": "false",
    }, name);
    item.appendChild(button);
    list.appendChild(item);
    items.set(code, { button, item });
  }

  let current = selectedStateId;

  const applySelection = () => {
    for (const [code, path] of paths) {
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
    if (!paths.has(code)) return;
    current = code;
    applySelection();
    if (onSelect) onSelect(code);
  };

  for (const [code, path] of paths) {
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
  for (const path of container.querySelectorAll("path[data-state]")) {
    path.classList.toggle("is-covered", coveredStateIds.includes(path.getAttribute("data-state")));
  }
  for (const button of container.querySelectorAll(".state-list-button")) {
    button.classList.toggle("is-covered", coveredStateIds.includes(button.dataset.state));
  }
}
