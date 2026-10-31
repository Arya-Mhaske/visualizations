# Calculus additions from Dawkins' notes

Sources: **D2** = Dawkins, *Calculus II* notes (2018) · **D3** = Dawkins, *Calculus III* notes (2018). Both overlap Stewart almost entirely, and D3 ch. 1 repeats D2 ch. 6. No new subjects were created. The distinct material is folded into the calculus subjects in catalogue/calculus.md.

Covered already, so nothing was added for: integration by parts and trig integrals, improper integrals, numerical integration, centre of mass, hydrostatics, probability, vectors, lines and planes, quadric surfaces, partial derivatives, double and triple integrals, change of variables, curl and divergence, Stokes, and divergence theorem.

## New boxes

### Derivatives → 9. Parametric & Polar Slopes · D2 3-2, 3-7 · St 10.2–10.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is dy/dx = (dy/dt)/(dx/dt)? | WHY | Runs a point along the curve; over a tiny time step the rise and run are y′dt and x′dt, so the dt cancels (spec below) | D2 3-2 · St 10.2 |
| Horizontal and vertical tangents | WHY | Sees dy/dt = 0 flatten the tangent and dx/dt = 0 stand it up | D2 3-2 · St 10.2 |
| How can one point have two tangents? | WHY | Watches a self-crossing curve pass the same point twice with two different slopes | D2 3-2 |
| Why isn't d²y/dx² = y″(t)/x″(t)? | WHY | Differentiates dy/dx with respect to t, then divides by dx/dt, and compares it with the wrong guess | D2 3-2 |
| Slopes of polar curves | HOW | Writes x = r cos θ, y = r sin θ and applies the parametric rule | D2 3-7 · St 10.3 |
| Why does a cycloid have cusps? | APP | Sees the rolling point stop dead (x′ = y′ = 0) every time it touches the ground | D2 3-2 · St 10.2 |

### Vectors & 3D Space → 7. Cylindrical & Spherical Coordinates · D2 6-12–6-13 · D3 1-12–1-13 · St 15.7–15.8

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why give cylinders and spheres their own coordinates? | WHY | Compares x² + y² = 9 with r = 3, and x² + y² + z² = 4 with ρ = 2 | D3 1-12, 1-13 |
| Why is φ measured down from the z-axis? | WHY | Sweeps φ from the north pole to the south and compares it with latitude | D3 1-13 |
| Convert between the three systems | HOW | Drags a point and reads (x, y, z), (r, θ, z) and (ρ, θ, φ) together | D3 1-12, 1-13 |
| Latitude and longitude are spherical coordinates *(ext.)* | APP | Places Pune on a globe and converts to (ρ, θ, φ) | — |

**Spec: Why is dy/dx = (dy/dt)/(dx/dt)?**

1. Motion: a point runs along x = t² − 3t, y = t³ − 3t with velocity arrows x′(t) and y′(t) drawn.
2. Tiny step: zoom on one time step dt; the little run is x′dt, the rise y′dt, and the slope ratio cancels dt.
3. Special tangents: scrub t to find where x′ = 0 (vertical) and y′ = 0 (horizontal); both cases are highlighted live.
4. Second derivative: the common trap y″/x″ is shown failing against the correct d/dt(dy/dx) ÷ x′.

## Tools added to existing boxes

