import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { solve, lotkaVolterra } from './_de-math.js';

const state = { view: 'phase', a: 1, b: 0.1, c: 1.5, d: 0.075, x0: 30, y0: 10 };
const rows = (s) => solve(lotkaVolterra(s.a, s.b, s.c, s.d), [s.x0, s.y0], 0, 40, 4000);
const eq = (s) => [s.c / s.d, s.a / s.b];

createTool({
  state,
  label: 'A Lotka-Volterra explorer. Sliders set the prey birth rate, the rate at which meetings kill prey, the predator death rate and the rate at which meetings feed predators. A phase plot shows the loop and a time plot shows both populations. The balance point is c over d prey and a over b predators.',
  setup: (stage, c) => createPlot(stage, { x: [0, 90], y: [0, 50], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const R = rows(state);
    const E = eq(state);
    const maxX = Math.max(...R.map((r) => r[1]), E[0] * 1.2) * 1.1;
    const maxY = Math.max(...R.map((r) => r[2]), E[1] * 1.2) * 1.1;
    if (state.view === 'phase') {
      plot.setRange([0, maxX], [0, maxY]);
      plot.axes({ xLabel: 'prey', yLabel: 'predators' });
      plot.segment(E[0], 0, E[0], maxY, { color: c.grid, width: 2, dash: [6, 5] });
      plot.segment(0, E[1], maxX, E[1], { color: c.grid, width: 2, dash: [6, 5] });
      for (let k = 1; k < R.length; k++) plot.segment(R[k - 1][1], R[k - 1][2], R[k][1], R[k][2], { color: c.a, width: 3 });
      plot.point(E[0], E[1], { fill: c.fillC, r: 7 });
      plot.point(state.x0, state.y0, { fill: c.fillY, r: 8 });
    } else {
      const top = Math.max(maxX, maxY);
      plot.setRange([0, 40], [0, top]);
      plot.axes({ xLabel: 'time', yLabel: 'population' });
      for (let k = 1; k < R.length; k += 2) {
        plot.segment(R[k - 1][0], R[k - 1][1], R[k][0], R[k][1], { color: c.b, width: 3 });
        plot.segment(R[k - 1][0], R[k - 1][2], R[k][0], R[k][2], { color: c.a, width: 3 });
      }
    }
  },
  controls: [
    { title: 'Change the rates' },
    { key: 'view', label: 'Show', options: [['phase', 'Phase plane'], ['time', 'Over time']] },
    { key: 'a', label: 'Prey birth rate, a', min: 0.5, max: 2, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'Prey lost per meeting, b', min: 0.05, max: 0.2, step: 0.01, format: (v) => fixed(v, 2) },
    { key: 'c', label: 'Predator death rate, c', min: 0.5, max: 2.5, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'd', label: 'Predator gain per meeting, d', min: 0.02, max: 0.15, step: 0.005, format: (v) => fixed(v, 3) },
    { key: 'x0', label: 'Prey at the start', min: 5, max: 60, step: 1 },
    { key: 'y0', label: 'Predators at the start', min: 2, max: 40, step: 1 },
    { readout: [
      ['Balance: prey = c/d', (s) => fixed(eq(s)[0], 1)],
      ['Balance: predators = a/b', (s) => fixed(eq(s)[1], 1)],
      ['Small-loop period', (s) => `${fixed((2 * Math.PI) / Math.sqrt(s.a * s.c), 2)} time units`],
    ] },
  ],
  tex: (s) => String.raw`\left(\dfrac cd,\dfrac ab\right)=(${fixed(eq(s)[0], 1)},\ ${fixed(eq(s)[1], 1)})`,
});
