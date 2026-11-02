// A gas of hard discs in a 2D box (reduced units: mass 1, speeds with unit variance per axis), one disc tagged. Used for the mean free path.
//   const d = createDisks({ N: 60, r: 0.15 });  d.step(dt);  d.trail (tagged positions), d.path, d.coll, d.start, d.tag()
// Mean free path in 2D is 1 / (√2 · 2 diameter · number per area): the swept strip is 2 diameters wide.
import { createRng } from '../../lib/rng.js';

export const mfp2d = (N, diameter, area) => 1 / (Math.SQRT2 * 2 * diameter * (N / area));
export function createDisks({ N = 60, r = 0.15, W = 10, H = 6, seed = 5 }) {
  const rng = createRng(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rng.next())) * Math.cos(2 * Math.PI * rng.next());
  const d = { N, r, W, H, x: [], y: [], vx: [], vy: [], trail: [], path: 0, coll: 0, time: 0 };
  // place on a loose grid so no two overlap at the start
  const cols = Math.ceil(Math.sqrt((N * W) / H));
  const rows = Math.ceil(N / cols);
  for (let i = 0; i < N; i++) {
    d.x.push(((i % cols) + 0.5) * (W / cols)); d.y.push((Math.floor(i / cols) + 0.5) * (H / rows));
    d.vx.push(gauss()); d.vy.push(gauss());
  }
  d.start = [d.x[0], d.y[0]];
  d.trail.push([d.x[0], d.y[0]]);
  d.step = (dt) => {
    let vmax = 1;
    for (let i = 0; i < N; i++) vmax = Math.max(vmax, Math.abs(d.vx[i]), Math.abs(d.vy[i]));
    const n = Math.max(1, Math.ceil((vmax * dt) / 0.08));
    const h = dt / n;
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < N; i++) {
        d.x[i] += d.vx[i] * h; d.y[i] += d.vy[i] * h;
        if (d.x[i] < r) { d.x[i] = 2 * r - d.x[i]; d.vx[i] = -d.vx[i]; } else if (d.x[i] > W - r) { d.x[i] = 2 * (W - r) - d.x[i]; d.vx[i] = -d.vx[i]; }
        if (d.y[i] < r) { d.y[i] = 2 * r - d.y[i]; d.vy[i] = -d.vy[i]; } else if (d.y[i] > H - r) { d.y[i] = 2 * (H - r) - d.y[i]; d.vy[i] = -d.vy[i]; }
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = d.x[j] - d.x[i];
          const dy = d.y[j] - d.y[i];
          const dist2 = dx * dx + dy * dy;
          if (dist2 >= 4 * r * r || dist2 === 0) continue;
          const rel = (d.vx[j] - d.vx[i]) * dx + (d.vy[j] - d.vy[i]) * dy;
          if (rel >= 0) continue;
          const f = rel / dist2;
          d.vx[i] += f * dx; d.vy[i] += f * dy; d.vx[j] -= f * dx; d.vy[j] -= f * dy;
          if (i === 0 || j === 0) d.coll++;
        }
      }
      d.path += Math.hypot(d.vx[0], d.vy[0]) * h;
      d.time += h;
    }
    d.trail.push([d.x[0], d.y[0]]);
    if (d.trail.length > 4000) d.trail.shift();
  };
  d.tag = () => [d.x[0], d.y[0]];
  d.away = () => Math.hypot(d.x[0] - d.start[0], d.y[0] - d.start[1]);
  return d;
}
