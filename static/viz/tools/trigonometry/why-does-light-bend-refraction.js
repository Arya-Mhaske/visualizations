import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, arrow, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { N, deg, rad, refractAngle, sinD } from './_right-triangle-math.js';

const state = { alpha: 50, medium: 'water' };
const beta = (s = state) => refractAngle(s.alpha, 1, N[s.medium]);

createTool({
  state,
  label: 'Top: a ray of light arriving at a flat surface between air above and a denser material below. It bends towards the dashed normal line. Bottom: a graph of the sine of the angle in the material against the sine of the angle in air. Every ray you try falls on one straight line, which is Snell\'s law.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 1], y: [0, 1], c, pad: 22, box: (g) => ({ x: g.w * 0.2, y: g.h * 0.55, w: g.w * 0.6, h: g.h * 0.45 }),
  }),
  draw(ctx, stage, c, plot) {
    const mid = stage.h * 0.28;
    const O = [stage.w / 2, mid];
    const L = Math.min(stage.w * 0.4, stage.h * 0.24);
    poly(ctx, [[0, mid], [stage.w, mid], [stage.w, stage.h * 0.5], [0, stage.h * 0.5]], { fill: c.fillB });
    line(ctx, 0, mid, stage.w, mid, { color: c.ink, width: 3 });
    line(ctx, O[0], mid - L, O[0], stage.h * 0.5, { color: c.grid, width: 2, dash: [6, 5] });
    const a = rad(state.alpha);
    const b = rad(beta());
    const from = [O[0] - L * Math.sin(a), mid - L * Math.cos(a)];
    const to = [O[0] + L * Math.sin(b), mid + L * Math.cos(b)];
    arrow(ctx, ...from, ...O, { color: c.a, width: 3, head: 12 });
    arrow(ctx, ...O, ...to, { color: c.d, width: 3, head: 12 });
    arc(ctx, ...O, 30, -Math.PI / 2 - a, -Math.PI / 2, { color: c.a, width: 3 });
    arc(ctx, ...O, 30, Math.PI / 2 - b, Math.PI / 2, { color: c.d, width: 3 });
    label(ctx, `α ${state.alpha}°`, O[0] - 56, mid - 40, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, `β ${fixed(beta(), 1)}°`, O[0] + 56, mid + 44, c, { size: 11, color: c.d, bounds: stage, patch: false });
    label(ctx, 'air', 24, mid - 12, c, { size: 11, bounds: stage, patch: false });
    label(ctx, state.medium, 30, mid + 14, c, { size: 11, bounds: stage, patch: false });
    // the sine plot: sin β against sin α is a straight line of slope 1/n
    plot.axes({ grid: true, xLabel: 'sin α', yLabel: 'sin β' });
    plot.segment(0, 0, 1, 1 / N[state.medium], { color: c.d, width: 3 });
    plot.point(sinD(state.alpha), sinD(beta()), { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Send light into a material' },
    { key: 'medium', label: 'Material', options: [['water', 'Water'], ['glass', 'Glass'], ['diamond', 'Diamond']] },
    { key: 'alpha', label: 'Angle in air, α', min: 5, max: 85, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Angle in the material, β', (s) => `${fixed(beta(s), 2)}°`],
      ['sin α ÷ sin β', (s) => fixed(sinD(s.alpha) / sinD(beta(s)), 4)],
      ['α ÷ β', (s) => fixed(s.alpha / beta(s), 3)],
      ['Index of the material', (s) => N[s.medium]],
    ] },
  ],
  tex: (s) => `\\dfrac{\\sin\\alpha}{\\sin\\beta}=\\dfrac{${fixed(sinD(s.alpha), 4)}}{${fixed(sinD(beta(s)), 4)}}=${fixed(sinD(s.alpha) / sinD(beta(s)), 3)}=n`,
});
