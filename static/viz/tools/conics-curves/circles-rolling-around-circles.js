import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { cusps, roller, turns } from './_rotation-math.js';
import { curve, fitEqual, trace } from './_conics-view.js';

const state = { outside: true, R: 3, r: 1, roll: 120 };
const rad = (d) => (d * Math.PI) / 180;
const TAU = Math.PI * 2;
const full = (s = state) => TAU * turns(s.R, s.r); // angle round the fixed circle before the curve closes
const theta = (s = state) => rad(s.roll) * (turns(s.R, s.r));
const centre = (s, th) => {
  const m = s.outside ? s.R + s.r : s.R - s.r;
  return [m * Math.cos(th), m * Math.sin(th)];
};

createTool({
  state,
  label: 'A small circle rolling without slipping around the outside of a large fixed circle, or around the inside of it. A point on the rim of the rolling circle traces a curve with sharp points called cusps. The shape depends only on the ratio of the two radii. Rolling outside gives an epicycloid and rolling inside a hypocycloid. The whole curve is drawn faintly, and the part traced so far is bold.',
  setup: (stage, c) => createPlot(stage, { x: [-9, 9], y: [-9, 9], c, pad: 12 }),
  draw(ctx, stage, c, plot) {
    const reach = state.outside ? state.R + 2 * state.r : state.R;
    fitEqual(plot, stage, 0, 0, reach * 1.12);
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    curve(plot, trace((u) => [state.R * Math.cos(u), state.R * Math.sin(u)], 0, TAU, 200), { color: c.ink, width: 3 });
    const f = (u) => roller(state.R, state.r, u, state.outside);
    curve(plot, trace(f, 0, full(), 800), { color: c.grid, width: 2 });
    const th = theta();
    curve(plot, trace(f, 0, th, Math.max(2, Math.round(th * 40))), { color: c.a, width: 4 });
    const C = centre(state, th);
    curve(plot, trace((u) => [C[0] + state.r * Math.cos(u), C[1] + state.r * Math.sin(u)], 0, TAU, 80), { color: c.b, width: 3 });
    const P = f(th);
    plot.segment(C[0], C[1], P[0], P[1], { color: c.b, width: 2 });
    plot.point(C[0], C[1], { fill: c.fillY, r: 4 });
    plot.point(P[0], P[1], { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Roll one circle round another' },
    { key: 'outside', label: 'Roll', options: [[true, 'Outside (epicycloid)'], [false, 'Inside (hypocycloid)']] },
    { key: 'R', label: 'Fixed circle radius, R', min: 2, max: 8, step: 1 },
    { key: 'r', label: 'Rolling circle radius, r', min: 1, max: 4, step: 1 },
    { key: 'roll', label: 'How far it has rolled', min: 0, max: 360, step: 2, format: (v) => `${Math.round(v / 3.6)}%` },
    { readout: [
      ['Cusps', (s) => (s.R === s.r && !s.outside ? 'the point stays put' : `${cusps(s.R, s.r)}`)],
      ['Trips round to close', (s) => `${turns(s.R, s.r)}`],
      ['R ÷ r', (s) => fixed(s.R / s.r, 3)],
    ] },
  ],
  onChange(s) { if (!s.outside && s.r > s.R) s.r = s.R; },
  tex: (s) => (s.outside
    ? `x=(R+r)\\cos\\theta-r\\cos\\tfrac{R+r}{r}\\theta,\\ y=(R+r)\\sin\\theta-r\\sin\\tfrac{R+r}{r}\\theta`
    : `x=(R-r)\\cos\\theta+r\\cos\\tfrac{R-r}{r}\\theta,\\ y=(R-r)\\sin\\theta-r\\sin\\tfrac{R-r}{r}\\theta`),
});
