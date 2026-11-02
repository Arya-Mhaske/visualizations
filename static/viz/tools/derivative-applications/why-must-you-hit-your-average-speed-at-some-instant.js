import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FUNS, roots, tangent, num } from './_da.js';

// Tilt Rolle's picture: the chord from (a, f(a)) to (b, f(b)) has slope m. Somewhere f′(c) = m, a tangent parallel to the chord.
const FN = { ...FUNS };
delete FN.hill;
const state = { fn: 'cubic', a: -2, b: 2.5 };
const K = () => FN[state.fn];
const ab = () => [Math.min(state.a, state.b), Math.max(state.a, state.b)];
const slope = () => { const [a, b] = ab(); return b - a < 1e-9 ? NaN : (K().f(b) - K().f(a)) / (b - a); };
const cs = () => { const [a, b] = ab(); const m = slope(); return roots((x) => K().d(x) - m, a, b).filter((x) => x > a && x < b); };

createTool({
  state,
  label: 'A graph with a chord joining two points on it in coral, and blue tangents drawn at every point between them where the slope equals the chord slope.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.setRange(k.x, k.y);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    plot.fn(k.f, { color: c.ink, width: 3 });
    const [a, b] = ab();
    const m = slope();
    if (Number.isFinite(m)) {
      plot.segment(a, k.f(a), b, k.f(b), { color: c.a, width: 3 });
      for (const x of cs()) { tangent(plot, x, k.f(x), m, (k.x[1] - k.x[0]) * 0.1, c.b, 3); plot.point(x, k.f(x), { fill: c.b }); }
    }
    plot.point(a, k.f(a), { fill: c.a }); plot.point(b, k.f(b), { fill: c.a });
  },
  controls: [
    { title: 'Choose the two points' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Start a', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1).replace('-', '−') },
    { key: 'b', label: 'End b', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1).replace('-', '−') },
    { readout: [
      ['Average rate (chord slope)', () => num(slope(), 4)],
      ['Instants c with f′(c) = average', () => cs().map((x) => x.toFixed(3)).join(', ') || 'none found'],
      ['f′ at those instants', () => cs().map((x) => num(K().d(x), 3)).join(', ') || '—'],
    ] },
  ],
  tex: () => "\\frac{f(b)-f(a)}{b-a}=f'(c)\\ \\text{for some } c \\text{ between } a \\text{ and } b",
});
