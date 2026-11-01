// AC in NCERT's form: v = v_m sin ωt, peak values i_m and v_m, rms values I and V. Reuse in lcr-resonance and power-transformers.
import { addPhasors } from '../../lib/phasor.js';

export const TAU = Math.PI * 2;
const RAD = Math.PI / 180;

export const omega = (f) => TAU * f;
export const period = (f) => 1 / f;
export const rms = (peak) => peak / Math.SQRT2;
export const peakOf = (value) => value * Math.SQRT2;

// A plain sum over one whole cycle, so a test can compare the formula with the definition.
export function cycleMean(f, steps = 3600) {
  let sum = 0;
  for (let k = 0; k < steps; k++) sum += f(((k + 0.5) / steps) * TAU);
  return sum / steps;
}
export const meanCurrent = (peak) => cycleMean((p) => peak * Math.sin(p));
export const meanSize = (peak) => cycleMean((p) => Math.abs(peak * Math.sin(p)));
export const meanSquare = (peak) => cycleMean((p) => (peak * Math.sin(p)) ** 2);

// Heat in R over a time, and how far off a steady current lands. The tool runs at f Hz for whole cycles.
export const acHeat = (peak, R, time) => (peak * peak * R * time) / 2;
export const dcHeat = (I, R, time) => I * I * R * time;

// The stage shows the same shape shifted by a quarter cycle: the two add to i_m² at every instant.
export const iSquared = (peak, p) => (peak * Math.sin(p)) ** 2;
export const iSquaredShifted = (peak, p) => (peak * Math.cos(p)) ** 2;

// Share of a cycle, and the area, on each side of a level. Above the level: humps. Below it: gaps. They balance at the mean.
export function aroundLevel(peak, level, steps = 3600) {
  let above = 0;
  let below = 0;
  for (let k = 0; k < steps; k++) {
    const gap = iSquared(peak, ((k + 0.5) / steps) * TAU) - level;
    if (gap > 0) above += gap / steps;
    else below -= gap / steps;
  }
  return { above, below };
}

// Two sine waves of one frequency, as arrows at angles 0 and φ (radians) and as heights at phase p.
export const twoWaves = (a, b, phi) => addPhasors([{ size: a, angle: 0 }, { size: b, angle: phi }]);
export const sumByHand = (a, b, phi, p) => a * Math.sin(p) + b * Math.sin(p + phi);
export const sumOfArrows = (a, b, phi, p) => {
  const { size, angle } = twoWaves(a, b, phi);
  return size * Math.sin(p + angle);
};

// Each part has a rule linking v and i. Try i = sin(p + φ) against v = sin p, both as fractions of their peaks.
//   R: v = iR.  L: v = L di/dt.  C: i = C dv/dt.
export const PARTS = {
  R: { name: 'Resistor', rule: 'v = iR', right: 0 },
  L: { name: 'Inductor', rule: 'v = L di/dt', right: -90 },
  C: { name: 'Capacitor', rule: 'i = C dv/dt', right: 90 },
};

// What the rule says about the curve it fixes, at phase p, for a current at phase phiDeg to the voltage.
// R and L fix the voltage from the current. C fixes the current from the voltage.
export function ruleCurve(part, phiDeg, p) {
  const phi = phiDeg * RAD;
  if (part === 'R') return Math.sin(p + phi);
  if (part === 'L') return Math.cos(p + phi);
  return Math.cos(p);
}

// The biggest gap over a cycle between what the rule needs and what the curve does, as a fraction of a peak (0 to 2).
export function ruleGap(part, phiDeg) {
  const miss = ((phiDeg - PARTS[part].right) * Math.PI) / 360;
  const gap = 2 * Math.abs(Math.sin(miss));
  return gap < 1e-9 ? 0 : gap;
}

// Reactance, and the two facts behind it, in SI units.
export const reactanceL = (f, L) => omega(f) * L;
export const reactanceC = (f, C) => 1 / (omega(f) * C);
export const peakCurrentL = (vm, f, L) => vm / reactanceL(f, L);
export const peakCurrentC = (vm, f, C) => vm / reactanceC(f, C);
// The inductor: area under one hump of v, which is L times the swing in i, from −i_m to +i_m.
export const humpArea = (vm, f) => (2 * vm) / omega(f);
// The capacitor: charge moved in that half cycle, from −Cv_m to +Cv_m. It does not depend on f.
export const chargeSwing = (vm, C) => 2 * C * vm;
export const crossoverFreq = (L, C) => 1 / (TAU * Math.sqrt(L * C));

// A series circuit: one current, i = i_m sin ωt, so its arrow is drawn first. Parts missing from `on` are plain wire.
// NCERT's φ: tan φ = (X_C − X_L)/R, the phase of the current ahead of the source voltage.
export function seriesCircuit({ on, R, L, C, f, im }) {
  const XL = on.L ? reactanceL(f, L) : 0;
  const XC = on.C ? reactanceC(f, C) : 0;
  const Rs = on.R ? R : 0;
  const VR = im * Rs;
  const VL = im * XL;
  const VC = im * XC;
  const sum = addPhasors([{ size: VR, angle: 0 }, { size: VL, angle: Math.PI / 2 }, { size: VC, angle: -Math.PI / 2 }]);
  const Z = Math.hypot(Rs, XL - XC);
  const flat = Z < 1e-9;
  const phi = flat ? null : Math.atan2(XC - XL, Rs);
  return { XL, XC, R: Rs, VR, VL, VC, V: flat ? 0 : sum.size, Z: flat ? 0 : Z, phi, angle: flat ? 0 : sum.angle };
}

// The voltage a phasor diagram's outer ring stands for: the next round value at or above r, so the arrows fill the ring.
export function ringScale(r) {
  if (r <= 0) return 10;
  const power = 10 ** Math.floor(Math.log10(r) + 1e-9);
  return [1, 1.5, 2, 3, 4, 5, 6, 8, 10].map((k) => k * power).find((value) => value >= r - 1e-9);
}

export function phaseWords(phi) {
  if (phi === null) return 'No voltage to compare';
  if (Math.abs(phi) < 1e-9) return 'In step';
  const size = (Math.abs(phi) * 180) / Math.PI;
  return `Current ${phi > 0 ? 'leads' : 'lags'} by ${Math.round(size * 10) / 10}°`;
}

// Mains. Real values, in the country order of the tool's buttons.
export const MAINS = [
  { key: 'india', name: 'India', V: 230, f: 50 },
  { key: 'usa', name: 'USA', V: 120, f: 60 },
  { key: 'japan', name: 'Tokyo', V: 100, f: 50 },
];

// Share of the time the size of a sine stays above a level, from the arcsine. Exactly half for the rms value.
export function shareAbove(peak, level) {
  if (level >= peak) return 0;
  if (level <= 0) return 1;
  return 1 - (2 / Math.PI) * Math.asin(level / peak);
}
