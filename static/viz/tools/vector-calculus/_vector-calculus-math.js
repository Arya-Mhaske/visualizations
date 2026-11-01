// Pure maths for the whole Vector Calculus subject (no DOM). Checked by catalogue/tool_tests/test_vector_calculus_*.py.
// 2D fields are { P, Q, Px, Py, Qx, Qy } (exact partials). Paths are { r(t), d(t) } for t in [0, 1], d = dr/dt.
export const TAU = Math.PI * 2;
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const scale = (a, k) => a.map((v) => v * k);
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const norm = (a) => Math.hypot(...a);
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// Simpson's rule on [a, b] with n (even) steps.
export function simpson(f, a, b, n = 400) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

// ---- 2D fields ------------------------------------------------------------------------------------------------
const r2 = (x, y) => x * x + y * y;
export const FIELDS = {
  swirl: { name: 'Swirl', P: (x, y) => -y, Q: (x) => x, Px: () => 0, Py: () => -1, Qx: () => 1, Qy: () => 0 },
  source: { name: 'Source', P: (x) => x, Q: (x, y) => y, Px: () => 1, Py: () => 0, Qx: () => 0, Qy: () => 1, f: (x, y) => (x * x + y * y) / 2 },
  shear: { name: 'Shear', P: (x, y) => y, Q: () => 0, Px: () => 0, Py: () => 1, Qx: () => 0, Qy: () => 0 },
  saddle: { name: 'Saddle', P: (x) => x, Q: (x, y) => -y, Px: () => 1, Py: () => 0, Qx: () => 0, Qy: () => -1, f: (x, y) => (x * x - y * y) / 2 },
  stretch: { name: 'Stretch', P: (x) => x, Q: () => 0, Px: () => 1, Py: () => 0, Qx: () => 0, Qy: () => 0, f: (x) => (x * x) / 2 },
  wind: { name: 'Wind', P: (x, y) => 1 + 0.5 * Math.sin(y), Q: (x) => 0.5 * Math.cos(x), Px: () => 0, Py: (x, y) => 0.5 * Math.cos(y), Qx: (x) => -0.5 * Math.sin(x), Qy: () => 0 },
  cross: { name: 'F = (2xy, x²)', P: (x, y) => 2 * x * y, Q: (x) => x * x, Px: (x, y) => 2 * y, Py: (x) => 2 * x, Qx: (x) => 2 * x, Qy: () => 0, f: (x, y) => x * x * y },
  quad: { name: 'F = (−y², x)', P: (x, y) => -y * y, Q: (x) => x, Px: () => 0, Py: (x, y) => -2 * y, Qx: () => 1, Qy: () => 0 },
  hole: {
    name: 'F = (−y, x)/r²',
    P: (x, y) => -y / r2(x, y), Q: (x, y) => x / r2(x, y),
    Px: (x, y) => (2 * x * y) / r2(x, y) ** 2, Py: (x, y) => -(x * x - y * y) / r2(x, y) ** 2,
    Qx: (x, y) => (y * y - x * x) / r2(x, y) ** 2, Qy: (x, y) => (-2 * x * y) / r2(x, y) ** 2,
  },
};
export const vec2 = (F, x, y) => [F.P(x, y), F.Q(x, y)];
export const curl2 = (F, x, y) => F.Qx(x, y) - F.Py(x, y);
export const div2 = (F, x, y) => F.Px(x, y) + F.Qy(x, y);

