# Trigonometry Visualisation Catalogue

Source: Barnett, Ziegler & Byleen, *Analytic Trigonometry with Applications* (11th ed.) · Oct 31, 2026 · @Arya Mhaske

## How this catalogue works

Trigonometry takes one box on the landing page. Inside it are 12 concept boxes (a full 3×4 grid), and each of those opens a grid of up to 12 tools. That puts every tool two clicks from the Trigonometry box, with a breadcrumb like **Home / Trigonometry / Unit Circle / Why does the sine wave come from a circle?**

The boxes follow concepts, not chapters. Degrees (§1.1) and radians (§2.1) share a box, because the reason for one explains the other. Every section of the book, including the starred optional ones and Appendices B–C, lands in exactly one box.

Each tool has one of three tags:

- **WHY**: shows why a definition or rule is the way it is, for example why a full turn is 360°, or why sin 30° is the same in every right triangle. Build these first.
- **HOW**: practises a procedure, such as converting DMS to decimal degrees or solving an SSA triangle.
- **APP**: one of the book's real-world applications (Eratosthenes, bow waves, Fourier series), made interactive.

Each tool row gives the question it answers, what the student actually does with the controls, and the book section it covers. Tool names are written as the question a student would ask. That doubles as the tile label and keeps the WHY framing visible on the site.

## Navigation map

The Trigonometry tile opens this exact 3×4 grid, in the order a student meets the ideas. Box 1 is highlighted because it holds the reference page to build first.

&#91;embedded content: Trigonometry grid · 12 concept boxes, 124 tools\]

Under each box the third level is a tool grid of 7–12 tiles, each tagged WHY, HOW or APP, with WHY tiles placed first (top-left).

## Box-by-box catalogue

The 12 boxes hold 124 tools in total. In each table the WHY tools come first, then HOW, then APP. Tools marked *(ext.)* go slightly beyond the book, but they're worth adding because they answer a WHY the book skips.

