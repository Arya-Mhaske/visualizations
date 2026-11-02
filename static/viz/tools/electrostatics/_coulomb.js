// Coulomb's law numbers (SI) and the pith-ball solver.
export const K = 8.988e9;
export const E = 1.602e-19;
export const G = 6.674e-11;
export const MP = 1.673e-27;
export const ME = 9.109e-31;
export const g = 9.8;
// Force in newtons between charges in µC at distance in cm.
export const forceUcCm = (q1, q2, rcm) => (K * q1 * q2 * 1e-12) / ((rcm * 1e-2) ** 2);
// Two equal pith balls (mass m kg, charge q C) on threads of length L m: k q² / (2 L sinθ)² = m g tanθ. Returns θ in radians.
export function pithAngle(q, L, m) {
  const f = (t) => (K * q * q) / (2 * L * Math.sin(t)) ** 2 - m * g * Math.tan(t);
  let [lo, hi] = [1e-6, Math.PI / 2 - 1e-6];
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
export const pithCharge = (theta, L, m) => 2 * L * Math.sin(theta) * Math.sqrt((m * g * Math.tan(theta)) / K);
