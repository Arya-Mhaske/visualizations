# Calculus Visualisation Catalogue

Sources: **St** = Stewart, *Calculus*, 8th ed. · **Ax** = Axler, *Precalculus: A Prelude to Calculus*. *(ext.)* marks tools that go beyond both books.

Axler's topics mostly overlap the existing precalculus subjects. His distinctive angles (e and ln defined as areas, area by stretching, equality of functions, the triangle inequality) are added there instead of duplicated (section *Updates to existing subjects*). Stewart's precalculus review (1.1–1.3, App. A–E, G) is already covered. Its trig, parametric and conic material is cross-linked.

## Subject map

| # | Subject | Boxes | Tools |
| --- | --- | --- | --- |
| 1 | Limits & Continuity | 6 | 29 |
| 2 | Derivatives | 8 | 44 |
| 3 | Applications of Derivatives | 7 | 34 |
| 4 | Integrals | 10 | 39 |
| 5 | Applications of Integrals | 8 | 36 |
| 6 | Differential Equations | 8 | 30 |
| 7 | Infinite Series | 5 | 27 |
| 8 | Vectors & 3D Space | 6 | 23 |
| 9 | Multivariable Calculus | 8 | 35 |
| 10 | Vector Calculus | 6 | 20 |

Total: 317 calculus tools in 10 subjects.

## Limits & Continuity

### 1. Why Calculus? · St Preview, 1.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do we need limits to find areas? | WHY | Fills a circle with polygons of 6, 12, 24 … sides; their areas creep up to πr² but never reach it in finitely many steps (Archimedes) | St Preview |
| Why is a tangent the limit of secants? | WHY | Slides the second point toward the first and watches the secant settle into the tangent | St 1.4 |
| Why is 'speed right now' a limit? | WHY | Shrinks the time interval for an average speed: 1 s, 0.1 s, 0.01 s … and the values settle | St 1.4 |
| Why can infinitely many steps take finite time? | WHY | Runs Zeno's Achilles and tortoise: the infinitely many catch-up times add to a finite total | St Preview |
| Newton, Leibniz and the invention of calculus | APP | Reads a timeline of who found what, and why the two notations both survived | St 4 project |

### 2. The Limit Idea · St 1.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why doesn't a limit care about the point itself? | WHY | Fills, empties and moves the dot at x = a; the limit doesn't change | St 1.5 |
| Why do left and right limits have to agree? | WHY | Approaches a jump from each side and gets two different answers | St 1.5 |
| Why does sin(1/x) have no limit at 0? | WHY | Zooms toward 0 and finds infinitely many wiggles, all between −1 and 1 | St 1.5 |
| Why can a calculator lie about a limit? | WHY | Evaluates (√(t² + 9) − 3)/t² for ever-smaller t; the true limit is 1/6, but rounding eventually shows 0 | St 1.5 |
| Why is '→ ∞' not a number? | WHY | Watches 1/x² grow past every bound you set; an infinite limit describes how the function behaves | St 1.5 |
| Estimate a limit from a table and a graph | HOW | Zooms the graph and fills in the table together | St 1.5 |

### 3. Limit Laws · St 1.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why can you just substitute for polynomials? | WHY | Sees there's no gap or jump to worry about; that's what continuity will mean | St 1.6 |
| What does 0/0 tell you? | WHY | Factors and cancels to reveal the hole, then reads the height of the hole | St 1.6 |
| Why does the squeeze theorem work? | WHY | Traps x² sin(1/x) between −x² and x²; both squeeze to 0 | St 1.6 |
| Limit-law stepper | HOW | Applies the sum, product and quotient laws one at a time with a reason shown | St 1.6 |
| Rationalise to find a limit | HOW | Multiplies by the conjugate to clear a 0/0 | St 1.6 |

### 4. The Precise Definition · St 1.7

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| What does 'as close as you like' really mean? | WHY | Plays the ε–δ game: you pick a band ε around L, the tool finds a δ window that fits (spec below) | St 1.7 |
| Why does δ depend on ε, and on steepness? | WHY | Steepens the function and watches the δ window shrink | St 1.7 |
| Limits at infinity: the N version | WHY | Sets a band around the asymptote and finds where the graph enters it for good | St 1.7 |
| ε–δ proof builder | HOW | Writes the proof for linear and quadratic examples with each choice explained | St 1.7 |

**Spec: What does 'as close as you like' really mean?**

1. Game: the student drags an ε band around L; the tool shades the largest δ window whose graph stays inside the band.
2. Shrink: an ε slider down to 0.001 shows δ always exists for a limit that's true.
3. Failure: a jump function where no δ works for small ε, so the student sees why the limit doesn't exist.
4. Formula strip: |x − a| < δ ⇒ |f(x) − L| < ε, with live numbers.

### 5. Continuity · St 1.8

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does 'no lifting the pen' need three conditions? | WHY | Breaks each condition in turn: the value is missing, the limit is missing, or they disagree | St 1.8 |
| Three kinds of discontinuity | WHY | Sorts removable, jump and infinite breaks | St 1.8 |
| Why must a continuous path cross every level? (IVT) | WHY | Walks a climber from 1000 m to 3000 m; they must pass 2000 m, unless the path jumps | St 1.8 |
| Make a piecewise function continuous | HOW | Picks the constant that joins the pieces | St 1.8 |
| Two opposite points on the equator with equal temperature *(ext.)* | APP | Applies the IVT to the temperature difference around a circle | — |

### 6. Limits at Infinity · St 3.4, 6.8

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do dominant terms decide horizontal asymptotes? | WHY | Divides by the highest power and sees the other terms fade (see Functions & Graphs → Rational Functions) | St 3.4 |
| Why does eˣ beat every power, and ln x lose to every power? | WHY | Races eˣ against x¹⁰⁰ and ln x against x^0.01 far out | St 6.8 |
| Why is ∞ − ∞ undetermined? | WHY | Finds that √(x² + x) − x → ½, while other ∞ − ∞ forms give 0 or ∞ | St 3.4 |
| Divide by the highest power | HOW | Steps through rational and root examples | St 3.4 |

## Derivatives

### 1. What is a Derivative? · St 2.1–2.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is the derivative the slope you see when you zoom in? | WHY | Zooms into a smooth curve until it looks straight; that straight line's slope is f′(a) (spec below) | St 2.1 |
| Why is a derivative a rate of change? | WHY | Compares the odometer (position) with the speedometer (its derivative), driven live | St 2.1 |
| Why has \|x\| no derivative at 0? | WHY | Zooms in forever and the corner never straightens | St 2.2 |
| Why does differentiable imply continuous, but not conversely? | WHY | Sees a jump kill the derivative, while a corner is continuous but still not differentiable | St 2.2 |
| Draw f′ from f | WHY | Slides a slope-meter along f and plots the readings to build f′ | St 2.2 |
| Derivative from the definition | HOW | Simplifies the difference quotient, then lets h → 0 | St 2.1–2.2 |
| How tangents were found before calculus | APP | Tries Fermat's and Barrow's methods on a parabola | St 2 project |

