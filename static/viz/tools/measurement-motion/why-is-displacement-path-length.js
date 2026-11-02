import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { route: 'wiggle', k: 3, amp: 1 };
const Q = [8, 4];
function path(s) {
  if (s.route === 'straight') return [[0, 0], Q];
  if (s.route === 'elbow') return [[0, 0], [Q[0], 0], Q];
  const len = Math.hypot(...Q);
  const n = [-Q[1] / len, Q[0] / len];
  return Array.from({ length: 121 }, (_, i) => {
    const u = i / 120;
    const w = s.amp * Math.sin(2 * Math.PI * s.k * u);
    return [Q[0] * u + n[0] * w, Q[1] * u + n[1] * w];
  });
}
const length = (p) => p.slice(1).reduce((t, pt, i) => t + Math.hypot(pt[0] - p[i][0], pt[1] - p[i][1]), 0);

createTool({
  state,
  label: 'Start and end points joined by the chosen route. A straight line shows the displacement, and the route can be longer.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 10], y: [-3, 7], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    plot.segment(0, 0, ...Q, { color: c.c, width: 4 });
    const p = path(state);
    p.slice(1).forEach((pt, i) => plot.segment(p[i][0], p[i][1], pt[0], pt[1], { color: c.a, width: 3 }));
    plot.point(0, 0, { fill: c.ink });
    plot.point(...Q, { fill: c.ink });
  },
  controls: [
    { title: 'Choose a route' },
    { key: 'route', label: 'Route', options: [['straight', 'Straight'], ['elbow', 'L-shaped'], ['wiggle', 'Wiggly']] },
    { key: 'k', label: 'Wiggles', min: 1, max: 6, step: 1 },
    { key: 'amp', label: 'Wiggle size (m)', min: 0, max: 3, step: 0.25 },
    { readout: [
      ['Displacement', () => `${fixed(Math.hypot(...Q), 2)} m`],
      ['Path length', (s) => `${fixed(length(path(s)), 2)} m`],
      ['Path ≥ displacement', (s) => ({ text: length(path(s)) >= Math.hypot(...Q) - 1e-9 ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: (s) => `|\\Delta\\vec r|=${fixed(Math.hypot(...Q), 2)}\\ \\le\\ \\text{path}=${fixed(length(path(s)), 2)}`,
});
