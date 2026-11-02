import { createTool } from '../../lib/tool.js';
import { poly, label } from '../../lib/draw.js';
import { vec } from '../../lib/quick.js';
import { sig } from '../../lib/format.js';

const state = { d1: 10, d2: 5, v1: 1 };
const v2 = (s) => s.v1 * (s.d1 / s.d2) ** 2;

createTool({
  state,
  label: 'A pipe that is wide on the left and narrow on the right, with arrows showing the water speed. The arrow is longer in the narrow section, where the water moves faster.',
  draw(ctx, stage, c) {
    const [cy, x0, x1, xm] = [stage.h * 0.5, 14, stage.w - 14, stage.w * 0.5];
    const [h1, h2] = [state.d1 * 5, state.d2 * 5];
    poly(ctx, [[x0, cy - h1], [xm - 30, cy - h1], [xm + 30, cy - h2], [x1, cy - h2], [x1, cy + h2], [xm + 30, cy + h2], [xm - 30, cy + h1], [x0, cy + h1]], { fill: c.fillB, stroke: c.ink });
    vec(ctx, c, x0 + 20, cy, Math.min(80, state.v1 * 25), 0, { color: c.a });
    vec(ctx, c, xm + 50, cy, Math.min(120, v2(state) * 25), 0, { color: c.a });
    label(ctx, `v₁ = ${sig(state.v1, 3)} m/s`, stage.w * 0.25, cy - h1 - 14, c, { size: 12, patch: false });
    label(ctx, `v₂ = ${sig(v2(state), 3)} m/s`, stage.w * 0.75, cy - h2 - 14, c, { size: 12, patch: false });
  },
  controls: [
    { title: 'The pipe' },
    { key: 'd1', label: 'Wide diameter (cm)', min: 4, max: 12, step: 1 },
    { key: 'd2', label: 'Narrow diameter (cm)', min: 2, max: 10, step: 1 },
    { key: 'v1', label: 'Speed in the wide part (m/s)', min: 0.5, max: 3, step: 0.5 },
    { readout: [['v₂ = v₁ A₁/A₂', (s) => `${sig(v2(s), 3)} m/s`], ['Volume per second', (s) => `${sig(Math.PI * (s.d1 / 200) ** 2 * s.v1 * 1000, 3)} L/s`]] },
  ],
  tex: (s) => `A_1v_1=A_2v_2\\ \\Rightarrow\\ v_2=${sig(v2(s), 3)}\\ \\mathrm{m/s}`,
});
