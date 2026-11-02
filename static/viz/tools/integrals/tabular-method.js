import { createStepper } from '../../lib/stepper.js';

// ∫ xⁿ g(x) dx. Left column: xⁿ and its derivatives down to 0. Right column: g and its antiderivatives.
// Multiply down the diagonals with alternating signs + − + − …
const KINDS = {
  exp: ['eˣ', () => ({ s: 1, f: 'e^x' }), 'e^x'],
  sin: ['sin x', (k) => [{ s: -1, f: '\\cos x' }, { s: -1, f: '\\sin x' }, { s: 1, f: '\\cos x' }, { s: 1, f: '\\sin x' }][(k - 1) % 4], '\\sin x'],
  cos: ['cos x', (k) => [{ s: 1, f: '\\sin x' }, { s: -1, f: '\\cos x' }, { s: -1, f: '\\sin x' }, { s: 1, f: '\\cos x' }][(k - 1) % 4], '\\cos x'],
};
const state = { kind: 'exp', n: 2 };
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const poly = (n, k) => {
  const coef = fact(n) / fact(n - k);
  const m = n - k;
  const xs = m === 0 ? '' : m === 1 ? 'x' : `x^${m}`;
  return coef === 1 && xs ? xs : `${coef}${xs}`;
};
const signed = (k, G) => {
  const sg = (k % 2 ? -1 : 1) * G.s;
  return { sg, text: `${poly(state.n, k)}${G.f ? '' : ''}\\,${G.f}` };
};
const rowTex = (n, kind, k) => {
  const G = KINDS[kind][1](k + 1);
  const pr = `${poly(n, k)}`;
  return { G, sg: (k % 2 ? -1 : 1) * G.s, body: pr === '1' ? G.f : `${pr}\\,${G.f}` };
};

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  controls: [
    { title: 'Set up the table' },
    { key: 'kind', label: 'Multiply xⁿ by', options: Object.entries(KINDS).map(([k, v]) => [k, v[0]]) },
    { key: 'n', label: 'Power n', min: 1, max: 4, step: 1 },
  ],
  steps: (s) => {
    const { n, kind } = s;
    const out = [
      { text: 'The integral. Differentiate the polynomial until it reaches 0, and integrate the other factor once for each step.', tex: `\\int x^{${n}}${KINDS[kind][2]}\\,dx` },
    ];
    let answer = '';
    for (let k = 0; k <= n; k++) {
      const r = rowTex(n, kind, k);
      const D = k <= n ? `${poly(n, k).replace(/^1$/, '1')}` : '0';
      out.push({
        text: `Row ${k + 1}: left ${k === 0 ? 'xⁿ itself' : `the ${k === 1 ? 'first' : k + 'th'} derivative`}, right the antiderivative number ${k + 1}. The sign is ${(k % 2 ? '−' : '+')} (times the sign inside the antiderivative).`,
        tex: `\\underbrace{${D}}_{\\text{left}}\\ \\times\\ \\underbrace{${r.G.s < 0 ? '-' : ''}${r.G.f}}_{\\text{right}}\\ \\to\\ ${r.sg < 0 ? '-' : '+'}\\,${r.body}`,
      });
      answer += `${r.sg < 0 ? '-' : answer ? '+' : ''}${r.body}`;
    }
    out.push({ text: 'The next left entry is 0, so the table stops. Add the rows.', tex: `${answer}+C` });
    return out;
  },
});
void signed;
