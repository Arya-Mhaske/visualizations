// A stepper figure that is a complex plane: stageFigure(stageEl, label, range, draw) puts a canvas above the worked steps.
//   draw(ctx, plot, c, stage) is called with a createPlot already set up for the window [-range, range].
import { createPlot } from '../../lib/plot.js';
import { createStage } from '../../lib/stage.js';
import { readColors } from '../../lib/colors.js';

export function planeFigure(stageEl, label, range, draw) {
  const c = readColors();
  const holder = document.createElement('div');
  holder.className = 'viz-figure';
  stageEl.appendChild(holder);
  let plot = null;
  return createStage(holder, (ctx, size, stage) => {
    plot ??= createPlot(stage, { x: [-range, range], y: [-range, range], c, pad: 18 });
    plot.axes({ xLabel: 'real', yLabel: 'imaginary' });
    draw(ctx, plot, c, stage);
  }, { label });
}
