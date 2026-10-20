# Release notes

## Release 1 (first draft)

Deployed commit: `2d83430` on `main` (merge of PR #1 from branch
`vibe/release1-draft-d80eca`).

Live URL: <https://urqe.github.io/RagdollLabs-agave-guide/>

### Seed scope

- 2 style profiles: blanco tequila (Tequila Valley, Jalisco) and espadín joven
  mezcal (Valles Centrales, Oaxaca).
- Exactly 1 example bottle per profile: Fortaleza Blanco (40% ABV) and
  The Lost Explorer Mezcal Espadín (42% ABV).
- 10 attributed sources: 3 style references, 3 producer pages, 4 reviews.
- No search, comparison, glossary, accounts, APIs or scoring.

### What works

- Welcome view with a route into browsing.
- Responsive SVG map of México (32 states) with state boundaries, plus an
  equivalent state list; map/list selection stays in sync (mouse and keyboard).
- Covered states are shaded (app coverage, not legal production boundaries);
  empty states show “No profiles added here yet”.
- Profile view with title, place/style context, editorial-guidance disclaimer,
  body (light/medium/full), 3–5 taste notes, smoke where relevant, finish.
- One compact example bottle card per profile: brand, expression, ABV, one
  attributed tasting sentence, source links. No separate bottle page.
- Hash routes (`#/`, `#/explore`, `#/explore/:state`, `#/profile/:id`) are
  shareable and survive direct reload; no duplicate initial history entry;
  Back/Forward work.
- Warm cream/charcoal palette with agave green/blue and terracotta/copper
  accents; discreet ragdoll identity in the brand mark. No generated assets.
- Visible focus styles, skip link, 44px minimum tap targets, no hover-only
  information.

### Checks run

- `npm run validate` — schema/reference checks (`scripts/validate.mjs`) plus
  14 `node:test` tests (jsdom DOM smoke: routing, map/list sync, empty state,
  profile rendering, not-found; security: https-only credential-free links,
  text rendered via `textContent`, no markup in data).
- Boot smoke (ad-hoc jsdom run of the real `app.js`): home → explore → state
  selection → empty state → profile → reload of profile hash → unknown route →
  data-failure state.
- CI (`ci.yml`) and Pages deploy (`pages.yml`) validate before deploying a
  static artifact containing only `index.html` + `assets/`.

### Deployment verification

- Pages URL: <https://urqe.github.io/RagdollLabs-agave-guide/> — Pages API
  reports `status: built`, `public: true`, `https_enforced: true`; the
  `Deploy to GitHub Pages` workflow completed successfully for commit
  `2d83430` (validate → build → deploy all green).
- The deployed artifact was downloaded from the Actions artifact store and
  served locally: `index.html`, CSS, all 7 JS modules, 3 JSON data files and
  the 32-state SVG all return 200; `package.json`, `scripts/`, `test/` and
  `node_modules` are correctly absent from the artifact.
- `assets/data/profiles.json` verified live over HTTPS on the Pages URL.
- Map/list → profile flow, reload, Back/Forward and the no-duplicate-initial-
  history-entry behavior verified in jsdom against the real modules.
- Narrow/wide layout and keyboard navigation checked in jsdom; **native-device
  checks (iPhone/iPad Safari, physical keyboard) were not available in this
  environment**. The sandbox blocks direct HTTP to the Pages URL, so live
  fetches of JS/CSS/SVG were verified via the deployed artifact served locally
  plus the live JSON check.

### Known limitations / remaining issues

- Native-device rendering (iOS Safari safe areas, touch behavior) unverified.
- Map geometry is a repositioned composite of per-state INEGI-derived outlines;
  small coastal/island detail is simplified.
- Only two states have profiles; all other states show the empty state by design.

## Release 2 — Foundation Review & Fixes

Maintenance release per the Release Plan, incorporating the owner's
structural feedback on Release 1.

### Findings and fixes

- **Map states did not form the map of Mexico.** Root cause: the
  Release 1 source (midir99/mexico-states-in-svg) draws each state in
  its own normalized coordinate system (every state scaled to fill its
  own square viewBox), so no compositing of those shapes can be
  geographically correct — all 32 states stacked near the canvas
  origin after the bbox-to-origin translation in `build-map.py`.
- **Fix:** rebuilt `assets/geo/mexico-states.svg` from Natural Earth
  10m admin-1 boundaries (public domain), Mexico subset, with a simple
  equirectangular projection (`scripts/build-map.py` rewritten; the
  old per-state compositing is gone). The map now shows Mexico with all
  32 states in true relative positions; verified by rendering the SVG
  geometry and checking positions (Baja peninsula west, Yucatán east,
  wide north, narrow south; no overlaps).
