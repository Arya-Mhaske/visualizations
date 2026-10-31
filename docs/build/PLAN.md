# MuskMelon tool build: the plan

Turns all 1,538 catalogue tools into live tools, following the CLAUDE.md §5 contract. Teaching starts August 2027.
All work goes on branch `build/tools`. Nothing is ever pushed by Claude; Arya merges and pushes.
The prompt for starting a session is in `docs/build/SESSION_PROMPT.md`; change only its `TARGET:` line.

## How to continue (for a fresh session)
1. Read `CLAUDE.md` and this file. Run `python manage.py catalogue_status --todo`.
2. Take the next unticked box in the queue. Review its `docs/build/manifest.json` entries by hand against the JSON (set
   `"reviewed": true`, correct `archetype`, add `"formula": false` if a tool truly has no equation).
3. Build the box in WHY, HOW, APP order. For each tool: a template in `templates/tools/<subject>/<box>/<slug>.html`, a script
   in `static/viz/tools/<subject>/<slug>.js`, and pure maths in `<slug>-math.js` if it computes anything worth checking.
4. Read the tool's `summary` and `spec` and follow them. The student's action must reveal the reason in the title.
5. Add `catalogue/tool_tests/test_<subject>_<box>.py`: expected numbers worked out in Python, then `js()` on the real module.
6. Run `python manage.py smoke_tools --box <subject>/<box>`, then `python manage.py test`, and `collectstatic` with `DEBUG=False`.
7. Tick the box here, add anything learned, and commit once: `tools(<subject>/<box>): N tools live`.
8. Doubts go to `QUESTIONS.md` with a proposed fix. Skip that tool. Never change a slug. Never push.
9. Before each tier milestone run `python manage.py smoke_tools --all`.
10. When context is nearly full, finish the tool, commit, and leave this file ready.

**Windows shell note:** long bash heredocs containing apostrophes fail in the Bash tool. Use the Write tool for files.

## Pace and estimate (revised after the pilots)
The first session built the foundation and 31 tools. Tool scripts average about 3 KB on the engines, far under the 25 KB budget.
- Expect about 35–45 tools a session, fewer when a box needs a new engine (`rays`, `phasor`, `circuit`).
- Tier 1: 30–45 sessions. Tier 2: 8–12 sessions (linear and abstract algebra are harder to picture).
- Tier 1 by August 2027 needs about one session a week.

**Before a box is done:** run the whole of `python manage.py test`, and stop if it fails. Look at a contact sheet of the stages.

## Anatomy of a tool
Template (only what differs; the view supplies the H1, badges, aids, nav, source line and script tag):
```django
{% extends "tools/base_tool.html" %}
{% block lead %}One or two sentences.{% endblock %}
{% block why_text %}The takeaway.{% endblock %}
{% block try_items %}<li>Prompt</li><li>Prompt</li>{% endblock %}
```
Other blocks are listed at the top of `templates/tools/base_tool.html`. `{% block formula %}{% endblock %}` removes the formula strip;
pair it with `"formula": false` in the manifest.

Script: `const C = readColors()`, one `state` object, `createStage(el, draw, {label})`, `bindControls(panel, state, spec, onChange)`
with a `readout` entry, `liveFormula(el, build)`. Call `formula.update(state)` and `stage.invalidate()` in `onChange`.

## Archetypes
| Name | Renders | Library |
|---|---|---|
| geometry | draggable points, lines, arcs | `stage` `handles`, `draw`, `vec` |
| plot | function graphs with sliders | `plot` |
| sim | time-stepped physics | `sim`, `plot` |
| rays | optics, field lines | to be written (first optics box) |
| phasor | rotating vectors, AC | to be written (Oscillations or AC) |
| space3d | 3D scenes | `project3d`, `vec` |
| chance | sampling with a seeded generator | `rng` |
| discrete | exact finite objects: grids, trees, Venn, tables | `discrete` |
| stepper | worked procedures | `stepper` |
| drill | generated practice | `drill` |
| table | data and comparison explorers | `controls`, `format` |

