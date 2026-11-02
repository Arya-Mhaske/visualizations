// Pure maths for the Temperature and Thermal expansion boxes (no DOM).
export const cToF = (c) => 1.8 * c + 32;
export const fToC = (f) => (f - 32) / 1.8;
export const cToK = (c) => c + 273.15;
export const kToC = (k) => k - 273.15;
// Temperature at the contact of two bodies (effusivity e = sqrt(K rho c)).
export const effusivity = (K, rho, c) => Math.sqrt(K * rho * c);
export const contact = (eA, eB, TA, TB) => (eA * TA + eB * TB) / (eA + eB);
export const E_COPPER = effusivity(400, 8960, 385);
export const E_WOOD = effusivity(0.12, 500, 2700);
export const SKIN = 33;
export const E_SKIN = effusivity(0.37, 1100, 3500);
// Skin temperature after t seconds in water at Tw, starting from T0.
export const skinAfter = (T0, Tw, t, tau = 20) => Tw + (T0 - Tw) * Math.exp(-t / tau);
export const P_ZERO = 273.15;
// A fixed-volume gas: P = P0 (1 + T/273.15), P0 in kPa at 0 degrees C.
export const gasP = (P0, T) => P0 * (1 + T / P_ZERO);
export function fitLine(pts) {
  const n = pts.length;
  const [sx, sy] = pts.reduce(([a, b], [x, y]) => [a + x, b + y], [0, 0]);
  const sxx = pts.reduce((a, [x]) => a + x * x, 0);
  const sxy = pts.reduce((a, [x, y]) => a + x * y, 0);
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return { m, b: (sy - m * sx) / n };
}
// Measured pressures: n points between tLow and 100 degrees C, with a seeded wobble of the given fraction.
export function gasPoints(P0, tLow, n, rng, wobble = 0.004) {
  return Array.from({ length: n }, (_, i) => {
    const T = tLow + ((100 - tLow) * i) / (n - 1);
    return [T, gasP(P0, T) * (1 + wobble * (rng.next() * 2 - 1))];
  });
}
export const zeroFrom = ({ m, b }) => -b / m;
// Ideal gas: P (kPa) = mu R T / V (litres).
export const R = 8.314;
export const pressure = (mu, T, V) => (mu * R * T) / V;
