import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { SURF, fx, fy } from './_mv.js';

// f_xy: take f_x first, then see how it changes as y changes. f_yx: take f_y first, then see how it changes as x changes.
// With step h, the two difference quotients meet at one value as h → 0 (Clairaut), when f_xy and f_yx are continuous.
const WEIRD = (x, y) => (x === 0 && y === 0 ? 0 : (x * y * (x * x - y * y)) / (x * x + y * y));
const FUNCS = { ...Object.fromEntries(['waves', 'two', 'hill', 'saddle'].map((k) => [k, { name: SURF[k].name, f: SURF[k].f }])), weird: { name: 'xy(x²−y²)/(x²+y²)', f: WEIRD } };
const state = { fn: 'waves', x: 0.8, y: 0.5, h: 0.5 };
const F = () => FUNCS[state.fn].f;
const xyH = (h) => (fx(F(), state.x, state.y + h) - fx(F(), state.x, state.y)) / h;
const yxH = (h) => (fy(F(), state.x + h, state.y) - fy(F(), state.x, state.y)) / h;

createTool({
  state,
  label: 'Two curves against the step size h: the quotient that estimates f_xy (coral) and the one that estimates f_yx (blue). For a smooth function they approach the same value as h shrinks. For one badly behaved function at the origin they stay different.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [-2, 2], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'h', yLabel: 'estimate' });
    plot.fn((h) => xyH(Math.max(h, 1e-3)), { color: c.a, domain: [0.002, 1] });
    plot.fn((h) => yxH(Math.max(h, 1e-3)), { color: c.b, domain: [0.002, 1], dash: [6, 4] });
    plot.segment(state.h, -2, state.h, 2, { color: c.ink, width: 1.5 });
    plot.point(state.h, xyH(state.h), { fill: c.a });
    plot.point(state.h, yxH(state.h), { fill: c.b });
  },
  controls: [
    { title: 'Differentiate in both orders' },
    { key: 'fn', label: 'Function', options: Object.entries(FUNCS).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Point x', min: -2, max: 2, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'y', label: 'Point y', min: -2, max: 2, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'h', label: 'Step h', min: 0.02, max: 1, step: 0.02, format: (v) => v.toFixed(2) },
    { readout: [
      ['f_xy estimate', (s) => xyH(s.h).toFixed(4)],
      ['f_yx estimate', (s) => yxH(s.h).toFixed(4)],
      ['Gap', (s) => Math.abs(xyH(s.h) - yxH(s.h)).toFixed(4)],
      ['At h = 0.001', () => `${xyH(0.001).toFixed(3)} and ${yxH(0.001).toFixed(3)}`],
    ] },
  ],
  tex: () => 'f_{xy}=f_{yx}\\ \\text{when both are continuous}',
});
