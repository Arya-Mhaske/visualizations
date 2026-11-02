import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G, rad, range, peak } from './_proj.js';

const state = { v: 20, th: 30 };
const arc = (th, x) => x * Math.tan(rad(th)) - (G * x * x) / (2 * state.v ** 2 * Math.cos(rad(th)) ** 2);

createTool({
  state,
  label: 'Top: the path at the chosen angle and, dashed, the path at 45 degrees. Bottom: a graph of range against launch angle with its peak at 45 degrees.',
  setup: (stage, c) => [
    createPlot(stage, { x: [0, 42], y: [0, 12], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.52 }) }),
    createPlot(stage, { x: [0, 90], y: [0, 42], c, box: (st) => ({ x: 0, y: st.h * 0.52, w: st.w, h: st.h * 0.48 }) }),
  ],
  draw(ctx, stage, c, [top, bottom]) {
    const R = (th) => range(state.v, th);
    const xm = (state.v ** 2) / G;
    top.setRange([0, xm * 1.05], [0, (state.v ** 2) / (2 * G) * 0.55]);
    top.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    top.fn((x) => arc(45, x), { color: c.c, dash: [6, 5], domain: [0, R(45)] });
    top.fn((x) => arc(state.th, x), { color: c.a, domain: [0, R(state.th)] });
    bottom.setRange([0, 90], [0, xm * 1.1]);
    bottom.axes({ xLabel: 'θ (°)', yLabel: 'range (m)' });
    bottom.fn(R, { color: c.b });
    bottom.point(state.th, R(state.th));
  },
  controls: [
    { title: 'Sweep the angle' },
    { key: 'v', label: 'Speed v (m/s)', min: 10, max: 30, step: 1 },
    { key: 'th', label: 'Angle θ (°)', min: 5, max: 85, step: 5 },
    { readout: [
      ['Range at θ', (s) => `${fixed(range(s.v, s.th), 1)} m`],
      ['Range at 45°', (s) => `${fixed(range(s.v, 45), 1)} m`],
      ['Peak height', (s) => `${fixed(peak(s.v, s.th), 1)} m`],
    ] },
  ],
  tex: (s) => `R=\\dfrac{v^2\\sin2\\theta}{g}=${fixed(range(s.v, s.th), 1)}\\ \\mathrm{m}`,
});
