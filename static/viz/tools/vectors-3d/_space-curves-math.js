// Pure maths for the Space Curves & Motion box (no DOM). Checked by catalogue/tool_tests/test_vectors_3d_space_curves.py.
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const scale = (a, k) => a.map((v) => v * k);
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const unit = (a) => scale(a, 1 / norm(a));

// Curves with exact r, r', r''.
export const CURVES = {
  helix: {
    name: 'Helix',
    r: (t) => [3 * Math.cos(t), 3 * Math.sin(t), 0.4 * t],
    v: (t) => [-3 * Math.sin(t), 3 * Math.cos(t), 0.4],
    a: (t) => [-3 * Math.cos(t), -3 * Math.sin(t), 0],
    range: [-2 * Math.PI, 2 * Math.PI],
  },
  spiral: {
    name: 'Cone spiral',
    r: (t) => [0.5 * t * Math.cos(t) / 2, 0.5 * t * Math.sin(t) / 2, 0.35 * t],
    v: (t) => [0.25 * (Math.cos(t) - t * Math.sin(t)), 0.25 * (Math.sin(t) + t * Math.cos(t)), 0.35],
    a: (t) => [0.25 * (-2 * Math.sin(t) - t * Math.cos(t)), 0.25 * (2 * Math.cos(t) - t * Math.sin(t)), 0],
    range: [0.5, 12],
  },
  bend: {
    name: 'Rising bend',
    r: (t) => [t, 2 * Math.sin(t * 0.8), 0.15 * t * t / 2],
    v: (t) => [1, 1.6 * Math.cos(t * 0.8), 0.15 * t],
    a: (t) => [0, -1.28 * Math.sin(t * 0.8), 0.15],
    range: [-4, 4],
  },
};

export const frame = (curve, t) => {
  const v = curve.v(t);
  const a = curve.a(t);
  const T = unit(v);
  const w = cross(v, a);
  const kappa = norm(w) / norm(v) ** 3;
  if (norm(w) < 1e-9) return { T, N: null, B: null, kappa: 0, v, a };
  const B = unit(w);
  const N = cross(B, T);
  return { T, N, B, kappa, v, a };
};
// a = (dv/dt) T + κ v² N
export const accelParts = (curve, t) => {
  const f = frame(curve, t);
  const speed = norm(f.v);
  return { aT: dot(f.a, f.T), aN: f.N ? dot(f.a, f.N) : 0, speed, kappa: f.kappa };
};

// Helix (a cos θ, a sin θ, b θ): speed √(a² + b²), curvature a/(a² + b²).
export const helixLength = (a, b, turns) => 2 * Math.PI * turns * Math.hypot(a, b);
export const helixKappa = (a, b) => a / (a * a + b * b);

// Braking along a helix of radius a and pitch b: arc-length speed v, rate vdot.
export const braking = (a, b, v, vdot) => {
  const kappa = helixKappa(a, b);
  return { aT: vdot, aN: kappa * v * v, total: Math.hypot(vdot, kappa * v * v), kappa };
};

// Kepler: ellipse with semi-major axis 1, eccentricity e, focus at the origin. M = E − e sin E.
export function eccentricAnomaly(M, e) {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 60; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}
export const orbitPoint = (E, e) => [Math.cos(E) - e, Math.sqrt(1 - e * e) * Math.sin(E)];
// Area swept from E1 to E2 (focus at origin): ½ ab [(E2 − E1) − e (sin E2 − sin E1)], a = 1.
export const sweptArea = (E1, E2, e) => 0.5 * Math.sqrt(1 - e * e) * ((E2 - E1) - e * (Math.sin(E2) - Math.sin(E1)));
// Anomaly after mean-anomaly M0 .. M0 + dM (fractions of a turn of M).
export const eAt = (M, e) => eccentricAnomaly(M, e);
export const speedAt = (E, e) => Math.sqrt((1 + e * Math.cos(E)) / (1 - e * Math.cos(E)));
