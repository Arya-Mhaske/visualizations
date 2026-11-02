import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FRACS, survives } from './_linear-equations-math.js';

const state = { eq: 'b', x: 1 };
const F = (s) => FRACS[s.eq];
const num = (v) => (Number.isFinite(v) ? String(Number(v.toFixed(3))) : 'undefined');

createTool({
  state,
  label: 'The two sides of an equation with fractions drawn as curves. Candidate answers from the cleared equation are marked on the axis: green if both sides agree there, coral if the original is undefined there.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 6], y: [-8, 8], c }),
  draw(ctx, stage, c, plot) {
    const f = F(state);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(f.L, { color: c.b });
    plot.fn(f.R, { color: c.a, dash: [7, 5] });
    f.roots.forEach((r) => plot.point(r, 0, { fill: survives(f, r) ? c.c : c.a, r: 7 }));
    const y = f.L(state.x);
    if (Number.isFinite(y) && Math.abs(y) < 8) plot.point(state.x, y, { fill: c.ink, r: 5 });
  },
  controls: [
    { title: 'Clear the fractions' },
    { key: 'eq', label: 'Equation', options: [['a', 'Equation 1'], ['b', 'Equation 2'], ['c', 'Equation 3']] },
    { key: 'x', label: 'Probe x', min: -4, max: 5, step: 0.5 },
    { readout: [
      ['Multiplier', (s) => F(s).mult],
      ['Cleared equation', (s) => F(s).cleared],
      ['Candidates', (s) => F(s).roots.map((r) => `${r}${survives(F(s), r) ? ' ✓' : ' ✗'}`).join('  ')],
      ['Left at probe', (s) => num(F(s).L(s.x))],
      ['Right at probe', (s) => num(F(s).R(s.x))],
      ['Multiplier at probe', (s) => num(F(s).mf(s.x))],
    ] },
  ],
  tex: (s) => F(s).tex,
});
