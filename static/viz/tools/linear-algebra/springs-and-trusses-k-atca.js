import { createTool } from '../../lib/tool.js';
import { label, line, poly, spring } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { bmat, solve } from './_la-math.js';

// Three masses in a line between springs c1..c4. A u gives the stretch of each spring, C turns stretches into forces,
// and Aᵀ adds the forces on each mass. So K = AᵀCA. With a free right end the last spring is missing.
const state = { c1: 2, c2: 2, c3: 2, c4: 2, f: 3, free: false };
const K = (s) => {
  const c4 = s.free ? 0 : s.c4;
  return [[s.c1 + s.c2, -s.c2, 0], [-s.c2, s.c2 + s.c3, -s.c3], [0, -s.c3, s.c3 + c4]];
};
const disp = (s) => solve(K(s), [s.f, s.f, s.f]);

createTool({
  state,
  label: 'Three masses hanging in a row on springs between a wall on the left and either a second wall or a free end on the right. A force pulls every mass to the right. The picture shows how far each mass moves. Stiffer springs give smaller movements. The stiffness matrix K is assembled from the spring constants.',
  draw(ctx, stage, c) {
    const u = disp(state);
    const cs = [state.c1, state.c2, state.c3, state.free ? 0 : state.c4];
    const y = stage.h * 0.5;
    const left = 26;
    const right = stage.w - 26;
    const gap = (right - left) / 4;
    const scale = Math.min(gap * 0.4, gap * 0.4 / Math.max(...u.map(Math.abs), 1));
    const xs = [left, ...u.map((v, i) => left + gap * (i + 1) + v * scale), right];
    poly(ctx, [[left - 10, y - 40], [left - 10, y + 40], [left, y + 40], [left, y - 40]], { fill: c.ink, stroke: c.ink, width: 1 });
    if (!state.free) poly(ctx, [[right, y - 40], [right, y + 40], [right + 10, y + 40], [right + 10, y - 40]], { fill: c.ink, stroke: c.ink, width: 1 });
    for (let i = 0; i < 4; i++) {
      if (i === 3 && state.free) continue;
      const x1 = xs[i] + (i === 0 ? 0 : 14);
      const x2 = xs[i + 1] - (i === 3 ? 0 : 14);
      spring(ctx, x1, x2, y, { color: c.a, width: 2 + cs[i] * 0.6, coils: 8, size: 6 + cs[i] * 1.5 });
      label(ctx, `c${i + 1}`, (x1 + x2) / 2, y - 40, c, { size: 11, bounds: stage });
    }
    u.forEach((v, i) => {
      poly(ctx, [[xs[i + 1] - 14, y - 14], [xs[i + 1] + 14, y - 14], [xs[i + 1] + 14, y + 14], [xs[i + 1] - 14, y + 14]], { fill: c.fillY, stroke: c.ink, width: 3 });
      line(ctx, left + gap * (i + 1), y + 30, left + gap * (i + 1), y + 52, { color: c.grid, width: 2, dash: [3, 3] });
      label(ctx, `u${i + 1}=${fixed(v, 2)}`, xs[i + 1], y + 66, c, { size: 11, bounds: stage });
    });
  },
  controls: [
    { title: 'Springs in a line' },
    { key: 'f', label: 'Force on each mass', min: 0, max: 8, step: 1, format: (n) => `${n}` },
    { key: 'free', label: 'Free right end (no last spring)', toggle: true },
    { key: 'c1', label: 'Spring c₁', min: 1, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'c2', label: 'Spring c₂', min: 1, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'c3', label: 'Spring c₃', min: 1, max: 6, step: 1, format: (n) => `${n}` },
    { key: 'c4', label: 'Spring c₄', min: 1, max: 6, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Movements u₁, u₂, u₃', (s) => disp(s).map((v) => fixed(v, 3)).join(', ')],
      ['K u (should equal the force)', (s) => K(s).map((r) => fixed(r.reduce((a, v, j) => a + v * disp(s)[j], 0), 2)).join(', ')],
    ] },
  ],
  tex: (s) => `K=A^{\\mathsf T}CA=${bmat(K(s), (v) => fixed(v, 0))},\\quad K\\mathbf u=\\mathbf f`,
});
