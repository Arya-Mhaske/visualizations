// Geometric optics: exact ray maths, and an optical bench to draw on. World units are equal on both axes; y is up.
// Light runs left to right along +x and the pole or lens centre sits at x = 0, as in NCERT's Cartesian convention.
//   reflect(d, n)                unit direction d off a surface with unit normal n
//   refract(d, n, n1, n2)        Snell's law; n faces the incoming ray; null at total internal reflection
//   hitCircle(p, d, centre, R)   distances along the ray to a circle, nearest first; [] if it misses
//   axisCrossing(p, d)           x where the line through p along d meets y = 0; null if parallel
//   unit([x, y])                 scaled to length 1
//   createBench(stage, { x: [a, b], cy, c })
//     toPx(x, y), toWorld(px, py), setRange([a, b]), view() -> { left, right, top, bottom }
//     axis(), mark(name, x, opts), object(x, h, color, { dash }), mirror(R, H)   R > 0 concave, R < 0 convex, 0 flat; H half height
//     ray(p, q, { color, dash, arrow, width })   a segment with an arrowhead halfway along it
//     rayTo(p, d, opts)                          the same, out to the edge of the view; returns the end point
//     inView(x, y)                               false when a point is off the drawing
import { arrow as arrowLine, label, line } from './draw.js';

export const unit = ([x, y]) => {
  const size = Math.hypot(x, y);
  return [x / size, y / size];
};

export function reflect([dx, dy], [nx, ny]) {
  const k = 2 * (dx * nx + dy * ny);
  return [dx - k * nx, dy - k * ny];
}

export function refract([dx, dy], [nx, ny], n1, n2) {
  const ratio = n1 / n2;
  const cosI = -(dx * nx + dy * ny);
  const rest = 1 - ratio * ratio * (1 - cosI * cosI);
  if (rest < 0) return null;
  const k = ratio * cosI - Math.sqrt(rest);
  return [ratio * dx + k * nx, ratio * dy + k * ny];
}

export function hitCircle([px, py], [dx, dy], [cx, cy], R) {
  const [ox, oy] = [px - cx, py - cy];
  const b = ox * dx + oy * dy;
  const disc = b * b - (ox * ox + oy * oy - R * R);
  if (disc < 0) return [];
  const root = Math.sqrt(disc);
  return [-b - root, -b + root].filter((t) => t > 1e-9);
}

export const axisCrossing = ([px, py], [dx, dy]) => (Math.abs(dy) < 1e-12 ? null : px - (py * dx) / dy);

export function createBench(stage, { x = [-10, 10], cy = 0.5, c }) {
  let [a, b] = x;
  const ctx = stage.ctx;
  const scale = () => stage.w / (b - a);
  const toPx = (wx, wy) => [(wx - a) * scale(), stage.h * cy - wy * scale()];
  const toWorld = (px, py) => [px / scale() + a, (stage.h * cy - py) / scale()];
  const view = () => ({ left: a, right: b, top: (stage.h * cy) / scale(), bottom: -(stage.h * (1 - cy)) / scale() });

  function ray(p, q, { color = c.ink, dash = [], arrow = true, width = 2 } = {}) {
    const [from, to] = [toPx(...p), toPx(...q)];
    line(ctx, ...from, ...to, { color, width, dash });
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    if (!arrow || length < 30) return;
    const [ux, uy] = [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
    const [mx, my] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
    arrowLine(ctx, mx - ux * 6, my - uy * 6, mx + ux * 6, my + uy * 6, { color, width, head: 10 });
  }

  function rayTo(p, d, options) {
    const { left, right, top, bottom } = view();
    const limits = [
      d[0] > 0 ? (right - p[0]) / d[0] : d[0] < 0 ? (left - p[0]) / d[0] : Infinity,
      d[1] > 0 ? (top - p[1]) / d[1] : d[1] < 0 ? (bottom - p[1]) / d[1] : Infinity,
    ];
    const t = Math.max(0, Math.min(...limits));
    const end = [p[0] + d[0] * t, p[1] + d[1] * t];
    ray(p, end, options);
    return end;
  }

  function mirror(R, H) {
    const surface = (y) => (R === 0 ? 0 : Math.sign(R) * (Math.sqrt(R * R - y * y) - Math.abs(R)));
    const top = Math.min(H, Math.abs(R || Infinity) * 0.95);
    const steps = 40;
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const y = -top + (2 * top * i) / steps;
      ctx.lineTo(...toPx(surface(y), y));
    }
    ctx.stroke();
    ctx.restore();
    const ticks = Math.round((top * 2 * scale()) / 12);
    for (let i = 0; i <= ticks; i++) {
      const y = -top + (2 * top * i) / ticks;
      const [px, py] = toPx(surface(y), y);
      line(ctx, px + 2, py, px + 8, py + 5, { color: c.ink, width: 2 });
    }
  }

  return {
    toPx,
    toWorld,
    view,
    ray,
    rayTo,
    mirror,
    setRange([left, right]) {
      a = left;
      b = right;
    },
    inView(wx, wy) {
      const v = view();
      return wx >= v.left && wx <= v.right && wy >= v.bottom && wy <= v.top;
    },
    axis() {
      const y = toPx(0, 0)[1];
      line(ctx, 0, y, stage.w, y, { color: c.ink, width: 2, dash: [10, 4] });
    },
    mark(name, wx, { color = c.ink, below = true } = {}) {
      const [px, py] = toPx(wx, 0);
      line(ctx, px, py - 5, px, py + 5, { color, width: 3 });
      label(ctx, name, px, py + (below ? 15 : -15), c, { size: 12, color, bounds: stage });
    },
    object(wx, h, color, { dash = [] } = {}) {
      const [px, py] = toPx(wx, 0);
      const tip = toPx(wx, h);
      if (dash.length) line(ctx, px, py, ...tip, { color, width: 4, dash });
      arrowLine(ctx, px, py, ...tip, { color, width: 4, head: 12 });
    },
  };
}
