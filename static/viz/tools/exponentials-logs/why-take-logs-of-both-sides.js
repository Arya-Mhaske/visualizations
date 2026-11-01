import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { b: 2, c: 20, ln: false };
const root = (s) => Math.log(s.c) / Math.log(s.b);

createTool({
  state,
  label: 'The graph of b to the x and a horizontal line at c cross at the solution. Switch on take the natural log of both sides and the curve straightens into a line while the horizontal line moves down to ln c. The crossing stays at exactly the same x, and now it is easy to find.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [0, 40], c }),
  draw(ctx, stage, c, plot) {
    const { b, c: target } = state;
    const x = root(state);
    const top = state.ln ? Math.log(target) * 1.4 + 0.5 : target * 1.4;
    plot.setRange([0, Math.max(1, x * 1.6)], [0, top]);
    plot.axes({ xLabel: 'x', yLabel: state.ln ? 'ln y' : 'y' });
    plot.fn(state.ln ? (t) => t * Math.log(b) : (t) => b ** t, { color: c.a, width: 4 });
    const level = state.ln ? Math.log(target) : target;
    plot.segment(0, level, Math.max(1, x * 1.6), level, { color: c.b, width: 4 });
    plot.segment(x, 0, x, level, { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(x, level, { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Solve bˣ = c' },
    { key: 'b', label: 'Base b', min: 1.5, max: 5, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'c', label: 'Target c', min: 2, max: 100, step: 1 },
    { key: 'ln', label: 'Take ln of both sides', toggle: true },
    { readout: [
      ['Solution x', (s) => ({ text: fixed(root(s), 4), good: true })],
      ['Check, bˣ', (s) => fixed(s.b ** root(s), 3)],
    ] },
  ],
  tex: (s) => (s.ln
    ? `x\\ln ${fixed(s.b, 1)}=\\ln ${s.c}\\ \\Rightarrow\\ x=\\dfrac{${fixed(Math.log(s.c), 3)}}{${fixed(Math.log(s.b), 3)}}=${fixed(root(s), 4)}`
    : `${fixed(s.b, 1)}^{x}=${s.c}`),
});
