import { createTool } from '../../lib/tool.js';
import { vec, box } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { F: 20, mA: 2, mB: 6, same: false };

createTool({
  state,
  label: 'Two blocks pressed together. The force on A by B and the force on B by A are drawn on different blocks and point opposite ways. If both are drawn on one block, they would cancel.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h * 0.5];
    box(ctx, c, cx - 80, cy - 25, 80, 50, c.fillA, `A ${state.mA} kg`);
    box(ctx, c, cx, cy - 25, 80, 50, c.fillB, `B ${state.mB} kg`);
    if (state.same) {
      vec(ctx, c, cx - 40, cy - 40, -state.F * 2, 0, { color: c.a, text: 'F on A' });
      vec(ctx, c, cx - 40, cy - 40, state.F * 2, 0, { color: c.b, text: 'F on A?' });
      label(ctx, 'both on A: they would cancel (wrong)', cx, 24, c, { size: 12, bounds: stage, patch: false });
    } else {
      vec(ctx, c, cx - 80, cy, -state.F * 2, 0, { color: c.a, text: 'F on A by B' });
      vec(ctx, c, cx + 80, cy, state.F * 2, 0, { color: c.b, text: 'F on B by A' });
    }
  },
  controls: [
    { title: 'Push each other' },
    { key: 'F', label: 'Force F (N)', min: 5, max: 40, step: 5 },
    { key: 'mA', label: 'Mass of A (kg)', min: 1, max: 10, step: 1 },
    { key: 'mB', label: 'Mass of B (kg)', min: 1, max: 10, step: 1 },
    { key: 'same', label: 'Draw both on one block (wrong)', toggle: true },
    { readout: [
      ['a of A', (s) => `${fixed(s.F / s.mA, 2)} m/s² (left)`],
      ['a of B', (s) => `${fixed(s.F / s.mB, 2)} m/s² (right)`],
    ] },
  ],
  tex: (s) => `\\vec F_{AB}=-\\vec F_{BA}\\quad a_A=\\dfrac{F}{m_A}=${fixed(s.F / s.mA, 2)},\\ a_B=\\dfrac{F}{m_B}=${fixed(s.F / s.mB, 2)}`,
});
