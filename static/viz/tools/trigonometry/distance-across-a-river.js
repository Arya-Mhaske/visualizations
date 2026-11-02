import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, eqFrame, rad } from './_kit.js';
import { river } from './_triangle-math.js';

const state = { d: 60, alpha: 55, beta: 70 };

createTool({
  state,
  label: 'A river with a tree on the far bank. Two points A and B are marked on the near bank, a measured distance apart. The angles to the tree from each are measured. The law of sines gives the distance from A to the tree, and from that the width of the river.',
  draw(ctx, stage, c) {
    const r = river(state.d, state.alpha, state.beta);
    const top = r.width;
    const f = eqFrame(stage, [-0.15 * state.d, 1.15 * state.d], [-0.25 * Math.max(top, state.d * 0.5), Math.max(top * 1.2, state.d * 0.5)], 10);
    const A = f.px([0, 0]);
    const B = f.px([state.d, 0]);
    const Tx = r.AT * Math.cos(rad(state.alpha));
    const T = f.px([Tx, r.width]);
    const bankR = f.px([0, 0])[1];
    poly(ctx, [[0, bankR], [stage.w, bankR], [stage.w, T[1]], [0, T[1]]], { fill: c.fillB, stroke: null });
    line(ctx, 0, bankR, stage.w, bankR, { color: c.ink, width: 4 });
    line(ctx, 0, T[1], stage.w, T[1], { color: c.ink, width: 4 });
    poly(ctx, [A, B, T], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...T, ...f.px([Tx, 0]), { color: c.a, width: 4, dash: [7, 5] });
    angleArc(ctx, A, B, T, 30, { color: c.b, width: 4 });
    angleArc(ctx, B, A, T, 30, { color: c.d, width: 4 });
    line(ctx, ...A, ...B, { color: c.ink, width: 3 });
    [[A, 'A'], [B, 'B']].forEach(([p, t]) => { dot(ctx, ...p, 7, c.paper, c.ink); label(ctx, t, p[0], p[1] + 18, c, { size: 12, bounds: stage, patch: false }); });
    dot(ctx, ...T, 9, c.c, c.ink);
    label(ctx, 'tree', T[0], T[1] - 14, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `width = ${fixed(r.width, 1)} m`, f.px([Tx, r.width / 2])[0] + 8, f.px([0, r.width / 2])[1], c, { size: 11, color: c.a, align: 'left', bounds: stage, patch: false });
    label(ctx, `${fixed(state.d, 0)} m`, (A[0] + B[0]) / 2, A[1] + 18, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Measure on the near bank' },
    { key: 'd', label: 'Distance AB', min: 20, max: 100, step: 5, format: (n) => `${n} m` },
    { key: 'alpha', label: 'Angle at A', min: 20, max: 85, step: 1, format: (n) => `${n}°` },
    { key: 'beta', label: 'Angle at B', min: 20, max: 85, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Angle at the tree', () => `${fixed(river(state.d, state.alpha, state.beta).gamma, 0)}°`],
      ['A to tree', () => `${fixed(river(state.d, state.alpha, state.beta).AT, 1)} m`],
      ['River width', () => `${fixed(river(state.d, state.alpha, state.beta).width, 1)} m`],
    ] },
  ],
  tex: (s) => `\\dfrac{AT}{\\sin B}=\\dfrac{AB}{\\sin T}\\ \\Rightarrow\\ AT=\\dfrac{${s.d}\\sin ${s.beta}^\\circ}{\\sin ${fixed(180 - s.alpha - s.beta, 0)}^\\circ}=${fixed(river(s.d, s.alpha, s.beta).AT, 1)},\\ w=AT\\sin ${s.alpha}^\\circ=${fixed(river(s.d, s.alpha, s.beta).width, 1)}`,
});
