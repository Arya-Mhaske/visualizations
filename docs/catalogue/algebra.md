# Algebra Visualisation Catalogue (Linear & Abstract)

Sources: **Sg** = Strang, *Introduction to Linear Algebra*, 5th ed. · **Ju** = Judson, *Abstract Algebra: Theory and Applications*. *(ext.)* marks tools beyond the source.

**Caveat:** Strang's PDF body text uses a font encoding that doesn't extract, so the Linear Algebra boxes follow his detailed contents and the edition's standard treatment. Section refs come from the contents, and no book-specific numbers are quoted. Judson's text extracted cleanly.

Overlaps are cross-linked, not duplicated: elimination, inverses, determinants, Cramer and LP (Systems & Matrices); vectors (Trigonometry, Vectors & 3D); least squares (Functions & Graphs); induction and gcd (Sequences); roots of unity (Trigonometry).

## Subject map

| # | Subject | Boxes | Tools |
| --- | --- | --- | --- |
| 18 | Linear Algebra | 12 | 61 |
| 19 | Abstract Algebra | 12 | 62 |

## Linear Algebra

### 1. Vectors & Combinations · Sg 1.1–1.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| What can you reach with cu + dv? | WHY | Drags the sliders c and d: two independent vectors fill the plane, two parallel ones only a line (spec below) | Sg 1.1 |
| Why is v · w = \|v\|\|w\| cos θ? | WHY | Rotates w around v; the dot product tracks the shadow length (see Trigonometry → Vectors) | Sg 1.2 |
| Why can't \|v · w\| exceed \|v\|\|w\|? | WHY | Sees the shadow can never be longer than the vector (Schwarz inequality) | Sg 1.2 |
| Why is Ax a combination of A's columns? | WHY | Multiplies by columns: x₁ × column 1 + x₂ × column 2 | Sg 1.3 |
| Unit vectors and normalising | HOW | Divides by the length and sees the arrow land on the unit circle | Sg 1.2 |

**Spec: What can you reach with cu + dv?**

1. Combine: drag c and d; the tip of cu + dv paints the set of reachable points.
2. Independent versus dependent: rotate v onto u's line and the painted plane collapses to a line.
3. Three vectors in 3D: add w; it either fills space or stays in the plane of u and v.
4. Link: the same picture is the column space of the matrix [u v w].

### 2. Elimination & LU · Sg 2.1–2.3, 2.6–2.7, 11.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Row picture versus column picture | WHY | Sees the same 2 × 2 system as two crossing lines, or as a combination of columns reaching b | Sg 2.1 |
| Why does elimination fail, and when does a row swap rescue it? | WHY | Hits a zero pivot; a swap fixes it unless the matrix is singular | Sg 2.2 |
| Why is elimination the same as A = LU? | WHY | Records each multiplier and finds they fill L exactly | Sg 2.6 |
| Elimination matrices | HOW | Multiplies by E₂₁, E₃₁, E₃₂ and watches A become U | Sg 2.3 |
| Transposes and permutations | HOW | Flips across the diagonal and reorders rows with P | Sg 2.7 |
| Why do computers pick the largest pivot? | APP | Solves a system with a tiny pivot and watches rounding error explode (partial pivoting) | Sg 11.1 |

### 3. Matrix Multiplication & Inverses · Sg 2.4–2.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Four ways to multiply AB | WHY | Sees AB as row·column, A × columns, rows × B, and a sum of column × row pieces, all giving the same answer | Sg 2.4 |
| Why is (AB)⁻¹ = B⁻¹A⁻¹? | WHY | Undoes the last operation first: socks and shoes | Sg 2.5 |
| Why does a zero combination of columns kill the inverse? | WHY | Finds Ax = 0 with x ≠ 0, so no inverse can bring back x | Sg 2.5 |
| Gauss–Jordan for A⁻¹ | HOW | Row-reduces [A I] to [I A⁻¹] (see Systems & Matrices → Matrix Algebra) | Sg 2.5 |

