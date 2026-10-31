# Maths Class XI (NCERT) Additions

Source: **NM** = NCERT *Mathematics* Class XI (2026-27, rationalised, 14 chapters). Refs: NM 9 = chapter 9, Misc = miscellaneous exercise.

Most of NCERT Maths XI is already covered by the precalculus and calculus catalogues, so this book adds two boxes and a set of tools rather than new subjects. Coverage by chapter:

| Ch | Chapter | Where it lives |
| --- | --- | --- |
| 1 | Sets | **New box:** Numbers & Algebra → Sets |
| 2 | Relations & Functions | Functions & Graphs → What Is a Function? (+1 tool) |
| 3 | Trigonometric Functions | Trigonometry (complete; no additions needed) |
| 4 | Complex Numbers & Quadratic Equations | Numbers & Algebra → Complex Numbers (+2), Quadratic Equations |
| 5 | Linear Inequalities | Numbers & Algebra → Inequalities & Absolute Value; Systems & Matrices (graphing systems) |
| 6 | Permutations & Combinations | Sequences, Counting & Probability → Counting (+1) |
| 7 | Binomial Theorem | → Binomial Theorem (+1) |
| 8 | Sequences & Series | → Arithmetic and Geometric boxes (+1: AM ≥ GM) |
| 9 | Straight Lines | Functions & Graphs → Lines & Slope (+3) |
| 10 | Conic Sections | Conics & Curves (+2 latus-rectum tools) |
| 11 | Introduction to 3D Geometry | Vectors & 3D Space → 3D Coordinates (+1) |
| 12 | Limits & Derivatives | Limits & Continuity (+1), Derivatives (complete) |
| 13 | Statistics | **New box:** Sequences, Counting & Probability → Statistics: Measuring Spread |
| 14 | Probability | → Probability (+2: axioms, exclusive and exhaustive) |

Box order changed in Numbers & Algebra: Sets is now box 2 (slugs unchanged, so no URLs break).

## New boxes

*Subject: Numbers & Algebra*

### 2. Sets & Relations · NM 1, MXII 1

| Tool | Tag | What the student does | § | Helps to understand first |
| --- | --- | --- | --- | --- |
| Why is the empty set a subset of every set? | WHY | Tries to find an element of ∅ that isn't in A: there is none | NM 1 | — |
| Why does a set of n elements have 2ⁿ subsets? | WHY | Decides in or out for each element (see Sequences, Counting & Probability → Counting) | NM 1 | Number of subsets = 2ⁿ (Sequences, Counting & Probability); Counting box (Sequences, Counting & Probability) |
| Why is n(A ∪ B) = n(A) + n(B) − n(A ∩ B)? | WHY | Counts a Venn diagram and sees the overlap counted twice | NM 1 | Why subtract the overlap in P(A or B)? (Sequences, Counting & Probability) |
| Why De Morgan's laws? | WHY | Shades (A ∪ B)′ and A′ ∩ B′ and finds them identical | NM 1 | — |
| Why three separate tests: reflexive, symmetric, transitive? | WHY | Toggles arrows on a dot diagram and finds relations that pass any two tests but fail the third (≤ is not symmetric; 'is a sibling of' is not reflexive) | MXII 1.2 | Why is a relation a subset of A × B? (Functions & Graphs) |
| Roster ↔ set-builder | HOW | Converts between the two notations | NM 1 | Sets and Venn diagrams (Numbers & Algebra); Why is the empty set a subset of every set? (Numbers & Algebra) |
| Intervals as subsets of ℝ | HOW | Turns intervals into sets and back | NM 1 | Interval notation builder (Numbers & Algebra); Why does a set of n elements have 2ⁿ subsets? (Numbers & Algebra) |
| Test a relation | HOW | Checks a relation on {1, 2, 3} for each property, then adds the fewest pairs needed to make it an equivalence | MXII 1.2 | Why three separate tests: reflexive, symmetric, transitive? (Numbers & Algebra) |
| Count equivalence relations on {1, 2, 3} | HOW | Lists the 5 ways to split the set into classes; only 2 of them contain (1, 2) | MXII 1 Misc | Why does an equivalence relation chop a set into pieces? (Abstract Algebra); Why is the empty set a subset of every set? (Numbers & Algebra) |
| Survey problems with Venn diagrams | APP | Finds how many like tea only, coffee only or both | NM 1 | Why is n(A ∪ B) = n(A) + n(B) − n(A ∩ B)? (Numbers & Algebra); Sets and Venn diagrams (Numbers & Algebra) |
| Which day of the week? Classes mod 7 | APP | Groups dates by remainder mod 7; 'a − b divisible by 7' is an equivalence relation | MXII 1.2 | Why three separate tests: reflexive, symmetric, transitive? (Numbers & Algebra) |

*Subject: Sequences, Counting & Probability*

### 8. Statistics: Measuring Spread · NM 13

