import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { finalTemp, heat } from './_heat-capacity-math.js';

const state = { m1: 200, T1: 80, m2: 300, T2: 20, leak: false, t: 0 };
const C = 4.186;
const L = (s) => (s.leak ? 0.2 : 0);
const Tf = (s) => finalTemp(s.m1, C, s.T1, s.m2, C, s.T2, L(s));
const at = (s, T, t) => Tf(s) + (T - Tf(s)) * Math.exp(-t / 60);
const lost = (s) => -heat(s.m1 / 1000, 4186, s.T1, Tf(s));
const gained = (s) => heat(s.m2 / 1000, 4186, s.T2, Tf(s));

createTool({
  state,
  label: 'Top: temperature against time for hot water cooling and cold water warming until they meet. Bottom: two bars, the heat lost by the hot water and the heat gained by the cold water.',
  setup: (stage, c) => createPlot(stage, { x: [0, 300], y: [0, 100], c, box: (st) => ({ x: 0, y: 0, w: st.w, h: st.h * 0.66 }) }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'T (°C)' });
    plot.fn((x) => at(state, state.T1, x), { color: c.a });
    plot.fn((x) => at(state, state.T2, x), { color: c.b });
    plot.point(state.t, at(state, state.T1, state.t), { fill: c.a });
    plot.point(state.t, at(state, state.T2, state.t), { fill: c.b });
    const scale = Math.max(lost(state), 1);
    const f = 1 - Math.exp(-state.t / 60);
    [['heat lost', lost(state) * f, c.a], ['heat gained', gained(state) * f, c.b]].forEach(([name, v, col], i) => {
      const y = stage.h * 0.72 + i * 34;
      const w = (v / scale) * (stage.w * 0.55);
      poly(ctx, [[stage.w * 0.3, y], [stage.w * 0.3 + w, y], [stage.w * 0.3 + w, y + 24], [stage.w * 0.3, y + 24]], { fill: col, stroke: c.ink });
      label(ctx, name, stage.w * 0.3 - 6, y + 12, c, { size: 11, align: 'right', patch: false });
    });
  },
  controls: [
    { title: 'Hot water into cold' },
    { key: 'm1', label: 'Hot mass (g)', min: 50, max: 500, step: 10 },
    { key: 'T1', label: 'Hot T (°C)', min: 40, max: 95, step: 1 },
    { key: 'm2', label: 'Cold mass (g)', min: 50, max: 500, step: 10 },
    { key: 'T2', label: 'Cold T (°C)', min: 5, max: 35, step: 1 },
    { key: 'leak', label: 'Leaky box (20% of heat escapes)', toggle: true },
    { key: 't', label: 'Time (s)', min: 0, max: 300, step: 5 },
    { readout: [
      ['Final T', (s) => `${fixed(Tf(s), 1)} °C`],
      ['Heat lost (at the end)', (s) => `${fixed(lost(s) / 1000, 2)} kJ`],
      ['Heat gained', (s) => `${fixed(gained(s) / 1000, 2)} kJ`],
      ['Equal?', (s) => ({ text: Math.abs(lost(s) - gained(s)) < 1 ? 'yes' : 'no: it leaks', good: Math.abs(lost(s) - gained(s)) < 1 })],
    ] },
  ],
  tex: (s) => `m_1c(T_1-T_f)=m_2c(T_f-T_2)\\ \\Rightarrow\\ T_f=${fixed(Tf(s), 1)}\\,^\\circ\\mathrm{C}`,
});