### 1. Angles & Arcs · §1.1, §2.1, §2.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is a full turn 360°? | WHY | Works through four stacked views (spec below) | 1.1 |
| What is an angle, really? | WHY | Spins the terminal ray past 360° and clockwise; a counter tracks revolutions, and coterminal angles show as ghosts | 1.1, 2.1 |
| Why 60 minutes in a degree? | WHY | Zooms into a 1° wedge that splits into 60 parts, then 60 again, beside a clock showing h:m:s (the book's marathon Explore/Discuss) | 1.1 |
| Why radians are the natural unit | WHY | Wraps a radius-length string around a circle: it fits about 6.28 times, and still does after resizing the circle, so 1 rad ≈ 57.3° | 2.1 |
| Why does s = rθ only work in radians? | WHY | Changes r and θ to watch the arc grow; switching to degrees breaks the formula unless π/180 sneaks in | 2.1 |
| Why is sector area ½r²θ? | WHY | Slices a sector into thin triangles and rearranges them; the sector is the fraction θ/2π of the disc | 2.1 |
| Why arc ≈ chord for small angles | WHY | Shrinks the angle and watches arc and chord merge; this sets up the Sun/Moon tool | 1.1 |
| Why does the outer horse go faster? (v = rω) | WHY | Sees a merry-go-round where every rider has the same ω but the outer riders cover more arc per second | 2.2 |
| Angle unit lab: DMS ↔ DD ↔ radians | HOW | Converts with a dual-scale protractor; also classifies acute/right/obtuse and complementary/supplementary pairs | 1.1, 2.1 |
| Belts, gears and bicycle wheels | APP | Links two pulleys: the belt carries one linear speed, so the angular speeds differ | 2.2 |
| Eratosthenes measures the Earth | APP | Sets the shadow angle at Alexandria and the distance to Syene, then reads off Earth's circumference | 1.1 |
| How big are the Sun and the Moon? | APP | Sets angular size and distance to get the diameter; both subtend about 0.5°, which is why total eclipses work | 1.1 |

The **Why 360°?** page stacks four views, each answering "why not something else?":

1. **Divisibility:** a slider splits the circle into n equal slices. With 360, slices come out in whole degrees for 24 different n (2, 3, 4, 5, 6, 8, 9, 10, 12…). A 100-unit circle manages only 9, and the 400-gradian circle 15. The student sees 360 win.
2. **The hexagon:** six radius-length chords close up exactly around any circle, giving six equilateral triangles. Babylonian base-60 makes each one 60, and 6 × 60 = 360.
3. **The sky:** the Sun shifts about 1° a day against the stars over a year of about 365 days, and early calendars rounded that to 360.
4. **It's a convention:** the same angle is shown as degrees, gradians, turns and radians. The geometry never changes; only the label does. This is the hand-off to radians.

Label views 2–3 honestly as the most widely accepted historical explanation, not a proven fact. View 1 is pure maths and always holds.

### 2. Similar Triangles · §1.2, App. C

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do a triangle's angles add to 180°? | WHY | Drags vertices anywhere; the three corners tear off and line up on a straight line (and a parallel-line proof) | C.2 |
| Why do same-shaped triangles have proportional sides? | WHY | Scales a triangle with its angles locked while a live table of side ratios stays frozen (Euclid's theorem) | 1.2 |
| Why are two angles enough? | WHY | Fixes two angles, tries to build a differently shaped triangle, and finds it can't, because the third angle is forced | 1.2 |
| Why does the ratio depend only on the angle? | WHY | Fixes θ and resizes the right triangle: opp/hyp never moves. Changing θ changes it, so the ratio is a function of θ. This is the bridge into Box 3 | 1.2 → 1.3 |
| Missing side by proportion | HOW | Matches corresponding sides with colour coding and solves the proportion | 1.2 |
| Measure a tree with its shadow | APP | Moves a stick and the Sun; similar shadow triangles give the height (Thales) | 1.2 |
| How deep is a lunar crater? | APP | Uses the shadow length and Sun angle on the Moon to find the rim height (book exercise) | 1.2 |

### 3. Right-Triangle Ratios · §1.3, §1.4, §2.4, App. A.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is a² + b² = c²? | WHY | Drags a slider that rearranges four copies of the triangle inside a square; the leftover area is c² or a² + b² | 1.3 |
| Why exactly six ratios? | WHY | Picks 2 of the 3 sides in order and finds 6 combinations, in 3 reciprocal pairs | 1.3 |
| Why is it called "co"-sine? | WHY | Switches the viewpoint to the other acute angle: opposite and adjacent swap, so cos θ = sin(90° − θ) | 1.3 |
| Why do sin and cos stay ≤ 1 while tan doesn't? | WHY | Pushes θ toward 90°: the hypotenuse is always longest, but tan blows up | 1.3 |
| Where does the calculator's 0.6018 come from? | WHY | Measures a huge drawn 37° triangle and compares the ratio with the calculator | 1.3 |
| Solve a right triangle | HOW | Enters any two parts and gets a step-by-step solution, with the triangle highlighting which ratio is used | 1.3 |
| How accurate is my answer? | HOW | Sees how the precision of an angle pairs with the significant digits of the sides (the book's accuracy table) | 1.3, A.3 |
| Angles of elevation and depression | APP | Walks an observer toward a building and reads its height off the angle | 1.4 |
| Height from two sightings | APP | Takes angles from two points and finds the height without reaching the base (the book's 4.8 + x problem) | 1.4 |
| Why does light bend? (refraction) | APP | Moves the incoming ray and changes the material; sin α / sin β stays constant (Snell's law) | 2.4 |
| Why is a wake V-shaped? | APP | Uses one cone tool with three presets, boat bow wave, sonic boom and Čerenkov light, all following sin(θ/2) = slow speed / fast speed | 2.4 |

### 4. Unit Circle · §2.3, §2.5, App. B.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do we need a circle at all? | WHY | Pushes a right triangle past 90° until it collapses; switches to point (x, y) on a circle of radius r, where x/r and y/r agree with the triangle for acute angles and keep working beyond | 2.3 |
| Why radius 1? | WHY | Resizes the circle: the ratios don't change, and at r = 1 the coordinates simply are (cos θ, sin θ) | 2.3 |
| Why do signs change by quadrant? | WHY | Drags the point around and watches the signs of x and y; ASTC falls out of this, with nothing to memorise | 2.3 |
| Why do reference angles work? | WHY | Mirrors a Q2/Q3/Q4 point into Q1: the same lengths with different signs | 2.5 |
| Why is sin 30° exactly ½? | WHY | Halves an equilateral triangle to get 30–60–90, cuts a square on its diagonal to get 45–45–90, and reads off the exact values | 2.5 |
| Why sin²θ + cos²θ = 1 | WHY | Sees Pythagoras on the radius of the unit circle, true at every angle | 2.5 |
| Why do trig functions repeat? | WHY | Winds around several times: coterminal angles land on the same point, so the period is 2π; tan repeats every π because opposite points give the same slope | 2.5 |
| Why is tan 90° undefined? | WHY | Moves the point to (0, 1), where y/x divides by zero; the nearby values shoot off to ±∞ | 2.3 |
| Why is sine a function (and the circle isn't)? | WHY | Feeds angles into a machine: one input gives exactly one output, but one x gives two points on the circle | B.1 |
| Exact-value drill | HOW | Clicks a special or quadrantal angle and fills in all six values, with the triangle shown as a hint | 2.5 |
| Degree mode vs radian mode | HOW | Sees the same keystrokes give different answers; spots the classic sin(30) = −0.988 mistake | 2.3 |

### 5. Sine & Cosine Graphs · §3.1–3.3, §2.4, App. B.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is the sine graph a wave? | WHY | Watches a point spin on the unit circle while its height is traced onto a time axis beside it. This is the signature visual of the site | 3.1 |
| Why is cosine a shifted sine? | WHY | Traces the horizontal shadow of the same spinner: it's sine started a quarter-turn early | 3.1 |
| What does A do? Amplitude = radius | WHY | Grows the circle and the wave grows taller with it | 3.2 |
| What does B do? Why period = 2π/B | WHY | Spins B times faster, so one full turn takes 2π/B | 3.2 |
| What does C do? Why the shift is −C/B | WHY | Starts the spinner early by angle C and sees why the graph shifts left, and why the shift divides by B | 3.3 |
| What does k do? | WHY | Lifts the axle and the whole wave rises with it | 3.2 |
| Transformation lab for any graph | WHY | Applies shifts, reflections and stretches to any f(x) and sees A, B, C, k as one general idea | B.2 |
| Graph y = k + A sin(Bx + C) by hand | HOW | Gets the five key points step by step, then checks against the live plot | 3.2, 3.3 |
| Find the equation from a graph | HOW | Drags a sine curve to fit a target graph, then writes its equation (simple harmonic) | 3.3 |
| Why does the graph window matter? | HOW | Zooms a plotter out until the samples skip cycles and a fake wave appears (aliasing) | 3.1 |
| Why do tilted lines fool your eyes? | APP | Tilts a field of lines and plots the error d = a + b sin 4θ; the period is 90° because the pattern looks the same after a quarter-turn (Berliner experiment) | 2.4 |

### 6. Tan, Cot, Sec, Csc · §3.1, §3.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is it called "tangent"? | WHY | Sees tan θ is the length of the tangent line at (1, 0) and sec θ the length of the secant line out to it, so the names are literal | 3.1 |
| Why does tan have asymptotes? | WHY | Pushes θ toward 90°: the ray becomes parallel to the tangent line and the segment runs off forever | 3.1 |
| tan θ is a slope | WHY | Rotates a ray and reads its slope, which equals tan θ; that's why the period is π | 3.1 |
| Why is cot the "co"-tangent? | WHY | Uses the tangent line at (0, 1) instead: the complementary angle and the mirror-image graph | 3.1 |
| Why do csc and sec hug sin and cos? | WHY | Overlays the reciprocals: where sin → 0, csc → ∞, and where sin = ±1 they touch, which makes the U-shapes | 3.1 |
| Graph y = A tan(Bx + C) and A cot(Bx + C) | HOW | Places the asymptotes π/B apart first, then the curve between them | 3.6 |
| Graph y = A sec(Bx + C) and A csc(Bx + C) | HOW | Draws the guide sine/cosine faintly, then flips it into U-shapes | 3.6 |
| Why is there no amplitude for tan? | HOW | Tries to measure a peak height and finds none; A becomes a vertical stretch | 3.6 |
| Lighthouse beam on a wall *(ext.)* | APP | Rotates the beam steadily and sees the spot's position (d tan θ) and its speed explode near 90° | — |

### 7. Waves & Oscillations · §3.2 apps, §3.4, §3.5, §4.5 music, Ch. 3 activity

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does a spring trace a sine? | WHY | Runs a spinning point and a mass on a spring side by side: the mass is the point's shadow (simple harmonic motion) | 3.4 |
| Why do waves add point by point? | WHY | Drags two waves and watches a vertical line add their heights at each x (addition of ordinates) | 3.5 |
| Why do beats happen? | WHY | Tunes two close frequencies and sees and hears the loud–soft envelope; the product–sum identity explains it | 3.5, 4.5 |
| Why does damping make an envelope? | WHY | Multiplies the sine by a decaying curve and sees the curve become the boundary | 3.4 |
| Why does resonance build up? | WHY | Sweeps the drive frequency past the natural frequency and watches the amplitude spike | 3.4 |
| Why is any shape a sum of sines? | WHY | Adds harmonics one by one and watches a square or sawtooth wave assemble (Fourier) | 3.5 |
| Pitch = 1 / period | APP | Changes B and hears the tone change (Web Audio) with the graph locked to it | 3.2 |
| Weigh a floating object by its bobbing | APP | Sets the mass and area and times the period, then inverts to find the mass | 3.2 |
| Why 120π in AC current? | APP | Reads 60 cycles per second off the graph of I = A sin 120πt | 3.4 |
| Light and EM waves: c = λf | APP | Slides across the spectrum; wavelength and frequency trade off at constant speed | 3.4 |
| Water waves | APP | Changes wavelength and period and sees the wave speed | 3.4 |
| Coyotes and rabbits | APP | Watches two population sines run a quarter-cycle apart; predators lag prey | Ch. 3 |

### 8. Identities · §4.1–4.5, Ch. 4 activity

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why three Pythagorean identities? | WHY | Scales the unit-circle triangle by 1/cos and by 1/sin to get 1 + tan² = sec² and 1 + cot² = csc², the same triangle resized | 4.1 |
| Identity vs equation: true everywhere or somewhere? | WHY | Graphs both sides: an identity overlaps everywhere, an equation only crosses at points | 4.2 |
| Why cos(A − B) = cos A cos B + sin A sin B | WHY | Rotates a chord around the unit circle; its length is the same both ways, which gives the identity | 4.3 |
| Why sin(A + B) = sin A cos B + cos A sin B | WHY | Stacks one triangle on another inside a rectangle; the side lengths read off the identity | 4.3 |
| Why isn't sin(A + B) = sin A + sin B? | WHY | Drags A and B and watches the two bars disagree, with a live counterexample | 4.3 |
| Why double-angle formulas? | WHY | Sets B = A in the sum formula, then checks with an isosceles triangle in a circle | 4.4 |
| Why do half-angle formulas have ±? | WHY | Moves θ around and sees which quadrant θ/2 lands in, which picks the sign | 4.4 |
| Why can products become sums? | WHY | Adds two spinning phasors; their sum and difference frequencies appear (links to beats) | 4.5 |
| Why is M sin Bt + N cos Bt a single sine? | WHY | Adds two perpendicular phasors: the resultant has length √(M² + N²) and a phase angle | Ch. 4 |
| Identity verifier sandbox | HOW | Transforms one side step by step while a graph confirms that every step stays equal | 4.2 |
| All six from one | HOW | Given sin θ = 3/5 in Q2, draws the triangle in that quadrant and reads off the rest | 4.1 |

### 9. Inverses & Equations · §5.1–5.4, App. B.3, Ch. 5 activity

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why can't sine be inverted as it is? | WHY | Sweeps a horizontal line across the wave: it hits many times, so sine is not one-to-one | B.3, 5.1 |
| Why those exact ranges for arcsin and arccos? | WHY | Slides a window along the graph; only some windows are one-to-one, cover −1…1, are unbroken, and include 0 to π/2 | 5.1 |
| Why is an inverse graph a mirror image? | WHY | Folds the graph over y = x | B.3 |
| Why does sin x = 0.5 have infinitely many solutions? | WHY | Sees the line cross the wave again and again; the unit circle shows two per turn, plus 2πk | 5.3 |
| Why sin(sin⁻¹ x) = x but sin⁻¹(sin x) ≠ x | WHY | Chains the two machines and sees outputs fold back once x leaves the range | 5.1 |
| Why do books disagree on arcsec's range? | WHY | Compares the two common branch choices side by side | 5.2 |
| What happens to sin(1/x) near 0? | WHY | Zooms in forever and finds more and more solutions | Ch. 5 |
| Solve a trig equation | HOW | Isolates the function, finds the reference angle, picks every quadrant, writes the general solution | 5.3 |
| Solve graphically, including inequalities | HOW | Finds intersections, then shades where f > g | 5.4 |
| Inverse and composition drill | HOW | Evaluates sin⁻¹, cos⁻¹, tan⁻¹ and their compositions, with the answer drawn on the circle | 5.1, 5.2 |

### 10. Solving Any Triangle · §6.1–6.3, Ch. 6 activity

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why the law of sines? | WHY | Drops an altitude: h = b sin A = a sin B, and the law follows | 6.1 |
| Why a/sin A = 2R *(ext.)* | WHY | Draws the circumcircle and sees every ratio equal its diameter | — |
| Why is SSA ambiguous? | WHY | Swings side a like a compass arc that crosses the base 0, 1 or 2 times | 6.1, Ch. 6 |
| Why is the law of cosines Pythagoras with a correction? | WHY | Opens the right angle; the −2ab cos C term grows and shrinks with it | 6.2 |
| Why does SSS fix a triangle but AAA doesn't? | WHY | Three rods make a rigid frame, while three angles still allow any size | 6.2 |
| Why is area ½ab sin C? | WHY | Sees the height is b sin C, so ½ × base × height becomes ½ab sin C | 6.3 |
| Heron's formula check | HOW | Drags vertices and compares ½ × base × height, ½ab sin C and Heron's formula live | 6.3 |
| Triangle solver: which law, and why? | HOW | Picks the case (ASA, AAS, SSA, SAS, SSS) and is shown the law to use and the reason | 6.1, 6.2 |
| Area of any polygon | HOW | Splits a shape into triangles and sums them (the book's arbitrary-triangle method) | 6.3 |
| Distance across a river | APP | Sights a tree from two points on one bank and finds the width with the law of sines | 6.1 |

### 11. Vectors · §6.4, §6.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does a vector need two numbers? | WHY | Drags an arrow and sees magnitude + direction and components ⟨‖v‖ cos θ, ‖v‖ sin θ⟩ as two names for one thing | 6.4 |
| Why tip-to-tail? | WHY | Walks one displacement, then another; the parallelogram gives the same result | 6.4 |
| Why does a scalar stretch but not turn a vector? | WHY | Slides k from −2 to 2: the arrow stretches and flips, but stays on its line | 6.4 |
| Why is u · v = ‖u‖ ‖v‖ cos θ? | WHY | Casts u's shadow onto v; the law of cosines shows the algebraic and geometric forms agree | 6.5 |
| Why does perpendicular mean dot = 0? | WHY | Rotates u around v and watches the shadow vanish at 90° | 6.5 |
| Plane in a crosswind | APP | Sets heading, airspeed and wind; the ground track is the vector sum | 6.4 |
| Why do cable tensions explode as they flatten? | APP | Hangs a sign from two cables; as the angle closes in, the tension needed to hold the weight shoots up (static equilibrium) | 6.4 |
| Work when pulling at an angle | APP | Pulls a sled: only the component along the motion does work, W = F · d | 6.5 |
| Block on an incline | APP | Splits gravity into components along and across the slope (scalar component) | 6.5 |

### 12. Polar & Complex · §7.1–7.4, App. A.2, Ch. 7 activity

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why polar coordinates? | WHY | Locates points radar-style (turn, then walk) and compares with x = r cos θ, y = r sin θ | 7.1 |
| Why does one point have many polar names? | WHY | Adds 2π or flips to negative r and lands on the same dot | 7.1 |
| Why does a rose have n or 2n petals? | WHY | Traces r = a cos nθ with a pen: for even n, negative r draws new petals behind; for odd n, it retraces | 7.2 |
| Polar curve gallery | WHY | Moves sliders through cardioid, limaçon, spiral, lemniscate and rose (the book's table of standard curves) | 7.2 |
| Why does i live on a perpendicular axis? | WHY | Multiplies by i repeatedly: each time is a 90° turn, so i² = −1 is a 180° turn | 7.3, A.2 |
| Why does multiplying complex numbers add angles? | WHY | Multiplies two numbers and sees the lengths multiply and the angles add | 7.3 |
| Why De Moivre? | WHY | Raises r∠θ to the n-th power: a spiral of n equal turns | 7.4 |
| Why are n roots evenly spaced? | WHY | Drags n: the roots form a regular n-gon on a circle | 7.4 |
| Polar ↔ rectangular converter | HOW | Converts points and equations both ways, with a dual grid | 7.1 |
| Complex arithmetic: rectangular vs polar | HOW | Does the same product both ways and sees why polar is easier | 7.3 |
| Orbits of planets | APP | Changes the eccentricity in r = a(1 − e²)/(1 + e cos θ) to go from circle to ellipse | Ch. 7 |

The book's Appendix A.1 (the real number system) has no tool, because it doesn't need a visual.

## Build order for Claude Code

Build a WHY spine of 10 tools first, then the shared components they need, then fill the grids. The spine tells the whole trig story on its own, so the site is useful for teaching from the first week.

**The WHY spine, in teaching order:**

1. Why is a full turn 360°? (Box 1). This is the reference page that fixes the template, the neo-brutalist look and the tile pattern.
2. Why radians are the natural unit (Box 1)
3. Why does the ratio depend only on the angle? (Box 2)
4. Why do we need a circle at all? (Box 4)
5. Why is the sine graph a wave? (Box 5)
6. What do A, B, C and k do? (Box 5: four tools sharing one engine)
7. Why cos(A − B) = cos A cos B + sin A sin B (Box 8)
8. Why those exact ranges for arcsin and arccos? (Box 9)
9. Why is the law of cosines Pythagoras with a correction? (Box 10)
10. Why does i live on a perpendicular axis? (Box 12)

**Shared components to build once, in `static/viz/lib/`:**

| Component | Reused by | What it does |
| --- | --- | --- |
| Unit circle | about 30 tools across Boxes 4–9 | Draggable point with live (cos, sin), ray, reference triangle and quadrant signs |
| Spinner-to-graph tracer | Boxes 5–7 | A spinning point projected onto a time axis, with A, B, C and k sliders |
| Triangle canvas | Boxes 2, 3, 10 | Draggable vertices with live side lengths, angles and ratios |
| Phasor adder | Boxes 7, 8, 12 | Spinning arrows added tip-to-tail, with the resulting wave |
| Function plotter | Boxes 5, 6, 9 | Zoomable axes, multiple curves, shading between curves |
| Live formula strip | every tool | A KaTeX equation whose numbers update as the sliders move |
| Neo-brutalist control kit | every tool | Slider, toggle, stepper and reveal-answer button, all from one `brutal.css` |

**Make the navigation data-driven.** A single `Tile` model with a parent link (a tree), a slug, a title, a WHY/HOW/APP tag, the book section, and a published flag can drive the 3×4 grids and breadcrumbs at any depth. A validation rule caps children at 12. This catalogue then becomes the seed fixture, and unpublished tiles can show as "coming soon".

Next step: export this doc as Markdown into the repo (`docs/catalogue/trigonometry.md`) and point Claude Code at it, starting with spine tool 1.
