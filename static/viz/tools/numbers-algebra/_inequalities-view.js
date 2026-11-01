// A stepper figure that is a number line: lineFigure(stageEl, label, range, draw) puts a canvas above the worked steps.
//   draw(ctx, nl, c, stage) gets a numberLine (lib/numline.js) already placed in the middle of the figure.
import { numberLine } from '../../lib/numline.js';
import { createStage } from '../../lib/stage.js';
import { readColors } from '../../lib/colors.js';

export function lineFigure(stageEl, label, range, draw, { step = 1 } = {}) {
  const c = readColors();
  const holder = document.createElement('div');
  holder.className = 'viz-figure';
  stageEl.appendChild(holder);
  return createStage(holder, (ctx, size, stage) => {
    const nl = numberLine(ctx, stage, c, { lo: range[0], hi: range[1], y: stage.h * 0.55, step });
    nl.axis();
    draw(ctx, nl, c, stage);
  }, { label });
}
