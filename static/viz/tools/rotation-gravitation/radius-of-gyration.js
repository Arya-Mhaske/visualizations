import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const BODY = { ring: ['Ring', 1], disc: ['Disc', 0.5], sphere: ['Solid sphere', 0.4], hollow: ['Hollow sphere', 2 / 3], rodcentre: ['Rod about its centre (L = 2R)', 1 / 3] };
const state = { b: 'disc', R: 1 };
const k = (s) => s.R * Math.sqrt(BODY[s.b][1]);

createTool({
  state,
  label: 'A circle for the body of radius R and a coral ring inside it whose radius is the radius of gyration, the radius of the thin ring with the same moment of inertia.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h * 0.5, Math.min(stage.w, stage.h) * 0.36];
    ctx.save();
    ctx.fillStyle = c.fillB;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, R * Math.sqrt(BODY[state.b][1]), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    label(ctx, `k = ${fixed(Math.sqrt(BODY[state.b][1]), 3)} R`, cx, 20, c, { size: 14, patch: false });
  },
  controls: [
    { title: 'A body' },
    { key: 'b', label: 'Body', options: Object.entries(BODY).map(([key, v]) => [key, v[0]]) },
    { key: 'R', label: 'Radius R (m)', min: 0.2, max: 2, step: 0.1 },
    { readout: [
      ['I / (MR²)', (s) => fixed(BODY[s.b][1], 3)],
      ['k = √(I/M)', (s) => `${fixed(k(s), 3)} m`],
      ['k / R', (s) => fixed(Math.sqrt(BODY[s.b][1]), 3)],
    ] },
  ],
  tex: (s) => `k=\\sqrt{I/M}=${fixed(Math.sqrt(BODY[s.b][1]), 3)}\\,R`,
});
