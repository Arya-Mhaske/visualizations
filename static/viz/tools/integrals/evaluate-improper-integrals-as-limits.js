import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Replace the bad end by a variable t, integrate, then let t go to the bad end.
const f4 = (v) => String(Number(v.toFixed(4)));
const PROBS = {
  inf: {
    name: '∫₁^∞ x^(−p) dx  (infinite range)', tex: (s) => `\\int_1^{\\infty}x^{-${s.p}}\\,dx`,
    steps: (s) => {
      const p = s.p;
      if (p === 1) return [
        { text: 'Replace ∞ by t.', tex: '\\lim_{t\\to\\infty}\\int_1^{t}\\frac{dx}{x}' },
        { text: 'Integrate.', tex: '\\lim_{t\\to\\infty}\\ln t-\\ln 1' },
        { text: 'ln t has no limit as t → ∞. The integral diverges.', tex: '\\infty' },
      ];
      return [
        { text: 'Replace ∞ by t.', tex: `\\lim_{t\\to\\infty}\\int_1^{t}x^{-${p}}\\,dx` },
        { text: 'Integrate.', tex: `\\lim_{t\\to\\infty}\\left[\\dfrac{x^{${1 - p}}}{${1 - p}}\\right]_1^{t}` },
        p > 1
          ? { text: 'Since 1 − p < 0, t^(1−p) → 0.', tex: `0-\\dfrac{1}{${1 - p}}=${f4(1 / (p - 1))}` }
          : { text: 'Since 1 − p > 0, t^(1−p) → ∞. Diverges.', tex: '\\infty' },
      ];
    },
  },
  zero: {
    name: '∫₀¹ x^(−p) dx  (bad end at 0)', tex: (s) => `\\int_0^{1}x^{-${s.p / 2}}\\,dx`,
    steps: (s) => {
      const p = s.p / 2;
      if (p === 1) return [
        { text: 'The integrand blows up at 0. Replace 0 by t from the right.', tex: '\\lim_{t\\to0^+}\\int_t^{1}\\frac{dx}{x}' },
        { text: 'Integrate.', tex: '\\lim_{t\\to0^+}(0-\\ln t)=\\infty' },
        { text: 'It diverges.' },
      ];
      return [
        { text: `The integrand x^(−${p}) blows up at 0. Replace 0 by t from the right.`, tex: `\\lim_{t\\to0^+}\\int_t^{1}x^{-${p}}\\,dx` },
        { text: 'Integrate.', tex: `\\lim_{t\\to0^+}\\left[\\dfrac{x^{${f4(1 - p)}}}{${f4(1 - p)}}\\right]_t^{1}` },
        p < 1
          ? { text: 'Since 1 − p > 0, t^(1−p) → 0. Converges.', tex: `\\dfrac{1}{${f4(1 - p)}}=${f4(1 / (1 - p))}` }
          : { text: 'Since 1 − p < 0, t^(1−p) → ∞. Diverges.', tex: '\\infty' },
      ];
    },
  },
};
const state = { which: 'inf', p: 2 };
const formula = liveFormula(document.querySelector('#formula'), (s) => PROBS[s.which].tex(s));
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => PROBS[s.which].steps(s),
  controls: [
    { title: 'Choose an integral' },
    { key: 'which', label: 'Kind', options: Object.entries(PROBS).map(([k, v]) => [k, v.name.split('  (')[1].replace(')', '')]) },
    { key: 'p', label: 'Exponent (second kind uses p/2)', min: 1, max: 6, step: 1, format: (v) => String(v) },
  ],
  onChange: (s) => formula.update(s),
});