### 4. The Four Subspaces · Sg 3.1–3.5, 4.1

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| What is a subspace? | WHY | Tests lines and planes through the origin versus ones that miss it; closure under + and × decides | Sg 3.1 |
| Why is every solution of Ax = b = particular + nullspace? | WHY | Slides the nullspace line through one particular solution | Sg 3.3 |
| Why do independent columns mean a unique solution? | WHY | Adds a dependent column and sees a whole line of solutions appear | Sg 3.4 |
| Why is the dimension the number of pivots? | WHY | Reduces to R and counts the pivot and free columns: r + (n − r) = n | Sg 3.5 |
| Why is the row space ⟂ the nullspace? | WHY | Sees Ax = 0 means x is orthogonal to every row: the big picture of the four subspaces | Sg 4.1 |
| Find all four subspaces | HOW | Takes a 3 × 4 matrix to its bases for C(A), N(A), C(Aᵀ) and N(Aᵀ) | Sg 3.5 |
| Basis and dimension | HOW | Picks bases for a plane in many ways; the count stays 2 | Sg 3.4 |

### 5. Orthogonality & Projections · Sg 4.2, 4.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is projection the closest point? | WHY | Drops a perpendicular from b onto a line and onto a plane; the error is ⟂ the target | Sg 4.2 |
| Why is P² = P? | WHY | Projects twice and nothing more moves | Sg 4.2 |
| Why do orthonormal bases make everything easy? | WHY | Sees Qᵀ = Q⁻¹ and coordinates become dot products | Sg 4.4 |
| Gram–Schmidt | HOW | Straightens a skewed basis one vector at a time | Sg 4.4 |

### 6. Least Squares · Sg 4.3, 12.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does AᵀAx̂ = Aᵀb give the best fit? | WHY | Sees no exact solution exists, so it projects b onto the column space (see Functions & Graphs → Modelling with Data) | Sg 4.3 |
| Why are the errors ⟂ the columns? | WHY | Checks that the residual is orthogonal to the 1s column and the x column | Sg 4.3 |
| Fit lines and parabolas | HOW | Fits several models by least squares and compares the errors | Sg 4.3 |
| Weighted least squares | APP | Trusts some measurements more by weighting them | Sg 12.3 |

### 7. Determinants · Sg 5.1–5.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is det the volume scale factor? | WHY | Watches a unit square or cube transform into a parallelogram or box (see Systems & Matrices → Determinants) | Sg 5.3 |
| Why do the three basic properties decide everything? | WHY | Derives det from det I = 1, the sign flip on a row swap, and linearity in each row | Sg 5.1 |
| Why is det(AB) = det A · det B? | WHY | Composes two area-scalings | Sg 5.1 |
| Permutations and cofactors | HOW | Expands the big formula with signs | Sg 5.2 |
| Cramer's rule and A⁻¹ from cofactors | HOW | Sees each formula as a ratio of determinants | Sg 5.3 |

### 8. Eigenvalues · Sg 6.1–6.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Which vectors keep their direction? | WHY | Spins a vector around while A acts; eigenvectors only stretch (spec below) | Sg 6.1 |
| Why is det(A − λI) = 0 the eigenvalue test? | WHY | Sees A − λI must squash some vector to 0 | Sg 6.1 |
| Why do powers Aᵏ become easy? | WHY | Diagonalises A = XΛX⁻¹, so Aᵏ = XΛᵏX⁻¹ | Sg 6.2 |
| Why do Fibonacci numbers grow like 1.618ⁿ? | WHY | Writes the recurrence as a 2 × 2 matrix; its larger eigenvalue is the golden ratio | Sg 6.2 |
| Find eigenvalues and eigenvectors | HOW | Uses trace and determinant shortcuts for 2 × 2 | Sg 6.1 |
| Systems of differential equations | APP | Solves du/dt = Au with e^(λt) modes (see Differential Equations) | Sg 6.3 |

**Spec: Which vectors keep their direction?**

1. Sweep: a vector x rotates around the unit circle while Ax is drawn; the two line up only at eigenvectors.
2. Ellipse: the whole circle maps to an ellipse; for symmetric A its axes are the eigenvectors.
3. Powers: apply A repeatedly and any vector turns toward the dominant eigenvector.
4. Cases: shear (one eigenvector), rotation (no real ones) and projection (λ = 0 and 1).

