import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from './_ia.js';

// The force changes as you lift, so work = area under F against height.
//  Chain: hanging length shrinks, F(y) = λ g (L − y), W = ½ λ g L².
//  Leaking bucket: water leaks at a steady rate while you climb, F(y) = (m0 − k y) g + bucket.
const G = 9.8;
const state = { kind: 'chain', L: 10, lam: 2, water: 20, leak: 50, bucket: 2, h: 15 };
const F = (y) => {
  if (state.kind === 'chain') return state.lam * G * Math.max(0, state.L - y);
  return (state.bucket + Math.max(0, state.water * (1 - y / state.leak * 1))) * G * 1;
};
const top = () => (state.kind === 'chain' ? state.L : state.h);
const W = () => simpson(F, 0, top(), 400);
// For the bucket the water left at height y is water·(1 − y/h): it is empty exactly when it arrives at the top.
const Fb = (y) => (state.bucket + state.water * (1 - y / state.h)) * G;

createTool({
  state,
  label: 'The lifting force against height, either the weight of the chain still hanging or the weight of a bucket that leaks as you climb. The shaded area under it is the work done.',
  setup: (stage, c) => createPlot(stage, { x: [0, 15], y: [0, 400], c }),
  draw(ctx, stage, c, plot) {
    const f = state.kind === 'chain' ? F : Fb;
    const T = top();
    plot.setRange([0, T * 1.05], [0, Math.max(f(0), 10) * 1.2]);
    plot.axes({ xLabel: 'height lifted y (m)', yLabel: 'force F (N)' });
    plot.shade(f, null, 0, T, c.fillB);
    plot.fn(f, { color: c.ink, width: 3, domain: [0, T] });
    plot.segment(0, f(0), T, f(0), { color: c.a, width: 2, dash: [6, 4] });
  },
  controls: [
    { title: 'Lift it' },
    { key: 'kind', label: 'Load', options: [['chain', 'Hanging chain'], ['bucket', 'Leaking bucket']] },
    { key: 'L', label: 'Chain length', min: 4, max: 20, step: 1, format: (v) => `${v} m` },
    { key: 'lam', label: 'Chain mass per metre', min: 0.5, max: 5, step: 0.5, format: (v) => `${v} kg/m` },
    { key: 'water', label: 'Water at the start', min: 5, max: 40, step: 1, format: (v) => `${v} kg` },
    { key: 'h', label: 'Climb height (bucket)', min: 5, max: 20, step: 1, format: (v) => `${v} m` },
    { readout: [
      ['Force at the start', () => `${num(state.kind === 'chain' ? F(0) : Fb(0), 5)} N`],
      ['Work (area)', () => `${num(state.kind === 'chain' ? W() : simpson(Fb, 0, state.h, 400), 6)} J`],
      ['If the weight never changed', () => `${num((state.kind === 'chain' ? F(0) : Fb(0)) * top(), 6)} J`],
    ] },
  ],
  tex: (s) => (s.kind === 'chain' ? 'W=\\int_0^{L}\\lambda g\\,(L-y)\\,dy=\\tfrac12\\lambda g L^2' : 'W=\\int_0^{h}g\\left(m_b+m_w(1-y/h)\\right)dy'),
});
