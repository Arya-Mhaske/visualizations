import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FNS = [
  { name: 'A polynomial, x² − 2x + 1', f: (x) => x * x - 2 * x + 1, hole: null, jump: null },
  { name: 'Hole: (x² − 1) ÷ (x − 1)', f: (x) => (x * x - 1) / (x - 1), hole: 1, jump: null },
  { name: 'Jump: x for x < 1, x + 2 after', f: (x) => (x < 1 ? x : x + 2), hole: null, jump: 1 },
];
const state = { which: 0, a: 1, k: 3 };
const F = (s = state) => FNS[s.which];
const h = (s = state) => 1 / 10 ** s.k;
const sides = (s = state) => [F(s).f(s.a - h(s)), F(s).f(s.a + h(s))];
const sub = (s = state) => F(s).f(s.a);

createTool({
  state,
  label: 'Three graphs: a polynomial, a graph with a hole, and a graph with a jump. A point a that you choose is marked, with the value found by substituting a and the values just to its left and right. For the polynomial the substituted value always equals both side values, because the graph has no gap or jump. For the other two the substituted value fails where the graph breaks.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 4], y: [-1, 7], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const f = F().f;
    if (F().jump === null) plot.fn(f, { color: c.a, width: 4 });
    else { plot.fn(f, { color: c.a, width: 4, domain: [-1, 0.9999] }); plot.fn(f, { color: c.a, width: 4, domain: [1, 4] }); }
    if (F().hole !== null) plot.point(F().hole, 2, { fill: c.paper, r: 7 });
    const [l, r] = sides();
    plot.point(state.a - h(), l, { fill: c.b, r: 6 });
    plot.point(state.a + h(), r, { fill: c.b, r: 6 });
    if (Number.isFinite(sub())) plot.point(state.a, sub(), { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Substitute a' },
    { key: 'which', label: 'Function', min: 0, max: FNS.length - 1, step: 1, format: (v) => FNS[v].name },
    { key: 'a', label: 'Point, a', min: -0.5, max: 3, step: 0.5 },
    { readout: [
      ['Substitute: f(a)', (s) => (Number.isFinite(sub(s)) ? fixed(sub(s), 4) : 'not defined')],
      ['Left, right', (s) => `${fixed(sides(s)[0], 4)}, ${fixed(sides(s)[1], 4)}`],
      ['Substitution gives the limit?', (s) => { const ok = Number.isFinite(sub(s)) && Math.abs(sub(s) - sides(s)[0]) < 0.01 && Math.abs(sub(s) - sides(s)[1]) < 0.01; return { text: ok ? 'yes' : 'no', good: ok }; }],
    ] },
  ],
  tex: (s) => (s.which === 0 ? `\\lim_{x\\to ${s.a}}(x^2-2x+1)=${s.a}^2-2(${s.a})+1=${fixed(sub(s), 2)}` : `f(a)\\ \\text{and the limit are not always equal here}`),
});
