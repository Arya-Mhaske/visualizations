import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { add, argDeg, modulus, mul, showComplex, texComplex, wrapTex } from './_complex-numbers-math.js';
import { fixed } from '../../lib/format.js';

const R = 8;
const state = { a: 3, b: 1, p: 1, q: 2, op: 'add' };
const z = (s = state) => [s.a, s.b];
const w = (s = state) => [s.p, s.q];
const result = (s = state) => (s.op === 'add' ? add(z(s), w(s)) : mul(z(s), w(s)));

const tool = createTool({
  state,
  label: 'The complex plane with two draggable points z and w. In add mode, the sum is the far corner of the parallelogram built on the two arrows, which is vector addition. In multiply mode, the product has length equal to the two lengths multiplied, and an angle equal to the two angles added.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'real', yLabel: 'imaginary' });
    const [Z, W, S] = [z(), w(), result()];
    if (state.op === 'add') {
      plot.segment(Z[0], Z[1], S[0], S[1], { color: c.b, width: 2, dash: [5, 4] });
      plot.segment(W[0], W[1], S[0], S[1], { color: c.a, width: 2, dash: [5, 4] });
    } else {
      [Z, W, S].forEach((p) => {
        const r = modulus(p);
        if (r > 0) plot.segment(0, 0, (p[0] / r) * 1.0, (p[1] / r) * 1.0, { color: c.d, width: 4 });
      });
    }
    plot.segment(0, 0, Z[0], Z[1], { color: c.a, width: 4 });
    plot.segment(0, 0, W[0], W[1], { color: c.b, width: 4 });
    plot.segment(0, 0, S[0], S[1], { color: c.c, width: 5 });
    plot.point(Z[0], Z[1], { fill: c.a, r: 9 });
    plot.point(W[0], W[1], { fill: c.b, r: 9 });
    plot.point(S[0], S[1], { fill: c.c, r: 8 });
    plot.text('z', Z[0] + 0.6, Z[1] + 0.6, { size: 13, color: c.a, patch: false });
    plot.text('w', W[0] + 0.6, W[1] + 0.6, { size: 13, color: c.b, patch: false });
    plot.text(state.op === 'add' ? 'z + w' : 'z × w', S[0] + 0.9, S[1] + 0.6, { size: 12, color: c.c, patch: false });
  },
  controls: [
    { title: 'Add or multiply' },
    { key: 'op', label: 'Operation', options: [['add', 'z + w'], ['mul', 'z × w']] },
    { key: 'a', label: 'z, real part', min: -5, max: 5, step: 1 },
    { key: 'b', label: 'z, imaginary part', min: -5, max: 5, step: 1 },
    { key: 'p', label: 'w, real part', min: -5, max: 5, step: 1 },
    { key: 'q', label: 'w, imaginary part', min: -5, max: 5, step: 1 },
    { text: 'Drag z (coral) or w (blue), or use the arrow keys.' },
    { readout: [
      ['Result', (s) => showComplex(result(s))],
      ['Length |result|', (s) => fixed(modulus(result(s)), 3)],
      ['Angle of result', (s) => (modulus(result(s)) ? `${fixed(argDeg(result(s)), 1)}°` : 'undefined')],
      ['|z|, |w|', (s) => `${fixed(modulus(z(s)), 2)}, ${fixed(modulus(w(s)), 2)}`],
    ] },
  ],
  tex: (s) => (s.op === 'add'
    ? `${wrapTex(z(s))}+${wrapTex(w(s))}=${texComplex(result(s))}`
    : `${wrapTex(z(s))}${wrapTex(w(s))}=${texComplex(result(s))}`),
});

const snap = (v) => Math.max(-5, Math.min(5, Math.round(v)));
const grab = (xKey, yKey) => ({
  at: () => tool.extra.toPx(state[xKey], state[yKey]),
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    state[xKey] = snap(x);
    state[yKey] = snap(y);
  },
  get keyStep() { return Math.abs(tool.extra.toPx(1, 0)[0] - tool.extra.toPx(0, 0)[0]); },
});
handles(tool.stage, [grab('a', 'b'), grab('p', 'q')], { onChange: () => tool.update(), radius: 28 });
tool.update();
