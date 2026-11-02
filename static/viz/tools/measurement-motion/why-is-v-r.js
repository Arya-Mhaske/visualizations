import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { w: 1, R2: 2, t: 1.5 };
const R1 = 1;

createTool({
  state,
  label: 'A turntable with two riders at different distances from the centre. Both turn through the same angle in the same time; the outer one traces a longer arc.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const k = Math.min(stage.w, stage.h) * 0.4 / 3;
    const th = state.w * state.t;
    [[R1, c.a], [state.R2, c.b]].forEach(([R, col]) => {
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, R * k, 0, -th, true);
      ctx.stroke();
      ctx.restore();
      dot(ctx, cx + R * k * Math.cos(th), cy - R * k * Math.sin(th), 8, col, c.ink);
    });
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + state.R2 * k * Math.cos(th), cy - state.R2 * k * Math.sin(th));
    ctx.stroke();
    ctx.restore();
    label(ctx, `θ = ωt = ${fixed(th, 2)} rad`, stage.w / 2, 18, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'The turntable' },
    { key: 'w', label: 'Angular speed ω (rad/s)', min: 0.25, max: 2, step: 0.25 },
    { key: 'R2', label: 'Outer radius (m)', min: 1, max: 3, step: 0.25 },
    { key: 't', label: 'Time t (s)', min: 0, max: 4, step: 0.25 },
    { readout: [
      ['Inner arc  s = Rθ', (s) => `${fixed(R1 * s.w * s.t, 2)} m`],
      ['Outer arc', (s) => `${fixed(s.R2 * s.w * s.t, 2)} m`],
      ['Inner v = ωR', (s) => `${fixed(s.w * R1, 2)} m/s`],
      ['Outer v = ωR', (s) => `${fixed(s.w * s.R2, 2)} m/s`],
    ] },
  ],
  tex: (s) => `v=\\omega R=${s.w}\\times${s.R2}=${fixed(s.w * s.R2, 2)}\\ \\mathrm{m/s}`,
});
