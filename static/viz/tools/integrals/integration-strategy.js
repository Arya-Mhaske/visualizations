import { createStepper } from '../../lib/stepper.js';

// A decision walk. Each integral goes through the same questions, in order, and stops at the first yes.
const QUESTIONS = [
  'Q1. Can I simplify first (expand, divide, use an identity)?',
  'Q2. Is there an inner function whose derivative is also there? Try u-substitution.',
  'Q3. Is it a product of unlike kinds (polynomial × exponential or trig, or a log)? Try parts.',
  'Q4. Is it a rational function? Try partial fractions.',
  'Q5. Does it hold √(a² − x²), √(a² + x²) or √(x² − a²)? Try a trig substitution.',
  'Q6. Is it a power of sin and cos? Use the odd or even strategy.',
];
const CASES = {
  a: { name: '∫ x cos(x²) dx', tex: '\\int x\\cos(x^2)\\,dx', stop: 1, why: 'x is half the derivative of x². Let u = x².', ans: '\\tfrac12\\sin(x^2)+C' },
  b: { name: '∫ x e^(3x) dx', tex: '\\int x\\,e^{3x}\\,dx', stop: 2, why: 'x × exponential. Take u = x, dv = e^(3x) dx.', ans: '\\dfrac{x\\,e^{3x}}{3}-\\dfrac{e^{3x}}{9}+C' },
  c: { name: '∫ (x + 5) / ((x − 1)(x + 2)) dx', tex: '\\int\\dfrac{x+5}{(x-1)(x+2)}\\,dx', stop: 3, why: 'A rational function with factors in the denominator. Split it: 2/(x − 1) − 1/(x + 2).', ans: '2\\ln|x-1|-\\ln|x+2|+C' },
  d: { name: '∫ √(4 − x²) dx', tex: '\\int\\sqrt{4-x^2}\\,dx', stop: 4, why: 'The root has the form √(a² − x²). Let x = 2 sin θ.', ans: '2\\arcsin\\dfrac{x}{2}+\\dfrac{x\\sqrt{4-x^2}}{2}+C' },
  e: { name: '∫ sin³x dx', tex: '\\int\\sin^3x\\,dx', stop: 5, why: 'An odd power of sin. Save one sin x, write sin² = 1 − cos², let u = cos x.', ans: '-\\cos x+\\dfrac{\\cos^3x}{3}+C' },
  f: { name: '∫ (x² + 2x) / x dx', tex: '\\int\\dfrac{x^2+2x}{x}\\,dx', stop: 0, why: 'Divide by x first: x + 2. Easy.', ans: '\\dfrac{x^2}{2}+2x+C' },
};
const state = { k: 'f' };

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  controls: [
    { title: 'Pick an integral' },
    { key: 'k', label: 'Integral', options: Object.entries(CASES).map(([k, v]) => [k, v.name]) },
  ],
  steps: (s) => {
    const c = CASES[s.k];
    const out = [{ text: 'The integral:', tex: c.tex }];
    for (let q = 0; q <= c.stop; q++) {
      out.push({ text: q < c.stop ? `${QUESTIONS[q]} No, not here. Next question.` : `${QUESTIONS[q]} Yes. ${c.why}` });
    }
    out.push({ text: 'The result:', tex: c.ans });
    return out;
  },
});
