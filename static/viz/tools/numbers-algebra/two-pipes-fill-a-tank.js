import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { fillTime } from './_rational-math.js';

const state = { a: 6, b: 3, drain: false, c: 12, t: 1 };
const net = (s) => 1 / s.a + 1 / s.b - (s.drain ? 1 / s.c : 0);
const T = (s) => fillTime(s.a, s.b, s.drain ? s.c : 0);
const level = (s, t) => Math.max(0, Math.min(1, net(s) * t));

createTool({
  state,
  label: 'A graph of how full the tank is against time, with one line for pipe A, one for pipe B and a steeper line for both together. A small tank picture shows the level at the chosen time.',
  setup: (stage, c) => createPlot(stage, { x: [0, 14], y: [0, 1.05], c, box: (st) => ({ x: st.w * 0.28, y: 0, w: st.w * 0.72, h: st.h }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (h)', yLabel: 'fraction filled' });
    plot.fn((x) => Math.min(1, x / state.a), { color: c.a });
    plot.fn((x) => Math.min(1, x / state.b), { color: c.b });
    plot.fn((x) => level(state, x), { color: c.c });
    plot.point(state.t, level(state, state.t), { fill: c.c });
    const [x0, y0, w, h] = [12, 24, stage.w * 0.2, stage.h * 0.62];
    const f = level(state, state.t);
    poly(ctx, [[x0, y0 + h * (1 - f)], [x0 + w, y0 + h * (1 - f)], [x0 + w, y0 + h], [x0, y0 + h]], { fill: c.fillB });
    poly(ctx, [[x0, y0], [x0, y0 + h], [x0 + w, y0 + h], [x0 + w, y0]], { stroke: c.ink, closed: false });
    label(ctx, `${fixed(f * 100, 0)}% full`, x0 + w / 2, y0 + h + 18, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two pipes' },
    { key: 'a', label: 'A alone (hours)', min: 2, max: 12, step: 1 },
    { key: 'b', label: 'B alone (hours)', min: 2, max: 12, step: 1 },
    { key: 'drain', label: 'Add a drain', toggle: true },
    { key: 'c', label: 'Drain empties it in (hours)', min: 3, max: 20, step: 1 },
    { key: 't', label: 'Time (hours)', min: 0, max: 14, step: 0.5 },
    { readout: [
      ['Rate of A + B', (s) => `${fixed(1 / s.a + 1 / s.b, 3)} tank/h`],
      ['Net rate', (s) => `${fixed(net(s), 3)} tank/h`],
      ['Time to fill', (s) => (T(s) ? `${fixed(T(s), 2)} h` : 'never fills')],
    ] },
  ],
  tex: (s) => `\\dfrac1{${s.a}}+\\dfrac1{${s.b}}${s.drain ? `-\\dfrac1{${s.c}}` : ''}=\\dfrac1t\\ \\Rightarrow\\ t=${T(s) ? fixed(T(s), 2) : '\\infty'}`,
});
