import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, roots, curveBySign, num } from './_da.js';
import { dot } from '../../lib/draw.js';

// Work down the checklist and watch the three graphs fill in: intercepts, symmetry, f′ = 0, f″ = 0, then the sketch.
const FN = {
  a: { name: 'x³ − 3x', f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, d2: (x) => 6 * x, x: [-3, 3], y: [-4, 4], dy: [-4, 12], d2y: [-12, 12], sym: 'odd: f(−x) = −f(x)', asym: 'none' },
  b: { name: 'x⁴ − 2x²', f: (x) => x ** 4 - 2 * x * x, d: (x) => 4 * x ** 3 - 4 * x, d2: (x) => 12 * x * x - 4, x: [-2, 2], y: [-2, 4], dy: [-8, 8], d2y: [-6, 24], sym: 'even: f(−x) = f(x)', asym: 'none' },
  c: { name: 'x / (1 + x²)', f: (x) => x / (1 + x * x), d: (x) => (1 - x * x) / (1 + x * x) ** 2, d2: (x) => (2 * x * (x * x - 3)) / (1 + x * x) ** 3, x: [-5, 5], y: [-1, 1], dy: [-1.2, 1.2], d2y: [-1, 1], sym: 'odd: f(−x) = −f(x)', asym: 'y = 0 as x → ±∞' },
  d: { name: 'x e^(−x)', f: (x) => x * Math.exp(-x), d: (x) => (1 - x) * Math.exp(-x), d2: (x) => (x - 2) * Math.exp(-x), x: [-1, 6], y: [-1, 1], dy: [-3, 1.2], d2y: [-4, 2], sym: 'neither', asym: 'y = 0 as x → ∞' },
};
const STEPS = ['Intercepts', 'Symmetry and asymptotes', 'Critical points (f′ = 0)', 'Increasing / decreasing', 'Inflection points (f″ = 0)', 'The finished sketch'];
const state = { fn: 'a', step: 1 };
const K = () => FN[state.fn];
const zs = (g) => roots(g, K().x[0], K().x[1]);
const [b1, b2, b3] = boxes(3);

createTool({
  state,
  label: 'The graphs of f, f prime and f double prime stacked. As the checklist step increases, intercepts, critical points, inflection points and colouring appear on them.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: b1 }), b: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: b2 }), d: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: b3 }) }),
  draw(ctx, stage, c, { a, b, d }) {
    const k = K();
    a.setRange(k.x, k.y); b.setRange(k.x, k.dy); d.setRange(k.x, k.d2y);
    a.axes({ xLabel: 'x', yLabel: 'f' }); b.axes({ xLabel: 'x', yLabel: "f′" }); d.axes({ xLabel: 'x', yLabel: "f″" });
    if (state.step >= 4) curveBySign(ctx, a, k.f, k.d, k.x[0], k.x[1], c); else a.fn(k.f, { color: c.ink, width: 3 });
    b.fn(k.d, { color: c.b, width: 3 });
    d.fn(k.d2, { color: c.d, width: 3 });
    if (state.step >= 1) for (const r of zs(k.f)) dot(ctx, ...a.toPx(r, 0), 6, c.paper, c.ink);
    if (state.step >= 1) dot(ctx, ...a.toPx(0, k.f(0)), 6, c.ink, c.ink);
    if (state.step >= 3) for (const r of zs(k.d)) { dot(ctx, ...a.toPx(r, k.f(r)), 7, c.a, c.ink); dot(ctx, ...b.toPx(r, 0), 6, c.a, c.ink); }
    if (state.step >= 5) for (const r of zs(k.d2)) { dot(ctx, ...a.toPx(r, k.f(r)), 7, c.c, c.ink); dot(ctx, ...d.toPx(r, 0), 6, c.c, c.ink); }
    if (state.step >= 6) {
      for (const r of zs(k.d)) a.text(k.d2(r) > 0 ? 'min' : 'max', r, k.f(r) + (k.d2(r) > 0 ? -0.18 : 0.18) * (k.y[1] - k.y[0]), { size: 12 });
    }
  },
  controls: [
    { title: 'Work down the checklist' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'step', label: 'Checklist step', min: 1, max: 6, step: 1, format: (v) => `${v}. ${STEPS[v - 1]}` },
    { readout: [
      ['Zeros of f', () => zs(K().f).map((r) => num(r, 3)).join(', ') || 'none'],
      ['Symmetry', () => (state.step >= 2 ? `${K().sym}; asymptotes: ${K().asym}` : 'step 2')],
      ['f′ = 0 at', () => (state.step >= 3 ? zs(K().d).map((r) => `${num(r, 3)} (${K().d2(r) > 0 ? 'min' : 'max'})`).join(', ') : 'step 3')],
      ['f″ = 0 at', () => (state.step >= 5 ? zs(K().d2).map((r) => num(r, 3)).join(', ') || 'none' : 'step 5')],
    ] },
  ],
  tex: () => "\\text{zeros of } f,\\ f',\\ f''\\ \\text{mark where the picture changes}",
});
