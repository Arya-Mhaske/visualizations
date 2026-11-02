# MuskMelon tool build: the plan

Turns all 1,538 catalogue tools into live tools, following the CLAUDE.md §5 contract. Teaching starts August 2027.
All work goes on branch `build/tools`. Nothing is ever pushed by Claude; Arya merges and pushes.
The prompt for starting a session is in `docs/build/SESSION_PROMPT.md`; change only its `TARGET:` line.
To run sessions unattended: `python docs/build/run_targets.py --count N`, working down `docs/build/targets.txt`.

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
| rays | optics, field lines | `rays`, `field` |
| phasor | rotating vectors, AC | `phasor`, `sim` (`createClock`), `timeline` |
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
- `sim.js`: `createSim`, `createClock`, `transport`, `verletStep`, `rk4Step`
- `phasor.js`: `phasor` (`shadowY` for SHM, `shadowX` for AC), `project`, `height`, `addPhasors`, `wave` (a trace flowing away from the arrow)
- `anim.js`: `createLoop`, `reducedMotion`
- `vec.js`: `v2`, `v3`
- `project3d.js`: `createCamera`, `rotation`, `splitQuad`
- `rng.js`: `createRng`
- `format.js`: `sig`, `fixed`, `sci`, `withUnit`, `frac`, `piFrac`, `deg`, `gcd`
- `stepper.js`: `createStepper`
- `drill.js`: `createDrill`, `isRight`
- `discrete.js`: `dotGrid`, `dotLayout`, `cellGrid`, `drawTree`, `venn`, `drawRelation`
- `tool.js`: `createTool`
- `circuit.js`: `solveLinear`, `solveCircuit` (exact DC nodal solver), `resistor`, `cell`, `inductor`, `capacitor`, `flowDots`
- `field.js`: `fieldAt`, `potentialAt`, `traceLine` (RK4 along the field), `fieldLines`, `drawLine`, `drawCharge`
- `rays.js`: `reflect`, `refract`, `hitCircle`, `axisCrossing`, `unit`, `createBench` (equal-scale optical bench: `axis`, `mark`, `object`, `mirror`, `ray`, `rayTo`)
- `timeline.js`: `createTimeline` (a looping `state.t` shared by a time slider and Play; for exact-formula animations)
- `draw.js`'s neighbour `docs/build/sheet.py` makes the contact sheet for a box
- `numline.js`: `numberLine` (a canvas number line: `axis`, `dot` open or closed, `span` with open ends and ±∞ arrows, `arrow`, `text`; `px`/`val` convert)
- `graph.js`: `deriv` (central slope), `tangent`/`direction` (a tangent segment; `direction` also does vertical lines), `stackBoxes(n)` (n stacked `createPlot` boxes), `slopeTicks` (a field of slope marks at their true on-screen slope)
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
- Exact-formula animations: `createClock` plus `transport(clock)`; create the clock before `createTool`. One maths file can serve
  neighbouring boxes (`_shm-math.js`). Use one commit per box even then.
- Exact decimals: `_units-measurement-math.js` holds `{n, e}` decimals with `parseDecimal`, `sigFigs`, `sigMask`, `roundDecimals`,
  `roundSig`, `showSig` and a drill question generator. Reuse it for any later box that rounds or counts figures
  (`numbers-algebra/exponents-roots`, `dimensions`). Floats are never used to round, so 2.735 and 2.745 behave.
- Drill tests: build questions for 300 seeds and recompute each answer with Python `Decimal`. Check half-even and half-up agree,
  so no drill answer hangs on a rounding convention. `createDrill` now labels its stage ("Practice questions") for `smoke_tools`.
- Sheet cleanup that recurs: long canvas labels clip at 360 px (keep under about 30 characters), and a stage's tall layout leaves
  rows far apart at 1280 px. Check both sheets.
- `draw.spring(ctx, x1, x2, y, {color, width})` draws a coil spring; use it for any spring–mass scene (pendulum and wave boxes may too).
  `_force-law-math.js` has RK4 for power-law forces (`trajectory`, `period`, `gap`), spring energies, and the damped base-shaking
  response (`response`, `lag`, `naturalFreq`). Its tests check the response against a Python integration of the equation of motion.
- Odd power-law forces (x², x³, √x) differ from a cosine by only 3–7% of A, too little to see. Show the period change instead
  (a full swing against a half swing drawn double). Check how big a "visible" difference really is before promising it in the copy.
- Absolute base-excitation phase tends to π/2, not π, at high frequency. Don't assume a lag runs to half a turn.
- `_pendulum-math.js` has `swing()` (RK4 pendulum, with optional damping and mass), `exactPeriod` (AGM elliptic K), `stopwatch`, and
  series ratios. For an exact nonlinear or damped motion, precompute `swing()` once per control change and let `createClock` only
  move the playhead; `at(samples, dt, t)` reads it. Tests compare it with an independent Python RK4 and the period integral.
- Don't guess numbers for test expectations: the 170° period ratio is 2.44, not 2.2. Size plot windows from computed values.
- At 360 px a tall stage is narrow: size bob strings by `min(stage.h·k, stage.w·k)`, or they swing off the edge.
- `_wave-basics-math.js` has the Gaussian `pulse`/`pulseVel`/`energyCentre`, slinky `shift`/`densityRatio` (needs A·k < 1 so coils never
  cross; the tool clamps A to 0.9/k), `airLayout`/`relay` (a seeded nested molecule list and a breadth-first "hand-off" chain, used to show
  sound failing when air is removed), and `standing`. The sheet script does not load KaTeX, so formulas show as raw TeX there: that is normal.
- `_travelling-waves-math.js` has `wave`, `riderX` (a point of constant phase, either direction), `stringSpeed`, `pulseY`, Newton/Laplace
  speeds and `isoP`/`adiaP` curves, and `MATERIALS` (stiffness and density of air, water, aluminium, steel, with `materialSpeed`). Long races
  (a push down 100 m of steel) run in slow motion with a stated factor (×20); say so in a note. Log-scale bars: put a long bar's label inside it.
- Wide stages (16:9) are too short at 360 px for two-line plots; use square or tall for anything with a ruler or several labels.
- `lib/timeline.js` gives a slider-plus-Play time axis (`state.t`, looping): put `{ key: 't', ... }` and `transport(line.clock)` in the controls and
  call `line.sync()` from `onChange`. Use it instead of a bare `createClock` whenever a student should scrub time.
- `_superposition-math.js` has `field` (sum of Gaussian pulses, optionally between two fixed/free walls by the method of images, period 2L/v),
  `wallField`/`wallImage` (one wall), `resultant`/`kindOf` (two sine waves), and `energy` (conserved between walls; it is still 100% when two
  pulses cancel, because the energy is all in the motion). Its tests check the string against an independent leapfrog solution of the wave
  equation (Courant number 1). In such tests put every sampled x on a grid node (the first run failed on half-node rounding).
  Next box (`standing-waves-music`) can reuse `field` with `walls: -1` for standing waves from two travelling waves.
- `lib/tone.js` (`createTone`: `set(freq)`, `level(x)`, `supported`) plays a pure sine through Web Audio; call it from a control's handler (browsers need a click first).
  Use it for any later box with sound (`beats`). The smoke test does not hear anything, so check by ear on a real device.
