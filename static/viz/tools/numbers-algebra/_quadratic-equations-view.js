// A stepper figure that is a function graph: graphFigure(stageEl, label, x, y, draw) puts a canvas above the worked steps.
//   draw(ctx, plot, c, stage) is called with a createPlot already set up for the given windows.
import { createPlot } from '../../lib/plot.js';
import { createStage } from '../../lib/stage.js';
import { readColors } from '../../lib/colors.js';

export function graphFigure(stageEl, label, x, y, draw) {
  const c = readColors();
  const holder = document.createElement('div');
  holder.className = 'viz-figure';
  stageEl.appendChild(holder);
  let plot = null;
  return createStage(holder, (ctx, size, stage) => {
    plot ??= createPlot(stage, { x, y, c, pad: 18 });
    plot.axes();
    draw(ctx, plot, c, stage);
  }, { label });
}
