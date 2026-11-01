import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { h: 2 };

createTool({
  state,
  label: 'The graphs of sin x and the straight line y equals x, with x in radians. A zoom slider narrows the window around zero. Far out the two differ, but at small zoom they merge into one line. That is why sin theta can be replaced by theta for small angles, as in the pendulum formula.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 2], y: [-2, 2], c }),
  draw(ctx, stage, c, plot) {
    const h = state.h;
    plot.setRange([-h, h], [-h * 1.1, h * 1.1]);
    plot.axes({ xLabel: 'x (rad)', yLabel: 'y' });
    plot.fn((x) => x, { color: c.b, width: 6 });
    plot.fn(Math.sin, { color: c.a, width: 3 });
    plot.segment(h * 0.8, Math.sin(h * 0.8), h * 0.8, h * 0.8, { color: c.ink, width: 3 });
    plot.point(0, 0, { fill: c.fillY, r: 6 });
  },
  controls: [
    { title: 'Zoom in at 0' },
    { key: 'h', label: 'Window half-width', min: 0.05, max: 3, step: 0.05, format: (v) => `${fixed(v, 2)} rad` },
    { readout: [
      ['x at the marker', (s) => fixed(s.h * 0.8, 4)],
      ['sin x', (s) => fixed(Math.sin(s.h * 0.8), 6)],
      ['Relative error of x', (s) => `${fixed(((s.h * 0.8 - Math.sin(s.h * 0.8)) / Math.sin(s.h * 0.8)) * 100, 3)}%`],
    ] },
  ],
  tex: (s) => `\\sin ${fixed(s.h * 0.8, 3)}=${fixed(Math.sin(s.h * 0.8), 5)}\\ \\approx\\ ${fixed(s.h * 0.8, 3)}`,
});
