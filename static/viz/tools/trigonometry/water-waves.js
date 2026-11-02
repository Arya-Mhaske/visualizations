import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { fixed, sig } from '../../lib/format.js';
import { TAU, deepPeriod, deepSpeed, waveSpeed } from './_waves-math.js';

const CYCLE = 24;
const state = { lambda: 10, T: 2.5, t: 0 };
const timeline = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
timeline.clock.speed = 1;
const surface = (x, t) => Math.cos(TAU * (x / state.lambda - t / state.T));

const tool = createTool({
  state,
  label: 'A snapshot of water-surface height against distance along the sea. A coral point rides on one crest. As time runs, the crest moves along at the wave speed, wavelength divided by period.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [-1.6, 1.6], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x (m)', yLabel: 'height' });
    plot.fn((x) => surface(x, state.t), { color: c.b, width: 4 });
    const v = waveSpeed(state.lambda, state.T);
    const xc = (v * state.t) % state.lambda;
    plot.segment(xc, 0, xc, 1, { color: c.grid, width: 1, dash: [4, 4] });
    plot.point(xc, 1, { fill: c.a });
    plot.segment(0, -1.3, state.lambda, -1.3, { color: c.a, width: 5 });
    plot.text(`λ = ${fixed(state.lambda, 0)} m`, Math.min(state.lambda / 2, 34), -1.5, { size: 11, color: c.a, patch: false });
  },
  controls: () => [
    { title: 'Make a wave' },
    { key: 'lambda', label: 'Wavelength, λ', min: 2, max: 20, step: 1, format: (n) => `${n} m` },
    { key: 'T', label: 'Period, T', min: 0.5, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} s` },
    { key: 't', label: 'Time, t', min: 0, max: CYCLE, step: 0.1, format: (n) => `${fixed(n, 1)} s` },
    transport(timeline.clock),
    { readout: [
      ['Speed, v = λ ÷ T', (s) => `${sig(waveSpeed(s.lambda, s.T), 3)} m/s`],
      ['Deep-water speed for this λ', (s) => `${sig(deepSpeed(s.lambda), 3)} m/s`],
      ['Deep-water period for this λ', (s) => `${sig(deepPeriod(s.lambda), 3)} s`],
    ] },
  ],
  tex: (s) => `v=\\dfrac{\\lambda}{T}=\\dfrac{${s.lambda}}{${fixed(s.T, 1)}}=${sig(waveSpeed(s.lambda, s.T), 3)}\\ \\text{m/s}`,
  onChange: () => timeline.sync(),
});