| Tool | Tag | What the student does | § | Helps to understand first |
| --- | --- | --- | --- | --- |
| Why isn't the range enough? | WHY | Sees two data sets with the same range but very different spread | NM 13 | — |
| Why use \|x − x̄\| in mean deviation? | WHY | Shows the plain deviations always sum to 0 | NM 13 | Absolute value is distance (Numbers & Algebra) |
| Why square the deviations? (variance) | WHY | Compares \|d\| with d²: squaring removes signs and is easier to do algebra with | NM 13 | — |
| Why does SD have the data's units? | WHY | Takes √variance to undo the squaring | NM 13 | — |
| Why does adding a constant leave the SD alone but scaling multiply it? | WHY | Shifts and stretches a dot plot: σ(ax + b) = \|a\|σ | NM 13 | Why does f(2x) squeeze but 2f(x) stretch? (Functions & Graphs) |
| Why is mean deviation smallest about the median? *(ext.)* | WHY | Drags the centre point and watches MD dip at the median | NM 13 | — |
| Variance shortcut: Σx²/n − x̄² | HOW | Derives and uses it | NM 13 | Why square the deviations? (variance) (Sequences, Counting & Probability) |
| Grouped data with step deviation | HOW | Shifts and scales the class marks to simplify the sums | NM 13 | Why use \|x − x̄\| in mean deviation? (Sequences, Counting & Probability) |
| Fix a wrong observation | APP | Corrects the mean and SD after a recording error | NM 13 Misc | Why does SD have the data's units? (Sequences, Counting & Probability) |

**Spec: Why does adding a constant leave the SD alone but scaling multiply it?**

1. Dot plot of 8 marks with the mean and a ±σ bar.
2. Shift slider (add b): dots and mean slide together, and the σ bar keeps its width.
3. Scale slider (multiply by a): the spread and σ both stretch by |a|; at a = −1 the plot flips but σ stays the same.
4. Live table: x̄ → a x̄ + b, σ → |a|σ, variance → a²σ².

## Tools added to existing boxes

| Subject → Box | Tool | Tag | What the student does | § | Helps to understand first |
| --- | --- | --- | --- | --- | --- |
| Functions & Graphs → What is a Function? | Why is a relation a subset of A × B? | WHY | Draws the A × B grid and ticks the pairs; the grid has p·q cells | NM 2 | Test a relation (Numbers & Algebra) |
| Functions & Graphs → Lines & Slope | Why is the angle between lines tan θ = \|(m₂ − m₁)/(1 + m₁m₂)\|? | WHY | Subtracts the two inclinations using tan(A − B) | NM 9 | Why cos(A − B) = cos A cos B + sin A sin B (Trigonometry) |
| Functions & Graphs → Lines & Slope | Distance from a point to a line | HOW | Uses \|Ax₀ + By₀ + C\|/√(A² + B²) and checks it with the perpendicular | NM 9 | Why is the perpendicular the shortest way to a line? (Functions & Graphs); Why does a vertical line have no slope? (Functions & Graphs); Why does a² − b² = (a + b)(a − b)? (Numbers & Algebra) |
| Functions & Graphs → Lines & Slope | Collinear points from slopes | HOW | Checks whether the slopes AB and BC are equal | NM 9 | Why do perpendicular slopes multiply to −1? (Functions & Graphs) |
| Numbers & Algebra → Complex Numbers | Why can't we say one complex number is bigger than another? *(ext.)* | WHY | Tries to order i and 0 and hits a contradiction either way | NM 4 | — |
| Numbers & Algebra → Complex Numbers | Modulus and argument on the Argand plane | HOW | Reads r and θ off the plane | NM 4 | Why polar coordinates? (Trigonometry); Why multiply by the conjugate to divide? (Numbers & Algebra) |
| Sequences, Counting & Probability → Counting | Why is C(n, r) = C(n, n − r)? | WHY | Sees choosing r to take is the same as choosing n − r to leave | NM 6 | — |
| Sequences, Counting & Probability → Binomial Theorem | Compare huge powers without a calculator | APP | Uses the first two binomial terms: (1.01)¹⁰⁰⁰⁰⁰⁰ > 1 + 10⁶ × 0.01 = 10001 > 10000 | NM 7 | Why does Pascal's triangle give the coefficients? (Sequences, Counting & Probability) |
| Sequences, Counting & Probability → Geometric Sequences & Series | Why is AM ≥ GM? | WHY | Draws a semicircle on a + b: the radius (AM) beats the half-chord √(ab) (GM) | NM 8 | — |
| Conics & Curves → Parabola | Latus rectum of a parabola | HOW | Finds its length, 4a, by setting x = a | NM 10 | Why does focus = directrix distance make a parabola? (Conics & Curves) |
| Conics & Curves → Ellipse | Latus rectum of an ellipse | HOW | Finds its length, 2b²/a | NM 10 | Why do pins and string draw an ellipse? (Conics & Curves); Latus rectum of a parabola (Conics & Curves) |
| Vectors & 3D Space → 3D Coordinates | Why do three planes cut space into 8 octants? | WHY | Adds the xy, yz and zx planes one at a time: 2 × 2 × 2 = 8 regions | NM 11 | Three equations = three planes (Systems & Matrices) |
| Limits & Continuity → Limit Laws | Why is lim (xⁿ − aⁿ)/(x − a) = naⁿ⁻¹? | WHY | Factors xⁿ − aⁿ = (x − a)(xⁿ⁻¹ + … + aⁿ⁻¹), then substitutes x = a | NM 12 | Why is d/dx xⁿ = nxⁿ⁻¹? (Derivatives); Why is a⁻ⁿ = 1/aⁿ? (Numbers & Algebra) |
| Sequences, Counting & Probability → Probability | Why define probability by axioms? | WHY | Sees the classical formula fail for unequal outcomes; three axioms cover every case | NM 14 | — |
| Sequences, Counting & Probability → Probability | Mutually exclusive and exhaustive events | HOW | Partitions a sample space by colouring regions | NM 14 | Why subtract the overlap in P(A or B)? (Sequences, Counting & Probability) |

## JSON

The updated files are `numbers-algebra.json`, `functions-graphs.json`, `sequences-probability.json`, `conics-curves.json`, `vectors-3d.json` and `limits-continuity.json`, in catalogue-data.zip. The aids on every subject were recomputed in the same run.
