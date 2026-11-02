// Maths for the Polar & Complex box. Angles in degrees at the interface, radians inside.
export const TAU = Math.PI * 2;
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
const clean = (x) => (Math.abs(x) < 1e-12 ? 0 : x);

export const toRect = (r, thD) => [clean(r * Math.cos(rad(thD))), clean(r * Math.sin(rad(thD)))];
export const toPolar = ([x, y]) => ({ r: Math.hypot(x, y), thD: (deg(Math.atan2(y, x)) + 360) % 360 });
// Other names for the same point: add whole turns, or flip r and add a half turn.
export const otherName = (r, thD, turns, flip) => ({ r: flip ? -r : r, thD: thD + 360 * turns + (flip ? 180 : 0) });

// Complex numbers as [re, im].
export const cmul = (z, w) => [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]];
export const cdiv = (z, w) => { const d = w[0] * w[0] + w[1] * w[1]; return [(z[0] * w[0] + z[1] * w[1]) / d, (z[1] * w[0] - z[0] * w[1]) / d]; };
export const cpow = (z, n) => { let out = [1, 0]; for (let i = 0; i < n; i++) out = cmul(out, z); return out; };
export const polarMul = (r1, t1, r2, t2) => ({ r: r1 * r2, thD: t1 + t2 });
export const deMoivre = (r, thD, n) => ({ r: r ** n, thD: n * thD });
export const nthRoots = (R, phiD, n) => Array.from({ length: n }, (_, k) => ({ r: R ** (1 / n), thD: (phiD + 360 * k) / n }));

// i^n cycles through 1, i, -1, -i.
export const iPower = (n) => [[1, 0], [0, 1], [-1, 0], [0, -1]][((n % 4) + 4) % 4];

// Polar curves as r(theta) for theta in radians. Each returns r or NaN where undefined.
export const CURVES = {
  circle: { name: 'Circle  r = a', r: (t, p) => p.a, span: TAU, tex: (p) => `r=${p.a}` },
  cardioid: { name: 'Cardioid  r = a(1 + cos θ)', r: (t, p) => p.a * (1 + Math.cos(t)), span: TAU, tex: (p) => `r=${p.a}(1+\\cos\\theta)` },
  limacon: { name: 'Limaçon  r = b + a cos θ', r: (t, p) => p.b + p.a * Math.cos(t), span: TAU, tex: (p) => `r=${p.b}+${p.a}\\cos\\theta` },
  spiral: { name: 'Spiral  r = aθ ÷ 2π', r: (t, p) => (p.a * t) / TAU, span: 2 * TAU, tex: (p) => `r=\\dfrac{${p.a}\\theta}{2\\pi}` },
  lemniscate: { name: 'Lemniscate  r² = a² cos 2θ', r: (t, p) => { const v = Math.cos(2 * t); return v >= 0 ? p.a * Math.sqrt(v) : NaN; }, span: TAU, both: true, tex: (p) => `r^2=${p.a}^2\\cos 2\\theta` },
  rose: { name: 'Rose  r = a cos nθ', r: (t, p) => p.a * Math.cos(p.n * t), span: TAU, tex: (p) => `r=${p.a}\\cos ${p.n}\\theta` },
};
export const rosePetals = (n) => (n % 2 ? n : 2 * n);
export const roseTurn = (n) => (n % 2 ? 180 : 360); // degrees of theta needed to finish the curve

// Sample a curve into polylines of [x, y]; a gap (NaN) starts a new piece. both: also draw the -r branch.
export function samplePolar(rOf, span, n = 720, both = false) {
  const pieces = [];
  let piece = [];
  const push = (sign, t) => {
    const r = rOf(t);
    if (!Number.isFinite(r)) { if (piece.length) pieces.push(piece); piece = []; return; }
    piece.push([sign * r * Math.cos(t), sign * r * Math.sin(t)]);
  };
  for (let i = 0; i <= n; i++) push(1, (span * i) / n);
  if (piece.length) pieces.push(piece);
  piece = [];
  if (both) {
    for (let i = 0; i <= n; i++) push(-1, (span * i) / n);
    if (piece.length) pieces.push(piece);
  }
  return pieces;
}

// Orbit r = a(1 - e^2) / (1 + e cos theta), with the Sun at the origin (a focus).
export const orbitR = (a, e, tD) => (a * (1 - e * e)) / (1 + e * Math.cos(rad(tD)));
export const perihelion = (a, e) => a * (1 - e);
export const aphelion = (a, e) => a * (1 + e);
export const semiMinor = (a, e) => a * Math.sqrt(1 - e * e);
export const PLANETS = [['Earth', 0.017], ['Mars', 0.093], ['Mercury', 0.206], ['Pluto', 0.25], ['Halley', 0.95]];

// Polar equations and the rectangular equation they match: a point on the curve, and the residual of the rectangular form.
export const PRESETS = [
  { name: 'r = 3', r: () => 3, from: 0, to: TAU, rect: 'x^2+y^2=9', resid: (x, y) => x * x + y * y - 9, tex: 'r=3' },
  { name: 'θ = π/4', theta: Math.PI / 4, rect: 'y=x', resid: (x, y) => y - x, tex: '\\theta=\\dfrac{\\pi}{4}' },
  { name: 'r cos θ = 2', r: (t) => 2 / Math.cos(t), from: -1.3, to: 1.3, rect: 'x=2', resid: (x) => x - 2, tex: 'r\\cos\\theta=2' },
  { name: 'r = 4 cos θ', r: (t) => 4 * Math.cos(t), from: -Math.PI / 2, to: Math.PI / 2, rect: '(x-2)^2+y^2=4', resid: (x, y) => (x - 2) ** 2 + y * y - 4, tex: 'r=4\\cos\\theta' },
  { name: 'r = 4 sin θ', r: (t) => 4 * Math.sin(t), from: 0, to: Math.PI, rect: 'x^2+(y-2)^2=4', resid: (x, y) => x * x + (y - 2) ** 2 - 4, tex: 'r=4\\sin\\theta' },
  { name: 'r(1 − cos θ) = 2', r: (t) => 2 / (1 - Math.cos(t)), from: 0.9, to: TAU - 0.9, rect: 'y^2=4x+4', resid: (x, y) => y * y - 4 * x - 4, tex: 'r(1-\\cos\\theta)=2' },
];
// A point of a preset at position s in [0, 1] along it, as [x, y].
export function presetPoint(preset, s) {
  if (preset.theta !== undefined) { const r = -7 + 14 * s; return [r * Math.cos(preset.theta), r * Math.sin(preset.theta)]; }
  const t = preset.from + (preset.to - preset.from) * s;
  const r = preset.r(t);
  return [r * Math.cos(t), r * Math.sin(t)];
}
