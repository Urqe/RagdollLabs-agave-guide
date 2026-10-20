/**
 * View memory: when a user leaves a list view (Explore, Catalogue) for a
 * profile, the view's query/filters/scroll are captured so returning —
 * whether via the back link or browser Back — restores exactly that view.
 */

const KEY = "agave-view-memory";

function read() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {};
  } catch (error) {
    return {};
  }
}

function write(store) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(store));
  } catch (error) {
    /* storage unavailable: return trips simply start fresh */
  }
}

export function captureView(name, snapshot) {
  const store = read();
  store[name] = { ...snapshot, scrollY: window.scrollY };
  write(store);
}

export function takeView(name) {
  const store = read();
  const snapshot = store[name] || null;
  if (snapshot) {
    delete store[name];
    write(store);
  }
  return snapshot;
}
