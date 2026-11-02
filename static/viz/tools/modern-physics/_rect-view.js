// Circuit symbols for the rectifier pictures.
import { line, label, poly, dot } from '../../lib/draw.js';

export function diode(ctx, c, x, y, size = 10) {
  poly(ctx, [[x - size, y - size], [x - size, y + size], [x + size, y]], { fill: c.fillA, stroke: c.ink, width: 2 });
  line(ctx, x + size, y - size, x + size, y + size, { color: c.ink, width: 3 });
}

export function capacitor(ctx, c, x, y, size = 12) {
  line(ctx, x - size, y - 4, x + size, y - 4, { color: c.ink, width: 3 });
  line(ctx, x - size, y + 4, x + size, y + 4, { color: c.ink, width: 3 });
}

export function resistorV(ctx, c, x, y, h = 36) {
  ctx.fillStyle = c.paper;
  ctx.fillRect(x - 7, y - h / 2, 14, h);
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 7, y - h / 2, 14, h);
}

export function acSource(ctx, c, x, y, r = 14) {
  ctx.fillStyle = c.paper;
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) {
    const px = x - r * 0.7 + (i / 20) * r * 1.4;
    const py = y - Math.sin((i / 20) * Math.PI * 2) * r * 0.35;
    if (i) ctx.lineTo(px, py);
    else ctx.moveTo(px, py);
  }
  ctx.lineWidth = 2;
  ctx.stroke();
}

// The load circuit. mode 'half' or 'full' (centre tap); filter draws the capacitor across the load.
export function drawCircuit(ctx, c, box, { mode, filter }) {
  const { x, y, w, h } = box;
  const top = y + h * 0.12;
  const gnd = y + h * 0.9;
  const sx = x + w * 0.16;
  const dx = x + w * 0.42;
  const nodeX = x + w * 0.62;
  const loadX = x + w * 0.84;
  const wire = (x1, y1, x2, y2) => line(ctx, x1, y1, x2, y2, { color: c.ink, width: 3 });
  let mid = (top + gnd) / 2;
  if (mode === 'half') {
    acSource(ctx, c, sx, mid);
    wire(sx, mid - 14, sx, top);
    wire(sx, top, dx - 10, top);
    diode(ctx, c, dx, top);
    wire(dx + 10, top, nodeX, top);
    wire(sx, mid + 14, sx, gnd);
    label(ctx, 'D', dx, top - 16, c, { size: 10, patch: false });
  } else {
    const rowB = y + h * 0.6;
    const ct = (top + rowB) / 2;
    const q = (rowB - top) / 4;
    acSource(ctx, c, sx, top + q, 11);
    acSource(ctx, c, sx, rowB - q, 11);
    wire(sx, top, sx, top + q - 11);
    wire(sx, top + q + 11, sx, rowB - q - 11);
    wire(sx, rowB - q + 11, sx, rowB);
    wire(sx, top, dx - 10, top);
    diode(ctx, c, dx, top);
    wire(dx + 10, top, nodeX, top);
    wire(sx, rowB, dx - 10, rowB);
    diode(ctx, c, dx, rowB);
    wire(dx + 10, rowB, nodeX, rowB);
    wire(nodeX, rowB, nodeX, top);
    dot(ctx, nodeX, top, 4, c.ink, c.ink, 1);
    const left = x + w * 0.05;
    wire(sx, ct, left, ct);
    wire(left, ct, left, gnd);
    wire(left, gnd, loadX, gnd);
    dot(ctx, sx, ct, 4, c.ink, c.ink, 1);
    label(ctx, 'D1', dx, top - 16, c, { size: 10, patch: false });
    label(ctx, 'D2', dx, rowB + 16, c, { size: 10, patch: false });
    mid = (top + gnd) / 2;
  }
  wire(nodeX, top, loadX, top);
  wire(loadX, top, loadX, mid - 18);
  resistorV(ctx, c, loadX, mid, 36);
  wire(loadX, mid + 18, loadX, gnd);
  if (mode === 'half') wire(sx, gnd, loadX, gnd);
  label(ctx, 'R_L', loadX + 12, mid, c, { size: 10, align: 'left', bounds: { w: x + w }, patch: false });
  if (filter) {
    const cx = (nodeX + loadX) / 2;
    wire(cx, top, cx, mid - 4);
    capacitor(ctx, c, cx, mid, 12);
    wire(cx, mid + 4, cx, gnd);
    dot(ctx, cx, top, 4, c.ink, c.ink, 1);
    label(ctx, 'C', cx + 12, mid, c, { size: 10, align: 'left', patch: false });
  }
}
