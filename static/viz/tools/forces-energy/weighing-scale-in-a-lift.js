import { createTool } from '../../lib/tool.js';
import { vec, box, G } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { m: 60, a: 2 };
const R = (s) => s.m * (G + s.a);

createTool({
  state,
  label: 'A person standing on a scale inside a lift. Arrows show the weight down and the scale force up; the scale force changes with the lift acceleration.',
  draw(ctx, stage, c) {
    const [cx, base] = [stage.w / 2, stage.h * 0.82];
    box(ctx, c, cx - 70, stage.h * 0.1, 140, base - stage.h * 0.1, c.paper);
    box(ctx, c, cx - 36, base - 14, 72, 14, c.fillB, `${fixed(R(state) / G, 1)} kg`);
    box(ctx, c, cx - 14, base - 90, 28, 76, c.fillA);
    const k = 0.08;
    vec(ctx, c, cx + 30, base - 50, 0, state.m * G * k, { color: c.a, text: 'W' });
    vec(ctx, c, cx - 30, base - 14, 0, -R(state) * k, { color: c.c, text: 'R' });
    label(ctx, state.a > 0 ? 'accelerating up' : state.a < 0 ? 'accelerating down' : 'steady', cx, stage.h * 0.06, c, { size: 12, patch: false });
  },
  controls: [
    { title: 'Ride the lift' },
    { key: 'm', label: 'Mass (kg)', min: 40, max: 90, step: 5 },
    { key: 'a', label: 'Lift acceleration up (m/s²)', min: -9.8, max: 5, step: 0.2 },
    { readout: [
      ['Weight mg', (s) => `${fixed(s.m * G, 0)} N`],
      ['Scale force R = m(g + a)', (s) => `${fixed(R(s), 0)} N`],
      ['Scale reads', (s) => `${fixed(R(s) / G, 1)} kg`],
    ] },
  ],
  tex: (s) => `R=m(g+a)=${s.m}\\times(9.8+(${s.a}))=${fixed(R(s), 0)}\\ \\mathrm{N}`,
});
