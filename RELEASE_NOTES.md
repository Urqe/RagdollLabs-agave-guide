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
