import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';
import { PF, pieceSum, antiAt } from './_pf.js';

// A rational function is a sum of simple pieces, each with a known antiderivative (a log or an arctan).
const state = { k: 'lin2', pieces: true };

const tool = createTool({
  state,
  label: 'A rational function drawn as a thick coral curve, with its simple pieces drawn in blue and green. The sum of the pieces is drawn dashed on top of the coral curve and matches it exactly. The area under the curve between the chosen limits is the sum of the areas of the pieces.',
  setup: (stage, c) => createPlot(stage, { x: [0, 5], y: [-2, 4], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const e = PF[state.k];
    let lo = Infinity;
    let hi = -Infinity;
    const all = [e.f, ...e.pieces.map((p) => p.f)];
    for (const g of all) for (let i = 0; i <= 60; i++) { const y = g(e.a + ((e.b - e.a) * i) / 60); lo = Math.min(lo, y); hi = Math.max(hi, y); }
    const pad = (hi - lo) * 0.2 + 0.05;
    plot.setRange([e.a - 0.3, e.b + 0.3], [Math.min(lo, 0) - pad, hi + pad]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(e.f, null, e.a, e.b, c.fillY);
    if (state.pieces) e.pieces.forEach((p, i) => plot.fn(p.f, { color: [c.b, c.c, c.d][i], width: 2 }));
    plot.fn(e.f, { color: c.a, width: 4, domain: [e.a - 0.3, e.b + 0.3] });
    plot.fn((x) => pieceSum(e, x), { color: c.ink, width: 2, dash: [6, 5], domain: [e.a - 0.3, e.b + 0.3] });
  },
  controls: () => [
    { title: 'Split a fraction' },
    { key: 'k', label: 'Function', options: Object.entries(PF).map(([k, v]) => [k, v.name]) },
    { key: 'pieces', label: 'Show the pieces', toggle: true },
    { readout: [
      ['Limits', (s) => `${PF[s.k].a} to ${PF[s.k].b}`],
      ['Area under the whole', (s) => fixed(exact(PF[s.k].f, PF[s.k].a, PF[s.k].b), 5)],
      ['Sum of the pieces’ areas', (s) => fixed(antiAt(PF[s.k], PF[s.k].b) - antiAt(PF[s.k], PF[s.k].a), 5)],
    ] },
  ],
  tex: (s) => { const e = PF[s.k]; return `${e.tex}=${e.pieces.map((p) => p.tex).join('+').replace(/\+\\dfrac\{-/g, '-\\dfrac{')}\\ \\Rightarrow\\ ${e.pieces.map((p) => p.Ftex).join('+').replace(/\+-/g, '-')}+C`; },
});

tool.update();