// Scalar functions with exact first and second partials.
export const SCALARS = {
  bowl: { name: 'Bowl', f: (x, y) => x * x / 2 + y * y / 4, fx: (x) => x, fy: (x, y) => y / 2, fxx: () => 1, fxy: () => 0, fyy: () => 0.5 },
  saddle: { name: 'Saddle', f: (x, y) => (x * x - y * y) / 2, fx: (x) => x, fy: (x, y) => -y, fxx: () => 1, fxy: () => 0, fyy: () => -1 },
  wave: { name: 'Ripples', f: (x, y) => Math.sin(x) * Math.cos(y), fx: (x, y) => Math.cos(x) * Math.cos(y), fy: (x, y) => -Math.sin(x) * Math.sin(y), fxx: (x, y) => -Math.sin(x) * Math.cos(y), fxy: (x, y) => -Math.cos(x) * Math.sin(y), fyy: (x, y) => -Math.sin(x) * Math.cos(y) },
  hill: { name: 'Slope', f: (x, y) => x * x * y / 4, fx: (x, y) => x * y / 2, fy: (x) => x * x / 4, fxx: (x, y) => y / 2, fxy: (x) => x / 2, fyy: () => 0 },
};
export const gradient = (S, x, y) => [S.fx(x, y), S.fy(x, y)];
// The field (f_x, f_y) as a 2D field object; curl is f_xy − f_yx = 0.
export const gradField = (S) => ({ P: S.fx, Q: S.fy, Px: S.fxx, Py: S.fxy, Qx: S.fxy, Qy: S.fyy });
// Rotated gradient (ψ_y, −ψ_x): the 2D picture of "a swirl has no source".
export const streamField = (S) => ({ P: S.fy, Q: (x, y) => -S.fx(x, y), Px: S.fxy, Py: S.fyy, Qx: (x, y) => -S.fxx(x, y), Qy: (x, y) => -S.fxy(x, y) });

// Tangent to the level curve of S through (x, y), found from marching squares segments of the same level.
export function levelTangent(S, x, y, half = 1.2, n = 90) {
  const level = S.f(x, y);
  let best = null;
  const step = (2 * half) / n;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // The grid is offset so the point never sits exactly on a vertex (a zero there makes a false segment).
      const [x0, y0] = [x - half + (i - 0.37) * step, y - half + (j - 0.29) * step];
      const pts = [[x0, y0], [x0 + step, y0], [x0 + step, y0 + step], [x0, y0 + step]];
      const vals = pts.map(([a, b]) => S.f(a, b) - level);
      const hits = [];
      for (let k = 0; k < 4; k++) {
        const l = (k + 1) % 4;
        if ((vals[k] < 0) !== (vals[l] < 0)) {
          const t = vals[k] / (vals[k] - vals[l]);
          hits.push([pts[k][0] + (pts[l][0] - pts[k][0]) * t, pts[k][1] + (pts[l][1] - pts[k][1]) * t]);
        }
      }
      if (hits.length >= 2) {
        const mid = [(hits[0][0] + hits[1][0]) / 2, (hits[0][1] + hits[1][1]) / 2];
        const d = Math.hypot(mid[0] - x, mid[1] - y);
        if (!best || d < best.d) best = { d, dir: sub(hits[1], hits[0]) };
      }
    }
  }
  if (!best) return null;
  const len = norm(best.dir);
  return len === 0 ? null : scale(best.dir, 1 / len);
}

// Point source: gravity pulls inward, an electric charge pushes out if q > 0.
export const inverseSquare = (q, [px, py], x, y) => {
  const [dx, dy] = [x - px, y - py];
  const r = Math.hypot(dx, dy);
  return [(q * dx) / r ** 3, (q * dy) / r ** 3];
};

// ---- Paths ----------------------------------------------------------------------------------------------------
export const segment = (A, B) => ({ r: (t) => [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])], d: () => [B[0] - A[0], B[1] - A[1]] });
// A straight run bent sideways by h·sin(πt) (perpendicular to AB); same ends for every h.
export function bump(A, B, h) {
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  const len = Math.hypot(dx, dy);
  const [nx, ny] = [-dy / len, dx / len];
  return {
    r: (t) => [A[0] + t * dx + h * Math.sin(Math.PI * t) * nx, A[1] + t * dy + h * Math.sin(Math.PI * t) * ny],
    d: (t) => [dx + h * Math.PI * Math.cos(Math.PI * t) * nx, dy + h * Math.PI * Math.cos(Math.PI * t) * ny],
  };
}
export const arcPath = ([cx, cy], R, a0, a1) => ({
  r: (t) => [cx + R * Math.cos(a0 + (a1 - a0) * t), cy + R * Math.sin(a0 + (a1 - a0) * t)],
  d: (t) => [-R * (a1 - a0) * Math.sin(a0 + (a1 - a0) * t), R * (a1 - a0) * Math.cos(a0 + (a1 - a0) * t)],
});
export const ellipsePath = ([cx, cy], a, b) => ({
  r: (t) => [cx + a * Math.cos(TAU * t), cy + b * Math.sin(TAU * t)],
  d: (t) => [-a * TAU * Math.sin(TAU * t), b * TAU * Math.cos(TAU * t)],
});
export const reversed = (p) => ({ r: (t) => p.r(1 - t), d: (t) => p.d(1 - t).map((v) => -v) });
// A closed polygon, edge by edge (t over [0, 1]).
export function polygonPath(pts) {
  const n = pts.length;
  const edge = (t) => { const k = Math.min(n - 1, Math.floor(t * n)); return [k, t * n - k]; };
  return {
    r: (t) => { const [k, s] = edge(t); const [a, b] = [pts[k], pts[(k + 1) % n]]; return [a[0] + s * (b[0] - a[0]), a[1] + s * (b[1] - a[1])]; },
    d: (t) => { const [k] = edge(t); const [a, b] = [pts[k], pts[(k + 1) % n]]; return [(b[0] - a[0]) * n, (b[1] - a[1]) * n]; },
  };
}

