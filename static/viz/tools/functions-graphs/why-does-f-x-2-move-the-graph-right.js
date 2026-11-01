import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { PARENTS, fmt } from './_fx.js';

const state = { p: 0, h: 2, x: 4, compare: false };
const P = (s = state) => PARENTS[s.p];
const sgn = (v) => (v < 0 ? `+${-v}` : `-${v}`);

createTool({
  state,
  label: 'The graph of a function in grey, and the graph of f of x minus h in coral. A probe at x shows the effective input x minus h. To get the same output as the original graph gives at x equals 0, the new graph needs an input h bigger, so the whole graph moves right by h. A table of a few rows shows the same: an output that appeared at x now appears h rows later. A switch compares it with f of x minus h, which moves the graph down instead.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 8], y: [-4, 10], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const f = P().f;
    plot.setRange(...P().view.map(([a, b], i) => (i === 0 ? [a - 2, b + 3] : [a - 2, b + 2])));
    plot.axes();
    plot.fn(f, { color: c.grid, width: 4 });
    plot.fn((x) => f(x - state.h), { color: c.a, width: 4 });
    if (state.compare) plot.fn((x) => f(x) - state.h, { color: c.b, width: 3, dash: [6, 5] });
    const e = state.x - state.h;
    plot.point(state.x, f(e), { fill: c.a, r: 8 });
    plot.point(e, f(e), { fill: c.paper, r: 6 });
    plot.segment(e, f(e), state.x, f(e), { color: c.ink, width: 2, dash: [3, 3] });
    for (let i = 0; i < 4; i++) {
      const x = -1 + i;
      label(ctx, `x=${x}:  f(x)=${fixed(f(x), 2)}   f(x−${state.h})=${fixed(f(x - state.h), 2)}`, 8, 14 + i * 14, c, { size: 9, align: 'left', bounds: stage, patch: false });
    }
  },
  controls: [
    { title: 'Shift the graph' },
    { key: 'p', label: 'Function f', min: 0, max: 3, step: 1, format: (v) => PARENTS[v].name },
    { key: 'h', label: 'Shift, h', min: -4, max: 4, step: 1 },
    { key: 'x', label: 'Probe at x =', min: -4, max: 6, step: 0.5 },
    { key: 'compare', label: 'Also show f(x) − h', toggle: true },
    { readout: [
      ['Effective input, x − h', (s) => fixed(s.x - s.h, 2)],
      ['Output there', (s) => (Number.isFinite(P(s).f(s.x - s.h)) ? fixed(P(s).f(s.x - s.h), 3) : 'not defined')],
      ['Moves', (s) => (s.h === 0 ? 'nowhere' : `${Math.abs(s.h)} to the ${s.h > 0 ? 'right' : 'left'}`)],
    ] },
  ],
  tex: (s) => `y=f(x${s.h < 0 ? '+' : '-'}${Math.abs(s.h)})\\ \\text{; same output needs}\\ x=\\text{(old input)}${s.h < 0 ? '-' : '+'}${Math.abs(s.h)}`,
});
