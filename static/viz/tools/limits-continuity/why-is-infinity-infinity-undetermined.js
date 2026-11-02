import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from '../integral-applications/_ia.js';

// Each is "∞ − ∞", yet the answers differ. √(x² + bx) − x = bx/(√(x² + bx) + x) → b/2.
const FORMS = {
  root: { name: '√(x² + b·x) − x', f: (x, b) => b * x / (Math.sqrt(x * x + b * x) + x), lim: (b) => b / 2, note: 'multiply by the conjugate: b x / (√(x²+bx) + x) → b/2' },
  poly: { name: '(x² + x) − x²', f: (x) => x, lim: () => Infinity, note: 'the x² cancels, leaving x → ∞' },
  shift: { name: '(x + b) − x', f: (x, b) => b, lim: (b) => b, note: 'the x cancels, leaving b' },
};
const state = { kind: 'root', b: 1, x: 20 };
const K = () => FORMS[state.kind];

createTool({
  state,
  label: 'The values of an expression of the form infinity minus infinity, plotted for large x, settling on a finite number, running off to infinity, or equal to a constant depending on the form.',
  setup: (stage, c) => createPlot(stage, { x: [0, 60], y: [0, 3], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    const L = k.lim(state.b);
    const X = Math.max(30, state.x * 1.4);
    plot.setRange([0, X], Number.isFinite(L) ? [Math.min(0, L) - 1, Math.max(L, 1) + 1.5] : [0, X * 1.05]);
    plot.axes({ xLabel: 'x', yLabel: 'value' });
    plot.fn((x) => k.f(x, state.b), { color: c.ink, width: 3, domain: [0.5, X] });
    if (Number.isFinite(L)) plot.segment(0, L, X, L, { color: c.c, width: 3, dash: [7, 4] });
    plot.point(state.x, k.f(state.x, state.b), { fill: c.a });
  },
  controls: [
    { title: 'Subtract two huge things' },
    { key: 'kind', label: 'Expression', options: Object.entries(FORMS).map(([k, v]) => [k, v.name]) },
    { key: 'b', label: 'Constant b', min: 1, max: 6, step: 1 },
    { key: 'x', label: 'x', min: 1, max: 200, step: 1 },
    { readout: [
      ['Each part alone', () => `${num(Math.sqrt(state.x * state.x + state.b * state.x), 5)} and ${state.x}`],
      ['Their difference', () => num(K().f(state.x, state.b), 6)],
      ['Limit', () => (Number.isFinite(K().lim(state.b)) ? num(K().lim(state.b), 4) : '∞')],
      ['Why', () => K().note],
    ] },
  ],
  tex: (s) => (s.kind === 'root' ? `\\sqrt{x^2+${s.b}x}-x=\\frac{${s.b}x}{\\sqrt{x^2+${s.b}x}+x}\\to\\frac{${s.b}}{2}` : s.kind === 'poly' ? '(x^2+x)-x^2=x\\to\\infty' : `(x+${s.b})-x=${s.b}`),
});
