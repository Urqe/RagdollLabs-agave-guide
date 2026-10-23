# RagdollLabs Agave Guide — Release Plan

Status: release roadmap; current implementation/deployment progress must be checked in the repository.  
Updated: 2026-10-23  
Confirmed repository name: `RagdollLabs-agave-guide`  
Product subtitle: **Explore Mexico’s agave spirits**

## Current execution priority — post-completion corrections

Post-roadmap pairs 8–14 are recorded as applied. The owner-requested post-completion review found remaining defects and educational gaps; **section 4.3 supersedes the earlier “sequence complete” conclusion for next-work prioritization**. Execute **pair 15 — Corrective UX, Mapping & Localization Review next**, followed by pair 16 and its maintenance review in pair 17, only as requested by the owner. Section 4.4 extends these same releases with the owner's content-accuracy, practical tasting, Mexican Spanish/regional-voice and British/Mexican flag requirements; execute both sections together. Preserve completed work and current coverage. This update changes the plan only; the new tasks remain unchecked.

## Implementation priority — small, profile-first foundation (historical)

Historical foundation guidance: this section superseded the original broad research targets during Release 1. For current execution priority, use section 4.3. Execute only the requested release, not the entire roadmap.

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

### Post-roadmap pair 5 — Warm Storytelling & Disclaimer Placement (feature/UX)

Applied (see the pair 5 notes in RELEASE_NOTES.md). A UX/content review of the profile reading experience found that the warm editorial voice exists in the data but the rendering buries it. The profile view (`assets/js/profile.js`) builds the page with the warm `context` and `description` paragraphs in the reading flow, then reorders the DOM so they end up inside a collapsed "Place, plant & craft" disclosure, while an editorial-guidance disclaimer renders above all content (`profile.js` around the `section.append(back, identity, guidanceNote, core, action)` call). A first-time visitor therefore meets a compliance note and a sensory grid before the story, which reads encyclopedic rather than like a Mexican proudly describing the spirits of their state. Related findings, in priority order:

- [x] Put the profile `context` and `description` back in the visible reading flow near the top of the profile view, ahead of the sensory grid; move the "editorial style guidance" disclaimer to a small note at the end of the profile (or remove the top instance where the description text already carries it, e.g. the valley blanco profile).
- [x] Reorder the profile sections toward the journey the product promises: what am I drinking (context/description) → why does it taste this way → how it is made → character in the glass → example bottles → explore next. "Why it tastes this way" currently sits below the sensory grid and compare link.
- [x] Consolidate hedging: `sensoryNote`, `mapHint`, `flavourDisclaimer`, `reasonSuffix` and `coordsNote` (which says "approximate" twice) each read as legal qualifiers. Keep at most one unobtrusive qualifier per view and move the methodology disclosure to the Learn section.
- [x] Reserve the collapsed `<details>` pattern for skip-this content (sources). Using the same pattern for please-read-this content (the story) teaches users that expandable sections can be ignored.
- [x] Voice pass on profile `context` fields that drift into app-meta language: the comiteco profile discusses "eligibility for this app" instead of speaking as a proud chiapaneco; tuxca uses "a working description centers production on…". Keep the legal facts, deliver them in the narrator's voice.
- [x] Even out warmth across profiles: `tequila-blanco-highland-jalisco` and `mezcal-espadin-valles-centrales` are mostly agronomy; give every profile at least one moment of local pride to match bacanora, sotol and the valley profiles.
- [x] Do not change the source-citation approach: evidence stays attributed but collapsed out of the reading flow, with no leading exit links. This is confirmed as matching the product goal.

Acceptance: a first-time visitor opening any profile sees the warm story before any disclaimer or data grid; the page no longer opens with a compliance note; hedging is consolidated; every profile context keeps the personal, proud regional voice while legal facts remain intact. Rerun the profile-rendering and UX regression suites in `test/` (jsdom) and repeat the manual mobile/desktop flows.

### Post-roadmap pair 6 — Pair-5 Review & Fixes (maintenance)

Applied (see the pair 6 notes in RELEASE_NOTES.md). Maintenance review of the pair-5 warm-storytelling implementation. Confirmed defects fixed: the profile identity header and the new visible craft section both displayed the plant line (removed the identity duplicate); "Character in the glass" was an h3 among h2 sibling sections (now h2, with the CSS selector updated); the example-bottle card carried a redundant internal "Example bottle" heading duplicating the section h2 (removed, along with its CSS rule); the flavor-mood line, moved inside the two-column character grid in pair 5, would land in a stray third grid cell (now spans both columns). Also removed the now-dead "Place, plant & craft" disclosure copy key (EN and ES) left over from the pair-5 reorder. Verified without defect: disclosure open-state persistence across language switches, ES rendering of the new hierarchy (no untranslated-field disclosures on translated profiles), search indexing (data-driven, unaffected), back-navigation origins, scroll-to-heading behavior, and robustness with missing optional profile fields. Two regression tests added pinning the no-duplicate-plant/heading-hierarchy and mood-line grid-span behaviors.

### Post-roadmap pair 7 — Compact Data-Dense Layouts (feature/UX)

Applied (see the pair 7 notes in RELEASE_NOTES.md). Owner review of the deployed profile page (e.g. `#/profile/tequila-anejo-valley-jalisco` on a laptop monitor) found the presentation too airy for an information guide: the editorial prose runs at 1.12rem/1.75 line-height with a 62ch cap, each profile section stacks vertically with generous padding, and the whole "Character in the glass" block (heading, sensory sliders, taste facts, flavor moods) occupies its own full-width band below the story — so a laptop viewport shows the story plus at most one section, while the reference layout (the Wine Atlas screenshot the owner attached) fits a search field, a style profile with eight sliders, typical notes and several structured sections in one screen by using a two-column content area, compact type and minimal whitespace. Goal: keep the warm story-first reading order from pair 5 (that hierarchy is settled), but present it and the data sections much more densely on wide viewports, so a laptop screen fits the story plus the character grid side by side. Smartphones keep the current single-column stacking. No content or data changes — this is presentation only.

