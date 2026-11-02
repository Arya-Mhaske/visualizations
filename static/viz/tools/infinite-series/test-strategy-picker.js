import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';

// Each series lists the tests that settle it. `best` is the quickest one.
const TESTS = {
  div: 'nth-term (divergence)', geo: 'Geometric / p-series', int: 'Integral test', cmp: 'Comparison', lim: 'Limit comparison',
  alt: 'Alternating series', ratio: 'Ratio test', root: 'Root test',
};
const BANK = [
  { s: 'Σ (n+1)/(2n+5)', ok: ['div'], best: 'div', verdict: 'diverges', why: 'The terms tend to 1/2, not 0.' },
  { s: 'Σ (2/3)ⁿ', ok: ['geo', 'ratio', 'root'], best: 'geo', verdict: 'converges', why: 'Geometric with ratio 2/3.' },
  { s: 'Σ 1/n^1.5', ok: ['geo', 'int'], best: 'geo', verdict: 'converges', why: 'A p-series with p = 1.5 > 1.' },
  { s: 'Σ n!/10ⁿ', ok: ['ratio', 'div'], best: 'ratio', verdict: 'diverges', why: 'Ratio (n+1)/10 grows past 1 (terms do not tend to 0).' },
  { s: 'Σ n / 3ⁿ', ok: ['ratio', 'root', 'int'], best: 'ratio', verdict: 'converges', why: 'Ratio → 1/3.' },
  { s: 'Σ (n/(2n+1))ⁿ', ok: ['root', 'ratio'], best: 'root', verdict: 'converges', why: 'ⁿ√aₙ = n/(2n+1) → 1/2.' },
  { s: 'Σ 1/(n² + 5)', ok: ['cmp', 'lim', 'int'], best: 'cmp', verdict: 'converges', why: 'Smaller than Σ 1/n².' },
  { s: 'Σ (3n+1)/(n³ − n + 2)', ok: ['lim'], best: 'lim', verdict: 'converges', why: 'Behaves like 3/n²: limit comparison.' },
  { s: 'Σ (−1)ⁿ / √n', ok: ['alt'], best: 'alt', verdict: 'converges (conditionally)', why: 'Terms fall to 0 and alternate.' },
  { s: 'Σ 1/(n ln n), n ≥ 2', ok: ['int'], best: 'int', verdict: 'diverges', why: '∫ dx/(x ln x) = ln ln x grows forever.' },
  { s: 'Σ 1/ln n, n ≥ 2', ok: ['cmp', 'lim'], best: 'cmp', verdict: 'diverges', why: 'Terms tend to 0, but 1/ln n > 1/n: compare with Σ 1/n.' },
  { s: 'Σ 1/n!', ok: ['ratio', 'cmp'], best: 'ratio', verdict: 'converges', why: 'Ratio 1/(n+1) → 0.' },
];
const state = { i: 0, guess: 'div', shown: false };

createTool({
  state,
  label: 'A series written out, and a list of tests with a tick against each test that can settle it.',
  draw(ctx, stage, c) {
    const q = BANK[state.i];
    label(ctx, q.s, stage.w / 2, stage.h * 0.14, c, { size: Math.min(26, stage.w / 12), color: c.ink });
    const keys = Object.keys(TESTS);
    keys.forEach((k, j) => {
      const y = stage.h * 0.3 + j * (stage.h * 0.075);
      const open = state.shown;
      const ok = q.ok.includes(k);
      const mark = !open ? '?' : ok ? (k === q.best ? '★ quickest' : '✓ works') : '✗ no use';
      label(ctx, `${TESTS[k]}  ${k === state.guess ? '◄ your pick' : ''}`, 14, y, c, { size: 12, align: 'left', color: k === state.guess ? c.a : c.ink });
      label(ctx, mark, stage.w - 14, y, c, { size: 12, align: 'right', color: open && ok ? c.c : c.ink });
    });
    if (state.shown) {
      label(ctx, `${q.verdict}: ${q.why}`.slice(0, 60), stage.w / 2, stage.h * 0.94, c, { size: 12, color: c.ink });
    }
  },
  controls: [
    { title: 'Choose a test' },
    { key: 'i', label: 'Series number', min: 0, max: BANK.length - 1, step: 1, format: (v) => `${v + 1} of ${BANK.length}` },
    { key: 'guess', label: 'Your test', options: Object.entries(TESTS).map(([k, v]) => [k, v.split(' ')[0]]) },
    { key: 'shown', label: 'Reveal which tests work', toggle: true },
    { readout: [
      ['Your pick', () => (state.shown ? (BANK[state.i].ok.includes(state.guess) ? { text: 'settles it', good: true } : { text: 'cannot settle it', good: false }) : 'reveal to see')],
      ['Verdict', () => (state.shown ? BANK[state.i].verdict : 'hidden')],
      ['Why', () => (state.shown ? BANK[state.i].why : 'hidden')],
    ] },
  ],
});
