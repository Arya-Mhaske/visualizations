// Pure maths for the Surface tension box (SI units, no DOM).
export const G = 9.8;
export const LIQUIDS = {
  water: ['Water in glass', 0.072, 1000, 0],
  mercury: ['Mercury in glass', 0.465, 13600, 140],
  soap: ['Soap solution', 0.025, 1000, 0],
};
// Surface area of a spheroid with semi-axes (kR, R/sqrt(k), R/sqrt(k)): the volume is fixed at (4/3) pi R^3.
export function spheroidArea(k, R = 1) {
  const a = k * R;
  const b = R / Math.sqrt(k);
  const n = 400;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const t = (Math.PI * i) / n;
    const f = 2 * Math.PI * b * Math.sin(t) * Math.sqrt(a * a * Math.sin(t) ** 2 + b * b * Math.cos(t) ** 2);
    sum += f * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2);
  }
  return (sum * (Math.PI / n)) / 3;
}
export const sphereArea = (R = 1) => 4 * Math.PI * R * R;
export const capRise = (S, thetaDeg, rho, r) => (2 * S * Math.cos((thetaDeg * Math.PI) / 180)) / (rho * G * r);
export const dropExcess = (S, r) => (2 * S) / r;
export const bubbleExcess = (S, r) => (4 * S) / r;
// Work done by the excess pressure when a bubble of radius r grows by dr, against the surface energy gained.
export const pressureWork = (dP, r, dr) => dP * 4 * Math.PI * r * r * dr;
export const surfaceGain = (S, surfaces, r, dr) => S * surfaces * 8 * Math.PI * r * dr;
// Detergent: surface tension falls to a floor at the critical micelle concentration (illustrative values).
export const S_WATER = 0.072;
export const S_FLOOR = 0.035;
export const tensionAt = (c) => S_WATER - (S_WATER - S_FLOOR) * Math.min(1, c);
export const angleAt = (c) => 110 - 50 * Math.min(1, c);
export const entryPressure = (S, thetaDeg, r) => (-2 * S * Math.cos((thetaDeg * Math.PI) / 180)) / r;
// Insect: each leg presses a dimple whose edge is a line of length l on both sides.
export const maxSupport = (S, legs, l) => S * 2 * legs * l;
export const weight = (mg) => mg * 1e-6 * G;
export const youngCos = (thetaDeg) => Math.cos((thetaDeg * Math.PI) / 180);
