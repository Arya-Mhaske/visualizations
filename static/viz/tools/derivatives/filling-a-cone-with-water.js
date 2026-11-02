import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { num } from '../derivative-applications/_da.js';

// Cone point-down, radius R = 3 at height H = 6. Water depth h has radius h/2, so V = (1/3)π(h/2)²h = πh³/12.
// Steady inflow k: h = (12kt/π)^(1/3), and dh/dt = 4k/(πh²). A cylinder of the same width has dh/dt = k/(9π) always.
const R = 3;
const H = 6;
const VTOT = (Math.PI * R * R * H) / 3;
const state = { k: 4, t: 5 };
const tFull = () => VTOT / state.k;
const hCone = (t) => Math.min(H, ((12 * state.k * Math.min(t, tFull())) / Math.PI) ** (1 / 3));
const hCyl = (t) => Math.min(H * 1, (state.k * t) / (Math.PI * R * R));
const rate = (t) => (4 * state.k) / (Math.PI * hCone(t) ** 2);

createTool({
  state,
  label: 'Top: a cone point-down filling with water at a steady rate. Bottom: water depth against time for the cone (coral) and for a straight-sided tank (blue), which rises at a steady speed.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, H], c, box: (s) => ({ x: 0, y: s.h * 0.52, w: s.w, h: s.h * 0.48 }) }),
  draw(ctx, stage, c, plot) {
    const h = stage.h * 0.5;
    const sc = Math.min((stage.w - 40) / (2 * R), (h - 20) / H);
    const cx = stage.w / 2;
    const base = h - 10;
    const top = base - H * sc;
    const w = hCone(state.t);
    poly(ctx, [[cx, base], [cx - w / 2 * sc, base - w * sc], [cx + w / 2 * sc, base - w * sc]], { fill: c.fillB, stroke: c.b, width: 1 });
    poly(ctx, [[cx, base], [cx - R * sc, top], [cx + R * sc, top]], { stroke: c.ink, width: 4 });
    plot.setRange([0, Math.max(6, tFull() * 1.1)], [0, H]);
    plot.axes({ xLabel: 't (s)', yLabel: 'depth h' });
    plot.fn(hCone, { color: c.a, width: 3 });
    plot.fn(hCyl, { color: c.b, width: 3, dash: [6, 4] });
    plot.point(state.t, hCone(state.t), { fill: c.a });
  },
  controls: [
    { title: 'Run the tap' },
    { key: 'k', label: 'Inflow dV/dt', min: 2, max: 10, step: 0.5, format: (v) => `${v} units/s` },
    { key: 't', label: 'Time t', min: 0.2, max: 20, step: 0.2, format: (v) => `${v.toFixed(1)} s` },
    { readout: [
      ['Depth h (cone)', () => num(hCone(state.t), 3)],
      ['Rise speed dh/dt (cone)', () => num(rate(state.t), 3)],
      ['Rise speed (straight tank)', () => num(state.k / (Math.PI * R * R), 3)],
      ['Cone full at', () => `${tFull().toFixed(1)} s`],
    ] },
  ],
  tex: (s) => `V=\\frac{\\pi h^3}{12}\\ \\Rightarrow\\ \\frac{dh}{dt}=\\frac{4}{\\pi h^2}\\frac{dV}{dt}`,
});
