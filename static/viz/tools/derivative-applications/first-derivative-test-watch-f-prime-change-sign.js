import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FUNS, xAt, boxes, curveBySign, roots, sign, num } from './_da.js';

// Slide a probe through a critical value c. Read the sign of f′ just before (c − δ) and just after (c + δ).
const FN = { ...FUNS, cube: { name: 'x³', f: (x) => x ** 3, d: (x) => 3 * x * x, d2: (x) => 6 * x, x: [-2, 2], y: [-4, 4] } };
delete FN.hill;
const state = { fn: 'quartic', p: 50, delta: 0.3 };
const K = () => FN[state.fn];
const X = () => xAt(K(), state.p);
const crit = () => roots(K().d, K().x[0], K().x[1]).concat(state.fn === 'cube' ? [0] : []);
const near = () => crit().reduce((m, r) => (m === null || Math.abs(r - X()) < Math.abs(m - X()) ? r : m), null);
const syms = { 1: '+', '-1': '−', 0: '0' };
const read = () => {
  const c = near();
  if (c === null) return null;
  const l = sign(K().d(c - state.delta), 1e-6);
  const r = sign(K().d(c + state.delta), 1e-6);
  return { c, l, r, text: l > 0 && r < 0 ? 'maximum' : l < 0 && r > 0 ? 'minimum' : 'neither' };
};
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: the graph coloured green where f prime is positive and coral where negative, with probe points either side of the nearest critical value. Bottom: f prime itself, crossing zero.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: bA }), b: createPlot(stage, { x: [-3, 3], y: [-3, 3], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    const r = read();
    a.setRange(k.x, k.y);
    const m = Math.max(2, ...Array.from({ length: 60 }, (_, i) => Math.abs(k.d(k.x[0] + ((k.x[1] - k.x[0]) * i) / 59))));
    b.setRange(k.x, [-m * 1.1, m * 1.1]);
    a.axes({ xLabel: 'x', yLabel: 'f' });
    curveBySign(ctx, a, k.f, k.d, k.x[0], k.x[1], c);
    b.axes({ xLabel: 'x', yLabel: "f′" });
    b.fn(k.d, { color: c.b, width: 3 });
    if (r) {
      for (const x of [r.c - state.delta, r.c + state.delta]) {
        a.point(x, k.f(x), { fill: k.d(x) > 1e-6 ? c.c : k.d(x) < -1e-6 ? c.a : c.ink, r: 6 });
        b.point(x, k.d(x), { fill: k.d(x) > 1e-6 ? c.c : k.d(x) < -1e-6 ? c.a : c.ink, r: 6 });
      }
      a.segment(r.c, k.y[0], r.c, k.y[1], { color: c.d, width: 2, dash: [5, 4] });
    }
    a.point(X(), k.f(X()), { fill: c.b });
  },
  controls: [
    { title: 'Probe a critical point' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'p', label: 'Move the probe', min: 0, max: 100, step: 1, format: (v) => `x = ${xAt(K(), v).toFixed(2).replace('-', '−')}` },
    { key: 'delta', label: 'Probe distance δ', min: 0.1, max: 0.6, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Nearest critical value', () => (read() ? num(read().c, 3) : 'none')],
      ['Sign of f′ before → after', () => (read() ? `${syms[read().l]} → ${syms[read().r]}` : '—')],
      ['Verdict', () => (read() ? { text: read().text, good: read().text !== 'neither' } : '—')],
    ] },
  ],
  tex: () => "+\\to-:\\ \\text{max};\\quad -\\to+:\\ \\text{min};\\quad \\text{no change: neither}",
});
