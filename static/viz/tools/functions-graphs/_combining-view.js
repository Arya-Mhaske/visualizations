// A row of function machines: input → [box] → value → [box] → output. Used by the composition and inverse tools.
//   machineRow(ctx, stage, c, y, input, steps)  steps = [{ name, value }]; value is the number AFTER that machine
import { arrow, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

export const num = (v) => (Number.isFinite(v) ? fixed(v, 3) : 'undefined');
export function machineRow(ctx, stage, c, y, input, steps, { title = '' } = {}) {
  const n = steps.length;
  const slot = (stage.w - 20) / (n + 1);
  const cx = (i) => 10 + slot * (i + 0.5);
  if (title) label(ctx, title, 10, y - 22, c, { size: 11, align: 'left', bounds: stage, patch: false });
  label(ctx, num(input), cx(0), y + 4, c, { size: 13, bounds: stage, patch: false });
  steps.forEach((s, i) => {
    const x = cx(i + 1);
    arrow(ctx, cx(i) + 18, y, x - 28, y, { color: c.ink, width: 2, head: 7 });
    poly(ctx, [[x - 26, y - 17], [x + 26, y - 17], [x + 26, y + 17], [x - 26, y + 17]], { fill: [c.fillA, c.fillB, c.fillC][i % 3], stroke: c.ink, width: 3 });
    label(ctx, s.name, x, y, c, { size: 11, bounds: stage, patch: false });
    label(ctx, num(s.value), x, y + 30, c, { size: 11, color: Number.isFinite(s.value) ? c.ink : c.a, bounds: stage, patch: false });
  });
}
