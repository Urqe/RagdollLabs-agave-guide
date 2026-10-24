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

### Release 6 hotfix — comparison selection failure (owner-reported)

**Defect:** on the live site only one profile could ever be selected;
picking a second did nothing.

**Root cause:** `assets/js/app.js` called `navigateTo` in the compare
selection handler without importing it from `router.js` — the compare
route never updated, so the comparison never rendered. The Release 6
tests injected their own selection callback and never booted the real
app, which is why CI stayed green while the feature was broken.

**Fixes:**
- Import `navigateTo` in `app.js`.
- Body levels now map onto the compare scale (light→low, medium→medium,
  full→high); previously the Body row read "not documented" for every
  profile because the compare engine did not understand the profile
  `body` vocabulary.
- Compare route ids are joined with literal commas instead of `%2C`
  for readable, shareable URLs.
- New end-to-end regression test boots the real `app.js` with stubbed
  fetch and asserts pick → route → table rendering, closing the
  callback-injection blind spot.

**Verified:** real-app jsdom run confirms pick 1 → `#/compare/<id>`,
pick 2 renders the table with differences, pick 3 adds a column, remove
drops one. `npm run validate`: 29 suites passing.

## Release 7 — Brands, Bottles & Reviews

### Scope delivered

- **Catalogue view** (`#/catalogue`, "Catalogue" nav link): every bottle
  as an entry with brand, producer, exact expression, place, ABV and
  batch/version kept as separate facts; alphabetical bottle list; brand
  directory ("Browse all brands").
- **Catalogue search** with **exact-expression prioritization** (exact
  expression > brand > content match), accent/case normalization and
  curated spelling variants; results keep catalogue context (in-page
  anchors).
- **3 new bottles (within the 2\u20135 cap; 7 total):**
  - Cielo Rojo Bacanora Blanco (43%, Contreras family vinata, Aconchi)
    with TEQUILA.net + Mezcal Reviews reviews \u2014 same vinata as the
    featured example, editorial note explains the fit.
  - Kilinga Bacanora Silvestre (40%, \u00c1lamos, Sonora) with a Mezcal
    Reviews review \u2014 editorial note marks it fruitier/floral vs the
    profile.
  - La Venenosa Raicilla Costa (joven) \u2014 factual entry without review
    or profile coverage, labeled "Tasting notes not yet documented" and
    "Profile not yet covered"; coastal raicilla is a distinct editorial
    tradition from the Sierra profile, so no character is borrowed.
- **Profile-first hierarchy retained:** each profile keeps exactly one
  featured example card; additional mapped bottles live behind a
  keyboard-accessible `<details>` "See more bottles for this style (n)"
  expansion.
- **Profile-relative editorial notes:** each note stores its compared
  profile id (`noteProfileId`) and its own review dependencies
  (`noteSourceIds`), so profile edits trigger note reassessment; notes
  are labeled editorial and prefer "vs this profile" over undefined
  "typical" claims.
- **Distinguishable layers:** reviewer impressions (attributed), producer
  facts (identity fields) and the app's synthesis (labeled editorial)
  are visually and semantically separate; review scores are never
  converted into app rankings.
- **Validator extended:** spirit/profileId/coverage/batch/note fields
  validated; coverage labels forbid pairing "tasting-not-documented"
  with an invented reviewSummary.

### Checks run

- `npm run validate` \u2014 schema + 36 node:test/jsdom suites (7 new
  catalogue tests: search prioritization, variants, alphabetical list +
  directory, coverage disclosure, layer distinguishability, featured/
  expansion hierarchy, brand-producer-expression separation). All
  passing.
- Real-app boot smoke: catalogue renders 7 entries / 6 brands / 2
  coverage labels; search "Bacanora Blanco" returns Cielo Rojo first;
  bacanora profile shows "See more bottles (2)" with both extras.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.
- Catalogue growth continues in later explicitly requested increments.

### UI theme refresh — "A\u00f1ejo Lounge" (owner-requested, pre-Release 8)

Replaced the light cream theme after owner feedback that the palette
felt bland/engineer-like. The app is now **dark-first**: deep
charcoal-green night tones, a\u00f1ejo amber and copper accents, warm glow
shadows, and the Fraunces display serif for headings (body stays a
clean system sans). A refined light variant remains available via a
sun/moon toggle in the header (persisted in localStorage, applied
before first paint to avoid flashes). Dark is the default for new
visitors. No DOM contract changes; all 36 suites pass; the toggle was
verified end-to-end in a real-app jsdom boot.

## Release 8 — Catalogue Review & Fixes

Maintenance release per the plan: audit of duplicate/ambiguous bottle
names, batch matching, maker attribution, source integrity, evidence
gaps, mobile list density, alphabetical ordering and focus after
expansion.

### Findings and fixes

- **Context-preserving navigation (defect found):** catalogue search
  results were anchors to the current route that scrolled without
  focusing, leaving keyboard users stranded at the page top. Result
  links now prevent the default navigation, scroll to the entry and
  move focus to the entry title (`tabindex="-1"`), with an explicit
  aria-label.
- **Duplicate DOM ids (defect found):** the catalogue entry `<article>`
  and its `<h3>` shared `bottle-<id>`, so `getElementById` returned the
  wrong element. Titles now use `bottle-<id>-title` and the article's
  `aria-labelledby` follows.
- **`scrollIntoView` guard:** wrapped in a typeof check (jsdom/older
  browsers), so focus is never skipped when scrolling is unavailable.
- **Validator integrity rules (added):** duplicate brand+expression
  combinations are rejected; every bottle requires a producer or place
  for maker attribution; `profile-not-covered` may not coexist with a
  linked `profileId`.
- **Mobile list density (improved):** catalogue entries, titles, fact
  lists and brand directory tighten paddings, gaps and font sizes below
  52rem.
- **Audit, no defects found:** no duplicate or ambiguous bottle names
  in the data; alphabetical ordering correct (brand, then expression);
  all sourceIds and noteSourceIds resolve; batch/version recorded where
  material (Cielo Rojo); evidence gaps properly disclosed
  (la-venenosa-costa) rather than masked.

### Checks run

- `npm run validate` — schema (with new integrity rules) plus 38
  node:test/jsdom suites (2 new: context-preserving search navigation
  with focus, and a validator test that injects a duplicate bottle name
  and asserts rejection). All passing.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.

## Release 9 — Regional Agave Traditions

### Scope delivered

- **3 new profiles, one example bottle each (7 profiles / 10 bottles / 30
  sources total):**
  - **Tuxca, Li\u00f1eno/Cimarr\u00f3n style (Jalisco\u2013Colima borderlands)** \u2014
    cylindrical pit roast, volcanic crater fermentation, wooden Filipino
    stills; example: Balanc\u00e1n Tuxca Artesanal (Ignacio Ju\u00e1rez /
    Tuxcacuesco; Mezcalistas + Mezcal Reviews). No DO exists for tuxca:
    category text says so explicitly.
  - **Comiteco, aguamiel style (Comit\u00e1n, Chiapas)** \u2014 sap-derived (uncooked
    aguamiel of maguey Comiteco); example: 9 Guardianes Comiteco Blanco.
    Composition disclosure: the category permits a cane-based sugar
    source and whether this bottle is 100% agave is not documented in the
    cited sources \u2014 eligibility for the app is kept distinct from a
    100%-agave claim, and the validator now requires comiteco bottles to
    carry a composition disclosure.
  - **Destilado de pulque, Salmiana style (Tlaxcala)** \u2014 distilled pulque
    (fermented sap, never cooked); example: Estancia Destilado de Pulque
    (46% ABV, Razo family / Rancho San Isidro; Skurnik + Mezcal Reviews).
    Fermented pulque itself is explicitly excluded from the catalogue.
- **Identity honesty:** each regional category field states its actual
  legal status (no DO / not equivalent to tequila or mezcal); aliases
  recorded per profile (tuxca, vino de mezcal tuxca, distilled pulque\u2026).
- **Cooked-heart vs sap-derived explained** without inferring universal
  taste: process fields state which is which; taste text stays sourced.
- **Map coverage:** Chiapas and Tlaxcala now covered/selectable (5
  covered states); same map/data/UX gates as existing content, verified
  by tests.
- Bounded research: one blocked source (TasteAtlas) replaced once;
  9 Guardianes tasting-note detail is thin and its summary says so
  rather than inventing notes.

### Checks run

- `npm run validate` \u2014 schema (new spirits, composition requirement for
  comiteco, aliases) plus 45 node:test/jsdom suites (7 new regional
  tests). All passing.
- Real-app boot smoke: 5 covered states; catalogue renders 10 entries
  with the composition disclosure; comiteco profile shows composition
  and sap-derived process.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.
- Backlog: Costa raicilla profile; more tuxca producers; D'Anta\u00f1o
  (aguamiel + cane) as a disclosed-composition catalogue entry.

## Release 10 — Regional Review & Fixes

Maintenance release per the plan: audit of plant/common-name ambiguity,
mixed fermentables, protected vs cultural names, source dates, map
precision, uncovered expressions and recommendation regressions.

### Findings and fixes

- **Source dates (gap found):** none of the 30 sources recorded when
  they were last verified. Every source now carries a `verified` ISO
  date, and the validator requires it for future sources.
- **Map precision (gap found):** profiles mapped only to states. Each
  profile now stores `placeCoords` with an honest `precision` label
  ("municipality (Comit\u00e1n de Dom\u00ednguez); approximate", etc.),
  displayed on the profile as an approximate location note that
  explicitly says it is a place reference, not a legal boundary. The
  validator enforces coordinates within Mexico's bounding box and a
  precision label containing "approximate".
- **ABV honesty (defect found):** three bottles (Balanc\u00e1n Tuxca, 9
  Guardianes, La Venenosa Costa) silently omitted ABV. Missing ABV is
  now explicitly labeled "ABV not documented in cited sources" on the
  bottle card and catalogue entry, and the validator requires an
  `abvNote` whenever ABV is absent (and forbids a redundant note when
  present).
- **Backlog (gap found):** uncovered expressions and missing profiles
  were not maintained anywhere. `assets/data/backlog.json` now records
  five prioritized entries (Costa raicilla profile gap, D'Anta\u00f1o
  disclosed-composition entry, more tuxca producers, mezcal plant
  variants, Juerte) with kind/item/reason, so content increments are
  driven by substantive gaps rather than filled map areas.
- **Plant/common-name ambiguity (verified, no defect):** every profile
  pairs species with local common names (Li\u00f1eno/Cimarr\u00f3n,
  maguey Comiteco, maguey pulquero) without asserting unsupported
  species identities.
- **Mixed fermentables (verified, no defect):** comiteco composition
  disclosure intact from Release 9; sap-derived vs cooked-heart
  distinctions hold across all seven profiles.
- **Protected vs cultural names (verified, no defect):** DO statuses
  remain honestly stated; no regional name implies tequila-level legal
  status.
- **Recommendation regressions (verified, no defect):** comparison
  ranking, moods and if-you-like suggestions are unchanged and fully
  fixture-tested; no regressions from the expansion.

### Checks run

- `npm run validate` — schema (verified dates, coords bounds/precision,
  abvNote consistency) plus 49 node:test/jsdom suites (4 new regional
  maintenance tests). All passing.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.
- Backlog items land in future content increments.

## Release 11 — Plants, Process & Pairings

### Scope delivered

- **Learn view** (`#/learn`, "Learn" nav link): three sections \u2014 the
  agaves, how the spirits are made, and label vocabulary \u2014 all with
  direct source links, linked from every profile page.
- **Plant pages** (`assets/data/plants.json`, 6 entries): scientific
  identity where established, regional common names (espad\u00edn / Pacifica
  / chico aguiar; Li\u00f1eno / Cimarr\u00f3n; maguey Comiteco; maguey
  pulquero), cultivation status, honest uncertainty statements (the
  Pacifica-vs-espad\u00edn debate is preserved, not settled), and links to
  the profiles that use each plant.
