# Maths Class XII (NCERT) Additions

Source: **MXII** = NCERT *Mathematics* Class XII, Parts 1–2 (2026-27, rationalised, 13 chapters). Refs: MXII 7.10 = section, Misc = miscellaneous exercise, Ex = worked example.

**Only chapters 1–2 (lemh101–102) were in the project.** Chapters 3–13 were catalogued from the standard rationalised syllabus, not from the PDFs, so check the section numbers before building those tools. The worked numbers (Bayes 22/133, bolts 28/69, a − x integral π/4, two-dice mean 7 and variance 35/6) were checked by script.

Like Maths XI, most of this book is already on the site (calculus, matrices, vectors), so it adds two boxes and tools rather than new subjects.

| Ch | Chapter | Where it lives |
| --- | --- | --- |
| 1 | Relations & Functions | Numbers & Algebra → **Sets & Relations** (retitled, +4); Functions & Graphs → Combining & Inverting (+1) |
| 2 | Inverse Trigonometric Functions | Trigonometry → Inverses & Equations (already full and complete); +1 notation tool in Combining & Inverting |
| 3 | Matrices | Systems & Matrices → Matrix Algebra (+4) |
| 4 | Determinants | → Determinants & Cramer (+5) |
| 5 | Continuity & Differentiability | Limits & Continuity, Derivatives (covered; +1 second-derivative tool) |
| 6 | Application of Derivatives | Applications of Derivatives → Maxima & Minima, Shape of a Graph (+1 each) |
| 7 | Integrals | Integrals → The Definite Integral (+2), Integration by Parts (+1) |
| 8 | Application of Integrals | Applications of Integrals → Area Between Curves (+1) |
| 9 | Differential Equations | Differential Equations → What Is a DE (+2), Separable (+2: homogeneous) |
| 10 | Vector Algebra | Vectors & 3D Space → Vectors in Space (+3); dot and cross products already covered |
| 11 | Three Dimensional Geometry | → Lines & Planes (+3) |
| 12 | Linear Programming | Systems & Matrices → Inequalities & Linear Programming (+3) |
| 13 | Probability | **New boxes:** Sequences, Counting & Probability → Conditional Probability & Bayes; Random Variables & Expectation |

## New boxes

*Subject: Sequences, Counting & Probability*

### 9. Conditional Probability & Bayes · MXII 13.1–13.5

| Tool | Tag | What the student does | § | Helps to understand first |
| --- | --- | --- | --- | --- |
| Why does 'given B' shrink the sample space? | WHY | Greys out every outcome outside B and recounts: P(A\|B) = P(A ∩ B)/P(B) | MXII 13.2 | Two-dice sample space (Sequences, Counting & Probability) |
| Why are mutually exclusive events not independent? | WHY | Sees that if A happens, an exclusive B can't, so knowing A changes P(B) completely; independence means P(A ∩ B) = P(A)P(B) | MXII 13.4 | Mutually exclusive and exhaustive events (Sequences, Counting & Probability) |
| Why does total probability split along a partition? | WHY | Cuts the sample space into E₁, E₂, E₃ and adds the slice of A in each | MXII 13.5 | When is probability favourable ÷ total? (Sequences, Counting & Probability) |
| Why does Bayes' theorem flip a conditional? | WHY | Fills a 1000-person grid: P(test + \| ill) is not P(ill \| test +) (spec below) | MXII 13.5 | Why does total probability split along a partition? (Sequences, Counting & Probability) |
| Tree-diagram builder | HOW | Multiplies along branches and adds across them | MXII 13.3 | Why does total probability split along a partition? (Sequences, Counting & Probability); Why do we multiply choices? (Sequences, Counting & Probability) |
| Drawing without replacement | HOW | Uses P(A ∩ B) = P(A) P(B\|A) for cards and balls | MXII 13.3 | Why does total probability split along a partition? (Sequences, Counting & Probability) |
| Is a positive test bad news? | APP | 0.1% ill, 99% detected, 0.5% false positives: P(ill \| positive) = 22/133 ≈ 17% | MXII 13.5 Ex | Why does Bayes' theorem flip a conditional? (Sequences, Counting & Probability) |
| Which machine made the faulty bolt? | APP | Machines make 25%, 35% and 40% with 5%, 4% and 2% defective: P(B \| defective) = 28/69 | MXII 13.5 Ex | Why does total probability split along a partition? (Sequences, Counting & Probability) |

**Spec: Why does Bayes' theorem flip a conditional?**