Counts by archetype: run `python docs/build/classify.py`. WHY tools are small scripts on an engine, not new engines.

## Library (`static/viz/lib/`)
Each file's header comment is its documentation.
- `stage.js`: `createStage`, `createSvgStage`, `svgEl`, `enableDrag`, `handles`
- `draw.js`: `line`, `arrow`, `dot`, `poly`, `wedge`, `arc`, `label`, `TAU`
- `plot.js`: `createPlot`, `sample`, `niceStep`, `tickValues`
- `controls.js`: `bindControls`, `readout`, `bindRange`, `bindChoice`
- `formula.js`: `liveFormula`, `renderTex`, `plainTex`
- `sim.js`: `createSim`, `transport`, `verletStep`, `rk4Step`
- `anim.js`: `createLoop`, `reducedMotion`
- `vec.js`: `v2`, `v3`
- `project3d.js`: `createCamera`, `rotation`, `splitQuad`
- `rng.js`: `createRng`
- `format.js`: `sig`, `fixed`, `sci`, `withUnit`, `frac`, `piFrac`, `deg`, `gcd`
- `stepper.js`: `createStepper`
- `drill.js`: `createDrill`, `isRight`
- `discrete.js`: `dotGrid`, `dotLayout`, `cellGrid`, `drawTree`, `venn`, `drawRelation`
- `tool.js`: `createTool`
- `draw.js`'s neighbour `docs/build/sheet.py` makes the contact sheet for a box
- `colors.js`: `readColors`

If you write a helper twice, move it here. Keep each tool's JS under 25 KB.

## Learned so far
- `lib/tool.js` removes the wiring from every tool. A typical WHY tool is 50–90 lines on top of it, and one box-level
  `_<box>-math.js` beats one maths file per tool: fewer files and one test file.
- `tpl`-style generation of the templates is fine, but check every line of copy: facts in `why` text need tests too.
- Passing the smoke test proves nothing about the picture. **Look at a contact sheet of every box.** Pilot 1 passed the smoke test
  with a belt wrapped the wrong way round a pulley.
- `createPlot` takes `box` for stacked graphs (`viz-stage--tall` gives three of them room). `drill` questions take `figure`.
- Sims: create the sim before `createTool`, so controls can use `transport(sim)` directly, and use `onChange` to restart it.
- 3D: `splitQuad` crossing planes before `cam.faces`, and choose a default yaw that doesn't look along the key triangle. Add a
  "Drag to turn the view" hint. Orbit stages block page scroll on touch; students scroll from the panel. Revisit if it annoys.
- Element screenshots at 360 px can show the sticky navbar over the stage. That is the capture, not a bug.
- HTML stages: `createTool({ dom })` for grids of real buttons. Rotary handles need `nudge`, or arrow keys do nothing.
- `smoke_tools` now moves a slider and presses arrow keys. Clicks, sims and drills were checked by hand in the pilots.
- `venn` paints each region separately, so complements and overlaps shade exactly. Sparse HTML stages need a default that already
  shows the idea: the empty-set tool first opened on six blank buttons.
- Check textbook examples against the book by hand: Table 2.1 uses an interval centred on t, not one starting at t.

## Box queue
Tier 1 is orders 1–25; Tier 2 is orders 26–30. The Class XI block runs first, then Class XII, alternating physics and NCERT-order
maths. Supporting maths boxes fill the maths slot when NCERT maths runs out. Generated by `python docs/build/classify.py --queue`.
Mark a finished box with ✓ in the last column. Manifest entries are hand-reviewed only for the pilots so far; review each box when
it reaches the front of the queue.

