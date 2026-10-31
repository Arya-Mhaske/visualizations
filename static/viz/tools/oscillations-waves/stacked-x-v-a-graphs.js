import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { fixed } from '../../lib/format.js';
import { a, v, x } from './_shm-math.js';

const state = { A: 1, w: 1.5, phi: 0 };
const END = 8;
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const t = () => clock.state.t % END;
const row = (i) => (stage) => ({ x: 0, y: (stage.h * i) / 3, w: stage.w, h: stage.h / 3 });
const LIMITS = [() => state.A, () => state.A * state.w, () => state.A * state.w ** 2];
const FUNCTIONS = [x, v, a];

const tool = createTool({
  state,
  label: 'Graphs of displacement, velocity and acceleration stacked on one time axis, with a line marking the present moment.',
  setup: (stage, c) => [0, 1, 2].map((i) => createPlot(stage, { x: [0, END], c, box: row(i) })),
  draw(ctx, stage, c, plots) {
    const names = ['x (m)', 'v (m/s)', 'a (m/s²)'];
    const colours = [c.a, c.b, c.d];
    plots.forEach((plot, i) => {
      const top = LIMITS[i]() * 1.25;
      plot.setRange([0, END], [-top, top]);
      plot.axes({ xLabel: 't', yLabel: names[i] });
      const f = FUNCTIONS[i];
      plot.fn((u) => f(state.A, state.w, state.phi, u), { color: colours[i] });
      plot.segment(t(), -top, t(), top, { color: c.ink, width: 1 });
      plot.point(t(), f(state.A, state.w, state.phi, t()), { fill: colours[i], r: 5 });
    });
  },
  controls: [
    { title: 'Read down the line' },
    { key: 'A', label: 'Amplitude, A', min: 0.5, max: 3, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'w', label: 'Angular frequency, ω', min: 0.5, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} rad/s` },
    { key: 'phi', label: 'Phase, φ', min: 0, max: 6.28, step: 0.01, format: (n) => `${fixed(n, 2)} rad` },
    transport(clock),
    { readout: [
      ['t', () => `${fixed(t(), 2)} s`],
      ['x', (s) => `${fixed(x(s.A, s.w, s.phi, t()), 3)} m`],
      ['v', (s) => `${fixed(v(s.A, s.w, s.phi, t()), 3)} m/s`],
      ['a', (s) => `${fixed(a(s.A, s.w, s.phi, t()), 3)} m/s²`],
      ['Largest v, Aω', (s) => `${fixed(s.A * s.w, 2)} m/s`],
      ['Largest a, Aω²', (s) => `${fixed(s.A * s.w ** 2, 2)} m/s²`],
    ] },
  ],
  tex: (s) => `x = ${fixed(s.A, 1)}\\cos(${fixed(s.w, 1)}t + ${fixed(s.phi, 2)}),\\quad a = -\\omega^2 x = -${fixed(s.w ** 2, 2)}\\,x`,
});

clock.step(1);
