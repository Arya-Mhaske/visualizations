import { createTool } from '../../lib/tool.js';
import { arc, dot, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, arrowW, drawGrid, eqFrame, rad, segW } from './_kit.js';
import { cpow, nthRoots, toRect } from './_polar-math.js';

const state = { n: 5, R: 8, phi: 60 };
const roots = () => nthRoots(state.R, state.phi, state.n);

createTool({
  state,
  label: 'The n-th roots of a complex number drawn as dots on a circle. Each root has the same length, the n-th root of the number’s length. Their angles are the number’s angle divided by n, plus a whole share of a full turn each, so they sit at equal gaps and join up as a regular polygon.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-4.8, 4.8], [-4.8, 4.8], 8);
    drawGrid(ctx, f, c, stage, { step: 1, labels: false });
    const O = f.px([0, 0]);
    const R = roots();
    arc(ctx, ...O, R[0].r * f.k, 0, TAU, { color: c.grid, width: 2, dash: [5, 4] });
    const pts = R.map((q) => f.px(toRect(q.r, q.thD)));
    poly(ctx, pts, { fill: c.fillC, stroke: c.ink, width: 3 });
    R.forEach((q, k) => {
      segW(ctx, f, [0, 0], toRect(q.r, q.thD), { color: c.grid, width: 1 });
      dot(ctx, ...pts[k], k === 0 ? 10 : 7, k === 0 ? c.a : c.b, c.ink);
    });
    arc(ctx, ...O, 28, -rad(R[0].thD), -rad(R[0].thD + 360 / state.n), { color: c.d, width: 4 });
    arrowW(ctx, f, [0, 0], toRect(R[0].r, R[0].thD), { color: c.a, width: 4, head: 11 });
    label(ctx, `gap ${fixed(360 / state.n, 1)}°`, O[0] + 56, O[1] + 4, c, { size: 10, color: c.d, bounds: stage, patch: false });
    label(ctx, `w = ${state.R} ∠ ${state.phi}°`, stage.w / 2, 14, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Find the n-th roots of w' },
    { key: 'n', label: 'Roots wanted, n', min: 2, max: 12, step: 1 },
    { key: 'R', label: 'Length of w', min: 1, max: 16, step: 1 },
    { key: 'phi', label: 'Angle of w', min: 0, max: 345, step: 15, format: (n) => `${n}°` },
    { readout: [
      ['Length of every root', () => fixed(roots()[0].r, 3)],
      ['First root', () => `${fixed(roots()[0].thD, 1)}°`],
      ['Gap between roots', () => `${fixed(360 / state.n, 2)}°`],
      ['Check: (first root)ⁿ', () => { const z = cpow(toRect(roots()[0].r, roots()[0].thD), state.n); const w = toRect(state.R, state.phi); return `${fixed(z[0], 2)} + ${fixed(z[1], 2)}i  vs  ${fixed(w[0], 2)} + ${fixed(w[1], 2)}i`; }],
    ] },
  ],
  tex: () => `z_k=\\sqrt[${state.n}]{${state.R}}\\ \\angle\\ \\dfrac{${state.phi}^\\circ+360^\\circ k}{${state.n}},\\quad k=0,\\dots,${state.n - 1}`,
});