// ∫ F · dr over t in [0, u].
export const work = (F, path, u = 1, n = 400) => {
  if (u <= 0) return 0;
  const m = Math.max(2, 2 * Math.ceil((n * u) / 2));
  return simpson((t) => { const [x, y] = path.r(t); const [dx, dy] = path.d(t); return F.P(x, y) * dx + F.Q(x, y) * dy; }, 0, u, m);
};
// ∫ f ds over t in [0, u].
export const arcIntegral = (f, path, u = 1, n = 400) => {
  if (u <= 0) return 0;
  const m = Math.max(2, 2 * Math.ceil((n * u) / 2));
  return simpson((t) => { const [x, y] = path.r(t); return f(x, y) * Math.hypot(...path.d(t)); }, 0, u, m);
};
export const pathLength = (path, n = 400) => arcIntegral(() => 1, path, 1, n);
// Circulation of F around a rectangle [x0, x1] × [y0, y1], counter-clockwise, edge by edge.
export function rectCirculation(F, x0, y0, x1, y1) {
  const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  let total = 0;
  for (let k = 0; k < 4; k++) total += work(F, segment(corners[k], corners[(k + 1) % 4]), 1, 64);
  return total;
}
// Outflow of F through a square of side s centred at (cx, cy): ∮ F · n ds.
export function boxOutflow(F, cx, cy, s) {
  const h = s / 2;
  const side = (f) => simpson(f, -h, h, 32);
  return side((t) => F.P(cx + h, cy + t)) - side((t) => F.P(cx - h, cy + t)) + side((t) => F.Q(cx + t, cy + h)) - side((t) => F.Q(cx + t, cy - h));
}
// ∮ over the circle of radius R round (cx, cy): circulation and outflow.
export const circleCirculation = (F, c, R) => work(F, arcPath(c, R, 0, TAU), 1, 720);
export const circleOutflow = (F, [cx, cy], R) => simpson((t) => { const a = TAU * t; return (F.P(cx + R * Math.cos(a), cy + R * Math.sin(a)) * Math.cos(a) + F.Q(cx + R * Math.cos(a), cy + R * Math.sin(a)) * Math.sin(a)) * R * TAU; }, 0, 1, 720);

// ---- Roller coaster -------------------------------------------------------------------------------------------
export const TRACKS = {
  hill: { name: 'Gentle hill', h: (x) => 3 + 2 * Math.cos(0.5 * x), dh: (x) => -Math.sin(0.5 * x) },
  dip: { name: 'Steep dip', h: (x) => 2.5 + 2 * Math.tanh(0.6 * x) - 1.5 * Math.exp(-((x - 0.5) ** 2)), dh: (x) => 1.2 / Math.cosh(0.6 * x) ** 2 + 3 * (x - 0.5) * Math.exp(-((x - 0.5) ** 2)) },
  wavy: { name: 'Wavy', h: (x) => 3 + Math.sin(1.5 * x) + 0.5 * Math.sin(3.5 * x), dh: (x) => 1.5 * Math.cos(1.5 * x) + 1.75 * Math.cos(3.5 * x) },
};
export const G = 9.8;
// Work done by gravity on mass m going from x = a to x = b along the track: ∫ (0, −mg) · (1, h′) dx.
export const gravityWork = (track, m, a, b) => simpson((x) => -m * G * track.dh(x), a, b, 800);
export const trackLength = (track, a, b) => simpson((x) => Math.hypot(1, track.dh(x)), a, b, 800);

