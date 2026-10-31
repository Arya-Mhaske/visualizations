// Pure maths for the Simple Pendulum box (no DOM).
// Checked by catalogue/tool_tests/test_oscillations_waves_the_simple_pendulum.py.
// Angles are in radians unless a name ends in Deg. g = 9.8 m/s², the value NCERT uses.
export const TAU = Math.PI * 2;
export const G = 9.8;
export const toRad = (deg) => (deg * Math.PI) / 180;

// ---- Periods ------------------------------------------------------------------------------------
export const smallPeriod = (L, g = G) => TAU * Math.sqrt(L / g);

// Arithmetic–geometric mean, which gives the complete elliptic integral K(k) = π / (2 AGM(1, √(1−k²))).
export function agm(a, b) {
  for (let i = 0; i < 40 && Math.abs(a - b) > 1e-15 * a; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return a;
}
export const ellipticK = (k) => Math.PI / (2 * agm(1, Math.sqrt(1 - k * k)));
// Exact period for a swing of amplitude A (rad): T = 4 √(L/g) K(sin(A/2)).
export const exactPeriod = (L, A, g = G) => 4 * Math.sqrt(L / g) * ellipticK(Math.sin(A / 2));
// Exact period divided by the small-angle period, which depends on A alone.
export const ratio = (A) => exactPeriod(1, A, 1) / TAU;
// The series T/T₀ = 1 + A²/16 + 11A⁴/3072 + …, cut after `terms` corrections (0, 1 or 2).
export const seriesRatio = (A, terms) => 1 + (terms >= 1 ? (A * A) / 16 : 0) + (terms >= 2 ? (11 * A ** 4) / 3072 : 0);

export const lengthFor = (T, g = G) => (g * T * T) / (TAU * TAU);
export const gFrom = (L, T) => (TAU * TAU * L) / (T * T);

// ---- The restoring force --------------------------------------------------------------------------
export const restoring = (m, g, theta) => m * g * Math.sin(theta); // what really pulls the bob back along the arc
export const linearForce = (m, g, theta) => m * g * theta; // what an ideal SHM spring would give
// How far the small-angle force is from the real one, as a fraction of the real one.
export const forceGap = (theta) => (theta - Math.sin(theta)) / Math.sin(theta);

// ---- Timing swings with a stopwatch -----------------------------------------------------------------
// N full swings take N·T, plus whatever your thumbs add at the start and stop (err seconds in all).
export function stopwatch({ L, A, N, err, g = G }) {
  const T = exactPeriod(L, A, g);
  const shown = N * T + err;
  const measured = shown / N;
  return { T, shown, measured, g: gFrom(L, measured), error: gFrom(L, measured) / g - 1 };
}

// ---- Integrating the swing --------------------------------------------------------------------------
// θ'' = −(m g sin θ)/(m L) − b θ' by RK4, released at rest from angle A. Mass is written out so it can cancel.
// Returns samples every dt: theta, omega and energy as a fraction of the starting energy.
export function swing({ L, A, g = G, m = 1, b = 0, span = 16, dt = 1 / 200 }) {
  const acc = (th, w) => -(m * g * Math.sin(th)) / (m * L) - b * w;
  const energy = (th, w) => (0.5 * L * L * w * w + g * L * (1 - Math.cos(th))) / (g * L * (1 - Math.cos(A)));
  const theta = [A];
  const omega = [0];
  const fraction = [1];
  let [th, w] = [A, 0];
  for (let i = 1; i <= Math.round(span / dt); i++) {
    const k1t = w; const k1w = acc(th, w);
    const k2t = w + (dt / 2) * k1w; const k2w = acc(th + (dt / 2) * k1t, k2t);
    const k3t = w + (dt / 2) * k2w; const k3w = acc(th + (dt / 2) * k2t, k3t);
    const k4t = w + dt * k3w; const k4w = acc(th + dt * k3t, k4t);
    th += (dt / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
    w += (dt / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
    theta.push(th);
    omega.push(w);
    fraction.push(energy(th, w));
  }
  return { dt, theta, omega, fraction };
}

// Linear interpolation of one of the arrays above at time t.
export function at(samples, dt, t) {
  const i = Math.max(0, Math.min(samples.length - 2, Math.floor(t / dt)));
  const f = t / dt - i;
  return samples[i] * (1 - f) + samples[i + 1] * f;
}

// Time the swing first passes θ = 0 is a quarter period. Used to check the integrator against exactPeriod.
export function measuredPeriod(run) {
  const { theta, dt } = run;
  for (let i = 1; i < theta.length; i++) {
    if (theta[i] <= 0) return 4 * dt * (i - 1 + theta[i - 1] / (theta[i - 1] - theta[i]));
  }
  return NaN;
}

// ---- Damping ---------------------------------------------------------------------------------------
// With θ'' = −ω₀²θ − bθ' the swing's size falls as e^(−bt/2), so it halves every 2 ln 2 / b seconds.
export const halfTime = (b) => (2 * Math.LN2) / b;
export const envelope = (A, b, t) => A * Math.exp((-b * t) / 2);
