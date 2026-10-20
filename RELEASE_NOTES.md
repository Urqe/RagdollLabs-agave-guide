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