// ---- Polygons (planimeter) --------------------------------------------------------------------------------------
export const SHAPES = {
  l: { name: 'L shape', pts: [[-3, -2], [1, -2], [1, 0], [-1, 0], [-1, 2], [-3, 2]] },
  triangle: { name: 'Triangle', pts: [[0.5, -2], [3.5, -1], [1.5, 2.5]] },
  star: { name: 'Star', pts: Array.from({ length: 10 }, (_, k) => { const R = k % 2 ? 1.3 : 3; const a = Math.PI / 2 + (k * Math.PI) / 5; return [R * Math.cos(a), R * Math.sin(a)]; }) },
};
export function polyArea(pts) {
  let s = 0;
  pts.forEach(([x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; s += x * y2 - x2 * y; });
  return s / 2;
}
// Area swept from a pivot o by walking `edges` whole edges plus `frac` of the next: ½ ∮ (x dy − y dx).
export function sweptFrom(pts, o, edges, frac = 0) {
  let s = 0;
  const n = pts.length;
  for (let k = 0; k < edges; k++) {
    const [a, b] = [sub(pts[k % n], o), sub(pts[(k + 1) % n], o)];
    s += (a[0] * b[1] - a[1] * b[0]) / 2;
  }
  if (frac > 0) {
    const k = edges % n;
    const [a, p] = [sub(pts[k], o), sub(pts[(k + 1) % n], pts[k])];
    const e = add(a, scale(p, frac));
    s += (a[0] * e[1] - a[1] * e[0]) / 2;
  }
  return s;
}

// ---- Potentials (the HOW tool) ------------------------------------------------------------------------------------
export const POTENTIALS = {
  a: { F: (x, y) => [2 * x * y + 3, x * x - 2 * y], f: (x, y) => x * x * y + 3 * x - y * y },
  b: { F: (x, y) => [3 * x * x + y, x - 4 * y ** 3], f: (x, y) => x ** 3 + x * y - y ** 4 },
  c: { F: (x, y) => [2 * x + y, x + 2 * y], f: (x, y) => x * x + x * y + y * y },
};

// ---- Surfaces ---------------------------------------------------------------------------------------------------
export const SURFACES = {
  sphere: {
    name: 'Sphere', u: [0, TAU], v: [0, Math.PI], area: 4 * Math.PI * 4,
    r: (u, v) => [2 * Math.sin(v) * Math.cos(u), 2 * Math.sin(v) * Math.sin(u), 2 * Math.cos(v)],
    ru: (u, v) => [-2 * Math.sin(v) * Math.sin(u), 2 * Math.sin(v) * Math.cos(u), 0],
    rv: (u, v) => [2 * Math.cos(v) * Math.cos(u), 2 * Math.cos(v) * Math.sin(u), -2 * Math.sin(v)],
  },
  torus: {
    name: 'Torus', u: [0, TAU], v: [0, TAU], area: 4 * Math.PI * Math.PI * 2 * 0.8,
    r: (u, v) => [(2 + 0.8 * Math.cos(v)) * Math.cos(u), (2 + 0.8 * Math.cos(v)) * Math.sin(u), 0.8 * Math.sin(v)],
    ru: (u, v) => [-(2 + 0.8 * Math.cos(v)) * Math.sin(u), (2 + 0.8 * Math.cos(v)) * Math.cos(u), 0],
    rv: (u, v) => [-0.8 * Math.sin(v) * Math.cos(u), -0.8 * Math.sin(v) * Math.sin(u), 0.8 * Math.cos(v)],
  },
  cylinder: {
    name: 'Cylinder', u: [0, TAU], v: [-1.5, 1.5], area: TAU * 2 * 3,
    r: (u, v) => [2 * Math.cos(u), 2 * Math.sin(u), v],
    ru: (u) => [-2 * Math.sin(u), 2 * Math.cos(u), 0],
    rv: () => [0, 0, 1],
  },
  cone: {
    name: 'Cone', u: [0, TAU], v: [0, 2], area: 4 * Math.SQRT2 * Math.PI,
    r: (u, v) => [v * Math.cos(u), v * Math.sin(u), v],
    ru: (u, v) => [-v * Math.sin(u), v * Math.cos(u), 0],
    rv: (u) => [Math.cos(u), Math.sin(u), 1],
  },
};
export const surfNormal = (S, u, v) => cross(S.ru(u, v), S.rv(u, v));
// Area by adding |r_u × r_v| Δu Δv over an n × n grid (midpoints).
export function surfArea(S, n) {
  const [du, dv] = [(S.u[1] - S.u[0]) / n, (S.v[1] - S.v[0]) / n];
  let s = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += norm(surfNormal(S, S.u[0] + (i + 0.5) * du, S.v[0] + (j + 0.5) * dv)) * du * dv;
  return s;
}
// Möbius strip (centre circle of radius 1, half-width 1/2 · v for v in [−1, 1]).
export const MOBIUS = {
  r: (u, v) => { const w = 1 + (v / 2) * Math.cos(u / 2); return [w * Math.cos(u), w * Math.sin(u), (v / 2) * Math.sin(u / 2)]; },
  ru: (u, v) => { const w = 1 + (v / 2) * Math.cos(u / 2); return [-(v / 4) * Math.sin(u / 2) * Math.cos(u) - w * Math.sin(u), -(v / 4) * Math.sin(u / 2) * Math.sin(u) + w * Math.cos(u), (v / 4) * Math.cos(u / 2)]; },
  rv: (u) => [0.5 * Math.cos(u / 2) * Math.cos(u), 0.5 * Math.cos(u / 2) * Math.sin(u), 0.5 * Math.sin(u / 2)],
};
// An ordinary band (cylinder of radius 1), for contrast.
export const BAND = {
  r: (u, v) => [Math.cos(u), Math.sin(u), v / 2],
  ru: (u) => [-Math.sin(u), Math.cos(u), 0],
  rv: () => [0, 0, 0.5],
};
export const unitNormal = (S, u, v) => { const n = cross(S.ru(u, v), S.rv(u, v)); return scale(n, 1 / norm(n)); };

// ---- Flux through a net -----------------------------------------------------------------------------------------
// Uniform stream along +x at speed w; a square net of side s whose normal makes angle alpha with the stream.
export const tiltFlux = (w, s, alpha) => w * s * s * Math.cos(alpha);

// ---- Mass of a curved sheet ----------------------------------------------------------------------------------------
// Sheet z = 0.15 (x² + y²) over [−2, 2]², density ρ = 2 + x/2 + y/4.
export const sheetZ = (x, y) => 0.15 * (x * x + y * y);
export const sheetRho = (x, y) => 2 + 0.5 * x + 0.25 * y;
export const sheetStretch = (x, y) => Math.sqrt(1 + (0.3 * x) ** 2 + (0.3 * y) ** 2);
export function sheetMass(n) {
  const h = 4 / n;
  let s = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const [x, y] = [-2 + (i + 0.5) * h, -2 + (j + 0.5) * h]; s += sheetRho(x, y) * sheetStretch(x, y) * h * h; }
  return s;
}
export function sheetArea(n) {
  const h = 4 / n;
  let s = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += sheetStretch(-2 + (i + 0.5) * h, -2 + (j + 0.5) * h) * h * h;
  return s;
}