- [x] **Two-column profile layout on wide viewports (≥ 64rem):** story column (context, description, beginner note, why-it-tastes) on the left; "Character in the glass" (sensory sliders, taste facts, flavor moods) docked to the right of the same view, as the owner sketched — not as a separate band below. Craft facts (legal class, plant, process), how-to-enjoy and example bottles flow under the story column. Below ~64rem (tablets and phones) everything returns to the current single-column order.
- [x] **Typography density pass:** reduce editorial prose from 1.12rem/1.75 to ~1rem/1.6 and loosen the 62ch cap on wide columns (text can fill its grid column); slightly reduce h1/h2 display sizes and the section paddings (`padding-block`, grid `gap`) so vertical rhythm is compact without becoming cramped. Keep body text at a readable size — compact, not small; do not shrink below 0.95rem for reading prose.
- [x] **Compact sensory sliders:** tighten sensory-row spacing (label + slider rows) so all eight dimensions plus the taste facts fit the right column without scrolling; keep the existing 44px tap-target rule for interactive elements (sliders are informational, rows may compress).
- [x] **Persistent search on content views:** expose the existing search input (`searchProfiles`) on the profile view (and other content views) in the spirit of the Wine Atlas sidebar — a compact search field that navigates to the Explore results on submit, without duplicating search logic. It must not take the main stage: a quiet one-line field, visually secondary to the content. Keyboard shortcut (if one exists for the explore search) should target it consistently.
- [x] **Density on the other content views:** apply the same compact type scale and reduced paddings to the plant, tradition, discovery and learn pages so the whole app reads consistently denser on laptops; keep the current mobile rules unchanged.
- [x] **Explicitly out of scope:** changing content, data, reading order (the pair-5 hierarchy), or the mobile layout; adding a persistent sidebar navigation; new views or features beyond the search field. The visual identity (cream/charcoal, agave/terracotta accents, Fraunces display type) stays.
- [x] Regression tests: pin the two-column profile layout (story and character side by side at wide widths, stacked at narrow), the compact typography tokens, and the presence/behavior of the persistent search on the profile view.

Acceptance: on a laptop viewport (~1280px) the profile page shows the story and the full "Character in the glass" block with all sliders simultaneously, with search reachable without leaving the view; on a ~390px viewport the layout matches today's mobile behavior. All existing tests pass (jsdom suites, accessibility checks, tap-target rules); `npm run validate` green; manual mobile/desktop spot-checks reported with remaining limitations.

## 4.2 Completed refinement sequence — Beginner Guidance & Enthusiast Usability

Added: 2026-10-23. Status: **pairs 8–14 recorded as applied; post-completion findings continue in section 4.3**. This sequence follows completed post-roadmap pair 7 and responds to the desktop UI/UX review of the live site and repository. Existing learning chapters, profiles, comparisons and reference pages are useful foundations; refine their presentation and connections rather than rebuilding them.

### Execution order and boundaries

- Historical execution order: pairs 8–14. These are recorded as applied; do not restart them. The current next release is pair 15 in section 4.3. Execute only the release the owner requests.
- Releases 1–26 and post-roadmap pairs 1–7 remain historical records. Old unchecked foundation tasks are not instructions to restart the app; verify implementation and release notes before reopening any item.
- Preserve the warm regional storytelling, green/amber visual identity, compact desktop profile layout, readable mobile layout, source disclosures and bilingual support. Do not revive the already rejected story-behind-disclosure pattern or make every page airy again.
- Keep all current coverage, stable entity IDs, profile links, existing comparison selections and source attribution. These releases add no new spirits, regions, bottles, live services, accounts or analytics.
- The review confirmed desktop presentation and inspected selected workflows. Native iPhone/iPad Safari, physical touch and VoiceOver remain **unverified**, not confirmed defects and not passed checks.
- Completed chapter organization is not the same as a guided beginner experience. Pair 9 adds a short optional route through existing material; it does not reopen Release 19 as unfinished.
- This sequence does not revisit historical scope disagreements about agave-adjacent traditions. Retain current coverage and accurate botanical distinctions; any future scope change requires a separate decision.

| Order | Release | Purpose | Dependency |
| --- | --- | --- | --- |
| 1 | Post-roadmap pair 8 — Relevance & Reading Review | Correct misleading teaching links, repetitive prose and internal-facing copy | Completed pair 7 |
| 2 | Post-roadmap pair 9 — Your First Agave Spirit | Add a brief, optional beginner journey ending in a prepared comparison | Pair 8 |
| 3 | Post-roadmap pair 10 — Beginner Journey Review & Fixes | Validate learning progression, bilingual navigation and return paths | Pair 9 |
| 4 | Post-roadmap pair 11 — Clear Discovery Entrances | Give browsing and contextual discovery distinct, understandable jobs | Pair 10 |
| 5 | Post-roadmap pair 12 — Discovery Review & Fixes | Verify search, map/list, deep links and navigation consistency | Pair 11 |
| 6 | Post-roadmap pair 13 — Browseable Bottle Catalogue | Add useful filters and compact summaries with optional depth | Pair 12 |
| 7 | Post-roadmap pair 14 — Catalogue & End-to-End Review | Validate catalogue identity, accessibility and both audience journeys | Pair 13 |

### Post-roadmap pair 8 — Relevance & Reading Review (maintenance)

Applied (see the pair 8 notes in RELEASE_NOTES.md). Goal: correct concrete teaching and reading friction before adding another navigation surface. Apply the mandatory maintenance protocol, scoped to these findings and adjacent behavior.

1. [x] **Fix educational recommendation relevance.** The valley blanco profile currently offers highland extra añejo under “same plant, different region,” changing maturation as well as region despite an existing highland blanco profile. Prefer candidates matching tradition, class/maturation and documented method where possible, then differing in region. Do not claim that region is the sole variable when other material differences remain.
2. [x] Make recommendation selection deterministic with stable tie-breaking and exclude self-links and duplicate destinations. Reuse existing recommendation logic where appropriate rather than creating another ranking system. If no suitably comparable candidate exists, omit the perspective or explain the additional differences.
3. [x] Replace raw shared-dimension explanations such as “Shares Perceived sweetness” with useful language explaining the overlap. Shared absence or a low score alone should not imply strong overall similarity. Keep recommendations bounded to documented profile data.
4. [x] Tighten repeated profile introductions. On the valley blanco profile, context, description, beginner note and “why it tastes this way” repeat the unaged/agave-led point. Give each block a distinct purpose: local identity, accessible explanation, causal context, then sensory detail. Preserve regional warmth, technical facts and qualifications; apply the same review only where repetition is present elsewhere.
5. [x] Remove internal implementation language from visitor-facing text, including “per the plan,” app eligibility and coverage/mapping rationales. Preserve honest missing-information disclosures in plain language. Audit catalogue relationship headings too: an uncovered bottle must not be introduced as fitting a profile it is explicitly excluded from.
6. [x] Keep one short, relevant explanation of editorial style guidance per view. Move extended methodology into reference material while retaining bottle-specific attribution, botanical uncertainty and other qualifications necessary to interpret a claim.
7. [x] Add focused regressions for the existing valley/highland blanco recommendation, deterministic fallback behavior and contradictory catalogue relationship labels. Run the relevant suites and normal validation.

