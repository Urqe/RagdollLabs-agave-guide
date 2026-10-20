# RagdollLabs Agave Guide — Release Plan

Status: proposed; no implementation completed.  
Scope decision pending: the final section proposes a broader Mexican spirits identity in response to the follow-up discussion. The agave-focused roadmap below is the baseline draft, not a finalized naming decision.  
Prepared: 2026-10-20  
Recommended repository: `RagdollLabs-agave-guide`  
Product subtitle: **Mexican agave spirits & sotol**

## 1. Product direction and naming

A static, source-backed discovery guide to tequila, mezcal, bacanora, raicilla, sotol, and selected other Mexican agave distilling traditions. Help people understand what they are drinking, navigate Mexico's regional diversity, compare styles, and find familiar bottles and related alternatives.

Recommended name: **RagdollLabs Agave Guide**. It follows Whiskey Compass's discovery identity. The subtitle explicitly includes sotol, which is made from Dasylirion rather than Agave [S1]. Use the same established RagdollLabs wordmark treatment as the companion apps.

### Core user journeys

1. “I know this bottle.” Search it, identify the exact expression, see its profile and how it differs, then explore related choices.
2. “I'm curious about Sonora.” Select it on Mexico's map, discover bacanora profiles and producers, and see what the app does and does not cover.
3. “I want something herbal with little smoke.” Use flavor discovery, then compare suitable profiles.
4. “What is the difference between these spirits?” Compare plant, process, maturation, sensory character, and sourced definitions.
5. “I'm new to this.” Start with a short beginner guide and follow examples into the explorer.

### Scope boundaries

- Include tequila, mezcal, bacanora, raicilla, and sotol from the first public release, with modest evidence-backed coverage for each.
- Include a neutral route for other documented agave distillates; do not automatically label them mezcal or treat lack of a verified designation as a quality judgment.
- Sotol is an adjacent Mexican spirit, visibly distinguished from agave spirits throughout plant filters and educational content.
- Pulque can appear in educational context as a fermented beverage; it is outside the initial distilled-spirit comparison model. Other Mexican spirits can be considered separately later.
- No live prices, stock tracking, commerce, accounts, crowdsourced ratings, runtime scraping, or generative tasting claims in the initial roadmap.
- English UI initially, retaining correct Spanish names and accents. Prepare text structure for a later reviewed Spanish edition.

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
| `plants.json` | Genus, species/taxon, regional common names, aliases, uncertainty, sources |
| `places.json` | State, municipality/community where verified, parent IDs, coordinates with precision/provenance |
| `designations.json` | Named designation, dated sources, geographic scope and amendments; separate from tasting coverage |
| `profiles.json` | Explicit editorial profile ID, spirit, place references, plant/process context, sensory assessment, explanations and sources |
| `processes.json` | Cooking, extraction, fermentation, distillation, resting, wood contact and other verified treatments |
| `brands.json`, `producers.json` | Brand owner/identity versus actual maker, palenque/vinata/distillery, and documented relationships |
| `bottles.json` | Expression ID, brand/producer, version or batch where material, verified label facts, profile mapping or uncovered status, notes and sources |
| `sources.json` | Specific URL, title, publisher/author, publication/review date where known, verification date, source type and supported content |
| `glossary.json`, `guides.json`, `pairings.json` | Educational and optional enrichment content, source references, editorial labels |
| `search-aliases.json`, `map-layers.json` | Curated aliases, stable feature IDs, map provenance, coverage and layer metadata |

Key modeling rules:

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

## 4. Release sequence

All tasks below are planned. Version labels are suggested milestones, not dates or estimates.

### Release 0 — Foundation & Evidence (v0.1, internal)

Goal: establish reliable domain contracts before building a large catalogue.

- [ ] Create the repo, static application shell, native module boundaries, source registry, and validation command.
- [ ] Inspect Whiskey Compass fixes before reusing code; independently verify navigation, comparison focus, route hydration, and optional-module failure handling.
- [ ] Implement the cross-linked data model above with explicit unknown/uncovered values and schema validation.
- [ ] Establish spirit-specific terminology and a dated evidence register for tequila, mezcal, bacanora, raicilla, and sotol.
- [ ] Obtain and document the Mexico map geometry and asset reuse rights.
- [ ] Define an editorial sensory rubric and seed a few contrasting records to test it without publishing invented numbers.
- [ ] Establish safe DOM construction and strict HTTPS/no-credentials reference URLs.
- [ ] Add a documented cache-version strategy covering code, data, CSS dependencies, and maps.
- [ ] Add a repository CI workflow running the complete validation command on changes.

