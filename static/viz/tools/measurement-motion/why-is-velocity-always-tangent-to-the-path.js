import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { fitPath } from '../../lib/quick.js';
import { G, rad, pos, vel, range, peak, flightTime } from './_proj.js';

const state = { t: 0.8, dt: 1 };
const [V, TH] = [22, 55];
const T = flightTime(V, TH);
const ang = (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI;

createTool({
  state,
  label: 'A projectile path with a point on it, a chord to a second point a short time later, and the tangent line showing the velocity direction. As the time gap shrinks the chord turns into the tangent.',
  setup: (stage, c) => createPlot(stage, { x: [0, 50], y: [0, 15], c }),
  draw(ctx, stage, c, plot) {
    fitPath(plot, stage, range(V, TH), peak(V, TH));
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    plot.fn((x) => x * Math.tan(rad(TH)) - (G * x * x) / (2 * V * V * Math.cos(rad(TH)) ** 2), { color: c.ink, domain: [0, range(V, TH)] });
    const t2 = Math.min(state.t + state.dt, T);
    const [p, q] = [pos(V, TH, state.t), pos(V, TH, t2)];
    const [vx, vy] = vel(V, TH, state.t);
    const s = 3 / Math.hypot(vx, vy);
    plot.segment(p[0], p[1], q[0], q[1], { color: c.a, width: 3 });
    plot.segment(p[0] - vx * s, p[1] - vy * s, p[0] + vx * s, p[1] + vy * s, { color: c.c, width: 3, dash: [6, 4] });
    plot.point(...p, { fill: c.c });
    plot.point(...q, { fill: c.a, r: 5 });
  },
  controls: [
    { title: 'Chord and tangent' },
    { key: 't', label: 'Time t (s)', min: 0, max: T - 0.05, step: 0.05 },
    { key: 'dt', label: 'Time gap Δt (s)', min: 0.05, max: 2, step: 0.05 },
    { readout: [
      ['Chord direction', (s) => { const p = pos(V, TH, s.t); const q = pos(V, TH, Math.min(s.t + s.dt, T)); return `${fixed(ang(q[0] - p[0], q[1] - p[1]), 1)}°`; }],
      ['Velocity direction', (s) => `${fixed(ang(...vel(V, TH, s.t)), 1)}°`],
      ['Speed', (s) => `${fixed(Math.hypot(...vel(V, TH, s.t)), 1)} m/s`],
    ] },
  ],
  tex: () => `\\vec v=\\lim_{\\Delta t\\to0}\\dfrac{\\Delta\\vec r}{\\Delta t}`,
});
