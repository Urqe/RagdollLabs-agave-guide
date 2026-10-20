# RagdollLabs Agave Guide

A small, dependency-light guide to the **body and taste** of Mexican agave-based
distilled spirits — tequila, mezcal, bacanora and raicilla. Each style profile describes the style
(place, body, taste notes, smoke where relevant, finish) as editorial guidance,
with exactly one example bottle per profile and attributed source links.

The app is a static site: vanilla JavaScript with native ES modules, local JSON
data, and an inline SVG map of México. No framework, no bundler, no build step.

## Live site

Deployed with GitHub Pages (GitHub Actions): <https://urqe.github.io/RagdollLabs-agave-guide/>

## Run locally

Any static file server works. For example:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open <http://localhost:8080> (or the port your server reports).

## Validate

```bash
npm ci
npm run validate
```

This runs `scripts/validate.mjs` (data schema, cross-reference, HTTPS-only and
credential-free source URL, kebab-case id, one-example-bottle-per-profile and
SVG checks) and the `node:test` suites in `test/` (jsdom-based DOM smoke tests
for routing, map/list synchronization, profile rendering, plus security tests
for unsafe text and URLs).

## Deployment

Pushing to `main` runs `.github/workflows/pages.yml`, which validates the
repository, stages a publishable artifact containing only `index.html` and
`assets/` (tests, scripts and dev tooling are excluded), and deploys it to
GitHub Pages. The site uses relative asset URLs, so it works under the
repository subpath (`/RagdollLabs-agave-guide/`).

CI on pull requests and pushes to `main` runs the same validation via
`.github/workflows/ci.yml`.

## Project layout

```text
index.html                  App shell
assets/
  css/styles.css            Warm cream / charcoal theme
  js/
    app.js                  Boot, state, view coordination
    router.js               Hash routing
    data-loader.js          Local JSON loading with bounded errors
    dom-utils.js            Safe DOM creation and reference links
    map.js                  SVG map + state list synchronization
    explore.js              Explore view (map, list, profile links)
    profile.js              Profile + example bottle rendering
  data/
    profiles.json           Style profiles
    bottles.json            Example bottles
    sources.json            Attributed sources (style / producer / review)
  geo/
    mexico-states.svg       Composite map of the 32 Mexican states
    README.md               Geometry source, license, transformation
scripts/
  validate.mjs              Data/schema validation
  build-map.py              Rebuilds the composite map from source geometry
test/                       node:test suites (jsdom)
```

## Scope notes

- Mexican agave-based distilled spirits only; sotol and other non-agave spirits
  are excluded.
- Four traditions covered: tequila, mezcal, bacanora (Sonora) and raicilla
  (Jalisco/Nayarit), each as a bounded style profile with one example bottle.
- Basic search covers spirits, agave plants, places, producers, brands and
  bottles; accents and case are normalized and common aliases are supported
  (e.g. “espadin” finds espadín).
- Compare (`#/compare`) shows two or three editorial profiles side by side
  across eight sensory dimensions, with a biggest-differences view, flavor
  moods and “If you like this, try…” suggestions. Sensory levels are
  editorial impressions; unknown data is labeled “Not documented”, never
  treated as zero.
- Legal category/class terms (denominations of origin, classes like blanco or
  joven) are kept distinct from editorial style groupings (e.g. Sierra vs
  Costa raicilla).
- Map shading shows **app coverage**, not legal production boundaries.
- All 32 states are shown on the map for context, but only states with
  style profiles are selectable (on the map and in the state list).
- The map geometry comes from
  [Natural Earth](https://www.naturalearthdata.com/) 10m admin-1
  boundaries (public domain); see `assets/geo/README.md`.
