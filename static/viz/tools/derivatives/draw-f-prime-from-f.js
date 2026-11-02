import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FN = { cubic: ['Cubic', (x) => (x ** 3) / 3 - x, (x) => x * x - 1, [-2.5, 2.5], [-2, 2]], sin: ['Sine', Math.sin, Math.cos, [-4, 4], [-1.5, 1.5]], bump: ['Bump', (x) => Math.exp(-x * x), (x) => -2 * x * Math.exp(-x * x), [-3, 3], [-0.5, 1.2]] };
const state = { f: 'cubic', x: -1.5 };

createTool({
  state,
  label: 'Top: a curve with a tangent line at the chosen point. Bottom: the slope readings plotted so far, tracing the derivative curve.',
  setup: (stage, c) => [
    createPlot(stage, { x: [-3, 3], y: [-2, 2], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.52 }) }),
    createPlot(stage, { x: [-3, 3], y: [-2, 2], c, box: (st) => ({ x: 0, y: st.h * 0.52, w: st.w, h: st.h * 0.48 }) }),
  ],
  draw(ctx, stage, c, [top, bottom]) {
    const [, f, d, xr, yr] = FN[state.f];
    top.setRange(xr, yr);
    top.axes({ xLabel: '', yLabel: 'f' });
    top.fn(f, { color: c.b });
    const m = d(state.x);
    top.segment(state.x - 0.8, f(state.x) - 0.8 * m, state.x + 0.8, f(state.x) + 0.8 * m, { color: c.a, width: 3 });
    top.point(state.x, f(state.x), { fill: c.a });
    bottom.setRange(xr, [-2.2, 2.2]);
    bottom.axes({ xLabel: 'x', yLabel: "f′" });
    bottom.fn(d, { color: c.c, domain: [xr[0], state.x] });
    bottom.point(state.x, m, { fill: c.a });
  },
  controls: [
    { title: 'The slope meter' },
    { key: 'f', label: 'Curve', options: Object.entries(FN).map(([k, v]) => [k, v[0]]) },
    { key: 'x', label: 'Position x', min: -4, max: 4, step: 0.05 },
    { readout: [['f(x)', (s) => fixed(FN[s.f][1](s.x), 3)], ["Slope f′(x)", (s) => fixed(FN[s.f][2](s.x), 3)]] },
  ],
  tex: (s) => `f'(${s.x})=${fixed(FN[s.f][2](s.x), 3)}`,
  onChange: (s) => {
    s.x = Math.max(FN[s.f][3][0], Math.min(FN[s.f][3][1], s.x));
  },
});