// ---- Stokes: a dome over the circle of radius 2 ----------------------------------------------------------------------
// z = h (1 − r²/4)(1 + k x/2). F = (−y + z, x, y), curl F = (1, 1, 2).
export const domeZ = (h, k, x, y) => h * (1 - (x * x + y * y) / 4) * (1 + (k * x) / 2);
export const domeZx = (h, k, x, y) => h * ((-x / 2) * (1 + (k * x) / 2) + (1 - (x * x + y * y) / 4) * (k / 2));
export const domeZy = (h, k, x, y) => h * (-y / 2) * (1 + (k * x) / 2);
export function domeFlux(h, k, n = 120) {
  const [dr, dt] = [2 / n, TAU / (2 * n)];
  let s = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < 2 * n; j++) {
    const [r, t] = [(i + 0.5) * dr, (j + 0.5) * dt];
    const [x, y] = [r * Math.cos(t), r * Math.sin(t)];
    s += (-domeZx(h, k, x, y) - domeZy(h, k, x, y) + 2) * r * dr * dt;
  }
  return s;
}
export const rimCirculation = () => simpson((t) => 4, 0, TAU, 8);

// ---- Divergence theorem: flux out of a sphere ----------------------------------------------------------------------------
export const FIELDS3 = {
  source: { name: 'Spreading out: (x, y, z)', F: (x, y, z) => [x, y, z], div: () => 3 },
  squeeze: { name: 'Out sideways, in from the top: (x, y, −2z)', F: (x, y, z) => [x, y, -2 * z], div: () => 0 },
  side: { name: 'Faster to the right: (x², 0, 0)', F: (x) => [x * x, 0, 0], div: (x) => 2 * x },
};
export function sphereFlux(F, [cx, cy, cz], R, n = 64) {
  const [dp, dt] = [Math.PI / n, TAU / (2 * n)];
  let s = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < 2 * n; j++) {
    const [p, t] = [(i + 0.5) * dp, (j + 0.5) * dt];
    const nrm = [Math.sin(p) * Math.cos(t), Math.sin(p) * Math.sin(t), Math.cos(p)];
    s += dot(F(cx + R * nrm[0], cy + R * nrm[1], cz + R * nrm[2]), nrm) * R * R * Math.sin(p) * dp * dt;
  }
  return s;
}
export const sphereVolume = (R) => (4 / 3) * Math.PI * R ** 3;