1. Grid: 1000 dots for people; 0.1% ill (1 dot), shown as a highlighted dot. Sliders: prevalence, detection rate, false-positive rate.
2. Test: positives light up — the ill dot (99% chance) plus about 5 healthy dots (0.5% of 999).
3. Flip: among the lit dots, ill ones are about 1 in 6: P(ill | +) = 22/133 ≈ 17%, though P(+ | ill) = 99%.
4. Formula: P(E₁|A) = P(E₁)P(A|E₁) / Σ P(Eᵢ)P(A|Eᵢ), with the numbers updating live.

*Subject: Sequences, Counting & Probability*

### 10. Random Variables & Expectation · MXII 13.6

| Tool | Tag | What the student does | § | Helps to understand first |
| --- | --- | --- | --- | --- |
| Why is a random variable a function, not a variable? | WHY | Maps each outcome of two dice to a number (their sum) and sees one outcome per value fail | MXII 13.6 | Why must a function give exactly one output? (Functions & Graphs) |
| Why is the mean Σ xᵢ pᵢ a balance point? | WHY | Hangs probability weights on a beam; the pivot that balances is E(X) = 7 for the sum of two dice | MXII 13.6 | Why is the centre of mass a mass-weighted average? (Rotation & Gravitation) |
| Why is Var(X) = E(X²) − [E(X)]²? | WHY | Expands E[(X − μ)²] term by term; for two dice it is 35/6 | MXII 13.6 | Variance shortcut: Σx²/n − x̄² (Sequences, Counting & Probability) |
| Build a probability distribution | HOW | Tabulates P(X = x) and checks Σ pᵢ = 1 | MXII 13.6 | Why is the mean Σ xᵢ pᵢ a balance point? (Sequences, Counting & Probability); Build e from a series (Exponentials & Logarithms) |
| Is this game fair? | APP | Computes the expected winnings of a dice game; fair means E = 0 | MXII 13.6 | Why is Var(X) = E(X²) − [E(X)]²? (Sequences, Counting & Probability) |

## Tools added to existing boxes

