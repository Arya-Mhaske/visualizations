import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';
import { num } from './_is.js';

// Write each term as a difference f(n) − f(n+k). Everything in the middle cancels in pairs.
const SERIES = {
  one: { name: '1/(n(n+1)) = 1/n − 1/(n+1)', f: (n) => 1 / n, ft: (n) => `1/${n}`, k: 1, s: 1, a: (n) => 1 / (n * (n + 1)), S: (N) => 1 - 1 / (N + 1), limit: 1, tex: '\\frac{1}{n(n+1)}=\\frac1n-\\frac1{n+1}' },
  two: { name: '1/(n(n+2)) = ½(1/n − 1/(n+2))', f: (n) => 0.5 / n, ft: (n) => `1/${2 * n}`, k: 2, s: 1, a: (n) => 1 / (n * (n + 2)), S: (N) => 0.5 * (1 + 0.5 - 1 / (N + 1) - 1 / (N + 2)), limit: 0.75, tex: '\\frac{1}{n(n+2)}=\\frac12\\left(\\frac1n-\\frac1{n+2}\\right)' },
  root: { name: '√(n+1) − √n', f: (n) => Math.sqrt(n), ft: (n) => `√${n}`, k: 1, s: -1, a: (n) => Math.sqrt(n + 1) - Math.sqrt(n), S: (N) => Math.sqrt(N + 1) - 1, limit: Infinity, tex: '\\sqrt{n+1}-\\sqrt n' },
};
const state = { kind: 'one', N: 4 };
const T = () => SERIES[state.kind];
const direct = (N) => { let s = 0; for (let n = 1; n <= N; n++) s += T().a(n); return s; };

createTool({
  state,
  label: 'A table of terms, each written as a plus part and a minus part. Lines join each minus part to the matching plus part in a later column, and only the first and last pieces are left uncancelled.',
  draw(ctx, stage, c) {
    const t = T();
    const cols = state.N;
    const x0 = 34;
    const gap = (stage.w - x0 - 12) / Math.max(cols, 6);
    const yTop = stage.h * 0.2;
    const yBot = stage.h * 0.62;
    label(ctx, 'term', 18, stage.h * 0.08, c, { size: 11 });
    for (let n = 1; n <= cols; n++) {
      const x = x0 + (n - 0.5) * gap;
      label(ctx, `n=${n}`, x, stage.h * 0.08, c, { size: 11 });
      const plusFirst = t.s === 1;
      const topText = (plusFirst ? '+' : '−') + t.ft(n);
      const botText = (plusFirst ? '−' : '+') + t.ft(n + t.k);
      const topDead = n > t.k; // matched by the lower part of an earlier column
      const botDead = n + t.k <= cols;
      label(ctx, topText, x, yTop, c, { size: 12, color: topDead ? c.grid : c.a, patch: false });
      label(ctx, botText, x, yBot, c, { size: 12, color: botDead ? c.grid : c.b, patch: false });
      if (n + t.k <= cols) {
        const xs = x0 + (n + t.k - 0.5) * gap;
        line(ctx, x + 6, yBot - 10, xs - 6, yTop + 10, { color: c.c, width: 2 });
      }
    }
    const sign = (v) => (v ? '+' : '−');
    const left = [];
    for (let n = 1; n <= cols; n++) {
      if (n <= t.k) left.push(`${sign(t.s === 1)}${t.ft(n)}`);
      if (n + t.k > cols) left.push(`${sign(t.s !== 1)}${t.ft(n + t.k)}`);
    }
    label(ctx, `left over: ${left.join(' ')}`, stage.w / 2, stage.h * 0.82, c, { size: 12, color: c.ink });
  },
  controls: [
    { title: 'Add the terms' },
    { key: 'kind', label: 'Series', options: Object.entries(SERIES).map(([k, v]) => [k, v.name]) },
    { key: 'N', label: 'Terms added N', min: 1, max: 8, step: 1 },
    { readout: [
      ['Add them one by one', () => num(direct(state.N), 5)],
      ['Use what is left over', () => num(T().S(state.N), 5)],
      ['S at N = 1,000,000', () => num(T().S(1e6), 5)],
      ['The infinite sum', () => (Number.isFinite(T().limit) ? { text: num(T().limit, 4), good: true } : { text: 'none: it keeps growing', good: false })],
    ] },
  ],
  tex: (s) => `\\sum_{n=1}^{${s.N}} a_n,\\quad a_n=${SERIES[s.kind].tex}`,
});
