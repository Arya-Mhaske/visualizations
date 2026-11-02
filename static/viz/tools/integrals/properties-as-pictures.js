import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// f(x) = 2 + sin x on [0, 6].
const f = (x) => 2 + Math.sin(x);
const state = { view: 'split', c: 2.5, a: 0.5, b: 5 };
const I = (p, q) => exact(f, p, q);
const hi = (a, b) => { let m = -Infinity; for (let i = 0; i <= 200; i++) m = Math.max(m, f(a + ((b - a) * i) / 200)); return m; };
const lo = (a, b) => { let m = Infinity; for (let i = 0; i <= 200; i++) m = Math.min(m, f(a + ((b - a) * i) / 200)); return m; };

const tool = createTool({
  state,
  label: 'A graph of f of x equals two plus sine x from 0 to 6. The picture depends on the property chosen. Split: two shaded pieces either side of a point c. Flip: the same area with its limits swapped, drawn as negative. Bounds: the area sits between a short rectangle and a tall one.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6.3], y: [0, 3.6], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const { a, b } = state;
    const cc = Math.min(Math.max(state.c, a), b);
    plot.axes({ xLabel: 'x', yLabel: 'f(x)' });
    if (state.view === 'split') {
      plot.shade(f, null, a, cc, c.fillB);
      plot.shade(f, null, cc, b, c.fillC);
      plot.segment(cc, 0, cc, 3.6, { color: c.ink, width: 2, dash: [5, 4] });
    } else if (state.view === 'flip') {
      plot.shade(f, null, a, b, c.fillA);
      plot.segment(b, 0.15, a, 0.15, { color: c.ink, width: 3 });
      plot.text('from b back to a', (a + b) / 2, 0.45, { size: 10 });
    } else {
      plot.shade(() => hi(a, b), () => lo(a, b), a, b, c.fillY);
      plot.shade(f, () => lo(a, b), a, b, c.fillB);
      plot.shade(() => lo(a, b), null, a, b, c.fillC);
    }
    plot.fn(f, { color: c.a });
  },
  controls: () => [
    { title: 'Pick a property' },
    { key: 'view', label: 'Property', options: [['split', 'split'], ['flip', 'flip limits'], ['bounds', 'bounds']] },
    { key: 'a', label: 'a', min: 0, max: 2, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'b', min: 3, max: 6, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'c', label: 'Split point c', min: 0.5, max: 5.9, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['∫ₐᵇ f', (s) => fixed(I(s.a, s.b), 3)],
      ['∫ₐᶜ f + ∫꜀ᵇ f', (s) => `${fixed(I(s.a, Math.min(Math.max(s.c, s.a), s.b)), 3)} + ${fixed(I(Math.min(Math.max(s.c, s.a), s.b), s.b), 3)}`],
      ['∫ᵇₐ f', (s) => fixed(-I(s.a, s.b), 3)],
      ['m(b−a) ≤ ∫ ≤ M(b−a)', (s) => `${fixed(lo(s.a, s.b) * (s.b - s.a), 2)} ≤ ${fixed(I(s.a, s.b), 2)} ≤ ${fixed(hi(s.a, s.b) * (s.b - s.a), 2)}`],
    ] },
  ],
  tex: (s) => (s.view === 'split' ? '\\int_a^b f=\\int_a^c f+\\int_c^b f' : s.view === 'flip' ? '\\int_b^a f=-\\int_a^b f' : 'm(b-a)\\le\\int_a^b f\\le M(b-a)'),
});

tool.update();
