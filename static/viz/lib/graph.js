// Small helpers for calculus graphs drawn with createPlot.
//   deriv(f, x, h)                  central-difference slope of f at x
//   tangent(plot, x, y, m, half, o) a tangent segment through (x, y) with slope m, half-width `half` in x
//   direction(plot, x, y, dx, dy, half, o)  the same, from a direction vector (works for vertical lines)
//   stackBoxes(n)                   box functions for n stacked plots: createPlot(stage, { box: stackBoxes(2)[0] })
//   slopeTicks(ctx, plot, rule, [x0, x1], [y0, y1], nx, ny, { len, color })  a grid of short slope segments,
//                                   drawn at their true on-screen slope for any axis scales
export const deriv = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);

export function tangent(plot, x, y, m, half = 1, options = {}) {
  plot.segment(x - half, y - m * half, x + half, y + m * half, options);
}

export function direction(plot, x, y, dx, dy, half = 1, options = {}) {
  plot.segment(x - dx * half, y - dy * half, x + dx * half, y + dy * half, options);
}

export const stackBoxes = (n) => Array.from({ length: n }, (_, i) => (stage) => ({ x: 0, y: (i * stage.h) / n, w: stage.w, h: stage.h / n }));

export function slopeTicks(ctx, plot, rule, [x0, x1], [y0, y1], nx, ny, { len = 14, color, width = 2 } = {}) {
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const x = x0 + ((x1 - x0) * (i + 0.5)) / nx;
      const y = y0 + ((y1 - y0) * (j + 0.5)) / ny;
      const m = rule(x, y);
      if (!Number.isFinite(m)) continue;
      const [px, py] = plot.toPx(x, y);
      const [qx, qy] = plot.toPx(x + 1, y + m);
      const n = Math.hypot(qx - px, qy - py) || 1;
      const [ux, uy] = [((qx - px) / n) * (len / 2), ((qy - py) / n) * (len / 2)];
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(px - ux, py - uy);
      ctx.lineTo(px + ux, py + uy);
      ctx.stroke();
      ctx.restore();
    }
  }
}