### 9. Symmetric & Positive Definite · Sg 6.4–6.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do symmetric matrices have perpendicular eigenvectors? | WHY | Sees a symmetric map stretch along orthogonal axes, so the circle becomes an aligned ellipse | Sg 6.4 |
| Why is 'positive definite' a bowl? | WHY | Plots xᵀAx as a surface: bowl, saddle or trough (see Multivariable Calculus → Max, Min & Lagrange) | Sg 6.5 |
| Five tests for positive definite | HOW | Checks eigenvalues, pivots, upper-left determinants, energy and AᵀA | Sg 6.5 |

### 10. SVD & PCA · Sg 7.1–7.4

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is every matrix rotate → stretch → rotate? | WHY | Watches the unit circle become an ellipse in three moves: A = UΣVᵀ | Sg 7.4 |
| Why can a few singular values rebuild an image? | WHY | Keeps rank k of a photo and watches it sharpen as k grows | Sg 7.1 |
| Bases in the SVD | HOW | Finds the v's and u's from AᵀA and AAᵀ | Sg 7.2 |
| Principal component analysis | APP | Finds the direction of most spread in a cloud of data points | Sg 7.3 |

### 11. Transformations & Good Bases · Sg 8.1–8.3, 9.1–9.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| What makes a transformation linear? | WHY | Tests T(cu + dv) = cT(u) + dT(v) on rotations, shears and translations; translation fails | Sg 8.1 |
| Why does every linear map have a matrix? | WHY | Records where the basis vectors go; those images are the columns | Sg 8.2 |
| Why does a good basis make the matrix simple? | WHY | Changes to the eigenvector basis and the matrix turns diagonal | Sg 8.3 |
| Hermitian and unitary matrices | HOW | Sees the complex versions of symmetric and orthogonal | Sg 9.2 |
| The fast Fourier transform | APP | Sees why splitting in halves turns n² work into n log n | Sg 9.3 |

### 12. Applications · Sg 10.1–10.7, 11.2–11.3, 12.1–12.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does a Markov chain settle down? | WHY | Repeats a transition matrix; λ = 1 gives the steady state and the other eigenvalues fade | Sg 10.3 |
| Why are ill-conditioned systems dangerous? | WHY | Nudges b slightly in a nearly singular system and watches x jump (condition number) | Sg 11.2 |
| Graphs and networks | APP | Builds an incidence matrix and solves for currents on a small network | Sg 10.1 |
| Springs and trusses: K = AᵀCA | APP | Sees the stiffness matrix assembled from springs in a line | Sg 10.2 |
| Fourier series as linear algebra | APP | Treats sines as orthogonal 'vectors' for functions (see Trigonometry → Waves & Oscillations) | Sg 10.5 |
| Computer graphics with 4 × 4 matrices | APP | Uses homogeneous coordinates so translation becomes a matrix | Sg 10.6 |
| Matrix cryptography | APP | Encodes and decodes with a matrix mod 26 | Sg 10.7 |
| Covariance matrices | APP | Sees how two measurements vary together, drawn as an ellipse | Sg 12.2 |

## Abstract Algebra

### 1. Proofs, Sets & Relations · Ju 1.1–1.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do mathematicians demand proofs? *(ext.)* | WHY | Sees a pattern hold for the first 40 cases and then fail (n² + n + 41 at n = 40) | Ju 1.1 |
| Why does an equivalence relation chop a set into pieces? | WHY | Groups the integers by remainder mod 3 and sees the three classes | Ju 1.2 |
| Functions: one-to-one, onto, bijection | HOW | Draws arrows between two sets and classifies the map | Ju 1.2 |

### 2. The Integers · Ju 2.1–2.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does the division algorithm always work? | WHY | Steps down from a by multiples of b until the remainder is between 0 and b − 1 | Ju 2.2 |
| Why does the Euclidean algorithm find the gcd? | WHY | Tiles a rectangle with the largest possible squares; the last square size is the gcd | Ju 2.2 |
| Why are primes the atoms of multiplication? | WHY | Factorises numbers into unique prime factor trees | Ju 2.2 |
| Why induction works (well-ordering) | WHY | Sees that a smallest counterexample can't exist (see Sequences → Mathematical Induction) | Ju 2.1 |
| gcd as a combination: 2 = 4·14 − 3·18 | HOW | Back-substitutes through the Euclidean steps | Ju 2.2 |

