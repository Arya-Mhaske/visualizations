// Kinetic-theory numbers in SI units (NCERT Chapter 12).
export const KB = 1.381e-23;
export const NA = 6.022e23;
export const R = 8.314;
export const GASES = {
  H2: { name: 'H₂', M: 2.016 },
  He: { name: 'He', M: 4.003 },
  N2: { name: 'N₂', M: 28.013 },
  O2: { name: 'O₂', M: 31.998 },
  CO2: { name: 'CO₂', M: 44.01 },
};
const m = (M) => M / 1000; // kg per mole
export const vrms = (M, T) => Math.sqrt((3 * R * T) / m(M));
export const vmean = (M, T) => Math.sqrt((8 * R * T) / (Math.PI * m(M)));
export const vp = (M, T) => Math.sqrt((2 * R * T) / m(M));
export const maxwell = (M, T) => (v) => 4 * Math.PI * (m(M) / (2 * Math.PI * R * T)) ** 1.5 * v * v * Math.exp((-m(M) * v * v) / (2 * R * T));