- `_standing-waves-math.js`: `modeFreq/shape/nodesOf/antinodesOf` for string, open and closed pipes; `drivenPhasor/drivenParts/swingGain` is a string
  driven at x = 0 and fixed at x = L, losing 15% per round trip, summed over N round trips in closed form (a WHY for "only some frequencies fit":
  returns pile up in step only at whole half-wavelengths); `noteOf` (name and cents), `fretLength`; the resonance column (`airSpeed`, `loudness`,
  `resonanceLengths`, end correction 0.6 r). Tests check the driven string against a direct sum of real sine passes. Don't guess test values:
  two of my hand-guessed numbers (5.5, 82.7) were off in the last digit.
- At 360 px long axis labels collide with ticks: use short ones ('ν (Hz)', 'L (m)').
- Check textbook examples against the book by hand: Table 2.1 uses an interval centred on t, not one starting at t.
- `lib/tone.js`: all tones on a page now share one AudioContext, so two `set()` calls in one handler start in step. `_beats-math.js` has the beat
  identities, `gameString` (a hidden μ, the only hidden value, with a switch that reveals the pitch) and a guitar chain tuned down from the fork
  (`GUITAR`, `openFreqs`, `pairBeats`, `closure`, `detune`). `_beats-view.js` has `beatStrip`, the lobes; draw it before `axes`, or its fill hides the ticks.
  Audible waves can't be drawn in real time: hold one note still and show the other's slide (a strobe view), and say so in a note. A time loop stays
  seamless if it lasts a whole number of cycles of every allowed frequency (0.5 Hz steps, 2 s loop). A tool may have to reach what a student does in
  the wrong order: the guitar's peg range covers matching a neighbour that is still out of tune. `smoke_tools` fails a page with over 4 Try prompts.

- `_current-drift-math.js` has NCERT constants (`E_CHARGE` 1.6e-19, `N_COPPER` 8.5e28, `RHO_COPPER`), `driftSpeed`, seeded exponential `flights` with
  `speedAt`/`distanceAt`/`meanDrift`, `arrivals`/`countBy` (one dot is one coulomb), a diode model, and wire heating. Reuse it in `resistance-temperature` and
  `cells-emf-power`. Random exponential gaps give v_d = eEτ/m; fixed gaps of τ give half of that, and the page says so. A swarm that starts from rest reads low by
  about τ/span, so `meanDrift` takes `settle`. Mean energy per collision is m(aτ)², and n/τ collisions a second times that is exactly I²R. Speed scales with E at
  fixed collision times, so cache the unit-acceleration swarm: the readouts run every frame.
- Views with different controls: keep one `view` control and set `hidden` on the panel's children (see the bulbs tool). Put the default view's slider first, because
  `smoke_tools` moves the first slider. Long `\dfrac` chains overflow at 360 px (the formula box scrolls rather than wrapping): put the working in readouts.
- `smoke_tools` does not notice a sideways-scrolling formula; check `#formula` scrollWidth at 360 px.

- Canvas sharpness is handled centrally. `createStage` rounds the buffer down to whole device pixels and sizes the canvas to match, follows display-scale changes
  (a zoom on a capped wide page changes no layout, so ResizeObserver alone misses it), and uses an opaque canvas for LCD text. `.viz-stage > canvas` is `pixelated`
  because CSS sizes round to 1/64 px and even that blends the whole picture at 125%. `draw.line` snaps straight lines to device pixels. So `stage.w`/`h` can be
  fractional, and `devicePixelContentBoxSize` must not be used: it ignores emulated scales, so nothing built on it can be tested here.

- `lib/circuit.js` is the DC engine: `solveCircuit(n, branches, fixed)` (an ideal source is a fixed node, because R must be above 0), `resistor`, `cell` at any angle, and `flowDots`, driven by
  charge passed so a dot arrives per coulomb and a count stays honest. Use it in `resistance-temperature`, `cells-emf-power` and `loops-meters`. `_kirchhoff-math.js` has the two-cell circuit (`twoLoop`,
  `loopEdges`, `walkAt`, `eliminate`), the node with a pile (`nodeRates`) and the bridge (`bridge`, `r4ForPotential`). Drawing height as true potential works well: the bridge wire lies flat at balance.
- A height map's depth must not run up the screen, or a falling ramp looks flat (depth cancels the drop). Keep depth mostly sideways.
- A computed zero is not zero: a balanced bridge read 1.78 ×10⁻¹⁴ mA. Snap it in the maths, and test with `assertEqual`, not `assertAlmostEqual`.
- `createStage` calls `draw(ctx, size, stage)`, and `createTool` hides that. A bare `createStage` with the wrong arguments draws nothing and still passes `smoke_tools`,
  which only measures ink on the whole stage. A canvas inside a flow stage goes in `.viz-figure`. Contact sheets show only the default: drive the toggles and presets too, as that is where the zero and the crowded bridge showed up.