**Spec: Why is the derivative the slope you see when you zoom in?**

1. Zoom: a microscope on y = x² at a = 1; each ×10 zoom makes the curve straighter.
2. Read: the zoomed line's slope is measured live and converges to 2.
3. Corner: the same microscope on |x| at 0 never straightens.
4. Link: the difference-quotient secant overlaid, with h tied to the zoom level.

### 2. Differentiation Rules · St 2.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is d/dx xⁿ = nxⁿ⁻¹? | WHY | Grows a square of side x by dx: the new area is about 2x·dx; a cube grows on 3 faces, giving 3x²·dx | St 2.3 |
| Why the product rule? | WHY | Grows a u × v rectangle: two thin strips u·dv + v·du, plus a corner too small to count | St 2.3 |
| Why the quotient rule? | WHY | Builds it from the product rule applied to u = (u/v)·v | St 2.3 |
| Why is eˣ its own derivative? | WHY | Tries bases 2, 2.5, 3 and finds the one whose slope at 0 is exactly 1 | St 2.3, 6.3 |
| Rule drill | HOW | Picks the right rule for random functions | St 2.3 |
| Build a better roller coaster | APP | Joins track pieces so the heights and slopes match and the ride is smooth | St 2.3 project |

### 3. Trig Derivatives · St 2.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does sin θ / θ → 1, and only in radians? | WHY | Squeezes the sector between two triangles; switching to degrees makes the limit π/180 | St 2.4 |
| Why is (sin x)′ = cos x? | WHY | Runs a point on the unit circle: its vertical speed is its horizontal position | St 2.4 |
| Why is (cos x)′ = −sin x? | WHY | Uses the same circle: the horizontal speed is minus the height | St 2.4 |
| Derivatives of tan, sec, csc, cot | HOW | Derives each from sin and cos with the quotient rule | St 2.4 |

### 4. Chain Rule · St 2.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do rates multiply? | WHY | Turns three gears: if A turns 3 times as fast as B, and B twice as fast as C, then A turns 6 times as fast as C | St 2.5 |
| Why do you need the inside derivative? | WHY | Squeezes sin(2x) and watches its slopes double | St 2.5 |
| Peel the onion | HOW | Differentiates nested functions layer by layer | St 2.5 |
| Where should a pilot start descent? | APP | Fits a smooth cubic glide path that meets the runway level | St 2.5 project |

### 5. Implicit Differentiation · St 2.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| How can a curve that isn't a function have a slope? | WHY | Finds tangents all around the circle x² + y² = 25 | St 2.6 |
| Why is dy/dx = −x/y on a circle? | WHY | Sees the tangent is perpendicular to the radius | St 2.6 |
| Implicit stepper | HOW | Differentiates both sides, treating y as y(x) | St 2.6 |
| Families of implicit curves | APP | Changes a parameter and watches the curve family morph | St 2.6 lab |

### 6. Exp, Log & Inverse Derivatives · St 6.1–6.4, 6.6–6.7

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is an inverse function's slope the reciprocal? | WHY | Reflects a tangent line in y = x: rise and run swap | St 6.1 |
| Why is (ln x)′ = 1/x? | WHY | Reads it as the reciprocal of eˣ's slope at the mirrored point | St 6.2–6.4 |
| Why is (aˣ)′ = aˣ ln a? | WHY | Rewrites aˣ as e^(x ln a); ln a is the stretch | St 6.4 |
| Why does logarithmic differentiation tame xˣ? | WHY | Takes ln first so the exponent comes down | St 6.4 |
| Why is (arctan x)′ = 1/(1 + x²)? | WHY | Reads it off the triangle with tan θ = x | St 6.6 |
| Derivatives of sinh and cosh | HOW | Sees them behave like sin and cos with one sign flipped (see Exponentials & Logarithms → Hyperbolic Functions) | St 6.7 |
| Derivative table quiz | HOW | Practises the exp, log, inverse-trig and hyperbolic derivatives | St 6.2–6.7 |

### 7. Rates in Science · St 2.7–2.8

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is velocity the derivative of position, and acceleration of velocity? | WHY | Sees three linked graphs (s, v, a) updating together | St 2.7 |
| Why does a sliding ladder's top speed up near the ground? | WHY | Pulls the foot out at a steady speed; the top's speed blows up as it nears the ground | St 2.8 |
| Why does a balloon's radius grow more slowly as it inflates? | WHY | Pumps in air at a constant rate; the same volume spreads over a bigger surface | St 2.8 |
| Related-rates stepper | HOW | Writes the relation, differentiates in t, then substitutes | St 2.8 |
| Rates across the sciences | APP | Sees current = dQ/dt, reaction rates, marginal cost and population growth as one idea | St 2.7 |
| Filling a cone with water | APP | Sees the water level rise fast first, then slow | St 2.8 |

### 8. Linear Approximation · St 2.9

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is the tangent the best straight-line guess? | WHY | Compares lines through the point; only the tangent's error shrinks faster than the distance | St 2.9 |
| Why is √4.1 ≈ 2.025? | WHY | Rides the tangent at x = 4 instead of the curve (true value 2.0248…) | St 2.9 |
| Why is sin x ≈ x for small x? | WHY | Zooms in at 0 until the two graphs merge; this is why the pendulum formula works | St 2.9 |
| dy versus Δy | WHY | Sees the tangent's rise against the curve's rise | St 2.9 |
| Measurement error | APP | Measures a radius as 21 ± 0.05 cm and estimates the error in the volume | St 2.9 |
| Taylor polynomials, a first look | APP | Adds a quadratic term to beat the tangent line | St 2 lab |

## Applications of Derivatives

### 1. Maxima & Minima · St 3.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why are peaks where the tangent is flat? | WHY | Moves along a smooth hilltop: the slope changes sign at the top (Fermat) | St 3.1 |
| Why doesn't f′ = 0 guarantee a peak? | WHY | Examines x³ at 0: flat, but no turn | St 3.1 |
| Why does a closed interval guarantee a max and min? | WHY | Removes an endpoint, or adds a jump, and the guarantee breaks (Extreme Value Theorem) | St 3.1 |
| Closed-interval method | HOW | Checks the critical points and the endpoints | St 3.1 |
| Why is a rainbow at 42°? | APP | Sends rays through a raindrop; the deviation has a minimum at 138°, and light piles up there | St 3.1 project |

