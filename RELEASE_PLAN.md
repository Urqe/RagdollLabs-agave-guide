# RagdollLabs Agave Guide — Release Plan

Status: planned; no implementation or deployment completed.  
Updated: 2026-10-20  
Confirmed repository name: `RagdollLabs-agave-guide`  
Product subtitle: **Explore Mexico’s agave spirits**

## 1. Product direction and confirmed scope

A static, source-backed guide to Mexican agave-based distilled spirits, their regions, plants, makers, brands, and individual bottles. Carry forward Whiskey Compass's discovery, comparison, education, and source transparency patterns with a Mexico SVG map and a domain model suited to agave traditions.

The confirmed product name is **RagdollLabs Agave Guide**. Earlier Compass naming and broader Mexican-spirits alternatives are superseded.

### Scope rules

- Include tequila, mezcal, bacanora, raicilla, and additional documented agave distillates in phased deployments.
- Exclude sotol (Dasylirion), charanda, pox, cane-only rum/aguardiente, and other non-agave spirits from catalogue, profiles, and comparison. They may appear briefly in a glossary distinction, never as app coverage.
- “Agave-based” does not mean every product must be labeled 100% agave. Include established agave-based traditions with other fermentable sugars when their composition is verified and clearly disclosed. Do not label them 100% agave or hide that distinction.
- Include distilled products derived from agave sap where supported. Fermented pulque itself stays outside the spirit catalogue, with educational context where needed.
- Keep geographical traditions, protected designations, plant varieties, production methods, classes, and brands distinct. More content must not mean inventing more spirit categories.
- English UI first, preserving Spanish names and accents; reviewed Spanish localization comes later.
- No live pricing, stock tracking, commerce, accounts, runtime scraping, or generated tasting claims. Research produces reviewed static data updates.

### Core user journeys

1. Search a familiar brand or exact bottle, read its sourced character, and understand its fit with a profile.
2. Select a Mexican state on the SVG map or equivalent list and discover covered traditions and makers.
3. Choose flavor preferences and find supported profiles with understandable recommendation reasons.
4. Compare profiles across agave traditions without conflating place, plant, process, or legal category.
5. Learn how agave spirits differ using concise explanations and real bottle examples.

### Coverage backlog and classification

| Tradition / content group | Planned treatment | Evidence gate |
| --- | --- | --- |
| Tequila | Foundation seed, later class and regional expansion | Distinguish category from class; record exact expression facts and review evidence |
| Mezcal | Foundation seed, later plant/process/region expansion | Distinguish regulated categories/classes from editorial flavor groupings |
| Bacanora | First content expansion | Sonora coverage with verified maker, place, process and bottle notes |
| Raicilla | First content expansion | Document coastal/sierra examples without assuming uniform flavor or plant identity |
| Tuxca | Later regional expansion | Documented regional agave-distillate tradition associated with Colima and neighboring areas; verify each origin and label identity [S7] |
| Comiteco | Later regional expansion | Agave-sap-based tradition; verify agave/cane composition and current designation scope rather than implying 100% agave [S8] |
| Destilado de pulque | Later regional expansion | Distilled agave-derived product, distinct from fermented pulque; verify bottle composition and review evidence [S9] |
| Other documented destilados de agave | Ongoing evidence-led backlog | Preserve exact label/tradition identity; no automatic relabeling as mezcal and no inference about quality from certification status |

Espadín, tobalá and other plant names belong in the plant taxonomy; pechuga, ensamble, cristalino and maturation terms need contextual treatment rather than promotion into equivalent spirit families. Local aliases may overlap and require research.

## 2. Carry forward the architecture, redesign the domain model

