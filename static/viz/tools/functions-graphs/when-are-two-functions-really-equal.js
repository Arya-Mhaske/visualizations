import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { PAIRS, sameFunction } from './_what-is-a-function-math.js';

const state = { pair: 'cancel', x: 0 };
const show = (v) => (Number.isNaN(v) ? 'undefined' : fixed(v, 2));

createTool({
  state,
  label: 'Two formulas drawn on the same axes: the first as a thick blue curve, the second as a thinner coral curve on top. Where the second formula is undefined, an empty circle marks the hole. A slider tests both formulas at one input.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-3, 9], c }),
  draw(ctx, stage, c, plot) {
    const { F, G, hole } = PAIRS[state.pair];
    plot.axes({ grid: false });
    plot.fn(F, { color: c.b, width: 8 });
    plot.fn((x) => (x === hole ? NaN : G(x)), { color: c.a, width: 3 });
    if (hole !== null) plot.point(hole, F(hole), { fill: c.paper, r: 7 });
    const [a, b] = [F(state.x), G(state.x)];
    plot.segment(state.x, -3, state.x, 9, { color: Number.isNaN(b) ? c.a : c.c, width: 2, dash: [6, 5] });
    if (!Number.isNaN(a) && Math.abs(a) < 9) plot.point(state.x, a, { fill: c.fillY, r: 6 });
    if (hole !== null && state.x === hole) plot.text('hole', hole + 0.6, F(hole) - 0.9, { size: 12, color: c.a });
  },
  controls: [
    { title: 'Same formula, same function?' },
    { key: 'pair', label: 'Pair', options: [['cancel', 'x and x²/x'], ['factor', 'x+1 and (x²−1)/(x−1)'], ['abs', '|x| and √x²'], ['expand', '(x+1)² and x²+2x+1']] },
    { key: 'x', label: 'Test input, x', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['First formula', (s) => `${PAIRS[s.pair].f} → ${show(PAIRS[s.pair].F(s.x))}`],
      ['Second formula', (s) => `${PAIRS[s.pair].g} → ${show(PAIRS[s.pair].G(s.x))}`],
      ['Domains', (s) => `${PAIRS[s.pair].domF} | ${PAIRS[s.pair].domG}`],
      ['Verdict', (s) => ({ text: sameFunction(s.pair) ? 'equal functions' : 'different functions', good: sameFunction(s.pair) })],
    ] },
  ],
  tex: (s) => `f(x)=${PAIRS[s.pair].fTex},\\quad g(x)=${PAIRS[s.pair].gTex},\\quad ${sameFunction(s.pair) ? 'f=g' : 'f\\ne g'}`,
});
