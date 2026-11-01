import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { arrow } from '../../lib/draw.js';
import { conj, div, mul, norm2, showComplex, texComplex, wrapTex } from './_complex-numbers-math.js';

const R = 6;
const state = { a: 3, b: 2, p: 4, q: -1 };
const z = (s = state) => [s.a, s.b];
const w = (s = state) => [s.p, s.q];

const tool = createTool({
  state,
  label: 'The complex plane. The point z is coral and its conjugate, the mirror image in the real axis, is blue. Multiplying them lands on the real axis at a squared plus b squared, in green, because the two angles cancel. Then w divided by z is found as w times the conjugate, divided by that real number, and shown in purple.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'real', yLabel: 'imaginary' });
    const Z = z();
    const ZC = conj(Z);
    const N = norm2(Z);
    plot.segment(Z[0], Z[1], ZC[0], ZC[1], { color: c.grid, width: 2, dash: [5, 4] });
    plot.segment(0, 0, Z[0], Z[1], { color: c.a, width: 4 });
    plot.segment(0, 0, ZC[0], ZC[1], { color: c.b, width: 4 });
    plot.segment(0, 0, N, 0, { color: c.c, width: 6 });
    const Q = N === 0 ? [0, 0] : div(w(), Z);
    plot.segment(0, 0, w()[0], w()[1], { color: c.d, width: 3, dash: [3, 4] });
    plot.segment(0, 0, Q[0], Q[1], { color: c.d, width: 4 });
    plot.point(Z[0], Z[1], { fill: c.a, r: 9 });
    plot.point(ZC[0], ZC[1], { fill: c.b, r: 7 });
    plot.point(w()[0], w()[1], { fill: c.fillY, r: 9 });
    plot.point(Q[0], Q[1], { fill: c.d, r: 7 });
    plot.text('z', Z[0] + 0.5, Z[1] + 0.5, { size: 13, color: c.a, patch: false });
    plot.text('z̄', ZC[0] + 0.5, ZC[1] - 0.5, { size: 13, color: c.b, patch: false });
    plot.text('w', w()[0] + 0.5, w()[1] + 0.5, { size: 13, patch: false });
    plot.text('w ÷ z', Q[0] + 0.7, Q[1] + 0.6, { size: 12, color: c.d, patch: false });
    plot.text(`${N}`, Math.min(N, R - 0.8), 0.6, { size: 12, color: c.c, patch: false });
  },
  controls: [
    { title: 'Choose z and w' },
    { key: 'a', label: 'z, real part a', min: -4, max: 4, step: 1 },
    { key: 'b', label: 'z, imaginary part b', min: -4, max: 4, step: 1 },
    { key: 'p', label: 'w, real part', min: -5, max: 5, step: 1 },
    { key: 'q', label: 'w, imaginary part', min: -5, max: 5, step: 1 },
    { text: 'Drag z (coral) or w, or use the arrow keys.' },
    { readout: [
      ['z · z̄', (s) => `${norm2(z(s))}  (real)`],
      ['w · z̄', (s) => showComplex(mul(w(s), conj(z(s))))],
      ['w ÷ z', (s) => (norm2(z(s)) === 0 ? 'undefined' : showComplex(div(w(s), z(s))))],
    ] },
  ],
  tex: (s) => (norm2(z(s)) === 0
    ? '\\text{z = 0: no division}'
    : `\\dfrac{${texComplex(w(s))}}{${texComplex(z(s))}}\\cdot\\dfrac{${texComplex(conj(z(s)))}}{${texComplex(conj(z(s)))}}=\\dfrac{${texComplex(mul(w(s), conj(z(s))))}}{${norm2(z(s))}}=${texComplex(div(w(s), z(s)))}`),
});

const snap = (v) => Math.max(-5, Math.min(5, Math.round(v)));
const grab = (xKey, yKey, limit) => ({
  at: () => tool.extra.toPx(state[xKey], state[yKey]),
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    state[xKey] = Math.max(-limit, Math.min(limit, snap(x)));
    state[yKey] = Math.max(-limit, Math.min(limit, snap(y)));
  },
  get keyStep() { return Math.abs(tool.extra.toPx(1, 0)[0] - tool.extra.toPx(0, 0)[0]); },
});
handles(tool.stage, [grab('a', 'b', 4), grab('p', 'q', 5)], { onChange: () => tool.update(), radius: 28 });
tool.update();
