// The junction strip shared by the p-n junction tools: p side left, n side right, columns of lattice sites.
// Each site has an immobile ion core (purple square: − on the p side, + on the n side) and, where the material is
// neutral, the mobile carrier it gave up (blue circle: a hole; coral circle: an electron). Inside the depletion layer
// the carriers are gone and only the cores are left. Drawn as columns, not to scale: only the layer's share of the
// strip follows the real width.
//   drawStrip(ctx, c, box, { width, minority, field })  -> { depleted }, columns emptied on each side
import { arrow, dot, label, line } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { V0, widthAt } from './_p-n-junction-diode-math.js';

export const COLS = 8;
export const ROWS = 3;
export const W_REF = widthAt(V0 + 5); // the widest layer drawn: a 5 V reverse bias
export const coverage = (width) => Math.min(1, width / W_REF);
export const columnsDepleted = (width) => {
  const reach = coverage(width) * COLS;
  let n = 0;
  while (n < COLS && n + 0.5 <= reach + 1e-9) n += 1;
  return n;
};

// A current in amperes as text, in the unit that keeps the number readable: mA, μA, nA or pA.
export const amps = (I) => {
  const size = Math.abs(I);
  if (size >= 1e-3) return `${sig(I * 1e3, 3)} mA`;
  if (size >= 1e-6) return `${sig(I * 1e6, 3)} μA`;
  return size >= 1e-9 ? `${sig(I * 1e9, 3)} nA` : `${sig(I * 1e12, 3)} pA`;
};

const MINORITY = [[7, 0], [5, 2], [6, 1]]; // [column, row] of the few opposite carriers

function core(ctx, c, x, y, sign) {
  ctx.fillStyle = c.d;
  ctx.fillRect(x - 6, y - 6, 12, 12);
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 6, y - 6, 12, 12);
  ctx.save();
  ctx.fillStyle = c.paper;
  ctx.font = `700 12px ${c.fontMono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign, x, y + 0.5);
  ctx.restore();
}

export function drawStrip(ctx, c, box, { width, minority = false, field = false }) {
  const { x, y, w, h } = box;
  const mid = x + w / 2;
  const side = w / 2;
  const dx = side / COLS;
  const top = y + 20;
  const dy = (h - 26) / ROWS;
  const half = coverage(width) * side;
  const depleted = columnsDepleted(width);

  ctx.fillStyle = c.paper;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = c.fillY;
  ctx.fillRect(mid - half, y, half * 2, h);
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  line(ctx, mid, y + 2, mid, y + h - 2, { color: c.ink, width: 2, dash: [5, 4] });

  for (let j = 0; j < COLS; j++) {
    for (let i = 0; i < ROWS; i++) {
      const py = top + dy * (i + 0.5);
      for (const s of [-1, 1]) {
        const px = mid + s * (j + 0.5) * dx;
        core(ctx, c, px - s * 5, py, s < 0 ? '−' : '+');
        if (j >= depleted) dot(ctx, px + s * 6, py, 4.5, s < 0 ? c.b : c.a, c.ink, 2);
      }
    }
  }
  if (minority) {
    for (const [j, i] of MINORITY) {
      if (j < depleted) continue;
      const py = top + dy * (i + 0.5) + dy * 0.3;
      dot(ctx, mid - (j + 0.5) * dx + 8, py, 3, c.a, c.ink, 1.5);
      dot(ctx, mid + (j + 0.5) * dx - 8, py, 3, c.b, c.ink, 1.5);
    }
  }
  label(ctx, 'p-type', x + 8, y + 10, c, { size: 11, align: 'left', patch: false });
  label(ctx, 'n-type', x + w - 8, y + 10, c, { size: 11, align: 'right', patch: false });
  if (field && half > 24) arrow(ctx, mid + half * 0.8, y + 10, mid - half * 0.8, y + 10, { color: c.ink, width: 2, head: 8 });
  return { depleted };
}
