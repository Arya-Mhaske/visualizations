import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { rects, sumOf, exact } from './_ig.js';

// Each thin slice of time is nearly constant speed, so its distance is speed × time: a rectangle's area.
const V = {
  steady: ['steady 8 m/s', (t) => 8, '8'],
  speeding: ['speeding up', (t) => 2 + 2 * t, '2+2t'],
  bumpy: ['bumpy ride', (t) => 7 + 4 * Math.sin(t), '7+4\\sin t'],
};
const state = { v: 'speeding', n: 3 };
const T = 6;

const tool = createTool({
  state,
  label: 'A graph of speed in metres per second against time from 0 to 6 seconds. Blue rectangles stand on thin slices of time, each as tall as the speed at its left edge. Their total area is the distance estimate, and the curve above shows the true speed.',
  setup: (stage, c) => createPlot(stage, { x: [0, T], y: [0, 16], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const f = V[state.v][1];
    plot.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    rects(ctx, plot, c, f, 0, T, state.n, 0, { fill: c.fillB });
    plot.fn(f, { color: c.a });
  },
  controls: () => [
    { title: 'Slice the journey' },
    { key: 'v', label: 'Speed', options: Object.entries(V).map(([k, v]) => [k, v[0]]) },
    { key: 'n', label: 'Slices of time', min: 1, max: 60, step: 1 },
    { readout: [
      ['Each slice lasts', (s) => `${fixed(T / s.n, 2)} s`],
      ['Sum of v × Δt', (s) => `${fixed(sumOf(V[s.v][1], 0, T, s.n, 0), 2)} m`],
      ['Exact distance', (s) => `${fixed(exact(V[s.v][1], 0, T), 2)} m`],
      ['Gap', (s) => `${fixed(exact(V[s.v][1], 0, T) - sumOf(V[s.v][1], 0, T, s.n, 0), 2)} m`],
    ] },
  ],
  tex: (s) => `s=\\sum v(t_i)\\,\\Delta t\\ \\to\\ \\int_0^{6}${V[s.v][2]}\\,dt=${fixed(exact(V[s.v][1], 0, T), 2)}\\ \\text{m}`,
});

tool.update();
