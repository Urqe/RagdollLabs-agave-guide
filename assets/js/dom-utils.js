const SVG_NS = "http://www.w3.org/2000/svg";

export function el(tag, attrs = {}, text = null) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    if (key === "class") node.className = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2), value);
    } else node.setAttribute(key, value);
  }
  if (text !== null) node.textContent = text;
  return node;
}

export function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    node.setAttribute(key, value);
  }
  return node;
}

/**
 * Create an external reference link. Only https: URLs are allowed and the
 * URL is re-validated at click time; userinfo credentials are rejected.
 */
export function safeLink(href, text, attrs = {}) {
  const url = new URL(href, "https://invalid.example");
  if (url.protocol !== "https:") {
    throw new Error(`Unsafe link rejected: ${href}`);
  }
  if (url.username || url.password) {
    throw new Error(`Link with credentials rejected: ${href}`);
  }
  return el("a", {
    href: url.href,
    target: "_blank",
    rel: "noopener noreferrer",
    ...attrs,
  }, text);
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}
