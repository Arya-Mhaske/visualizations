import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { stackBoxes } from './_ig.js';

// d/dx [eˣ f] = eˣ f + eˣ f′ = eˣ (f + f′). So the integrand eˣ(f + f′) is the slope of eˣ f.
const FS = {
  x: ['x', (x) => x, (x) => 1, 'x', '1'],
  x2: ['x²', (x) => x * x, (x) => 2 * x, 'x^2', '2x'],
  sin: ['sin x', Math.sin, Math.cos, '\\sin x', '\\cos x'],
  inv: ['1/x', (x) => 1 / x, (x) => -1 / (x * x), '\\dfrac1x', '-\\dfrac1{x^2}'],
};
const state = { fn: 'x', x: 1 };
const d = (g, x, h = 1e-5) => (g(x + h) - g(x - h)) / (2 * h);

const tool = createTool({
  state,
  label: 'Top: the curve e to the x times f of x with a coral tangent line at the chosen point. Bottom: the curve e to the x times f plus f prime, the integrand, with a coral dot at the same x. The height of the dot equals the slope of the tangent above: the integrand is the derivative of e to the x times f.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0.2, 3], y: [-2, 30], c, pad: 24, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [0.2, 3], y: [-2, 30], c, pad: 24, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const [, f, fp] = FS[state.fn];
    const G = (x) => Math.exp(x) * f(x);
    const I = (x) => Math.exp(x) * (f(x) + fp(x));
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i <= 80; i++) { const x = 0.2 + (2.8 * i) / 80; for (const y of [G(x), I(x)]) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
    const r = [lo - (hi - lo) * 0.1, hi + (hi - lo) * 0.1];
    top.setRange([0.2, 3], r);
    bottom.setRange([0.2, 3], r);
    top.axes({ xLabel: 'x', yLabel: 'eˣ f' });
    top.fn(G, { color: c.b });
    const m = d(G, state.x);
    top.segment(state.x - 0.4, G(state.x) - 0.4 * m, state.x + 0.4, G(state.x) + 0.4 * m, { color: c.a, width: 3 });
    top.point(state.x, G(state.x), { fill: c.b, r: 6 });
    bottom.axes({ xLabel: 'x', yLabel: 'eˣ(f + f′)' });
    bottom.fn(I, { color: c.c });
    bottom.point(state.x, I(state.x), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Check the slope' },
    { key: 'fn', label: 'f(x)', options: Object.entries(FS).map(([k, v]) => [k, v[0]]) },
    { key: 'x', label: 'x', min: 0.3, max: 2.9, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['Slope of eˣ f', (s) => fixed(d((x) => Math.exp(x) * FS[s.fn][1](x), s.x), 4)],
      ['Integrand eˣ(f + f′)', (s) => fixed(Math.exp(s.x) * (FS[s.fn][1](s.x) + FS[s.fn][2](s.x)), 4)],
    ] },
  ],
  tex: (s) => `\\dfrac{d}{dx}\\left[e^x${FS[s.fn][3]}\\right]=e^x\\left(${FS[s.fn][3]}+${FS[s.fn][4]}\\right)`,
});

tool.update();
