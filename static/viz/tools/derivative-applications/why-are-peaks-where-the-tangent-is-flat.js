import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FUNS, xAt, boxes, tangent, curveBySign, roots, num } from './_da.js';

// Fermat: just below a peak the graph still rises (f′ > 0), just above it falls (f′ < 0). A smooth f′ must pass through 0 between.
const state = { fn: 'cubic', p: 20 };
const K = () => FUNS[state.fn];
const X = () => xAt(K(), state.p);
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: a smooth graph coloured green where it rises and coral where it falls, with a tangent you can slide. Bottom: its slope against x, crossing zero at each peak and valley.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: bA }), b: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    a.setRange(k.x, k.y);
    const ys = [-1, 1].map((s) => s * Math.max(2, ...Array.from({ length: 80 }, (_, i) => Math.abs(k.d(k.x[0] + ((k.x[1] - k.x[0]) * i) / 79)))) * 1.1);
    b.setRange(k.x, ys);
    a.axes({ xLabel: 'x', yLabel: 'f' });
    curveBySign(ctx, a, k.f, k.d, k.x[0], k.x[1], c);
    for (const r of roots(k.d, k.x[0], k.x[1])) a.point(r, k.f(r), { fill: c.d, r: 6 });
    const x = X();
    tangent(a, x, k.f(x), k.d(x), (k.x[1] - k.x[0]) * 0.1, c.ink, 3);
    a.point(x, k.f(x), { fill: c.b });
    b.axes({ xLabel: 'x', yLabel: "f′" });
    b.fn(k.d, { color: c.b, width: 3 });
    for (const r of roots(k.d, k.x[0], k.x[1])) b.point(r, 0, { fill: c.d, r: 6 });
    b.point(x, k.d(x), { fill: c.b });
  },
  controls: [
    { title: 'Slide the tangent' },
    { key: 'fn', label: 'Function', options: [['cubic', 'x³/3 − x'], ['quartic', 'x⁴/4 − 2x² + 1'], ['wave', 'sin x + 0.4x'], ['hill', '3 − (x−1)²']] },
    { key: 'p', label: 'Position along the graph', min: 0, max: 100, step: 1, format: (v) => `x = ${xAt(K(), v).toFixed(2).replace('-', '−')}` },
    { readout: [
      ['Slope f′(x)', () => num(K().d(X()), 4)],
      ['Going', () => (Math.abs(K().d(X())) < 0.12 ? { text: 'flat: a turning point', good: true } : K().d(X()) > 0 ? 'up' : 'down')],
      ['Flat points (purple)', () => roots(K().d, K().x[0], K().x[1]).map((r) => r.toFixed(2)).join(', ') || 'none'],
    ] },
  ],
  tex: () => `f'(${X().toFixed(2)})=${num(K().d(X()), 3)}`,
});