### 2. Mean Value Theorem · St 3.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Rolle: why a thrown ball stops at the top | WHY | Sees equal heights at start and end force zero velocity somewhere | St 3.2 |
| Why must you hit your average speed at some instant? | WHY | Tilts Rolle's picture; the secant's slope is matched by a tangent | St 3.2 |
| Why does f′ = 0 everywhere mean f is constant? | WHY | Applies the MVT between any two points | St 3.2 |
| Section speed cameras *(ext.)* | APP | Uses the MVT to argue speeding from two timestamps alone | — |

### 3. Shape of a Graph · St 3.3, 3.5–3.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does f′ > 0 mean rising? | WHY | Watches the slope-meter and the graph together | St 3.3 |
| Why is f″ the bend? | WHY | Sees concave up or down as the slope increasing or decreasing; inflection is where that flips | St 3.3 |
| Why does the second-derivative test work? | WHY | A critical point in a cup is a minimum, in a cap a maximum | St 3.3 |
| Curve-sketching checklist | HOW | Stacks the graphs of f, f′ and f″ | St 3.5 |
| Families of graphs | HOW | Changes a parameter and tracks how the extrema move | St 3.6 |
| When does an epidemic peak in new cases? *(ext.)* | APP | Finds the inflection point of a logistic curve | — |

### 4. Optimisation · St 3.7, 6.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does optimisation mean solving f′ = 0? | WHY | Builds the function to maximise, then finds where it's flat | St 3.7 |
| Why does light bend? Fermat's least time | WHY | Moves the crossing point on a boundary and minimises the travel time; Snell's law falls out (see Trigonometry → Right-Triangle Ratios) | St 3.7 |
| Why aren't real cans the 'optimal' shape? | APP | Finds h = 2r for least metal, then adds the cost of seams and lids | St 3.7 project |
| Planes and birds: least energy | APP | Finds the speed that minimises energy per km | St 3.7 project |
| Fence, box and window problems | APP | Practises the classic set | St 3.7 |
| Where to sit at the movies | APP | Maximises the viewing angle with arctan | St 6.6 project |

### 5. L'Hôpital's Rule · St 6.8

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does l'Hôpital work? | WHY | Zooms in near a until both functions look like lines; the ratio of heights becomes the ratio of slopes | St 6.8 |
| Why isn't 0/0 a number? | WHY | Sees three 0/0 limits give 0, 5 and ∞ | St 6.8 |
| Why does (1 + 1/n)ⁿ → e? | WHY | Takes ln, applies l'Hôpital, then exponentiates (see Exponentials & Logarithms → The Number e) | St 6.8 |
| Indeterminate-form converter | HOW | Rewrites 0·∞, ∞ − ∞, 1^∞, 0⁰ and ∞⁰ as 0/0 | St 6.8 |
| Who really found l'Hôpital's rule? | APP | Reads the Bernoulli–l'Hôpital deal | St 6.8 project |

### 6. Newton's Method · St 3.8

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does sliding down tangents find roots so fast? | WHY | Watches the correct digits roughly double each step | St 3.8 |
| Why can Newton's method fail? | WHY | Tries a bad start, a flat tangent and a 2-cycle | St 3.8 |
| Iteration stepper | HOW | Computes √2 and solves cos x = x | St 3.8 |
| How calculators find square roots | APP | Sees the Babylonian averaging method is Newton's method for x² = a | St 3.8 |

### 7. Antiderivatives · St 3.9

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does every antiderivative carry + C? | WHY | Slides a family of parallel curves that share one slope field | St 3.9 |
| Why do velocity and a start point fix position? | WHY | Picks one curve from the family with the initial value | St 3.9 |
| Antiderivative drill | HOW | Reverses the derivative table | St 3.9 |
| From a = −g to the height formula | APP | Integrates twice and recovers h = h₀ + v₀t − ½gt² | St 3.9 |

## Integrals

### 1. Area & Distance · St 4.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is distance the area under a velocity graph? | WHY | Sees constant speed × time as a rectangle, then varying speed as many thin rectangles | St 4.1 |
| Why do more rectangles give the exact area? | WHY | Increases n and watches left, right and midpoint sums squeeze together | St 4.1 |
| Why is the area under x² from 0 to 1 exactly ⅓? | WHY | Sums the rectangles, uses Σk² = n(n + 1)(2n + 1)/6, and lets n → ∞ | St 4.1 |
| Riemann-sum explorer | HOW | Chooses the sample points and n | St 4.1 |

### 2. The Definite Integral · St 4.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does area below the axis count as negative? | WHY | Uses velocity: going backwards subtracts distance | St 4.2 |
| Why the long S? | WHY | Sees Leibniz's ∫ as a stretched 'S' for summa | St 4.2 |
| Properties as pictures | WHY | Splits intervals, flips limits, compares heights | St 4.2 |
| Midpoint-rule estimates | HOW | Estimates with n slices and compares with the exact value | St 4.2 |

### 3. Fundamental Theorem · St 4.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is the derivative of the area function the height? | WHY | Adds a thin strip of width h; the area grows by about f(x)·h (spec below) | St 4.3 |
| Why does total change = the integral of the rate? | WHY | Reads the odometer reading as accumulated speedometer readings | St 4.3 |
| Why do integrating and differentiating undo each other? | WHY | Goes around the loop f → area function → its derivative → f | St 4.3 |
| Area functions | APP | Explores how g(x) = ∫ₐˣ f grows, flattens and falls | St 4.3 project |

**Spec: Why is the derivative of the area function the height?**

1. Area function: drag x and shade A(x) = ∫ₐˣ f; plot A beside f.
2. Strip: add width h; the new sliver is about a rectangle of height f(x), so ΔA ≈ f(x)·h.
3. Limit: (A(x + h) − A(x))/h shown converging to f(x) as h shrinks.
4. Consequence: ∫ₐᵇ f = F(b) − F(a) for any antiderivative F (FTC 2), with an odometer analogy.

### 4. Net Change · St 4.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is net change an integral? | WHY | Integrates the inflow rate of a tank to get the water gained | St 4.4 |
| Displacement versus distance travelled | WHY | Integrates v versus \|v\| for a walk that turns back | St 4.4 |
| Indefinite-integral table | HOW | Matches functions to antiderivatives | St 4.4 |

