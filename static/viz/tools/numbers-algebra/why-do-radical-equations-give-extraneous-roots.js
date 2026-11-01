import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { radical } from './_quadratic-equations-math.js';

const state = { p: 2, q: 0 };

createTool({
  state,
  label: 'Left side: the curve y equals root of x plus p, in coral. Squaring both sides adds its mirror image, y equals minus that root, in blue, so together they form a whole sideways parabola. The line y equals x plus q is the right side. Where the line meets the coral half the solution is genuine and the dot is green. Where it meets only the blue half, the dot is a red cross: an extraneous root.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 8], y: [-6, 6], c }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const g = (x) => Math.sqrt(x + state.p);
    plot.fn((x) => -g(x), { color: c.b, width: 4, dash: [6, 5], domain: [-state.p, 8] });
    plot.fn(g, { color: c.a, width: 4, domain: [-state.p, 8] });
    plot.fn((x) => x + state.q, { color: c.ink, width: 3 });
    radical(state.p, state.q).forEach(({ x, valid }) => {
      plot.point(x, x + state.q, { fill: valid ? c.c : c.a, r: valid ? 8 : 6 });
      if (!valid) plot.text('✕', x, x + state.q - 0.6, { size: 14, color: c.a, patch: false });
    });
  },
  controls: [
    { title: '√(x + p) = x + q' },
    { key: 'p', label: 'p', min: -2, max: 6, step: 0.5 },
    { key: 'q', label: 'q', min: -3, max: 3, step: 0.5 },
    { readout: [
      ['Roots after squaring', (s) => radical(s.p, s.q).map((r) => fixed(r.x, 3)).join(', ') || 'none'],
      ['Genuine', (s) => radical(s.p, s.q).filter((r) => r.valid).map((r) => fixed(r.x, 3)).join(', ') || 'none'],
      ['Extraneous', (s) => ({ text: radical(s.p, s.q).filter((r) => !r.valid).map((r) => fixed(r.x, 3)).join(', ') || 'none', good: !radical(s.p, s.q).some((r) => !r.valid) })],
    ] },
  ],
  tex: (s) => `\\sqrt{x+${fixed(s.p, 1)}}=x+${fixed(s.q, 1)}\\ \\xrightarrow{\\ \\text{square}\\ }\\ x+${fixed(s.p, 1)}=(x+${fixed(s.q, 1)})^2`,
});
