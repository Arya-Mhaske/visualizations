import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, eqFrame, rad } from './_kit.js';

const state = { a: 6, b: 7, th: 55 };
const sinD = (d) => Math.sin(rad(d));

createTool({
  state,
  label: 'Two triangles that share the side CA of length b and have a second side of length a from C. One has angle theta at C and the other has angle 180 degrees minus theta. Their top corners are on the same horizontal line, so the triangles have the same height and the same area, yet the third sides are different.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-9, 9], [-1, 8.6], 8);
    const C0 = f.px([0, 0]);
    const A = f.px([state.b, 0]);
    const B1 = f.px([state.a * Math.cos(rad(state.th)), state.a * sinD(state.th)]);
    const B2 = f.px([state.a * Math.cos(rad(180 - state.th)), state.a * sinD(state.th)]);
    poly(ctx, [C0, A, B2], { fill: c.fillA, stroke: c.ink, width: 3, dash: [7, 5] });
    poly(ctx, [C0, A, B1], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...B2, ...B1, { color: c.d, width: 2, dash: [4, 4] });
    line(ctx, ...C0, ...A, { color: c.b, width: 6 });
    angleArc(ctx, C0, A, B1, 26, { color: c.ink, width: 3 });
    angleArc(ctx, C0, A, B2, 34, { color: c.a, width: 3 });
    [[B1, 'B'], [B2, "B′"], [C0, 'C'], [A, 'A']].forEach(([p, t]) => { dot(ctx, ...p, 7, t === "B′" ? c.fillA : c.paper, c.ink); label(ctx, t, p[0], p[1] + (t === 'C' || t === 'A' ? 16 : -14), c, { size: 12, bounds: stage, patch: false }); });
    label(ctx, `θ = ${state.th}°`, C0[0] + 46, C0[1] - 8, c, { size: 10, bounds: stage, patch: false });
    label(ctx, `180° − θ = ${180 - state.th}°`, C0[0] - 50, C0[1] - 8, c, { size: 10, color: c.a, bounds: stage, patch: false });
    label(ctx, 'same height', (B1[0] + B2[0]) / 2, B1[1] - 14, c, { size: 10, color: c.d, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two angles that add to 180°' },
    { key: 'th', label: 'Angle θ', min: 10, max: 170, step: 1, format: (n) => `${n}°` },
    { key: 'a', label: 'Side a', min: 3, max: 8, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Side b', min: 3, max: 8, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['sin θ, sin(180° − θ)', () => `${fixed(sinD(state.th), 4)}, ${fixed(sinD(180 - state.th), 4)}`],
      ['Area, green triangle', () => fixed(0.5 * state.a * state.b * sinD(state.th), 3)],
      ['Area, yellow triangle', () => fixed(0.5 * state.a * state.b * sinD(180 - state.th), 3)],
      ['Third side, green / yellow', () => `${fixed(Math.sqrt(state.a ** 2 + state.b ** 2 - 2 * state.a * state.b * Math.cos(rad(state.th))), 2)} / ${fixed(Math.sqrt(state.a ** 2 + state.b ** 2 + 2 * state.a * state.b * Math.cos(rad(state.th))), 2)}`],
    ] },
  ],
  tex: (s) => `\\sin(180^\\circ-\\theta)=\\sin\\theta\\ \\Rightarrow\\ \\tfrac12 ab\\sin\\theta=${fixed(0.5 * s.a * s.b * sinD(s.th), 2)}`,
});