Reference: [Whiskey Compass](https://github.com/Urqe/RagdollLabs-whiskey-compass), its README, reviewed implementation, and its planned reliability, content, and bottle-discovery releases. This plan does not assume those planned fixes or features have already shipped.

### Reuse after checking the implementation

- Static HTML/CSS/JavaScript, local JSON, GitHub Pages deployment, and local SVG assets.
- Bounded, cached data fetching; clear essential-data errors and independent optional enrichment loading.
- Shared DOM utilities, safe external-reference URLs, data validation, DOM smoke tests, and hardening tests.
- Search normalization, curated discovery, reusable comparison state, learning panels, and source display patterns.
- Explicit navigation/history handling with one visible main workspace, reliable focus restoration, and deep links.

### Change deliberately

- Use native ES modules with explicit imports in the new repo; avoid copying every legacy global and fallback stack. Define one working core and optional enhancements with documented contracts.
- Keep a small central route/state owner. Use events for notifications, not competing view controllers.
- Replace the country → region → whiskey-style hierarchy with cross-linked spirit, plant, process, place, and expression records.
- Do not port peat categories, grain/mashbill assumptions, whiskey age ladders, or generic cask-derived sweetness rules.
- Keep a standalone repo initially. Do not create a shared multi-app framework before actual duplication justifies it.

### Suggested module boundaries

| Module | Responsibility |
| --- | --- |
| `app.js`, `router.js`, `state.js` | Boot, route parsing, view transitions, selection and comparison state |
| `data-loader.js`, `model.js` | Loading, references, domain invariants, derived display data |
| `map.js`, `explore.js`, `profile.js` | Mexico explorer, list/gallery, profile rendering |
| `search.js`, `discovery.js` | Search index, aliases, flavor-based candidate selection and explanations |
| `compare.js`, `bottles.js` | Comparison, expression catalogue and contextual notes |
| `learning.js`, `dom-utils.js` | Guides, glossary, safe DOM and reference rendering |

Keep modules small enough to test their contracts. Add modules when their release needs them rather than scaffolding every future feature in advance.

### Data model

| File / entity | Required distinctions |
| --- | --- |
| `spirits.json` | Spirit identity, definitions, terminology, sources; legal category and class terms scoped to that spirit |
| `plants.json` | Agave genus/species/taxon, regional common names, aliases, uncertainty, sources |
| `places.json` | State, municipality/community where verified, parent IDs, coordinates with precision/provenance |
| `designations.json` | Named designation, dated sources, geographic scope and amendments; separate from tasting coverage |
| `profiles.json` | Explicit editorial profile ID, spirit, place references, plant/process context, sensory assessment, explanations and sources |
| `processes.json` | Cooking, extraction, fermentation, distillation, resting, wood contact and other verified treatments |
| `brands.json`, `producers.json` | Brand owner/identity versus actual maker, palenque/vinata/distillery, and documented relationships |
| `bottles.json` | Expression ID, brand/producer, version or batch where material, verified label and fermentable-composition facts, profile mapping or uncovered status, review references and notes |
| `reviews.json` | Expression-linked published review records, reviewer/date/version provenance, supported observations and source references |
| `sources.json` | Specific URL, title, publisher/author, publication/review date where known, verification date, source type and supported content |
| `glossary.json`, `guides.json`, `pairings.json` | Educational and optional enrichment content, source references, editorial labels |
| `search-aliases.json`, `map-layers.json` | Curated aliases, stable feature IDs, map provenance, coverage and layer metadata |

Key modeling rules:

- Record agave contribution and any verified additional fermentable ingredients separately from plant taxonomy; do not equate app eligibility with a 100%-agave claim.
- A profile is an authored description of a bounded style/context, not an automatically generated state × spirit × plant combination.
- A brand can work with multiple producers; a producer can make several brands. Do not treat a brand's office as the production location.
- Keep legal designation, actual production place, plant-growing origin, and cultural region separate.
- Common plant names are not globally unique taxonomy identifiers. Preserve regional context and avoid unsupported species assignments.
- Separate plant age at harvest from spirit maturation. Wood aging, glass resting, and filtration are different processes.
- Terms such as joven, blanco, reposado, and añejo require spirit-specific definitions; do not reuse tequila rules across every spirit.
- An ensamble needs composition/process evidence; do not assume it is simply a post-distillation blend.
- Unknown is a first-class state, never numeric zero or proof of absence. Missing certification information means unverified, not uncertified.
- Batch-specific ABV, maker, plant, and tasting information must not silently become permanent brand-wide facts.

## 3. Mexico SVG map specification

The map is a primary discovery surface, with a fully equivalent list for accessibility and small screens.

- Local, responsive SVG of Mexico with all 32 federal entities, stable IDs, useful labels, and retained coastline/island context. Use licensed geographic geometry, not an AI-generated map.
- Prefer a documented conversion from an appropriate INEGI geographic dataset [S6]; verify reuse terms, preserve attribution, record dataset date and simplification settings, and keep the conversion reproducible.
- Initial layer: **App coverage**. Selecting a state reveals its covered spirits/profiles. Multiple traditions may coexist; never assign one spirit or flavor to a state.
- Neutral empty state: “No profiles added here yet.” This must not imply no relevant tradition or production exists.
- Clearly distinguish app coverage, verified production locations, and any future designation boundary layer in labels and legends.
- Never shade an entire state as a legal production zone when the designation covers selected municipalities. For example, bacanora's official coverage is municipal within Sonora [S2]; raicilla's declaration includes named municipalities in Jalisco and Nayarit [S3].
- Defer exact designation polygons until the relevant declarations, amendments, geometry, and boundary matching are verified. Do not synthesize legal boundaries from producer pins.
- Source coordinates and indicate their precision. If only the municipality is known, label the location as approximate rather than placing a false distillery pin.
- State selection must work by tap and keyboard; do not rely on hover. Provide visible focus, readable contrast, text labels/legend, and a synchronized state list.
- Avoid forcing users to tap tiny shapes. Offer list selection and accessible zoom/reset controls if zoom is introduced; preserve normal page scrolling.
- On mobile, use map → selected-place summary → results. On desktop, map and results can sit side by side. Keep the chosen place and result context on return from a profile.

## 4. Deployment sequence

Every numbered release is a deployed increment. Odd numbers add features or content; even numbers review code quality and UX, implement fixes, and deploy a maintenance update. Release 1 is a working GitHub Pages foundation, not an internal-only skeleton. Do not bundle several planned releases into one deployment or skip maintenance because the previous feature passed tests.

Release numbers are sequencing identifiers, not dates. Assign semantic version tags to actual shipped scope. Each release records its deployed commit, Pages URL, validation evidence, known limitations, and release notes. Unchecked tasks mean planned work.

| Release | Type | Deployed outcome |
| --- | --- | --- |
| 1 — Foundation on the Map | Feature/foundation | Inspectable Pages app, Mexico SVG, small tequila/mezcal seed, brands and reviewed bottles |
| 2 — Foundation Review & Fixes | Maintenance | Code, routing, accessibility and mobile UX fixes from the first deployment |
| 3 — Four Traditions | Feature/content | Bacanora, raicilla, richer profiles and basic multi-entity search |
| 4 — Explorer Review & Fixes | Maintenance | Map, search, content presentation and domain-model corrections |
| 5 — Find Your Flavor | Feature | Profile comparison, mood discovery and explained recommendations |
| 6 — Comparison Review & Fixes | Maintenance | Ranking/explanation, state, focus and comparison UX fixes |
| 7 — Brands, Bottles & Reviews | Feature/content | Wider searchable catalogue, alphabetical browsing and sourced profile-relative notes |
| 8 — Catalogue Review & Fixes | Maintenance | Expression identity, review attribution, search and catalogue UX fixes |
| 9 — Regional Agave Traditions | Feature/content | Evidence-backed tuxca, comiteco and destilado de pulque coverage |
| 10 — Regional Review & Fixes | Maintenance | Classification, map precision, incomplete-data and expansion regressions fixed |
| 11 — Plants, Process & Pairings | Feature | Deeper learning, label interpretation, serving guidance and food discovery |
| 12 — Learning Review & Fixes | Maintenance | Educational content presentation, navigation and accessibility fixes |
| 13 — Regional Depth & Spanish | Feature/content | Selected geographic depth and reviewed Spanish edition |
| 14 — Localization Review & Fixes | Maintenance | Bilingual search, layout, source consistency and mobile UX fixes |

Continue the same odd-feature/even-maintenance pattern for later work. If a feature is too large, split it into two feature deployments with a maintenance deployment between them. Urgent production fixes may ship immediately without cancelling the next planned maintenance review.

### Release 1 — Foundation on the Map

Goal: a small but complete public vertical slice that can be inspected on GitHub Pages.

- [ ] Create the repository shell, native ES modules, local JSON, shared DOM utilities, routing/state owner, and source registry.
- [ ] Implement only the schema and modules needed for this release; preserve extension points for later releases.
- [ ] Publish a responsive, local SVG of Mexico with the state list, selection summary, coverage legend, and honest uncovered states.
- [ ] Add a small researched seed: target 2–4 tequila/mezcal profiles, at least two distinct brands, and 4–8 actual expressions across those traditions. These are planning bounds, not reasons to fabricate content.
- [ ] Show brand and maker separately where documented, exact expression name, verified ABV/class/process facts, and a brief attributed summary of a real published tasting review for each seed bottle.
- [ ] Include welcome, spirit/profile browsing, visible bottle details and sources. Future functionality must not appear as broken controls.
- [ ] Use stable query/hash routes that reload on GitHub Pages; preserve valid links and handle invalid routes gracefully.
- [ ] Build safe data loading, clear essential-data errors, separate optional enrichment failure, strict reference URL validation, and text-safe rendering.
- [ ] Establish charcoal/cream, agave green/blue, terracotta/copper visual identity and a discreet ragdoll motif with readable typography and touch targets.
- [ ] Set up `npm run validate`, schema/reference checks, focused DOM/security checks, and CI.
- [ ] Configure GitHub Pages deployment from a validated artifact with repository-subpath-safe asset URLs. Record map licensing/provenance and cache versioning.
- [ ] Verify the deployed site from a fresh browser session and publish release notes identifying its limited seed coverage.

Acceptance: the Pages URL loads real content; a user can choose a covered state, open a profile and bottle, read a genuine attributed review summary, follow its sources, and reload a shared route. Inspect phone/tablet layout and keyboard behavior. No placeholder citations or invented taste claims may ship.

### Release 2 — Foundation Review & Fixes

Apply the mandatory maintenance protocol below. Focus on module boundaries, schema clarity, route hydration and Back/Forward, relative asset paths, exclusive views, small map targets, text contrast, scrolling and focus. Implement identified fixes, rerun checks, and deploy the corrected foundation before Release 3.

### Release 3 — Four Traditions

- [ ] Add bacanora and raicilla with a modest number of sourced profiles, makers and reviewed expressions.
- [ ] Expand tequila/mezcal only where evidence supports useful contrasts; target roughly 10–16 total profiles and 20–30 expressions across the four traditions.
- [ ] Add basic search over spirits, plants, places, producers, brands and bottles; normalize accents/case and support curated aliases.
- [ ] Expand profile detail: plant/process context, character, brief beginner explanations, notable bottles and directly accessible references.
- [ ] Distinguish spirit-specific legal category/class terms and editorial profile grouping.
- [ ] Preserve selected map/list context when navigating to a profile and back.

Acceptance: all four traditions are discoverable by place and name; published bottle taste summaries have expression-matched review evidence. No region automatically assigns smoke or sweetness.

### Release 4 — Explorer Review & Fixes

Apply the maintenance protocol. Focus on overlapping state coverage, map/list consistency, aliases, duplicate results, producer versus brand identities, source visibility, optional-data failures and small-screen profile readability. Deploy fixes before comparison work.

### Release 5 — Find Your Flavor

- [ ] Add two- or three-profile comparison with explicit remove/replace controls, retained selections and an optional biggest-differences view.
- [ ] Use disclosed editorial sensory dimensions: smoke, herbal/vegetal, fruit/floral, perceived sweetness, pepper/spice, body, oak and finish. Avoid excessive precision.
- [ ] Keep ABV as a factual property; perceived sweetness is not measured sugar and smoke is not peat content.
- [ ] Add flavor moods and “If you like this, try…” explanations derived from supported profile attributes.
- [ ] Allow cross-tradition comparison, displaying plant/process differences clearly.
- [ ] Handle missing sensory data explicitly; no unknown-as-zero scores or recommendations based on incompatible evidence.
- [ ] Test explanation invariants with deterministic fixtures rather than requiring an accidental current ranking.
- [ ] Preserve focus after Add/Remove and target only visible search controls with shortcuts.

Acceptance: comparison is explicitly between editorial profiles; choosing a bottle does not turn profile scores into bottle measurements. Users can complete the workflow by touch and keyboard without losing focus or selections.

### Release 6 — Comparison Review & Fixes

Apply the maintenance protocol. Audit comparison state, deduplication, slot promotion, missing data, mood predicates, explanation truthfulness, focus, live announcements, and persistent navigation. Fix and deploy before catalogue expansion.

### Release 7 — Brands, Bottles & Reviews

- [ ] Expand the canonical catalogue incrementally; a tentative 60–100 expressions is an editorial planning range, not a completion quota.
- [ ] Retain brands, actual producers and exact expressions as separate linked entities, supporting multiple makers and material batch/version differences.
- [ ] Add full catalogue search, exact-expression prioritization, curated spelling variants and context-preserving result navigation.
- [ ] Add “See more bottles” beneath curated notable bottles for a contextual alphabetical list, and “Browse all brands” for the wider directory.
- [ ] Show expression facts and review-based tasting notes with direct attribution and accessible references.
- [ ] Add an optional short, sourced editorial note explaining how an expression fits or differs from its reference profile; prefer “less smoky than this profile” to an undefined “less smoky than typical”.
- [ ] Store the compared profile ID and review dependencies so profile edits trigger note reassessment.
- [ ] Allow factual catalogue entries without adequate review/profile coverage, visibly labeled “Tasting notes not yet documented” and/or “Profile not yet covered”. Do not invent character or borrow profile scores.
- [ ] Make disclosures semantic and keyboard accessible; ensure list expansion is usable on iPhone/iPad.

Acceptance: reviewers' impressions, producer facts and the app's synthesis remain distinguishable. All published sensory claims are supported for the actual expression/version. Review scores are never converted into smoke, sweetness or quality rankings for the app.

### Release 8 — Catalogue Review & Fixes

Apply the maintenance protocol. Audit duplicate/ambiguous bottle names, batch matching, maker attribution, source integrity, evidence gaps, mobile list density, alphabetical ordering and focus after expansion. Deploy corrections before adding traditions.

### Release 9 — Regional Agave Traditions

- [ ] Research and add a small sourced set of tuxca, comiteco and destilado de pulque profiles and expressions [S7–S9]. If one lacks adequate evidence, explicitly defer it while shipping the supported subset.
- [ ] Preserve actual label/tradition identities; do not imply every regional name has the same legal status as tequila or mezcal.
- [ ] Clearly disclose verified non-agave fermentable ingredients in agave-based traditions, particularly comiteco; keep a 100%-agave attribute distinct from eligibility for this app.
- [ ] Explain cooked-heart versus sap-derived production without inferring universal taste from either process.
- [ ] Add documented regional aliases and verified map locations. Record approximate coordinates honestly.
- [ ] Maintain a backlog of unmatched agave expressions and missing profiles; prioritize substantive differences rather than filled map areas.
- [ ] Continue reviewing exact products even when a broad tradition is already covered.

Acceptance: expanded traditions pass the same data, review, map and UX gates as existing content. Fermented pulque and non-agave spirits cannot enter the spirit catalogue through aliases or ambiguous names.

### Release 10 — Regional Review & Fixes

Apply the maintenance protocol. Focus on plant/common-name ambiguity, mixed fermentables, protected versus cultural names, source dates, map precision, uncovered expressions and recommendation regressions. Deploy evidence and UX corrections.

### Release 11 — Plants, Process & Pairings

- [ ] Add plant pages with regional common names, scientific identity where established, uncertainty, and linked profiles/bottles.
- [ ] Expand cooking, fermentation, distillation, glass resting, wood maturation and filtration explanations with sourced illustrations or diagrams.
- [ ] Explain pechuga, ensamble, cristalino, category/class, producer identifiers and batch labels in their proper contexts.
- [ ] Separate plant growth from spirit maturation; avoid universal age-to-flavor ladders or “older is better” claims.
- [ ] Add concise serving guidance, optional cocktail suitability, food pairings and curated food aliases.
- [ ] Attribute histories and maker knowledge. Sustainability/additive claims require specific evidence and dates, not assumptions from wild harvest or artisanal branding.

Acceptance: guides link to actual examples and show references where claims appear. Food suggestions remain optional editorial guidance; educational descriptions do not guarantee flavor from geography, species or age.

### Release 12 — Learning Review & Fixes

Apply the maintenance protocol. Review cognitive load, jargon, panel length, source discoverability, semantic headings, mobile reading, keyboard navigation and guide-to-profile routing. Correct evidence inconsistencies and deploy refinements.

### Release 13 — Regional Depth & Spanish

- [ ] Expand selected agave regions based on the documented coverage backlog and available expression reviews.
- [ ] Add municipality/community or producer detail only where location evidence supports it.
- [ ] Consider a separate designation layer only after validating operative declarations, amendments and matching geographic geometry.
- [ ] Publish reviewed Spanish UI and learning copy with bilingual search aliases and appropriate alphabetical behavior.
- [ ] Keep locale separate from stable entity IDs and routes; define translation fallback and disclose untranslated content.

Acceptance: all language variants preserve source meaning and expression identity. Legal-area layers carry verification dates and never imply that every producer inside a polygon is certified.

### Release 14 — Localization Review & Fixes

Apply the maintenance protocol. Audit Spanish terminology, translated layouts, search, sorting, missing translations, route stability, mobile readability and accessibility. Deploy fixes and establish the next feature/maintenance pair from the backlog.

### Mandatory protocol for every maintenance release

A maintenance release is implementation and deployment, not a findings-only report.

1. Review the latest deployed commit and changes since the prior maintenance release; also inspect affected adjacent modules and real user journeys.
2. Review code quality: responsibilities, duplicated logic, state ownership, data contracts, errors/timeouts, security, dependencies, performance and maintainability. Refactor only where there is a concrete benefit.
3. Review UX/design on deployed Pages: iPhone/iPad Safari, desktop mouse/keyboard, navigation/history, focus, touch targets, typography/contrast, content density, loading/empty/error states and screen-reader behavior.
4. Review data integrity and source presentation, including exact bottle/review matching and misleading editorial claims.
5. Record prioritized findings with reproduction, severity and scope in a dated review document. Distinguish confirmed defects, improvements and unverified concerns.
6. Implement confirmed bugs and justified code/UX improvements. No unrelated feature expansion or cosmetic rewrite without a demonstrated need.
7. Add focused regression tests for changed behavior, run validation, and repeat the affected manual flows. Never mark native Safari or VoiceOver checks passed if only DOM tests ran.
8. Deploy the maintenance fixes; verify the public Pages URL, cache refresh, deep links and corrected workflows. Record commit/tag, results and remaining limitations.
9. Close resolved findings and explicitly defer non-blocking items with reasons. Resolve release blockers before the next feature release.

If review finds no defect, document the evidence and assess concrete robustness/usability improvements. Never manufacture a bug or make meaningless edits merely to create a fix commit; record a verified maintenance deployment honestly. Routine feature releases must also pass quality gates—maintenance is additional scrutiny, not permission to ship known defects.

## 5. Editorial and sourcing policy

| Claim | Evidence to prefer |
| --- | --- |
| Protected name, permitted geography, category/class | Official declarations, standards and amendments; regulator explanations as supporting material |
| Botanical identity | Authoritative botanical/agronomic sources; preserve local-name uncertainty |
| Expression ABV, age, maker, plant, process | Exact label, producer technical information, or documented batch information |
| Taste, texture, finish | Named independent specialist reviews, preferably two relevant accounts |
| Difference from the app's profile | Clearly identified editorial synthesis against that profile |
| Process causing a specific flavor | Suitable technical evidence; do not infer mechanism from a tasting note alone |
| Historical or sustainability claims | Specific credible historical/research documentation and scoped producer evidence |

- Assess individual review quality, authorship, methods, dates, commercial/sample disclosures, and exact expression match. A famous website is not blanket authority.
- Evaluate agave-specialist reviewers during implementation. Whiskey reviewers may contribute relevant reviews, but their whisky reputation alone does not establish expertise for every Mexican spirit.
- Community ratings are discovery leads, not sole evidence for production facts or comparative flavor notes.
- Repeated retailer/producer copy is one underlying account, not independent corroboration.
- Paraphrase in original language and link to the actual supporting page. Keep source text distinct from editorial inference.
- Soften, attribute, or omit notes when credible reviewers disagree; do not disguise disagreement with precise-looking scores.
- Distinguish “not verified” from “false” and “not certified”. Do not make authenticity accusations from missing data.
- A registry identifier does not establish that different brands share an identical recipe or flavor.
- Store verification dates for regulations, source coverage, and changeable expression details. Check amendments and current scope before shipping legal summaries.
- Resolve contradictions in primary summaries against authoritative texts. Even official explanatory websites can contain inconsistencies.

### Research starting points

These were consulted during planning on 2026-10-20. They are starting evidence, not a complete legal or botanical audit and not an exhaustive current designation list. Recheck their scope and any later amendments during implementation.

- **[S1] Scope exclusion — Sotol / Dasylirion:** [PROFEPA botanical discussion](https://www.gob.mx/profepa/articulos/el-sotol-y-la-pata-de-elefante-especies-protegidas-por-la-ley?idiom=es), with [CONAFOR's Dasylirion leiophyllum management resource](https://www.gob.mx/conafor/documentos/mejores-practicas-de-manejo-y-ecuaciones-alometricas-de-biomasa-de-dasylirion-leiophyllum-en-el-estado-de-chihuahua). Botanical sources should guide taxonomy rather than older regulatory family names.
- **[S2] Bacanora:** [Consejo Sonorense Regulador del Bacanora](https://www.sonora.gob.mx/gobierno/estructura-organizacional/item/consejo-sonorense-regulador-del-bacanora). The official summary describes protection across 35 Sonoran municipalities; obtain the operative declaration and scope before implementing legal polygons.
- **[S3] Raicilla:** [IMPI designation announcement](https://www.gob.mx/impi/prensa/el-impi-protege-a-la-raicilla-como-denominacion-de-origen-207026?idiom=es-MX) and [official declaration](https://sidof.segob.gob.mx/notas/docFuente/5564454).
- **[S4] Tequila:** [CRT overview](https://www.crt.org.mx/en/our-tequila/). It distinguishes the two categories and classes, but its English page contains inconsistent reposado aging statements; verify precise requirements against the operative NOM rather than copying the summary.
- **[S5] Mezcal:** [NOM-070-SCFI-2016 official publication](https://sidof.segob.gob.mx/notas/docFuente/5472787) and [Secretaría de Economía standards record](https://platiica.economia.gob.mx/normalizacion/NOM-070-SCFI-2016/). Check subsequent modifications and effective dates before implementing exact rules.
- **[S6] Geographic geometry:** [INEGI Marco Geoestadístico](https://www.inegi.org.mx/programas/mg/default.html) and [official geographic identifier catalogue](https://www.inegi.org.mx/servicios/catalogounico.html). Statistical geography is an input to a locator map, not itself a declaration of spirit-designation boundaries.


### Required review provenance for bottles

- Store review records with stable ID, exact expression ID, reviewed batch/version where available, reviewer, publication, direct URL, review date when known, date checked, and a concise original-language paraphrase of supported observations.
- Do not manufacture missing authors, dates or batch information. Record unknowns explicitly and qualify whether an older or unspecified-batch review is applicable.
- Require at least one actual expression-matched published tasting review for every published review-based tasting summary; prefer two independent accounts for comparative claims. A producer tasting note alone is not an independent review.
- Distinguish producer notes, reviewer observations and editorial synthesis in data and UI. If evidence disagrees, attribute the difference or omit the conclusion.
- Use reputable specialist reviews and relevant established spirits publications after checking their methods/disclosures; community comments can supplement, not automatically establish consensus.
- Factual-only catalogue entries may remain searchable with an explicit evidence gap. They do not receive fabricated scores, tasting notes or unsupported recommendations.
- Check rights before storing images or substantial excerpts. Prefer original short paraphrases with links; never reproduce full reviews or scrape sites at app runtime.

Additional research references:

- **[S7] Tuxca:** [SECTUR Colima regional document](https://sistemas.sectur.gob.mx/SECTUR/2024/DGIPT/20240409/Colima_CT_SECTUR.pdf), identifying tuxca as a local agave distillate. This supports research candidacy, not a complete definition or tasting profile.
- **[S8] Comiteco:** [Official declaration for Comiteco de Comitán, Chiapas](https://sidof.segob.gob.mx/notas/docFuente/5769331), describing maguey comiteco and cane sugars. Verify current scope and exact product composition when implementing.
- **[S9] Destilado de pulque:** [Agricultura's Hidalgo distillers event](https://www.gob.mx/agricultura/es/agenda/segundo-encuentro-de-destiladores-de-pulque-de-hidalgo?idiom=es). Establishes the tradition as a research candidate; bottle claims still require expression-specific documentation and reviews.

## 6. Shared release gates and operations

### Automated validation

- [ ] One `npm run validate` command covers JavaScript syntax, data/schema/reference validation, relevant CSS checks, DOM behavior, and security hardening.
- [ ] Validate legal terminology per spirit, plant genus references, expression/profile mappings, source IDs, sensory ranges, map feature IDs, and uncovered states.
- [ ] Reject unsafe source URLs and test text injection through content fields.
- [ ] Test direct links, reload, invalid routes, Back/Forward, exclusive main views, and comparison state preservation.
- [ ] Test missing essential data versus failed optional enrichment separately; optional failures must not disable core browsing.
- [ ] Test deterministic recommendation explanations and meaningful search behavior, not accidental current rankings.
- [ ] Verify cache keys and run validation in CI before merging each release.

### Manual acceptance

- [ ] iPhone and iPad Safari: map/list equivalence, small target access, scrolling, search, disclosure, profile, history, and comparison.
- [ ] Desktop: mouse and keyboard navigation, visible focus, shortcuts, modal behavior if used, and removal of selections.
- [ ] VoiceOver: labels, selection state, headings, announcements, disclosures, and focus after view/result changes.
- [ ] Readability under text enlargement and reduced-motion preferences; avoid meaning conveyed only by color.
- [ ] Directly inspect published GitHub Pages assets, paths, references, and cache refresh after deployment.
- [ ] Audit the release's changed content against source evidence and list its coverage limits.

### Maintenance contract

- Record the dataset version and an honest “content last reviewed” date; do not imply live verification.
- Keep source checks and content edits reviewable in git. Link checking can be a maintainer command; a reachable URL does not prove a claim is supported.
- Preserve stable IDs and provide redirects/migrations for renamed or retired profiles.
- Review dependents when profile wording, plant identity, expression mapping, or sensory assessments change.
- Document rollback by release tag and keep deployment simple. Avoid a service worker until offline support is an explicit requirement with a tested update strategy.
- Do not collect search histories or add analytics merely to discover gaps; the curated catalogue already supplies a coverage backlog.

## 7. Definition of completion and deployment handoff

Release 1 is complete only when its GitHub Pages URL is inspectable and the foundation acceptance criteria pass. Later releases add only their scheduled functionality/content, followed by the mandatory maintenance deployment. No implementation milestone is complete merely because code exists in a branch.

For each release, record:

- Release number/name, feature or maintenance type, and deployed version/tag/commit.
- Public Pages URL and deployment verification time.
- Completed scope, data/review coverage, validation results, and manual environments actually checked.
- Remaining issues, explicitly deferred content, and rollback reference.
- For maintenance: findings, implemented fixes, and evidence that the deployed behaviors improved.

This file is the agreed plan for `RagdollLabs-agave-guide`; it does not create the repo, publish a site, or certify any listed bottle content. Implementers must source and verify the actual expressions before publication.
