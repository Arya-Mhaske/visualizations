import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

const state = { w: 6.28, R: 2 };

createTool({
  state,
  label: 'A circle of the chosen radius with a point on it and a radius line, for converting between angular speed, period, frequency and linear speed.',
  draw(ctx, stage, c) {
    const [cx, cy, k] = [stage.w / 2, stage.h / 2, Math.min(stage.w, stage.h) * 0.4 / 5];
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, state.R * k, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    line(ctx, cx, cy, cx + state.R * k, cy, { color: c.a, width: 3 });
    dot(ctx, cx + state.R * k, cy, 8, c.a, c.ink);
    label(ctx, `R = ${state.R} m`, cx + (state.R * k) / 2, cy - 12, c, { size: 12, patch: false });
    label(ctx, `v = ${sig(state.w * state.R, 3)} m/s`, cx, stage.h - 16, c, { size: 14, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Circular motion' },
    { key: 'w', label: 'Angular speed ω (rad/s)', min: 0.5, max: 40, step: 0.5 },
    { key: 'R', label: 'Radius R (m)', min: 0.5, max: 5, step: 0.5 },
    { readout: [
      ['Period T = 2π/ω', (s) => `${sig((2 * Math.PI) / s.w, 3)} s`],
      ['Frequency ν = 1/T', (s) => `${sig(s.w / (2 * Math.PI), 3)} Hz`],
      ['In rpm', (s) => `${fixed((s.w * 60) / (2 * Math.PI), 1)}`],
      ['Speed v = ωR', (s) => `${sig(s.w * s.R, 3)} m/s`],
    ] },
  ],
  tex: (s) => `T=\\dfrac{2\\pi}{\\omega}=${sig((2 * Math.PI) / s.w, 3)}\\ \\mathrm{s},\\quad \\nu=${sig(s.w / (2 * Math.PI), 3)}\\ \\mathrm{Hz},\\quad v=\\omega R=${sig(s.w * s.R, 3)}`,
});
