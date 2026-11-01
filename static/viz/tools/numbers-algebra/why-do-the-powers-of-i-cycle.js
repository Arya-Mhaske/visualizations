import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow } from '../../lib/draw.js';
import { iPower, rotateByI, showComplex, texComplex } from './_complex-numbers-math.js';

const state = { n: 3, a: 1, b: 0 };
const R = 5;
const at = (s, k) => rotateByI([s.a, s.b], k);
const TEXT = ['1', 'i', '−1', '−i'];

createTool({
  state,
  label: 'The complex plane. A starting point is multiplied by i again and again. Each multiplication turns it a quarter-turn anticlockwise about zero, so the points visit four places and then come home. The arrows show each quarter-turn.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'real', yLabel: 'imaginary' });
    const r = Math.hypot(state.a, state.b);
    if (r > 0) for (let k = 0; k <= 3; k++) { const p = at(state, k); plot.point(p[0], p[1], { fill: c.fillY, r: 5 }); }
    for (let k = 0; k < state.n; k++) {
      const p = plot.toPx(...at(state, k));
      const q = plot.toPx(...at(state, k + 1));
      arrow(ctx, ...p, ...q, { color: c.d, width: 2, head: 8 });
    }
    const now = at(state, state.n);
    plot.point(now[0], now[1], { fill: c.a, r: 9 });
    plot.text(`z·i^${state.n}`, now[0] + 0.9, now[1] + 0.6, { size: 12, color: c.a, patch: false });
  },
  controls: [
    { title: 'Multiply by i, again' },
    { key: 'n', label: 'Times multiplied, n', min: 0, max: 12, step: 1 },
    { key: 'a', label: 'Start, real part', min: -3, max: 3, step: 1 },
    { key: 'b', label: 'Start, imaginary part', min: -3, max: 3, step: 1 },
    { readout: [
      ['iⁿ', (s) => TEXT[((s.n % 4) + 4) % 4]],
      ['n mod 4', (s) => `${s.n % 4}`],
      ['Start × iⁿ', (s) => showComplex(at(s, s.n))],
    ] },
  ],
  tex: (s) => `i^{${s.n}}=i^{${s.n % 4}}=${texComplex(iPower(s.n))},\\quad (${texComplex([s.a, s.b])})\\,i^{${s.n}}=${texComplex(at(s, s.n))}`,
});