Acceptance: valley blanco recommends highland blanco for the regional learning link; other perspectives do not imply controlled comparisons when several variables change. Readers can understand a profile without repeated definitions or development terminology. EN/ES meaning and source access remain intact.

### Post-roadmap pair 9 — Your First Agave Spirit (feature/UX)

Applied (see the pair 9 notes in RELEASE_NOTES.md). Goal: turn “New to agave?” into a manageable first experience, with an obvious next action and an optional route into enthusiast depth.

1. [x] Add a concise learning start page stating the outcome: recognise a few useful flavour differences and understand a first comparison. No bottle purchase, alcohol consumption, account, quiz or sequential completion is required.
2. [x] Offer short, individually addressable steps using existing material: **what these spirits are → how to taste → recognise agave, smoke, body and oak → try a comparison → choose what to explore next**. Teach perceived sweetness versus sugar where relevant without front-loading all legal and botanical exceptions.
3. [x] Give each step one principal idea, a concrete example and a clear Next/Previous action. Provide a visible step list and direct skipping; keep content readable without completing previous steps.
4. [x] Open an explicitly labelled prepared comparison of the existing valley blanco and valley reposado profiles to explain wood resting. Explain that these are typical styles rather than an experiment isolating every production variable. Link the lesson to the existing comparison engine; do not duplicate sensory data or silently overwrite a user's saved comparison.
5. [x] Provide an optional second exercise comparing valley and highland blanco, reusing pair 8's relevance corrections. Explanations should describe tendencies and other possible influences rather than claim geography determines flavour.
6. [x] Give each lesson one or two short example links/cards with a reason to open them. Replace unwieldy chains of full profile titles in the new journey; make returning to the originating lesson explicit.
7. [x] Keep the seven existing chapters and plant/process/glossary references directly available as deeper reading. Offer this reference entrance near the journey start; experienced users must not traverse onboarding.
8. [x] Use stable lesson identifiers and routes consistent with the existing router. Preserve current Learn and glossary URLs through compatible destinations or redirects. Support reload and browser Back/Forward; keep progression local and optional if persistence is useful.
9. [x] Deliver Mexican Spanish parity for every new lesson, navigation control, example explanation and comparison handoff in the same release. Reuse canonical content and references; do not fork an unsourced beginner dataset.

Acceptance: a newcomer can enter from the homepage, learn the essentials in a short session, open the prepared comparison, understand the principal difference and return to the lesson. An enthusiast can bypass the journey and open existing references immediately.

### Post-roadmap pair 10 — Beginner Journey Review & Fixes (maintenance)

Applied (see the pair 10 notes in RELEASE_NOTES.md).

1. [x] Follow the beginner journey from a fresh visit in EN and ES, including reading without a glass, skipping lessons, opening an example, returning, reloading a lesson and using Back/Forward.
2. [x] Verify focus moves to a meaningful heading, the active step is announced, links have useful names and progress/selection is not conveyed by colour alone.
3. [x] Verify the prepared comparison handles existing empty, partial and full selections without silently destroying user choices; invalid or retired lesson IDs produce a useful recovery.
4. [x] Review cognitive load: each step has one clear primary action, jargon is explained at first use and legal/reference detail is optional.
5. [x] Test relevant mobile layouts, text enlargement, reduced motion and keyboard access. Record actual iPhone/iPad Safari and VoiceOver results separately from desktop or DOM evidence.
6. [x] Implement confirmed fixes, run focused regressions and normal validation, and verify the deployed lesson links.

Acceptance: the new route teaches a coherent sequence without blocking free exploration, losing comparison state or stranding readers in a reference page. Report untested native-device behavior explicitly.

### Post-roadmap pair 11 — Clear Discovery Entrances (feature/UX)

Applied (see the pair 11 notes in RELEASE_NOTES.md). Goal: remove uncertainty about where to browse while preserving the cross-linked content model.

1. [x] Give the existing destinations distinct visible jobs: **Browse styles** for searchable/filterable profile browsing; **Plants & places** for contextual discovery by tradition, flavour, plant and region. Keep existing Explore/Discover routes compatible and use the same labels consistently in navigation, headings and back links.
2. [x] On the contextual discovery landing page, lead with familiar spirit traditions and approachable flavour paths. Keep plant and region entrances prominent but secondary; present common plant names before scientific names where documented, preserving regional-name ambiguity.
3. [x] Replace the first impression of long alphabetical taxonomy lists with compact, clearly titled entry groups. Keep full lists reachable and searchable. Correct “three ways in” wording if four routes, including flavour, are offered.
4. [x] Keep Mexico map/list access clearly labelled as browsing by place. Preserve app-coverage versus legal-boundary distinctions, selected place and filtered results on return.
5. [x] Align homepage actions with the actual destinations: browse styles, compare, new-to-agave journey and bottles. Make the beginner action easy to find without replacing the main browsing action.
6. [x] Provide one clear onward action and contextual return on plant, tradition, region and flavour pages. Do not add another sidebar or duplicate the catalogue inside discovery.
7. [x] Translate labels, descriptions and accessible names together. Preserve bilingual aliases, existing entity links and shared search logic.

Acceptance: a first-time visitor can distinguish “find a style” from “understand a plant/place/tradition” before clicking. Known-name search and enthusiast reference access remain direct.

### Post-roadmap pair 12 — Discovery Review & Fixes (maintenance)

Applied (see the pair 12 notes in RELEASE_NOTES.md).

