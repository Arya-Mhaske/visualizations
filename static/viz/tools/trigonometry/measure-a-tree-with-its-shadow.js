import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Side view. The Sun is to the left, so shadows fall to the right on flat ground.
const state = { sun: 40, stick: 1.5, tree: 12 };
const rad = (d) => (d * Math.PI) / 180;
const shadow = (h, s = state) => h / Math.tan(rad(s.sun));
const estimate = (s = state) => (s.stick * shadow(s.tree, s)) / shadow(s.stick, s);

const tool = createTool({
  state,
  label: 'A tree and a stick on flat ground with the Sun low on the left. Each throws a shadow to the right. The tree, its shadow and the Sun’s ray make a big triangle, and the stick, its shadow and the ray make a small one of the same shape.',
  draw(ctx, stage, c) {
    const ground = stage.h * 0.88;
    const reach = shadow(state.tree) + 8;
    const u = Math.min((stage.w * 0.9) / reach, (stage.h * 0.75) / state.tree);
    const treeX = stage.w * 0.06 + 2 * u;
    const stickX = treeX + (shadow(state.tree) + 2) * u * 0.0 + 3.2 * u;
    const base = (x) => [x, ground];
    line(ctx, 0, ground, stage.w, ground, { color: c.ink, width: 4 });
    // Sun rays and the two similar triangles.
    const tipT = [treeX, ground - state.tree * u];
    const endT = [treeX + shadow(state.tree) * u, ground];
    const tipS = [stickX, ground - state.stick * u];
    const endS = [stickX + shadow(state.stick) * u, ground];
    poly(ctx, [base(treeX), tipT, endT], { fill: c.fillY, stroke: c.ink, width: 2 });
    poly(ctx, [base(stickX), tipS, endS], { fill: c.fillC, stroke: c.ink, width: 2 });
    line(ctx, treeX, ground, endT[0], ground, { color: c.d, width: 6 });
    line(ctx, stickX, ground, endS[0], ground, { color: c.b, width: 6 });
    line(ctx, ...base(treeX), ...tipT, { color: c.c, width: 7 });
    line(ctx, ...base(stickX), ...tipS, { color: c.a, width: 7 });
    dot(ctx, ...tipT, 5, c.paper, c.ink);
    const dx = 26 / Math.tan(rad(state.sun));
    arrow(ctx, 6, 14, 6 + Math.min(40, dx), 14 + Math.min(40, 26), { color: c.a, width: 3, head: 10 });
    label(ctx, `Sun ${state.sun}° up`, 70, 18, c, { size: 11, align: 'left', bounds: stage, patch: false });
    label(ctx, 'tree', treeX - 18, ground - state.tree * u * 0.5, c, { size: 12, color: c.c, bounds: stage });
    label(ctx, 'stick', stickX + 2, ground - state.stick * u - 12, c, { size: 12, color: c.a, bounds: stage });
  },
  controls: () => [
    { title: 'Sun, stick and tree' },
    { key: 'sun', label: 'Sun’s height in the sky', min: 15, max: 75, step: 1, format: (n) => `${n}°` },
    { key: 'stick', label: 'Stick height', min: 0.5, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'tree', label: 'Tree height (hidden from the tape)', min: 4, max: 20, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { readout: [
      ['Stick’s shadow', () => `${fixed(shadow(state.stick), 2)} m`],
      ['Tree’s shadow', () => `${fixed(shadow(state.tree), 2)} m`],
      ['Height from shadows', () => ({ text: `${fixed(estimate(), 2)} m`, good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{H}{${fixed(shadow(s.tree, s), 2)}}=\\dfrac{${fixed(s.stick, 1)}}{${fixed(shadow(s.stick, s), 2)}}\\ \\Rightarrow\\ H=${fixed(estimate(s), 2)}\\ \\text{m}`,
});
tool.update();
