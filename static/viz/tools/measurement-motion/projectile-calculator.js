import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { fitPath } from '../../lib/quick.js';
import { pos, range, peak, flightTime } from './_proj.js';

const state = { v: 20, th: 40, h: 0 };

createTool({
  state,
  label: 'The projectile path from the launch point to the landing point, with the highest point and the landing point marked.',
  setup: (stage, c) => createPlot(stage, { x: [0, 45], y: [0, 25], c }),
  draw(ctx, stage, c, plot) {
    const T = flightTime(state.v, state.th, state.h);
    fitPath(plot, stage, range(state.v, state.th, state.h), peak(state.v, state.th, state.h));
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    const pts = Array.from({ length: 81 }, (_, i) => pos(state.v, state.th, (T * i) / 80, state.h));
    pts.slice(1).forEach((p, i) => plot.segment(pts[i][0], pts[i][1], p[0], p[1], { color: c.b, width: 4 }));
    const top = pts.reduce((m, p) => (p[1] > m[1] ? p : m));
    plot.point(...top, { fill: c.a });
    plot.point(range(state.v, state.th, state.h), 0, { fill: c.c, r: 7 });
  },
  controls: [
    { title: 'Launch' },
    { key: 'v', label: 'Speed v (m/s)', min: 5, max: 40, step: 1 },
    { key: 'th', label: 'Angle θ (°)', min: 0, max: 90, step: 1 },
    { key: 'h', label: 'Launch height h (m)', min: 0, max: 50, step: 5 },
    { readout: [
      ['Time of flight', (s) => `${fixed(flightTime(s.v, s.th, s.h), 2)} s`],
      ['Greatest height', (s) => `${fixed(peak(s.v, s.th, s.h), 2)} m`],
      ['Range', (s) => `${fixed(range(s.v, s.th, s.h), 2)} m`],
    ] },
  ],
  tex: (s) => `T=${fixed(flightTime(s.v, s.th, s.h), 2)}\\,\\mathrm{s},\\ H=${fixed(peak(s.v, s.th, s.h), 2)}\\,\\mathrm{m},\\ R=${fixed(range(s.v, s.th, s.h), 2)}\\,\\mathrm{m}`,
});
