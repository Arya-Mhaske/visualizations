import { createTool } from '../../lib/tool.js';
import { dot, label } from '../../lib/draw.js';
import { vec } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const state = { x: 0.5 };

createTool({
  state,
  label: 'A cross-section of a uniform Earth with a test mass on a radius. The ball inside the test mass\'s radius is shaded; it alone pulls the mass towards the centre, with a force that grows in proportion to the distance, and is zero at the centre.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w / 2, stage.h * 0.5, Math.min(stage.w, stage.h) * 0.4];
    ctx.save();
    ctx.fillStyle = c.paper;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.fillA;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(R * state.x, 1), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    const px = cx + R * state.x;
    dot(ctx, px, cy, 7, c.a, c.ink);
    if (state.x > 0.02) vec(ctx, c, px, cy, -state.x * 70, 0, { color: c.c, width: 4, text: 'g' });
    label(ctx, state.x < 0.02 ? 'at the centre: g = 0' : 'only the shaded ball pulls', stage.w / 2, 18, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Move the test mass' },
    { key: 'x', label: 'Distance r / R', min: 0, max: 1, step: 0.02 },
    { readout: [['g', (s) => `${fixed(9.8 * s.x, 2)} m/s²`], ['Mass pulling', (s) => `${fixed(s.x ** 3 * 100, 1)}% of the Earth`]] },
  ],
  tex: (s) => `g=g_0\\dfrac rR=${fixed(9.8 * s.x, 2)}\\ \\mathrm{m/s^2}`,
});