- `circuit.js` is linear DC only. `rectifiers` and `p-n-junction-diode` need a diode, and `loops-meters` needs galvanometer and meter symbols (the bridge draws its own in `drawMeter`): extend it there.
- `lib/rays.js` uses NCERT's Cartesian signs: pole at 0, light along +x, `refract` is ready for the next optics boxes and tested on Snell and the critical angle. `_mirrors-math.js` has `imageOf`, `describe`, `region`, `exactRay` (a true
  sphere), `principalRays` (paraxial), `triangles`, and `fieldEdge`/`firstSeen` (a mirror's field of view); `_mirrors-view.js` has `drawBench` and `drawScene`. Lenses can copy the shape of both.
- Paraxial rays turn at the plane x = 0, so a truly curved mirror leaves them crossing the glass: draw the mirror much flatter than it is and say so. Only `why-is-f-r-2-for-a-mirror` uses the true sphere.
- An unsigned mirror formula gets the size right but the side wrong on a concave mirror, and the size wrong on a convex one. Plot its answer on the signed axis, so it fails visibly in both.
- A control must change what a student sees in every state. `smoke_tools` only tests the first slider, and it passed a toggle that did nothing on a concave mirror. When adding a toggle, compare the stage and panel with it on and off, in each mode.
- `lib/field.js` traces lines of any point charges. `fieldLines` keeps a − charge's lines only if no + charge sent them, so counts stay honest. `createBench` from `rays.js` is a good equal-scale stage for fields too. Reuse both in
  `flux-gauss-s-law`, `electric-potential` and `sources-of-magnetic-field`. `_electric-field-math.js` has `sourceAt` (a change spreads at c, slowed 10⁸ times), `loopWork`, `nullPoint`, `dipoleField`/`dipoleSlope`, `dipoleTorque`, `paperForces`.
- A charge cannot vanish, so a "removed" source is cancelled by bringing up −q. A student cannot land on a point exactly by dragging: if a Try prompt needs one (a neutral point), snap to it.
- A drawn moment arm is the perpendicular gap between the lines of force. Check any drawn length against its formula: the sheet showed a bracket along the wrong direction with correct numbers beside it.
- When one bar or arrow scale must serve very different sizes, split it: the paper's two forces share a scale, and a separate bar compares their difference with the weight.
- AC follows NCERT: v = v_m sin ωt, read from the arrow's height on the vertical axis (SHM tools read the horizontal shadow). Peak is i_m, rms is I. `phasor.wave` draws a trace from the arrow's own angle, so it has no history to keep and a drag moves it too.
  `_ac-basics-math.js` has `rms`, the cycle means, `acHeat`/`dcHeat`, `aroundLevel`, `twoWaves`, `ruleCurve`/`ruleGap` (a trial phase against each part's own rule), reactances, `humpArea`/`chargeSwing`, `seriesCircuit` (NCERT's φ, with a part left out acting as wire and a `null` φ when Z = 0),
  `ringScale`, `MAINS` and `shareAbove`. Reuse them in `lcr-resonance` and `power-transformers`. `seriesCircuit` is checked against Python complex impedance.
- A good WHY for a phase or a constant: let the student try wrong values against the governing rule. The lag tool has a trial phase, and a dashed curve from `v = L di/dt` lands on v only at −90°.
- A `label` patch hides whatever lies under it, and the first 360 px sheet showed a flat-topped sine for that reason. Put labels where the curve isn't, at every setting.
- A diagram's arrows scaled to a ring need a fine step (`ringScale`): with only 1, 2 and 5 the default arrows filled under half the ring. Anything built in steps must hide later results until their step: the builder first showed `v` on step 1.
- Check every "find the value" Try prompt against slider steps. Two prompts asked for values no step could reach; they now use φ = 120° at equal peaks, and "close to zero" for resonance.
- Readout labels set the column width at 360 px: keep labels and values short, or a one-word verdict wraps a letter column wide.
- `_p-n-junction-diode-math.js` is one model for the whole diode box: diffusion = R·e^(−Vj/VT) in units of the drift current (R = e^(V0/VT)), so a bias gives the diode equation
  I = Is(e^(V/VT) − 1) with Is = 4.4e-15 A (2.5 mA at 0.7 V, dynamic r about 10 Ω) and a reverse current from pair generation that grows with layer width (about 0.3 μA, reverse resistance about 10⁷ Ω).
  `barrierAt` is the closed form of the join (no integration needed), `widthAt` the abrupt-junction width (0.43 μm at 0.7 V), `chain`/`multiplication` the avalanche (Miller-type, n = 4), and `pressTogether`
  two seeded rough slabs (sum of sine waves, exact RMS) with a sorted gap array, so `contactShare` for any squash is a binary search. Reuse `diodeCurrent`, `forwardCurrent` and `amps` (view file) in `rectifiers`.
  `_p-n-junction-diode-view.js` `drawStrip` is the p | layer | n strip (columns of ion cores and carriers; only the layer's share of the strip follows the real width).
- The slab test is a Python re-implementation of mulberry32 and the surface, checked against the JS to 6 places. A time axis that spans many decades needs an offset (k = 0 to 13 here), or the plot's y axis lands at t = 0 in the middle of the graph.
- Real contact between two rough slabs is perfect over a patch tens of nm wide, but is 0.01–0.1% of the area: show the whole-surface map beside the zoom. `ctx.fillText` at 11 px is the smallest readable at 360 px.
- Besides the sheets, script a pass through every view and toggle, reading `#formula` overflow and the readouts. It found the step 1 curve, a pinned dot at the slider's end, and a 4 px formula overflow that the default view hid.

- `_intrinsic-extrinsic-semiconductors-math.js` has `carriers(net, ni)` (exact quadratic for n and p, stable for either sign), `settle(ND, tau)` (closed-form recombination after doping, p = (a + rho b)/(1 - rho); it needs tau up to about 30 to settle to 4.5e9, not 20), `hopRow`/`dipoleShift`, `neutrality`, `DOPANTS`. `NI_GE` 2.4e19 is the Ge value at 300 K. Reuse `carriers` in `rectifiers` and `energy-bands`. Two traps: the plain root (-ND + sqrt(ND^2 + 4 ni^2))/2 loses 4 digits at 1 ppm (use 2ni^2/(ND + sqrt(...))), and a Python reference for p-type that subtracts two huge numbers is the one that is wrong. Bar stages with labels above each bar need the square stage, not wide.

- `_huygens-wavefronts-math.js` has `scallop`/`sources` (wavelets from a front), `arrival`/`radius`/`refractAngle`/`reflectAngle`/`criticalAngle` (a plane wave at a flat boundary, wavelets starting when the front arrives; `refractAngle` is `null` when no tangent exists) and the Doppler pieces (`fronts`, `spacing`, `dopplerLambda`, `relativisticZ`, `H_ALPHA`). `_huygens-wavefronts-view.js` `front()` draws the line p·d = s; a front's incident and reflected halves fall on opposite sides of the hit point, so clipping to the half plane is enough. Reuse for `interference` and `diffraction-polarisation`. I guessed a scallop depth (0.268) in a test and it was 0.273: work expected values out first.

- `_interference-math.js` has `pathDiff` (exact) and `pathDiffSmall`, `twoWave` (two unit waves, 0 to 4), `fringeWidth`/`brightAt`/`darkAt`, `BULB_PHASES`/`averaged`/`contrast` (incoherent sources as a fixed list of snapshot phases, contrast = |mean e^(i phi)|), `classify` (bright, dark or between, by path difference in wavelengths), `brightCount`, and the thin film (`filmIntensity` = sin²(2πnt/λ), one phase flip; `strongest`; red, green and blue are drawn as c.a, c.c, c.b because JS cannot hold hex colours). Reuse `twoWave` and the screen plots in `diffraction-polarisation`. A grid of coloured cells with `globalAlpha` (see `bright-or-dark-path-difference`) draws a whole interference map cheaply. Long axis labels clip at 360 px: use 'y (mm)', 't (nm)'. A WHY about averaging should open on a state that already shows the averaging (8 snapshots), not the first snapshot.

- `_coordinate-plane-math.js` (first `functions-graphs` box) has `distance`, `midpoint`, `squares`/`squareOn` (a square built outward on a side, with `polygonArea`), `circleGap`/`circlePoint`/`generalCircle`, symmetry (`CURVES` given both by points and by a relation R(x, y) = 0, `MIRRORS`, `mirrorScore`, `symmetries`), `lineFrom`/`pointLine`/`foot`/`distToPoint`, and `FUNCS` for plotting by points (each with its own y `view`). Reuse in `lines-slope`, `what-are-conics` and `transformations`. A square `createPlot` gives equal axes for geometry; two draggable integer points use `handles` with a `keyStep` getter that returns one grid unit in pixels, and a `nudge` getter that is `undefined` when arrow keys should move the point freely. `plot.text` patches over whatever lies under it: pass `patch: false` for labels beside points. A table that plots integers needs a window that holds every row: one fixed range crushed the parabola, so each function carries its own `view`. I guessed two mirror-score counts in a test and both were wrong; compare with Python instead.

- `_sources-of-magnetic-field-math.js` has a vector Biot–Savart (`elementField`, `sumField`) over pieces `{p, dl}`, ring builders (`loopPieces` round the x axis, `pageLoopPieces` in the page, `wirePieces`), the closed forms (`axisLoop`, `longWire`,
  `finiteWire`, `solenoidAxis`, `parallelForce`), `wireFieldAt`/`circulation`/`enclosed` (Ampère by numerical walk, thin or thick wires) and a saturating iron core (`coreField`, `pull`). The page is x right, y up, z out of it; ⊙ is positive.
  Reuse `sumField` in `loops-meters` (dipole field, torque on a loop) and `magnetic-force-on-charges`. Pieces of equal length on a ring make the on-axis sum exact for any N; off axis it converges.
- A field map is a cheap way to show a rule such as "perpendicular" or "inverse square": shade a grid of cells by the signed component (`globalAlpha`, coral out of the page, blue into it). Probe arrows 0.9 R from the windings of a 30-turn solenoid ripple by 8%, so
  the uniform-inside readout samples within 0.5 R (1.8%). Check "uniform" claims with a Python reference first, not by eye. This box was built without screenshots by request, so its pictures have only been checked for console errors and overflow: look at them.

- `_vectors-in-space-math.js` has `dirCosines`, `scalarProjection`/`vectorProjection`/`perpendicular`, `internal`/`external`/`swapped` section points and `collinear` (exact cross product, λ). Reuse in `cross-product` and `lines-planes`. Built without screenshots or tests run, by request: look at the six pictures and run `manage.py test`.

- `_cross-product-math.js` (`cross`, `triple`, `torque`, `spinZ`) and `_lines-planes-math.js` (`planeDist`/`footOnPlane`, `closest` for two lines, `skewDistance`, `relation`, `lineAngle`, `tetra`) serve the rest of `vectors-3d`. `relation` tests exact zeros, so feed it rounded directions. Built without screenshots or test runs, by request: look at all twelve pictures.

- `_quadric-surfaces-math.js` has `implicit` for six quadrics, a marching-squares `contour`/`slice`, `traceName` and `ruling` (straight lines on the one-sheet hyperboloid); `_quadric-surfaces-view.js` caches slices, so the view can turn smoothly. `_space-curves-math.js` has three curves with exact r, r', r'', `frame` (T, N, B, κ), `accelParts`, `braking`, helix length and Kepler (`eccentricAnomaly`, `sweptArea`, `speedAt`). `_cylindrical-spherical-math.js` has the conversions (φ down from +z; θ from atan2) and the lat/long helpers. Fixed a drawn arrow in `why-is-a-x-b-b-x-a` whose length ignored θ: when a readout changes but the picture does not, check for a hard-coded length. These three boxes were built without screenshots or test runs, by request: look at the thirteen pictures.

- `vector-calculus/_vector-calculus-math.js` serves the whole subject. 2D fields are `{P, Q, Px, Py, Qx, Qy}` with exact partials (`FIELDS`, `SCALARS`, `gradField`, `streamField`); paths are `{r(t), d(t)}` on [0, 1] (`segment`, `bump`, `arcPath`, `ellipsePath`, `polygonPath`, `reversed`) with `work`, `arcIntegral`, `rectCirculation`, `boxOutflow`, `circleCirculation`/`circleOutflow`. Surfaces: `SURFACES`, `MOBIUS`, `surfArea`; Stokes/Gauss: `domeFlux`, `sphereFlux`, `chargeFlux`, `BIG`. `_vector-calculus-view.js` has `fieldArrows`, `arrowAt`, `drawContours` (marching squares from the quadric module), `drawPath`. Reuse in `multivariable` (gradient, double and triple integrals) and `linear-algebra`.
- The quickest honest test of a vector-calculus statement is a loop or a box: the 'curl of a gradient is zero' and 'div of a rotated gradient is zero' tools check themselves with a small circle numerically, and the tests compare with independent Python sums. A conservative-looking field can still fail (`F = (−y, x)/r²` has equal cross-partials and loop value 2π): keep it as the teaching counter-example.
- Plot arrows: `fieldArrows` squeezes lengths with m/(m+soft) so no arrow overruns its neighbour. Pick `soft` near the typical |F|. A readout label is fixed text: put a changing word in the value, not the label. These six boxes were built without screenshots or test runs, by request: look at all 27 pictures, especially the Möbius strip, the planimeter fan and the Gauss's-law arrows.

- `functions-graphs/_what-is-a-function-math.js`: `CURVES`/`outputs`/`isFunction` (a curve as branches, so a vertical line counts its hits and a repeated y counts once), `RESTRICTED` (domain tests with a reason and TeX),
  `FNS`/`quotient`/`shiftGap`, `PAIRS`/`sameFunction` (a hole is a domain difference, checked on a grid of exact hundredths), relation counts and `presetTicks`, `RULES`/`table`, and `GRAPHS` (pieces with open or closed ends) with
  `domainIntervals`, `rangeOf`, `solutions`. Reuse `GRAPHS` pieces in `properties-library`. Give a formula's TeX as a field next to its plain text; chaining `.replace` on the plain text produced invalid TeX on the first try.
  Built without screenshots or test runs, by request.
- `functions-graphs/_properties-library-math.js`: `parityOf` (the domain must be symmetric too, so √x is neither), `mirrorY`/`halfTurn`, `SHAPES`/`turningPoints`/`stretches` (exact slopes, bisected sign changes),
  `LIBRARY` of eight parents with `increasingOn`, `buildPieces`/`coefficients` (three straight pieces, a jump at each break and an owner for each break point), `MOTIONS`/`averageRate`, and the tax `SLABS`/`tax`/`marginalRate`.
  The tax slabs are the 2025–26 new-regime example in lakh rupees, and the page says they are illustrative. Check that a plot window holds the curve at the slider's ends: first guesses for the cubic and x³ did not.
- `trigonometry/_right-triangle-math.js` serves the rest of the subject: `sinD/cosD/tanD`, `arrangements`/`trianglesAt` (eight anticlockwise triangles, so one rigid turn-and-slide takes each from the tilted-square layout to the two-squares layout),
  `RATIOS`/`orderedPairs`/`ratioOf`, `fromCorner`, `growth`, `SIN37`/`measuredRatio` (ruler to the nearest mm, error bound 0.05/L), `STORY`, `solveRight` (four cases), `PRECISION`/`angleSpread`/`roundingSpread` (the book's 2, 3, 4, 5 figures),
  `elevation`, `heightFromTwo`, `refractAngle` (null past the critical angle) and `WAKES`/`wakeHalfAngle`. Reuse `refractAngle` in `optics/refraction`.
- `lib/formula.js` now turns the true minus sign that `fixed()` prints into a hyphen before KaTeX sees it (stepper steps too), so tools can put `fixed()` straight into TeX. A stepper with a figure hides unused sliders: collect `#panel .nb-field` after `createStepper`
  and set `.hidden` by case (see `solve-a-right-triangle`). A gap that must be equal at both ends of a slide (Pythagoras) is easiest to get by moving rigid triangles inside a fixed square.
  Built without screenshots or test runs, by request: look at all twelve pictures, especially the sliding triangles and the sine story.
- `trigonometry/_unit-circle-math.js` (degrees throughout): `pointAt` (clears rounding noise so an axis is an exact 0), `quadrant` (0 on an axis), `positives` (the ASTC rule, tested against the real signs), `referenceAngle`, `exact(θ)` (all six values at the 17 special angles as
  `[text, number]`, `null` where undefined; the tests parse every text back to a number), `texOf` (an exact text to TeX), `SIDES_AT` (the half-equilateral and half-square triangles), `pointsAtX`, `evaluate`/`usedAngle` (calculator mode). `_unit-circle-view.js`
  has `frame` (centre, scale and `px`), `drawFrame` and `angleHandle` (a draggable point on the circle with `nudge`). Reuse them in `tan-cot-sec-csc` and `identities`. Built without screenshots or test runs, by request.
- `trigonometry/_sine-cosine-math.js`: `wave`, `period`, `shift` (−C/B), `keyPoints`, `tip` (a spinner of radius |A|; a negative A points the other way, so the height is still A sin), `BASES`/`transformPoint`/`transformed` (any graph through A f(Bx + C) + k), `gap`/`TARGETS`
  (every target sits on the sliders' grid, tested), `sampledPoints`/`apparentCycles` (aliasing), `tiltError`, and daylight (`declination`, `daylight`, `dataFor`, `leastSquaresSine` by 3 × 3 normal equations, checked against an independent Python solve).
  `_sine-cosine-view.js` draws the spinner beside the graph on one vertical scale (`makePlot`, `fit`, `drawSpinnerWave`); `fit` re-sets the graph's y range every draw so the circle and the wave stay the same size at any stage width, which limits A to 1.5 on a phone.
  The tilt tool's a and b and the daylight dots are said on the page to be made-up and calculated, not measured. Built without screenshots or test runs, by request: look at all twelve, especially circle size at 360 px.
- `trigonometry/_tan-cot-math.js`: `tanLen/secLen/cotLen/cscLen`, `secantLength`, and the four graphs as `curve(kind, A, B, C)` with `asymptotes`, `zeros`, `quarterPoints` (tan, cot: ±A a quarter of the way along), `vertices` (sec, csc: the guide's peaks), `guide`, `period`;
  `PAIRS` (a function and its reciprocal), `crossing`/`tanAt` (tan has no top), and `spotPosition`/`spotSpeed`/`speedUp` (lighthouse). The tests find every asymptote by brute force and check that sec and csc never enter the strip between −A and A.
  When a tool's picture has a point that can run off the stage (a tangent, a spot on a wall), clip the line to the picture and draw an arrow where the point left, instead of letting the angle look wrong. Built without screenshots or test runs, by request.

- `trigonometry/_identities-math.js` serves the Identities box: `scaled` (the unit triangle resized by 1, 1/cos or 1/sin), `PAIRS`/`crossings`/`agreement` (identity or equation), `chordSquared`, `stacked` (sin(A+B) by stacked triangles), `halfAngle`, `singleSine`, `VERIFY` (three identities with every step as a function, plus one wrong move each, and `maxGap`) and `allSix` with exact fractions.
  `numbers-algebra/_complex-numbers-math.js` (complex as `[re, im]`, `cardanoRoots` for x³ = 15x + c, `liftedRoots`, `quadraticRoots`, `polarForm`), `_quadratic-equations-math.js` (`tiles`, `radical` with a `valid` flag for extraneous roots, `ballRoots`, `splitMiddle`/`quickest`, `inForm`, `babylonian`) and `_inequalities-math.js` (`CHARTS` sign charts, `solveChart`/`quadSolution` giving intervals with open ends, `combined`, `absSolve`, `triangle`, `PARTS`/`within`).
  `_complex-numbers-view.js` `planeFigure`, `_quadratic-equations-view.js` `graphFigure` and `_inequalities-view.js` `lineFigure` put a plane, graph or number line above a stepper's steps. A stepper's `viz-figure` is a fixed 230 px tall.
  Open dots on a number line use `c.paper`. In a sign chart a squared factor never changes sign. `mergeIntervals` must clear the `point` flag when a point joins a region (it printed `{-1}` for `[-1, ∞)`). All four boxes were built without screenshots or test runs, by request: look at the 36 pictures, run `manage.py test`, and write the four `tool_tests` files.

- `conics-curves/_conics-math.js` serves the whole subject: `reflect`, `sectionType`/`eccentricityOf`/`polarPoint` (a conic from its focus, `both` adds the second hyperbola branch), `degenerate`, `classify` (B² − 4AC and the 3 × 3 determinant), `dishRay`/`circleRay`/`axisCross`/`missDistance`, the ellipse helpers (`ellipseHit`, `ellipseNormal`, `ellipseHalfHeight`, `orbit`, `BODIES`) and the hyperbola/LORAN ones (`timeDiff`, `KM_PER_US`, `cometHalfAngle`). `_conics-view.js` has `equalFigure` (a stepper figure with equal axes, reused by `functions-graphs/graph-a-line-from-its-equation`), `curve` and `trace`. Reuse in `polar-conics`, `rotation-of-axes`, `parametric-curves`.
  `contour` (marching squares, from `vectors-3d/_quadric-surfaces-math.js`) draws any implicit curve in a square window, including the LORAN hyperbolas. Draggable points that snap onto a curve leave a trail (parabola and hyperbola tools). Built without screenshots or test runs, by request: look at all 37 pictures, especially the two cone tools (the cut shape beside the cone is drawn from a focus, so a near-parabolic ellipse is clipped), the whispering gallery, the LORAN map and the sign-chart-style layouts of the stepper figures.

- `conics-curves/_rotation-math.js` serves the last three conics boxes: `rotateConic` (A′…F′ for axes turned by θ), `removeAngle`, `tiltedEllipse`, polar conics (`polarPoint` for r = ℓ/(1 − e cos θ), a negative r is the other hyperbola branch; `rectangular`), Kepler (`eccentricAnomaly` by Newton, `orbitPoint`, `speedRatio`) and the parametric pieces (`timings`, `cycloid`, `roller` for epi/hypocycloids, `lissajous`, `deCasteljau`, `projectile`, `flight`).
  `equalFigure` figures are now square (`.viz-figure--square` in brutal.css) and take a centre function so the view follows the curve. `fitEqual(plot, stage, cx, cy, half)` keeps a plot equal-scaled on a wide stage. `drawCone` (double cone seen from above with a cutting plane) is in `_conics-view.js`. The ellipse tool `why-is-c2-a2-b2` now snaps the pen to the top of the minor axis within 4°, because a slider could never be set exactly on 90°: any "hit the exact value" tool needs a snap or a button. Built without screenshots or test runs, by request: look at these 15 pictures and the cone fixes.

- `functions-graphs/_fx.js` has `grab` (a draggable snapped point for `handles`) and `PARENTS`; `_polynomial-math.js` has coefficient-list polynomials (`synth`, `fromRoots`, `allRoots` by Durand–Kerner, `signChanges`, `turningPoints`); `_modelling-math.js` has regression
  (`linearFit`, `polyFit` by normal equations, `expFit`, `logFit`, `logisticFit`) and the made-up `DATASETS`; `_combining-view.js` has `machineRow` (function machines in a row). `derivatives/_trig-circle-view.js` serves both circle-derivative tools. `numbers-algebra/_exponents-view.js` has the exponent ladder.
  `trigonometry/_identities-math.js` `crossings` is reused for "how many times does a horizontal line hit this graph". A stepper figure cannot see how many steps are shown, so it always draws the finished result.
  Built without screenshots or test runs, by request: look at all 87 pictures and run `manage.py test`. Take special care over the two-plot tools (`why-is-f1-not-1-f-and-sin1-x-1-sin-x`), `why-does-sin-1-x-have-no-limit-at-0` (thousands of points) and the root-peeling plane.

- `exponentials-logs/_exp-log-math.js` serves the whole subject: `compound`, `eSum`, `bisect`/`crossings` (every sign change of f on an interval), `powerDigits` (BigInt exact count against the log reading), `lastLead` (where 2^x finally beats x^p), `squeeze`, finance (`effective`, `doublingYears`, `emi`, `annuityFV`, `balanceAfter`, `rupee`), area under 1/x (`rectsOn`, `sumOn`), `altHarmonic`, `logistic`, `cooling`, `catenaryA` (solves a(cosh(L/a) - 1) = h) and `rSquaredLine`.
  Reuse them in `derivatives/exp-log-inverse-derivatives`, `differential-equations/population-models` and `integrals`. Bars drawn with `plot.shade(() => h, null, x0, x1, fill)` plus `plot.segment` outlines work well for small bar charts without a new helper.
  A view-dependent control is hidden by reading `#panel .nb-field` after `createTool` and setting `.hidden` in `onChange` (see `why-is-ln-c-an-area`). Built without screenshots or test runs, by request, and no `tool_tests` file was written: look at all 53 pictures, run `manage.py test`, and add `catalogue/tool_tests/test_exponentials_logs_*.py` (the figures worth checking: 2^42 beats the Moon distance, 1.01^12 = 1.1268, 2^100 has 31 digits, the EMI of 10 lakh at 9% for 10 years is about 12,668, rule-of-72 numbers, and the catenary solver).

- `differential-equations/_de-math.js` serves the subject: `solve` (RK4 for any system), `euler`, `lotkaVolterra`/`lvInvariant`, `harvest`/`harvestRoots`. The slope-field tool taps to drop seeds with `enableDrag` (its `start` returns false, so a tap never drags). Newton, l'Hôpital, parametric/polar slopes and linear approximation have no shared file, since each tool's maths is a few lines.
  `who-really-found-l-hopital-s-rule` has no formula strip (`"formula": false`). Built without screenshots, test runs or `tool_tests`, by request: look at all 39 pictures, especially the cycloid wheel (equal-scale window), the slope field, the root-peeling Newton staircases on the three failing cases, and the Lotka–Volterra loops at extreme rates.

- Session of 31 Oct 2026 (current-magnetism ×5, optics ×5, `dimensions`), built without screenshots or test runs, by request: look at all 57 pictures, run `manage.py test`, and write `tool_tests` for the new maths files.
  New helpers: `c.spec[0..6]` in `colors.js` (spectrum tokens `--viz-spec-*` in `brutal.css`, red to violet); `optics/_refraction-math.js` (`snell`, `reflectance`, `fibreTrace` through a bent core, `smallestBend`, `polygonTrace` for refraction at every edge of a polygon), `_lenses-math.js` (`surfaceImage`, `traceLens` exact two-sphere rays, `twoSurfaces`, eye powers), `_prism-math.js`/`_prism-view.js` (`drawPrism`, deviation, rainbow `dropDeviation`), `_instruments-math.js`, `_diffraction-math.js` (sinc², Airy via `besselJ1`, `fresnel`, `throughGlasses`),
  `current-magnetism/_magnetism-matter-math.js` (uniformly magnetised ball `ballField`, `sphereFlux`), `_loops-meters-math.js` (rectangular loop `forces`, galvanometer conversions), `_magnetic-force-on-charges-math.js` (`mirrorPath` for a spiral into stronger field), `measurement-motion/_dimensions-math.js` (`[M, L, T]` vectors, `QUANTITIES`, `BRACKETS`).
- `handles` calls `move(px, py)` with two numbers, not an array. A segmented control is also an `.nb-field`, so when hiding sliders by index count the option row first (see `resistance-at-a-new-temperature`).
- A drawn "image" point for a slanted view of a pool is where the ray's back-extension meets the vertical through the object, d tan r / tan i; it is not where two nearby rays cross.
- `why-are-big-telescopes-reflectors` has a summary that says "heavy glass"; a thin lens is not heavier than a mirror blank, so the tool is about colour and support instead (see `QUESTIONS.md`).
- `optics/huygens-wavefronts` and `optics/interference` were already live and were not touched.

- Session of 2 Nov 2026 (derivatives ×3, differential-equations ×3, 31 tools), built without screenshots or test runs, by request: look at all 31 pictures, run `manage.py test`, and write `tool_tests`.
  New: `lib/graph.js` (see Library). `derivatives/_chain-rule-math.js` (`ONIONS` layer lists with TeX, `chain`, `compose`), `derivatives/_implicit-math.js` (`CURVES` with exact Fx, Fy and four integer points each, `nudge` by Newton), and
  `differential-equations/_separable-math.js` (Torricelli `level`/`drainTime`, mixing `salt`, drag `flight` with bisection for the fall, `SEPARABLE`/`HOMOGENEOUS` presets, orthogonal `FAMILIES`, `productRate` for the integrating factor).
  Figures worth testing: drain time = √(2h0/g)/r and half-time = T(1 − 1/√2); the 3.0 km / 40 km / 250 km/h descent peaks at 469 m/min; the ball's time up is ln(1 + kv0/g)/k and its fall is longer for k > 0.
  Per-family slider limits (`families-of-implicit-curves`) are reset in `onChange` by rewriting the slider's min and max. Contour curves reuse `vectors-3d/_quadric-surfaces-math.js` `contour` in a square window.

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
| 1 | `measurement-motion/units-measurement` | 11 | 1 | ✓ |
| 2 | `numbers-algebra/sets` | 11 | 1 | ✓ |
| 3 | `measurement-motion/dimensions` | 7 | 1 | ✓ |
| 4 | `functions-graphs/coordinate-plane` | 7 | 1 | ✓ |
| 5 | `measurement-motion/uniform-acceleration` | 8 | 1 | |
| 6 | `functions-graphs/what-is-a-function` | 8 | 1 | ✓ |
| 7 | `measurement-motion/vectors` | 7 | 1 | |
| 8 | `functions-graphs/properties-library` | 7 | 1 | ✓ |
| 9 | `measurement-motion/projectiles` | 9 | 1 | |
| 10 | `trigonometry/similar-triangles` | 7 | 1 | ✓ |
| 11 | `measurement-motion/circular-motion` | 7 | 1 | |
| 12 | `trigonometry/right-triangle-ratios` | 12 | 1 | ✓ |
| 13 | `forces-energy/inertia-the-first-law` | 6 | 1 | |
| 14 | `trigonometry/unit-circle` | 12 | 1 | ✓ |
| 15 | `forces-energy/second-law-momentum` | 8 | 1 | |
| 16 | `trigonometry/sine-cosine-graphs` | 12 | 1 | ✓ |
| 17 | `forces-energy/third-law-momentum-conservation` | 7 | 1 | |
| 18 | `trigonometry/tan-cot-sec-csc` | 9 | 1 | ✓ |
| 19 | `forces-energy/equilibrium-free-body-diagrams` | 5 | 1 | |
| 20 | `trigonometry/identities` | 12 | 1 | ✓ |
| 21 | `forces-energy/friction` | 8 | 1 | |
| 22 | `numbers-algebra/complex-numbers` | 8 | 1 | ✓ |
| 23 | `forces-energy/circular-dynamics` | 7 | 1 | |
| 24 | `numbers-algebra/quadratic-equations` | 8 | 1 | ✓ |
| 25 | `forces-energy/work-kinetic-energy` | 8 | 1 | |
| 26 | `numbers-algebra/inequalities-absolute-value` | 8 | 1 | ✓ |
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
| 38 | `functions-graphs/lines-slope` | 10 | 1 | ✓ |
| 39 | `rotation-gravitation/moment-of-inertia` | 5 | 1 | |
| 40 | `conics-curves/what-are-conics` | 3 | 1 | ✓ |
| 41 | `rotation-gravitation/rotational-dynamics` | 4 | 1 | |
| 42 | `conics-curves/parabola` | 6 | 1 | ✓ |
| 43 | `rotation-gravitation/angular-momentum` | 5 | 1 | |
| 44 | `conics-curves/ellipse` | 7 | 1 | ✓ |
| 45 | `rotation-gravitation/kepler-s-laws` | 5 | 1 | |
| 46 | `conics-curves/hyperbola` | 6 | 1 | ✓ |
| 47 | `rotation-gravitation/universal-gravitation` | 6 | 1 | |
| 48 | `limits-continuity/why-calculus` | 5 | 1 | ✓ |
| 49 | `rotation-gravitation/g-above-below-the-surface` | 4 | 1 | |
| 50 | `limits-continuity/the-limit-idea` | 6 | 1 | ✓ |
| 51 | `rotation-gravitation/gravitational-energy-escape` | 6 | 1 | |
| 52 | `limits-continuity/limit-laws` | 6 | 1 | ✓ |
| 53 | `rotation-gravitation/satellites` | 7 | 1 | |
| 54 | `derivatives/what-is-a-derivative` | 7 | 1 | |
| 55 | `properties-of-matter/stress-strain` | 7 | 1 | |
| 56 | `derivatives/differentiation-rules` | 7 | 1 | ✓ |
| 57 | `properties-of-matter/elastic-moduli` | 7 | 1 | |
| 58 | `derivatives/trig-derivatives` | 4 | 1 | ✓ |
| 59 | `properties-of-matter/pressure-pascal` | 9 | 1 | |
| 60 | `sequences-probability/statistics-measuring-spread` | 9 | 1 | |
| 61 | `properties-of-matter/flow-bernoulli` | 9 | 1 | |
| 62 | `sequences-probability/probability` | 8 | 1 | |
| 63 | `properties-of-matter/viscosity` | 5 | 1 | |
| 64 | `numbers-algebra/number-systems` | 11 | 1 | |
| 65 | `properties-of-matter/surface-tension` | 8 | 1 | |
| 66 | `numbers-algebra/exponents-roots` | 9 | 1 | ✓ |
| 67 | `heat-thermodynamics/temperature` | 6 | 1 | |
| 68 | `numbers-algebra/polynomials-factoring` | 9 | 1 | |
| 69 | `heat-thermodynamics/thermal-expansion` | 6 | 1 | |
| 70 | `numbers-algebra/rational-expressions` | 6 | 1 | |
| 71 | `heat-thermodynamics/heat-capacity-calorimetry` | 5 | 1 | |
| 72 | `numbers-algebra/linear-equations-formulas` | 7 | 1 | |
| 73 | `heat-thermodynamics/change-of-state` | 5 | 1 | |
| 74 | `numbers-algebra/variation` | 5 | 1 | |
| 75 | `heat-thermodynamics/heat-transfer` | 7 | 1 | |
| 76 | `functions-graphs/transformations` | 6 | 1 | ✓ |
| 77 | `heat-thermodynamics/first-law` | 6 | 1 | |
| 78 | `functions-graphs/quadratic-functions` | 8 | 1 | ✓ |
| 79 | `heat-thermodynamics/thermodynamic-processes` | 5 | 1 | |
| 80 | `functions-graphs/polynomial-functions` | 11 | 1 | ✓ |
| 81 | `heat-thermodynamics/second-law-engines` | 8 | 1 | |
| 82 | `functions-graphs/rational-functions` | 7 | 1 | ✓ |
| 83 | `heat-thermodynamics/kinetic-theory-of-gases` | 7 | 1 | |
| 84 | `functions-graphs/modelling-with-data` | 6 | 1 | ✓ |
| 85 | `heat-thermodynamics/equipartition-specific-heats` | 5 | 1 | |
| 86 | `functions-graphs/area-by-stretching` | 5 | 1 | ✓ |
| 87 | `heat-thermodynamics/mean-free-path` | 4 | 1 | |
| 88 | `trigonometry/waves-oscillations` | 12 | 1 | |
| 89 | `oscillations-waves/periodic-motion` | 4 | 1 | ✓ |
| 90 | `trigonometry/solving-any-triangle` | 12 | 1 | |
| 91 | `oscillations-waves/shm-circular-motion` | 6 | 1 | ✓ |
| 92 | `trigonometry/vectors` | 12 | 1 | |
| 93 | `oscillations-waves/force-law-energy` | 5 | 1 | ✓ |
| 94 | `trigonometry/polar-complex` | 11 | 1 | |
| 95 | `oscillations-waves/the-simple-pendulum` | 6 | 1 | ✓ |
| 96 | `exponentials-logs/exponential-growth` | 6 | 1 | ✓ |
| 97 | `oscillations-waves/what-is-a-wave` | 4 | 1 | ✓ |
| 98 | `exponentials-logs/the-number-e` | 4 | 1 | ✓ |
| 99 | `oscillations-waves/travelling-waves` | 6 | 1 | ✓ |
| 100 | `exponentials-logs/logarithms` | 9 | 1 | ✓ |
| 101 | `oscillations-waves/superposition-reflection` | 4 | 1 | ✓ |
| 102 | `exponentials-logs/log-scales` | 6 | 1 | ✓ |
| 103 | `oscillations-waves/standing-waves-music` | 6 | 1 | ✓ |
| 104 | `exponentials-logs/exp-log-equations` | 4 | 1 | ✓ |
| 105 | `oscillations-waves/beats` | 3 | 1 | ✓ |
| 106 | `exponentials-logs/money-finance` | 7 | 1 | ✓ |
| 107 | `electrostatics/electric-charge` | 7 | 1 | |
| 108 | `functions-graphs/combining-inverting` | 12 | 1 | ✓ |
| 109 | `electrostatics/coulomb-s-law` | 5 | 1 | |
| 110 | `trigonometry/inverses-equations` | 12 | 1 | |
| 111 | `electrostatics/electric-field-field-lines` | 6 | 1 | ✓ |
| 112 | `systems-matrices/matrices-row-reduction` | 4 | 1 | |
| 113 | `electrostatics/flux-gauss-s-law` | 5 | 1 | |
| 114 | `systems-matrices/matrix-algebra` | 10 | 1 | |
| 115 | `electrostatics/electric-potential` | 7 | 1 | |
| 116 | `systems-matrices/determinants-cramer` | 11 | 1 | |
| 117 | `electrostatics/conductors-dielectrics` | 6 | 1 | |
| 118 | `limits-continuity/continuity` | 5 | 1 | |
| 119 | `electrostatics/capacitors` | 7 | 1 | |
| 120 | `derivatives/chain-rule` | 4 | 1 | ✓ |
| 121 | `current-magnetism/current-drift` | 6 | 1 | ✓ |
| 122 | `derivatives/implicit-differentiation` | 4 | 1 | ✓ |
| 123 | `current-magnetism/resistance-temperature` | 5 | 1 | ✓ |
| 124 | `derivatives/exp-log-inverse-derivatives` | 7 | 1 | ✓ |
| 125 | `current-magnetism/cells-emf-power` | 5 | 1 | ✓ |
| 126 | `derivatives/rates-in-science` | 6 | 1 | |
| 127 | `current-magnetism/kirchhoff-wheatstone` | 4 | 1 | ✓ |
| 128 | `derivative-applications/maxima-minima` | 6 | 1 | |
| 129 | `current-magnetism/magnetic-force-on-charges` | 5 | 1 | ✓ |
| 130 | `derivative-applications/mean-value-theorem` | 4 | 1 | |
| 131 | `current-magnetism/sources-of-magnetic-field` | 7 | 1 | ✓ |
| 132 | `derivative-applications/shape-of-a-graph` | 7 | 1 | |
| 133 | `current-magnetism/loops-meters` | 5 | 1 | ✓ |
| 134 | `derivative-applications/optimisation` | 6 | 1 | |
| 135 | `current-magnetism/magnetism-matter` | 6 | 1 | ✓ |
| 136 | `derivative-applications/antiderivatives` | 4 | 1 | |
| 137 | `induction-ac-em/faraday-lenz` | 5 | 1 | |
| 138 | `integrals/area-distance` | 4 | 1 | |
| 139 | `induction-ac-em/inductance-generators` | 5 | 1 | |
| 140 | `integrals/the-definite-integral` | 6 | 1 | |
| 141 | `induction-ac-em/ac-basics` | 6 | 1 | ✓ |
| 142 | `integrals/fundamental-theorem` | 4 | 1 | |
| 143 | `induction-ac-em/lcr-resonance` | 5 | 1 | |
| 144 | `integrals/substitution` | 4 | 1 | |
| 145 | `induction-ac-em/power-transformers` | 4 | 1 | |
| 146 | `integrals/integration-by-parts` | 4 | 1 | |
| 147 | `induction-ac-em/electromagnetic-waves` | 6 | 1 | |
| 148 | `integrals/trig-integrals-substitution` | 5 | 1 | |
| 149 | `optics/mirrors` | 5 | 1 | ✓ |
| 150 | `integrals/partial-fractions-strategy` | 6 | 1 | |
| 151 | `optics/refraction-total-internal-reflection` | 5 | 1 | ✓ |
| 152 | `integral-applications/area-between-curves` | 5 | 1 | |
| 153 | `optics/lenses` | 5 | 1 | ✓ |
| 154 | `differential-equations/what-is-a-differential-equation` | 5 | 1 | ✓ |
| 155 | `optics/prism-dispersion` | 4 | 1 | ✓ |
| 156 | `differential-equations/separable-equations` | 8 | 1 | ✓ |
| 157 | `optics/optical-instruments` | 5 | 1 | ✓ |
| 158 | `differential-equations/linear-first-order` | 3 | 1 | ✓ |
| 159 | `optics/huygens-wavefronts` | 4 | 1 | ✓ |
| 160 | `vectors-3d/vectors-in-space` | 6 | 1 | ✓ |
| 161 | `optics/interference` | 5 | 1 | ✓ |
| 162 | `vectors-3d/cross-product` | 5 | 1 | ✓ |
| 163 | `optics/diffraction-polarisation` | 6 | 1 | ✓ |
| 164 | `vectors-3d/lines-planes` | 7 | 1 | ✓ |
| 165 | `modern-physics/photoelectric-effect` | 6 | 1 | |
| 166 | `systems-matrices/inequalities-linear-programming` | 7 | 1 | |
| 167 | `modern-physics/matter-waves` | 4 | 1 | |
| 168 | `sequences-probability/random-variables-expectation` | 5 | 1 | |
| 169 | `modern-physics/atoms` | 6 | 1 | |
| 170 | `exponentials-logs/growth-decay-cooling` | 6 | 1 | ✓ |
| 171 | `modern-physics/the-nucleus` | 5 | 1 | |
| 172 | `exponentials-logs/e-ln-as-areas` | 7 | 1 | ✓ |
| 173 | `modern-physics/radioactivity-nuclear-energy` | 5 | 1 | |
| 174 | `exponentials-logs/hyperbolic-functions` | 4 | 1 | ✓ |
| 175 | `modern-physics/energy-bands` | 5 | 1 | |
| 176 | `sequences-probability/mathematical-induction` | 3 | 1 | |
| 177 | `modern-physics/intrinsic-extrinsic-semiconductors` | 6 | 1 | ✓ |
| 178 | `conics-curves/rotation-of-axes` | 4 | 1 | ✓ |
| 179 | `modern-physics/p-n-junction-diode` | 6 | 1 | ✓ |
| 180 | `conics-curves/polar-conics` | 3 | 1 | ✓ |
| 181 | `modern-physics/rectifiers` | 5 | 1 | |
| 182 | `conics-curves/parametric-curves` | 8 | 1 | ✓ |
| 183 | `systems-matrices/linear-systems` | 5 | 1 | |
| 184 | `systems-matrices/nonlinear-systems` | 3 | 1 | |
| 185 | `systems-matrices/partial-fractions` | 3 | 1 | |
| 186 | `limits-continuity/the-precise-definition` | 4 | 1 | |
| 187 | `limits-continuity/limits-at-infinity` | 4 | 1 | |
| 188 | `derivatives/linear-approximation` | 6 | 1 | ✓ |
| 189 | `derivatives/parametric-polar-slopes` | 6 | 1 | ✓ |
| 190 | `derivative-applications/l-hopital-s-rule` | 5 | 1 | ✓ |
| 191 | `derivative-applications/newton-s-method` | 4 | 1 | ✓ |
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
| 202 | `differential-equations/direction-fields-euler` | 4 | 1 | ✓ |
| 203 | `differential-equations/population-models` | 3 | 1 | ✓ |
| 204 | `differential-equations/predatorprey` | 3 | 1 | ✓ |
| 205 | `differential-equations/second-order-equations` | 6 | 1 | ✓ |
| 206 | `differential-equations/series-solutions` | 2 | 1 | ✓ |
| 207 | `vectors-3d/quadric-surfaces` | 3 | 1 | ✓ |
| 208 | `vectors-3d/space-curves-motion` | 6 | 1 | ✓ |
| 209 | `vectors-3d/cylindrical-spherical-coordinates` | 4 | 1 | ✓ |
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
| 223 | `vector-calculus/vector-fields` | 3 | 2 | ✓ |
| 224 | `vector-calculus/line-integrals` | 8 | 2 | ✓ |
| 225 | `vector-calculus/green-s-theorem` | 3 | 2 | ✓ |
| 226 | `vector-calculus/curl-divergence` | 3 | 2 | ✓ |
| 227 | `vector-calculus/surfaces-flux` | 5 | 2 | ✓ |
| 228 | `vector-calculus/stokes-divergence-theorems` | 5 | 2 | ✓ |
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
