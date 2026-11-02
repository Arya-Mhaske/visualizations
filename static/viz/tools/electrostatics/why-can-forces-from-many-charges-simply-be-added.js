import { createTool } from '../../lib/tool.js';
import { arrow, dot, label } from '../../lib/draw.js';

// A +1 test charge at the origin. Sources sit at fixed places. Force units: k = 1, so F = q / r² along the line between them.
const SRC = [[3, 0], [0, 3], [-2, -2]];
const state = { n: 3, q1: 2, q2: -3, q3: 2 };
const force = (s, i) => {
  const [x, y] = SRC[i];
  const q = [s.q1, s.q2, s.q3][i];
  const r2 = x * x + y * y;
  const r = Math.sqrt(r2);
  return [(-q * x) / (r2 * r), (-q * y) / (r2 * r)]; // positive q pushes the test charge away from the source
};
const forces = (s) => Array.from({ length: s.n }, (_, i) => force(s, i));
const net = (s) => forces(s).reduce(([a, b], [x, y]) => [a + x, b + y], [0, 0]);

createTool({
  state,
  label: 'A test charge at the centre and up to three source charges around it. The force from each source is an arrow. The arrows are laid tip to tail, and the arrow from the start to the end is the net force, the same as adding the forces one at a time.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min(W, H) / 10;
    const [ox, oy] = [W / 2, H / 2];
    const px = (x, y) => [ox + x * s, oy - y * s];
    const fs = Math.min(W, H) * 0.32;
    for (let i = 0; i < state.n; i++) {
      const [x, y] = px(...SRC[i]);
      const q = [state.q1, state.q2, state.q3][i];
      dot(ctx, x, y, 11, q >= 0 ? c.a : c.b, c.ink);
      label(ctx, `${q > 0 ? '+' : ''}${q}`, x, y, c, { size: 11, patch: false });
    }
    dot(ctx, ox, oy, 8, c.c, c.ink);
    let [cx, cy] = [ox, oy];
    forces(state).forEach(([fx, fy], i) => {
      arrow(ctx, ox, oy, ox + fx * fs, oy - fy * fs, { color: c.grid, width: 2, head: 8 });
      arrow(ctx, cx, cy, cx + fx * fs, cy - fy * fs, { color: [c.a, c.b, c.d][i], width: 3, head: 9 });
      cx += fx * fs; cy -= fy * fs;
    });
    const [nx, ny] = net(state);
    arrow(ctx, ox, oy, ox + nx * fs, oy - ny * fs, { color: c.ink, width: 4, head: 11 });
    label(ctx, 'net force', ox + nx * fs, oy - ny * fs - 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Add the charges one by one' },
    { key: 'n', label: 'Number of sources', min: 1, max: 3, step: 1 },
    { key: 'q1', label: 'Charge 1', min: -3, max: 3, step: 1 },
    { key: 'q2', label: 'Charge 2', min: -3, max: 3, step: 1 },
    { key: 'q3', label: 'Charge 3', min: -3, max: 3, step: 1 },
    { readout: [
      ['Net Fx', (s) => net(s)[0].toFixed(3)],
      ['Net Fy', (s) => net(s)[1].toFixed(3)],
      ['|F|', (s) => Math.hypot(...net(s)).toFixed(3)],
    ] },
  ],
  tex: (s) => `\\vec F=\\vec F_1+\\vec F_2+\\vec F_3=(${net(s)[0].toFixed(2)},\\ ${net(s)[1].toFixed(2)})`,
});
