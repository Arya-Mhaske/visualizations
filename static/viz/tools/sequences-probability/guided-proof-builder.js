import { createStepper } from '../../lib/stepper.js';

// Each formula: the sum's term, the claimed total f(n), and the algebra of the inductive step in TeX.
const F = {
  sum: {
    name: '1 + 2 + … + n',
    claim: '1+2+\\cdots+n=\\dfrac{n(n+1)}{2}',
    term: (i) => i,
    f: (n) => (n * (n + 1)) / 2,
    algebra: (k) => `\\dfrac{k(k+1)}{2}+(k+1)=\\dfrac{(k+1)(k+2)}{2}`,
  },
  odd: {
    name: '1 + 3 + 5 + … + (2n − 1)',
    claim: '1+3+5+\\cdots+(2n-1)=n^2',
    term: (i) => 2 * i - 1,
    f: (n) => n * n,
    algebra: () => 'k^2+(2k+1)=(k+1)^2',
  },
  sq: {
    name: '1² + 2² + … + n²',
    claim: '1^2+2^2+\\cdots+n^2=\\dfrac{n(n+1)(2n+1)}{6}',
    term: (i) => i * i,
    f: (n) => (n * (n + 1) * (2 * n + 1)) / 6,
    algebra: () => '\\dfrac{k(k+1)(2k+1)}{6}+(k+1)^2=\\dfrac{(k+1)(k+2)(2k+3)}{6}',
  },
  cube: {
    name: '1³ + 2³ + … + n³',
    claim: '1^3+2^3+\\cdots+n^3=\\left[\\dfrac{n(n+1)}{2}\\right]^2',
    term: (i) => i ** 3,
    f: (n) => ((n * (n + 1)) / 2) ** 2,
    algebra: () => '\\left[\\dfrac{k(k+1)}{2}\\right]^2+(k+1)^3=\\left[\\dfrac{(k+1)(k+2)}{2}\\right]^2',
  },
  geo: {
    name: '1 + 2 + 4 + … + 2ⁿ⁻¹',
    claim: '1+2+4+\\cdots+2^{n-1}=2^n-1',
    term: (i) => 2 ** (i - 1),
    f: (n) => 2 ** n - 1,
    algebra: () => '(2^k-1)+2^k=2^{k+1}-1',
  },
};
const state = { key: 'sum', k: 4 };
const dir = (n) => Array.from({ length: n }, (_, i) => i + 1);
const total = (s, n) => dir(n).reduce((a, i) => a + F[s.key].term(i), 0);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  controls: [
    { title: 'Choose a formula' },
    { key: 'key', label: 'Claim', options: Object.entries(F).map(([k, v]) => [k, v.name]) },
    { key: 'k', label: 'Test the step at k =', min: 1, max: 12, step: 1 },
  ],
  steps: (s) => {
    const f = F[s.key];
    const k = s.k;
    return [
      { text: 'The claim P(n), for every whole number n ≥ 1:', tex: f.claim },
      { text: `Base case, n = 1. The left side is just ${f.term(1)}. The right side is ${f.f(1)}.`, tex: `\\text{LHS}=${total(s, 1)}\\qquad \\text{RHS}=${f.f(1)}\\qquad\\text{equal, so }P(1)\\text{ is true}` },
      { text: `Assume P(k) is true for some k. Here k = ${k}: the sum of the first ${k} terms is ${total(s, k)}, and the formula gives ${f.f(k)}.`, tex: `\\text{sum}_k=${total(s, k)}=f(${k})=${f.f(k)}` },
      { text: `Add the next term, number ${k + 1}, which is ${f.term(k + 1)}, to both sides.`, tex: `\\text{sum}_{${k + 1}}=f(${k})+${f.term(k + 1)}=${f.f(k) + f.term(k + 1)}` },
      { text: 'The algebra: the new right side must equal the formula with n = k + 1.', tex: f.algebra(k) },
      { text: `Check with numbers: f(${k + 1}) = ${f.f(k + 1)}, and ${f.f(k)} + ${f.term(k + 1)} = ${f.f(k) + f.term(k + 1)}. They match, so P(k) ⇒ P(k + 1).`, tex: `${f.f(k) + f.term(k + 1)}=${f.f(k + 1)}` },
      { text: 'Conclusion. P(1) is true, and P(k) ⇒ P(k + 1) for every k. By induction, P(n) is true for all n ≥ 1.' },
    ];
  },
});
