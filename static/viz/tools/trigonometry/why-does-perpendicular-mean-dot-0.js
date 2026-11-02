import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, arrowW, drawGrid, eqFrame, rad, segW } from './_kit.js';

const state = { th: 50, lu: 4, lv: 5 };
const dotp = (th = state.th) => state.lu * state.lv * Math.cos(rad(th));

createTool({
  state,
  label: 'Top: vector v along the horizontal axis and vector u that you swing round it. The green shadow of u on v shrinks as the angle grows and vanishes at 90 degrees. Bottom: the dot product against the angle, a cosine wave that crosses zero exactly at 90 degrees.',
  setup: (stage, c) => createPlot(stage, { x: [0, 180], y: [-38, 38], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.62, w: g.w, h: g.h * 0.38 }) }),
  draw(ctx, stage, c, plot) {
    const top = { w: stage.w, h: stage.h * 0.62 };
    const f = eqFrame(top, [-6.5, 6.5], [-0.8, 6], 6);
    drawGrid(ctx, f, c, top, { step: 1, labels: false, axes: false });
    const u = [state.lu * Math.cos(rad(state.th)), state.lu * Math.sin(rad(state.th))];
    segW(ctx, f, u, [u[0], 0], { color: c.grid, width: 2, dash: [5, 4] });
    segW(ctx, f, [0, 0], [u[0], 0], { color: c.c, width: 10 });
    arrowW(ctx, f, [0, 0], [state.lv, 0], { color: c.b, width: 5, head: 12 });
    arrowW(ctx, f, [0, 0], u, { color: c.a, width: 5, head: 12 });
    angleArc(ctx, f.px([0, 0]), f.px([1, 0]), f.px(u), 28, { color: c.ink, width: 3 });
    dot(ctx, ...f.px(u), 9, c.a, c.ink);
    label(ctx, `shadow = ${fixed(state.lu * Math.cos(rad(state.th)), 2)}`, f.px([u[0] / 2, 0])[0], f.px([0, 0])[1] + 16, c, { size: 11, color: c.c, bounds: stage, patch: false });
    label(ctx, 'u', f.px(u)[0] + 10, f.px(u)[1] - 10, c, { size: 13, color: c.a, bounds: stage, patch: false });
    label(ctx, 'v', f.px([state.lv, 0])[0], f.px([0, 0])[1] + 16, c, { size: 13, color: c.b, bounds: stage, patch: false });
    plot.axes({ xLabel: 'θ (°)', yLabel: 'u · v' });
    plot.fn((t) => dotp(t), { color: c.d, width: 4 });
    plot.point(state.th, dotp(), { fill: Math.abs(dotp()) < 1e-9 ? c.c : c.a });
  },
  controls: [
    { title: 'Swing u round v' },
    { key: 'th', label: 'Angle θ', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { key: 'lu', label: 'Length of u', min: 2, max: 6, step: 1 },
    { key: 'lv', label: 'Length of v', min: 2, max: 6, step: 1 },
    { readout: [
      ['Shadow of u on v', () => fixed(state.lu * Math.cos(rad(state.th)), 3)],
      ['u · v', () => { const d = dotp(); return { text: fixed(Math.abs(d) < 1e-9 ? 0 : d, 2), good: Math.abs(d) < 1e-9 }; }],
      ['Perpendicular?', () => (state.th === 90 ? { text: 'Yes: dot product 0', good: true } : 'No')],
    ] },
  ],
  tex: () => `u\\cdot v=\\|u\\|\\|v\\|\\cos ${state.th}^\\circ=${fixed(Math.abs(dotp()) < 1e-9 ? 0 : dotp(), 2)}`,
});
