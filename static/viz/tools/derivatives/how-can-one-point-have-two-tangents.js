import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// x = t^2 - 1, y = t^3 - t : passes through the origin at t = -1 and at t = 1.
const X = (t) => t * t - 1;
const Y = (t) => t ** 3 - t;
const slope = (t) => (3 * t * t - 1) / (2 * t);
const state = { t: -1.4 };

createTool({
  state,
  label: 'A curve with a small loop that crosses itself at the origin. A point runs along it. The tangent line at the moving point is drawn, and two dashed lines show the two tangents at the origin: one for the first pass, at t equal to minus 1, with slope minus 1, and one for the second pass, at t equal to 1, with slope 1.',
  setup: (stage, c) => createPlot(stage, { x: [-1.5, 3], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    for (let i = 1; i <= 200; i++) {
      const a = -1.7 + (3.4 * (i - 1)) / 200;
      const b = -1.7 + (3.4 * i) / 200;
      plot.segment(X(a), Y(a), X(b), Y(b), { color: c.ink, width: 3 });
    }
    plot.segment(-1, 1, 1, -1, { color: c.b, width: 2, dash: [6, 5] });
    plot.segment(-1, -1, 1, 1, { color: c.a, width: 2, dash: [6, 5] });
    const t = state.t;
    if (Math.abs(t) > 0.05) {
      const m = slope(t);
      const n = Math.hypot(1, m);
      plot.segment(X(t) - (1 / n) * 1.3, Y(t) - (m / n) * 1.3, X(t) + (1 / n) * 1.3, Y(t) + (m / n) * 1.3, { color: c.c, width: 4 });
    }
    plot.point(0, 0, { fill: c.fillY, r: 8 });
    plot.point(X(t), Y(t), { fill: c.a, r: 8 });
  },
  controls: (tool) => [
    { title: 'Run along the curve' },
    { key: 't', label: 'Time t', min: -1.7, max: 1.7, step: 0.05, format: (v) => fixed(v, 2) },
    { row: [
      { button: 'Go to t = −1', ghost: true, onClick: () => { state.t = -1; tool.update(); } },
      { button: 'Go to t = 1', ghost: true, onClick: () => { state.t = 1; tool.update(); } },
    ] },
    { readout: [
      ['Position', (s) => `(${fixed(X(s.t), 2)}, ${fixed(Y(s.t), 2)})`],
      ['Slope here', (s) => (Math.abs(s.t) < 0.03 ? 'vertical' : fixed(slope(s.t), 3))],
      ['At the origin', () => 'slope −1 and slope +1'],
    ] },
  ],
  tex: (s) => `\\dfrac{dy}{dx}=\\dfrac{3t^2-1}{2t}\\ :\\ t=-1\\to -1,\\ \\ t=1\\to +1`,
});
