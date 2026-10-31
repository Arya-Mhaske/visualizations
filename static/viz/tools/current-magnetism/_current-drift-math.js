// Current & Drift box. SI units throughout unless a name says otherwise.
import { createRng } from '../../lib/rng.js';

export const E_CHARGE = 1.6e-19; // C
export const E_MASS = 9.1e-31; // kg
export const N_COPPER = 8.5e28; // conduction electrons per m³ (NCERT's value)
export const RHO_COPPER = 1.7e-8; // Ω m
export const AREA_EXAMPLE = 1e-7; // m²: NCERT's example wire
export const THERMAL_SPEED = 1e5; // m/s, order of size only
export const SIGNAL_SPEED = 2e8; // m/s, a typical value: about two-thirds of the speed of light
export const LIGHT_SPEED = 3e8; // m/s
export const WALKING_SPEED = 1.4; // m/s
export const SOUND_SPEED = 343; // m/s in air at 20 °C
export const COPPER_DENSITY = 8960; // kg/m³
export const COPPER_SPECIFIC_HEAT = 385; // J/(kg K)

export const MATERIALS = {
  copper: { name: 'Copper', n: N_COPPER },
  aluminium: { name: 'Aluminium', n: 1.8e29 },
  silver: { name: 'Silver', n: 5.9e28 },
};

export const driftSpeed = (I, n = N_COPPER, A = AREA_EXAMPLE) => I / (n * E_CHARGE * A);
export const electronsPerSecond = (I) => I / E_CHARGE;
export const crossingTime = (L, speed) => L / speed;

// Two pipes pushed by the same plunger, `push` marble widths. Positions are in marble widths from the near end.
export const MARBLES = 12;
export const pipeFull = (push) => Array.from({ length: MARBLES }, (_, i) => i + push);
export const pipeEmpty = (push) => [push];

// Free flights: collision times in [0, span], with exponential gaps of mean tau.
export function flights(seed, tau, span) {
  const rng = createRng(seed);
  const times = [];
  for (let t = -tau * Math.log(1 - rng.next()); t < span; t += -tau * Math.log(1 - rng.next())) times.push(t);
  return times;
}

// Speed along the field gained since the last collision (the random thermal part is left out).
export function speedAt(times, a, t) {
  let last = 0;
  for (const hit of times) {
    if (hit > t) break;
    last = hit;
  }
  return a * (t - last);
}

// Distance along the field by time t: ½at² on each flight, restarted from rest at each collision.
export function distanceAt(times, a, t) {
  let last = 0;
  let total = 0;
  for (const hit of times) {
    if (hit > t) break;
    total += 0.5 * a * (hit - last) ** 2;
    last = hit;
  }
  return total + 0.5 * a * (t - last) ** 2;
}

// Steady average speed of `count` electrons between t = settle and t = span. Electrons start from rest, so an
// average from t = 0 reads low by a factor of about 1 − τ/span; settle should be several τ.
export function meanDrift(seed, count, a, tau, span, settle = 0) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    const times = flights(seed + i, tau, span);
    total += distanceAt(times, a, span) - distanceAt(times, a, settle);
  }
  return total / (count * (span - settle));
}

export const accel = (E) => (E_CHARGE * E) / E_MASS;
export const drudeDrift = (E, tau) => accel(E) * tau;
export const currentDensity = (v, n = N_COPPER) => n * E_CHARGE * v;
export const conductivity = (tau, n = N_COPPER) => (n * E_CHARGE ** 2 * tau) / E_MASS;
export const relaxationTime = (rho, n = N_COPPER) => E_MASS / (n * E_CHARGE ** 2 * rho);

// Direction of a current as an arrow: magnitude of the two arrows flowing into the junction, added as vectors.
export function vectorSum(I1, a1, I2, a2) {
  return Math.hypot(I1 * Math.cos(a1) + I2 * Math.cos(a2), I1 * Math.sin(a1) + I2 * Math.sin(a2));
}
// With one dot per coulomb, a wire carrying I amperes delivers dots at t = (k + ½)/I.
export const arrivals = (I, upTo) => {
  const out = [];
  for (let k = 0; (k + 0.5) / I <= upTo; k++) out.push((k + 0.5) / I);
  return out;
};
export const countBy = (I, t) => (t <= 0 || I <= 0 ? 0 : Math.floor(I * t + 0.5));

export const RESISTOR = 50; // Ω
const DIODE_IS = 1e-9; // A
const DIODE_NVT = 1.5 * 0.02585; // V
export const resistorCurrent = (V) => V / RESISTOR;
export const diodeCurrent = (V) => DIODE_IS * Math.expm1(V / DIODE_NVT);
export const deviceCurrent = (device, V) => (device === 'diode' ? diodeCurrent(V) : resistorCurrent(V));
export const ratioR = (V, I) => V / I;

export const wireResistance = (L, A, rho = RHO_COPPER) => (rho * L) / A;
export const heatPower = (I, R) => I * I * R;
export const heatCapacity = (L, A) => COPPER_DENSITY * L * A * COPPER_SPECIFIC_HEAT;
export const tempRise = (I, L, A, t) => (heatPower(I, wireResistance(L, A)) * t) / heatCapacity(L, A);
// Fields and collisions in the wire. With exponential flights the mean energy handed over per collision is m(aτ)².
export const wireField = (I, A, rho = RHO_COPPER) => (I / A) * rho;
export const energyPerCollision = (E, tau) => E_MASS * drudeDrift(E, tau) ** 2;
export const collisionRate = (L, A, tau, n = N_COPPER) => (n * L * A) / tau;
