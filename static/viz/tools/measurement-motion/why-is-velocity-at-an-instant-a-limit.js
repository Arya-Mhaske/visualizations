import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { centredVelocity, cubeV, cubeX } from './_motion-in-a-straight-line-math.js';

const T = 4;
const state = { power: 0 };                         // Δt = 2 × 10^power runs from 2 s down to 0.01 s
const dt = (s) => 2 * 10 ** s.power;
const slope = (s) => centredVelocity(T, dt(s));

createTool({
  state,
  label: 'Position against time for x = 0.08 t cubed. A chord across the interval turns into the tangent at t = 4 s as the interval shrinks.',
  setup: (stage, c) => createPlot(stage, { x: [0, 7], y: [0, 20], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    plot.fn(cubeX, { color: c.ink });
    const [t1, t2] = [T - dt(state) / 2, T + dt(state) / 2];
    const line = (t) => cubeX(T) + cubeV(T) * (t - T);
    plot.fn(line, { color: c.c, width: 2, dash: [6, 5] });
    const chord = (t) => cubeX(t1) + slope(state) * (t - t1);
    plot.fn(chord, { color: c.a, width: 3 });
    plot.point(t1, cubeX(t1), { r: 6 });
    plot.point(t2, cubeX(t2), { r: 6 });
    plot.point(T, cubeX(T), { fill: c.c, r: 5 });
  },
  controls: [
    { title: 'Shrink the interval' },
    { key: 'power', label: 'Δt', min: -2.301, max: 0, step: 0.02, format: (v) => `${fixed(2 * 10 ** v, 2)} s` },
    { readout: [
      ['t₁', (s) => `${fixed(T - dt(s) / 2, 3)} s`],
      ['t₂', (s) => `${fixed(T + dt(s) / 2, 3)} s`],
      ['Δx', (s) => `${fixed(cubeX(T + dt(s) / 2) - cubeX(T - dt(s) / 2), 3)} m`],
      ['Δx/Δt', (s) => `${fixed(slope(s), 3)} m/s`],
      ['Limit, dx/dt', () => `${fixed(cubeV(T), 2)} m/s`],
    ] },
  ],
  tex: (s) => `v = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} \\approx \\frac{${fixed(cubeX(T + dt(s) / 2) - cubeX(T - dt(s) / 2), 3)}}{${fixed(dt(s), 2)}} = ${fixed(slope(s), 3)}\\ \\text{m/s}`,
});
