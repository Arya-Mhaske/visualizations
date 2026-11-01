// A ladder of powers a^n going down one exponent at a time, each step "÷ a". Used by a⁰ = 1 and a⁻ⁿ = 1/aⁿ.
//   drawLadder(ctx, stage, c, base, top, bottom, shown)  rows for exponents top, top−1, … down to `shown`
import { arrow, label, poly } from '../../lib/draw.js';
import { frac } from '../../lib/format.js';

export const valueText = (base, n) => {
  if (n >= 0) return `${base ** n}`;
  return `1/${base ** -n}`;
};
export function drawLadder(ctx, stage, c, base, top, bottom, shown) {
  const rows = top - bottom + 1;
  const rowH = (stage.h - 20) / rows;
  const maxLog = Math.log2(base ** top + 1);
  for (let n = top; n >= bottom; n--) {
    const i = top - n;
    const y = 10 + i * rowH;
    const visible = n >= shown;
    const w = visible ? Math.max(4, ((Math.log2(base ** n) + Math.abs(bottom) * Math.log2(base) + 1) / (maxLog + Math.abs(bottom) * Math.log2(base) + 1)) * stage.w * 0.4) : 0;
    if (visible) poly(ctx, [[stage.w * 0.34, y + 4], [stage.w * 0.34 + w, y + 4], [stage.w * 0.34 + w, y + rowH - 4], [stage.w * 0.34, y + rowH - 4]], { fill: n === 0 ? c.fillC : n < 0 ? c.fillB : c.fillA, stroke: c.ink, width: 2 });
    label(ctx, `${base}^${n}`.replace('-', '−'), stage.w * 0.06, y + rowH / 2, c, { size: 12, align: 'left', color: visible ? c.ink : c.grid, bounds: stage, patch: false });
    label(ctx, visible ? `= ${valueText(base, n)}` : '?', stage.w * 0.2, y + rowH / 2, c, { size: 12, align: 'left', bounds: stage, patch: false });
    if (visible && n > shown) arrow(ctx, stage.w * 0.9, y + rowH - 4, stage.w * 0.9, y + rowH + 4, { color: c.a, width: 2, head: 6 });
    if (visible && n > shown) label(ctx, `÷ ${base}`, stage.w * 0.9 - 4, y + rowH, c, { size: 9, align: 'right', bounds: stage, patch: false });
  }
}
