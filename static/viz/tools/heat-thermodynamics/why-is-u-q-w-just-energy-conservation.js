import { createTool } from '../../lib/tool.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// 1 mol monatomic gas at 300 K and 100 kPa in 10 L ... U = 1.5 n R T. Piston at constant pressure: W = P ΔV.
const U0 = 1.5 * 8.314 * 300;
const state = { Q: 400, W: 150 };
const Uend = (s) => U0 + s.Q - s.W;

createTool({
  state,
  label: 'A waterfall chart for an energy account. The first bar is the energy stored in the gas. Heat in adds to it, work done by the gas takes from it, and the last bar is the new stored energy. A small cylinder shows the piston moving when the gas does work.',
  draw(ctx, stage, c) {
    const [W0, H] = [stage.w, stage.h];
    const base = H * 0.86;
    const unit = (H * 0.68) / 5000;
    const bw = W0 * 0.14;
    const xs = [0.3, 0.46, 0.62, 0.78].map((k) => W0 * k);
    const U1 = U0 + state.Q;
    const rect = (x, from, to, fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x, base - Math.max(from, to) * unit, bw, Math.abs(to - from) * unit);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, base - Math.max(from, to) * unit, bw, Math.abs(to - from) * unit + 0.001);
    };
    line(ctx, W0 * 0.26, base, W0 * 0.96, base, { color: c.ink, width: 3 });
    rect(xs[0], 0, U0, c.fillY);
    rect(xs[1], U0, U1, c.fillA);
    rect(xs[2], U1, Uend(state), c.fillB);
    rect(xs[3], 0, Uend(state), c.fillC);
    ['U before', '+ Q', '− W', 'U after'].forEach((t, i) => label(ctx, t, xs[i] + bw / 2, base + 14, c, { size: 11, bounds: stage, patch: false }));
    label(ctx, `${fixed(U0, 0)}`, xs[0] + bw / 2, base - U0 * unit - 10, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `${fixed(Uend(state), 0)}`, xs[3] + bw / 2, base - Uend(state) * unit - 10, c, { size: 11, bounds: stage, patch: false });
    // cylinder: gas at 100 kPa, 10 L; W joules push the piston by W/100 L
    const [cx0, cx1, cy0, cy1] = [W0 * 0.04, W0 * 0.2, H * 0.12, H * 0.72];
    const level = Math.min(1.4, Math.max(0.2, (10 + state.W / 100) / 10));
    const py = cy1 - (cy1 - cy0) * 0.62 * level;
    ctx.fillStyle = c.fillY;
    ctx.fillRect(cx0, py, cx1 - cx0, cy1 - py);
    line(ctx, cx0, cy0, cx0, cy1, { color: c.ink, width: 4 });
    line(ctx, cx1, cy0, cx1, cy1, { color: c.ink, width: 4 });
    line(ctx, cx0, cy1, cx1, cy1, { color: c.ink, width: 4 });
    line(ctx, cx0, py, cx1, py, { color: c.ink, width: 6 });
    label(ctx, 'gas', (cx0 + cx1) / 2, (py + cy1) / 2, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Run the energy account' },
    { key: 'Q', label: 'Heat added Q (J)', min: -500, max: 500, step: 50 },
    { key: 'W', label: 'Work done by gas W (J)', min: -500, max: 500, step: 50 },
    { readout: [
      ['Stored before', (s) => `${fixed(U0, 0)} J`],
      ['ΔU = Q − W', (s) => `${fixed(s.Q - s.W, 0)} J`],
      ['Stored after', (s) => `${fixed(Uend(s), 0)} J`],
      ['Temperature', (s) => `${fixed(Uend(s) / (1.5 * 8.314), 1)} K`],
    ] },
  ],
  tex: (s) => `\\Delta U=Q-W=${fixed(s.Q, 0)}-(${fixed(s.W, 0)})=${fixed(s.Q - s.W, 0)}\\ \\mathrm{J}`,
});
