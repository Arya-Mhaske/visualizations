import { createTool } from '../../lib/tool.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, eqFrame } from './_kit.js';
import { canClose, anglesOf, rad } from './_triangle-math.js';
import { vertices } from './_tri-view.js';

const state = { mode: 'sss', a: 5, b: 6, c: 7, A: 50, B: 60, s: 1, flip: false };
const K = 6;
const sinD = (d) => Math.sin(rad(d));
function current() {
  if (state.mode === 'sss') {
    if (!canClose(state.a, state.b, state.c)) return null;
    return { ...anglesOf(state), a: state.a, b: state.b, c: state.c };
  }
  const C = 180 - state.A - state.B;
  if (C <= 1) return null;
  return { A: state.A, B: state.B, C, a: state.s * K * sinD(state.A), b: state.s * K * sinD(state.B), c: state.s * K * sinD(C) };
}

createTool({
  state,
  label: 'Left setting: three rods of fixed length joined at their ends make one triangle, with only its mirror image as another choice. Right setting: three fixed angles allow triangles of every size, drawn nested inside each other.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-1, 13], [-1.2, 10.5], 10);
    const t = current();
    if (!t) {
      label(ctx, state.mode === 'sss' ? 'The rods cannot meet: one is longer than the other two together' : 'The angles must add to less than 180°', stage.w / 2, stage.h / 2, c, { size: 12, color: c.a, bounds: stage });
      return;
    }
    const draw = (tri, fill, stroke, width, dash = [], mirror = false) => {
      const pts = vertices(tri).map(([x, y]) => f.px([x, mirror ? -y : y]));
      poly(ctx, pts, { fill, stroke, width, dash });
      return pts;
    };
    if (state.mode === 'aaa') {
      [0.5, 1.5, 2].forEach((m) => { const g = { A: t.A, c: (t.c / state.s) * m, b: (t.b / state.s) * m }; draw(g, null, c.grid, 2, [5, 4]); });
    }
    if (state.mode === 'sss' && state.flip) draw(t, c.fillY, c.ink, 3, [6, 4], true);
    const pts = draw(t, state.mode === 'sss' ? c.fillC : c.fillB, c.ink, 4);
    angleArc(ctx, pts[0], pts[1], pts[2], 24, { color: c.a, width: 4 });
    angleArc(ctx, pts[1], pts[0], pts[2], 24, { color: c.b, width: 4 });
    angleArc(ctx, pts[2], pts[0], pts[1], 24, { color: c.d, width: 4 });
    label(ctx, `a = ${fixed(t.a, 1)}`, (pts[1][0] + pts[2][0]) / 2 + 8, (pts[1][1] + pts[2][1]) / 2, c, { size: 10, align: 'left', bounds: stage, patch: false });
    label(ctx, `b = ${fixed(t.b, 1)}`, (pts[0][0] + pts[2][0]) / 2 - 8, (pts[0][1] + pts[2][1]) / 2, c, { size: 10, align: 'right', bounds: stage, patch: false });
    label(ctx, `c = ${fixed(t.c, 1)}`, (pts[0][0] + pts[1][0]) / 2, pts[0][1] + 15, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'What is fixed?' },
    { key: 'mode', label: 'Fixed', options: [['sss', 'Three sides (rods)'], ['aaa', 'Three angles']] },
    { key: 'a', label: 'Rod a', min: 2, max: 9, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Rod b', min: 2, max: 9, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'Rod c', min: 2, max: 9, step: 0.5, format: (n) => fixed(n, 1) },
    { toggle: true, key: 'flip', label: 'Show the mirror image' },
    { key: 'A', label: 'Angle A', min: 20, max: 100, step: 5, format: (n) => `${n}°` },
    { key: 'B', label: 'Angle B', min: 20, max: 100, step: 5, format: (n) => `${n}°` },
    { key: 's', label: 'Size', min: 0.5, max: 2, step: 0.25, format: (n) => `×${fixed(n, 2)}` },
    { readout: [
      ['Triangles possible', () => (state.mode === 'sss' ? (canClose(state.a, state.b, state.c) ? { text: '1 (and its mirror image)', good: true } : { text: 'none', good: false }) : { text: 'as many as there are sizes', good: false })],
      ['Angles A, B, C', () => { const t = current(); return t ? `${fixed(t.A, 1)}°, ${fixed(t.B, 1)}°, ${fixed(t.C, 1)}°` : '—'; }],
      ['Sides a, b, c', () => { const t = current(); return t ? `${fixed(t.a, 1)}, ${fixed(t.b, 1)}, ${fixed(t.c, 1)}` : '—'; }],
    ] },
  ],
  onChange: (s) => {
    const fields = document.querySelectorAll('#panel .nb-field, #panel .nb-switch');
    // order: mode, a, b, c, flip, A, B, s
    const sss = s.mode === 'sss';
    fields.forEach((el, i) => { if (i > 0) el.hidden = i <= 4 ? !sss : sss; });
  },
});
{
  const fields = document.querySelectorAll('#panel .nb-field, #panel .nb-switch');
  fields.forEach((el, i) => { if (i > 0) el.hidden = i > 4; });
}