- **Owner feedback — limit selectable states to covered ones.** All 32
  states remain visible on the map for geographic context, but only
  states that actually have profiles are interactive: uncovered states
  have no pointer cursor, are `pointer-events: none`, are not
  focusable, are `aria-hidden`, and no longer appear in the state list
  (previously all 32 were listed/selectable). The map-load fallback list
  also shows only covered states.
- Copy updated to explain that only shaded states are selectable, and
  that the full map is shown for context.
- `assets/geo/README.md`, `README.md` and the SVG check in
  `scripts/validate.mjs` updated for the new geometry source and
  selection semantics.

### Checks run

- `npm run validate` — schema/reference checks plus 14 node:test/jsdom
  suites, all passing. The map test now asserts: 32 visible states,
  exactly the covered states selectable/focusable/listed, uncovered
  states inert and not announced, and selection sync preserved.
- Deployment verified via the Pages workflow on `main`.

### Remaining issues / deferred

- Native-device rendering (iOS Safari, touch) still unverified in this
  environment; map was verified geometrically and via jsdom behavior.
- Natural Earth 10m boundary detail is modest (small islands/coastal
  detail simplified); adequate for state selection.
- Content unchanged: two seed profiles, two example bottles (Release 3
  scope).


## Release 3 — Four Traditions

### Scope delivered

- **2 new profiles, 1 example bottle each (4/4 total):**
  - Bacanora, Agave Pacifica style (Sierra de Sonora) — example bottle:
    Rancho Tepúa Bacanora (43% ABV, Aconchi, Sonora; producer page +
    Mezcalistas tasting notes and Mezcal Reviews as review evidence).
  - Sierra raicilla, Maximiliana style (Jalisco) — example bottle: La
    Venenosa Raicilla Tabernas Edición (40% ABV, La Vieja, Sierra
    Occidental, Jalisco; Casa Endémica producer page + Mezcal Reviews
    member tasting notes).
- **8 new sources** (18 total): style references (Mezcalistas bacanora
  overview, Mezcal Reviews raicilla category, Wikipedia raicilla DO),
  producer pages (Sunora, Casa Endémica) and reviews. All verified live
  over HTTPS before inclusion. Failed/blocked candidates (Liquor.com,
  Food & Wine, ranchotepua.com, lavenenosa.com) were replaced once each
  within the bounded-research rules.
- **Basic search** (`assets/js/search.js`): accent- and case-insensitive
  matching over spirits, agave plants, places, producers, brands and
  bottles, with curated aliases (espadin, plata/silver, tepua, mountain
  raicilla…) and per-result match reasons. Live results as you type.
- **Expanded profile detail:** legal category (DO), agave plant, process,
  and a short beginner note on every profile; example-bottle cards now
  show producer and place. The two Release 1 profiles were backfilled
  with the same fields.
- **Category vs editorial grouping kept distinct:** e.g. raicilla's DO
  is stated as the legal category, while “Sierra” vs “Costa” is labeled
  as an editorial tradition split; smoke/sweetness are never auto-assigned
  by region.
- **Context preservation:** profile links from a selected state carry
  `?from=<state>`; the profile's back link returns to that state view,
  restoring the map/list selection.

### Checks run

- `npm run validate` — schema (now including bacanora/raicilla spirits and
  the new plant/process/category/beginnerNote/producer/place fields) plus
  15 node:test/jsdom suites: routing (incl. `?from=`), map selection,
  search behavior, expanded profile sections, context-preserving back
  links, security tests. All passing.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.
- Search is deliberately basic (prefix-of-content matching); comparison,
  advanced search and catalogue expansion are later releases.
- Coastal (Costa) raicilla and additional mezcal/tequila variants
  deferred per plan.

## Release 4 — Explorer Review & Fixes

Maintenance release per the plan: audit of map/list consistency, aliases,
duplicate results, producer vs brand identities, source visibility,
optional-data failures and small-screen profile readability.

### Findings and fixes

- **Stale copy (found):** home intro and the `index.html` meta description
  still said "tequila and mezcal" after Release 3. Fixed to name all four
  spirits.
