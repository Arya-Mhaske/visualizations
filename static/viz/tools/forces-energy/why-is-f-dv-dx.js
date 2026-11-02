import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const LAND = { well: ['Spring well', (x) => 0.5 * x * x, [-3, 3], [0, 5]], double: ['Double well', (x) => (x * x - 4) ** 2 / 16, [-3.5, 3.5], [0, 2]], hill: ['Hill', (x) => 2 * Math.exp(-x * x / 2), [-4, 4], [0, 2.5]] };
const state = { l: 'double', x: 1 };
const V = (s) => LAND[s.l][1];
const dV = (s, x) => (V(s)(x + 1e-5) - V(s)(x - 1e-5)) / 2e-5;

createTool({
  state,
  label: 'Top: an energy landscape V of x with a ball and a tangent line showing the slope. Bottom: the force, which is minus the slope.',
  setup: (stage, c) => [
    createPlot(stage, { x: [-3, 3], y: [0, 5], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.52 }) }),
    createPlot(stage, { x: [-3, 3], y: [-4, 4], c, box: (st) => ({ x: 0, y: st.h * 0.52, w: st.w, h: st.h * 0.48 }) }),
  ],
  draw(ctx, stage, c, [top, bottom]) {
    const [, , xr, yr] = LAND[state.l];
    top.setRange(xr, yr);
    top.axes({ xLabel: '', yLabel: 'V' });
    top.fn(V(state), { color: c.b });
    const sl = dV(state, state.x);
    top.segment(state.x - 0.8, V(state)(state.x) - 0.8 * sl, state.x + 0.8, V(state)(state.x) + 0.8 * sl, { color: c.a, width: 3 });
    top.point(state.x, V(state)(state.x), { fill: c.a });
    bottom.setRange(xr, [-3, 3]);
    bottom.axes({ xLabel: 'x', yLabel: 'F = −dV/dx' });
    bottom.fn((x) => -dV(state, x), { color: c.c });
    bottom.point(state.x, -sl, { fill: c.a });
  },
  controls: [
    { title: 'Roll the ball' },
    { key: 'l', label: 'Landscape', options: Object.entries(LAND).map(([k, v]) => [k, v[0]]) },
    { key: 'x', label: 'Position x', min: -3, max: 3, step: 0.1 },
    { readout: [
      ['V(x)', (s) => fixed(V(s)(s.x), 3)],
      ['Slope dV/dx', (s) => fixed(dV(s, s.x), 3)],
      ['Force F = −dV/dx', (s) => fixed(-dV(s, s.x), 3)],
      ['Pushed', (s) => (Math.abs(dV(s, s.x)) < 0.02 ? 'nowhere: equilibrium' : dV(s, s.x) > 0 ? 'to the left' : 'to the right')],
    ] },
  ],
  tex: (s) => `F=-\\dfrac{dV}{dx}=${fixed(-dV(s, s.x), 3)}`,
});