// ---- Gauss's law --------------------------------------------------------------------------------------------------------------
export const EPS0 = 8.854e-12;
// Flux of a point charge q (in units where E = q r̂ /4π r², i.e. flux = q inside) through a sphere of radius R about the origin.
export function chargeFlux(q, px, R, n = 120) {
  const field = (x, y, z) => { const d = [x - px, y, z]; const r = norm(d); return scale(d, q / (4 * Math.PI * r ** 3)); };
  return sphereFlux(field, [0, 0, 0], R, n);
}
export const insideSphere = (px, R) => Math.abs(px) < R;

// ---- One big idea: boundary = interior, for four theorems ------------------------------------------------------------------------
// Each returns [boundary side, interior side] for a size s. All four are sums, not formulas.
const simpson2 = (f, a, b, n = 40) => simpson((y) => simpson((x) => f(x, y), a, b, n), a, b, n);
export const BIG = {
  // F(x) = x³ on [0, s]: F(s) − F(0) against ∫ F′ dx.
  ftc: (s) => [s ** 3 - 0 ** 3, simpson((x) => 3 * x * x, 0, s, 200)],
  // F = (−y², x) on [0, s]²: counter-clockwise circulation against ∬ (Q_x − P_y) dA.
  green: (s) => [rectCirculation(FIELDS.quad, 0, 0, s, s), simpson2((x, y) => 1 + 2 * y, 0, s)],
  // F = (−y, x, 0), rim of the hemisphere z ≥ 0 of radius s, against ∬ curl F · n dS with curl F = (0, 0, 2).
  stokes: (s) => {
    const [n, dp, dt] = [80, Math.PI / 160, TAU / 160];
    let flux = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < 160; j++) { const p = (i + 0.5) * dp; flux += 2 * Math.cos(p) * s * s * Math.sin(p) * dp * dt; }
    return [work(FIELDS.swirl, arcPath([0, 0], s, 0, TAU), 1, 720), flux];
  },
  // F = (x, y, z) on the cube [0, s]³: outward flux through the six faces against ∭ div F dV.
  gauss: (s) => {
    const faces = [simpson2(() => s, 0, s), simpson2(() => 0, 0, s), simpson2(() => s, 0, s), simpson2(() => 0, 0, s), simpson2(() => s, 0, s), simpson2(() => 0, 0, s)];
    return [faces.reduce((a, b) => a + b, 0), simpson((z) => simpson2(() => 3, 0, s, 2), 0, s, 2)];
  },
};
