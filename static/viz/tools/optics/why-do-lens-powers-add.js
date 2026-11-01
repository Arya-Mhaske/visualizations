import { createTool } from '../../lib/tool.js';
import { createBench } from '../../lib/rays.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { bend, totalPower } from './_lenses-math.js';

// Distances in metres along the axis. Heights are drawn ten times larger than they are, as in any ray diagram.
const state = { P1: 2, P2: 3 };
const GAP = 0.02; // the lenses are almost touching
const X = [-0.4, 2.0];
const HEIGHTS = [-0.1, -0.06, -0.02, 0.02, 0.06, 0.1];
const Y10 = 10;
const focusText = (P) => (P === 0 ? 'none' : `${sig(100 / P, 3)} cm`);

const tool = createTool({
  state,
  label: 'Parallel rays pass through two thin lenses placed almost touching. After the first lens each ray is bent by an amount proportional to its height. The second lens bends it by a further amount. The final rays meet at the focus of a single lens whose power is the sum of the two.',
  setup: (stage, c) => createBench(stage, { x: X, cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    bench.axis();
    for (const [x, P, color] of [[0, state.P1, c.b], [GAP, state.P2, c.d]]) {
      const [px, py] = bench.toPx(x, 0);
      const top = bench.toPx(x, 1.3)[1];
      const bottom = bench.toPx(x, -1.3)[1];
      line(ctx, px, top, px, bottom, { color, width: 4 });
      label(ctx, `${fixed(P, 1)} D`, px + (x === 0 ? -24 : 26), top + 12, c, { color, size: 11 });
      void py;
    }
    for (const y of HEIGHTS) {
      const s1 = bend(0, y, state.P1);
      const y2 = y + s1 * GAP;
      const s2 = bend(s1, y2, state.P2);
      bench.ray([X[0], y * Y10], [0, y * Y10], { color: c.ink, width: 2, arrow: false });
      bench.ray([0, y * Y10], [GAP, y2 * Y10], { color: c.ink, width: 2, arrow: false });
      bench.rayTo([GAP, y2 * Y10], [1, s2 * Y10], { color: c.a, width: 2, arrow: false });
    }
    const P = totalPower([state.P1, state.P2]);
    if (P > 0 && 1 / P < X[1]) {
      dot(ctx, ...bench.toPx(1 / P, 0), 7, c.fillC, c.ink);
      label(ctx, 'F of the pair', ...bench.toPx(1 / P, -0.45), c, { color: c.ink, size: 11, bounds: stage });
    }
    label(ctx, 'heights ×10', stage.w - 44, 14, c, { color: c.ink, size: 10 });
  },
  controls: () => [
    { title: 'Two thin lenses in contact' },
    { key: 'P1', label: 'Power of lens 1', min: -5, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} D` },
    { key: 'P2', label: 'Power of lens 2', min: -5, max: 10, step: 0.5, format: (n) => `${fixed(n, 1)} D` },
    { readout: [
      ['f₁', (s) => focusText(s.P1)],
      ['f₂', (s) => focusText(s.P2)],
      ['Total power', (s) => `${fixed(totalPower([s.P1, s.P2]), 1)} D`],
      ['f of the pair', (s) => focusText(totalPower([s.P1, s.P2]))],
    ] },
  ],
  tex: (s) => `P=P_1+P_2=${fixed(s.P1, 1)}+(${fixed(s.P2, 1)})=${fixed(totalPower([s.P1, s.P2]), 1)}\\ \\text{D}\\qquad \\dfrac{1}{f}=\\dfrac{1}{f_1}+\\dfrac{1}{f_2}`,
});
tool.update();
