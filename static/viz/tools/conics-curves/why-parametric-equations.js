import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { timings } from './_rotation-math.js';
import { curve, fitEqual, trace } from './_conics-view.js';

const state = { timing: 'speedUp', t: 0.5, compare: true };
const NAMES = { steady: 'Steady speed', speedUp: 'Speeding up', slowDown: 'Slowing down' };
const TAU = Math.PI * 2;
// The path is always the same circle; only the rule linking the parameter t to the angle changes.
const at = (kind, t) => [3 * Math.cos(TAU * timings[kind](t)), 3 * Math.sin(TAU * timings[kind](t))];

createTool({
  state,
  label: 'A circle drawn three ways. The path is always the same circle, but the point can travel round it at a steady speed, speeding up or slowing down. Dots mark the point at equal time steps of one tenth. The dots are evenly spaced for steady motion and bunch up where the point is slow. The same path, with different parametric equations, tells you when the point is where.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-4, 4], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    fitEqual(plot, stage, 0, 0, 4);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    curve(plot, trace((u) => [3 * Math.cos(u), 3 * Math.sin(u)], 0, TAU, 200), { color: c.grid, width: 4 });
    if (state.compare) for (let i = 0; i <= 10; i++) { const p = at('steady', i / 10); plot.point(p[0] * 0.86, p[1] * 0.86, { fill: c.paper, r: 4 }); }
    for (let i = 0; i <= 10; i++) { const p = at(state.timing, i / 10); plot.point(p[0], p[1], { fill: c.fillY, r: 5 }); }
    const m = at(state.timing, state.t);
    plot.point(m[0], m[1], { fill: c.a, r: 10 });
  },
  controls: [
    { title: 'Same path, different timing' },
    { key: 'timing', label: 'Motion', options: Object.entries(NAMES) },
    { key: 't', label: 'Time, t', min: 0, max: 1, step: 0.01, format: (v) => fixed(v, 2) },
    { key: 'compare', label: 'Show the steady motion\'s dots inside for comparison', toggle: true },
    { readout: [
      ['Angle at this time', (s) => `${fixed(360 * timings[s.timing](s.t), 0)}°`],
      ['Position', (s) => `(${fixed(at(s.timing, s.t)[0], 2)}, ${fixed(at(s.timing, s.t)[1], 2)})`],
      ['Path', () => 'always x² + y² = 9'],
    ] },
  ],
  tex: (s) => `x=3\\cos\\big(2\\pi\\,g(t)\\big),\\ y=3\\sin\\big(2\\pi\\,g(t)\\big),\\quad g(t)=${{ steady: 't', speedUp: 't^2', slowDown: '1-(1-t)^2' }[s.timing]}`,
});
