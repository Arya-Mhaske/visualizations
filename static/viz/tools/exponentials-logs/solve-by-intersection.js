import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { crossings } from './_exp-log-math.js';

const EQS = [
  { tex: '2^x=12', f: (x) => 2 ** x, g: () => 12, view: [-2, 6, -2, 20] },
  { tex: '\\ln x=2-x', f: (x) => (x > 0 ? Math.log(x) : NaN), g: (x) => 2 - x, view: [-2, 6, -4, 5] },
  { tex: 'e^x=4x', f: (x) => Math.exp(x), g: (x) => 4 * x, view: [-2, 6, -4, 20] },
  { tex: '2^x=x^2', f: (x) => 2 ** x, g: (x) => x * x, view: [-2, 6, -1, 22] },
];
const state = { e: 0, x: 1 };
const solutions = (s) => crossings((x) => EQS[s.e].f(x) - EQS[s.e].g(x), -2, 6);
const gap = (s) => EQS[s.e].f(s.x) - EQS[s.e].g(s.x);

createTool({
  state,
  label: 'The two sides of an equation graphed together. A vertical probe line that you slide shows the height of each side and the gap between them. The solutions are the places where the curves cross, where the gap is zero. A button jumps the probe to the nearest crossing.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 6], y: [-4, 20], c }),
  draw(ctx, stage, c, plot) {
    const E = EQS[state.e];
    plot.setRange([E.view[0], E.view[1]], [E.view[2], E.view[3]]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(E.f, { color: c.a, width: 4 });
    plot.fn(E.g, { color: c.b, width: 4 });
    for (const r of solutions(state)) plot.point(r, E.f(r), { fill: c.fillC, r: 7 });
    plot.segment(state.x, E.view[2], state.x, E.view[3], { color: c.ink, width: 2, dash: [5, 5] });
    if (Number.isFinite(E.f(state.x))) plot.point(state.x, E.f(state.x), { fill: c.a, r: 7 });
    plot.point(state.x, E.g(state.x), { fill: c.b, r: 7 });
  },
  controls: (tool) => [
    { title: 'Slide the probe to a crossing' },
    { key: 'e', label: 'Equation', options: [[0, '2ˣ = 12'], [1, 'ln x = 2 − x'], [2, 'eˣ = 4x'], [3, '2ˣ = x²']] },
    { key: 'x', label: 'Probe x', min: -2, max: 6, step: 0.01, format: (v) => fixed(v, 2) },
    { button: 'Snap to nearest solution', onClick: () => {
      const list = solutions(state);
      state.x = list.reduce((best, r) => (Math.abs(r - state.x) < Math.abs(best - state.x) ? r : best), list[0]);
      tool.update();
    } },
    { readout: [
      ['Left side', (s) => (Number.isFinite(EQS[s.e].f(s.x)) ? fixed(EQS[s.e].f(s.x), 3) : 'undefined')],
      ['Right side', (s) => fixed(EQS[s.e].g(s.x), 3)],
      ['Gap', (s) => (Number.isFinite(gap(s)) ? { text: fixed(gap(s), 3), good: Math.abs(gap(s)) < 0.01 } : 'undefined')],
      ['Solutions', (s) => solutions(s).map((r) => fixed(r, 3)).join(', ')],
    ] },
  ],
  tex: (s) => `${EQS[s.e].tex}\\ :\\ \\ x\\approx ${solutions(s).map((r) => fixed(r, 3)).join(',\\ ')}`,
});
