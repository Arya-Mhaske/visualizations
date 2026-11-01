import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { CURVES, outputs, isFunction } from './_what-is-a-function-math.js';

const state = { curve: 'circle', a: 0 };
const list = (s) => outputs(s.curve, s.a).map((y) => fixed(y, 2)).join(' and ');

createTool({
  state,
  label: 'A curve on a coordinate plane and a vertical line you slide along the x-axis. Dots mark every place the line meets the curve. One dot means one output for that input; two dots mean the curve is not a function.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-5, 5], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ grid: false });
    CURVES[state.curve].branches.forEach((branch) => plot.fn(branch, { color: c.b, width: 4 }));
    const hits = outputs(state.curve, state.a);
    const bad = hits.length > 1;
    plot.segment(state.a, -5, state.a, 5, { color: bad ? c.a : c.c, width: 2, dash: [6, 5] });
    hits.forEach((y) => plot.point(state.a, y, { fill: bad ? c.a : c.c, r: 8 }));
    plot.text(bad ? 'Two outputs for one input!' : hits.length ? 'One output' : 'No output here', 0, 4.4, { size: 12, color: bad ? c.a : c.ink });
  },
  controls: [
    { title: 'Press a button, get one thing?' },
    { key: 'curve', label: 'Curve', options: [['line', 'Line'], ['parabola', 'Parabola'], ['sideways', 'Sideways'], ['circle', 'Circle']] },
    { key: 'a', label: 'Input, x', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Curve', (s) => CURVES[s.curve].text],
      ['Outputs at this x', (s) => list(s) || 'none'],
      ['Number of outputs', (s) => outputs(s.curve, s.a).length],
      ['Whole curve', (s) => ({ text: isFunction(s.curve) ? 'is a function' : 'is not a function', good: isFunction(s.curve) })],
    ] },
  ],
  tex: (s) => `x=${fixed(s.a, 1)}\\ \\Rightarrow\\ \\text{${outputs(s.curve, s.a).length} output(s)}`,
});
