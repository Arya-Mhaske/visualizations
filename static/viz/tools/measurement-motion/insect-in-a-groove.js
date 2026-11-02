import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { n: 7, T: 100, R: 12, t: 20 };
const w = (s) => (2 * Math.PI * s.n) / s.T;

createTool({
  state,
  label: 'A circular groove with an insect and the angle it has swept so far shown as a filled sector.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h / 2, Math.min(stage.w, stage.h) * 0.36];
    const th = (w(state) * state.t) % (2 * Math.PI);
    ctx.save();
    ctx.fillStyle = c.fillA;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, 0, -th, true);
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    dot(ctx, cx + R * Math.cos(th), cy - R * Math.sin(th), 8, c.a, c.ink);
    label(ctx, `${fixed(w(state) * state.t / (2 * Math.PI), 2)} turns so far`, cx, stage.h - 14, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'The groove' },
    { key: 'n', label: 'Revolutions', min: 1, max: 20, step: 1 },
    { key: 'T', label: 'In time (s)', min: 20, max: 200, step: 10 },
    { key: 'R', label: 'Groove radius (cm)', min: 5, max: 30, step: 1 },
    { key: 't', label: 'Time now (s)', min: 0, max: 200, step: 5 },
    { readout: [
      ['ω', (s) => `${fixed(w(s), 3)} rad/s`],
      ['Period', (s) => `${fixed(s.T / s.n, 2)} s`],
      ['Speed v = ωR', (s) => `${fixed(w(s) * s.R, 2)} cm/s`],
    ] },
  ],
  tex: (s) => `\\omega=\\dfrac{2\\pi\\times${s.n}}{${s.T}}=${fixed(w(s), 3)}\\ \\mathrm{rad/s}`,
});
