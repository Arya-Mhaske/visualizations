// Maths for the magnetic-force-on-charges box. SI unless a function says otherwise.
export const Q_E = 1.6e-19; // C
export const M_E = 9.11e-31; // kg
export const M_P = 1.67e-27; // kg
export const SPECIES = {
  electron: { name: 'Electron', q: -Q_E, m: M_E },
  proton: { name: 'Proton', q: Q_E, m: M_P },
};

export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const force = (q, v, B) => cross(v, B).map((x) => q * x);

// A charge going round in B: r = mv/|q|B, T = 2πm/|q|B, and T does not depend on v.
export const gyroRadius = (m, q, v, B) => (m * v) / (Math.abs(q) * B);
export const gyroPeriod = (m, q, B) => (2 * Math.PI * m) / (Math.abs(q) * B);
export const gyroFreq = (m, q, B) => (Math.abs(q) * B) / m;

// Velocity at angle theta (degrees) to B: v_par along B, v_perp across it.
export const split = (v, thetaDeg) => ({
  par: v * Math.cos((thetaDeg * Math.PI) / 180),
  perp: v * Math.sin((thetaDeg * Math.PI) / 180),
});
export const pitch = (m, q, B, vPar) => vPar * gyroPeriod(m, q, B);

// Length with a sensible unit.
export function lengthText(metres) {
  const a = Math.abs(metres);
  if (a >= 1000) return `${(metres / 1000).toPrecision(3)} km`;
  if (a >= 1) return `${metres.toPrecision(3)} m`;
  if (a >= 1e-3) return `${(metres * 1e3).toPrecision(3)} mm`;
  if (a >= 1e-6) return `${(metres * 1e6).toPrecision(3)} μm`;
  return `${(metres * 1e9).toPrecision(3)} nm`;
}
export function timeText(s) {
  const a = Math.abs(s);
  if (a >= 1) return `${s.toPrecision(3)} s`;
  if (a >= 1e-3) return `${(s * 1e3).toPrecision(3)} ms`;
  if (a >= 1e-6) return `${(s * 1e6).toPrecision(3)} μs`;
  return `${(s * 1e9).toPrecision(3)} ns`;
}

// Mirror motion: a particle spiralling into stronger field. B(z) = B0 (1 + k z²) along z.
// v_perp² / B is constant (the magnetic moment), and speed is constant, so v_par² = v² − v_perp0² B(z)/B0.
export function mirrorPath({ v, thetaDeg, k, steps = 4000, dt = 0.004 }) {
  const { par, perp } = split(v, thetaDeg);
  const out = [];
  let z = 0;
  let dir = 1;
  let phase = 0;
  for (let i = 0; i < steps; i++) {
    const ratio = 1 + k * z * z;
    const vPar2 = v * v - perp * perp * ratio;
    const vPerp = Math.sqrt(Math.max(0, Math.min(v * v, perp * perp * ratio)));
    if (vPar2 <= 0) dir = -dir; // turned back: the mirror point
    const vPar = Math.sqrt(Math.max(vPar2, 0));
    const r = vPerp / ratio / 1; // gyro radius = v_perp / (q B / m) with B = B0 ratio, B0 = 1
    out.push({ z, r, phase, vPar: dir * vPar, vPerp, B: ratio });
    z += dir * Math.max(vPar, 0.02 * v) * dt;
    phase += ratio * dt; // ω = qB/m = B
  }
  return out;
}
export const mirrorPoint = (thetaDeg, k) => {
  const s = Math.sin((thetaDeg * Math.PI) / 180);
  return s === 0 ? Infinity : Math.sqrt((1 / (s * s) - 1) / k);
};
