import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { stackBoxes } from './_ig.js';
import { BANK, area } from './_ftc.js';

// g(x) = ∫ₐˣ f. It rises where f > 0, falls where f < 0, flattens where f = 0 and bends where f turns.
const state = { fn: 'signed', a: 0, x: 2 };
const verdict = (v) => (Math.abs(v) < 0.05 ? 'flat' : v > 0 ? 'rising' : 'falling');

const tool = createTool({
  state,
  label: 'Top: a curve f with the area from a to x shaded green where f is positive and coral where it is negative. Bottom: the area function g of x, which climbs while f is above the axis, levels off where f crosses zero, and falls while f is below.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 6.3], y: [-2, 2], c, pad: 24, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [0, 6.3], y: [-4, 4], c, pad: 24, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const B = BANK[state.fn];
    const g = (x) => area(B.f, state.a, x);
    top.setRange([0, 6.3], [Math.min(B.y[0], -0.5), B.y[1]]);
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i <= 60; i++) { const y = g((6.3 * i) / 60); lo = Math.min(lo, y); hi = Math.max(hi, y); }
    bottom.setRange([0, 6.3], [lo - 0.5, hi + 0.5]);
    top.axes({ xLabel: 't', yLabel: 'f(t)' });
    const lowX = Math.min(state.a, state.x);
    const hiX = Math.max(state.a, state.x);
    top.shade((t) => Math.max(B.f(t), 0), null, lowX, hiX, c.fillC);
    top.shade((t) => Math.min(B.f(t), 0), null, lowX, hiX, c.fillA);
    top.fn(B.f, { color: c.a });
    bottom.axes({ xLabel: 'x', yLabel: 'g(x)' });
    bottom.fn(g, { color: c.b });
    bottom.point(state.x, g(state.x), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Accumulate the area' },
    { key: 'fn', label: 'Curve f', options: Object.entries(BANK).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Start at a', min: 0, max: 3, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'x', label: 'Area up to x', min: 0, max: 6, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['g(x)', (s) => fixed(area(BANK[s.fn].f, s.a, s.x), 3)],
      ['f(x) = slope of g', (s) => fixed(BANK[s.fn].f(s.x), 3)],
      ['g is', (s) => verdict(BANK[s.fn].f(s.x))],
    ] },
  ],
  tex: (s) => `g(x)=\\int_{${fixed(s.a, 1)}}^{x}f(t)\\,dt,\\quad g'(x)=f(x)=${fixed(BANK[s.fn].f(s.x), 3)}`,
});

tool.update();
