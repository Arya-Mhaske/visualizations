// Maths for the resistance-temperature box.
export const R_UNIT = 10; // Ω: one unit block, length 1 and area 1

// A block l long and A wide is A strips side by side, each l blocks in series.
export const strip = (l) => l * R_UNIT;
export const block = (l, A) => strip(l) / A;

// Carriers and collisions against temperature, all relative to 300 K.
export const T0 = 300;
const K_EV = 8.617e-5; // eV/K
export const EG = 0.67; // eV, germanium
export const ALPHA_CU = 0.0039; // per K
export const metalTau = (T) => 1 / (1 + ALPHA_CU * (T - T0));
export const metalN = () => 1;
export const semiN = (T) => (T / T0) ** 1.5 * Math.exp((EG / (2 * K_EV)) * (1 / T0 - 1 / T));
export const semiTau = (T) => (T / T0) ** -1.5;
// R scales as 1/(n tau) for a fixed piece of material.
export const relR = (n, tau) => 1 / (n * tau);

// Devices for the V-I sweep: current in mA for a voltage in V.
export const RESISTOR_OHM = 50;
export const diodeMA = (V) => 1e-6 * (Math.exp(V / 0.039) - 1); // I0 = 1 nA = 1e-6 mA
export function lampMA(V) {
  // V = 0.05 I (1 + (I/15)²) with I in mA: the filament warms, so R rises with I
  const volts = (I) => 0.05 * I * (1 + (I / 15) ** 2);
  const s = Math.sign(V);
  let lo = 0;
  let hi = 200;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (volts(mid) < Math.abs(V)) lo = mid; else hi = mid;
  }
  return s * (lo + hi) / 2;
}
export const resistorMA = (V) => (V / RESISTOR_OHM) * 1000;
export const deviceMA = (kind, V) => (kind === 'diode' ? diodeMA(V) : kind === 'lamp' ? lampMA(V) : resistorMA(V));

// Resistance at a new temperature.
export const atTemperature = (R0, alpha, dT) => R0 * (1 + alpha * dT);
export const alphaFrom = (R1, R2, T1, T2) => (R2 / R1 - 1) / (T2 - T1);

// Heater coil: R = rho L / A, P = V²/R.
export const coilLength = (R, rho, A) => (R * A) / rho;
export const coilPower = (V, R) => (V * V) / R;
export const ALLOYS = [
  { id: 'nichrome', name: 'Nichrome', rho: 1.1e-6 },
  { id: 'copper', name: 'Copper', rho: 1.7e-8 },
  { id: 'iron', name: 'Iron', rho: 1.0e-7 },
];
