import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { allRoots, evalP, flipOdd, showP, signChanges } from './_polynomial-math.js';

const POLYS = [
  [1, -6, 11, -6], [1, 0, 0, -1], [1, 1, 1, 1], [1, -3, 0, 4, -2], [2, -5, 0, 1, -3],
];
const state = { which: 0 };
const P = (s = state) => POLYS[s.which];
const real = (s) => allRoots(P(s)).filter((z) => z[1] === 0).map((z) => z[0]);
const pos = (s) => real(s).filter((r) => r > 1e-9).length;
const neg = (s) => real(s).filter((r) => r < -1e-9).length;
const text = (c) => c.map((k, i) => (k === 0 ? null : `${k > 0 ? '+' : '−'}`)).filter(Boolean).join(' ');

createTool({
  state,
  label: 'A polynomial with its real roots marked on the graph. Counting the sign changes in the list of coefficients bounds the number of positive roots: there can be that many, or fewer by an even number. Replacing x with minus x does the same for negative roots. The page shows the rule and checks it against the actual roots of the chosen polynomial. The rule is shown here, not proved.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-12, 12], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => evalP(P(), x), { color: c.a, width: 4 });
    real(state).forEach((r) => plot.point(r, 0, { fill: r > 0 ? c.c : c.b, r: 8 }));
  },
  controls: [
    { title: 'Count the sign changes' },
    { key: 'which', label: 'Polynomial', min: 0, max: POLYS.length - 1, step: 1, format: (v) => showP(POLYS[v]) },
    { readout: [
      ['Signs of P(x)', (s) => text(P(s))],
      ['Sign changes (positive roots at most)', (s) => `${signChanges(P(s))}`],
      ['Actual positive roots', (s) => ({ text: `${pos(s)}`, good: pos(s) <= signChanges(P(s)) && (signChanges(P(s)) - pos(s)) % 2 === 0 })],
      ['Sign changes of P(−x)', (s) => `${signChanges(flipOdd(P(s)))}`],
      ['Actual negative roots', (s) => ({ text: `${neg(s)}`, good: neg(s) <= signChanges(flipOdd(P(s))) && (signChanges(flipOdd(P(s))) - neg(s)) % 2 === 0 })],
    ] },
  ],
  tex: (s) => `P(x)=${showP(P(s))}`,
});
