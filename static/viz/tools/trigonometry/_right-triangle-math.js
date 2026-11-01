// Pure maths for the Right-Triangle Ratios box. No DOM.
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
export const sinD = (d) => Math.sin(rad(d));
export const cosD = (d) => Math.cos(rad(d));
export const tanD = (d) => Math.tan(rad(d));

// ---- a² + b² = c²: four copies of the triangle inside a square of side a + b ----
// Each triangle is { R, P1, P2 }: the right-angle corner, the end of the leg of length a, the end of the leg of length b.
// All eight are anticlockwise, so one rigid move (a turn and a slide) takes each in arrangement 1 to one in arrangement 2.
export function arrangements(a, b) {
  const s = a + b;
  const one = [
    { R: [0, 0], P1: [a, 0], P2: [0, b] },
    { R: [s, 0], P1: [s, a], P2: [a, 0] },
    { R: [s, s], P1: [b, s], P2: [s, a] },
    { R: [0, s], P1: [0, b], P2: [b, s] },
  ];
  const two = [
    { R: [b, 0], P1: [s, 0], P2: [b, b] },
    { R: [s, b], P1: [b, b], P2: [s, 0] },
    { R: [0, s], P1: [0, b], P2: [b, s] },
    { R: [b, b], P1: [b, s], P2: [0, b] },
  ];
  return { s, one, two };
}
const wrap = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));
// The triangles a fraction t of the way from arrangement 1 to arrangement 2, moved rigidly.
export function trianglesAt(a, b, t) {
  const { one, two } = arrangements(a, b);
  return one.map((from, i) => {
    const to = two[i];
    const turn = wrap(Math.atan2(to.P1[1] - to.R[1], to.P1[0] - to.R[0]) - Math.atan2(from.P1[1] - from.R[1], from.P1[0] - from.R[0])) * t;
    const R = [from.R[0] + (to.R[0] - from.R[0]) * t, from.R[1] + (to.R[1] - from.R[1]) * t];
    const move = (p) => {
      const [dx, dy] = [p[0] - from.R[0], p[1] - from.R[1]];
      return [R[0] + dx * Math.cos(turn) - dy * Math.sin(turn), R[1] + dx * Math.sin(turn) + dy * Math.cos(turn)];
    };
    return { R, P1: move(from.P1), P2: move(from.P2) };
  });
}
export const squareAreas = (a, b) => ({ a2: a * a, b2: b * b, c2: a * a + b * b, c: Math.hypot(a, b) });

// ---- six ratios ----
export const SIDES = ['opp', 'adj', 'hyp'];
export const RATIOS = { 'opp/hyp': 'sin', 'adj/hyp': 'cos', 'opp/adj': 'tan', 'adj/opp': 'cot', 'hyp/adj': 'sec', 'hyp/opp': 'csc' };
export const orderedPairs = () => SIDES.flatMap((n) => SIDES.filter((d) => d !== n).map((d) => [n, d]));
export const sidesOf = (theta, hyp = 1) => ({ opp: hyp * sinD(theta), adj: hyp * cosD(theta), hyp });
export const ratioOf = (num, den, theta) => sidesOf(theta)[num] / sidesOf(theta)[den];
export const reciprocalName = (num, den) => `${den}/${num}`;

// ---- "co"-sine: look from the other acute angle ----
export const complement = (theta) => 90 - theta;
// Seen from the other corner the legs swap jobs.
export function fromCorner(theta, corner) {
  const here = corner === 'A' ? theta : complement(theta);
  return { angle: here, sin: sinD(here), cos: cosD(here) };
}

// ---- sin and cos stay below 1, tan does not ----
export const growth = (theta) => ({ sin: sinD(theta), cos: cosD(theta), tan: tanD(theta) });

// ---- the calculator's 0.6018: a drawn triangle with a 37° angle, the opposite side read to the nearest millimetre ----
export const SIN37 = Math.sin(rad(37));
export const measuredOpposite = (hypCm) => Math.round(hypCm * SIN37 * 10) / 10;
export const measuredRatio = (hypCm) => measuredOpposite(hypCm) / hypCm;
export const worstError = (hypCm) => 0.05 / hypCm; // half a millimetre, as a fraction of the hypotenuse