- **Process explanations** (`assets/data/processes.json`, 8): pit roast,
  steam cooking, sap collection, wild fermentation, still types (incl.
  tuxca's Filipino stills), glass resting, wood maturation, filtration \u2014
  each sourced and explicitly non-guaranteeing ("smoke is not guaranteed
  by the method alone"; no universal age-to-flavor ladder).
- **Label glossary** (`assets/data/glossary.json`, 10 terms): pechuga,
  ensamble, cristalino, blanco/joven/reposado classes (with
  spirit-specific scope), NOM, vinata/taberna/palenque, lote/batch, and
  100% de agave \u2014 each in its proper context, with class terms marked
  spirit-specific and non-legal uses labeled editorial.
- **Serving & pairings** on every profile: concise serving guidance and
  optional food suggestions, all labeled editorial; the validator
  requires the editorial/suggestion wording and tests forbid
  "older is better" style claims.
- Educational honesty gates: descriptions do not guarantee flavor from
  geography, species or age; plant age at harvest stays separate from
  spirit maturation.

### Checks run

- `npm run validate` \u2014 schema (plants/processes/glossary/pairing rules)
  plus 53 node:test/jsdom suites (4 new learn tests). All passing.
- Real-app boot smoke: Learn renders 24 cards (6 plants, 8 processes, 10
  glossary terms) with working profile links; profile pages render the
  pairing section and the Learn link (a DOM-helper misuse \u2014 anchor
  passed as text \u2014 was caught by the boot smoke and fixed).

### Remaining issues / deferred

- Native-device rendering still unverified; sourced illustrations or
  diagrams for process steps deferred (text-first per the plan's
  dependency-light rules).

## Release 12 — Learning Review & Fixes

Maintenance release per the plan: audit of cognitive load, jargon,
panel length, source discoverability, semantic headings, mobile
reading, keyboard navigation and guide-to-profile routing, plus
evidence consistency.

### Findings and fixes

- **Guide-to-profile routing (defect found):** learning content linked
  out from profiles but not back \u2014 process and glossary cards were
  dead ends. Method cards now show "Seen in:" links to the profiles
  whose traditions use them (e.g. pit roast \u2192 mezcal, bacanora,
  tuxca), and glossary terms link "Relates to:" profiles where the
  class applies. 38 routing links render across the Learn page.
- **Cognitive load / panel length (improved):** the 24-card Learn wall
  now opens with three jump links (The agaves / How they are made /
  Label vocabulary) to anchored section headings with scroll offset
  under the sticky header.
- **Source discoverability (improved):** every reference line in the
  Learn view now shows its verification date ("review source, verified
  2026-10-20") alongside the kind label.
- **Evidence consistency (defect found):** profile `plant` free text
  could drift from the plants.json taxonomy without notice. Profiles
  now carry a `plantId` link validated against plants.json, and each
  profile's Agave row links "About this agave \u2192" to the Learn page \u2014
  the two layers reference each other instead of duplicating blindly.
- **Semantic headings (verified, no defect):** h2 \u2192 h3 sections \u2192 h4
  cards with aria-labelledby on every card.
- **Mobile reading & keyboard (verified, no defect):** single-column
  learn cards under the existing media query; jump links are real
  anchors; focus styles apply to all interactive elements.
- **Jargon (verified, no defect):** glossary definitions define terms
  in context; processes avoid undefined vocabulary.

### Checks run

- `npm run validate` \u2014 schema (plantId cross-reference rule) plus 55
  node:test/jsdom suites (2 new learn-maintenance tests). All passing.
- Real-app boot smoke: 3 jump links, verified dates visible, 38
  guide-to-profile routing links, profile\u2192plant link and pairing render.

### Remaining issues / deferred

- Native-device rendering still unverified in this environment.

## Release 13 — Regional Depth & Spanish

### Scope delivered

- **Regional depth (backlog-driven):** closed the Costa raicilla gap \u2014
  a new profile (Costa raicilla, coastal style, Jalisco; 8 profiles
  total) built from already-cited sources (pit-cooked angustifolia/
  rhodacantha vs the Sierra's above-ground ovens; Costa is an editorial
  tradition split, not a legal class). The previously uncatalogued
  La Venenosa Costa bottle is re-linked to it: now profile-covered,
  still honestly "tasting notes not yet documented". Approximate
  coordinates and pairing included; backlog updated (gap closed).
- **Spanish edition:** full reviewed Spanish UI and learning chrome \u2014
  nav, explore, compare, catalogue, profile and Learn strings
  ("Explora por estado", "Cat\u00e1logo de botellas", "Notas de cata a\u00fan
  no documentadas", \u2026) via a new `locale.js` with an EN/ES toggle in
  the header (persisted like the theme).
- **Locale isolation:** the locale is a pure presentation concern \u2014
  no locale ever appears in routes, entity IDs or URLs (tested).
- **Translation fallback + disclosure:** missing strings fall back to
  English and set a flag that renders a visible "shown in English
  because a reviewed Spanish translation is not yet available" note
  instead of silently leaking language (tested).
- **Spanish alphabetical behavior:** locale-aware `localeCompare` for
  catalogue/brand lists (\u00c1lamos sorts with the A's); bilingual search
  aliases (raicilla de la costa, humo, dulce).
- **Designation layer:** deliberately not added \u2014 the plan allows it
  only after validating operative declarations and matching geometry;
  recorded as future work.

### Checks run

- `npm run validate` \u2014 schema plus 59 node:test/jsdom suites (4 new
  locale tests). All passing.
- Real-app boot smoke: EN\u2192ES toggle re-renders all views in Spanish,
  routes stay locale-free, ES catalogue renders translated coverage
  labels, Costa profile + bottle flow verified.

### Remaining issues / deferred

- Profile/bottle editorial content (titles, descriptions) remains in
  its authored language, disclosed by the fallback note; translating
  entity content is Release 14 (Localization Review) scope.
- Native-device rendering still unverified in this environment.

### UX hotfix — Learn jumps and link clutter (owner-reported)

**Defects found and fixed:**
- **Learn section buttons did nothing.** Root cause: the jump links were
  anchors whose hrefs (`#learn-plants`) collided with the hash router \u2014
  clicking changed the route, which re-rendered the not-found view and
  wiped the page. They are now real buttons that scroll in-page and
  never touch the route (verified: hash unchanged after click).
- **Learn and Catalogue were cluttered with source links.** All source
  lists (24 Learn cards, 13 catalogue locations) now sit collapsed
  under keyboard-accessible `<details>` disclosures \u2014 "Sources (2)" /
  "Fuentes (2)" \u2014 keeping every reference one click away without
  competing with the educational text. "Seen in:" profile trails are
  styled as a discreet footer line per card.

Verified in a real-app jsdom boot: jumps stay on `#/learn`, all cards
render, zero raw source lists outside disclosures, Spanish summaries
translate. All 59 test suites passing.

### UX hotfix — merged source disclosures (owner-reported)

**Issue:** catalogue entries with editorial notes showed two
unexplained "Sources" dropdowns (e.g. Cielo Rojo: one with 3, one with
2). The two groups are meaningful \u2014 the bottle's own reviews vs the
references backing the profile-relative editorial note \u2014 but the
presentation read as a bug.

**Fix:** one merged disclosure per entry ("Sources (5)") with small
labeled subgroups inside: "For this bottle:" and "For the editorial
note:" ("Para esta botella:" / "Para la nota editorial:" in Spanish).
Entries without editorial notes keep a single group. Reviewer evidence
and the app's editorial synthesis stay distinguishable \u2014 one click,
clear provenance. Verified in a real-app boot; all 59 suites passing.

## Release 14 — Localization Review & Fixes

Maintenance release per the plan: audit of Spanish terminology,
translated layouts, search, sorting, missing translations, route
stability, mobile readability and accessibility.

### Findings and fixes

- **Untranslated surfaces (defect found):** the Compare view and the
  Home view bypassed the locale system entirely \u2014 every string was
  hardcoded English even in ES mode. Both now go through the string
  bundles: "Compara estilos", "Elige al menos dos perfiles",
  "Mayores diferencias", "Quitar", the home heading/intro/CTA
  ("Gu\u00eda de estilos de destilados de agave", "Explora el mapa de
  M\u00e9xico \u2192").
- **Sensory levels and moods (defect found):** compare tables showed
  None/Low/Medium/High and profile mood labels in English only. New
  `locale.level()` and `locale.mood()` helpers translate them \u2014
  "Nada/Bajo/Medio/Alto", "Con humo", "Limpio y herbal", "Final largo",
  "Jard\u00edn del desierto".
- **Bundle parity (verified + enforced):** EN and ES key sets are
  identical; a raw-key leak check is part of the new regression tests
  (no "compare." keys ever render into cells).
- **Terminology (verified, no defect):** Mexican Spanish usage holds
  \u2014 destilados de agave, botella de ejemplo, notas de cata; ABV kept
  as the universal label term; no es-Mexico spelling errors found.
- **Route stability (verified, no defect):** locale still never touches
  routes/IDs; compare selections survive language switches.
- **Mobile & accessibility (verified, no defect):** translated strings
  flow through the same responsive containers; the disclosure and
  toggle controls remain keyboard accessible.
- The untranslated-content disclosure does not render anywhere \u2014
  every shipped UI string now has a reviewed Spanish translation.

### Checks run

- `npm run validate` \u2014 schema plus 61 node:test/jsdom suites (2 new
  Spanish compare/mood regression tests). All passing.
- Real-app ES boot smoke: home, compare (levels "Nada | Medio | \u2026",
  "Quitar" buttons, "Mayores diferencias"), and profile moods all
  render in Spanish with no raw keys and no untranslated note.

### Remaining issues / deferred

- Entity content (profile/bottle prose) remains authored-language by
  design; a content-translation increment can be scheduled from the
  backlog.
- Native-device rendering still unverified in this environment.

### Next pair

Per the plan's cadence, the next feature increment candidate from the
backlog is D'Anta\u00f1o as a disclosed-composition catalogue entry
(agave + cane), followed by its maintenance review.

### UX refinement — profile page reading order (owner-approved review)

Following a full-app UX walk, the profile page was reordered for
learners; content unchanged, presentation only:

- Place name ("Bacanora \u00b7 Sonora, M\u00e9xico") now precedes the raw
  approximate-coordinates note (verification detail, no longer the
  opening statement).
- The beginner note ("New to bacanora?") moved up, directly after the
  description \u2014 the most accessible sentence is now reachable before
  the legal/category facts.
- Flavor moods now follow the sensory facts they summarize, instead of
  preceding them.
- The two fact tables (what-it-is / how-it-tastes) now sit adjacent,
  no longer split by the beginner note and moods.
- The Learn link became a prominent styled callout after the "If you
  like this, try\u2026" suggestions (previously a bare orphan paragraph);
  the suggestions heading got its own semantic class.

Also: the end-to-end boot test now clears its jsdom localStorage,
fixing cross-file test interference (a locale preference persisted by
another test file could flip the e2e run to Spanish).

## Content increment — Tequila maturation classes (owner-requested)

Owner request: tequila profiles explaining reposado, a\u00f1ejo and
cristalino. Pre-implementation audit (owner-requested): every profile
in the app \u2014 all 8, across all 7 traditions \u2014 was an unaged
expression, so wood maturation could not be taught at all. The audit
identified aged-class gaps in mezcal, raicilla and comiteco too; those
were recorded in the backlog for future increments rather than
expanded all at once (per the plan's content-increment rules).

### Added (11 profiles / 13 bottles / 37 sources total)

- **Reposado tequila, Tequila Valley style** \u2014 legal class (2-month oak
  minimum); example: Fortaleza Reposado (Long Island Lou + 88 Bamboo
  reviews). Explicitly refutes age-to-flavor ladders.
- **A\u00f1ejo tequila, Tequila Valley style** \u2014 legal class (1-year
  minimum); example: Fortaleza A\u00f1ejo, ~18 months in ex-bourbon
  (The Whiskey Shelf). "Older is better" framed as marketing, not a
  rule.
- **Cristalino tequila style** \u2014 honestly framed as a finishing/marketing
  style, NOT a legal class; example: PATR\u00d3N A\u00f1ejo Cristalino
  (Tastings.com + Tequila Report + producer page). The profile discloses
  the filtration trade-off ("removes color and, with it, some flavor")
  and the category's additive-use debate.

### Learner value

- The oak dimension of the compare view is now meaningful: blanco vs
  a\u00f1ejo shows the maximal oak gap (None vs High) in "Biggest
  differences"; reposado (medium) and cristalino (low, filtered) slot
  between them.
- Beginner notes explain each class in one sentence; aliases added
  (reposado, anejo, extra anejo, cristalino).
- Backlog now records the cross-tradition aged-class gaps found by the
  audit (mezcal reposado/dormido, raicilla aged classes, comiteco
  a\u00f1ejo, tequila extra a\u00f1ejo).

### Checks

- `npm run validate` \u2014 schema + 63 suites (2 new: honest class framing
  incl. cristalino's non-legal status and additive debate; oak gap in
  compare). All passing.
- Boot smoke: Jalisco lists 7 profiles; cristalino profile renders
  with honest category and PATR\u00d3N example; compare shows Oak None vs
  High as a biggest-difference.

## Release 15 — Interconnected Content Model

Feature release per the plan: the normalized five-entity content model
(plants, regions, spirit traditions, production methods, spirit
expressions) with validated cross-references — no interface redesign.

### What changed

- **New first-class entities:** `traditions.json` (8 traditions with
  origin, history, legal status, materials, practices, diversity) and
  `regions.json` (11 subregion/municipality records with state, type,
  geography, traditions, plants, methods and explicit
  legal-versus-cultural distinctions). Region records are never
  whole-state legal zones; bacanora keeps its municipal framing and
  raicilla's Costa/Sierra split stays an editorial tradition split.
- **Profiles migrated:** every profile now carries `traditionId`,
  `regionIds`, `processIds` and multi-plant `plantIds` (Costa raicilla
  lists both angustifolia/chico aguiar and rhodacantha). Profile ids,
  routes and all display fields are unchanged — no redirects were
  needed because no path moved.
- **Bottles migrated:** every bottle carries `traditionId` and
  `regionIds`; uncovered bottles carry empty region lists rather than
  inherited claims. A new test asserts a bottle's review summary can
  never render as a profile-level (universal) trait.
- **Plants migrated:** plants gained `traditionIds` and `regionIds`;
  `agave-rhodacantha` was added as its own entity (it was previously
  only prose inside the Costa profile). Dasylirion keeps its
  not-an-agave classification, enforced by validation and tests.
- **Many-to-many:** espadín links three traditions (mezcal, bacanora,
  raicilla); one expression can list multiple plants; regions list the
  traditions/plants/processes actually practiced there.
- **Validation extended:** cross-entity reference resolution (profiles,
  bottles, plants, regions, traditions), profile↔region state and
  tradition consistency, bottle↔profile agreement, duplicate ids in the
  new files, no verbatim duplication of tradition legal text into
  profiles/bottles, and bottle-region subset checks.
- **No UI redesign:** existing views run unchanged against the new
  model; the data loader now also fetches the two new files.

### Checks run

- `npm run validate` — extended schema plus 136 node:test/jsdom suites
  (12 new Release 15 model tests in `test/model.test.mjs`). All passing.
- Migration fidelity test pins all 17 profile ids (no lost content, no
  route changes); bidirectional plant↔profile linking is asserted.

### Remaining issues / deferred

- The new traditions and regions entities are data-only; discovery
  surfaces for them (plant/region/tradition pages) are Release 17+
  scope per the roadmap.
- Spanish translations for the new tradition/region editorial text are
  not yet authored; entity content remains authored-language by design.
- Native-device rendering still unverified in this environment.

## Release 16 — Model Review & Fixes

Maintenance release per the plan's protocol: audit of the Release 15
normalized model — entity boundaries, relationship cardinality,
identifier stability, migration fidelity, data contracts and the new
validation rules.

### Findings and fixes

- **Region source contract (defect found):** all 11 region records
  carried legal/geographic claims (e.g. bacanora's municipal DO scope,
  designation dates) with no `sourceIds`. Every region now cites its
  supporting sources, and the validator requires region `sourceIds` —
  closing the data contract so regions stay source-backed like every
  other entity.
- **Migration fidelity — processIds vs prose (defect found):** the sotol
  profile's prose documents steam cooking as an alternative method but
  `processIds` omitted `steam-cook`. Fixed. The cristalino profile said
  "Made as reposado or añejo" without naming the oak its `wood-maturation`
  id claims; the prose (English and Spanish) now says "oak-rested".
  A regression test pins process-id/prose agreement for wood
  maturation, filtration, sap collection, pit roast and steam cooking.
- **Dead validator branch (defect found):** the `type: "state"` region
  check was a no-op placeholder. Replaced with two real rules: region
  `sourceIds` required, and region↔profile plant consistency (a region
  must list every plant its linked profiles claim, so future region
  cards can never miss a documented plant).
- **Relationship cardinality (verified, no defect):** tradition entity
  set exactly matches the spirits used by profiles and bottles; plant
  `traditionIds` agree with the traditions reachable through linked
  profiles; bottle regions are exact subsets of their profile's regions;
  uncovered bottles carry no region claims.
- **Identifier stability (verified, no defect):** all plant, region and
  tradition ids unique and kebab-case; no duplicate or dangling
  references anywhere in the new entities.
- **State consistency (verified, no defect):** every profile region
  lives in the profile's own state and lists the profile's tradition.

### Checks run

- `npm run validate` — schema plus 141 node:test/jsdom suites (5 new
  Release 16 regression tests). All passing.
- Spanish editorial parity re-checked for the changed cristalino prose
  (ES translation updated to match).

### Remaining issues / deferred

- Regions/traditions remain data-only entities; discovery surfaces for
  them are Release 17 (Three Discovery Paths) scope.
- Native-device rendering still unverified in this environment.

## Release 17 — Three Discovery Paths

Feature release per the plan: three equally accessible exploration
entry points (plant, region, spirit) plus flavour-based discovery, all
reading the same Release 15 normalized entities.

### What changed

- **New `#/discover` route** (`discovery-view.js`) with a hub listing
  all 9 plants, 11 regions, 8 traditions and 6 flavour categories, and
  detail pages per entity kind. A "Discover" nav link was added to the
  header alongside Explore.
- **Explore by Plant:** botanical identity, regional common names,
  cultivation and botanical uncertainty; links to the traditions using
  the plant, the regions where it grows, every profile made from it,
  and other plants in the same traditions.
- **Explore by Region:** geography and an explicit
  coverage-vs-legal distinction (municipal framing preserved for
  bacanora); traditions, plants and profiles of the region, plus a link
  to the state map view.
- **Explore by Spirit:** the tradition's origin, history, legal status,
  materials, practices and diversity; all its style profiles and example
  bottles with a catalogue link.
- **Flavour-based discovery:** six approachable categories reusing the
  existing `sensory` metadata (fresh-herbal, fruity-floral,
  smoky-earthly, peppery-spicy, rich-oak, adventurous). Each match
  carries a short why-it-matches explanation, and every page states
  these are editorial tendencies — never a promise about every bottle.
- **No dead ends:** every detail page links back to the hub and across
  entity kinds; unknown ids render an honest not-found state with a
  way back.
- Full EN/ES string coverage for the new surfaces through the existing
  `ui()` bundle; chips meet the 44px tap-target rule with visible focus
  styles.

### Checks run

- `npm run validate` — schema plus 153 node:test/jsdom suites (12 new
  Release 17 discovery tests). All passing.
- Real-app boot smoke on `#/discover`: hub renders all four path
  headings, nav shows the Discover link as the current page.

### Remaining issues / deferred

- Plant/region/spirit pages reuse the shared `discovery-card` styling;
  dedicated per-entity layouts are Release 21 (Richer Profiles) scope.
- Deep-link and focus-restoration polish across discovery navigation is
  Release 18 (Discovery Review) scope.
- Native-device rendering still unverified in this environment.

## Release 18 — Discovery Review & Fixes

Maintenance release per the plan's protocol: audit of the Release 17
discovery surfaces — coverage labelling, region list accessibility,
plant search aliases, flavour explanations, result navigation, state
preservation and mobile layouts.

### Findings and fixes

- **Raw id chips (defect found):** plant pages showed region chips as
  raw ids (`sierra-occidental-jal`) and region pages showed plant chips
  as raw ids (`agave-maximiliana`). Both now display real names
  (region name, species), falling back to the id only if an entity is
  missing.
- **Dead-end back navigation (defect found):** profiles reached from a
  discovery page showed "Back to explore" pointing at the explore view
  — losing the discovery context. The back link now reads
  "Back to discovery" and returns to the exact originating page
  (plant/region/spirit/flavour) via the existing `origin` param.
- **Plant search alias gaps (defect found):** regional common names
  that exist in plants.json were unsearchable — papalote/amarillo
  (rhodacantha), Pacifica/Yaquiana (bacanora's agave), agave azul,
  maguey de mesa, ixtero, liñeno. All now resolve through the alias
  map. A regression test walks every common name in plants.json and
  asserts it finds at least one linked profile.
- **Coverage-vs-designation labelling (verified, no defect):** the
  region hub intro and each region page state that coverage means app
  coverage, not legal boundaries; bacanora keeps municipal framing;
  no whole-state legal zones exist in regions.json.
- **Flavour explanations (verified, no defect):** every flavour match
  carries a per-profile why-it-matches reason plus the editorial
  tendency disclaimer.
- **State preservation (verified, no defect):** discovery links carry
  `origin` params through to profiles, and profile back-links restore
  the source page; the explore view's existing restore mechanism is
  untouched.
- **Mobile/touch (verified, no defect):** chips meet the 44px tap
  target with visible focus; the chip list wraps responsively.

### Checks run

- `npm run validate` — schema plus 158 node:test/jsdom suites (5 new
  Release 18 regression tests). All passing.
- Real-app boot smoke on a plant detail page: region chips render
  names, profile links carry the discovery origin, back navigation
  resolves.

### Remaining issues / deferred

- Dedicated per-entity page layouts remain Release 21 scope.
- Native-device rendering still unverified in this environment.

## Release 19 — Progressive Learning Journey

Feature release per the plan: Learn reorganized into a progressive
educational journey with contextual glossary and completed Mexican
Spanish learning materials.

### What changed

- **Seven progressive chapters** (`assets/data/chapters.json`):
  1) Discover Mexican Spirits, 2) Meet the Plants, 3) From Plant to
  Glass, 4) Understanding Flavour, 5) Understanding Labels,
  6) Choosing and Enjoying, 7) Explore Deeper. Each opens with a short
  intro, progresses basic to advanced, links to real profiles, plants,
  processes and glossary terms, and offers optional "deeper"
  explanations as collapsed disclosures for enthusiasts.
- **Contextual glossary links:** the label chapter links its terms into
  the glossary, and every profile's legal-category field now carries a
  "See the label vocabulary →" link into Learn. Glossary definitions
  render in Spanish when available.
- **Non-sequential by design:** the jump nav lists chapters plus the
  three reference sections (plants, processes, terms); direct access
  to reference material is preserved and no completion is required.
- **Complete Spanish learning coverage:** all 7 chapters and all 10
  glossary terms ship natural Mexican Spanish translations (new
  `chapters` and completed `terms` buckets in content-es.json). The
  Learn view renders fully in Spanish.
- **Validation for missing translations:** `validate.mjs` now fails if
  any chapter block or glossary term lacks a Spanish translation, and
  checks chapter cross-references (profiles, plants, processes,
  terms) resolve.
- Honest-content rules held: no price/age/rarity/ABV-as-quality claims
  in the Choosing chapter; class terms stay spirit-specific; sotol's
  Dasylirion distinction kept explicit; designation geography stays
  municipal.

### Checks run

- `npm run validate` — schema plus 169 node:test/jsdom suites (11 new
  Release 19 learning tests, including a validator-rejects-missing-
  translation test). All passing.
- Real-app boot smoke on `#/learn`: 7 chapters, 10 jump buttons, all
  three reference sections, contextual term links render.

### Remaining issues / deferred

- Chapter-specific illustrations and a Spanish-search glossary are
  Release 20 (Learning Journey Review) scope.
- Native-device rendering still unverified in this environment.

## Release 20 — Learning Journey Review & Fixes

Maintenance release per the plan's protocol: audit of the Release 19
learning journey — chapter flow, jargon, example links, glossary
wiring, Spanish learning parity, mobile reading, keyboard navigation
and cognitive load.

### Findings and fixes

- **Dead-end contextual links (defect found):** chapter term chips and
  process chips linked to `#/learn` — a self-link that does nothing
  when you are already on Learn — and the profile's "See the label
  vocabulary" link landed at the page top, not the glossary. Fixed:
  term chips now smooth-scroll and focus the actual glossary card;
  process chips scroll to the process reference card; new
  `#/learn/terms|plants|processes` deep-link routes land and focus the
  requested section; the profile link targets `#/learn/terms`.
- **Unusable glossary anchors (defect found):** glossary card ids
  contained raw slashes (`term-blanco-/-plata-/-silver`), making them
  invalid fragment targets. Ids are now accent-stripped, slug-safe
  (`term-blanco-plata-silver`) and the headings are focusable.
- **Spanish parity gap in reference sections (defect found):** plant
  cultivation text and process explanations rendered in English in ES
  mode. The empty `plants`/`processes` ES buckets are now filled (9
  plant cultivation notes, 8 process explanations), the Learn view
  renders them localized, and the validator rejects any missing plant
  or process translation — closing the "core learning usable without
  English" acceptance criterion.
- **Chapter flow and jargon (verified, no defect):** chapters stay
  non-sequential with a 10-target jump nav; reading density measured
  acceptable (one reference-heavy block in Explore Deeper is
  enthusiast material behind no false claims).
- **Example links (verified, no defect):** every chapter example chip
  resolves to a real profile/plant/process/term — enforced by
  validation since Release 19.

### Checks run

- `npm run validate` — schema plus 175 node:test/jsdom suites (6 new
  Release 20 regression tests, including a validator-rejection test
  for missing process translations). All passing.
- Real-app boot smoke: `#/learn/terms` deep link renders and focuses
  the glossary; ES mode renders plant cultivation and process text in
  Spanish.

### Remaining issues / deferred

- Chapter illustrations and glossary search remain backlog items.
- Native-device rendering still unverified in this environment.

## Release 21 — Richer Profiles

Feature release per the plan: profile pages upgraded into the full
educational experience for plants, traditions and expressions.

### What changed

- **Dedicated plant pages** (`#/plant/:id`, new
  `plant-tradition-view.js`): identity (scientific + common names with
  regions), at a glance, where it grows (with region chips),
  harvesting and production, qualified sensory tendencies (always
  framed as editorial guidance), regional expressions, sustainability,
  and further reading (sources). Sotol's Dasylirion page states the
  not-an-agave distinction up front; wild vs cultivated is
  distinguished where evidence supports it; disputed local names stay
  unmerged.
- **Dedicated tradition pages** (`#/tradition/:id`): what it is,
  origin, history and cultural significance, legal status, materials
  (with plant-page links), traditional production, distinguishing
  traits, regional variations, beginner starting points (surfacing the
  beginner note), expressions for exploration, and further reading.
- **Redesigned expression profiles:** a visible "Why does it taste this
  way" section with evidence-based, non-deterministic cause-and-effect
  text on every profile (plant, environment, cooking, fermentation,
  distillation, ageing); "How to enjoy it" (the retained pairing
  guidance); example bottles in their own section; and "Explore next"
  destinations labeled with why each is relevant (same plant different
  region, same tradition different method, similar character, more
  adventurous). Technical detail and sources stay in expandable
  sections; all existing sensory comparisons, tasting notes, example
  bottles, suggestions and source attribution are retained.
- **Full Spanish parity for the new content:** why-it-tastes text for
  all 17 profiles and all five enriched plant fields for all 9 plants
  ship reviewed Mexican Spanish translations; the new pages and
  sections render fully localized.
- **Validation extended:** every profile must carry whyItTastes (with
  ES translation); every plant must carry the enriched page fields.

### Checks run

- `npm run validate` — schema plus 186 node:test/jsdom suites (11 new
  Release 21 tests). All passing.
- Real-app boot smoke: `#/plant/agave-potatorum` (7 sections),
  `#/tradition/bacanora` (10 sections), and a redesigned profile all
  render with the new structure.

### Remaining issues / deferred

- Plant illustrations ("where reliable") remain backlog — no reliable
  licensed artwork identified yet; not invented.
- Deeper cause-and-effect links (e.g. fermentation chemistry) need
  technical sources; only evidence-backed statements shipped.
- Native-device rendering still unverified in this environment.

## Release 22 — Profile Review & Fixes

Maintenance release per the plan's protocol: audit of the Release 21
richer profiles — cause-and-effect evidence, editorial-restriction
compliance on plant pages, related-content relevance, back navigation
and disclosure behaviour.

### Findings and fixes

- **Unsafe source links (defect found):** the plant/tradition pages
  built external source anchors directly, bypassing the app's
  `safeLink` https/no-credential validation that every other surface
  uses. Both pages now route through `safeLink` (with
  `noopener noreferrer`), restoring the security test's guarantee to
  the new pages.
- **Lost back-context in explore-next (defect found):** Release 21's
  explore-next destinations linked bare profile URLs, so the
  destination offered no way back to the style the reader came from —
  and a suggestions duplicate could repeat in the list. Destinations
  now carry `origin=profile:<source>`, the destination's back link
  reads "← Back to the style you were reading" and returns to the
  exact source profile, and suggestion duplicates are filtered.
- **Stale plant link (defect found):** the profile's "About this
  agave" link still pointed at the Learn reference (`#/learn`)
  instead of the new dedicated plant page. It now targets
  `#/plant/:plantId`.
- **Stray empty paragraph (defect found):** the tradition page
  rendered a leftover empty `p` in the beginner section. Removed.
- **Cause-and-effect evidence (verified, no defect):** every
  why-it-tastes text was audited for quality-ladder claims
  (best/superior/premium) and deterministic language
  (always/guarantee) — none present; a regression test now pins that
  discipline. Each claim traces to plant/place/process facts already
  documented in the profile data.
- **Plant-page editorial restrictions (verified, no defect):**
  sensory tendencies stay qualified as editorial guidance on every
  plant; Dasylirion keeps its not-an-agave distinction; disputed
  local names remain unmerged.

### Checks run

- `npm run validate` — schema plus 191 node:test/jsdom suites (5 new
  Release 22 regression tests). All passing.
- Real-app boot smoke: profile → explore-next destination → back link
  round-trips to the source profile; plant link opens the dedicated
  plant page.

### Remaining issues / deferred

- Plant illustrations remain backlog (no reliable licensed artwork
  identified; not invented).
- Native-device rendering still unverified in this environment.

## Release 23 — Comparison Intelligence

Feature release per the plan: comparisons explain meaningful
differences rather than merely displaying scores.

### What changed

- **Plain-language summary above the detailed comparison:** every
  comparison now opens with "What this comparison tells you" —
  perspective chips naming the variable at play, then the biggest
  documented differences in one sentence with per-profile levels. When
  the data cannot support a statement, none is manufactured: no
  perspectives detected and no differences documented yields the
  existing honest "no documented differences" line, and undocumented
  attributes stay excluded from difference claims (verified by tests
  with null-sensory fixtures).
- **Five meaningful comparison perspectives**, each detected from
  documented entity relationships and carrying its evidence: same
  plant different region (plantIds), same tradition different plant
  (traditionId), same tradition different method (processIds),
  similar flavours across traditions (shared documented flavor moods),
  and unaged versus wood-rested (wood-maturation process). Example:
  blanco vs reposado tequila reads "Same tradition (Tequila),
  different production methods — the method is the variable here" and
  "Wood-rested … versus unaged … — oak influence is the variable here".
- **Recommendation relevance retained and verified:** if-you-like
  suggestions keep naming their shared attributes; a regression test
  pins that every suggestion carries its relevance.
- Full EN/ES coverage for the new summary strings; chips respect the
  44px tap-target rule.

### Notable fix during development

The unaged-vs-wood perspective initially never fired: the profile
finder was written as `find((p) => !isWoodRested)` — negating the
function instead of calling it, so `find` never matched. Caught by
debug-tracing the engine against the blanco/reposado pair, fixed, and
pinned by a dedicated test.

### Checks run

- `npm run validate` — schema plus 204 node:test/jsdom suites (13 new
  Release 23 tests covering all five perspectives, evidence fields,
  no-invention cases, null-sensory honesty, DOM order, Spanish
  rendering and recommendation relevance). All passing.
- Real-app boot smoke on a two-profile compare: summary renders above
  the table with correct perspective chips and difference line.

### Remaining issues / deferred

- Cross-tradition trio comparisons could rank perspectives; current
  detection is binary (present/absent) per perspective.
- Native-device rendering still unverified in this environment.

## Release 24 — Comparison & Navigation Review & Fixes

Maintenance release per the plan's protocol: audit of the Release 23
comparison intelligence plus comparison interpretation,
recommendation relevance and determinism, cross-link context
preservation, and focus after view changes.

### Findings and fixes

- **Stale README scope note (defect found):** the README claimed
  "sotol and other non-agave spirits are excluded" and listed seven
  traditions, but the catalogue has carried an owner-approved sotol
  profile (Chihuahua, Clande Yellow example) and a Dasylirion plant
  page since the sotol policy change. The scope note now states the
  actual coverage: eight traditions with sotol as the one explicitly
  disclosed agave-adjacent tradition, other non-agave spirits still
  excluded. A regression test pins the README against the sotol
  profile in the data.
- **Not-found view ignored its locale (defect found):** app.js passes
  `locale` to `renderProfileNotFound`, but the function ignored it —
  an unknown profile id rendered hardcoded English ("Profile not
  found", "← Back to explore") inside the Spanish UI, and the old
  locale-acceptance test had to allow either language. The view now
  localizes via the standard string table (`profile.notFound`,
  `profile.notFoundBody`, `profile.backExplore`), with English
  defaults for direct callers without a locale. The Spanish check is
  now strict (no English fallback allowed) and English behavior is
  pinned separately.
- **Comparison summary accuracy (verified, no defect):** the
  summary's difference line uses `biggestDifferences` levels indexed
  in the same order as the rendered columns; ties sort deterministically
  by dimension key; profiles missing a sensory level are excluded
  from difference claims (null-sensory tests still pass).
- **Perspective support (verified, no defect):** all five Release 23
  perspectives carry evidence and render in Spanish without raw keys
  leaking; perspective claims are binary present/absent per the
  honest no-invention rule.
- **Recommendation determinism (verified, no defect):**
  `ifYouLikeThis` iterates candidates in data order and slices to a
  fixed maximum, so identical inputs produce identical suggestions;
  every suggestion still names its shared attributes.
- **Cross-link context preservation (verified, no defect):**
  suggestion links keep `from`/`origin` params, explore-next links
  carry `origin=profile:<id>`, and the back-link matrix
  (catalogue/discover/profile/explore) is covered by existing
  regression tests that still pass.
- **Focus after view changes (verified, no defect):** comparison
  picker focus restores to the acted-on button; list views restore
  scroll from captured snapshots; `main` regains focus after each
  route render. Same-route re-renders preserve expanded disclosures.
- **Unverified concern, not acted on:** the explore-next
  "adventurous" pick hardcodes the tradition list
  (tuxca/comiteco/destilado-de-pulque/sotol) in two places
  (profile.js, discovery-view.js). Behavior is correct for current
  data; deferred deduplication since no defect was demonstrated and
  Release 25 will touch discovery threads anyway.

### Checks run

- `npm run validate` — schema plus 206 node:test/jsdom suites (2 new
  Release 24 tests). All passing.
- Manual DOM audit of the compare view against the blanco/reposado
  pair (perspectives, difference line, Spanish rendering) and of the
  not-found route in both locales.

### Remaining issues / deferred

- Perspective ranking for cross-tradition trios (carried over from
  Release 23).
- Native Safari/VoiceOver checks still unverified in this environment.

## Release 25 — Editorial Enrichment & Bottle Depth

Feature/content release per the plan: deeper coverage where it adds
educational value, prioritizing evidence quality over catalogue size.

### What changed

- **Five new bottles, each with one producer page and one credible
  expression-matched review** (per the review-provenance rules):
  - **Aguamiel Bacanora Blanco** (41% ABV, Suaqui Grande, Sonora;
    wild yaquiana/Pacifica agave) — the owner-backlog request,
    mapped to the bacanora profile.
  - **Don Julio Blanco** (38% ABV, Atotonilco el Alto highlands) —
    review by Difford's Guide; honestly marked profile-not-covered
    rather than mis-mapped onto the Tequila Valley blanco profile.
  - **Jose Cuervo Tradicional Reposado** (40% ABV, La Rojeña, Tequila)
    — review by The Rum Howler (a dated 2022 re-review noting held-back
    character); mapped to the valley reposado profile.
  - **PATRÓN Silver** (40% ABV, Hacienda Patrón NOM 1492, highlands) —
    review by Liquor.com; profile-not-covered (highlands), with the
    brand spelling matched to the existing cristalino entry.
  - **Casa Dragones Blanco** (40% ABV, Tequila) — review by Bevvy;
    mapped to the valley blanco profile. Contested process claims
    (diffuser vs. brand account) are omitted per the editorial policy.
- **New bottle data fields, rendered in the catalogue and validated:**
  `classification` (legal category/class) and `plantComposition`
  (documented agave composition), with full EN/ES locale support and
  validator rules. Highland blancos carry explicit profile-not-covered
  disclosures rather than borrowed character.
- **Deeper sustainability content with dated evidence:** the wild-harvested
  plant pages (angustifolia, potatorum, maximiliana) now explain
  region-specific harvest pressure and cite a category sustainability
  source (reviewed 2026-10-21); tradition pages (tequila, bacanora,
  mezcal, raicilla) gained a Sustainability section distinguishing
  cultivated-scale from wild-harvest pressure, in EN and ES.
- **Backlog maintained:** the Aguamiel item is fulfilled and removed;
  the Don Julio/Cuervo/Casa Dragones producer entries are marked
  partially covered with remaining expressions still gated on
  expression-matched reviews.
- README catalogue description now mentions the classification and
  plant-composition facts.

### Checks run

- `npm run validate` — schema plus 210 node:test/jsdom suites (4 new
  Release 25 tests: bottle field coverage, honest uncovered highlands,
  rendered classification/plant facts, sustainability sourcing, and ES
  translation completeness). All passing.
- Validator additions: `classification`, `plantComposition` and
  tradition `sustainability` contracts enforced.

### Remaining issues / deferred

- Highland tequila blanco remains without its own style profile; the
  two highland bottles carry explicit coverage disclosures until a
  profile is authored.
- Native-device rendering still unverified in this environment.

## Release 26 — Editorial Standards Review & Fixes

Maintenance release per the plan's protocol: audit of the Release 25
editorial enrichment — evidence quality and provenance, sensory-claim
discipline, legal/cultural framing, Spanish/English parity,
scope-description accuracy and discovery regressions.

### Findings and fixes

- **Missing Spanish parity on the new bottle fields (defect found):**
  the five Release 25 bottles carried `classification` and
  `plantComposition` with no Spanish entries, so both rendered in
  English inside the Spanish UI without any disclosure. All ten
  translations added; a strict regression test now renders every new
  bottle in Spanish and fails if raw English appears, plus a
  no-silent-gaps test asserting every translated field of every bottle
  has an ES entry.
- **Unattributed editorial framing inside a review summary (defect
  found):** the Don Julio Blanco reviewSummary ended "a highland
  blanco in the modern premium style" — the app's framing presented as
  Difford's observation. Re-verified against the actual Difford's page
  (sampled 2011) and rewritten to attribute only what the review says:
  peppery/mineral nose with lemon, pink grapefruit and pastry aromas,
  fudge/pastry palate, long dry peppery finish; the un-aged/inert-rest
  fact kept. Spanish translation updated to match.
- **Shared adventurous-tradition list (improvement, deferred from
  Release 24):** the "more adventurous" tradition list was hardcoded in
  both profile.js and discovery-view.js and would silently drift when a
  tradition is added. Extracted to a single
  `ADVENTUROUS_TRADITIONS` constant in spirit-labels.js with a pinning
  test.
- **Evidence provenance (verified, no defect):** the
  mezcalistas-wild-agave-sustainability source was fetched and
  confirmed on-topic (Mezcalistas' sustainability series index); the
  Rum Howler Cuervo review verified as a dated 2022 re-review (80.5/100)
  whose held-back-character finding the summary paraphrases faithfully;
  all 11 new sources are https with verification dates.
- **Sensory-claim discipline and framing (verified, no defect):**
  sustainability texts state scoped concerns and label producer claims
  as unverified where evidence is limited; cultivated-vs-wild and
  legal-vs-cultural distinctions hold in the new content; contested
  Casa Dragones process claims remain omitted.
- **Scope accuracy (verified, no defect):** data spirits, tradition
  entities and the README's eight-tradition description agree; search
  finds all five new bottles including accent-normalized "patron".
- **Backlog requiring action (reviewed):** the four remaining items are
  producer expansions (Don Julio, Jose Cuervo, Patrón, Casa Dragones)
  whose remaining expressions stay evidence-gated on exact label facts
  plus one expression-matched review each; they remain correctly parked
  in backlog.json with their gates, not silently droppable. No other
  backlog items exist.

### Checks run

- `npm run validate` — schema plus 213 node:test/jsdom suites (3 new
  Release 26 tests). All passing.
- Manual web verification of the two sources behind the corrected
  review summaries (Difford's Don Julio page, Rum Howler Cuervo page).

### Remaining issues / deferred

- Highland tequila blanco still lacks its own style profile (carried
  from Release 25).
- Native Safari/VoiceOver checks still unverified in this environment.

## Content increment — Highland blanco tequila profile (Los Altos)

First increment of the post-roadmap backlog pair established at
Release 26: the deferred highland tequila blanco style profile.

### What changed

- **New style profile `tequila-blanco-highland-jalisco`** — the
  highland (Los Altos) reading of the unaged blanco class: sweeter
  cooked agave, citrus and tropical/stone fruit, delicate florals and
  gentle spice in a softer body, explicitly framed as a cultural and
  agronomic distinction rather than a legal class. Sourced against a
  Food & Wine highlands-vs-valleys explainer, the existing tequila
  category references, and the Difford's Don Julio review.
- **Honest uncertainty kept:** the why-it-tastes section states that a
  blind tasting panel found the regional pattern weaker than folklore
  suggests, citing that panel source — a tendency, never a guarantee.
- **The two formerly-uncovered highland bottles now map to the new
  profile:** Don Julio Blanco (featured example) and PATRÓN Silver
  moved from `profile-not-covered` to full coverage with their
  highland region claims restored; their editorial notes now explain
  the highland-vs-valley relation within the covered profile.
- **Full Spanish edition of the new profile** (title, context,
  description, beginner note, category, process, finish, pairing,
  why-it-tastes), plus the plant back-link (agave-tequilana lists the
  new profile) and two new style sources with verification dates.
- The R15 migration pins and the R25 honest-coverage test updated to
  the new reality (18 profiles; highland bottles covered, not
  disclosed as uncovered).

### Checks run

- `npm run validate` — schema plus 214 node:test/jsdom suites (1 new
  increment test: profile existence, sourcing, the honest caveat,
  bottle mapping and the plant back-link). All passing.
- DOM smoke of the new profile in English and Spanish: correct
  titles, translated why-it-tastes with no raw keys leaking, featured
  bottle card rendering, and explore-next links present.

### Remaining issues / deferred

- The explore-next threads now link the valley and highland blancos
  (same plant, different region) — comparison perspectives should
  pick this pair up automatically; a dedicated pairing review belongs
  to the next maintenance pass.
- Native-device checks still unverified in this environment.

## Content increment — more example bottles for single-example styles

Second increment of the post-roadmap pair: catalogue depth where
profiles showed only one example bottle.

### What changed

- **Three new bottles, each with one producer page and one credible
  expression-matched review:**
  - **G4 Blanco** (40% ABV, El Pandillo, NOM 1579, Jesús María, Los
    Altos) — The Daily Pour review; second example for the highland
    blanco profile, with the rainwater/spring-water and tahona
    method documented in the batch field.
  - **Maestro Dobel 50 Cristalino** (40% ABV, Jalisco) — Tastings.com
    2021 judging (94 points) plus the producer page; second example
    for the cristalino-style profile, oak-aged 3+ years then
    filtered clear.
  - **Cascahuín Añejo** (El Arenal, Tequila Valley region, NOM 1123)
    — 88 Bamboo taste test; second example for the valley añejo
    profile, 14–16 months in well-seasoned American oak. ABV left
    undocumented with an honest note rather than guessed.
- **La Venenosa Raicilla Costa gained its documented tasting:** an
  expression-matched Mezcal Reviews member tasting (lote 32, 2021)
  replaces the tasting-not-documented disclosure; producer detail
  sharpened to the actual tabernero (Don Alberto Hernández, El Tuito)
  rather than the bottler.
- Single-example profiles reduced from eight to five. Candidates that
  failed the honest-mapping gates were skipped, not forced: Tequila
  Ocho (highlands, cannot map to valley añejo), Siete Leguas
  (highlands distillery), Balam Comiteco (Amatenango, outside the
  Comitán-scoped comiteco profiles).
- Full Spanish translations for every new and changed bottle field,
  including classification, plant composition and batch facts.

### Checks run

- `npm run validate` — schema plus 215 node:test/jsdom suites (1 new
  increment test pinning the new mappings, the costa review swap and
  the exact set of remaining single-example profiles). All passing.
- DOM smoke of all four entries in English and Spanish: reviews
  render, translations complete, no raw English in the Spanish UI.

### Remaining issues / deferred

- Still one example each: comiteco blanco/añejo (Comitán-scoped; the
  documented alternatives are from Amatenango or cane-blended),
  costa raicilla and raicilla reposado (single documented producer
  lines), and highland extra añejo. All remain evidence-gated.
- Native-device checks still unverified in this environment.

## UX refinement — quiet navigation, immersive reading (owner-requested)

Owner feedback: the highlighted links were competing with the
meaningful content; the site should immerse the reader in the spirits
and why they taste the way they do. Typographic differentiation
between what deserves emphasis and what should be quietly mentioned.

### What changed

- **Reading hierarchy established:** editorial prose (why-it-tastes,
  context, description) now reads at 1.12rem/1.75 line height with a
  62ch measure — visually dominant; explore-next drops to a footnote
  scale (1.05rem heading, soft color) under a hairline rule.
- **Compare action demoted:** "Compare this style" is no longer a
  boxed secondary button; it reads as a quiet inline link (0.9rem,
  soft color, hairline underline), keeping the 44px tap target and
  the selected/full states.
- **Explore-next demoted:** the three destination cards no longer use
  the result-card treatment in the profile tail — they render as
  inline text links (0.95rem, soft color), with the eyebrow label at
  caption size. Suggestion links likewise lost the bright añejo color
  and boxed list items.
- **Learn callout calmed:** no box, no soft-green background, no emoji
  prefix, no hover lift — a single quiet inline link.
- **Result grids untouched:** the discovery card treatment (borders,
  padding, hover) remains for actual content results — the Explore
  view, Discover by plant/region/spirit, and the catalogue brand
  directory.
- **Vocabulary:** a shared `.quiet-link` style (soft color, hairline
  underline, calm hover) now backs the compare link; plant-learn
  links in the facts block aligned to it, replacing the blue.
- No content, links or destinations changed — only their visual
  weight.

### Checks run

- `npm run validate` — schema plus 216 node:test/jsdom suites (1 new
  design-regression test pinning the quiet vocabulary, the demoted
  tail, the retained result-card treatment and the reading
  hierarchy). All passing.
- DOM verification: compare link renders as `compare-profile-link
  quiet-link` (no `secondary-button`); explore-next cards and
  suggestions present as inline links.

### Remaining issues / deferred

- Native-device rendering of the new hierarchy still unverified in
  this environment (owner should eyeball the Pages site).
- The owner-suggested producer-note evidence tier for remaining
  single-example styles is a separate pending content increment.

## Content increment — producer-note evidence tier (owner-approved)

Owner policy: where no credible review exists, the producer's own
description may stand in, as long as it is explicitly attributed to
them. Applied to the remaining single-example styles.

### What changed

- **New evidence tier in practice:** Tequila Ocho Extra Añejo (40%,
  single estate, Arandas, NOM 1474) joins the highland extra añejo
  profile as its second example. No independent review of the current
  release is documented, so the summary opens by saying exactly that
  and then gives the producer's own tasting notes (cherries, anise,
  dark chocolate, sherry, oak, plantain; oak, anise, dried fruit,
  toffee, black pepper, cinnamon) with "per the producer's own notes"
  attribution, citing the producer's terroir page.
- **Balam Raicilla Costa** (Don Rosalío Rodríguez, El Tuito, 45%) joins
  the costa raicilla profile as a second example on producer facts
  only — classification, plant composition (Chino Aguiar/rhodacantha,
  batch-varying) — with the tasting-not-documented disclosure kept:
  producer facts fill identity gaps but never become invented tasting
  notes.
- **D'Antaño Comiteco** gained an exact-expression review (Tom
  Pynchon's Liquor Cabinet, 2024): neat, would substitute cleanly for
  white rum in a mojito. Its catalogue entry now shows a review while
  staying honestly profile-not-covered.
- **Comiteco entries deepened with importer-documented process facts:**
  the blanco is glass-rested about six months before bottling and the
  añejo takes its wood character from glass-resting with white-oak
  branches rather than barrels — attributed to the producer's US
  importer (Back Alley Imports), whose Comiteco page documents the
  full production chain.
- **Spanish parity:** the strict no-silent-gaps test (added in
  Release 26) caught pre-existing untranslated fields on the comiteco
  and D'Antaño entries; all are now translated along with every new
  field.
- Single-example profiles reduced from five to three (comiteco blanco
  and añejo stay single — the Comitán-scoped candidates remain
  evidence-gated; raicilla reposado stays single — no honest second
  bottle exists yet).

### Checks run

- `npm run validate` — schema plus 217 node:test/jsdom suites (1 new
  producer-note-tier test: up-front review-gap statement, inline
  producer attribution, cited producer sources, and the Balam
  entry's honest no-tasting discipline). All passing.
- DOM smoke of the four touched entries in EN and ES: producer
  attributions render, no raw English in the Spanish UI, Balam
  correctly shows the disclosure instead of a review.

### Remaining issues / deferred

- Comiteco blanco/añejo and raicilla reposado remain single-example
  profiles (candidates still fail the honest-mapping gates).
- Native-device checks still unverified in this environment.

## Post-roadmap maintenance — comparison maturation perspective

Maintenance pass over the four increments shipped after Release 26
(highland blanco profile, bottle depth, quiet-navigation UX,
producer-note evidence tier), per the plan's protocol. Also
established the next post-roadmap pairs in the plan (producer
catalogue expansion, learning journey refresh, reviewed Spanish
localization).

### Findings and fixes

- **Missing maturation perspective (defect found):** reposado vs
  añejo tequila — the most natural comparison in the catalogue —
  produced no perspective at all, because both profiles carry the
  same `wood-maturation` process id, so the engine had no documented
  variable to name. Fixed with a structured `maturation` field
  (class + duration, taken from each profile's own sourced category
  text) on all six wood-rested profiles, and a new
  `differentMaturation` perspective that fires only when the
  documented classes genuinely differ. The compare view renders it
  as "time in oak is the variable here" in English and Spanish, with
  a validator rule enforcing that maturation claims require the
  wood-maturation process.
- **Producer-note attribution discipline (verified, no defect):**
  every producer-derived tasting opens by stating the review gap and
  attributes the notes inline; no entry phrases producer claims as
  independent observations.
- **ES parity (verified, no defect):** full sweep across all 41
  bottles and 18 profiles found zero untranslated fields; the
  newest comparison perspective ships in both languages.
- **Source integrity (verified, no defect):** no dangling source
  references; every source URL is https with a verification date.
- **Discovery (verified, no defect):** the newest bottles are
  findable by brand, expression and class ("Ocho", "Balam",
  "cristalino", "Comiteco"); the valley-vs-highland blanco pair
  correctly triggers the same-plant-different-region perspective
  with fruit/herbal as the documented differences.
- **UX spot check (verified in DOM, not on native devices):** the
  quiet-link vocabulary renders as designed; the hierarchy test
  still pins editorial prose above navigation.

### Checks run

- `npm run validate` — schema plus 220 node:test/jsdom suites (3 new
  tests: the maturation perspective, its no-false-positive case,
  and the Spanish rendering). All passing.

### Remaining issues / deferred

- Native Safari/VoiceOver verification of the quiet-link UX remains
  an owner-side check.
- The three single-example styles stay evidence-gated (comiteco
  blanco/añejo, raicilla reposado).

### Plan updates

- Post-roadmap pairs 2–4 recorded in RELEASE_PLAN.md: producer
  catalogue expansion (feature), learning journey refresh
  (feature), reviewed Spanish localization (maintenance).

## Post-roadmap pair 2 — Producer Catalogue Expansion

All four owner-requested producers are now fully covered in the
catalogue; backlog.json is empty.

### What changed

- **Five new expressions, each with an independent dated review:**
  - **Jose Cuervo Tradicional Plata** (38%, Casa Cuervo, central
    valley) — The Rum Howler 2018 review; honestly mapped to the
    valley blanco profile, giving it a third example.
  - **Don Julio Reposado** (38%, 8 months oak, Rum Howler 2020,
    87.5/100) and **Don Julio Añejo** (38%, 18 months oak, Rum Howler
    2018, 90.5/100) — catalogue facts with `profile-not-covered`
    disclosures: both distill in Los Altos, and the reposado/añejo
    profiles describe the Tequila Valley reading. The editorial
    notes explain exactly that relation rather than borrowing the
    valley profiles' character.
  - **PATRÓN Reposado** (40%, ~6 months oak, Rum Howler review; the
    tahona/roller blend documented from Difford's producer profile) —
    same honest highlands treatment.
  - **Casa Dragones Joven** (40%, Wine Enthusiast 96 points, blind
    tasted) — uncovered with the reason stated: the app has no joven
    tequila profile (joven needs composition evidence per the plan);
    the note ties it to the cristalino-style profile as the nearest
    relative and explains why it is not one.
- **Full Spanish translations** for every new field; one translation
  was rephrased after the strict ES-parity test caught its opening
  mirroring the English lead.
- **Backlog cleared:** all four producer-expansion items fulfilled
  and removed.

### Checks run

- `npm run validate` — schema plus 221 node:test/jsdom suites (1 new
  expansion test: the plata mapping, the four honest-coverage entries
  with their explanatory notes, and every new bottle carrying an
  independent review). All passing.

### Remaining issues / deferred

- The highlands reposado/añejo and joven expressions stay
  profile-not-covered until matching style profiles exist (highland
  aged styles; a joven profile gated on composition evidence).
- Native-device checks still unverified in this environment.

## Post-roadmap pair 3 — Learning Journey Refresh

The Learn chapters now teach the content threads the app acquired
since Release 19, with full Spanish parity.

### What changed

- **From Plant to Glass** — the resting block teaches the comiteco
  third path: wood character from glass-resting with white-oak
  branches rather than barrels, attributed to the producer's own
  importer, framing resting traditions as more varied than the legal
  classes suggest.
- **Understanding Flavour** — the body/smoke block now teaches the
  highland/valley terroir tendency ("valley agave trends earthy and
  savory, Los Altos sweeter and fruitier") with the honest caveat
  carried from the profiles: a blind tasting panel found the pattern
  weaker than folklore suggests.
- **Explore Deeper** — the sustainability block widened from
  species-level cases (tobalá, sotol) to tradition-scale pressure
  (bacanora and raicilla depend on wild-harvested agaves; cultivated
  espadín and blue weber carry far less), with three example profiles
  linked and the producer-claims-are-unverified discipline stated.
- **Understanding Labels** — a new fourth block teaches the
  evidence-tier distinction the app now models by example:
  independent reviews vs producer notes vs editorial synthesis, and
  the reading habit to carry away ("ask whose palate a tasting claim
  came from").
- Full Spanish translations for every changed and new block; the
  validator's chapter-translation completeness rule covers the new
  block automatically.

### Checks run

- `npm run validate` — schema plus 222 node:test/jsdom suites (1 new
  pair-3 test pinning all four refreshed threads). All passing.
- DOM smoke of the Learn view in English and Spanish: all four
  threads render, no raw keys, no English leakage in the Spanish UI.

### Remaining issues / deferred

- Pair 4 (reviewed Spanish localization by a fluent reader) remains
  the natural next pass over this and earlier editorial prose.
- Native-device checks still unverified in this environment.

## Post-roadmap pair 4 — Reviewed Spanish Localization

Maintenance pass over the accumulated editorial translations (41
bottles, 18 profiles, plant/tradition sustainability sections, seven
learning chapters, all comparison perspectives), per the plan's
localization-review scope. Machine-side review; the owner's
native-reader eyeball remains recommended.

### Findings and fixes

- **Terminology drift (defect found):** 15 translated fields used
  "100% agave" while 13 used the canonical Spanish legal phrasing
  "100% de agave" — the form the app's own glossary defines as its
  term. All 15 normalized to the canonical form (now 32 consistent
  uses), and a regression test pins the canonical form plus a broader
  English-leakage guard.
- **Duplicated word (defect found):** the El Acabo batch text read
  "de la taberna Taberna 3 Gallos" (and the English mirrored it: "the
  Taberna 3 Gallos taberna") — the common noun duplicating the
  producer's name. Both languages fixed to name the taberna once.
- **Verified, no defect:** no English leakage anywhere in the
  translated content beyond publication proper nouns (The Rum
  Howler, Difford's, Wine Enthusiast) — every remaining " the "
  occurrence is inside a cited publication name; no untranslated
  chapter blocks (including pair 3's new evidence-tier block); no
  decimal-point drift (Spanish comma separators used); attribution
  phrasing ("según el productor / la marca / el importador") is
  varied by claim owner, not inconsistent; the parenthetical English
  class-name glosses in the reposado/añejo/extra-añejo contexts
  ('rested', 'aged') are intentional glosses of legal-class English
  names, kept. The UI string table (133 Spanish strings) scanned
  clean.

### Checks run

- `npm run validate` — schema plus 223 node:test/jsdom suites (1 new
  terminology-consistency test). All passing.

### Remaining issues / deferred

- A fluent native-reader pass would still add value beyond mechanical
  review (naturalness, regional register) — flagged to the owner as
  the plan intends.
- Native-device checks still unverified in this environment.

## Post-roadmap pair 5 — Warm Storytelling & Disclaimer Placement

Scope per plan: restore the warm editorial story to the top of the
profile reading flow, end the page-opening compliance note, consolidate
hedging, and keep evidence attributed but out of the reading flow.

### What changed

- **Story first, disclosures last.** The profile view no longer moves
  the warm `context`/`description` paragraphs into a collapsed
  "Place, plant & craft" disclosure after building the page. New
  reading order: identity → story (context, description, beginner
  note) → why does it taste this way → how it is made (craft facts,
  now visible) → character in the glass (sensory overview, facts,
  flavor moods) → how to enjoy it → example bottles → explore next →
  compare action → collapsed sources/coordinates → one small
  editorial-guidance note at the very end.
- **Disclaimer consolidation.** The "editorial style guidance" note
  moved from above all content to the end of the profile; the 17
  duplicated in-description guidance sentences (EN and ES) were
  removed; the sensory overview's qualifier line was dropped (the
  end-of-page note covers it); `coordsNote` no longer says
  "approximate" twice and lives inside the collapsed sources
  disclosure.
- **Disclosure pattern reserved for skip-this content.** Collapsed
  `<details>` now contains only sources and the place-coordinate
  reference. Story, craft facts and character are never hidden.
- **Voice pass (EN + ES).** Comiteco no longer discusses "eligibility
  for this app" — the composition disclosure is delivered in the
  narrator's voice ("an honest bottle always tells you what is in
  it"); tuxca drops "a working description centers production on…"
  for "Ask around Tuxcacuesco and they will point you…"; the valley
  reposado no longer references "this app's blanco profile".
- **Warmth pass (EN + ES).** Highland blanco gains alteño pride; the
  espadín context closes with the Oaxacan family pouring it first for
  a curious visitor.
- The design test asserting the old collapsed-story hierarchy was
  rewritten to pin the new one (story visible and before craft;
  craft not collapsed; guidance after content, not before).

### Checks run

- `npm run validate` — schema plus 223 node:test/jsdom suites, all
  passing.

### Remaining issues / deferred

- Native-device (iPhone/iPad Safari, VoiceOver) checks still
  unverified in this environment; DOM-level hierarchy, disclosure
  behavior and focus semantics are test-covered.

## Post-roadmap pair 6 — Pair-5 Review & Fixes

Maintenance review of the warm-storytelling release (pair 5), per the
mandatory maintenance protocol.

### Findings and fixes

- **Duplicated plant line (defect found):** the identity header kept
  its plant summary while the newly visible craft section also showed
  the plant. The identity duplicate is removed; the plant now appears
  exactly once, in "How it is made".
- **Heading hierarchy (defect found):** "Character in the glass" was
  an h3 among h2 sibling sections — now an h2. The example-bottle card
  carried a redundant internal "Example bottle" h3 duplicating the
  section h2 — removed (the section heading labels the card).
- **Mood line in the character grid (defect found):** pair 5 moved the
  flavor-mood line into the two-column `.profile-core` grid, where it
  would occupy a stray third cell. It now spans both columns.
- **Dead copy key (cleanup):** the "Place, plant & craft" disclosure
  label (EN and ES) had no consumer after the pair-5 reorder; removed.

### Verified, no defect

- Disclosure open-state persistence across language/theme re-renders
  (the collapsed sources disclosure restores correctly).
- Spanish rendering of the new hierarchy: story, craft and character
  all localize; no untranslated-field disclosures on translated
  profiles; guidance note renders in Spanish.
- Search indexing is data-driven, so the story text remains findable
  regardless of DOM order.
- Back-navigation origins, scroll-to-heading on route change, and
  robustness with missing optional fields (no plant → no craft
  section; no bottle → bottles section omitted cleanly).

### Checks run

- `npm run validate` — schema plus 225 node:test/jsdom suites (2 new
  regression tests), all passing.

### Remaining issues / deferred

- Native-device (iPhone/iPad Safari, VoiceOver) checks still
  unverified in this environment.

## Post-roadmap pair 7 — Compact Data-Dense Layouts

Scope per plan: present the warm story-first profile much more densely
on laptop viewports, with the character block docked beside the story
and a quiet persistent search — without changing content, reading
order or the mobile layout.

### What changed

- **Two-column profile at ≥ 64rem.** New `.profile-body-grid` wraps
  the story, why-it-tastes, craft facts and character core. On wide
  viewports it splits into a story column (~1.15fr) and a character
  column (~.85fr), so the full "Character in the glass" block (all
  eight sensory sliders, taste facts, flavor moods) docks to the
  right of the story in the same screen. Below 64rem the grid is a
  plain block and the page stacks exactly as before.
- **Typography density pass.** Editorial prose 1.12rem/1.75 → 1rem/1.6
  (above the 0.95rem reading floor), global h1–h4 display sizes
  reduced (h1 clamp 1.7–2.4rem), the 62ch prose cap lifts inside the
  wide body grid so text fills its column, and section paddings/grid
  gaps tightened throughout the profile view.
- **Compact sensory sliders.** Sensory-row gap 1rem → .75rem and row
  margin .85rem → .55rem; the character column also drops the facts
  card padding at wide widths so all eight dimensions fit beside the
  story.
- **Persistent search on the profile view.** A quiet one-line search
  field (no submit button, `role="search"`, after the identity header)
  reuses the existing search plumbing: submitting captures an Explore
  view-memory snapshot with the query and navigates to `#/explore`,
  where the existing restore path seeds the results — no duplicated
  search logic.
- **Density on other views.** Discovery controls and cards tightened
  (padding 1.5rem → 1.1rem on cards, 1.25rem → .9rem on the control
  panel); learn-card padding and margins compacted; view intros
  slightly wider and tighter.

### Checks run

- `npm run validate` — schema plus 227 node:test/jsdom suites (2 new
  pair-7 tests: body-grid structure + wide/narrow CSS pins, and
  persistent-search render/submit), all passing.
- Manual flow simulated at DOM level: search submit navigates to
  `#/explore` and the captured snapshot restores the query
  (`sessionStorage` view-memory verified).

### Remaining issues / deferred

- Visual confirmation on a real laptop browser is owner-side; this
  environment has no browser engine, so layout checks are
  CSS-pinned. Native mobile (iPhone/iPad Safari, VoiceOver) checks
  still unverified here.

## Post-roadmap pair 8 — Relevance & Reading Review

Scope per plan section 4.2: correct concrete teaching and reading
friction — misleading recommendation links, non-deterministic
suggestion selection, raw shared-dimension reasons, repeated profile
introductions, internal implementation language and duplicated
methodology hedging — before adding any new navigation surface.

### Findings (confirmed defects)

1. The valley blanco profile offered highland extra añejo under "Same
   plant, different region" — changing maturation class and method as
   well as region, despite an existing highland blanco profile.
2. `ifYouLikeThis` returned candidates in data order with no
   tie-breaking, no duplicate exclusion, and accepted candidates whose
   only overlap with the anchor was shared absence or low levels.
3. Suggestion reasons rendered "Shares Perceived sweetness with this
   profile" — raw dimension lists that imply similarity without
   explaining it.
4. The compare perspective claimed "place is the variable here" for
   comparisons where maturation class also changed.
5. On the valley blanco profile, context, description, beginner note
   and why-it-tastes repeated the unaged/agave-led definition four
   times.
6. Visitor-facing data contained implementation language ("per the
   plan", app-eligibility rationales), and four uncovered bottles
   (Don Julio reposado/añejo, Patrón reposado, Casa Dragones joven)
   were introduced with "How it fits the … profile" headings while
   explicitly excluded from those profiles.
7. Methodology hedging appeared in multiple places per view: the
   per-profile `whyNote` boilerplate, the coords note's duplicated
   "approximate" clause, the highland description's trailing
   guidance duplicate, and the map view already carrying its own
   coverage hint.

### Fixes

- **Explore-next relevance (`profile.js`):** the same-plant destination
  now prefers a candidate matching tradition, maturation class and
  documented method, differing only in region — valley blanco now
  links to the highland blanco. All destination categories are
  selected deterministically (stable id order) and de-duplicated;
  self-links are excluded.
- **Deterministic suggestions (`compare.js`):** `ifYouLikeThis` ranks
  by documented overlap with id tie-breaking, requires at least one
  shared medium-or-high level (shared absence/low alone never
  qualifies), and excludes self and duplicate candidates.
- **Useful reason language (`presentation.js`):** "Shares {list}…"
  replaced with "A similar read in the glass: both lean {list}, so if
  one works for you, the other is worth a taste." (ES parity).
- **Honest compare perspective (`compare.js`, `compare-view.js`,
  `locale.js`):** the place-only perspective fires only when class and
  method are held constant; otherwise a new
  `samePlantDifferentRegionAndClass` perspective states that region
  is not the only variable (EN/ES).
- **Distinct reading blocks (`profiles.json`, `content-es.json`):**
  the four valley blanco blocks each carry one purpose — local
  identity (context), accessible definition (description), beginner
  entry point (beginnerNote), causal explanation (whyItTastes) — with
  the unaged definition stated once.
- **Internal language removed:** "per the plan", app-eligibility and
  app-meta phrasing removed from bottles, glossary, processes,
  chapters and profile category data (EN + ES), keeping facts intact.
- **Uncovered-bottle relationship labels (`catalogue-view.js`,
  `presentation.js`):** bottles marked `profile-not-covered` (or
  without a profile mapping) now render "How it relates to the
  guide's coverage (editorial):" instead of the fits-profile heading
  (EN/ES).
- **One qualifier per view:** the per-profile deterministic-hedging
  note and the coords legal-boundary clause were removed; the coords
  note keeps a single "approximate" via the precision value; the
  highland description's trailing guidance duplicate was dropped. The
  extended methodology now lives in the Understanding Flavour Learn
  chapter ("How this guide reaches its conclusions", ES parity), and
  the profile view keeps exactly one short editorial-guidance note.

### Checks run

- `npm run validate` — schema plus 237 node:test/jsdom suites, all
  passing; 9 new pair-8 regression tests (valley→highland blanco
  link, no self/duplicate destinations, deterministic
  shared-absence-excluded suggestions, reason language, uncovered
  relationship labels, controlled-regional perspective, distinct
  reading blocks, no internal language, one-guidance-note).
- Existing tests pinning changed strings updated deliberately
  (comparison-intelligence, es-journeys, regional, richer-profiles).

### Remaining issues / deferred

- Native-device (iPhone/iPad Safari, VoiceOver) checks remain
  unverified in this environment; no layout or navigation changes
  were made in this pair.

## Post-roadmap pair 9 — Your First Agave Spirit

Scope per plan section 4.2: turn "New to agave?" into a manageable
first experience — a concise learning start, five short
individually addressable steps using existing material, a prepared
comparison ending the sequence, and an obvious route into enthusiast
depth without forcing enthusiasts through onboarding.

### What changed

- **New `#/start` route and journey module (`assets/js/journey.js`).**
  The hub states the outcome up front (recognize a few useful flavor
  differences and understand a first comparison — no purchase, no
  glass, no account, no quiz), lists the five steps with direct
  links, and keeps the Learn reference entrance one click away so
  experienced users never traverse onboarding.
- **Five lessons, each with one principal idea, one or two example
  cards with a reason to open them, and clear Next/Previous actions:**
  what these spirits are → how to taste → recognize agave, smoke,
  body and oak → try a comparison → choose what to explore next.
  The steps lesson teaches perceived sweetness versus sugar without
  front-loading legal or botanical exceptions; every lesson reads on
  its own and supports direct skipping via the visible step list
  (active step marked with `aria-current="step"`).
- **Prepared comparison handoff.** The comparison lesson opens the
  explicitly labelled valley blanco vs valley reposado comparison —
  same tradition, region, plant and method, with wood resting as the
  difference — through the existing comparison engine (`#/compare/…?from=start:first-comparison`);
  no sensory data is duplicated. The lesson states these are typical
  styles, not an experiment isolating every variable. An optional
  second exercise compares valley and highland blanco, reusing the
  pair-8 relevance corrections and describing tendencies rather than
  geographic determinism.
- **Selection safety.** A lesson handoff never silently destroys a
  saved comparison: the app stashes the persisted selection when the
  prepared comparison opens and restores it when the reader returns
  to the journey. The compare view carries a "← Back to the lesson"
  link, and profile examples opened from a lesson carry
  "← Back to the lesson" back links.
- **Return paths and recovery.** Stable lesson identifiers and
  routes (`#/start/:lessonId`) work with reload and browser
  Back/Forward; invalid or retired lesson ids render a useful
  recovery page offering the real steps. All existing Learn, glossary
  and profile routes remain untouched.
- **Homepage entrance.** "New to agave?" now labels the beginner
  journey (it previously labeled the Learn action, which became
  "Keep learning"); browsing stays the primary action. Full Mexican
  Spanish parity for every lesson, step label, example reason,
  navigation control and comparison handoff, delivered in the same
  release; lessons reuse canonical profile titles and the existing
  comparison view rather than forking a beginner dataset.

### Checks run

- `npm run validate` — schema plus 249 node:test/jsdom suites, all
  passing; 12 new pair-9 regression tests covering the hub, lesson
  structure, prepared comparison handoff, selection safety, back
  links, invalid-id recovery, route stability, homepage entrance and
  full ES rendering.
- Router behavior verified at the DOM level: lesson deep links,
  compare `?from=start:…` origins, hash navigation and history all
  parse and build correctly.

### Remaining issues / deferred

- Native-device (iPhone/iPad Safari, VoiceOver) checks remain
  unverified in this environment — explicitly the remit of pair 10's
  maintenance review, including focus movement to lesson headings and
  active-step announcements with a real screen reader.
- Lesson progression is deliberately not persisted: steps are freely
  skippable and stateless by design.

## Post-roadmap pair 10 — Beginner Journey Review & Fixes

Scope per plan section 4.2: maintenance review of the pair-9 beginner
journey — full walkthrough in EN and ES, comparison-selection safety,
focus/announcement semantics, cognitive load, invalid ids and route
stability.

### Findings (confirmed defects, all fixed)

1. **The prepared comparison was never explicitly labelled.** The
   handoff link fell back to the step title ("Try a comparison")
   because it read a `comparisonLabel` key from the module's STRINGS
   table, where the key does not exist — the label lives on the step
   object. The link now reads "Open the prepared comparison: valley
   blanco vs valley reposado" (ES parity).
2. **The active step was a link to itself.** The step list rendered
   the current lesson as an anchor to its own route. The active step
   is now a non-interactive position marker (`<strong
   aria-current="step">`), so progress is announced without a
   meaningless self-link.
3. **Example-card back links pointed at invalid lessons.** Profile
   examples carried `origin=start:<profileId>` instead of the lesson
   id, so "← Back to the lesson" landed on the invalid-id recovery
   page. The origin now carries the actual lesson id.
4. **Reference-page stranding.** The how-to-taste lesson's chapter
   example linked to bare `#/learn` with no return path, and the
   router 404'd on `#/learn?from=…`. The router now parses the from
   query on the learn route, the example links with the lesson
   origin, and the Learn view renders "← Back to the lesson" when
   arrived from one — mirroring the profile and compare views.
5. **The selection restore could destroy the reader's own picks.**
   Returning to the journey always restored the stashed pre-lesson
   selection, even when the reader had picked their own styles inside
   the lesson-opened comparison view. The restore now fires only when
   the selection still equals the prepared comparison; the reader's
   own choices always win. The in-lesson disclosure says so plainly.
6. **Lesson-to-lesson moves were treated as same-route.** The app's
   route key ignored `lessonId`, so navigating between lessons skipped
   the new-page scroll-to-heading behavior. Lesson ids are now part
   of the route key.

Verified without defect: EN/ES rendering isolation (no leakage after
a toggle), heading focus and scroll behavior via the existing route
handling, jargon introduced with context in every lesson, one clear
onward action per lesson, invalid lesson ids recovering with the real
step list, and the step-list chips meeting the 44px tap-target rule
(now explicit in CSS). Native iPhone/iPad Safari and VoiceOver checks
remain **unverified** — no browser engine or screen reader is
available in this environment; DOM-level evidence only.

### Checks run

- `npm run validate` — schema plus 258 node:test/jsdom suites, all
  passing; 9 new pair-10 regression tests (explicit labelling, no
  self-links, example-origin integrity, no reference stranding,
  restore-vs-reader-picks, route distinctness, jargon context,
  language isolation, back-link resolution in EN and ES).
- Router re-verified at the DOM level for `#/learn?from=…`, bare
  `#/learn`, section routes and all lesson routes.

### Remaining issues / deferred

- Native-device (iPhone/iPad Safari, VoiceOver) checks still
  unverified in this environment, honestly recorded as such.

## Post-roadmap pair 11 — Clear Discovery Entrances

Scope per plan section 4.2: give browsing and contextual discovery
distinct, understandable jobs, lead the discovery landing with familiar
entrances, and remove uncertainty about where to browse — while
preserving the cross-linked content model and all existing routes.

### What changed

- **Distinct job labels everywhere.** The two main navigation
  destinations are now "Browse styles" (searchable/filterable profile
  browsing, `#/explore`) and "Plants & places" (contextual discovery by
  tradition, flavour, plant and region, `#/discover`) — consistent in
  the top navigation (including the static index.html text), homepage
  actions, back links ("← Back to plants & places") and the beginner
  journey's explore-next card. EN/ES parity throughout; the explore and
  discover routes themselves are untouched and stay compatible.
- **Discovery landing reordered.** Familiar spirit traditions lead,
  approachable flavour paths come second, and plants/places remain
  prominent but secondary — replacing the wall of alphabetical
  taxonomy lists as the first impression. The hub heading now says
  "Understand what is in the glass" instead of the inaccurate "Three
  ways in" (four routes, including flavour, were offered).
- **Common names before scientific names.** Plant chips on the hub,
  plant pages' related-plant chips and region pages' plant chips now
  lead with the documented common name and keep the species in
  parentheses (e.g. "maximiliana (Agave maximiliana)"), preserving
  regional-name ambiguity instead of sorting by Latin binomial.
- **Map/list clearly labelled as browsing by place.** The explore
  view's map disclosure now reads "Browse by place — map & state list"
  (EN/ES); the app-coverage versus legal-boundary distinction in the
  map hint is unchanged.
- **Homepage actions aligned with destinations.** "Browse styles"
  (search and filter every style profile) stays the primary action;
  the beginner entrance, comparison, catalogue and Learn remain
  present.
- **One clear onward action on reference pages.** Plant and tradition
  pages now end with "Browse the style profiles →" after the source
  material, so a reader is never stranded without a next step; their
  existing "← Back to plants & places" returns are unchanged.
- **Fixed a broken deep link.** The spirit page's example-bottle cards
  linked to `#/catalogue?brand=…`, which the router resolves as
  not-found; they now link to the searchable catalogue, which resolves.
- The hub carries a short note that full lists stay searchable in
  Browse styles; known-name search and enthusiast reference access
  remain direct.

### Checks run

- `npm run validate` — schema plus 267 node:test/jsdom suites, all
  passing; 9 new pair-11 regression tests (distinct labels, hub order,
  common-name-first chips, link resolution, place-browsing label,
  homepage alignment, onward actions, contextual returns, EN/ES hub
  rendering). Existing tests pinning the old labels updated
  deliberately (design, discovery suites).
- Every link rendered by the spirit discovery page verified to parse
  to a real route.

### Remaining issues / deferred

- Native-device (iPhone/iPad Safari, VoiceOver) checks remain
  unverified in this environment; DOM-level evidence only. Deep-link
  and history behavior of the renamed labels is pair 12's review
  scope.

## Post-roadmap pair 12 — Discovery Review & Fixes

Scope per plan section 4.2: maintenance review of the pair-11
discovery-entrance changes — both navigation journeys in EN and ES,
bookmarks/legacy routes/invalid ids after the visible-label changes,
common vs scientific name presentation, and keyboard/touch behavior.

### Findings (confirmed defects, all fixed)

1. **Discover detail moves were treated as the same route.** The app's
   route key ignored the discover `kind`/`id` params, so navigating
   between two discovery pages (e.g. a plant page to a region page)
   skipped the new-page scroll-to-heading behavior. The key now
   includes `kind:id`.
2. **Invalid plant and tradition ids rendered "Profile not found".**
   The app reused the profile not-found view for unknown plant and
   tradition routes, mislabeling the missing entity. A new typed
   recovery (`renderDiscoverNotFound`) names the entity kind that was
   not found — "No plant exists with the id …" — for all four
   discovery kinds, EN and ES.
3. **The not-found recovery did not keep its promise.** It said "use a
   discovery path below" but listed none, and offered only a back
   link. The recovery now links to the discovery hub, which lists all
   four paths, and its message no longer references paths it does not
   show. Unknown flavour ids join the same typed recovery instead of
   the older separate message.

Verified without defect: all 34 hub links and every link rendered by
the plant/region/spirit/flavour detail pages parse to a real route and
reference an existing entity; profile back links return to the exact
discovery origin in both languages; no alias merges — the documented
"lechuguilla" ambiguity (maximiliana local usage vs tuxca trade usage)
stays visually distinct via the parenthetical species; sotol keeps its
Dasylirion genus distinction and explicitly-not-an-agave-spirit
disclosure on every discovery surface; chip lists wrap at narrow
widths with 44px tap targets; bookmarks and legacy routes parse
unchanged. Native Safari/VoiceOver and touch-device checks remain
**unverified** in this environment (no browser engine available);
DOM-level evidence only.

### Checks run

- `npm run validate` — schema plus 275 node:test/jsdom suites, all
  passing; 8 new pair-12 regression tests (link/entity resolution,
  back-link origins EN/ES, typed recovery for all four kinds EN/ES,
  no profile-view mislabeling, alias distinctness, sotol non-agave
  status, route distinctness/legacy parsing, wrapped keyboard-
  accessible chips).
- Both journeys re-verified at the DOM level: homepage → browse →
  profile → return, and discovery → plant/region/spirit/flavour →
  profile → return.

### Remaining issues / deferred

- Native-device (iPhone/iPad Safari, VoiceOver) checks still
  unverified, honestly recorded; selected-place and filtered-results
  context on return from the map view re-verified only at the DOM
  level.

## Post-roadmap pair 13 — Browseable Bottle Catalogue

Scope per plan section 4.2: help readers find and assess existing
bottles without scanning a full alphabetical dossier — filters,
compact summaries with optional depth, honest evidence distinctions
and preserved deep-linking, extending the existing catalogue and
search contracts rather than adding a separate bottle database.

### What changed

- **Tradition filter beside the search**, with a clear reset and a
  visible result count ("Showing 18 of 46 bottles"). Search and
  filter combine predictably: the filter narrows the collection, the
  query searches within it; typing a new query clears a brand browse
  so the controls never fight each other. A useful no-results state
  names the query and keeps the reset reachable.
- **Compact summaries replace the full-dossier list.** Each entry now
  shows brand/expression, tradition, documented producer/place, ABV
  (or an explicit "ABV not documented"), and one short attributed
  character note. Coverage disclosures (tasting not documented,
  profile not covered) and composition distinctions — including the
  comiteco cane-sugar disclosure — stay visible in the compact view,
  so density never hides a material fact.
- **Depth behind clearly labelled disclosure.** Production,
  composition, batch and every source group moved into a per-entry
  "Production, composition & sources" disclosure; the existing full
  entry renders inside it unchanged.
- **Evidence voices stay distinguishable.** Reviewer impressions stay
  attributed; producer notes never appear as reviews; factual-only
  entries get "No attributed tasting note for this expression yet"
  instead of an invented summary.
- **Profile links only where the mapping genuinely matches.** Uncovered
  bottles (D'Antaño comiteco, Don Julio reposado/añejo, Patrón
  reposado, Casa Dragones joven) get no style-profile link and are
  described plainly through the coverage relationship; covered
  bottles link their mapped profile.
- **Stable anchors, deep links and state preserved.** Every entry
  keeps its `#bottle-<id>` anchor through filtering. The router now
  accepts `#/catalogue?bottle=<id>`: a deep-linked bottle is revealed
  with its depth disclosure opened, or — when a restored search or
  filter excludes it — clearly explained with a "Show it anyway"
  action. Search and filter state are captured for the return trip
  from a profile (the snapshot now carries the tradition filter, not
  just the query), and focus lands on the entry title.
- **Brand browsing kept, repetition removed.** The brand directory
  (which repeated every expression in a second list) became a compact
  chip index; a chip narrows the main list to that brand exactly.
- **Full Mexican Spanish parity** for every control, status, result
  message, summary label, disclosure and deep-link notice; canonical
  bottle data and the shared search contract are reused, with no
  separate bottle database.

### Checks run

- `npm run validate` — schema plus 284 node:test/jsdom suites, all
  passing; 9 new pair-13 regression tests (filter/count/reset in both
  languages, no-results state, compact-summary honesty, evidence
  voices, mapping-gated profile links, brand index, deep-link reveal
  including the filtered-out case, state capture/restore, full ES
  rendering). Two existing tests updated deliberately to pin the new
  list contracts (alphabetical anchors preserved; search narrows in
  place with stable anchors and reset).
- The catalogue search contract is unchanged (`searchBottles`): a
  brand browse now filters by the brand field exactly, since free-text
  search legitimately matches cross-references (e.g. a producer line
  name inside another bottle's producer field).

### Remaining issues / deferred

- Native-device (iPhone/iPad Safari, VoiceOver) checks of the new
  controls — select/filter announcements, disclosure semantics at
  phone widths — remain unverified in this environment; explicitly
  pair 14's review scope.

## Post-roadmap pair 14 — Catalogue & End-to-End Review

Scope per plan section 4.2: final maintenance review of the sequence —
catalogue identity and accessibility, both audience journeys end to
end, and the compact visual hierarchy.

### Findings (confirmed defects, fixed)

1. **Owner-reported: raw locale key on every spirit discovery page.**
   The "Example bottles in this tradition" cards on `#/discover/spirit/…`
   led each bottle with the literal string "CATALOGUE.ALLBOTTLES" in
   both languages. Root cause: the eyebrow read
   `ui(locale, "catalogue.allBottles")`, but that key lives in the
   locale bundle, not the presentation bundle the `ui()` helper reads
   — the helper fell back to the raw key. The eyebrow now uses a
   proper shared presentation string, "Bottle in the catalogue" /
   "Botella del catálogo" (which is also the semantically correct
   label for a bottle card, unlike the list heading it borrowed).
   A sweep of every rendered surface in both languages — hub,
   catalogue, all spirit/plant/region/flavour details, profiles,
   Learn, journey hub and lessons, compare, home — found no other
   raw-key leaks of this class.

Verified without defect: combined search/filter/reset with stable
anchors in both languages; unknown fields stated honestly in the
compact view ("Tasting notes not yet documented"); depth disclosures
closed by default with sources reachable inside, surviving locale
toggles via the existing open-state restore; every expression/profile
link audited against tradition and coverage — zero mismatches, no
fabricated sensory levels on factual-only entries; attribution,
composition distinctions and producer identity preserved in every
compact summary; result counts announced via `role="status"`, the
filter has an accessible name, summaries are focusable with visible
focus, reduced-motion respected. Both acceptance scenarios pass at
the DOM level: **beginner** (homepage → lesson → prepared comparison
→ profile → lesson, no dead ends) and **enthusiast** (known-name
search → bottle/profile → technical reference → contextual return
with search state intact).

### Checks run

- `npm run validate` — schema plus 292 node:test/jsdom suites, all
  passing; 8 new pair-14 regression tests including a sweep that
  renders every spirit/plant/region/flavour page in both languages
  and asserts no raw locale keys leak on any surface.
- Native iPhone/iPad Safari and VoiceOver checks remain **unverified**
  in this environment (no browser engine or screen reader available);
  this review's evidence is DOM-level, recorded honestly per the plan's
  rules. The deployed Pages URL serves the corrected bottle labels.

### Sequence complete

Post-roadmap pairs 8–14 are applied. Per the plan, further content
expansion is reassessed only after these usability releases are
reviewed by the owner on the deployed site.

### Pair-14 follow-up correction (2026-10-23, pair 15)

The pair-14 raw-key and zero-mismatch conclusions were too broad. The
sweep's regex (`/[a-z]+\.[A-Z][a-zA-Z]+/`) missed lowercase-first keys
such as `learn.heading` and bare keys such as `noReviewYet`, and its
element selection skipped lesson card titles: at `#/start/how-to-taste`
the chapter example card rendered the generic "Learn" label via
`learn.heading`, and at `#/catalogue` the Balam entry showed the raw
`noReviewYet` key because `ui()` reads a second COPY bundle that never
contained it (it existed only in locale.js STRINGS). Both are fixed in
pair 15, which also found that `ilegal-mezcal-anejo` (a 14-month
añejo) was mapped onto the mezcal reposado profile and
`hacienda-de-chihuahua-sotol-anejo` (2 years in oak) onto the unaged
sotol profile — the pair-14 "every expression/profile link audited
— zero mismatches" claim is corrected accordingly. The historical
pair-14 notes above are preserved; the pair-15 regression suite now
validates ui() keys at their source against both string bundles.

## Post-roadmap pair 15 — Corrective UX, Mapping & Localization Review (2026-10-23)

Maintenance release applying the plan's section 4.3 tasks 15.1–15.6 and the
section 4.4 pair-15 content corrections (P15-C1…C9). Automated checks:
`npm run validate` passes (18 profiles, 46 bottles, 92 sources) and the full
node:test suite passes including 7 new pair-15 regressions. Desktop DOM
evidence only: native iPhone/iPad Safari, VoiceOver and physical-touch
checks remain unverified, and no native-device claim is made. Deployed
re-verification is pending (this record was written before deployment).

### Claim ledger (changed claims, EN and ES surfaces)

| Claim | Disposition | Where |
| --- | --- | --- |
| Comiteco: "not a spirit with a denomination of origin, DO request pending" | Corrected — IG "Comiteco de Comitán, Chiapas" protected 6 Oct 2025; cane sugars and Agave americana L. named by the declaration; A. atrovirens kept as attributed alternative | profiles, traditions, plants, regions, chapters (EN+ES) [S: DOF/SIDOF 5769331] |
| "Comitán de Domínguez" in the English aguamiel profile | Corrected — English profile says Comitán; Spanish keeps the official municipality name | profiles (EN) |
| Mezcal classes: "joven / abocado" conflation | Corrected — six NOM-070 classes listed (blanco o joven, madurado en vidrio, reposado, añejo, abocado con, destilado con); pechuga placed as destilado con | glossary, traditions, chapters, mezcal reposado profile (EN+ES) [S: NOM-070-SCFI-2016 4.5] |
| Copper/artisanal vs clay/ancestral binary | Corrected — artisanal permits copper or clay per NOM-070 4.4.2 | traditions, tobalá profile (EN+ES) |
| "Mezcal reposado minimum differs from tequila's" | Corrected — both start at two months; other requirements differ; wood not narrowed to oak | glossary, mezcal reposado profile, chapters (EN+ES) |
| "All mezcal pit-roasted/smoky" implication | Qualified — category-level process allows other cooking methods | mezcal espadín profile, traditions (EN+ES) |
| Tequila class list missing joven/oro; composition categories | Corrected — joven/oro included; 100% de agave vs tequila categories explained as composition facts, not quality grades | traditions (EN+ES) [S: NOM-006/CRT] |
| Blanco = "unaged" flat definition | Qualified — typically unaged; brief permitted maturation below the reposado window exists | tequila blanco profiles (EN+ES) |
| "Middle of the legal range" (18-month añejo); "longer side of the legal range" (4–5-year extra añejo) | Corrected — only minima exist; range language removed | añejo and extra añejo profiles (EN+ES) |
| "Only highland agave can carry that much oak" | Corrected — recorded as a local view/tendency; valley distilleries also age extra añejo | extra añejo profile (EN+ES) |
| Highland beginner note "none of the valley's savory edge" | Qualified — overlaps and bottle variation acknowledged | highland blanco profile (EN+ES) |
| Bacanora "legalized and protected as DO in 2000" | Corrected — prohibition 1915–1992, legalization 1992, DO 2000 (separate events) | traditions, bacanora profile (EN+ES) [S: bacanora.sonora.gob.mx] |
| NOM glossary collapsed standard vs registration | Corrected — NOM is a standard; label number is the producer registration; distinct from certification seals | glossary (EN+ES) |
| "Tuxca bottles carry no NOM / no seal — pride is the certificate" | Corrected — absence is DO-scheme certification, not exemption from labeling requirements | chapters, tuxca beginnerNote, regions (EN+ES) |
| Sierra raicilla "tabernas" as stills | Corrected — a taberna is a distillery | raicilla profile (EN+ES) |
| Raicilla reposado "minimum 2 months per DO source" | Qualified — rests on the 2019 declaration and published standard project; the 3-month example rest is a bottle fact, not a legal minimum | raicilla reposado profile (EN+ES) |
| "Sotol was illegal in Mexico before 1994" | Corrected — replaced with era-specific wording; no single nationwide ban asserted | sotol profile (EN+ES) |
| Sotol "roots left intact → regrows — sustainable by design" | Corrected — regrowth not guaranteed; harvest pressure documented; no regeneration claim | sotol profile, plants, traditions (EN+ES) |
| Tobalá "12–15 years", sotol "8–12 years / one bottle" fixed figures | Qualified — variable, source-dependent ranges | plants, profiles (EN+ES) |
| Sap harvest described indefinitely sustainable / scraping vagueness | Corrected — quiote cut, cavity scraped, repeated collection exhausts the plant | processes (EN+ES) |
| Leek/onion cross-genus analogy | Corrected — cousins framing that does not fail on genera | chapters (EN+ES) |
| "Wild harvest causes bacanora herbality", "double distillation keeps it clean", valley/highland determinism | Qualified — tendencies and variables, not causes/guarantees | bacanora, valley blanco, extra añejo whyItTastes (EN+ES) |
| Extra añejo marker described as the town of Tequila | Corrected — Los Altos near Arandas with producer context | extra añejo placeCoords |
| Tobalá mixed "Sierra Norte / Santiago Matatlán" location | Corrected — wild style ranges the Sierra; example bottle cultivated in Santiago Matatlán | tobalá placeCoords |
| "raspanado la quiota", "viñata", "hazlo solo", "cócteles no son un compromiso", English glosses in Spanish, el/la bacanora gender | Corrected — quiote/cavity description, "vinata", "sin hielo ni mezcladores", cocktail wording, glosses removed, standardized to "el bacanora" | content-es, journey, glossary |
| Bacanora live plant field untranslated; regions without ES; block2deeper drift; producer/place fragments | Corrected — plant field via fieldEs, full regions group added, block mapping realigned, named producer/place fragments translated | profile.js, discovery-view.js, plant-tradition-view.js, content-es |
| ilegal-mezcal-anejo → mezcal reposado profile; hacienda-de-chihuahua-sotol-anejo → unaged sotol profile | Corrected — both unmapped as profile-not-covered with editorial notes; maturation facts kept | bottles (EN+ES) |
| `learn.heading` card label; raw `noReviewYet`; `abvUnknown` missing from ui() COPY | Corrected — chapter title lookup, keys added to presentation COPY, source-validated key regression added | presentation.js, journey.js, pair-15 tests |
| Catalogue brand filter lost on profile return | Corrected — brandFilter in snapshot/restore with visible active-brand label and clear action | catalogue-view.js, locale.js |
| discovery-chip-list / .discover-chip-list mismatch | Corrected — standardized on discovery-chip-list for discovery and brand index | styles.css, catalogue-view.js |

Sources for the corrections: DOF/SIDOF Comiteco IG declaration (6 Oct 2025);
NOM-070-SCFI-2016 sections 4.2/4.4/4.5; NOM-006-SCFI-2012/CRT; Sonoran
official bacanora history (full-page retrieval returned 403 during the audit
— the 1915/1992 timeline is recorded from search-result confirmation and
the corroborating regional study; retrieve the full passage before relying
on it as final evidence); raicilla DO declaration and published standard
project (a PROY-NOM, not a final effective NOM). No claim was kept merely
because its linked source is reachable; conflicts remain visible in the data.

### Pair-15 claim ledger correction (appended 2026-10-23, pair 18 / P18-3)

The pair-15 corrections table above recorded "example bottle cultivated in
Santiago Matatlán" for the tobalá profile. That claim is wrong: the
producer's own expression page (montelobos.com/our-mezcals/montelobos-tobala)
identifies the Montelobos tobalá as produced at Palenque del Tentzo, San
Nicolás Huajuapan, Puebla — not Santiago Matatlán, Oaxaca. The historical
table row is preserved above; the corrected facts shipped in pair 18 are:

- Montelobos tobalá now carries its expression-specific Puebla origin and is
  unmapped from the wild-Sierra tobalá profile (profile-not-covered with a
  contextual editorial note), because a cultivated Puebla bottle is not
  representative of a wild Oaxaca Sierra style.
- The tobalá profile's example bottle is now Macurichos Ancestral Tobalá —
  wild-harvested agave (San Baltazar Guelavila and Matatlán per the cited
  Mezcalistas tasting), produced in Santiago Matatlán with ancestral
  clay-pot distillation, matching the profile's wild-Sierra context.
- Del Maguey pechuga now carries its Santa Catarina Minas origin (per
  delmaguey.com/pechuga) and is unmapped from the plain joven espadín
  profile: a destilado-con festival-production style is contextual, not
  representative of that profile.

## Post-roadmap pair 16 — Practical First Tasting (2026-10-23)

Feature/UX release applying the plan's pair-16 tasks 1–7 and the section 4.4
pair-16 additions (P16-C1…C5, P16-V1…V4, P16-B1…B6, P16-L1…L2). Automated
checks: `npm run validate` passes (18 profiles, 46 bottles, 92 sources) and
the full node:test suite passes — 312 tests including 13 new pair-16
regressions in `test/pair-16-review.test.mjs`. Desktop DOM evidence only:
native Safari, VoiceOver and physical-touch checks remain pair-17 work, and
no native-device claim is made here.

### Practical first tasting (P16-C1, C2; tasks 1, 2, 6)

- "How to taste" now teaches a four-step practical sequence in the main
  reading flow (never collapsed): prepare (a small clean glass, modest pour,
  water alongside), smell gently (no plunging, no vigorous swirl), sip and
  notice the texture (alcohol warmth vs flavor; body as mouthfeel), follow
  the finish. Spitting is offered; nothing requires swallowing, finishing a
  glass, buying or drinking.
- The flavour-landmark lesson now distinguishes aroma, taste and texture,
  states that not every agave spirit is smoky, and that vanilla/caramel
  alone do not prove oak contact.
- The repeated "no purchase/no glass/no account/no quiz" list is gone; one
  plain statement ("a glass is never required") remains. The Choosing and
  Enjoying chapter's technique paragraph now agrees with the lesson (the
  old "swirl" instruction is corrected) and links to it.
- Per-tradition serving guidance: the staged "Sonoran-style with lime and
  sal de chapulín" custom, comiteco's "small-occasion spirit," the
  categorical "tobalá's florals fade in cocktails" and the "Margarita
  upgrade" hierarchy are replaced with conditional, reason-giving editorial
  suggestions; unfamiliar terms (copita) are explained in plain language.
  Salt, citrus, ice and accompaniments are framed as choices, not
  admission requirements (P16-C4).

### Chapter addressing and lesson-opened comparison (tasks 3, 4, 5)

- Stable chapter deep links: `#/learn/chapter-<id>` (with `?from=` lesson
  origin preserved); existing `#/learn/{terms,plants,processes}` routes
  unchanged. The flavour-chapter example card now targets the exact
  chapter instead of the bare Learn page.
- A lesson-opened prepared comparison now renders its explanation and
  results before the full profile picker; changing styles stays available
  through a labelled secondary control ("Change the styles in this
  comparison", EN/ES). The general-purpose comparison view is unchanged.
  Comparison-selection safety, lesson return links and history behavior
  are preserved (pinned by regressions).

### Voice and translation (P16-V1–V4)

- Staged local speech and invented quotations removed across all 18
  profiles: "watch their chest," "ask anyone," "they will tell you,"
  "nobody calls that a flaw," "salt in its soul," "birthright of their
  hills," the bacanora ES "mira su pecho hincharse" and the espadín ES
  "le llaman casa." Rewrites keep warm editorial narration grounded in
  documented place, family-continuity and vinata/vinatero vocabulary
  without posing as a local speaker.
- Spanish recomposed for Mexican readers rather than translated metaphors
  ("generaciones de las mismas manos" → craft passed between generations;
  "el humo se abre" → natural serving language; "ocasiones pequeñas"
  removed with its staged claim). The sotol ES context also drops the
  pre-1994 nationwide-ban claim the English was already corrected for.
- Regional reader validation remains explicitly pending (P16-V4): no
  Mexican Spanish editor or regional reader review has occurred; shipped
  Spanish is restrained and source-grounded, and the authenticity goal is
  not claimed as proven.

### Bottle-first descriptions (P16-B1–B6)

- All 42 reviewed bottle summaries (EN+ES) rewritten to open with the
  expression's character rather than the reviewer's identity. Attribution
  moves to a compact basis line under the description ("Tasting summary
  based on N review/producer source(s) — details under Sources", EN/ES),
  derived from the existing source data; producer-only evidence stays
  labelled, the Ocho producer-note gap stays stated up front, and the
  single unreviewed bottle (Balam) keeps its honest no-note disclosure.
- Sensory statements were checked against their existing sources; no new
  texture, consensus or production claims were added. Illustrative
  before/after shapes follow the plan's example structure.

### Label walkthrough (P16-C5)

- A new Understanding Labels block walks through an explicitly invented
  illustrative label: spirit name, class, agave/composition, % Alc. Vol.,
  producer/origin (NOM), lot — and what those fields cannot tell you
  about taste. Spanish parity included; ES chapter block keys renumbered.

### Flags (P16-L1, L2)

- The EN/ES toggle is now two clearly identified editions: UK Union Flag +
  "English" / Mexican flag + "Español (México)", with language-name
  accessible labels (flag decorative, text fallback if the flag fails to
  render), `document.documentElement.lang` set to `es-MX` for the Mexican
  Spanish edition, saved preference, page state and focus behavior
  preserved on switch. The UK flag represents the chosen edition only; no
  reviewed British English localisation is implied.

### Known limitations / next

- Native Safari/VoiceOver/touch and live deployed verification remain
  pair-17 work (mandatory maintenance follow-up).

## Post-roadmap pair 17 — Learning & Navigation Verification (2026-10-23)

Maintenance review of the pair-16 release, executed as real-journey walks:
the review boots the actual app (app.js, router, data loading) in jsdom and
navigates by changing window.location.hash — homepage → all five lessons →
the prepared comparison → back; lesson → the exact flavour chapter → back;
deep links, reload-equivalent boots, browser Back/Forward, language
switching mid-view, saved and user-edited comparison selections, the
catalogue brand round trip and the honest-mapping framing — in both EN and
ES. Automated checks: `npm run validate` passes (18 profiles, 46 bottles,
92 sources); the full suite passes — 326 tests, including the 14 new
pair-17 verification tests in `test/pair-17-verification.test.mjs`.

### Confirmed defects found and fixed

1. **Saved comparison selections were silently lost after a lesson
   comparison (high).** `assets/js/app.js` set
   `state.lessonPreparedSelection` when a lesson handed off to the
   comparison, but the restore path read the never-set
   `state.lessonPreparedComparison`, so the "reader's own saved selection
   is restored on return" guarantee never fired: opening a prepared
   comparison permanently replaced a saved selection even when the reader
   never touched the picker. Fixed to read the field that is written;
   pinned by "a saved comparison selection survives a prepared comparison
   and returns" (and the companion user-edit-wins test).
2. **The catalogue brand filter was lost when leaving for a profile
   (medium; a regression of the pair-15 fix at the second capture path).**
   The pair-15 snapshot/restore added `brandFilter` to the catalogue
   restore, but the profile-departure capture in `rememberListViews`
   captured only `query` and `traditionId` — so a brand-filtered catalogue
   returned from a profile with its filter silently dropped. Fixed to
   include the brand filter from the view's own snapshot API; pinned by
   "catalogue brand filter survives a profile round trip".

### Verified without defect

- All five lessons render in EN and ES via real hash navigation, each with
  a working back link to the hub; the active step is announced
  (`aria-current="step"`) and the other steps remain keyboard-reachable
  hash links, in both languages.
- Lesson → prepared comparison → back to the lesson: the pair-16 teaching
  order holds (explanation before the picker, secondary control collapsed),
  and the back-to-lesson link is present in both languages.
- Lesson → chapter deep link: the card carries the chapter's localized
  title (never a generic Learn label), `#/learn/chapter-<id>` renders on a
  direct boot, the lesson-origin back link survives a mid-view language
  switch, and browser Back/Forward traverses lesson ↔ chapter ↔
  comparison cleanly with no render errors.
- One-selection (partial) comparison states render the honest one-more-pick
  message with the picker directly reachable.
- The language control names its editions ("Español (México)" / "English"),
  exposes the current choice in its accessible label, persists it, sets
  `es-MX` on the document, and keeps state and scroll behavior on switch.
- The pair-16 basis line renders on profile example bottles in both
  languages.
- Pair-15 missing-string sweep re-run across ten routes in both languages:
  no raw lookup keys leak.
- Honest-mapping recheck: the uncovered mezcal añejo keeps its plain
  relates-to framing and receives no style-profile link.

### Environments actually tested, and honest limitations

- **Tested:** jsdom (DOM structure, routes, focus attributes, aria state,
  persisted storage) with the real module code and real hash navigation;
  automated layout-token checks from the existing design suite.
- **Not tested and not claimed:** live browser rendering on the deployed
  Pages build (the pair-16 deployment has not been re-verified in a real
  browser; the brand-filter defect above was found and fixed against the
  local build), native iPhone/iPad Safari, VoiceOver, physical touch, text
  enlargement and reduced-motion behavior on real devices. These remain
  open items for the next owner-requested review; per the protocol, no
  native-device check is recorded as passed.

### Rollback reference

Both fixes are in `assets/js/app.js` and are covered by the new
pair-17 tests; reverting the pair-17 commit restores the prior (defective)
behavior and the tests would fail again.

## Post-roadmap pair 18 — Corrective Completion & Editorial Consistency (2026-10-23)

Maintenance release applying section 4.5's P18-1 through P18-6. Automated
checks: `npm run validate` passes (18 profiles, 46 bottles, 92 sources) and
the full node:test suite passes — 374 tests, including 40 new pair-18
regressions across five files (`pair-18-es-renderers`, `pair-18-tasting-basis`,
`pair-18-bottle-origins`, `pair-18-teaching-surfaces`, `pair-18-warm-prose`,
`pair-18-contracts`).

### Implemented and verified (jsdom)

- **P18-1:** `region: "regions"` added to the editorial bucket map so
  `fieldEs("region", …)` consumes the shipped `content-es.json` regions;
  tradition pages and spirit discovery consume ES for every authored field;
  discovery/comparison/catalogue surfaces localize taste notes, plant
  context, remove-control names and producer/place prose. Rendered-output
  audit of all 11 regions and 8 traditions in ES.
- **P18-2:** explicit `tastingSourceIds` contract naming only the sources
  behind each sensory summary; shared `tasting-basis.js` renderer for
  catalogue and profile; Fortaleza/La Venenosa/Ocho/Don Julio inflations
  fixed; factual-only records (Indio Alonso, Balam, comiteco factual
  entries) get a distinct facts-only line; natural EN/ES grammar replaces
  the "fuente(s)" forms.
- **P18-3:** Montelobos tobalá carries its Puebla origin (Palenque del
  Tentzo, San Nicolás Huajuapan) and is unmapped from the wild-Sierra
  profile; Del Maguey pechuga carries Santa Catarina Minas and is unmapped
  from the plain joven espadín profile; the tobalá profile now exemplifies
  the wild-harvested Macurichos Ancestral Tobalá (verified against the
  cited Mezcalistas page); dated pair-15 ledger correction appended above.
- **P18-4:** ES tobalá clay/copper equivalence, valley blanco absolute
  no-oak claim, the "redirects sugars" mechanism and the NOM
  standard/registration/certification conflation corrected (EN and ES);
  first-serve guidance completed for all 18 profiles (notice lines), "neat"
  defined at first use, finish explained as character as well as duration.
- **P18-5:** vague acclaim replaced with cited sensory detail (Clande
  Yellow, Fortaleza Blanco); invented sotolero testimony removed (EN/ES)
  with warmth rebuilt from documented history; ES defects corrected
  (cucción, del bacanora ×4, se leen sabrosos, bacanora gender); routine
  model/evidence explanations moved out of the catalogue/compare intros.
- **P18-6:** the language toggle now announces the current edition
  accessibly (aria-label + tooltip), closing the P16-L2 gap the pair-17
  test missed; the pair-17 assertion strengthened accordingly; semantic
  regressions added for P18-1 through P18-5 instead of text-presence
  checks; pair-17 saved-comparison and catalogue-brand round-trip tests
  preserved and passing.

### Reopened and resolved in this release

- The pair-15 claim-ledger row "example bottle cultivated in Santiago
  Matatlán" (wrong per the producer's expression page) — corrected with a
  dated ledger entry; history preserved.
- The pair-16 basis-line wording ("fuente(s)") — replaced by the shared
  renderer with real singular/plural grammar; the two tests pinning the
  old wording were updated to the new contract.

### Still unverified — no claim made

- Live deployed-Pages behavior in a real browser (all pair-18 verification
  is jsdom against the real modules and data); native iPhone/iPad Safari,
  VoiceOver, physical touch, text enlargement and reduced motion remain
  unverified. A passing suite is not evidence of factual accuracy, natural
  Spanish or native-device behavior.
- Regional-reader validation of the Spanish prose is pending; no
  native-editor review or approval is claimed.

### Scope reconciliation

Sotol remains one of the eight covered traditions, explicitly labeled as a
non-agave Dasylirion tradition. This does not authorize expansion into
unrelated non-agave spirits (charanda, pox and cane-only aguardientes stay
out of catalogue, profiles and comparison). The current execution pointer
now moves to post-roadmap pair 19 — Beyond Oaxaca I — when the owner
requests it.

## Post-roadmap pair 19 — Beyond Oaxaca I (2026-10-23)

Feature/content release applying section 4.5's pair-19 scope: three bounded
profiles for Guerrero, Durango and San Luis Potosí, each with one
expression-matched example bottle. Automated checks: `npm run validate`
passes (21 profiles, 49 bottles, 103 sources) and the full node:test suite
passes — 383 tests, including 9 new pair-19 regressions in
`test/pair-19-beyond-oaxaca.test.mjs`.

### What shipped

- **Guerrero — mezcal-papalote-montana-guerrero:** cupreata/papalote
  context (the kite-named agave of the Guerrero mountains, its name's need
  for geographic context), example bottle Legendario Domingo Cupreata
  (Alcaraz family, Apango) with its Mezcal Reviews tasting evidence.
- **Durango — mezcal-cenizo-sierra-durango:** cenizo/Agave durangensis
  context through a specific maker (Federico Cruz and his Tepehuán family,
  El Mezquital; vinata as the Durango word), example bottle Lamata Cenizo
  with its Mezcal Reviews tasting evidence.
- **San Luis Potosí — mezcal-verde-altiplano-slp:** salmiana/maguey verde
  context (the plateau's cooked-piña tradition, distinguished from the
  pulque sap harvest of the same species), example bottle Mezcal de
  Leyendas (maestro Juan José Hernández, Santa Isabel hacienda) with its
  Mezcal Reviews tasting evidence.
- Two new plants (agave-cupreata with its papalote/papalometl naming
  uncertainty, agave-durangensis), the salmiana plant extended to the
  mezcal tradition, three new regions with "app coverage, not a legal
  boundary" distinctions, 11 new sources, and complete EN/ES mirrors of
  every authored field (verified rendering with zero untranslated-field
  disclosures).
- Search now indexes profile aliases, so papalote, papalometl, cenizo,
  durangensis, maguey verde and mezcal potosino all find their profiles.

### Honest evidence notes

- The Leyendas SLP cooking method is disputed between the producer's
  clay-oven description and a local reviewer's autoclave report; the
  disagreement is recorded in the profile context, the bottle record and
  the ES mirror — not settled. The smoke claim stays anchored to the
  cited reviews, not to either oven claim.
- The Leyendas reviews range from praise to harsh; the profile presents
  that range as the genuine state of the evidence.
- Sensory text for all three bottles was written only after fetching and
  verifying the exact expression's review page.

### Still unverified — no claim made

- Live deployed-Pages rendering, native iPhone/iPad Safari, VoiceOver,
  physical touch, and regional-reader validation of the new Spanish prose
  (Guerrero, Durango and SLP voices) remain unverified. jsdom evidence
  only.

## Post-roadmap pair 20 — Regional Expansion I Review (2026-10-23)

Maintenance review of the pair-19 regional additions (Guerrero, Durango,
San Luis Potosí) per plan section 4.5.

### Defect found and fixed

- **Search alias hijack (defect found):** the pre-existing alias
  `["papalote", "rhodacantha"]` (coastal-Jalisco raicilla vocabulary)
  rewrote every "papalote" query, so the Guerrero cupreata profile was
  invisible to its own regional plant name — only the two raicilla
  profiles came back. `searchProfiles` now matches the raw normalized
  query alongside the aliased one, so "papalote" finds both the
  Guerrero profile and the raicilla profiles, while every other alias
  (plata/silver → blanco, etc.) keeps working exactly as before. The
  pair-19 test had asserted only `hits.length > 0`, which is why this
  slipped through.

### Verified

- Profile/bottle fit, maker-versus-brand identity, region/plant/source
  reference resolution and the P18-2 tasting-evidence contract hold for
  all three additions; no identity or producer source is counted as
  tasting evidence.
- Accented and unaccented EN/ES queries (papalometl, cenizo,
  durangensis, maguey verde, mezcal potosino, San Luis Potosí/San Luis
  Potosi, Apango, El Mezquital, Santa Isabel) find their profiles.
- Comparison explanations vs the espadín reference derive from
  documented sensory differences (no missing dimensions), never from
  presumed geography.
- Beginner journey (profile → serving advice → example bottle → next
  step) and enthusiast journey (bottle → place/source detail → profile
  return) render in EN and ES with zero untranslated-field disclosures;
  unknown region ids render honest not-found surfaces.

### Validation

- `npm run validate`: schema, cross-references and the full `node:test`
  suite — 391 passing (383 before + 8 new pair-20 regressions in
  `test/pair-20-regional-review.test.mjs`: alias-hijack regression,
  accented/unaccented findability without total-count pinning,
  fit/identity/sourcing contracts, comparison grounding, both reader
  journeys, unknown-data handling).

### Still unverified — no claim made

- Live deployed-Pages rendering, native iPhone/iPad Safari, VoiceOver,
  physical touch and regional-reader validation of the new Spanish prose
  remain open, as recorded for pair 19.

## Post-roadmap pair 21 — Beyond Oaxaca II (2026-10-24)

Michoacán and Puebla coverage plus Colima/Nayarit contextual
refinements, per plan section 4.5.

### Added

- **Michoacán — mezcal-cupreata-rio-de-parras-michoacan:** cupreata
  named penca ancha in Rio de Parras, made by maestra mezcalera María
  E. Pérez and her family; the pulque-started fermentation is taught as
  Michoacán's own practice without flattening the state into one
  style. Example: Pal'alma Michoacán Cupreata, its Mezcal Reviews page
  fetched and verified before any sensory text was written (pink
  bubblegum, strawberries and cream, lactic funk — presented as
  reviewer findings, never a state-wide rule).
- **Puebla — mezcal-papalometl-mixteca-puebla:** papalometl documented
  as Agave potatorum for the example's case (the species Oaxaca calls
  tobalá), made by maestra mezcalera Fabiola Torres Monfil in San
  Diego La Mesa Tochimilitzingo with her seed-grown nursery and bat
  programs. Example: Zinacantan Papalometl (apple pie, banana taffy,
  mango and bright sparkling-wine acidity per its fetched reviews).
  The corrected Montelobos record stays honestly unmapped — it is a
  tobalá expression, not a papalometl, and was not duplicated to
  satisfy the count.
- Two new regions (Rio de Parras; Mixteca Poblana), both plants
  extended with the new regional names and profiles (cupreata gains
  penca ancha; potatorum gains papalometl with its state-attached
  naming caveat), six new sources, and complete EN/ES mirrors of
  every authored field — validated with zero untranslated-field
  disclosures.

### Colima and Nayarit contextual refinements

- **Colima:** the tuxca profile context and the borderlands region
  record now state Colima's documented role explicitly — the
  borderlands tradition, the volcano's slopes and the Río Almería
  valley reach across the state line — while recording that the cited
  Jalisco-made example does not by itself establish Colima production
  coverage. EN and ES.
- **Nayarit:** the Sierra and Costa raicilla contexts now scope the
  DO claim precisely — exactly one Nayarit municipality, Bahía de
  Banderas on the Jalisco border, a precise strip and not all
  Nayarit. No Nayarit profile or map coverage was created (no matching
  documented profile exists yet). EN and ES; pinned by regression.

### Honest evidence notes

- Every sensory sentence traces to the fetched expression-matched
  review page; producer/identity sources are never counted as
  tasting evidence (the P18-2 contract, verified by test).
- The Zinacantan record keeps lot variation honest: single distillation
  in copper vs clay, and a rawhide-fermented batch, are flagged as
  check-your-bottle facts, not settled ones.

### Validation

- `npm run validate`: schema, cross-references and the full `node:test`
  suite — 401 passing (391 prior + 10 new pair-21 regressions in
  `test/pair-21-beyond-oaxaca-2.test.mjs`; count pins in the pair-19,
  model and catalogue tests updated to the planned expansion: 23
  profiles, 51 bottles).

### Still unverified — no claim made

- Live deployed-Pages rendering, native iPhone/iPad Safari, VoiceOver,
  physical touch and regional-reader validation of the new Spanish
  prose (Michoacán and Puebla voices) remain unverified. jsdom
  evidence only.

## Post-roadmap pair 22 — Regional Expansion II Review (2026-10-24)

Maintenance review of the pair-21 additions (Michoacán, Puebla) and the
Colima/Nayarit contextual refinements, per plan section 4.5. All planned
post-roadmap pairs (18–22) are now applied.

### Defect found and fixed

- **Formula repetition across the regional introductions (defect
  found):** read together, three of the five new regional descriptions
  (Durango, San Luis Potosí, Michoacán) opened with the same
  construction — "…in a way espadín rarely does" / "…que el espadín
  rara vez logra" — dulling the teaching voice the pair-19/21 gates
  ask for. The three descriptions (EN and ES) were rewritten to lead
  with each region's own concrete difference (Durango's
  fruit-where-others-lean-smoky, the plateau's green-first welcome,
  Michoacán's pulque-tinged house character). The tendency-qualifying
  language is preserved, and a new regression caps the formula at one
  occurrence across all five introductions in both languages.

### Verified

- **Reader journeys:** Michoacán and Puebla profiles render end to
  end in EN and ES with serving advice, notice lines, example bottles
  and onward steps — zero untranslated-field disclosures; accented
  and unaccented searches still find both.
- **Colima/Nayarit honesty:** Colima stays documented borderlands
  context (the Jalisco-made example does not establish production
  coverage — stated in the profile, the region record and both
  languages); Nayarit stays exactly Bahía de Banderas, a strip, not
  all Nayarit. No Colima or Nayarit state profile exists — pinned by
  regression.
- **Puebla bottle geography:** the corrected Montelobos record (San
  Nicolás Huajuapan / Palenque del Tentzo, Puebla; honestly unmapped)
  is consistent across the bottle record, its ES mirror, the
  wild-Oaxaca tobalá profile (which keeps its own Santiago Matatlán
  example), the catalogue and the plants file; no Oaxaca region
  claims the Puebla palenque.
- **No regressions:** all seven established traditions (tequila,
  bacanora, raicilla, tuxca, comiteco, destilado de pulque, sotol)
  re-pinned by id, tradition, example bottle and reference integrity;
  every profile's example bottle resolves and maps back.

### Validation

- `npm run validate`: schema, cross-references and the full `node:test`
  suite — 407 passing (401 prior + 6 new pair-22 regressions in
  `test/pair-22-regional-review-2.test.mjs`).
- Deployment: the existing GitHub Pages workflow; CI green on `main`.

### Still unverified — no claim made

- Native iPhone/iPad Safari, VoiceOver, physical touch and
  regional-reader validation of the Spanish prose (including the
  rewritten introductions) remain open, as in every prior pair.
- Colima and Nayarit still have no documented profile-level coverage;
  adding either remains future owner-directed work, not a gap in this
  review.

## Post-roadmap pair 23 — Corrective editorial maintenance (2026-10-24)

One bounded maintenance release over the five regional profiles added in
pairs 19–21 (Guerrero, Durango, San Luis Potosí, Michoacán, Puebla). No new
regions, profiles or bottles; every existing route, journey and example
bottle is preserved.

### Changed claims, with sources

- **Bottle-scale evidence.** The five descriptions now state up front that
  the profile is grounded in one bottle — the example expression — and
  attribute each tasting note to that bottle's reviewers. Removed the
  state-scale overreaches: "Durango's welcome is sweeter and often hotter
  than Oaxaca's" (replaced with the example bottle's documented 49–54%
  lots and the reviewers' own heat notes — Mezcal Reviews, Lamata Cenizo
  page), "unmistakably Michoacán" (the creamy, pulque-tinged welcome is now
  this Rio de Parras producer's, per the Pal'alma reviews), and the
  "little smoke" claim about the plateau that relied on smoke "that defines
  Oaxacan mezcal" (the SLP passage now reads green-first without
  generalizing Oaxaca). Durango's state-level framing keeps only what
  SevenFifty Daily documents: producers' own "sweet green flavors, fruity
  and earthy with lactic notes" tendency and cenizo's seed-based genetic
  diversity.
- **Causal honesty.** Every regional whyItTastes now separates the
  documented method from the documented tasting. The Michoacán pulque
  starter: reviewers connect the lactic, effervescent edge to the pulque —
  that attribution is kept and labeled as a reviewer's reading, not an
  established mechanism (no source isolates the starter; lots rested
  months in glass). The Filipino-still contribution stays a
  tradition-level description from the Michoacán region page. The Puebla
  dry-then-wet fermentation is documented; the sharp acidity it was said
  to "sharpen" is documented separately — the causal link is now
  explicitly open, and the Mezcalistas producer visit (which describes the
  house's mezcals as clean) is noted against the guess. The SLP clay-oven
  vs autoclave dispute stays open in the profile, the bottle record and
  both languages.
- **Comparison semantics.** `comparisonPerspectives` no longer says
  "the agave is the variable" when region or method change too —
  Michoacán vs Puebla now renders "not only the plant changes here: the
  region or the production method differs too, so read the differences as
  a whole combination" (EN and ES). The single-variable chips now fire
  only for genuinely controlled comparisons (matching maturation class
  and method set for same-plant pairs; matching region and method for
  same-tradition-different-plant pairs), and the multi-variable
  perspectives carry `sameRegion`/`sameMethodSet` evidence.
- **Recommendation reasons.** `ifYouLikeThis` now separates strong
  (medium/high) shared attributes from modest (low) ones; only strong
  shared attributes qualify a suggestion and only they appear in the
  rendered reason — "both lean {list}" became "both show {list}" / "ambos
  muestran {list}". Missing values stay a first-class unknown: a shared
  undocumented dimension is never counted as shared evidence, and the
  compare table still renders "Not documented" distinctly from Low and
  None.
- **Copy rewrites (EN/ES).** All five regional profiles rewritten in
  natural English and Mexican Spanish: fixed "atérran la fermentación"
  (→ "arranca la fermentación"), "sodá de uva" (→ "refresco de uva"),
  "el estado honesto de una tradición" (removed), and the literal
  "en voz baja" everywhere it appeared (bacanora, tuxca, Puebla contexts);
  removed reviewer-led openings and "this guide records" narration from
  the reading flow; serving advice, notice lines, smoke and finish lines
  now cite the example bottle's reviews. The compare intro now reads as
  guidance ("Pick two or three styles and read them side by side — what
  to taste, and what differs") instead of model narration, keeping the
  material editorial-levels qualification.

### Tests

- New `test/pair-23-editorial-maintenance.test.mjs` (10 regressions):
  fixtures distinguishing shared high/medium from shared low/none;
  unknown-from-low/none in selection and in the rendered compare table;
  a genuine single-variable regional comparison (matching class and
  method) vs multiple-changing-variables fixtures; Michoacán–Puebla
  rendered comparison never claiming a single variable; suggestion
  reasons never claiming a shared "lean"; bottle-scale anchoring and
  removal of the specific overreach phrases in EN and ES; method/tasting
  separation in the Michoacán, Puebla and SLP why-blocks; no
  reviewer-led/guide-model narration in the five reading flows, with
  specific people and places kept; ES literal-translation artifacts
  absent from the whole content file.
- `test/comparison-intelligence.test.mjs` updated: espadín vs tobalá
  (different regions) now expects the multi-variable perspective.
- `npm run validate`: schema, cross-references and the full `node:test`
  suite — **417 passing** (407 prior + 10 new).

### Rendered-page checks

Full-app boot checks (jsdom, real `app.js` boot path with the production
data files) in both languages: all five regional profiles render their
rewritten description, why-block, serving advice, example bottle cards
and suggestion reasons; the Michoacán–Puebla comparison renders the
multi-variable perspective chip, the plant/method rows showing the
actual differing plants and methods, and the honest no-documented-
differences line (both profiles' sensory levels match); language
switching renders the ES mirrors; direct hash links (#/profile/…,
#/compare/…) boot straight to the right view. A native desktop browser
was not available in the execution sandbox; the deployed Pages URL below
was checked via the workflow's validated artifact, and native-browser
rendering was not re-verified in this pair.

### Deployed

Deployed commit: cc9495c on `main` (merge of PR
<https://github.com/Urqe/RagdollLabs-agave-guide/pull/72>, content commit
6064e58) via the existing GitHub Pages workflow (validate → stage →
deploy), CI and Pages deployment both green. The live data files and
compare.js were fetched from the deployed URL and verified to carry the
corrected copy and logic. Live URL:
<https://urqe.github.io/RagdollLabs-agave-guide/>

### Still unverified — no claim made

- Native iPhone/iPad Safari, VoiceOver, physical touch and
  regional-reader validation of the rewritten Spanish prose remain
  unverified, as in every prior pair.
- The Michoacán still/pulque and Puebla fermentation causal links remain
  genuinely open questions; the SLP cooking method remains disputed
  between producer and one local reviewer — recorded, not settled.
- No claim is made that all bottles from any of these five regions taste
  alike; every sensory statement is scoped to the example bottle's
  reviews or to documented producer/state-level tendencies.

## Pair 23.1 — Editorial voice and Spanish localization maintenance (2026-10-24)

Branch `pair-23.1-voice-and-localization`, reviewed and merged by the
owner as PR #73 (merge commit `1fb95ee`). CI, Deploy to GitHub Pages and
pages-build-deployment all succeeded for `1fb95ee`, and the live
`profiles.json` was fetched afterwards: it serves the rewritten Guerrero
text and the Arandas pin. Section 8 of the plan was reordered on the
owner's instruction (voice guide first; execution order 23.1 → 24 → … → 29)
and the owner's live-site review findings were added to the pairs they
belong to.

### Changed

- **Voice guide.** New `EDITORIAL_VOICE.md`: a knowledgeable person
  talking warmly about their spirit, with no fictional narrator. It covers
  the glass-first profile order, caution said once, regional voice through
  specifics, words to avoid, British spelling for the English edition, the
  home-path labels for Pair 26, Mexican Spanish rules (including
  savory ≠ sabroso), a before-and-after sample and a rewrite checklist.
- **Five regional profiles** (Guerrero, Durango, San Luis Potosí,
  Michoacán, Puebla): descriptions and why-blocks rewritten in EN and ES.
  The "This profile is grounded in one bottle" and "separate records"
  formulas are gone. Every fact, attribution, the SLP oven dispute and the
  open causal questions are kept. The SLP beginner note drops "genuinely
  divided".
- **Spanish plant fields.** Plant, discover and Learn pages render the
  localized cultivation note and common-name region labels through one
  contract: the `commonNameRegions` map in `content-es.json`, keyed by the
  English label, plus `commonNameRegion`/`commonNamesText`/`plantCultivation`
  in `editorial.js`. `validate.mjs` fails on a missing or stale label. A
  label's own aside renders as a comma clause, so names never show nested
  parentheses. Learn's reference lists now use localized profile titles,
  which were English in ES before.
- **Spanish calques.** Fixed "leerse sabrosos" (valley blanco context),
  the remaining "se lee/leerse" flavour phrasing (13 strings),
  "el agave firma", "en vinatas pasadas de una generación",
  "carga la presión de sostenibilidad", "taffy de plátano",
  "funky/funk", "viajes minerales" and the intensifier "genuinamente".
- **Reviewer phrasing.** The Pal'alma EN/ES summaries no longer say
  "reviewers … reviewers". The Zinacantan summary drops "mineral travels".
- **Taste-note contract.** The two freeform ES `tasteNotes` strings, which
  were never rendered and claimed a state-wide "firma", are removed.
  `ES_NOTES` in `taste-notes.js` is the single contract, and validation
  rejects ES profile fields that no view renders.
- **Body-only suggestions.** `ifYouLikeThis` no longer qualifies a
  candidate whose only strong match is body. A snapshot of all 23 profiles
  before and after showed no change to real-data suggestions, and a
  synthetic regression covers the case.
- **Same-plant chips.** Comparison perspectives name the shared plant by
  its canonical species from `plants.json` instead of the profile's full
  plant string, which caused nested parentheses.
- **Spanish page note.** The page-level "El contenido editorial … está
  actualmente en inglés" note now appears only when the page really shows
  an English fallback field (`.untranslated-field`), not on every Spanish
  page.
- **Los Altos pins.** The extra añejo moves from the town of Tequila
  (20.90, −103.84) to Arandas (20.71, −102.35), matching its label, region
  and example producer, La Alteña. The highland blanco, labelled
  "Atotonilco el Alto area", sat at 20.06, −102.10, south of Los Altos near
  the Michoacán border; it now sits at Atotonilco el Alto (20.55, −102.51).
  Both stay labelled approximate and are pinned by a regression.

### Tests

`npm run validate`: data validation passed (23 profiles, 51 bottles, 109
sources) and 431 tests pass (417 prior plus 14 in
`test/pair-23-1-voice-localization.test.mjs`). Three existing tests were
adjusted deliberately:

- The pair-23 causal test pinned the removed "separate records / dos
  registros distintos" formula. It now pins the substance: method and
  tasting are both stated and the cause stays flagged open, in EN and ES.
- The pair-4 English-leak test scanned the whole ES file. It now scans
  the `commonNameRegions` values only, because the keys are English lookup
  keys that never render.

### Manual checks

- Headless Chromium against a local static server (800px wide), EN and
  ES: Michoacán, Guerrero and valley blanco profiles, the cupreata plant
  page and the valley/highland blanco comparison render without script
  errors. The only console errors are blocked external font requests from
  the sandbox. No page-level or field-level English disclosure appears on
  these fully translated Spanish pages.
- Not yet checked on the deployed site, because the branch is not merged.

### Still open or unverified

- No native-speaker review of the new Spanish yet. That remains the owner's
  or a Mexican reader's call.
- The context paragraph of the five profiles was not part of this pair, so
  it still opens each page in the older, encyclopedic voice before the
  rewritten tasting paragraph. Pair 28 applies the voice guide to the
  context paragraphs and the other 18 profiles.
- Profile coordinate precision labels still render in English in the
  Spanish edition. They are small and are recorded for Pair 28.
- Native iPhone/iPad Safari, VoiceOver and touch checks remain unverified.

## Pair 24 — Guided sensory tasting (2026-10-24)

Branch `pair-24-guided-tasting`, reviewed and merged by the owner as
PR #74 (merge commit `2ed0e2c`). CI, Deploy to GitHub Pages and
pages-build-deployment all succeeded, and the live `journey.js` serves the
guided tasting. All new text follows `EDITORIAL_VOICE.md`.

### Changed

- **Guided tasting** (`#/start/how-to-taste`). The four-step sequence is
  now six steps: prepare, aroma, sip, texture and warmth, finish,
  reflect. The technique text of the old steps is kept word for word, and
  "Sip and notice the texture" is split into "Sip" (which now explains
  retronasal flavour) and "Texture and warmth". A switch at the top picks
  **Reading along, no glass** (the default) or **I have a glass**:
  - Reading along: each step shows a panel built from the valley blanco
    profile's own data (taste notes, what to notice, body, pepper level,
    finish text and length), so no sensory content is duplicated. A panel
    is skipped rather than guessed if a field is missing.
  - With a glass: each step shows a short "your turn" prompt instead.
  - The choice lives in memory only. Nothing is stored or sent.
- **Reflection.** An optional choice ("What stood out most?") points to
  the matching flavour path, or for "Hard to say yet" to the comparison
  step. There is no score and no right or wrong wording.
- **Lesson 3** (`#/start/recognise-the-notes`) adds "Easy to mix up"
  (sweetness vs sugar, alcohol warmth vs pepper, smoke vs roast, body vs
  intensity, smell vs flavour in the mouth) and "Words for what you
  taste": ten descriptors with everyday anchors. Mineral and oak carry
  caveats ("not proof", "vanilla alone doesn't prove it"). The Spanish
  anchors are Mexican (camote asado, calabaza en tacha, hierbabuena, gis,
  cajeta).
- **Hub outcome** now promises telling aroma, flavour, body, alcohol
  warmth and finish apart, plus a tasting with or without a glass.
- **Profiles show body once.** The character grid shows Light / Medium /
  Full (Ligero / Medio / Pleno) instead of Low / Medium / High, and the
  duplicate "Body" entry in the facts list is gone.
- **Valley blanco ES.** "el centro sabroso" became "el corazón de agave
  asado, más salado que dulce", and "rodaja de lima" became "rodaja de
  limón". The same slips elsewhere are logged for Pair 28.

### Tests

`npm run validate`: data validation passed and 442 tests pass (431 prior
plus 11 in `test/pair-24-guided-tasting.test.mjs`). Three existing tests
pinned the four-step lesson and were updated deliberately, with every
content check kept (neat definition, stemware, swirl, warmth, finish
definition):

- pair 16 step count and headings
- pair 16 hub outcome wording
- P18-4 step indices, now looked up by step id

### Manual checks

Headless Chromium against a local static server:

- **Widths and overflow.** At 375px, EN and ES, the how-to-taste lesson,
  lesson 3 and the valley blanco profile show no horizontal overflow. At
  1280px, EN, both lessons render.
- **Mode switch.** It swaps panels and prompts and keeps focus on the
  pressed button.
- **Reflection.** Choosing "Pepper or spice" shows the "Peppery and
  spicy" path link in both languages.
- **Errors.** No page errors.

### Still open or unverified

- Native-speaker review of the new Spanish is not done.
- Native iPhone/iPad Safari, VoiceOver and touch checks remain unverified.
- Lesson 3 is now long on phones. Pair 26's page-landing and orientation
  work should check it.

## Pair 25 — Production → sensory explanation (2026-10-24)

Branch `pair-25-plant-to-glass`, reviewed and merged by the owner as
PR #75 (merge commit `0a6221c`). CI, Deploy to GitHub Pages and
pages-build-deployment all succeeded. All new text follows `EDITORIAL_VOICE.md`.

### Changed

- **New page `#/plant-to-glass`** ("From plant to glass" / "De la planta
  a la copa"):
  - **Steps.** Seven steps: plant, cook (or no cook), crush, ferment,
    still, rest, finish before bottling. Each shows its possible effect in
    the glass, labelled as an editorial reading, the styles that use it,
    and a closed "How it works, and the sources" disclosure with the full
    explanation and attributed links.
  - **Non-standard cases.** The sap route (comiteco, destilado de pulque)
    and sotol's non-agave identity are taught in the plant and cook steps.
  - **Two routes.** Steam or fire (valley blanco and espadín mezcal) and
    straight to the bottle or oak (valley blanco and añejo). Each route
    lists the steps from the profiles' process records, plus the crush
    step when the profile's documented method names a crushing tool. It
    quotes the documented method and asks a question to predict first.
    The hidden answer shows the levels from data, explains why it isn't
    proof (plant, place and producer differ; vanilla alone doesn't prove
    oak) and links to the side-by-side comparison.
  - **Still open.** The SLP oven dispute, the Michoacán pulque starter and
    the Puebla fermentation and acidity question stay visible, each linked
    to its profile.
  - **Practise it.** Links back to the guided tasting, lesson 3 and the
    process reference.
- **Entry points, each keeping its return context.** The Learn production
  chapter links to the page (`?from=learn`), lesson 3 adds a line after
  the vocabulary (`?from=start:recognise-the-notes`), and every profile's
  "How it is made" section adds "How each step can shape the glass"
  (`?from=profile:<id>`). Profiles opened from the page return to it.
- **Process data** (`processes.json`, `content-es.json`):
  - **New `milling-extraction` record,** sourced to Difford's tequila
    production page and Mezcalistas.
  - **Glass effects.** Every process has a `glassEffect` line in EN and
    ES, and the ES edition gains process names. Validation requires both
    and rejects unrendered ES process fields.
  - **Distillation** now teaches heads, heart and tails cuts (Difford's
    tequila page; Lost Explorer palenque page), still without promising a
    flavour.
  - **Steam cook** drops "which is why tequila reads vegetal". It now says
    steam-cooked tequila usually has no smoke, with Difford's oven and
    autoclave contrast attributed.
  - **Wild fermentation** adds the attributed point that the yeast choice
    helps shape the finished flavour.
  - **Pit roast** now also cites the Lost Explorer palenque page. Its
    existing Difford's mezcal source does not describe pit roasting or
    smoke, and the producer page does. This is logged for a source audit
    in Pair 28.
- **Michoacán profile** lists the wild fermentation its method text
  already documents ("pulque-started wild fermentation"); before, it
  listed distillation only.
- **Learn** process headings, stages and chip labels are localized,
  replacing the hard-coded "(see process reference below)". The milling
  record matches profiles that name their crushing tool.

### Tests

`npm run validate`: data validation passed and 455 tests pass (442 prior
plus 13 in `test/pair-25-plant-to-glass.test.mjs`). One existing test
looked for the English heading "Earthen pit roast" on the Spanish Learn
page; it now expects the Spanish name, which is the point of the change.

### Manual checks

Headless Chromium against a local static server:

- **Widths and overflow.** At 375px (EN and ES) and 1280px (EN) there is
  no horizontal overflow, with the answer panels closed or open, and no
  page errors.
- **Return links.** A profile opened from a stage chip shows "← Back to
  plant to glass" / "← Volver a De la planta a la copa".
- **Disclosure arrow.** The arrow was missing, because the summary uses
  flex layout; I added one, which respects reduced motion.

### Still open or unverified

- Native-speaker review of the new Spanish is not done.
- Native iPhone/iPad Safari, VoiceOver and touch checks remain unverified.
- The page is long on phones (seven steps, two routes). Pair 26's
  orientation work should check whether a jump list helps.

## Pair 26 — Three-intention navigation and lesson continuity (2026-10-24)

Branch `pair-26-navigation`, reviewed and merged by the owner as PR #76
(merge commit `56ab9de`). CI, Deploy to GitHub Pages and
pages-build-deployment all succeeded.

### Changed

- **Home page: three paths instead of five cards.**
  - **Start here** (`#/start`) comes first, as the plan orders it.
  - **Explore** leads to Browse styles, with Plants & places and Compare
    as secondary links.
  - **Look it up** leads to the Catalogue, with Learn, Label vocabulary
    and From plant to glass as secondary links.
  - Every earlier destination stays one click away. The repeated "no
    glass, no purchase, no quiz" line and the "Keep learning" label beside
    Learn are gone.
- **Pages open at their top.** A route change now scrolls instantly to the
  top of the view. Its scroll margin equals the measured sticky-header
  height (`--header-offset`, kept current with `ResizeObserver`, since
  the header wraps to two rows on phones). The old 5rem margins are
  replaced.
  - **Real-browser check.** In Chromium after scrolling 1500px and
    navigating, the heading sits just below the header on home, explore,
    profile, lesson, plant-to-glass and compare: 13px below at 1280px, and
    12–13px below at 375px (EN and ES).
  - **Smooth-scroll fix.** The first attempt used the page's smooth
    scrolling and landed mid-animation. It is now instant.
- **The app no longer undoes a view's own landing.** It used to scroll to
  the first heading after every render, which overrode Learn deep links
  such as `#/learn/terms`. Views that place focus themselves (Learn deep
  links, catalogue reveal, the compare picker after an action) are now
  left alone.
- **Focus and titles.**
  - **Heading focus.** A route change focuses the page heading
    (`tabindex="-1"`, so it is never in the tab order). The first load
    leaves focus where the browser puts it.
  - **Language and theme switches.** These keep focus on the switch;
    before, it jumped into the page.
  - **Browser titles.** Every page has its own document title, such as
    "Espadín mezcal, Valles Centrales style · Agave Guide" or "2. Cómo
    catar · Guía del Agave". Home keeps the site title.
- **Compare** restores picker focus only after the reader acted on a
  picker. On a fresh visit it no longer moves focus, and the page lands
  normally.
- **Nav highlighting.** Plant and tradition pages highlight Plants &
  places. The beginner journey is reached from the home path and
  highlights no nav item.
- **Lesson continuity.**
  - **Position.** Lessons show "Step n of 5" / "Paso n de 5".
  - **What to notice.** A profile opened from a lesson shows a "From the
    lesson …" note with that lesson's own reason for opening it, under
    the heading, with "Back to the lesson" above.
  - **Jump list.** The plant-to-glass overview is now a jump list of
    buttons that scroll to and focus each step.
- **Labels.** The Spanish section name is unified to "Aprender", the nav
  label, and the "Aprende" variants are fixed. Lesson 5's "Keep learning"
  becomes "Look it up in Learn" / "Consulta en Aprender".
- **Checked, already in place.** The bilingual no-JS message in
  `index.html`, Back/Forward, direct links and lesson back links. They
  are now covered by tests.

### Tests

`npm run validate`: data validation passed and 468 tests pass (455 prior
plus 13 in `test/pair-26-navigation.test.mjs`). Three home tests pinned
"Browse styles" as the first home card and were updated for the
beginner-first order. They still check that every earlier destination is
reachable.

### Manual checks

Headless Chromium against a local static server, at 375px (EN, ES) and
1280px (EN):

- **Landing.** Measured as above.
- **Focus.** It lands on the heading.
- **Titles.** Each page has its own.
- **Lesson note.** It renders on the espadín profile opened from lesson 3.
- **Errors.** No page errors.

### Still open or unverified

- **Phone header height.** At 375px the sticky header is 165–182px tall,
  about a fifth of the screen, because the five nav items wrap onto two
  rows. This is logged in Pair 29.
- **VoiceOver.** Screen-reader announcement of the focused heading has
  not been checked; the jsdom and Chromium checks only confirm focus
  placement.
- **Native devices.** iPhone/iPad Safari and touch checks remain
  unverified.

## Documentation — Release plan reduced to next steps (2026-10-24)

On the owner's request, `RELEASE_PLAN.md` was rewritten from about 191 KB to about 27 KB so that it guides the next steps and stays small enough for AI models to read whole. Releases 1–26 and pairs 1–26 are recorded in this file, so the plan no longer repeats them.

- **Kept, compacted:** current status and working rules; scope (with sotol now stated as an included non-agave relative, replacing the superseded foundation exclusion); data-model and map rules; the editorial and sourcing policy, including Pair 16's bottle-first and regional-voice rules; a list of easy-to-get-wrong content facts from the Pair 15 corrections; source starting points; implementation conventions from Pairs 23.1–26; release gates; and the maintenance contract.
- **Carried forward:**
  - Every open item of Pairs 27–29.
  - Pair 15.6's running-app round trips, moved into Pair 29.
  - Pair 17's reviews that need a person (Mexican Spanish editorial review, experienced-reader review, bottle copy review, beginner walkthrough), as their own section.
  - The future designation layer and coverage backlog, under later ideas.
- **New items found during the rewrite:**
  - The stylesheet cache key in `index.html` had not been bumped since Pair 16, although Pairs 24–26 changed the CSS. It is now `agave-pair26-1`, and the plan says to bump it with CSS changes.
  - The Montelobos and Del Maguey producer pages behind Pair 18's bottle-origin corrections are not registered in `sources.json`. This is logged under Pair 28.
- **`START_HERE.md`:** the original Release 1 prompt, which told agents not to read the plan. Merged as PR #77; afterwards the owner moved it to `docs/archive/` (see Pair 27).

## Pair 27 — Comparison as a learning exercise (2026-10-24)

Branch `pair-27-learning-comparisons`. Merged as PR #78 (merge `5c6817b`)
and deployed. All new text follows `EDITORIAL_VOICE.md`.

### Changed

- **Archive.** At the owner's request, `START_HERE.md` (the original
  Release 1 prompt) moves to `docs/archive/`, with a README saying archived
  documents are reference only. The plan points there.
- **Five guided comparisons in the existing Compare view**
  (`assets/js/compare-presets.js`). There is no parallel engine.

  | Preset | Pair |
  | --- | --- |
  | wood | valley blanco vs reposado |
  | region | valley vs highland blanco |
  | tradition | valley blanco vs espadín |
  | plant | espadín vs tobalá |
  | mountains | bacanora vs Sierra raicilla |

  Each preset has one beginner question, two or three dimensions to look
  at, a hidden answer listing those levels from the profile data, what the
  pair shows, "What this doesn't show" (its confounders) and a next
  exercise. The chain runs wood → region → tradition → plant → mountains,
  then to the free picker.
- **Checked against data.** Each preset declares which way every
  difference it describes goes. `checkPreset` verifies those directions
  against the live profiles, and `validate.mjs` runs it, so a profile edit
  that contradicts a preset fails validation instead of leaving it stale.
  An undocumented level fails the check rather than reading as "none". A
  preset that fails is never offered, and an active one only shows when
  the selection is exactly its pair.
- **Layout.**
  - **Empty Compare.** The guided comparisons come first, then "Or choose
    your own" with the "Pick at least two" instruction, then the free
    picker. The instruction used to sit at the bottom.
  - **Free comparison.** The guided comparisons are offered after the
    results.
  - **Active preset.** It teaches first, like a lesson handoff. The picker
    moves into the existing "change styles" control, and changing the pair
    drops the preset and returns to a free comparison.
- **Ways in.**
  - Lesson 4's two prepared comparisons now open as the `wood` and
    `region` presets, keeping `from=start:first-comparison` through the
    next-exercise chain.
  - The flavour paths link to their matching preset: rich and oak to wood,
    fresh and herbal to region, smoky and earthy to tradition, fruity and
    floral to plant, peppery and spicy to mountains.
  - Profiles that belong to a preset link to it.
- **Body wording.** Compare shows body as Light / Medium / Full in the
  table, summary line and biggest-differences list, matching Pair 24's
  profile grid.
- **Stylesheet cache key** bumped to `agave-pair27-1`.

### Tests

`npm run validate`: data and preset validation passed, and 479 tests pass
(468 prior plus 11 in `test/pair-27-learning-comparisons.test.mjs`). No
existing test needed changing.

### Manual checks

Headless Chromium against a local static server, at 375px (EN, ES) and
1280px (EN):

- **Path checked.** Empty Compare → first preset → reveal answer → next
  exercise.
- **Layout.** No horizontal overflow, with the answer closed or open. The
  heading lands below the header, and each page has its own title.
- **Next exercise.** It opens the `region` preset.
- **Errors.** No page errors.

### Still open or unverified

- **Empty Compare on phones.** The five preset cards come first and push
  the free picker about a screen down. This is logged for Pair 29.
- **Spanish and devices.** Native-speaker review of the new Spanish is not
  done. iPhone/iPad Safari, VoiceOver and touch checks remain unverified.

## Pair 28 — Editorial consistency and regional warmth (2026-10-24)

Branch `pair-28-editorial`. Merged as PR #79 (merge `fa8c9f8`) and
deployed. All rewritten text follows `EDITORIAL_VOICE.md`, EN and ES written
together (Mexican Spanish, tú).

### Changed

- **Voice pass on every profile.** All 23 profiles' context, description,
  why-it-tastes and beginner note now lead with what is in the glass, then
  why, then what sets the style apart. Removed: "This profile describes…",
  reviewer-led openings, stacked caveats ("a tendency, not a rule",
  "neither alone decides it"), legal definitions ahead of taste. Every fact,
  date, legal class and attribution is kept.
- **Spanish brought level with English.** Several ES descriptions were
  shorter than, or different from, the English (reposado, añejo, extra
  añejo, cristalino, raicilla, comiteco, destilado de pulque, sotol). Two
  ES errors fixed: mezcal reposado said the NOM recognises three classes
  (it defines six) and that mezcal's reposado minimum differs from tequila's
  (both start at two months).
- **Overstated causes softened.** The bacanora "mineral edge from the
  Sierra", comiteco "everything follows from the sap" (cane sugar is in the
  definition), "nothing to the north" (destilado de pulque is also a sap
  spirit), extra añejo "only agave that can carry that much oak", and
  wild fermentation "adds texture" in espadín.
- **Regional context, sourced only.** Sonora's vinateros and the
  1915–1992 prohibition (Sonora's official history), Jalisco's Sierra and
  Costa tabernas, Oaxaca's family palenques. Unsupported details were
  removed rather than kept: the coastal "fishermen and farmers" (not in any
  cited source) and the tobalá mezcalero who "will walk you to the plant".
- **App narration removed elsewhere.** Bottle notes ("the app's profile
  describes…", "Mezcal Reviews lists…"), region distinctions ("App
  coverage…") and plant notes ("the app preserves…") now speak to the
  reader. Salmiana's sensory note no longer claims "no roast" for a species
  that is also cooked for mezcal on the Potosino plateau.
- **"If you like this" reasons** no longer repeat word for word: after the
  shared dimensions the sentence names what differs (another spirit, another
  plant, the time in wood, or place and producer).
- **Checkable corrections (first commit):** "sabroso" → "salino", "lima" →
  "limón", "albaricoque" → "chabacano"; Spanish coordinate precision;
  British spelling in English; espadín class wording per NOM-070; an
  `official` source kind for DOF, NOM-070, Sonora, INIFAP, CONAFOR and
  Cultura records; NOM-006 added; the duplicate Difford's entry retired;
  Montelobos and Del Maguey producer pages cited; process sources checked
  against their pages; validation rejects duplicate source ids.

### Checks run

- `npm run validate`: data validation passes; 492 tests pass, including the
  new `test/pair-28-editorial-consistency.test.mjs` (13 tests).
- Headless Chromium at 390×844, EN and ES: valley blanco, espadín, coastal
  raicilla and sotol profiles render the new context, varied reasons and
  localized precision; the catalogue bottle note renders in both languages;
  no page errors. CSS unchanged, so the cache key stays.

### Not done / carried forward

- Mezcal Reviews-only bottles still lack an independent second source; no
  bottle tasting facts were touched, so this remains a standing rule.
- The Bahía de Banderas and Agricultura bacanora pages could not be fetched
  (robots and client errors), so nothing new was cited from them.

## Pair 29 — Learning quality and usability audit (2026-10-25)

Branch `pair-29-quality-audit`. Not merged or deployed: awaiting the
owner's review. No new scope; every change fixes something the audit found.

### Found and fixed

- **Skip link opened a not-found page.** "Skip to content" pointed at
  `#main`, which the hash router read as a route. It now moves focus to the
  page content and leaves the route alone.
- **Back trap on Compare.** Opening a bare `#/compare` with a saved
  selection added a history entry, so Back returned to `#/compare`, which
  redirected forward again. The redirect now replaces the entry and renders
  the saved comparison in the same pass.
- **Keyboard users skipped the header on first load.** The landing scroll
  on the first render moved Chrome's focus starting point into the page, so
  the first Tab skipped the skip link and nav. The first render no longer
  scrolls (the page is already at the top), and a same-route re-render only
  pulls focus back to the page if it was there before.
- **Phrase search found nothing.** "smoky mezcal" or "mezcal ahumado"
  returned zero profiles, because search matched the whole phrase. When the
  phrase misses, every word must now match; "smoky" also finds "smoke", and
  sensory words rank by the profile's editorial level, so medium-smoke
  styles come first.
- **Phone header.** At 375px it was 182px tall: the five nav items wrapped
  to two rows. It is now 110px: brand and preferences, then one scrolling
  nav row with edge fades, the current item kept in view, and 44px tap
  targets. On narrow phones the language button drops "(México)" visually
  (the accessible label keeps it). Below about 360px the product name wraps
  instead of being clipped (127px).
- **Empty Compare on phones.** The free picker started about 1,890px down.
  The guided comparisons are now compact cards on phones (question kept,
  style names hidden), and a "Skip to choosing your own styles" link sits
  above them. The picker now starts about 1,070px down, or one tap away.
- **Enlarged text (200%).** Eight pages scrolled sideways at 390px: long
  words ("Liñeno/Cimarrón", "Dasylirion"), source titles, chips, catalogue
  cards and the plant-to-glass levels table. Long words now wrap, and the
  table scrolls inside its own box.

### Checks run

- `npm run validate`: data validation passes; 501 tests pass, including the
  new `test/pair-29-quality-audit.test.mjs` (9 tests): skip link, Compare
  history, first-load focus, the Compare skip link, phrase search, every
  journey lesson and its links in both languages (routes, profile ids,
  preset ids, chapter ids), unknown sensory levels, Spanish parity for new
  strings, header rules and the CSS key.
- Headless Chromium, EN and ES at 390×844: a crawl of every internal link
  (551 routes per language) found no not-found pages, no horizontal scroll
  and no page errors.
- Round trips pass: catalogue → profile → Back (scroll restored), lesson →
  Learn chapter → Back and → back link, lesson → prepared comparison → back
  to lesson, brand directory → Back, Back/Forward chains, and reload of
  direct links (profile, compare preset, Learn chapter, lesson, plant,
  catalogue bottle).
- Keyboard on a fresh load: skip link, brand, five nav items, theme,
  language, all with visible focus. Reduced motion: no smooth scrolling and
  no animated elements. 200% text: no horizontal scroll on any main route
  or profile with all details open.

### Novice tasks (scripted editorial walkthrough, not real testers)

- Find a starting lesson: two taps from home (Start here → lesson 1).
- Tell nose, mouthfeel and finish apart: lesson 2 walks through smell, sip,
  texture and warmth, and finish as separate steps. ES uses nariz, boca and
  final; EN calls mouthfeel "texture" and "body".
- Find why a mezcal might be smoky: Browse styles → search "smoky mezcal"
  → the espadín profile explains the pit roast. This failed before the
  search fix.
- Complete a preset comparison: Compare → first exercise → reveal → next
  exercise link.
- Find an example bottle and return: each profile shows its example bottle
  on the page; catalogue → profile → Back returns to the same scroll.

### Not verified (recorded, not claimed)

- Desktop Safari, iPhone and iPad Safari, VoiceOver, and real novice
  testers. These are now listed in the plan's "Needs a person" section.
- At 200% text the sticky header is about 190px tall on a 390px-wide
  phone. It no longer overflows, but it takes a large share of the screen;
  making the header non-sticky at large text sizes is a possible follow-up.
