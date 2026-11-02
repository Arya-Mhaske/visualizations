import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { roots, num } from '../integral-applications/_ia.js';

// Compare on log scales so huge numbers fit. View A: eˣ against x¹⁰⁰ (take ln: x against 100 ln x).
// View B: ln x against x^0.01 (write x = e^t: t against e^(0.01 t)).
const state = { view: 'exp', p: 100 };
const gapA = (x) => x - state.p * Math.log(x);
const crossA = () => roots(gapA, 1.001, 1e5, 40000);
const gapB = (t) => t - Math.exp(t / state.p);
const crossB = () => roots(gapB, 0.5, 5000, 40000);

createTool({
  state,
  label: 'A race on log scales. Either e to the x against x to a power, or the natural log of x against a small power of x. The slow one may lead for a long while, but after the last crossing the other wins for ever.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1000], y: [0, 1000], c }),
  draw(ctx, stage, c, plot) {
    if (state.view === 'exp') {
      const last = crossA().slice(-1)[0] ?? 100;
      const X = Math.max(200, last * 1.6);
      plot.setRange([0, X], [0, X * 1.05]);
      plot.axes({ xLabel: 'x', yLabel: 'ln of each (eˣ coral, xᵖ blue)' });
      plot.fn((x) => x, { color: c.a, width: 3 });
      plot.fn((x) => state.p * Math.log(Math.max(x, 1e-9)), { color: c.b, width: 3, domain: [0.01, X] });
      for (const r of crossA()) plot.point(r, r, { fill: c.c, r: 6 });
    } else {
      const last = crossB().slice(-1)[0] ?? 600;
      const X = Math.max(800, last * 1.4);
      plot.setRange([0, X], [0, X * 1.05]);
      plot.axes({ xLabel: 't = ln x', yLabel: 'ln x (coral)  and  x^(1/p) (blue)' });
      plot.fn((t) => t, { color: c.a, width: 3 });
      plot.fn((t) => Math.exp(t / state.p), { color: c.b, width: 3 });
      for (const r of crossB()) plot.point(r, r, { fill: c.c, r: 6 });
    }
  },
  controls: [
    { title: 'Run the race' },
    { key: 'view', label: 'Race', options: [['exp', 'eˣ vs xᵖ'], ['log', 'ln x vs x^(1/p)']] },
    { key: 'p', label: 'Power p', min: 10, max: 200, step: 10 },
    { readout: [
      ['Crossings', () => (state.view === 'exp' ? crossA() : crossB()).map((r) => num(r, 4)).join(', ') || 'none'],
      ['After the last crossing', () => (state.view === 'exp' ? { text: 'eˣ is bigger for ever', good: true } : { text: 'x^(1/p) is bigger for ever', good: true })],
      ['The crossing in ordinary numbers', () => (state.view === 'exp' ? `x ≈ ${num(crossA().slice(-1)[0], 4)}` : `x = e^${num(crossB().slice(-1)[0], 4)}`)],
    ] },
  ],
  tex: () => '\\lim_{x\\to\\infty}\\frac{x^p}{e^x}=0,\\qquad \\lim_{x\\to\\infty}\\frac{\\ln x}{x^{1/p}}=0',
});
