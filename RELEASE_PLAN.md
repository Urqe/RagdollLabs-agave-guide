# RagdollLabs Agave Guide — Release Plan

Updated: 2026-10-24 · Live site: <https://urqe.github.io/RagdollLabs-agave-guide/>

This plan says what to do next and which rules every change follows. It is not a history. What each release and pair shipped, and how it was verified, is in `RELEASE_NOTES.md`. Read the notes only when a task needs the background of an earlier decision.

Companion documents: `EDITORIAL_VOICE.md` (how all reader-facing text sounds, EN and ES), `RELEASE_NOTES.md` (history and evidence), `README.md` (running, validating, deploying). `docs/archive/` holds superseded documents, such as the original Release 1 prompt; they are not instructions.

## 1. Current status and next step

- **Shipped and deployed:** Releases 1–26 and post-roadmap pairs 1–29, the last being Pair 29 (learning quality and usability audit; PR #80, merge `e9b9ec4`), plus the plan cleanup (PR #77). The learning roadmap (pairs 24–29) is complete.
- **In review:** Pair 30, Compare readability (owner request), on branch `pair-30-compare-readability`.
- **Next after that:** nothing scheduled. Section 10 lists what needs a person; section 11 lists unscheduled ideas. A new pair needs an owner decision.
- **How to work:** execute one owner-authorized pair at a time on its own branch, validate, record it in `RELEASE_NOTES.md`, open a PR and stop. The owner reviews and merges, and the merge deploys. Never start the following pair automatically.

## 2. Product and scope

A static, source-backed guide to Mexican agave spirits and their agave-adjacent neighbours, for beginners and enthusiasts, in English and natural Mexican Spanish. Each style profile describes body, taste, smoke and finish as editorial guidance, with one featured example bottle and attributed sources. The site must stay useful to readers who do not drink.

**Covered traditions (eight):** tequila, mezcal, bacanora, raicilla, tuxca, comiteco, destilado de pulque, and sotol. Sotol is distilled from Dasylirion and is always presented as a close relative, not an agave. This replaces the original foundation rule that excluded sotol.

**Scope rules**

- Exclude charanda, pox, cane-only rum/aguardiente and other non-agave spirits. They may appear only as a brief glossary distinction. Any scope change needs a separate owner decision.
- "Agave-based" does not mean 100% agave. Include established traditions with other fermentable sugars (comiteco) only with the composition verified and disclosed, and never label them 100% agave.
- Sap-derived distillates are in scope. Fermented pulque itself is educational context, not a catalogue entry.
- Keep spirit, legal designation, plant, place, production method, class and brand distinct. More content must not create new spirit categories. Espadín and tobalá are plants; pechuga, ensamble, cristalino and maturation terms are contextual terms.
- No live pricing, stock, commerce, accounts, analytics, telemetry, runtime scraping, runtime AI or generated tasting claims. Content changes are reviewed static data updates.

**Reader outcomes** (the learning roadmap, pairs 24–29): a reader can explain the major traditions; tell aroma, flavour, body, alcohol warmth and finish apart; describe sensory tendencies without claiming causes; explain how plant, place, cooking, fermentation, distillation and resting *may* affect the glass; and do and understand simple comparisons.

**Three ways in, one content model:** *Start here* (`#/start`, the five-lesson journey), *Explore* (styles, flavours, plants, places, comparison), *Look it up* (catalogue, profiles, Learn reference, glossary). These are paths through the same data, never separate copies. The nav item **Learn** names the reference chapters only.

## 3. Data model rules

Data lives in `assets/data/`: `profiles`, `bottles`, `sources`, `plants`, `processes`, `regions`, `traditions`, `chapters`, `glossary`, `backlog`, and `content-es.json` for all Spanish editorial text. `scripts/validate.mjs` enforces schema, references and Spanish parity.

- A profile is an authored description of a bounded style and context, never a generated state × spirit × plant combination.
- Brand, actual producer and exact expression are separate. A brand's office is not its production place.
- Legal designation, production place, plant origin and cultural region are separate facts.
- Common plant names are regional, not taxonomy IDs. Keep regional context and recorded uncertainty, and assign no unsupported species.
- Plant age at harvest is not spirit maturation. Wood maturation, glass resting and filtration are different processes.
- Class terms (joven, blanco, reposado, añejo…) are defined per spirit. Never reuse tequila's rules for other spirits.
- An ensamble needs composition evidence.
- **Unknown is a first-class value.** It is never zero or proof of absence, and it renders as "Not documented", distinct from "None". Missing certification data means unverified, not uncertified.
- Batch-specific ABV, maker, plant and tasting facts stay attached to the batch or bottle, never brand-wide.
- Coordinates carry an honest precision label ("approximate", municipality or region). Never move a pin by guesswork.
- Keep stable IDs. Migrate or redirect renamed profiles. When profile wording, plant identity, bottle mapping or sensory levels change, review what depends on them (suggestions, comparisons, lessons, tests).

## 4. Map rules

- **Map and list.** A local, licensed SVG of all 32 federal entities, with an equivalent state list. Selection works by tap and keyboard, never hover.
- **Coverage is app coverage only.** The neutral empty state "No profiles added here yet" does not imply that no tradition exists.
- **Legal zones.** Never shade a state as a legal production zone where a designation covers selected municipalities (bacanora, raicilla).
- **Designation layer.** A designation-boundary layer is future work. Build it only after verifying the operative declarations, amendments and matching geometry, and never draw it from producer pins.
- **Context on return.** Keep the chosen place and results when the reader returns from a profile.

## 5. Editorial and sourcing policy

**Voice:** `EDITORIAL_VOICE.md` governs all reader-facing text. In short: a knowledgeable person talking warmly about their spirit, not an encyclopedia, and never a fictional narrator. The glass comes first, caution is said once, regional warmth comes from specifics, and the Spanish is written for Mexican readers, not translated.

**Presentation rules that complement the voice guide**

- **Bottle-first.** Describe the expression's aroma, flavour, texture or finish first. Put provenance in a compact supporting line or disclosure directly below, and label producer notes and editorial synthesis as such. Keep the reviewer in the prose only when reviewers disagree, a claim rests on one impression, or it applies to one batch.
- **No invented local speech.** No invented quotations, interviews, "ask anyone" or "they will tell you", and no claim of a local author or native-speaker review that did not happen. Use regional idiom only with evidence or regional reviewer support. Avoid caricatured spelling, compulsory slang and manufactured Indigenous speech.
- **Customs are choices.** Salt, citrus, ice, accompaniments and cocktails are options, not rules. Attribute real cultural customs, and put a single "editorial suggestion" label on the serving section.
- **Observations are not causes.** Never infer cooking, plant, geography, fermentation or still type from tasting notes alone. Sensory levels are editorial tendencies, not measurements or quality scores.
- **Make Mexico tangible.** Use specific, sourced places, plants, makers' work and food. No tourism slogans, exaggerated quality claims, invented family histories or romanticised hardship.

**Evidence to prefer**

| Claim | Evidence |
| --- | --- |
| Protected name, geography, category or class | Official declarations, standards and amendments; regulator explanations as support |
| Botanical identity | Authoritative botanical or agronomic sources; keep local-name uncertainty |
| Expression ABV, age, maker, plant, process | Exact label, producer technical information or documented batch information |
| General profile body and taste | A suitable style reference plus clearly labelled editorial guidance |
| Example-bottle taste, texture, finish | One credible expression-matched review, attributed. A producer note is never presented as an independent review. |
| Process causing a flavour | Technical evidence. Never inferred from a tasting note. |
| History, sustainability, additives | Specific, dated documentation; no assumptions from wild harvest or artisanal branding |

- **Using reviews.**
  - Check that a review describes the intended expression.
  - One good review is enough for an attributed bottle summary. It does not establish consensus or batch consistency.
  - Community ratings are leads, not evidence.
  - Repeated retailer or producer copy is one account, not corroboration.
  - Factual-only catalogue entries are allowed with an explicit "not yet documented" note. Never invent tasting notes or borrow profile scores.
- **Citing.** Paraphrase in original language and link the actual supporting page. Do not reproduce reviews or substantial excerpts, and check rights before storing images.
- **Uncertainty.**
  - Distinguish "not verified" from "false" and "not certified", and make no authenticity accusations.
  - A reachable URL does not prove a claim; check that the page supports it.
  - Record verification dates for legal and changeable facts.
- **Bounded research.** Use the sources needed for the claim at hand. If evidence is missing, omit the claim and log the gap rather than researching indefinitely or inventing.

**Content facts that are easy to get wrong** (corrected in earlier pairs; keep them right)

- **Comiteco.** Protected since 6 October 2025 as the *Indicación Geográfica* "Comiteco de Comitán, Chiapas", which is not a denomination of origin. The declaration names *Agave americana* L. and cane sugars, while some references name *Agave atrovirens*; keep that difference attributed. Comiteco añejo rests in glass with white-oak branches.
- **Mezcal (NOM-070).**
  - Classes and production categories are separate. The classes are joven/blanco, madurado en vidrio, reposado, añejo, abocado con and destilado con.
  - Pechuga relates to "destilado con" and is not a new category.
  - Clay is allowed in artisanal production, not only ancestral.
  - Not all mezcal is pit-roasted or smoky.
- **Tequila.**
  - Classes include joven/oro.
  - The two composition categories say nothing about quality.
  - The NOM sets minimum ages, not ranges. A blanco may legally rest briefly below the reposado minimum.
  - Reposado starts at two months for both tequila and mezcal, though other rules differ.
- **NOM vs registration.** A NOM is a standard; the number on a label is a producer registration; a certification seal is separate again. Tuxca lacks certification under a denomination scheme but is not exempt from labelling rules.
- **Bacanora.** Prohibited 1915–1992 per Sonora's official history, legalised again in 1992, denomination of origin in 2000: two separate milestones. Use "el bacanora" consistently.
- **Raicilla.** A taberna is a distillery, not a still. The raicilla PROY-NOM is a project, not an effective standard; a rest period in one example is not a legal minimum.
- **Sotol and sustainability.** Leaving roots does not prove regrowth. Plant ages and yields are variable, sourced ranges. Wild-population pressure and overall sustainability are different questions.
- **Sap traditions.** A large cut is made at the top of the living plant and scraped over successive days (Back Alley Imports on comiteco; no registered source yet names the quiote). Repeated sap collection eventually exhausts the plant; it is not indefinite regeneration.
- **Valley vs highland tequila.** This is a tendency, and one blind tasting panel found it weaker than folklore suggests.
- **Spanish false friends.** English savoury is not *sabroso*. Lime is *limón* in Mexico, not *lima*.

**Source starting points** (claim-specific, not blanket endorsements; recheck effective versions when used)

- Tequila: NOM-006-SCFI-2012 <https://www.crt.org.mx/wp-content/uploads/2024/01/NOM-006-SCFI-2012.pdf>, CRT <https://www.crt.org.mx/nuestro-tequila/> (its English page has inconsistent reposado statements; verify against the NOM)
- Mezcal: NOM-070-SCFI-2016 <https://dof.gob.mx/normasOficiales/6437/seeco11_C/seeco11_C.html>, status <https://platiica.economia.gob.mx/normalizacion/nom-070-scfi-2016/>
- Bacanora: Sonora regulator <https://www.sonora.gob.mx/gobierno/estructura-organizacional/item/consejo-sonorense-regulador-del-bacanora>; history <https://bacanora.sonora.gob.mx/nosotros/historia> (returned 403 once; corroborate with <https://www.scielo.org.mx/scielo.php?pid=S2395-91692020000200107&script=sci_arttext>)
- Raicilla: IMPI announcement <https://www.gob.mx/impi/prensa/el-impi-protege-a-la-raicilla-como-denominacion-de-origen-207026?idiom=es-MX>, declaration <https://sidof.segob.gob.mx/notas/docFuente/5564454>; proposed standard (a project only) <https://sidof.segob.gob.mx/notas/docFuente/5650295>
- Comiteco IG: <https://sidof.segob.gob.mx/notas/docFuente/5769331>
- Tuxca: SECTUR Colima <https://sistemas.sectur.gob.mx/SECTUR/2024/DGIPT/20240409/Colima_CT_SECTUR.pdf> (research candidacy, not a definition)
- Destilado de pulque: <https://www.gob.mx/agricultura/es/agenda/segundo-encuentro-de-destiladores-de-pulque-de-hidalgo?idiom=es>
- Sotol / Dasylirion: PROFEPA <https://www.gob.mx/profepa/articulos/el-sotol-y-la-pata-de-elefante-especies-protegidas-por-la-ley?idiom=es>; CONAFOR management <https://www.gob.mx/conafor/documentos/mejores-practicas-de-manejo-y-ecuaciones-alometricas-de-biomasa-de-dasylirion-leiophyllum-en-el-estado-de-chihuahua>; wild-stand pressure (not proof of regrowth) <https://cienciasforestales.inifap.gob.mx/index.php/forestales/article/download/1609/4047?inline=1>
- Map geometry: INEGI Marco Geoestadístico <https://www.inegi.org.mx/programas/mg/default.html> (statistical geography, not designation boundaries)
- Regional vocabulary and pride (Pair 28): Sonora <https://www.gob.mx/agricultura/es/articulos/bacanora-orgullo-de-sonora-orgullodemexico> (institutional usage; do not repeat its promotional or health claims as fact)
- Regional: Guerrero <https://sic.cultura.gob.mx/ficha.php?table=gastronomia&table_id=50>; cenizo <https://www.gob.mx/inifap/articulos/sustentabilidad-del-agave-comercial-por-medio-de-su-reproduccion>; salmiana <https://www.gob.mx/conafor/documentos/manual-mejores-practicas-de-manejo-y-ecuaciones-alometricas-de-biomasa-de-agave-salmiana-sen-el-estado-de-slp>; Michoacán (2012 amendment, check later ones) <https://www.gob.mx/cms/uploads/attachment/file/494491/4.Mezcal.22.11.2012.pdf>; Puebla <https://www.gob.mx/agricultura/prensa/mezcal-poblano-llega-a-nueva-york-con-mas-de-6-mil-botellas-de-espadin-y-papalometl-agricultura>; Bahía de Banderas raicilla <https://www.bahiadebanderas.gob.mx/turismo-bdb/raicilla/> (tourism prose, not technical evidence)

## 6. Implementation conventions

- **Stack.**
  - Vanilla JavaScript with native ES modules, local JSON, inline SVG, GitHub Pages.
  - No framework, bundler, build step or service worker.
  - Keep modules small and add one only when a feature needs it.
  - `app.js` owns routing, state and landing; views render into the container they are given.
  - When `styles.css` changes, bump its `?v=` key in `index.html` (it was not bumped in Pairs 24–26; now `agave-pair30-1`).
  - Missing essential data shows a clear error state; a failed optional enrichment must not disable core browsing.
  - Search ignores accents and case and supports curated aliases.
- **Spanish.**
  - All Spanish editorial text lives in `content-es.json`, keyed by entity ID and field, and is read through the helpers in `editorial.js`.
  - Taste notes are localized only through `ES_NOTES` in `taste-notes.js`. Common-name region labels go through `commonNameRegions`; process names and effects through the `processes` bucket.
  - Validation fails on missing translations and on Spanish fields no view renders.
  - A field shown in English in the Spanish edition is marked `.untranslated-field`. The page-level note appears only then.
- **Routes and return context.**
  - Hash routes must survive reload.
  - `?origin=` on profiles and `?from=` on Compare, Learn and plant-to-glass carry the place to return to (`start:<lesson>`, `profile:<id>`, `page:plant-to-glass`, `learn`).
  - A profile opened from a lesson repeats that lesson's reason for opening it.
- **Landing and focus.**
  - A route change scrolls instantly to the view top, clearing the measured sticky header (`--header-offset`), and focuses the page heading.
  - The first load and views that place focus themselves (deep links, catalogue reveal, compare picker after an action) are left alone.
  - Language and theme switches keep focus on the switch.
  - Every page sets its own document title.
- **Accessibility.**
  - Keyboard operable, visible focus, tap targets at least `--tap`, no hover-only information.
  - Reduced motion respected; meaning never by colour alone.
  - Disclosures use `<details>` with a visible marker; reading content is never hidden behind one.
- **Look and layout.** Keep the dark green and amber identity with its light theme, the discreet ragdoll motif, the compact desktop profile layout (story left, character right) and the readable mobile layout.
- **Map layout.** On mobile, show the map, then the selected place's summary, then results.
- **Spelling.** British spelling in the English edition (Pair 28 aligns the remaining mix).
- **Tests.**
  - One file per pair (`test/pair-NN-*.test.mjs`) using `node:test` and jsdom, with a real-app boot helper for route, focus and title behaviour.
  - Change a pinned test only on purpose, keep its intent, and record the change in the release notes.
  - Headless Chromium with Playwright is available in the agent sandbox for rendered checks; the built-in or Chrome browser for the live site.

## 7. Release gates

Apply the checks that fit what the pair changed. Run each once and repeat only after a failure or a code change.

**Automated (every pair)**

- `npm run validate` passes: data, schema and references, Spanish parity, legal terminology per spirit, source IDs, sensory ranges, map IDs, safe URLs, text-injection, DOM behaviour and security.
- New behaviour has focused regression tests: direct links, reload, invalid routes, Back/Forward, focus, Spanish rendering, unknown-vs-none states, deterministic explanations (not accidental rankings).
- CI is green on the PR before merge.

**Manual (record what was actually done)**

- Rendered check of changed pages at phone (375px) and desktop widths, in EN and ES, with no horizontal overflow and no page errors.
- Keyboard flow and focus for changed interactions.
- After merge: the deploy succeeded, and the live files serve the change.
- iPhone and iPad Safari, VoiceOver, text enlargement and reduced motion are **unverified unless actually performed on those environments**. Never mark them passed from DOM or headless tests.
- Changed content is checked against its source. Automated string checks cannot certify legal accuracy, cultural authenticity or natural Spanish.

**Every pair records in `RELEASE_NOTES.md`:** what changed, sources or editorial evidence, tests (and any deliberately updated test), manual checks actually performed, what stays unverified, and the merge commit once deployed.

## 8. Maintenance contract

**A maintenance pair** implements and deploys fixes; it is not a findings-only report.

- **Review.** Review the deployed site and the changes since the last maintenance pair:
  - code quality and data contracts
  - UX on the real pages
  - data integrity and source presentation
- **Findings.** Record prioritised findings, separating confirmed defects, improvements and unverified concerns. Fix the confirmed ones, add regression tests and deploy.
- **No filler.** If nothing is wrong, document the evidence. Never manufacture a fix or make meaningless edits.
- **Deferrals.** Defer non-blocking items explicitly, with a reason.

**Ongoing rules**

- Keep content changes reviewable in git, and record an honest "content last reviewed" date rather than implying live verification.
- Rollback is by merge commit. Keep deployment simple.
- Don't collect search histories or analytics to find gaps; `assets/data/backlog.json` is the coverage backlog.

## 9. Remaining roadmap

| Priority | Pair | Outcome | Scope discipline |
| --- | --- | --- | --- |
| P1 | 27 | Curated learning comparisons (in review) | Extend the existing Compare |
| P1–P2 | 28 | Clear, warm and rigorous content across all surfaces | No catalogue expansion |
| P2 | 29 | Accessibility, usability and regression audit | Fix what can be verified |

Directional goals, not scores or release gates: beginner friendliness 7.5→9/10, learning journey 8→9.5, tasting education 7→9, overall 7.6→9. Success means beginners can describe, compare and navigate with confidence, not more words.

### Pair 27 — Comparison as a learning exercise (feature, P1) — implemented, in review

- [x] Add curated learning comparisons to the existing Compare view (no parallel engine):
  - valley blanco vs reposado (wood)
  - valley vs highland blanco (a regional tendency, not single-variable proof)
  - blanco tequila vs espadín mezcal (several variables)
  - espadín vs tobalá and/or bacanora vs raicilla, where the data supports it
- [x] Each preset asks one beginner question, points to 2–3 sensory dimensions, explains the supported differences, names the confounders and suggests a next exercise. Keep "not documented" distinct from "none".
- [x] Put the curated comparisons and the "pick two or three" instruction above the free picker. Today the empty Compare page opens on 23 pills with the instruction at the bottom.
- [x] Cross-link from the journey, flavour discovery and profiles. The free comparison of two or three profiles stays fully available.
- [x] Validate presets and their localized interpretations against normalized data, so a profile change cannot silently make a preset stale.
- **Acceptance:** readers understand what each comparison shows *and what it does not establish*. No claim that region or method is the only variable unless supported.

### Pair 28 — Editorial consistency and regional warmth (content/maintenance, P1–P2)

- [x] Apply `EDITORIAL_VOICE.md` to the profiles not yet rewritten (including their `context` paragraphs, which still open each page in the older voice), bottles, Learn and Discover, in EN and ES together.
  - **What to remove:** research-paper narration, reviewer-led openings, premature legal detail, stacked disclaimers and generic flavour text.
  - **Generated text:** the "Explore next" `sharesWhy` sentence repeats word for word; vary it by what actually differs.
- [x] Review the highland/valley, terroir, smoke, mineral, wild-fermentation and process→flavour explanations for overstated causes.
- [x] Add short, sourced context for regional makers and traditions: Sonora's bacanora, Jalisco's coastal and sierra raicilla, Oaxaca's family and palenque practices. No invented quotes or blanket cultural claims.
- [x] Audit terminology across pages. Known case: `mezcal-espadin-valles-centrales` has `category` wording that treats "joven/abocado" as an unaged class. Verify against NOM-070 and add a regression test.
- [x] Fix "sabroso" used for savoury (about 20 strings in `content-es.json`, plus the mood "Especiado y sabroso" in `locale.js`) and "lima" used for lime. Check the chapter line "(lima, no siempre limón)" in context first.
- [x] Localize `placeCoords.precision`, which renders in English on Spanish profiles.
- [x] Align the English edition to British spelling ("Flavour" and "Flavor" are mixed).
- [x] Sources:
  - Tag official sources (DOF declarations, NOM-070, the Sonora bacanora page, INIFAP, CONAFOR) with an official/regulator kind instead of `style`.
  - Remove the duplicate Difford's mezcal URL.
  - Replace the Facebook producer link with the brand's own site if one exists. *No Pal'alma site found; the link is labelled as Facebook.*
  - Prefer an independent second source when touching bottles that rely on Mezcal Reviews (about 30 entries). *Carried forward: no bottle's tasting facts changed in Pair 28, so this stays a standing rule.*
  - Register the producer pages behind Pair 18's corrected bottle origins, which are not yet in `sources.json`: <https://www.montelobos.com/our-mezcals/montelobos-tobala/> (Palenque del Tentzo, Puebla) and <https://delmaguey.com/pechuga/> (Santa Catarina Minas, Oaxaca). Cite them on those bottles.
- [x] Check each process's `sourceIds` actually support its explanation (`diffords-mezcal-what-it-is` does not describe pit roasting). Add a profile milling/extraction process ID where the method text names the tool, if useful beyond the plant-to-glass routes.
- **Acceptance:** profiles answer "what will this likely taste like, why might it, what sets it apart?" before methodology. No unsupported region-wide claims from one bottle.

### Pair 29 — Learning quality and usability audit (maintenance, P2)

- [x] Full `npm run validate`. Regression tests for every journey route, curated comparison ID, term link, Spanish parity, origin restoration and empty or unknown sensory state.
- [x] Reduce the sticky header's height on phones. At 375px it is 165–182px tall, because the five nav items wrap onto two rows. Try a single scrolling row or a compact menu, without hiding Learn or Compare.
- [x] Manual checks, recording unverified environments rather than asserting success (headless Chromium only; Safari, iOS and VoiceOver remain unverified, see section 10):
  - desktop Chrome and Safari; iPhone and iPad Safari
  - keyboard and VoiceOver
  - long translated text, tap targets, enlarged text, reduced motion
  - direct-link reload, Back/Forward
  - running-app round trips: brand → profile → back, lesson → reference → lesson, prepared comparison → lesson
- [x] Novice tasks, with real testers if available, recording whether each person succeeds unprompted (scripted editorial walkthrough; no real testers yet, see section 10):
  - find a starting lesson
  - tell nose, mouthfeel and finish apart
  - find why a mezcal might be smoky
  - complete a preset comparison
  - find an example bottle and return
- [x] Check the empty Compare page on phones: the five guided-comparison cards come first (as Pair 27 intended) and push the free picker about a screen down. Decide whether a compact list works better.
- [x] Clean up redundant copy, broken paths, stale anchors and needless UI complexity found in the audit. No new scope.
- **Acceptance:** test and task evidence supports the learning flow; issues and gaps are documented in the release notes.

### Pair 30 — Compare readability (owner request, 2026-10-25)

- [x] Show sensory levels as slider-style meters beside the words (none → high; body light → full; dashed when not documented).
- [x] No sideways scrolling on phones: the table stacks into one block per dimension, with a lettered row per style.
- [x] Short names for every profile (EN and ES, validated) and letters A/B/C, so the summary, plant/production lines, differences and guided answers stop repeating full titles. The full title appears once, in the legend.
- [x] With two or more styles the results come first; the picker moves into "Change the styles" after them, and focus follows the control the reader used.
- **Acceptance:** at 320–414px no Compare view scrolls sideways (also at 200% text); every level has a word and a meter; full titles appear only in the legend.

## 10. Needs a person (open since Pair 17; no agent can close these)

Record each as performed, with who and when, or keep it listed as pending. Never claim it done.

- **Mexican Spanish editorial review** of the Spanish edition, with feedback from readers in the represented regions (Sonora, Jalisco, Oaxaca, Chiapas, Tlaxcala, Chihuahua, Jalisco–Colima), kept separate from factual corrections.
- **Experienced-reader review** of class and category distinctions, production exceptions and source traceability, without making the beginner route encyclopedic.
- **Bottle copy review** against sources and batch scope, read aloud for warmth and repetition. Record actual reader feedback separately from editorial assessment.
- **Real-device and assistive-technology checks** (open since Pair 29): desktop Safari, iPhone and iPad Safari, VoiceOver, and a novice-task session with real testers. Pair 29 checked only headless Chromium and scripted tasks.
- **Beginner walkthrough** without alcohol: can a new reader explain what the spirit is, how to serve it, how to smell, sip and describe it, and what to try next? Cover tequila, bacanora and mezcal first. Label it an editorial walkthrough unless real users took part.

## 11. Later ideas (not scheduled)

- A designation-boundary map layer, only after verifying the operative declarations, amendments and matching geometry.
- Coverage growth from `assets/data/backlog.json`, prioritising substantive differences over filling the map, one bounded profile and example bottle at a time, each followed by a maintenance review.
