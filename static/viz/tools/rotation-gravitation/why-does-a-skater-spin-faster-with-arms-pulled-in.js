import { barTool } from '../../lib/recipes.js';
import { dot, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { r: 0.8 };
const [I0, m, L0] = [1.5, 2, 6];
const I = (r) => I0 + 2 * m * r * r;
const w = (r) => L0 / I(r);

barTool({
  state,
  label: 'Bars for the moment of inertia, the angular speed, the angular momentum and the kinetic energy of a spinner with two weights. Bringing the weights in lowers I, raises ω and the energy, and leaves L unchanged. A small figure shows the arm length.',
  rows: (s, c) => [['I', I(s.r), c.fillB, `${fixed(I(s.r), 2)} kg m²`], ['ω', w(s.r), c.fillA, `${fixed(w(s.r), 2)} rad/s`], ['L = Iω', L0, c.fillC, `${fixed(I(s.r) * w(s.r), 2)}`], ['KE', 0.5 * I(s.r) * w(s.r) ** 2, c.fillA, `${fixed(0.5 * I(s.r) * w(s.r) ** 2, 1)} J`]],
  max: 12,
  left: 0.2,
  draw: (ctx, stage, c) => {
    const [cx, cy, k] = [stage.w / 2, stage.h * 0.86, 40];
    line(ctx, cx - state.r * k, cy, cx + state.r * k, cy, { color: c.ink, width: 4 });
    dot(ctx, cx - state.r * k, cy, 8, c.a, c.ink);
    dot(ctx, cx + state.r * k, cy, 8, c.a, c.ink);
    dot(ctx, cx, cy, 10, c.fillB, c.ink);
  },
  controls: [
    { title: 'Pull in the arms' },
    { key: 'r', label: 'Arm length r (m)', min: 0.2, max: 1, step: 0.05 },
    { readout: [['Iω', (s) => fixed(I(s.r) * w(s.r), 3)], ['Extra KE vs arms out', (s) => `${fixed(0.5 * I(s.r) * w(s.r) ** 2 - 0.5 * I(1) * w(1) ** 2, 2)} J`]] },
  ],
  tex: (s) => `I\\omega=L:\\ I=${fixed(I(s.r), 2)},\\ \\omega=${fixed(w(s.r), 2)}`,
});
