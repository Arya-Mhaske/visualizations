// Pure maths for the "What is a Wave?" box. No DOM.
//   pulse(x, t, p)          Gaussian pulse height y = A·exp(−((x − x0 − vt)/w)²) travelling right at v
//   pulseVel(x, t, p)       the vertical speed ∂y/∂t of the medium at x
//   energyCentre(xs, t, p)  centroid of the kinetic energy ∝ (∂y/∂t)² over the points xs
//   shift(x0, t, A, lambda, T)   displacement s = A sin(2π(x0/λ − t/T)) of the particle whose rest place is x0
//   densityRatio(x0, t, A, lambda, T)   ρ/ρ₀ = 1/(1 + ∂s/∂x0) for the longitudinal case
//   airLayout(n, seed)      n molecules at seeded places in the unit square, in a fixed order of removal
//   relay(points, reach, bell, glass)   hop count for a push to travel bell → glass, or null if it cannot
//   standing(i, t, delay, stand)   is person i standing at time t (they rise when the wave arrives)
import { createRng } from '../../lib/rng.js';

const TAU = Math.PI * 2;

export function pulse(x, t, { A, v, w, x0 }) {
  const u = (x - x0 - v * t) / w;
  return A * Math.exp(-u * u);
}

export function pulseVel(x, t, { A, v, w, x0 }) {
  const u = (x - x0 - v * t) / w;
  return A * Math.exp(-u * u) * (2 * u * v) / w;
}

export function energyCentre(xs, t, p) {
  let top = 0;
  let bottom = 0;
  for (const x of xs) {
    const e = pulseVel(x, t, p) ** 2;
    top += x * e;
    bottom += e;
  }
  return top / bottom;
}

export const shift = (x0, t, A, lambda, T) => A * Math.sin(TAU * (x0 / lambda - t / T));

// ρ/ρ₀ = 1/(1 + ds/dx0), with ds/dx0 = A·(2π/λ)·cos(...). Needs A·2π/λ < 1 so the particles never pass each other.
export const densityRatio = (x0, t, A, lambda, T) => 1 / (1 + A * (TAU / lambda) * Math.cos(TAU * (x0 / lambda - t / T)));

export const maxCompression = (A, lambda) => 1 / (1 - A * (TAU / lambda));
export const maxRarefaction = (A, lambda) => 1 / (1 + A * (TAU / lambda));

export const SAFE = 0.9; // A·k stays under this, so neighbours never cross.

export const FULL = 140; // molecules in the jar at normal pressure
export const REACH = 0.15; // how far a molecule can pass the push on, as a fraction of the jar's length

// Molecules in the unit square (bell at the left edge, glass at the right). The first n of a fixed list,
// so pumping air out only ever removes molecules and never moves the rest.
export function airLayout(n, seed = 7) {
  const rng = createRng(seed);
  return Array.from({ length: n }, () => [rng.next(), rng.next()]);
}

// Breadth-first hand-offs. A molecule passes a push to any other within `reach`.
// Starts from molecules within `reach` of the bell (x = 0), finishes at any within `reach` of the glass (x = 1).
// Returns { hops, depth } where depth[i] is the hop number at which molecule i is reached (or -1), hops null if unreachable.
export function relay(points, reach) {
  const depth = points.map(() => -1);
  let frontier = [];
  points.forEach(([x], i) => { if (x <= reach) { depth[i] = 1; frontier.push(i); } });
  let level = 1;
  while (frontier.length) {
    const next = [];
    for (const i of frontier) {
      points.forEach(([x, y], j) => {
        if (depth[j] === -1 && Math.hypot(x - points[i][0], y - points[i][1]) <= reach) {
          depth[j] = level + 1;
          next.push(j);
        }
      });
    }
    frontier = next;
    level += 1;
  }
  let hops = null;
  points.forEach(([x], i) => { if (depth[i] > 0 && x >= 1 - reach && (hops === null || depth[i] + 1 < hops)) hops = depth[i] + 1; });
  return { hops, depth };
}

export const standing = (i, t, delay, stand) => t >= i * delay && t < i * delay + stand;
export const standingCount = (n, t, delay, stand) => {
  let count = 0;
  for (let i = 0; i < n; i++) if (standing(i, t, delay, stand)) count += 1;
  return count;
};
