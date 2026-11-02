import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { stackBoxes } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

// Each model says: the rate of change is a function of the present state. The exact solution gives the top graph.
//   rule(k, y) is the rate; sol(k, y0, t) the state; lo/hi the state range to draw the rule over.
const MODELS = {
  population: { name: 'Population', label: 'population P', rateName: 'dP/dt', rule: (k, y) => k * y, sol: (k, y0, t) => y0 * Math.exp(k * t), tex: "P'=kP" },
  cooling: { name: 'Cooling tea', label: 'temperature T (°C)', rateName: 'dT/dt', rule: (k, y) => -k * (y - 20), sol: (k, y0, t) => 20 + (y0 - 20) * Math.exp(-k * t), tex: "T'=-k(T-20)" },
  spring: { name: 'Spring', label: 'displacement x', rateName: 'd²x/dt²', rule: (k, y) => -k * y, sol: (k, y0, t) => y0 * Math.cos(Math.sqrt(k) * t), tex: "x''=-k\\,x" },
};
const state = { model: 'population', k: 0.2, y0: 50, t: 4 };
const T_END = 10;

function range(s) {
  const m = MODELS[s.model];
  const ys = Array.from({ length: 101 }, (_, i) => m.sol(s.k, s.y0, (T_END * i) / 100));
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const pad = (hi - lo) * 0.1 || 1;
  return [lo - pad, hi + pad];
}

createTool({
  state,
  label: 'Two graphs, one above the other. The top graph shows how the quantity changes in time for the chosen model: a growing population, a cooling cup of tea, or a mass on a spring. The bottom graph shows the rule behind it, rate of change against the present state. A dot on each graph moves with the time slider.',
  setup: (stage, c) => {
    const [top, bottom] = stackBoxes(2);
    return [createPlot(stage, { x: [0, T_END], y: [0, 100], c, pad: 22, box: top }), createPlot(stage, { x: [0, 100], y: [-30, 30], c, pad: 22, box: bottom })];
  },
  draw(ctx, stage, c, [upper, lower]) {
    const m = MODELS[state.model];
    const [lo, hi] = range(state);
    const y = m.sol(state.k, state.y0, state.t);
    upper.setRange([0, T_END], [lo, hi]);
    upper.axes({ xLabel: 't', yLabel: m.label.split(' ')[0] });
    upper.fn((t) => m.sol(state.k, state.y0, t), { color: c.a, width: 4 });
    upper.point(state.t, y, { fill: c.fillY });
    const rates = [lo, hi].map((v) => m.rule(state.k, v));
    const rLo = Math.min(...rates, 0);
    const rHi = Math.max(...rates, 0);
    const rPad = (rHi - rLo) * 0.1 || 1;
    lower.setRange([lo, hi], [rLo - rPad, rHi + rPad]);
    lower.axes({ xLabel: 'state', yLabel: 'rate', grid: true });
    lower.fn((v) => m.rule(state.k, v), { color: c.b, width: 4 });
    lower.point(y, m.rule(state.k, y), { fill: c.fillY });
  },
  controls: [
    { title: 'Same idea, three systems' },
    { key: 'model', label: 'System', options: Object.entries(MODELS).map(([key, v]) => [key, v.name]) },
    { key: 't', label: 'Time t', min: 0, max: T_END, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'y0', label: 'Start value', min: 10, max: 100, step: 10, format: (n) => `${n}` },
    { key: 'k', label: 'Constant k', min: 0.05, max: 0.3, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['State now', (s) => fixed(MODELS[s.model].sol(s.k, s.y0, s.t), 2)],
      ['Rate from the rule', (s) => fixed(MODELS[s.model].rule(s.k, MODELS[s.model].sol(s.k, s.y0, s.t)), 3)],
    ] },
  ],
  tex: (s) => `${MODELS[s.model].rateName}=f(\\text{state}):\\quad ${MODELS[s.model].tex},\\ k=${fixed(s.k, 2)}`,
});
