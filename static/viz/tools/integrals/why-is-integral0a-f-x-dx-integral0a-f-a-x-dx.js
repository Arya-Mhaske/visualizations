import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact, stackBoxes } from './_ig.js';

// Reading the region from the right-hand end instead of the left: the curve y = f(a − x) is the mirror image in x = a/2.
const FS = {
  x2: ['x²', (x) => x * x],
  sin: ['sin x', Math.sin],
  exp: ['eˣ', Math.exp],
  skew: ['x(a − x)²', null],
};
const state = { fn: 'x2', a: 2 };
const pick = (s) => (s.fn === 'skew' ? (x) => x * (s.a - x) ** 2 : FS[s.fn][1]);

const tool = createTool({
  state,
  label: 'Two stacked graphs on 0 to a. The top shows f of x shaded. The bottom shows f of a minus x, the mirror image in the middle line x equals a over 2, also shaded. The two shaded regions are mirror images of each other, so their areas are equal.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 3], y: [0, 5], c, pad: 24, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [0, 3], y: [0, 5], c, pad: 24, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const f = pick(state);
    const g = (x) => f(state.a - x);
    let hi = 0;
    for (let i = 0; i <= 100; i++) hi = Math.max(hi, f((state.a * i) / 100));
    for (const p of [top, bottom]) p.setRange([-0.1, state.a + 0.1], [0, hi * 1.15 + 0.1]);
    top.axes({ xLabel: 'x', yLabel: 'f(x)' });
    top.shade(f, null, 0, state.a, c.fillB);
    top.fn(f, { color: c.a, domain: [0, state.a] });
    bottom.axes({ xLabel: 'x', yLabel: 'f(a − x)' });
    bottom.shade(g, null, 0, state.a, c.fillC);
    bottom.fn(g, { color: c.b, domain: [0, state.a] });
    for (const p of [top, bottom]) p.segment(state.a / 2, 0, state.a / 2, hi * 1.15 + 0.1, { color: c.ink, width: 2, dash: [5, 4] });
  },
  controls: () => [
    { title: 'Reflect the region' },
    { key: 'fn', label: 'Function', options: Object.entries(FS).map(([k, v]) => [k, v[0]]) },
    { key: 'a', label: 'Upper limit a', min: 1, max: 3, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['∫₀ᵃ f(x) dx', (s) => fixed(exact(pick(s), 0, s.a), 5)],
      ['∫₀ᵃ f(a − x) dx', (s) => fixed(exact((x) => pick(s)(s.a - x), 0, s.a), 5)],
    ] },
  ],
  tex: (s) => `\\int_0^{${fixed(s.a, 1)}}f(x)\\,dx=\\int_0^{${fixed(s.a, 1)}}f(a-x)\\,dx=${fixed(exact(pick(s), 0, s.a), 4)}`,
});

tool.update();
