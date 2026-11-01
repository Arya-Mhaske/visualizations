// Pure maths for the Lines & Planes box (no DOM). Checked by catalogue/tool_tests/test_vectors_3d_lines_planes.py.
import { cross, dot, norm } from './_cross-product-math.js';
export { cross, dot, norm };
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const scale = (a, k) => a.map((v) => v * k);

// A plane n·(r − p) = 0, i.e. n·r = d with d = n·p.
export const planeD = (n, p) => dot(n, p);
// Signed distance from point q to plane n·r = d.
export const planeDist = (n, d, q) => (dot(n, q) - d) / norm(n);
export const footOnPlane = (n, d, q) => sub(q, scale(n, (dot(n, q) - d) / dot(n, n)));

// Lines r = a + s u and r = b + t v. Closest pair of points by the two perpendicular conditions.
export function closest(a, u, b, v) {
  const w = sub(a, b);
  const [uu, uv, vv, uw, vw] = [dot(u, u), dot(u, v), dot(v, v), dot(u, w), dot(v, w)];
  const den = uu * vv - uv * uv;
  if (Math.abs(den) < 1e-12) return null; // parallel
  const s = (uv * vw - vv * uw) / den;
  const t = (uu * vw - uv * uw) / den;
  const p = add(a, scale(u, s));
  const q = add(b, scale(v, t));
  return { s, t, p, q, dist: norm(sub(p, q)) };
}
// The formula |(b − a)·(u × v)| / |u × v|, for skew lines.
export const skewDistance = (a, u, b, v) => {
  const n = cross(u, v);
  return norm(n) < 1e-12 ? null : Math.abs(dot(sub(b, a), n)) / norm(n);
};
// Two lines meet, are parallel, or are skew.
export function relation(a, u, b, v) {
  const n = cross(u, v);
  if (norm(n) === 0) return 'parallel';
  return dot(sub(b, a), n) === 0 ? 'meet' : 'skew';
}
// Angle between lines with direction ratios u, v: cos θ = |u·v|/(|u||v|), in degrees.
export const lineAngle = (u, v) => (Math.acos(Math.min(1, Math.abs(dot(u, v)) / (norm(u) * norm(v)))) * 180) / Math.PI;

// Tetrahedron: outward area vectors of the four faces sum to zero.
export function tetra(A, B, C, D) {
  const half = (p, q, r) => scale(cross(sub(q, p), sub(r, p)), 0.5);
  const centre = scale(add(add(A, B), add(C, D)), 0.25);
  const face = (p, q, r) => {
    const s = half(p, q, r);
    return dot(s, sub(scale(add(add(p, q), r), 1 / 3), centre)) < 0 ? scale(s, -1) : s;
  };
  const faces = [face(B, C, D), face(A, C, D), face(A, B, D), face(A, B, C)];
  const total = faces.reduce((acc, f) => add(acc, f), [0, 0, 0]);
  const volume = Math.abs(dot(sub(B, A), cross(sub(C, A), sub(D, A)))) / 6;
  return { faces, total, volume };
}
