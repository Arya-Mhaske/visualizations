import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from '../integral-applications/_ia.js';
import { bestDelta } from './_eps.js';

// For f(x) = m(x − 1) + 3 the largest δ is exactly ε/m. A steeper graph leaves less room: δ shrinks.
const FN = {
  line: { name: 'straight line, slope m', f: (x, m) => m * (x - 1) + 3 },
  sine: { name: 'wave 3 + sin(m (x − 1))', f: (x, m) => 3 + Math.sin(m * (x - 1)) },
};
const state = { fn: 'line', m: 2, eps: 0.5 };
const F = () => (x) => FN[state.fn].f(x, state.m);
const delta = () => bestDelta(F(), 1, 3, state.eps, 3, 8000);

createTool({
  state,
  label: 'A graph through the point (1, 3) with a horizontal band of half-width epsilon. The green vertical window is the largest delta that keeps the graph in the band. A steeper graph gives a narrower window.',
  setup: (stage, c) => createPlot(stage, { x: [0, 2], y: [1, 5], c }),
  draw(ctx, stage, c, plot) {
    const d = delta();
    plot.setRange([0, 2], [3 - 1.6, 3 + 1.6]);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    plot.shade(() => 3 + state.eps, () => 3 - state.eps, 0, 2, c.fillB);
    plot.shade(() => 4.6, () => 1.4, 1 - d, 1 + d, c.fillC);
    plot.fn(F(), { color: c.ink, width: 3 });
    plot.point(1, 3, { fill: c.a });
  },
  controls: [
    { title: 'Steepen it, tighten it' },
    { key: 'fn', label: 'Graph', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'm', label: 'Steepness m', min: 0.5, max: 12, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'eps', label: 'Band half-width ε', min: 0.05, max: 1.5, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Largest δ', () => num(delta(), 4)],
      ['ε / m', () => num(state.eps / state.m, 4)],
      ['δ × m', () => num(delta() * state.m, 4)],
    ] },
  ],
  tex: (s) => `\\delta\\approx\\frac{\\varepsilon}{m}=\\frac{${s.eps.toFixed(2)}}{${s.m.toFixed(1)}}`,
});
