import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';

// Four cases of the denominator. whole and sum are the two sides as functions of x, so every answer is checked numerically.
const CASES = {
  linear: {
    name: 'Distinct linear factors', tex: '\\dfrac{3x+5}{(x+1)(x+2)}',
    whole: (x) => (3 * x + 5) / ((x + 1) * (x + 2)), sum: (x) => 2 / (x + 1) + 1 / (x + 2),
    steps: [
      ['One simple fraction for each linear factor, with a constant on top.', '\\dfrac{3x+5}{(x+1)(x+2)}=\\dfrac{A}{x+1}+\\dfrac{B}{x+2}'],
      ['Multiply through by the denominator.', '3x+5=A(x+2)+B(x+1)'],
      ['Put x = −1 to kill B, then x = −2 to kill A.', 'x=-1:\\ 2=A\\qquad x=-2:\\ -1=-B\\Rightarrow B=1'],
      ['The decomposition.', '\\dfrac{2}{x+1}+\\dfrac{1}{x+2}'],
    ],
  },
  repeated: {
    name: 'Repeated linear factor', tex: '\\dfrac{x+4}{(x+1)^2}',
    whole: (x) => (x + 4) / (x + 1) ** 2, sum: (x) => 1 / (x + 1) + 3 / (x + 1) ** 2,
    steps: [
      ['A repeated factor needs a term for each power, up to the repeat.', '\\dfrac{x+4}{(x+1)^2}=\\dfrac{A}{x+1}+\\dfrac{B}{(x+1)^2}'],
      ['Multiply through by (x + 1)².', 'x+4=A(x+1)+B'],
      ['Put x = −1 to find B, then compare the coefficients of x to find A.', 'x=-1:\\ 3=B\\qquad x:\\ 1=A'],
      ['The decomposition.', '\\dfrac{1}{x+1}+\\dfrac{3}{(x+1)^2}'],
    ],
  },
  quadratic: {
    name: 'A quadratic factor', tex: '\\dfrac{2x^2+x+3}{(x+1)(x^2+1)}',
    whole: (x) => (2 * x * x + x + 3) / ((x + 1) * (x * x + 1)), sum: (x) => 2 / (x + 1) + 1 / (x * x + 1),
    steps: [
      ['A quadratic factor that cannot be split gets a linear numerator: Bx + C.', '\\dfrac{2x^2+x+3}{(x+1)(x^2+1)}=\\dfrac{A}{x+1}+\\dfrac{Bx+C}{x^2+1}'],
      ['Multiply through.', '2x^2+x+3=A(x^2+1)+(Bx+C)(x+1)'],
      ['x = −1 gives A. Then compare the x² and constant coefficients.', 'x=-1:\\ 4=2A\\Rightarrow A=2;\\quad x^2:\\ 2=A+B\\Rightarrow B=0;\\quad 1:\\ 3=A+C\\Rightarrow C=1'],
      ['The decomposition.', '\\dfrac{2}{x+1}+\\dfrac{1}{x^2+1}'],
    ],
  },
  repquad: {
    name: 'A repeated quadratic factor', tex: '\\dfrac{2x^3+x^2+3x+1}{(x^2+1)^2}',
    whole: (x) => (2 * x ** 3 + x * x + 3 * x + 1) / (x * x + 1) ** 2, sum: (x) => (2 * x + 1) / (x * x + 1) + x / (x * x + 1) ** 2,
    steps: [
      ['A repeated quadratic factor needs a linear numerator for each power.', '\\dfrac{2x^3+x^2+3x+1}{(x^2+1)^2}=\\dfrac{Ax+B}{x^2+1}+\\dfrac{Cx+D}{(x^2+1)^2}'],
      ['Multiply through by (x² + 1)².', '2x^3+x^2+3x+1=(Ax+B)(x^2+1)+Cx+D'],
      ['Compare the coefficients of x³, x², x and 1.', 'x^3:\\ A=2;\\ x^2:\\ B=1;\\ x:\\ A+C=3\\Rightarrow C=1;\\ 1:\\ B+D=1\\Rightarrow D=0'],
      ['The decomposition.', '\\dfrac{2x+1}{x^2+1}+\\dfrac{x}{(x^2+1)^2}'],
    ],
  },
};
const state = { which: 'linear', x: 2 };
const cs = (s) => CASES[s.which];

function steps(s) {
  const c = cs(s);
  const list = [{ text: 'The fraction. The top is of lower degree than the bottom, so it is a proper fraction and can be split.', tex: c.tex }];
  c.steps.forEach(([text, tex]) => list.push({ text, tex }));
  list.push({ text: `Check at x = ${s.x}: both sides give the same number.`, tex: `${fixed(c.whole(s.x), 6)}=${fixed(c.sum(s.x), 6)}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => cs(s).tex);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose the case' },
    { key: 'which', label: 'Denominator', options: Object.entries(CASES).map(([key, v]) => [key, v.name]) },
    { key: 'x', label: 'Check at x =', min: 0, max: 5, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Whole fraction', (s) => fixed(cs(s).whole(s.x), 6)],
      ['Sum of the pieces', (s) => ({ text: fixed(cs(s).sum(s.x), 6), good: Math.abs(cs(s).whole(s.x) - cs(s).sum(s.x)) < 1e-9 })],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
