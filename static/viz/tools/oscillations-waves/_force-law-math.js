// Pure maths for the Force Law & Energy box (no DOM).
// Checked by catalogue/tool_tests/test_oscillations_waves_force_law_energy.py.
export const TAU = Math.PI * 2;

// ---- Other force laws: m = 1 kg, k = 1, F = −sign(x)|x|^p ----------------------------------------
export const force = (p, x) => -Math.sign(x) * Math.abs(x) ** p;

// RK4 from rest at x = A. Returns samples of x every dt, from t = 0 to span.
export function trajectory(p, A, span = 16, dt = 1 / 400) {
  const out = [A];
  let [x, v] = [A, 0];
  const acc = (xx) => force(p, xx);
  for (let i = 1; i <= Math.round(span / dt); i++) {
    const k1x = v; const k1v = acc(x);
    const k2x = v + (dt / 2) * k1v; const k2v = acc(x + (dt / 2) * k1x);
    const k3x = v + (dt / 2) * k2v; const k3v = acc(x + (dt / 2) * k2x);
    const k4x = v + dt * k3v; const k4v = acc(x + dt * k3x);
    x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    v += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
    out.push(x);
  }
  return out;
}

export function at(samples, dt, t) {
  const i = Math.max(0, Math.min(samples.length - 2, Math.floor(t / dt)));
  const f = t / dt - i;
  return samples[i] * (1 - f) + samples[i + 1] * f;
}

// Period = 4 × the time to first reach x = 0 (the motion is symmetric).
export function period(p, A, dt = 1 / 1000) {
  const s = trajectory(p, A, 40, dt);
  for (let i = 1; i < s.length; i++) {
    if (s[i] <= 0) return 4 * dt * (i - 1 + s[i - 1] / (s[i - 1] - s[i]));
  }
  return NaN;
}

// Largest distance of x(t) from the cosine of the same amplitude and period, as a fraction of A, over one period.
export function gap(p, A) {
  const dt = 1 / 400;
  const T = period(p, A);
  const s = trajectory(p, A, T + 0.1, dt);
  let worst = 0;
  for (let t = 0; t <= T; t += dt) worst = Math.max(worst, Math.abs(at(s, dt, t) - A * Math.cos((TAU * t) / T)));
  return worst / A;
}

// ---- Energy of a spring–mass system ------------------------------------------------------------
export const omega = (k, m) => Math.sqrt(k / m);
export const periodOf = (k, m) => TAU / omega(k, m);
export function energies(k, m, A, t) {
  const w = omega(k, m);
  const x = A * Math.cos(w * t);
  const v = -A * w * Math.sin(w * t);
  const K = 0.5 * m * v * v;
  const U = 0.5 * k * x * x;
  return { x, v, K, U, E: K + U };
}
export const totalEnergy = (k, A) => 0.5 * k * A * A;

// ---- Driven building (base shaking at frequency f, damping ratio zeta) --------------------------------
// One floor weighs 1e5 kg and the frame's stiffness is 4π² × 10⁵ N/m, so n floors have f₀ = 1/√n Hz.
export const FLOOR_MASS = 1e5;
export const STIFFNESS = TAU * TAU * 1e5;
export const naturalFreq = (n) => Math.sqrt(STIFFNESS / (n * FLOOR_MASS)) / TAU;
// Top of the building's amplitude divided by the ground's amplitude.
export function transmissibility(r, zeta) {
  const d = (2 * zeta * r) ** 2;
  return Math.sqrt((1 + d) / ((1 - r * r) ** 2 + d));
}
export const response = (f, n, zeta) => transmissibility(f / naturalFreq(n), zeta);
// Phase lag of the building behind the ground.
export const lag = (r, zeta) => Math.atan2(2 * zeta * r ** 3, 1 - r * r + (2 * zeta * r) ** 2) ;