- **Producer vs brand identity (found):** the two seed bottles had no
  producer/place fields, so the brand read as the producer. Backfilled
  from their already-cited producer pages (Tequila Fortaleza distillery,
  Tequila, Jalisco; The Lost Explorer's Oaxaca palenque).
- **Alias map contained no-op entries (found):** `espadin → espadín` etc.
  were identities because matching normalizes accents. Removed; replaced
  with real alias gaps: silver/plata → blanco, blue agave / weber azul /
  tequilana weber → tequilana, lechuguilla → maximiliana,
  mountain/coastal raicilla, bacanorero, tabernero.
- **Search relevance (found):** querying a spirit (e.g. "mezcal") put
  profiles that merely mention mezcal on equal footing with the actual
  mezcal profile. Exact spirit matches now rank first (rank 0), others
  follow alphabetically. No duplicate results (one entry per profile,
  now asserted by test).
- **Overlapping state coverage (verified, no defect):** Jalisco now holds
  two profiles (tequila + raicilla); the state view renders both and the
  map/list stays consistent. Covered by a new test.
- **Optional-data failures (verified, no defect):** all optional profile
  and bottle fields degrade gracefully (sections/bottle lines are
  conditional); validator accepts their absence.
- **Small-screen profile readability (improved):** below 52rem the
  profile-facts grid now stacks single-column with tighter spacing, and
  headings/bottle names scale down for comfortable phone reading.
- **Source visibility (verified, no defect):** profile and bottle source
  lists remain visible with kind labels on every profile view.

### Checks run

- `npm run validate` — schema plus 16 node:test/jsdom suites (new
  maintenance test: overlapping state coverage, spirit-match ranking,
  alias mapping, duplicate-free results, producer visibility). All
  passing.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.
- Advanced search (multi-term, fuzzy) and comparison remain backlog
  (Release 5+).

## Release 5 — Find Your Flavor

### Scope delivered

- **Comparison view** (`#/compare`, `#/compare/<ids>`): pick two or
  three profiles side by side, with explicit remove controls per column
  and picker buttons that disable at three. Selections are carried in
  the route, so they survive reload, sharing and Back/Forward.
- **Disclosed editorial sensory dimensions** (8): smoke, herbal/vegetal,
  fruit/floral, perceived sweetness, pepper/spice, body, oak, finish —
  each an authored editorial level (none/low/medium/high), never a
  number. The view states plainly that perceived sweetness is not
  measured sugar, smoke is not peat content, and ABV stays factual.
- **Biggest-differences view** ordered by gap size, plus plant/process
  context lines so cross-tradition differences (tequila steam-cook vs
  mezcal pit-roast) read clearly.
- **Flavor moods** on every profile ("Smoke-forward", "Clean & herbal",
  "Round & fruity", "Peppery & savory", "Long finish", "Desert garden"),
  derived only from supported attributes.
- **"If you like this, try…"** on every profile with a reason naming the
  shared documented dimensions; candidates without documented overlap
  are never suggested.
- **Missing data is explicit:** unknown is a first-class level; unknown
  cells read "Not documented", unknown dimensions are excluded from
  differences and listed in a visible note; no unknown-as-zero anywhere.
- **Pure comparison engine** (`assets/js/compare.js`) with explanation
  invariants covered by deterministic fixtures, not by the current data
  ranking.

### Checks run

- `npm run validate` — schema (sensory levels validated) plus 24
  node:test/jsdom suites, including 8 new fixture-based invariant tests
  (unknown never coerced, gap ordering determinism, explicit missing
  dimensions, moods from supported data only, suggestion
  incompatibility, no bottle-measurement claims) and DOM workflow tests
  (picker, table, remove controls, unknown cells). All passing.
- Live-data smoke check: compare view renders 8 dimension rows,
  differences and plant context for the two seed profiles.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.
- Moods and suggestions are deliberately conservative; richer
  explanation and more moods grow with more profiles.

## Release 6 — Comparison Review & Fixes

Maintenance release per the plan: audit of comparison state,
deduplication, slot promotion, missing data, mood predicates,
explanation truthfulness, focus, live announcements and persistent
navigation.

### Findings and fixes

- **Deduplication (defect found):** a crafted `#/compare/a,a,...` route
  rendered duplicate columns. Route ids are now deduplicated — one
  column per profile, verified by test.
- **Invalid ids (defect found):** unknown ids in a crafted route silently
  consumed slots and disabled the picker. Unknown ids are now pruned and
  the route canonicalizes once via the selection callback.
- **Focus (defect found):** after Add/Remove the route re-render moved
  focus to `<main>`, losing the keyboard user's place. Focus now
  restores to the acted-on picker button (or the first enabled one);
  `app.js` tracks the last acted-on profile across renders.
- **Live announcements (defect found):** screen readers got no feedback
  on selection changes. A polite `role="status"` region now announces
  adds, removes and the current comparison state.
- **Persistent navigation (improved):** the header "Compare" link now
  mirrors the current selection instead of resetting it when you leave
  and return to the view.
- **Slot promotion (verified, no defect):** removing a profile frees its
  slot and re-enables its picker button; the three-slot limit is
  enforced by disabling, not by silent drops.
- **Missing data (verified, no defect):** "Not documented" cells, the
  explicit unknown note and unknown-exclusion from differences all
  behave as built in Release 5.
- **Mood predicates and explanation truthfulness (verified, no defect):**
  all mood/suggestion logic remains in the pure module with fixture
  tests; reasons only name documented shared dimensions and never claim
  bottle measurements.

### Checks run

- `npm run validate` — schema plus 28 node:test/jsdom suites (4 new
  regression tests: dedupe/prune + canonicalization, no duplicate
  columns, add/remove announcements, focus restoration). All passing.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.
