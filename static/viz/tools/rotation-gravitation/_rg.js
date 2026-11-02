// Constants and small formulas for the gravitation boxes (SI units).
export const GN = 6.674e-11;
export const ME = 5.972e24;
export const RE = 6.371e6;
export const MM = 7.348e22;
export const RM = 1.737e6;
export const RMOON = 3.844e8;
export const GM = GN * ME;
export const gAt = (r) => (r >= RE ? GM / (r * r) : (GM * r) / RE ** 3);
export const vCirc = (r) => Math.sqrt(GM / r);
export const period = (r) => 2 * Math.PI * Math.sqrt(r ** 3 / GM);
export const vEsc = (M, R) => Math.sqrt((2 * GN * M) / R);
// Solve Kepler's equation M = E - e sin E.
export function eccAnomaly(Mean, e) {
  let E = Mean;
  for (let i = 0; i < 40; i++) E -= (E - e * Math.sin(E) - Mean) / (1 - e * Math.cos(E));
  return E;
}
