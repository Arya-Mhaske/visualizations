import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Horizontal case: shift right by s and squeeze by c.  Vertical case: shift up by t and stretch by k.
const state = { kind: 'h', s: 2, c: 2 };
const f = (x) => x * x;
// shift first, then squeeze: f((c x) − s) = f(c x − s);  squeeze first, then shift: f(c (x − s))
const A = (st, x) => (st.kind === 'h' ? f(st.c * x - st.s) : st.c * (f(x) + st.s)); // first shift, then stretch
const B = (st, x) => (st.kind === 'h' ? f(st.c * (x - st.s)) : st.c * f(x) + st.s); // first stretch, then shift
const same = (st) => [-2, -1, 0, 1, 2, 3].every((x) => Math.abs(A(st, x) - B(st, x)) < 1e-9);

createTool({
  state,
  label: 'Two graphs built from the same two steps, a shift and a stretch, in different orders. The coral graph does the shift first and the stretch second. The blue graph does the stretch first and the shift second. They are different graphs, and the readout lists a few points where they disagree. The shift of a graph is measured before or after the stretch, which changes how far it actually moves.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 6], y: [-3, 16], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn(f, { color: c.grid, width: 3 });
    plot.fn((x) => A(state, x), { color: c.a, width: 4 });
    plot.fn((x) => B(state, x), { color: c.b, width: 4, dash: [7, 5] });
  },
  controls: [
    { title: 'Two steps, two orders' },
    { key: 'kind', label: 'Steps', options: [['h', 'Shift right, squeeze sideways'], ['v', 'Shift up, stretch upward']] },
    { key: 's', label: 'Shift', min: -3, max: 3, step: 1 },
    { key: 'c', label: 'Stretch factor', min: 1, max: 4, step: 1 },
    { readout: [
      ['Coral: shift, then stretch', (s) => (s.kind === 'h' ? `f(${s.c}x − ${s.s})` : `${s.c}(f(x) + ${s.s})`)],
      ['Blue: stretch, then shift', (s) => (s.kind === 'h' ? `f(${s.c}(x − ${s.s}))` : `${s.c}f(x) + ${s.s}`)],
      ['At x = 1', (s) => `${fixed(A(s, 1), 2)} and ${fixed(B(s, 1), 2)}`],
      ['Same graph?', (s) => ({ text: same(s) ? 'yes' : 'no', good: same(s) })],
    ] },
  ],
  tex: (s) => (s.kind === 'h' ? 'f(cx-s)\\ne f(c(x-s))\\ \\text{unless}\\ c=1\\ \\text{or}\\ s=0' : 'c(f(x)+s)\\ne cf(x)+s\\ \\text{unless}\\ c=1\\ \\text{or}\\ s=0'),
});
