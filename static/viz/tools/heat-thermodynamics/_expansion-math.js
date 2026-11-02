// Pure maths for the Thermal expansion box (no DOM).
// Reduced Lennard-Jones well: minimum at r = 1, depth 1.
export const lj = (r) => r ** -12 - 2 * r ** -6;
export const harmonic = (r) => 36 * (r - 1) ** 2 - 1;
function solve(f, E, lo, hi, rising) {
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if ((f(mid) < E) === rising) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
// Turning points and mean spacing of an atom with energy E (E between -1 and 0).
export function turning(E, symmetric = false) {
  if (symmetric) {
    const h = Math.sqrt((E + 1) / 36);
    return { left: 1 - h, right: 1 + h, mean: 1 };
  }
  const left = solve(lj, E, 0.6, 1, false);
  const right = solve(lj, E, 1, 40, true);
  return { left, right, mean: (left + right) / 2 };
}
export const ALPHAS = {
  steel: ['Steel', 12e-6],
  aluminium: ['Aluminium', 23e-6],
  brass: ['Brass', 19e-6],
  copper: ['Copper', 17e-6],
  glass: ['Glass', 9e-6],
  invar: ['Invar', 1.2e-6],
};
// Cube of side 1 growing by x: (1 + x)^3 - 1 = 3x + 3x^2 + x^3.
export const cubeTerms = (x) => ({ first: 3 * x, second: 3 * x * x, third: x ** 3 });
export const RHO_T = [[0, 999.84], [2, 999.94], [4, 999.97], [6, 999.94], [8, 999.85], [10, 999.7], [15, 999.1], [20, 998.21], [30, 995.65]];
export function rho(T) {
  if (T <= 0) return RHO_T[0][1];
  for (let i = 1; i < RHO_T.length; i++) {
    const [t0, r0] = RHO_T[i - 1];
    const [t1, r1] = RHO_T[i];
    if (T <= t1) return r0 + ((r1 - r0) * (T - t0)) / (t1 - t0);
  }
  return RHO_T[RHO_T.length - 1][1];
}
// A lake of n layers, all at `start`. Each step cools the top layer by 1 degree (not below 0), then denser water sinks.
export function lake(steps, n = 8, start = 12) {
  const t = Array(n).fill(start);
  for (let s = 0; s < steps; s++) {
    t[0] = Math.max(0, t[0] - 1);
    let moved = true;
    while (moved) {
      moved = false;
      for (let j = 0; j < n - 1; j++) {
        if (rho(t[j]) > rho(t[j + 1]) + 1e-9) { [t[j], t[j + 1]] = [t[j + 1], t[j]]; moved = true; }
      }
    }
  }
  return t;
}
export const rimDiameter = (d0, alpha, dT) => d0 * (1 + alpha * dT);
export const neededRise = (d0, D, alpha) => (D / d0 - 1) / alpha;
export const railGap = (alpha, L, dT) => alpha * L * dT;
// A bimetallic strip of thickness d bends to radius d / ((a1 - a2) dT).
export const bendRadius = (d, a1, a2, dT) => d / ((a1 - a2) * dT);
