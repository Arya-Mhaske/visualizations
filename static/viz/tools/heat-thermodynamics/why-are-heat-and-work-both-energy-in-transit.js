import { createTool } from '../../lib/tool.js';
import { poly, line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// One mole of a monatomic gas (Cv = 1.5 R = 12.47 J/K) starts at 300 K.
const CV = 1.5 * 8.314;
const state = { E: 600, f: 50 };
const Q = (s) => (s.E * (100 - s.f)) / 100;
const W = (s) => (s.E * s.f) / 100;
const Tend = (s) => 300 + s.E / CV;

createTool({
  state,
  label: 'A gas in a cylinder is warmed by a flame under it and stirred by a paddle inside it. A stacked bar shows the heat and the stirring work adding to the total energy. A thermometer shows the final temperature, which depends only on the total.',
  draw(ctx, stage, c) {
    const [W0, H] = [stage.w, stage.h];
    const [cx0, cx1, cy0, cy1] = [W0 * 0.06, W0 * 0.5, H * 0.18, H * 0.7];
    ctx.fillStyle = c.fillY;
    ctx.fillRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
    line(ctx, cx0, cy0 - 6, cx0, cy1, { color: c.ink, width: 4 });
    line(ctx, cx1, cy0 - 6, cx1, cy1, { color: c.ink, width: 4 });
    line(ctx, cx0, cy1, cx1, cy1, { color: c.ink, width: 4 });
    line(ctx, cx0, cy0 - 6, cx1, cy0 - 6, { color: c.ink, width: 4 });
    const q = Q(state);
    const flame = (q / 1000) * H * 0.18;
    if (q > 0) poly(ctx, [[(cx0 + cx1) / 2 - 22, cy1 + 4], [(cx0 + cx1) / 2 + 22, cy1 + 4], [(cx0 + cx1) / 2, cy1 + 4 + flame + 6]], { fill: c.a, stroke: c.ink, width: 2 });
    const [px, py] = [(cx0 + cx1) / 2, (cy0 + cy1) / 2];
    const blade = 8 + (W(state) / 1000) * 40;
    line(ctx, px, cy0 - 6, px, py, { color: c.ink, width: 3 });
    line(ctx, px - blade, py - blade * 0.3, px + blade, py + blade * 0.3, { color: c.b, width: 6 });
    line(ctx, px - blade * 0.3, py + blade, px + blade * 0.3, py - blade, { color: c.b, width: 6 });
    label(ctx, `heat Q = ${fixed(q, 0)} J`, (cx0 + cx1) / 2, H * 0.93, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `stirring W = ${fixed(W(state), 0)} J`, (cx0 + cx1) / 2, H * 0.08, c, { size: 11, bounds: stage, patch: false });
    // stacked energy bar and thermometer
    const bx = W0 * 0.62;
    const base = H * 0.82;
    const unit = (H * 0.62) / 1000;
    ctx.fillStyle = c.fillA;
    ctx.fillRect(bx, base - q * unit, 26, q * unit);
    ctx.fillStyle = c.fillB;
    ctx.fillRect(bx, base - (q + W(state)) * unit, 26, W(state) * unit);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, base - state.E * unit, 26, state.E * unit);
    label(ctx, 'Q + W', bx + 13, base + 14, c, { size: 11, bounds: stage, patch: false });
    const tx = W0 * 0.84;
    const th = ((Tend(state) - 300) / 100) * (H * 0.62);
    ctx.fillStyle = c.fillC;
    ctx.fillRect(tx, base - th, 26, th);
    ctx.strokeRect(tx, base - H * 0.62, 26, H * 0.62);
    label(ctx, `${fixed(Tend(state), 1)} K`, tx + 13, base - H * 0.62 - 10, c, { size: 11, bounds: stage, patch: false });
    label(ctx, 'final T', tx + 13, base + 14, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Add energy two ways' },
    { key: 'E', label: 'Total energy added (J)', min: 100, max: 1000, step: 100 },
    { key: 'f', label: 'Share given by stirring (%)', min: 0, max: 100, step: 10 },
    { readout: [
      ['Heat Q', (s) => `${fixed(Q(s), 0)} J`],
      ['Stirring work W', (s) => `${fixed(W(s), 0)} J`],
      ['Final T', (s) => `${fixed(Tend(s), 1)} K`],
    ] },
  ],
  tex: (s) => `\\Delta T=\\dfrac{Q+W}{nC_v}=\\dfrac{${fixed(Q(s), 0)}+${fixed(W(s), 0)}}{12.47}=${fixed(s.E / CV, 1)}\\ \\mathrm{K}`,
});