1. [x] Validate homepage → browse/filter → profile → return and discovery → plant/region/tradition/flavour → profile → return, in both languages.
2. [x] Verify existing bookmarks, legacy routes, invalid IDs, browser history and selected map/filter context after the visible-label changes.
3. [x] Review scientific/common-name presentation for misleading alias merges and confirm sotol remains explicitly non-agave.
4. [x] Test keyboard traversal, selected navigation state, focus restoration, touch targets and narrow-width wrapping. Inspect map/list equivalence on environments actually available.
5. [x] Implement corrections, add targeted behavioral regressions and verify deployed destinations. Preserve remaining native Safari/touch checks as unverified until performed.

Acceptance: clearer entrances preserve the established search, map, comparison and reference contracts, with consistent navigation language across all views.

### Post-roadmap pair 13 — Browseable Bottle Catalogue (feature/UX)

Applied (see the pair 13 notes in RELEASE_NOTES.md). Goal: help readers find and assess existing bottles without scanning a full alphabetical dossier.

1. [x] Add a spirit/tradition filter beside catalogue search, plus a clear reset and visible result count. Combine search and filter predictably; show a useful no-results state.
2. [x] Present compact summaries: brand/expression, tradition, producer/place where documented, ABV or a concise unknown state, and a short attributed character note where supported.
3. [x] Put longer production, composition, batch and source details behind clearly labelled optional disclosure. Keep material composition distinctions and warnings about varying ABV apparent where needed; compact presentation must not mislead.
4. [x] Keep producer notes, reviewer impressions and editorial synthesis distinguishable. Do not invent tasting summaries for factual-only entries.
5. [x] Offer a style-profile link only where the mapping genuinely matches the expression. Describe uncovered entries plainly; an aged sotol or añejo mezcal must not appear equivalent to a mismatched unaged or reposado profile merely to provide a destination.
6. [x] Preserve stable bottle anchors, direct-link discovery, filter/search state and sensible focus when returning from a profile. If a linked bottle is inside collapsed content or outside current filters, reveal it or clearly offer to show it.
7. [x] Remove redundant brand-list repetition where it adds no navigation value; retain useful brand browsing through a compact index or jump links if justified by the existing catalogue.
8. [x] Deliver all controls, result messages, summaries and disclosures in EN/ES. Extend existing catalogue rendering and search contracts rather than introducing a separate bottle database.

Acceptance: users can find a known bottle or browse an existing tradition quickly, open technical depth on demand and distinguish bottle evidence from typical style guidance. No new content research or price/availability features are required.

### Post-roadmap pair 14 — Catalogue & End-to-End Review (maintenance)

Applied (see the pair 14 notes in RELEASE_NOTES.md).

1. [x] Verify combined search/filter/reset, no results, unknown fields, disclosure state, bottle anchors and profile return paths in EN/ES.
2. [x] Audit all changed expression/profile links against tradition, region, class and documented production context. Keep factual-only entries accessible without fabricated sensory levels.
3. [x] Review compact summaries for lost attribution, hidden composition distinctions and inconsistent producer identity. Confirm sources remain reachable.
4. [x] Verify keyboard and screen-reader disclosure semantics, result announcements, focus, readable text and touch targets at phone, tablet and desktop widths. Report native Safari/VoiceOver evidence honestly.
5. [x] Run two complete acceptance scenarios: **beginner: homepage → lesson → prepared comparison → profile → lesson**; **enthusiast: known-name search or discovery → bottle/profile → technical reference → contextual return**.
6. [x] Implement confirmed issues and focused regressions; run normal validation and verify published paths, asset refresh and rollback reference. Record remaining limitations and do not mark any release complete solely because DOM tests pass.

Acceptance: both audience journeys work coherently with existing content, no dead-end learning links or contradictory profile mappings, and no loss of the compact visual hierarchy. Reassess further content expansion only after these usability releases are reviewed.


## 4.3 Post-completion review — Correctness & Practical Learning

Added: 2026-10-23. Status: **planned; not implemented**. Owner-requested follow-up to the live desktop Chrome and repository review after pairs 8–14. Those releases delivered useful navigation and catalogue improvements, but their completion notes do not close the confirmed findings below. Preserve the existing design and coverage; no redesign or catalogue expansion is needed.

### Execution order and evidence

1. **Pair 15 — Corrective UX, Mapping & Localization Review**: maintenance fixes for confirmed defects and the checks that missed them.
2. **Pair 16 — Practical First Tasting**: small educational/UX improvement using existing lessons and comparison data.
3. **Pair 17 — Learning & Navigation Verification**: required maintenance follow-up to pair 16, not another feature batch.

These are continuations of the existing post-roadmap identifiers. Pair 15 is a corrective maintenance release before new feature work; pair 16 must be followed by pair 17. Execute only the release requested by the owner. This documentation update does not itself authorize application changes.

Review baseline: repository tree/commit `287b53910a8ca1cfb6a7a6e292da896da4f33bf4` and the deployed site inspected on 2026-10-23. Reproduce against current main before editing; if a finding has since been corrected, verify and record that rather than undoing subsequent work. Desktop interaction and code evidence are available; native iPhone/iPad Safari, physical touch and VoiceOver remain unverified, not newly discovered defects.

### Post-roadmap pair 15 — Corrective UX, Mapping & Localization Review (maintenance)

Goal: close confirmed gaps left by pairs 8–14 and make the supporting validation test the promised behavior.

#### 15.1 Fix the discovery layout contract — high priority

- [ ] Reproduce at `#/discover`: tradition links appear as a long vertical list with default bullets and extensive empty space on desktop.
- [ ] Correct the renderer/CSS mismatch: `assets/js/discovery-view.js` emits `discovery-chip-list`, while `assets/css/styles.css` styles `.discover-chip-list`. Standardize the class and inspect all consumers, including the catalogue brand index; do not fix one surface by breaking another.
- [ ] Verify actual rendered wrapping and removal of default bullets at desktop, tablet and phone widths, in EN and ES. Keep readable text and 44px interactive targets.

Acceptance: discovery groups render as compact wrapping entrances with no accidental browser-default bullets or desktop single-column link tower. Rendered screenshots, not CSS-string assertions alone, support the claim.

#### 15.2 Correct mismatched bottle/profile links — high priority

