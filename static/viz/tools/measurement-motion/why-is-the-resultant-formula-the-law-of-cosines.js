import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { A: 3, B: 4, th: 60 };
const R2 = (s, th = s.th) => s.A ** 2 + s.B ** 2 + 2 * s.A * s.B * Math.cos((th * Math.PI) / 180);
const R2tri = (s) => s.A ** 2 + s.B ** 2 - 2 * s.A * s.B * Math.cos(((180 - s.th) * Math.PI) / 180);

createTool({
  state,
  label: 'A graph of the resultant length against the angle between the vectors, falling from the sum at zero degrees to the difference at one hundred eighty degrees.',
  setup: (stage, c) => createPlot(stage, { x: [0, 180], y: [0, 10], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'θ between A and B (°)', yLabel: 'R' });
    plot.fn((th) => Math.sqrt(Math.max(0, R2(state, th))), { color: c.b });
    plot.point(state.th, Math.sqrt(R2(state)));
  },
  controls: [
    { title: 'Two vectors' },
    { key: 'A', label: 'A', min: 1, max: 6, step: 1 },
    { key: 'B', label: 'B', min: 1, max: 6, step: 1 },
    { key: 'th', label: 'Angle θ between them (°)', min: 0, max: 180, step: 5 },
    { readout: [
      ['Triangle angle', (s) => `${180 - s.th}°`],
      ['R² (vector form)', (s) => fixed(R2(s), 3)],
      ['R² (law of cosines)', (s) => fixed(R2tri(s), 3)],
      ['R', (s) => fixed(Math.sqrt(R2(s)), 3)],
    ] },
  ],
  tex: (s) => `R^2=A^2+B^2-2AB\\cos(180^\\circ-\\theta)=A^2+B^2+2AB\\cos\\theta=${fixed(R2(s), 2)}`,
});
