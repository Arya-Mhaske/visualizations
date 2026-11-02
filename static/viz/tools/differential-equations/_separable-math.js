// Pure maths for the separable-equations and linear-first-order boxes. No DOM.
import { solve } from './_de-math.js';

export const G = 9.8;

// ---- Torricelli: a cylinder with a hole at the base. r = hole area / tank area. dh/dt = -r sqrt(2 g h) ----
export const drainTime = (h0, r) => Math.sqrt((2 * h0) / G) / r;
export const level = (h0, r, t) => {
  const left = Math.sqrt(h0) - (r / 2) * Math.sqrt(2 * G) * t;
  return left > 0 ? left * left : 0;
};
export const drainRate = (h, r) => r * Math.sqrt(2 * G * h); // m/s the level falls
export const halfTime = (h0, r) => drainTime(h0, r) * (1 - Math.SQRT1_2);

// ---- A mixing tank: V litres, flow r L/min in and out, inflow concentration cin kg/L, S0 kg at the start ----
export const salt = (V, r, cin, S0, t) => V * cin + (S0 - V * cin) * Math.exp((-r * t) / V);
export const saltRates = (V, r, cin, S) => ({ inflow: r * cin, outflow: (r * S) / V });

// ---- A ball thrown up with linear air resistance k (per second): v' = -g - k v ----
export function height(v0, k, t) {
  if (k < 1e-9) return v0 * t - 0.5 * G * t * t;
  return ((v0 + G / k) * (1 - Math.exp(-k * t))) / k - (G * t) / k;
}
export const velocity = (v0, k, t) => (k < 1e-9 ? v0 - G * t : -G / k + (v0 + G / k) * Math.exp(-k * t));
export const timeUp = (v0, k) => (k < 1e-9 ? v0 / G : Math.log(1 + (k * v0) / G) / k);
export function flight(v0, k) {
  const up = timeUp(v0, k);
  const top = height(v0, k, up);
  let hi = up + 1;
  while (height(v0, k, hi) > 0) hi *= 2;
  let lo = up;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (height(v0, k, mid) > 0) lo = mid; else hi = mid;
  }
  const land = (lo + hi) / 2;
  return { up, top, land, down: land - up, landSpeed: Math.abs(velocity(v0, k, land)) };
}

// ---- Separable presets: dy/dx = rule, with the closed form from the initial value y0 at x0 ----
export const SEPARABLE = {
  growth: { name: "y′ = 2xy", rule: (x, y) => 2 * x * y, x0: 0, xEval: 1, sol: (y0, x) => y0 * Math.exp(x * x) },
  circle: { name: "y′ = x/y", rule: (x, y) => x / y, x0: 0, xEval: 1, sol: (y0, x) => Math.sqrt(x * x + y0 * y0) },
  hyper: { name: "y′ = −y/x", rule: (x, y) => -y / x, x0: 1, xEval: 2, sol: (y0, x) => y0 / x },
  expo: { name: "y′ = e^(x−y)", rule: (x, y) => Math.exp(x - y), x0: 0, xEval: 1, sol: (y0, x) => Math.log(Math.exp(x) + Math.exp(y0) - 1) },
};
// RK4 value of a preset at xEval, independent of the closed form.
export const numericValue = (p, y0) => solve((x, [y]) => [p.rule(x, y)], [y0], p.x0, p.xEval, 400).at(-1)[1];

// ---- Homogeneous presets: dy/dx = f(x, y) = F(y/x) ----
export const HOMOGENEOUS = {
  a: { name: "y′ = (x + y)/x", f: (x, y) => (x + y) / x, F: (v) => 1 + v },
  b: { name: "y′ = (x² + y²)/(xy)", f: (x, y) => (x * x + y * y) / (x * y), F: (v) => 1 / v + v },
  c: { name: "y′ = (x² + 3y²)/(2xy)", f: (x, y) => (x * x + 3 * y * y) / (2 * x * y), F: (v) => 1 / (2 * v) + (3 * v) / 2 },
  d: { name: "y′ = x + y", f: (x, y) => x + y, F: null },
};

// ---- Orthogonal families: F1(x, y) = c and F2(x, y) = k, with their slopes ----
export const FAMILIES = {
  parabolas: {
    name: 'y = cx²  and  x² + 2y² = k',
    g1: (x, y, c) => y - c * x * x, g2: (x, y, k) => x * x + 2 * y * y - k,
    c: (x, y) => y / (x * x), k: (x, y) => x * x + 2 * y * y,
    s1: (x, y) => (2 * y) / x, s2: (x, y) => -x / (2 * y),
    list1: [-2, -1, -0.5, 0.5, 1, 2], list2: [1, 2, 4, 8, 12],
  },
  hyperbolas: {
    name: 'xy = c  and  x² − y² = k',
    g1: (x, y, c) => x * y - c, g2: (x, y, k) => x * x - y * y - k,
    c: (x, y) => x * y, k: (x, y) => x * x - y * y,
    s1: (x, y) => -y / x, s2: (x, y) => x / y,
    list1: [-6, -3, -1, 1, 3, 6], list2: [-6, -3, -1, 1, 3, 6],
  },
  circles: {
    name: 'x² + y² = c  and  y = mx',
    g1: (x, y, c) => x * x + y * y - c, g2: (x, y, m) => y - m * x,
    c: (x, y) => x * x + y * y, k: (x, y) => y / x,
    s1: (x, y) => -x / y, s2: (x, y) => y / x,
    list1: [1, 4, 9, 16], list2: [-3, -1, -0.33, 0.33, 1, 3],
  },
  exponentials: {
    name: 'y = ce^x  and  y² = k − 2x',
    g1: (x, y, c) => y - c * Math.exp(x), g2: (x, y, k) => y * y + 2 * x - k,
    c: (x, y) => y / Math.exp(x), k: (x, y) => y * y + 2 * x,
    s1: (x, y) => y, s2: (x, y) => -1 / y,
    list1: [-3, -1, -0.3, 0.3, 1, 3], list2: [-8, -4, 0, 4, 8],
  },
};

// ---- Linear first order: y' + p y = q (constants) and the integrating factor e^(kx) ----
export const linearSolution = (p, q, y0, x) => q / p + (y0 - q / p) * Math.exp(-p * x);
// (e^{kx} y)' by the product rule, using y' = q - p y
export const productRate = (k, p, q, y0, x) => Math.exp(k * x) * (q + (k - p) * linearSolution(p, q, y0, x));

// RC (charging a capacitor) and RL (current growing in an inductor): both are y' + y/tau = final/tau.
export const approach = (final, tau, t) => final * (1 - Math.exp(-t / tau));
