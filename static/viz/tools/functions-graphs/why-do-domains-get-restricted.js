import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { RESTRICTED, valueOf } from './_what-is-a-function-math.js';

const state = { fn: 'sqrt', x: -2 };

createTool({
  state,
  label: 'The graph of a function that breaks for some inputs, and a vertical marker you drag across it. Where the function works, a dot sits on the curve. Where it breaks, the marker turns red and says why.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 6], y: [-4, 4], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ grid: false });
    const r = RESTRICTED[state.fn];
    plot.fn(r.f, { color: c.b, width: 4 });
    const y = valueOf(state.fn, state.x);
    plot.segment(state.x, -4, state.x, 4, { color: y === null ? c.a : c.c, width: 2, dash: [6, 5] });
    if (y !== null && Math.abs(y) < 4) plot.point(state.x, y, { fill: c.c, r: 8 });
    plot.text(y === null ? 'breaks here' : `f = ${fixed(y, 2)}`, Math.max(-3, Math.min(5, state.x)), y === null ? 3.4 : Math.max(-3.2, Math.min(3.2, y + 0.7)), { size: 12, color: y === null ? c.a : c.ink });
  },
  controls: [
    { title: 'Walk x across the function' },
    { key: 'fn', label: 'Function', options: [['sqrt', '√x'], ['recip', '1/x'], ['log', 'ln x'], ['both', '1/√(x−1)']] },
    { key: 'x', label: 'Input, x', min: -3.5, max: 5.5, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['f(x)', (s) => { const y = valueOf(s.fn, s.x); return y === null ? 'undefined' : fixed(y, 3); }],
      ['Works?', (s) => ({ text: valueOf(s.fn, s.x) === null ? 'no' : 'yes', good: valueOf(s.fn, s.x) !== null })],
      ['Why not', (s) => (valueOf(s.fn, s.x) === null ? RESTRICTED[s.fn].why : 'nothing stops it')],
      ['Domain', (s) => RESTRICTED[s.fn].domain],
    ] },
  ],
  tex: (s) => `f(x)=${RESTRICTED[s.fn].tex},\\quad \\text{domain: } ${RESTRICTED[s.fn].domainTex}`,
});
