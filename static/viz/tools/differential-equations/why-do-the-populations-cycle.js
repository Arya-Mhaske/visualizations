import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { solve, lotkaVolterra, lvInvariant } from './_de-math.js';

// Made-up rates: prey grow at 1.0, predators die at 1.5, meetings cost prey 0.1 and feed predators 0.075.
const [a, b, c0, d] = [1, 0.1, 1.5, 0.075];
const EQ = [c0 / d, a / b];
const state = { x0: 40, y0: 10 };
const orbit = (s) => solve(lotkaVolterra(a, b, c0, d), [s.x0, s.y0], 0, 40, 4000);
const drift = (s) => {
  const v0 = lvInvariant(a, b, c0, d, s.x0, s.y0);
  return Math.max(...orbit(s).map(([, x, y]) => Math.abs(lvInvariant(a, b, c0, d, x, y) - v0)));
};

createTool({
  state,
  label: 'The phase plane of a predator and prey model, with prey numbers along the bottom and predator numbers up the side. Starting from any point, the populations trace a closed loop and return to where they began. The dashed lines are where one population is momentarily steady, and they cross at the balance point.',
  setup: (stage, c) => createPlot(stage, { x: [0, 90], y: [0, 50], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'prey', yLabel: 'predators' });
    plot.segment(EQ[0], 0, EQ[0], 50, { color: c.grid, width: 2, dash: [6, 5] });
    plot.segment(0, EQ[1], 90, EQ[1], { color: c.grid, width: 2, dash: [6, 5] });
    const rows = orbit(state);
    for (let k = 1; k < rows.length; k++) plot.segment(rows[k - 1][1], rows[k - 1][2], rows[k][1], rows[k][2], { color: c.a, width: 3 });
    plot.point(EQ[0], EQ[1], { fill: c.fillC, r: 7 });
    plot.point(state.x0, state.y0, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Choose a starting point' },
    { key: 'x0', label: 'Prey at the start', min: 5, max: 80, step: 1 },
    { key: 'y0', label: 'Predators at the start', min: 2, max: 45, step: 1 },
    { readout: [
      ['Balance point', () => `(${fixed(EQ[0], 0)}, ${fixed(EQ[1], 0)})`],
      ['Prey range', (s) => { const xs = orbit(s).map((r) => r[1]); return `${fixed(Math.min(...xs), 1)} to ${fixed(Math.max(...xs), 1)}`; }],
      ['Predator range', (s) => { const ys = orbit(s).map((r) => r[2]); return `${fixed(Math.min(...ys), 1)} to ${fixed(Math.max(...ys), 1)}`; }],
      ['Drift of the invariant', (s) => drift(s).toExponential(1)],
    ] },
  ],
  tex: () => String.raw`dx/dt=ax-bxy,\ \ dy/dt=-cy+dxy\ \Rightarrow\ dx-c\ln x+by-a\ln y=\text{constant}`,
});
