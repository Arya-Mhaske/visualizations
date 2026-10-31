import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { dot, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { x } from './_shm-math.js';

const state = { small: 1, big: 3, w: 1.2 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const t = () => clock.state.t;
const period = (s) => (2 * Math.PI) / s.w;
const peak = (A, s) => A * s.w;

const tool = createTool({
  state,
  label: 'Two masses on identical springs, one pulled further than the other, with their graphs. They pass the centre at the same moments.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 12], y: [-4, 4], c, box: (s) => ({ x: 0, y: s.h * 0.34, w: s.w, h: s.h * 0.66 }),
  }),
  draw(ctx, stage, c, plot) {
    const mid = stage.w / 2;
    const unit = (stage.w * 0.42) / 4;
    line(ctx, mid, 6, mid, stage.h * 0.3, { color: c.grid, width: 2, dash: [4, 4] });
    [[state.small, c.b, stage.h * 0.1], [state.big, c.a, stage.h * 0.23]].forEach(([A, color, y]) => {
      line(ctx, mid - A * unit, y, mid + A * unit, y, { color: c.grid, width: 6 });
      dot(ctx, mid + x(A, state.w, 0, t()) * unit, y, 10, color, c.ink);
    });
    plot.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    plot.fn((u) => x(state.small, state.w, 0, u), { color: c.b });
    plot.fn((u) => x(state.big, state.w, 0, u), { color: c.a });
    plot.segment(t() % 12, -4, t() % 12, 4, { color: c.ink, width: 1 });
  },
  controls: [
    { title: 'Race a small swing and a big one' },
    { key: 'small', label: 'Small amplitude', min: 0.5, max: 2, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'big', label: 'Big amplitude', min: 2.5, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'w', label: 'ω, set by the spring', min: 0.6, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} rad/s` },
    transport(clock),
    { readout: [
      ['Period, both', (s) => `${fixed(period(s), 2)} s`],
      ['Distance per cycle, small', (s) => `${fixed(4 * s.small, 1)} m`],
      ['Distance per cycle, big', (s) => `${fixed(4 * s.big, 1)} m`],
      ['Top speed, small', (s) => `${fixed(peak(s.small, s), 2)} m/s`],
      ['Top speed, big', (s) => `${fixed(peak(s.big, s), 2)} m/s`],
      ['Both ratios', (s) => fixed(s.big / s.small, 2)],
    ] },
  ],
  tex: (s) => `T = \\frac{2\\pi}{\\omega} = ${fixed(period(s), 2)}\\ \\text{s}\\quad \\text{(no } A \\text{ in it)}`,
});

clock.step(1);
