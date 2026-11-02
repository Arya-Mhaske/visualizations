import { createTool } from '../../lib/tool.js';
import { bars, G } from '../../lib/quick.js';
import { line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { th: 20, mus: 0.4, m: 2 };
const rad = (d) => (d * Math.PI) / 180;
const pull = (s) => s.m * G * Math.sin(rad(s.th));
const hold = (s) => s.mus * s.m * G * Math.cos(rad(s.th));
const slip = (s) => (Math.atan(s.mus) * 180) / Math.PI;

createTool({
  state,
  label: 'A ramp tilted at the chosen angle with a block on it, and two bars comparing the pull down the slope with the largest friction that can hold the block.',
  draw(ctx, stage, c) {
    const [x0, y0, L] = [stage.w * 0.1, stage.h * 0.45, stage.w * 0.7];
    const t = rad(state.th);
    poly(ctx, [[x0, y0], [x0 + L * Math.cos(t), y0], [x0 + L * Math.cos(t), y0 - L * Math.sin(t)]], { fill: c.fillB, stroke: c.ink });
    line(ctx, x0, y0, x0 + L * Math.cos(t), y0 - L * Math.sin(t), { color: c.ink, width: 4 });
    const sub = { w: stage.w, h: stage.h * 0.4 };
    ctx.save();
    ctx.translate(0, stage.h * 0.6);
    bars(ctx, sub, c, [['pull mg sin θ', pull(state), c.fillA, `${fixed(pull(state), 1)} N`], ['max friction', hold(state), c.fillC, `${fixed(hold(state), 1)} N`]], { max: 20, top: 6, gap: 6 });
    ctx.restore();
  },
  controls: [
    { title: 'Tilt the plane' },
    { key: 'th', label: 'Angle θ (°)', min: 0, max: 60, step: 1 },
    { key: 'mus', label: 'μₛ', min: 0.1, max: 1.2, step: 0.05 },
    { key: 'm', label: 'Mass (kg)', min: 1, max: 5, step: 1 },
    { readout: [
      ['Slip angle tan⁻¹ μₛ', (s) => `${fixed(slip(s), 1)}°`],
      ['Block', (s) => (s.th > slip(s) ? 'slides' : 'stays')],
    ] },
  ],
  tex: (s) => `\\mu_s=\\tan\\theta\\ \\Rightarrow\\ \\theta=\\tan^{-1}(${s.mus})=${fixed(slip(s), 1)}^\\circ`,
});
