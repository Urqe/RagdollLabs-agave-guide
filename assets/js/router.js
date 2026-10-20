/**
 * Hash router. Routes:
 *   #/            home (welcome)
 *   #/explore     map + state list
 *   #/explore/:stateId   state view (map with state selected)
 *   #/profile/:id profile view
 */

function safeDecode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch (error) {
    // Malformed percent-encoding (e.g. a mangled shared URL) must not crash
    // the app on load; the raw segment flows on as an id and simply renders
    // the existing not-found view.
    return segment;
  }
}

export function parseHash(hash) {
  const raw = (hash || "").replace(/^#/, "");
  const segments = raw.split("/").filter((s) => s.length > 0).map(safeDecode);
  if (segments.length === 0) return { name: "home", params: {} };
  if (segments[0] === "explore") {
    if (segments.length === 1) return { name: "explore", params: {} };
    if (segments.length === 2) return { name: "state", params: { stateId: segments[1] } };
    return { name: "notFound", params: {} };
  }
  if (segments[0] === "learn" && segments.length === 1) {
    return { name: "learn", params: {} };
  }
  if (segments[0] === "catalogue" && segments.length === 1) {
    return { name: "catalogue", params: {} };
  }
  if (segments[0] === "compare") {
    if (segments.length === 1) return { name: "compare", params: { compareIds: "" } };
    if (segments.length === 2) return { name: "compare", params: { compareIds: segments[1] } };
    return { name: "notFound", params: {} };
  }
  if (segments[0] === "profile" && segments.length === 2) {
    const [profileId, query = ""] = segments[1].split("?");
    const params = new URLSearchParams(query);
    const from = params.get("from");
    return { name: "profile", params: { profileId, ...(from ? { from } : {}) } };
  }
  return { name: "notFound", params: {} };
}

export function buildHash(route) {
  switch (route.name) {
    case "home":
      return "#/";
    case "explore":
      return "#/explore";
    case "state":
      return `#/explore/${encodeURIComponent(route.params.stateId)}`;
    case "catalogue":
      return "#/catalogue";
    case "learn":
      return "#/learn";
    case "compare":
      return `#/compare${route.params.compareIds ? `/${route.params.compareIds.split(",").map(encodeURIComponent).join(",")}` : ""}`;
    case "profile":
      return `#/profile/${encodeURIComponent(route.params.profileId)}${
        route.params.from ? `?from=${encodeURIComponent(route.params.from)}` : ""
      }`;
    default:
      return "#/";
  }
}

/**
 * Navigate without adding a duplicate entry when the target hash equals the
 * current one. Returns true when the location actually changed.
 */
export function navigateTo(route) {
  const hash = buildHash(route);
  if (window.location.hash === hash) return false;
  window.location.hash = hash;
  return true;
}

export function startRouter(onChange) {
  const handler = () => onChange(parseHash(window.location.hash));
  window.addEventListener("hashchange", handler);
  return () => window.removeEventListener("hashchange", handler);
}
