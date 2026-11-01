// Maths for the magnetism-matter box. Pure numbers, no DOM.
import { MU0 } from './_sources-of-magnetic-field-math.js';

// A uniformly magnetised ball of radius 1 with its moment along +x: B = 1 inside, an ideal dipole outside.
// Field in the (x, y) plane, in units where B inside = 1 and the dipole constant mu0 m / 4 pi = 1/2.
export const BALL_K = 0.5;
export function ballField(x, y, cx = 0) {
  const X = x - cx;
  const r = Math.hypot(X, y);
  if (r < 1) return [1, 0];
  const dotp = X / r; // m_hat . r_hat
  return [BALL_K * (3 * dotp * (X / r) - 1) / r ** 3, BALL_K * (3 * dotp * (y / r)) / r ** 3];
}
// A point "charge" for comparison: B = r_hat / r^2 from a source at (px, 0).
export function monopoleField(x, y, px) {
  const dx = x - px;
  const r = Math.hypot(dx, y);
  return [dx / r ** 3, y / r ** 3];
}

// Flux through a sphere of radius R centred at (cx, 0) on the axis, from a field function f(x, y) -> [Bx, By] (axisymmetric about x).
// Returns the flux divided by 4π, and the outward normal component at n samples round the circle.
export function sphereFlux(f, cx, R, n = 720) {
  let total = 0;
  const samples = [];
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI;
    const nx = Math.cos(a);
    const ny = Math.sin(a);
    const B = f(cx + R * nx, R * ny);
    const Bn = B[0] * nx + B[1] * ny;
    samples.push({ a, Bn });
    total += Bn * Math.sin(a) * (Math.PI / n) * R * R * 2 * Math.PI;
  }
  return { flux: total / (4 * Math.PI), samples };
}

// Spin-1/2 paramagnet: the fraction aligned is tanh(mu B / k T).
export const MU_B = 9.274e-24; // J/T
export const K_B = 1.381e-23; // J/K
export const aligned = (B, T) => Math.tanh((MU_B * B) / (K_B * T));
export const CURIE_T = 1043; // K, iron
export const spontaneous = (T) => (T >= CURIE_T ? 0 : (1 - T / CURIE_T) ** 0.35);

export const MATERIALS = {
  bismuth: { name: 'Bismuth (diamagnetic)', chi: -1.7e-4 },
  aluminium: { name: 'Aluminium (paramagnetic)', chi: 2.2e-5 },
  iron: { name: 'Iron (ferromagnetic)', chi: 5000 },
};

// Dipole in a uniform field: theta'' = -(m B / I) sin(theta).
export const smallPeriod = (m, B, I) => 2 * Math.PI * Math.sqrt(I / (m * B));
export const dipoleEnergy = (m, B, thetaDeg) => -m * B * Math.cos((thetaDeg * Math.PI) / 180);

// Magnet over a superconductor (image-dipole model): F = 3 mu0 m^2 / (32 pi h^4), weight M g.
export const G_ACC = 9.8;
export const lift = (m, h) => (3 * MU0 * m * m) / (32 * Math.PI * h ** 4);
export const floatHeight = (m, M) => ((3 * MU0 * m * m) / (32 * Math.PI * M * G_ACC)) ** 0.25;
