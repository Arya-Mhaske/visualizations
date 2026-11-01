import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { SIN37, measuredOpposite, measuredRatio, worstError } from './_right-triangle-math.js';

const state = { hyp: 10 };

createTool({
  state,
  label: 'Top: a right triangle with a 37 degree angle, drawn as large as you choose. Bottom: a graph of the ratio you would get from a ruler that reads to the nearest millimetre, against the length of the hypotenuse. The ratio wobbles for small triangles and settles on the calculator value 0.6018 for big ones.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 100], y: [0.55, 0.65], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.4, w: g.w, h: g.h * 0.6 }),
  }),
  draw(ctx, stage, c, plot) {
    // the triangle (drawn to a fixed on-screen size; the numbers say how big it really is)
    const k = Math.min(stage.w * 0.5, stage.h * 0.3);
    const th = (37 * Math.PI) / 180;
    const A = [stage.w * 0.12, stage.h * 0.34];
    const B = [A[0] + k * Math.cos(th), A[1] - k * Math.sin(th)];
    const C = [B[0], A[1]];
    poly(ctx, [A, C, B], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...C, ...B, { color: c.a, width: 6 });
    line(ctx, ...A, ...B, { color: c.d, width: 6 });
    label(ctx, `hyp. ${state.hyp} cm`, (A[0] + B[0]) / 2 - 36, (A[1] + B[1]) / 2 - 6, c, { size: 11, color: c.d, bounds: stage, patch: false });
    label(ctx, `opp. ${fixed(measuredOpposite(state.hyp), 1)} cm`, C[0] + 6, (C[1] + B[1]) / 2, c, { size: 11, align: 'left', color: c.a, bounds: stage, patch: false });
    label(ctx, '37°', A[0] + 44, A[1] - 6, c, { size: 12, bounds: stage, patch: false });
    // the graph
    plot.axes({ grid: true, xLabel: 'hyp. (cm)', yLabel: 'ratio' });
    plot.segment(0, SIN37, 100, SIN37, { color: c.c, width: 3 });
    plot.fn((L) => SIN37 + worstError(L), { color: c.grid, width: 2, dash: [5, 4], domain: [3, 100] });
    plot.fn((L) => SIN37 - worstError(L), { color: c.grid, width: 2, dash: [5, 4], domain: [3, 100] });
    for (let L = 3; L <= 100; L++) plot.point(L, measuredRatio(L), { fill: L === state.hyp ? c.a : c.fillA, r: L === state.hyp ? 7 : 2.5 });
  },
  controls: [
    { title: 'Draw a 37° triangle, big or small' },
    { key: 'hyp', label: 'Hypotenuse', min: 3, max: 100, step: 1, format: (n) => `${n} cm` },
    { readout: [
      ['Opposite side (to 1 mm)', (s) => `${fixed(measuredOpposite(s.hyp), 1)} cm`],
      ['Ratio you measure', (s) => fixed(measuredRatio(s.hyp), 4)],
      ['Calculator sin 37°', () => fixed(SIN37, 4)],
      ['Largest ruler error', (s) => `± ${fixed(worstError(s.hyp), 4)}`],
    ] },
  ],
  tex: (s) => `\\dfrac{\\text{opp}}{\\text{hyp}}=\\dfrac{${fixed(measuredOpposite(s.hyp), 1)}}{${s.hyp}}=${fixed(measuredRatio(s.hyp), 4)}\\ \\to\\ \\sin 37^\\circ=${fixed(SIN37, 4)}`,
});
