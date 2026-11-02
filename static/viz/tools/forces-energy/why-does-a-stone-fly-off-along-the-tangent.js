import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { cut: 60, t: 1.5, v: 4 };
const R = 2;
const rad = (d) => (d * Math.PI) / 180;

createTool({
  state,
  label: 'A stone whirled in a circle with the string cut at the chosen point. After the cut the stone moves in a straight line along the tangent to the circle.',
  setup: (stage, c) => createPlot(stage, { x: [-8, 8], y: [-8, 8], c }),
  draw(ctx, stage, c, plot) {
    const a = rad(state.cut);
    const p = [R * Math.cos(a), R * Math.sin(a)];
    plot.axes({ xLabel: '', yLabel: '' });
    plot.fn((x) => Math.sqrt(Math.max(0, R * R - x * x)), { color: c.ink, domain: [-R, R] });
    plot.fn((x) => -Math.sqrt(Math.max(0, R * R - x * x)), { color: c.ink, domain: [-R, R] });
    const d = state.v * state.t;
    const q = [p[0] - Math.sin(a) * d, p[1] + Math.cos(a) * d];
    plot.segment(...p, ...q, { color: c.a, width: 4 });
    plot.segment(0, 0, ...p, { color: c.ink, width: 1, dash: [4, 4] });
    plot.point(...p, { fill: c.c, r: 6 });
    plot.point(...q, { fill: c.a });
  },
  controls: [
    { title: 'Cut the string' },
    { key: 'cut', label: 'Cut at angle (°)', min: 0, max: 360, step: 5 },
    { key: 'v', label: 'Speed v (m/s)', min: 1, max: 8, step: 1 },
    { key: 't', label: 'Time since the cut (s)', min: 0, max: 3, step: 0.1 },
    { readout: [
      ['Direction of travel', (s) => `${(s.cut + 90) % 360}° (tangent)`],
      ['Distance from the cut point', (s) => `${fixed(s.v * s.t, 2)} m`],
    ] },
  ],
  tex: () => `\\vec F=0\\ \\Rightarrow\\ \\vec v\\ \\text{constant (along the tangent)}`,
});