- [ ] Reproduce the current catalogue mappings: `ilegal-mezcal-anejo` links to `mezcal-reposado-espadin-oaxaca`; `hacienda-de-chihuahua-sotol-anejo` links to `sotol-chihuahua`, whose process description does not describe the bottle's two-year oak maturation.
- [ ] Audit mappings against documented tradition, region, class/maturation and material process differences. Matching the tradition alone is insufficient.
- [ ] Where no existing style profile genuinely matches, keep the bottle as a factual catalogue entry and remove the equivalence-implying style link. If useful, offer a separately labelled “related tradition” link to the existing tradition page. Do not create new profiles or silently rewrite existing profiles to absorb exceptions.
- [ ] Review profile example/additional-bottle lists, discovery bottle cards, search destinations and editorial relationship labels affected by any mapping change. Separate educational context from membership in a style.
- [ ] Add focused checks for the two named mismatches and valid contrasting mappings; explicitly exercise maturation differences, not just shared tradition.

Acceptance: an añejo bottle is not presented as an example of reposado or a profile lacking its material maturation context. Relevant contextual links remain available without implying equivalent taste or class.

#### 15.3 Repair missing strings and lesson accuracy — medium priority

- [ ] At `#/start/how-to-taste`, replace the visible `learn.heading` card label using the correct locale lookup. At `#/catalogue`, search Balam and replace the visible `noReviewYet` fallback. Verify both EN and ES; consolidate duplicate missing-tasting messages where appropriate.
- [ ] Correct lesson one's claim that “Every spirit in this guide starts with a mature agave plant.” Explain briefly that the guide mainly covers agave spirits and also includes sotol from Dasylirion. Preserve the distinction consistently in Spanish and existing reference material.
- [ ] Correct the prepared-comparison lesson's claim that the reposado spends “two months” in oak. The current profile describes a minimum and range, not a fixed duration for the typical style. Use the existing canonical maturation facts; do not universalize the legal minimum or copy bottle-specific timing into a general lesson.
- [ ] Retain a concise explanation that these are typical-style comparisons, not experiments isolating every production variable.

Acceptance: no raw lookup keys appear in the named states, the beginner introduction agrees with actual coverage, and maturation wording distinguishes legal minimums, typical ranges and exact bottle facts.

#### 15.4 Preserve brand-browsing context — medium priority

- [ ] Reproduce: catalogue → Fortaleza brand chip (3 results) → Fortaleza Blanco style profile → “Back to catalogue” returns all 46 bottles. Search and tradition selection already restore correctly; retain that working behavior.
- [ ] Include `brandFilter` in catalogue snapshots and restore it alongside query/tradition state. Inspect locale re-render and browser Back as well as the explicit back link.
- [ ] Show the active brand plainly with a reachable clear/reset action. Preserve the established behavior that typing a fresh query clears the brand selection.
- [ ] Test combinations of brand selection, tradition filter, reset, locale switch and return navigation without adding a separate search implementation.

Acceptance: the same three Fortaleza entries return after the profile visit, the active filter is understandable, and reset restores the full catalogue.

#### 15.5 Review Spanish meaning and untranslated descriptions — medium priority

- [ ] Correct “hazlo solo” in the tasting lesson: the intended meaning is drinking neat, not tasting alone. Use natural Mexican Spanish in context.
- [ ] Correct “blanco de valero” in the Fortaleza description and review nearby tasting text for mistranslation.
- [ ] Translate descriptive producer/place fragments such as “small-batch Sonoran bacanora,” “blue weber agave, cultivated” and “Coastal Jalisco.” Preserve proper names, scientific names and source titles rather than translating them indiscriminately.
- [ ] Review new lesson and catalogue text for natural meaning, not merely nonempty translation fields. Keep any remaining untranslated-content disclosure accurate and scoped.

Acceptance: a Spanish-only reader can understand the new journey and catalogue summaries without English descriptive fragments or altered tasting instructions. Record what received an editorial reading pass; do not claim a professional/native-speaker review unless one occurred.

#### 15.6 Strengthen verification and correct completion claims

- [ ] Extend missing-string checks beyond the current `/[a-z]+\.[A-Z][a-zA-Z]+/` pattern and limited element selection in `test/pair-14-e2e-review.test.mjs`. The existing sweep misses lowercase `learn.heading`, bare `noReviewYet`, and lesson card titles. Check all five lessons and relevant missing-data branches in both languages; prefer validation of lookup keys at their source plus assertions on meaningful rendered labels over an indiscriminate prose regex.
- [ ] Exercise actual navigation through the running app for brand → profile → back, lesson → reference → lesson, and prepared comparison → lesson. Separately rendered components are useful component tests, not evidence that a connected journey works.
- [ ] Include rendered visual inspection of the discovery layout and newly changed surfaces. Do not add tests that only restate class names while missing their applied styling.
- [ ] Run normal validation and targeted regressions; report automated tests, browser checks and native-device checks separately.
- [ ] Update the pair-14 completion record with a dated follow-up/correction: its raw-key and zero-mismatch conclusions were too broad. Preserve historical notes while recording the confirmed exceptions and their fixes.
- [ ] Verify deployed assets and corrected routes after publishing; record deployed commit and remaining limitations.

Acceptance: all named reproductions are closed with evidence. Native-device checks remain explicitly pending until performed; passing DOM checks do not close them.

### Post-roadmap pair 16 — Practical First Tasting (feature/UX)

Goal: make the existing five-step beginner journey teach a usable skill, with minimal additional text and no new catalogue research.

1. [ ] Expand “How to taste” into a concise practical sequence: gently smell, take a small sip, notice mouthfeel/body, then follow the finish. Explain the difference between aroma, taste and texture using familiar examples, with a read-only alternative for people without a glass. Avoid turning tasting into a test or requiring alcohol consumption.
2. [ ] Refine the flavour lesson into short, scannable explanations of cooked agave, smoke, body and oak, with one concrete example per idea. Do not imply that vanilla/caramel always prove oak contact or that every agave spirit must be smoky.
3. [ ] Give the flavour-chapter example a meaningful title and an actual destination at the Understanding Flavour chapter. The current `chapterId` is present in the example data but ignored when building its bare Learn URL. Extend the existing router/learning view with stable chapter addressing and retain the originating lesson in the return context; preserve current Learn/glossary URLs.
4. [ ] In a lesson-opened prepared comparison, present its explanation and comparison results before the full profile picker. Keep changing styles available through a clear secondary control. General-purpose comparison remains easy to use.
5. [ ] Preserve comparison-selection safety, lesson return links, direct skipping and browser history. Do not duplicate profile sensory levels in lesson data.
6. [ ] Tighten repeated “no purchase/no glass/no quiz” and app-operation explanations. One clear reassurance is enough; use the remaining space to teach.
7. [ ] Deliver natural Mexican Spanish parity for all changed lessons, chapter links, comparison controls and accessible labels.

