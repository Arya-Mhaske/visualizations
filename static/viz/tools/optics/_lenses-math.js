// Maths for the lenses box. Cartesian signs as in NCERT: light travels along +x, distances from the lens are positive to the right.
import { refract, hitCircle, axisCrossing } from '../../lib/rays.js';

// One spherical surface between n1 (left) and n2 (right), centre of curvature at x = R. Image distance for an object at u:
//   n2 / v - n1 / u = (n2 - n1) / R
export const surfaceImage = (n1, n2, R, u) => {
  const rhs = (n2 - n1) / R + n1 / u;
  return rhs === 0 ? Infinity : n2 / rhs;
};
// The surface's focal length when the object is at infinity: v = n2 R / (n2 - n1).
export const surfaceFocus = (n1, n2, R) => (n2 * R) / (n2 - n1);

// Thin lens, glass index n in air. 1/f = (n - 1)(1/R1 - 1/R2); 1/v - 1/u = 1/f.
export const makerPower = (n, R1, R2) => (n - 1) * (1 / R1 - 1 / R2);
export const lensImage = (f, u) => {
  const inv = 1 / f + 1 / u;
  return inv === 0 ? Infinity : 1 / inv;
};
export const magnification = (v, u) => v / u;

// Two surfaces in turn: the image from the first is the object of the second (lenses thin: no gap between them).
export function twoSurfaces(n, R1, R2, u = -Infinity) {
  const v1 = surfaceImage(1, n, R1, u);
  const v2 = surfaceImage(n, 1, R2, v1);
  return { v1, v2 };
}

// Exact rays through a thick lens: vertex of surface 1 at x = -t/2, vertex of surface 2 at x = +t/2.
// Returns the path [[x, y], ...] of a ray that starts at (xs, y) heading along +x, and the final direction.
export function traceLens({ n, R1, R2, t = 0.1 }, y, xs = -3) {
  let p = [xs, y];
  let d = [1, 0];
  const path = [p];
  const surfaces = [
    { centre: [-t / 2 + R1, 0], R: Math.abs(R1), n1: 1, n2: n, side: R1 },
    { centre: [t / 2 + R2, 0], R: Math.abs(R2), n1: n, n2: 1, side: R2 },
  ];
  for (const s of surfaces) {
    const ts = hitCircle(p, d, s.centre, s.R);
    if (!ts.length) return { path, d, missed: true };
    // The first surface is hit on its left-facing side if R1 > 0 (the nearest hit); for R < 0 the ray meets the far side first.
    const hit = s.side > 0 ? ts[0] : ts[ts.length - 1];
    const q = [p[0] + d[0] * hit, p[1] + d[1] * hit];
    const radial = [(q[0] - s.centre[0]) / s.R, (q[1] - s.centre[1]) / s.R];
    // normal facing the incoming ray
    const nrm = radial[0] * d[0] + radial[1] * d[1] > 0 ? [-radial[0], -radial[1]] : radial;
    const out = refract(d, nrm, s.n1, s.n2);
    if (!out) return { path, d, missed: true };
    path.push(q);
    p = q;
    d = out;
  }
  return { path, d, missed: false };
}
// Where a thin pencil of parallel rays at height y crosses the axis after the lens (a number, or null).
export function focusOfTrace(lens, y = 0.05) {
  const r = traceLens(lens, y);
  if (r.missed) return null;
  return axisCrossing(r.path[r.path.length - 1], r.d);
}

// Thin lenses in contact: powers add. P in dioptres (1/m).
export const totalPower = (powers) => powers.reduce((a, b) => a + b, 0);
// Ray transfer at a thin lens of power P (per metre): slope' = slope - y P.
export const bend = (slope, y, P) => slope - y * P;

// Eyes. Lengths in metres, powers in dioptres. The eye's retina is L = 0.0227 m behind its lens.
export const RETINA = 0.0227;
export const myopiaLens = (farPoint) => -1 / farPoint;
export const hyperLens = (nearPoint, reading = 0.25) => 1 / reading - 1 / nearPoint;
// The relaxed power of an eye with far point D (D = Infinity for a normal eye) and the power at full accommodation.
export const relaxedPower = (farPoint) => 1 / RETINA + 1 / farPoint;
export const accommodatedPower = (nearPoint) => 1 / RETINA + 1 / nearPoint;
// Where light from an object at distance s (m) comes to a focus behind a lens of power P at the eye: v = 1 / (P - 1/s).
export const focusBehind = (P, s) => {
  const inv = P - 1 / s;
  return inv <= 0 ? Infinity : 1 / inv;
};
