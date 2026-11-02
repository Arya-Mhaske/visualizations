import { createTool } from '../../lib/tool.js';
import { vec, box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { T: 20, f: 8, m: 4, wrong: false };
const net = (s) => s.T - s.f;

createTool({
  state,
  label: 'A block with a pull to the right and friction to the left, both labelled as forces on the block by something. If the "ma" arrow is added as a force, the total becomes zero.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h * 0.5];
    box(ctx, c, cx - 36, cy - 28, 72, 56, c.fillA, `${state.m} kg`);
    vec(ctx, c, cx + 36, cy, state.T * 3, 0, { color: c.b, text: 'pull by rope' });
    vec(ctx, c, cx - 36, cy, -state.f * 3, 0, { color: c.a, text: 'friction by floor' });
    if (state.wrong) vec(ctx, c, cx, cy + 50, -net(state) * 3, 0, { color: c.d, text: '"ma"' });
    label(ctx, state.wrong ? 'ΣF = 0 with "ma" included: nothing could accelerate' : `ΣF = ${fixed(net(state), 1)} N, so a = ${fixed(net(state) / state.m, 2)} m/s²`, stage.w / 2, 24, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Forces on the block' },
    { key: 'T', label: 'Pull by rope (N)', min: 0, max: 40, step: 1 },
    { key: 'f', label: 'Friction by floor (N)', min: 0, max: 40, step: 1 },
    { key: 'm', label: 'Mass (kg)', min: 1, max: 10, step: 1 },
    { key: 'wrong', label: 'Draw "ma" as a force (wrong)', toggle: true },
    { readout: [
      ['Net force ΣF', (s) => `${fixed(net(s), 1)} N`],
      ['Acceleration a = ΣF/m', (s) => `${fixed(net(s) / s.m, 2)} m/s²`],
    ] },
  ],
  tex: (s) => `\\sum F=T-f=${fixed(net(s), 1)}\\ \\mathrm{N},\\quad a=\\dfrac{\\sum F}{m}=${fixed(net(s) / s.m, 2)}\\ \\mathrm{m/s^2}`,
});
