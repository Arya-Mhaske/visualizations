import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, roots, sign, curveBySign, num } from './_da.js';

// Sign chart for f′: split the line at its zeros, test one point in each piece. No sign change inside a piece.
const FN = {
  a: { name: 'x³ − 3x', f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, x: [-3, 3], y: [-4, 4] },
  b: { name: 'x⁴/4 − 2x² + 1', f: (x) => x ** 4 / 4 - 2 * x * x + 1, d: (x) => x ** 3 - 4 * x, x: [-3.2, 3.2], y: [-4, 5] },
  c: { name: 'x e^(−x²/2)', f: (x) => x * Math.exp(-x * x / 2), d: (x) => (1 - x * x) * Math.exp(-x * x / 2), x: [-3.5, 3.5], y: [-1, 1] },
  d: { name: '2x³ − 9x² + 12x', f: (x) => 2 * x ** 3 - 9 * x * x + 12 * x, d: (x) => 6 * x * x - 18 * x + 12, x: [-0.5, 3.5], y: [-2, 12] },
};
const state = { fn: 'a', p: 50 };
const K = () => FN[state.fn];
const X = () => K().x[0] + (state.p / 100) * (K().x[1] - K().x[0]);
const cuts = () => [K().x[0], ...roots(K().d, K().x[0], K().x[1]), K().x[1]];
const pieces = () => { const c = cuts(); return c.slice(0, -1).map((lo, i) => ({ lo, hi: c[i + 1], s: sign(K().d((lo + c[i + 1]) / 2)) })); };
const inPiece = () => pieces().find((p) => X() >= p.lo && X() <= p.hi);
const label = (p) => `(${num(p.lo, 2)}, ${num(p.hi, 2)}) ${p.s > 0 ? 'increasing' : 'decreasing'}`;
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: the graph with stretches coloured green where it increases and coral where it decreases. Bottom: f prime with its zeros marked where the colour changes, and a test point.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: bA }), b: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    const m = Math.max(1, ...Array.from({ length: 60 }, (_, i) => Math.abs(k.d(k.x[0] + ((k.x[1] - k.x[0]) * i) / 59))));
    a.setRange(k.x, k.y);
    b.setRange(k.x, [-m * 1.15, m * 1.15]);
    a.axes({ xLabel: 'x', yLabel: 'f' });
    b.axes({ xLabel: 'x', yLabel: "f′" });
    for (const p of pieces()) {
      a.shade(() => k.y[1], () => k.y[0], p.lo, p.hi, p.s > 0 ? c.fillC : c.fillA);
      b.shade(() => m * 1.15, () => -m * 1.15, p.lo, p.hi, p.s > 0 ? c.fillC : c.fillA);
    }
    curveBySign(ctx, a, k.f, k.d, k.x[0], k.x[1], c);
    b.fn(k.d, { color: c.b, width: 3 });
    for (const r of cuts().slice(1, -1)) { a.point(r, k.f(r), { fill: c.d, r: 6 }); b.point(r, 0, { fill: c.d, r: 6 }); }
    b.point(X(), k.d(X()), { fill: c.ink, r: 7 });
  },
  controls: [
    { title: 'Test a point in each piece' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'p', label: 'Test point', min: 0, max: 100, step: 1, format: (v) => `x = ${(K().x[0] + (v / 100) * (K().x[1] - K().x[0])).toFixed(2).replace('-', '−')}` },
    { readout: [
      ["f′ = 0 at", () => cuts().slice(1, -1).map((r) => num(r, 3)).join(', ') || 'nowhere'],
      ['Sign of f′ at test point', () => (sign(K().d(X())) > 0 ? { text: '+', good: true } : sign(K().d(X())) < 0 ? { text: '−', good: false } : '0')],
      ['Piece containing it', () => (inPiece() ? label(inPiece()) : '—')],
      ['All pieces', () => pieces().map(label).join(';  ')],
    ] },
  ],
  tex: () => "f'>0\\ \\text{on a piece: increasing};\\quad f'<0:\\ \\text{decreasing}",
});
