import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const PAIRS = {
  sin: { name: 'sin x ÷ x at 0', a: 0, f: Math.sin, g: (x) => x, df: Math.cos, dg: () => 1, tex: '\\dfrac{\\sin x}{x}' },
  exp: { name: '(eˣ − 1) ÷ 2x at 0', a: 0, f: (x) => Math.exp(x) - 1, g: (x) => 2 * x, df: Math.exp, dg: () => 2, tex: '\\dfrac{e^x-1}{2x}' },
  ln: { name: 'ln x ÷ (x − 1) at 1', a: 1, f: Math.log, g: (x) => x - 1, df: (x) => 1 / x, dg: () => 1, tex: '\\dfrac{\\ln x}{x-1}' },
};
const state = { pair: 'sin', w: 1.5 };
const P = () => PAIRS[state.pair];

createTool({
  state,
  label: 'Two functions that are both zero at a point, drawn near that point with a zoom slider. As you zoom in, each looks like a straight line through the point. The ratio of their heights at the marker then becomes the ratio of their slopes.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 2], y: [-2, 2], c }),
  draw(ctx, stage, c, plot) {
    const { a, f, g } = P();
    const w = state.w;
    const reach = Math.max(Math.abs(f(a + w)), Math.abs(g(a + w)), Math.abs(f(a - w) || 0), Math.abs(g(a - w) || 0), w * 0.5) * 1.2;
    plot.setRange([a - w, a + w], [-reach, reach]);
    plot.axes({ xLabel: 'x', yLabel: 'height' });
    plot.fn(g, { color: c.b, width: 4 });
    plot.fn(f, { color: c.a, width: 4 });
    const x = a + w * 0.8;
    plot.segment(x, 0, x, f(x), { color: c.a, width: 5 });
    plot.segment(x + w * 0.02, 0, x + w * 0.02, g(x), { color: c.b, width: 5 });
    plot.point(a, 0, { fill: c.fillY, r: 7 });
  },
  controls: [
    { title: 'Zoom in on the 0/0 point' },
    { key: 'pair', label: 'Ratio f ÷ g', options: Object.entries(PAIRS).map(([k, v]) => [k, v.name]) },
    { key: 'w', label: 'Window half-width', min: 0.02, max: 2, step: 0.02, format: (v) => fixed(v, 2) },
    { readout: [
      ['f ÷ g at the marker', (s) => { const p = PAIRS[s.pair]; const x = p.a + s.w * 0.8; return fixed(p.f(x) / p.g(x), 5); }],
      ['f′ ÷ g′ at the point', (s) => { const p = PAIRS[s.pair]; return { text: fixed(p.df(p.a) / p.dg(p.a), 5), good: true }; }],
    ] },
  ],
  tex: (s) => `\\lim ${PAIRS[s.pair].tex}=\\dfrac{f'(a)}{g'(a)}=${fixed(PAIRS[s.pair].df(PAIRS[s.pair].a) / PAIRS[s.pair].dg(PAIRS[s.pair].a), 4)}`,
});
