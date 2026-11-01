import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { distanceSun, eccentricAnomaly, orbitPoint, speedRatio } from './_rotation-math.js';
import { curve, fitEqual, trace } from './_conics-view.js';

// a = 1, centre at the origin, the Sun at (e, 0). Mean anomaly M is proportional to time.
const state = { e: 0.6, time: 0.35, span: 12 };
const TAU = Math.PI * 2;
const E = (s = state) => eccentricAnomaly(s.time * TAU, s.e);
const wedge = (e, M0, M1) => {
  const pts = [[e, 0]];
  const [E0, E1] = [eccentricAnomaly(M0, e), eccentricAnomaly(M1, e)];
  for (let i = 0; i <= 24; i++) pts.push(orbitPoint(e, E0 + ((E1 - E0) * i) / 24));
  return pts;
};
const shoelace = (pts) => Math.abs(pts.reduce((sum, p, i) => { const q = pts[(i + 1) % pts.length]; return sum + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const area = (e, M0, M1) => shoelace(wedge(e, M0, M1));

createTool({
  state,
  label: 'An orbit with the Sun at one focus. Two wedges are swept out in equal times: a blue one at the planet\'s position and a coral reference one at perihelion, the nearest point. The wedges have different shapes, long and thin when far away and short and fat when close, but exactly the same area. So the planet must move faster when it is closer to the Sun.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 2], y: [-2, 2], c, pad: 12 }),
  draw(ctx, stage, c, plot) {
    fitEqual(plot, stage, 0, 0, 1.45);
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    const dt = TAU / state.span;
    const M = state.time * TAU;
    const ref = wedge(state.e, -dt / 2, dt / 2);
    const here = wedge(state.e, M, M + dt);
    poly(ctx, ref.map((p) => plot.toPx(...p)), { fill: c.fillA, stroke: c.ink, width: 2 });
    poly(ctx, here.map((p) => plot.toPx(...p)), { fill: c.fillB, stroke: c.ink, width: 2 });
    curve(plot, trace((t) => orbitPoint(state.e, t), 0, TAU, 240), { color: c.ink, width: 3 });
    plot.point(state.e, 0, { fill: c.fillY, r: 10 });
    const p = orbitPoint(state.e, E());
    plot.point(p[0], p[1], { fill: c.b, r: 8 });
  },
  controls: [
    { title: 'Run the orbit' },
    { key: 'time', label: 'Time through one orbit', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'e', label: 'Eccentricity, e', min: 0, max: 0.9, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'span', label: 'Each wedge is 1/n of the period, n', min: 6, max: 24, step: 2 },
    { readout: [
      ['Distance from the Sun', (s) => `${fixed(distanceSun(s.e, E(s)), 3)} a`],
      ['Speed now', (s) => `${fixed(speedRatio(s.e, E(s)), 3)} × circular speed`],
      ['Fastest ÷ slowest', (s) => fixed((1 + s.e) / (1 - s.e), 2)],
      ['Wedge areas', (s) => ({ text: `${fixed(area(s.e, -TAU / s.span / 2, TAU / s.span / 2), 3)} and ${fixed(area(s.e, s.time * TAU, s.time * TAU + TAU / s.span), 3)}`, good: Math.abs(area(s.e, -TAU / s.span / 2, TAU / s.span / 2) - area(s.e, s.time * TAU, s.time * TAU + TAU / s.span)) < 0.002 })],
    ] },
  ],
  tex: (s) => `v_{\\max}:v_{\\min}=\\dfrac{1+e}{1-e}=\\dfrac{1+${fixed(s.e, 2)}}{1-${fixed(s.e, 2)}}=${fixed((1 + s.e) / (1 - s.e), 2)}`,
});
