import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { phi, Phi, num } from './_ia.js';

// P(5 − w/2 < X < 5 + w/2) = area of a strip of width w. Squeeze w towards 0: the strip has no width, so no area. The density itself stays finite.
const DIST = {
  unif: { name: 'Uniform on [0, 10]', f: (x) => (x >= 0 && x <= 10 ? 0.1 : 0), F: (x) => Math.min(1, Math.max(0, x / 10)), x: [-1, 11], y: [0, 0.2] },
  norm: { name: 'Normal, mean 5, sd 1', f: (x) => phi(x - 5), F: (x) => Phi(x - 5), x: [0, 10], y: [0, 0.5] },
  exp: { name: 'Exponential, mean 5', f: (x) => (x >= 0 ? 0.2 * Math.exp(-0.2 * x) : 0), F: (x) => (x <= 0 ? 0 : 1 - Math.exp(-0.2 * x)), x: [-1, 12], y: [0, 0.25] },
};
const state = { kind: 'norm', s: 1 };
const K = () => DIST[state.kind];
const w = () => 10 ** -state.s;
const P = () => K().F(5 + w() / 2) - K().F(5 - w() / 2);

createTool({
  state,
  label: 'A probability density curve with a thin shaded strip centred on 5. The strip gets narrower as the slider moves, and its area, the probability, goes to zero while the height of the curve stays the same.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 0.5], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.setRange(k.x, k.y);
    plot.axes({ xLabel: 'x', yLabel: 'density f' });
    const ww = Math.max(w(), (k.x[1] - k.x[0]) / 400);
    plot.shade(k.f, null, 5 - ww / 2, 5 + ww / 2, c.fillA);
    plot.fn(k.f, { color: c.ink, width: 3, domain: k.x });
    plot.segment(5, 0, 5, k.f(5), { color: c.a, width: 3 });
  },
  controls: [
    { title: 'Squeeze the strip' },
    { key: 'kind', label: 'Distribution', options: Object.entries(DIST).map(([k, v]) => [k, v.name]) },
    { key: 's', label: 'Strip width w = 10^−s', min: 0, max: 6, step: 0.25, format: (v) => num(10 ** -v, 4) },
    { readout: [
      ['Width of the strip', () => num(w(), 4)],
      ['P(strip)', () => num(P(), 6)],
      ['P ÷ width  (≈ density at 5)', () => num(P() / w(), 5)],
      ['Density f(5)', () => num(K().f(5), 5)],
      ['As w → 0', () => ({ text: 'P → 0 but f(5) stays', good: true })],
    ] },
  ],
  tex: (s) => `P(X=5)=\\int_5^{5}f(x)\\,dx=0,\\qquad P(5\\pm w/2)\\approx f(5)\\,w`,
});
