import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const CASES = [
  { name: 'sin x ÷ x, as x → 0', a: 0, f: (x) => Math.sin(x) / x, limit: 1, tex: '\\dfrac{\\sin x}{x}' },
  { name: '(x² − 1) ÷ (x − 1), as x → 1', a: 1, f: (x) => (x * x - 1) / (x - 1), limit: 2, tex: '\\dfrac{x^2-1}{x-1}' },
  { name: '(√(x + 4) − 2) ÷ x, as x → 0', a: 0, f: (x) => (Math.sqrt(x + 4) - 2) / x, limit: 0.25, tex: '\\dfrac{\\sqrt{x+4}-2}{x}' },
];
const state = { which: 0, k: 0 };
const C = (s = state) => CASES[s.which];
const h = (s = state) => 1 / 10 ** s.k;

createTool({
  state,
  label: 'A graph of a function near a point where its formula gives 0 over 0, with the window zoomed in as you move the slider. A table underneath lists the values on both sides at distances 1, 0.1, 0.01 and so on. The graph and the table both show the same number being approached from each side.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [0, 2], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const { a, f, limit } = C();
    const H = Math.max(h() * 2, 1e-3);
    plot.setRange([a - H, a + H], [limit - H * 0.8 - 0.05, limit + H * 0.8 + 0.05]);
    plot.axes({ grid: false });
    plot.fn(f, { color: c.a, width: 4 });
    plot.point(a, limit, { fill: c.paper, r: 8 });
    plot.point(a - h(), f(a - h()), { fill: c.b, r: 6 });
    plot.point(a + h(), f(a + h()), { fill: c.b, r: 6 });
    for (let i = 0; i <= state.k; i++) {
      const x = 1 / 10 ** i;
      label(ctx, `h=${x}:  ${fixed(f(a - x), 6)}  |  ${fixed(f(a + x), 6)}`, 10, 14 + i * 14, c, { size: 10, align: 'left', bounds: stage, patch: false });
    }
  },
  controls: [
    { title: 'Zoom in and fill the table' },
    { key: 'which', label: 'Limit', min: 0, max: CASES.length - 1, step: 1, format: (v) => CASES[v].name },
    { key: 'k', label: 'Zoom: h = 10⁻ᵏ', min: 0, max: 6, step: 1, format: (v) => fixed(1 / 10 ** v, 6) },
    { readout: [
      ['Left, right', (s) => `${fixed(C(s).f(C(s).a - h(s)), 6)}, ${fixed(C(s).f(C(s).a + h(s)), 6)}`],
      ['Estimate', (s) => fixed((C(s).f(C(s).a - h(s)) + C(s).f(C(s).a + h(s))) / 2, 4)],
    ] },
  ],
  tex: (s) => `\\lim ${C(s).tex}\\approx ${fixed((C(s).f(C(s).a - h(s)) + C(s).f(C(s).a + h(s))) / 2, 4)}`,
});
