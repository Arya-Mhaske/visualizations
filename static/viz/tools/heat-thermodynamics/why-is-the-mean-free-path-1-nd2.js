import { createTool } from '../../lib/tool.js';
import { createRng } from '../../lib/rng.js';
import { dot, line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// A molecule of diameter d moves along the x axis. Any other molecule's centre within distance d of the axis is hit: a tube of cross-section π d².
// Molecules are points with fixed random positions in a box 12 long and 6 × 6 across, taking the first N = n · volume.
const [LX, LY] = [12, 6];
const VOL = LX * LY * LY;
const rng = createRng(21);
const PTS = Array.from({ length: 1000 }, () => [rng.next() * LX, (rng.next() - 0.5) * LY, (rng.next() - 0.5) * LY]);
const state = { n: 1, d: 0.4 };
const pts = (s) => PTS.slice(0, Math.min(PTS.length, Math.round(s.n * VOL)));
const hit = (p, s) => p[1] * p[1] + p[2] * p[2] < s.d * s.d;
const lambda = (s) => 1 / (Math.PI * s.d * s.d * s.n);

createTool({
  state,
  label: 'Left: a side view of a moving molecule sweeping a tube along the x axis through a cloud of molecules. Molecules inside the tube are coral and are the ones it hits. Right: the same cloud looking down the tube, with a circle of radius d. The tube has cross-section pi d squared, so the number of hits grows with n times d squared.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min((W * 0.62) / LX, (H * 0.9) / LY);
    const [x0, y0] = [8, H / 2];
    ctx.fillStyle = c.fillY;
    ctx.fillRect(x0, y0 - state.d * s, LX * s, 2 * state.d * s);
    line(ctx, x0, y0, x0 + LX * s, y0, { color: c.ink, width: 2, dash: [5, 4] });
    const list = pts(state);
    let first = null;
    for (const p of list) if (hit(p, state) && (first === null || p[0] < first[0])) first = p;
    for (const p of list) if (!hit(p, state)) dot(ctx, x0 + p[0] * s, y0 + p[1] * s, 1.6, c.grid, c.grid, 0.5);
    for (const p of list) if (hit(p, state)) dot(ctx, x0 + p[0] * s, y0 + p[1] * s, 3.5, c.a, c.ink, 1.5);
    if (first) line(ctx, x0 + first[0] * s, y0 - state.d * s - 8, x0 + first[0] * s, y0 + state.d * s + 8, { color: c.ink, width: 3 });
    label(ctx, first ? `first hit at ${fixed(first[0], 1)}` : 'no hit', x0 + (first ? first[0] : 6) * s, y0 - LY * s * 0.42, c, { size: 11, bounds: stage, patch: false });
    // end view
    const [ex, ey, es] = [W * 0.82, H / 2, Math.min((W * 0.32) / LY, (H * 0.8) / LY)];
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(ex - (LY * es) / 2, ey - (LY * es) / 2, LY * es, LY * es);
    for (const p of list) dot(ctx, ex + p[1] * es, ey + p[2] * es, 1.4, hit(p, state) ? c.a : c.grid, hit(p, state) ? c.ink : c.grid, 0.5);
    ctx.beginPath();
    ctx.arc(ex, ey, state.d * es, 0, Math.PI * 2);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    label(ctx, 'end view', ex, ey + (LY * es) / 2 + 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Sweep a tube' },
    { key: 'd', label: 'Diameter d', min: 0.2, max: 0.7, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'n', label: 'Density n (per unit³)', min: 0.25, max: 2, step: 0.25, format: (v) => fixed(v, 2) },
    { readout: [
      ['Tube cross-section π d²', (s) => fixed(Math.PI * s.d * s.d, 3)],
      ['Hits in this length', (s) => pts(s).filter((p) => hit(p, s)).length],
      ['Expected n π d² L', (s) => fixed(s.n * Math.PI * s.d * s.d * LX, 1)],
      ['Mean free path', (s) => fixed(lambda(s), 2)],
    ] },
  ],
  tex: (s) => `\\lambda=\\dfrac{1}{n\\,\\pi d^{2}}=\\dfrac{1}{${fixed(s.n, 2)}\\times\\pi\\times ${fixed(s.d, 2)}^{2}}=${fixed(lambda(s), 2)}`,
});
