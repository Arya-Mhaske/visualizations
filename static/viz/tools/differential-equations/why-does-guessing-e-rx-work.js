import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { p: 3, q: 2, r: -0.5 };
const ch = (s, r = s.r) => r * r + s.p * r + s.q;
const roots = (s) => {
  const D = s.p * s.p - 4 * s.q;
  return D < 0 ? [] : [(-s.p - Math.sqrt(D)) / 2, (-s.p + Math.sqrt(D)) / 2];
};

createTool({
  state,
  label: 'Trying y equals e to the r x in the equation y double prime plus p y prime plus q y equals zero. The coral curve is the guess. The blue curve is what is left over when the guess is put into the left side, which is r squared plus p r plus q times e to the r x. It is zero everywhere only when r is a root of the characteristic equation.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 3], y: [-6, 8], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => Math.exp(state.r * x), { color: c.a, width: 4 });
    plot.fn((x) => ch(state) * Math.exp(state.r * x), { color: c.b, width: 4, dash: Math.abs(ch(state)) < 1e-9 ? [6, 5] : [] });
  },
  controls: (tool) => [
    { title: 'Guess an exponent' },
    { key: 'p', label: 'p (damping term)', min: -5, max: 5, step: 1 },
    { key: 'q', label: 'q (spring term)', min: -5, max: 5, step: 1 },
    { key: 'r', label: 'Guess r', min: -4, max: 3, step: 0.05, format: (v) => fixed(v, 2) },
    { button: 'Snap to the nearest root', onClick: () => {
      const R = roots(state);
      if (R.length) { state.r = R.reduce((a, b) => (Math.abs(a - state.r) < Math.abs(b - state.r) ? a : b)); tool.update(); }
    } },
    { readout: [
      ['r² + pr + q', (s) => ({ text: fixed(ch(s), 4), good: Math.abs(ch(s)) < 1e-6 })],
      ['Roots', (s) => (roots(s).length ? roots(s).map((v) => fixed(v, 3)).join(' and ') : 'none are real') ],
    ] },
  ],
  tex: (s) => String.raw`(e^{rx})''+${s.p}(e^{rx})'+${s.q}e^{rx}=(r^2+${s.p}r+${s.q})e^{rx}=${fixed(ch(s), 3)}\,e^{rx}`,
});
