// The Electric Field box: pure numbers, no DOM. k is NCERT's 9 × 10⁹; with q in nC and r in m, k q / r² is 9 q / r² N/C.
import { fieldAt, potentialAt } from '../../lib/field.js';

export const K = 9e9;
export const K_NC = 9; // N m²/C² × 1 nC
export const LIGHT = 3e8;
export const SLOW = 1e8; // the field tool runs this many times slower than real life
export const SCREEN_C = LIGHT / SLOW; // m/s on the stage

// ---- Field news spreads at c ----
// history: samples { t, x, y, q }, oldest first. A point feels the newest sample whose news has reached it.
export function sourceAt(history, [x, y], now, speed = SCREEN_C) {
  for (let i = history.length - 1; i > 0; i--) {
    const s = history[i];
    if (s.t + Math.hypot(x - s.x, y - s.y) / speed <= now) return s;
  }
  return history[0];
}

export const delayNs = (metres) => (metres / LIGHT) * 1e9;

// ---- Going round a closed path ----
// Work per unit charge on the way, split into the parts where the field helps and where it opposes.
export function loopWork(charges, [cx, cy], R, k = K_NC, n = 720) {
  let [help, oppose] = [0, 0];
  const pieces = [];
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) * 2 * Math.PI) / n;
    const [ex, ey] = fieldAt(charges, [cx + R * Math.cos(a), cy + R * Math.sin(a)], k);
    const work = (-ex * Math.sin(a) + ey * Math.cos(a)) * ((R * 2 * Math.PI) / n);
    if (work > 0) help += work;
    else oppose -= work;
    pieces.push(work);
  }
  return { help, oppose, net: help - oppose, pieces };
}

export { potentialAt };

// Where two like charges cancel on the line between them, or null. They sit at x = −2 and x = +2.
export function nullPoint(left, right) {
  if (left * right <= 0) return null;
  const ratio = Math.sqrt(Math.abs(left / right));
  return [-2 + (4 * ratio) / (1 + ratio), 0];
}

// ---- Dipole: ±q a distance 2a apart, in units of N/C for q in nC and lengths in cm ----
const unit = (qNc, cm2) => (K * qNc * 1e-9) / (cm2 * 1e-4);

export function dipoleField(where, q, a, r) {
  if (where === 'axial') {
    const [near, far] = [unit(q, (r - a) ** 2), unit(q, (r + a) ** 2)];
    return { plus: near, minus: far, net: near - far, approx: (2 * K * (q * 1e-9) * (2 * a * 1e-2)) / (r * 1e-2) ** 3 };
  }
  const each = unit(q, r * r + a * a);
  return { plus: each, minus: each, net: (2 * each * a) / Math.sqrt(r * r + a * a), approx: (K * (q * 1e-9) * (2 * a * 1e-2)) / (r * 1e-2) ** 3 };
}

// The local slope of log E against log r, which settles to −3.
export const dipoleSlope = (where, a, r) => (where === 'axial' ? 1 - (4 * r * r) / (r * r - a * a) : (-3 * r * r) / (r * r + a * a));

export const singleField = (q, r) => unit(q, r * r);

// ---- Dipole in a uniform field: E along +x, p at θ from it. q in µC, length in cm, E in 10⁴ N/C ----
export function dipoleTorque(q, length, E, theta) {
  const force = q * 1e-6 * E * 1e4;
  const p = q * 1e-6 * length * 1e-2;
  return { force, p, torque: p * E * 1e4 * Math.sin(theta), arm: length * 1e-2 * Math.sin(theta), net: 0 };
}

// ---- A scrap of paper near a comb ----
// Modelled as a small conducting ball of radius b, the upper limit: p = 4πε₀ b³ E. Its charges ±δ sit a distance b either side
// of its centre, so δ·2b = p. All in SI, with Q in C and r in m.
export const PAPER = { b: 2e-3, mass: 1e-6, g: 10 };
export const weight = ({ mass, g } = PAPER) => mass * g;

export function paperForces(Q, r, { b } = PAPER) {
  const E = (K * Math.abs(Q)) / (r * r);
  const p = (b * b * b * E) / K;
  const delta = p / (2 * b);
  const near = (K * Math.abs(Q) * delta) / (r - b) ** 2;
  const far = (K * Math.abs(Q) * delta) / (r + b) ** 2;
  return { E, p, delta, near, far, net: near - far };
}

// In a uniform field E the two ends feel the same size of force.
export const uniformForces = (E, { b } = PAPER) => {
  const delta = (b * b * b * E) / K / (2 * b);
  return { near: delta * E, far: delta * E, net: 0 };
};

export const dipoleLimitForce = (Q, r, { b } = PAPER) => (2 * b ** 3 * K * Q * Q) / r ** 5;
