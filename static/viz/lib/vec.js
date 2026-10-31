// Small 2D and 3D vector helpers on plain arrays. Pure functions, every call returns a new array.
const make = () => ({
  add: (a, b) => a.map((x, i) => x + b[i]),
  sub: (a, b) => a.map((x, i) => x - b[i]),
  scale: (a, k) => a.map((x) => x * k),
  dot: (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0),
  norm: (a) => Math.hypot(...a),
  unit: (a) => {
    const size = Math.hypot(...a);
    return size === 0 ? a.map(() => 0) : a.map((x) => x / size);
  },
  lerp: (a, b, t) => a.map((x, i) => x + (b[i] - x) * t),
  dist: (a, b) => Math.hypot(...a.map((x, i) => x - b[i])),
});

export const v2 = { ...make(), perp: ([x, y]) => [-y, x], cross: (a, b) => a[0] * b[1] - a[1] * b[0] };
export const v3 = {
  ...make(),
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
};
