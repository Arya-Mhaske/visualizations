import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FUNS, xAt, boxes, curveBySign, tangent, sign, num } from './_da.js';

// f′(x) is the limit of Δy/Δx. If it is positive, a small step right gives a positive Δy: the graph rises.
const state = { fn: 'wave', p: 35, h: 0.6 };
const K = () => FUNS[state.fn];
const X = () => xAt(K(), state.p);
const dy = () => K().f(X() + state.h) - K().f(X());
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: the graph with a tangent and a small step to the right; the vertical side of the step is green when the graph rises and coral when it falls. Bottom: the slope f prime against x, with the same point marked.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: bA }), b: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    const x = X();
    const m = Math.max(1, ...Array.from({ length: 60 }, (_, i) => Math.abs(k.d(k.x[0] + ((k.x[1] - k.x[0]) * i) / 59))));
    a.setRange(k.x, k.y);
    b.setRange(k.x, [-m * 1.15, m * 1.15]);
    a.axes({ xLabel: 'x', yLabel: 'f' });
    curveBySign(ctx, a, k.f, k.d, k.x[0], k.x[1], c);
    tangent(a, x, k.f(x), k.d(x), (k.x[1] - k.x[0]) * 0.1, c.ink, 2.5);
    a.segment(x, k.f(x), x + state.h, k.f(x), { color: c.b, width: 2.5 });
    a.segment(x + state.h, k.f(x), x + state.h, k.f(x + state.h), { color: dy() >= 0 ? c.c : c.a, width: 4 });
    a.point(x, k.f(x), { fill: c.b });
    b.axes({ xLabel: 'x', yLabel: "f′" });
    b.shade(() => 0, k.d, k.x[0], k.x[1], c.fillY);
    b.fn(k.d, { color: c.b, width: 3 });
    b.point(x, k.d(x), { fill: sign(k.d(x)) > 0 ? c.c : c.a });
  },
  controls: [
    { title: 'Walk along the graph' },
    { key: 'fn', label: 'Function', options: [['cubic', 'x³/3 − x'], ['quartic', 'x⁴/4 − 2x² + 1'], ['wave', 'sin x + 0.4x'], ['bump', 'x e^(−x²/2)']] },
    { key: 'p', label: 'Position', min: 0, max: 100, step: 1, format: (v) => `x = ${xAt(K(), v).toFixed(2).replace('-', '−')}` },
    { key: 'h', label: 'Step to the right h', min: 0.1, max: 1, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Slope f′(x)', () => num(K().d(X()), 4)],
      ['Change Δy over the step', () => num(dy(), 4)],
      ['So the graph is', () => (sign(K().d(X())) > 0 ? { text: 'rising here', good: true } : sign(K().d(X())) < 0 ? { text: 'falling here', good: false } : 'flat here')],
    ] },
  ],
  tex: () => "f'(x)>0\\ \\Rightarrow\\ f(x+h)-f(x)\\approx f'(x)\\,h>0",
});