Acceptance: schema checks reject broken references, invalid sensory values, incorrect sotol genus assignment, and misleading uncovered/profile mappings. A fresh checkout installs and validates successfully. Evidence and map provenance are recorded.

### Release 1 — Explore Mexico (v1.0, first public release)

Goal: a useful small explorer covering all five headline spirits.

Planning target: roughly 12–18 carefully bounded profiles and 20–30 sourced expression examples. These are editorial workload targets, not quotas; defer weak entries rather than manufacture evidence.

Initial editorial coverage candidates:

| Area | Candidate coverage to research and publish when supported |
| --- | --- |
| Tequila | Agave-forward blanco and wood-influenced examples; explain category versus class; Jalisco regional examples without deterministic highlands/valley flavor rules |
| Mezcal | Contrasting documented plant/process profiles, beginning with strong evidence from Oaxaca and at least one other producing state |
| Bacanora | Sonoran examples with maker and process context; equal visibility with the larger categories |
| Raicilla | Documented coastal and sierra examples, with precise production locations and plant identification where available |
| Sotol | Mexican examples from documented northern production contexts; identify Dasylirion clearly and avoid claiming one universal desert flavor |

- [ ] Build welcome, beginner entry, spirit browser, Mexico map, state list, profile view, and gallery.
- [ ] Implement search for existing spirit, plant, place, producer, brand, and expression names; support accents and curated aliases.
- [ ] Display profile character, plant/process facts, notable bottles, serving suggestions, and directly accessible references.
- [ ] Provide a concise explanation of plant, roasting/cooking, fermentation, distillation, and resting/wood effects with appropriately qualified wording.
- [ ] Distinguish tequila category from class using authoritative terminology [S4]; keep mezcal's own categories/classes separate [S5].
- [ ] Add stable query/hash routes that work on GitHub Pages without server rewrites, including direct reload and invalid-route recovery.
- [ ] Make gallery/map/profile transitions exclusive; initial route hydration must not push duplicate history entries.
- [ ] Establish a distinctive visual identity: charcoal and warm cream, agave green/blue, terracotta/copper accents, botanical details, and a discreet ragdoll motif. Maintain readability and avoid generic party imagery or decorative cultural stereotypes.

Acceptance: users can explore all five spirits by map or list, search seeded expressions, understand sotol's botanical distinction, follow citations, and share a profile link. iPhone/iPad Safari and desktop keyboard/mouse flows pass. The map represents coverage honestly.

### Release 2 — Find Your Flavor (v1.1)

Goal: explain meaningful differences and recommend useful next explorations.

- [ ] Add two- or three-profile comparison, explicit remove/replace controls, retained selections, and an optional “biggest differences” view.
- [ ] Use a small shared editorial scale: smoke, herbal/vegetal character, fruit/floral character, perceived sweetness, pepper/spice, body, oak, and finish length. Disclose subjectivity and avoid excessive decimal precision.
- [ ] Show known bottling ABV separately from sensory impressions. Perceived sweetness is not measured sugar, and smoky flavor is not peat content.
- [ ] Use a compact default comparison with expandable detail; show plant/process/class alongside sensory differences.
- [ ] Add mood entry points such as Herbal & fresh, Fruit & floral, Smoky & earthy, Rich & rounded, and Something different. Predicates must use supported profile data.
- [ ] Provide “If you like this, try…” with similarity and contrast explanations based on actual compared attributes.
- [ ] Allow comparison across spirit families while clearly exposing their differences.
- [ ] Define handling of missing sensory dimensions; do not score unknowns as zero or rank profiles on incomparable evidence.
- [ ] Keep unprofiled bottles searchable but outside score-based recommendations.
- [ ] Add deterministic explanation tests, keyboard Add/Remove focus preservation, and workspace-aware search shortcuts.

Acceptance: comparison and recommendations do not infer smoke from a Mexican region or the word mezcal. No mandatory destination is hardcoded into ranking tests. Removal, full comparisons, empty results, Back/Forward, and status announcements remain usable.

### Release 3 — Bottle Discovery & Context (v1.2)

Goal: implement the wider catalogue planned for Whiskey Compass with expression-level accuracy from the start.

