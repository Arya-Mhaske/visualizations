// Maths for the Waves & Oscillations box (Trigonometry). Pure functions, so they can be tested.
export const TAU = Math.PI * 2;

// Spring and spinning point: the mass is the point's shadow on the vertical axis.
export const spinner = (A, omega, t) => [A * Math.cos(omega * t), A * Math.sin(omega * t)];
export const mass = (A, omega, t) => A * Math.sin(omega * t);

// Two waves added at each x (addition of ordinates).
export const sumWave = (A1, f1, A2, f2, phase2 = 0) => (x) => A1 * Math.sin(TAU * f1 * x) + A2 * Math.sin(TAU * f2 * x + phase2);

// Beats: sin(2 pi f1 t) + sin(2 pi f2 t) = 2 cos(pi (f1 - f2) t) sin(pi (f1 + f2) t)
export const beatEnvelope = (f1, f2) => (t) => 2 * Math.cos(Math.PI * (f1 - f2) * t);
export const beatCarrier = (f1, f2) => (t) => Math.sin(Math.PI * (f1 + f2) * t);
export const beatRate = (f1, f2) => Math.abs(f1 - f2);

// Damping: the decaying curve is the boundary of the wave.
export const damped = (A, gamma, omega) => (t) => A * Math.exp(-gamma * t) * Math.sin(omega * t);
export const envelope = (A, gamma) => (t) => A * Math.exp(-gamma * t);
export const halfLife = (gamma) => Math.LN2 / gamma;

// Driven, damped oscillator: steady amplitude relative to the amplitude of a very slow push.
// x'' + 2 zeta w0 x' + w0^2 x = F cos(w t): amplitude = F / sqrt((w0^2 - w^2)^2 + (2 zeta w0 w)^2)
export const driveGain = (w, w0, zeta) => (w0 * w0) / Math.hypot(w0 * w0 - w * w, 2 * zeta * w0 * w);
export const peakFreq = (w0, zeta) => (zeta < Math.SQRT1_2 ? w0 * Math.sqrt(1 - 2 * zeta * zeta) : 0);

// The transient of the same oscillator, started from rest by a push at w: build-up in time.
// Closed form for the lightly damped case, used for a picture of amplitude growing: envelope 1 - exp(-zeta w0 t) when w = w0.
export const buildUp = (zeta, w0) => (t) => 1 - Math.exp(-zeta * w0 * t);

// Fourier series for three shapes, harmonic n (1-based), amplitude of the n-th sine.
export const SHAPES = {
  square: { name: 'Square wave', coef: (n) => (n % 2 ? 4 / (Math.PI * n) : 0), target: (x) => (Math.sin(x) >= 0 ? 1 : -1) },
  saw: { name: 'Sawtooth', coef: (n) => (2 * (n % 2 ? 1 : -1)) / (Math.PI * n), target: (x) => { const u = ((x + Math.PI) % TAU + TAU) % TAU - Math.PI; return u / Math.PI; } },
  triangle: { name: 'Triangle wave', coef: (n) => (n % 2 ? (8 / (Math.PI * Math.PI * n * n)) * (((n - 1) / 2) % 2 ? -1 : 1) : 0), target: (x) => { const u = ((x + Math.PI / 2) % TAU + TAU) % TAU; return u < Math.PI ? -1 + (2 * u) / Math.PI : 3 - (2 * u) / Math.PI; } },
};
export const partialSum = (shape, N) => (x) => {
  let s = 0;
  for (let n = 1; n <= N; n++) s += SHAPES[shape].coef(n) * Math.sin(n * x);
  return s;
};

// Pitch and period.
export const periodMs = (f) => 1000 / f;
export const NOTES = [['A2', 110], ['C3', 130.81], ['E3', 164.81], ['A3', 220], ['C4', 261.63], ['A4', 440], ['A5', 880]];

// A cylinder bobbing in water: restoring force rho g A x.
export const RHO_WATER = 1000;
export const G = 9.8;
export const bobPeriod = (m, area) => TAU * Math.sqrt(m / (RHO_WATER * G * area));
export const massFromPeriod = (T, area) => (RHO_WATER * G * area * T * T) / (TAU * TAU);

// Mains: I = A sin(B t), B = 2 pi f.
export const mainsB = (f) => TAU * f;
export const cyclesPerSecond = (B) => B / TAU;

// Electromagnetic spectrum, c = lambda f.
export const C_LIGHT = 3e8;
export const wavelength = (f) => C_LIGHT / f;
export const BANDS = [
  ['Radio', 3, 9], ['Micro', 9, 12], ['Infrared', 12, 14.6], ['Visible', 14.6, 14.9], ['UV', 14.9, 17], ['X-ray', 17, 19.5], ['Gamma', 19.5, 21],
];
export const bandAt = (logf) => (BANDS.find(([, a, b]) => logf >= a && logf < b) || BANDS[BANDS.length - 1])[0];

// Water waves: speed from the picture, and the deep-water law as a comparison.
export const waveSpeed = (lambda, T) => lambda / T;
export const deepSpeed = (lambda) => Math.sqrt((G * lambda) / TAU);
export const deepPeriod = (lambda) => lambda / deepSpeed(lambda);

// Predator and prey as two sines a fraction of a cycle apart.
export const prey = (t, P, mean, amp) => mean + amp * Math.sin((TAU * t) / P);
export const predator = (t, P, mean, amp, lag) => mean + amp * Math.sin((TAU * (t - lag * P)) / P);

// x'' + 2 zeta w0 x' + w0^2 x = w0^2 cos(w t), started from rest (RK4). Returns [[t, x], ...] every `every` steps.
export function drivenRun(w, w0, zeta, T, dt = 0.002, every = 10) {
  const f = (t, x, v) => [v, w0 * w0 * Math.cos(w * t) - 2 * zeta * w0 * v - w0 * w0 * x];
  let [t, x, v] = [0, 0, 0];
  const out = [[0, 0]];
  const n = Math.round(T / dt);
  for (let i = 1; i <= n; i++) {
    const [a1, b1] = f(t, x, v);
    const [a2, b2] = f(t + dt / 2, x + (dt / 2) * a1, v + (dt / 2) * b1);
    const [a3, b3] = f(t + dt / 2, x + (dt / 2) * a2, v + (dt / 2) * b2);
    const [a4, b4] = f(t + dt, x + dt * a3, v + dt * b3);
    x += (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);
    v += (dt / 6) * (b1 + 2 * b2 + 2 * b3 + b4);
    t += dt;
    if (i % every === 0) out.push([t, x]);
  }
  return out;
}