### 3. What is a Group? · Ju 3.1–3.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does clock arithmetic behave like ordinary arithmetic? | WHY | Adds on a 12-hour clock and checks the familiar rules | Ju 3.1 |
| Why do the symmetries of a triangle form a group? | WHY | Rotates and flips a triangle; every combination is another symmetry (spec below) | Ju 3.1 |
| Why does order matter in some groups? | WHY | Flips then rotates, versus rotates then flips, and gets two different results | Ju 3.1 |
| The four group axioms | WHY | Tests closure, associativity, identity and inverses on sets that pass and sets that fail | Ju 3.2 |
| Cayley table builder | HOW | Fills a group's multiplication table; each element appears once per row (Latin square) | Ju 3.2 |
| Is it a subgroup? | HOW | Tests subsets with the subgroup criterion | Ju 3.3 |

**Spec: Why do the symmetries of a triangle form a group?**

1. Moves: label the corners; the student taps rotate (120°, 240°) or flip (three axes).
2. Table: each combination is looked up and fills a 6 × 6 Cayley table.
3. Axioms: highlights show the identity, every move's inverse, and closure.
4. Non-commutative: two moves done in both orders give different results; D₃ ≅ S₃.

### 4. Cyclic Groups · Ju 4.1–4.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does one generator build the whole group? | WHY | Keeps adding 1 on a clock until it returns home | Ju 4.1 |
| Why do the nth roots of unity form a cyclic group? | WHY | Rotates by 360°/n on the complex unit circle (see Trigonometry → Polar & Complex) | Ju 4.2 |
| Why does repeated squaring make huge powers fast? | WHY | Computes 7^1000 mod 13 in about 10 squarings instead of 1000 multiplications | Ju 4.3 |
| Find the generators of ℤₙ | HOW | Tests which k have gcd(k, n) = 1 | Ju 4.1 |

### 5. Permutations & Dihedral Groups · Ju 5.1–5.2

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why does every permutation split into cycles? | WHY | Follows arrows from each element until they return | Ju 5.1 |
| Why is a permutation even or odd, never both? | WHY | Builds one permutation from swaps in different ways; the parity never changes | Ju 5.1 |
| Why does a regular n-gon have exactly 2n symmetries? | WHY | Rotates and flips a square, then a pentagon (Dₙ) | Ju 5.2 |
| Cycle notation | HOW | Composes and inverts permutations in cycle form | Ju 5.1 |
| Shuffling cards *(ext.)* | APP | Sees how many perfect riffle shuffles return a deck to its start | — |

### 6. Cosets & Lagrange · Ju 6.1–6.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do cosets tile the group? | WHY | Shifts a subgroup around until the copies cover everything with no overlaps | Ju 6.1 |
| Why must a subgroup's order divide the group's? (Lagrange) | WHY | Counts equal-size cosets | Ju 6.2 |
| Why doesn't Lagrange work backwards? | WHY | Finds that A₄ (order 12) has no subgroup of order 6 | Ju 6.2 |
| Why is aᵖ⁻¹ ≡ 1 (mod p)? Fermat and Euler | WHY | Multiplies all the units mod p by a; it just reshuffles them | Ju 6.3 |
| Compute φ(n) and modular powers | HOW | Uses Euler's theorem to shrink exponents | Ju 6.3 |

### 7. Codes & Cryptography · Ju 7.1–7.2, 8.1–8.4, 15.5

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why is RSA safe to publish? | WHY | Encrypts with the public (n, e); decrypting needs φ(n), which needs the factors of n | Ju 7.2 |
| How can a code fix an error by itself? | WHY | Flips a bit in a Hamming codeword and watches the parity checks point at it | Ju 8.1–8.3 |
| Why does minimum distance decide error power? | WHY | Draws balls around codewords; distance 3 lets each ball fix one error | Ju 8.1 |
| Shift and affine ciphers | HOW | Encrypts and breaks a Caesar cipher by frequency | Ju 7.1 |
| Chinese remainder theorem | HOW | Solves x ≡ a (mod m), x ≡ b (mod n) | Ju 15.5 |
| Toy RSA | APP | Picks small primes, makes keys and sends a message | Ju 7.2 |

