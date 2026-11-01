import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { fn: 0, x0: 1, k: 1 };
const FNS = [
  { name: 'f(x) = x²', f: (x) => x * x, d: (x) => 2 * x, view: [[-1, 4], [-1, 9]] },
  { name: 'f(x) = x³', f: (x) => x ** 3, d: (x) => 3 * x * x, view: [[-1, 3], [-3, 12]] },
  { name: 'f(x) = sin x', f: Math.sin, d: Math.cos, view: [[-1, 6], [-2, 2]] },
];
const h = (s = state) => 2 / 2 ** s.k;
const F = (s = state) => FNS[s.fn];
const secant = (s = state) => (F(s).f(s.x0 + h(s)) - F(s).f(s.x0)) / h(s);

createTool({
  state,
  label: 'A curve with a point P fixed on it and a second point Q that you slide towards P. The straight line through P and Q is the secant. As Q gets closer to P the secant turns and settles into the tangent, drawn dashed. The slope of the secant gets closer and closer to the slope of the tangent.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 4], y: [-1, 9], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const fn = F();
    plot.setRange(...fn.view);
    plot.axes();
    plot.fn(fn.f, { color: c.ink, width: 3 });
    const [p, q] = [state.x0, state.x0 + h()];
    const m = secant();
    const span = fn.view[0][1] - fn.view[0][0];
    plot.segment(p - span, fn.f(p) - m * span, p + span, fn.f(p) + m * span, { color: c.a, width: 3 });
    const t = fn.d(p);
    plot.segment(p - span, fn.f(p) - t * span, p + span, fn.f(p) + t * span, { color: c.c, width: 2, dash: [6, 5] });
    plot.point(p, fn.f(p), { fill: c.fillY, r: 8 });
    plot.point(q, fn.f(q), { fill: c.a, r: 7 });
    plot.text('P', p - 0.3, fn.f(p) + 0.5 * (fn.view[1][1] - fn.view[1][0]) / 12, { size: 12, patch: false });
    plot.text('Q', q + 0.2, fn.f(q) - 0.7 * (fn.view[1][1] - fn.view[1][0]) / 12, { size: 12, patch: false });
  },
  controls: [
    { title: 'Slide Q towards P' },
    { key: 'k', label: 'Gap h = 2 ÷ 2^k', min: 0, max: 12, step: 1, format: (v) => `k = ${v}  (h = ${fixed(2 / 2 ** v, 4)})` },
    { key: 'x0', label: 'Position of P, x', min: 0, max: 3, step: 0.5 },
    { key: 'fn', label: 'Curve', min: 0, max: FNS.length - 1, step: 1, format: (v) => FNS[v].name },
    { readout: [
      ['Secant slope', (s) => fixed(secant(s), 5)],
      ['Tangent slope', (s) => fixed(F(s).d(s.x0), 5)],
      ['Difference', (s) => ({ text: fixed(secant(s) - F(s).d(s.x0), 5), good: Math.abs(secant(s) - F(s).d(s.x0)) < 0.01 })],
    ] },
  ],
  tex: (s) => `\\dfrac{f(x_0+h)-f(x_0)}{h}=\\dfrac{f(${fixed(s.x0 + h(s), 4)})-f(${s.x0})}{${fixed(h(s), 4)}}=${fixed(secant(s), 4)}`,
});
