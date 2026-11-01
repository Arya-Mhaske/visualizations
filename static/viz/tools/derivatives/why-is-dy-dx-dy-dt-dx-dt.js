import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// x = t^2 - 3t, y = t^3 - 3t
const X = (t) => t * t - 3 * t;
const Y = (t) => t ** 3 - 3 * t;
const dX = (t) => 2 * t - 3;
const dY = (t) => 3 * t * t - 3;
const state = { t: 2.4, dt: 0.4 };
const T0 = -2;
const T1 = 2.8;

createTool({
  state,
  label: 'A point moving along the curve x equals t squared minus 3t, y equals t cubed minus 3t. Two arrows show how fast x and y are changing. A small time step dt gives a little run and a little rise, and their ratio, the slope of the chord, matches the ratio of the two arrows because dt cancels.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 11], y: [-4, 15], c }),
  draw(ctx, stage, c, plot) {
    const { t, dt } = state;
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const pieces = [];
    for (let i = 0; i <= 200; i++) pieces.push([X(T0 + ((T1 - T0) * i) / 200), Y(T0 + ((T1 - T0) * i) / 200)]);
    for (let i = 1; i < pieces.length; i++) plot.segment(...pieces[i - 1], ...pieces[i], { color: c.ink, width: 3 });
    const k = 0.5;
    plot.segment(X(t), Y(t), X(t) + dX(t) * k, Y(t), { color: c.a, width: 5 });
    plot.segment(X(t), Y(t), X(t), Y(t) + dY(t) * k * 0.5, { color: c.b, width: 5 });
    plot.segment(X(t), Y(t), X(t + dt), Y(t + dt), { color: c.c, width: 3, dash: [5, 4] });
    plot.segment(X(t), Y(t), X(t + dt), Y(t), { color: c.a, width: 2 });
    plot.segment(X(t + dt), Y(t), X(t + dt), Y(t + dt), { color: c.b, width: 2 });
    plot.point(X(t), Y(t), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Run the point' },
    { key: 't', label: 'Time t', min: -2, max: 2.6, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'dt', label: 'Time step dt', min: 0.02, max: 1, step: 0.02, format: (v) => fixed(v, 2) },
    { readout: [
      ['dx/dt (coral)', (s) => fixed(dX(s.t), 3)],
      ['dy/dt (blue)', (s) => fixed(dY(s.t), 3)],
      ['(dy/dt) ÷ (dx/dt)', (s) => (Math.abs(dX(s.t)) < 1e-9 ? 'vertical' : fixed(dY(s.t) / dX(s.t), 4))],
      ['Chord slope Δy/Δx', (s) => (Math.abs(X(s.t + s.dt) - X(s.t)) < 1e-9 ? 'undefined' : fixed((Y(s.t + s.dt) - Y(s.t)) / (X(s.t + s.dt) - X(s.t)), 4))],
    ] },
  ],
  tex: (s) => `\\dfrac{dy}{dx}=\\dfrac{y'(t)\\,dt}{x'(t)\\,dt}=\\dfrac{${fixed(dY(s.t), 2)}}{${fixed(dX(s.t), 2)}}`,
});
