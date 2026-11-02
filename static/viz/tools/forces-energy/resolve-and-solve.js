import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { line, dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { W: 60, F: 50 };
const th = (s) => (Math.atan2(s.F, s.W) * 180) / Math.PI;
const T = (s) => Math.hypot(s.W, s.F);

createTool({
  state,
  label: 'A knot on a rope with three forces: the load down, the sideways pull, and the rope tension up and across. The tension balances the other two.',
  draw(ctx, stage, c) {
    const [kx, ky, k] = [stage.w * 0.5, stage.h * 0.5, 2];
    line(ctx, kx, ky, kx - state.F * k * 0.9, ky - state.W * k * 0.9, { color: c.ink, width: 3 });
    dot(ctx, kx, ky, 6, c.ink, c.ink);
    vec(ctx, c, kx, ky, 0, state.W * k * 0.7, { color: c.a, text: 'load' });
    vec(ctx, c, kx, ky, state.F * k * 0.7, 0, { color: c.b, text: 'pull' });
    vec(ctx, c, kx, ky, -state.F * k * 0.7, -state.W * k * 0.7, { color: c.c, text: 'T', width: 4 });
  },
  controls: [
    { title: 'Resolve along two axes' },
    { key: 'W', label: 'Load W (N)', min: 20, max: 100, step: 5 },
    { key: 'F', label: 'Sideways pull F (N)', min: 0, max: 100, step: 5 },
    { readout: [
      ['Vertical: T cos θ', (s) => `${s.W} N`],
      ['Horizontal: T sin θ', (s) => `${s.F} N`],
      ['θ from vertical', (s) => `${fixed(th(s), 1)}°`],
      ['Tension T', (s) => `${fixed(T(s), 1)} N`],
    ] },
  ],
  tex: (s) => `\\tan\\theta=\\dfrac{${s.F}}{${s.W}},\\quad T=\\sqrt{${s.W}^2+${s.F}^2}=${fixed(T(s), 1)}\\ \\mathrm{N}`,
});
