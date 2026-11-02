import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, num, tangent } from '../derivative-applications/_da.js';

// Three linked graphs: the slope of s is v, the slope of v is a.
const MOTIONS = {
  ball: { name: 'Ball thrown up', T: 4, s: (t) => 19.6 * t - 4.9 * t * t, v: (t) => 19.6 - 9.8 * t, a: () => -9.8, ys: [-5, 25], yv: [-22, 22], ya: [-14, 6], u: 'm' },
  car: { name: 'Car speeding up, then stopping', T: 3, s: (t) => 2 * t ** 3 - 0.5 * t ** 4 + 0 * t, v: (t) => 6 * t * t - 2 * t ** 3, a: (t) => 12 * t - 6 * t * t, ys: [-1, 15], yv: [-1, 10], ya: [-8, 8], u: 'm' },
  spring: { name: 'Mass on a spring', T: 6.3, s: (t) => 3 * Math.sin(t), v: (t) => 3 * Math.cos(t), a: (t) => -3 * Math.sin(t), ys: [-4, 4], yv: [-4, 4], ya: [-4, 4], u: 'cm' },
};
const state = { kind: 'ball', t: 1 };
const M = () => MOTIONS[state.kind];
const [b1, b2, b3] = boxes(3);

createTool({
  state,
  label: 'Three graphs one above the other: position, velocity and acceleration against time. A tangent on the position graph has the slope shown by the velocity graph, and a tangent on the velocity graph has the slope shown by the acceleration graph.',
  setup: (stage, c) => ({
    s: createPlot(stage, { x: [0, 4], y: [-5, 25], c, box: b1 }),
    v: createPlot(stage, { x: [0, 4], y: [-22, 22], c, box: b2 }),
    a: createPlot(stage, { x: [0, 4], y: [-14, 6], c, box: b3 }),
  }),
  draw(ctx, stage, c, { s, v, a }) {
    const m = M();
    const t = Math.min(state.t, m.T);
    s.setRange([0, m.T], m.ys); v.setRange([0, m.T], m.yv); a.setRange([0, m.T], m.ya);
    s.axes({ xLabel: 't (s)', yLabel: 's' }); v.axes({ xLabel: 't (s)', yLabel: 'v' }); a.axes({ xLabel: 't (s)', yLabel: 'a' });
    s.fn(m.s, { color: c.ink, width: 3 });
    v.fn(m.v, { color: c.b, width: 3 });
    a.fn(m.a, { color: c.d, width: 3 });
    const h = m.T * 0.08;
    tangent(s, t, m.s(t), m.v(t), h, c.a, 3);
    tangent(v, t, m.v(t), m.a(t), h, c.a, 3);
    s.point(t, m.s(t), { fill: c.a }); v.point(t, m.v(t), { fill: c.a }); a.point(t, m.a(t), { fill: c.a });
  },
  controls: [
    { title: 'Move along the motion' },
    { key: 'kind', label: 'Motion', options: Object.entries(MOTIONS).map(([k, v]) => [k, v.name]) },
    { key: 't', label: 'Time t', min: 0, max: 6.3, step: 0.05, format: (v) => `${v.toFixed(2)} s` },
    { readout: [
      ['Position s', () => num(M().s(Math.min(state.t, M().T)), 3)],
      ['Slope of s = velocity v', () => num(M().v(Math.min(state.t, M().T)), 3)],
      ['Slope of v = acceleration a', () => num(M().a(Math.min(state.t, M().T)), 3)],
    ] },
  ],
  tex: () => 'v=\\frac{ds}{dt},\\qquad a=\\frac{dv}{dt}=\\frac{d^2s}{dt^2}',
});
