import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, num } from './_da.js';

// Total cases C(t) = K / (1 + e^(−r(t − t₀))). New cases per day C′(t) = r C (1 − C/K) peak when C′′ = 0, at C = K/2, t = t₀.
// All numbers are made up for illustration.
const state = { K: 10000, r: 0.25, t0: 40, t: 25 };
const C = (t) => state.K / (1 + Math.exp(-state.r * (t - state.t0)));
const D = (t) => state.r * C(t) * (1 - C(t) / state.K);
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: total cases so far against day, an S-shaped curve. Bottom: new cases per day, a bell shape. The peak of the bottom curve sits at the steepest point of the top curve, the inflection point.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 100], y: [0, 10000], c, box: bA }), b: createPlot(stage, { x: [0, 100], y: [0, 700], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    a.setRange([0, 100], [0, state.K * 1.1]);
    b.setRange([0, 100], [0, (state.K * state.r * 1.25) / 4]);
    a.axes({ xLabel: 'day', yLabel: 'total C' });
    a.fn(C, { color: c.ink, width: 3 });
    a.segment(0, state.K / 2, 100, state.K / 2, { color: c.c, width: 2, dash: [6, 4] });
    a.point(state.t0, state.K / 2, { fill: c.c, r: 8 });
    a.point(state.t, C(state.t), { fill: c.a });
    b.axes({ xLabel: 'day', yLabel: 'new cases / day' });
    b.shade(D, null, 0, state.t, c.fillA);
    b.fn(D, { color: c.b, width: 3 });
    b.segment(state.t0, 0, state.t0, (state.K * state.r) / 4, { color: c.c, width: 2, dash: [6, 4] });
    b.point(state.t0, (state.K * state.r) / 4, { fill: c.c, r: 8 });
    b.point(state.t, D(state.t), { fill: c.a });
  },
  controls: [
    { title: 'Shape the outbreak' },
    { key: 'K', label: 'Final total K', min: 2000, max: 10000, step: 500 },
    { key: 'r', label: 'Spread rate r', min: 0.1, max: 0.4, step: 0.01, format: (v) => `${v.toFixed(2)} /day` },
    { key: 't0', label: 'Midpoint day t₀', min: 20, max: 70, step: 1, format: (v) => `day ${v}` },
    { key: 't', label: 'Today', min: 0, max: 100, step: 1, format: (v) => `day ${v}` },
    { readout: [
      ['Total so far', () => num(C(state.t), 5)],
      ['New cases today', () => num(D(state.t), 4)],
      ['Peak of new cases', () => `${num((state.K * state.r) / 4, 4)} per day on day ${state.t0}`],
      ['Total at the peak', () => `${state.K / 2} = K / 2`],
    ] },
  ],
  tex: (s) => `C'(t)=rC\\left(1-\\frac{C}{K}\\right)\\ \\text{is largest at}\\ C=\\frac K2\\ (C''=0)`,
});
