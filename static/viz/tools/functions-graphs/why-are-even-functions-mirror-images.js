import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { PARITY_FUNCS, parityOf, mirrorY, halfTurn } from './_properties-library-math.js';

const state = { fn: 'sq', move: 'mirror', a: 1.5 };
const F = (s = state) => PARITY_FUNCS[s.fn].f;
const copy = (s = state) => (s.move === 'mirror' ? mirrorY(F(s)) : halfTurn(F(s)));
const matches = (s = state) => Math.abs(F(s)(-s.a) - (s.move === 'mirror' ? F(s)(s.a) : -F(s)(s.a))) < 1e-9;
const NAMES = { even: 'even', odd: 'odd', neither: 'neither even nor odd', both: 'both' };

createTool({
  state,
  label: 'The graph of a function in blue. A dashed coral copy shows the graph after a mirror in the y-axis or a half-turn about the origin. Two dots show a point and where the move sends it. The graph matches its copy for an even function under the mirror, and for an odd function under the half-turn.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-4, 4], c }),
  draw(ctx, stage, c, plot) {
    const f = F();
    plot.axes({ grid: false });
    plot.fn(copy(), { color: c.a, width: 6, dash: [8, 6] });
    plot.fn(f, { color: c.b, width: 3 });
    const y = f(state.a);
    const moved = [-state.a, state.move === 'mirror' ? y : -y];
    plot.point(state.a, y, { fill: c.fillY, r: 8 });
    plot.point(moved[0], moved[1], { fill: matches() ? c.c : c.a, r: 8 });
    plot.text(matches() ? 'lands on the graph' : 'misses the graph', 0, 3.5, { size: 12, color: matches() ? c.c : c.a });
  },
  controls: [
    { title: 'Flip the graph' },
    { key: 'fn', label: 'Function', options: Object.entries(PARITY_FUNCS).map(([k, v]) => [k, v.text]) },
    { key: 'move', label: 'Move', options: [['mirror', 'Mirror in y-axis'], ['turn', 'Half-turn about O']] },
    { key: 'a', label: 'Input, a', min: 0.5, max: 3.5, step: 0.25, format: (n) => fixed(n, 2) },
    { readout: [
      ['f(a)', (s) => fixed(F(s)(s.a), 3)],
      ['f(−a)', (s) => fixed(F(s)(-s.a), 3)],
      ['Does the move fit?', (s) => ({ text: matches(s) ? 'yes at this a' : 'no', good: matches(s) })],
      ['Whole graph', (s) => NAMES[parityOf(F(s))]],
    ] },
  ],
  tex: (s) => `f(-a)=${fixed(F(s)(-s.a), 2)},\\quad f(a)=${fixed(F(s)(s.a), 2)},\\quad -f(a)=${fixed(-F(s)(s.a), 2)}`,
});
