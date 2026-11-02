import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { fixed, piFrac } from '../../lib/format.js';
import { TAU, arcsinSin, sinArcsin } from './_inverses-math.js';

const state = { which: 'inner', x: 2.4 };
const out = (x) => (state.which === 'inner' ? arcsinSin(x) : sinArcsin(x));
const text = (v) => (Number.isFinite(v) ? (piFrac(v) ?? fixed(v, 3)) : 'undefined');

createTool({
  state,
  label: 'The graph of a chain of two machines. In one setting, sine of inverse sine is the straight line y = x, but only between minus one and one. In the other, inverse sine of sine folds back into a zigzag between minus pi over 2 and pi over 2, leaving the line y = x after x passes pi over 2.',
  setup: (stage, c) => createPlot(stage, { x: [-TAU, TAU], y: [-2.2, 2.2], c, ticks: 'pi', pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => x, { color: c.grid, width: 2, dash: [6, 5] });
    if (state.which === 'inner') {
      plot.fn(arcsinSin, { color: c.a, width: 4 });
      plot.segment(-Math.PI / 2, -2.2, -Math.PI / 2, 2.2, { color: c.b, width: 1, dash: [4, 4] });
      plot.segment(Math.PI / 2, -2.2, Math.PI / 2, 2.2, { color: c.b, width: 1, dash: [4, 4] });
    } else {
      plot.fn(sinArcsin, { color: c.a, width: 5, domain: [-1, 1] });
    }
    plot.segment(state.x, -2.2, state.x, 2.2, { color: c.grid, width: 1 });
    if (Number.isFinite(out(state.x))) plot.point(state.x, out(state.x), { fill: c.a });
    else plot.text('x is outside −1 to 1: no output', state.x > 0 ? state.x - 3 : state.x + 3, 1.8, { size: 11, patch: false });
  },
  controls: [
    { title: 'Chain the two machines' },
    { key: 'which', label: 'Machines', options: [['inner', 'sin⁻¹(sin x)'], ['outer', 'sin(sin⁻¹ x)']] },
    { key: 'x', label: 'Input, x', min: -6.28, max: 6.28, step: 0.04, format: (n) => fixed(n, 2) },
    { readout: [
      ['Output', () => text(out(state.x))],
      ['Output = input?', () => { const v = out(state.x); return Number.isFinite(v) ? { text: Math.abs(v - state.x) < 1e-9 ? 'Yes' : 'No', good: Math.abs(v - state.x) < 1e-9 } : 'No output'; }],
      ['Inside the safe range?', () => (state.which === 'inner' ? (Math.abs(state.x) <= Math.PI / 2 ? 'Yes: −π/2 to π/2' : 'No') : (Math.abs(state.x) <= 1 ? 'Yes: −1 to 1' : 'No'))],
    ] },
  ],
  tex: (s) => (s.which === 'inner' ? `\\sin^{-1}(\\sin ${fixed(s.x, 2)})=${fixed(arcsinSin(s.x), 3)}` : `\\sin(\\sin^{-1} ${fixed(s.x, 2)})=${Number.isFinite(sinArcsin(s.x)) ? fixed(sinArcsin(s.x), 3) : '\\text{undefined}'}`),
});
void line;
