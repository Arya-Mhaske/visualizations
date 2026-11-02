// Maths for the Solving Any Triangle box. Angles in degrees; sides a, b, c are opposite A, B, C.
export const rad = (d) => (d * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
const sinD = (d) => Math.sin(rad(d));
const cosD = (d) => Math.cos(rad(d));

export const heron = (a, b, c) => {
  const s = (a + b + c) / 2;
  const v = s * (s - a) * (s - b) * (s - c);
  return v > 0 ? Math.sqrt(v) : 0;
};
export const canClose = (a, b, c) => a + b > c && a + c > b && b + c > a;
export const lawOfCosinesSide = (a, b, Cd) => Math.sqrt(a * a + b * b - 2 * a * b * cosD(Cd));
export const lawOfCosinesAngle = (a, b, c) => deg(Math.acos(Math.max(-1, Math.min(1, (a * a + b * b - c * c) / (2 * a * b)))));
export const areaSAS = (a, b, Cd) => 0.5 * a * b * sinD(Cd);
export const circumradius = (a, Ad) => a / (2 * sinD(Ad));

// Triangle from three vertices [x, y]
export const sidesOf = (A, B, C) => ({ a: Math.hypot(B[0] - C[0], B[1] - C[1]), b: Math.hypot(A[0] - C[0], A[1] - C[1]), c: Math.hypot(A[0] - B[0], A[1] - B[1]) });
export const anglesOf = ({ a, b, c }) => ({ A: lawOfCosinesAngle(b, c, a), B: lawOfCosinesAngle(a, c, b), C: lawOfCosinesAngle(a, b, c) });
export const cross = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
export const areaBaseHeight = (A, B, C) => {
  const base = Math.hypot(B[0] - A[0], B[1] - A[1]);
  return 0.5 * Math.abs(cross(A, B, C)); // = 1/2 base x height, as the height is |cross| / base
};

// SSA: angle A, opposite side a, adjacent side b. How many triangles?
export function ssaCount(Ad, a, b) {
  const h = b * sinD(Ad);
  if (Ad >= 90) return a > b ? 1 : 0;
  if (a < h - 1e-9) return 0;
  if (Math.abs(a - h) <= 1e-9) return 1;
  return a < b ? 2 : 1;
}
// Where the arc of radius a about C meets the base line: x positions of B (A at the origin, base along +x).
export function ssaPoints(Ad, a, b) {
  const px = b * cosD(Ad);
  const h = b * sinD(Ad);
  const d2 = a * a - h * h;
  if (d2 < -1e-9) return [];
  const r = Math.sqrt(Math.max(0, d2));
  const xs = r < 1e-9 ? [px] : [px - r, px + r];
  return xs.filter((x) => x > 1e-9);
}

// Solve a whole triangle from the five classic cases. Returns a list of triangles { A, B, C, a, b, c }.
export function solveCase(kind, v) {
  const make = (A, B, C, a, b, c) => ({ A, B, C, a, b, c });
  if (kind === 'ASA') { // A, B and the side c between them
    const C = 180 - v.A - v.B;
    if (C <= 0) return [];
    const k = v.c / sinD(C);
    return [make(v.A, v.B, C, k * sinD(v.A), k * sinD(v.B), v.c)];
  }
  if (kind === 'AAS') { // A, B and a (opposite A)
    const C = 180 - v.A - v.B;
    if (C <= 0) return [];
    const k = v.a / sinD(v.A);
    return [make(v.A, v.B, C, v.a, k * sinD(v.B), k * sinD(C))];
  }
  if (kind === 'SAS') { // sides a, b and the angle C between them
    const c = lawOfCosinesSide(v.a, v.b, v.C);
    const { A, B } = anglesOf({ a: v.a, b: v.b, c });
    return [make(A, B, v.C, v.a, v.b, c)];
  }
  if (kind === 'SSS') {
    if (!canClose(v.a, v.b, v.c)) return [];
    const { A, B, C } = anglesOf(v);
    return [make(A, B, C, v.a, v.b, v.c)];
  }
  // SSA: A, a, b
  const s = sinD(v.A) * v.b / v.a;
  if (s > 1 + 1e-12) return [];
  const B1 = deg(Math.asin(Math.min(1, s)));
  const out = [];
  for (const B of [B1, 180 - B1]) {
    const C = 180 - v.A - B;
    if (C > 1e-9 && !out.some((t) => Math.abs(t.B - B) < 1e-9)) out.push(make(v.A, B, C, v.a, v.b, (v.a * sinD(C)) / sinD(v.A)));
  }
  return out;
}

// River width from two sightings on one bank.
export function river(d, alphaD, betaD) {
  const gamma = 180 - alphaD - betaD;
  const AT = (d * sinD(betaD)) / sinD(gamma);
  return { gamma, AT, BT: (d * sinD(alphaD)) / sinD(gamma), width: AT * sinD(alphaD) };
}

// Polygon area by a fan of triangles from vertex 0 (signed), and the shoelace check.
export function fan(points) {
  const parts = [];
  for (let i = 1; i + 1 < points.length; i++) parts.push(0.5 * cross(points[0], points[i], points[i + 1]));
  return parts;
}
export const shoelace = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
