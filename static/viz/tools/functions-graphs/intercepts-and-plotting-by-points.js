import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FUNCS, tableOf, yIntercept } from './_coordinate-plane-math.js';

const state = { fn: 1, k: 5, join: false, show: true };
const fn = (s = state) => FUNCS[s.fn];

const tool = createTool({
  state,
  label: 'A coordinate plane. Points from a table of x and y values are plotted one at a time, each labelled with its coordinates. A toggle joins them with the smooth curve. Green dots mark where the graph meets the y-axis, at x equal to 0, and where it meets the x-axis, at y equal to 0.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-6, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const f = fn();
    plot.setRange([-4, 4], f.view);
    plot.axes();
    if (state.join) plot.fn(f.f, { color: c.b, width: 3 });
    for (const [x, y] of tableOf(f, state.k)) {
      plot.point(x, y, { fill: c.fillY, r: 7 });
      plot.text(`(${x}, ${y})`, x + 0.15, y + (f.view[1] - f.view[0]) * 0.05, { size: 10, align: 'left', patch: false });
    }
    if (state.show) {
      plot.point(0, yIntercept(f), { fill: c.c, r: 8 });
      for (const x of f.xInt) plot.point(x, 0, { fill: c.a, r: 8 });
    }
  },
  controls: () => [
    { title: 'Plot from a table' },
    { key: 'fn', label: 'Equation', options: FUNCS.map((f, i) => [i, f.text]) },
    { key: 'k', label: 'Points plotted', min: 0, max: 7, step: 1 },
    { key: 'join', label: 'Join them with the curve', toggle: true },
    { key: 'show', label: 'Mark the intercepts', toggle: true },
    { readout: [
      ['Last point added', (s) => (s.k ? `(${tableOf(fn(s), s.k).at(-1)[0]}, ${tableOf(fn(s), s.k).at(-1)[1]})` : 'none yet')],
      ['y-intercept', (s) => `(0, ${yIntercept(fn(s))})`],
      ['x-intercepts', (s) => fn(s).xInt.map((x) => `(${x}, 0)`).join('  ')],
    ] },
  ],
  tex: (s) => `${fn(s).text}:\\ x=0\\Rightarrow y=${yIntercept(fn(s))};\\quad y=0\\Rightarrow x=${fn(s).xInt.map((x) => fixed(x, 0)).join(',\\ ')}`,
});

tool.update();
