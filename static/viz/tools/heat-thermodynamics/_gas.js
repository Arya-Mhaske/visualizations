// An ideal gas of point molecules in a box W × H × D (reduced units, k = 1, so ⟨½mv²⟩ = (3/2)T). No collisions between molecules.
// The right wall at x = W measures the impulse, so pressure P = impulse / (time · H · D).
//   const gas = createGas({ masses: [1, 1, ...], T: 1, W: 10 });  gas.step(dt); gas.setT(T); gas.setW(W); gas.setM(m)
//   gas.P is the pressure of the last whole second; gas.rate its wall hits per second; gas.ke() and gas.v2() are ⟨½mv²⟩ and ⟨v²⟩.
//   drawGas(ctx, stage, c, gas, { colourOf }) draws the box (x, y view) with the right wall as a piston.
import { createRng } from '../../lib/rng.js';
import { line, dot } from '../../lib/draw.js';

export const W_MAX = 12;
export function createGas({ masses, T = 1, W = 10, H = 6, D = 6, seed = 3 }) {
  const rng = createRng(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rng.next())) * Math.cos(2 * Math.PI * rng.next());
  const N = masses.length;
  const g = { N, m: masses.slice(), T, W, H, D, x: [], y: [], z: [], vx: [], vy: [], vz: [], impulse: 0, hits: 0, clock: 0, P: 0, rate: 0, seen: false };
  for (let i = 0; i < N; i++) {
    const s = Math.sqrt(T / g.m[i]);
    g.x.push(rng.next() * W); g.y.push(rng.next() * H); g.z.push(rng.next() * D);
    g.vx.push(gauss() * s); g.vy.push(gauss() * s); g.vz.push(gauss() * s);
  }
  g.setT = (Tn) => {
    const s = Math.sqrt(Tn / g.T);
    for (let i = 0; i < N; i++) { g.vx[i] *= s; g.vy[i] *= s; g.vz[i] *= s; }
    g.T = Tn;
  };
  g.setW = (Wn) => { g.W = Wn; for (let i = 0; i < N; i++) g.x[i] = Math.min(g.x[i], Wn - 1e-6); };
  g.setM = (m) => {
    const s = Math.sqrt(g.m[0] / m);
    for (let i = 0; i < N; i++) { g.vx[i] *= s; g.vy[i] *= s; g.vz[i] *= s; g.m[i] = m; }
  };
  g.step = (dt) => {
    let vmax = 0.1;
    for (let i = 0; i < N; i++) vmax = Math.max(vmax, Math.abs(g.vx[i]), Math.abs(g.vy[i]), Math.abs(g.vz[i]));
    const n = Math.max(1, Math.ceil((vmax * dt) / 0.25));
    const h = dt / n;
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < N; i++) {
        g.x[i] += g.vx[i] * h; g.y[i] += g.vy[i] * h; g.z[i] += g.vz[i] * h;
        if (g.x[i] < 0) { g.x[i] = -g.x[i]; g.vx[i] = -g.vx[i]; }
        else if (g.x[i] > g.W) { g.x[i] = 2 * g.W - g.x[i]; g.impulse += 2 * g.m[i] * Math.abs(g.vx[i]); g.hits++; g.vx[i] = -g.vx[i]; }
        if (g.y[i] < 0) { g.y[i] = -g.y[i]; g.vy[i] = -g.vy[i]; } else if (g.y[i] > g.H) { g.y[i] = 2 * g.H - g.y[i]; g.vy[i] = -g.vy[i]; }
        if (g.z[i] < 0) { g.z[i] = -g.z[i]; g.vz[i] = -g.vz[i]; } else if (g.z[i] > g.D) { g.z[i] = 2 * g.D - g.z[i]; g.vz[i] = -g.vz[i]; }
      }
      g.clock += h;
      if (g.clock >= 1) {
        const P = g.impulse / (g.clock * g.H * g.D);
        g.P = g.seen ? 0.5 * g.P + 0.5 * P : P;
        g.rate = g.hits / g.clock;
        g.seen = true; g.impulse = 0; g.hits = 0; g.clock = 0;
      }
    }
  };
  g.v2 = () => { let s = 0; for (let i = 0; i < N; i++) s += g.vx[i] ** 2 + g.vy[i] ** 2 + g.vz[i] ** 2; return s / N; };
  g.ke = () => { let s = 0; for (let i = 0; i < N; i++) s += 0.5 * g.m[i] * (g.vx[i] ** 2 + g.vy[i] ** 2 + g.vz[i] ** 2); return s / N; };
  g.kes = () => g.m.map((m, i) => 0.5 * m * (g.vx[i] ** 2 + g.vy[i] ** 2 + g.vz[i] ** 2));
  g.vol = () => g.W * g.H * g.D;
  return g;
}

export function frameOf(stage, gas, area = { x: 0, y: 0, w: stage.w, h: stage.h }) {
  const s = Math.min((area.w - 24) / W_MAX, (area.h - 16) / gas.H);
  return { s, x0: area.x + 10, y0: area.y + (area.h - gas.H * s) / 2 };
}

export function drawGas(ctx, stage, c, gas, { colourOf = () => c.a, area } = {}) {
  const { s, x0, y0 } = frameOf(stage, gas, area);
  ctx.fillStyle = c.fillY;
  ctx.fillRect(x0, y0, gas.W * s, gas.H * s);
  const wallX = x0 + gas.W * s;
  line(ctx, x0, y0, wallX, y0, { color: c.ink, width: 4 });
  line(ctx, x0, y0 + gas.H * s, wallX, y0 + gas.H * s, { color: c.ink, width: 4 });
  line(ctx, x0, y0, x0, y0 + gas.H * s, { color: c.ink, width: 4 });
  line(ctx, wallX, y0 - 2, wallX, y0 + gas.H * s + 2, { color: c.ink, width: 8 });
  for (let i = 0; i < gas.N; i++) dot(ctx, x0 + gas.x[i] * s, y0 + gas.y[i] * s, 3 + Math.min(3, Math.sqrt(gas.m[i]) - 1), colourOf(i), c.ink, 1.5);
  return { s, x0, y0 };
}
