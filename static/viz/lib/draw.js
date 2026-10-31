// Canvas drawing helpers in the site style: 3px ink outlines, flat fills, mono labels.
// Every function takes ctx first. c is the object from readColors().
export const TAU = Math.PI * 2;

export function line(ctx, x1, y1, x2, y2, { color, width = 3, dash = [] } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function arrow(ctx, x1, y1, x2, y2, { color, width = 3, head = 10 } = {}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const size = Math.min(head, length * 0.6);
  line(ctx, x1, y1, x2 - Math.cos(angle) * size * 0.8, y2 - Math.sin(angle) * size * 0.8, { color, width });
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - 0.45), y2 - size * Math.sin(angle - 0.45));
  ctx.lineTo(x2 - size * Math.cos(angle + 0.45), y2 - size * Math.sin(angle + 0.45));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function dot(ctx, x, y, r, fill, ink, width = 3) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  if (ink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

export function poly(ctx, points, { fill, stroke, width = 3, closed = true, dash = [] } = {}) {
  ctx.save();
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  if (closed) ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.stroke();
  }
  ctx.restore();
}

// A pie wedge from a0 to a1 (radians, canvas direction). Outline optional.
export function wedge(ctx, x, y, r, a0, a1, { fill, stroke, width = 3 } = {}) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, a0, a1, a1 < a0);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  ctx.restore();
}

export function arc(ctx, x, y, r, a0, a1, { color, width = 3, dash = [] } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(x, y, r, a0, a1, a1 < a0);
  ctx.stroke();
  ctx.restore();
}

// A zig-zag coil spring from (x1, y) to (x2, y), for spring–mass scenes. Coils stay the same size as it stretches.
export function spring(ctx, x1, x2, y, { color, coils = 10, width = 3, size = 9 } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  for (let i = 0; i < coils * 2; i++) {
    ctx.lineTo(x1 + ((x2 - x1) * (i + 0.5)) / (coils * 2), y + (i % 2 ? size : -size));
  }
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

// Text on a small paper patch, so a label stays readable over lines. Stays inside the stage when given bounds.
export function label(ctx, text, x, y, c, { color, size = 12, align = 'center', bounds = null, patch = true } = {}) {
  ctx.save();
  ctx.font = `700 ${size}px ${c.fontMono}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width;
  let left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  if (bounds) left = Math.max(3, Math.min(bounds.w - w - 3, left));
  if (patch) {
    ctx.fillStyle = c.paper;
    ctx.fillRect(left - 2, y - size * 0.65, w + 4, size * 1.3);
  }
  ctx.fillStyle = color || c.ink;
  ctx.fillText(text, left, y);
  ctx.restore();
}
