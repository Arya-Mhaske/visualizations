import { createStepper } from '../../lib/stepper.js';

// Each example, with choice A (the good one) and choice B (the one that makes it worse).
const EXAMPLES = {
  xex: {
    name: '∫ x eˣ dx',
    integral: '\\int x\\,e^x\\,dx',
    A: { pick: 'u=x,\\quad dv=e^x\\,dx', parts: 'du=dx,\\quad v=e^x', after: 'x\\,e^x-\\int e^x\\,dx', done: 'x\\,e^x-e^x+C', verdict: 'The leftover integral, ∫eˣ dx, is simpler than the one we started with. Done in one step.' },
    B: { pick: 'u=e^x,\\quad dv=x\\,dx', parts: 'du=e^x\\,dx,\\quad v=\\dfrac{x^2}{2}', after: '\\dfrac{x^2}{2}e^x-\\int \\dfrac{x^2}{2}e^x\\,dx', done: '\\text{next: }\\int x^3e^x\\ldots', verdict: 'The leftover has x², a higher power than before. Each round makes it worse.' },
  },
  xln: {
    name: '∫ x ln x dx',
    integral: '\\int x\\ln x\\,dx',
    A: { pick: 'u=\\ln x,\\quad dv=x\\,dx', parts: 'du=\\dfrac{dx}{x},\\quad v=\\dfrac{x^2}{2}', after: '\\dfrac{x^2}{2}\\ln x-\\int \\dfrac{x}{2}\\,dx', done: '\\dfrac{x^2}{2}\\ln x-\\dfrac{x^2}{4}+C', verdict: 'Differentiating ln x gives 1/x, which cancels against x. A plain power is left.' },
    B: { pick: 'u=x,\\quad dv=\\ln x\\,dx', parts: 'du=dx,\\quad v=x\\ln x-x', after: 'x(x\\ln x-x)-\\int (x\\ln x-x)\\,dx', done: '\\text{the original } \\int x\\ln x \\text{ is back}', verdict: 'To get v we already needed parts, and the leftover contains the original integral again.' },
  },
  xcos: {
    name: '∫ x cos x dx',
    integral: '\\int x\\cos x\\,dx',
    A: { pick: 'u=x,\\quad dv=\\cos x\\,dx', parts: 'du=dx,\\quad v=\\sin x', after: 'x\\sin x-\\int \\sin x\\,dx', done: 'x\\sin x+\\cos x+C', verdict: 'Differentiating x gives 1. The leftover is a basic integral.' },
    B: { pick: 'u=\\cos x,\\quad dv=x\\,dx', parts: 'du=-\\sin x\\,dx,\\quad v=\\dfrac{x^2}{2}', after: '\\dfrac{x^2}{2}\\cos x+\\int \\dfrac{x^2}{2}\\sin x\\,dx', done: '\\text{next: }\\int x^3\\cos x\\ldots', verdict: 'The power of x went up from 1 to 2. We are further from the answer.' },
  },
};
const state = { ex: 'xex', choice: 'A' };

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  controls: [
    { title: 'Try a choice of u' },
    { key: 'ex', label: 'Integral', options: Object.entries(EXAMPLES).map(([k, v]) => [k, v.name]) },
    { key: 'choice', label: 'Choice', options: [['A', 'choice A'], ['B', 'choice B']] },
  ],
  steps: (s) => {
    const e = EXAMPLES[s.ex];
    const ch = e[s.choice];
    return [
      { text: 'We want:', tex: e.integral },
      { text: `Choice ${s.choice}: pick u and dv.`, tex: ch.pick },
      { text: 'Differentiate u and integrate dv.', tex: ch.parts },
      { text: 'Apply ∫u dv = uv − ∫v du.', tex: ch.after },
      { text: 'Where does that leave us?', tex: ch.done },
      { text: ch.verdict },
    ];
  },
});
