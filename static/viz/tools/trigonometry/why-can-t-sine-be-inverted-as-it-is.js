import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, crossings } from './_inverses-math.js';

const state = { h: 0.5, restrict: false };
const lo = () => (state.restrict ? -Math.PI / 2 : -TAU);
const hi = () => (state.restrict ? Math.PI / 2 : TAU);
const hits = () => (Math.abs(state.h) > 1 ? [] : crossings(Math.sin, state.h, lo(), hi()));

createTool({
  state,
  label: 'The sine graph with a horizontal line at height h. Coral points mark every place the line meets the wave. With the whole wave there are many hits, so the output does not name a single input. Restricted to minus pi over 2 to pi over 2, there is one hit.',
  setup: (stage, c) => createPlot(stage, { x: [-TAU - 0.3, TAU + 0.3], y: [-1.5, 1.5], c, ticks: 'pi', pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(Math.sin, { color: c.grid, width: 3 });
    plot.fn(Math.sin, { color: c.b, width: 5, domain: [lo(), hi()] });
    plot.segment(-TAU - 0.3, state.h, TAU + 0.3, state.h, { color: c.a, width: 3 });
    for (const x of hits()) dot(ctx, ...plot.toPx(x, state.h), 8, c.a, c.ink);
  },
  controls: [
    { title: 'Sweep a line across the wave' },
    { key: 'h', label: 'Height, h', min: -1.2, max: 1.2, step: 0.05, format: (n) => fixed(n, 2) },
    { toggle: true, key: 'restrict', label: 'Keep only −π/2 to π/2' },
    { readout: [
      ['Hits on the blue part', (s) => { const n = hits().length; return { text: String(n), good: n === 1 }; }],
      ['One answer for each h?', (s) => (s.restrict ? (Math.abs(s.h) <= 1 ? 'Yes' : 'None for |h| > 1') : { text: 'No', good: false })],
    ] },
  ],
  tex: (s) => `\\sin x=${fixed(s.h, 2)}\\ \\text{has}\\ ${hits().length}\\ \\text{answers}\\ \\text{on the blue part}`,
});
