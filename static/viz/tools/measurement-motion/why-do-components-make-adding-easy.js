import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { A: 5, a: 30, B: 4, b: 120 };
const rad = (d) => (d * Math.PI) / 180;
const parts = (s) => {
  const [ax, ay, bx, by] = [s.A * Math.cos(rad(s.a)), s.A * Math.sin(rad(s.a)), s.B * Math.cos(rad(s.b)), s.B * Math.sin(rad(s.b))];
  return { ax, ay, bx, by, rx: ax + bx, ry: ay + by };
};

createTool({
  state,
  label: 'Two vectors A and B drawn from the origin, with their x and y parts as dashed lines, and the resultant R found by adding the parts.',
  setup: (stage, c) => createPlot(stage, { x: [-9, 9], y: [-9, 9], c }),
  draw(ctx, stage, c, plot) {
    const p = parts(state);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(0, 0, p.ax, p.ay, { color: c.a, width: 4 });
    plot.segment(0, 0, p.bx, p.by, { color: c.b, width: 4 });
    plot.segment(0, 0, p.rx, p.ry, { color: c.c, width: 5 });
    plot.segment(p.ax, p.ay, p.rx, p.ry, { color: c.b, width: 1, dash: [4, 4] });
    plot.segment(p.ax, 0, p.ax, p.ay, { color: c.a, width: 1, dash: [4, 4] });
    plot.segment(p.bx, 0, p.bx, p.by, { color: c.b, width: 1, dash: [4, 4] });
    plot.point(p.rx, p.ry, { fill: c.c });
  },
  controls: [
    { title: 'Two vectors' },
    { key: 'A', label: 'Length of A', min: 1, max: 6, step: 0.5 },
    { key: 'a', label: 'Angle of A (°)', min: 0, max: 360, step: 5 },
    { key: 'B', label: 'Length of B', min: 1, max: 6, step: 0.5 },
    { key: 'b', label: 'Angle of B (°)', min: 0, max: 360, step: 5 },
    { readout: [
      ['x column', (s) => `${fixed(parts(s).ax, 2)} + ${fixed(parts(s).bx, 2)} = ${fixed(parts(s).rx, 2)}`],
      ['y column', (s) => `${fixed(parts(s).ay, 2)} + ${fixed(parts(s).by, 2)} = ${fixed(parts(s).ry, 2)}`],
      ['|R|', (s) => fixed(Math.hypot(parts(s).rx, parts(s).ry), 2)],
      ['Direction', (s) => `${fixed((Math.atan2(parts(s).ry, parts(s).rx) * 180) / Math.PI, 1)}°`],
    ] },
  ],
  tex: (s) => `R_x=${fixed(parts(s).rx, 2)},\\ R_y=${fixed(parts(s).ry, 2)},\\ |R|=${fixed(Math.hypot(parts(s).rx, parts(s).ry), 2)}`,
});
