// Shared maths for the electric-potential box. Reduced units (k = 1) unless a function says µC and cm.
import { simpson } from '../heat-thermodynamics/_thermo.js';
export const coulombField = ([x, y]) => { const r2 = x * x + y * y; const r = Math.sqrt(r2); return [x / (r2 * r), y / (r2 * r)]; };
// A force that pushes round the origin, size 1/r... not 1/r² and not radial: it has curl, so loops do work.
export const swirlField = ([x, y]) => { const r = Math.hypot(x, y); return [-y / r, x / r]; };
// Work done by a field along the straight segment A to B on a unit test charge.
export function segmentWork(F, [ax, ay], [bx, by]) {
  const [dx, dy] = [bx - ax, by - ay];
  return simpson((t) => { const [fx, fy] = F([ax + t * dx, ay + t * dy]); return fx * dx + fy * dy; }, 0, 1, 200);
}
// Potential energy of charges in µC at positions in cm, in joules: 0.9 q1 q2 / r.
export const pairEnergy = (q1, q2, rcm) => (0.9 * q1 * q2) / rcm;
export const hexPoints = (a) => Array.from({ length: 6 }, (_, i) => [a * Math.cos((i * Math.PI) / 3), a * Math.sin((i * Math.PI) / 3)]);
