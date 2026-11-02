// Heat capacities from counting quadratic energy terms (NCERT Chapter 12). Energies in units of R per mole (C/R) or J/mol·K.
export const R = 8.314;
// f = translation 3 + rotation r + 2 per vibrational mode.
export const dof = (rot, vib) => 3 + rot + 2 * vib;
export const cvOf = (f) => (f / 2) * R;
export const cpOf = (f) => cvOf(f) + R;
export const gammaOf = (f) => 1 + 2 / f;
// Measured molar Cv at room temperature, J/mol·K (rounded textbook values), with the rigid-molecule dof.
export const GASES = [
  { key: 'He', name: 'He', f: 3, fv: 3, cv: 12.5 },
  { key: 'Ar', name: 'Ar', f: 3, fv: 3, cv: 12.5 },
  { key: 'H2', name: 'H₂', f: 5, fv: 7, cv: 20.4 },
  { key: 'N2', name: 'N₂', f: 5, fv: 7, cv: 20.8 },
  { key: 'O2', name: 'O₂', f: 5, fv: 7, cv: 21.0 },
  { key: 'CO2', name: 'CO₂', f: 5, fv: 7, cv: 28.5 },
];
// Einstein vibration term for one mode, C/R, at x = θ/T.
export const einstein = (theta, T) => {
  const x = theta / T;
  if (x > 60) return 0;
  const e = Math.exp(x);
  return (x * x * e) / ((e - 1) * (e - 1));
};
// Solids: molar mass (g/mol) and specific heat (J/g·K) near room temperature.
export const METALS = [
  { name: 'Al', M: 26.98, c: 0.9 },
  { name: 'Fe', M: 55.85, c: 0.449 },
  { name: 'Cu', M: 63.55, c: 0.385 },
  { name: 'Ag', M: 107.87, c: 0.235 },
  { name: 'Au', M: 196.97, c: 0.129 },
  { name: 'Pb', M: 207.2, c: 0.128 },
];