### 5. Substitution · St 4.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is substitution the chain rule backwards? | WHY | Spots f(g(x))·g′(x) as a derivative in disguise | St 4.5 |
| Why do the limits change with u? | WHY | Maps the x-interval to the u-interval | St 4.5 |
| Why do odd functions integrate to 0 on [−a, a]? | WHY | Sees the area on each side cancel | St 4.5 |
| u-substitution stepper | HOW | Picks u, finds du and rewrites the integral | St 4.5 |

### 6. Integration by Parts · St 7.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is integration by parts the product rule backwards? | WHY | Splits the uv rectangle into ∫u dv and ∫v du | St 7.1 |
| Why do some choices of u make it worse? | WHY | Tries both choices on x eˣ | St 7.1 |
| Tabular method | HOW | Repeats parts in a table | St 7.1 |

### 7. Trig Integrals & Substitution · St 7.2–7.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does sin² x average to ½? | WHY | Stacks sin² and cos², which are shifts of each other and sum to 1 | St 7.2 |
| Why does x = a sin θ remove √(a² − x²)? | WHY | Reads the triangle: the root becomes a cos θ | St 7.3 |
| Why is a circle's area πr²? | WHY | Integrates √(r² − x²) by trig substitution | St 7.3 |
| Powers of sin and cos | HOW | Uses the odd/even power strategy | St 7.2 |
| Trig-substitution stepper | HOW | Chooses sin, tan or sec by the form of the root | St 7.3 |

### 8. Partial Fractions & Strategy · St 7.4–7.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do partial fractions make rational functions integrable? | WHY | Splits the function into logs and arctans (see Systems & Matrices → Partial Fractions) | St 7.4 |
| Why do some integrals have no formula? | WHY | Meets ∫e^(−x²) dx: the integral exists, but no elementary antiderivative does | St 7.5 |
| Integration strategy | HOW | Follows a decision flowchart | St 7.5 |
| Patterns in integrals | HOW | Spots a family pattern with a CAS-style table | St 7.6 project |

### 9. Numerical Integration · St 7.7

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do trapezoid and midpoint err in opposite directions? | WHY | Sees concave curves above or below the chords and tangents | St 7.7 |
| Why is Simpson's rule so much better? | WHY | Fits parabolas instead of lines; doubling n cuts the error about 16 times | St 7.7 |
| Compare the rules | HOW | Runs left, mid, trapezoid and Simpson on one integral | St 7.7 |
| Area from sampled data | APP | Estimates an area or distance from a table of readings | St 7.7 |

### 10. Improper Integrals · St 7.8

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does ∫1/x² converge but ∫1/x not? | WHY | Extends the right end and watches one area stall and the other keep growing | St 7.8 |
| Gabriel's horn: finite volume, infinite surface | WHY | Rotates 1/x: it can be filled with paint but not painted | St 7.8, 8.2 |
| Comparison for integrals | WHY | Traps the integrand between known ones | St 7.8 |
| Evaluate improper integrals as limits | HOW | Sends a bound to ∞ or to a vertical asymptote | St 7.8 |

## Applications of Integrals

### 1. Area Between Curves · St 5.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why top minus bottom, even below the axis? | WHY | Shifts both curves down and the area doesn't change | St 5.1 |
| Why slice sideways sometimes? | WHY | Compares x-slices with y-slices on a sideways parabola | St 5.1 |
| Find the intersections, then integrate | HOW | Locates the bounds, then sets up the integral | St 5.1 |
| Gini index of inequality | APP | Measures the area between the Lorenz curve and the equality line | St 5.1 project |

### 2. Volumes · St 5.2–5.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do equal slices mean equal volumes? | WHY | Shears a stack of coins (Cavalieri's principle) | St 5.2 |
| Why discs and washers? | WHY | Rotates a region; every slice is a circle or a ring | St 5.2 |
| Why shells? | WHY | Unrolls a thin cylinder into a flat slab: 2πrh·dr | St 5.3 |
| Why is a cone ⅓ of its cylinder? | WHY | Sums disc slices of a cone and compares | St 5.2 |
| Why is a sphere ⁴⁄₃πr³? | WHY | Stacks discs of radius √(r² − x²) | St 5.2 |
| Disc, washer or shell? | HOW | Picks the method that avoids splitting the region | St 5.3 |
| Rotating on a slant | APP | Rotates about a tilted line | St 5.2 project |

### 3. Work · St 5.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is work an integral when the force changes? | WHY | Stretches a spring: F = kx gives the area of a triangle | St 5.4 |
| Pumping out a tank | APP | Lifts each slice its own distance | St 5.4 |
| Lifting a chain or a leaking bucket | APP | Handles a changing weight as it rises | St 5.4 |

### 4. Average Value · St 5.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is the average value the integral ÷ width? | WHY | Lets the 'water' under the curve settle into a level rectangle | St 5.5 |
| Why is the average actually reached? | WHY | Sees the level line must cross a continuous curve (MVT for integrals) | St 5.5 |
| Average temperature over a day | APP | Integrates a sinusoidal temperature model | St 5.5 |
| Bat meets ball: impulse | APP | Sees the impulse ∫F dt is the area under the force-time graph | St 5.5 project |

### 5. Arc Length & Surface Area · St 8.1–8.2, 10.2, 10.4 · Ax 4.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is arc length ∫√(1 + (dy/dx)²) dx? | WHY | Adds up tiny hypotenuses | St 8.1 · Ax 4.1 |
| Why does surface area use the slant height? | WHY | Unrolls lampshade bands; the radius alone undercounts | St 8.2 |
| Why is polar area ½∫r² dθ? | WHY | Fills the curve with thin sectors instead of rectangles | St 10.4 |
| Arc length of parametric and polar curves | HOW | Uses √(x′² + y′²) and √(r² + r′²) | St 10.2, 10.4 |
| Arc-length contest | APP | Designs a curve between two points with the shortest or longest length | St 8.1 project |

### 6. Physics & Engineering · St 8.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does water push harder on a dam's base? | WHY | Slices the dam into strips and integrates the pressure × area | St 8.3 |
| Why is the centre of mass a weighted average? | WHY | Balances a plate on a pin | St 8.3 |
| Pappus: volume = area × distance travelled | WHY | Rotates a region and tracks its centroid | St 8.3 |
| Hydrostatic force on a dam or tank end | APP | Computes the force for realistic shapes | St 8.3 |
| Complementary coffee cups | APP | Compares two cups whose profiles fill each other's gaps | St 8.3 project |