- [ ] Expand to a curated catalogue of roughly 60–100 expressions if evidence supports that workload, balancing all five headline spirits rather than filling it mostly with tequila brands.
- [ ] Preserve existing examples as curated selections backed by canonical expression records.
- [ ] Broaden search to the full catalogue, aliases, common spelling variants, and documented producer names; favor exact expression matches.
- [ ] Add “See more bottles” below notable examples, opening a contextual alphabetical expression list.
- [ ] Add “Browse all brands”, with alphabetical brands and their expressions. Brand identity must remain separate from maker and bottling identity.
- [ ] Keep a matched expression identifiable when navigating to its profile.
- [ ] Support sourced but uncovered expressions with “Profile not yet covered”, without borrowed scores or forced classification.
- [ ] Add optional short expression-to-profile notes, e.g. “Less smoky than this profile suggests; more herbal.” This is illustrative wording, not a claim about a named bottle.
- [ ] Tie every comparison note to its reference profile and supporting reviews; omit weak or uninformative notes.
- [ ] Show notes discreetly beneath expressions, with accessible supporting references and editorial labeling.
- [ ] Record bottling/batch differences where they materially change ABV, plant, producer, or tasting character.

Acceptance: catalogue records are unique, references are valid, all expansion controls work by touch/keyboard, and brand searches never imply one universal flavor. Profile changes trigger review of dependent comparative notes. No aggregate review score is converted into a flavor measurement.

### Release 4 — Plants, Process & Traditions (v1.3)

Goal: deepen education once discovery is reliable.

- [ ] Add plant pages connecting scientific names, locally used names, documented uses, and profiles; acknowledge unresolved taxonomy.
- [ ] Expand illustrated process explanations: cooking/roasting, extraction, fermentation vessels, fibers, distillation apparatus, and resting/wood maturation.
- [ ] Explain label terms in context: category/class, ensamble, pechuga, cristalino, producer identifiers, strength and batch details. Verify which terms are regulated, customary, or marketing language.
- [ ] Separate wood maturation, glass resting, and plant growth timelines. Avoid universal age-to-flavor ladders or suggesting older is inherently better.
- [ ] Add contextual histories and maker attribution with specific sources; identify disputed origin stories as disputed.
- [ ] Add optional Mexican food pairings and curated food aliases, using intensity and flavor reasoning rather than hard rules.
- [ ] Add concise serving guidance and optional cocktail suitability without overwhelming the spirit profiles.
- [ ] If sustainability or additive claims are included, attach expression/producer-specific evidence and verification dates. Wild harvest, small batch, a category name, or an attractive label must not become an automatic ethical or quality endorsement.

Acceptance: learning content links back to concrete profiles, sources appear in the relevant panels, and the app does not imply that geography, species, certification, or age guarantees a taste or quality outcome.

### Release 5 — Regional Depth & Spanish Edition (v1.4+)

Goal: expand where the catalogue exposes useful gaps.

- [ ] Maintain a backlog of unmatched expressions and missing traditions with evidence, intended user benefit, and proposed profile boundaries.
- [ ] Prioritize meaningful process/plant/flavor differences over filling states on the map.
- [ ] Research additional mezcal regions, other documented agave distillates such as regional traditions described as tuxca, and deeper bacanora, raicilla, and sotol coverage. Preserve actual label identities and verify terminology before publication.
- [ ] Add municipality/community detail or producer maps only when coordinates and evidence justify it.
- [ ] Consider a separate designation layer only after verifying current legal scope and amendments and matching them to geographic data.
- [ ] Add a reviewed Spanish UI and educational copy with bilingual search aliases; preserve local terminology rather than mechanically translating it.
- [ ] Consider a small local favorites list only if it improves repeat use; keep it private to the device and optional.

Acceptance: each added profile resolves a documented coverage need. Designation layers disclose verification dates and do not imply certification of every producer inside a boundary. English and Spanish navigation, references, and search work consistently.

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

