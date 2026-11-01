// Drawing helpers for the Conics box.
//   equalFigure(stageEl, label, half, draw)  a stepper figure whose axes have equal scales;
//     draw(ctx, plot, c, stage) gets a createPlot already set to show [-half, half] on the shorter side.
//   curve(plot, points, opts)  draws a polyline of [x, y] points, breaking at nulls.
//   nudgePoint(tool, get, set, snapFn)  a draggable point for a createTool plot (tool.extra).
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
