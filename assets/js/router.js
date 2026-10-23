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
  if (segments[0] === "start") {
    if (segments.length === 1) return { name: "start", params: {} };
    if (segments.length === 2) return { name: "start", params: { lessonId: segments[1] } };
    return { name: "notFound", params: {} };
  }
  if (segments[0] === "learn" || segments[0].split("?")[0] === "learn") {
    if (segments.length === 1) {
      const query = segments[0].split("?")[1] || "";
      const from = new URLSearchParams(query).get("from");
      return from ? { name: "learn", params: { from } } : { name: "learn", params: {} };
    }
    if (segments.length === 2 && ["terms", "plants", "processes"].includes(segments[1])) {
      return { name: "learn", params: { section: segments[1] } };
    }
    return { name: "notFound", params: {} };
  }
  if (segments[0] === "plant" && segments.length === 2) {
    return { name: "plant", params: { plantId: segments[1] } };
  }
  if (segments[0] === "tradition" && segments.length === 2) {
    return { name: "tradition", params: { traditionId: segments[1] } };
  }
  if (segments[0] === "discover" && segments.length === 1) {
    return { name: "discover", params: {} };
  }
  if (segments[0] === "discover" && segments.length === 3) {
    const supported = new Set(["plant", "region", "spirit", "flavour"]);
    if (!supported.has(segments[1])) return { name: "notFound", params: {} };
    return { name: "discover", params: { kind: segments[1], id: segments[2] } };
  }
  if (segments[0].split("?")[0] === "catalogue" && segments.length === 1) {
    const query = segments[0].split("?")[1] || "";
    const bottle = new URLSearchParams(query).get("bottle");
    return bottle ? { name: "catalogue", params: { bottle } } : { name: "catalogue", params: {} };
  }
  if (segments[0] === "compare") {
    if (segments.length === 1) return { name: "compare", params: { compareIds: "" } };
    if (segments.length === 2) {
      const [compareIds, query = ""] = segments[1].split("?");
      const params = new URLSearchParams(query);
      const from = params.get("from");
      return { name: "compare", params: { compareIds, ...(from ? { from } : {}) } };
    }
    return { name: "notFound", params: {} };
  }
  if (segments[0] === "profile" && segments.length === 2) {
    const [profileId, query = ""] = segments[1].split("?");
    const params = new URLSearchParams(query);
    const from = params.get("from");
    const origin = params.get("origin");
    return { name: "profile", params: { profileId, ...(from ? { from } : {}), ...(origin ? { origin } : {}) } };
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
      return route.params.bottle ? `#/catalogue?bottle=${encodeURIComponent(route.params.bottle)}` : "#/catalogue";
    case "plant":
      return `#/plant/${encodeURIComponent(route.params.plantId)}`;
    case "tradition":
      return `#/tradition/${encodeURIComponent(route.params.traditionId)}`;
    case "discover":
      if (!route.params.kind) return "#/discover";
      return `#/discover/${encodeURIComponent(route.params.kind)}/${encodeURIComponent(route.params.id)}`;
    case "learn": {
      const fromQuery = route.params.from ? `?from=${encodeURIComponent(route.params.from)}` : "";
      return route.params.section ? `#/learn/${route.params.section}` : `#/learn${fromQuery}`;
    }
    case "start":
      return route.params.lessonId ? `#/start/${encodeURIComponent(route.params.lessonId)}` : "#/start";
    case "compare": {
      const idsPart = route.params.compareIds ? `/${route.params.compareIds.split(",").map(encodeURIComponent).join(",")}` : "";
      const fromQuery = route.params.from ? `?from=${encodeURIComponent(route.params.from)}` : "";
      return `#/compare${idsPart}${fromQuery}`;
    }
    case "profile":
      return `#/profile/${encodeURIComponent(route.params.profileId)}${buildProfileQuery(route.params)}`;
    default:
      return "#/";
  }
}

/**
 * Navigate without adding a duplicate entry when the target hash equals the
 * current one. Returns true when the location actually changed.
 */
function buildProfileQuery(params) {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.origin) query.set("origin", params.origin);
  const s = query.toString();
  return s ? `?${s}` : "";
}

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
