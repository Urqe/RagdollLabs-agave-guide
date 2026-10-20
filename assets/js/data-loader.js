const DEFAULT_TIMEOUT_MS = 8000;

function fetchJson(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal, cache: "no-cache" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .finally(() => clearTimeout(timer));
}

/**
 * Load the three local data files with a bounded timeout. Any failure
 * rejects with a single Error so the caller can show one failure state.
 */
export async function loadAppData(baseUrl, timeoutMs = DEFAULT_TIMEOUT_MS) {
  try {
    const [profiles, bottles, sources] = await Promise.all([
      fetchJson(new URL("assets/data/profiles.json", baseUrl), timeoutMs),
      fetchJson(new URL("assets/data/bottles.json", baseUrl), timeoutMs),
      fetchJson(new URL("assets/data/sources.json", baseUrl), timeoutMs),
    ]);
    return { profiles: profiles.profiles, bottles: bottles.bottles, sources: sources.sources };
  } catch (error) {
    throw new Error(`Could not load app data: ${error.message}`);
  }
}
