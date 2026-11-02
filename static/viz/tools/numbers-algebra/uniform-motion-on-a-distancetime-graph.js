import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { meet } from './_linear-equations-math.js';

const state = { mode: 'towards', D: 300, vA: 60, vB: 40 };
const T = (s) => meet(s.D, s.vA, s.vB, s.mode);
const xA = (s, t) => s.vA * t;
const xB = (s, t) => (s.mode === 'towards' ? s.D - s.vB * t : s.D + s.vB * t);

createTool({
  state,
  label: 'A graph of distance against time with one straight line for each train. A dot marks where the lines cross, which is the meeting time and place.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 600], c }),
  draw(ctx, stage, c, plot) {
    const t = T(state);
    const tmax = t ? Math.max(2, t * 1.6) : 5;
    const top = Math.max(state.D * 1.3, xA(state, tmax) * 1.05, xB(state, tmax) * 1.05);
    plot.setRange([0, tmax], [0, top]);
    plot.axes({ xLabel: 't (h)', yLabel: 'distance (km)' });
    plot.fn((x) => xA(state, x), { color: c.a });
    plot.fn((x) => xB(state, x), { color: c.b });
    if (t) plot.point(t, xA(state, t), { fill: c.c, r: 8 });
  },
  controls: [
    { title: 'Two trains' },
    { key: 'mode', label: 'Directions', options: [['towards', 'Towards each other'], ['chase', 'Chase']] },
    { key: 'D', label: 'Distance apart D (km)', min: 100, max: 500, step: 20 },
    { key: 'vA', label: 'Speed of A (km/h)', min: 20, max: 120, step: 5 },
    { key: 'vB', label: 'Speed of B (km/h)', min: 20, max: 120, step: 5 },
    { readout: [
      ['Meet after', (s) => (T(s) ? `${fixed(T(s), 2)} h` : 'never')],
      ['At distance', (s) => (T(s) ? `${fixed(xA(s, T(s)), 1)} km from A's start` : '—')],
    ] },
  ],
  tex: (s) => (s.mode === 'towards' ? `${s.vA}t=${s.D}-${s.vB}t\\ \\Rightarrow\\ t=\\dfrac{${s.D}}{${s.vA + s.vB}}` : `${s.vA}t=${s.D}+${s.vB}t\\ \\Rightarrow\\ t=${T(s) ? `\\dfrac{${s.D}}{${s.vA - s.vB}}` : '\\text{never}'}`),
});
