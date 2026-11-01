import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { ORDER_CASES } from './_complex-numbers-math.js';
import { planeFigure } from './_complex-numbers-view.js';

const state = { guess: 'pos' };
const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The complex plane with i above the real line, followed by a short proof that i cannot be larger than, smaller than or equal to 0');
const figure = planeFigure(stageEl, 'The complex plane: the real numbers lie on the horizontal axis in order, and i stands above it', 2.5, (ctx, plot, c) => {
  plot.segment(-2.2, 0, 2.2, 0, { color: c.b, width: 6 });
  plot.point(0, 0, { fill: c.fillY, r: 8 });
  plot.point(0, 1, { fill: c.a, r: 9 });
  plot.text('0', 0.35, -0.4, { size: 12, patch: false });
  plot.text('i', 0.35, 1.0, { size: 13, color: c.a, patch: false });
  plot.text('real numbers are in order along this line', 0, -1.2, { size: 11, color: c.b, patch: false });
});

const steps = (s) => {
  const rule = s.guess === 'pos'
    ? { text: 'Suppose i is bigger than 0. A positive number keeps an inequality the same way round.', tex: 'i>0' }
    : s.guess === 'neg'
      ? { text: 'Suppose i is smaller than 0. A negative number flips an inequality when you multiply by it.', tex: 'i<0' }
      : { text: 'Suppose i is exactly 0.', tex: 'i=0' };
  const multiply = s.guess === 'pos'
    ? { text: 'Multiply both sides by i, which is positive. The sign stays.', tex: 'i\\cdot i>0\\cdot i' }
    : s.guess === 'neg'
      ? { text: 'Multiply both sides by i, which is negative. The sign flips.', tex: 'i\\cdot i>0\\cdot i' }
      : { text: 'Multiply both sides by i.', tex: 'i\\cdot i=0\\cdot i' };
  return [
    rule,
    multiply,
    { text: 'But i · i is −1, and anything times 0 is 0.', tex: s.guess === 'zero' ? '-1=0' : '-1>0' },
    { text: ORDER_CASES[s.guess].reason, tex: '\\text{contradiction}' },
    { text: 'No case works, so i is not above, below or equal to 0. It has no place on the number line, so there is no order.' },
  ];
};

const formula = liveFormula(document.querySelector('#formula'), (s) => `\\text{assume }${ORDER_CASES[s.guess].name.replace('<', '<').replace('>', '>')}\\ \\Rightarrow\\ i^2=-1${s.guess === 'zero' ? '=0' : s.guess === 'pos' ? '>0' : '>0'}\\ \\text{ — impossible}`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Try to order i' },
    { key: 'guess', label: 'Assume that', options: [['pos', 'i > 0'], ['neg', 'i < 0'], ['zero', 'i = 0']] },
    { readout: [
      ['Assumption', (s) => ORDER_CASES[s.guess].name],
      ['Where it ends', (s) => ({ text: 'contradiction', good: false })],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
