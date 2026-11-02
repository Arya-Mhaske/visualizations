// Ideal-gas processes for the first-law, thermodynamic-processes and engines boxes. Pressure in kPa and volume in L, so P·V is in J.
export const R = 8.314;
export function simpson(f, a, b, n = 200) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}
export const isoP = (P1, V1) => (V) => (P1 * V1) / V;
export const adiaP = (P1, V1, g) => (V) => P1 * (V1 / V) ** g;
export const workIsobaric = (P1, V1, V2) => P1 * (V2 - V1);
export const workIsothermal = (P1, V1, V2) => P1 * V1 * Math.log(V2 / V1);
export const workAdiabatic = (P1, V1, V2, g) => (P1 * V1 - P1 * (V1 / V2) ** g * V2) / (g - 1);
// Degrees of freedom f give Cv = f R / 2 and gamma = 1 + 2/f.
export const gammaOf = (f) => 1 + 2 / f;
export const dU = (f, P1, V1, P2, V2) => (f / 2) * (P2 * V2 - P1 * V1);