- **[S1] Sotol / Dasylirion:** [PROFEPA botanical discussion](https://www.gob.mx/profepa/articulos/el-sotol-y-la-pata-de-elefante-especies-protegidas-por-la-ley?idiom=es), with [CONAFOR's Dasylirion leiophyllum management resource](https://www.gob.mx/conafor/documentos/mejores-practicas-de-manejo-y-ecuaciones-alometricas-de-biomasa-de-dasylirion-leiophyllum-en-el-estado-de-chihuahua). Botanical sources should guide taxonomy rather than older regulatory family names.
- **[S2] Bacanora:** [Consejo Sonorense Regulador del Bacanora](https://www.sonora.gob.mx/gobierno/estructura-organizacional/item/consejo-sonorense-regulador-del-bacanora). The official summary describes protection across 35 Sonoran municipalities; obtain the operative declaration and scope before implementing legal polygons.
- **[S3] Raicilla:** [IMPI designation announcement](https://www.gob.mx/impi/prensa/el-impi-protege-a-la-raicilla-como-denominacion-de-origen-207026?idiom=es-MX) and [official declaration](https://sidof.segob.gob.mx/notas/docFuente/5564454).
- **[S4] Tequila:** [CRT overview](https://www.crt.org.mx/en/our-tequila/). It distinguishes the two categories and classes, but its English page contains inconsistent reposado aging statements; verify precise requirements against the operative NOM rather than copying the summary.
- **[S5] Mezcal:** [NOM-070-SCFI-2016 official publication](https://sidof.segob.gob.mx/notas/docFuente/5472787) and [Secretaría de Economía standards record](https://platiica.economia.gob.mx/normalizacion/NOM-070-SCFI-2016/). Check subsequent modifications and effective dates before implementing exact rules.
- **[S6] Geographic geometry:** [INEGI Marco Geoestadístico](https://www.inegi.org.mx/programas/mg/default.html) and [official geographic identifier catalogue](https://www.inegi.org.mx/servicios/catalogounico.html). Statistical geography is an input to a locator map, not itself a declaration of spirit-designation boundaries.

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

## 7. Definition of a successful first release

A visitor can find a familiar expression or select a Mexican state, understand the spirit's plant and production context, see what makes the covered profile distinctive, and open its supporting sources. Sotol is correctly presented, the map is useful on a phone, and unavailable evidence is visible rather than invented.

The priority order is trustworthy scope and navigation, then comparison, then catalogue breadth, then educational and regional depth.

## 8. Scope alternative — Mexican Spirits Guide

Recommendation following the scope discussion: adopt **RagdollLabs Mexican Spirits Guide** (`RagdollLabs-mexican-spirits-guide`) as the umbrella and retain the five-spirit launch above. Add selected non-agave traditions in a subsequent release rather than removing sotol or expanding the first release indiscriminately. This recommendation awaits the owner's scope decision.

Good candidates:

| Tradition | Documented base and regional connection | Editorial opportunity |
| --- | --- | --- |
| Charanda | Sugarcane juice or derivatives; Michoacán | Compare specific cane-based expressions with agave spirits using the same sensory dimensions |
| Pox | Chiapas; recipes can involve maize, wheat and cane-derived sugars | Explain grain/cane composition and compare documented unflavored expressions; preserve producer variation |
| Regional Mexican rum / aguardiente de caña | For example, fresh-cane-juice distillates in Oaxaca's Sierra Mazateca | Explore fermentation and vegetal/fruity character through sourced expression reviews |

Sources checked during planning: [Agricultura on charanda](https://www.gob.mx/agricultura/articulos/charanda-tradicion-purepecha), [Agricultura on pox](https://www.gob.mx/agricultura/articulos/pox-la-bebida-que-alegra-el-corazon), and [Paranubes producer description](https://www.paranubes.com/about). These establish candidate identities and ingredients, not universal tasting profiles.

If this alternative is adopted:

- Rename the product and repo throughout before implementation; use a subtitle such as “Discover Mexico, one spirit at a time.”
- Generalize the plant schema into raw-material records supporting multiple ingredients and cane juice versus molasses, while retaining detailed agave taxonomy.
- Add material-family filters: agave, Dasylirion, sugarcane, grain/mixed materials. Keep spirit identity independent of those filters.
- Retain shared sensory axes and cross-family comparison, but avoid treating raw material as a guaranteed flavor. Add specific aroma descriptors as needed rather than redesigning the entire scale for each family.
- Scope a later “Beyond Agave” release with a small sourced sample of charanda, pox, and regional cane spirits, using the same map, catalogue, and source contracts.
- Keep liqueurs and sweetened/flavored products separate if added later; their formulation changes the meaning of sweetness comparisons. Keep fermented drinks outside the initial distilled-spirit model.
- Avoid duplicating every Mexican whisky, gin, or vodka merely because it is made in Mexico. Prioritize distinct regional traditions that improve the map and discovery experience.

The broader identity is technically a small adjustment before implementation. Its principal cost is research and editorial maintenance, so release breadth should remain bounded.
