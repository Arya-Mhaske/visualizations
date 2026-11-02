import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { tangent } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

// Glide path y(x) = h(3s² − 2s³), s = x/D, x = distance from the runway. y = h at x = D, y = 0 at x = 0,
// and the slope is 0 at both ends. dy/dx = 6h s(1 − s)/D, largest (1.5 h/D) at the middle.
const LIMIT = 600; // comfortable descent rate in m/min (about 2000 ft/min)
const state = { h: 3, D: 40, v: 250, f: 50 };
const path = (s, x) => s.h * (3 * (x / s.D) ** 2 - 2 * (x / s.D) ** 3);
const slope = (s, x) => (6 * s.h * (x / s.D) * (1 - x / s.D)) / s.D;
const rate = (s, x) => slope(s, x) * (s.v / 60) * 1000; // m/min: dy/dt = dy/dx · dx/dt
const steepest = (s) => ((1.5 * s.h) / s.D) * (s.v / 60) * 1000;
const shortest = (s) => (s.h * s.v) / (60 * (LIMIT / 1000) / 1.5); // km

createTool({
  state,
  label: 'A smooth glide path from cruise height down to the runway, plotted as height against distance from the runway. The path is flat at both ends. A marker shows the plane, with its tangent. The descent rate in metres per minute is the slope of the path times the ground speed.',
  setup: (stage, c) => createPlot(stage, { x: [0, 65], y: [0, 4.5], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'distance (km)', yLabel: 'height (km)' });
    plot.fn((x) => path(state, x), { color: c.a, width: 4, domain: [0, state.D] });
    plot.segment(state.D, state.h, 65, state.h, { color: c.grid, width: 3, dash: [6, 5] });
    const x = state.D * (1 - state.f / 100);
    tangent(plot, x, path(state, x), slope(state, x), 4, { color: c.ink, width: 3 });
    plot.point(x, path(state, x), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Plan the descent' },
    { key: 'f', label: 'How far along the descent', min: 0, max: 100, step: 1, format: (n) => `${n}%` },
    { key: 'D', label: 'Start descent at', min: 10, max: 60, step: 5, format: (n) => `${n} km out` },
    { key: 'h', label: 'Cruise height', min: 1, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} km` },
    { key: 'v', label: 'Ground speed', min: 150, max: 350, step: 10, format: (n) => `${n} km/h` },
    { readout: [
      ['Slope dy/dx now', (s) => fixed(slope(s, s.D * (1 - s.f / 100)), 4)],
      ['Descent rate now', (s) => `${fixed(rate(s, s.D * (1 - s.f / 100)), 0)} m/min`],
      ['Steepest rate', (s) => ({ text: `${fixed(steepest(s), 0)} m/min`, good: steepest(s) <= LIMIT })],
      [`Start at least (limit ${LIMIT} m/min)`, (s) => `${fixed(shortest(s), 1)} km out`],
    ] },
  ],
  tex: (s) => `\\dfrac{dy}{dt}=\\dfrac{dy}{dx}\\cdot\\dfrac{dx}{dt}=${fixed(slope(s, s.D * (1 - s.f / 100)), 3)}\\times${fixed(s.v / 60, 2)}\\ \\text{km/min}`,
});
