import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { vertices } from './_sm-math.js';
import { boundary, shadeRegion } from './_lp-view.js';

const BOX = [0, 0, 8, 8];
const INEQ = [
  { a: 1, b: 1, c: 6, op: '<=', text: 'x + y ≤ 6' },
  { a: 1, b: -1, c: 3, op: '<=', text: 'x − y ≤ 3' },
  { a: 0, b: 1, c: 1, op: '>=', text: 'y ≥ 1' },
  { a: 1, b: 0, c: 1, op: '>=', text: 'x ≥ 1' },
];
const state = { on0: true, on1: true, on2: true, on3: true };
const active = (s) => INEQ.filter((_, i) => s[`on${i}`]);
const corners = (s) => vertices([...active(s), { a: 1, b: 0, c: 0, op: '>=' }, { a: 0, b: 1, c: 0, op: '>=' }]);
const COLORS = ['fillA', 'fillB', 'fillY', 'fillC'];

createTool({
  state,
  label: 'Four inequalities, each shading one side of its line. Every inequality you switch on shades its own half plane lightly, and the part where all the active half planes overlap is the feasible region, outlined in black. Switching one off lets the region grow, and switching one on can only shrink it.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [0, 8], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    INEQ.forEach((k, i) => {
      if (!state[`on${i}`]) return;
      ctx.save();
      ctx.globalAlpha = 0.35;
      shadeRegion(ctx, plot, [k], BOX, { fill: c[COLORS[i]], stroke: null, width: 0 });
      ctx.restore();
      boundary(plot, k, BOX, { color: c.ink, width: 2 });
    });
    shadeRegion(ctx, plot, active(state), BOX, { fill: c.fillC, stroke: c.ink, width: 4 });
    corners(state).forEach((p) => dot(ctx, ...plot.toPx(...p), 6, c.fillY, c.ink));
  },
  controls: [
    { title: 'Switch the inequalities on and off' },
    ...INEQ.map((k, i) => ({ key: `on${i}`, label: k.text, toggle: true })),
    { readout: [
      ['Active inequalities', (s) => String(active(s).length)],
      ['Corner points', (s) => corners(s).map((p) => `(${fixed(p[0], 1)}, ${fixed(p[1], 1)})`).join(' ') || 'none'],
      ['Feasible area', (s) => { const r = shadeRegionArea(s); return r < 1e-9 ? 'empty' : fixed(r, 2); }],
    ] },
  ],
  tex: (s) => `${active(s).map((k) => k.text.replace('≤', '\\le').replace('≥', '\\ge').replace('−', '-')).join(',\\ ')}`,
});

function shadeRegionArea(s) {
  // area of the feasible region inside the window (clip by clipHalf through the corner list is not enough for window edges, so sample)
  let count = 0;
  const n = 160;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = ((i + 0.5) * 8) / n;
    const y = ((j + 0.5) * 8) / n;
    if (active(s).every((k) => (k.op === '<=' ? k.a * x + k.b * y <= k.c : k.a * x + k.b * y >= k.c))) count++;
  }
  return (count * 64) / (n * n);
}
