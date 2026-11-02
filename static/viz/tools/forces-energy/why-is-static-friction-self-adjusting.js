import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { m: 10, mus: 0.5, muk: 0.4, P: 20 };
const N = (s) => s.m * G;
const fmax = (s) => s.mus * N(s);
const fric = (s, P) => (P <= fmax(s) ? P : s.muk * N(s));

createTool({
  state,
  label: 'Friction against the applied push. It rises along a straight line equal to the push until the maximum static friction, then drops to a lower constant value once the block slides.',
  setup: (stage, c) => createPlot(stage, { x: [0, 120], y: [0, 100], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'push P (N)', yLabel: 'friction f (N)' });
    plot.fn((P) => fric(state, P), { color: c.b });
    plot.fn((P) => P, { color: c.ink, dash: [5, 5], domain: [0, fmax(state)] });
    plot.point(state.P, fric(state, state.P), { fill: c.a });
  },
  controls: [
    { title: 'Push the block' },
    { key: 'm', label: 'Mass (kg)', min: 2, max: 12, step: 1 },
    { key: 'mus', label: 'μₛ', min: 0.2, max: 0.8, step: 0.05 },
    { key: 'muk', label: 'μₖ', min: 0.1, max: 0.6, step: 0.05 },
    { key: 'P', label: 'Push P (N)', min: 0, max: 120, step: 1 },
    { readout: [
      ['Friction f', (s) => `${fixed(fric(s, s.P), 1)} N`],
      ['Largest static friction μₛN', (s) => `${fixed(fmax(s), 1)} N`],
      ['State', (s) => (s.P <= fmax(s) ? 'at rest: f = P' : `sliding, a = ${fixed((s.P - s.muk * N(s)) / s.m, 2)} m/s²`)],
    ] },
  ],
  tex: (s) => `f_s\\le\\mu_sN=${fixed(fmax(s), 1)}\\ \\mathrm{N}`,
});