### 7. Economics & Biology · St 8.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is consumer surplus an area? | WHY | Adds up each buyer's 'would have paid' minus the price | St 8.4 |
| Blood flow in a vessel | APP | Integrates Poiseuille's velocity profile | St 8.4 |
| Measuring cardiac output | APP | Uses the dye-dilution integral | St 8.4 |

### 8. Continuous Probability · St 8.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does probability become area? | WHY | Shrinks histogram bins until they become a density curve | St 8.5 |
| Why is P(X = exactly 5) = 0? | WHY | Sees a single point has zero width | St 8.5 |
| Why is the mean the balance point? | WHY | Balances the density on a pin | St 8.5 |
| Normal curve: heights and exam scores | APP | Shades P(a < X < b) under a bell curve | St 8.5 |
| Waiting times | APP | Uses the exponential density for waiting at a counter | St 8.5 |

## Differential Equations

### 1. What is a Differential Equation? · St 9.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why can a rule about rates predict the future? | WHY | Gives a rate law and steps forward in time from the present state | St 9.1 |
| Why does a DE have a family of solutions? | WHY | Sees many curves obey the same rule; an initial condition picks one | St 9.1 |
| Three models from one idea | APP | Compares population, cooling and a spring as rate = f(state) | St 9.1 |

### 2. Direction Fields & Euler · St 9.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does a slope field show every solution at once? | WHY | Drops seeds anywhere and watches them follow the arrows (spec below) | St 9.2 |
| Why does Euler's method drift? | WHY | Takes straight steps along a curving path; halving the step halves the error | St 9.2 |
| Euler stepper | HOW | Runs the method by hand for a few steps, then automates it | St 9.2 |
| Current in an RL circuit | APP | Uses a direction field for L dI/dt + RI = E | St 9.2 |

**Spec: Why does a slope field show every solution at once?**

1. Field: arrows for dy/dx = f(x, y); tap anywhere to drop a seed that flows with them.
2. Families: many seeds give many solution curves, showing the family behind + C.
3. Equilibria: horizontal rows of arrows where f = 0; seeds near them settle or flee.
4. Euler overlay: step-size slider, so the student sees the exact curve versus straight-line steps.

### 3. Separable Equations · St 9.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does 'separating dy and dx' work? | WHY | Sees it is the chain rule in disguise | St 9.3 |
| Separable stepper | HOW | Separates, integrates and applies the initial value | St 9.3 |
| How fast does a tank drain? | APP | Uses Torricelli's law to watch the level fall fast, then slowly | St 9.3 project |
| Salt in a mixing tank | APP | Tracks inflow and outflow concentration | St 9.3 |
| Is a ball faster going up or coming down? | APP | Adds air resistance and compares the two times | St 9.3 project |
| Orthogonal trajectories | APP | Draws field lines perpendicular to a family of curves | St 9.3 |

### 4. Population Models · St 9.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does logistic growth slow down? | WHY | Sees the growth rate shrink as P nears K | St 9.4 |
| Why is P = K stable but P = 0 not? | WHY | Nudges the population off each equilibrium | St 9.4 |
| Sustainable fishing | APP | Adds a harvest rate and finds the collapse threshold | St 9.4 |

### 5. Linear First-Order · St 9.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does the integrating factor work? | WHY | Turns the left side into an exact product-rule derivative | St 9.5 |
| Integrating-factor stepper | HOW | Steps through finding and applying the factor | St 9.5 |
| RC and RL circuits | APP | Charges a capacitor and watches the exponential approach | St 9.5 |

### 6. Predator–Prey · St 9.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do the populations cycle? | WHY | Watches closed loops in the phase plane | St 9.6 |
| Why do predators peak after prey? | WHY | Sees the lag on the time plot (see Trigonometry → Waves & Oscillations) | St 9.6 |
| Lotka–Volterra explorer | APP | Changes birth and death rates | St 9.6 |

### 7. Second-Order Equations · St 17.1–17.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does guessing e^(rx) work? | WHY | Substitutes it and gets the characteristic equation | St 17.1 |
| Why do complex roots mean oscillation? | WHY | Uses e^((a + bi)x) = e^(ax)(cos bx + i sin bx) | St 17.1 |
| Under-, critically and over-damped | WHY | Tunes a car's shock absorber | St 17.3 |
| Why does resonance blow up? | WHY | Drives at the natural frequency and watches the amplitude grow linearly | St 17.3 |
| Undetermined coefficients and variation of parameters | HOW | Finds a particular solution | St 17.2 |
| Spring–mass and LC circuits | APP | Sees the two systems obey the same equation | St 17.3 |

### 8. Series Solutions · St 17.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why can power series solve what formulas can't? | WHY | Builds a solution term by term from a recurrence | St 17.4 |
| Series-solution stepper | HOW | Finds the recurrence and the first terms | St 17.4 |

## Infinite Series

### 1. Sequences & Limits · St 11.1 · Ax 7.1, 7.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why must a bounded, increasing sequence converge? | WHY | Pushes a sequence up against a ceiling it can't pass | St 11.1 |
| Limit of a sequence | HOW | Works with the definition and the squeeze theorem on sequences | St 11.1 · Ax 7.3 |
| Logistic sequences: from order to chaos | APP | Raises r in xₙ₊₁ = r xₙ(1 − xₙ) and watches the period double into chaos | St 11.1 lab |

### 2. Series & Convergence · St 11.2 · Ax 7.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does the harmonic series diverge? | WHY | Groups the terms into blocks each worth more than ½ (Oresme) | St 11.2 |
| Why isn't 'terms → 0' enough? | WHY | Sees the harmonic series has terms → 0 and still diverges | St 11.2 |
| Why do telescoping series collapse? | WHY | Cancels neighbouring terms | St 11.2 |
| Decimals are infinite series | WHY | Writes 0.333… as 3/10 + 3/100 + … | Ax 7.3 |

### 3. Convergence Tests · St 11.3–11.7 · Ax 7.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Integral test: why the staircase matches the curve | WHY | Fits rectangles under and over 1/x² | St 11.3 |
| Why does Σ1/n² = π²/6? | WHY | Watches the partial sums approach 1.6449…; Euler's result, shown but not proved | St 11.3 |
| Comparison tests | WHY | Traps a series under a convergent one or over a divergent one | St 11.4 |
| Why do alternating series converge? | WHY | Watches the partial sums zigzag inward; 1 − ½ + ⅓ − … = ln 2 | St 11.5 · Ax 7.3 |
| Why is the ratio test a geometric comparison? | WHY | Sees the ratio r behave like a geometric series with ratio r | St 11.6 |
| Why does rearranging change the sum? *(ext.)* | WHY | Reorders 1 − ½ + ⅓ − … to hit any target (Riemann) | St 11.6 |
| Test-strategy picker | HOW | Chooses a test by the shape of the terms | St 11.7 |

