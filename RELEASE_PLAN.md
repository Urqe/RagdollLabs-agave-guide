# RagdollLabs Agave Guide — Release Plan

Status: release roadmap; current implementation/deployment progress must be checked in the repository.  
Updated: 2026-10-21  
Confirmed repository name: `RagdollLabs-agave-guide`  
Product subtitle: **Explore Mexico’s agave spirits**

## Implementation priority — small, profile-first foundation

This section supersedes any earlier broad research targets. Execute only the requested release, not the entire roadmap.

- **Release 1 contains exactly two profiles: one bounded tequila style and one bounded mezcal style, with exactly one example bottle per profile (two bottles total).** Do not describe either example as representative of every tequila or mezcal.
- The main product is the style profile: body, a few useful taste notes, smoke where relevant, and finish. The bottle is a small supporting example, not the subject of a detailed research dossier.
- Build and deploy the structure first: Mexico map/list, navigation, profile layout, example-bottle placement, sources and responsive behavior. Catalogue breadth, bottle detail pages, comparison, advanced search and encyclopedic education are later work.
- If an implementation already exists, inspect and adapt it. Preserve useful existing work; stop further content expansion and use the two seed profiles to assess the first-version structure. Do not restart from scratch or delete established data merely to meet the seed count.
- **After deploying Release 1, stop and present its GitHub Pages URL for the owner's inspection. Do not begin Release 2 until the owner has reviewed the first version's structure and explicitly authorized proceeding.** Record structural feedback as input to the maintenance release. Do not claim this approval based on automated tests.

### Bounded research and loop-prevention rules

- One suitable general style reference per profile is sufficient for a concise editorial style summary. Reuse sources that cover both profiles where appropriate.
- For each example bottle, use one producer page for basic identity and one credible published review for a short attributed tasting note. One review is sufficient; a second is optional only to resolve a material contradiction affecting published text.
- Cap research at **five minutes per example bottle and twenty minutes total for Release 1 content**. These are stopping limits, not time to spend unnecessarily. Once sufficient evidence is available, write the content and return to implementation.
- If a page fails, try one alternative. Do not repeatedly retry the same blocked source or reformulate the same search indefinitely. Allow at most one replacement candidate per profile within the same time budget.
- If evidence is still insufficient, omit optional claims and report the specific gap. Finish all independent structure work; do not invent tasting notes or silently continue researching beyond the cap.
- No exhaustive reviewer-method audit, consensus search, batch genealogy, chemistry research, certification investigation, or legal-boundary research for the foundation. If a nonessential claim needs that effort, omit it and put it in the backlog.
- Record only readily available source title/publication, link, and review date/author when visible. Missing optional metadata is not a blocker. Never invent it.
- Keep a short completion checklist. Once a criterion passes, do not reopen it without a concrete failure, changed requirement, or new contradictory evidence. After relevant checks pass, deploy and hand off.

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

1. Open a style profile, understand its body and taste notes, and see one recognizable bottle as an example; broader bottle search is a later journey.
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

Keep modules small enough to test their contracts. Add modules when their release needs them rather than scaffolding every future feature in advance. The table below describes the eventual logical model, not files that must all be implemented for Release 1. The foundation may use a small profiles dataset with stable brand/bottle IDs and inline source references; split out additional entities when actual features need them.

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
| 15 — Interconnected Content Model | Feature | Normalized plant, region, tradition, method and expression entities with validated cross-references |
| 16 — Model Review & Fixes | Maintenance | Data-contract, relationship and editorial-consistency corrections from Release 15 |
| 17 — Three Discovery Paths | Feature | Explore by Plant, by Region and by Spirit, plus flavour-based discovery |
| 18 — Discovery Review & Fixes | Maintenance | Map/region clarity, search, contextual navigation and mobile discovery UX fixes |
| 19 — Progressive Learning Journey | Feature | Reorganized Learn chapters with contextual glossary and completed Spanish learning content |
| 20 — Learning Journey Review & Fixes | Maintenance | Chapter flow, jargon, link integrity, translation completeness and accessibility fixes |
| 21 — Richer Profiles | Feature | Dedicated plant and spirit-tradition pages, redesigned expression profiles, related-content navigation |
| 22 — Profile Review & Fixes | Maintenance | Profile hierarchy, cause-and-effect evidence, cross-link context and back-navigation fixes |
| 23 — Comparison Intelligence | Feature | Plain-language comparison summaries, meaningful comparison perspectives, refined recommendations |
| 24 — Comparison & Navigation Review & Fixes | Maintenance | Comparison interpretation, recommendation relevance, contextual navigation and focus fixes |
| 25 — Editorial Enrichment & Bottle Depth | Feature/content | Expanded representative plant/region/tradition coverage, deeper production history and sustainability content, improved bottle linkage |
| 26 — Editorial Standards Review & Fixes | Maintenance | Evidence quality, sensory-claim discipline, bilingual parity and coverage-scope consistency fixes |

