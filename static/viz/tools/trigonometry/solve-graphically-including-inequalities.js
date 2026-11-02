import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { aboveIntervals, deg, rad } from './_inverses-math.js';

const state = { f: 'sin', g: 'k', k: 0.5, greater: true };
const FS = { sin: (x) => Math.sin(x), cos: (x) => Math.cos(x), sin2: (x) => Math.sin(2 * x) };
const GS = { k: () => state.k, cos: (x) => Math.cos(x), sin: (x) => Math.sin(x) };
const NAME = { sin: 'sin x', cos: 'cos x', sin2: 'sin 2x', k: () => fixed(state.k, 2) };
const gName = () => (state.g === 'k' ? fixed(state.k, 2) : NAME[state.g]);
const top = () => (state.greater ? FS[state.f] : GS[state.g]);
const bottom = () => (state.greater ? GS[state.g] : FS[state.f]);
const result = () => aboveIntervals(top(), bottom());
const d = (r) => `${fixed(deg(r), 0)}°`;
const intervalText = (list) => (list.length ? list.map(([a, b]) => `(${d(a)}, ${d(b)})`).join(' ∪ ') : 'nowhere');

createTool({
  state,
  label: 'Two curves f and g over 0 to 360 degrees. Coral dots mark where they cross, and the strips of the x axis where the chosen curve is higher are shaded green. The crossing points are the edges of the solution intervals.',
  setup: (stage, c) => createPlot(stage, { x: [0, 360], y: [-1.4, 1.4], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x (°)', yLabel: 'y' });
    const { roots, intervals } = result();
    for (const [a, b] of intervals) plot.shade((x) => top()(rad(x)), (x) => bottom()(rad(x)), deg(a), deg(b), c.fillC);
    plot.fn((x) => FS[state.f](rad(x)), { color: c.b, width: 4 });
    plot.fn((x) => GS[state.g](rad(x)), { color: c.d, width: 4 });
    for (const [a, b] of intervals) plot.segment(deg(a), -1.3, deg(b), -1.3, { color: c.c, width: 7 });
    for (const r of roots) dot(ctx, ...plot.toPx(deg(r), FS[state.f](r)), 8, c.a, c.ink);
  },
  controls: [
    { title: 'Compare f (blue) with g (purple)' },
    { key: 'f', label: 'f(x)', options: [['sin', 'sin x'], ['cos', 'cos x'], ['sin2', 'sin 2x']] },
    { key: 'g', label: 'g(x)', options: [['k', 'a number'], ['cos', 'cos x'], ['sin', 'sin x']] },
    { key: 'k', label: 'The number', min: -1, max: 1, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'greater', label: 'Solve', options: [[true, 'f > g'], [false, 'f < g']] },
    { readout: [
      ['They meet at', () => (result().roots.length ? result().roots.map(d).join(', ') : 'nowhere')],
      ['Solution', () => intervalText(result().intervals)],
    ] },
  ],
  tex: (s) => `${NAME[s.f]}\\ ${s.greater ? '>' : '<'}\\ ${gName()}`.replace(/sin 2x/g, '\\sin 2x').replace(/sin x/g, '\\sin x').replace(/cos x/g, '\\cos x'),
});
