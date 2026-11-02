import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Air (gamma = 1.4) from 300 K, 100 kPa, volume 1 (= 100 %). Speed s in [0, 1] moves the exponent from 1 (slow, isothermal) to 1.4 (fast, adiabatic).
const state = { r: 5, s: 1 };
const expo = (s) => 1 + 0.4 * s.s;
const T2 = (s) => 300 * s.r ** (expo(s) - 1);
const P2 = (s) => 100 * s.r ** expo(s);

createTool({
  state,
  label: 'A bicycle pump barrel whose piston compresses air by a chosen ratio, with a thermometer bar showing the air temperature. Below, pressure against volume with two curves: the slow isothermal path and the chosen path. A fast push climbs the steeper curve and ends hotter.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 105], y: [0, 2000], box: (st) => ({ x: 0, y: st.h * 0.4, w: st.w, h: st.h * 0.6 }) }),
  draw(ctx, stage, c, plot) {
    const [W, H] = [stage.w, stage.h];
    const [x0, x1, y0, y1] = [W * 0.08, W * 0.62, H * 0.08, H * 0.3];
    const frac = 1 / state.r;
    ctx.fillStyle = c.fillY;
    ctx.fillRect(x0, y0, (x1 - x0) * frac, y1 - y0);
    ctx.fillStyle = c.fillA;
    ctx.globalAlpha = Math.min(1, (T2(state) - 300) / 500);
    ctx.fillRect(x0, y0, (x1 - x0) * frac, y1 - y0);
    ctx.globalAlpha = 1;
    line(ctx, x0, y0, x1, y0, { color: c.ink, width: 4 });
    line(ctx, x0, y1, x1, y1, { color: c.ink, width: 4 });
    line(ctx, x0, y0, x0, y1, { color: c.ink, width: 4 });
    line(ctx, x0 + (x1 - x0) * frac, y0 - 4, x0 + (x1 - x0) * frac, y1 + 4, { color: c.ink, width: 6 });
    line(ctx, x0 + (x1 - x0) * frac, (y0 + y1) / 2, x1 + 12, (y0 + y1) / 2, { color: c.ink, width: 4 });
    const tx = W * 0.8;
    const th = ((T2(state) - 250) / 500) * (y1 - y0 + 10);
    ctx.fillStyle = c.fillA;
    ctx.fillRect(tx, y1 - th, 22, th);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(tx, y0 - 10, 22, y1 - y0 + 10);
    label(ctx, `${fixed(T2(state) - 273.15, 0)}°C`, tx + 11, y0 - 20, c, { size: 11, bounds: stage, patch: false });
    plot.axes({ xLabel: 'V (%)', yLabel: 'P (kPa)' });
    plot.fn((v) => 10000 / v, { color: c.b, domain: [100 / state.r - 1, 100] });
    plot.fn((v) => 100 * (100 / v) ** expo(state), { color: c.a, domain: [100 / state.r - 1, 100] });
    plot.point(100, 100, { fill: c.c });
    plot.point(100 / state.r, P2(state), { fill: c.a });
    plot.point(100 / state.r, 100 * state.r, { fill: c.b });
  },
  controls: [
    { title: 'Push the pump' },
    { key: 'r', label: 'Compression ratio V₁/V₂', min: 2, max: 8, step: 1 },
    { key: 's', label: 'Speed (0 slow, 1 fast)', min: 0, max: 1, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Final T', (s) => `${fixed(T2(s), 0)} K = ${fixed(T2(s) - 273.15, 0)} °C`],
      ['Final P', (s) => `${fixed(P2(s), 0)} kPa`],
      ['Isothermal P', (s) => `${fixed(100 * s.r, 0)} kPa`],
    ] },
  ],
  tex: (s) => `T_2=T_1\\left(\\dfrac{V_1}{V_2}\\right)^{\\gamma-1}=300\\times ${s.r}^{${fixed(expo(s) - 1, 2)}}=${fixed(T2(s), 0)}\\ \\mathrm{K}`,
});