Continue the same odd-feature/even-maintenance pattern for later work. If a feature is too large, split it into two feature deployments with a maintenance deployment between them. Urgent production fixes may ship immediately without cancelling the next planned maintenance review.

### Release 1 — Foundation on the Map

Goal: verify the app structure on GitHub Pages with two style profiles and one example bottle per profile. Prioritize layout and navigation over research depth.

- [ ] Create the repository shell, native ES modules, local JSON, shared DOM utilities, routing/state owner, and source registry.
- [ ] Implement only the schema and modules needed for this release; preserve extension points for later releases.
- [ ] Publish a responsive, local SVG of Mexico with the state list, selection summary, coverage legend, and honest uncovered states.
- [ ] Add exactly two seed profiles, one tequila style and one mezcal style, with exactly one example bottle each. No additional brands/bottles or profiles in the foundation scope.
- [ ] Make each profile the visual focus: short style description, body (light/medium/full), 3–5 taste descriptors, smoke level where relevant, and a short finish description. Present these as editorial style guidance; no precise numerical scoring is required yet.
- [ ] Beneath it, show one compact “Example bottle” row/card: brand, exact expression, optional readily verified ABV, one attributed tasting sentence and source links. Omit unnecessary production details and unavailable maker/batch metadata. Do not build a standalone bottle detail view.
- [ ] Keep the general style description distinct from the example review: a single bottle review supports that example, not universal claims about the whole tradition.
- [ ] Include welcome, map/list-to-profile browsing, compact example-bottle cards and sources. Do not implement catalogue browsing, search, comparison or learning features before their planned release; future functionality must not appear as broken controls.
- [ ] Use stable query/hash routes that reload on GitHub Pages; preserve valid links and handle invalid routes gracefully.
- [ ] Build safe data loading, clear essential-data errors, separate optional enrichment failure, strict reference URL validation, and text-safe rendering.
- [ ] Establish charcoal/cream, agave green/blue, terracotta/copper visual identity and a discreet ragdoll motif with readable typography and touch targets.
- [ ] Set up `npm run validate`, schema/reference checks, focused DOM/security checks, and CI.
- [ ] Configure GitHub Pages deployment from a validated artifact with repository-subpath-safe asset URLs. Record map licensing/provenance and cache versioning.
- [ ] Verify the deployed site from a fresh browser session and publish release notes identifying its limited seed coverage.

Acceptance: the Pages URL loads the two profiles; a user can choose a covered state, open a profile, understand its body and taste, see its single example bottle and references, and reload a shared route. Verify layout, navigation and keyboard behavior using available environments and report manual checks still needed. No invented claims or placeholder citations. Hand off the URL and stop for owner inspection before Release 2.

### Release 2 — Foundation Review & Fixes

Entry gate: the owner has inspected the deployed first version and explicitly authorized Release 2. Incorporate that structural/UX feedback first.

Apply the mandatory maintenance protocol below. Focus on module boundaries, schema clarity, route hydration and Back/Forward, relative asset paths, exclusive views, small map targets, text contrast, scrolling and focus. Implement identified fixes, rerun checks, and deploy the corrected foundation before Release 3.

### Release 3 — Four Traditions

- [ ] Add one bacanora profile and one raicilla profile, each with exactly one example bottle. Target four profiles/four example bottles total after this increment.
- [ ] Keep the focus on body and taste notes; defer extra tequila/mezcal variants and additional bottles. Use the same bounded research workflow for the new examples.
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