Acceptance: a newcomer can describe a basic tasting sequence, distinguish the taught sensory concepts, open the intended chapter directly and see the prepared comparison's lesson without first scanning the full selector. Existing reference access and enthusiast workflows remain direct.

### Post-roadmap pair 17 — Learning & Navigation Verification (maintenance)

Goal: verify the small learning release in the running app and correct its regressions before further expansion.

- [ ] Walk homepage → all five lessons → prepared comparison → lesson and lesson → exact flavour chapter → lesson in EN and ES, including direct links, reload and browser Back/Forward.
- [ ] Test saved empty/partial/full comparison selections and user-edited selections during a prepared comparison; verify no silent loss on return.
- [ ] Verify heading/focus placement, meaningful chapter-link labels, selected-step announcements and keyboard access to the secondary comparison picker.
- [ ] Inspect desktop, tablet and phone-width layouts, text enlargement and reduced motion. Perform native Safari/VoiceOver/touch checks where available and name environments actually tested.
- [ ] Recheck the pair-15 layout, missing-string, mapping and brand-return reproductions against the deployed build.
- [ ] Add targeted regressions for failures found, run normal validation and deploy justified fixes. Record findings, deployed commit, verification evidence and rollback reference.

Acceptance: both beginner and enthusiast journeys work as connected flows with accurate labels and content, and completion claims match the environments actually checked. If review finds no defect, document the evidence without manufacturing changes.


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


## 4.4 Content audit — Accurate teaching, regional voice and language choice

**Requested by the owner, 2026-10-23. Status: planned; no website changes made by this audit.** This section extends pairs **15–17**, rather than creating a competing release sequence. Pair 15 owns factual corrections, pair 16 owns practical teaching, regional editorial work and the flag control, and pair 17 verifies the combined result. Existing section 4.3 tasks remain required.

### Audit scope and judgment

Reviewed the source-backed content of all five beginner lessons, seven chapters, 18 style profiles, eight traditions, and plant/process/region/glossary references, including Spanish narrative and translation structures; spot-checked the live homepage and bacanora profile in EN/ES. This is a content audit with targeted external verification, not certification of every bottle, batch, historical assertion or legal claim. Do not report all subpages or every source as browser-tested.

The information architecture is useful, and the profiles convey enthusiasm. However, the present text is **not yet reliable enough to promise that every description is correct or that a beginner will know how to serve and taste each tradition**. The five-step route principally teaches the app's flavour vocabulary; the practical instructions are thin and scattered. Regional pride is explicit, but repeated claims about what all locals say, invented speech, and literal Spanish translations weaken credibility.

### Pair 15 additions — Correct the content before adding more prose

- [ ] **P15-C1 — Comiteco protection and plant identity (high).** The comiteco profiles, tradition, plant reference and chapters describe a regional tradition without DO and a pending request. A DO and an IG are different: the official declaration of **6 October 2025** protects **Comiteco de Comitán, Chiapas as an Indicación Geográfica** and names **Agave americana L. and cane sugars**. Update the legal summary and geography accordingly. Reconcile the guide's blanket Agave atrovirens identification with this declaration and bottle/importer evidence; do not silently relabel all historic bottles or imply every comiteco qualifies for the IG. Attribute unresolved differences. Correct “Comitán de Dománguez” in the English profile. Review claims about aged classes against the applicable IG rules rather than assuming none exist because there is no DO.
- [ ] **P15-C2 — Mezcal classes and production (high).** In glossary.json, traditions.json, chapters.json and their Spanish counterparts, replace the conflation “joven / abocado.” Distinguish joven/blanco, madurado en vidrio, reposado, añejo, abocado con and destilado con; explain pechuga's relationship to the latter without inventing another category. Separate these classes from the three production categories. The NOM permits clay in artisanal production too; fix the copper/artisanal versus clay/ancestral binary. Do not define all mezcal as necessarily pit-roasted or smoky. Correct the claim that tequila and mezcal reposado have different *minimums*: both begin at two months, although their other requirements differ. Mezcal wood requirements should not be narrowed to oak without qualification. Verify current status/amendments before implementation.
- [ ] **P15-C3 — Tequila label accuracy (high).** Include joven/oro when presenting the legal class list; explain the two tequila composition categories without equating either with quality. Distinguish a typical unaged blanco style from the full legal definition, including any permitted brief maturation. Remove “middle of the legal range” for an 18-month añejo and “longer side of the legal range” for a 4–5-year extra añejo where only minima are established. Correct the generic “reposado's two months” issue already in 15.3. Use NOM-006 and CRT, not an assumed universal age ladder.
- [ ] **P15-C4 — Dates, definitions and regulatory uncertainty (high).** Correct bacanora tradition.history, which conflates legalization and DO in 2000: reconcile it with the profile's 1915–1992 prohibition timeline and official Sonoran history. Distinguish a NOM (a standard) from a producer registration/certification number and other label marks; the current glossary collapses these. Replace “tuxca bottles carry no NOM”/“no seal ... pride is the certificate” with a precise explanation of the specific certification absent, without implying exemption from other labelling requirements. In Sierra raicilla, a taberna is a distillery, not a still. Recheck raicilla aged-class authority against the 2019 declaration and distinguish the published PROY-NOM from an effective final NOM; a three-month example rest is not automatically a legal minimum. Treat the blanket “sotol was illegal in Mexico before 1994” as a claim requiring geographically and historically specific evidence.
- [ ] **P15-C5 — Plant and sustainability claims (high).** Remove or qualify unsupported universal claims that leaving sotol roots guarantees regrowth or makes harvest “sustainable by design”; establish species, harvest method and evidence before making a regeneration claim. Audit fixed ages/yields (tobalá 12–15 years, sotol 8–12 years and one bottle per plant) as variable, sourced ranges. Separate wild-population pressure from overall sustainability: cultivation alone does not establish low environmental impact. Verify the agave flowering/sap-harvest explanation; harvesting a plant is not the same operation as removing its flowering stalk, and repeated sap collection is not indefinite regeneration. Correct the English leek/onion analogy, which fails to illustrate different genera.
- [ ] **P15-C6 — Stop converting associations into causes (medium).** Review every whyItTastes field and corresponding lesson/reference claim. Examples: “wild harvest” causing bacanora herbality; small wild tobalá implying concentrated character; double distillation guaranteeing cleanliness; valley/highland location determining flavour. Describe documented tendencies and variables, not inevitable outcomes. The highland beginner note's “none of the valley's savory edge” conflicts with the later caveat. Keep true wood contact distinct from vanilla/caramel descriptors, which alone do not establish maturation or additions. Attribute representative bottle observations without promoting them into an entire tradition's fact.
- [ ] **P15-C7 — Place and example consistency (medium).** Verify the extra-añejo highland profile's marker, currently explicitly described as the town of Tequila; the highland blanco coordinates; the tobalá profile's mixed “Sierra Norte / Santiago Matatlán” location; and its wild-Oaxaca style versus cultivated Montelobos example. Make guide-region, plant origin, distillery location and example-bottle origin explicit where they differ. Do not move a point by guesswork. Retain the existing pair-15 bottle/class mapping corrections.
- [ ] **P15-C8 — Translation defects that change meaning (medium).** Fix Spanish sap collection “raspanado la quiota”: confirm the actual scraped cavity/plant part and describe it accurately. Fix glossary “viñata” to the documented “vinata.” “Hazlo solo” does not explain neat service; use an explicit serving phrase such as “sin hielo ni mezcladores.” In Mexican serving copy, distinguish limón from lima according to the intended fruit. Correct “cócteles no son un compromiso” as a literal mistranslation of “not a compromise.” Remove unnecessary English glosses such as reposado ('rested') in Spanish. Audit grammatical gender consistently (especially **el bacanora**, as used by Sonoran institutions), rather than alternating el/la across pages.
- [ ] **P15-C9 — Full Spanish field and meaning parity (medium).** The live bacanora plant field still shows “wild-harvested; locally ...”; traditions' Spanish data currently supplies mainly sustainability paragraphs and regions have no matching translation group. Inventory every rendered field and implement translations, including reference names/descriptions and generated recommendation explanations. Preserve scientific names and proper names. Spanish discover-mexican-spirits.block2deeper currently discusses legal geography while English discusses botanical identity: check all block mappings for drift, including expanded content. Distinguish terminology corrections from changes to attributed reviewer meaning.

