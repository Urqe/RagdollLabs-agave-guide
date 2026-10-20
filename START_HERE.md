# RagdollLabs Agave Guide — First deployment prompt

Implement **Release 1 only** in `RagdollLabs-agave-guide` and deploy it to GitHub Pages. This prompt is self-contained. Do not read or execute `RELEASE_PLAN.md` during this task; it is a later-release backlog. Follow applicable repository instructions. Inspect existing work first and adapt it rather than restarting or deleting useful data.

## Goal and scope

Build a small, working app so the owner can inspect its structure and UX. The focus is the **style profile: body and taste notes**. A bottle is only an example of the style.

Create two seed profiles: one bounded tequila style and one bounded mezcal style, with **exactly one example bottle per profile**. Do not imply these two examples represent every tequila or mezcal. Preserve pre-existing data if present, but do not expand it during this task.

Mexican agave-based distilled spirits only. Exclude sotol and other non-agave spirits. English UI, correct Spanish names/accents. No search, comparison, catalogue directory, glossary, guides, accounts, APIs, numerical flavor scoring, or additional profiles in this deployment.

## Visible experience

- Welcome heading and short introduction; a clear route into browsing.
- Responsive local SVG of Mexico with state boundaries and an equivalent state list. Selection shows covered profiles; empty states say “No profiles added here yet”. Map shading means app coverage, not legal production boundaries.
- Profile view: title, place/style context, short description, body (light/medium/full), 3–5 taste descriptors, smoke where relevant, and a short finish description. Label this as editorial style guidance.
- One compact “Example bottle” card beneath each profile: brand, expression name, optional known ABV, one attributed tasting sentence, and source links. No separate bottle detail page.
- Working home/back navigation, shareable hash routes and direct reload. One main view visible at a time. No duplicate initial history entry.
- Prioritize iPhone/iPad; also support desktop mouse/keyboard. Visible focus, readable contrast, comfortable tap targets, and no hover-only information.
- Visual direction: warm cream and charcoal, agave green/blue with terracotta/copper accents; discreet ragdoll identity. Do not spend this release generating decorative assets.

## File structure

Use vanilla JavaScript with native ES modules, local JSON, and no framework/bundler. This is the target structure for a new repo; preserve equivalent working modules if already present. Create functional files only, not empty future scaffolding.

```text
index.html
assets/
  css/styles.css
  js/
    app.js
    router.js
    data-loader.js
    dom-utils.js
    map.js
    explore.js
    profile.js
  data/
    profiles.json
    bottles.json
    sources.json
  geo/
    mexico-states.svg
    README.md
scripts/
  validate.mjs
test/
  dom-smoke.test.mjs
  security.test.mjs
.github/workflows/
  ci.yml
  pages.yml
package.json
package-lock.json
README.md
RELEASE_NOTES.md
START_HERE.md
```

Responsibilities:
- `app.js`: boot/load, application state and view coordination. Keep the small initial state here; no separate state framework.
- `router.js`: hash parsing, navigation and history restoration; use stable profile IDs.
- `data-loader.js`: load local JSON with bounded errors/timeouts and a visible failure state.
- `dom-utils.js`: shared DOM creation and safe reference links.
- `map.js`: SVG selection and state-list synchronization; `explore.js`: profile list; `profile.js`: profile, example bottle and source rendering.
- `profiles.json`: ID, title, spirit, state ID/name, context, body, taste notes, optional smoke, finish, exampleBottleId and sourceIds.
- `bottles.json`: ID, brand, expression, optional ABV, short review summary and sourceIds. Inline the small brand/review details initially.
- `sources.json`: ID, title/publication, HTTPS URL and source kind (style, producer or review); author/date only if readily available.
- `geo/README.md`: geometry source, license, date and any transformation. Use an existing reusable map when available. Add `scripts/build-map.py` only if actually converting source geometry; do not build a GIS pipeline unnecessarily.
- `validate.mjs`: schema/reference checks; tests cover navigation, map/list/profile behavior and unsafe text/URLs. Use `node:test` and jsdom if needed; do not duplicate suites under both `scripts/` and `test/`.

Do not create `spirit.js`, `bottles.js`, `sources.js`, `learning.js`, `model.js`, `state.js`, or the full future taxonomy datasets just to match a speculative architecture. Extract modules later when responsibilities justify it. If `RELEASE_PLAN.md` already exists, leave it untouched for this task.

## Research: sufficient evidence, then stop

Use one suitable general style reference per profile. Use one producer page and **one credible review per example bottle**. Write short original summaries with links; distinguish profile guidance from the example review. Do not generalize one bottle's review to all spirits in a region.

Maximum five minutes per bottle and twenty minutes total content research. A second review is optional only for a material contradiction. Try one alternative for a failed page and at most one replacement bottle per profile within that budget. No repeated search loops, batch investigations, reviewer consensus studies or exhaustive production/legal research. Omit optional unknowns. If required evidence remains unavailable, report the gap and finish independent implementation work; never invent claims.

## Validate, deploy, hand off

Expose `npm run validate` for data checks and focused tests. Use text-safe DOM rendering and HTTPS reference URLs without embedded credentials. Run relevant checks; repeat only after changes or a concrete failure. CI validates changes; the Pages workflow deploys a validated static artifact with repository-subpath-safe asset URLs. Keep test dependencies and tooling out of the published artifact.

Deploy the working site, verify the actual Pages URL, asset loading, map/list → profile flow, reload and Back/Forward. Check narrow/wide layouts and keyboard navigation; accurately state which native-device checks were unavailable. If deployment permissions block publication, finish the deployable work and identify the specific blocker without repeated retries.

Update README with local run/validation/deployment instructions and RELEASE_NOTES with the deployed commit, small seed scope and checks. **Stop after reporting the Pages URL, what works and any remaining issues. The owner must inspect the structure and explicitly authorize Release 2. Do not continue into the later roadmap.**