- [ ] Introduce catalogue functionality using existing examples and add at most 2–5 bottles in this release. There is no total-catalogue quota. Broader growth happens in later explicitly requested content increments.
- [ ] Keep one featured example per profile by default; additional bottles live behind the optional expansion controls. Retain profile-first visual hierarchy.
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

- [ ] Add at most one profile and one example bottle each for tuxca, comiteco and destilado de pulque [S7–S9]. Use bounded research; defer a difficult tradition rather than delaying the supported subset or investigating indefinitely.
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

## 4.1 Content architecture and UX roadmap — Releases 15–26

The releases below respond to the Agave Guide content architecture and UX improvement review. They transform the guide from a collection of individual spirit profiles into an interconnected, bilingual educational atlas of Mexican agave spirits and related traditional Mexican spirits serving both beginners and enthusiasts. The guide should answer three questions for every user: what am I drinking, why does it taste this way, and what should I explore next.

Editorial rules that apply to every release in this roadmap:

- Preserve the existing visual identity, bilingual support, lightweight static architecture, and source-backed editorial approach.
- Structure content around five interconnected entities: plants, regions, spirit traditions, production methods, and spirit expressions. Entities reference each other by stable identifiers with many-to-many relationships; never duplicate descriptions across files. Never treat botanical common names as globally unique identifiers.
- Maintain clear separation between legally defined categories, regional/cultural traditions, editorially defined style profiles, documented production methods, representative sensory impressions, and bottle-specific facts. A style profile never implies every bottle tastes identical; a bottle-specific note is never universalized.
- Keep unknown information explicitly unknown; never infer it into a numerical value.
- Distinguish established historical facts, contemporary practices, legal requirements, and editorial interpretation in the presentation.
- Include non-agave plants such as sotol's Dasylirion with correct botanical classification, without misclassifying them as agaves; keep the catalogue's agave-based eligibility rules intact.
- Preserve existing profile URLs wherever possible; provide redirects for any moved content.
- Extend validation to cover valid cross-entity relationships, missing references, duplicate identifiers, missing translations, invalid navigation destinations, unsupported comparison attributes, undocumented sensory claims, broken source references, and search aliases.

### Release 15 — Interconnected Content Model

Goal: establish the normalized five-entity content model without a major interface redesign. Migrate existing content without losing information or breaking current routes.

- [x] Define stable identifiers and explicit many-to-many relationships for plants, regions, spirit traditions, production methods, and spirit expressions. One plant may serve multiple traditions; one expression may use multiple plants.
- [x] Migrate the existing profiles, places, spirits, plants, processes, bottles and sources data into the normalized entities without losing information; preserve existing profile URLs and provide redirects where paths change.
- [x] Record per-entity editorial structure: plants (botanical identity, regional names, cultivation, distribution, sensory tendencies where supported, sustainability, botanical uncertainty), regions (state/subregion, geography, traditions, plants, methods, legal-versus-cultural distinctions), spirit traditions (origin, history, legal status, materials, practices, diversity), production methods (harvest through finishing), and expressions (tradition + region + plant composition + production style + sensory + related expressions).
- [x] Separate identity, typical characteristics, and bottle-specific facts into distinct data structures so no later release can render a bottle note as a universal trait.
- [x] Add validation for cross-entity relationships, missing references, duplicate identifiers, and editorial consistency (no unsupported sensory claims, no misclassified non-agave plants).
- [x] No new interface redesign in this release; existing views continue to work against the new model.

Acceptance: all existing content, routes and features work unchanged against the normalized model; validation passes; no duplicated descriptions across data files.

### Release 16 — Model Review & Fixes

Apply the maintenance protocol. Audit entity boundaries, relationship cardinality, identifier stability, migration fidelity, data contracts and the new validation rules. Refactor only with concrete benefit; deploy corrections before adding new discovery surfaces.

### Release 17 — Three Discovery Paths

Goal: provide three equally accessible exploration entry points plus flavour-based discovery, all feeding the same interconnected content.

