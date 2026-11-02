import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { classify, crossX } from './_linear-equations-math.js';

const PRESETS = { one: [2, 1, -1, 4], none: [2, 1, 2, 4], every: [2, 1, 2, 1] };
const state = { case: 'one', m1: 2, k1: 1, m2: -1, k2: 4 };
let tool;
let lastCase = 'one';
let lastKey = '';
const kind = (s) => classify(s.m1, s.k1, s.m2, s.k2);
const sign = (v) => (v < 0 ? `− ${-v}` : `+ ${v}`);

tool = createTool({
  state,
  label: 'Two straight lines on a graph, one for each side of the equation. They may cross at one point, run parallel and never meet, or lie on top of each other.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-10, 10], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => state.m1 * x + state.k1, { color: c.b });
    plot.fn((x) => state.m2 * x + state.k2, { color: c.a, dash: kind(state) === 'every' ? [8, 6] : [] });
    if (kind(state) === 'one') {
      const x = crossX(state.m1, state.k1, state.m2, state.k2);
      plot.point(x, state.m1 * x + state.k1, { fill: state.m1 ? c.c : c.c });
    }
  },
  controls: [
    { title: 'Left side = right side' },
    { key: 'case', label: 'Case', options: [['one', 'One'], ['none', 'None'], ['every', 'Every x'], ['custom', 'Custom']] },
    { key: 'm1', label: 'Left slope', min: -4, max: 4, step: 1 },
    { key: 'k1', label: 'Left constant', min: -6, max: 6, step: 1 },
    { key: 'm2', label: 'Right slope', min: -4, max: 4, step: 1 },
    { key: 'k2', label: 'Right constant', min: -6, max: 6, step: 1 },
    { readout: [
      ['Slopes', (s) => (s.m1 === s.m2 ? 'equal' : 'different')],
      ['Solutions', (s) => ({ one: `x = ${Number(crossX(s.m1, s.k1, s.m2, s.k2).toFixed(2))}`, none: 'none', every: 'every x' }[kind(s)]), ],
    ] },
  ],
  tex: (s) => `${s.m1}x ${sign(s.k1)} = ${s.m2}x ${sign(s.k2)}`,
  onChange: (s) => {
    const key = `${s.m1},${s.k1},${s.m2},${s.k2}`;
    if (s.case !== lastCase && s.case !== 'custom') [s.m1, s.k1, s.m2, s.k2] = PRESETS[s.case];
    else if (key !== lastKey && lastKey) s.case = 'custom';
    lastCase = s.case;
    lastKey = `${s.m1},${s.k1},${s.m2},${s.k2}`;
    tool?.ui.refresh();
  },
});
lastKey = `${state.m1},${state.k1},${state.m2},${state.k2}`;