| Subject → Box | Tool | Tag | What the student does | § | Helps to understand first |
| --- | --- | --- | --- | --- | --- |
| Numbers & Algebra → Sets & Relations | Why three separate tests: reflexive, symmetric, transitive? | WHY | Toggles arrows on a dot diagram and finds relations that pass any two tests but fail the third (≤ is not symmetric; 'is a sibling of' is not reflexive) | MXII 1.2 | Why is a relation a subset of A × B? (Functions & Graphs) |
| Numbers & Algebra → Sets & Relations | Test a relation | HOW | Checks a relation on {1, 2, 3} for each property, then adds the fewest pairs needed to make it an equivalence | MXII 1.2 | Why three separate tests: reflexive, symmetric, transitive? (Numbers & Algebra) |
| Numbers & Algebra → Sets & Relations | Count equivalence relations on {1, 2, 3} | HOW | Lists the 5 ways to split the set into classes; only 2 of them contain (1, 2) | MXII 1 Misc | Why does an equivalence relation chop a set into pieces? (Abstract Algebra); Why is the empty set a subset of every set? (Numbers & Algebra) |
| Numbers & Algebra → Sets & Relations | Which day of the week? Classes mod 7 | APP | Groups dates by remainder mod 7; 'a − b divisible by 7' is an equivalence relation | MXII 1.2 | Why three separate tests: reflexive, symmetric, transitive? (Numbers & Algebra) |
| Functions & Graphs → Combining & Inverting | Why is one-one the same as onto for a finite set, but not for ℕ? | WHY | Maps 5 balls to 5 boxes (no clash forces no empty box), then maps ℕ → ℕ by n ↦ 2n (one-one, misses the odds) | MXII 1.3 | Why must a function be one-to-one to invert? (Functions & Graphs) |
| Functions & Graphs → Combining & Inverting | Why is f⁻¹ not 1/f? (and sin⁻¹ x ≠ 1/sin x) | WHY | Plots sin⁻¹ x and (sin x)⁻¹ = cosec x side by side: one undoes sine, the other is its reciprocal | MXII 2 | Why can't sine be inverted as it is? (Trigonometry) |
| Systems & Matrices → Matrix Algebra | Why does (AB)′ = B′A′ reverse the order? | WHY | Transposes a product entry by entry and sees row i of A meet column j of B swap roles | MXII 3.5 | Why undo in reverse order? (Functions & Graphs) |
| Systems & Matrices → Matrix Algebra | Why does every square matrix split into symmetric + skew-symmetric parts? | WHY | Averages A with its mirror A′ to get the symmetric part ½(A + A′); the leftover ½(A − A′) flips sign when mirrored, so its diagonal is 0 | MXII 3.5 | — |
| Systems & Matrices → Matrix Algebra | Matrix types spotter | HOW | Sorts matrices into row, column, square, diagonal, scalar, identity and zero | MXII 3.3 | Why does every square matrix split into symmetric + skew-symmetric parts? (Systems & Matrices) |
| Systems & Matrices → Matrix Algebra | A shop's bill as a matrix product | APP | Multiplies a quantities matrix by a price matrix to total several customers' bills at once | MXII 3.4 | Why 'row times column'? (Systems & Matrices); Why does every square matrix split into symmetric + skew-symmetric parts? (Systems & Matrices) |
| Systems & Matrices → Determinants & Cramer | Why is A (adj A) = \|A\| I? | WHY | Multiplies a row by its own cofactors (gives \|A\|) and by another row's cofactors (gives 0: the determinant of a matrix with two equal rows) | MXII 4.5 | — |
| Systems & Matrices → Determinants & Cramer | Why is \|AB\| = \|A\| \|B\|? | WHY | Applies two area-scalings one after another: the factors multiply | MXII 4 | Why is the determinant an area? (Systems & Matrices) |
| Systems & Matrices → Determinants & Cramer | Minors, cofactors and the adjoint | HOW | Builds adj A and then A⁻¹ = adj A / \|A\| for a 3 × 3 matrix | MXII 4.4–4.5 | Why is A (adj A) = \|A\| I? (Systems & Matrices) |
| Systems & Matrices → Determinants & Cramer | Solve AX = B by X = A⁻¹B | HOW | Decides consistent or inconsistent from \|A\| and (adj A)B, then solves | MXII 4.6 | Why does det = 0 mean trouble? (Systems & Matrices); Why is A (adj A) = \|A\| I? (Systems & Matrices) |
| Systems & Matrices → Determinants & Cramer | Collinear points: zero area | HOW | Shows three points are collinear when the area determinant is 0 | MXII 4.3 | Why is the determinant an area? (Systems & Matrices) |
| Derivatives → Differentiation Rules | Second derivatives and the equations they satisfy | HOW | Differentiates y = A cos x + B sin x twice and checks y″ + y = 0 | MXII 5.7 | Why the quotient rule? (Derivatives) |
| Applications of Derivatives → Maxima & Minima | First-derivative test: watch f′ change sign | HOW | Slides a point through a critical value and reads + → − (max), − → + (min) or no change (neither) | MXII 6.5 | Why doesn't f′ = 0 guarantee a peak? (Applications of Derivatives); Why does a closed interval guarantee a max and min? (Applications of Derivatives) |
| Applications of Derivatives → Shape of a Graph | Find where f is increasing or decreasing | HOW | Splits the line at the zeros of f′ and tests a point in each interval | MXII 6.3 | Why does f′ > 0 mean rising? (Applications of Derivatives); Why is f″ the bend? (Applications of Derivatives) |
| Integrals → The Definite Integral | Why is ∫₀ᵃ f(x) dx = ∫₀ᵃ f(a − x) dx? | WHY | Reflects the region in x = a/2: the same area, read from the other end | MXII 7.10 | Properties as pictures (Integrals); Why is d/dx xⁿ = nxⁿ⁻¹? (Derivatives) |
| Integrals → The Definite Integral | The a − x trick | HOW | Adds the integral to its reflection: ∫₀^(π/2) sin x/(sin x + cos x) dx = π/4 | MXII 7.10 | Why is ∫₀ᵃ f(x) dx = ∫₀ᵃ f(a − x) dx? (Integrals); Why sin(A + B) = sin A cos B + cos A sin B (Trigonometry); Why isn't sin(A + B) = sin A + sin B? (Trigonometry) |
| Integrals → Integration by Parts | Why is ∫eˣ[f(x) + f′(x)] dx = eˣ f(x) + C? | WHY | Differentiates eˣ f(x) with the product rule and reads the integrand straight off | MXII 7.6 | Why the product rule? (Derivatives); Why are eˣ ≈ 1 + x and (1 + r/n)ⁿ ≈ eʳ? (Exponentials & Logarithms); Why is eˣ 'natural'? (Exponentials & Logarithms) |
| Applications of Integrals → Area Between Curves | Area of an ellipse and a circle's segment | APP | Integrates y = (b/a)√(a² − x²) to get πab (see Functions & Graphs → Area by Stretching) | MXII 8.2 | Why is an ellipse's area πab? (Functions & Graphs); Area by Stretching box (Functions & Graphs); Why top minus bottom, even below the axis? (Applications of Integrals) |
| Differential Equations → What is a Differential Equation? | What do order and degree tell you? | WHY | Reads the highest derivative (order) and its power (degree); finds degree undefined for y‴ + sin(y′) = 0 | MXII 9.2 | — |
| Differential Equations → What is a Differential Equation? | General or particular solution? | HOW | Fixes the arbitrary constants with initial conditions and watches one curve picked from the family | MXII 9.3 | Why does a DE have a family of solutions? (Differential Equations) |
| Differential Equations → Separable Equations | Why does y = vx turn a homogeneous equation into a separable one? | WHY | Zooms a homogeneous direction field and sees the slope depend only on y/x, so v = y/x separates | MXII 9.5.2 | Why does 'separating dy and dx' work? (Differential Equations) |
| Differential Equations → Separable Equations | Homogeneous-equation stepper | HOW | Tests f(λx, λy) = f(x, y), substitutes y = vx and separates | MXII 9.5.2 | Why does y = vx turn a homogeneous equation into a separable one? (Differential Equations) |
| Vectors & 3D Space → Vectors in Space | Why does the section formula weight the far end? | WHY | Slides R along PQ: dividing in m : n gives r = (n p + m q)/(m + n), so the nearer point gets the bigger weight | MXII 10.5 | Why is the centre of mass a mass-weighted average? (Rotation & Gravitation) |
| Vectors & 3D Space → Vectors in Space | Section formula: internal and external | HOW | Finds points dividing a segment internally and externally | MXII 10.5 | Why does the section formula weight the far end? (Vectors & 3D Space) |
| Vectors & 3D Space → Vectors in Space | Collinear points with vectors | APP | Shows AB = λ AC for three points | MXII 10.5 | Why do the direction cosines squared add to 1? (Vectors & 3D Space); Collinear points from slopes (Functions & Graphs); Collinear points: zero area (Systems & Matrices) |
| Vectors & 3D Space → Lines & Planes | Why is the shortest distance between skew lines along the common perpendicular? | WHY | Slides a segment between two skew lines; it is shortest when perpendicular to both, giving \|(a₂ − a₁)·(b₁ × b₂)\|/\|b₁ × b₂\| | MXII 11.5 | Why can lines in 3D be skew? (Vectors & 3D Space); Why is a × b perpendicular to both? (Vectors & 3D Space); Why is the perpendicular the shortest way to a line? (Functions & Graphs) |
| Vectors & 3D Space → Lines & Planes | Equation of a line: vector and Cartesian forms | HOW | Writes r = a + λb and (x − x₁)/a = (y − y₁)/b = (z − z₁)/c from a point and direction ratios | MXII 11.3 | Why do the direction cosines squared add to 1? (Vectors & 3D Space); Why does one normal vector define a plane? (Vectors & 3D Space); Graph a line from its equation (Functions & Graphs) |
| Vectors & 3D Space → Lines & Planes | Angle between two lines | HOW | Uses cos θ = \|a₁a₂ + b₁b₂ + c₁c₂\| / (√(a₁² + b₁² + c₁²) √(a₂² + b₂² + c₂²)) | MXII 11.4 | Why is the shortest distance between skew lines along the common perpendicular? (Vectors & 3D Space); Why is the angle between lines tan θ = \|(m₂ − m₁)/(1 + m₁m₂)\|? (Functions & Graphs) |
| Systems & Matrices → Inequalities & Linear Programming | Why can an unbounded region still have a minimum? | WHY | Slides the objective line Z = k outward and checks whether the half-plane Z < k meets the region | MXII 12.2 | Why is the best answer at a corner? (Systems & Matrices) |
| Systems & Matrices → Inequalities & Linear Programming | Corner-point method stepper | HOW | Finds the vertices, evaluates Z at each and checks the unbounded case | MXII 12.2 | Why is the best answer at a corner? (Systems & Matrices) |
| Systems & Matrices → Inequalities & Linear Programming | The diet problem | APP | Minimises cost while meeting vitamin needs from two foods | MXII 12.2 | Why is the best answer at a corner? (Systems & Matrices); A Babylonian problem solved with geometry (Numbers & Algebra) |

## JSON

Updated files: `numbers-algebra.json`, `functions-graphs.json`, `systems-matrices.json`, `derivatives.json`, `derivative-applications.json`, `integrals.json`, `integral-applications.json`, `differential-equations.json`, `vectors-3d.json`, `sequences-probability.json`. All are in the final bundle under catalogue/data/.