- [x] Explore by Plant: browse agave species and other relevant plants, search botanical and regional common names, see distinguishing characteristics, where each plant is used, associated traditions, and linked regional expressions; support comparing expressions from the same plant.
- [x] Explore by Region: Mexico map or accessible region list with state and relevant subregion selection, regional production traditions, local plants and methods, representative expressions. Clearly distinguish application coverage from legally defined production territories.
- [x] Explore by Spirit: browse tequila, mezcal, bacanora, raicilla and other represented traditions with approachable introductions, distinguishing characteristics, regional/production diversity, and links to representative expressions and bottles.
- [x] Flavour-based discovery: approachable categories (fresh and herbal; fruity and floral; smoky and earthy; peppery and spicy; rich and oak-influenced; unusual and adventurous) reusing existing sensory metadata; show short explanations of why each expression matches; never promise every bottle in a tradition exhibits the selected characteristics.
- [x] Improve search across all three paths and strengthen contextual navigation between plants, regions, traditions and expressions.
- [x] Keep touch, keyboard and screen-reader access equivalent across all paths; no dead ends requiring a return to the homepage.

Acceptance: a user can start from a plant, a region, or a spirit and reach meaningful related content; all three paths use the same underlying data.

### Release 18 — Discovery Review & Fixes

Applied (see Release 18 notes in RELEASE_NOTES.md). Audit map coverage-versus-designation labelling, region list accessibility, plant search aliases, flavour-category explanations, result navigation, state preservation and mobile layouts. Deploy corrections.

### Release 19 — Progressive Learning Journey

Goal: reorganize Learn into a progressive educational journey with contextual glossary and completed Spanish learning materials.

- [x] Restructure Learn into seven progressive, non-sequential chapters: 1) Discover Mexican Spirits (traditions, similarities, differences; agave versus related non-agave spirits), 2) Meet the Plants (species, regional names, cultivation, harvest; linked plant profiles), 3) From Plant to Glass (production sequence, why each stage matters, sap-derived exceptions), 4) Understanding Flavour (aroma vs taste, body, sweetness, smoke, vegetal/herbal, fruit/floral, spice, oak, finish; with real profile examples), 5) Understanding Labels (denominations, classes, NOM and certification, agave species, producer info, ABV, batch, marketing terms; category-specific rules never universalized), 6) Choosing and Enjoying (preference-based selection, serving, glassware, tasting technique, pairings; no price/age/rarity/ABV-as-quality claims), 7) Explore Deeper (botanical, regional, historical, equipment, terminology, sustainability and regulatory reference material).
- [x] Each chapter begins with a short explanation, progresses basic to advanced, uses approachable language, links to real examples, and offers optional deeper explanations for enthusiasts.
- [x] Add contextual glossary explanations linked from educational content and profiles.
- [x] Do not require sequential completion; preserve direct access to glossary and reference sections.
- [x] Complete Mexican Spanish coverage of all learning materials with natural (non-literal) translation; add validation to detect missing translations.

Acceptance: a beginner can understand the fundamentals from the chapters alone; core learning content is usable without English; existing reference access is preserved.

### Release 20 — Learning Journey Review & Fixes

Applied (see Release 20 notes in RELEASE_NOTES.md). Audit chapter flow, jargon, example links, glossary wiring, Spanish learning parity, mobile reading, keyboard navigation and cognitive load. Deploy corrections.

### Release 21 — Richer Profiles

Goal: upgrade profile pages into the full educational experience for plants, traditions and expressions.

- [x] Dedicated plant profile pages with the structure: identity (scientific and common names, illustration where reliable), at a glance, where it grows, harvesting and production, characteristics (qualified sensory tendencies), regional expressions, sustainability, further reading. Never assume a universal sensory profile or silently merge disputed local names; distinguish cultivated from wild-harvested where evidence supports it.
- [x] Dedicated spirit tradition pages: what it is, origin, history and cultural significance, materials, traditional production, distinguishing traits, legal status, regional variations, beginner starting points, and expressions for exploration. Use plain introductory language with optional technical depth.
- [x] Redesign expression profiles into the layout: identity; what makes this expression special (visible, not hidden); character in the glass (body, smoke, herbal/vegetal, fruit/floral, sweetness, spice, oak, finish with contextual terminology); why does it taste this way (evidence-based cause-and-effect across plant, environment, cooking, fermentation, distillation, ageing — never deterministic); how to enjoy it; example bottles; explore next (same plant different region, same tradition different method, similar character, more adventurous alternative); technical details and sources in expandable sections.
- [x] Strengthen related-content navigation with short explanations of why each destination is relevant and a clear way back.
- [x] Retain existing sensory comparisons, tasting notes, example bottles, pairing guidance and source attribution.

