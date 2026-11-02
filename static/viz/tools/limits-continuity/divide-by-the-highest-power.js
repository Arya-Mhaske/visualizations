import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';

// Divide top and bottom by the highest power of x in the denominator, then let every 1/xᵏ term go to 0.
const f4 = (v) => String(Number(v.toFixed(4)));
const PROBS = {
  same: {
    name: 'Same degree', tex: (s) => `\\dfrac{${s.a}x^2+${s.b}x}{${s.d}x^2-5}`,
    steps: (s) => [
      { text: 'Highest power of x in the denominator: x². Divide every term top and bottom by x².', tex: `\\dfrac{${s.a}+\\frac{${s.b}}{x}}{${s.d}-\\frac{5}{x^2}}` },
      { text: 'As x → ∞, each term with x in its denominator tends to 0.', tex: `\\dfrac{${s.b}}{x}\\to0,\\ \\ \\dfrac{5}{x^2}\\to0` },
      { text: 'What is left is the ratio of the leading coefficients.', tex: `\\dfrac{${s.a}}{${s.d}}=${f4(s.a / s.d)}` },
      { text: `Check numerically at x = 1000: f = ${f4((s.a * 1e6 + s.b * 1e3) / (s.d * 1e6 - 5))}.` },
    ],
  },
  lower: {
    name: 'Lower degree on top', tex: (s) => `\\dfrac{${s.a}x+${s.b}}{${s.d}x^2+1}`,
    steps: (s) => [
      { text: 'Divide by x² (highest power below).', tex: `\\dfrac{\\frac{${s.a}}{x}+\\frac{${s.b}}{x^2}}{${s.d}+\\frac{1}{x^2}}` },
      { text: 'The top tends to 0 and the bottom to a constant.', tex: `\\dfrac{0}{${s.d}}=0` },
      { text: `Numerically at x = 1000: f = ${f4((s.a * 1e3 + s.b) / (s.d * 1e6 + 1))}.` },
    ],
  },
  higher: {
    name: 'Higher degree on top', tex: (s) => `\\dfrac{${s.a}x^3-2}{${s.d}x^2+1}`,
    steps: (s) => [
      { text: 'Divide by x².', tex: `\\dfrac{${s.a}x-\\frac{2}{x^2}}{${s.d}+\\frac{1}{x^2}}` },
      { text: 'The bottom tends to a constant, but the top grows without bound.', tex: `\\dfrac{${s.a}x}{${s.d}}\\to\\infty` },
      { text: 'No horizontal asymptote: the limit is ∞.' },
    ],
  },
  root: {
    name: 'With a square root', tex: (s) => `\\dfrac{\\sqrt{${s.a * s.a}x^2+1}}{x+${s.b}}`,
    steps: (s) => [
      { text: 'Highest power: x. For x > 0, √(x²) = x, so divide the root by x as √(…/x²).', tex: `\\dfrac{\\sqrt{${s.a * s.a}+\\frac{1}{x^2}}}{1+\\frac{${s.b}}{x}}` },
      { text: 'As x → +∞ the small terms vanish.', tex: `\\dfrac{\\sqrt{${s.a * s.a}}}{1}=${s.a}` },
      { text: 'As x → −∞, √(x²) = |x| = −x, so the sign flips.', tex: `\\to -${s.a}` },
      { text: `Numerically: x = 1000 gives ${f4(Math.sqrt(s.a * s.a * 1e6 + 1) / (1000 + s.b))}; x = −1000 gives ${f4(Math.sqrt(s.a * s.a * 1e6 + 1) / (-1000 + s.b))}.` },
    ],
  },
};
const state = { which: 'same', a: 3, b: 4, d: 2 };
const formula = liveFormula(document.querySelector('#formula'), (s) => `\\lim_{x\\to\\infty}${PROBS[s.which].tex(s)}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => PROBS[s.which].steps(s),
  controls: [
    { title: 'Choose an example' },
    { key: 'which', label: 'Shape', options: Object.entries(PROBS).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'a', min: 1, max: 6, step: 1 },
    { key: 'b', label: 'b', min: 1, max: 9, step: 1 },
    { key: 'd', label: 'd', min: 1, max: 6, step: 1 },
  ],
  onChange: (s) => formula.update(s),
});
