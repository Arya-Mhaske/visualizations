import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { model: 'direct', x1: 3, y1: 6, x2: 5 };
const MODELS = {
  direct: { g: (x) => x, name: 'y = kx', k: (s) => `\\dfrac{${s.y1}}{${s.x1}}`, y: (s, k) => `${k}\\times ${s.x2}` },
  inverse: { g: (x) => 1 / x, name: 'y = k/x', k: (s) => `${s.y1}\\times ${s.x1}`, y: (s, k) => `\\dfrac{${k}}{${s.x2}}` },
  square: { g: (x) => x * x, name: 'y = kx²', k: (s) => `\\dfrac{${s.y1}}{${s.x1}^2}`, y: (s, k) => `${k}\\times ${s.x2}^2` },
  invsq: { g: (x) => 1 / (x * x), name: 'y = k/x²', k: (s) => `${s.y1}\\times ${s.x1}^2`, y: (s, k) => `\\dfrac{${k}}{${s.x2}^2}` },
};
const kOf = (s) => s.y1 / MODELS[s.model].g(s.x1);
const predict = (s) => kOf(s) * MODELS[s.model].g(s.x2);

createTool({
  state,
  label: 'A graph of the chosen variation curve through the known data point (x1, y1), with the predicted point at x2 marked on the same curve.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 10], y: [0, 10] }),
  draw(ctx, stage, c, plot) {
    const [m, k, y2] = [MODELS[state.model], kOf(state), predict(state)];
    const top = Math.max(2, Math.max(state.y1, y2) * 1.3);
    plot.setRange([0, 10], [0, top]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => k * m.g(x), { color: c.a, domain: [0.05, 10] });
    plot.segment(state.x2, 0, state.x2, y2, { width: 2, dash: [4, 4] });
    plot.segment(0, y2, state.x2, y2, { width: 2, dash: [4, 4] });
    plot.point(state.x1, state.y1, { fill: c.b });
    plot.point(state.x2, y2, { fill: c.c });
    plot.text('known', state.x1, state.y1 + top * 0.07, { color: c.b, size: 11, patch: false });
    plot.text('predicted', state.x2, y2 + top * 0.07, { color: c.c, size: 11, patch: false });
  },
  controls: [
    { title: 'Known point and question' },
    { key: 'model', label: 'The rule', options: [['direct', 'kx'], ['inverse', 'k/x'], ['square', 'kx²'], ['invsq', 'k/x²']] },
    { key: 'x1', label: 'Known x₁', min: 1, max: 9, step: 1 },
    { key: 'y1', label: 'Known y₁', min: 1, max: 20, step: 1 },
    { key: 'x2', label: 'New x₂', min: 1, max: 10, step: 1 },
    { readout: [
      ['Step 1: k', (s) => fixed(kOf(s), 3)],
      ['Step 2: y₂', (s) => fixed(predict(s), 3)],
    ] },
  ],
  tex: (s) => {
    const m = MODELS[s.model];
    const k = fixed(kOf(s), 3);
    return `k=${m.k(s)}=${k},\\qquad y_2=${m.y(s, k)}=${fixed(predict(s), 3)}`;
  },
});
