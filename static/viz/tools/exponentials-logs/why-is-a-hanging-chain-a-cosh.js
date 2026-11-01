import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { catenaryA } from './_exp-log-math.js';

const state = { L: 3, h: 3, parabola: true };
const BEADS = 16;
const par = (s) => catenaryA(s.L, s.h);
const cat = (a, x) => a * (Math.cosh(x / a) - 1);
const para = (s, x) => s.h * (x / s.L) ** 2;
const gapMax = (s) => {
  const a = par(s);
  let worst = 0;
  for (let i = 0; i <= 200; i++) {
    const x = (-s.L) + (2 * s.L * i) / 200;
    worst = Math.max(worst, Math.abs(cat(a, x) - para(s, x)));
  }
  return worst;
};

createTool({
  state,
  label: 'A chain of beads hanging between two supports. The beads are equally spaced along the chain. The curve they follow is a cosh curve. A dashed parabola through the same two supports and the same lowest point is drawn for comparison, and it falls inside the chain, so the hanging chain is not a parabola.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-0.5, 7.5], c }),
  draw(ctx, stage, c, plot) {
    const { L, h } = state;
    const a = par(state);
    const size = Math.max(2 * L + 1.2, h + 1.5);
    plot.setRange([-size / 2, size / 2], [-0.7, size - 0.7]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    if (state.parabola) plot.fn((x) => para(state, x), { color: c.b, width: 3, dash: [7, 5], domain: [-L, L] });
    plot.fn((x) => cat(a, x), { color: c.a, width: 3, domain: [-L, L] });
    const S = a * Math.sinh(L / a);
    for (let j = 0; j <= BEADS; j++) {
      const s = -S + (2 * S * j) / BEADS;
      const x = a * Math.asinh(s / a);
      plot.point(x, cat(a, x), { fill: c.fillY, r: 6 });
    }
    plot.point(-L, h, { fill: c.ink, r: 7 });
    plot.point(L, h, { fill: c.ink, r: 7 });
  },
  controls: [
    { title: 'Hang the chain' },
    { key: 'L', label: 'Half the gap between supports', min: 1, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'h', label: 'How far the middle sags', min: 0.5, max: 6, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'parabola', label: 'Compare with a parabola', toggle: true },
    { readout: [
      ['Shape number a', (s) => fixed(par(s), 3)],
      ['Chain length', (s) => fixed(2 * par(s) * Math.sinh(s.L / par(s)), 3)],
      ['Biggest gap to parabola', (s) => ({ text: fixed(gapMax(s), 3), good: false })],
    ] },
  ],
  tex: (s) => `y=a\\left(\\cosh\\dfrac{x}{a}-1\\right),\\ \\ a=${fixed(par(s), 3)}`,
});
