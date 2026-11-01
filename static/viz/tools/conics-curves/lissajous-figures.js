import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { gcd, lissajous } from './_rotation-math.js';
import { curve, fitEqual, trace } from './_conics-view.js';

const state = { a: 3, b: 2, delta: 90, t: 1 };
const TAU = Math.PI * 2;
const period = (s = state) => TAU / gcd(s.a, s.b);

createTool({
  state,
  label: 'A curve traced by a point whose x-coordinate swings back and forth a times while its y-coordinate swings back and forth b times in the same time. The ratio of the two frequencies decides how many loops the figure has, and the phase difference between them opens or closes it. A marker follows the curve as time passes.',
  setup: (stage, c) => createPlot(stage, { x: [-1.3, 1.3], y: [-1.3, 1.3], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    fitEqual(plot, stage, 0, 0, 1.3);
    plot.axes({ xLabel: 'x', yLabel: 'y', grid: false });
    curve(plot, trace((t) => lissajous(state.a, state.b, state.delta, t), 0, period(), 600), { color: c.a, width: 3 });
    const p = lissajous(state.a, state.b, state.delta, state.t * period());
    plot.point(p[0], p[1], { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Tune the two motions' },
    { key: 'a', label: 'x frequency, a', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'y frequency, b', min: 1, max: 6, step: 1 },
    { key: 'delta', label: 'Phase shift of x, δ', min: 0, max: 180, step: 5, format: (v) => `${v}°` },
    { key: 't', label: 'Marker', min: 0, max: 1, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
    { readout: [
      ['Frequency ratio', (s) => `${s.a / gcd(s.a, s.b)} : ${s.b / gcd(s.a, s.b)}`],
      ['Marker', (s) => { const p = lissajous(s.a, s.b, s.delta, s.t * period(s)); return `(${fixed(p[0], 2)}, ${fixed(p[1], 2)})`; }],
    ] },
  ],
  tex: (s) => `x=\\sin(${s.a}t+${s.delta}^\\circ),\\ y=\\sin(${s.b}t)`,
});
