import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Work backwards from |f(x) − L| < ε to find δ, then write the proof forwards.
const g = (v) => String(Number(v.toFixed(4)));
const PROBS = {
  lin: {
    name: 'Linear: lim (m x + b) = m a + b',
    tex: (s) => `\\lim_{x\\to ${s.a}}(${s.m}x+${s.b})=${s.m * s.a + s.b}`,
    steps: (s) => {
      const L = s.m * s.a + s.b; const d = s.eps / Math.abs(s.m);
      return [
        { text: 'Goal: for every ε > 0 find δ > 0 so that |x − a| < δ forces |f(x) − L| < ε.', tex: `|(${s.m}x+${s.b})-${L}|<\\varepsilon` },
        { text: 'Scratch work: simplify the left side so |x − a| appears.', tex: `|${s.m}x-${s.m * s.a}|=${Math.abs(s.m)}\\,|x-${s.a}|` },
        { text: 'So we need this to be smaller than ε.', tex: `${Math.abs(s.m)}\\,|x-${s.a}|<\\varepsilon\\iff |x-${s.a}|<\\dfrac{\\varepsilon}{${Math.abs(s.m)}}` },
        { text: 'Choose δ to be exactly that.', tex: `\\delta=\\dfrac{\\varepsilon}{${Math.abs(s.m)}}` },
        { text: `Proof, written forwards. If |x − ${s.a}| < δ then |f(x) − ${L}| = ${Math.abs(s.m)}|x − ${s.a}| < ${Math.abs(s.m)}δ = ε.`, tex: '\\blacksquare' },
        { text: `Check with ε = ${s.eps}: δ = ${g(d)}. Every x within ${g(d)} of ${s.a} gives f(x) within ${s.eps} of ${L}.` },
      ];
    },
  },
  quad: {
    name: 'Quadratic: lim x² = a²',
    tex: (s) => `\\lim_{x\\to ${s.a}}x^2=${s.a * s.a}`,
    steps: (s) => {
      const a = s.a; const d = Math.min(1, s.eps / (2 * Math.abs(a) + 1));
      return [
        { text: 'Goal: |x² − a²| < ε whenever |x − a| < δ.', tex: `|x^2-${a * a}|<\\varepsilon` },
        { text: 'Factor so |x − a| appears. The other factor |x + a| is a nuisance.', tex: `|x^2-${a * a}|=|x-${a}|\\,|x+${a}|` },
        { text: 'Tame it: first insist δ ≤ 1. Then |x − a| < 1 so x is within 1 of a, and |x + a| is at most 2|a| + 1.', tex: `|x+${a}|\\le ${2 * Math.abs(a) + 1}` },
        { text: 'Now |x² − a²| ≤ (2|a|+1)|x − a|. We need this below ε.', tex: `\\delta=\\min\\!\\left(1,\\ \\dfrac{\\varepsilon}{${2 * Math.abs(a) + 1}}\\right)` },
        { text: `Check with ε = ${s.eps}: δ = ${g(d)}.`, tex: `\\delta=${g(d)}` },
        { text: 'Proof, forwards: |x² − a²| = |x − a||x + a| < δ(2|a| + 1) ≤ ε.', tex: '\\blacksquare' },
      ];
    },
  },
};
const state = { which: 'lin', a: 2, m: 3, b: 1, eps: 0.5 };
const formula = liveFormula(document.querySelector('#formula'), (s) => PROBS[s.which].tex(s));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => PROBS[s.which].steps(s),
  controls: [
    { title: 'Choose a limit' },
    { key: 'which', label: 'Example', options: Object.entries(PROBS).map(([k, v]) => [k, v.name.split(':')[0]]) },
    { key: 'a', label: 'Point a', min: 1, max: 5, step: 1 },
    { key: 'm', label: 'Slope m (linear)', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'Intercept b (linear)', min: -3, max: 5, step: 1 },
    { key: 'eps', label: 'Test ε', min: 0.05, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
  ],
  onChange: (s) => formula.update(s),
});