### 4. Power Series · St 11.8–11.9

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does a power series converge on an interval? | WHY | Slides x and watches convergence stop at the radius | St 11.8 |
| Why is 1/(1 − x) = 1 + x + x² + … only for \|x\| < 1? | WHY | Watches the partial sums fail outside the interval | St 11.9 |
| Differentiate and integrate term by term | HOW | Gets ln(1 + x) and arctan x series | St 11.9 |
| π from Madhava's series *(ext.)* | APP | Uses π/4 = 1 − ⅓ + ⅕ − … (Madhava of Sangamagrama, c. 1400) and a faster variant | St 11.9 |

### 5. Taylor Series · St 11.10–11.11 · Ax 7.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does matching derivatives rebuild a function? | WHY | Adds Taylor terms one at a time and watches the curve hug further out (spec below) | St 11.10 |
| Why e^(iθ) = cos θ + i sin θ | WHY | Puts iθ into the eˣ series and splits the real and imaginary parts | St 11.10 |
| Why do Taylor polynomials fail far away? | WHY | Watches ln(1 + x) break past x = 1 | St 11.10 |
| 1 + 1/1! + 1/2! + … = e | WHY | Sums the series and finds e (see Exponentials & Logarithms → The Number e) | St 11.10 · Ax 7.3 |
| Taylor builder with error band | HOW | Chooses the degree and centre and sees the error bound | St 11.11 |
| Why the pendulum formula needs sin θ ≈ θ | APP | Compares the true and approximate periods as the amplitude grows | St 11.11 |
| E = mc² plus kinetic energy | APP | Expands the relativistic energy for small v | St 11.11 |
| Radiation from the stars | APP | Sees Planck's law reduce to the classical law at long wavelengths | St 11.11 project |
| How Newton found the binomial series | APP | Extends (1 + x)ⁿ to fractional n | St 11.10 project |

**Spec: Why does matching derivatives rebuild a function?**

1. Stack: add T₀, T₁, T₂ … for eˣ, sin x and ln(1 + x); each new term matches one more derivative at the centre.
2. Reach: a shaded band where the error is below 0.01 grows with degree.
3. Limits: ln(1 + x) beyond x = 1 diverges whatever the degree; the radius of convergence is shown.
4. Payoff: e^(iθ) built from the same series, rotating the result on the complex plane.

## Vectors & 3D Space

### 1. 3D Coordinates · St 12.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do three numbers locate a point? | WHY | Walks along the corner of a room: x, then y, then up z | St 12.1 |
| Why does the distance formula gain a z² term? | WHY | Applies Pythagoras twice | St 12.1 |
| Spheres and simple surfaces | HOW | Reads off the centre and radius | St 12.1 |

### 2. Vectors in Space · St 12.2–12.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do the direction cosines squared add to 1? | WHY | Reads off the three angles a vector makes with the axes (see Trigonometry → Vectors) | St 12.3 |
| Projections in 3D | WHY | Casts one vector's shadow onto another | St 12.3 |
| Component operations | HOW | Adds, scales and normalises vectors in 3D | St 12.2 |

### 3. Cross Product · St 12.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is a × b perpendicular to both? | WHY | Rotates the pair and the right-hand rule follows | St 12.4 |
| Why is \|a × b\| the parallelogram's area? | WHY | Sees \|a\|\|b\| sin θ as base × height | St 12.4 |
| Why is a × b = −(b × a)? | WHY | Swaps the order and the hand flips | St 12.4 |
| Why is the triple product a volume? | WHY | Builds a box on three vectors | St 12.4 |
| Why does a longer spanner help? (torque) | APP | Moves the hand along the handle | St 12.4 |

### 4. Lines & Planes · St 12.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does one normal vector define a plane? | WHY | Spins a vector and its perpendicular plane follows | St 12.5 |
| Why can lines in 3D be skew? | WHY | Finds two lines that neither meet nor run parallel | St 12.5 |
| Distance from a point to a plane | HOW | Projects onto the normal | St 12.5 |
| Geometry of a tetrahedron | APP | Sums the area vectors of the faces and gets zero | St 12.5 project |

### 5. Quadric Surfaces · St 12.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do slices reveal a surface? | WHY | Moves a cutting plane and watches the traces change | St 12.6 |
| Quadric gallery | HOW | Explores the ellipsoid, paraboloids, hyperboloids, cone and saddle | St 12.6 |
| Why can cooling towers be built from straight beams? | APP | Sees a hyperboloid of one sheet made of straight lines | St 12.6 |

### 6. Space Curves & Motion · St 13.1–13.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is velocity tangent and acceleration into the turn? | WHY | Drives a point along a curve with both arrows shown | St 13.2, 13.4 |
| Why does a tight turn mean large curvature? | WHY | Fits the osculating circle as the turn tightens | St 13.3 |
| Tangential and normal acceleration | WHY | Brakes on a bend and sees the two parts separate | St 13.4 |
| Arc length of a helix | HOW | Unrolls it into a straight line | St 13.3 |
| Kepler's laws from Newton | APP | Sees equal areas swept in equal times | St 13.4 project |

## Multivariable Calculus

### 1. Functions of Two Variables · St 14.1–14.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is a contour map a stack of slices? | WHY | Floods a 3D hill level by level | St 14.1 |
| Why are 2D limits harder? | WHY | Approaches the origin along different paths and gets different answers | St 14.2 |
| Level-curve explorer | HOW | Matches surfaces with their contour maps | St 14.1 |
| Wind chill and heat index | APP | Reads f(T, v) from a table and a surface | St 14.1 |

### 2. Partial Derivatives · St 14.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is a partial derivative a slope in one direction? | WHY | Slices the surface and finds the tangent to the slice | St 14.3 |
| Why are mixed partials equal? | WHY | Checks fₓᵧ against fᵧₓ numerically (Clairaut) | St 14.3 |
| Partial-derivative drill | HOW | Holds the other variables fixed | St 14.3 |
| Cobb–Douglas production | APP | Sees how output responds to labour and to capital | St 14.3 |

### 3. Tangent Planes & Chain Rule · St 14.4–14.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does a smooth surface look flat up close? | WHY | Zooms in until the surface matches its tangent plane | St 14.4 |
| Why does the multivariable chain rule follow a tree? | WHY | Traces every path from the output to the input | St 14.5 |
| Linear approximation in 2D | HOW | Estimates f near a point | St 14.4 |
| The Speedo LZR Racer | APP | Uses a linearised drag model | St 14.4 project |

