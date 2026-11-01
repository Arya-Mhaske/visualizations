import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { graphFigure } from '../numbers-algebra/_quadratic-equations-view.js';

// Each case: how the limit splits, with the law named at each step. a is the point.
const CASES = [
  { name: '3x² − 5x + 2', f: (x) => 3 * x * x - 5 * x + 2, tex: '3x^2-5x+2',
    steps: (a) => [['Sum and difference law: take the limit of each term.', `\\lim 3x^2-\\lim 5x+\\lim 2`], ['Constant multiple law: pull the numbers out.', `3\\lim x^2-5\\lim x+2`], ['Power law and the law for x: lim x = a, lim x² = a².', `3(${a})^2-5(${a})+2`], ['Evaluate.', `${3 * a * a - 5 * a + 2}`]] },
  { name: '(x² + 1)(x − 3)', f: (x) => (x * x + 1) * (x - 3), tex: '(x^2+1)(x-3)',
    steps: (a) => [['Product law: the limit of a product is the product of the limits.', `\\lim(x^2+1)\\cdot\\lim(x-3)`], ['Sum law and power law for each factor.', `(${a}^2+1)(${a}-3)`], ['Evaluate each bracket.', `(${a * a + 1})(${a - 3})`], ['Multiply.', `${(a * a + 1) * (a - 3)}`]] },
  { name: '(2x + 1) ÷ (x² + 2)', f: (x) => (2 * x + 1) / (x * x + 2), tex: '\\dfrac{2x+1}{x^2+2}',
    steps: (a) => [['Quotient law: allowed because the bottom limit is not zero.', `\\dfrac{\\lim(2x+1)}{\\lim(x^2+2)}`], ['Sum, constant multiple and power laws on top and bottom.', `\\dfrac{2(${a})+1}{(${a})^2+2}`], ['The bottom is a² + 2, never 0, so the law applies. Evaluate.', `\\dfrac{${2 * a + 1}}{${a * a + 2}}=${fixed((2 * a + 1) / (a * a + 2), 4)}`]] },
];
const state = { which: 0, a: 2 };
const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The graph of the expression with the point a marked, followed by the limit laws applied one at a time');
const figure = graphFigure(stageEl, 'The graph of the expression with the point a marked', [-4, 5], [-12, 30], (ctx, plot, c) => {
  plot.fn(CASES[state.which].f, { color: c.a, width: 3 });
  plot.point(state.a, CASES[state.which].f(state.a), { fill: c.fillY, r: 8 });
});
const formula = liveFormula(document.querySelector('#formula'), (s) => `\\lim_{x\\to ${s.a}}${CASES[s.which].tex}`);
formula.update(state);
createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps: (s) => CASES[s.which].steps(s.a).map(([text, tex]) => ({ text, tex })),
  controls: [
    { title: 'Choose a limit' },
    { key: 'which', label: 'Expression', min: 0, max: CASES.length - 1, step: 1, format: (v) => CASES[v].name },
    { key: 'a', label: 'x → a', min: -3, max: 4, step: 1 },
    { readout: [['Value', (s) => fixed(CASES[s.which].f(s.a), 4)]] },
  ],
  onChange(s) { formula.update(s); figure.invalidate(); },
});
