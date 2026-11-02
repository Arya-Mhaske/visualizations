import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';

// Three claims P(n), tested for n = 1..42.
const isPrime = (m) => { if (m < 2) return false; for (let d = 2; d * d <= m; d++) if (m % d === 0) return false; return true; };
const CLAIMS = {
  good: { name: '1 + 2 + … + n = n(n + 1)/2', text: '1+2+\\cdots+n=\\dfrac{n(n+1)}{2}', holds: () => true, step: 'adding n + 1 to both sides gives the formula for n + 1', first: null },
  five: { name: '1 + 2 + … + n = n(n + 1)/2 + 5', text: '1+2+\\cdots+n=\\dfrac{n(n+1)}{2}+5', holds: () => false, step: 'adding n + 1 to both sides keeps both sides equal, so the step is fine', first: 1 },
  prime: { name: 'n² + n + 41 is prime', text: 'n^2+n+41\\ \\text{is prime}', holds: (n) => isPrime(n * n + n + 41), step: 'no algebra can carry primality from n to n + 1', first: 40 },
};
const state = { claim: 'prime', n: 39 };
const truth = (s, n) => CLAIMS[s.claim].holds(n);
const baseOk = (s) => truth(s, 1);
const linkOk = (s, n) => !(truth(s, n) && !truth(s, n + 1));
const firstBreak = (s) => { for (let n = 1; n <= 60; n++) if (!linkOk(s, n)) return n; return null; };
const COLS = 14;
const MAXN = 42;

const tool = createTool({
  state,
  label: 'Forty-two cells numbered 1 to 42 in three rows. A cell is green if the claim is true for that n and coral if it is false. For the claim that n squared plus n plus 41 is prime, the first thirty-nine cells are green and cell 40 is coral. The chosen n has a thick border.',
  draw(ctx, stage, c) {
    const cw = (stage.w - 20) / COLS;
    const ch = Math.min(cw * 1.1, (stage.h * 0.62) / 3);
    for (let n = 1; n <= MAXN; n++) {
      const x = 10 + ((n - 1) % COLS) * cw;
      const y = 14 + Math.floor((n - 1) / COLS) * (ch + 4);
      ctx.fillStyle = truth(state, n) ? c.fillC : c.fillA;
      ctx.fillRect(x + 1, y, cw - 2, ch);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = n === state.n ? 4 : 1;
      ctx.strokeRect(x + 1, y, cw - 2, ch);
      label(ctx, String(n), x + cw / 2, y + ch / 2, c, { size: Math.min(11, cw * 0.4), patch: false });
    }
    label(ctx, 'green: P(n) true    coral: P(n) false', stage.w / 2, stage.h * 0.76, c, { size: 10, patch: false });
    const fb = firstBreak(state);
    if (fb && fb < MAXN) label(ctx, `chain breaks between ${fb} and ${fb + 1}`, stage.w / 2, stage.h * 0.86, c, { size: 11, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Test a claim' },
    { key: 'claim', label: 'Claim P(n)', options: Object.entries(CLAIMS).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Look at n', min: 1, max: MAXN - 1, step: 1 },
    { readout: [
      ['Base case P(1)', (s) => ({ text: baseOk(s) ? 'true' : 'FALSE', good: baseOk(s) })],
      ['P(n) is', (s) => (truth(s, s.n) ? 'true' : 'false')],
      ['P(n) ⇒ P(n+1)', (s) => ({ text: linkOk(s, s.n) ? 'holds' : 'FAILS here', good: linkOk(s, s.n) })],
      ['Link holds for every n?', (s) => (s.claim === 'prime' ? 'no (fails at 39 → 40)' : 'yes')],
      ['A proof?', (s) => { const ok = s.claim === 'good'; return { text: ok ? 'yes, both steps hold' : 'no', good: ok }; }],
    ] },
  ],
  tex: (s) => (s.claim === 'prime' ? 'n=40:\\ 40^2+40+41=1681=41^2' : CLAIMS[s.claim].text),
});

tool.update();
