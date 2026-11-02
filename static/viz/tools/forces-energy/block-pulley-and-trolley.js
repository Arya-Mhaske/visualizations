import { createTool } from '../../lib/tool.js';
import { vec, box, G } from '../../lib/quick.js';
import { line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { M: 20, m: 3, mu: 0.04 };
const f = (s) => s.mu * s.M * G;
const a = (s) => (s.m * G - f(s)) / (s.M + s.m);
const T = (s) => s.M * a(s) + f(s);

createTool({
  state,
  label: 'A trolley on a table connected by a string over a pulley to a hanging block. Arrows show the tension on each body, the friction on the trolley and the weight of the block.',
  draw(ctx, stage, c) {
    const [x0, y0] = [stage.w * 0.12, stage.h * 0.4];
    box(ctx, c, x0, y0 - 30, 70, 30, c.fillA, `${state.M} kg`);
    line(ctx, x0 + 70, y0 - 15, stage.w * 0.75, y0 - 15, { color: c.ink, width: 2 });
    line(ctx, stage.w * 0.75, y0 - 15, stage.w * 0.75, y0 + 40, { color: c.ink, width: 2 });
    line(ctx, x0 - 10, y0, stage.w * 0.78, y0, { color: c.ink, width: 3 });
    box(ctx, c, stage.w * 0.75 - 18, y0 + 40, 36, 36, c.fillB, `${state.m}`);
    vec(ctx, c, x0 + 70, y0 - 15, T(state) * 1.5, 0, { color: c.c, text: 'T' });
    vec(ctx, c, x0, y0 - 15, -f(state) * 1.5, 0, { color: c.a, text: 'f' });
    vec(ctx, c, stage.w * 0.75, y0 + 76, 0, state.m * G * 1.2, { color: c.a, text: 'mg' });
  },
  controls: [
    { title: 'Trolley and block' },
    { key: 'M', label: 'Trolley mass M (kg)', min: 5, max: 40, step: 1 },
    { key: 'm', label: 'Hanging mass m (kg)', min: 1, max: 10, step: 0.5 },
    { key: 'mu', label: 'Friction μ on the trolley', min: 0, max: 0.3, step: 0.01 },
    { readout: [
      ['Acceleration a', (s) => `${fixed(a(s), 2)} m/s²`],
      ['Tension T', (s) => `${fixed(T(s), 1)} N`],
      ['mg', (s) => `${fixed(s.m * G, 1)} N`],
    ] },
  ],
  tex: (s) => `a=\\dfrac{mg-\\mu Mg}{M+m}=${fixed(a(s), 2)},\\quad T=${fixed(T(s), 1)}\\ \\mathrm{N}`,
});
