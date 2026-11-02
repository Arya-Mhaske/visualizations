import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { TAU, damped, envelope, halfLife } from './_waves-math.js';

const state = { gamma: 0.5, f: 1.5, mix: 1, A: 1 };

createTool({
  state,
  label: 'A sine wave in grey, a decaying curve in purple, and their product in coral. The coral wave touches the purple curve at its peaks, so the decaying curve is its boundary, above and below.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [-1.3, 1.3], c, pad: 24 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'y' });
    plot.fn((t) => state.A * Math.sin(TAU * state.f * t), { color: c.grid, width: 2 });
    const env = envelope(state.A, state.gamma * state.mix);
    plot.fn(env, { color: c.d, width: 3, dash: [6, 5] });
    plot.fn((t) => -env(t), { color: c.d, width: 3, dash: [6, 5] });
    plot.fn(damped(state.A, state.gamma * state.mix, TAU * state.f), { color: c.a, width: 4 });
  },
  controls: [
    { title: 'Multiply by a decaying curve' },
    { key: 'mix', label: 'Damping on?', options: [[0, 'Off'], [1, 'On']] },
    { key: 'gamma', label: 'Decay rate, γ', min: 0.1, max: 1.5, step: 0.1, format: (n) => `${fixed(n, 1)} per s` },
    { key: 'f', label: 'Swings per second, f', min: 0.5, max: 3, step: 0.5, format: (n) => `${fixed(n, 1)} Hz` },
    { key: 'A', label: 'Starting height, A', min: 0.5, max: 1.2, step: 0.1, format: (n) => fixed(n, 1) },
    { readout: [
      ['Envelope after 1 s', (s) => fixed(envelope(s.A, s.gamma * s.mix)(1), 3)],
      ['Time to halve', (s) => (s.mix ? `${fixed(halfLife(s.gamma), 2)} s` : 'never')],
    ] },
  ],
  tex: (s) => `y=${fixed(s.A, 1)}\\,e^{-${fixed(s.gamma * s.mix, 1)}t}\\sin(${fixed(TAU * s.f, 2)}\\,t)`,
});
