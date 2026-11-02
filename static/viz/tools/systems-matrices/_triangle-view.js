// A triangle with three draggable corners, shared by the area and collinearity tools.
//   const tri = triangleTool({ points, label, extraDraw, controls, tex })
// Corners snap to a half-unit grid and move with the arrow keys too (Enter picks the next corner).
import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { dot, label, poly } from '../../lib/draw.js';

export const area2 = (P) => (P[0][0] * (P[1][1] - P[2][1]) + P[1][0] * (P[2][1] - P[0][1]) + P[2][0] * (P[0][1] - P[1][1]));

export function triangleTool({ points, label: aria, extraDraw = () => {}, readout, tex, fill }) {
  const tool = createTool({
    state: { points },
    label: aria,
    setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 14 }),
    draw(ctx, stage, c, plot) {
      const P = points;
      plot.axes();
      poly(ctx, P.map((p) => plot.toPx(...p)), { fill: fill(P, c), stroke: c.ink, width: 3 });
      extraDraw(ctx, plot, c, P);
      ['A', 'B', 'C'].forEach((name, i) => {
        dot(ctx, ...plot.toPx(...P[i]), 9, [c.fillA, c.fillB, c.fillY][i], c.ink);
        label(ctx, name, ...plot.toPx(P[i][0] + 0.35, P[i][1] + 0.45), c, { size: 13, patch: false });
      });
    },
    controls: [
      { title: 'Drag the corners' },
      { text: 'Drag A, B and C on the picture, or tap one and use the arrow keys.' },
      { readout },
    ],
    tex,
  });
  const plot = tool.extra;
  const step = () => Math.abs(plot.toPx(0.5, 0)[0] - plot.toPx(0, 0)[0]);
  handles(tool.stage, points.map((p, i) => ({
    at: () => plot.toPx(...points[i]),
    move(px, py) {
      const [x, y] = plot.toWorld(px, py);
      points[i] = [Math.max(-5.5, Math.min(5.5, Math.round(x * 2) / 2)), Math.max(-5.5, Math.min(5.5, Math.round(y * 2) / 2))];
    },
    get keyStep() { return step(); },
  })), { radius: 26, onChange: () => tool.update() });
  return tool;
}
