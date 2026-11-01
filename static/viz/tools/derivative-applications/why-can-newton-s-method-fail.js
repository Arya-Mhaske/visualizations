import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const CASES = {
  cbrt: { name: 'Bad start: ∛x', f: Math.cbrt, d: (x) => 1 / (3 * Math.cbrt(x * x)), x0: 1, view: [[-5, 5], [-2.2, 2.2]], note: 'every step doubles the distance from 0' },
  flat: { name: 'Flat tangent: x² − 2', f: (x) => x * x - 2, d: (x) => 2 * x, x0: 0.15, view: [[-1, 14], [-4, 12]], note: 'a nearly flat tangent throws the guess far away' },
  cycle: { name: 'Two-cycle: x³ − 2x + 2', f: (x) => x ** 3 - 2 * x + 2, d: (x) => 3 * x * x - 2, x0: 0, view: [[-2.5, 2.5], [-3, 6]], note: 'the guesses bounce between 0 and 1 forever' },
};
const state = { c: 'cbrt', x0: 1, n: 4 };
let lastCase = 'cbrt';
function path(s) {
  const { f, d } = CASES[s.c];
  const xs = [s.x0];
  for (let i = 0; i < 12; i++) {
    const x = xs[i];
    const step = d(x);
    xs.push(Number.isFinite(step) && Math.abs(step) > 1e-12 ? x - f(x) / step : NaN);
    if (!Number.isFinite(xs[i + 1])) break;
  }
  return xs;
}

createTool({
  state,
  label: 'Newton method drawn as a staircase of tangent lines on three troublesome functions. In the first the guesses run away from the root, in the second a nearly flat tangent flings the guess far off, and in the third the guesses cycle between two values and never settle.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    const C = CASES[state.c];
    plot.setRange(C.view[0], C.view[1]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(C.f, { color: c.ink, width: 4 });
    const xs = path(state);
    for (let i = 0; i < Math.min(state.n, xs.length - 1); i++) {
      const x = xs[i];
      const next = xs[i + 1];
      if (!Number.isFinite(next)) break;
      plot.segment(x, 0, x, C.f(x), { color: c.grid, width: 2, dash: [3, 3] });
      plot.segment(x, C.f(x), next, 0, { color: c.a, width: 3 });
      plot.point(next, 0, { fill: c.fillY, r: 5 });
    }
    plot.point(state.x0, 0, { fill: c.b, r: 7 });
  },
  controls: [
    { title: 'Start Newton\'s method' },
    { key: 'c', label: 'Function', options: Object.entries(CASES).map(([k, v]) => [k, v.name]) },
    { key: 'x0', label: 'Start x₀', min: -2, max: 2, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'n', label: 'Steps', min: 0, max: 12, step: 1 },
    { readout: [
      ['Latest guess', (s) => { const xs = path(s); const x = xs[Math.min(s.n, xs.length - 1)]; return Number.isFinite(x) ? fixed(x, 4) : 'undefined'; }],
      ['What goes wrong', (s) => CASES[s.c].note],
    ] },
  ],
  tex: (s) => { const xs = path(s); return `x_0=${fixed(xs[0], 2)},\\ x_1=${Number.isFinite(xs[1]) ? fixed(xs[1], 3) : '?'},\\ x_2=${Number.isFinite(xs[2]) ? fixed(xs[2], 3) : '?'}`; },
  onChange: (s) => {
    if (s.c !== lastCase) { lastCase = s.c; s.x0 = CASES[s.c].x0; }
  },
});