Acceptance: every documented expression explains its character and the influences behind it; beginners get the essentials immediately while enthusiasts reach technical depth on demand.

### Release 22 — Profile Review & Fixes

Applied (see Release 22 notes in RELEASE_NOTES.md). Audit profile hierarchy, cause-and-effect evidence for every "why it tastes this way" claim, editorial-restriction compliance on plant pages, related-content relevance and back navigation, focus order, and disclosure behaviour. Deploy corrections.

### Release 23 — Comparison Intelligence

Goal: make comparisons explain meaningful differences rather than merely displaying scores.

- [x] Add a concise plain-language interpretation above the detailed comparison, explaining the primary differences and possibly why.
- [x] Support meaningful comparison perspectives: same plant different region; same tradition different plant; same tradition different production method; similar flavours across traditions; unaged versus wood-rested.
- [x] Where evidence cannot support a distinction, state it rather than manufacturing one; keep the existing explicit treatment of undocumented attributes.
- [x] Refine related-expression recommendations (same plant/region/method/sensory threads) with short relevance explanations.

Acceptance: comparisons communicate what differs and why, respecting uncertainty; no invented distinctions.

### Release 24 — Comparison & Navigation Review & Fixes

Applied (see Release 24 notes in RELEASE_NOTES.md). Audit comparison summary accuracy, perspective support, recommendation relevance and determinism, cross-link context preservation, and focus after view changes. Deploy corrections.

### Release 25 — Editorial Enrichment & Bottle Depth

Goal: deepen coverage where it adds educational value, prioritizing evidence quality over catalogue size.

- [x] Expand representative plant, region and spirit tradition coverage; each new entry must add meaningful insight or improve discovery, not just quantity.
- [x] Add deeper production, historical and sustainability content with proper attribution; sustainability claims require specific dated evidence.
- [x] Improve bottle-specific information where credible documentation exists: brand, expression, actual producer, origin, classification, documented plant composition, production/batch details, ABV, bottle-specific tasting notes with disclosure when unavailable, and relationship to the style profile.
- [x] Link bottles to their plants, regions and traditions; keep the catalogue educational rather than commercial.
- [x] Keep application scope descriptions consistent with actual coverage, including non-agave spirits.

Acceptance: new content passes the same evidence and editorial gates as existing content; the catalogue remains distinct from editorial style profiles.

### Release 26 — Editorial Standards Review & Fixes

Applied (see Release 26 notes in RELEASE_NOTES.md). Audit evidence quality and provenance across the new entities, sensory-claim discipline, distinction between legal and cultural framing, Spanish/English parity across all new content, scope-description accuracy and discovery regressions. Deploy corrections and establish the next feature/maintenance pair from the backlog.

### Post-roadmap pair 1 — Comparison Maturation Perspective (maintenance over the content increments)

Applied (see the maintenance notes in RELEASE_NOTES.md). Audit of the four increments shipped after Release 26 (highland blanco profile, bottle depth, quiet-navigation UX, producer-note evidence tier). Confirmed defect fixed: wood-rested profiles of the same tradition (reposado vs añejo) shared identical processIds, so no comparison perspective fired even though maturation duration is the variable at play — added a structured `maturation` field to wood-rested profiles and a `differentMaturation` perspective with its evidence. Producer-note attribution discipline, ES parity, source integrity and search discoverability verified without defect.

### Post-roadmap pair 2 — Producer Catalogue Expansion (feature/content)

Applied (see the pair 2 notes in RELEASE_NOTES.md). Add the remaining expressions for the owner-requested producers (Don Julio, Jose Cuervo, Patrón, Casa Dragones): reposados, añejos, joven and plata expressions across the existing style profiles. Each expression needs exact label facts plus one expression-matched review, or the owner-approved producer-note tier with explicit attribution where no review exists. Maintain the honest-mapping gates: a bottle maps only to a profile whose region, tradition and class genuinely match.

