import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label, line, poly, wedge } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { theta: 35, h: 6 };
const rad = (d) => (d * Math.PI) / 180;
const legs = (s = state) => ({ opp: s.h * Math.sin(rad(s.theta)), adj: s.h * Math.cos(rad(s.theta)) });
const ratio = (s = state) => legs(s).opp / s.h;

const tool = createTool({
  state,
  label: 'Top: a right triangle with angle theta at the left corner and an adjustable hypotenuse. Bottom: a graph of opposite over hypotenuse against theta, with a dot at the current angle. Changing the size leaves the dot where it is; changing the angle moves it.',
  setup: (stage, c) => createPlot(stage, { x: [0, 90], y: [0, 1.05], c, pad: 30, box: (g) => ({ x: 0, y: g.h * 0.52, w: g.w, h: g.h * 0.48 }) }),
  draw(ctx, stage, c, plot) {
    const top = stage.h * 0.5;
    const u = Math.min((stage.w * 0.8) / 10, (top * 0.8) / 10);
    const O = [stage.w * 0.1, top * 0.92];
    const { opp, adj } = legs();
    const B = [O[0] + adj * u, O[1]];
    const T = [B[0], O[1] - opp * u];
    poly(ctx, [O, B, T], { fill: c.fillC, stroke: c.ink, width: 3 });
    wedge(ctx, ...O, 26, -rad(state.theta), 0, { fill: c.fillA, stroke: c.ink, width: 2 });
    line(ctx, ...B, ...T, { color: c.a, width: 5 });
    line(ctx, ...O, ...T, { color: c.b, width: 5 });
    label(ctx, 'opp', B[0] + 22, (B[1] + T[1]) / 2, c, { size: 12, color: c.a, bounds: stage, patch: false });
    label(ctx, 'hyp', (O[0] + T[0]) / 2 - 18, (O[1] + T[1]) / 2 - 8, c, { size: 12, color: c.b, bounds: stage });
    label(ctx, 'θ', O[0] + 38, O[1] - 8, c, { size: 13, patch: false });
    plot.axes({ xLabel: 'θ (°)', yLabel: 'opp/hyp' });
    plot.fn((d) => Math.sin(rad(d)), { color: c.c });
    plot.point(state.theta, ratio(), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Resize, then turn' },
    { key: 'h', label: 'Hypotenuse size', min: 2, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} cm` },
    { key: 'theta', label: 'Angle θ', min: 5, max: 85, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Opposite', () => `${fixed(legs().opp, 2)} cm`],
      ['Hypotenuse', () => `${fixed(state.h, 1)} cm`],
      ['opp ÷ hyp', () => fixed(ratio(), 3)],
      ['adj ÷ hyp', () => fixed(legs().adj / state.h, 3)],
      ['opp ÷ adj', () => fixed(legs().opp / legs().adj, 3)],
    ] },
  ],
  tex: (s) => `\\dfrac{\\text{opp}}{\\text{hyp}}=\\dfrac{${fixed(legs(s).opp, 2)}}{${fixed(s.h, 1)}}=${fixed(ratio(s), 3)}`,
});
tool.update();
