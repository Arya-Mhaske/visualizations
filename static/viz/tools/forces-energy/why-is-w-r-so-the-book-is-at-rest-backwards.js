import { createTool } from '../../lib/tool.js';
import { vec, box, G } from '../../lib/quick.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { m: 2, a: 0 };
const R = (s) => s.m * (G + s.a);

createTool({
  state,
  label: 'A book on a table with an arrow down for its weight and an arrow up for the normal reaction. The arrows are equal only when the table does not accelerate.',
  draw(ctx, stage, c) {
    const [cx, y] = [stage.w / 2, stage.h * 0.55];
    box(ctx, c, cx - 50, y - 24, 100, 24, c.fillA, 'book');
    box(ctx, c, cx - 90, y, 180, 20, c.fillB);
    const k = 2.4;
    vec(ctx, c, cx - 20, y - 12, 0, state.m * G * k, { color: c.a, text: 'W' });
    vec(ctx, c, cx + 20, y, 0, -R(state) * k, { color: c.c, text: 'R' });
    label(ctx, Math.abs(R(state) - state.m * G) < 1e-9 ? 'at rest or steady: R = W' : 'accelerating: R ≠ W', cx, 22, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'The table' },
    { key: 'm', label: 'Mass of book (kg)', min: 0.5, max: 5, step: 0.5 },
    { key: 'a', label: 'Table acceleration up (m/s²)', min: -9.8, max: 6, step: 0.2 },
    { readout: [
      ['W = mg', (s) => `${fixed(s.m * G, 1)} N`],
      ['R = m(g + a)', (s) => `${fixed(R(s), 1)} N`],
      ['Net force', (s) => `${fixed(R(s) - s.m * G, 1)} N`],
    ] },
  ],
  tex: (s) => `R-W=ma\\ \\Rightarrow\\ R=${fixed(R(s), 1)}\\ \\mathrm{N}`,
});