| Subject | Box | Tool | Tag | What the student does | § |
| --- | --- | --- | --- | --- | --- |
| Integrals | Partial Fractions & Strategy | Why substitute for a whole root? | WHY | Sets u = ∛(x + 2) so the root disappears and a rational integral remains | D2 1-5 |
| Integrals | Partial Fractions & Strategy | Complete the square inside an integral | HOW | Turns x² + 4x + 13 into (x + 2)² + 9 to reach an arctan or trig substitution | D2 1-6 |
| Applications of Integrals | Arc Length & Surface Area | Why is there one ds for every coordinate system? | WHY | Sees the same tiny hypotenuse ds written for y = f(x), for parametric and for polar curves, so one formula covers all three | D2 3-11 |
| Applications of Integrals | Arc Length & Surface Area | Area under a parametric curve | HOW | Uses ∫y dx = ∫y(t) x′(t) dt and watches the sign flip if the curve runs right to left | D2 3-3 |
| Infinite Series | Convergence Tests | How close is a partial sum? Error bounds | WHY | Brackets the true sum: the next term bounds an alternating error, and integrals bound a positive tail | D2 4-13 |
| Infinite Series | Convergence Tests | Root test | HOW | Takes ⁿ√\|aₙ\|; it suits terms raised to the n-th power | D2 4-11 |
| Infinite Series | Taylor Series | Why does (1 + x)ᵏ need infinitely many terms unless k is whole? | WHY | Sees C(k, n) never hit 0 for fractional k, so the binomial series goes on forever | D2 4-18 |
| Infinite Series | Taylor Series | Integrate e^(−x²) with a series | APP | Integrates the series term by term to get a number no formula gives | D2 4-17 |
| Vectors & 3D Space | Space Curves & Motion | Why T, N and B? A rider's moving axes | WHY | Rides a roller coaster with three arrows: forward (T), into the turn (N), and the axis the turn spins about (B = T × N) | D2 6-8 · D3 1-8 |
| Multivariable Calculus | Tangent Planes & Chain Rule | Why is dy/dx = −Fₓ/Fᵧ for F(x, y) = 0? | WHY | Differentiates F(x, y(x)) = 0 with the chain-rule tree | D3 2-6 |
| Multivariable Calculus | Tangent Planes & Chain Rule | Error in a box's volume from three measurements | APP | Uses the total differential dV = yz dx + xz dy + xy dz | D3 2-5 |
| Multivariable Calculus | Gradient | Why is ∇F normal to a level surface? | WHY | Moves along the surface, where F doesn't change, so ∇F has no component along it | D3 3-2 |
| Multivariable Calculus | Max, Min & Lagrange | Absolute max/min on a closed region | HOW | Checks interior critical points, then the boundary curve | D3 3-4 |
| Multivariable Calculus | Max, Min & Lagrange | Lagrange with two constraints | HOW | Sets ∇f = λ∇g + μ∇h on the curve where two surfaces meet | D3 3-5 |
| Multivariable Calculus | Triple Integrals & Coordinates | Area is ∬dA, volume is ∭dV | WHY | Integrates the function 1 and sees area and volume drop out as special cases | D3 4-10 |
| Vector Calculus | Line Integrals | Why is ∫f ds the area of a curtain? | WHY | Raises a curtain of height f along the curve | D3 5-2 |
| Vector Calculus | Line Integrals | Why does ∫F · dr care about direction but ∫f ds doesn't? | WHY | Reverses the path: work changes sign, curtain area doesn't | D3 5-3, 5-4 |
| Vector Calculus | Line Integrals | Spot a conservative field: equal cross-partials | WHY | Checks ∂P/∂y = ∂Q/∂x, valid on a region without holes | D3 5-6 |
| Vector Calculus | Line Integrals | Find a potential function | HOW | Integrates P in x, matches with Q, then fixes the leftover function | D3 5-6 |
| Vector Calculus | Green's Theorem | Why does orientation matter? Keep the region on your left | WHY | Walks the boundary both ways; reversing flips the sign | D3 5-7 |
| Vector Calculus | Surfaces & Flux | Surface integral = mass of a curved sheet | WHY | Gives a curved sheet a varying density and adds up the mass | D3 6-3 |
| Vector Calculus | Surfaces & Flux | Why can't you measure flux through a Möbius strip? | WHY | Walks the normal arrow around once and it comes back flipped: the strip has only one side | D3 6-4 |

Total: 32 tools added (10 in 2 new boxes, 22 in existing boxes). The updated subject files are in catalogue/data/.
