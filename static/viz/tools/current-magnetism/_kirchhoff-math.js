// The Kirchhoff & Wheatstone box: pure numbers, no DOM.
import { solveCircuit } from '../../lib/circuit.js';
import { E_CHARGE } from './_current-drift-math.js';

// ---- A junction ----
// Three wires meet at a node with a small capacitance. Wires 1 and 2 count as "in", wire 3 as "out".
// forced: the currents are simply set, so charge is free to pile up (a thought experiment).
// free:   each wire runs through NODE_R to a terminal, so the pile's potential pushes back.
export const NODE_R = 2; // Ω in each wire
export const NODE_TAU = 1.2; // s, slowed for the screen
export const NODE_C = (3 * NODE_TAU) / NODE_R; // F, chosen to give that time; a real node is about a picofarad
export const COULOMB_K = 9e9;
export const SPHERE_R = 0.01; // m, the 1 cm metal blob that stands for the node in the forced view

export const nodePotential = (q) => q / NODE_C;
export const settledPotential = ({ V1, V2, V3 }) => (V1 + V2 + V3) / 3;
export const spherePotential = (q) => (COULOMB_K * q) / SPHERE_R;
export const electrons = (q) => q / E_CHARGE;

export function nodeCurrents(s, q) {
  if (s.view === 'forced') return [s.I1, s.I2, s.I3];
  const V = nodePotential(q);
  return [(s.V1 - V) / NODE_R, (s.V2 - V) / NODE_R, (V - s.V3) / NODE_R];
}

// y = [pile, charge through wire 1, wire 2, wire 3]
export function nodeRates(s, y) {
  const [i1, i2, i3] = nodeCurrents(s, y[0]);
  return [i1 + i2 - i3, i1, i2, i3];
}

// Sunflower layout: the pile grows evenly from the centre, and adding a dot never moves the others.
export function pilePoints(n, spacing = 9) {
  return Array.from({ length: n }, (_, i) => {
    const r = spacing * Math.sqrt(i + 0.5);
    const a = i * 2.39996;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
}

// ---- Two cells, three branches ----
// Bottom rail at 0 V, top rail at VT. I₁ and I₂ run up the outer branches, I₃ down the middle: I₃ = I₁ + I₂.
export function twoLoop({ E1, E2, R1, R2, R3 }) {
  const { V, I } = solveCircuit(2, [{ a: 0, b: 1, R: R1, E: E1 }, { a: 0, b: 1, R: R2, E: E2 }, { a: 1, b: 0, R: R3 }]);
  return { VT: V[1], I1: I[0], I2: I[1], I3: I[2] };
}

const wire = (a, b) => ({ a, b, kind: 'wire' });
const flip = (edges) => edges.map(({ a, b, kind, name }) => ({ a: b, b: a, kind, name })).reverse();

function outerBranch(u, E, VT, cellName, resName) {
  return [
    wire([u, 0, 0], [u, 0.2, 0]),
    { a: [u, 0.2, 0], b: [u, 0.2, E], kind: 'cell', name: cellName },
    wire([u, 0.2, E], [u, 0.5, E]),
    { a: [u, 0.5, E], b: [u, 0.85, VT], kind: 'res', name: resName },
    wire([u, 0.85, VT], [u, 1, VT]),
  ];
}

const middleBranch = (VT) => [
  wire([1, 0, 0], [1, 0.3, 0]),
  { a: [1, 0.3, 0], b: [1, 0.7, VT], kind: 'res', name: 'R₃' },
  wire([1, 0.7, VT], [1, 1, VT]),
];

// Every edge once, for drawing the whole circuit. A point is [u, w, V]: plan position and height.
export function allEdges(s) {
  const { VT } = twoLoop(s);
  return [
    ...outerBranch(0, s.E1, VT, 'E₁', 'R₁'), ...middleBranch(VT), ...outerBranch(2, s.E2, VT, 'E₂', 'R₂'),
    wire([0, 0, 0], [2, 0, 0]), wire([0, 1, VT], [2, 1, VT]),
  ];
}

// The walk round one loop, as edges joined end to end.
export function loopEdges(s, loop) {
  const { VT } = twoLoop(s);
  const left = outerBranch(0, s.E1, VT, 'E₁', 'R₁');
  const right = flip(outerBranch(2, s.E2, VT, 'E₂', 'R₂'));
  const middle = middleBranch(VT);
  if (loop === 'left') return [...left, wire([0, 1, VT], [1, 1, VT]), ...flip(middle), wire([1, 0, 0], [0, 0, 0])];
  if (loop === 'right') return [...middle, wire([1, 1, VT], [2, 1, VT]), ...right, wire([2, 0, 0], [1, 0, 0])];
  return [...left, wire([0, 1, VT], [2, 1, VT]), ...right, wire([2, 0, 0], [0, 0, 0])];
}

const rise = (edge) => edge.b[2] - edge.a[2];
export const loopSteps = (edges) => edges.filter((e) => e.kind !== 'wire').map((e) => ({ name: e.name, kind: e.kind, dV: rise(e) }));

// Walking distance: plan length plus height, with a floor so a resistor with no drop still takes a moment.
const edgeLength = (e) => Math.max(0.12, Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]) + Math.abs(rise(e)) / 12);