### Post-roadmap pair 3 — Learning Journey Refresh (feature/content)

Applied (see the pair 3 notes in RELEASE_NOTES.md). Weave the newer content into the Learn chapters: the highland/valley terroir distinction (single-estate and vintage-dated tequila), glass-resting as a maturation method (comiteco), the wild-harvest sustainability picture (added with Release 25 but not yet part of the education flow), and the evidence-tier distinction the app now teaches by example — independent reviews vs producer notes vs editorial synthesis. Spanish parity required for all new chapter material.

### Post-roadmap pair 4 — Reviewed Spanish Localization (maintenance)

Applied (see the pair 4 notes in RELEASE_NOTES.md). A dedicated review pass of the accumulated editorial translations (bottle summaries, profile prose, sustainability sections, comparison perspectives) by a fluent reader: catch translation drift, anglicisms and inconsistent terminology; keep the per-section English disclosure behaviour intact. The UI has been bilingual since Release 14, but the editorial prose has never had a reviewed pass.

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
| General profile body/taste | One suitable style reference and clearly labeled concise editorial guidance |
| Example-bottle taste, texture, finish | One credible expression-matched review, attributed; a second is not routinely required |
| Difference from the app's profile | Clearly identified editorial synthesis against that profile |
| Process causing a specific flavor | Suitable technical evidence; do not infer mechanism from a tasting note alone |
| Historical or sustainability claims | Specific credible historical/research documentation and scoped producer evidence |

- Use a credible relevant publication and check that the review describes the intended expression. Inspect readily available authorship/date/disclosures without launching a separate investigation. No systematic reviewer audit is required.
- Prefer relevant agave/spirits reviews when easily available; choosing a reputable review does not require compiling or ranking review websites.
- Community ratings are discovery leads, not sole evidence for production facts or comparative flavor notes.
- Repeated retailer/producer copy is one underlying account, not independent corroboration.
- Paraphrase in original language and link to the actual supporting page. Keep source text distinct from editorial inference.
- Soften, attribute, or omit notes when credible reviewers disagree; do not disguise disagreement with precise-looking scores.
- Distinguish “not verified” from “false” and “not certified”. Do not make authenticity accusations from missing data.
- A registry identifier does not establish that different brands share an identical recipe or flavor.
- Store verification dates for regulations, source coverage, and changeable expression details. Check amendments and current scope before shipping legal summaries.
- Resolve contradictions in primary summaries against authoritative texts. Even official explanatory websites can contain inconsistencies.

### Research starting points

These were consulted during planning on 2026-10-20. They are starting evidence, not a complete legal or botanical audit and not an exhaustive current designation list. Consult only sources needed for claims in the current release. Research exact regulatory details or amendments when implementing those details, not as a prerequisite for a simple style card.

