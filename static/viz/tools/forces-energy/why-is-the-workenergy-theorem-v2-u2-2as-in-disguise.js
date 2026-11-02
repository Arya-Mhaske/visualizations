import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { m: 2, u: 3, F: 4, s: 5 };
const a = (s) => s.F / s.m;
const v2 = (s) => s.u ** 2 + 2 * a(s) * s.s;
const ke = (v2v, m) => 0.5 * m * v2v;

createTool({
  state,
  label: 'Three bars: the initial kinetic energy, the work done by the net force, and the final kinetic energy, which is their sum.',
  draw(ctx, stage, c) {
    const k0 = ke(state.u ** 2, state.m);
    const W = state.F * state.s;
    bars(ctx, stage, c, [['½mu²', k0, c.fillB, `${fixed(k0, 1)} J`], ['work Fs', Math.abs(W), W >= 0 ? c.fillC : c.fillA, `${fixed(W, 1)} J`], ['½mv²', Math.max(k0 + W, 0), c.fillA, `${fixed(k0 + W, 1)} J`]], { max: 80 });
  },
  controls: [
    { title: 'A force over a distance' },
    { key: 'm', label: 'Mass (kg)', min: 1, max: 5, step: 1 },
    { key: 'u', label: 'Initial speed u (m/s)', min: 0, max: 10, step: 1 },
    { key: 'F', label: 'Net force F (N)', min: -6, max: 10, step: 1 },
    { key: 's', label: 'Distance s (m)', min: 1, max: 8, step: 1 },
    { readout: [
      ['v² = u² + 2as', (s) => fixed(v2(s), 2)],
      ['½mv² − ½mu²', (s) => `${fixed(ke(v2(s), s.m) - ke(s.u ** 2, s.m), 2)} J`],
      ['Fs', (s) => `${fixed(s.F * s.s, 2)} J`],
    ] },
  ],
  tex: (s) => `\\tfrac12mv^2-\\tfrac12mu^2=Fs=${fixed(s.F * s.s, 1)}\\ \\mathrm{J}`,
});
