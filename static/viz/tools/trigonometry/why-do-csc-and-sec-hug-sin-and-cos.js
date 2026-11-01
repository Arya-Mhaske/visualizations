import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { PAIRS } from './_tan-cot-math.js';

const TAU = Math.PI * 2;
const state = { pair: 'sin', x: 0.8 };
const P = (s = state) => PAIRS[s.pair];
const zero = (s = state) => Math.abs(P(s).f(s.x)) < 1e-9;

createTool({
  state,
  label: 'The graph of sine in blue and its reciprocal, cosecant, in coral. Where the sine is zero the cosecant has a dashed asymptote and runs off. Where the sine reaches 1 or minus 1, the cosecant touches it. Between asymptotes the cosecant forms U-shapes that hug the sine. A switch shows cosine and secant instead.',
  setup: (stage, c) => createPlot(stage, { x: [-TAU, TAU], y: [-4, 4], c, ticks: 'pi' }),
  draw(ctx, stage, c, plot) {
    const { f, g } = P();
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(-TAU, 1, TAU, 1, { color: c.grid, width: 1, dash: [4, 4] });
    plot.segment(-TAU, -1, TAU, -1, { color: c.grid, width: 1, dash: [4, 4] });
    // the asymptotes: wherever the first function is zero
    const off = state.pair === 'sin' ? 0 : Math.PI / 2;
    for (let n = -4; n <= 4; n++) {
      const x = off + n * Math.PI;
      if (Math.abs(x) <= TAU + 1e-9) plot.segment(x, -4, x, 4, { color: c.a, width: 1, dash: [5, 5] });
    }
    plot.fn(g, { color: c.a, width: 4 });
    plot.fn(f, { color: c.b, width: 4 });
    // the touching points
    for (let n = -4; n <= 4; n++) {
      const x = (state.pair === 'sin' ? Math.PI / 2 : 0) + n * Math.PI;
      if (Math.abs(x) <= TAU + 1e-9) plot.point(x, f(x), { fill: c.fillY, r: 6 });
    }
    plot.point(state.x, f(state.x), { fill: c.b, r: 7 });
    if (!zero() && Math.abs(g(state.x)) <= 4) plot.point(state.x, g(state.x), { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Compare a function with its reciprocal' },
    { key: 'pair', label: 'Pair', options: [['sin', 'sin and csc'], ['cos', 'cos and sec']] },
    { key: 'x', label: 'Input, x', min: -6.2, max: 6.2, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['The function', (s) => `${s.pair} x = ${fixed(P(s).f(s.x), 4)}`],
      ['Its reciprocal', (s) => `${s.pair === 'sin' ? 'csc' : 'sec'} x = ${zero(s) ? 'undefined' : sig(P(s).g(s.x), 4)}`],
      ['Product', (s) => (zero(s) ? '— (÷ 0)' : fixed(P(s).f(s.x) * P(s).g(s.x), 4))],
      ['Reciprocal at least 1 in size?', (s) => (zero(s) ? '—' : Math.abs(P(s).g(s.x)) >= 1 - 1e-9 ? 'yes' : 'no')],
    ] },
  ],
  tex: (s) => (zero(s) ? '\\dfrac{1}{0}\\ \\text{(undefined)}' : `\\${s.pair === 'sin' ? 'csc' : 'sec'}\\,x=\\dfrac{1}{${fixed(P(s).f(s.x), 3)}}=${sig(P(s).g(s.x), 4)}`),
});
