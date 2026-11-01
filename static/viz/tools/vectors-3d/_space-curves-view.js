// Drawing helpers for the Space Curves & Motion box.
import { CURVES } from './_space-curves-math.js';

export const curveOptions = Object.entries(CURVES).map(([key, v]) => [key, v.name]);

// The whole curve as a polyline.
export function drawCurve(cam, curve, options) {
  const [t0, t1] = curve.range;
  let last = curve.r(t0);
  for (let i = 1; i <= 160; i++) {
    const p = curve.r(t0 + ((t1 - t0) * i) / 160);
    cam.line(last, p, options);
    last = p;
  }
}
// Middle of the range, a good place to start.
export const midT = (curve) => (curve.range[0] + curve.range[1]) / 2;
