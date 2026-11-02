import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { BASIC, TAU, rad, windowFacts } from './_inverses-math.js';

const state = { fn: 'sin', a: -90, w: 180 };
const facts = () => windowFacts(state.fn, rad(state.a), rad(state.w));
const good = () => { const f = facts(); return f.oneToOne && f.covers && f.unbroken; };
const yOf = () => (state.fn === 'tan' ? 4 : 1.5);

createTool({
  state,
  label: 'A graph of sine, cosine or tangent with a movable window along the x axis. The window turns blue if it passes every test for an inverse: one-to-one, covers all outputs, and unbroken. Otherwise it is coral, and the tests it fails are marked in the panel.',
  setup: (stage, c) => createPlot(stage, { x: [-TAU, TAU], y: [-1.5, 1.5], c, ticks: 'pi', pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-TAU, TAU], [-yOf(), yOf()]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const f = BASIC[state.fn];
    plot.fn(f, { color: c.grid, width: 3 });
    const a = rad(state.a);
    const b = rad(state.a + state.w);
    plot.fn(f, { color: good() ? c.b : c.a, width: 6, domain: [a, b] });
    plot.segment(a, -yOf(), a, yOf(), { color: good() ? c.b : c.a, width: 1, dash: [4, 4] });
    plot.segment(b, -yOf(), b, yOf(), { color: good() ? c.b : c.a, width: 1, dash: [4, 4] });
    plot.segment(0, 0, Math.PI / 2, 0, { color: c.c, width: 6 });
  },
  controls: [
    { title: 'Slide a window along the graph' },
    { key: 'fn', label: 'Function', options: [['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan']] },
    { key: 'a', label: 'Window starts at', min: -360, max: 360, step: 15, format: (n) => `${n}°` },
    { key: 'w', label: 'Window width', min: 15, max: 360, step: 15, format: (n) => `${n}°` },
    { readout: [
      ['One-to-one?', () => ({ text: facts().oneToOne ? 'Yes' : 'No', good: facts().oneToOne })],
      ['Every output?', () => ({ text: facts().covers ? 'Yes' : 'No', good: facts().covers })],
      ['Unbroken?', () => ({ text: facts().unbroken ? 'Yes' : 'No', good: facts().unbroken })],
      ['Holds 0 to π/2 (green)?', () => ({ text: facts().contains ? 'Yes' : 'No', good: facts().contains })],
    ] },
  ],
  tex: (s) => `${s.fn}^{-1}\\ \\text{uses}\\ \\left[${s.a}^\\circ,\\,${s.a + s.w}^\\circ\\right]`,
});
