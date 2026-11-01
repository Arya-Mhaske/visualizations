import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { crossings } from '../trigonometry/_identities-math.js';

// f(x) = x + k sin x has slope 1 + k cos x, so it is increasing exactly when k ≤ 1
const state = { k: 0.5, y: 1.5 };
const f = (s, x) => x + s.k * Math.sin(x);
const hits = (s) => crossings((x) => f(s, x), () => s.y, -6, 6);
const minSlope = (s) => 1 - s.k;

createTool({
  state,
  label: 'The graph of x plus k times sine x and a horizontal line that you slide. While k is at most 1 the graph never goes down, it only rises, and a horizontal line can meet a rising graph only once, because after the graph passes the line it keeps going higher. Increase k past 1 and small dips appear where the graph slopes downward, and the line can now hit the graph three times.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-8, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => f(state, x), { color: c.a, width: 4 });
    plot.segment(-6, state.y, 6, state.y, { color: c.b, width: 3 });
    hits(state).forEach((x) => plot.point(x, state.y, { fill: c.fillY, r: 8 }));
  },
  controls: [
    { title: 'Add a wobble' },
    { key: 'k', label: 'Size of the wobble, k', min: 0, max: 2.5, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'y', label: 'Height of the line', min: -5, max: 5, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Lowest slope, 1 − k', (s) => ({ text: fixed(minSlope(s), 2), good: minSlope(s) >= 0 })],
      ['Always rising?', (s) => ({ text: minSlope(s) >= 0 ? 'yes' : 'no: it dips', good: minSlope(s) >= 0 })],
      ['Hits at this height', (s) => ({ text: `${hits(s).length}`, good: hits(s).length <= 1 })],
    ] },
  ],
  tex: (s) => `f'(x)=1+${fixed(s.k, 1)}\\cos x\\ge ${fixed(minSlope(s), 1)}`,
});
