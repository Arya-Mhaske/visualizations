import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { t: 3 };
const s = (t) => 20 * t - 3 * t * t + 0.2 * t ** 3;
const v = (t) => 20 - 6 * t + 0.6 * t * t;

createTool({
  state,
  label: 'Top: distance travelled against time with a tangent line at the chosen moment. Bottom: the speed against time, which equals the slope of the top curve at each moment.',
  setup: (stage, c) => [
    createPlot(stage, { x: [0, 10], y: [0, 150], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.52 }) }),
    createPlot(stage, { x: [0, 10], y: [0, 25], c, box: (st) => ({ x: 0, y: st.h * 0.52, w: st.w, h: st.h * 0.48 }) }),
  ],
  draw(ctx, stage, c, [top, bottom]) {
    top.setRange([0, 10], [0, 140]);
    top.axes({ xLabel: '', yLabel: 'distance (m)' });
    top.fn(s, { color: c.b });
    const m = v(state.t);
    top.segment(state.t - 1.2, s(state.t) - 1.2 * m, state.t + 1.2, s(state.t) + 1.2 * m, { color: c.a, width: 3 });
    top.point(state.t, s(state.t), { fill: c.a });
    bottom.setRange([0, 10], [0, 24]);
    bottom.axes({ xLabel: 't (s)', yLabel: 'speed (m/s)' });
    bottom.fn(v, { color: c.c });
    bottom.point(state.t, m, { fill: c.a });
  },
  controls: [
    { title: 'A journey' },
    { key: 't', label: 'Time t (s)', min: 0, max: 10, step: 0.1 },
    { readout: [['Distance', (x) => `${fixed(s(x.t), 1)} m`], ['Slope of the curve = speed', (x) => `${fixed(v(x.t), 2)} m/s`], ['Check (s(t+0.01)−s(t))/0.01', (x) => fixed((s(x.t + 0.01) - s(x.t)) / 0.01, 2)]] },
  ],
  tex: (x) => `v=\\dfrac{ds}{dt}=${fixed(v(x.t), 2)}\\ \\mathrm{m/s}`,
});