### 4. Gradient · St 14.6

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does the gradient point steepest uphill? | WHY | Rotates a direction and watches the slope peak along ∇f (spec below) | St 14.6 |
| Why is the gradient perpendicular to contours? | WHY | Sees there is no change along a contour | St 14.6 |
| Directional-derivative explorer | HOW | Computes D_u f = ∇f · u | St 14.6 |
| Which way does water run? | APP | Drops a ball on a terrain map | St 14.6 |

**Spec: Why does the gradient point steepest uphill?**

1. Terrain: a 3D hill with a walker; a direction dial sets u.
2. Slope meter: D_u f plotted against the dial angle, a cosine curve peaking along ∇f.
3. Contours: the same view from above, with ∇f perpendicular to the level curve under the walker.
4. Formula: D_u f = |∇f| cos θ, tying the peak to θ = 0.

### 5. Max, Min & Lagrange · St 14.7–14.8

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why isn't ∇f = 0 enough? (saddles) | WHY | Examines a saddle: a minimum one way, a maximum the other | St 14.7 |
| Why does the optimum touch the constraint? | WHY | Slides contours until one just kisses the constraint curve, so the gradients are parallel (Lagrange) | St 14.8 |
| Second-derivative test | HOW | Uses D = fₓₓfᵧᵧ − fₓᵧ² | St 14.7 |
| Designing a dumpster | APP | Minimises the cost for a fixed volume | St 14.7 project |
| Rocket stages and hydro-turbines | APP | Optimises with constraints | St 14.8 project |

### 6. Double Integrals · St 15.1–15.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is volume a sum of columns? | WHY | Fills the space under a surface with square columns | St 15.1 |
| Why can the order of integration swap? | WHY | Slices the same solid both ways (Fubini) | St 15.1–15.2 |
| Why does the polar area element carry an r? | WHY | Sees polar rectangles get wider further out | St 15.3 |
| Why is ∫e^(−x²) dx = √π? | WHY | Squares the integral and switches to polar coordinates | St 15.3 |
| Set up iterated integrals | HOW | Sketches the region and reads off the bounds | St 15.2 |

### 7. Mass, Moments & Surface Area · St 15.4–15.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does a skater spin faster with arms in? | WHY | Sees the moment of inertia ∫r² dm shrink | St 15.4 |
| Surface area from a double integral | HOW | Tilts small patches against the base | St 15.5 |
| Centre of mass of a plate | APP | Balances plates of non-uniform density | St 15.4 |
| Joint probability | APP | Treats P((X, Y) ∈ D) as a volume | St 15.4 |

### 8. Triple Integrals & Coordinates · St 15.6–15.9

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why are the volume elements r dr dθ dz and ρ² sin φ dρ dθ dφ? | WHY | Draws curved boxes in cylindrical and spherical coordinates | St 15.7–15.8 |
| Why does the Jacobian scale areas? | WHY | Sees a change of variables stretch little squares (see Systems & Matrices → Determinants) | St 15.9 |
| Set up triple integrals | HOW | Projects the solid onto a plane, then stacks | St 15.6 |
| Volumes of hyperspheres | APP | Sees why high-dimensional balls are almost all 'skin' | St 15.7 project |
| Roller derby: which shape rolls fastest? | APP | Compares the moments of inertia of a ball, a hoop and a cylinder | St 15.9 project |

## Vector Calculus

### 1. Vector Fields · St 16.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is a field an arrow at every point? | WHY | Reads a wind map | St 16.1 |
| Why do gradient fields cross contours at right angles? | WHY | Overlays ∇f on a contour map | St 16.1 |
| Gravity and electric fields | APP | Sees inverse-square arrows around a mass or charge | St 16.1 |

### 2. Line Integrals · St 16.2–16.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is work ∫F · dr? | WHY | Shows that only the part of the force along the path counts | St 16.2 |
| Why are conservative fields path-independent? | WHY | Sees work as a change in 'height', the potential | St 16.3 |
| Why is a closed loop worth zero in a conservative field? | WHY | Goes around a loop and returns to the same height | St 16.3 |
| Gravity on any roller-coaster track | APP | Shows that only the drop matters | St 16.3 |

### 3. Green's Theorem · St 16.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do the inside circulations cancel? | WHY | Tiles the region with small loops; the shared edges cancel, leaving the boundary | St 16.4 |
| Planimeter: area by tracing the edge | APP | Traces a boundary and reads off the area | St 16.4 |

### 4. Curl & Divergence · St 16.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Curl as a paddle wheel | WHY | Drops a paddle wheel into the flow and watches it spin | St 16.5 |
| Divergence as sources and sinks | WHY | Places a small box and sees whether more flows out or in | St 16.5 |
| Why are curl(grad f) and div(curl F) zero? | WHY | Sees no spin in a slope, and no source in a swirl | St 16.5 |

### 5. Surfaces & Flux · St 16.6–16.7

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why are parametric surfaces a grid wrapped onto a shape? | WHY | Bends a (u, v) grid onto a sphere or torus | St 16.6 |
| Why does flux depend on tilt? | WHY | Tilts a net in a stream | St 16.7 |
| Surface area of a parametric surface | HOW | Uses \|rᵤ × rᵥ\| | St 16.6 |

### 6. Stokes & Divergence Theorems · St 16.8–16.10

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does any surface with the same rim give the same circulation? | WHY | Deforms a butterfly net while keeping its rim fixed (Stokes) | St 16.8 |
| Why does outflow equal the sources inside? | WHY | Counts the arrows leaving a closed surface (divergence theorem) | St 16.9 |
| One big idea: boundary = integral of a derivative | WHY | Lines up FTC, Green, Stokes and Gauss as one pattern | St 16.10 |
| Gauss's law for electric flux | APP | Sees the flux through a closed surface measure the enclosed charge | St 16.9 |
| Three men and two theorems | APP | Reads the history of Green, Stokes and Gauss | St 16.8 project |

## Updates to existing subjects

