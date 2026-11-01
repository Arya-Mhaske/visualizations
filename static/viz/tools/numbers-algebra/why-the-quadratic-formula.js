import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { disc, realRoots, tiles } from './_quadratic-equations-math.js';

const state = { step: 0, a: 1, b: 4, c: -5 };
const lower = (stage) => ({ x: 0, y: stage.h * 0.58, w: stage.w, h: stage.h * 0.42 });
const X = 2.2; // x is unknown, so the square is drawn with a nominal side
const LINES = [
  'Tiles: one x² square and one strip (b/a)x',
  'Split the strip in two and wrap it round the square',
  'A corner is missing: (b/2a)²',
  'Add the corner to both sides: a perfect square',
  'Take the square root: both signs count',
];

function texFor(s) {
  const T = tiles(s.a, s.b, s.c);
  const f = (v) => fixed(v, 3);
  const D = disc(s.a, s.b, s.c);
  return [
    `x^2+${f(T.p)}x=${f(T.q)}`,
    `x^2+2(${f(T.t)})x=${f(T.q)}`,
    `x^2+2(${f(T.t)})x+${f(T.corner)}=${f(T.q)}+${f(T.corner)}`,
    `(x+${f(T.t)})^2=${f(T.rhs)}=\\dfrac{${D}}{${4 * s.a * s.a}}`,
    D < 0 ? `x=-${f(T.t)}\\pm\\sqrt{${f(T.rhs)}}\\ \\text{(not real: the right side is negative)}` : `x=-${f(T.t)}\\pm${f(Math.sqrt(T.rhs))}\\ \\Rightarrow\\ x=${realRoots(s.a, s.b, s.c).map(f).join(',\\ ')}`,
  ][s.step];
}

createTool({
  state,
  label: 'Top: algebra tiles for completing the square. An x-squared square and a strip of area b over a times x are rearranged. The strip is split in two and wrapped round the square, leaving a small square corner missing. Adding that corner makes one big square. Bottom: the parabola with its roots marked, so the formula\'s answer visibly lands where the graph crosses the axis.',
  setup: (stage, c) => createPlot(stage, { x: [-8, 8], y: [-12, 12], c, box: lower, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const T = tiles(state.a, state.b, state.c);
    const t = Math.max(0.4, Math.abs(T.t));
    const k = Math.min((stage.w * 0.9) / (X + 2 * t), (stage.h * 0.5) / (X + t + 0.4));
    const [x0, y0] = [stage.w * 0.05 + 6, 22];
    const rect = (u, v, w, h, fill, dash = false) => poly(ctx, [[x0 + u * k, y0 + v * k], [x0 + (u + w) * k, y0 + v * k], [x0 + (u + w) * k, y0 + (v + h) * k], [x0 + u * k, y0 + (v + h) * k]], { fill, stroke: c.ink, width: 2, dash: dash ? [5, 4] : [] });
    const say = (text, u, v, color) => label(ctx, text, x0 + u * k, y0 + v * k, c, { size: 10, color, bounds: stage, patch: false });
    rect(0, 0, X, X, c.fillA);
    say('x²', X / 2, X / 2, c.ink);
    if (state.step === 0) {
      rect(X, 0, 2 * t, X, c.fillB);
      say('(b/a)x', X + t, X / 2, c.ink);
    } else {
      rect(X, 0, t, X, c.fillB);
      rect(0, X, X, t, c.fillB);
      say('(b/2a)x', X + t / 2, X / 2, c.ink);
      say('(b/2a)x', X / 2, X + t / 2, c.ink);
    }
    if (state.step >= 2) {
      rect(X, X, t, t, state.step === 2 ? c.fillY : c.fillC, state.step === 2);
      say('(b/2a)²', X + t / 2, X + t / 2, c.ink);
    }
    if (state.step >= 3) say(`side x + b/2a`, (X + t) / 2, X + t + 0.35, c.ink);
    label(ctx, LINES[state.step], stage.w / 2, 10, c, { size: 11, bounds: stage });
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => state.a * x * x + state.b * x + state.c, { color: c.a, width: 3 });
    realRoots(state.a, state.b, state.c).forEach((r) => plot.point(r, 0, { fill: state.step === 4 ? c.c : c.fillY, r: 7 }));
  },
  controls: [
    { title: 'Complete the square' },
    { key: 'step', label: 'Tile move', min: 0, max: 4, step: 1, format: (n) => `${n + 1} of 5` },
    { key: 'a', label: 'a', min: 1, max: 3, step: 1 },
    { key: 'b', label: 'b', min: 1, max: 8, step: 1 },
    { key: 'c', label: 'c', min: -8, max: 4, step: 1 },
    { readout: [
      ['Half of b/a', (s) => fixed(tiles(s.a, s.b, s.c).t, 3)],
      ['Missing corner', (s) => fixed(tiles(s.a, s.b, s.c).corner, 3)],
      ['b² − 4ac', (s) => `${disc(s.a, s.b, s.c)}`],
      ['Roots', (s) => (realRoots(s.a, s.b, s.c).length ? realRoots(s.a, s.b, s.c).map((r) => fixed(r, 3)).join(', ') : 'none real')],
    ] },
  ],
  tex: texFor,
});
