import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { speck, fact, num } from './_is.js';
import { line, label } from '../../lib/draw.js';

// Σ cₙ xⁿ. Terms shrink like (|x|/R)ⁿ: below R they sink, above R they blow up.
const SERIES = {
  geo: { name: 'Σ xⁿ', c: () => 1, R: 1, ends: [false, false] },
  log: { name: 'Σ xⁿ / n', c: (n) => 1 / n, R: 1, ends: [true, false] },
  sq: { name: 'Σ xⁿ / n²', c: (n) => 1 / (n * n), R: 1, ends: [true, true] },
  two: { name: 'Σ (x/2)ⁿ', c: (n) => 2 ** -n, R: 2, ends: [false, false] },
  exp: { name: 'Σ xⁿ / n!', c: (n) => 1 / fact(n), R: Infinity, ends: [true, true] },
  bad: { name: 'Σ n! xⁿ', c: (n) => fact(n), R: 0, ends: [true, true] },
};
const NMAX = 40;
const state = { kind: 'geo', x: 0.5 };
const K = () => SERIES[state.kind];
const term = (n) => K().c(n) * state.x ** n;
const sums = () => { const out = []; let s = 0; for (let n = 1; n <= NMAX; n++) { s += term(n); out.push(s); } return out; };
const inside = () => {
  const { R, ends } = K();
  const a = Math.abs(state.x);
  if (a < R) return true;
  if (a > R) return false;
  return state.x > 0 ? ends[1] : ends[0]; // endpoint −R is index 0, +R is index 1
};
const topH = 46;
const parts = [(s) => ({ x: 0, y: topH, w: s.w, h: (s.h - topH) / 2 }), (s) => ({ x: 0, y: topH + (s.h - topH) / 2, w: s.w, h: (s.h - topH) / 2 })];

createTool({
  state,
  label: 'A number line marking where the series converges, a graph of its partial sums, and a graph of log of the size of each term.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [0, NMAX + 1], y: [-4, 4], c, box: parts[0] }),
    b: createPlot(stage, { x: [0, NMAX + 1], y: [-12, 6], c, box: parts[1] }),
  }),
  draw(ctx, stage, c, { a, b }) {
    // number line, x from −3 to 3
    const px = (v) => 20 + ((v + 3) / 6) * (stage.w - 40);
    const R = K().R;
    const half = Number.isFinite(R) ? Math.min(R, 3) : 3;
    ctx.fillStyle = inside() ? c.fillC : c.fillA;
    ctx.fillRect(px(-half), 10, px(half) - px(-half), 14);
    line(ctx, 20, 17, stage.w - 20, 17, { color: c.ink, width: 3 });
    for (const t of [-3, -2, -1, 0, 1, 2, 3]) label(ctx, String(t).replace('-', '−'), px(t), 36, c, { size: 10, patch: false });
    if (R === 0) line(ctx, px(0), 5, px(0), 29, { color: c.c, width: 4 });
    line(ctx, px(state.x), 3, px(state.x), 31, { color: c.a, width: 4 });
    const S = sums();
    const grow = Math.max(...S.map(Math.abs));
    a.setRange([0, NMAX + 1], [-Math.min(6, Math.max(2, grow * 1.1)), Math.min(6, Math.max(2, grow * 1.1))]);
    a.axes({ xLabel: 'N', yLabel: 'Sₙ' });
    S.forEach((v, i) => speck(ctx, a, i + 1, Math.max(-9, Math.min(9, v)), 3.5, c.a, c.ink));
    b.axes({ xLabel: 'n', yLabel: 'log₁₀|term|' });
    for (let n = 1; n <= NMAX; n++) {
      const t = Math.abs(term(n));
      speck(ctx, b, n, t === 0 ? -12 : Math.max(-12, Math.min(6, Math.log10(t))), 3.5, c.b, c.ink);
    }
    b.segment(0, 0, NMAX + 1, 0, { color: c.ink, width: 1.5, dash: [3, 3] });
  },
  controls: [
    { title: 'Slide x' },
    { key: 'kind', label: 'Power series', options: Object.entries(SERIES).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'x', min: -3, max: 3, step: 0.05, format: (v) => v.toFixed(2).replace('-', '−') },
    { readout: [
      ['Radius R', () => (Number.isFinite(K().R) ? String(K().R) : '∞')],
      ['At this x', () => (inside() ? { text: 'converges', good: true } : { text: 'diverges', good: false })],
      ['S₄₀', () => num(sums()[NMAX - 1], 4)],
      ['|term₄₀|', () => num(Math.abs(term(NMAX)), 3)],
    ] },
  ],
  tex: (s) => `\\sum c_n x^n,\\quad x=${s.x.toFixed(2)},\\quad |x|<R\\ \\Rightarrow\\ \\text{terms behave like }(|x|/R)^n`,
});
