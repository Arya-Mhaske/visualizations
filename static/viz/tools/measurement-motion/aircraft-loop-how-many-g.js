import { createTool } from '../../lib/tool.js';
import { vec, G } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { v: 900, R: 1000 };
const ms = (s) => s.v / 3.6;
const acc = (s) => ms(s) ** 2 / s.R;

createTool({
  state,
  label: 'A circular loop with an arrow towards its centre whose length shows the acceleration as a multiple of g.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h / 2, Math.min(stage.w, stage.h) * 0.34];
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    const len = Math.min(R * 0.95, (acc(state) / G) * 12);
    vec(ctx, c, cx, cy - R, 0, len, { color: c.a, width: 4 });
    vec(ctx, c, cx, cy - R, 40, 0, { color: c.b, text: 'v' });
    label(ctx, `${fixed(acc(state) / G, 1)} g`, cx, cy + 10, c, { size: 20, patch: false });
  },
  controls: [
    { title: 'The loop' },
    { key: 'v', label: 'Speed (km/h)', min: 200, max: 1200, step: 10 },
    { key: 'R', label: 'Radius (m)', min: 300, max: 3000, step: 50 },
    { readout: [
      ['Speed', (s) => `${fixed(ms(s), 1)} m/s`],
      ['a = v²/R', (s) => `${fixed(acc(s), 1)} m/s²`],
      ['In units of g', (s) => `${fixed(acc(s) / G, 2)} g`],
    ] },
  ],
  tex: (s) => `a=\\dfrac{v^2}{R}=\\dfrac{${fixed(ms(s), 1)}^2}{${s.R}}=${fixed(acc(s), 1)}\\ \\mathrm{m/s^2}`,
});
