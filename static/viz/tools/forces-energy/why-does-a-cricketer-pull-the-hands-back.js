import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';

const state = { dt: 0.02, v: 30 };
const M = 0.16;
const dp = (s) => M * s.v;
const peak = (s) => (2 * dp(s)) / s.dt;
const F = (s, t) => (t < 0 || t > s.dt ? 0 : peak(s) * (1 - Math.abs((2 * t) / s.dt - 1)));

createTool({
  state,
  label: 'A force against time graph for catching a cricket ball. The triangle has a fixed area, the impulse, so a longer catch time gives a lower peak.',
  setup: (stage, c) => createPlot(stage, { x: [0, 0.25], y: [0, 1000], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 0.22], [0, Math.max(peak({ dt: 0.01, v: state.v }) * 1.05, 100)]);
    plot.axes({ xLabel: 't (s)', yLabel: 'F (N)' });
    plot.shade((t) => F(state, t), null, 0, state.dt, c.fillA);
    plot.fn((t) => F(state, t), { color: c.a, domain: [0, state.dt] });
  },
  controls: [
    { title: 'The catch' },
    { key: 'v', label: 'Ball speed (m/s)', min: 10, max: 40, step: 1 },
    { key: 'dt', label: 'Catch time Δt (s)', min: 0.01, max: 0.2, step: 0.01 },
    { readout: [
      ['Impulse Δp = mv', (s) => `${sig(dp(s), 3)} N s`],
      ['Average force', (s) => `${sig(dp(s) / s.dt, 3)} N`],
      ['Peak force', (s) => `${sig(peak(s), 3)} N`],
    ] },
  ],
  tex: (s) => `F_{\\text{avg}}=\\dfrac{\\Delta p}{\\Delta t}=\\dfrac{${sig(dp(s), 3)}}{${s.dt}}=${sig(dp(s) / s.dt, 3)}\\ \\mathrm{N}`,
});
