import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { vec, fitPath } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';
import { pos, vel, range, peak, flightTime } from './_proj.js';

const state = { v: 28, th: 30, t: 1 };

createTool({
  state,
  label: 'The path of a cricket ball thrown at twenty-eight metres per second and thirty degrees, with the ball shown at a chosen time and its velocity arrow.',
  setup: (stage, c) => createPlot(stage, { x: [0, 80], y: [0, 15], c }),
  draw(ctx, stage, c, plot) {
    const T = flightTime(state.v, state.th);
    fitPath(plot, stage, range(state.v, state.th), peak(state.v, state.th));
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    const pts = Array.from({ length: 81 }, (_, i) => pos(state.v, state.th, (T * i) / 80));
    pts.slice(1).forEach((p, i) => plot.segment(pts[i][0], pts[i][1], p[0], p[1], { color: c.b, width: 3 }));
    const t = Math.min(state.t, T);
    const p = pos(state.v, state.th, t);
    plot.point(...p, { fill: c.a, r: 8 });
    const [px, py] = plot.toPx(...p);
    const [vx, vy] = vel(state.v, state.th, t);
    vec(ctx, c, px, py, vx * 2, -vy * 2, { color: c.c });
  },
  controls: [
    { title: 'The throw' },
    { key: 'v', label: 'Speed v (m/s)', min: 10, max: 40, step: 1 },
    { key: 'th', label: 'Angle θ (°)', min: 5, max: 85, step: 1 },
    { key: 't', label: 'Time t (s)', min: 0, max: 6, step: 0.1 },
    { readout: [
      ['Vertical speed now', (s) => `${fixed(vel(s.v, s.th, Math.min(s.t, flightTime(s.v, s.th)))[1], 1)} m/s`],
      ['Greatest height', (s) => `${fixed(peak(s.v, s.th), 1)} m`],
      ['Time of flight', (s) => `${fixed(flightTime(s.v, s.th), 2)} s`],
      ['Range', (s) => `${fixed(range(s.v, s.th), 1)} m`],
    ] },
  ],
  tex: (s) => `H=\\dfrac{(${s.v}\\sin${s.th}^\\circ)^2}{2g}=${fixed(peak(s.v, s.th), 1)}\\ \\mathrm{m},\\quad R=${fixed(range(s.v, s.th), 1)}\\ \\mathrm{m}`,
});
