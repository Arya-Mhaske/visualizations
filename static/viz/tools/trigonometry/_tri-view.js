// A labelled triangle drawn in a figure above a stepper's steps.
//   triangleFigure(stageEl, () => [tri, tri2?], { label })  where tri = { A, B, C, a, b, c } (degrees)
// A sits at the left end of the base c, B at the right end, and C above.
import { createStage } from '../../lib/stage.js';
import { readColors } from '../../lib/colors.js';
import { arc, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_triangle-math.js';

export function vertices(t) {
  return [[0, 0], [t.c, 0], [t.b * Math.cos(rad(t.A)), t.b * Math.sin(rad(t.A))]];
}

export function triangleFigure(stageEl, getTriangles, { label: text }) {
  const c = readColors();
  stageEl.setAttribute('role', 'group');
  stageEl.setAttribute('aria-label', `${text}, followed by the worked solution`);
  const el = document.createElement('div');
  el.className = 'viz-figure';
  stageEl.appendChild(el);
  return createStage(el, (ctx, size, stage) => {
    const list = getTriangles();
    if (!list.length) {
      label(ctx, 'No triangle fits these numbers', stage.w / 2, stage.h / 2, c, { size: 13, color: c.a, bounds: stage });
      return;
    }
    const all = list.flatMap(vertices);
    const [x0, x1] = [Math.min(...all.map((p) => p[0]), 0), Math.max(...all.map((p) => p[0]))];
    const y1 = Math.max(...all.map((p) => p[1]));
    const k = Math.min((stage.w - 70) / (x1 - x0), (stage.h - 46) / y1);
    const ox = (stage.w - (x1 - x0) * k) / 2 - x0 * k;
    const oy = stage.h - 20;
    const px = ([x, y]) => [ox + x * k, oy - y * k];
    list.forEach((t, i) => {
      const [A, B, C] = vertices(t).map(px);
      poly(ctx, [A, B, C], { fill: i ? c.fillA : c.fillC, stroke: c.ink, width: i ? 2 : 3, dash: i ? [6, 4] : [] });
      if (i) return;
      arc(ctx, ...A, 26, -rad(t.A), 0, { color: c.b, width: 3 });
      label(ctx, `A ${fixed(t.A, 1)}°`, A[0] + 44, A[1] - 8, c, { size: 10, color: c.b, bounds: stage, patch: false });
      label(ctx, `B ${fixed(t.B, 1)}°`, B[0] - 6, B[1] - 12, c, { size: 10, color: c.b, align: 'right', bounds: stage, patch: false });
      label(ctx, `C ${fixed(t.C, 1)}°`, C[0], C[1] - 14, c, { size: 10, color: c.b, bounds: stage, patch: false });
      label(ctx, `c = ${fixed(t.c, 2)}`, (A[0] + B[0]) / 2, A[1] + 13, c, { size: 10, color: c.a, bounds: stage, patch: false });
      label(ctx, `b = ${fixed(t.b, 2)}`, (A[0] + C[0]) / 2 - 8, (A[1] + C[1]) / 2, c, { size: 10, color: c.a, align: 'right', bounds: stage, patch: false });
      label(ctx, `a = ${fixed(t.a, 2)}`, (B[0] + C[0]) / 2 + 8, (B[1] + C[1]) / 2, c, { size: 10, color: c.a, align: 'left', bounds: stage, patch: false });
    });
  }, { label: text });
}
