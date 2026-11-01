// Pure maths for the Cross Product box (no DOM). Checked by catalogue/tool_tests/test_vectors_3d_cross_product.py.
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]].map((v) => v + 0);
export const neg = (a) => a.map((v) => -v + 0);
// |a||b| sin θ, from the angle between the arrows (0 to 180°).
export const angleBetween = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (norm(a) * norm(b)))));
export const areaFromSin = (a, b) => norm(a) * norm(b) * Math.sin(angleBetween(a, b));
export const triple = (a, b, c) => dot(a, cross(b, c));
// Torque r × F, and its size r F sin θ.
export const torque = (r, f) => cross(r, f);
// Turn a vector about the z axis (the pair is turned together, to show a × b turns with them).
export const spinZ = (v, t) => [v[0] * Math.cos(t) - v[1] * Math.sin(t), v[0] * Math.sin(t) + v[1] * Math.cos(t), v[2]];
