import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// I = ∫ f(x) dx and I = ∫ f(a − x) dx, so 2I = ∫ [f(x) + f(a − x)] dx. For these f the bracket is 1, so I = a/2.
const CASES = {
  sincos: { name: 'sin x/(sin x + cos x) on [0, π/2]', a: Math.PI / 2, f: (x) => Math.sin(x) / (Math.sin(x) + Math.cos(x)), text: '\\dfrac{\\sin x}{\\sin x+\\cos x}', ans: '\\dfrac{\\pi}{4}' },
  roots: { name: '√x/(√x + √(1 − x)) on [0, 1]', a: 1, f: (x) => Math.sqrt(x) / (Math.sqrt(x) + Math.sqrt(1 - x)), text: '\\dfrac{\\sqrt{x}}{\\sqrt{x}+\\sqrt{1-x}}', ans: '\\dfrac12' },
};
const state = { k: 'sincos', view: 'f' };

const tool = createTool({
  state,
  label: 'A graph on the interval from 0 to a. The blue curve is f of x and the green curve is f of a minus x. In the sum view, the green region is stacked on top of the blue one and together they fill a rectangle of height 1 exactly.',
  setup: (stage, c) => createPlot(stage, { x: [-0.1, 1.7], y: [0, 1.15], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const K = CASES[state.k];
    const f = K.f;
    const g = (x) => f(K.a - x);
    plot.setRange([-0.05 * K.a, K.a * 1.05], [0, 1.15]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    if (state.view === 'f') plot.shade(f, null, 0, K.a, c.fillB);
    else if (state.view === 'g') plot.shade(g, null, 0, K.a, c.fillC);
    else {
      plot.shade(f, null, 0, K.a, c.fillB);
      plot.shade((x) => f(x) + g(x), f, 0, K.a, c.fillC);
    }
    plot.fn(f, { color: c.b });
    plot.fn(g, { color: c.c });
    if (state.view === 'sum') plot.fn((x) => f(x) + g(x), { color: c.ink, width: 2, dash: [5, 4] });
  },
  controls: () => [
    { title: 'Add the integral to its mirror image' },
    { key: 'k', label: 'Integral', options: Object.entries(CASES).map(([k, v]) => [k, v.name]) },
    { key: 'view', label: 'Show', options: [['f', 'f(x)'], ['g', 'f(a − x)'], ['sum', 'both stacked']] },
    { readout: [
      ['∫ f(x) dx', (s) => fixed(exact(CASES[s.k].f, 0, CASES[s.k].a), 5)],
      ['∫ f(a − x) dx', (s) => fixed(exact((x) => CASES[s.k].f(CASES[s.k].a - x), 0, CASES[s.k].a), 5)],
      ['f(x) + f(a − x)', (s) => fixed(CASES[s.k].f(0.3 * CASES[s.k].a) + CASES[s.k].f(0.7 * CASES[s.k].a), 5)],
      ['a ÷ 2', (s) => fixed(CASES[s.k].a / 2, 5)],
    ] },
  ],
  tex: (s) => `2I=\\int_0^a 1\\,dx=a\\ \\Rightarrow\\ I=${CASES[s.k].ans}=${fixed(CASES[s.k].a / 2, 4)}`,
});

tool.update();
