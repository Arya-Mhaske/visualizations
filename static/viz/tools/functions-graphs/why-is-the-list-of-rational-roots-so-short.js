import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { gcd } from '../../lib/format.js';
import { divisors, evalP, showP } from './_polynomial-math.js';

const POLYS = [
  { c: [2, -3, -11, 6] },
  { c: [1, -6, 11, -6] },
  { c: [3, 5, -2] },
  { c: [2, 1, 2, 1] },
];
const state = { which: 0 };
const P = (s = state) => POLYS[s.which].c;
// candidates ±p/q with p | constant, q | leading, in lowest terms
function candidates(c) {
  const out = new Map();
  for (const p of divisors(c[c.length - 1])) for (const q of divisors(c[0])) {
    const g = gcd(p, q);
    for (const sg of [1, -1]) out.set(`${(sg * p) / g}/${q / g}`, (sg * p) / q);
  }
  return [...out.entries()].map(([text, v]) => ({ text, v })).sort((a, b) => a.v - b.v);
}
// A candidate p/q is a root exactly when Σ c_i p^(n−i) q^i = 0 (integer arithmetic, no rounding)
const isRoot = (c, text) => {
  const [p, q] = text.split('/').map(Number);
  const n = c.length - 1;
  return c.reduce((sum, k, i) => sum + k * p ** (n - i) * q ** i, 0) === 0;
};

createTool({
  state,
  label: 'The graph of an integer polynomial with its possible rational roots marked on the x-axis. Any rational root p over q in lowest terms must have p dividing the constant term and q dividing the leading coefficient, because multiplying through by q to the n leaves a whole-number sum that only balances if those divisibility conditions hold. That is why the list of candidates is short. Roots that really are zeros are filled in green.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-20, 20], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => evalP(P(), x), { color: c.a, width: 4 });
    candidates(P()).forEach(({ text, v }) => plot.point(v, 0, { fill: isRoot(P(), text) ? c.c : c.paper, r: isRoot(P(), text) ? 9 : 6 }));
  },
  controls: [
    { title: 'Choose a polynomial' },
    { key: 'which', label: 'Polynomial', min: 0, max: POLYS.length - 1, step: 1, format: (v) => showP(POLYS[v].c) },
    { readout: [
      ['p must divide', (s) => `${P(s)[P(s).length - 1]}: ${divisors(P(s)[P(s).length - 1]).join(', ')}`],
      ['q must divide', (s) => `${P(s)[0]}: ${divisors(P(s)[0]).join(', ')}`],
      ['Candidates', (s) => candidates(P(s)).map((c) => c.text).join(', ')],
      ['Actual rational roots', (s) => candidates(P(s)).filter((c) => isRoot(P(s), c.text)).map((c) => c.text).join(', ') || 'none'],
    ] },
  ],
  tex: (s) => `P(x)=${showP(P(s))},\\quad \\dfrac pq:\\ p\\mid ${Math.abs(P(s)[P(s).length - 1])},\\ q\\mid ${Math.abs(P(s)[0])}`,
});
