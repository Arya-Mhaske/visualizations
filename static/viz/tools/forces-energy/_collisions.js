// Pure maths for the Collisions box. e = coefficient of restitution (1 elastic, 0 sticky).
export function coll(m1, u1, m2, u2, e) {
  const p = m1 * u1 + m2 * u2;
  return [(p + m2 * e * (u2 - u1)) / (m1 + m2), (p + m1 * e * (u1 - u2)) / (m1 + m2)];
}
export const ke = (m1, v1, m2, v2) => 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
export const lostFraction = (A) => (4 * A) / (1 + A) ** 2;
