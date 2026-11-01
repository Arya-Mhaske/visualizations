import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { BRACKETS, dimText, isPure, gammaWith } from './_dimensions-math.js';

const state = { pick: 0, v: 0.6 };
const B = (s) => BRACKETS[s.pick];
const ok = (s) => isPure(B(s).dim);
// m(v) = m(-v) is needed: the mass cannot depend on the direction of travel.
const even = (s) => Math.abs(B(s).f(s.v, 1) - B(s).f(-s.v, 1)) < 1e-12;
const gamma = (s) => gammaWith(B(s), s.v);

const tool = createTool({
  state,
  label: 'A graph of m over m zero against the speed as a fraction of the speed of light, for the chosen bracket inside the square root. If the bracket has units the graph is meaningless and is not drawn. If it is dimensionless, the curve rises towards infinity as v reaches c.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [0, 6], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'v / c', yLabel: 'm / m₀' });
    if (ok(state)) {
      plot.fn((v) => gammaWith(B(state), v), { color: even(state) ? c.c : c.a, domain: [-0.999, 0.999] });
      const g = gamma(state);
      if (Number.isFinite(g)) plot.point(state.v, Math.min(6, g), { fill: c.fillY, r: 8 });
    } else {
      plot.text('the bracket has units:', 0, 3.4, { patch: true });
      plot.text('the graph has no meaning', 0, 2.6, { patch: true });
    }
  },
  controls: () => [
    { title: 'm = m₀ / √(1 − ?)' },
    { key: 'pick', label: 'What goes in the bracket', min: 0, max: BRACKETS.length - 1, step: 1, format: (n) => BRACKETS[n].text },
    { key: 'v', label: 'Speed, v / c', min: -0.95, max: 0.95, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['Dimension of the bracket', (s) => dimText(B(s).dim)],
      ['1 − bracket can be taken', (s) => (ok(s) ? { text: 'yes: dimensionless', good: true } : { text: 'no: it has units', good: false })],
      ['Same for +v and −v?', (s) => (!ok(s) ? '—' : even(s) ? { text: 'yes', good: true } : { text: 'no: direction matters', good: false })],
      ['m / m₀', (s) => (!ok(s) ? '—' : Number.isFinite(gamma(s)) ? sig(gamma(s), 3) : 'not real')],
    ] },
  ],
  tex: (s) => `m=\\dfrac{m_0}{\\sqrt{1-${B(s).text.replace('²', '^2')}}}`,
});
tool.update();
