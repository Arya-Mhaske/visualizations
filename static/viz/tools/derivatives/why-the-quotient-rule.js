import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const PAIRS = [
  { name: 'x² ÷ (x + 1)', u: (x) => x * x, du: (x) => 2 * x, v: (x) => x + 1, dv: () => 1, tex: ['x^2', 'x+1'] },
  { name: 'sin x ÷ x', u: Math.sin, du: Math.cos, v: (x) => x, dv: () => 1, tex: ['\\sin x', 'x'] },
  { name: 'eˣ ÷ (x² + 1)', u: Math.exp, du: Math.exp, v: (x) => x * x + 1, dv: (x) => 2 * x, tex: ['e^x', 'x^2+1'] },
];
const state = { which: 0, x: 1 };
const P = (s = state) => PAIRS[s.which];
const q = (s, x) => P(s).u(x) / P(s).v(x);
const exact = (s) => (P(s).du(s.x) * P(s).v(s.x) - P(s).u(s.x) * P(s).dv(s.x)) / P(s).v(s.x) ** 2;
const numeric = (s) => (q(s, s.x + 1e-6) - q(s, s.x - 1e-6)) / 2e-6;
const wrong = (s) => P(s).du(s.x) / P(s).dv(s.x);

createTool({
  state,
  label: 'The graph of u over v with a tangent line at a point. Writing u as the product of the quotient and v, the product rule gives u prime equals the quotient prime times v plus the quotient times v prime. Solving for the quotient prime gives the quotient rule. The slope of the tangent, measured numerically, matches the quotient rule and not the tempting guess of u prime over v prime.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 4], y: [-3, 5], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => q(state, x), { color: c.a, width: 4, domain: [state.which === 1 ? 0.05 : -1, 4] });
    const m = exact(state);
    const y0 = q(state, state.x);
    plot.segment(state.x - 1.5, y0 - 1.5 * m, state.x + 1.5, y0 + 1.5 * m, { color: c.c, width: 3 });
    plot.point(state.x, y0, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Differentiate u ÷ v' },
    { key: 'which', label: 'Quotient', min: 0, max: PAIRS.length - 1, step: 1, format: (v) => PAIRS[v].name },
    { key: 'x', label: 'x', min: 0.5, max: 3.5, step: 0.25 },
    { readout: [
      ['Measured slope', (s) => fixed(numeric(s), 4)],
      ['(u′v − uv′) ÷ v²', (s) => ({ text: fixed(exact(s), 4), good: Math.abs(exact(s) - numeric(s)) < 1e-3 })],
      ['Tempting guess u′ ÷ v′', (s) => ({ text: fixed(wrong(s), 4), good: Math.abs(wrong(s) - numeric(s)) < 1e-3 })],
    ] },
  ],
  tex: (s) => `u=\\dfrac uv\\cdot v\\Rightarrow u'=\\left(\\dfrac uv\\right)'v+\\dfrac uv v'\\Rightarrow\\left(\\dfrac uv\\right)'=\\dfrac{u'v-uv'}{v^2}`,
});
