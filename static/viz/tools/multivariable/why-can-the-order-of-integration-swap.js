import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// Slice the solid by planes x = const: each slice has area A(x). Add up the slices: ∫A(x)dx. Or slice by y = const and add B(y).
// It is the same solid, so the two totals agree (Fubini). On a triangle the bounds change, but the answer does not.
const FUNCS = {
  a: { name: 'x y + 1', f: (x, y) => x * y + 1 },
  b: { name: '4 − x² − y²/2', f: (x, y) => 4 - x * x - y * y / 2 },
  c: { name: '1 + sin(x + y)', f: (x, y) => 1 + Math.sin(x + y) },
};
const state = { fn: 'a', region: 'rect', cut: 1 };
const simpson = (g, a, b, n = 200) => { const h = (b - a) / n; let s = g(a) + g(b); for (let i = 1; i < n; i++) s += g(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
export const A = (f, x, region) => simpson((y) => f(x, y), 0, region === 'rect' ? 2 : x);
export const B = (f, y, region) => simpson((x) => f(x, y), region === 'rect' ? 0 : y, 2);
export const byX = (f, region) => simpson((x) => A(f, x, region), 0, 2, 100);
export const byY = (f, region) => simpson((y) => B(f, y, region), 0, 2, 100);

createTool({
  state,
  label: 'Two curves: the area of the slice of the solid at each x (coral) and at each y (blue). The area under each curve is the volume of the solid. Both come out the same, though the slices are cut in different directions.',
  setup: (stage, c) => createPlot(stage, { x: [0, 2], y: [0, 9], c }),
  draw(ctx, stage, c, plot) {
    const f = FUNCS[state.fn].f;
    plot.setRange([0, 2], [0, Math.max(...[...Array(41).keys()].map((k) => Math.max(A(f, k / 20, state.region), B(f, k / 20, state.region)))) * 1.15 + 0.1]);
    plot.axes({ xLabel: 'x (or y)', yLabel: 'slice area' });
    plot.shade((x) => A(f, x, state.region), null, 0, 2, c.fillA);
    plot.shade((y) => B(f, y, state.region), null, 0, 2, c.fillB);
    plot.fn((x) => A(f, x, state.region), { color: c.a, domain: [0, 2] });
    plot.fn((y) => B(f, y, state.region), { color: c.b, domain: [0, 2], dash: [6, 4] });
    plot.segment(state.cut, 0, state.cut, A(f, state.cut, state.region), { color: c.a, width: 3 });
    plot.point(state.cut, A(f, state.cut, state.region), { fill: c.a });
    plot.point(state.cut, B(f, state.cut, state.region), { fill: c.b });
  },
  controls: [
    { title: 'Slice it both ways' },
    { key: 'fn', label: 'Height f(x, y)', options: Object.entries(FUNCS).map(([k, v]) => [k, v.name]) },
    { key: 'region', label: 'Base region', options: [['rect', 'Square 0–2'], ['tri', 'Triangle 0 ≤ y ≤ x ≤ 2']] },
    { key: 'cut', label: 'Look at the slice at', min: 0, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Slice at x = cut', (s) => `A = ${A(FUNCS[s.fn].f, s.cut, s.region).toFixed(3)}`],
      ['Slice at y = cut', (s) => `B = ${B(FUNCS[s.fn].f, s.cut, s.region).toFixed(3)}`],
      ['∫A(x) dx', (s) => byX(FUNCS[s.fn].f, s.region).toFixed(4)],
      ['∫B(y) dy', (s) => byY(FUNCS[s.fn].f, s.region).toFixed(4)],
    ] },
  ],
  tex: (s) => (s.region === 'rect' ? '\\int_0^2\\!\\!\\int_0^2 f\\,dy\\,dx=\\int_0^2\\!\\!\\int_0^2 f\\,dx\\,dy' : '\\int_0^2\\!\\!\\int_0^x f\\,dy\\,dx=\\int_0^2\\!\\!\\int_y^2 f\\,dx\\,dy'),
});
