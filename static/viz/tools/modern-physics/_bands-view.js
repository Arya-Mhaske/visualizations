// A valence band, a gap and a conduction band as flat blocks, with electrons that crossed (and the holes left behind).
import { dot, label, arrow } from '../../lib/draw.js';

export function drawBands(ctx, c, rect, Eg, maxEg, crossed, { names = true, size = 11 } = {}) {
  const scale = (rect.h * 0.5) / maxEg;
  const vbTop = rect.y + rect.h * 0.64;
  const cbBottom = vbTop - Eg * scale;
  const cbH = rect.h * 0.28;
  ctx.lineWidth = 3;
  ctx.strokeStyle = c.ink;
  ctx.fillStyle = c.fillB;
  ctx.fillRect(rect.x, cbBottom - cbH, rect.w, cbH);
  ctx.strokeRect(rect.x, cbBottom - cbH, rect.w, cbH);
  ctx.fillStyle = c.fillC;
  ctx.fillRect(rect.x, vbTop, rect.w, rect.y + rect.h - vbTop);
  ctx.strokeRect(rect.x, vbTop, rect.w, rect.y + rect.h - vbTop);
  if (names) {
    label(ctx, 'conduction band', rect.x + rect.w / 2, cbBottom - cbH + 12, c, { size: size - 1, patch: false });
    label(ctx, 'valence band', rect.x + rect.w / 2, rect.y + rect.h - 12, c, { size: size - 1, patch: false });
  }
  if (Eg > 0.15) {
    const gx = rect.x + rect.w + 0;
    arrow(ctx, gx - 14, vbTop, gx - 14, cbBottom, { color: c.a, width: 2, head: 6 });
    label(ctx, `Eg`, gx - 28, (vbTop + cbBottom) / 2, c, { size, patch: false, align: 'right' });
  }
  // electrons in the valence band (full), those that crossed, and holes
  const slots = 8;
  const dx = rect.w / (slots + 1);
  for (let i = 0; i < Math.min(crossed, 24); i++) {
    const x = rect.x + dx * ((i % slots) + 1);
    const yc = cbBottom - 10 - Math.floor(i / slots) * 14;
    dot(ctx, x, yc, 5, c.a, c.ink, 2);
    dot(ctx, x, vbTop + 12 + Math.floor(i / slots) * 14, 5, c.paper, c.c, 2);
  }
  return { vbTop, cbBottom };
}
