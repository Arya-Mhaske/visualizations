// Electric fields of point charges, and field lines traced through them. A charge is { x, y, q }.
//   fieldAt(charges, [x, y], k = 1)     the vector sum of k q r̂ / r²
//   potentialAt(charges, [x, y], k = 1) the sum of k q / r
//   traceLine(charges, start, { sign, step, steps, stop, bounds, skip })   RK4 along the unit field direction.
//     sign −1 walks against the field. Returns { points, end, hit }, end being 'charge', 'edge', 'null' (no field) or 'steps'.
//   fieldLines(charges, { perUnit, bounds })   lines in proportion to each charge. Returns { lines: [{ points, flip }], out, into, escaped }.
//     A line starts on a + charge. A − charge only adds the lines that no + charge sent it. flip means its points run against the field.
//   drawLine(ctx, toPx, line, { color, width })  a polyline with an arrow along the field
//   drawCharge(ctx, x, y, r, q, c)               a disc with its sign, positive coral and negative blue
import { arrow, dot, label } from './draw.js';

export function fieldAt(charges, [x, y], k = 1) {
  let [ex, ey] = [0, 0];
  for (const { x: cx, y: cy, q } of charges) {
    const [dx, dy] = [x - cx, y - cy];
    const r2 = dx * dx + dy * dy;
    const size = (k * q) / (r2 * Math.sqrt(r2));
    ex += size * dx;
    ey += size * dy;
  }
  return [ex, ey];
}

export function potentialAt(charges, [x, y], k = 1) {
  return charges.reduce((sum, { x: cx, y: cy, q }) => sum + (k * q) / Math.hypot(x - cx, y - cy), 0);
}

function direction(charges, p, sign) {
  const [ex, ey] = fieldAt(charges, p);
  const size = Math.hypot(ex, ey);
  return size < 1e-9 ? null : [(sign * ex) / size, (sign * ey) / size];
}

export function traceLine(charges, start, { sign = 1, step = 0.08, steps = 700, stop = 0.2, bounds = 15, skip = -1 } = {}) {
  const points = [start];
  let p = start;
  for (let i = 0; i < steps; i++) {
    const k1 = direction(charges, p, sign);
    if (!k1) return { points, end: 'null', hit: -1 };
    const at = (d, h) => [p[0] + d[0] * h, p[1] + d[1] * h];
    const k2 = direction(charges, at(k1, step / 2), sign) || k1;
    const k3 = direction(charges, at(k2, step / 2), sign) || k2;
    const k4 = direction(charges, at(k3, step), sign) || k3;
    p = [p[0] + (step / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), p[1] + (step / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
    points.push(p);
    const hit = charges.findIndex((c, index) => (index !== skip || i > 8) && Math.hypot(p[0] - c.x, p[1] - c.y) < stop);
    if (hit >= 0) return { points, end: 'charge', hit };
    if (Math.abs(p[0]) > bounds || Math.abs(p[1]) > bounds) return { points, end: 'edge', hit: -1 };
  }
  return { points, end: 'steps', hit: -1 };
}

export function fieldLines(charges, { perUnit = 6, bounds = 15, radius = 0.24 } = {}) {
  const lines = [];
  let [out, into, escaped] = [0, 0, 0];
  const seeds = ({ x, y, q }) => {
    const n = Math.round(perUnit * Math.abs(q));
    return Array.from({ length: n }, (_, j) => {
      const a = ((j + 0.5) * 2 * Math.PI) / n;
      return [x + radius * Math.cos(a), y + radius * Math.sin(a)];
    });
  };
  charges.forEach((charge, index) => {
    if (charge.q <= 0) return;
    for (const start of seeds(charge)) {
      const run = traceLine(charges, start, { bounds, skip: index });
      out++;
      if (run.end === 'charge') into++;
      else escaped++;
      lines.push({ points: run.points, flip: false });
    }
  });
  charges.forEach((charge, index) => {
    if (charge.q >= 0) return;
    for (const start of seeds(charge)) {
      const run = traceLine(charges, start, { sign: -1, bounds, skip: index });
      if (run.end === 'charge') continue; // a + charge already sent this line
      into++;
      lines.push({ points: run.points, flip: true });
    }
  });
  return { lines, out, into, escaped };
}

export function drawLine(ctx, toPx, { points, flip = false }, { color, width = 2 } = {}) {
  if (points.length < 3) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(...toPx(...p)) : ctx.moveTo(...toPx(...p))));
  ctx.stroke();
  ctx.restore();
  const mid = Math.min(points.length - 2, Math.max(1, Math.floor(points.length * 0.4)));
  const [from, to] = flip ? [points[mid + 1], points[mid - 1]] : [points[mid - 1], points[mid + 1]];
  const [a, b] = [toPx(...from), toPx(...to)];
  const size = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const [ux, uy] = [(b[0] - a[0]) / size, (b[1] - a[1]) / size];
  arrow(ctx, a[0] - ux * 5, a[1] - uy * 5, a[0] + ux * 5, a[1] + uy * 5, { color, width, head: 9 });
}

export function drawCharge(ctx, x, y, r, q, c) {
  dot(ctx, x, y, r, q > 0 ? c.a : c.b, c.ink);
  label(ctx, q > 0 ? '+' : '−', x, y, c, { size: Math.max(12, r * 1.4), patch: false });
}
