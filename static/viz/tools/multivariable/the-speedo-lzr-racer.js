import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';

// A toy drag model for a swimmer: D = ½ ρ A C v². Linearise in the two things a suit and a swimmer can change, v and C.
// The numbers (area, coefficient) are illustrative round values, not measurements of any real suit or swimmer.
const RHO = 1000;
const AREA = 0.07;
export const drag = (v, C) => 0.5 * RHO * AREA * C * v * v;
export const dDdv = (v, C) => RHO * AREA * C * v;
export const dDdC = (v) => 0.5 * RHO * AREA * v * v;
const state = { v: 1.8, C: 0.7, dv: 0.1, dC: -0.07 };
const parts = (s) => {
  const exact = drag(s.v + s.dv, s.C + s.dC) - drag(s.v, s.C);
  const fromV = dDdv(s.v, s.C) * s.dv;
  const fromC = dDdC(s.v) * s.dC;
  return { base: drag(s.v, s.C), exact, fromV, fromC, linear: fromV + fromC };
};

createTool({
  state,
  label: 'Three bars for the change in drag force: the part due to swimming faster, the part due to a lower drag coefficient, and their sum from the linear model, beside the exact change. The sum is close to the exact value for small changes.',
  draw(ctx, stage, c) {
    const p = parts(state);
    const bars = [['from speed', p.fromV, c.fillB], ['from coefficient', p.fromC, c.fillC], ['linear sum', p.linear, c.fillY], ['exact', p.exact, c.fillA]];
    const top = Math.max(...bars.map(([, v]) => Math.abs(v)), 1);
    const zero = stage.h / 2;
    const bw = (stage.w - 40) / 4;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, zero);
    ctx.lineTo(stage.w - 10, zero);
    ctx.stroke();
    bars.forEach(([name, v, fill], i) => {
      const h = (v / top) * (stage.h / 2 - 50);
      const x = 20 + i * bw;
      ctx.fillStyle = fill;
      ctx.fillRect(x + 4, h > 0 ? zero - h : zero, bw - 8, Math.abs(h));
      ctx.strokeRect(x + 4, h > 0 ? zero - h : zero, bw - 8, Math.abs(h));
      label(ctx, `${v >= 0 ? '+' : ''}${v.toFixed(1)} N`, x + bw / 2, h > 0 ? zero - h - 12 : zero - h + 12, c, { size: 11, bounds: stage });
      label(ctx, name, x + bw / 2, stage.h - 18, c, { size: 10, bounds: stage });
    });
  },
  controls: [
    { title: 'Change speed and suit' },
    { key: 'v', label: 'Speed, v (m/s)', min: 1, max: 2.4, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'C', label: 'Drag coefficient, C', min: 0.3, max: 1, step: 0.01, format: (v) => v.toFixed(2) },
    { key: 'dv', label: 'Change in speed', min: -0.3, max: 0.3, step: 0.01, format: (v) => v.toFixed(2) },
    { key: 'dC', label: 'Change in coefficient', min: -0.2, max: 0.2, step: 0.01, format: (v) => v.toFixed(2) },
    { readout: [
      ['Drag now', (s) => `${parts(s).base.toFixed(1)} N`],
      ['Linear change', (s) => `${parts(s).linear.toFixed(2)} N`],
      ['Exact change', (s) => `${parts(s).exact.toFixed(2)} N`],
      ['Drag falls by', (s) => `${((-parts(s).exact / parts(s).base) * 100).toFixed(1)} %`],
    ] },
  ],
  tex: (s) => `\\Delta D\\approx \\rho A C v\\,\\Delta v+\\tfrac12\\rho A v^2\\,\\Delta C=${parts(s).linear.toFixed(2)}`,
});
