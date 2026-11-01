// Maths for the refraction and total internal reflection box. Angles in degrees unless a name says rad.
import { refract, reflect, hitCircle } from '../../lib/rays.js';

const RAD = Math.PI / 180;
export const rad = (d) => d * RAD;
export const deg = (r) => r / RAD;

// Snell's law: n1 sin(i) = n2 sin(r). Returns the refracted angle in degrees, or null past the critical angle.
export function snell(n1, n2, iDeg) {
  const s = (n1 / n2) * Math.sin(rad(iDeg));
  return s > 1 ? null : deg(Math.asin(s));
}
export const criticalAngle = (nDense, nRare = 1) => (nDense > nRare ? deg(Math.asin(nRare / nDense)) : null);

// Fresnel reflectance for unpolarised light going from n1 to n2 (1 at and past the critical angle).
export function reflectance(n1, n2, iDeg) {
  const t = snell(n1, n2, iDeg);
  if (t === null) return 1;
  const ci = Math.cos(rad(iDeg));
  const ct = Math.cos(rad(t));
  const rs = (n1 * ci - n2 * ct) / (n1 * ci + n2 * ct);
  const rp = (n2 * ci - n1 * ct) / (n2 * ci + n1 * ct);
  return (rs * rs + rp * rp) / 2;
}

// Looking at a point P at depth d below water of index n: the refracted rays seem to come from a point at depth d' where
//   d' = d tan(theta_w) / tan(theta_a). Straight down this becomes d / n.
export const apparentDepthStraight = (d, n) => d / n;
export function apparentDepthAt(d, n, thetaAirDeg) {
  const a = rad(thetaAirDeg);
  if (a === 0) return d / n;
  const w = Math.asin(Math.sin(a) / n);
  return (d * Math.tan(w)) / Math.tan(a);
}
// A bent fibre: core width w between circles of radius rc - w/2 and rc + w/2 about the origin. The ray starts on the x axis
// at the middle of the core heading along +y, turned outwards by alpha (degrees). nCore inside, nClad outside.
// Returns { points, bounces, outcome: 'guided' | 'leaks', ... } and stops when the ray reaches the y = 0 plane on the far side.
export function fibreTrace({ rc, w, alpha, nCore, nClad, maxBounces = 80 }) {
  const rin = rc - w / 2;
  const rout = rc + w / 2;
  let p = [rc, 0];
  const a = rad(alpha);
  let d = [Math.sin(a), Math.cos(a)];
  const points = [p];
  let bounces = 0;
  for (let step = 0; step < maxBounces; step++) {
    const hits = [];
    const tOut = hitCircle(p, d, [0, 0], rout).filter((t) => t > 1e-7);
    if (tOut.length) hits.push({ t: Math.max(...tOut), wall: 'outer' });
    const tIn = hitCircle(p, d, [0, 0], rin).filter((t) => t > 1e-7);
    if (tIn.length) hits.push({ t: Math.min(...tIn), wall: 'inner' });
    if (!hits.length) break;
    hits.sort((u, v) => u.t - v.t);
    const hit = hits[0];
    const q = [p[0] + d[0] * hit.t, p[1] + d[1] * hit.t];
    // has the ray crossed the exit plane (y = 0, x < 0) on the way?
    if (p[1] > 0 && q[1] <= 0 && p[1] !== q[1]) {
      const s = p[1] / (p[1] - q[1]);
      const x = p[0] + (q[0] - p[0]) * s;
      if (x < 0) {
        points.push([x, 0]);
        return { points, bounces, outcome: 'guided' };
      }
    }
    points.push(q);
    // the normal points into the core at the hit
    const r = Math.hypot(q[0], q[1]);
    const radial = [q[0] / r, q[1] / r];
    const normal = hit.wall === 'outer' ? [-radial[0], -radial[1]] : radial;
    const out = refract(d, normal, nCore, nClad);
    if (out) {
      const far = [q[0] + out[0] * 4, q[1] + out[1] * 4];
      points.push(far);
      return { points, bounces, outcome: 'leaks', leakAt: q };
    }
    d = reflect(d, normal);
    p = q;
    bounces += 1;
  }
  return { points, bounces, outcome: 'guided' };
}
// The smallest bend radius (in core widths) that still guides the ray, by bisection.
export function smallestBend({ w, alpha, nCore, nClad }) {
  let lo = w * 0.51;
  let hi = w * 400;
  if (fibreTrace({ rc: hi, w, alpha, nCore, nClad }).outcome !== 'guided') return null;
  if (fibreTrace({ rc: lo, w, alpha, nCore, nClad }).outcome === 'guided') return lo;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (fibreTrace({ rc: mid, w, alpha, nCore, nClad }).outcome === 'guided') hi = mid; else lo = mid;
  }
  return hi;
}
// Acceptance: the largest angle in air, to the axis of a straight fibre, that is still guided.
export const acceptanceAngle = (nCore, nClad) => (nCore > nClad ? (nCore * nCore - nClad * nClad >= 1 ? 90 : deg(Math.asin(Math.sqrt(nCore * nCore - nClad * nClad)))) : 0);

// A ray in a polygon with refraction at every edge. polygon: list of [x, y] going anticlockwise.
// The ray starts at p heading d, in the medium given by `inside` (true: inside the polygon).
export function polygonTrace(polygon, nIn, nOut, p, d, inside, maxSteps = 8) {
  const segments = [];
  let outsideRays = [];
  let pos = p;
  let dir = d;
  let isInside = inside;
  for (let step = 0; step < maxSteps; step++) {
    let best = null;
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i];
      const b = polygon[(i + 1) % polygon.length];
      const e = [b[0] - a[0], b[1] - a[1]];
      const det = dir[0] * -e[1] - dir[1] * -e[0];
      if (Math.abs(det) < 1e-12) continue;
      const rhs = [a[0] - pos[0], a[1] - pos[1]];
      const t = (rhs[0] * -e[1] - rhs[1] * -e[0]) / det;
      const s = (dir[0] * rhs[1] - dir[1] * rhs[0]) / det;
      if (t > 1e-7 && s >= -1e-9 && s <= 1 + 1e-9 && (!best || t < best.t)) best = { t, i, e };
    }
    if (!best) {
      segments.push({ from: pos, to: [pos[0] + dir[0] * 4, pos[1] + dir[1] * 4], inside: isInside, last: true });
      break;
    }
    const q = [pos[0] + dir[0] * best.t, pos[1] + dir[1] * best.t];
    segments.push({ from: pos, to: q, inside: isInside, last: false });
    const len = Math.hypot(...best.e);
    // an outward normal for an anticlockwise polygon: (e_y, -e_x)
    let nrm = [best.e[1] / len, -best.e[0] / len];
    // make it face the incoming ray
    if (nrm[0] * dir[0] + nrm[1] * dir[1] > 0) nrm = [-nrm[0], -nrm[1]];
    const n1 = isInside ? nIn : nOut;
    const n2 = isInside ? nOut : nIn;
    const out = refract(dir, nrm, n1, n2);
    if (out) {
      // the light that gets through
      const far = [q[0] + out[0] * 4, q[1] + out[1] * 4];
      outsideRays.push({ from: q, to: far, leaving: isInside });
      if (!isInside) {
        // entering: follow the transmitted ray inside
        pos = q;
        dir = out;
        isInside = true;
        continue;
      }
      // leaving: record it and stop following (a weak reflected part is ignored)
      break;
    }
    dir = reflect(dir, nrm);
    pos = q;
  }
  return { segments, escapes: outsideRays.filter((r) => r.leaving) };
}
