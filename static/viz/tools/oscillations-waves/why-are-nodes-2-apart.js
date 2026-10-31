import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { TAU, nodePositions, pair } from './_standing-waves-math.js';

const LENGTH = 10;
const PERIOD = 2; // s, so ω = π rad/s
const W = TAU / PERIOD;
const state = { t: 0.5, lambda: 4, probe: 3, A: 1 };
const line = createTimeline(document.querySelector('#stage'), state, { cycle: () => PERIOD, update: () => tool.update() });
const k = (s) => TAU / s.lambda;
const at = (s, x) => pair(s.A, k(s), W, x, s.t);
const nodes = (s) => nodePositions(k(s), 0, LENGTH);
const gaps = (s) => nodes(s).slice(1).map((x, i) => x - nodes(s)[i]);

const tool = createTool({
  state,
  label: 'Two graphs of a 10 metre string. Top: a wave running right (blue) and a wave running left (purple), the same height and wavelength. Bottom: their sum, which stays between two dashed envelopes. The points where the sum never moves are marked, and a coral dot follows one chosen place.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, LENGTH], y: [-1.7, 1.7], c, pad: 22, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.44 }) }),
    low: createPlot(stage, { x: [0, LENGTH], y: [-2.6, 2.6], c, pad: 22, box: (g) => ({ x: 0, y: g.h * 0.44, w: g.w, h: g.h * 0.56 }) }),
  }),
  draw(ctx, stage, c, { top, low }) {
    const kk = k(state);
    const { A, probe } = state;
    const parts = at(state, probe);
    top.axes({ xLabel: 'x (m)', yLabel: 'the two waves' });
    top.fn((x) => at(state, x).right, { color: c.b });
    top.fn((x) => at(state, x).left, { color: c.d });
    low.axes({ xLabel: 'x (m)', yLabel: 'the sum (cm)' });
    low.fn((x) => 2 * A * Math.abs(Math.sin(kk * x)), { color: c.grid, width: 2, dash: [5, 5] });
    low.fn((x) => -2 * A * Math.abs(Math.sin(kk * x)), { color: c.grid, width: 2, dash: [5, 5] });
    low.fn((x) => at(state, x).sum, { color: c.c, width: 4 });
    for (const x of nodes(state)) low.point(x, 0, { fill: c.ink, r: 5 });
    for (const [plot, y, hi] of [[top, parts.right, 1.7], [top, parts.left, 1.7], [low, parts.sum, 2.6]]) {
      plot.segment(probe, -hi, probe, hi, { color: c.a, width: 1, dash: [3, 3] });
    }
    top.point(probe, parts.right, { fill: c.b, r: 6 });
    top.point(probe, parts.left, { fill: c.d, r: 6 });
    low.point(probe, parts.sum, { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Two waves, one string' },
    { key: 'lambda', label: 'Wavelength, λ', min: 2, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'probe', label: 'Follow the string at', min: 0.25, max: 9.75, step: 0.25, format: (n) => `${fixed(n, 2)} m` },
    { key: 't', label: 'Time, t', min: 0, max: PERIOD, step: 0.02, format: (n) => `${fixed(n, 2)} s` },
    transport(line.clock),
    { readout: [
      ['Right-moving wave, there', (s) => `${fixed(at(s, s.probe).right, 2)} cm`],
      ['Left-moving wave, there', (s) => `${fixed(at(s, s.probe).left, 2)} cm`],
      ['The string, there', (s) => `${fixed(at(s, s.probe).sum, 2)} cm`],
      ['Nodes (black dots) are', (s) => `${fixed(gaps(s)[0], 2)} m apart`],
      ['Half a wavelength, λ/2', (s) => `${fixed(s.lambda / 2, 2)} m`],
    ] },
  ],
  tex: (s) => `y=2a\\sin kx\\cos\\omega t=2(${fixed(s.A, 1)})\\sin(${fixed(k(s), 2)}\\times${fixed(s.probe, 2)})\\cos(${fixed(W * s.t, 2)})=${fixed(at(s, s.probe).formula, 2)}\\ \\text{cm}`,
  onChange: () => line.sync(),
});

line.sync();
