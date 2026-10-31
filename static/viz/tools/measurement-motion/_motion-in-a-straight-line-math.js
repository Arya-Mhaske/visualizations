// Pure maths for the Motion in a Straight Line box (no DOM).
// Checked by catalogue/tool_tests/test_measurement_motion_straight_line.py.
export const G = 9.8;

// NCERT Table 2.1: x = 0.08 t³, with the interval centred on t.
export const cubeX = (t) => 0.08 * t ** 3;
export const centredVelocity = (t, dt) => (cubeX(t + dt / 2) - cubeX(t - dt / 2)) / dt;
export const cubeV = (t) => 0.24 * t ** 2;

export const uniformX = (u, a, t) => u * t + 0.5 * a * t * t;
export const uniformV = (u, a, t) => u + a * t;

export const topTime = (u, g = G) => u / g;
export const topHeight = (u, g = G) => (u * u) / (2 * g);

export const speedingUp = (v, a) => v * a > 0;

// Out to a closed market and straight back (NCERT Example 2.9). Distances in km, speeds in km/h, t in h.
export function roundTrip(d, out, back, t) {
  const t1 = d / out;
  const t2 = d / back;
  if (t <= t1) return { position: out * t, path: out * t };
  const returned = Math.min(back * (t - t1), d);
  return { position: d - returned, path: d + returned };
}
export const tripTime = (d, out, back) => d / out + d / back;
export const averageSpeed = (path, t) => path / t;
export const averageVelocity = (position, t) => position / t;

// A kink rounded over a time w: position changes velocity from v1 to v2 at the constant rate Δv/w.
export const kinkAcceleration = (v1, v2, w) => (v2 - v1) / w;
export function kinkX(v1, v2, w, t) {
  if (t <= -w / 2) return v1 * t;
  const x0 = v1 * (-w / 2);
  if (t <= w / 2) {
    const s = t + w / 2;
    return x0 + v1 * s + 0.5 * ((v2 - v1) / w) * s * s;
  }
  return x0 + ((v1 + v2) / 2) * w + v2 * (t - w / 2);
}

// Velocity knots at equal times: returns x at each knot (trapezium areas) and a on each piece.
export function fromVelocity(knots, step, x0 = 0) {
  const xs = [x0];
  const as = [];
  for (let i = 1; i < knots.length; i++) {
    xs.push(xs[i - 1] + ((knots[i - 1] + knots[i]) / 2) * step);
    as.push((knots[i] - knots[i - 1]) / step);
  }
  return { xs, as };
}
