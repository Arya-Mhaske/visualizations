import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, TAU } from '../../lib/draw.js';
import { num } from '../derivative-applications/_da.js';

// V = (4/3)πr³, and air goes in at a steady k cm³/s. So V = kt, r = (3kt/4π)^(1/3), and dr/dt = k/(4πr²).
// Each shell of equal volume is thinner than the last because the surface it must cover is bigger.
const state = { k: 200, t: 6 };
const TMAX = 20;
const r = (t) => ((3 * state.k * t) / (4 * Math.PI)) ** (1 / 3);
const drdt = (t) => (t === 0 ? Infinity : state.k / (4 * Math.PI * r(t) ** 2));
const SHELL = 200; // cm³ per ring drawn

createTool({
  state,
  label: 'Top: circles for each equal 200 cubic centimetres of air pumped in; the rings get closer together. Bottom: the rate at which the radius grows, falling with time.',
  setup: (stage, c) => createPlot(stage, { x: [0, TMAX], y: [0, 3], c, box: (s) => ({ x: 0, y: s.h * 0.5, w: s.w, h: s.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const h = stage.h * 0.5;
    const cx = stage.w / 2;
    const cy = h / 2;
    const rMax = ((3 * state.k * TMAX) / (4 * Math.PI)) ** (1 / 3);
    const s = (Math.min(stage.w, h) / 2 - 8) / rMax;
    const V = state.k * state.t;
    for (let k = 1; k * SHELL <= V + 1e-9; k++) {
      const rr = ((3 * k * SHELL) / (4 * Math.PI)) ** (1 / 3);
      arc(ctx, cx, cy, rr * s, 0, TAU, { color: c.ink, width: 1.5 });
    }
    arc(ctx, cx, cy, r(state.t) * s, 0, TAU, { color: c.a, width: 4 });
    plot.setRange([0, TMAX], [0, Math.min(3, drdt(0.5) * 1.1)]);
    plot.axes({ xLabel: 't (s)', yLabel: 'dr/dt (cm/s)' });
    plot.fn(drdt, { color: c.b, width: 3, domain: [0.3, TMAX] });
    plot.point(Math.max(0.3, state.t), drdt(Math.max(0.3, state.t)), { fill: c.a });
  },
  controls: [
    { title: 'Pump air in' },
    { key: 'k', label: 'Air rate dV/dt', min: 50, max: 400, step: 10, format: (v) => `${v} cm³/s` },
    { key: 't', label: 'Time t', min: 0.5, max: TMAX, step: 0.5, format: (v) => `${v} s` },
    { readout: [
      ['Radius r', () => `${r(state.t).toFixed(2)} cm`],
      ['Surface area 4πr²', () => `${num(4 * Math.PI * r(state.t) ** 2, 4)} cm²`],
      ['Radius growth dr/dt', () => `${drdt(state.t).toFixed(4)} cm/s`],
    ] },
  ],
  tex: (s) => `\\frac{dr}{dt}=\\frac{1}{4\\pi r^2}\\frac{dV}{dt}=\\frac{${s.k}}{4\\pi(${r(s.t).toFixed(2)})^2}`,
});
