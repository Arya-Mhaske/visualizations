import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { disc, isPerfectSquare, quickest, realRoots, splitMiddle } from './_quadratic-equations-math.js';
import { graphFigure } from './_quadratic-equations-view.js';

const state = { a: 1, b: -5, c: 6 };
const PICK = { factor: 'Factor it', complete: 'Complete the square', formula: 'Use the formula' };
const sg = (n) => (n < 0 ? `-${Math.abs(n)}` : `+${n}`);
const term = (n, v) => (n === 1 ? v : n === -1 ? `-${v}` : `${n}${v}`);
const poly = (s) => `${term(s.a, 'x^2')}${s.b ? sg(s.b) + 'x' : ''}${s.c ? sg(s.c) : ''}`.replace('+1x', '+x').replace('-1x', '-x');

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('role', 'group');
stageEl.setAttribute('aria-label', 'The parabola for the chosen quadratic with its roots, followed by the quick check of which method suits it');
const figure = graphFigure(stageEl, 'The parabola for the chosen quadratic', [-10, 10], [-14, 14], (ctx, plot, c) => {
  plot.fn((x) => state.a * x * x + state.b * x + state.c, { color: c.a, width: 3 });
  realRoots(state.a, state.b, state.c).forEach((r) => plot.point(r, 0, { fill: c.c, r: 7 }));
});

function steps(s) {
  const d = disc(s.a, s.b, s.c);
  const split = splitMiddle(s.a, s.b, s.c);
  const pick = quickest(s.a, s.b, s.c);
  const list = [
    { text: 'First look at the discriminant. If it is a perfect square, the roots are rational, so it factors.', tex: `b^2-4ac=${s.b}^2-4(${s.a})(${s.c})=${d}${isPerfectSquare(d) ? '=' + Math.sqrt(d) + '^2' : ''}` },
    split
      ? { text: `Look for two numbers with product ac = ${s.a * s.c} and sum b = ${s.b}:`, tex: `${split[0]}\\ \\text{and}\\ ${split[1]}` }
      : { text: `No two whole numbers have product ac = ${s.a * s.c} and sum b = ${s.b}, so it does not factor over the integers.`, tex: '\\text{no integer pair}' },
    s.a === 1 && s.b % 2 === 0
      ? { text: 'a = 1 and b is even, so completing the square needs no fractions:', tex: `(x${sg(s.b / 2)})^2=${(s.b / 2) ** 2 - s.c}` }
      : { text: 'Completing the square would need fractions here (a ≠ 1 or b odd). It works, but it is longer.', tex: '\\text{fractions ahead}' },
    { text: 'The formula always works, whatever the numbers:', tex: d < 0 ? `x=\\dfrac{${-s.b}\\pm\\sqrt{${d}}}{${2 * s.a}}\\ \\text{(complex)}` : `x=\\dfrac{${-s.b}\\pm\\sqrt{${d}}}{${2 * s.a}}=${realRoots(s.a, s.b, s.c).map((r) => fixed(r, 3)).join(',\\ ')}` },
    { text: `Quickest: ${PICK[pick]}. ${pick === 'factor' ? 'The integer pair exists, so two brackets finish it.' : pick === 'complete' ? 'No integer pair, but a = 1 and b is even.' : 'Nothing else is clean.'}` },
  ];
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `${poly(s)}=0`);
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose a quadratic' },
    { key: 'a', label: 'a', min: 1, max: 4, step: 1 },
    { key: 'b', label: 'b', min: -10, max: 10, step: 1 },
    { key: 'c', label: 'c', min: -12, max: 12, step: 1 },
    { readout: [
      ['Discriminant', (s) => `${disc(s.a, s.b, s.c)}`],
      ['Quickest method', (s) => ({ text: PICK[quickest(s.a, s.b, s.c)], good: true })],
    ] },
  ],
  onChange(s) {
    formula.update(s);
    figure.invalidate();
  },
});
