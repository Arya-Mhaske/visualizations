import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { growth, rad } from './_right-triangle-math.js';

const state = { theta: 50 };

createTool({
  state,
  label: 'Top: a right triangle whose hypotenuse is always 1. As the angle grows towards 90 degrees, the opposite side climbs towards 1 but never passes it, while the adjacent side shrinks. Bottom: graphs of sine, cosine and tangent against the angle. Sine and cosine stay below the line at 1. Tangent shoots off the top.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 90], y: [0, 5], c, pad: 20, box: (g) => ({ x: 0, y: g.h * 0.42, w: g.w, h: g.h * 0.58 }),
  }),
  draw(ctx, stage, c, plot) {
    const { sin, cos, tan } = growth(state.theta);
    // triangle: hypotenuse is a fixed length, one unit
    const k = Math.min(stage.w * 0.5, stage.h * 0.32);
    const A = [stage.w * 0.12, stage.h * 0.38];
    const B = [A[0] + k * cos, A[1] - k * sin];
    const C = [B[0], A[1]];
    poly(ctx, [A, C, B], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...A, ...B, { color: c.d, width: 6 });
    line(ctx, ...C, ...B, { color: c.a, width: 6 });
    line(ctx, ...A, ...C, { color: c.b, width: 6 });
    line(ctx, A[0] + k, A[1], A[0] + k, A[1] - k, { color: c.grid, width: 1, dash: [4, 4] });
    line(ctx, A[0], A[1] - k, A[0] + k, A[1] - k, { color: c.grid, width: 1, dash: [4, 4] });
    // graphs
    plot.axes({ grid: true, xLabel: 'θ (°)', yLabel: 'value' });
    plot.segment(0, 1, 90, 1, { color: c.ink, width: 2, dash: [6, 5] });
    plot.fn((x) => Math.sin(rad(x)), { color: c.a });
    plot.fn((x) => Math.cos(rad(x)), { color: c.b });
    plot.fn((x) => Math.tan(rad(x)), { color: c.d });
    plot.segment(state.theta, 0, state.theta, 5, { color: c.grid, width: 1 });
    plot.point(state.theta, sin, { fill: c.a, r: 6 });
    plot.point(state.theta, cos, { fill: c.b, r: 6 });
    plot.point(state.theta, Math.min(tan, 4.9), { fill: c.d, r: 6 });
    plot.text('1', 3, 1.25, { size: 11 });
  },
  controls: [
    { title: 'Push θ towards 90°' },
    { key: 'theta', label: 'Angle, θ', min: 1, max: 89.9, step: 0.1, format: (n) => `${fixed(n, 1)}°` },
    { readout: [
      ['Hypotenuse', () => '1 (always the longest)'],
      ['sin θ', (s) => fixed(growth(s.theta).sin, 4)],
      ['cos θ', (s) => fixed(growth(s.theta).cos, 4)],
      ['tan θ', (s) => sig(growth(s.theta).tan, 4)],
    ] },
  ],
  tex: (s) => `\\sin\\theta=\\dfrac{\\text{opp}}{1}\\le 1,\\quad \\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}=\\dfrac{${fixed(growth(s.theta).sin, 3)}}{${fixed(growth(s.theta).cos, 3)}}=${sig(growth(s.theta).tan, 4)}`,
});
