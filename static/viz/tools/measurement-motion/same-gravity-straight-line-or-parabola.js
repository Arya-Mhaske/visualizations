import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fitPath } from '../../lib/quick.js';
import { G, pos, flightTime } from './_proj.js';

const state = { v: 12, th: 90 };
const H = 15;

createTool({
  state,
  label: 'The path of an object launched from a height of fifteen metres at the chosen angle: a straight vertical line for ninety degrees and a parabola otherwise.',
  setup: (stage, c) => createPlot(stage, { x: [0, 30], y: [0, 25], c }),
  draw(ctx, stage, c, plot) {
    const T = flightTime(state.v, state.th, H);
    const pts = Array.from({ length: 81 }, (_, i) => pos(state.v, state.th, (T * i) / 80, H));
    const xs = pts.map((p) => p[0]);
    fitPath(plot, stage, Math.max(...xs, 4), Math.max(...pts.map((p) => p[1])));
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    pts.slice(1).forEach((p, i) => plot.segment(pts[i][0], pts[i][1], p[0], p[1], { color: c.b, width: 4 }));
    plot.point(0, H, { fill: c.a });
  },
  controls: [
    { title: 'Same gravity' },
    { key: 'v', label: 'Launch speed v (m/s)', min: 2, max: 25, step: 1 },
    { key: 'th', label: 'Angle θ (°)', min: -90, max: 90, step: 5 },
    { readout: [
      ['Sideways speed', (s) => `${(s.v * Math.cos((s.th * Math.PI) / 180)).toFixed(1)} m/s`],
      ['Path', (s) => (Math.abs(Math.cos((s.th * Math.PI) / 180)) < 1e-9 ? 'straight line' : 'parabola')],
      ['Acceleration', () => `${G} m/s² down, always`],
    ] },
  ],
  tex: (s) => `x=v\\cos\\theta\\,t,\\quad y=${H}+v\\sin\\theta\\,t-\\tfrac12gt^2`,
});
