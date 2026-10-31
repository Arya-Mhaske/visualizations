// Pure maths for the 3D Coordinates box (no DOM). Checked by catalogue/tool_tests/test_vectors_3d_coordinates.py.
export const floorDiagonal = (x, y) => Math.hypot(x, y);
export const distance3 = (x, y, z) => Math.hypot(x, y, z);
export const regions = (planes) => 2 ** planes;

const ROMAN = { '+++': 'I', '-++': 'II', '--+': 'III', '+-+': 'IV', '++-': 'V', '-+-': 'VI', '---': 'VII', '+--': 'VIII' };
export const signs = (x, y, z) => [x, y, z].map((v) => (v < 0 ? '-' : '+')).join('');
export const octant = (x, y, z) => ROMAN[signs(x, y, z)];

// (x − a)² + (y − b)² + (z − c)² = r²  expands to  x² + y² + z² + Dx + Ey + Fz + G = 0.
export const expandSphere = (a, b, c, r) => ({
  D: -2 * a, E: -2 * b, F: -2 * c, G: a * a + b * b + c * c - r * r,
});
export function readSphere({ D, E, F, G }) {
  const [a, b, c] = [-D / 2, -E / 2, -F / 2];
  return { a, b, c, r: Math.sqrt(a * a + b * b + c * c - G) };
}
