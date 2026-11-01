import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { graphFigure } from '../numbers-algebra/_quadratic-equations-view.js';

// lim x→0 of (√(x + a²) − a) / x = 1 / (2a)
const state = { a: 3 };
const f = (x, a) => (Math.sqrt(x + a * a) - a) / x;

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The graph of the fraction with a hole at 0, followed by the worked rationalising');
const figure = graphFigure(stageEl, 'The graph with a hole at 0 at the height of the limit', [-3, 6], [-0.1, 1], (ctx, plot, c) => {
  plot.fn((x) => f(x, state.a), { color: c.a, width: 3, domain: [-state.a * state.a + 0.01, 6] });
  plot.point(0, 1 / (2 * state.a), { fill: c.paper, r: 8 });
});
const steps = (s) => {
  const a = s.a;
  return [
    { text: 'Put x = 0: the top is √(a²) − a = 0 and the bottom is 0. This is 0/0, so substituting tells us nothing.', tex: `\\dfrac{\\sqrt{0+${a * a}}-${a}}{0}=\\dfrac00` },
    { text: 'Multiply top and bottom by the conjugate of the top, which changes the minus into a plus.', tex: `\\dfrac{\\sqrt{x+${a * a}}-${a}}{x}\\cdot\\dfrac{\\sqrt{x+${a * a}}+${a}}{\\sqrt{x+${a * a}}+${a}}` },
    { text: 'The top becomes a difference of squares: (√(x + a²))² − a² = x.', tex: `\\dfrac{(x+${a * a})-${a * a}}{x\\left(\\sqrt{x+${a * a}}+${a}\\right)}=\\dfrac{x}{x\\left(\\sqrt{x+${a * a}}+${a}\\right)}` },
    { text: 'Cancel the x, which is allowed because x is near 0 but not equal to 0.', tex: `\\dfrac{1}{\\sqrt{x+${a * a}}+${a}}` },
    { text: 'Now substitute x = 0.', tex: `\\dfrac{1}{\\sqrt{${a * a}}+${a}}=\\dfrac{1}{${2 * a}}=${fixed(1 / (2 * a), 4)}` },
  ];
};
const formula = liveFormula(document.querySelector('#formula'), (s) => `\\lim_{x\\to0}\\dfrac{\\sqrt{x+${s.a * s.a}}-${s.a}}{x}=\\dfrac1{${2 * s.a}}`);
formula.update(state);
createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a' },
    { key: 'a', label: 'a', min: 1, max: 5, step: 1 },
    { readout: [['Limit', (s) => fixed(1 / (2 * s.a), 4)], ['Near 0, h = 0.001', (s) => fixed(f(0.001, s.a), 5)]] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