// ---- the story of the word "sine" ----
export const STORY = [
  { word: 'jyā', tongue: 'Sanskrit', meaning: 'bowstring, chord', when: 'before 500 CE' },
  { word: 'jīvā', tongue: 'Sanskrit (Aryabhata)', meaning: 'half-chord, the sine', when: 'about 499 CE' },
  { word: 'jība', tongue: 'Arabic (a sound-copy)', meaning: 'no meaning of its own', when: 'about 800 CE' },
  { word: 'jaib', tongue: 'Arabic (as read)', meaning: 'fold, pocket, bosom', when: 'by about 1100 CE' },
  { word: 'sinus', tongue: 'Latin', meaning: 'fold, bay, curve', when: 'about 1150 CE' },
];
// The half-chord of a chord that subtends 2θ at the centre of a circle of radius R.
export const halfChord = (R, theta) => R * sinD(theta);
export const chord = (R, theta) => 2 * R * sinD(theta);

// ---- solving a right triangle (C is the right angle; a is opposite A, b is next to A, c is the hypotenuse) ----
export const CASES = {
  ha: { given: 'the hypotenuse c and the angle A' },
  la: { given: 'the leg b and the angle A' },
  ll: { given: 'the two legs a and b' },
  hl: { given: 'the hypotenuse c and the leg a' },
};
export function solveRight(kind, { A, a, b, c }) {
  let out;
  if (kind === 'ha') out = { A, a: c * sinD(A), b: c * cosD(A), c };
  else if (kind === 'la') out = { A, a: b * tanD(A), b, c: b / cosD(A) };
  else if (kind === 'll') out = { A: deg(Math.atan2(a, b)), a, b, c: Math.hypot(a, b) };
  else out = { A: deg(Math.asin(a / c)), a, b: Math.sqrt(c * c - a * a), c };
  return { ...out, B: 90 - out.A };
}

// ---- how many figures does an angle deserve? (the book's table) ----
export const PRECISION = [
  { id: 'deg', text: 'nearest 1°', half: 0.5, sf: 2 },
  { id: 'min10', text: 'nearest 10′', half: 5 / 60, sf: 3 },
  { id: 'min1', text: 'nearest 1′', half: 0.5 / 60, sf: 4 },
  { id: 'sec10', text: 'nearest 10″', half: 5 / 3600, sf: 5 },
];
// How far a = c sin A can be off, as a fraction of a, if A is only known to within ± half a degree
export const angleSpread = (A, half) => (sinD(A + half) - sinD(A - half)) / (2 * sinD(A));
// A value kept to sf significant figures can be off by half a unit in the last place
export const roundingSpread = (value, sf) => (0.5 * 10 ** (Math.floor(Math.log10(Math.abs(value))) - sf + 1)) / Math.abs(value);

// ---- elevation and depression ----
export const elevation = (rise, run) => deg(Math.atan2(rise, run));
export const heightFromAngle = (run, angle, eye = 0) => run * tanD(angle) + eye;
// Two sightings from points s apart (the far one at the smaller angle β): h = s / (cot β − cot α)
export const heightFromTwo = (alpha, beta, s) => s / (1 / tanD(beta) - 1 / tanD(alpha));
export const nearestDegree = (x) => Math.round(x);

// ---- refraction ----
export const N = { air: 1, water: 1.33, glass: 1.5, diamond: 2.42 };
export function refractAngle(alpha, n1, n2) {
  const s = (n1 * sinD(alpha)) / n2;
  return Math.abs(s) > 1 ? null : deg(Math.asin(s));
}

// ---- a wake: a source moving faster than its waves ----
export const WAKES = {
  boat: { text: 'Boat on a pond', slow: 'ripples', ratio: 2.5, c: '1.6 m/s', unit: 'm/s', speed: 1.6 },
  jet: { text: 'Jet in air', slow: 'sound', ratio: 1.5, c: '340 m/s', unit: 'm/s', speed: 340 },
  particle: { text: 'Particle in water', slow: 'light', ratio: 1.3, c: '2.26 × 10⁸ m/s', unit: 'm/s', speed: 2.26e8 },
};
// Half-angle of the cone, from sin(half) = slow / fast
export const wakeHalfAngle = (ratio) => deg(Math.asin(1 / ratio));
