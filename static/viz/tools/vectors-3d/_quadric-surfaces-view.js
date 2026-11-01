// Drawing helpers for the Quadric Surfaces box. Slices are cached, because the view turns on every drag.
import { slice } from './_quadric-surfaces-math.js';

const LO = -4;
const HI = 4;
const N = 56;
const cache = new Map();

export function traces(kind, axis, k, abc) {
  const key = `${kind}|${axis}|${k}|${abc.join(',')}`;
  if (!cache.has(key)) {
    if (cache.size > 600) cache.clear();
    cache.set(key, slice(kind, axis, k, abc, LO, HI, N));
  }
  return cache.get(key);
}

export function drawTraces(cam, kind, axis, k, abc, options) {
  for (const [p, q] of traces(kind, axis, k, abc)) cam.line(p, q, options);
}

// The cutting plane axis = k as a square sheet.
export function planeFace(axis, k) {
  const at = (u, v) => [[k, u, v], [u, k, v], [u, v, k]][axis];
  return { pts: [at(LO, LO), at(HI, LO), at(HI, HI), at(LO, HI)] };
}
export const WINDOW = { lo: LO, hi: HI };