| # | Box | Tools | Tier | Done |
|---|---|---|---|---|
| P1 | `trigonometry/angles-arcs` | 12 | 1 | ✓ |
| P2 | `measurement-motion/motion-in-a-straight-line` | 8 | 1 | ✓ |
| P3 | `vectors-3d/3d-coordinates` | 4 | 1 | ✓ |
| P4 | `sequences-probability/conditional-probability-bayes` | 8 | 1 | ✓ |
| 1 | `measurement-motion/units-measurement` | 11 | 1 | |
| 2 | `numbers-algebra/sets` | 11 | 1 | ✓ |
| 3 | `measurement-motion/dimensions` | 7 | 1 | |
| 4 | `functions-graphs/coordinate-plane` | 7 | 1 | |
| 5 | `measurement-motion/uniform-acceleration` | 8 | 1 | |
| 6 | `functions-graphs/what-is-a-function` | 8 | 1 | |
| 7 | `measurement-motion/vectors` | 7 | 1 | |
| 8 | `functions-graphs/properties-library` | 7 | 1 | |
| 9 | `measurement-motion/projectiles` | 9 | 1 | |
| 10 | `trigonometry/similar-triangles` | 7 | 1 | |
| 11 | `measurement-motion/circular-motion` | 7 | 1 | |
| 12 | `trigonometry/right-triangle-ratios` | 12 | 1 | |
| 13 | `forces-energy/inertia-the-first-law` | 6 | 1 | |
| 14 | `trigonometry/unit-circle` | 12 | 1 | |
| 15 | `forces-energy/second-law-momentum` | 8 | 1 | |
| 16 | `trigonometry/sine-cosine-graphs` | 12 | 1 | |
| 17 | `forces-energy/third-law-momentum-conservation` | 7 | 1 | |
| 18 | `trigonometry/tan-cot-sec-csc` | 9 | 1 | |
| 19 | `forces-energy/equilibrium-free-body-diagrams` | 5 | 1 | |
| 20 | `trigonometry/identities` | 12 | 1 | |
| 21 | `forces-energy/friction` | 8 | 1 | |
| 22 | `numbers-algebra/complex-numbers` | 8 | 1 | |
| 23 | `forces-energy/circular-dynamics` | 7 | 1 | |
| 24 | `numbers-algebra/quadratic-equations` | 8 | 1 | |
| 25 | `forces-energy/work-kinetic-energy` | 8 | 1 | |
| 26 | `numbers-algebra/inequalities-absolute-value` | 8 | 1 | |
| 27 | `forces-energy/potential-energy-conservation` | 9 | 1 | |
| 28 | `sequences-probability/counting` | 8 | 1 | |
| 29 | `forces-energy/power` | 5 | 1 | |
| 30 | `sequences-probability/binomial-theorem` | 6 | 1 | |
| 31 | `forces-energy/collisions` | 7 | 1 | |
| 32 | `sequences-probability/sequences` | 3 | 1 | |
| 33 | `rotation-gravitation/centre-of-mass` | 7 | 1 | |
| 34 | `sequences-probability/arithmetic-sequences` | 4 | 1 | |
| 35 | `rotation-gravitation/rotation-kinematics` | 5 | 1 | |
| 36 | `sequences-probability/geometric-sequences-series` | 10 | 1 | |
| 37 | `rotation-gravitation/torque-equilibrium` | 8 | 1 | |
| 38 | `functions-graphs/lines-slope` | 10 | 1 | |
| 39 | `rotation-gravitation/moment-of-inertia` | 5 | 1 | |
| 40 | `conics-curves/what-are-conics` | 3 | 1 | |
| 41 | `rotation-gravitation/rotational-dynamics` | 4 | 1 | |
| 42 | `conics-curves/parabola` | 6 | 1 | |
| 43 | `rotation-gravitation/angular-momentum` | 5 | 1 | |
| 44 | `conics-curves/ellipse` | 7 | 1 | |
| 45 | `rotation-gravitation/kepler-s-laws` | 5 | 1 | |
| 46 | `conics-curves/hyperbola` | 6 | 1 | |
| 47 | `rotation-gravitation/universal-gravitation` | 6 | 1 | |
| 48 | `limits-continuity/why-calculus` | 5 | 1 | |
| 49 | `rotation-gravitation/g-above-below-the-surface` | 4 | 1 | |
| 50 | `limits-continuity/the-limit-idea` | 6 | 1 | |
| 51 | `rotation-gravitation/gravitational-energy-escape` | 6 | 1 | |
| 52 | `limits-continuity/limit-laws` | 6 | 1 | |
| 53 | `rotation-gravitation/satellites` | 7 | 1 | |
| 54 | `derivatives/what-is-a-derivative` | 7 | 1 | |
| 55 | `properties-of-matter/stress-strain` | 7 | 1 | |
| 56 | `derivatives/differentiation-rules` | 7 | 1 | |
| 57 | `properties-of-matter/elastic-moduli` | 7 | 1 | |
| 58 | `derivatives/trig-derivatives` | 4 | 1 | |
| 59 | `properties-of-matter/pressure-pascal` | 9 | 1 | |
| 60 | `sequences-probability/statistics-measuring-spread` | 9 | 1 | |
| 61 | `properties-of-matter/flow-bernoulli` | 9 | 1 | |
| 62 | `sequences-probability/probability` | 8 | 1 | |
| 63 | `properties-of-matter/viscosity` | 5 | 1 | |
| 64 | `numbers-algebra/number-systems` | 11 | 1 | |
| 65 | `properties-of-matter/surface-tension` | 8 | 1 | |
| 66 | `numbers-algebra/exponents-roots` | 9 | 1 | |
| 67 | `heat-thermodynamics/temperature` | 6 | 1 | |
| 68 | `numbers-algebra/polynomials-factoring` | 9 | 1 | |
| 69 | `heat-thermodynamics/thermal-expansion` | 6 | 1 | |
| 70 | `numbers-algebra/rational-expressions` | 6 | 1 | |
| 71 | `heat-thermodynamics/heat-capacity-calorimetry` | 5 | 1 | |
| 72 | `numbers-algebra/linear-equations-formulas` | 7 | 1 | |
| 73 | `heat-thermodynamics/change-of-state` | 5 | 1 | |
| 74 | `numbers-algebra/variation` | 5 | 1 | |
| 75 | `heat-thermodynamics/heat-transfer` | 7 | 1 | |
| 76 | `functions-graphs/transformations` | 6 | 1 | |
| 77 | `heat-thermodynamics/first-law` | 6 | 1 | |
| 78 | `functions-graphs/quadratic-functions` | 8 | 1 | |
| 79 | `heat-thermodynamics/thermodynamic-processes` | 5 | 1 | |
| 80 | `functions-graphs/polynomial-functions` | 11 | 1 | |
| 81 | `heat-thermodynamics/second-law-engines` | 8 | 1 | |
| 82 | `functions-graphs/rational-functions` | 7 | 1 | |
| 83 | `heat-thermodynamics/kinetic-theory-of-gases` | 7 | 1 | |
| 84 | `functions-graphs/modelling-with-data` | 6 | 1 | |
| 85 | `heat-thermodynamics/equipartition-specific-heats` | 5 | 1 | |
| 86 | `functions-graphs/area-by-stretching` | 5 | 1 | |
| 87 | `heat-thermodynamics/mean-free-path` | 4 | 1 | |
| 88 | `trigonometry/waves-oscillations` | 12 | 1 | |
| 89 | `oscillations-waves/periodic-motion` | 4 | 1 | |
| 90 | `trigonometry/solving-any-triangle` | 12 | 1 | |
| 91 | `oscillations-waves/shm-circular-motion` | 6 | 1 | |
| 92 | `trigonometry/vectors` | 12 | 1 | |
| 93 | `oscillations-waves/force-law-energy` | 5 | 1 | |
| 94 | `trigonometry/polar-complex` | 11 | 1 | |
| 95 | `oscillations-waves/the-simple-pendulum` | 6 | 1 | |
| 96 | `exponentials-logs/exponential-growth` | 6 | 1 | |
| 97 | `oscillations-waves/what-is-a-wave` | 4 | 1 | |
| 98 | `exponentials-logs/the-number-e` | 4 | 1 | |
| 99 | `oscillations-waves/travelling-waves` | 6 | 1 | |
| 100 | `exponentials-logs/logarithms` | 9 | 1 | |
| 101 | `oscillations-waves/superposition-reflection` | 4 | 1 | |
| 102 | `exponentials-logs/log-scales` | 6 | 1 | |
| 103 | `oscillations-waves/standing-waves-music` | 6 | 1 | |
| 104 | `exponentials-logs/exp-log-equations` | 4 | 1 | |
| 105 | `oscillations-waves/beats` | 3 | 1 | |
| 106 | `exponentials-logs/money-finance` | 7 | 1 | |
| 107 | `electrostatics/electric-charge` | 7 | 1 | |
| 108 | `functions-graphs/combining-inverting` | 12 | 1 | |
| 109 | `electrostatics/coulomb-s-law` | 5 | 1 | |
| 110 | `trigonometry/inverses-equations` | 12 | 1 | |
| 111 | `electrostatics/electric-field-field-lines` | 6 | 1 | |
| 112 | `systems-matrices/matrices-row-reduction` | 4 | 1 | |
| 113 | `electrostatics/flux-gauss-s-law` | 5 | 1 | |
| 114 | `systems-matrices/matrix-algebra` | 10 | 1 | |
| 115 | `electrostatics/electric-potential` | 7 | 1 | |
| 116 | `systems-matrices/determinants-cramer` | 11 | 1 | |
| 117 | `electrostatics/conductors-dielectrics` | 6 | 1 | |
| 118 | `limits-continuity/continuity` | 5 | 1 | |
| 119 | `electrostatics/capacitors` | 7 | 1 | |
| 120 | `derivatives/chain-rule` | 4 | 1 | |
| 121 | `current-magnetism/current-drift` | 6 | 1 | |
| 122 | `derivatives/implicit-differentiation` | 4 | 1 | |
| 123 | `current-magnetism/resistance-temperature` | 5 | 1 | |
| 124 | `derivatives/exp-log-inverse-derivatives` | 7 | 1 | |
| 125 | `current-magnetism/cells-emf-power` | 5 | 1 | |
| 126 | `derivatives/rates-in-science` | 6 | 1 | |
| 127 | `current-magnetism/kirchhoff-wheatstone` | 4 | 1 | |
| 128 | `derivative-applications/maxima-minima` | 6 | 1 | |
| 129 | `current-magnetism/magnetic-force-on-charges` | 5 | 1 | |
| 130 | `derivative-applications/mean-value-theorem` | 4 | 1 | |
| 131 | `current-magnetism/sources-of-magnetic-field` | 7 | 1 | |
| 132 | `derivative-applications/shape-of-a-graph` | 7 | 1 | |
| 133 | `current-magnetism/loops-meters` | 5 | 1 | |
| 134 | `derivative-applications/optimisation` | 6 | 1 | |
| 135 | `current-magnetism/magnetism-matter` | 6 | 1 | |
| 136 | `derivative-applications/antiderivatives` | 4 | 1 | |
| 137 | `induction-ac-em/faraday-lenz` | 5 | 1 | |
| 138 | `integrals/area-distance` | 4 | 1 | |
| 139 | `induction-ac-em/inductance-generators` | 5 | 1 | |
| 140 | `integrals/the-definite-integral` | 6 | 1 | |
| 141 | `induction-ac-em/ac-basics` | 6 | 1 | |
| 142 | `integrals/fundamental-theorem` | 4 | 1 | |
| 143 | `induction-ac-em/lcr-resonance` | 5 | 1 | |
| 144 | `integrals/substitution` | 4 | 1 | |
| 145 | `induction-ac-em/power-transformers` | 4 | 1 | |
| 146 | `integrals/integration-by-parts` | 4 | 1 | |
| 147 | `induction-ac-em/electromagnetic-waves` | 6 | 1 | |
| 148 | `integrals/trig-integrals-substitution` | 5 | 1 | |
| 149 | `optics/mirrors` | 5 | 1 | |
| 150 | `integrals/partial-fractions-strategy` | 6 | 1 | |
| 151 | `optics/refraction-total-internal-reflection` | 5 | 1 | |
| 152 | `integral-applications/area-between-curves` | 5 | 1 | |
| 153 | `optics/lenses` | 5 | 1 | |
| 154 | `differential-equations/what-is-a-differential-equation` | 5 | 1 | |
| 155 | `optics/prism-dispersion` | 4 | 1 | |
| 156 | `differential-equations/separable-equations` | 8 | 1 | |
| 157 | `optics/optical-instruments` | 5 | 1 | |
| 158 | `differential-equations/linear-first-order` | 3 | 1 | |
| 159 | `optics/huygens-wavefronts` | 4 | 1 | |
| 160 | `vectors-3d/vectors-in-space` | 6 | 1 | |
| 161 | `optics/interference` | 5 | 1 | |
| 162 | `vectors-3d/cross-product` | 5 | 1 | |
| 163 | `optics/diffraction-polarisation` | 6 | 1 | |
| 164 | `vectors-3d/lines-planes` | 7 | 1 | |
| 165 | `modern-physics/photoelectric-effect` | 6 | 1 | |
| 166 | `systems-matrices/inequalities-linear-programming` | 7 | 1 | |
| 167 | `modern-physics/matter-waves` | 4 | 1 | |
| 168 | `sequences-probability/random-variables-expectation` | 5 | 1 | |
| 169 | `modern-physics/atoms` | 6 | 1 | |
| 170 | `exponentials-logs/growth-decay-cooling` | 6 | 1 | |
| 171 | `modern-physics/the-nucleus` | 5 | 1 | |
| 172 | `exponentials-logs/e-ln-as-areas` | 7 | 1 | |
| 173 | `modern-physics/radioactivity-nuclear-energy` | 5 | 1 | |
| 174 | `exponentials-logs/hyperbolic-functions` | 4 | 1 | |
| 175 | `modern-physics/energy-bands` | 5 | 1 | |
| 176 | `sequences-probability/mathematical-induction` | 3 | 1 | |
| 177 | `modern-physics/intrinsic-extrinsic-semiconductors` | 6 | 1 | |
| 178 | `conics-curves/rotation-of-axes` | 4 | 1 | |
| 179 | `modern-physics/p-n-junction-diode` | 6 | 1 | |
| 180 | `conics-curves/polar-conics` | 3 | 1 | |
| 181 | `modern-physics/rectifiers` | 5 | 1 | |
| 182 | `conics-curves/parametric-curves` | 8 | 1 | |
| 183 | `systems-matrices/linear-systems` | 5 | 1 | |
| 184 | `systems-matrices/nonlinear-systems` | 3 | 1 | |
| 185 | `systems-matrices/partial-fractions` | 3 | 1 | |
| 186 | `limits-continuity/the-precise-definition` | 4 | 1 | |
| 187 | `limits-continuity/limits-at-infinity` | 4 | 1 | |
| 188 | `derivatives/linear-approximation` | 6 | 1 | |
| 189 | `derivatives/parametric-polar-slopes` | 6 | 1 | |
| 190 | `derivative-applications/l-hopital-s-rule` | 5 | 1 | |
| 191 | `derivative-applications/newton-s-method` | 4 | 1 | |
| 192 | `integrals/net-change` | 3 | 1 | |
| 193 | `integrals/numerical-integration` | 4 | 1 | |
| 194 | `integrals/improper-integrals` | 4 | 1 | |
| 195 | `integral-applications/volumes` | 7 | 1 | |
| 196 | `integral-applications/work` | 3 | 1 | |
| 197 | `integral-applications/average-value` | 4 | 1 | |
| 198 | `integral-applications/arc-length-surface-area` | 7 | 1 | |
| 199 | `integral-applications/physics-engineering` | 5 | 1 | |
| 200 | `integral-applications/economics-biology` | 3 | 1 | |
| 201 | `integral-applications/continuous-probability` | 5 | 1 | |
| 202 | `differential-equations/direction-fields-euler` | 4 | 1 | |
| 203 | `differential-equations/population-models` | 3 | 1 | |
| 204 | `differential-equations/predatorprey` | 3 | 1 | |
| 205 | `differential-equations/second-order-equations` | 6 | 1 | |
| 206 | `differential-equations/series-solutions` | 2 | 1 | |
| 207 | `vectors-3d/quadric-surfaces` | 3 | 1 | |
| 208 | `vectors-3d/space-curves-motion` | 6 | 1 | |
| 209 | `vectors-3d/cylindrical-spherical-coordinates` | 4 | 1 | |
| 210 | `infinite-series/sequences-limits` | 3 | 2 | |
| 211 | `infinite-series/series-convergence` | 4 | 2 | |
| 212 | `infinite-series/convergence-tests` | 9 | 2 | |
| 213 | `infinite-series/power-series` | 4 | 2 | |
| 214 | `infinite-series/taylor-series` | 11 | 2 | |
| 215 | `multivariable/functions-of-two-variables` | 4 | 2 | |
| 216 | `multivariable/partial-derivatives` | 4 | 2 | |
| 217 | `multivariable/tangent-planes-chain-rule` | 6 | 2 | |
| 218 | `multivariable/gradient` | 5 | 2 | |
| 219 | `multivariable/max-min-lagrange` | 7 | 2 | |
| 220 | `multivariable/double-integrals` | 5 | 2 | |
| 221 | `multivariable/mass-moments-surface-area` | 4 | 2 | |
| 222 | `multivariable/triple-integrals-coordinates` | 6 | 2 | |
| 223 | `vector-calculus/vector-fields` | 3 | 2 | |
| 224 | `vector-calculus/line-integrals` | 8 | 2 | |
| 225 | `vector-calculus/green-s-theorem` | 3 | 2 | |
| 226 | `vector-calculus/curl-divergence` | 3 | 2 | |
| 227 | `vector-calculus/surfaces-flux` | 5 | 2 | |
| 228 | `vector-calculus/stokes-divergence-theorems` | 5 | 2 | |
| 229 | `linear-algebra/vectors-combinations` | 5 | 2 | |
| 230 | `linear-algebra/elimination-lu` | 6 | 2 | |
| 231 | `linear-algebra/matrix-multiplication-inverses` | 4 | 2 | |
| 232 | `linear-algebra/the-four-subspaces` | 7 | 2 | |
| 233 | `linear-algebra/orthogonality-projections` | 4 | 2 | |
| 234 | `linear-algebra/least-squares` | 4 | 2 | |
| 235 | `linear-algebra/determinants` | 5 | 2 | |
| 236 | `linear-algebra/eigenvalues` | 6 | 2 | |
| 237 | `linear-algebra/symmetric-positive-definite` | 3 | 2 | |
| 238 | `linear-algebra/svd-pca` | 4 | 2 | |
| 239 | `linear-algebra/transformations-good-bases` | 5 | 2 | |
| 240 | `linear-algebra/applications` | 8 | 2 | |
| 241 | `abstract-algebra/proofs-sets-relations` | 3 | 2 | |
| 242 | `abstract-algebra/the-integers` | 5 | 2 | |
| 243 | `abstract-algebra/what-is-a-group` | 6 | 2 | |
| 244 | `abstract-algebra/cyclic-groups` | 4 | 2 | |
| 245 | `abstract-algebra/permutations-dihedral-groups` | 5 | 2 | |
| 246 | `abstract-algebra/cosets-lagrange` | 5 | 2 | |
| 247 | `abstract-algebra/codes-cryptography` | 6 | 2 | |
| 248 | `abstract-algebra/isomorphism-homomorphism` | 5 | 2 | |
| 249 | `abstract-algebra/symmetry-actions-counting` | 7 | 2 | |
| 250 | `abstract-algebra/rings-polynomials` | 6 | 2 | |
| 251 | `abstract-algebra/boolean-algebra-circuits` | 4 | 2 | |
| 252 | `abstract-algebra/fields-galois-theory` | 6 | 2 | |
