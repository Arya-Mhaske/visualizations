// Pure maths for the Quadric Surfaces box (no DOM). Checked by catalogue/tool_tests/test_vectors_3d_quadric_surfaces.py.
// Each surface is f(x, y, z) = 0 with semi-axes (a, b, c).
export const KINDS = {
  ellipsoid: { name: 'Ellipsoid', f: (x, y, z, a, b, c) => x * x / (a * a) + y * y / (b * b) + z * z / (c * c) - 1 },
  hyper1: { name: 'Hyperboloid of one sheet', f: (x, y, z, a, b, c) => x * x / (a * a) + y * y / (b * b) - z * z / (c * c) - 1 },
  hyper2: { name: 'Hyperboloid of two sheets', f: (x, y, z, a, b, c) => -x * x / (a * a) - y * y / (b * b) + z * z / (c * c) - 1 },
  paraboloid: { name: 'Elliptic paraboloid', f: (x, y, z, a, b) => z - x * x / (a * a) - y * y / (b * b) },
  saddle: { name: 'Hyperbolic paraboloid', f: (x, y, z, a, b) => z - x * x / (a * a) + y * y / (b * b) },
  cone: { name: 'Elliptic cone', f: (x, y, z, a, b, c) => x * x / (a * a) + y * y / (b * b) - z * z / (c * c) },
};
export const implicit = (kind, [x, y, z], [a, b, c]) => KINDS[kind].f(x, y, z, a, b, c);

// Marching squares on g(u, v) = 0 over [lo, hi]²: returns segments [[u1, v1], [u2, v2]].
export function contour(g, lo, hi, n) {
  const step = (hi - lo) / n;
  const val = [];
  for (let i = 0; i <= n; i++) {
    val.push([]);
    for (let j = 0; j <= n; j++) val[i].push(g(lo + i * step, lo + j * step));
  }
  const out = [];
  const cross = (p, q, vp, vq) => {
    const t = vp / (vp - vq);
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  };
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]];
      const pts = corners.map(([p, q]) => [lo + p * step, lo + q * step]);
      const vs = corners.map(([p, q]) => val[p][q]);
      const hits = [];
      for (let k = 0; k < 4; k++) {
        const l = (k + 1) % 4;
        if ((vs[k] < 0) !== (vs[l] < 0)) hits.push(cross(pts[k], pts[l], vs[k], vs[l]));
      }
      if (hits.length === 2) out.push(hits);
      else if (hits.length === 4) { out.push([hits[0], hits[1]]); out.push([hits[2], hits[3]]); }
    }
  }
  return out;
}

// A slice by the plane  axis = k  (axis 0, 1 or 2 for x, y, z), as 3D segments.
export function slice(kind, axis, k, abc, lo, hi, n) {
  const at = (u, v) => [[k, u, v], [u, k, v], [u, v, k]][axis];
  return contour((u, v) => implicit(kind, at(u, v), abc), lo, hi, n).map(([p, q]) => [at(...p), at(...q)]);
}

const near = (x, y) => Math.abs(x - y) < 1e-9;
// What curve the slice is (the textbook name), worked out from the equation.
export function traceName(kind, axis, k, [a, b, c]) {
  const lim = [a, b, c][axis];
  if (kind === 'ellipsoid') return near(Math.abs(k), lim) ? 'a point' : Math.abs(k) < lim ? 'an ellipse' : 'nothing';
  if (kind === 'hyper1') return axis === 2 ? 'an ellipse' : near(Math.abs(k), lim) ? 'two crossing lines' : 'a hyperbola';
  if (kind === 'hyper2') {
    if (axis === 2) return near(Math.abs(k), c) ? 'a point' : Math.abs(k) > c ? 'an ellipse' : 'nothing';
    return 'a hyperbola';
  }
  if (kind === 'paraboloid') return axis === 2 ? (near(k, 0) ? 'a point' : k > 0 ? 'an ellipse' : 'nothing') : 'a parabola';
  if (kind === 'saddle') return axis === 2 ? (near(k, 0) ? 'two crossing lines' : 'a hyperbola') : 'a parabola';
  return near(k, 0) ? (axis === 2 ? 'a point' : 'two crossing lines') : axis === 2 ? 'an ellipse' : 'a hyperbola';
}

// Hyperboloid of one sheet from straight lines: (x² + y²)/a² − z²/c² = 1. The line through
// (a cos t, a sin t, 0) with direction (∓a sin t, ±a cos t, c) lies wholly on the surface.
export function ruling(a, c, t, sign, s) {
  return [a * (Math.cos(t) - sign * s * Math.sin(t)), a * (Math.sin(t) + sign * s * Math.cos(t)), c * s];
}
