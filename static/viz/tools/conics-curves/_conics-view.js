// Drawing helpers for the Conics box.
//   equalFigure(stageEl, label, half, draw)  a stepper figure whose axes have equal scales;
//     draw(ctx, plot, c, stage) gets a createPlot already set to show [-half, half] on the shorter side.
//   curve(plot, points, opts)  draws a polyline of [x, y] points, breaking at nulls.
//   nudgePoint(tool, get, set, snapFn)  a draggable point for a createTool plot (tool.extra).
import { line, poly } from '../../lib/draw.js';
import { createPlot } from '../../lib/plot.js';
import { createStage } from '../../lib/stage.js';
import { readColors } from '../../lib/colors.js';

export function equalFigure(stageEl, label, half, draw, centre = [0, 0]) {
  const c = readColors();
  const holder = document.createElement('div');
  holder.className = 'viz-figure';
  stageEl.appendChild(holder);
  let plot = null;
  return createStage(holder, (ctx, size, stage) => {
    plot ??= createPlot(stage, { x: [-half, half], y: [-half, half], c, pad: 14 });
    const ratio = stage.w / stage.h;
    plot.setRange([centre[0] - half * ratio, centre[0] + half * ratio], [centre[1] - half, centre[1] + half]);
    plot.axes();
    draw(ctx, plot, c, stage);
  }, { label });
}

export function curve(plot, points, { color, width = 3, dash = [] } = {}) {
  let run = [];
  const flush = () => {
    for (let i = 1; i < run.length; i++) plot.segment(run[i - 1][0], run[i - 1][1], run[i][0], run[i][1], { color, width, dash });
    run = [];
  };
  for (const p of points) {
    if (p) run.push(p); else flush();
  }
  flush();
}

// Sample a parametric curve f(t) -> [x, y] | null for t in [t0, t1]
export const trace = (f, t0, t1, n = 240) => Array.from({ length: n + 1 }, (_, i) => f(t0 + ((t1 - t0) * i) / n));

// A double cone seen from slightly above, with a cutting plane through it.
//   drawCone(ctx, c, O, k, alpha, beta, down)  O = apex in pixels, k = pixels per unit of height,
//   alpha = cone half-angle, beta = plane angle with the axis (degrees), down = how far below the apex the plane crosses the axis (units).
export function drawCone(ctx, c, O, k, alpha, beta, down) {
  const a = (alpha * Math.PI) / 180;
  const b = (beta * Math.PI) / 180;
  const H = 1.1 * k; // height of each nappe
  const rx = Math.tan(a) * H;
  const ry = rx * 0.28;
  // the two nappes, filled
  poly(ctx, [[O[0], O[1]], [O[0] - rx, O[1] + H], [O[0] + rx, O[1] + H]], { fill: c.fillB });
  poly(ctx, [[O[0], O[1]], [O[0] - rx, O[1] - H], [O[0] + rx, O[1] - H]], { fill: c.fillB });
  [-1, 1].forEach((s) => {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(O[0], O[1] + s * H, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = c.fillB;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  });
  // the cutting plane: a parallelogram that runs along the tilt direction and into the page
  const P0 = [O[0], O[1] + down * k];
  const u = [Math.sin(b), -Math.cos(b)];
  const len = 0.9 * k;
  const depth = [0, -ry * 1.2];
  const corner = (s, t) => [P0[0] + s * u[0] * len + t * depth[0], P0[1] + s * u[1] * len + t * depth[1]];
  ctx.save();
  ctx.globalAlpha = 0.6;
  poly(ctx, [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], { fill: c.a });
  ctx.restore();
  poly(ctx, [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)], { stroke: c.ink, width: 3 });
  // the cone's outline on top
  [-1, 1].forEach((s) => {
    line(ctx, O[0], O[1], O[0] + s * rx, O[1] + H, { color: c.ink, width: 3 });
    line(ctx, O[0], O[1], O[0] + s * rx, O[1] - H, { color: c.ink, width: 3 });
  });
}
