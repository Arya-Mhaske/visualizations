// The Mirrors box: pure numbers, no DOM. NCERT Cartesian signs: pole at 0, incident light along +x, so an object
// has u < 0, a concave mirror has f < 0 and a convex mirror has f > 0. f here is signed; R and fSize are sizes.
import { axisCrossing, reflect, unit } from '../../lib/rays.js';

export const signedF = (kind, fSize) => (kind === 'concave' ? -fSize : fSize);

// v from 1/v + 1/u = 1/f, and m = −v/u. An object at the focus has its image at infinity.
export function imageOf(u, f) {
  if (Math.abs(u - f) < 1e-9) return { v: Infinity, m: Infinity, real: false, atInfinity: true };
  const v = (u * f) / (u - f);
  return { v, m: -v / u, real: v < 0, atInfinity: false };
}

export function describe({ m, real, atInfinity }) {
  if (atInfinity) return 'No image: rays leave parallel';
  const size = Math.abs(Math.abs(m) - 1) < 1e-9 ? 'same size' : Math.abs(m) > 1 ? 'magnified' : 'diminished';
  return `${real ? 'Real' : 'Virtual'}, ${m < 0 ? 'inverted' : 'erect'}, ${size}`;
}

export function region(u, f) {
  if (f > 0) return 'In front of a convex mirror';
  const [d, F] = [Math.abs(u), Math.abs(f)];
  if (Math.abs(d - 2 * F) < 1e-9) return 'At C';
  if (Math.abs(d - F) < 1e-9) return 'At F';
  return d > 2 * F ? 'Beyond C' : d > F ? 'Between C and F' : 'Between F and P';
}

// ---- One true ray on a true sphere ----
// A ray parallel to the axis at height h. The radius at M is the normal, so i = r = θ.
export function exactRay(kind, R, h) {
  const side = kind === 'concave' ? -1 : 1;
  const C = [side * R, 0];
  const M = [C[0] - side * Math.sqrt(R * R - h * h), h];
  const normal = kind === 'concave' ? unit([C[0] - M[0], C[1] - M[1]]) : unit([M[0] - C[0], M[1] - C[1]]);
  const out = reflect([1, 0], normal);
  const cross = axisCrossing(M, out);
  return { C, M, out, cross, theta: Math.asin(h / R), fromPole: Math.abs(cross), half: R / 2 };
}

export const crossingFormula = (R, theta) => R - R / (2 * Math.cos(theta));

// ---- Paraxial rays from the tip of an object at (u, h), each meeting the plane x = 0 ----
// Each has a name, the hit point, and the reflected direction, which always heads back to the left.
export function principalRays(u, h, f) {
  const left = ([x, y]) => unit(x > 0 ? [-x, -y] : [x, y]);
  const list = [
    { name: 'parallel', hit: [0, h], dir: left([f, -h]) },
    { name: 'pole', hit: [0, 0], dir: left([u, -h]) },
  ];
  if (Math.abs(u - f) > 1e-9) list.push({ name: 'focus', hit: [0, (h * f) / (f - u)], dir: [-1, 0] });
  if (Math.abs(u - 2 * f) > 1e-9) {
    const y = (h * 2 * f) / (2 * f - u);
    list.push({ name: 'centre', hit: [0, y], dir: left([u, h - y]) });
  }
  return list;
}

// ---- The similar triangles of NCERT Fig 9.3 (a real image), all lengths positive ----
export function triangles(u, f, h) {
  const { v, m } = imageOf(u, f);
  const [BP, BPimage, FP] = [-u, -v, -f];
  const imageH = Math.abs(m) * h;
  return { AB: h, imageH, BP, BPimage, FP, BF: BPimage - FP, poleLeft: imageH / h, poleRight: BPimage / BP, focusLeft: imageH / h, focusRight: (BPimage - FP) / FP };
}

// What the same formula gives if every sign is dropped.
export const unsignedV = (u, f) => 1 / (1 / Math.abs(f) - 1 / Math.abs(u));

// ---- Rear-view mirror, seen from above, in metres. The mirror faces −x, the eye is on its axis ----
// R = Infinity is a flat mirror. Returns where the outermost visible ray leaves the rim, and its slope back along the road.
export function fieldEdge(eye, w, R) {
  const flat = !Number.isFinite(R);
  const M = [flat ? 0 : R - Math.sqrt(R * R - w * w), w];
  const normal = flat ? [-1, 0] : unit([M[0] - R, M[1]]);
  const out = reflect(unit([M[0] + eye, M[1]]), normal);
  return { M, out, angle: Math.atan2(out[1], -out[0]) };
}

// Is a point on the road (x < 0) inside the mirror's view?
export const isSeen = ([x, y], { M, out }) => Math.abs(y) <= M[1] + ((x - M[0]) / out[0]) * out[1];

// The nearest distance back at which the next lane comes into view.
export const firstSeen = (lane, { M, out }) => M[0] - ((lane - M[1]) / out[1]) * out[0];

export const SHAVING_R = 40; // cm
export const CAR = { eye: 0.5, w: 0.08, lane: 3.5 }; // m
