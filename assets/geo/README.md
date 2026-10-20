# Mexico states geometry

`mexico-states.svg` is a composite of the 32 Mexican state outlines from
[midir99/mexico-states-in-svg](https://github.com/midir99/mexico-states-in-svg)
(MIT License, © 2022 midir99), which were drawn from the maps published by
INEGI at <https://www.cuentame.inegi.org.mx/mapas/>.

## Transformation

Each source file contains a single state drawn on its own local coordinate
system. `scripts/build-map.py` reads each per-state SVG, computes the path
bounding box, and rewrites all states onto one shared canvas (single
`viewBox`, one `<path data-state="…">` per state, `translate()` per state,
stroke added for boundaries). No reprojection or simplification was applied —
the geometry is the source geometry, repositioned only.

- Source snapshot: cloned 2026-10-20 (commit of `midir99/mexico-states-in-svg` at clone time)
- Transformation date: 2026-10-20
- Tool: `scripts/build-map.py` (Python 3 standard library only)

To rebuild, clone the source repository and adjust `SRC` in the script, then
run `python3 scripts/build-map.py`.

Note: the map shows app coverage by state. It is not a legal production
boundary map — tequila and mezcal denominations of origin cover specific
municipalities, not whole states.
