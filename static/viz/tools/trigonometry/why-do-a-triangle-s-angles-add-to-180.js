import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label, line, poly, wedge } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Vertices as fractions of the stage, so the triangle stays on the stage at any size.
const state = { tear: 0, proof: false, A: [0.15, 0.5], B: [0.8, 0.52], C: [0.42, 0.1] };
const PI = Math.PI;
const dir = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]);
// The interior sweep at P between directions to Q and R: start angle and signed sweep (canvas angles).
function corner(P, Q, R) {
  const a1 = dir(P, Q);
  const d = dir(P, R) - a1;
  const sweep = ((d + 3 * PI) % (2 * PI)) - PI;
  return { start: a1, sweep };
}
const px = (stage, p) => [p[0] * stage.w, p[1] * stage.h];
const angles = (s = state) => {
  const [A, B, C] = [s.A, s.B, s.C];
  return [corner(A, B, C), corner(B, C, A), corner(C, A, B)].map((k) => Math.abs(k.sweep) * (180 / PI));
};
const sector = (ctx, P, k, r, fill, c) => {
  const [a0, a1] = k.sweep >= 0 ? [k.start, k.start + k.sweep] : [k.start + k.sweep, k.start];
  wedge(ctx, P[0], P[1], r, a0, a1, { fill, stroke: c.ink, width: 2 });
};

const tool = createTool({
  state,
  label: 'A triangle with three draggable corners. A slider tears off the three corner angles and lines them up side by side at the bottom, where together they fill a straight line. A switch shows a line through the top corner parallel to the base.',
  draw(ctx, stage, c) {
    const [A, B, C] = [px(stage, state.A), px(stage, state.B), px(stage, state.C)];
    const t = state.tear;
    const R = Math.min(stage.w, stage.h) * 0.13;
    const kinds = [corner(A, B, C), corner(B, C, A), corner(C, A, B)];
    const fills = [c.fillA, c.fillB, c.fillC];
    const degs = angles();
    poly(ctx, [A, B, C], { stroke: c.ink, width: 3 });
    // The straight line the corners will fill.
    const Q = [stage.w / 2, stage.h * 0.9];
    line(ctx, Q[0] - R * 3, Q[1], Q[0] + R * 3, Q[1], { color: c.ink, width: 2, dash: [6, 4] });
    // Layout directions at Q: the corners sit side by side from the left, upward (canvas angles from PI to 2 PI).
    let at = PI;
    kinds.forEach((k, i) => {
      const V = [A, B, C][i];
      const span = Math.abs(k.sweep);
      const lo = k.sweep >= 0 ? k.start : k.start + k.sweep;
      const pos = [V[0] + (Q[0] - V[0]) * t, V[1] + (Q[1] - V[1]) * t];
      const rot = lo + (at - lo) * t;
      wedge(ctx, pos[0], pos[1], R, rot, rot + span, { fill: fills[i], stroke: c.ink, width: 2 });
      at += span;
    });
    if (state.proof) {
      const u = [(B[0] - A[0]), (B[1] - A[1])];
      const n = Math.hypot(...u);
      const e = [u[0] / n, u[1] / n];
      line(ctx, C[0] - e[0] * stage.w, C[1] - e[1] * stage.w, C[0] + e[0] * stage.w, C[1] + e[1] * stage.w, { color: c.d, width: 2, dash: [8, 4] });
      const left = [C[0] - e[0] * 10, C[1] - e[1] * 10];
      const right = [C[0] + e[0] * 10, C[1] + e[1] * 10];
      sector(ctx, C, corner(C, left, A), R * 0.8, fills[0], c);
      sector(ctx, C, corner(C, B, right), R * 0.8, fills[1], c);
      sector(ctx, C, kinds[2], R * 0.55, fills[2], c);
    }
    if (t === 0) {
      [[A, 0.8, -0.25], [B, -0.8, -0.25], [C, 0, 0.8]].forEach(([V, dx, dy], i) => label(ctx, ['α', 'β', 'γ'][i], V[0] + dx * R, V[1] + dy * R, c, { size: 13, patch: false }));
    }
    [A, B, C].forEach((p) => dot(ctx, p[0], p[1], 7, c.paper, c.ink));
    label(ctx, 'Drag a corner', 8, 12, c, { size: 11, align: 'left', patch: false, bounds: stage });
  },
  controls: () => [
    { title: 'Tear off the corners' },
    { key: 'tear', label: 'Slide the corners together', min: 0, max: 1, step: 0.01, format: (n) => `${Math.round(n * 100)} %` },
    { key: 'proof', label: 'Show the parallel-line proof', toggle: true },
    { readout: [
      ['α', () => `${fixed(angles()[0], 1)}°`],
      ['β', () => `${fixed(angles()[1], 1)}°`],
      ['γ', () => `${fixed(angles()[2], 1)}°`],
      ['α + β + γ', () => ({ text: `${fixed(angles().reduce((a, b) => a + b), 1)}°`, good: true })],
    ] },
  ],
  tex: () => { const a = angles(); return `${fixed(a[0], 1)}^\\circ+${fixed(a[1], 1)}^\\circ+${fixed(a[2], 1)}^\\circ=180^\\circ`; },
});

const keep = (v) => Math.max(0.05, Math.min(0.95, v));
handles(tool.stage, ['A', 'B', 'C'].map((k) => ({
  at: () => px(tool.stage, state[k]),
  move(x, y) { state[k] = [keep(x / tool.stage.w), keep(y / tool.stage.h)]; },
  keyStep: 8,
})), { onChange: () => tool.update(), radius: 28 });
tool.update();
