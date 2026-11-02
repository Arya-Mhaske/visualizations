import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, simpson, trapSum, simpSum, num } from '../integral-applications/_ia.js';

// Simpson fits a parabola through each pair of strips. Its error falls like 1/n⁴: doubling n cuts it about 16 times (the trapezoid: 4 times).
const FN = {
  exp: { name: 'eˣ on [0, 2]', f: Math.exp, a: 0, b: 2, y: [0, 8] },
  sin: { name: 'sin x on [0, π]', f: Math.sin, a: 0, b: Math.PI, y: [-0.2, 1.4] },
  rat: { name: '1/(1 + x²) on [0, 3]', f: (x) => 1 / (1 + x * x), a: 0, b: 3, y: [0, 1.2] },
};
const state = { fn: 'exp', n: 4 };
const K = () => FN[state.fn];
const exact = () => simpson(K().f, K().a, K().b, 4000);
const errS = (n) => Math.abs(simpSum(K().f, K().a, K().b, n) - exact());
const errT = (n) => Math.abs(trapSum(K().f, K().a, K().b, n) - exact());
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: the curve with parabolas fitted through each pair of strips. Bottom: log of the error against log of n for the trapezoid rule (coral) and Simpson (blue); Simpson falls much faster.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 2], y: [0, 8], c, box: bA }), b: createPlot(stage, { x: [1, 6], y: [-12, 2], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    const n = state.n + (state.n % 2);
    const h = (k.b - k.a) / n;
    a.setRange([k.a - 0.1, k.b + 0.1], k.y);
    a.axes({ xLabel: 'x', yLabel: 'y' });
    a.fn(k.f, { color: c.ink, width: 3 });
    for (let i = 0; i < n; i += 2) {
      const [x0, x1, x2] = [k.a + i * h, k.a + (i + 1) * h, k.a + (i + 2) * h];
      const [y0, y1, y2] = [k.f(x0), k.f(x1), k.f(x2)];
      a.fn((x) => y0 * ((x - x1) * (x - x2)) / (2 * h * h) - y1 * ((x - x0) * (x - x2)) / (h * h) + y2 * ((x - x0) * (x - x1)) / (2 * h * h), { color: c.a, width: 2.5, domain: [x0, x2] });
    }
    b.setRange([0, 6.5], [-12, 1]);
    b.axes({ xLabel: 'log₂ n', yLabel: 'log₁₀ error' });
    const pts = [1, 2, 3, 4, 5, 6];
    for (const p of pts) {
      const m = 2 ** p;
      b.point(p, Math.log10(Math.max(errT(m), 1e-14)), { fill: c.a, r: 5 });
      b.point(p, Math.log10(Math.max(errS(m), 1e-14)), { fill: c.b, r: 5 });
    }
    b.segment(Math.log2(n), -12, Math.log2(n), 1, { color: c.ink, width: 1.5, dash: [4, 4] });
  },
  controls: [
    { title: 'Double the pieces' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Pieces n (even)', min: 2, max: 32, step: 2 },
    { readout: [
      ['Simpson error at n', () => num(errS(state.n), 3)],
      ['Simpson error at 2n', () => num(errS(2 * state.n), 3)],
      ['Ratio (about 16)', () => num(errS(state.n) / errS(2 * state.n), 3)],
      ['Trapezoid ratio (about 4)', () => num(errT(state.n) / errT(2 * state.n), 3)],
    ] },
  ],
  tex: () => '\\frac{b-a}{3n}\\big[f_0+4f_1+2f_2+\\cdots+4f_{n-1}+f_n\\big]',
});