**Files to inspect:** assets/data/{profiles,traditions,plants,regions,processes,glossary,chapters,bottles,sources,content-es}.json; assets/js/{journey,locale,presentation,editorial,profile,plant-tradition-view,learn-view}.js and affected rendering/tests. The brace lists are scope shorthand, not literal filenames.

**Pair-15 acceptance:** one small claim ledger records changed claim, affected entries/EN-ES surfaces, source and section, date, and disposition (corrected/qualified/removed/unresolved). Do not retain a confident assertion merely because its linked source is reachable. Resolve high-priority errors before recording content accuracy as passed. Keep uncertainty visible when evidence conflicts.

### Pair 16 additions — Teach a usable first tasting

- [ ] **P16-C1 — Outcome-led route.** Preserve the five steps but make their outcomes concrete: identify the spirit and label; prepare a modest tasting; smell and sip gently; describe aroma, flavour, texture and finish; choose a next style. Keep practical instructions in the main “How to taste” lesson, with deeper detail linked. The “Choosing and Enjoying” chapter must agree with it. Do not bury the only technique in a collapsed deeper paragraph.
- [ ] **P16-C2 — One usable demonstration.** Explain neat, on the rocks and mixed; an ordinary small clean glass is sufficient. Describe a small optional pour, gentle smelling without plunging the nose into the glass or vigorous wine-style swirling, a small sip, a pause, and noticing the finish. Explain trying a few drops of water if preferred, with water alongside. Separate alcohol warmth from peppery aroma/flavour. No required bottle purchase, special glass, swallowed sample, speed, or completion drinking; avoid promising that dilution eliminates alcohol exposure.
- [ ] **P16-C3 — Specific guidance for all eight traditions.** Add a concise “first serve / what to notice / optional alternative” to each existing tradition or its linked profiles, reusing one canonical method rather than copying long lessons. Cover tequila (including blanco versus oak-rested), mezcal, bacanora, Sierra/Costa raicilla, tuxca, comiteco, destilado de pulque and sotol. Beginners should be able to find this both through the journey and by landing directly on a profile. Explain unfamiliar words such as copita, neat, earthy, lactic and finish in plain language. Keep expectations conditional and spirit-specific.
- [ ] **P16-C4 — Customs versus suggestions.** Explain that salt, citrus, ice, accompaniments and cocktails are choices, not admission requirements or universal regional rituals. The bacanora “Sonoran-style with lime and sal de chapulín” needs local evidence or removal of the Sonoran-custom claim. Likewise substantiate “traditionally a small-occasion spirit” for comiteco. Remove categorical “tobalá's florals fade in cocktails,” “Margarita upgrade,” and similar taste hierarchies; give the reader a reason to try an option. Avoid repeated “editorial suggestion” in every sentence: label the serving section once while clearly attributing actual cultural customs.
- [ ] **P16-C5 — Practical label reading for enthusiasts and beginners.** Provide one clearly labelled illustrative label walkthrough showing spirit name, class, agave/composition, % Alc. Vol., producer/origin and lot. Teach what those fields can and cannot tell you about taste. Link to deeper class/process evidence for enthusiasts. Illustrative data must not masquerade as a real bottle or certified example.

### Pair 16 additions — Mexican Spanish and regional warmth

The desired voice is a knowledgeable, welcoming host with a sense of place. Dialect variation within a state is real; adding a slang word does not establish local authorship. **Do not claim a local author, interview, quotation or native-speaker review that did not occur.**