export function walkMarks(edges) {
  const lengths = edges.map(edgeLength);
  const total = lengths.reduce((sum, n) => sum + n, 0);
  let run = 0;
  return lengths.map((n) => { run += n; return run / total; });
}

// Where the walker is at s in [0, 1], and what it has climbed and fallen so far.
export function walkAt(edges, s) {
  const marks = walkMarks(edges);
  let up = 0;
  let down = 0;
  let from = 0;
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const f = i === edges.length - 1 && s >= marks[i] ? 1 : Math.min(1, Math.max(0, (s - from) / (marks[i] - from)));
    const change = rise(e) * f;
    if (change > 0) up += change;
    else down -= change;
    if (s <= marks[i] || i === edges.length - 1) {
      const at = [0, 1, 2].map((k) => e.a[k] + (e.b[k] - e.a[k]) * f);
      return { u: at[0], w: at[1], V: at[2], index: i, f, up, down };
    }
    from = marks[i];
  }
  return null;
}

// ---- Written out as NCERT does it ----
// Left loop:  E₁ − I₁R₁ − I₃R₃ = 0.  Right loop: E₂ − I₂R₂ − I₃R₃ = 0.  With I₃ = I₁ + I₂ that is a 2 × 2 system.
export function eliminate({ E1, E2, R1, R2, R3 }) {
  const a = R1 + R3;
  const b = R3;
  const d = R2 + R3;
  const m = b / a;
  const d2 = d - m * b;
  const f2 = E2 - m * E1;
  const I2 = f2 / d2;
  const I1 = (E1 - b * I2) / a;
  return { a, b, d, m, d2, f2, I1, I2, I3: I1 + I2, det: a * d - b * b };
}

// ---- Wheatstone bridge ----
// A at E, C at 0. R₁ is AB, R₂ is BC, R₃ is AD, R₄ is DC. Rg joins B and D, or is missing if cut.
export function bridge({ E, R1, R2, R3, R4, Rg, cut = false }) {
  const arms = [{ a: 1, b: 2, R: R1 }, { a: 2, b: 0, R: R2 }, { a: 1, b: 3, R: R3 }, { a: 3, b: 0, R: R4 }];
  const { V, I } = solveCircuit(4, cut ? arms : [...arms, { a: 2, b: 3, R: Rg }], { 0: 0, 1: E });
  // At exact balance rounding leaves about 1e-17 A, which must read as a true zero.
  const Ig = cut || Math.abs(I[4]) < 1e-12 ? 0 : I[4];
  return { VB: V[2], VD: V[3], I1: I[0], I2: I[1], I3: I[2], I4: I[3], Ig, total: I[0] + I[2] };
}

export const balanceR4 = ({ R1, R2, R3 }) => (R2 * R3) / R1;
export const isBalanced = (s) => Math.abs(s.R1 * s.R4 - s.R2 * s.R3) <= 0.005 * s.R2 * s.R3;

// The R₄ that puts D at potential V, for dragging D. V_D rises with R₄, so bisection is safe.
export function r4ForPotential(s, V, lo = 1, hi = 200) {
  let [a, b] = [lo, hi];
  for (let i = 0; i < 40; i++) {
    const mid = (a + b) / 2;
    if (bridge({ ...s, R4: mid }).VD < V) a = mid;
    else b = mid;
  }
  return (a + b) / 2;
}
