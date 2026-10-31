import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { phasor } from '../../lib/phasor.js';
import { fixed } from '../../lib/format.js';
import { a, v, x } from './_shm-math.js';

const state = { w: 1 };
const A = 1;
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const t = () => clock.state.t;
const size = (s) => [A, A * s.w, A * s.w * s.w];

const tool = createTool({
  state,
  label: 'Three arrows turning together, for displacement, velocity and acceleration, each a quarter turn ahead of the last, above their three graphs.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 10], y: [-3, 3], c, box: (s) => ({ x: 0, y: s.h * 0.42, w: s.w, h: s.h * 0.58 }),
  }),
  draw(ctx, stage, c, plot) {
    const theta = state.w * t();
    const R = stage.h * 0.17;
    const [cx, cy] = [stage.w / 2, stage.h * 0.21];
    const unit = R / Math.max(...size(state));
    phasor(ctx, cx, cy, R, theta, { color: c.grid, c });
    phasor(ctx, cx, cy, size(state)[0] * unit, theta, { color: c.a, c, circle: false });
    phasor(ctx, cx, cy, size(state)[1] * unit, theta + Math.PI / 2, { color: c.b, c, circle: false });
    phasor(ctx, cx, cy, size(state)[2] * unit, theta + Math.PI, { color: c.d, c, circle: false });
    plot.axes({ xLabel: 't (s)', yLabel: '' });
    plot.fn((u) => x(A, state.w, 0, u), { color: c.a });
    plot.fn((u) => v(A, state.w, 0, u), { color: c.b });
    plot.fn((u) => a(A, state.w, 0, u), { color: c.d });
    plot.segment(t() % 10, -3, t() % 10, 3, { color: c.ink, width: 1 });
  },
  controls: [
    { title: 'A quarter turn ahead' },
    { text: 'Coral x, blue v, purple a. v peaks a quarter cycle before x, and a a quarter cycle before v.' },
    { key: 'w', label: 'Angular frequency, ω', min: 0.5, max: 1.7, step: 0.1, format: (n) => `${fixed(n, 1)} rad/s` },
    transport(clock),
    { readout: [
      ['x', (s) => fixed(x(A, s.w, 0, t()), 3)],
      ['v', (s) => fixed(v(A, s.w, 0, t()), 3)],
      ['a', (s) => fixed(a(A, s.w, 0, t()), 3)],
      ['v leads x by', () => '90° = π/2'],
      ['a leads x by', () => '180° = π'],
      ['a ÷ x', (s) => fixed(-(s.w ** 2), 2)],
    ] },
  ],
  tex: (s) => `v = -A\\omega\\sin\\omega t = A\\omega\\cos(\\omega t + \\tfrac{\\pi}{2}),\\quad a = -\\omega^2 x = ${fixed(-(s.w ** 2), 2).replace('−', '-')}\\,x`,
});

clock.step(1);