### 8. Isomorphism & Homomorphism · Ju 9.1–9.2, 10.1–10.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| When are two groups really the same? | WHY | Relabels ℤ₄ and the rotations of a square; their tables match (isomorphism) | Ju 9.1 |
| Why is ℤ₂ × ℤ₃ ≅ ℤ₆ but ℤ₂ × ℤ₂ is not ℤ₄? | WHY | Looks for an element of full order in each | Ju 9.2 |
| Why do some subgroups give quotient groups? | WHY | Collapses cosets into single points; it only works when the subgroup is normal | Ju 10.1 |
| Why is the kernel the key to a homomorphism? | WHY | Sees everything that maps to e collapse together (first isomorphism theorem) | Ju 10.2–10.3 |
| Classify small groups | HOW | Sorts every group up to order 8 | Ju 9.2 |

### 9. Symmetry, Actions & Counting · Ju 11.1–11.2, 12, 13.1–13.3, 14

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why are there only 17 wallpaper patterns? | WHY | Explores the rotations allowed by a lattice (2, 3, 4 and 6-fold, never 5) and the 17 groups that result | Ju 11.2 |
| Why does a cube have 24 rotations? | WHY | Picks which face is up (6 ways) and how it's turned (4 ways) | Ju 5.2 |
| How many truly different colourings? (Burnside) | WHY | Colours a square's corners black or white: 16 raw colourings collapse to 6 under symmetry | Ju 13.3 |
| Matrix groups: rotations and reflections | HOW | Sees O(2) and SO(2) acting on the plane | Ju 11.1 |
| Orbits and stabilisers | HOW | Watches a group move points around | Ju 13.1 |
| Counting switching circuits | APP | Applies Burnside to count switching functions up to relabelling | Ju 13.3 |
| Crystal symmetries | APP | Sees why crystals obey the same rotation limits as wallpaper | Ju 11.2 |

### 10. Rings & Polynomials · Ju 15–17

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do we need rings as well as groups? | WHY | Sees ℤ, polynomials and matrices all have + and × | Ju 15.1 |
| Why can ab = 0 with a, b ≠ 0? (zero divisors) | WHY | Finds 2 × 3 = 0 in ℤ₆ and singular matrices | Ju 15.2 |
| Why is ℤₚ a field only when p is prime? | WHY | Looks for inverses mod 6 and mod 7 | Ju 15.2 |
| Why do polynomials divide like integers? | WHY | Runs polynomial long division beside integer division (see Numbers & Algebra → Polynomials) | Ju 16.2 |
| Irreducible polynomials | HOW | Tests x² + 1 over ℝ, ℂ and ℤ₂ | Ju 16.3 |
| Fields of fractions | HOW | Builds ℚ from ℤ by taking pairs | Ju 17.1 |

### 11. Boolean Algebra & Circuits · Ju 18.1–18.3

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why do switches obey algebra? | WHY | Sees series wiring as AND and parallel wiring as OR | Ju 18.3 |
| Why do the logic laws mirror set laws? | WHY | Compares Venn diagrams with truth tables | Ju 18.2 |
| Simplify a circuit | HOW | Applies Boolean laws to remove switches | Ju 18.3 |
| Lattices and divisibility | HOW | Draws the divisors of 30 as a lattice | Ju 18.1 |

### 12. Fields & Galois Theory · Ju 19–22

| Tool | Tag | What the student does | § |
| --- | --- | --- | --- |
| Why can't you trisect an angle with ruler and compass? | WHY | Sees constructible lengths come from degree-2 steps, while trisecting needs a degree-3 equation | Ju 20.3 |
| Why is there no formula for the quintic? | WHY | Sees a polynomial is solvable by radicals only when its Galois group is solvable, which some quintics' groups are not (see Functions & Graphs → Polynomial Functions) | Ju 22.3 |
| Why does a finite field have pⁿ elements? | WHY | Builds GF(4) from ℤ₂ and x² + x + 1 | Ju 21.1 |
| Vector spaces over any field | HOW | Sees linear independence over ℚ, ℝ and ℤ₂ (see Linear Algebra) | Ju 19 |
| Splitting fields | HOW | Adjoins roots until a polynomial factors completely | Ju 20.2 |
| Polynomial codes (CRC) | APP | Checks a message by polynomial division over ℤ₂ | Ju 21.2 |

## JSON

The subject files catalogue/data/linear-algebra.json and abstract-algebra.json are delivered alongside this doc, with landing `order` 18 and 19.
