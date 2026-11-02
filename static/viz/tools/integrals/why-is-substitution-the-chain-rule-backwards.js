import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact, stackBoxes } from './_ig.js';
import { EX, integrand } from './_subst.js';

// d/dx F(g(x)) = F′(g(x))·g′(x) = f(g(x))·g′(x). So an integrand of that shape has antiderivative F(g(x)).
const state = { k: 'cosx2', p: 0.6 };
const xOf = (s) => EX[s.k].x0 + s.p * (EX[s.k].x1 - EX[s.k].x0);
const Fx = (e, x) => e.Fo(e.g(x)) - e.Fo(e.g(e.x0));

const tool = createTool({
  state,
  label: 'Top: the integrand f of g of x times g prime of x, with the area from the starting point to x shaded. Bottom: the curve F of g of x, minus its starting value, as a line, with a coral point at x. The point sits at the same height as the shaded area above: the antiderivative is F of g of x.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 2], y: [-4, 4], c, pad: 24, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [0, 2], y: [-4, 4], c, pad: 24, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const e = EX[state.k];
    const f = (x) => integrand(e, x);
    top.setRange(e.view[0], e.view[1]);
    bottom.setRange(e.view[0], e.view[1]);
    top.axes({ xLabel: 'x', yLabel: 'f(g)·g′' });
    const X = xOf(state);
    top.shade(f, null, e.x0, X, c.fillB);
    top.fn(f, { color: c.a, domain: [e.x0 + 1e-6, e.x1] });
    bottom.axes({ xLabel: 'x', yLabel: 'F(g(x))' });
    bottom.fn((x) => Fx(e, x), { color: c.c, domain: [e.x0 + 1e-6, e.x1] });
    bottom.point(X, Fx(e, X), { fill: c.a, r: 7 });
    bottom.segment(X, 0, X, Fx(e, X), { color: c.a, width: 3, dash: [4, 4] });
  },
  controls: () => [
    { title: 'Spot the chain rule' },
    { key: 'k', label: 'Integrand', options: Object.entries(EX).map(([k, v]) => [k, v.name]) },
    { key: 'p', label: 'Area up to x', min: 0.05, max: 1, step: 0.01, format: (v) => fixed(EX[state.k].x0 + v * (EX[state.k].x1 - EX[state.k].x0), 2) },
    { readout: [
      ['Shaded area', (s) => fixed(exact((x) => integrand(EX[s.k], x), EX[s.k].x0, xOf(s)), 4)],
      ['F(g(x)) − F(g(start))', (s) => fixed(Fx(EX[s.k], xOf(s)), 4)],
    ] },
  ],
  tex: (s) => { const e = EX[s.k]; return `\\int ${e.tex}\\,dx\\ \\xrightarrow{u=${e.u}}\\ \\int ${e.fTex}\\,du=${e.FoTex}=F(g(x))`; },
});
tool.update();
