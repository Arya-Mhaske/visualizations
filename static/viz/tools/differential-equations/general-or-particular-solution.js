import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, tangent } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

// first:  y' = 2y        general y = C e^{2x},               needs y(0)
// second: y'' = -4y      general y = A cos 2x + B sin 2x,    needs y(0) and y'(0): A = y(0), B = y'(0)/2
const MODES = {
  first: { name: "One constant: y′ = 2y", order: 1, y: (s, x) => s.y0 * Math.exp(2 * x), ghosts: [-3, -2, -1, 1, 2, 3].map((C) => (x) => C * Math.exp(2 * x)),
    check: (s) => deriv((x) => MODES.first.y(s, x), 0.5) - 2 * MODES.first.y(s, 0.5) },
  second: { name: "Two constants: y″ = −4y", order: 2, y: (s, x) => s.y0 * Math.cos(2 * x) + (s.v0 / 2) * Math.sin(2 * x),
    ghosts: [[-2, 1], [2, -1], [0, 2], [1, 1], [-1, -2], [2, 2], [-3, 0]].map(([A, B]) => (x) => A * Math.cos(2 * x) + B * Math.sin(2 * x)),
    check: (s) => deriv((x) => deriv((t) => MODES.second.y(s, t), x, 1e-3), 0.5, 1e-3) + 4 * MODES.second.y(s, 0.5) },
};
const state = { mode: 'second', y0: 1, v0: 2 };

createTool({
  state,
  label: 'Many solution curves of one differential equation, drawn faintly, and one highlighted curve picked out by the starting conditions. A first-order equation needs one condition, the starting value. A second-order equation needs two, the starting value and the starting slope.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-5, 5], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const mode = MODES[state.mode];
    plot.axes();
    for (const g of mode.ghosts) plot.fn(g, { color: c.grid, width: 2 });
    plot.fn((x) => mode.y(state, x), { color: c.a, width: 5 });
    plot.point(0, state.y0, { fill: c.fillY, r: 8 });
    if (mode.order === 2) tangent(plot, 0, state.y0, state.v0, 0.6, { color: c.ink, width: 3 });
  },
  controls: [
    { title: 'Pick one curve from the family' },
    { key: 'mode', label: 'Equation', options: Object.entries(MODES).map(([key, v]) => [key, v.name]) },
    { key: 'y0', label: 'Starting value y(0)', min: -3, max: 3, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'v0', label: 'Starting slope y′(0)', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Constants to fix', (s) => String(MODES[s.mode].order)],
      ['Constants found', (s) => (s.mode === 'first' ? `C = ${fixed(s.y0, 2)}` : `A = ${fixed(s.y0, 2)}, B = ${fixed(s.v0 / 2, 2)}`)],
      ['Equation holds at x = 0.5?', (s) => ({ text: Math.abs(MODES[s.mode].check(s)) < 1e-3 ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: (s) => (s.mode === 'first'
    ? `y=Ce^{2x},\\ y(0)=${fixed(s.y0, 2)}\\Rightarrow C=${fixed(s.y0, 2)}`
    : `y=A\\cos2x+B\\sin2x,\\ y(0)=${fixed(s.y0, 2)},\\ y'(0)=${fixed(s.v0, 1)}\\Rightarrow A=${fixed(s.y0, 2)},\\ B=${fixed(s.v0 / 2, 2)}`),
  onChange: (s) => show(s),
});

const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length > 2) fields[2].hidden = s.mode === 'first';
}
show(state);
