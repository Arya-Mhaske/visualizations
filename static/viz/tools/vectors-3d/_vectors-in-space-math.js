// Pure maths for the Vectors in Space box (no DOM). Checked by catalogue/tool_tests/test_vectors_3d_vectors_in_space.py.
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const scale = (a, k) => a.map((v) => v * k);
export const unit = (a) => (norm(a) === 0 ? null : scale(a, 1 / norm(a)));

// Direction cosines: cos of the angle with each axis. For (a, b, c) they are a/|v|, b/|v|, c/|v|.
export const dirCosines = (v) => { const u = unit(v); return u ? u.slice() : null; };
export const angleDeg = (cosine) => (Math.acos(Math.max(-1, Math.min(1, cosine))) * 180) / Math.PI;
export const cosSquareSum = (v) => { const k = dirCosines(v); return k ? k.reduce((s, x) => s + x * x, 0) : null; };

// Scalar projection of a on b = a·b/|b|; vector projection = (a·b/|b|²) b.
export const scalarProjection = (a, b) => (norm(b) === 0 ? null : dot(a, b) / norm(b));
export const vectorProjection = (a, b) => (norm(b) === 0 ? null : scale(b, dot(a, b) / dot(b, b)));
export const perpendicular = (a, b) => { const p = vectorProjection(a, b); return p ? sub(a, p) : null; };

// Section formula. R divides PQ in m : n, so PR : RQ = m : n.
// Internal: r = (n p + m q)/(m + n). External: r = (m q − n p)/(m − n), which needs m ≠ n.
export const internal = (p, q, m, n) => p.map((v, i) => (n * v + m * q[i]) / (m + n));
export const external = (p, q, m, n) => (m === n ? null : p.map((v, i) => (m * q[i] - n * v) / (m - n)));
// The usual slip: weights the wrong way round.
export const swapped = (p, q, m, n) => p.map((v, i) => (m * v + n * q[i]) / (m + n));

// Collinear: AB = λ AC for one number λ, i.e. the three component ratios agree.
export function collinear(a, b, c) {
  const ab = sub(b, a);
  const ac = sub(c, a);
  const cross = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
  const yes = cross.every((v) => v === 0);
  let lambda = null;
  if (yes) {
    const i = ac.findIndex((v) => v !== 0);
    lambda = i < 0 ? null : ab[i] / ac[i];
  }
  return { yes, lambda, ab, ac };
}
