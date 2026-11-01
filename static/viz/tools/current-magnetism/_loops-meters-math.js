// Maths for the loops-meters box. SI units. A loop round the x axis uses the Biot-Savart helpers of the sources box.
import { MU0, sumField, loopPieces, cross, norm } from './_sources-of-magnetic-field-math.js';

export const dipoleMoment = (N, I, A) => N * I * A;

// The ideal dipole field of a moment m along +x, at (x, y, 0), as [Bx, By].
export function dipoleField(m, x, y) {
  const r = Math.hypot(x, y);
  const k = (MU0 / (4 * Math.PI)) / r ** 3;
  const dotp = (m * x) / r; // m . r_hat
  return [k * (3 * dotp * (x / r) - m), k * (3 * dotp * (y / r))];
}
// The field of a ring of radius R (current I, round the x axis, current running y -> z), at (x, y, 0).
export function loopFieldAt(I, R, x, y, n = 90) {
  const B = sumField(I, loopPieces(R, n, 0), [x, y, 0]);
  return [B[0], B[1]];
}
export const angleBetween = (a, b) => {
  const c = (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b));
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
};

// Rectangular loop a (along y) by b (along d), normal n at angle theta (degrees) to B = B x_hat; n = (cos, 0, sin).
// Corners are labelled round the loop; I runs round it so that n = d_hat... see forces().
export function forces(I, a, b, thetaDeg, B) {
  const t = (thetaDeg * Math.PI) / 180;
  const d = [-Math.sin(t), 0, Math.cos(t)]; // along the horizontal sides
  const yv = [0, 1, 0];
  const Bv = [B, 0, 0];
  const half = [(a / 2), (b / 2)];
  // Current runs -y on the +d side, +d along the top, +y on the -d side and -d along the bottom,
  // so the moment m = I a b n points along n = y x d = (cos, 0, sin).
  const sides = [
    { name: 'right side', dir: yv.map((x) => -x), len: a, at: d.map((x) => x * half[1]) },
    { name: 'top side', dir: d, len: b, at: [0, half[0], 0] },
    { name: 'left side', dir: yv, len: a, at: d.map((x) => -x * half[1]) },
    { name: 'bottom side', dir: d.map((x) => -x), len: b, at: [0, -half[0], 0] },
  ];
  return sides.map((s) => {
    const F = cross(s.dir, Bv).map((x) => I * s.len * x);
    return { ...s, F };
  });
}
export const netForce = (list) => list.reduce((s, f) => [s[0] + f.F[0], s[1] + f.F[1], s[2] + f.F[2]], [0, 0, 0]);
export const netTorque = (list) => list.reduce((s, f) => {
  const t = cross(f.at, f.F);
  return [s[0] + t[0], s[1] + t[1], s[2] + t[2]];
}, [0, 0, 0]);
export const torqueSize = (m, B, thetaDeg) => m * B * Math.sin((thetaDeg * Math.PI) / 180);
export const energy = (m, B, thetaDeg) => -m * B * Math.cos((thetaDeg * Math.PI) / 180);
export { norm };

// The galvanometer and its conversions.
export const G_COIL = 50; // Ω
export const I_FULL = 0.002; // A for full-scale deflection
export const shunt = (G, Ig, I) => (Ig * G) / (I - Ig);
export const seriesR = (G, Ig, V) => V / Ig - G;
export const ammeterResistance = (G, S) => (G * S) / (G + S);
export const voltmeterResistance = (G, R) => G + R;

// Moving-coil meter: k phi = N I A B.
export const deflection = (N, I, A, B, k) => (N * I * A * B) / k;