| Subject | Box | Tool | Tag | What the student does | § |
| --- | --- | --- | --- | --- | --- |
| Numbers & Algebra | Inequalities & Absolute Value | Why is \|a + b\| ≤ \|a\| + \|b\|? | WHY | Places a and b on a number line: equal when they point the same way, smaller when they cancel (triangle inequality) | Ax 0.3 |
| Numbers & Algebra | Number Systems | Why does (−1)(−1) = 1 follow from the distributive law? | WHY | Expands (−1)(1 + (−1)) = 0 two ways; the rule is forced, not chosen | Ax 0.2 |
| Functions & Graphs | What is a Function? | When are two functions really equal? | WHY | Compares x and x²/x: same formula after cancelling, but different domains, so different functions | Ax 1.1 |
| Functions & Graphs | Combining & Inverting | Why is every increasing function one-to-one? | WHY | Slides a horizontal line across a rising graph; it can only hit once | Ax 1.6 |
| Functions & Graphs | Combining & Inverting | Decompose a function | HOW | Writes √(x² + 1) as f∘g in several ways | Ax 1.4 |
| Functions & Graphs | Coordinate Plane | Why is the perpendicular the shortest way to a line? | WHY | Drags a point along the line; the distance is least where the segment meets it at 90° | Ax 4.1 |
| Exponentials & Logarithms | Log Scales | Star brightness: apparent magnitude | APP | Sees 5 magnitudes = 100 × brightness, with brighter stars getting smaller numbers | Ax 3.5 |
| Exponentials & Logarithms | Money & Finance | Continuous versus annual growth rates | WHY | Compares 7% continuous with 7% annual growth: e^0.07 − 1 = 7.25% | Ax 4.5 |
| Trigonometry | Solving Any Triangle | Why can two different triangles have the same area? | WHY | Swaps angle θ for 180° − θ: sin is unchanged, so ½ab sin θ is too | Ax 6.1 |
| Trigonometry | Identities | Why is arccos t + arcsin t = π/2? | WHY | Sees that in a right triangle the two acute angles are complementary | Ax 5.8 |
| Conics & Curves | Parametric Curves | Bézier curves: how fonts are drawn | APP | Drags control points and watches the curve follow | St 10.1 lab |
| Conics & Curves | Parametric Curves | Circles rolling around circles | APP | Draws epicycloids and hypocycloids by rolling one circle on another | St 10.1 lab |
| Sequences, Counting & Probability | Geometric Sequences & Series | Why can't we sum every infinite list? | WHY | Contrasts 1 + ½ + ¼ + … (settles) with 1 − 1 + 1 − … (never settles) (see Infinite Series) | Ax 7.3 |
| Functions & Graphs | **Area by Stretching** (new box) | Why is a triangle half a parallelogram? | WHY | Copies the triangle, rotates it 180° and joins them | Ax 4.2 |
| Functions & Graphs | **Area by Stretching** (new box) | Why does stretching by c multiply area by c? | WHY | Stretches a region horizontally, then vertically, while a grid of squares counts the area | Ax 4.2 |
| Functions & Graphs | **Area by Stretching** (new box) | Why is an ellipse's area πab? | WHY | Stretches a unit circle by a and b | Ax 4.2 |
| Functions & Graphs | **Area by Stretching** (new box) | Why is a circle's area πr²? | WHY | Unrolls rings into a triangle, or cuts the disc into wedges and lays them into a near-rectangle | Ax 4.2 |
| Functions & Graphs | **Area by Stretching** (new box) | Area of any polygon | HOW | Splits it into triangles | Ax 4.2, 6.1 |
| Exponentials & Logarithms | **e & ln as Areas** (new box) | Why is ln c an area? | WHY | Shades the area under 1/x from 1 to c; Axler defines ln c this way (spec below) | Ax 4.3 |
| Exponentials & Logarithms | **e & ln as Areas** (new box) | Why is e where that area equals 1? | WHY | Drags c until the shaded area reads 1.000 and c reads 2.718 | Ax 4.3 |
| Exponentials & Logarithms | **e & ln as Areas** (new box) | Why does ln(ab) = ln a + ln b follow from area? | WHY | Stretches the region under 1/x horizontally by a and vertically by 1/a; the area is unchanged | Ax 4.3 |
| Exponentials & Logarithms | **e & ln as Areas** (new box) | Why is ln(1 + x) ≈ x for small x? | WHY | Sees the thin strip under 1/x is almost a 1 × x rectangle | Ax 4.4 |
| Exponentials & Logarithms | **e & ln as Areas** (new box) | Why are eˣ ≈ 1 + x and (1 + r/n)ⁿ ≈ eʳ? | WHY | Zooms in at 0, then compounds more often | Ax 4.4, 4.5 |
| Exponentials & Logarithms | **e & ln as Areas** (new box) | Why is 1 − ½ + ⅓ − ¼ + … = ln 2? | WHY | Watches the partial sums close in on 0.6931 | Ax 7.3 |
| Exponentials & Logarithms | **e & ln as Areas** (new box) | Estimate ln c with rectangles | HOW | Uses upper and lower sums under 1/x | Ax 4.3 |
| Exponentials & Logarithms | **Hyperbolic Functions** (new box) | Why are they called 'hyperbolic'? | WHY | Sees (cosh t, sinh t) trace x² − y² = 1, just as (cos t, sin t) traces the unit circle | St 6.7 |
| Exponentials & Logarithms | **Hyperbolic Functions** (new box) | Why is a hanging chain a cosh? | WHY | Hangs a chain and overlays y = a cosh(x/a); it is not a parabola | St 6.7 |
| Exponentials & Logarithms | **Hyperbolic Functions** (new box) | Hyperbolic identities | HOW | Compares cosh² − sinh² = 1 with its trig twin | St 6.7 |
| Exponentials & Logarithms | **Hyperbolic Functions** (new box) | Catenary arches and power lines | APP | Fits a catenary to an arch or a sagging cable | St 6.7 |

**Spec: Why is ln c an area?**

1. Shade: drag c along the x-axis; the area under 1/x from 1 to c is ln c (negative for c < 1).
2. Rectangles: upper and lower sums trap the area and show it is computable.
3. Product rule: ln 2 + ln 3 shown as two shaded regions; stretching the [1, 3] region by 2 lands exactly on [2, 6].
4. Payoff: e is the c where the area is 1, and exp is the inverse of this area function.


## Landing order (all subjects)

The landing page scrolls. The first 12 tiles (visible without scrolling) follow the NCERT Class 11–12 sequence. Set each subject's `order` field to match:

1. Numbers & Algebra
2. Functions & Graphs
3. Trigonometry
4. Exponentials & Logarithms
5. Sequences, Counting & Probability
6. Conics & Curves
7. Systems & Matrices
8. Limits & Continuity
9. Derivatives
10. Applications of Derivatives
11. Integrals
12. Applications of Integrals  ← end of first screen
13. Differential Equations
14. Vectors & 3D Space
15. Infinite Series
16. Multivariable Calculus
17. Vector Calculus

Physics subjects follow after these.

## JSON

The full JSON for each subject lives in catalogue/data/<slug>.json (delivered alongside this doc). Each file already includes these additions and its landing `order`.