- **[S1] Scope exclusion — Sotol / Dasylirion:** [PROFEPA botanical discussion](https://www.gob.mx/profepa/articulos/el-sotol-y-la-pata-de-elefante-especies-protegidas-por-la-ley?idiom=es), with [CONAFOR's Dasylirion leiophyllum management resource](https://www.gob.mx/conafor/documentos/mejores-practicas-de-manejo-y-ecuaciones-alometricas-de-biomasa-de-dasylirion-leiophyllum-en-el-estado-de-chihuahua). Botanical sources should guide taxonomy rather than older regulatory family names.
- **[S2] Bacanora:** [Consejo Sonorense Regulador del Bacanora](https://www.sonora.gob.mx/gobierno/estructura-organizacional/item/consejo-sonorense-regulador-del-bacanora). The official summary describes protection across 35 Sonoran municipalities; obtain the operative declaration and scope before implementing legal polygons.
- **[S3] Raicilla:** [IMPI designation announcement](https://www.gob.mx/impi/prensa/el-impi-protege-a-la-raicilla-como-denominacion-de-origen-207026?idiom=es-MX) and [official declaration](https://sidof.segob.gob.mx/notas/docFuente/5564454).
- **[S4] Tequila:** [CRT overview](https://www.crt.org.mx/en/our-tequila/). It distinguishes the two categories and classes, but its English page contains inconsistent reposado aging statements; verify precise requirements against the operative NOM rather than copying the summary.
- **[S5] Mezcal:** [NOM-070-SCFI-2016 official publication](https://sidof.segob.gob.mx/notas/docFuente/5472787) and [Secretaría de Economía standards record](https://platiica.economia.gob.mx/normalizacion/NOM-070-SCFI-2016/). Check subsequent modifications and effective dates before implementing exact rules.
- **[S6] Geographic geometry:** [INEGI Marco Geoestadístico](https://www.inegi.org.mx/programas/mg/default.html) and [official geographic identifier catalogue](https://www.inegi.org.mx/servicios/catalogounico.html). Statistical geography is an input to a locator map, not itself a declaration of spirit-designation boundaries.


### Required review provenance for bottles

- For the foundation, store the example expression, source link/publication and a short attributed paraphrase. Author/date are optional when readily visible. Rich review records and batch/version fields are later catalogue capabilities; do not research missing metadata to populate them.
- Do not manufacture authors, dates or batch information. Avoid a visibly different expression/version; otherwise do not investigate batch differences unless a material mismatch is already evident.
- One actual expression-matched review is sufficient for an attributed example-bottle tasting summary. No routine cross-verification of every descriptor. Profile-relative comparisons are optional later content; omit them if support is unclear. A producer tasting note must not be presented as an independent review.
- Distinguish producer notes, reviewer observations and editorial synthesis in data and UI. If evidence disagrees, attribute the difference or omit the conclusion.
- Use reputable specialist reviews and relevant established spirits publications after checking their methods/disclosures; community comments can supplement, not automatically establish consensus.
- Factual-only catalogue entries may remain searchable with an explicit evidence gap. They do not receive fabricated scores, tasting notes or unsupported recommendations.
- Check rights before storing images or substantial excerpts. Prefer original short paraphrases with links; never reproduce full reviews or scrape sites at app runtime.

Additional research references:

- **[S7] Tuxca:** [SECTUR Colima regional document](https://sistemas.sectur.gob.mx/SECTUR/2024/DGIPT/20240409/Colima_CT_SECTUR.pdf), identifying tuxca as a local agave distillate. This supports research candidacy, not a complete definition or tasting profile.
- **[S8] Comiteco:** [Official declaration for Comiteco de Comitán, Chiapas](https://sidof.segob.gob.mx/notas/docFuente/5769331), describing maguey comiteco and cane sugars. Verify current scope and exact product composition when implementing.
- **[S9] Destilado de pulque:** [Agricultura's Hidalgo distillers event](https://www.gob.mx/agricultura/es/agenda/segundo-encuentro-de-destiladores-de-pulque-de-hidalgo?idiom=es). Establishes the tradition as a research candidate; bottle claims still require expression-specific documentation and reviews.

## 6. Shared release gates and operations

Apply checks only to functionality present in the current release. Future search, comparison, localization and catalogue requirements are not foundation blockers. Do not implement future features merely to satisfy a generic checklist. Run relevant checks once; repeat only for a concrete failure or code change.

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

Release 1 is ready for handoff when its GitHub Pages URL is inspectable and its foundation acceptance criteria pass. Present the URL with a short checklist covering map/list → profile navigation, profile body/taste layout, one-example-bottle placement, sources and phone/tablet usability. The owner must inspect this structure and authorize Release 2 before work continues; do not automatically execute the roadmap. Later releases add only their scheduled functionality/content, followed by the mandatory maintenance deployment. No implementation milestone is complete merely because code exists in a branch.

For each release, record:

- Release number/name, feature or maintenance type, and deployed version/tag/commit.
- Public Pages URL and deployment verification time.
- Completed scope, data/review coverage, validation results, and manual environments actually checked.
- Remaining issues, explicitly deferred content, and rollback reference.
- For maintenance: findings, implemented fixes, and evidence that the deployed behaviors improved.

This file is the agreed plan for `RagdollLabs-agave-guide`; it does not create the repo, publish a site, or certify any listed bottle content. Implementers must use genuine sources for published claims within the bounded research rules above. Omit nonessential unknowns instead of delaying structural validation for exhaustive research.
