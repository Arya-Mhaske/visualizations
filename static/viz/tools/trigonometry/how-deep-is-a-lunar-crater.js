import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, label, line, poly, wedge } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// A crater rim of height H throws a shadow of length L across the floor. The Sun is e degrees above the horizon.
const state = { sun: 20, shadow: 4 };
const rad = (d) => (d * Math.PI) / 180;
const height = (s = state) => s.shadow * Math.tan(rad(s.sun));

const tool = createTool({
  state,
  label: 'Top: a crater rim on the Moon, the Sun’s ray grazing the rim, and the shadow it throws along the floor. Bottom: a graph of rim height divided by shadow length against the Sun’s angle, with a dot at the current angle.',
  setup: (stage, c) => createPlot(stage, { x: [0, 80], y: [0, 6], c, pad: 30, box: (g) => ({ x: 0, y: g.h * 0.58, w: g.w, h: g.h * 0.42 }) }),
  draw(ctx, stage, c, plot) {
    const top = stage.h * 0.55;
    const ground = top * 0.88;
    const H = Math.max(height(), 0.1);
    const u = Math.min((stage.w * 0.8) / state.shadow, (top * 0.75) / H);
    const rimX = stage.w * 0.08;
    const foot = [rimX + state.shadow * u, ground];
    const peak = [rimX, ground - H * u];
    poly(ctx, [[rimX, ground], peak, foot], { fill: c.fillY, stroke: c.ink, width: 3 });
    poly(ctx, [[0, ground], [0, ground - H * u * 0.2], [rimX, ground - H * u], [rimX, ground]], { fill: c.fillA, stroke: c.ink, width: 3 });
    line(ctx, rimX, ground, foot[0], ground, { color: c.d, width: 7 });
    line(ctx, rimX, ground, ...peak, { color: c.c, width: 7 });
    wedge(ctx, ...foot, 28, Math.PI, Math.PI + rad(state.sun), { fill: c.fillB, stroke: c.ink, width: 2 });
    dot(ctx, ...peak, 5, c.paper, c.ink);
    label(ctx, `shadow ${fixed(state.shadow, 1)} km`, (rimX + foot[0]) / 2, ground + 12, c, { size: 11, bounds: stage, patch: false });
    label(ctx, `H = ${fixed(H, 2)} km`, rimX + 8, (ground + peak[1]) / 2, c, { size: 11, align: 'left', color: c.c, bounds: stage });
    label(ctx, `${state.sun}°`, foot[0] - 44, ground - 6, c, { size: 11, patch: false, bounds: stage });
    plot.axes({ xLabel: 'Sun (°)', yLabel: 'H ÷ shadow' });
    plot.fn((d) => Math.tan(rad(d)), { color: c.c });
    plot.point(state.sun, Math.tan(rad(state.sun)), { fill: c.a, r: 6 });
  },
  controls: () => [
    { title: 'Measure the shadow' },
    { key: 'sun', label: 'Sun’s angle above the horizon', min: 5, max: 70, step: 1, format: (n) => `${n}°` },
    { key: 'shadow', label: 'Shadow length, L', min: 0.5, max: 10, step: 0.1, format: (n) => `${fixed(n, 1)} km` },
    { readout: [
      ['Ratio H ÷ L', () => fixed(Math.tan(rad(state.sun)), 3)],
      ['Rim height, H', () => ({ text: `${fixed(height(), 2)} km`, good: true })],
    ] },
  ],
  tex: (s) => `H=L\\times\\dfrac{H}{L}=${fixed(s.shadow, 1)}\\times ${fixed(Math.tan(rad(s.sun)), 3)}=${fixed(height(s), 2)}\\ \\text{km}`,
});
tool.update();
