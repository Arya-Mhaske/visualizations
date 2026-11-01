// Drawing helpers for the Cylindrical & Spherical Coordinates box.
import { fromSpherical, fromCylindrical } from './_cylindrical-spherical-math.js';

const TAU = Math.PI * 2;

// A polyline through f(0..1), n steps.
export function trace(cam, f, n, options) {
  let last = f(0);
  for (let i = 1; i <= n; i++) {
    const p = f(i / n);
    cam.line(last, p, options);
    last = p;
  }
}
// Meridians (θ constant) and parallels (φ constant) of a sphere of radius rho.
export function sphereWire(cam, rho, options, step = 30) {
  for (let t = 0; t < 360; t += step) {
    trace(cam, (u) => fromSpherical(rho, (t * Math.PI) / 180, u * Math.PI), 36, options);
  }
  for (let p = step; p < 180; p += step) {
    trace(cam, (u) => fromSpherical(rho, u * TAU, (p * Math.PI) / 180), 48, options);
  }
}
// A cylinder of radius r from z = −h to z = h.
export function cylinderWire(cam, r, h, options) {
  for (let t = 0; t < 360; t += 30) {
    cam.line(fromCylindrical(r, (t * Math.PI) / 180, -h), fromCylindrical(r, (t * Math.PI) / 180, h), options);
  }
  for (let z = -h; z <= h + 1e-9; z += h / 2) trace(cam, (u) => fromCylindrical(r, u * TAU, z), 48, options);
}
// An arc of angle `to` (radians) in the xy plane at radius r, height z, starting at θ = 0.
export const arcXY = (cam, r, to, z, options) => trace(cam, (u) => fromCylindrical(r, u * to, z), 24, options);
// An arc from the +z axis down to φ, on the meridian at θ.
export const arcPhi = (cam, r, theta, phi, options) => trace(cam, (u) => fromSpherical(r, theta, u * phi), 24, options);