- [ ] **P16-V1 — Replace staged pride with concrete place.** Keep the bacanora history and family/vinata context, but rewrite “watch their chest,” “ask anyone,” “they will tell you,” “nobody calls that a flaw,” and similar universal local speech. The source does not establish those quotations. “Aquí nomás” can sound conversational, but the narrator must not casually pose as a Sonoran. Prefer sourced producer quotations when available, clearly attributed, or warm editorial narration. Audit all 18 profiles, including “salt in its soul,” “birthright of their hills,” “patience in a bottle” and the claim that only highland agave can carry oak.
- [ ] **P16-V2 — Write Spanish for Mexican readers.** Recompose sentences rather than translating English metaphors. Examples requiring attention: “se leen sabrosos,” “generaciones de las mismas manos,” “le llaman casa,” “ocasiones pequeñas,” and “el humo se abre.” Use natural sensory language, brief explanations and consistent tú in teaching/UI. Keep factual terminology neutral and clear; put regional colour mainly in introductions, cultural notes and serving contexts.
- [ ] **P16-V3 — Regional editorial briefs.** For Sonora, build warmth around verified vinata/vinatero vocabulary, Sierra places, family continuity and documented food contexts such as carne asada/chiltepín. For Jalisco distinguish valle, Los Altos, Sierra and Costa instead of one generic voice; for Oaxaca acknowledge different communities and producers rather than one statewide way of speaking. Ground Comitán, Tlaxcala, Chihuahua and Jalisco–Colima profiles in their own documented vocabulary and practices. Use occasional locally appropriate idiom only with evidence or regional reviewer support; avoid caricatured spelling, compulsory slang or manufactured Indigenous speech.
- [ ] **P16-V4 — Editable copy examples and review record.** Prepare before/after passages for each regional cluster, with notes on the idiom/place reference and intended warmth. A possible *draft*, not a local quote: “El bacanora tiene historia en la sierra sonorense. Acércate con calma: sirve un poco, descubre sus aromas y deja que cada vinata te cuente algo distinto.” Validate regional wording with a Mexican Spanish editor and, where available, readers/producers from the represented regions. If such review is unavailable, ship restrained, sourced Mexican Spanish and explicitly leave “regional reader validation” pending in the release record; do not claim the authenticity goal is proven.

### Pair 16 additions — British and Mexican flags

- [ ] **P16-L1 — Honour the requested visual change.** Replace EN/ES abbreviations with the UK Union Flag and Mexican flag as language-choice cues. Prefer two clearly identified choices or a compact control that exposes **English** and **Español (México)**, rather than an ambiguous flag-only toggle. Flags represent the chosen editions here, not all speakers of those languages.
- [ ] **P16-L2 — Accessible, predictable behaviour.** Give each option a language-name accessible label, expose the current selection, preserve keyboard operation/focus, and provide readable text when a flag fails to render. Use reliable local icons or verify emoji support on actual targets. Keep the current page, lesson, filters and comparison state when switching. Preserve saved preference and update document language appropriately (es-MX for the Mexican Spanish edition; do not imply a reviewed British English localisation solely because the UK flag is used). Verify compact mobile sizing and both themes.

### Pair 17 additions — Prove the content works for readers

- [ ] Review every edited entry in both rendered languages, including expanded references, generated recommendations and catalogue links; audit all five steps and seven chapters for consistency, broken term links and untranslated prose. Keep stable IDs or migrate old links when splitting an erroneous glossary term.
- [ ] Run targeted factual regressions for the confirmed class/timeline/translation defects, plus data validation and existing tests. Automated string checks cannot certify legal accuracy, cultural authenticity or natural Spanish.
- [ ] Use a no-alcohol-required beginner walkthrough: can a new reader explain what the spirit is, how they could serve it, how to smell/sip and describe it, which accompaniments are optional, and how to choose what comes next? Test tequila, bacanora and mezcal explicitly, then check findability for the other traditions. Record actual reader feedback if available; otherwise label this an editorial walkthrough, not user testing.
- [ ] Have an experienced reader review the class/category distinctions, production exceptions and source traceability without making the beginner route encyclopedic. Record remaining bottle-level verification limits.
- [ ] Record Mexican Spanish editorial review and regional reader feedback separately; track Sonora, Jalisco, Oaxaca, Chiapas, Tlaxcala and Chihuahua/Jalisco–Colima coverage honestly. Resolve factual corrections independently of subjective voice preferences.
- [ ] Verify flags, language names, screen-reader announcement, switching mid-lesson and mobile rendering; follow the existing native-device verification limits. Recheck deployed content after release and document evidence, unresolved claims and rollback.

### Sources checked and implementation starting points

These are claim-specific sources, not blanket endorsement of all content on their sites. Recheck effective versions when implementing.

1. **Comiteco IG declaration, 6 October 2025:** https://sidof.segob.gob.mx/notas/docFuente/5769331 — protected name, plant/composition and geographic scope; distinguish the final declaration from the earlier application.
2. **NOM-070-SCFI-2016:** https://dof.gob.mx/normasOficiales/6437/seeco11_C/seeco11_C.html — sections 4.2, 4.4, 4.5 and 6 for mezcal categories, production, classes and labels. Status reference: https://platiica.economia.gob.mx/normalizacion/nom-070-scfi-2016/
3. **NOM-006-SCFI-2012 / CRT:** https://www.crt.org.mx/wp-content/uploads/2024/01/NOM-006-SCFI-2012.pdf and https://www.crt.org.mx/nuestro-tequila/ — tequila definitions, classes, maturation and label interpretation.
4. **Sonoran history:** https://bacanora.sonora.gob.mx/nosotros/historia — search result confirmed 1915/1992 history, but full page returned 403 during this audit; retrieve/verify the full passage before using it as final evidence. Corroborating regional study: https://www.scielo.org.mx/scielo.php?pid=S2395-91692020000200107&script=sci_arttext
5. **Raicilla proposed standard:** https://sidof.segob.gob.mx/notas/docFuente/5650295 and https://platiica.economia.gob.mx/proyectos-de-nom/ — expressly a project, not proof of a final effective standard. Verify the DO declaration separately; do not infer its content from the project.
6. **Sotol sustainability research starting point:** https://cienciasforestales.inifap.gob.mx/index.php/forestales/article/download/1609/4047?inline=1 — documents pressures on wild stands, not proof of regrowth after heart harvest. Regrowth remains an evidence task.
7. **Regional vocabulary/context example:** https://www.gob.mx/agricultura/es/articulos/bacanora-orgullo-de-sonora-orgullodemexico — evidence of institutional Mexican usage and local pride; do not reproduce promotional quality or health claims as scientific fact.


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
