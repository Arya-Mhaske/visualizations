// Pure maths for the Periodic Motion and SHM boxes (no DOM).
// Checked by catalogue/tool_tests/test_oscillations_waves_shm.py.
export const TAU = Math.PI * 2;

export const frequency = (T) => 1 / T;
export const omegaFromT = (T) => TAU / T;
export const convert = (known, value) => {
  const T = { T: value, f: 1 / value, w: TAU / value }[known];
  return { T, f: 1 / T, w: TAU / T };
};

export const x = (A, w, phi, t) => A * Math.cos(w * t + phi);
export const v = (A, w, phi, t) => -A * w * Math.sin(w * t + phi);
export const a = (A, w, phi, t) => -A * w * w * Math.cos(w * t + phi);

// From x₀ = A cos φ and v₀ = −Aω sin φ.
export const fit = (x0, v0, w) => ({ A: Math.hypot(x0, v0 / w), phi: Math.atan2(-v0 / w, x0) });

// Three periodic motions of period 1. Each returns [x, acceleration] at time t, with x about its mean.
export const G_BALL = 8;
export function ball(t) {
  const s = ((t % 1) + 1) % 1;
  return [0.5 * G_BALL * s * (1 - s) - G_BALL / 12, -G_BALL];
}
export function spring(t) {
  return [Math.cos(TAU * t), -TAU * TAU * Math.cos(TAU * t)];
}
// x-coordinate of a body on an ellipse of eccentricity e, by Kepler's equation, with GM = 4π² and a = 1.
export function orbit(t, e = 0.6) {
  const M = TAU * (((t % 1) + 1) % 1);
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 40; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const px = Math.cos(E) - e;
  const py = Math.sqrt(1 - e * e) * Math.sin(E);
  const r = Math.hypot(px, py);
  return [px, (-TAU * TAU * px) / r ** 3];
}

// x₁ + x₂ with angular frequencies ratio and 1. Largest change over one time-shift τ, sampled.
export const sum = (ratio, t) => Math.cos(ratio * t) + Math.cos(t);
export function mismatch(ratio, shift, span = 120, steps = 1200) {
  let worst = 0;
  for (let i = 0; i <= steps; i++) {
    const t = (span * i) / steps;
    worst = Math.max(worst, Math.abs(sum(ratio, t + shift) - sum(ratio, t)));
  }
  return worst;
}
// The ratio p/q gives a repeat every 2πq.
export const repeatTime = (q) => TAU * q;
