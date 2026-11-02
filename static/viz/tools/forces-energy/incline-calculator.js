import { createTool } from '../../lib/tool.js';
import { vec, G } from '../../lib/quick.js';
import { line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { m: 5, th: 25, mus: 0.5, muk: 0.4 };
const rad = (d) => (d * Math.PI) / 180;
const N = (s) => s.m * G * Math.cos(rad(s.th));
const pull = (s) => s.m * G * Math.sin(rad(s.th));
const slides = (s) => pull(s) > s.mus * N(s);
const f = (s) => (slides(s) ? s.muk * N(s) : pull(s));
const a = (s) => (slides(s) ? (pull(s) - s.muk * N(s)) / s.m : 0);

createTool({
  state,
  label: 'A block on an inclined plane with arrows for its weight, the normal force, the friction and the pull down the slope.',
  draw(ctx, stage, c) {
    const [x0, y0, L] = [stage.w * 0.1, stage.h * 0.8, stage.w * 0.75];
    const t = rad(state.th);
    poly(ctx, [[x0, y0], [x0 + L * Math.cos(t), y0], [x0 + L * Math.cos(t), y0 - L * Math.sin(t)]], { fill: c.fillB, stroke: c.ink });
    line(ctx, x0, y0, x0 + L * Math.cos(t), y0 - L * Math.sin(t), { color: c.ink, width: 4 });
    const [bx, by] = [x0 + L * 0.55 * Math.cos(t), y0 - L * 0.55 * Math.sin(t) - 16];
    vec(ctx, c, bx, by, 0, state.m * G * 1.2, { color: c.a, text: 'W' });
    vec(ctx, c, bx, by, -Math.sin(t) * N(state) * 1.2, -Math.cos(t) * N(state) * 1.2, { color: c.c, text: 'N' });
    vec(ctx, c, bx, by, -Math.cos(t) * f(state) * 1.2, Math.sin(t) * f(state) * 1.2, { color: c.b, text: 'f' });
  },
  controls: [
    { title: 'The slope' },
    { key: 'm', label: 'Mass (kg)', min: 1, max: 10, step: 1 },
    { key: 'th', label: 'Angle θ (°)', min: 0, max: 60, step: 1 },
    { key: 'mus', label: 'μₛ', min: 0.1, max: 1, step: 0.05 },
    { key: 'muk', label: 'μₖ', min: 0.05, max: 0.9, step: 0.05 },
    { readout: [
      ['Normal N', (s) => `${fixed(N(s), 1)} N`],
      ['Pull mg sin θ', (s) => `${fixed(pull(s), 1)} N`],
      ['Friction', (s) => `${fixed(f(s), 1)} N`],
      ['Acceleration', (s) => (slides(s) ? `${fixed(a(s), 2)} m/s² down` : 'at rest')],
    ] },
  ],
  tex: (s) => `a=g(\\sin\\theta-\\mu_k\\cos\\theta)=${fixed(a(s), 2)}\\ \\mathrm{m/s^2}`,
});
